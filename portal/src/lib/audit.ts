import { SupabaseClient } from '@supabase/supabase-js'
import { NextRequest } from 'next/server'

type AuditAction =
  | 'login'
  | 'logout'
  | 'data_export'
  | 'data_delete'
  | 'profile_update'
  | 'child_created'
  | 'child_deleted'
  | 'observation_created'
  | 'message_sent'
  | 'parent_approved'
  | 'parent_rejected'
  | 'invitation_sent'
  | 'broadcast_sent'
  | 'ticket_created'
  | 'ticket_replied'
  | 'kita_created'
  | 'traeger_created'

export async function writeAuditLog(
  supabase: SupabaseClient,
  actor_id: string,
  action: AuditAction,
  options?: {
    table_name?: string
    record_id?: string | null
    details?: Record<string, string | number | boolean | null>
    request?: NextRequest | Request
  }
) {
  const ip = options?.request
    ? (options.request.headers.get('x-forwarded-for') ?? options.request.headers.get('x-real-ip') ?? null)
    : null

  const user_agent = options?.request
    ? (options.request.headers.get('user-agent') ?? null)
    : null

  await supabase.rpc('write_audit_log', {
    p_actor_id: actor_id,
    p_action: action,
    p_table: options?.table_name ?? null,
    p_record_id: options?.record_id ?? null,
    p_details: options?.details ? options.details : null,
    p_ip: ip,
    p_agent: user_agent,
  })
}
