-- Migration: Sublim & DTF Enhancements
-- Run in Supabase SQL Editor

-- 1. Core columns (from original migration)
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS order_type TEXT DEFAULT 'jersey';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS meter_qty NUMERIC DEFAULT 0;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS fabric_source TEXT DEFAULT '';

-- 2. NEW: Sub-category column (sublim vs dtf)
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS sublim_category TEXT DEFAULT '';

-- 3. Updated sublim pricing (separate sublim/dtf prices + configurable DP)
INSERT INTO public.site_content (key, value_json, description)
VALUES (
    'sublim_pricing',
    '{"sublim_per_meter": 35000, "dtf_per_meter": 25000, "fabric_vorvox_extra": 15000, "dp_percentage": 50}'::jsonb,
    'Harga terpisah Sublim & DTF per meter + DP'
)
ON CONFLICT (key)
DO UPDATE SET value_json = EXCLUDED.value_json;
