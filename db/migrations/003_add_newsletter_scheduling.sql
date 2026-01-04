-- Migration: Add scheduling fields to newsletters table
-- Date: 2026-01-04

-- Add schedule fields to newsletters
ALTER TABLE newsletters
ADD COLUMN IF NOT EXISTS schedule_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS schedule_days INTEGER[] DEFAULT ARRAY[1,2,3,4,5], -- 0=Sun, 1=Mon, ..., 6=Sat
ADD COLUMN IF NOT EXISTS schedule_time TIME DEFAULT '09:00:00',
ADD COLUMN IF NOT EXISTS schedule_timezone TEXT DEFAULT 'UTC',
ADD COLUMN IF NOT EXISTS last_scheduled_run TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS next_scheduled_run TIMESTAMPTZ;

-- Add comment for clarity
COMMENT ON COLUMN newsletters.schedule_days IS 'Days of week as integers: 0=Sunday, 1=Monday, 2=Tuesday, 3=Wednesday, 4=Thursday, 5=Friday, 6=Saturday';
COMMENT ON COLUMN newsletters.schedule_time IS 'Time of day to generate/send issues (24-hour format)';
COMMENT ON COLUMN newsletters.schedule_timezone IS 'IANA timezone identifier (e.g., America/New_York, Europe/London)';

-- Create index for efficient cron queries
CREATE INDEX IF NOT EXISTS idx_newsletters_schedule 
ON newsletters(schedule_enabled, next_scheduled_run) 
WHERE schedule_enabled = true;

