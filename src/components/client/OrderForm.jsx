import React, { useState, useEffect } from 'react';
import { Loader2, Plus } from 'lucide-react';
import { createOrderWithInvoice } from '../../services/api';

// Konfigurasi Harga Dasar (Ini bisa diambil dari DB jika mau fully dynamic)
// Untuk MVP, hardcode di komponen lebih aman jika belum ada tabel settings khusus.
const BASE_PRICES = {
    'Jersey Futsal': 150000,
    'Jersey Bola': 150000,
    'Vendor Sublim': 120000,
    'Seragam Kantor': 180000,
    'Kaos Event': 85000,
};

export default function OrderForm({ clientId, onOrderSuccess }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [productName, setProductName] = useState('Jersey Futsal');
    const [quantity, setQuantity] = useState(1);
    const [size, setSize] = useState('L');
    const [bahan, setBahan] = useState('Dryfit Milano');
    const [kerah, setKerah] = useState('O-Neck');
    const [notes, setNotes] = useState('');

    // State Kalkulasi (Read-only otomatis)
    const [pricePerUnit, setPricePerUnit] = useState(0);
    const [totalPrice, setTotalPrice] = useState(0);

    // Auto-calculate logic
    useEffect(() => {
        const base = BASE_PRICES[productName] || 150000;
        // Misalkan kerah V-Neck tambah 5000:
        let extra = 0;
        if (kerah === 'V-Neck') extra += 5000;

        const finalUnitPrice = base + extra;
        const total = finalUnitPrice * quantity;

        setPricePerUnit(finalUnitPrice);
        setTotalPrice(total);
    }, [productName, quantity, kerah]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (quantity < 1) {
            setError('Jumlah minimal pesanan adalah 1 pcs.');
            setLoading(false);
            return;
        }

        const orderData = {
            client_id: clientId,
            product_name: productName,
            quantity: Number(quantity),
            size,
            bahan,
            kerah,
            notes,
            price_per_unit: pricePerUnit,
            total_price: totalPrice
        };

        try {
            await createOrderWithInvoice(orderData);
            onOrderSuccess(); // trigger list fetching di parent

            // Reset form sederhana
            setQuantity(1);
            setNotes('');
        } catch (err) {
            setError(err.message || 'Gagal mengirim pesanan');
        } finally {
            setLoading(false);
        }
    };

    const formatRp = (num) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);

    return (
        <div className="bg-neutral-900 border border-neutral-800 p-6">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-neutral-800">
                <h2 className="text-xl font-bold uppercase tracking-widest text-white">Buat Pesanan Baru</h2>
                <div className="p-2 bg-neutral-800 text-neutral-400 rounded-full"><Plus size={20} /></div>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-900/20 border border-red-900 text-red-400 text-sm">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest mb-2">Jenis Produk</label>
                        <select
                            className="w-full bg-black border border-neutral-800 text-white p-3 outline-none focus:border-neutral-500"
                            value={productName} onChange={(e) => setProductName(e.target.value)}
                        >
                            {Object.keys(BASE_PRICES).map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest mb-2">Jumlah (Qty)</label>
                        <input
                            type="number" min="1" required
                            className="w-full bg-black border border-neutral-800 text-white p-3 outline-none focus:border-neutral-500"
                            value={quantity} onChange={(e) => setQuantity(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest mb-2">Ukuran Dominan / Default</label>
                        <select
                            className="w-full bg-black border border-neutral-800 text-white p-3 outline-none focus:border-neutral-500"
                            value={size} onChange={(e) => setSize(e.target.value)}
                        >
                            {['S', 'M', 'L', 'XL', '2XL', '3XL', 'Custom Detail'].map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest mb-2">Pilihan Bahan</label>
                        <select
                            className="w-full bg-black border border-neutral-800 text-white p-3 outline-none focus:border-neutral-500"
                            value={bahan} onChange={(e) => setBahan(e.target.value)}
                        >
                            {['Dryfit Milano', 'Serena', 'Brazil', 'Bintik', 'Polyester Standar'].map(b => <option key={b} value={b}>{b}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest mb-2">Model Kerah</label>
                        <select
                            className="w-full bg-black border border-neutral-800 text-white p-3 outline-none focus:border-neutral-500"
                            value={kerah} onChange={(e) => setKerah(e.target.value)}
                        >
                            {['O-Neck', 'V-Neck', 'Polo Collar', 'Oblong Rib'].map(k => <option key={k} value={k}>{k}</option>)}
                        </select>
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest mb-2">Catatan Tambahan (Nama Tim, Logo, dll)</label>
                        <textarea
                            rows="3"
                            className="w-full bg-black border border-neutral-800 text-white p-3 outline-none focus:border-neutral-500"
                            placeholder="Tuliskan detail logo sponsor, daftar nomor pemain, atau keterangan lainnya disini..."
                            value={notes} onChange={(e) => setNotes(e.target.value)}
                        />
                    </div>
                </div>

                {/* Kalkulator Realtime UI */}
                <div className="bg-black p-6 border border-neutral-800">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-neutral-500 border-b border-neutral-800 pb-2 mb-4">Estimasi Biaya</h3>
                    <div className="flex justify-between items-center text-sm mb-2">
                        <span className="text-neutral-400">Harga per Pcs</span>
                        <span className="text-white font-mono">{formatRp(pricePerUnit)}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm mb-4">
                        <span className="text-neutral-400">Kuantitas</span>
                        <span className="text-white font-mono">x {quantity}</span>
                    </div>
                    <div className="flex justify-between items-center pt-4 border-t border-dashed border-neutral-700">
                        <span className="text-white font-bold uppercase tracking-widest">Total Harga</span>
                        <span className="text-xl font-black text-white">{formatRp(totalPrice)}</span>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-white text-black py-4 font-bold uppercase tracking-widest hover:bg-neutral-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                    {loading ? <Loader2 className="animate-spin" size={20} /> : 'Buat Pesanan & Terbitkan Invoice'}
                </button>
            </form>
        </div>
    );
}
