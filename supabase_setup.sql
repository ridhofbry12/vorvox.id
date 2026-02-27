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
DROP TABLE IF EXISTS public.orders CASCADE;
DROP TABLE IF EXISTS public.page_materials CASCADE;
DROP TABLE IF EXISTS public.page_collars CASCADE;
DROP TABLE IF EXISTS public.page_fonts CASCADE;
DROP TABLE IF EXISTS public.page_size_chart CASCADE;
DROP TABLE IF EXISTS public.vendor_sublim_kategori CASCADE;
DROP TABLE IF EXISTS public.vendor_sublim_keunggulan CASCADE;

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

-- Admin Orders (Dummy Data Replacement)
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id_string TEXT NOT NULL,
    client_name TEXT NOT NULL,
    order_type TEXT NOT NULL,
    qty INTEGER NOT NULL,
    order_date DATE NOT NULL,
    status TEXT NOT NULL,
    total TEXT NOT NULL,
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

-- 3. Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hero_slides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_collars ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_fonts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_size_chart ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_sublim_kategori ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_sublim_keunggulan ENABLE ROW LEVEL SECURITY;

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
-- Orders strictly admin only, no public select:
-- (Assuming authenticated users using Google OAuth are admins based on App.jsx logic)
CREATE POLICY "Enable select for authenticated users only" ON public.orders FOR SELECT TO authenticated USING (true);

-- Allow Authenticated (Admins) Full Access
CREATE POLICY "Enable ALL for authenticated users" ON public.products FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Enable ALL for authenticated users" ON public.portfolio FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Enable ALL for authenticated users" ON public.hero_slides FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Enable ALL for authenticated users" ON public.site_content FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Enable ALL for authenticated users" ON public.orders FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Enable ALL for authenticated users" ON public.page_materials FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Enable ALL for authenticated users" ON public.page_collars FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Enable ALL for authenticated users" ON public.page_fonts FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Enable ALL for authenticated users" ON public.page_size_chart FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Enable ALL for authenticated users" ON public.vendor_sublim_kategori FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Enable ALL for authenticated users" ON public.vendor_sublim_keunggulan FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Storage bucket policies
-- Allow public read access to files
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'vorvox-assets');
-- Allow authenticated users to upload, update, delete files
CREATE POLICY "Admin Insert" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'vorvox-assets');
CREATE POLICY "Admin Update" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'vorvox-assets');
CREATE POLICY "Admin Delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'vorvox-assets');

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
INSERT INTO public.orders (order_id_string, client_name, order_type, qty, order_date, status, total) VALUES
('#ORD-001', 'PT. Teknologi Maju', 'Seragam Kantor', 50, '2026-02-10', 'Pending', 'Rp 7.500.000'),
('#ORD-002', 'Komunitas Motor BDG', 'Hoodie Zipper', 24, '2026-02-12', 'Processing', 'Rp 4.800.000'),
('#ORD-003', 'Cafe Senja', 'Apron Canvas', 15, '2026-02-14', 'Completed', 'Rp 2.250.000');

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
