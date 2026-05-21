-- ================================================================
-- MIGRATION 002 — GDPR Cleanup & Data Retention
-- ================================================================

-- ----------------------------------------------------------------
-- 1. Auto-delete pending_registrations after 48 hours
--    Runs via pg_cron or manual call. Deletes incomplete signups.
-- ----------------------------------------------------------------

create or replace function cleanup_pending_registrations()
returns void
language sql
security definer
as $$
  delete from pending_registrations
  where completed_at is null
    and created_at < now() - interval '48 hours';
$$;

-- ----------------------------------------------------------------
-- 2. Full account deletion function
--    Deletes everything associated with a user:
--    children (cascades to observations, learning_stories, photos,
--    milestones), tickets, ticket_replies, profiles, push_subscriptions,
--    then the Supabase auth user via service role.
--
--    Call from server-side only (service role required).
-- ----------------------------------------------------------------

create or replace function delete_user_account(target_user_id uuid)
returns void
language plpgsql
security definer
as $$
begin
  -- Log the deletion request before wiping data
  insert into audit_log (actor_id, action, table_name, record_id, details)
  values (target_user_id, 'account_deleted', 'profiles', target_user_id,
          jsonb_build_object('reason', 'user_request', 'deleted_at', now()));

  -- Delete child data (observations, learning_stories, milestones,
  -- child_photos, child_milestones all cascade from children)
  delete from children where parent_id = target_user_id;

  -- Delete communication
  delete from ticket_replies where author_id = target_user_id;
  delete from tickets where parent_id = target_user_id
                         or teacher_id = target_user_id;

  -- Delete notification subscriptions
  delete from push_subscriptions where user_id = target_user_id;

  -- Delete pending registrations
  delete from pending_registrations
  where email = (select email from profiles where id = target_user_id);

  -- Delete profile (must come after children/tickets)
  delete from profiles where id = target_user_id;

  -- Note: auth.users deletion must be done via adminSupabase.auth.admin.deleteUser()
  -- in the API route after calling this function, as it requires service role.
end;
$$;

-- ----------------------------------------------------------------
-- 3. Revoke public execute on these sensitive functions
-- ----------------------------------------------------------------

revoke execute on function cleanup_pending_registrations() from public, anon, authenticated;
revoke execute on function delete_user_account(uuid) from public, anon, authenticated;

-- Only service role can call these
grant execute on function cleanup_pending_registrations() to service_role;
grant execute on function delete_user_account(uuid) to service_role;

-- ----------------------------------------------------------------
-- 4. Add kita_id column to pending_registrations if missing
--    (needed for the password-based register route)
-- ----------------------------------------------------------------

alter table pending_registrations
  add column if not exists kita_id uuid references kitas(id) on delete set null;
