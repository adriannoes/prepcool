-- Migration script to migrate existing admin user (dev@dev.com) to admin_users table
-- This script should be run after creating the admin_users table
-- It finds the user by email and adds them to the admin_users table

DO $$
DECLARE
  admin_user_id UUID;
  current_user_id UUID;
BEGIN
  -- Find the user with email 'dev@dev.com'
  SELECT id INTO admin_user_id
  FROM auth.users
  WHERE email = 'dev@dev.com'
  LIMIT 1;

  -- If user exists, add them to admin_users table
  IF admin_user_id IS NOT NULL THEN
    -- Check if already exists in admin_users
    IF NOT EXISTS (
      SELECT 1 FROM public.admin_users WHERE user_id = admin_user_id
    ) THEN
      -- Get current user ID for created_by (if available, otherwise use the same user)
      SELECT id INTO current_user_id
      FROM auth.users
      WHERE id = admin_user_id;
      
      -- Insert into admin_users
      -- Temporarily disable RLS to allow this migration
      INSERT INTO public.admin_users (user_id, created_by, created_at)
      VALUES (
        admin_user_id,
        current_user_id, -- Self-created for initial admin
        NOW()
      )
      ON CONFLICT (user_id) DO NOTHING;
      
      RAISE NOTICE 'Admin user dev@dev.com migrated to admin_users table';
    ELSE
      RAISE NOTICE 'Admin user dev@dev.com already exists in admin_users table';
    END IF;
  ELSE
    RAISE NOTICE 'User dev@dev.com not found. Skipping migration.';
  END IF;
END $$;

-- Note: This migration uses DO block to temporarily bypass RLS
-- In production, you may need to run this as a superuser or temporarily disable RLS
-- Alternative: Run this manually via Supabase dashboard SQL editor with service_role key
