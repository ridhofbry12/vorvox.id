-- Migration: Add Sublim & DTF support to orders table
-- Run this in Supabase SQL Editor

-- 1. Add new columns to orders table
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS order_type TEXT DEFAULT 'jersey';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS meter_qty NUMERIC DEFAULT 0;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS fabric_source TEXT DEFAULT '';

-- 2. Seed sublim pricing in site_content
INSERT INTO public.site_content (key, value_json, description)
VALUES (
    'sublim_pricing',
    '{"price_per_meter": 35000, "fabric_vorvox_extra": 15000}'::jsonb,
    'Harga per meter untuk layanan Sublim & DTF'
)
ON CONFLICT (key)
DO UPDATE SET value_json = EXCLUDED.value_json;
