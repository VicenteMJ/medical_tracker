-- Migration: Add status field to appointments table
-- This allows tracking whether an appointment was attended or missed

-- Add status column to appointments table
ALTER TABLE appointments
ADD COLUMN IF NOT EXISTS status VARCHAR(20) CHECK (status IN ('missed', 'attended'));

-- Create index on status for faster queries
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);

-- Add comment to document the column
COMMENT ON COLUMN appointments.status IS 'Tracks whether the appointment was attended or missed. NULL means status not yet set.';
