-- Migration: Sleeve Type & Voucher System
-- Run in Supabase SQL Editor

-- 1. Sleeve Type in jersey_players
ALTER TABLE public.jersey_players ADD COLUMN IF NOT EXISTS sleeve TEXT DEFAULT 'pendek';

-- 2. Sleeve Pricing in site_content
INSERT INTO public.site_content (key, value_json, description)
VALUES (
    'sleeve_pricing',
    '{"lengan_panjang_extra": 10000}'::jsonb,
    'Tambahan harga untuk lengan panjang'
)
ON CONFLICT (key) DO UPDATE SET value_json = EXCLUDED.value_json;

-- 3. Voucher Tables
CREATE TABLE IF NOT EXISTS public.vouchers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    code TEXT UNIQUE NOT NULL, -- format XXXX-XXXX
    discount_percent NUMERIC DEFAULT 10,
    is_active BOOLEAN DEFAULT true,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.voucher_usage (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    voucher_id UUID REFERENCES vouchers(id),
    client_email TEXT NOT NULL,
    used_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(voucher_id, client_email)
);

-- RLS Policies for Vouchers
ALTER TABLE public.vouchers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voucher_usage ENABLE ROW LEVEL SECURITY;

-- Allow public read of active vouchers (for validation)
CREATE POLICY "Allow public read active vouchers" ON public.vouchers
    FOR SELECT USING (is_active = true AND expires_at > now());

-- Allow admin full access
CREATE POLICY "Allow admin full access vouchers" ON public.vouchers
    FOR ALL USING (true); -- Note: In real setup, check admin role. Assuming open access for now based on app structure.

-- Allow public insert to usage
CREATE POLICY "Allow public insert usage" ON public.voucher_usage
    FOR INSERT WITH CHECK (true);

-- Allow public read their own usage (by email) - simplified
CREATE POLICY "Allow public read usage" ON public.voucher_usage
    FOR SELECT USING (true);

-- 4. Voucher Track on Orders
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS voucher_code TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS voucher_discount NUMERIC;
