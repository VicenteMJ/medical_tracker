-- Migration: Create pending_actions table
-- This table stores reminders and pending tasks related to appointments and prescriptions

CREATE TABLE IF NOT EXISTS pending_actions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  appointment_id UUID REFERENCES appointments(id) ON DELETE CASCADE,
  prescription_id UUID REFERENCES prescriptions(id) ON DELETE SET NULL,
  medication_name VARCHAR(255),
  action_type VARCHAR(50) NOT NULL DEFAULT 'reminder',
  description TEXT NOT NULL,
  is_completed BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_pending_actions_appointment_id ON pending_actions(appointment_id);
CREATE INDEX IF NOT EXISTS idx_pending_actions_prescription_id ON pending_actions(prescription_id);
CREATE INDEX IF NOT EXISTS idx_pending_actions_is_completed ON pending_actions(is_completed);
CREATE INDEX IF NOT EXISTS idx_pending_actions_created_at ON pending_actions(created_at DESC);

-- Create trigger to automatically update updated_at
CREATE OR REPLACE FUNCTION update_pending_actions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_pending_actions_updated_at ON pending_actions;
CREATE TRIGGER update_pending_actions_updated_at
  BEFORE UPDATE ON pending_actions
  FOR EACH ROW
  EXECUTE FUNCTION update_pending_actions_updated_at();

-- Add comment to document the table
COMMENT ON TABLE pending_actions IS 'Stores reminders and pending tasks, such as medication purchase reminders linked to prescriptions';
