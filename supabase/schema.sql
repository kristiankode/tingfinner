-- Items table
create table public.items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
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

create policy "Users manage own items"
  on public.items for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Private storage bucket (ensure it is not public)
insert into storage.buckets (id, name, public)
values ('item-photos', 'item-photos', false)
on conflict (id) do update set public = false;

create policy "Users read own photos"
  on storage.objects for select to authenticated
  using (bucket_id = 'item-photos' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Authenticated users upload to own folder"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'item-photos' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users delete own photos"
  on storage.objects for delete to authenticated
  using (bucket_id = 'item-photos' and auth.uid()::text = (storage.foldername(name))[1]);
