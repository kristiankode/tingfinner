-- Migration: Households, locations, and members
-- Run this against the existing database to add household support.

-- ─── 1. New tables ───────────────────────────────────────────────────────────

create table public.households (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_by uuid references auth.users not null,
  created_at timestamptz default now()
);

alter table public.households enable row level security;

create table public.household_members (
  household_id uuid references public.households on delete cascade not null,
  user_id uuid references auth.users not null,
  role text not null default 'medlem' check (role in ('eier', 'medlem')),
  joined_at timestamptz default now(),
  primary key (household_id, user_id)
);

alter table public.household_members enable row level security;

create table public.household_invites (
  id uuid primary key default gen_random_uuid(),
  household_id uuid references public.households on delete cascade not null,
  invited_email text not null,
  token text not null unique default gen_random_uuid()::text,
  created_at timestamptz default now(),
  expires_at timestamptz not null default (now() + interval '7 days'),
  accepted_at timestamptz
);

alter table public.household_invites enable row level security;

create table public.locations (
  id uuid primary key default gen_random_uuid(),
  household_id uuid references public.households on delete cascade not null,
  name text not null,
  type text not null default 'hus' check (type in ('hus', 'hytte', 'bat', 'leilighet', 'annet')),
  created_at timestamptz default now()
);

alter table public.locations enable row level security;

-- ─── 2. Add location_id to items (nullable for backfill) ─────────────────────

alter table public.items add column location_id uuid references public.locations;

-- ─── 3. RLS policies ─────────────────────────────────────────────────────────

-- households: members can read; only eier can update/delete
create policy "Household members can read"
  on public.households for select
  using (
    exists (
      select 1 from public.household_members hm
      where hm.household_id = id and hm.user_id = auth.uid()
    )
  );

create policy "Authenticated users can create households"
  on public.households for insert
  to authenticated
  with check (created_by = auth.uid());

create policy "Eier can update household"
  on public.households for update
  using (
    exists (
      select 1 from public.household_members hm
      where hm.household_id = id and hm.user_id = auth.uid() and hm.role = 'eier'
    )
  );

create policy "Eier can delete household"
  on public.households for delete
  using (
    exists (
      select 1 from public.household_members hm
      where hm.household_id = id and hm.user_id = auth.uid() and hm.role = 'eier'
    )
  );

-- household_members: members can read; eier can insert/delete
create policy "Members can read household members"
  on public.household_members for select
  using (
    exists (
      select 1 from public.household_members hm
      where hm.household_id = household_id and hm.user_id = auth.uid()
    )
  );

create policy "Eier can add members"
  on public.household_members for insert
  with check (
    exists (
      select 1 from public.household_members hm
      where hm.household_id = household_id and hm.user_id = auth.uid() and hm.role = 'eier'
    )
    or user_id = auth.uid() -- allow self-insert when accepting an invite
  );

create policy "Eier can remove members"
  on public.household_members for delete
  using (
    exists (
      select 1 from public.household_members hm
      where hm.household_id = household_id and hm.user_id = auth.uid() and hm.role = 'eier'
    )
    or user_id = auth.uid() -- allow self-removal (leave household)
  );

-- household_invites: members can read and create; anyone with token can read to accept
create policy "Members can read invites"
  on public.household_invites for select
  using (
    exists (
      select 1 from public.household_members hm
      where hm.household_id = household_id and hm.user_id = auth.uid()
    )
  );

create policy "Eier can create invites"
  on public.household_invites for insert
  with check (
    exists (
      select 1 from public.household_members hm
      where hm.household_id = household_id and hm.user_id = auth.uid() and hm.role = 'eier'
    )
  );

create policy "Eier can delete invites"
  on public.household_invites for delete
  using (
    exists (
      select 1 from public.household_members hm
      where hm.household_id = household_id and hm.user_id = auth.uid() and hm.role = 'eier'
    )
  );

-- Allow any authenticated user to look up an invite by token (for acceptance flow)
create policy "Authenticated users can look up invite by token"
  on public.household_invites for select
  to authenticated
  using (accepted_at is null and expires_at > now());

create policy "Authenticated users can accept invite"
  on public.household_invites for update
  to authenticated
  using (accepted_at is null and expires_at > now())
  with check (accepted_at is not null);

-- locations: members can read and create; eier can delete
create policy "Members can read locations"
  on public.locations for select
  using (
    exists (
      select 1 from public.household_members hm
      where hm.household_id = household_id and hm.user_id = auth.uid()
    )
  );

