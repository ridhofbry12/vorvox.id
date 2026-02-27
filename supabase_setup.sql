-- ==========================================
-- VORVOX.ID: FULL CMS DATABASE SETUP SCRIPT
-- ==========================================
-- Instructions:
-- 1. Copy this entire script.
-- 2. Go to your Supabase project dashboard.
-- 3. Open the "SQL Editor" from the left sidebar.
-- 4. Paste the script into a new query tab and click "Run".
-- ==========================================

-- 1. Create Tables

DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.portfolio CASCADE;
DROP TABLE IF EXISTS public.hero_slides CASCADE;
DROP TABLE IF EXISTS public.site_content CASCADE;
DROP TABLE IF EXISTS public.invoices CASCADE;
DROP TABLE IF EXISTS public.orders CASCADE;
DROP TABLE IF EXISTS public.clients CASCADE;
DROP TABLE IF EXISTS public.page_materials CASCADE;
DROP TABLE IF EXISTS public.page_collars CASCADE;
DROP TABLE IF EXISTS public.page_fonts CASCADE;
DROP TABLE IF EXISTS public.page_size_chart CASCADE;
DROP TABLE IF EXISTS public.vendor_sublim_kategori CASCADE;
DROP TABLE IF EXISTS public.vendor_sublim_keunggulan CASCADE;
DROP TABLE IF EXISTS public.payments CASCADE;
DROP TABLE IF EXISTS public.payment_methods CASCADE;
DROP TABLE IF EXISTS public.bahan_jersey CASCADE;
DROP TABLE IF EXISTS public.model_kerah CASCADE;
DROP TABLE IF EXISTS public.jersey_players CASCADE;

-- Products Catalog
CREATE TABLE IF NOT EXISTS public.products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    short_desc TEXT,
    full_desc TEXT,
    specs_json JSONB DEFAULT '[]'::jsonb,
    badge TEXT,
    icon_type TEXT,
    tags TEXT[] DEFAULT '{}',
    image_url TEXT,
    base_price NUMERIC DEFAULT 0,
    dp_percentage NUMERIC DEFAULT 50,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Portfolio Gallery
