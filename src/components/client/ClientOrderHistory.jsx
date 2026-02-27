import React, { useEffect, useState } from 'react';
import { Loader2, Receipt, SearchX, Upload, CreditCard } from 'lucide-react';
import { getClientOrders } from '../../services/api';
import { supabase } from '../../supabase';

// Helper compress (sama seperti di OrderForm)
const compressImage = (file, maxSizeKb = 200) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;
                const maxDim = 1200;
                if (width > height && width > maxDim) {
                    height *= maxDim / width;
                    width = maxDim;
                } else if (height > maxDim) {
                    width *= maxDim / height;
                    height = maxDim;
                }
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                let quality = 0.9;
                let dataUrl = canvas.toDataURL('image/jpeg', quality);
                const reduceQuality = () => {
                    const sizeKb = Math.round((dataUrl.length * 3) / 4 / 1024);
                    if (sizeKb > maxSizeKb && quality > 0.1) {
                        quality -= 0.1;
                        dataUrl = canvas.toDataURL('image/jpeg', quality);
                        reduceQuality();
                    } else {
                        fetch(dataUrl).then(res => res.blob()).then(blob => resolve(new File([blob], file.name.replace(/\.[^/.]+$/, ".jpg"), { type: 'image/jpeg' })));
                    }
                };
                reduceQuality();
            };
        };
        reader.onerror = error => reject(error);
    });
};

export default function ClientOrderHistory({ clientId, refreshTrigger }) {
    const [orders, setOrders] = useState([]);
    const [paymentMethods, setPaymentMethods] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const data = await getClientOrders(clientId);
            setOrders(data || []);

            const { data: pmData } = await supabase.from('payment_methods').select('*').eq('is_active', true);
            setPaymentMethods(pmData || []);
        } catch (err) {
            setError(err.message || 'Gagal memuat riwayat.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (clientId) fetchOrders();
    }, [clientId, refreshTrigger]);

    const formatRp = (num) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);

    const getStatusStyle = (status) => ({
        pending_payment: 'bg-yellow-900/30 text-yellow-500 border-yellow-900',
        pending_verification: 'bg-blue-900/30 text-blue-400 border-blue-900',
        paid: 'bg-green-900/30 text-green-400 border-green-900',
        diproses: 'bg-purple-900/30 text-purple-400 border-purple-900',
        selesai: 'bg-emerald-900/30 text-emerald-400 border-emerald-900',
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
        return <div className="bg-neutral-900 border border-neutral-800 p-6 text-red-400 text-sm">{error}</div>;
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
                <h2 className="text-xl font-bold uppercase tracking-widest text-white">Riwayat & Pembayaran</h2>
            </div>

            <div className="divide-y divide-neutral-800">
                {orders.map(order => (
                    <OrderItem
                        key={order.id}
                        order={order}
                        clientId={clientId}
                        paymentMethods={paymentMethods}
                        formatRp={formatRp}
                        getStatusStyle={getStatusStyle}
                        onUploadSuccess={fetchOrders}
                    />
                ))}
            </div>
        </div>
    );
}

