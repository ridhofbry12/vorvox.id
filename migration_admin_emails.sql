-- Jalankan di Supabase SQL Editor untuk menambahkan daftar admin ke database
-- Ini digunakan oleh halaman Pengaturan > Manajemen Admin

INSERT INTO public.site_content (key, value_json, description)
VALUES (
    'admin_emails',
    '["mifahmi788@gmail.com", "ridhofebriyansyah75@gmail.com"]'::jsonb,
    'Daftar email yang diizinkan login ke admin panel'
)
ON CONFLICT (key)
DO UPDATE SET value_json = EXCLUDED.value_json;
