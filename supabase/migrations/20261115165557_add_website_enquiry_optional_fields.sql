alter table public.website_enquiries
  add column if not exists industry text,
  add column if not exists services_required text[] not null default '{}'::text[],
  add column if not exists monthly_budget text,
  add column if not exists website_url text;
