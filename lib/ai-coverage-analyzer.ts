import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = process.env.GEMINI_API_KEY
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null

/**
 * Analyzes insurance PDF text and extracts coverage information
 * @param pdfText - The extracted text from the insurance PDF
 * @returns Structured coverage data as JSON
 */
export async function analyzeInsuranceCoverage(pdfText: string): Promise<Record<string, any>> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured')
  }

  if (!genAI) {
    throw new Error('Gemini API client is not initialized')
  }

  // Limit text length to avoid token limits (keep first 30000 characters for Gemini)
  const truncatedText = pdfText.substring(0, 30000)
  
  const prompt = `You are an expert at analyzing Chilean health insurance policy documents. Extract coverage information from the following insurance policy text and return it as a structured JSON object.

Focus on extracting:
- Coverage percentages for different services (specialist visits, general practitioner, emergency, etc.)
- Coverage limits (maximum amounts in UF or CLP)
- Copayments or deductibles
- Specific coverage details for procedures, medications, dental, vision, etc.
- Any exclusions or limitations mentioned

The insurance document may be in Spanish and use Chilean terminology (Isapre, Fonasa, UF, CLP, etc.).

Return ONLY valid JSON, no additional text or markdown. Use a clear, hierarchical structure. Example format:
{
  "specialist_visits": {
    "coverage_percentage": 80,
    "limit": "2 UF per month",
    "copayment": "20%"
  },
  "general_practitioner": {
    "coverage_percentage": 100,
    "copayment": "0%"
  },
  "emergency": {
    "coverage_percentage": 90,
    "limit": "Unlimited"
  },
  "dental": {
    "coverage_percentage": 50,
    "annual_limit": "50 UF"
  },
  "medications": {
    "coverage_percentage": 70,
    "limit": "Unlimited"
  },
  "exclusions": ["Cosmetic procedures", "Experimental treatments"]
}

Insurance Policy Text:
${truncatedText}

Extract the coverage information and return as JSON:`

  // Try multiple model names in order of preference (newest first)
  // Model names match official Gemini API documentation: https://ai.google.dev/gemini-api/docs
  const modelNames = [
    'gemini-3-flash-preview',  // Latest flash model (preview)
    'gemini-2.5-flash',        // 2.5 flash model (most stable)
    'gemini-2.5-pro',          // 2.5 pro model
    'gemini-1.5-pro',          // 1.5 pro model
    'gemini-1.5-flash',        // 1.5 flash model
    'gemini-pro',              // Standard model
  ]

  let lastError: any = null
  let responseText: string | null = null

  for (const modelName of modelNames) {
    try {
      const model = genAI.getGenerativeModel({ 
        model: modelName,
        generationConfig: {
          temperature: 0.3, // Lower temperature for more consistent extraction
          maxOutputTokens: 2000,
        },
      })

      const result = await model.generateContent(prompt)
      const response = await result.response
      responseText = response.text()
      
      // If we got a response, break out of the loop
      if (responseText) {
        break
      }
    } catch (error: any) {
      lastError = error
      // If it's not a 404/model not found error, throw immediately
      if (!error?.message?.includes('404') && 
          !error?.message?.includes('not found') &&
          !error?.message?.includes('is not found')) {
        // Handle other errors with user-friendly messages
        if (error.message.includes('API_KEY_INVALID') || error.message.includes('401')) {
          throw new Error('Gemini API key is invalid. Please check your GEMINI_API_KEY in .env.local')
        }
        if (error.message.includes('429') || error.message.includes('quota') || error.message.includes('RESOURCE_EXHAUSTED')) {
          throw new Error('Gemini API quota exceeded. Please check your Google Cloud account billing or try again later. You can also manually edit the coverage data.')
        }
        if (error.message.includes('403') || error.message.includes('PERMISSION_DENIED')) {
          throw new Error('Gemini API permission denied. Please check your API key permissions and enable the Generative Language API.')
        }
        throw error
      }
      // Otherwise, continue to try next model
      continue
    }
  }

  // If we tried all models and none worked, throw the last error with helpful message
  if (!responseText) {
    if (lastError) {
      throw new Error('Gemini model not found. Tried multiple model names (gemini-3-flash-preview, gemini-2.5-flash, gemini-2.5-pro, gemini-1.5-pro, gemini-1.5-flash, gemini-pro) but none were available. Please check your API key has access to Gemini models and that the Generative Language API is enabled in Google Cloud Console. See https://ai.google.dev/gemini-api/docs for available models.')
    }
    throw new Error('Failed to get response from any Gemini model')
  }

  // Parse the JSON response
  // Gemini may return JSON wrapped in markdown code blocks or as plain text
  try {
    // First, try to parse directly
    const trimmedText = responseText.trim()
    const coverageData = JSON.parse(trimmedText)
    return coverageData
  } catch (parseError) {
    // Try to extract JSON from markdown code blocks if present
    const jsonMatch = responseText.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/) || 
                      responseText.match(/(\{[\s\S]*\})/)
    
    if (jsonMatch && jsonMatch[1]) {
      try {
        return JSON.parse(jsonMatch[1].trim())
      } catch (e) {
        // If extraction fails, try to fix common JSON issues
        let jsonStr = jsonMatch[1].trim()
        
        // Try to fix incomplete JSON by finding the last complete object
        // Remove trailing commas before closing braces/brackets
        jsonStr = jsonStr.replace(/,(\s*[}\]])/g, '$1')
        
        // Try to close unclosed objects/arrays if possible
        const openBraces = (jsonStr.match(/\{/g) || []).length
        const closeBraces = (jsonStr.match(/\}/g) || []).length
        const openBrackets = (jsonStr.match(/\[/g) || []).length
        const closeBrackets = (jsonStr.match(/\]/g) || []).length
        
        if (openBraces > closeBraces) {
          jsonStr += '}'.repeat(openBraces - closeBraces)
        }
        if (openBrackets > closeBrackets) {
          jsonStr += ']'.repeat(openBrackets - closeBrackets)
        }
        
        try {
          return JSON.parse(jsonStr)
        } catch (finalError) {
          // If still failing, show more context in error
          throw new Error(`Failed to parse AI response as JSON. Parse error: ${finalError instanceof Error ? finalError.message : 'Unknown error'}. Response preview: ${jsonStr.substring(0, 500)}...`)
        }
      }
    }
    
    // If no JSON match found, try to find JSON in the response anyway
    const jsonStart = responseText.indexOf('{')
    if (jsonStart !== -1) {
      const potentialJson = responseText.substring(jsonStart)
      try {
        return JSON.parse(potentialJson.trim())
      } catch (e) {
        // Try fixing incomplete JSON
        let fixedJson = potentialJson.trim()
        fixedJson = fixedJson.replace(/,(\s*[}\]])/g, '$1')
        
        const openBraces = (fixedJson.match(/\{/g) || []).length
        const closeBraces = (fixedJson.match(/\}/g) || []).length
        if (openBraces > closeBraces) {
          fixedJson += '}'.repeat(openBraces - closeBraces)
        }
        
        try {
          return JSON.parse(fixedJson)
        } catch (finalError) {
          // Last resort: show the error with context
          throw new Error(`Failed to parse AI response as JSON. The response appears to be JSON but parsing failed: ${finalError instanceof Error ? finalError.message : 'Unknown error'}. Response preview: ${fixedJson.substring(0, 500)}...`)
        }
      }
    }
    
    throw new Error(`Failed to parse AI response as JSON. No JSON object found in response. Response preview: ${responseText.substring(0, 500)}...`)
  }
}