const OrderItem = ({ order, clientId, paymentMethods, formatRp, getStatusStyle, onUploadSuccess }) => {
    const [uploading, setUploading] = useState(false);
    const [selectedMethod, setSelectedMethod] = useState(paymentMethods[0]?.name || '');
    const [proofFile, setProofFile] = useState(null);

    const invoice = order.invoices?.[0];

    const handleUploadClick = async () => {
        if (!proofFile) return alert('Pilih file bukti transfer terlebih dahulu');
        if (!selectedMethod) return alert('Pilih metode pembayaran');

        setUploading(true);
        try {
            // Compress
            const compressed = await compressImage(proofFile, 200);

            // Upload to Supabase Storage
            const ext = compressed.name.split('.').pop();
            const fileName = `${clientId}_${order.id}_${Date.now()}.${ext}`;
            const path = `${fileName}`;

            const { data, error: uploadErr } = await supabase.storage.from('payment-proofs').upload(path, compressed);
            if (uploadErr) throw uploadErr;

            const { data: publicUrlData } = supabase.storage.from('payment-proofs').getPublicUrl(path);
            const proofUrl = publicUrlData.publicUrl;

            // Insert to payments table
            const { error: dbErr } = await supabase.from('payments').insert([{
                order_id: order.id,
                client_id: clientId,
                method: selectedMethod,
                proof_url: proofUrl,
                status: 'pending_verification'
            }]);
            if (dbErr) throw dbErr;

            // Update order status
            const { error: updateErr } = await supabase.from('orders').update({ status: 'pending_verification' }).eq('id', order.id);
            if (updateErr) throw updateErr;

            alert('Bukti pembayaran berhasil diunggah! Menunggu verifikasi admin.');
            onUploadSuccess();

        } catch (err) {
            console.error(err);
            alert('Gagal mengupload bukti pembayaran: ' + err.message);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="p-6 hover:bg-black/30 transition-colors">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <span className="text-white font-mono font-bold tracking-widest">{order.order_code}</span>
                        <span className={`px-2 py-0.5 text-[10px] uppercase font-bold tracking-widest border ${getStatusStyle(order.status)}`}>
                            {order.status.replace('_', ' ')}
                        </span>
                    </div>
                    <h3 className="text-lg font-black uppercase text-neutral-300">{order.product_name}</h3>
                    <p className="text-neutral-500 text-sm mt-1">Tanggal: {new Date(order.created_at).toLocaleDateString('id-ID')}</p>
                </div>
                <div className="text-left md:text-right">
                    <div className="text-xs uppercase text-neutral-500 font-bold tracking-widest mb-1">Grand Total Tagihan</div>
                    <div className="text-xl font-black text-white">{formatRp(order.total_price)}</div>
                </div>
            </div>

            <div className="bg-black p-4 border border-neutral-800 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mt-4">
                <div>
                    <div className="text-neutral-500 text-xs uppercase mb-1">Qty</div>
                    <div className="text-white font-bold">{order.quantity} pcs</div>
                </div>
                <div>
                    <div className="text-neutral-500 text-xs uppercase mb-1">Total DP</div>
                    <div className="text-white font-bold text-red-400">{formatRp(order.dp_amount || 0)}</div>
                </div>
                <div>
                    <div className="text-neutral-500 text-xs uppercase mb-1">Sisa Bayar</div>
                    <div className="text-white font-bold">{formatRp(order.remaining_amount || 0)}</div>
                </div>
                <div>
                    <div className="text-neutral-500 text-xs uppercase mb-1">Bahan & Kerah</div>
                    <div className="text-white font-bold text-xs truncate" title={`${order.bahan} | ${order.kerah}`}>{order.bahan} | {order.kerah}</div>
                </div>
            </div>

            {/* Jika Status Pending Payment -> Form Upload Bukti */}
            {order.status === 'pending_payment' && (
                <div className="mt-6 border border-neutral-700 bg-neutral-800/30 p-5">
                    <h4 className="text-white font-bold uppercase tracking-widest text-sm flex items-center gap-2 mb-4">
                        <CreditCard size={16} className="text-red-400" /> Instruksi Pembayaran DP
                    </h4>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <p className="text-neutral-400 text-xs mb-3">Silakan transfer sejumlah <b>{formatRp(order.dp_amount || 0)}</b> ke salah satu rekening berikut:</p>
                            <div className="space-y-4">
                                {paymentMethods.map(pm => (
                                    <div key={pm.id} className="flex flex-col items-center gap-4 bg-black p-5 border border-neutral-800 text-center">
                                        {pm.icon_url ? (
                                            <div className="w-64 h-64 md:w-32 md:h-32 bg-white rounded-lg p-3 flex items-center justify-center shrink-0 shadow-lg">
                                                <img src={pm.icon_url} alt={pm.name} className="w-full h-full object-contain" />
                                            </div>
                                        ) : (
                                            <div className="w-16 h-16 bg-neutral-800 rounded shrink-0"></div>
                                        )}
                                        <div className="flex flex-col justify-center w-full mt-2">
                                            <div className="text-white font-black text-lg uppercase tracking-widest">{pm.name}</div>
                                            <div className="text-neutral-400 text-sm font-mono mt-2 whitespace-pre-line leading-relaxed">{pm.description}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex flex-col gap-3">
                            <label className="text-neutral-400 text-xs uppercase font-bold tracking-widest">Upload Bukti Transfer</label>
                            <select
                                className="bg-black border border-neutral-800 text-white p-3 outline-none text-sm"
                                value={selectedMethod} onChange={e => setSelectedMethod(e.target.value)}
                            >
                                <option value="" disabled>Pilih bank asal transfer</option>
                                {paymentMethods.map(pm => <option key={pm.name} value={pm.name}>{pm.name}</option>)}
                            </select>

                            <input
                                type="file"
                                accept="image/*"
                                className="bg-black text-white p-2 border border-neutral-800 text-sm file:mr-4 file:py-2 file:px-4 file:border-0 file:text-xs file:font-semibold file:bg-neutral-800 file:text-white hover:file:bg-neutral-700"
                                onChange={e => setProofFile(e.target.files[0])}
                            />

                            <button
                                onClick={handleUploadClick}
                                disabled={uploading || !proofFile}
                                className="mt-2 flex items-center justify-center gap-2 py-3 bg-white text-black font-bold uppercase tracking-widest text-xs hover:bg-neutral-200 disabled:opacity-50 transition-colors"
                            >
                                {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                                {uploading ? 'Mengupload...' : 'Kirim Bukti Pembayaran'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Section Invoice Jika Ada (Dan sudah dibayar/DP/diproses) */}
            {invoice && order.status !== 'pending_payment' && (
                <div className="mt-4 flex items-center justify-between border-t border-dashed border-neutral-700 pt-4">
                    <div className="flex flex-col gap-1">
                        <span className="text-xs uppercase text-neutral-500 font-bold tracking-widest">No. Invoice</span>
                        <span className="text-white font-mono text-sm">{invoice.invoice_number}</span>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                        <span className="text-xs uppercase text-neutral-500 font-bold tracking-widest">Status Invois</span>
                        <span className={`text-xs font-bold uppercase tracking-wider ${invoice.payment_status === 'paid' ? 'text-green-400' : 'text-yellow-500'}`}>
                            {invoice.payment_status}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
};
