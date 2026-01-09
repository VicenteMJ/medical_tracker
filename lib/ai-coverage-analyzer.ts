import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = process.env.GEMINI_API_KEY
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null

/**
 * Analyzes insurance PDF text and extracts coverage information
 * @param pdfText - The extracted text from the insurance PDF
 * @param insuranceType - Optional insurance type (e.g., "Isapre", "Fonasa", "Seguro Dental")
 * @param coverageTypes - Optional array of coverage types the user explicitly selected
 * @returns Object with structured coverage data and model version
 */
export interface AnalyzeCoverageResult {
  coverageData: Record<string, any>
  modelVersion: string
}

/**
 * Maps user-selected coverage types to search keywords for AI prompt optimization
 */
function getCoverageTypeKeywords(coverageTypes: string[] | null | undefined): {
  priorityKeywords: string[]
  priorityDescriptions: string[]
} {
  if (!coverageTypes || coverageTypes.length === 0) {
    return { priorityKeywords: [], priorityDescriptions: [] }
  }

  const keywordMap: Record<string, { keywords: string[], description: string }> = {
    'Consultas médicas y exámenes': {
      keywords: ['consulta', 'médico', 'medico', 'especialista', 'examen', 'laboratorio', 'imagenología', 'imagenologia', 'radiología', 'radiologia', 'resonancia', 'tomografía', 'tomografia', 'ecografía', 'ecografia'],
      description: 'consultas médicas, exámenes de laboratorio, imagenología y consultas con especialistas'
    },
    'Medicamentos': {
      keywords: ['medicamento', 'medicamentos', 'fármaco', 'farmaco', 'farmacia', 'receta'],
      description: 'medicamentos y fármacos'
    },
    'Hospitalizaciones': {
      keywords: ['hospitalización', 'hospitalizacion', 'internación', 'internacion', 'cirugía', 'cirugia', 'quirófano', 'quirofano', 'procedimiento quirúrgico'],
      description: 'hospitalizaciones, cirugías y procedimientos quirúrgicos'
    },
    'Dental': {
      keywords: ['dental', 'odontología', 'odontologia', 'diente', 'muela', 'ortodoncia', 'endodoncia', 'periodoncia', 'implante dental'],
      description: 'servicios dentales y odontológicos'
    },
    'Salud mental': {
      keywords: ['salud mental', 'psicología', 'psicologia', 'psiquiatría', 'psiquiatria', 'terapia psicológica', 'terapia psicologica', 'psicoterapia', 'terapeuta'],
      description: 'salud mental, psicología y psiquiatría'
    },
    'Vida': {
      keywords: ['vida', 'seguro de vida', 'beneficio por muerte', 'fallecimiento', 'muerte', 'capital asegurado'],
      description: 'seguro de vida y beneficios por muerte'
    },
    'Accidentes': {
      keywords: ['accidente', 'lesión', 'lesion', 'trauma', 'accidental', 'seguro de accidentes'],
      description: 'accidentes y lesiones accidentales'
    },
    'Visión': {
      keywords: ['visión', 'vision', 'oftalmología', 'oftalmologia', 'oftalmólogo', 'oftalmologo', 'lente', 'anteojo', 'gafas', 'cirugía ocular', 'cirugia ocular'],
      description: 'servicios de visión y oftalmología'
    },
  }

  const priorityKeywords: string[] = []
  const priorityDescriptions: string[] = []

  for (const coverageType of coverageTypes) {
    const mapping = keywordMap[coverageType]
    if (mapping) {
      priorityKeywords.push(...mapping.keywords)
      priorityDescriptions.push(mapping.description)
    }
  }

  return {
    priorityKeywords: [...new Set(priorityKeywords)], // Remove duplicates
    priorityDescriptions: [...new Set(priorityDescriptions)]
  }
}

