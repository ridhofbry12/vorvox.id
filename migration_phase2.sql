-- Migration Phase 2: Add missing columns to orders table

ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS dp_amount NUMERIC DEFAULT 0;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS remaining_amount NUMERIC DEFAULT 0;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS sizes JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS design_urls JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS logo_urls JSONB DEFAULT '[]'::jsonb;

-- Also ensure invoices table has payment_status if missing
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'unpaid';

-- Fix RLS Policies for Phase 2 Client Ordering
-- Ensure anonymous/public can insert clients and orders
DROP POLICY IF EXISTS "Enable insert for public" ON public.clients;
CREATE POLICY "Enable insert for public" ON public.clients FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Enable insert for public" ON public.orders;
CREATE POLICY "Enable insert for public" ON public.orders FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Enable insert for public" ON public.invoices;
CREATE POLICY "Enable insert for public" ON public.invoices FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Enable insert for public" ON public.jersey_players;
CREATE POLICY "Enable insert for public" ON public.jersey_players FOR INSERT WITH CHECK (true);
