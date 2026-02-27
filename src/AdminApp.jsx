import React, { useState, useEffect, useRef } from 'react';
import { supabase } from './supabase';
import {
    LayoutDashboard, ShoppingBag, Users, Settings,
    LogOut, Bell, Chrome, ShieldOff, MoreVertical,
    Folder, FileText, Image as ImageIcon, Layers, Table, Package, DollarSign,
    Download, FileText as FileTextIcon, Menu, X
} from 'lucide-react';
import ProductsManager from './components/admin/ProductsManager';
import PortfolioManager from './components/admin/PortfolioManager';
import ContentManager from './components/admin/ContentManager';
import VendorSublimManager from './components/admin/VendorSublimManager';
import PageDataManager from './components/admin/PageDataManager';
import MasterDataManager from './components/admin/MasterDataManager';
import { Database, UserPlus, Trash2 } from 'lucide-react';

// ─── Konfigurasi ─────────────────────────────────────────────────
// Fallback emails jika belum ada data di database
const FALLBACK_ADMIN_EMAILS = [
    'mifahmi788@gmail.com',
    'ridhofebriyansyah75@gmail.com',
];

// Helper: ambil daftar admin email dari database
const fetchAdminEmails = async () => {
    const { data } = await supabase.from('site_content').select('value_json').eq('key', 'admin_emails').single();
    if (data && data.value_json) {
        let parsed = data.value_json;
        if (typeof parsed === 'string') parsed = JSON.parse(parsed);
        return Array.isArray(parsed) ? parsed : FALLBACK_ADMIN_EMAILS;
    }
    return FALLBACK_ADMIN_EMAILS;
};

// ─── Data Dummy (Untuk Stat di Dashboard saja) ───────────────────
// Sengaja dikosongkan untuk Orders karena akan narik DB asli


