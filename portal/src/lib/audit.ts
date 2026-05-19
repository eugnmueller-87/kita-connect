import { SupabaseClient } from '@supabase/supabase-js'

type AuditAction =
  | 'parent_approved'
  | 'parent_rejected'
  | 'invitation_sent'
  | 'broadcast_sent'
  | 'observation_created'
  | 'ticket_created'
  | 'ticket_replied'

export async function writeAuditLog(
  supabase: SupabaseClient,
  actor_id: string,
  action: AuditAction,
  target_id: string | null,
  meta?: Record<string, string | number | boolean>
) {
  await supabase.from('audit_log').insert({
    user_id: actor_id,
    action,
    target_id,
    meta: meta ?? {},
  })
}
