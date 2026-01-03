/**
 * Admin Audit Logging Utility
 * 
 * Provides functions to log administrative actions for security and compliance.
 * All admin actions should be logged using these functions.
 */

import { supabase } from '@/integrations/supabase/client';

export interface AdminAuditLogEntry {
  action: string;
  resource_type?: string;
  resource_id?: string;
  metadata?: Record<string, any>;
}

/**
 * Logs an administrative action to the audit log
 * 
 * @param entry - The audit log entry containing action details
 * @returns Promise that resolves when the log entry is created
 * 
 * @example
 * ```typescript
 * await logAdminAction({
 *   action: 'create',
 *   resource_type: 'video',
 *   resource_id: videoId,
 *   metadata: { title: 'New Video', duration: 120 }
 * });
 * ```
 */
export async function logAdminAction(entry: AdminAuditLogEntry): Promise<void> {
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.warn('Cannot log admin action: No authenticated user');
      return;
    }

    // Insert audit log entry
    const { error } = await supabase
      .from('admin_audit_log')
      .insert({
        user_id: user.id,
        action: entry.action,
        resource_type: entry.resource_type || null,
        resource_id: entry.resource_id || null,
        metadata: entry.metadata || {},
      });

    if (error) {
      console.error('Failed to log admin action:', error);
      // Don't throw - audit logging failures shouldn't break the main operation
    }
  } catch (error) {
    console.error('Error in logAdminAction:', error);
    // Don't throw - audit logging failures shouldn't break the main operation
  }
}

/**
 * Convenience functions for common admin actions
 */

export async function logCreate(resourceType: string, resourceId: string, metadata?: Record<string, any>): Promise<void> {
  return logAdminAction({
    action: 'create',
    resource_type: resourceType,
    resource_id: resourceId,
    metadata,
  });
}

export async function logUpdate(resourceType: string, resourceId: string, metadata?: Record<string, any>): Promise<void> {
  return logAdminAction({
    action: 'update',
    resource_type: resourceType,
    resource_id: resourceId,
    metadata,
  });
}

export async function logDelete(resourceType: string, resourceId: string, metadata?: Record<string, any>): Promise<void> {
  return logAdminAction({
    action: 'delete',
    resource_type: resourceType,
    resource_id: resourceId,
    metadata,
  });
}

export async function logBulkOperation(resourceType: string, action: string, count: number, metadata?: Record<string, any>): Promise<void> {
  return logAdminAction({
    action: `bulk_${action}`,
    resource_type: resourceType,
    metadata: {
      ...metadata,
      count,
    },
  });
}