export async function analyzeInsuranceCoverage(
  pdfText: string,
  insuranceType?: string | null,
  coverageTypes?: string[] | null
): Promise<AnalyzeCoverageResult> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured')
  }

  if (!genAI) {
    throw new Error('Gemini API client is not initialized')
  }

  // Limit text length to avoid token limits (keep first 30000 characters for Gemini)
  const truncatedText = pdfText.substring(0, 30000)
  
  // Get priority keywords based on user-selected coverage types
  const { priorityKeywords, priorityDescriptions } = getCoverageTypeKeywords(coverageTypes)
  
  // Build context-aware prompt
  let contextInfo = ''
  if (insuranceType) {
    contextInfo += `\nInsurance Type: ${insuranceType}`
  }
  if (priorityKeywords.length > 0) {
    contextInfo += `\n\nPRIORITY COVERAGE AREAS (user explicitly selected these):\n`
    contextInfo += `The user has indicated this insurance covers: ${priorityDescriptions.join(', ')}.\n`
    contextInfo += `PRIORITIZE extracting detailed information about these areas:\n`
    priorityKeywords.forEach(keyword => {
      contextInfo += `- ${keyword}\n`
    })
    contextInfo += `\nHowever, ALSO search for and extract ANY other coverage information found in the document, even if not explicitly mentioned above.`
  }
  
  const prompt = `You are an expert at analyzing Chilean health insurance policy documents. Extract coverage information from the following insurance policy text and return it as a structured JSON object.
${contextInfo}

IMPORTANT: Extract coverage information as it appears in the document. Do NOT normalize or classify services - preserve the exact service descriptions and terminology used in the document. The application will handle normalization and classification.

${priorityKeywords.length > 0 
  ? `SEARCH STRATEGY:
1. FIRST, thoroughly search for and extract ALL details about: ${priorityDescriptions.join(', ')}
   Look for these specific terms: ${priorityKeywords.slice(0, 10).join(', ')}${priorityKeywords.length > 10 ? ', ...' : ''}
   Extract complete information including percentages, limits, copayments, waiting periods, etc.

2. THEN, search for and extract ANY OTHER coverage information found in the document, including:
   - Other service descriptions (as they appear in the document)
   - Coverage percentages for different services
   - Coverage limits (maximum amounts with currency - UF or CLP)
   - Copayments or deductibles (as percentages or fixed amounts)
   - Specific coverage details for procedures, medications, dental, vision, mental health, accidents, life insurance, etc.
   - Any exclusions or limitations mentioned (as text)
   - Ambiguities or conditional language (e.g., "may be covered", "subject to approval")

Do not skip any coverage information - extract everything you find, prioritizing the areas mentioned above but ensuring completeness.`
  : `Focus on extracting:
