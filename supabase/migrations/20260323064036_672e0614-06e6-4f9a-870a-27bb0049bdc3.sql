-- Roles for secure admin access
create type public.app_role as enum ('admin');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  created_at timestamp with time zone not null default now(),
  unique (user_id, role)
);

alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = _user_id
      and role = _role
  )
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.has_role(auth.uid(), 'admin'::public.app_role)
$$;

create policy "Admins can view user roles"
on public.user_roles
for select
using (public.is_admin());

create policy "Admins can manage user roles"
on public.user_roles
for all
using (public.is_admin())
with check (public.is_admin());

-- Order and payment schema
create type public.order_status as enum ('pending', 'approved', 'rejected', 'completed');
create type public.payment_status as enum ('pending', 'submitted', 'verified', 'failed');
create type public.payment_method as enum ('manual');

create table public.revision_orders (
  id uuid primary key default gen_random_uuid(),
  student_name text not null check (char_length(trim(student_name)) between 2 and 120),
  student_number text not null check (char_length(trim(student_number)) between 2 and 60),
  contact_phone text check (contact_phone is null or char_length(trim(contact_phone)) between 7 and 30),
  order_token uuid not null default gen_random_uuid(),
  status public.order_status not null default 'pending',
  source_pdf_path text not null default 'placeholder/see-revision-kit.pdf',
  personalized_pdf_path text,
  amount_npr integer not null default 49 check (amount_npr > 0),
  admin_note text,
  approved_at timestamp with time zone,
  completed_at timestamp with time zone,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  unique (order_token)
);

create table public.order_payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.revision_orders(id) on delete cascade,
  method public.payment_method not null default 'manual',
  status public.payment_status not null default 'pending',
  transaction_reference text,
  payment_note text,
  amount_npr integer not null default 49 check (amount_npr > 0),
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

create index revision_orders_status_idx on public.revision_orders(status, created_at desc);
create index order_payments_order_id_idx on public.order_payments(order_id);

alter table public.revision_orders enable row level security;
alter table public.order_payments enable row level security;

create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger update_revision_orders_updated_at
before update on public.revision_orders
for each row
execute function public.update_updated_at_column();

create trigger update_order_payments_updated_at
before update on public.order_payments
for each row
execute function public.update_updated_at_column();

create or replace function public.can_download_personalized_pdf(_order_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.revision_orders ro
    where ro.id = _order_id
      and ro.status in ('approved', 'completed')
      and ro.personalized_pdf_path is not null
  )
$$;

create policy "Admins can manage orders"
on public.revision_orders
for all
using (public.is_admin())
with check (public.is_admin());

create policy "Admins can manage payments"
on public.order_payments
for all
using (public.is_admin())
with check (public.is_admin());

-- Private storage buckets for source and generated PDFs
insert into storage.buckets (id, name, public)
values ('revision-source-pdfs', 'revision-source-pdfs', false)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('revision-generated-pdfs', 'revision-generated-pdfs', false)
on conflict (id) do nothing;

create policy "Admins can read source pdfs"
on storage.objects
for select
using (bucket_id = 'revision-source-pdfs' and public.is_admin());

create policy "Admins can upload source pdfs"
on storage.objects
for insert
with check (bucket_id = 'revision-source-pdfs' and public.is_admin());

create policy "Admins can update source pdfs"
on storage.objects
for update
using (bucket_id = 'revision-source-pdfs' and public.is_admin())
with check (bucket_id = 'revision-source-pdfs' and public.is_admin());

create policy "Admins can delete source pdfs"
on storage.objects
for delete
using (bucket_id = 'revision-source-pdfs' and public.is_admin());

create policy "Admins can read generated pdfs"
on storage.objects
for select
using (bucket_id = 'revision-generated-pdfs' and public.is_admin());

create policy "Admins can upload generated pdfs"
on storage.objects
for insert
with check (bucket_id = 'revision-generated-pdfs' and public.is_admin());

create policy "Admins can update generated pdfs"
on storage.objects
for update
using (bucket_id = 'revision-generated-pdfs' and public.is_admin())
with check (bucket_id = 'revision-generated-pdfs' and public.is_admin());

create policy "Admins can delete generated pdfs"
on storage.objects
for delete
using (bucket_id = 'revision-generated-pdfs' and public.is_admin());