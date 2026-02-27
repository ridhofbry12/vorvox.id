import React, { useState } from 'react';
import { Loader2, ArrowRight } from 'lucide-react';
import { registerOrLoginClient } from '../../services/api';

export default function ClientLoginForm({ onLoginSuccess }) {
    const [formData, setFormData] = useState({ name: '', email: '', phone: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Coba ambil dari DB atau buat baru
            const clientData = await registerOrLoginClient(formData);

            // Panggil callback parent (untuk save ke hook session)
            onLoginSuccess(clientData);
        } catch (err) {
            setError(err.message || 'Terjadi kesalahan saat menghubungi server.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md mx-auto bg-neutral-900 border border-neutral-800 p-8 shadow-2xl">
            <div className="text-center mb-10">
                <h1 className="text-2xl font-black text-white tracking-tighter mb-2">
                    IDENTIFIKASI <span className="text-neutral-500">KLIEN</span>
                </h1>
                <p className="text-neutral-500 text-sm">Silakan masukkan data Anda untuk melanjutkan pesanan atau melihat riwayat pesanan.</p>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-900/20 border border-red-900 text-red-400 text-sm">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest mb-2">Nama Lengkap</label>
                    <input
                        type="text"
                        required
                        className="w-full bg-black border border-neutral-800 text-white p-3 outline-none focus:border-neutral-500 transition-colors"
                        placeholder="Nama Anda atau Tim"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest mb-2">Email</label>
                    <input
                        type="email"
                        required
                        className="w-full bg-black border border-neutral-800 text-white p-3 outline-none focus:border-neutral-500 transition-colors"
                        placeholder="email@contoh.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest mb-2">No. WhatsApp</label>
                    <input
                        type="tel"
                        required
                        className="w-full bg-black border border-neutral-800 text-white p-3 outline-none focus:border-neutral-500 transition-colors"
                        placeholder="08123456789"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                </div>

                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-white text-black py-4 font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-neutral-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? <Loader2 className="animate-spin" size={20} /> : 'Lanjutkan Pemesanan'}
                        {!loading && <ArrowRight size={18} />}
                    </button>
                </div>
            </form>
        </div>
    );
}
