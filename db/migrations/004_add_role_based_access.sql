-- Migration: Add role-based access control
-- Date: 2026-01-04

-- Add role column to org_members
ALTER TABLE org_members
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'viewer' CHECK (role IN ('owner', 'editor', 'viewer'));

-- Set existing members as owners (safe default)
UPDATE org_members SET role = 'owner' WHERE role IS NULL;

-- Make role NOT NULL after setting defaults
ALTER TABLE org_members ALTER COLUMN role SET NOT NULL;

-- Add comments
COMMENT ON COLUMN org_members.role IS 'User role: owner (full access), editor (manage content), viewer (read-only)';

-- Create index for role queries
CREATE INDEX IF NOT EXISTS idx_org_members_role ON org_members(role);

-- Update RLS policies to consider roles
-- Note: Existing RLS policies will continue to work, 
-- but application-level checks will enforce role-based permissions