// ─── Login Page ───────────────────────────────────────────────────
const LoginPage = ({ error }) => {
    const [loading, setLoading] = useState(false);

    const handleGoogleLogin = async () => {
        setLoading(true);
        await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/admin`,
            },
        });
        // Supabase akan redirect ke Google, lalu kembali ke /admin
        // Loading dibiarkan true karena page akan redirect
    };

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-6">
            <div className="w-full max-w-md">
                <div className="bg-neutral-900 border border-neutral-800 p-10 shadow-2xl">
                    {/* Header */}
                    <div className="text-center mb-10">
                        <h1 className="text-3xl font-black text-white tracking-tighter mb-2">
                            VORVOX<span className="text-neutral-500">.ADMIN</span>
                        </h1>
                        <p className="text-neutral-500 text-sm">Panel khusus admin — akses terbatas</p>
                    </div>

                    <div className="flex items-center gap-4 mb-8">
                        <div className="flex-1 h-px bg-neutral-800" />
                        <span className="text-neutral-600 text-xs uppercase tracking-widest">masuk dengan</span>
                        <div className="flex-1 h-px bg-neutral-800" />
                    </div>

                    {/* Google Button */}
                    <button
                        onClick={handleGoogleLogin}
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-3 py-4 border border-neutral-700 text-white font-bold text-sm uppercase tracking-widest hover:bg-white hover:text-black transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group"
                    >
                        <Chrome size={20} className="group-hover:scale-110 transition-transform" />
                        {loading ? 'Mengalihkan ke Google...' : 'Sign in with Google'}
                    </button>

                    {/* Error: email tidak diizinkan */}
                    {error && (
                        <div className="mt-6 p-4 border border-red-900 bg-red-900/10 flex items-start gap-3">
                            <ShieldOff size={16} className="text-red-400 mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="text-red-400 text-sm font-bold mb-1">Akses Ditolak</p>
                                <p className="text-red-400/70 text-xs">{error}</p>
                            </div>
                        </div>
                    )}

                    <div className="mt-8 text-center text-xs text-neutral-700">
                        © 2026 Vorvox Internal System • Powered by Supabase
                    </div>
                </div>
                <p className="text-center text-neutral-700 text-xs mt-4 uppercase tracking-widest">
                    Hanya admin yang terdaftar dapat masuk
                </p>
            </div>
        </div>
    );
};

// ─── Dashboard (Secured with Passcode) ────────────────────────────
const Dashboard = () => {
    const [isLocked, setIsLocked] = useState(true);
    const [passcode, setPasscode] = useState('');
    const [passcodeError, setPasscodeError] = useState('');

    const [stats, setStats] = useState({
        revenue: 0,
        activeOrders: 0,
        completedOrders: 0,
        clients: 0
    });
    const [targets, setTargets] = useState({
        sablon: { done: 0, total: 1000 },
        bordir: { done: 0, total: 1000 },
        jahit: { done: 0, total: 1000 }
    });
    const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState(true);

    const handleUnlock = (e) => {
        e.preventDefault();
        if (passcode === '019019') {
            setIsLocked(false);
            setPasscodeError('');
        } else {
            setPasscodeError('Passcode salah. Autentikasi ditolak.');
            setPasscode('');
        }
    };

    useEffect(() => {
        const fetchDashboardData = async () => {
            setLoading(true);
            try {
                // Fetch Orders
                const { data: orders } = await supabase.from('orders').select('status, total_price, created_at');
                // Fetch Clients
                const { count: clientsCount } = await supabase.from('clients').select('*', { count: 'exact', head: true });
                // Fetch Targets
                const { data: targetData } = await supabase.from('site_content').select('value_json').eq('key', 'home_targets').single();

                if (orders) {
                    let revenue = 0;
                    let active = 0;
                    let completed = 0;

                    // Chart data preparation (Last 30 days)
                    const last30Days = [...Array(30)].map((_, i) => {
                        const d = new Date();
                        d.setDate(d.getDate() - (29 - i));
                        return { date: d.toISOString().split('T')[0], count: 0 };
                    });

                    orders.forEach(o => {
                        if (o.status === 'selesai') {
                            revenue += Number(o.total_price);
                            completed++;
                        } else if (o.status === 'pending' || o.status === 'diproses') {
                            active++;
                        }

                        // Count for chart
                        const oDate = o.created_at.split('T')[0];
                        const day = last30Days.find(d => d.date === oDate);
                        if (day) day.count++;
                    });

                    setStats({ revenue, activeOrders: active, completedOrders: completed, clients: clientsCount || 0 });

                    // Normalize chart data to percentages (0-100) for the CSS graph
                    const maxCount = Math.max(...last30Days.map(d => d.count), 1);
                    const normalizedChart = last30Days.map(d => Math.floor((d.count / maxCount) * 100));
                    // Ambil 8 sampel aja biar muat di UI (setiap ~3 hari)
                    const sampledChart = [
                        normalizedChart[0], normalizedChart[4], normalizedChart[8], normalizedChart[12],
                        normalizedChart[16], normalizedChart[20], normalizedChart[24], normalizedChart[29]
                    ];
                    setChartData(sampledChart);
                }

                if (targetData && targetData.value_json) {
                    // Pastikan parsing string kl tipe nya bukan jsonb (tergantung schema)
                    let parsed = targetData.value_json;
                    if (typeof parsed === 'string') parsed = JSON.parse(parsed);
                    setTargets(parsed);
                }
            } catch (error) {
                console.error("Dashboard Dashboard Error:", error);
            }
            setLoading(false);
        };
        fetchDashboardData();
    }, []);

    const formatRp = (num) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);

    if (loading) return <div className="p-8 text-neutral-400">Memuat data analytic...</div>;

    const statCards = [
        { title: 'Total Pendapatan', value: formatRp(stats.revenue), icon: <DollarSign />, change: 'Realtime' },
        { title: 'Pesanan Aktif', value: stats.activeOrders, icon: <ShoppingBag />, change: 'Live' },
        { title: 'Produksi Selesai', value: stats.completedOrders, icon: <Package />, change: 'All Time' },
        { title: 'Total Klien', value: stats.clients, icon: <Users />, change: 'DB' },
    ];

    const targetSections = [
        { key: 'sablon', label: 'Sablon', data: targets.sablon },
        { key: 'bordir', label: 'Bordir', data: targets.bordir },
        { key: 'jahit', label: 'Jahit', data: targets.jahit },
    ];

    if (isLocked) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                <div className="bg-neutral-900 border border-neutral-800 p-10 max-w-sm w-full">
                    <ShieldOff size={48} className="text-neutral-500 mx-auto mb-6" />
                    <h2 className="text-xl font-bold text-white mb-2 uppercase tracking-wider">Akses Terkunci</h2>
                    <p className="text-neutral-500 text-sm mb-8">Data statistik dashboard bersifat rahasia.</p>
                    <form onSubmit={handleUnlock}>
                        <input
                            type="password"
                            placeholder="Masukkan Passcode"
                            value={passcode}
                            onChange={(e) => setPasscode(e.target.value)}
                            className="w-full bg-black border border-neutral-800 text-white text-center p-3 mb-4 outline-none focus:border-white transition-colors tracking-widest"
                            autoFocus
                        />
                        {passcodeError && <p className="text-red-500 text-xs mb-4">{passcodeError}</p>}
                        <button type="submit" className="w-full bg-white text-black font-bold uppercase tracking-widest text-sm py-3 hover:bg-gray-200 transition-colors">
                            Buka Dashboard
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat, idx) => (
                    <div key={idx} className="bg-neutral-900 border border-neutral-800 p-6 hover:border-neutral-700 transition-colors">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2 bg-black text-white rounded-lg">{stat.icon}</div>
                            <span className="text-green-400 text-[10px] uppercase tracking-widest font-bold bg-green-900/20 px-2 py-1 rounded">{stat.change}</span>
                        </div>
                        <h3 className="text-neutral-500 text-xs uppercase tracking-widest font-bold mb-1">{stat.title}</h3>
                        <div className="text-2xl font-black text-white truncate">{stat.value}</div>
                    </div>
                ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-neutral-900 border border-neutral-800 p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-white font-bold uppercase tracking-wider text-sm">Statistik Produksi (30 Hari)</h3>
                        <div className="bg-black text-white text-xs px-3 py-1 border border-neutral-800">Tren Harian</div>
                    </div>
                    <div className="h-64 flex items-end gap-3 mt-8">
                        {chartData.map((h, i) => (
                            <div key={i} className="flex-1 bg-neutral-800 hover:bg-white transition-colors relative group cursor-pointer" style={{ height: `${Math.max(5, h)}%` }}>
                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white text-black text-xs font-bold px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">{h}%</div>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between mt-4 text-xs text-neutral-500 uppercase font-bold tracking-widest">
                        <span>Lama</span><span>Baru</span>
                    </div>
                </div>
                <div className="bg-neutral-900 border border-neutral-800 p-6">
                    <h3 className="text-white font-bold uppercase tracking-wider text-sm mb-6">Target Bulanan</h3>
                    {targetSections.map(({ label, data }) => {
                        const pct = data.total > 0 ? Math.round((data.done / data.total) * 100) : 0;
                        return (
                            <div key={label} className="mb-6 last:mb-0">
                                <div className="flex justify-between text-xs mb-2">
                                    <span className="text-neutral-400">{label} ({pct}%)</span>
                                    <span className="text-white font-bold">{data.done}/{data.total} pcs</span>
                                </div>
                                <div className="w-full h-3 bg-neutral-800 rounded-full overflow-hidden relative">
                                    <div className="h-full bg-white transition-all duration-1000" style={{ width: `${pct}%` }} />
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    );
};

// ─── Orders ───────────────────────────────────────────────────────
const Orders = () => {
    const [filter, setFilter] = useState('All');
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const [verifModal, setVerifModal] = useState({ isOpen: false, orderId: null, payment: null });

    const fetchOrders = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('orders')
            .select(`*, clients(name, email, phone), invoices(*), payments(*), jersey_players(*)`)
            .order('created_at', { ascending: false });

        if (!error) {
            setOrders(data || []);
        } else {
            console.error('Fetch orders error', error);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const handleChangeStatus = async (orderId, newStatus) => {
        if (!confirm(`Ubah status menjadi ${newStatus}?`)) return;

        // 1. Update order status
        const { error: orderError } = await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);

        // 2. Auto update payment_status in invoices
        if (!orderError) {
            const isPaid = (newStatus === 'paid' || newStatus === 'diproses' || newStatus === 'selesai');
            await supabase.from('invoices').update({ payment_status: isPaid ? 'paid' : 'unpaid' }).eq('order_id', orderId);
            fetchOrders();
        } else {
            console.error('Update status error', orderError);
            alert('Gagal update status: ' + orderError.message);
        }
    };

    const handleVerifyPayment = async (orderId, paymentId, isApproved) => {
        const newOrderStatus = isApproved ? 'paid' : 'pending_payment';
        const newPaymentStatus = isApproved ? 'verified' : 'rejected';

        const { error: pErr } = await supabase.from('payments').update({ status: newPaymentStatus, verified_at: new Date().toISOString() }).eq('id', paymentId);
        if (pErr) return alert('Gagal memverifikasi payment: ' + pErr.message);

        await supabase.from('orders').update({ status: newOrderStatus }).eq('id', orderId);
        if (isApproved) {
            await supabase.from('invoices').update({ payment_status: 'paid' }).eq('order_id', orderId);
        }

        setVerifModal({ isOpen: false, orderId: null, payment: null });
        fetchOrders();
        alert(isApproved ? 'Pembayaran Disetujui! Pesanan masuk ke proses produksi.' : 'Pembayaran Ditolak. Client perlu upload ulang.');
    };

    const handleExportPlayers = (order) => {
        const players = order.jersey_players || [];
        if (players.length === 0) return alert('Tidak ada data nama & nomor pemain untuk pesanan ini.');

        let csvContent = "";

        // Header Laporan
        csvContent += "VORVOX.ID - DATA PEMAIN PESANAN\n";
        csvContent += `ID Pesanan,${order.order_code}\n`;
        csvContent += `Nama Klien,"${order.clients?.name || '-'}"\n`;
        csvContent += `Produk,"${order.product_name} (${order.bahan} / ${order.kerah})"\n`;
        csvContent += `Tanggal Cetak,${new Date().toLocaleString('id-ID')}\n\n`;

        // Ringkasan
        csvContent += "RINGKASAN\n";
        csvContent += `Total Pemain,${players.length} Orang\n\n`;

        // Kolom Detail
        csvContent += "DETAIL PEMAIN\n";
        csvContent += "No,Nama Pemain (Punggung),Nomor Punggung,Ukuran\n";

        players.forEach((p, idx) => {
            csvContent += `${idx + 1},"${p.player_name || '-'}","${p.player_number || '-'}","${p.player_size || '-'}"\n`;
        });

        const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `Data_Pemain_${order.order_code}.csv`;
        link.click();
    };

    const handlePrintInvoice = (order) => {
        const invoice = order.invoices?.[0];
        if (!invoice) return alert('Invoice belum tersedia untuk pesanan ini.');

        const printContent = `
            <div style="font-family: 'Inter', Arial, sans-serif; padding: 40px; max-width: 800px; margin: auto; color: #111;">
                <div style="display: flex; justify-content: space-between; border-bottom: 2px solid #000; padding-bottom: 20px;">
                    <div>
                        <h1 style="margin:0; font-size: 32px; font-weight: 900; letter-spacing: 2px; text-transform: uppercase;">VORVOX.ID</h1>
                        <p style="margin:5px 0; color: #666; font-size: 12px; letter-spacing: 1px; text-transform: uppercase;">Vendor Sublim & Konveksi Sportswear</p>
                    </div>
                    <div style="text-align: right;">
                        <h2 style="margin:0; font-size: 24px; color: #555; letter-spacing: 2px;">INVOICE</h2>
                        <b style="font-size: 18px; letter-spacing: 1px;">${invoice.invoice_number}</b>
                        <p style="margin:5px 0; font-size: 14px; color: #555;">Tanggal: ${new Date(invoice.created_at).toLocaleDateString('id-ID')}</p>
                    </div>
                </div>
                
                <div style="display: flex; justify-content: space-between; margin-top: 30px;">
                    <div>
                        <h3 style="margin-bottom: 10px; color: #555; font-size: 12px; letter-spacing: 1px;">DITAGIHKAN KEPADA:</h3>
                        <b style="font-size: 16px;">${order.clients?.name}</b><br/>
                        <span style="color: #444; font-size: 14px;">${order.clients?.email}</span><br/>
                        <span style="color: #444; font-size: 14px;">${order.clients?.phone || '-'}</span>
                    </div>
                </div>

                <table style="width: 100%; border-collapse: collapse; margin-top: 40px; font-size: 14px;">
                    <thead>
                        <tr style="background: #f4f4f4; border-bottom: 2px solid #ddd;">
                            <th style="padding: 12px; text-align: left; font-weight: bold; letter-spacing: 1px; font-size: 12px;">DESKRIPSI PRODUK</th>
                            <th style="padding: 12px; text-align: center; font-weight: bold; letter-spacing: 1px; font-size: 12px;">QTY</th>
                            <th style="padding: 12px; text-align: right; font-weight: bold; letter-spacing: 1px; font-size: 12px;">HARGA SATUAN</th>
                            <th style="padding: 12px; text-align: right; font-weight: bold; letter-spacing: 1px; font-size: 12px;">TOTAL</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style="padding: 16px 12px; border-bottom: 1px solid #eee;">
                                <b style="font-size: 16px; display: block; margin-bottom: 4px;">${order.product_name}</b>
                                <span style="color: #666; font-size: 12px;">Size: ${order.size} | Bahan: ${order.bahan} | Kerah: ${order.kerah}</span>
                            </td>
                            <td style="padding: 16px 12px; border-bottom: 1px solid #eee; text-align: center; font-weight: bold;">${order.quantity}</td>
                            <td style="padding: 16px 12px; border-bottom: 1px solid #eee; text-align: right;">Rp ${Number(order.price_per_unit).toLocaleString('id-ID')}</td>
                            <td style="padding: 16px 12px; border-bottom: 1px solid #eee; text-align: right; font-weight: bold;">Rp ${Number(order.total_price).toLocaleString('id-ID')}</td>
                        </tr>
                    </tbody>
                </table>

                <div style="display: flex; justify-content: flex-end; margin-top: 30px;">
                    <table style="width: 350px; font-size: 14px;">
                        <tr><td style="padding: 6px 12px; color: #555;">Subtotal:</td><td style="text-align: right; padding: 6px 12px; font-weight: bold;">Rp ${Number(invoice.subtotal).toLocaleString('id-ID')}</td></tr>
                        ${invoice.discount > 0 ? '<tr><td style="padding: 6px 12px; color: #555;">Diskon:</td><td style="text-align: right; padding: 6px 12px; color: red;">-Rp ' + Number(invoice.discount).toLocaleString('id-ID') + '</td></tr>' : ''}
                        
                        <tr style="font-size: 16px; border-top: 2px solid #000;">
                            <td style="padding: 12px; font-weight: bold;">GRAND TOTAL:</td>
                            <td style="text-align: right; padding: 12px; font-weight: bold;">Rp ${Number(invoice.grand_total).toLocaleString('id-ID')}</td>
                        </tr>
                        
                        ${Number(order.dp_amount) > 0 ?
                '<tr><td style="padding: 6px 12px; color: #555;">Down Payment (DP):</td><td style="text-align: right; padding: 6px 12px; font-weight: bold; color: green;">-Rp ' + Number(order.dp_amount).toLocaleString('id-ID') + '</td></tr><tr style="font-size: 16px; background: #f9f9f9;"><td style="padding: 12px; font-weight: bold; color: #d32f2f;">SISA TAGIHAN:</td><td style="text-align: right; padding: 12px; font-weight: bold; color: #d32f2f;">Rp ' + Number(order.remaining_amount).toLocaleString('id-ID') + '</td></tr>'
                : ''}
                    </table>
                </div>

                <div style="margin-top: 60px; text-align: center; border-top: 1px solid #eee; padding-top: 30px; font-size: 13px;">
                    <div style="margin-bottom: 15px; text-align: left; background: #f9f9f9; padding: 15px; border-radius: 4px;">
                        <b style="font-size: 12px; letter-spacing: 1px; color: #555;">CATATAN PESANAN:</b><br/>
                        <span style="color: #333;">${order.notes || '-'}</span>
                    </div>
                    
                    <div style="margin-bottom: 25px;">
                        <b>STATUS PEMBAYARAN: <span style="color: ${invoice.payment_status === 'paid' ? 'green' : '#d32f2f'}; padding: 4px 8px; border: 1px solid ${invoice.payment_status === 'paid' ? 'green' : '#d32f2f'}; border-radius: 4px; border-width: 2px;">${invoice.payment_status.toUpperCase()}</span></b>
                    </div>
                    
                    <p style="margin-bottom: 5px; color: #555;">Terima kasih telah mempercayakan produksi Anda pada <b>Vorvox.id</b></p>
                    <p style="color: #888; font-size: 11px; margin-top: 15px; line-height: 1.6;">
                        <b>Jl. Patimura No. 45, Jeru, Kec. Tumpang, Kab. Malang, Jawa Timur</b><br/>
                        WhatsApp: 0856-4111-7775 | Email: vorvoxid@gmail.com<br/>
                        Web: www.vorvox.id
                    </p>
                </div>
            </div>
        `;

        const printWindow = window.open('', '_blank');
        printWindow.document.write('<html><head><title>Print Invoice</title></head><body>');
        printWindow.document.write(printContent);
        printWindow.document.write('</body></html>');
        printWindow.document.close();

        // Wait a small delay to ensure rendering before printing
        setTimeout(() => {
            printWindow.print();
        }, 500);
    };

    const statusColor = (s) => ({
        selesai: 'bg-emerald-900/30 text-emerald-400 border-emerald-900',
        diproses: 'bg-purple-900/30 text-purple-400 border-purple-900',
        paid: 'bg-green-900/30 text-green-400 border-green-900',
        pending_verification: 'bg-blue-900/30 text-blue-400 border-blue-900',
        pending_payment: 'bg-yellow-900/30 text-yellow-400 border-yellow-900',
        pending: 'bg-neutral-800 text-neutral-400 border-neutral-700',
        dibatalkan: 'bg-red-900/30 text-red-500 border-red-900'
    }[s] || 'bg-neutral-800 text-neutral-400 border-neutral-700');

    // Filter by status, map 'Completed' -> 'selesai', etc.
    const getFilteredOrders = () => {
        if (filter === 'All') return orders;
        const mapFilter = { 'Pending': 'pending_payment', 'Verifying': 'pending_verification', 'Processing': 'diproses', 'Completed': 'selesai', 'Cancelled': 'dibatalkan' };
        return orders.filter(o => o.status === mapFilter[filter]);
    };

    const filtered = getFilteredOrders();

    // ─── Fitur Export Laporan ───────────────────────────────────────
    const [exportRange, setExportRange] = useState('All'); // All, Weekly, Monthly, Yearly

    const filterExportData = () => {
        const now = new Date();
        return orders.filter(o => {
            const od = new Date(o.created_at);
            if (exportRange === 'Weekly') return (now - od) <= 7 * 24 * 60 * 60 * 1000;
            if (exportRange === 'Monthly') return (now - od) <= 30 * 24 * 60 * 60 * 1000;
            if (exportRange === 'Yearly') return (now - od) <= 365 * 24 * 60 * 60 * 1000;
            return true;
        });
    };

    const handleDownloadCSV = () => {
        const data = filterExportData();
        if (data.length === 0) return alert('Tidak ada data pada periode ini.');

        const totalOmset = data.reduce((acc, curr) => acc + Number(curr.total_price), 0);
        const totalItems = data.reduce((acc, curr) => acc + Number(curr.quantity), 0);

        // Buat format CSV yang lebih rapi seperti laporan
        let csvContent = "";

        // Header Laporan
        csvContent += "VORVOX.ID - LAPORAN REKAPITULASI PESANAN\n";
        csvContent += `Periode filter: ${exportRange}\n`;
        csvContent += `Tgl Cetak: ${new Date().toLocaleString('id-ID')}\n\n`;

        // Ringkasan Eksekutif
        csvContent += "RINGKASAN EKSEKUTIF\n";
        csvContent += `Total Transaksi,${data.length} Pesanan\n`;
        csvContent += `Total Item Terjual,${totalItems} Pcs\n`;
        csvContent += `Total Omset,"Rp ${totalOmset.toLocaleString('id-ID')}"\n\n`;

        // Kolom Detail
        csvContent += "DETAIL TRANSAKSI\n";
        csvContent += "Tanggal,ID Pesanan,Status,Klien,Email Klien,No. HP Klien,Nama Produk,Variasi (Bahan & Kerah),Quantity,Total Harga\n";

        // Baris Data
        data.forEach(o => {
            const date = new Date(o.created_at).toLocaleDateString('id-ID');
            const total = `"Rp ${Number(o.total_price).toLocaleString('id-ID')}"`;
            const variasi = `"${o.bahan} / ${o.kerah}"`;
            const row = `"${date}","${o.order_code}","${o.status.toUpperCase()}","${o.clients?.name}","${o.clients?.email}","${o.clients?.phone}","${o.product_name}",${variasi},${o.quantity},${total}`;
            csvContent += row + "\n";
        });

        // Footer (Total Akhir dipaling bawah tabel biar jelas)
        csvContent += `\n,,,,,,,,TOTAL KESELURUHAN,"Rp ${totalOmset.toLocaleString('id-ID')}"\n`;

        // Menggunakan BOM agar Excel bisa membaca karakter khusus dengan baik
        const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `Laporan_Pesanan_Vorvox_${exportRange.toLowerCase()}.csv`;
        link.click();
    };

    const handleDownloadPDF = () => {
        const data = filterExportData();
        if (data.length === 0) return alert('Tidak ada data pada periode ini.');

        const totalOmset = data.reduce((acc, curr) => acc + Number(curr.total_price), 0);
        const totalItems = data.reduce((acc, curr) => acc + Number(curr.quantity), 0);

        const printContent = `
            <div style="font-family: Arial, sans-serif; padding: 40px; max-width: 900px; margin: auto;">
                <div style="text-align: center; border-bottom: 3px solid #000; padding-bottom: 20px; margin-bottom: 30px;">
                    <h1 style="margin:0; font-size: 32px; font-weight: 900; letter-spacing: 2px;">VORVOX.ID</h1>
                    <p style="margin:5px 0;">Jl. Patimura No. 45, Jeru, Kec. Tumpang, Kab. Malang, Jawa Timur | WA: 085641117775</p>
                    <h2 style="margin-top:20px; text-transform:uppercase;">Laporan Rekapitulasi Pesanan (${exportRange})</h2>
                    <p style="margin:0;">Dicetak pada: ${new Date().toLocaleString('id-ID')}</p>
                </div>

                <div style="display: flex; justify-content: space-between; margin-bottom: 30px; background: #f9f9f9; padding: 20px; border: 1px solid #ddd;">
                    <div>
                        <b style="font-size: 12px; color: #555;">RINGKASAN EKSEKUTIF:</b><br/>
                        <span style="font-size: 24px; font-weight: bold;">Omset: Rp ${totalOmset.toLocaleString('id-ID')}</span>
                    </div>
                    <div style="text-align: right;">
                        <b style="font-size: 12px; color: #555;">TOTAL TRANSAKSI:</b><br/>
                        <span style="font-size: 24px; font-weight: bold;">${data.length} Pesanan / ${totalItems} Pcs</span>
                    </div>
                </div>

                <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
                    <thead>
                        <tr style="background: #000; color: #fff;">
                            <th style="padding: 10px; border: 1px solid #444;">TGL</th>
                            <th style="padding: 10px; border: 1px solid #444;">ID/KLIEN</th>
                            <th style="padding: 10px; border: 1px solid #444;">PRODUK & QTY</th>
                            <th style="padding: 10px; border: 1px solid #444;">TOTAL</th>
                            <th style="padding: 10px; border: 1px solid #444;">STATUS</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.map(o => `
                            <tr>
                                <td style="padding: 8px; border: 1px solid #ddd;">${new Date(o.created_at).toLocaleDateString('id-ID')}</td>
                                <td style="padding: 8px; border: 1px solid #ddd;"><b>${o.order_code}</b><br/>${o.clients?.name}</td>
                                <td style="padding: 8px; border: 1px solid #ddd;">${o.product_name} (${o.quantity} pcs)</td>
                                <td style="padding: 8px; border: 1px solid #ddd; text-align:right;">Rp ${o.total_price.toLocaleString('id-ID')}</td>
                                <td style="padding: 8px; border: 1px solid #ddd; text-align:center;">${o.status.replace('_', ' ').toUpperCase()}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>

                <div style="margin-top: 80px; display: flex; justify-content: flex-end;">
                    <div style="text-align: center; width: 250px;">
                        <p>Malang, ${new Date().toLocaleDateString('id-ID')}</p>
                        <br/><br/><br/>
                        <p style="text-decoration: underline; font-weight: bold;">Admin Vorvox</p>
                        <p style="font-size: 12px;">Penanggung Jawab Produksi</p>
                    </div>
                </div>
            </div>
    `;

        const printWindow = window.open('', '_blank');
        printWindow.document.write('<html><head><title>Rekap PDF</title></head><body>');
        printWindow.document.write(printContent);
        printWindow.document.write('</body></html>');
        printWindow.document.close();

        setTimeout(() => printWindow.print(), 500);
    };

    return (
        <div className="bg-neutral-900 border border-neutral-800">
            <div className="p-6 border-b border-neutral-800 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
                <h2 className="text-white font-bold uppercase tracking-widest text-lg">Daftar Pesanan Live</h2>
                <div className="flex gap-4 flex-wrap items-center">
                    <div className="flex gap-2 p-1 bg-black rounded border border-neutral-800">
                        {['All', 'Pending', 'Verifying', 'Processing', 'Completed'].map(f => (
                            <button key={f} onClick={() => setFilter(f)}
                                className={`px - 4 py - 1.5 text - [10px] font - bold uppercase tracking - wider transition - all rounded - sm ${filter === f ? 'bg-white text-black' : 'bg-transparent text-neutral-400 hover:text-white'} `}>
                                {f}
                            </button>
                        ))}
                    </div>

                    <div className="h-6 w-px bg-neutral-800 hidden sm:block"></div>

                    {/* Component Export */}
                    <div className="flex items-center gap-2">
                        <select value={exportRange} onChange={e => setExportRange(e.target.value)} className="bg-black border border-neutral-700 text-white text-xs p-2 outline-none font-bold uppercase tracking-widest cursor-pointer">
                            <option value="All">Semua Waktu</option>
                            <option value="Weekly">Mingguan</option>
                            <option value="Monthly">Bulanan</option>
                            <option value="Yearly">Tahunan</option>
                        </select>
                        <button onClick={handleDownloadCSV} className="p-2 border border-neutral-700 text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors tooltip" title="Download CSV">
                            <Download size={18} />
                        </button>
                        <button onClick={handleDownloadPDF} className="p-2 border border-blue-900/50 text-blue-400 hover:text-white hover:bg-blue-900/50 transition-colors tooltip" title="Print/Download PDF">
                            <FileTextIcon size={18} />
                        </button>
                    </div>
                </div>
            </div>
            <div className="overflow-x-auto">
                {loading ? (
                    <div className="p-8 text-center text-neutral-500 text-sm">Memuat pesanan...</div>
                ) : (
                    <table className="w-full text-left text-sm text-neutral-400">
                        <thead className="bg-black text-neutral-500 uppercase tracking-wider text-xs font-bold border-b border-neutral-800">
                            <tr>{['ID Pesanan', 'Klien', 'Produk', 'Qty', 'Tanggal', 'Status', 'Total', 'Aksi'].map(h => <th key={h} className="p-4">{h}</th>)}</tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-800">
                            {filtered.length === 0 ? (
                                <tr><td colSpan="8" className="p-8 text-center">Tidak ada pesanan ditemukan.</td></tr>
                            ) : filtered.map(o => (
                                <tr key={o.id} className="hover:bg-neutral-800/50 transition-colors">
                                    <td className="p-4 font-mono text-white text-xs">{o.order_code}</td>
                                    <td className="p-4 font-bold text-white">{o.clients?.name} <span className="block font-normal text-xs text-neutral-500">{o.clients?.phone}</span></td>
                                    <td className="p-4">{o.product_name}</td>
                                    <td className="p-4 text-white">{o.quantity} pcs</td>
                                    <td className="p-4">{new Date(o.created_at).toLocaleDateString('id-ID')}</td>
                                    <td className="p-4">
                                        <select
                                            value={o.status}
                                            onChange={(e) => handleChangeStatus(o.id, e.target.value)}
                                            className={`px - 2 py - 1 outline - none text - [10px] font - bold uppercase tracking - wide border rounded cursor - pointer ${statusColor(o.status)} `}
                                        >
                                            <option value="pending_payment">PENDING BAYAR</option>
                                            <option value="pending_verification">VERIFIKASI</option>
                                            <option value="paid">LUNAS / DP DIBAYAR</option>
                                            <option value="diproses">DIPROSES</option>
                                            <option value="selesai">SELESAI</option>
                                            <option value="dibatalkan">DIBATALKAN</option>
                                        </select>
                                    </td>
                                    <td className="p-4 text-white flex flex-col gap-1 items-start text-xs">
                                        <span className="font-mono text-red-400">DP: Rp{(o.dp_amount || 0).toLocaleString('id-ID')}</span>
                                        <span className="font-mono text-white">Tot: Rp{o.total_price.toLocaleString('id-ID')}</span>
                                        {o.status === 'pending_verification' && o.payments && o.payments.length > 0 && (
                                            <button
                                                onClick={() => setVerifModal({ isOpen: true, orderId: o.id, payment: o.payments[o.payments.length - 1] })}
                                                className="mt-1 px-3 py-1 bg-blue-600 text-white font-bold text-[10px] rounded hover:bg-blue-500 uppercase tracking-widest whitespace-nowrap animate-pulse">
                                                Cek Bukti TF
                                            </button>
                                        )}
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex flex-col gap-2">
                                            {o.jersey_players && o.jersey_players.length > 0 && (
                                                <button onClick={() => handleExportPlayers(o)} className="px-3 py-1.5 bg-green-600/20 border border-green-600 text-green-400 hover:bg-green-600 hover:text-white rounded transition-colors text-[10px] font-bold uppercase whitespace-nowrap">
                                                    Unduh Data Pemain
                                                </button>
                                            )}
                                            <button onClick={() => handlePrintInvoice(o)} className="px-3 py-1.5 bg-white text-black hover:bg-gray-200 rounded transition-colors text-[10px] font-bold uppercase whitespace-nowrap">
                                                Print/PDF INV
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Verifikasi Modal */}
            {
                verifModal.isOpen && verifModal.payment && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                        <div className="bg-neutral-900 border border-neutral-800 w-full max-w-lg shadow-2xl overflow-hidden">
                            <div className="p-4 border-b border-neutral-800 flex justify-between items-center bg-black">
                                <h3 className="text-white font-bold uppercase tracking-widest text-sm">Verifikasi Pembayaran</h3>
                                <button onClick={() => setVerifModal({ isOpen: false, orderId: null, payment: null })} className="text-neutral-500 hover:text-white">✕</button>
                            </div>
                            <div className="p-6">
                                <div className="mb-4">
                                    <p className="text-neutral-500 text-xs uppercase tracking-widest mb-1">Metode Transfer</p>
                                    <p className="text-white font-bold">{verifModal.payment.method}</p>
                                </div>
                                <div className="mb-6 rounded bg-black p-2 border border-neutral-800 flex justify-center">
                                    <img src={verifModal.payment.proof_url} alt="Bukti Transfer" className="max-h-64 object-contain" />
                                </div>
                                <div className="flex gap-4">
                                    <button onClick={() => handleVerifyPayment(verifModal.orderId, verifModal.payment.id, true)} className="flex-1 py-3 bg-green-600 text-white font-bold uppercase tracking-widest text-xs hover:bg-green-500 transition-colors">
                                        Setujui (Valid)
                                    </button>
                                    <button onClick={() => handleVerifyPayment(verifModal.orderId, verifModal.payment.id, false)} className="flex-1 py-3 bg-red-900/50 text-red-500 font-bold uppercase tracking-widest text-xs hover:bg-red-900 transition-colors">
                                        Tolak (Tidak Valid)
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }
        </div>
    );
};

// ─── Settings ─────────────────────────────────────────────────────
const SettingsPage = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');

    // CMS state for Targets
    const [targets, setTargets] = useState({
        sablon: { done: 0, total: 1000 },
        bordir: { done: 0, total: 1000 },
        jahit: { done: 0, total: 1000 }
    });

    // Admin emails management
    const [adminEmails, setAdminEmails] = useState([]);
    const [newAdminEmail, setNewAdminEmail] = useState('');
    const [loadingAdmins, setLoadingAdmins] = useState(false);

    const [loadingParams, setLoadingParams] = useState(false);

    useEffect(() => {
        supabase.auth.getUser().then(({ data: { user } }) => {
            if (user) {
                setName(user.user_metadata?.full_name || '');
                setEmail(user.email || '');
            }
        });

        // Fetch Targets
        supabase.from('site_content').select('value_json').eq('key', 'home_targets').single().then(({ data }) => {
            if (data && data.value_json) {
                let parsed = data.value_json;
                if (typeof parsed === 'string') parsed = JSON.parse(parsed);
                setTargets(parsed);
            }
        });

        // Fetch Admin Emails
        fetchAdminEmails().then(emails => setAdminEmails(emails));
    }, []);

    const handleUpdateProfile = async () => {
        setLoadingParams(true);
        const { error } = await supabase.auth.updateUser({
            data: { full_name: name }
        });
        setLoadingParams(false);
        if (error) alert(error.message);
        else alert('Profil berhasil diupdate!');
    };

    const handleUpdateTargets = async () => {
        setLoadingParams(true);
        const { error } = await supabase.from('site_content').upsert({
            key: 'home_targets',
            value_json: targets
        });
        setLoadingParams(false);
        if (error) alert('Gagal menyimpan target: ' + error.message);
        else alert('Target produksi berhasil disimpan!');
    };

    const handleTargetChange = (dept, field, val) => {
        setTargets(prev => ({
            ...prev,
            [dept]: {
                ...prev[dept],
                [field]: Number(val)
            }
        }));
    };

    // Admin Email CRUD
    const handleAddAdmin = async () => {
        const trimmed = newAdminEmail.trim().toLowerCase();
        if (!trimmed || !trimmed.includes('@')) return alert('Masukkan email yang valid.');
        if (adminEmails.includes(trimmed)) return alert('Email sudah terdaftar sebagai admin.');

        setLoadingAdmins(true);
        const updated = [...adminEmails, trimmed];
        const { error } = await supabase.from('site_content').upsert({
            key: 'admin_emails',
            value_json: updated
        });
        setLoadingAdmins(false);
        if (error) return alert('Gagal menambah admin: ' + error.message);
        setAdminEmails(updated);
        setNewAdminEmail('');
        alert(`${trimmed} berhasil diangkat sebagai Admin!`);
    };

    const handleRemoveAdmin = async (emailToRemove) => {
        if (emailToRemove === email) return alert('Anda tidak bisa menghapus diri sendiri dari daftar admin.');
        if (!confirm(`Yakin ingin menghapus ${emailToRemove} dari daftar admin?`)) return;

        setLoadingAdmins(true);
        const updated = adminEmails.filter(e => e !== emailToRemove);
        if (updated.length === 0) {
            setLoadingAdmins(false);
            return alert('Tidak bisa menghapus admin terakhir. Minimal harus ada 1 admin.');
        }
        const { error } = await supabase.from('site_content').upsert({
            key: 'admin_emails',
            value_json: updated
        });
        setLoadingAdmins(false);
        if (error) return alert('Gagal menghapus admin: ' + error.message);
        setAdminEmails(updated);
        alert(`${emailToRemove} telah dihapus dari daftar admin.`);
    };

    return (
        <div className="space-y-8">
            <div className="grid lg:grid-cols-2 gap-8">
                <div className="bg-neutral-900 border border-neutral-800 p-6 md:p-8">
                    <div className="flex items-center gap-4 mb-8">
                        <Settings size={28} className="text-white" />
                        <h2 className="text-white font-bold uppercase tracking-widest text-lg">Akun Admin</h2>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-neutral-400 uppercase mb-2">Login Email (Read-only)</label>
                            <input type="text" readOnly value={email} className="w-full bg-black border border-neutral-800 text-neutral-500 p-3 opacity-50 cursor-not-allowed" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-neutral-400 uppercase mb-2">Nama Tampilan</label>
                            <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-black border border-neutral-800 text-white p-3 focus:border-neutral-500 outline-none" />
                        </div>
                        <button onClick={handleUpdateProfile} disabled={loadingParams} className="px-6 py-3 bg-white text-black font-bold uppercase text-xs tracking-widest hover:bg-gray-200 mt-4 disabled:opacity-50">
                            {loadingParams ? 'Menyimpan...' : 'Simpan Profil'}
                        </button>
                    </div>
                </div>

                <div className="bg-neutral-900 border border-neutral-800 p-6 md:p-8">
                    <div className="flex items-center gap-4 mb-8">
                        <Layers size={28} className="text-white" />
                        <h2 className="text-white font-bold uppercase tracking-widest text-lg">CMS Target Dashboard</h2>
                    </div>

                    <div className="space-y-6">
                        {['sablon', 'bordir', 'jahit'].map((dept) => (
                            <div key={dept} className="bg-black border border-neutral-800 p-4">
                                <h3 className="text-white font-bold uppercase tracking-widest text-xs mb-4">{dept}</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] text-neutral-500 uppercase mb-1">Terselesaikan</label>
                                        <input type="number" value={targets[dept].done} onChange={e => handleTargetChange(dept, 'done', e.target.value)} className="w-full bg-neutral-900 border border-neutral-700 text-white p-2 outline-none text-sm" />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] text-neutral-500 uppercase mb-1">Total Target</label>
                                        <input type="number" value={targets[dept].total} onChange={e => handleTargetChange(dept, 'total', e.target.value)} className="w-full bg-neutral-900 border border-neutral-700 text-white p-2 outline-none text-sm" />
                                    </div>
                                </div>
                            </div>
                        ))}
                        <button onClick={handleUpdateTargets} disabled={loadingParams} className="w-full py-3 bg-white text-black font-bold uppercase text-xs tracking-widest hover:bg-gray-200 disabled:opacity-50 transition-colors">
                            Simpan Semua Target
                        </button>
                    </div>
                </div>
            </div>

            {/* Admin Management Section */}
            <div className="bg-neutral-900 border border-neutral-800 p-6 md:p-8">
                <div className="flex items-center gap-4 mb-6">
                    <Users size={28} className="text-white" />
                    <div>
                        <h2 className="text-white font-bold uppercase tracking-widest text-lg">Manajemen Admin</h2>
                        <p className="text-neutral-500 text-xs mt-1">Tambah atau hapus email yang bisa login ke panel admin.</p>
                    </div>
                </div>

                {/* Add New Admin */}
                <div className="flex gap-3 mb-6">
                    <input
                        type="email"
                        placeholder="Masukkan email baru, contoh: admin@gmail.com"
                        value={newAdminEmail}
                        onChange={e => setNewAdminEmail(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleAddAdmin()}
                        className="flex-1 bg-black border border-neutral-800 text-white p-3 outline-none text-sm focus:border-neutral-500 transition-colors"
                    />
                    <button
                        onClick={handleAddAdmin}
                        disabled={loadingAdmins}
                        className="px-5 py-3 bg-green-600 text-white font-bold uppercase text-xs tracking-widest hover:bg-green-500 transition-colors disabled:opacity-50 flex items-center gap-2 whitespace-nowrap"
                    >
                        <UserPlus size={16} /> Angkat Admin
                    </button>
                </div>

                {/* Admin List */}
                <div className="space-y-2">
                    {adminEmails.map((adminEmail, idx) => (
                        <div key={idx} className="flex items-center justify-between bg-black border border-neutral-800 px-4 py-3 group hover:border-neutral-700 transition-colors">
                            <div className="flex items-center gap-3 min-w-0">
                                <div className="w-8 h-8 bg-neutral-800 rounded-full flex items-center justify-center text-xs font-bold text-white border border-neutral-700 shrink-0">
                                    {(adminEmail[0] || 'A').toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                    <span className="text-white text-sm font-bold truncate block">{adminEmail}</span>
                                    {adminEmail === email && <span className="text-green-400 text-[10px] uppercase tracking-widest font-bold">Anda</span>}
                                </div>
                            </div>
                            <button
                                onClick={() => handleRemoveAdmin(adminEmail)}
                                disabled={loadingAdmins || adminEmail === email}
                                className="p-2 text-red-500 hover:bg-red-900/30 rounded transition-colors disabled:opacity-20 disabled:cursor-not-allowed shrink-0"
                                title={adminEmail === email ? 'Tidak bisa menghapus diri sendiri' : 'Hapus admin ini'}
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ))}
                    {adminEmails.length === 0 && (
                        <p className="text-neutral-500 text-sm text-center py-4">Belum ada data admin di database. Email fallback tetap berlaku.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

// ─── Admin Panel Shell ────────────────────────────────────────────
const AdminPanel = ({ user, onLogout }) => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const menuItems = [
        { id: 'dashboard', icon: <LayoutDashboard size={20} />, label: 'Beranda Admin' },
        { id: 'orders', icon: <ShoppingBag size={20} />, label: 'Pesanan' },
        { id: 'master_data', icon: <Database size={20} />, label: 'Master Data & Harga' },
        { id: 'products', icon: <Package size={20} />, label: 'Katalog Produk' },
        { id: 'vendor_sublim', icon: <Layers size={20} />, label: 'Vendor Sublim' },
        { id: 'page_data', icon: <Table size={20} />, label: 'Data Tabel & Info' },
        { id: 'portfolio', icon: <ImageIcon size={20} />, label: 'Galeri Portofolio' },
        { id: 'content', icon: <FileText size={20} />, label: 'Konten Teks Web' },
        { id: 'settings', icon: <Settings size={20} />, label: 'Pengaturan' },
    ];
    const avatar = user?.user_metadata?.avatar_url;
    const name = user?.user_metadata?.full_name || user?.email;

    const handleTabSelect = (id) => {
        setActiveTab(id);
        setMobileMenuOpen(false);
    };

    // Shared sidebar content (reused for both desktop and mobile)
    const SidebarContent = () => (
        <>
            <div className="p-6 md:p-8 border-b border-neutral-800 flex items-center justify-between">
                <h1 className="text-xl font-black tracking-tighter">VORVOX<span className="text-neutral-500">.ADMIN</span></h1>
                <button onClick={() => setMobileMenuOpen(false)} className="md:hidden text-neutral-400 hover:text-white p-1">
                    <X size={24} />
                </button>
            </div>
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                {menuItems.map(item => (
                    <button key={item.id} onClick={() => handleTabSelect(item.id)}
                        className={`w-full flex items-center gap-4 px-4 py-3 text-sm font-bold uppercase tracking-wider transition-all ${activeTab === item.id ? 'bg-white text-black' : 'text-neutral-500 hover:text-white hover:bg-neutral-900'}`}>
                        {item.icon}{item.label}
                    </button>
                ))}
            </nav>
            <div className="p-4 border-t border-neutral-800 flex items-center gap-3">
                {avatar
                    ? <img src={avatar} alt={name} className="w-8 h-8 rounded-full border border-neutral-700" />
                    : <div className="w-8 h-8 bg-neutral-800 rounded-full flex items-center justify-center text-xs font-bold border border-neutral-700">AD</div>
                }
                <div className="flex-1 min-w-0">
                    <div className="text-white text-xs font-bold truncate">{name}</div>
                    <div className="text-neutral-600 text-xs truncate">{user?.email}</div>
                </div>
            </div>
            <div className="p-4 border-t border-neutral-800">
                <button onClick={onLogout}
                    className="w-full flex items-center gap-4 px-4 py-3 text-sm font-bold uppercase tracking-wider text-red-500 hover:bg-red-900/20 transition-all">
                    <LogOut size={20} />Keluar
                </button>
            </div>
        </>
    );

    return (
        <div className="flex min-h-screen bg-black text-white">
            {/* Desktop Sidebar */}
            <aside className="w-64 border-r border-neutral-800 bg-black flex-shrink-0 fixed h-full z-10 hidden md:flex flex-col">
                <SidebarContent />
            </aside>

            {/* Mobile Sidebar Overlay */}
            {mobileMenuOpen && (
                <div className="fixed inset-0 z-50 md:hidden">
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
                    <aside className="absolute left-0 top-0 bottom-0 w-72 bg-black border-r border-neutral-800 flex flex-col z-10 animate-slide-in">
                        <SidebarContent />
                    </aside>
                </div>
            )}

            {/* Main */}
            <main className="flex-1 md:ml-64 bg-black min-h-screen">
                <header className="h-16 md:h-20 border-b border-neutral-800 flex items-center justify-between px-4 md:px-8 bg-black/80 backdrop-blur sticky top-0 z-20">
                    <div className="flex items-center gap-3">
                        <button onClick={() => setMobileMenuOpen(true)} className="md:hidden text-neutral-400 hover:text-white p-1">
                            <Menu size={24} />
                        </button>
                        <span className="uppercase text-xs font-bold tracking-widest text-neutral-400">{activeTab} Overview</span>
                    </div>
                    <div className="flex items-center gap-4 md:gap-6">
                        <div className="relative cursor-pointer">
                            <Bell size={20} className="text-neutral-400 hover:text-white transition-colors" />
                            <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
                        </div>
                        {avatar
                            ? <img src={avatar} alt={name} className="w-8 h-8 rounded-full border border-neutral-700" />
                            : <div className="w-8 h-8 bg-neutral-800 rounded-full flex items-center justify-center text-xs font-bold border border-neutral-700">AD</div>
                        }
                    </div>
                </header>
                <div className="p-4 md:p-8 pb-32 overflow-x-auto">
                    {activeTab === 'dashboard' && <Dashboard />}
                    {activeTab === 'orders' && <Orders />}
                    {activeTab === 'master_data' && <MasterDataManager />}
                    {activeTab === 'products' && <ProductsManager />}
                    {activeTab === 'vendor_sublim' && <VendorSublimManager />}
                    {activeTab === 'page_data' && <PageDataManager />}
                    {activeTab === 'portfolio' && <PortfolioManager />}
                    {activeTab === 'content' && <ContentManager />}
                    {activeTab === 'settings' && <SettingsPage />}
                </div>
            </main>
        </div>
    );
};

// ─── Root Admin App ───────────────────────────────────────────────
export default function AdminApp() {
    const [user, setUser] = useState(undefined); // undefined = masih loading
    const [accessError, setAccessError] = useState('');
    const [allowedEmails, setAllowedEmails] = useState(FALLBACK_ADMIN_EMAILS);

    useEffect(() => {
        const initAuth = async () => {
            // 1. Fetch admin emails from DB first
            const emails = await fetchAdminEmails();
            setAllowedEmails(emails);

            // 2. Cek session saat ini
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                if (emails.includes(session.user.email)) {
                    setUser(session.user);
                } else {
                    setAccessError(`Email ${session.user.email} tidak memiliki akses admin.`);
                    supabase.auth.signOut();
                    setUser(null);
                }
            } else {
                setUser(null);
            }
        };
        initAuth();

        // Listen perubahan auth state
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            // Re-fetch emails on auth change to get latest list
            const emails = await fetchAdminEmails();
            setAllowedEmails(emails);

            if (session?.user) {
                if (emails.includes(session.user.email)) {
                    setUser(session.user);
                    setAccessError('');
                } else {
                    setAccessError(`Email ${session.user.email} tidak memiliki akses admin.`);
                    supabase.auth.signOut();
                    setUser(null);
                }
            } else {
                setUser(null);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        setUser(null);
    };

    // Loading state
    if (user === undefined) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-neutral-500 text-xs uppercase tracking-widest animate-pulse">Memuat...</div>
            </div>
        );
    }

    return (
        <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap'); `}</style>
            {user ? <AdminPanel user={user} onLogout={handleLogout} /> : <LoginPage error={accessError} />}
        </div>
    );
}
