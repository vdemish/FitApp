-- ============================================================================
-- Delete User RPC
-- Migration: 20260127120000_delete_user_rpc.sql
-- ============================================================================

create or replace function public.delete_user()
returns void
language plpgsql
security definer
set search_path = auth, public
as $$
begin
  delete from auth.users where id = auth.uid();
end;
$$;

revoke all on function public.delete_user() from public;
grant execute on function public.delete_user() to authenticated;
