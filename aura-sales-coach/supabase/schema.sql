-- ─────────────────────────────────────────────────────────────
-- Aura Sales Coach – Datenbankschema (Supabase / PostgreSQL)
-- Im Supabase-Dashboard unter "SQL Editor" ausführen.
-- ─────────────────────────────────────────────────────────────

create table if not exists public.products (
  id                text primary key,                 -- z. B. 'sehkraft-forte'
  name              text not null,
  categories        text[] not null default '{}',     -- IDs aus lib/catalog.ts
  description       text not null default '',         -- Originalbeschreibung
  ingredients       text[] not null default '{}',     -- vollständige Inhaltsstoffe inkl. Menge
  dosage            text not null default '',         -- Einnahmeempfehlung
  manufacturer_info text not null default '',
  approved_claims   text[] not null default '{}',     -- zulässige Health-Claims
  typical_questions jsonb  not null default '[]',     -- [{ "q": "...", "a": "..." }]
  sales_arguments   text[] not null default '{}',
  precautions       text[] not null default '{}',
  interactions      text[] not null default '{}',
  price             text not null default '',
  offers            text[] not null default '{}',
  image_url         text,
  verified          boolean not null default false,   -- aus offiziellen Unterlagen geprüft?
  unverified_notes  text not null default '',
  source            text not null default '',         -- Quelle der Angaben
  updated_at        timestamptz not null default now(),
  created_at        timestamptz not null default now()
);

create index if not exists products_categories_idx on public.products using gin (categories);
create index if not exists products_name_idx on public.products (lower(name));

-- Zugriff ausschließlich serverseitig über den Service-Role-Key.
-- RLS aktiv OHNE Policies = kein Zugriff mit dem öffentlichen anon-Key.
alter table public.products enable row level security;

-- Änderungsprotokoll für die Produktpflege (wer hat wann was geändert)
create table if not exists public.product_audit (
  id          bigint generated always as identity primary key,
  product_id  text not null,
  action      text not null check (action in ('insert','update','delete')),
  snapshot    jsonb,
  changed_at  timestamptz not null default now()
);
alter table public.product_audit enable row level security;

create or replace function public.log_product_change() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'DELETE' then
    insert into product_audit(product_id, action, snapshot) values (old.id, 'delete', to_jsonb(old));
    return old;
  end if;
  insert into product_audit(product_id, action, snapshot) values (new.id, lower(tg_op), to_jsonb(new));
  return new;
end $$;

drop trigger if exists products_audit on public.products;
create trigger products_audit after insert or update or delete on public.products
for each row execute function public.log_product_change();

-- Hinweis Datenschutz: Gesprächsinhalte werden bewusst NICHT in der Datenbank
-- gespeichert. Der Gesprächsverlauf liegt nur lokal auf dem Gerät des Verkäufers.
