-- Medical Tracker Database Schema
-- Run this SQL in your Supabase SQL Editor

-- Create appointments table
CREATE TABLE IF NOT EXISTS appointments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  doctor_name VARCHAR(255) NOT NULL,
  specialty VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create results table
CREATE TABLE IF NOT EXISTS results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
  test_name VARCHAR(255) NOT NULL,
  test_type VARCHAR(255),
  value VARCHAR(255),
  unit VARCHAR(50),
  reference_range VARCHAR(255),
  notes TEXT,
  file_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create bills table
CREATE TABLE IF NOT EXISTS bills (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
  result_id UUID REFERENCES results(id) ON DELETE SET NULL,
  amount DECIMAL(10, 2) NOT NULL,
  insurance_coverage DECIMAL(10, 2) DEFAULT 0,
  currency VARCHAR(3) DEFAULT 'USD',
  payment_date TIMESTAMP WITH TIME ZONE,
  payment_method VARCHAR(50),
  receipt_url TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT check_insurance_coverage CHECK (
    insurance_coverage IS NULL OR 
    (insurance_coverage >= 0 AND insurance_coverage <= amount)
  )
);

-- Create index on appointments date for faster queries
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(date DESC);

-- Create index on results appointment_id for faster joins
CREATE INDEX IF NOT EXISTS idx_results_appointment_id ON results(appointment_id);

-- Create index on bills appointment_id for faster joins
CREATE INDEX IF NOT EXISTS idx_bills_appointment_id ON bills(appointment_id);

-- Create index on bills result_id for faster joins
CREATE INDEX IF NOT EXISTS idx_bills_result_id ON bills(result_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_appointments_updated_at
  BEFORE UPDATE ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Note: For future multi-user support, you'll need to:
-- 1. Add user_id UUID column to all tables
-- 2. Add FOREIGN KEY constraint to auth.users(id)
-- 3. Enable Row Level Security (RLS)
-- 4. Create policies for each table

