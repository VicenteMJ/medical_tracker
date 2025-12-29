import pdfParse from 'pdf-parse'

// Suppress pdf-parse warnings (they're harmless font table warnings)
const originalConsoleWarn = console.warn
const suppressPDFWarnings = () => {
  console.warn = (...args: any[]) => {
    const message = args.join(' ')
    // Only suppress font/glyf table warnings from pdf-parse
    if (!message.includes('glyf') && !message.includes('font') && !message.includes('table')) {
      originalConsoleWarn.apply(console, args)
    }
  }
}

const restoreConsoleWarn = () => {
  console.warn = originalConsoleWarn
}

/**
 * Extracts text content from a PDF file
 * @param file - The PDF file to extract text from
 * @returns The extracted text as a string
 */
export async function extractTextFromPDFFile(file: File): Promise<string> {
  suppressPDFWarnings()
  try {
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const data = await pdfParse(buffer, {
      // Suppress internal warnings
      max: 0, // No page limit
    })
    return data.text || ''
  } catch (error) {
    throw new Error(`Failed to extract text from PDF: ${error instanceof Error ? error.message : 'Unknown error'}`)
  } finally {
    restoreConsoleWarn()
  }
}

/**
 * Extracts text content from a PDF URL
 * @param url - The URL of the PDF file
 * @returns The extracted text as a string
 */
export async function extractTextFromPDFURL(url: string): Promise<string> {
  suppressPDFWarnings()
  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Failed to fetch PDF: ${response.statusText}`)
    }

    const arrayBuffer = await response.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const data = await pdfParse(buffer, {
      max: 0, // No page limit
    })
    return data.text || ''
  } catch (error) {
    throw new Error(`Failed to extract text from PDF URL: ${error instanceof Error ? error.message : 'Unknown error'}`)
  } finally {
    restoreConsoleWarn()
  }
}

/**
 * Extracts text from a PDF buffer
 * @param buffer - The PDF buffer
 * @returns The extracted text as a string
 */
export async function extractTextFromPDFBuffer(buffer: Buffer): Promise<string> {
  suppressPDFWarnings()
  try {
    const data = await pdfParse(buffer, {
      max: 0, // No page limit
    })
    return data.text || ''
  } catch (error) {
    throw new Error(`Failed to extract text from PDF buffer: ${error instanceof Error ? error.message : 'Unknown error'}`)
  } finally {
    restoreConsoleWarn()
  }
}

