-- Velvet Cacao schema. Safe to re-run: every statement is idempotent.
-- Money is stored in integer cents.

create table if not exists products (
  id            text primary key,
  name          text not null,
  subtitle      text,
  tags          text[] not null default '{}',
  cocoa         smallint check (cocoa between 0 and 100),
  origin        jsonb not null,
  price_cents   integer not null check (price_cents >= 0),
  rating        numeric(2, 1) not null default 0,
  review_count  integer not null default 0,
  popularity    smallint not null default 0,
  added_on      date not null default current_date,
  weight        text,
  badge         text,
  image         text not null,
  gallery       text[] not null default '{}',
  alt           text not null,
  notes         text[] not null default '{}',
  description   text,
  ingredients   text,
  allergens     text[] not null default '{}',
  updated_at    timestamptz not null default now()
);

create table if not exists reviews (
  id           serial primary key,
  name         text not null,
  place        text,
  rating       smallint not null check (rating between 1 and 5),
  product      text,
  body         text not null,
  reviewed_on  date not null default current_date
);

create table if not exists orders (
  id               bigserial primary key,
  order_number     text not null unique,
  email            text not null,
  full_name        text not null,
  address          text not null,
  city             text not null,
  postcode         text not null,
  country          text not null,
  shipping_method  text not null,
  subtotal_cents   integer not null check (subtotal_cents >= 0),
  shipping_cents   integer not null check (shipping_cents >= 0),
  total_cents      integer not null check (total_cents >= 0),
  status           text not null default 'confirmed',
  created_at       timestamptz not null default now()
);

create table if not exists order_items (
  id                bigserial primary key,
  order_id          bigint not null references orders (id) on delete cascade,
  kind              text not null check (kind in ('product', 'box', 'plan')),
  product_id        text references products (id),
  name              text not null,
  meta              text,
  config            jsonb,
  unit_price_cents  integer not null check (unit_price_cents >= 0),
  quantity          smallint not null check (quantity between 1 and 20)
);

create index if not exists order_items_order_id_idx on order_items (order_id);
create index if not exists orders_email_idx on orders (email);

create table if not exists newsletter_subscribers (
  email       text primary key,
  created_at  timestamptz not null default now()
);