- Service descriptions (as they appear in the document - e.g., "consulta general", "especialista", "laboratorio", etc.)
- Coverage percentages for different services
- Coverage limits (maximum amounts with currency - UF or CLP)
- Copayments or deductibles (as percentages or fixed amounts)
- Specific coverage details for procedures, medications, dental, vision, mental health, accidents, life insurance, etc.
- Any exclusions or limitations mentioned (as text)
- Ambiguities or conditional language (e.g., "may be covered", "subject to approval")`}

The insurance document may be in Spanish and use Chilean terminology (Isapre, Fonasa, UF, CLP, etc.).

Return ONLY valid JSON, no additional text or markdown. Use a clear, hierarchical structure with service descriptions as keys. Example format:
{
  "consulta general": {
    "coverage_percentage": 100,
    "copayment": "0%",
    "notes": "Sin copago"
  },
  "consulta especialista": {
    "coverage_percentage": 80,
    "limit": "2 UF por mes",
    "copayment": "20%",
    "waiting_period": "30 días"
  },
  "emergencia": {
    "coverage_percentage": 90,
    "limit": "Sin límite",
    "copayment": "10%"
  },
  "dental preventivo": {
    "coverage_percentage": 50,
    "annual_limit": "50 UF",
    "notes": "Incluye limpieza y control"
  },
  "medicamentos": {
    "coverage_percentage": 70,
    "limit": "Sin límite",
    "copayment": "30%"
  },
  "exclusions": [
    "Procedimientos cosméticos",
    "Tratamientos experimentales",
    "Cirugía estética"
  ],
  "ambiguities": [
    "Algunos procedimientos pueden requerir autorización previa"
  ]
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
  let usedModel: string | null = null

  for (const modelName of modelNames) {
    try {
      const model = genAI.getGenerativeModel({ 
        model: modelName,
        generationConfig: {
          temperature: 0.3, // Lower temperature for more consistent extraction
          maxOutputTokens: 4000, // Increased to handle longer JSON responses
        },
      })

      const result = await model.generateContent(prompt)
      const response = await result.response
      responseText = response.text()
      
      // Check if response might be truncated (ends abruptly in the middle of JSON)
      if (responseText && responseText.trim().length > 0) {
        // Check if response ends without proper JSON closure
        const trimmed = responseText.trim()
        const openBraces = (trimmed.match(/\{/g) || []).length
        const closeBraces = (trimmed.match(/\}/g) || []).length
        if (openBraces > closeBraces && !trimmed.endsWith('}')) {
          console.warn(`Response may be truncated: ${openBraces - closeBraces} unclosed braces detected`)
        }
        
        usedModel = modelName
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

  // Helper function to clean and fix JSON (defined before use)
  function cleanJSON(jsonString: string): string {
    let cleaned = jsonString.trim()
    
    // Remove markdown code blocks if present
    cleaned = cleaned.replace(/```(?:json)?\s*/g, '').replace(/```\s*$/g, '')
    
    // Fix unterminated strings by escaping quotes that appear inside string values
    // This uses a state machine to properly identify string boundaries
    let result = ''
    let inString = false
    let escapeNext = false
    
    for (let i = 0; i < cleaned.length; i++) {
      const char = cleaned[i]
      
      if (escapeNext) {
        result += char
        escapeNext = false
        continue
      }
      
      if (char === '\\') {
        result += char
        escapeNext = true
        continue
      }
      
      if (char === '"') {
        if (!inString) {
          // Starting a string
          inString = true
          result += char
        } else {
          // Check what comes after this quote to determine if it ends the string
          const remaining = cleaned.substring(i + 1).trim()
          // If followed by :, }, ], or , (or end of string), it ends the string
          if (remaining.startsWith(':') || 
              remaining.startsWith(',') || 
              remaining.startsWith('}') || 
              remaining.startsWith(']') ||
              remaining === '' ||
              remaining.startsWith('\n')) {
            // This quote ends the string
            inString = false
            result += char
          } else {
            // This quote is inside a string value - escape it
            result += '\\"'
          }
        }
      } else {
        result += char
      }
    }
    
    // If we're still in a string at the end, try to close it
    if (inString) {
      // Look backwards to see if we can find where the string should end
      // If the last character before this was a colon or comma, we might need to close it
      result += '"'
    }
    
    cleaned = result
    
    // Remove trailing commas before closing braces/brackets
    cleaned = cleaned.replace(/,(\s*[}\]])/g, '$1')
    cleaned = cleaned.replace(/,(\s+[}\]])/g, '$1')
    
    // Fix unquoted keys (only outside of strings)
    cleaned = cleaned.replace(/([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g, '$1"$2":')
    
    // Try to close unclosed objects/arrays
    const openBraces = (cleaned.match(/\{/g) || []).length
    const closeBraces = (cleaned.match(/\}/g) || []).length
    const openBrackets = (cleaned.match(/\[/g) || []).length
    const closeBrackets = (cleaned.match(/\]/g) || []).length
    
    if (openBraces > closeBraces) {
      cleaned += '}'.repeat(openBraces - closeBraces)
    }
    if (openBrackets > closeBrackets) {
      cleaned += ']'.repeat(openBrackets - closeBrackets)
    }
    
    return cleaned
  }
  
  // Helper function to extract and fix JSON from malformed response
  function extractAndFixJSON(text: string): any {
    // First, try to find the JSON object boundaries
    const jsonStart = text.indexOf('{')
    if (jsonStart === -1) {
      throw new Error('No JSON object found in response')
    }
    
    // Extract from the first { to the end, then we'll clean it
    let jsonSubstring = text.substring(jsonStart)
    
    // Clean and try to parse
    const cleaned = cleanJSON(jsonSubstring)
    
    try {
      return JSON.parse(cleaned)
    } catch (parseError: any) {
      // If still failing, try to fix unterminated strings more aggressively
      // Look for patterns like: "key": "value that might have "quotes" or be cut off
      let fixed = cleaned
      
      // Try to fix unterminated strings by finding strings that don't have a closing quote
      // before the next key or closing brace
      fixed = fixed.replace(/"([^"]*)"\s*:\s*"([^"]*?)(?=\s*[,}\]])/g, (match, key, value) => {
        // If value doesn't end with a quote and we're at a structural character, close it
        if (!value.endsWith('"') && !value.includes('"')) {
          // Value might be unterminated - try to close it
          return `"${key}": "${value}"`
        }
        return match
      })
      
      // Another approach: fix strings that have unescaped quotes inside
      // This is tricky - we need to be careful not to break valid JSON
      // Try to find patterns where a quote appears inside a value without being escaped
      let result = ''
      let inString = false
      let escapeNext = false
      let stringStart = -1
      
      for (let i = 0; i < fixed.length; i++) {
        const char = fixed[i]
        const nextChar = i < fixed.length - 1 ? fixed[i + 1] : ''
        const prevChar = i > 0 ? fixed[i - 1] : ''
        
        if (escapeNext) {
          result += char
          escapeNext = false
          continue
        }
        
        if (char === '\\') {
          result += char
          escapeNext = true
          continue
        }
        
        if (char === '"') {
          if (!inString) {
            // Starting a string
            inString = true
            stringStart = i
            result += char
          } else {
            // Check if this should end the string
            const afterQuote = fixed.substring(i + 1).trim()
            if (afterQuote.startsWith(':') || 
                afterQuote.startsWith(',') || 
                afterQuote.startsWith('}') || 
                afterQuote.startsWith(']') ||
                afterQuote === '' ||
                afterQuote.startsWith('\n')) {
              // Ends the string
              inString = false
              result += char
            } else {
              // This quote is inside the string - escape it
              result += '\\"'
            }
          }
        } else {
          result += char
        }
      }
      
      // Close any unterminated strings
      if (inString) {
        result += '"'
      }
      
      try {
        return JSON.parse(result)
      } catch (e: any) {
        // Last resort: return a minimal valid JSON object with an error note
        const errorMsg = e?.message || parseError?.message || 'Unknown parsing error'
        console.error('Failed to parse JSON after all fixes:', errorMsg)
        console.error('JSON substring (first 500 chars):', result.substring(0, 500))
        throw new Error(`Failed to parse AI response as JSON: ${errorMsg}. The response may contain malformed JSON that cannot be automatically fixed.`)
      }
    }
  }

  // Parse the JSON response
  // Gemini may return JSON wrapped in markdown code blocks or as plain text
  try {
    // First, try to parse directly after cleaning
    const cleanedText = cleanJSON(responseText)
    const coverageData = JSON.parse(cleanedText)
    return {
      coverageData,
      modelVersion: usedModel || 'unknown'
    }
  } catch (parseError) {
    // If direct parsing fails, try the more robust extraction method
    try {
      const coverageData = extractAndFixJSON(responseText)
      return {
        coverageData,
        modelVersion: usedModel || 'unknown'
      }
    } catch (extractError) {
      // Continue with original error handling
    }
    // Try to extract JSON from markdown code blocks if present
    const jsonMatch = responseText.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/) || 
                      responseText.match(/(\{[\s\S]*\})/)
    
    if (jsonMatch && jsonMatch[1]) {
      try {
        const cleanedJson = cleanJSON(jsonMatch[1])
        const coverageData = JSON.parse(cleanedJson)
        return {
          coverageData,
          modelVersion: usedModel || 'unknown'
        }
      } catch (e) {
        // If still failing after cleaning, try to find the last valid JSON object
        // by progressively removing characters from the end
        let jsonStr = jsonMatch[1].trim()
        let lastValidJson: any = null
        let lastError: Error | null = null
        
        // Try progressively shorter versions
        for (let i = jsonStr.length; i > 100; i -= 10) {
          try {
            const testStr = cleanJSON(jsonStr.substring(0, i))
            const parsed = JSON.parse(testStr)
            lastValidJson = parsed
            break
          } catch (err) {
            lastError = err instanceof Error ? err : new Error(String(err))
            continue
          }
        }
        
        if (lastValidJson) {
          return {
            coverageData: lastValidJson,
            modelVersion: usedModel || 'unknown'
          }
        }
        
        // If still failing, show more context in error with position info
        const errorMsg = lastError?.message || 'Unknown error'
        const positionMatch = errorMsg.match(/position (\d+)/i)
        const position = positionMatch ? parseInt(positionMatch[1], 10) : null
        const contextStart = position ? Math.max(0, position - 100) : 0
        const contextEnd = position ? Math.min(jsonStr.length, position + 100) : 800
        const context = jsonStr.substring(contextStart, contextEnd)
        const pointer = position ? ' '.repeat(Math.min(100, position - contextStart)) + '^' : ''
        
        throw new Error(`Failed to parse AI response as JSON. Parse error: ${errorMsg}. Context around error: ${context}${pointer ? '\n' + pointer : ''}`)
      }
    }
    
    // If no JSON match found, try to find JSON in the response anyway
    const jsonStart = responseText.indexOf('{')
    if (jsonStart !== -1) {
      const potentialJson = responseText.substring(jsonStart)
      try {
        const cleanedJson = cleanJSON(potentialJson)
        const coverageData = JSON.parse(cleanedJson)
        return {
          coverageData,
          modelVersion: usedModel || 'unknown'
        }
      } catch (e) {
        // Try progressively shorter versions
        let fixedJson = potentialJson.trim()
        let lastValidJson: any = null
        let lastError: Error | null = null
        
        for (let i = fixedJson.length; i > 100; i -= 10) {
          try {
            const testStr = cleanJSON(fixedJson.substring(0, i))
            const parsed = JSON.parse(testStr)
            lastValidJson = parsed
            break
          } catch (err) {
            lastError = err instanceof Error ? err : new Error(String(err))
            continue
          }
        }
        
        if (lastValidJson) {
          return {
            coverageData: lastValidJson,
            modelVersion: usedModel || 'unknown'
          }
        }
        
        // Last resort: show the error with context and position info
        const errorMsg = lastError?.message || 'Unknown error'
        const positionMatch = errorMsg.match(/position (\d+)/i)
        const position = positionMatch ? parseInt(positionMatch[1], 10) : null
        const contextStart = position ? Math.max(0, position - 100) : 0
        const contextEnd = position ? Math.min(fixedJson.length, position + 100) : 800
        const context = fixedJson.substring(contextStart, contextEnd)
        const pointer = position ? ' '.repeat(Math.min(100, position - contextStart)) + '^' : ''
        
        throw new Error(`Failed to parse AI response as JSON. The response appears to be JSON but parsing failed: ${errorMsg}. Context around error: ${context}${pointer ? '\n' + pointer : ''}`)
      }
    }
    
    throw new Error(`Failed to parse AI response as JSON. No JSON object found in response. Response preview: ${responseText.substring(0, 500)}...`)
  }
}