create policy "Members can create locations"
  on public.locations for insert
  with check (
    exists (
      select 1 from public.household_members hm
      where hm.household_id = household_id and hm.user_id = auth.uid()
    )
  );

create policy "Members can update locations"
  on public.locations for update
  using (
    exists (
      select 1 from public.household_members hm
      where hm.household_id = household_id and hm.user_id = auth.uid()
    )
  );

create policy "Eier can delete locations"
  on public.locations for delete
  using (
    exists (
      select 1 from public.household_members hm
      where hm.household_id = household_id and hm.user_id = auth.uid() and hm.role = 'eier'
    )
  );

-- items: scope via location → household membership (replaces user_id check)
drop policy if exists "Users manage own items" on public.items;

create policy "Household members can read items"
  on public.items for select
  using (
    -- own items without location (legacy / during backfill)
    (location_id is null and user_id = auth.uid())
    or exists (
      select 1
      from public.locations l
      join public.household_members hm on hm.household_id = l.household_id
      where l.id = location_id and hm.user_id = auth.uid()
    )
  );

create policy "Household members can insert items"
  on public.items for insert
  with check (
    user_id = auth.uid()
    and (
      location_id is null
      or exists (
        select 1
        from public.locations l
        join public.household_members hm on hm.household_id = l.household_id
        where l.id = location_id and hm.user_id = auth.uid()
      )
    )
  );

create policy "Household members can update items"
  on public.items for update
  using (
    exists (
      select 1
      from public.locations l
      join public.household_members hm on hm.household_id = l.household_id
      where l.id = location_id and hm.user_id = auth.uid()
    )
    or (location_id is null and user_id = auth.uid())
  );

create policy "Household members can delete items"
  on public.items for delete
  using (
    exists (
      select 1
      from public.locations l
      join public.household_members hm on hm.household_id = l.household_id
      where l.id = location_id and hm.user_id = auth.uid()
    )
    or (location_id is null and user_id = auth.uid())
  );

-- ─── 4. Backfill: create household + location for each existing user ──────────
-- Creates "Hjemme" (type hus) for every user that has items but no household.

do $$
declare
  r record;
  new_household_id uuid;
  new_location_id uuid;
begin
  for r in
    select distinct user_id from public.items where location_id is null
  loop
    -- Create household
    insert into public.households (name, created_by)
    values ('Min husholdning', r.user_id)
    returning id into new_household_id;

    -- Add user as eier
    insert into public.household_members (household_id, user_id, role)
    values (new_household_id, r.user_id, 'eier');

    -- Create default location
    insert into public.locations (household_id, name, type)
    values (new_household_id, 'Hjemme', 'hus')
    returning id into new_location_id;

    -- Assign all existing items to this location
    update public.items
    set location_id = new_location_id
    where user_id = r.user_id and location_id is null;
  end loop;
end $$;

-- ─── 5. Make location_id NOT NULL now that backfill is done ──────────────────

alter table public.items alter column location_id set not null;

-- ─── 6. Update storage policies to allow household-scoped photo paths ─────────
-- New path pattern: {household_id}/{location_id}/{filename}
-- Old pattern: {user_id}/{filename}  (kept for backwards compat during transition)

drop policy if exists "Users read own photos" on storage.objects;
drop policy if exists "Authenticated users upload to own folder" on storage.objects;
drop policy if exists "Users delete own photos" on storage.objects;

create policy "Household members can read photos"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'item-photos'
    and (
      -- legacy path: user_id/filename
      auth.uid()::text = (storage.foldername(name))[1]
      -- new path: household_id/location_id/filename — allow if member of that household
      or exists (
        select 1 from public.household_members hm
        where hm.household_id::text = (storage.foldername(name))[1]
          and hm.user_id = auth.uid()
      )
    )
  );

create policy "Household members can upload photos"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'item-photos'
    and (
      -- legacy path
      auth.uid()::text = (storage.foldername(name))[1]
      -- new path
      or exists (
        select 1 from public.household_members hm
        where hm.household_id::text = (storage.foldername(name))[1]
          and hm.user_id = auth.uid()
      )
    )
  );

create policy "Household members can delete photos"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'item-photos'
    and (
      auth.uid()::text = (storage.foldername(name))[1]
      or exists (
        select 1 from public.household_members hm
        where hm.household_id::text = (storage.foldername(name))[1]
          and hm.user_id = auth.uid()
      )
    )
  );
