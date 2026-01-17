
-- ORBITRIP DATABASE SCHEMA (v2.1 - Migration Fixes)

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TOURS TABLE
CREATE TABLE IF NOT EXISTS public.tours (
  id text primary key,
  title_en text, title_ru text, description_en text, description_ru text,
  price text, base_price numeric default 0, extra_person_fee numeric default 0, price_per_person numeric default 0,
  duration text, image text, rating numeric default 5, category text,
  highlights_en text[], highlights_ru text[], itinerary_en text[], itinerary_ru text[], route_stops text[],
  price_options jsonb default '[]'::jsonb, reviews jsonb default '[]'::jsonb, created_at timestamptz default now()
);

-- 2. DRIVERS TABLE
CREATE TABLE IF NOT EXISTS public.drivers (
  id text primary key, name text, email text, password text, phone_number text, city text default 'tbilisi',
  photo_url text, car_model text, car_photo_url text, car_photos text[], vehicle_type text,
  status text default 'PENDING', rating numeric default 5, review_count numeric default 0,
  price_per_km numeric default 1.2, base_price numeric default 30, max_passengers numeric default 4,
  languages text[], features text[], blocked_dates text[], documents jsonb default '[]'::jsonb, reviews jsonb default '[]'::jsonb,
  created_at timestamptz default now(),
  debt numeric default 0
);

-- 3. BOOKINGS TABLE
CREATE TABLE IF NOT EXISTS public.bookings (
  id text primary key, tour_id text, tour_title text, customer_name text, contact_info text,
  date text, vehicle text, guests numeric default 1, driver_id text, driver_name text,
  total_price text, numeric_price numeric, status text default 'PENDING', commission numeric default 0,
  promo_code text, payment_method text, created_at timestamptz default now(),
  flight_number text
);

-- Fix for Bookings: Add flight_number if missing
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='bookings' AND column_name='flight_number') THEN 
    ALTER TABLE public.bookings ADD COLUMN flight_number text; 
  END IF; 
END $$;

-- 4. SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.settings (
  id text primary key default 'default', sms_api_key text, admin_phone_number text default '995593456876',
  commission_rate numeric default 0.2, email_service_id text, email_template_id text, email_public_key text,
  sms_enabled boolean default true, background_image_url text,
  site_title text, site_description text, maintenance_mode boolean default false, min_trip_price numeric default 30,
  social_facebook text, social_instagram text
);

-- Fix for Settings: Add ALL potentially missing columns safely
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='settings' AND column_name='background_image_url') THEN 
    ALTER TABLE public.settings ADD COLUMN background_image_url text; 
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='settings' AND column_name='site_title') THEN 
    ALTER TABLE public.settings ADD COLUMN site_title text; 
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='settings' AND column_name='site_description') THEN 
    ALTER TABLE public.settings ADD COLUMN site_description text; 
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='settings' AND column_name='maintenance_mode') THEN 
    ALTER TABLE public.settings ADD COLUMN maintenance_mode boolean default false; 
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='settings' AND column_name='min_trip_price') THEN 
    ALTER TABLE public.settings ADD COLUMN min_trip_price numeric default 30; 
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='settings' AND column_name='social_facebook') THEN 
    ALTER TABLE public.settings ADD COLUMN social_facebook text; 
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='settings' AND column_name='social_instagram') THEN 
    ALTER TABLE public.settings ADD COLUMN social_instagram text; 
  END IF;
END $$;

-- 5. PROMO CODES
CREATE TABLE IF NOT EXISTS public.promo_codes (
  id text primary key, code text unique, discount_percent numeric, usage_limit numeric default 100,
  usage_count numeric default 0, status text default 'ACTIVE', created_at timestamptz default now()
);

-- 6. SMS LOGS
CREATE TABLE IF NOT EXISTS public.sms_logs (
  id text primary key, recipient text, content text, status text, type text, timestamp numeric
);

-- 7. FUNCTIONS
CREATE OR REPLACE FUNCTION increment_promo_usage(promo_code text)
RETURNS void AS $$
BEGIN
  UPDATE public.promo_codes
  SET usage_count = usage_count + 1
  WHERE code = promo_code;
END;
$$ LANGUAGE plpgsql;
