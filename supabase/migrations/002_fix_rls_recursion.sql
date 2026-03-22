-- Migration: Fix infinite recursion in household_members RLS policies
--
-- Problem: policies on household_members use EXISTS (SELECT FROM household_members),
-- which triggers the SELECT policy on the same table → infinite recursion.
--
-- Fix: security definer helper functions bypass RLS when doing the membership
-- check, breaking the cycle. All policies on household_members and other tables
-- are rewritten to use these helpers.

-- ─── Helper functions ────────────────────────────────────────────────────────

create or replace function public.is_household_member(hh_id uuid)
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.household_members
    where household_id = hh_id and user_id = auth.uid()
  );
$$;

create or replace function public.is_household_eier(hh_id uuid)
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.household_members
    where household_id = hh_id and user_id = auth.uid() and role = 'eier'
  );
$$;

-- ─── household_members: replace recursive policies ───────────────────────────

drop policy if exists "Members can read household members" on public.household_members;
drop policy if exists "Eier can add members" on public.household_members;
drop policy if exists "Eier can remove members" on public.household_members;

create policy "Members can read household members"
  on public.household_members for select
  using (public.is_household_member(household_id));

create policy "Eier can add members"
  on public.household_members for insert
  with check (
    public.is_household_eier(household_id)
    or user_id = auth.uid()
  );

create policy "Eier can remove members"
  on public.household_members for delete
  using (
    public.is_household_eier(household_id)
    or user_id = auth.uid()
  );

-- ─── households: also uses household_members subquery → fix too ──────────────

drop policy if exists "Household members can read" on public.households;
drop policy if exists "Eier can update household" on public.households;
drop policy if exists "Eier can delete household" on public.households;

create policy "Household members can read"
  on public.households for select
  using (public.is_household_member(id));

create policy "Eier can update household"
  on public.households for update
  using (public.is_household_eier(id));

create policy "Eier can delete household"
  on public.households for delete
  using (public.is_household_eier(id));

-- ─── household_invites: fix too ──────────────────────────────────────────────

drop policy if exists "Members can read invites" on public.household_invites;
drop policy if exists "Eier can create invites" on public.household_invites;
drop policy if exists "Eier can delete invites" on public.household_invites;

create policy "Members can read invites"
  on public.household_invites for select
  using (
    public.is_household_member(household_id)
    or (accepted_at is null and expires_at > now())
  );

create policy "Eier can create invites"
  on public.household_invites for insert
  with check (public.is_household_eier(household_id));

create policy "Eier can delete invites"
  on public.household_invites for delete
  using (public.is_household_eier(household_id));

-- ─── locations: fix too ──────────────────────────────────────────────────────

drop policy if exists "Members can read locations" on public.locations;
drop policy if exists "Members can create locations" on public.locations;
drop policy if exists "Members can update locations" on public.locations;
drop policy if exists "Eier can delete locations" on public.locations;

create policy "Members can read locations"
  on public.locations for select
  using (public.is_household_member(household_id));

create policy "Members can create locations"
  on public.locations for insert
  with check (public.is_household_member(household_id));

create policy "Members can update locations"
  on public.locations for update
  using (public.is_household_member(household_id));

create policy "Eier can delete locations"
  on public.locations for delete
  using (public.is_household_eier(household_id));

-- ─── items: fix too ──────────────────────────────────────────────────────────

drop policy if exists "Household members can read items" on public.items;
drop policy if exists "Household members can insert items" on public.items;
drop policy if exists "Household members can update items" on public.items;
drop policy if exists "Household members can delete items" on public.items;

create policy "Household members can read items"
  on public.items for select
  using (
    (location_id is null and user_id = auth.uid())
    or exists (
      select 1 from public.locations l
      where l.id = location_id and public.is_household_member(l.household_id)
    )
  );

create policy "Household members can insert items"
  on public.items for insert
  with check (
    user_id = auth.uid()
    and (
      location_id is null
      or exists (
        select 1 from public.locations l
        where l.id = location_id and public.is_household_member(l.household_id)
      )
    )
  );

create policy "Household members can update items"
  on public.items for update
  using (
    (location_id is null and user_id = auth.uid())
    or exists (
      select 1 from public.locations l
      where l.id = location_id and public.is_household_member(l.household_id)
    )
  );

create policy "Household members can delete items"
  on public.items for delete
  using (
    (location_id is null and user_id = auth.uid())
    or exists (
      select 1 from public.locations l
      where l.id = location_id and public.is_household_member(l.household_id)
    )
  );

-- ─── storage: fix too ────────────────────────────────────────────────────────

drop policy if exists "Household members can read photos" on storage.objects;
drop policy if exists "Household members can upload photos" on storage.objects;
drop policy if exists "Household members can delete photos" on storage.objects;

create policy "Household members can read photos"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'item-photos'
    and (
      auth.uid()::text = (storage.foldername(name))[1]
      or public.is_household_member((storage.foldername(name))[1]::uuid)
    )
  );

create policy "Household members can upload photos"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'item-photos'
    and (
      auth.uid()::text = (storage.foldername(name))[1]
      or public.is_household_member((storage.foldername(name))[1]::uuid)
    )
  );

create policy "Household members can delete photos"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'item-photos'
    and (
      auth.uid()::text = (storage.foldername(name))[1]
      or public.is_household_member((storage.foldername(name))[1]::uuid)
    )
  );
