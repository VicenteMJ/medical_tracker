import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { extractTextFromPDFURL } from '@/lib/pdf-extractor'
import { analyzeInsuranceCoverage } from '@/lib/ai-coverage-analyzer'
import { updateInsurance } from '@/lib/insurances'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { insuranceId } = body

    if (!insuranceId) {
      return NextResponse.json(
        { error: 'Insurance ID is required' },
        { status: 400 }
      )
    }

    // Fetch insurance record
    const { data: insurance, error: fetchError } = await supabase
      .from('insurances')
      .select('*')
      .eq('id', insuranceId)
      .single()

    if (fetchError || !insurance) {
      return NextResponse.json(
        { error: 'Insurance not found' },
        { status: 404 }
      )
    }

    if (!insurance.pdf_url) {
      return NextResponse.json(
        { error: 'No PDF URL found for this insurance' },
        { status: 400 }
      )
    }

    // Extract text from PDF
    let pdfText: string
    try {
      console.log('Extracting text from PDF:', insurance.pdf_url)
      // Check if it's a Supabase Storage URL or external URL
      if (insurance.pdf_url.includes('supabase.co/storage')) {
        // For Supabase Storage, we need to fetch it differently
        // Try fetching directly first
        pdfText = await extractTextFromPDFURL(insurance.pdf_url)
      } else {
        // External URL
        pdfText = await extractTextFromPDFURL(insurance.pdf_url)
      }
      console.log(`Extracted ${pdfText.length} characters from PDF`)
    } catch (error) {
      console.error('PDF extraction error:', error)
      return NextResponse.json(
        { error: `Failed to extract text from PDF: ${error instanceof Error ? error.message : 'Unknown error'}` },
        { status: 500 }
      )
    }

    if (!pdfText || pdfText.trim().length === 0) {
      return NextResponse.json(
        { error: 'No text could be extracted from the PDF' },
        { status: 400 }
      )
    }

    // Analyze with AI
    let coverageData: Record<string, any>
    try {
      console.log('Starting AI analysis...')
      coverageData = await analyzeInsuranceCoverage(pdfText)
      console.log('AI analysis completed successfully')
    } catch (error) {
      console.error('AI analysis error:', error)
      return NextResponse.json(
        { error: `AI analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}` },
        { status: 500 }
      )
    }

    // Update insurance record with coverage data
    try {
      const updatedInsurance = await updateInsurance(insuranceId, {
        coverage_data: coverageData,
      })

      return NextResponse.json({
        success: true,
        coverage_data: coverageData,
        insurance: updatedInsurance,
      })
    } catch (error) {
      return NextResponse.json(
        { error: `Failed to update insurance: ${error instanceof Error ? error.message : 'Unknown error'}` },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error in analyze-coverage route:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

