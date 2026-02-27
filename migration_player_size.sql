-- Copy and paste this script into your Supabase SQL Editor to run it

ALTER TABLE public.jersey_players
ADD COLUMN IF NOT EXISTS player_size TEXT;
