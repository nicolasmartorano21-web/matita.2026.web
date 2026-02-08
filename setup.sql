
-- ==========================================
-- 1. CONFIGURACIÓN DE STORAGE (BUCKET: productos)
-- ==========================================
INSERT INTO storage.buckets (id, name, public) 
VALUES ('productos', 'productos', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Public View" ON storage.objects;
DROP POLICY IF EXISTS "Public Insert" ON storage.objects;
DROP POLICY IF EXISTS "Public Update" ON storage.objects;
DROP POLICY IF EXISTS "Public Delete" ON storage.objects;

CREATE POLICY "Public View" ON storage.objects FOR SELECT TO public USING ( bucket_id = 'productos' );
CREATE POLICY "Public Insert" ON storage.objects FOR INSERT TO anon, authenticated WITH CHECK ( bucket_id = 'productos' );
CREATE POLICY "Public Update" ON storage.objects FOR UPDATE TO anon, authenticated USING ( bucket_id = 'productos' ) WITH CHECK ( bucket_id = 'productos' );
CREATE POLICY "Public Delete" ON storage.objects FOR DELETE TO anon, authenticated USING ( bucket_id = 'productos' );

-- ==========================================
-- 2. TABLAS DE LA APLICACIÓN
-- ==========================================

CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    points INTEGER DEFAULT 500,
    avatar_url TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    curator_note TEXT,
    price NUMERIC NOT NULL,
    old_price NUMERIC,
    category TEXT NOT NULL,
    image_url TEXT, 
    gallery TEXT[] DEFAULT '{}',
    stock INTEGER DEFAULT 0,
    is_new BOOLEAN DEFAULT true,
    is_video BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS cart_items (
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    product_id TEXT REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1,
    PRIMARY KEY (user_id, product_id)
);

-- NUEVA TABLA: FAVORITOS
CREATE TABLE IF NOT EXISTS user_favorites (
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    product_id TEXT REFERENCES products(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, product_id)
);

CREATE TABLE IF NOT EXISTS reviews (
    id TEXT PRIMARY KEY,
    product_id TEXT REFERENCES products(id) ON DELETE CASCADE,
    user_name TEXT NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    date TEXT,
    location TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS suggestions (
    id TEXT PRIMARY KEY,
    text TEXT NOT NULL,
    type TEXT NOT NULL,
    date TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS coupons (
    code TEXT PRIMARY KEY,
    discount NUMERIC NOT NULL,
    active BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS sales (
    id TEXT PRIMARY KEY,
    date TEXT NOT NULL,
    total NUMERIC NOT NULL,
    items_count INTEGER NOT NULL,
    items_detail TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);
