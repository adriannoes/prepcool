-- Create admin_audit_log table for tracking administrative actions
-- This table logs all actions performed by admin users for security and compliance

CREATE TABLE IF NOT EXISTS public.admin_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(50),
  resource_id UUID,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_user_id ON public.admin_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_created_at ON public.admin_audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_action ON public.admin_audit_log(action);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_resource ON public.admin_audit_log(resource_type, resource_id);

-- Enable Row Level Security
ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Only admins can insert audit log entries
CREATE POLICY "Only admins can create audit logs"
  ON public.admin_audit_log
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE user_id = auth.uid()
    )
  );

-- RLS Policy: Only admins can read audit logs
CREATE POLICY "Only admins can read audit logs"
  ON public.admin_audit_log
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE user_id = auth.uid()
    )
  );

-- RLS Policy: No updates or deletes allowed (audit logs are immutable)
CREATE POLICY "Audit logs are immutable"
  ON public.admin_audit_log
  FOR ALL
  USING (false);

-- Add comment to table
COMMENT ON TABLE public.admin_audit_log IS 'Audit log for all administrative actions';
COMMENT ON COLUMN public.admin_audit_log.action IS 'Action performed (e.g., create, update, delete)';
COMMENT ON COLUMN public.admin_audit_log.resource_type IS 'Type of resource affected (e.g., video, simulado, user)';
COMMENT ON COLUMN public.admin_audit_log.resource_id IS 'ID of the resource affected';
COMMENT ON COLUMN public.admin_audit_log.metadata IS 'Additional context about the action in JSON format';
