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
    }
  }
}


