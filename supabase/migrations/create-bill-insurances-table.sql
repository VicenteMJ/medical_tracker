-- Migration: Create bill_insurances junction table
-- This table stores the many-to-many relationship between bills and insurances
-- and tracks whether each insurance has been used for a specific bill

CREATE TABLE IF NOT EXISTS bill_insurances (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  bill_id UUID NOT NULL REFERENCES bills(id) ON DELETE CASCADE,
  insurance_id UUID NOT NULL REFERENCES insurances(id) ON DELETE CASCADE,
  is_used BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_bill_insurance UNIQUE (bill_id, insurance_id)
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_bill_insurances_bill_id ON bill_insurances(bill_id);
CREATE INDEX IF NOT EXISTS idx_bill_insurances_insurance_id ON bill_insurances(insurance_id);
CREATE INDEX IF NOT EXISTS idx_bill_insurances_is_used ON bill_insurances(is_used);

-- Add comment to document the table
COMMENT ON TABLE bill_insurances IS 'Junction table linking bills to insurances, tracking which insurances can cover a bill and whether they have been used';

