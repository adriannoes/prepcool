-- Create admin_users table for managing admin access control
-- This table stores which users have administrative privileges

CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  CONSTRAINT admin_users_user_id_key UNIQUE (user_id)
);

-- Create index for fast lookups by user_id
CREATE INDEX IF NOT EXISTS idx_admin_users_user_id ON public.admin_users(user_id);

-- Enable Row Level Security
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Only existing admins can insert new admin records
-- This policy checks if the current user is already an admin before allowing insert
CREATE POLICY "Only admins can create admin users"
  ON public.admin_users
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE user_id = auth.uid()
    )
  );

-- RLS Policy: Users can only read their own admin status
-- This allows users to check if they are admin, but not see other admins
CREATE POLICY "Users can read their own admin status"
  ON public.admin_users
  FOR SELECT
  USING (user_id = auth.uid());

-- RLS Policy: Only admins can update admin records
CREATE POLICY "Only admins can update admin users"
  ON public.admin_users
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE user_id = auth.uid()
    )
  );

-- RLS Policy: Only admins can delete admin records (except themselves)
CREATE POLICY "Only admins can delete admin users"
  ON public.admin_users
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE user_id = auth.uid()
    )
    AND user_id != auth.uid() -- Prevent self-deletion
  );

-- Add comment to table
COMMENT ON TABLE public.admin_users IS 'Stores users with administrative privileges';
COMMENT ON COLUMN public.admin_users.user_id IS 'Reference to auth.users.id';
COMMENT ON COLUMN public.admin_users.created_by IS 'Admin user who created this admin record';
