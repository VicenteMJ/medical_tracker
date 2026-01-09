import { supabase } from './supabase'

/**
 * Uploads a PDF file to Supabase Storage
 * @param file - The PDF file to upload
 * @param resultId - Optional result ID to organize files. If not provided, generates a unique name
 * @returns The public URL of the uploaded file
 */
export async function uploadResultPDF(file: File, resultId?: string): Promise<string> {
  // Validate file type
  if (file.type !== 'application/pdf') {
    throw new Error('Only PDF files are allowed')
  }

  // Validate file size (max 10MB)
  const maxSize = 10 * 1024 * 1024 // 10MB
  if (file.size > maxSize) {
    throw new Error('File size must be less than 10MB')
  }

  // Generate a unique file name
  const timestamp = Date.now()
  const randomString = Math.random().toString(36).substring(2, 15)
  const fileName = resultId 
    ? `${resultId}/${timestamp}-${randomString}.pdf`
    : `results/${timestamp}-${randomString}.pdf`

  // Upload file to Supabase Storage
  const { data, error } = await supabase.storage
    .from('test-results')
    .upload(fileName, file, {
      contentType: 'application/pdf',
      upsert: false, // Don't overwrite existing files
    })

  if (error) {
    throw new Error(`Failed to upload file: ${error.message}`)
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from('test-results')
    .getPublicUrl(data.path)

  if (!urlData?.publicUrl) {
    throw new Error('Failed to get public URL for uploaded file')
  }

  return urlData.publicUrl
}

/**
 * Uploads a PDF file for a bill to Supabase Storage
 * @param file - The PDF file to upload
 * @param billId - Optional bill ID to organize files. If not provided, generates a unique name
 * @returns The public URL of the uploaded file
 */
export async function uploadBillPDF(file: File, billId?: string): Promise<string> {
  // Validate file type
  if (file.type !== 'application/pdf') {
    throw new Error('Only PDF files are allowed')
  }

  // Validate file size (max 10MB)
  const maxSize = 10 * 1024 * 1024 // 10MB
  if (file.size > maxSize) {
    throw new Error('File size must be less than 10MB')
  }

  // Generate a unique file name
  const timestamp = Date.now()
  const randomString = Math.random().toString(36).substring(2, 15)
  const fileName = billId 
    ? `${billId}/${timestamp}-${randomString}.pdf`
    : `bills/${timestamp}-${randomString}.pdf`

  // Upload file to Supabase Storage
  const { data, error } = await supabase.storage
    .from('medical-bills')
    .upload(fileName, file, {
      contentType: 'application/pdf',
      upsert: false, // Don't overwrite existing files
    })

  if (error) {
    throw new Error(`Failed to upload file: ${error.message}`)
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from('medical-bills')
    .getPublicUrl(data.path)

  if (!urlData?.publicUrl) {
    throw new Error('Failed to get public URL for uploaded file')
  }

  return urlData.publicUrl
}

/**
 * Uploads a PDF file for an insurance policy to Supabase Storage
 * @param file - The PDF file to upload
 * @param insuranceId - Optional insurance ID to organize files. If not provided, generates a unique name
 * @returns The public URL of the uploaded file
 */
export async function uploadInsurancePDF(file: File, insuranceId?: string): Promise<string> {
  // Validate file type
  if (file.type !== 'application/pdf') {
    throw new Error('Only PDF files are allowed')
  }

  // Validate file size (max 10MB)
  const maxSize = 10 * 1024 * 1024 // 10MB
  if (file.size > maxSize) {
    throw new Error('File size must be less than 10MB')
  }

  // Generate a unique file name
  const timestamp = Date.now()
  const randomString = Math.random().toString(36).substring(2, 15)
  const fileName = insuranceId 
    ? `${insuranceId}/${timestamp}-${randomString}.pdf`
    : `insurances/${timestamp}-${randomString}.pdf`

  // Upload file to Supabase Storage
  const { data, error } = await supabase.storage
    .from('insurance-policies')
    .upload(fileName, file, {
      contentType: 'application/pdf',
      upsert: false, // Don't overwrite existing files
    })

  if (error) {
    throw new Error(`Failed to upload file: ${error.message}`)
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from('insurance-policies')
    .getPublicUrl(data.path)

  if (!urlData?.publicUrl) {
    throw new Error('Failed to get public URL for uploaded file')
  }

  return urlData.publicUrl
}

/**
 * Uploads a PDF or image file for a prescription to Supabase Storage
 * @param file - The PDF or image file to upload (PDF, JPG, JPEG, PNG)
 * @param prescriptionId - Optional prescription ID to organize files. If not provided, generates a unique name
 * @returns The public URL of the uploaded file
 */
export async function uploadPrescriptionFile(file: File, prescriptionId?: string): Promise<string> {
  // Validate file type (PDF or images)
  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Only PDF, JPG, JPEG, and PNG files are allowed')
  }

  // Validate file size (max 10MB)
  const maxSize = 10 * 1024 * 1024 // 10MB
  if (file.size > maxSize) {
    throw new Error('File size must be less than 10MB')
  }

  // Determine file extension
  const extension = file.type === 'application/pdf' 
    ? 'pdf' 
    : file.type === 'image/jpeg' || file.type === 'image/jpg'
    ? 'jpg'
    : 'png'

  // Generate a unique file name
  const timestamp = Date.now()
  const randomString = Math.random().toString(36).substring(2, 15)
  const fileName = prescriptionId 
    ? `${prescriptionId}/${timestamp}-${randomString}.${extension}`
    : `prescriptions/${timestamp}-${randomString}.${extension}`

  // Upload file to Supabase Storage
  const { data, error } = await supabase.storage
    .from('prescriptions')
    .upload(fileName, file, {
      contentType: file.type,
      upsert: false, // Don't overwrite existing files
    })

  if (error) {
    throw new Error(`Failed to upload file: ${error.message}`)
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from('prescriptions')
    .getPublicUrl(data.path)

  if (!urlData?.publicUrl) {
    throw new Error('Failed to get public URL for uploaded file')
  }

  return urlData.publicUrl
}
