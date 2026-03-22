-- Full schema for Tingfinner
-- To set up a fresh database, run this file.
-- To migrate an existing database, run migrations in order.

-- ─── Helper functions (security definer to avoid RLS recursion) ───────────────

create or replace function public.is_household_member(hh_id uuid)
returns boolean language sql security definer stable as $$
  select exists (
    select 1 from public.household_members
    where household_id = hh_id and user_id = auth.uid()
  );
$$;

create or replace function public.is_household_eier(hh_id uuid)
returns boolean language sql security definer stable as $$
  select exists (
    select 1 from public.household_members
    where household_id = hh_id and user_id = auth.uid() and role = 'eier'
  );
$$;

-- ─── Households ──────────────────────────────────────────────────────────────

create table public.households (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_by uuid references auth.users not null,
  created_at timestamptz default now()
);

alter table public.households enable row level security;

create policy "Household members can read"
  on public.households for select
  using (public.is_household_member(id));

create policy "Authenticated users can create households"
  on public.households for insert
  to authenticated
  with check (created_by = auth.uid());

create policy "Eier can update household"
  on public.households for update
  using (public.is_household_eier(id));

create policy "Eier can delete household"
  on public.households for delete
  using (public.is_household_eier(id));

-- ─── Household members ───────────────────────────────────────────────────────

create table public.household_members (
  household_id uuid references public.households on delete cascade not null,
  user_id uuid references auth.users not null,
  role text not null default 'medlem' check (role in ('eier', 'medlem')),
  joined_at timestamptz default now(),
  primary key (household_id, user_id)
);

alter table public.household_members enable row level security;

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

-- ─── Household invites ───────────────────────────────────────────────────────

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

create policy "Authenticated users can look up invite by token"
  on public.household_invites for select
  to authenticated
  using (accepted_at is null and expires_at > now());

create policy "Authenticated users can accept invite"
  on public.household_invites for update
  to authenticated
  using (accepted_at is null and expires_at > now())
  with check (accepted_at is not null);

-- ─── Locations ───────────────────────────────────────────────────────────────

create table public.locations (
  id uuid primary key default gen_random_uuid(),
  household_id uuid references public.households on delete cascade not null,
  name text not null,
  type text not null default 'hus' check (type in ('hus', 'hytte', 'bat', 'leilighet', 'annet')),
  created_at timestamptz default now()
);

alter table public.locations enable row level security;

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

-- ─── Items ───────────────────────────────────────────────────────────────────

create table public.items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  location_id uuid references public.locations not null,
  name text not null,
  category text not null,
  room text not null,
  placement text not null,
  condition text not null,
  estimated_value numeric,
  notes text,
  photo text,
  created_at timestamptz default now()
);

alter table public.items enable row level security;

create policy "Household members can read items"
  on public.items for select
  using (
    exists (
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
    and exists (
      select 1
      from public.locations l
      join public.household_members hm on hm.household_id = l.household_id
      where l.id = location_id and hm.user_id = auth.uid()
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
  );

-- ─── Storage ─────────────────────────────────────────────────────────────────
-- Photo path: {household_id}/{location_id}/{filename}

insert into storage.buckets (id, name, public)
values ('item-photos', 'item-photos', false)
on conflict (id) do update set public = false;

create policy "Household members can read photos"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'item-photos'
    and exists (
      select 1 from public.household_members hm
      where hm.household_id::text = (storage.foldername(name))[1]
        and hm.user_id = auth.uid()
    )
  );

create policy "Household members can upload photos"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'item-photos'
    and exists (
      select 1 from public.household_members hm
      where hm.household_id::text = (storage.foldername(name))[1]
        and hm.user_id = auth.uid()
    )
  );

create policy "Household members can delete photos"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'item-photos'
    and exists (
      select 1 from public.household_members hm
      where hm.household_id::text = (storage.foldername(name))[1]
        and hm.user_id = auth.uid()
    )
  );
