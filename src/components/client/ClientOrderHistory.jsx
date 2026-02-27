import React, { useEffect, useState } from 'react';
import { Loader2, Receipt, SearchX } from 'lucide-react';
import { getClientOrders } from '../../services/api';

export default function ClientOrderHistory({ clientId, refreshTrigger }) {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchOrders = async () => {
            setLoading(true);
            try {
                const data = await getClientOrders(clientId);
                setOrders(data || []);
            } catch (err) {
                setError(err.message || 'Gagal memuat riwayat.');
            } finally {
                setLoading(false);
            }
        };

        if (clientId) fetchOrders();
    }, [clientId, refreshTrigger]);

    const formatRp = (num) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);

    const getStatusStyle = (status) => ({
        pending: 'bg-yellow-900/30 text-yellow-500 border-yellow-900',
        diproses: 'bg-blue-900/30 text-blue-400 border-blue-900',
        selesai: 'bg-green-900/30 text-green-400 border-green-900',
        dibatalkan: 'bg-red-900/30 text-red-500 border-red-900',
    }[status] || 'bg-neutral-800 text-neutral-400 border-neutral-700');

    if (loading) {
        return (
            <div className="bg-neutral-900 border border-neutral-800 p-6 flex justify-center items-center py-20">
                <Loader2 className="animate-spin text-white" size={24} />
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-neutral-900 border border-neutral-800 p-6 text-red-400 text-sm">
                {error}
            </div>
        );
    }

    if (orders.length === 0) {
        return (
            <div className="bg-neutral-900 border border-neutral-800 p-12 flex flex-col items-center justify-center text-center">
                <SearchX size={48} className="text-neutral-700 mb-4" />
                <h3 className="text-white font-bold uppercase tracking-widest mb-2">Belum Ada Pesanan</h3>
                <p className="text-neutral-500 text-sm">Anda belum membuat pesanan apapun. Pesanan baru akan muncul di sini.</p>
            </div>
        );
    }

    return (
        <div className="bg-neutral-900 border border-neutral-800">
            <div className="p-6 border-b border-neutral-800 flex items-center gap-3">
                <Receipt size={20} className="text-neutral-400" />
                <h2 className="text-xl font-bold uppercase tracking-widest text-white">Riwayat Pemesanan & Invoice</h2>
            </div>

            <div className="divide-y divide-neutral-800">
                {orders.map(order => {
                    const invoice = order.invoices?.[0]; // ambil invoice pertama (karena 1-to-1)

                    return (
                        <div key={order.id} className="p-6 hover:bg-black/30 transition-colors">
                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="text-white font-mono font-bold tracking-widest">{order.order_code}</span>
                                        <span className={`px-2 py-0.5 text-[10px] uppercase font-bold tracking-widest border ${getStatusStyle(order.status)}`}>
                                            {order.status}
                                        </span>
                                    </div>
                                    <h3 className="text-lg font-black uppercase text-neutral-300">{order.product_name}</h3>
                                    <p className="text-neutral-500 text-sm mt-1">Tanggal: {new Date(order.created_at).toLocaleDateString('id-ID')}</p>
                                </div>
                                <div className="text-left md:text-right">
                                    <div className="text-xs uppercase text-neutral-500 font-bold tracking-widest mb-1">Total Tagihan</div>
                                    <div className="text-xl font-black text-white">{formatRp(order.total_price)}</div>
                                </div>
                            </div>

                            <div className="bg-black p-4 border border-neutral-800 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mt-4">
                                <div>
                                    <div className="text-neutral-500 text-xs uppercase mb-1">Qty</div>
                                    <div className="text-white font-bold">{order.quantity} pcs</div>
                                </div>
                                <div>
                                    <div className="text-neutral-500 text-xs uppercase mb-1">Ukuran</div>
                                    <div className="text-white font-bold">{order.size}</div>
                                </div>
                                <div>
                                    <div className="text-neutral-500 text-xs uppercase mb-1">Bahan</div>
                                    <div className="text-white font-bold">{order.bahan}</div>
                                </div>
                                <div>
                                    <div className="text-neutral-500 text-xs uppercase mb-1">Kerah</div>
                                    <div className="text-white font-bold">{order.kerah}</div>
                                </div>
                            </div>

                            {/* Section Invoice Jika Ada */}
                            {invoice && (
                                <div className="mt-4 flex items-center justify-between border-t border-dashed border-neutral-700 pt-4">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-xs uppercase text-neutral-500 font-bold tracking-widest">No. Invoice</span>
                                        <span className="text-white font-mono text-sm">{invoice.invoice_number}</span>
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                        <span className="text-xs uppercase text-neutral-500 font-bold tracking-widest">Status Bayar</span>
                                        <span className={`text-xs font-bold uppercase tracking-wider ${invoice.payment_status === 'paid' ? 'text-green-400' : 'text-yellow-500'}`}>
                                            {invoice.payment_status}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
