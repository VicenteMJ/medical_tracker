export interface Appointment {
  id: string
  date: string
  doctor_name: string
  specialty: string | null
  medical_center: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface Result {
  id: string
  appointment_id: string | null
  test_name: string
  test_type: string | null
  value: string | null
  unit: string | null
  reference_range: string | null
  notes: string | null
  file_url: string | null
  created_at: string
}

export interface Bill {
  id: string
  appointment_id: string | null
  result_id: string | null
  amount: number
  insurance_coverage: number | null
  currency: string
  payment_date: string | null
  payment_method: string | null
  receipt_url: string | null
  notes: string | null
  created_at: string
}

export interface Medication {
  id: string
  name: string
  type: string
  strength: number | null
  unit: string | null
  display_name: string | null
  notes: string | null
  frequency: string
  schedule_times: Array<{ time: string; dosage: string }> | null
  start_date: string
  end_date: string | null
  created_at: string
  updated_at: string
}

export interface Prescription {
  id: string
  appointment_id: string | null
  name: string | null
  prescription_type: 'A' | 'B' | 'C' | 'D'
  file_url: string | null
  issue_date: string
  is_chronic_use: boolean
  expiration_date: string | null
  is_archived: boolean
  notes: string | null
  created_at: string
  updated_at: string
}

export interface Insurance {
  id: string
  provider_name: string
  policy_id: string
  insurance_type: string | null
  coverage_types: string[] | null
  price: number | null
  currency: string | null
  logo_url: string | null
  pdf_url: string | null
  coverage_data: Record<string, any> | null
  is_active: boolean | null
  created_at: string
  updated_at: string
}

export interface InsuranceCoverage {
  id: string
  insurance_id: string
  coverage_domain: string
  service_type: string
  specialty: string | null
  provider_type: string | null
  is_emergency: boolean | null
  coverage_percent: number | null
  max_amount: number | null
  currency: string | null
  deductible_amount: number | null
  copay_amount: number | null
  frequency_limit: string | null
  waiting_period_days: number | null
  exclusions: string | null
  conditions: string[] | null
  per_service_limit: number | null
  per_service_limit_currency: string | null
  confidence_score: number | null
  source: string
  created_at: string
  updated_at: string
}

export interface InsuranceRawAnalysis {
  id: string
  insurance_id: string
  raw_json: Record<string, any>
  model_version: string | null
  extracted_at: string
}

export interface InsuranceGlobalRules {
  id: string
  insurance_id: string
  deductible_by_family_type: Record<string, any> | null
  annual_reimbursement_limit_per_beneficiary: number | null
  annual_reimbursement_limit_currency: string | null
  special_conditions: Record<string, any> | null
  coverage_abroad: string | null
  source: string
  created_at: string
  updated_at: string
}

export interface BillInsurance {
  id: string
  bill_id: string
  insurance_id: string
  is_used: boolean
  created_at: string
}

export interface BillInsuranceWithDetails extends BillInsurance {
  insurance: Insurance
}

export interface Database {
  public: {
    Tables: {
      appointments: {
        Row: Appointment
        Insert: Omit<Appointment, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Appointment, 'id' | 'created_at' | 'updated_at'>>
      }
      results: {
        Row: Result
        Insert: Omit<Result, 'id' | 'created_at'>
        Update: Partial<Omit<Result, 'id' | 'created_at'>>
      }
      bills: {
        Row: Bill
        Insert: Omit<Bill, 'id' | 'created_at'>
        Update: Partial<Omit<Bill, 'id' | 'created_at'>>
      }
      medications: {
        Row: Medication
        Insert: Omit<Medication, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Medication, 'id' | 'created_at' | 'updated_at'>>
      }
      prescriptions: {
        Row: Prescription
        Insert: Omit<Prescription, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Prescription, 'id' | 'created_at' | 'updated_at'>>
      }
      insurances: {
        Row: Insurance
        Insert: Omit<Insurance, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Insurance, 'id' | 'created_at' | 'updated_at'>>
      }
      insurance_coverages: {
        Row: InsuranceCoverage
        Insert: Omit<InsuranceCoverage, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<InsuranceCoverage, 'id' | 'created_at' | 'updated_at'>>
      }
      insurance_raw_analysis: {
        Row: InsuranceRawAnalysis
        Insert: Omit<InsuranceRawAnalysis, 'id' | 'extracted_at'>
        Update: Partial<Omit<InsuranceRawAnalysis, 'id' | 'extracted_at'>>
      }
      insurance_global_rules: {
        Row: InsuranceGlobalRules
        Insert: Omit<InsuranceGlobalRules, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<InsuranceGlobalRules, 'id' | 'created_at' | 'updated_at'>>
      }
      bill_insurances: {
        Row: BillInsurance
        Insert: Omit<BillInsurance, 'id' | 'created_at'>
        Update: Partial<Omit<BillInsurance, 'id' | 'created_at'>>
      }
    }
  }
}