CREATE TABLE IF NOT EXISTS public.portfolio (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    image_url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Hero Slider
CREATE TABLE IF NOT EXISTS public.hero_slides (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    headline TEXT NOT NULL,
    sub_headline TEXT,
    description TEXT,
    image_url TEXT NOT NULL,
    cta_link TEXT DEFAULT 'services',
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- General Site Content (Key-Value)
CREATE TABLE IF NOT EXISTS public.site_content (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    key TEXT UNIQUE NOT NULL,
    value_json JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Clients (Users Ordering)
CREATE TABLE IF NOT EXISTS public.clients (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Real Orders
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
    order_code TEXT UNIQUE NOT NULL,
    product_name TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    size TEXT NOT NULL,
    bahan TEXT,
    kerah TEXT,
    notes TEXT,
    price_per_unit NUMERIC NOT NULL,
    total_price NUMERIC NOT NULL,
    dp_amount NUMERIC DEFAULT 0,
    remaining_amount NUMERIC DEFAULT 0,
    sizes JSONB DEFAULT '[]'::jsonb,
    design_urls JSONB DEFAULT '[]'::jsonb,
    logo_urls JSONB DEFAULT '[]'::jsonb,
    status TEXT DEFAULT 'pending_payment', -- pending_payment, pending_verification, paid, diproses, selesai, dibatalkan
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Invoices
CREATE TABLE IF NOT EXISTS public.invoices (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    invoice_number TEXT UNIQUE NOT NULL,
    subtotal NUMERIC NOT NULL,
    discount NUMERIC DEFAULT 0,
    grand_total NUMERIC NOT NULL,
    payment_status TEXT DEFAULT 'unpaid', -- unpaid, paid
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Payment Methods
CREATE TABLE IF NOT EXISTS public.payment_methods (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    icon_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Payments (Proofs)
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
    method TEXT NOT NULL,
    proof_url TEXT NOT NULL,
    status TEXT DEFAULT 'pending_verification', -- pending_verification, verified, rejected
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    verified_at TIMESTAMP WITH TIME ZONE,
    verified_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Master Data: Bahan Jersey
CREATE TABLE IF NOT EXISTS public.bahan_jersey (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    additional_price NUMERIC DEFAULT 0,
    image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Master Data: Model Kerah
CREATE TABLE IF NOT EXISTS public.model_kerah (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    additional_price NUMERIC DEFAULT 0,
    image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Jersey Players
CREATE TABLE IF NOT EXISTS public.jersey_players (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    player_name TEXT NOT NULL,
    player_number TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Info Page: Materials
CREATE TABLE IF NOT EXISTS public.page_materials (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    pros_list TEXT[] DEFAULT '{}',
    badge_text TEXT,
    badge_color TEXT,
    border_color TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Info Page: Collars
CREATE TABLE IF NOT EXISTS public.page_collars (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    is_popular BOOLEAN DEFAULT false,
    icon_svg_type TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Info Page: Fonts
CREATE TABLE IF NOT EXISTS public.page_fonts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    css_style_json JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Info Page: Size Chart
CREATE TABLE IF NOT EXISTS public.page_size_chart (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    size_label TEXT NOT NULL UNIQUE,
    width_cm NUMERIC NOT NULL,
    length_cm NUMERIC NOT NULL,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Vendor Sublim: Categories
CREATE TABLE IF NOT EXISTS public.vendor_sublim_kategori (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    image_url TEXT NOT NULL,
    tags TEXT[] DEFAULT '{}',
    is_wide BOOLEAN DEFAULT false,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Vendor Sublim: Advantages
CREATE TABLE IF NOT EXISTS public.vendor_sublim_keunggulan (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    icon_type TEXT NOT NULL,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Setup Storage Bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('vorvox-assets', 'vorvox-assets', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) VALUES ('payment-proofs', 'payment-proofs', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hero_slides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_collars ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_fonts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_size_chart ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_sublim_kategori ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_sublim_keunggulan ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bahan_jersey ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.model_kerah ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jersey_players ENABLE ROW LEVEL SECURITY;

-- Allow Public Read Access
CREATE POLICY "Enable read access for all users" ON public.products FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON public.portfolio FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON public.hero_slides FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON public.site_content FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON public.page_materials FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON public.page_collars FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON public.page_fonts FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON public.page_size_chart FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON public.vendor_sublim_kategori FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON public.vendor_sublim_keunggulan FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON public.payment_methods FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON public.bahan_jersey FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON public.model_kerah FOR SELECT USING (true);

-- Clients can insert themselves
CREATE POLICY "Enable insert for public" ON public.clients FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable select for public" ON public.clients FOR SELECT USING (true);

-- Orders: public can insert and select their own (though in real world, use auth.uid, here we relax for demo)
CREATE POLICY "Enable insert for public" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable select for public" ON public.orders FOR SELECT USING (true);

-- Invoices: public can insert and select
CREATE POLICY "Enable insert for public" ON public.invoices FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable select for public" ON public.invoices FOR SELECT USING (true);

-- Payments: public can insert and select
CREATE POLICY "Enable insert for public" ON public.payments FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable select for public" ON public.payments FOR SELECT USING (true);

-- Jersey Players: public can insert and select
CREATE POLICY "Enable insert for public" ON public.jersey_players FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable select for public" ON public.jersey_players FOR SELECT USING (true);

-- Allow Authenticated (Admins) Full Access
CREATE POLICY "Enable ALL for authenticated users" ON public.products FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Enable ALL for authenticated users" ON public.portfolio FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Enable ALL for authenticated users" ON public.hero_slides FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Enable ALL for authenticated users" ON public.site_content FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Enable ALL for authenticated users" ON public.clients FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Enable ALL for authenticated users" ON public.orders FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Enable ALL for authenticated users" ON public.invoices FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Enable ALL for authenticated users" ON public.page_materials FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Enable ALL for authenticated users" ON public.page_collars FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Enable ALL for authenticated users" ON public.page_fonts FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Enable ALL for authenticated users" ON public.page_size_chart FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Enable ALL for authenticated users" ON public.vendor_sublim_kategori FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Enable ALL for authenticated users" ON public.vendor_sublim_keunggulan FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Enable ALL for authenticated users" ON public.payment_methods FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Enable ALL for authenticated users" ON public.payments FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Enable ALL for authenticated users" ON public.bahan_jersey FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Enable ALL for authenticated users" ON public.model_kerah FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Enable ALL for authenticated users" ON public.jersey_players FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Storage bucket policies
-- Drop existing policies first to prevent "already exists" errors when re-running
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Admin Insert" ON storage.objects;
DROP POLICY IF EXISTS "Admin Update" ON storage.objects;
DROP POLICY IF EXISTS "Admin Delete" ON storage.objects;

-- Allow public read access to files
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id IN ('vorvox-assets', 'payment-proofs'));
-- Allow authenticated users to upload, update, delete files
CREATE POLICY "Admin Insert" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id IN ('vorvox-assets', 'payment-proofs'));
CREATE POLICY "Admin Update" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id IN ('vorvox-assets', 'payment-proofs'));
CREATE POLICY "Admin Delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id IN ('vorvox-assets', 'payment-proofs'));
-- Allow public insert to payment-proofs (for clients uploading receipts)
CREATE POLICY "Public Insert Payment Proof" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'payment-proofs');
-- Allow public insert to vorvox-assets for design/logo uploads during ordering
CREATE POLICY "Public Insert Assets" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'vorvox-assets');

-- 4. Insert Initial Dummy/Starter Data

-- Size Chart
INSERT INTO public.page_size_chart (size_label, width_cm, length_cm, order_index) VALUES
('S', 46, 69, 1),
('M', 49, 72, 2),
('L', 52, 75, 3),
('XL', 55, 78, 4),
('2XL', 58, 81, 5),
('3XL', 61, 84, 6),
('4XL', 64, 87, 7),
('5XL', 67, 90, 8),
('6XL', 70, 93, 9)
ON CONFLICT (size_label) DO NOTHING;

-- Fonts
INSERT INTO public.page_fonts (name, css_style_json) VALUES
('Block Bold', '{"fontWeight": 900, "letterSpacing": "-0.02em", "fontFamily": "Impact, sans-serif"}'),
('College', '{"fontWeight": 800, "letterSpacing": "0.05em", "fontFamily": "\"Arial Black\", sans-serif"}'),
('Italic Bold', '{"fontWeight": 800, "fontStyle": "italic", "letterSpacing": "0.02em"}'),
('Outline', '{"color": "transparent", "fontWeight": 900, "letterSpacing": "0.04em", "WebkitTextStroke": "2px white"}'),
('Rounded', '{"fontWeight": 700, "fontFamily": "\"Trebuchet MS\", sans-serif", "letterSpacing": "0.08em"}'),
('Serif Classic', '{"fontWeight": 700, "fontFamily": "\"Georgia\", serif", "letterSpacing": "0.01em"}'),
('Script / Italic', '{"fontStyle": "italic", "fontWeight": 600, "fontFamily": "\"Palatino Linotype\", serif", "letterSpacing": "0.02em"}'),
('Condensed', '{"transform": "scaleX(0.8)", "fontWeight": 900, "display": "inline-block", "letterSpacing": "-0.04em"}'),
('Wide', '{"fontWeight": 700, "letterSpacing": "0.2em"}');

-- Site Content (Stats)
INSERT INTO public.site_content (key, value_json, description) VALUES
('home_stats', '[{"raw": 10000, "label": "Jersey Diproduksi", "suffix": "+", "prefix": ""}, {"raw": 500, "label": "Klien Puas", "suffix": "+", "prefix": ""}, {"raw": 100, "label": "QC Ketat", "suffix": "%", "prefix": ""}, {"raw": 24, "label": "Jam Respon", "suffix": "h", "prefix": ""}]', 'Statistik di halaman beranda')
ON CONFLICT (key) DO NOTHING;

-- Orders
-- Dummy orders removed to prevent foreign key errors without clear clients,
-- we'll rely on the new system to populate this.

-- Products
INSERT INTO public.products (title, slug, short_desc, full_desc, icon_type, badge, tags, image_url) VALUES
('Jersey Futsal', 'jersey-futsal', 'Full printing dye-sublimation dengan bahan polyester halus dan ringan. Anti-luntur, cepat kering.', 'Ini adalah deskripsi lengkap Jersey Futsal. Jersey ini dibuat dengan bahan drifit premium dari hasil printing sublimasi tingkat tinggi.', 'Zap', 'Terlaris', '{"futsal", "jersey", "printing"}', 'https://images.unsplash.com/photo-1552667466-07770ae110d0?auto=format&fit=crop&q=80&w=800'),
('Jersey Bola', 'jersey-bola', 'Material grade-A moisture-wicking. Cocok untuk tim amatir, akademi, hingga klub profesional.', 'Deskripsi lengkap Jersey Bola. Cocok untuk klub amatir maupun liga 1.', 'Star', null, '{"bola", "jersey", "sepak bola"}', 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80&w=800'),
('Vendor Sublim', 'vendor-sublim', 'Printing dye-sublimation tekstil: jersey, seragam, hijab.', 'Layanan vendor sublim terpercaya. Kami melayani cetak kain partai besar dan kecil.', 'Zap', 'Baru', '{"sublim", "printing", "textile"}', 'https://lh3.googleusercontent.com/d/1LzUcdSHmsJw_iVcGhSFTzlm5VL4pa_sW');

-- Portfolio
INSERT INTO public.portfolio (name, category, image_url) VALUES
('FC Persada Futsal', 'Jersey Futsal', 'https://images.unsplash.com/photo-1552667466-07770ae110d0?auto=format&fit=crop&q=80&w=1200'),
('Akademi Bola Muda', 'Jersey Bola', 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80&w=1200');

-- Hero Slides
INSERT INTO public.hero_slides (headline, sub_headline, description, image_url, cta_link, order_index) VALUES
('JERSEY FUTSAL', 'PREMIUM.', 'Full printing dye-sublimation, bahan polyester adem & ringan. Cocok untuk tim futsal amatir hingga profesional.', 'https://images.unsplash.com/photo-1552667466-07770ae110d0?auto=format&fit=crop&q=80&w=1600', 'services', 1),
('JERSEY BOLA', 'KELAS DUNIA.', 'Material grade-A moisture-wicking. Produksi massal dengan desain custom penuh untuk tim kamu.', 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80&w=1600', 'services', 2);
