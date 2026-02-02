
-- Enable UUID extension for unique identifiers
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ---------------------------------------------------------
-- 1. DRIVERS TABLE
-- ---------------------------------------------------------
CREATE TABLE public.drivers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    phone_number TEXT,
    city TEXT DEFAULT 'tbilisi',
    photo_url TEXT,
    car_model TEXT,
    car_photo_url TEXT,
    vehicle_type TEXT, -- 'Sedan', 'Minivan', 'SUV', 'Bus'
    status TEXT DEFAULT 'PENDING', -- 'ACTIVE', 'INACTIVE', 'PENDING'
    rating NUMERIC DEFAULT 5.0,
    review_count INTEGER DEFAULT 0,
    price_per_km NUMERIC DEFAULT 1.2,
    base_price NUMERIC DEFAULT 30,
    max_passengers INTEGER DEFAULT 4,
    languages TEXT[] DEFAULT '{}',
    features TEXT[] DEFAULT '{}', -- 'WiFi', 'AC', etc.
    blocked_dates TEXT[] DEFAULT '{}',
    debt NUMERIC DEFAULT 0, -- Commission debt
    car_photos TEXT[] DEFAULT '{}',
    documents JSONB DEFAULT '[]'::jsonb, -- Internal documents (license, etc)
    reviews JSONB DEFAULT '[]'::jsonb
);

-- RLS: Public can view active drivers, Drivers can edit their own profile
ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public drivers are viewable by everyone" ON public.drivers
    FOR SELECT USING (status = 'ACTIVE');

CREATE POLICY "Drivers can update own profile" ON public.drivers
    FOR UPDATE USING (auth.uid() = id);

-- ---------------------------------------------------------
-- 2. TOURS TABLE
-- ---------------------------------------------------------
CREATE TABLE public.tours (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    author_id UUID REFERENCES public.drivers(id), -- If null, it's a system tour
    title_en TEXT NOT NULL,
    title_ru TEXT,
    description_en TEXT,
    description_ru TEXT,
    price TEXT, -- Display string like "150 GEL"
    base_price NUMERIC DEFAULT 0,
    extra_person_fee NUMERIC DEFAULT 0,
    duration TEXT,
    image TEXT,
    category TEXT, -- 'WINE', 'CULTURE', 'AUTHOR', etc.
    rating NUMERIC DEFAULT 5,
    highlights_en TEXT[],
    highlights_ru TEXT[],
    itinerary_en TEXT[],
    itinerary_ru TEXT[],
    route_stops TEXT[],
    price_options JSONB DEFAULT '[]'::jsonb -- Array of {vehicle, price, guests}
);

-- RLS: Everyone can read tours, Only Authors or Admins can edit
ALTER TABLE public.tours ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tours are viewable by everyone" ON public.tours
    FOR SELECT USING (true);

CREATE POLICY "Drivers can insert their own tours" ON public.tours
    FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Drivers can update their own tours" ON public.tours
    FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Drivers can delete their own tours" ON public.tours
    FOR DELETE USING (auth.uid() = author_id);

-- ---------------------------------------------------------
-- 3. BOOKINGS TABLE
-- ---------------------------------------------------------
CREATE TABLE public.bookings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    tour_id TEXT, -- Can be a UUID or a custom string for transfers
    tour_title TEXT,
    customer_name TEXT NOT NULL,
    contact_info TEXT NOT NULL,
    date TEXT NOT NULL, -- Stored as ISO string or text description
    vehicle TEXT,
    guests INTEGER DEFAULT 1,
    driver_id UUID REFERENCES public.drivers(id),
    driver_name TEXT,
    total_price TEXT,
    numeric_price NUMERIC,
    status TEXT DEFAULT 'PENDING', -- 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'
    commission NUMERIC DEFAULT 0,
    promo_code TEXT,
    flight_number TEXT,
    payment_method TEXT DEFAULT 'CASH'
);

-- RLS: Drivers can see bookings assigned to them. Public (Customers) can insert.
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create a booking" ON public.bookings
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Drivers can view their own bookings" ON public.bookings
    FOR SELECT USING (auth.uid() = driver_id OR driver_id IS NULL);

CREATE POLICY "Drivers can update their own bookings" ON public.bookings
    FOR UPDATE USING (auth.uid() = driver_id);

-- ---------------------------------------------------------
-- 4. SETTINGS TABLE (Singleton)
-- ---------------------------------------------------------
CREATE TABLE public.settings (
    id TEXT PRIMARY KEY DEFAULT 'default',
    sms_api_key TEXT,
    admin_phone_number TEXT,
    commission_rate NUMERIC DEFAULT 0.13,
    sms_enabled BOOLEAN DEFAULT true,
    email_service_id TEXT,
    email_template_id TEXT,
    email_public_key TEXT,
    background_image_url TEXT,
    site_title TEXT,
    site_description TEXT,
    maintenance_mode BOOLEAN DEFAULT false,
    min_trip_price NUMERIC DEFAULT 30,
    social_facebook TEXT,
    social_instagram TEXT
);

-- RLS: Only admins (service_role) should write. Public can read non-sensitive fields.
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access to settings" ON public.settings
    FOR SELECT USING (true);

-- ---------------------------------------------------------
-- 5. PROMO CODES
-- ---------------------------------------------------------
CREATE TABLE public.promo_codes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    code TEXT UNIQUE NOT NULL,
    discount_percent NUMERIC NOT NULL,
    usage_limit INTEGER DEFAULT 100,
    usage_count INTEGER DEFAULT 0,
    status TEXT DEFAULT 'ACTIVE'
);

ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read active promo codes" ON public.promo_codes
    FOR SELECT USING (status = 'ACTIVE');

-- ---------------------------------------------------------
-- 6. SMS LOGS
-- ---------------------------------------------------------
CREATE TABLE public.sms_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    recipient TEXT,
    content TEXT,
    status TEXT,
    type TEXT
);

-- ---------------------------------------------------------
-- STORAGE BUCKETS (Pseudo-code for Supabase UI)
-- ---------------------------------------------------------
-- 1. Create a public bucket named 'public-gallery'
-- 2. Add policy: "Public Access" -> SELECT for all
-- 3. Add policy: "Authenticated Upload" -> INSERT for authenticated users

