import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { extractTextFromPDFURL } from '@/lib/pdf-extractor'
import { analyzeInsuranceCoverage } from '@/lib/ai-coverage-analyzer'
import { updateInsurance, createInsuranceCoverage } from '@/lib/insurances'
import { normalizeGeminiOutput } from '@/lib/coverage-normalizer'
import { extractGlobalRules } from '@/lib/global-rules-extractor'

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

    // Analyze with AI (pass insurance type and coverage types for optimized search)
    let analysisResult: { coverageData: Record<string, any>; modelVersion: string }
    try {
      console.log('Starting AI analysis...')
      console.log('Insurance type:', insurance.insurance_type)
      console.log('Coverage types:', insurance.coverage_types)
      analysisResult = await analyzeInsuranceCoverage(
        pdfText,
        insurance.insurance_type,
        insurance.coverage_types
      )
      console.log('AI analysis completed successfully')
    } catch (error) {
      console.error('AI analysis error:', error)
      return NextResponse.json(
        { error: `AI analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}` },
        { status: 500 }
      )
    }

    const { coverageData, modelVersion } = analysisResult

    // Save raw analysis to insurance_raw_analysis table
    try {
      const { error: rawAnalysisError } = await supabase
        .from('insurance_raw_analysis')
        .insert({
          insurance_id: insuranceId,
          raw_json: coverageData,
          model_version: modelVersion,
        })

      if (rawAnalysisError) {
        console.error('Failed to save raw analysis:', rawAnalysisError)
        // Don't fail the request, but log the error
      }
    } catch (error) {
      console.error('Error saving raw analysis:', error)
      // Continue with normalization even if raw analysis save fails
    }

    // Extract and save global rules
    try {
      const globalRules = extractGlobalRules(coverageData)
      
      if (globalRules) {
        // Delete existing AI-generated global rules for this insurance
        await supabase
          .from('insurance_global_rules')
          .delete()
          .eq('insurance_id', insuranceId)
          .eq('source', 'ai')

        // Insert global rules
        const { error: globalRulesError } = await supabase
          .from('insurance_global_rules')
          .insert({
            insurance_id: insuranceId,
            deductible_by_family_type: globalRules.deductible_by_family_type,
            annual_reimbursement_limit_per_beneficiary: globalRules.annual_reimbursement_limit_per_beneficiary,
            annual_reimbursement_limit_currency: globalRules.annual_reimbursement_limit_currency,
            special_conditions: globalRules.special_conditions,
            coverage_abroad: globalRules.coverage_abroad,
            source: 'ai',
          })

        if (globalRulesError) {
          console.error('Failed to save global rules:', globalRulesError)
          // Don't fail the request, but log the error
        } else {
          console.log('Saved global rules successfully')
        }
      }
    } catch (error) {
      console.error('Error extracting/saving global rules:', error)
      // Continue even if global rules extraction fails
    }

    // Normalize Gemini output and insert into insurance_coverages
    let normalizedCoverages: any[] = []
    try {
      console.log('Normalizing coverage data...')
      const coveragesToInsert = normalizeGeminiOutput(coverageData, insuranceId)
      
      // Delete existing AI-generated coverages for this insurance (to avoid duplicates)
      await supabase
        .from('insurance_coverages')
        .delete()
        .eq('insurance_id', insuranceId)
        .eq('source', 'ai')

      // Insert normalized coverages
      if (coveragesToInsert.length > 0) {
        const { data, error: insertError } = await supabase
          .from('insurance_coverages')
          .insert(coveragesToInsert)
          .select()

        if (insertError) {
          console.error('Failed to insert normalized coverages:', insertError)
          throw new Error(`Failed to insert normalized coverages: ${insertError.message}`)
        }

        normalizedCoverages = data || []
        console.log(`Inserted ${normalizedCoverages.length} normalized coverage rows`)
      }
    } catch (error) {
      console.error('Normalization error:', error)
      // Continue even if normalization fails - we still have raw data
    }

    // Update insurance record with coverage_data for backward compatibility
    try {
      const updatedInsurance = await updateInsurance(insuranceId, {
        coverage_data: coverageData, // Keep for backward compatibility
      })

      return NextResponse.json({
        success: true,
        coverage_data: coverageData, // Raw data
        normalized_coverages: normalizedCoverages, // Normalized rows
        model_version: modelVersion,
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

