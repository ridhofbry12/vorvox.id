import React, { useState, useEffect, useRef } from 'react';
import { supabase } from './supabase';
import ExcelJS from 'exceljs';
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
import CustomInvoiceCreator from './components/admin/CustomInvoiceCreator';
import InvoiceEditor from './components/admin/InvoiceEditor';
import PrintOptionsModal from './components/admin/PrintOptionsModal';
import { Database, UserPlus, Trash2, Ticket, Plus, Loader2, Edit } from 'lucide-react';

// ─── Konfigurasi ─────────────────────────────────────────────────
// Fallback emails jika belum ada data di database
const FALLBACK_ADMIN_EMAILS = [
    'mifahmi788@gmail.com',
    'ridhofebriyansyah75@gmail.com',
];

// Helper: ambil daftar admin email dari database
const fetchAdminEmails = async () => {
    try {
        const { data, error } = await supabase.from('site_content').select('value_json').eq('key', 'admin_emails').maybeSingle();
        if (error || !data) return FALLBACK_ADMIN_EMAILS;
        if (data.value_json) {
            let parsed = data.value_json;
            if (typeof parsed === 'string') parsed = JSON.parse(parsed);
            return Array.isArray(parsed) ? parsed : FALLBACK_ADMIN_EMAILS;
        }
        return FALLBACK_ADMIN_EMAILS;
    } catch (err) {
        console.warn('fetchAdminEmails error, using fallback:', err);
        return FALLBACK_ADMIN_EMAILS;
    }
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
    const [orderCategory, setOrderCategory] = useState('all'); // all, jersey, sublim_dtf
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [fileModal, setFileModal] = useState({ isOpen: false, order: null });
    const [showCustomInvoice, setShowCustomInvoice] = useState(false);
    const [editInvoiceOrder, setEditInvoiceOrder] = useState(null);

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

    const handleDeleteOrder = async (orderId, orderCode) => {
        if (!confirm(`Yakin ingin MENGHAPUS pesanan ${orderCode}? Data tidak bisa dikembalikan.`)) return;
        const { error } = await supabase.from('orders').delete().eq('id', orderId);
        if (error) {
            alert('Gagal menghapus: ' + error.message);
        } else {
            fetchOrders();
            alert('Pesanan berhasil dihapus.');
        }
    };

    const handleExportPlayers = async (order) => {
        const players = order.jersey_players || [];
        if (players.length === 0) return alert('Tidak ada data nama & nomor pemain untuk pesanan ini.');

        const wb = new ExcelJS.Workbook();
        wb.creator = 'Vorvox.id';
        const ws = wb.addWorksheet('Data Pemain', { properties: { defaultColWidth: 18 } });

        // Column widths
        ws.columns = [
            { width: 6 },   // A: No
            { width: 30 },  // B: Nama
            { width: 18 },  // C: Nomor
            { width: 14 },  // D: Ukuran
            { width: 18 },  // E: Lengan
        ];

        // --- STYLES ---
        const headerFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '1B1F3B' } };
        const headerFont = { name: 'Segoe UI', bold: true, size: 11, color: { argb: 'FFFFFF' } };
        const titleFont = { name: 'Segoe UI', bold: true, size: 16, color: { argb: 'FFFFFF' } };
        const summaryFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '0D7377' } };
        const summaryFont = { name: 'Segoe UI', bold: true, size: 11, color: { argb: 'FFFFFF' } };
        const labelFont = { name: 'Segoe UI', size: 10, color: { argb: '8899AA' } };
        const valueFont = { name: 'Segoe UI', bold: true, size: 10, color: { argb: '222222' } };
        const tableHeaderFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '2D2B55' } };
        const tableHeaderFont = { name: 'Segoe UI', bold: true, size: 10, color: { argb: 'FFFFFF' } };
        const oddRowFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F5F5FA' } };
        const evenRowFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFF' } };
        const dataFont = { name: 'Segoe UI', size: 10, color: { argb: '333333' } };
        const thinBorder = { top: { style: 'thin', color: { argb: 'D0D0D0' } }, bottom: { style: 'thin', color: { argb: 'D0D0D0' } }, left: { style: 'thin', color: { argb: 'D0D0D0' } }, right: { style: 'thin', color: { argb: 'D0D0D0' } } };

        // === HEADER SECTION (Row 1-2) ===
        ws.mergeCells('A1:E1');
        const titleCell = ws.getCell('A1');
        titleCell.value = 'VORVOX.ID — DATA PEMAIN';
        titleCell.font = titleFont;
        titleCell.fill = headerFill;
        titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
        ws.getRow(1).height = 40;
        ['B1', 'C1', 'D1'].forEach(c => { ws.getCell(c).fill = headerFill; });

        ws.mergeCells('A2:E2');
        const subtitleCell = ws.getCell('A2');
        subtitleCell.value = `Pesanan: ${order.order_code} | Dicetak: ${new Date().toLocaleString('id-ID')}`;
        subtitleCell.font = { name: 'Segoe UI', italic: true, size: 9, color: { argb: 'CCCCCC' } };
        subtitleCell.fill = headerFill;
        subtitleCell.alignment = { horizontal: 'center', vertical: 'middle' };
        ws.getRow(2).height = 22;
        ['B2', 'C2', 'D2', 'E2'].forEach(c => { ws.getCell(c).fill = headerFill; });

        // === INFO SECTION (Row 4-7) ===
        const infoData = [
            ['Nama Klien', order.clients?.name || '-'],
            ['Produk', order.product_name],
            ['Variasi', `${order.bahan} / ${order.kerah}`],
            ['Total Pemain', `${players.length} Orang`],
        ];
        ws.mergeCells('A3:E3'); // spacer
        infoData.forEach((item, i) => {
            const row = i + 4;
            ws.getCell(`A${row}`).value = item[0];
            ws.getCell(`A${row}`).font = labelFont;
            ws.mergeCells(`B${row}:E${row}`);
            ws.getCell(`B${row}`).value = item[1];
            ws.getCell(`B${row}`).font = valueFont;
        });

        // === SUMMARY BAR (Row 9) ===
        const sumRow = 9;
        ws.mergeCells(`A${sumRow}:E${sumRow}`);
        const sumCell = ws.getCell(`A${sumRow}`);
        sumCell.value = `📋 TOTAL: ${players.length} PEMAIN TERDAFTAR`;
        sumCell.font = summaryFont;
        sumCell.fill = summaryFill;
        sumCell.alignment = { horizontal: 'center', vertical: 'middle' };
        ws.getRow(sumRow).height = 30;
        ['B' + sumRow, 'C' + sumRow, 'D' + sumRow, 'E' + sumRow].forEach(c => { ws.getCell(c).fill = summaryFill; });

        // === TABLE HEADER (Row 11) ===
        const thRow = 11;
        const headers = ['No', 'Nama Pemain (Punggung)', 'Nomor Punggung', 'Ukuran', 'Lengan'];
        headers.forEach((h, i) => {
            const cell = ws.getCell(thRow, i + 1);
            cell.value = h;
            cell.font = tableHeaderFont;
            cell.fill = tableHeaderFill;
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
            cell.border = thinBorder;
        });
        ws.getRow(thRow).height = 28;

        // === DATA ROWS ===
        players.forEach((p, idx) => {
            const row = thRow + 1 + idx;
            const isOdd = idx % 2 === 0;
            const sleeveTxt = p.sleeve === 'panjang' ? 'Panjang' : 'Pendek';
            const rowData = [idx + 1, p.player_name || '-', p.player_number || '-', p.player_size || '-', sleeveTxt];
            rowData.forEach((val, i) => {
                const cell = ws.getCell(row, i + 1);
                cell.value = val;
                cell.font = dataFont;
                cell.fill = isOdd ? oddRowFill : evenRowFill;
                cell.border = thinBorder;
                cell.alignment = { horizontal: i === 0 ? 'center' : 'left', vertical: 'middle' };
            });
            ws.getRow(row).height = 22;
        });

        // Generate & download
        const buffer = await wb.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `Data_Pemain_${order.order_code}.xlsx`;
        link.click();
    };

    const handlePrintInvoice = (order) => {
        // Basic validation: must have some data to print
        if (order.status === 'dibatalkan') return alert('Pesanan ini dibatalkan.');

        setOrderToPrint(order);
        setShowPrintModal(true);
    };

    const confirmPrintInvoice = (orientation) => {
        const order = orderToPrint;
        const invoice = order.invoices?.[0] || {};
        const LOGO = 'https://lh3.googleusercontent.com/d/1Vj2HKhfRS3x9JMGN0wzvTQtln18RYc_I';

        const formatRp = (num) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);

        const longSleevePlayersCount = order.jersey_players?.filter(p => p.sleeve === 'panjang').length || 0;
        const basePriceTotal = (order.quantity || 0) * (order.price_per_unit || 0);
        const extraSleeveCost = Math.max(0, (order.total_price || 0) - basePriceTotal);

        // Render design images if any exist
        const allImages = order.design_urls || [];
        const designImagesHtml = allImages.length > 0 ? `
  <div class="inv-designs">
    <div class="inv-designs-label">Lampiran Foto / Desain / Mockup</div>
    <div class="inv-designs-grid">
      ${allImages.map((url, i) => `<img src="${url}" alt="Desain ${i + 1}" class="inv-design-img" />`).join('\n      ')}
    </div>
  </div>` : '';

        // Add landscape orientation to the CSS if selected
        const pageLayoutCss = orientation === 'landscape' ? '@page { size: A4 landscape; margin: 15mm; }' : '@page { size: A4 portrait; margin: 15mm; }';

        const printContent = `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Invoice ${invoice.invoice_number || order.order_code}</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Inter', sans-serif; color: #1a1a1a; background: #fff; }
  ${pageLayoutCss}
  @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } .inv-designs { break-inside: avoid; } }
  .inv-container { max-width: ${orientation === 'landscape' ? '1080px' : '780px'}; margin: 0 auto; padding: 40px; }
  .inv-header { display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 24px; border-bottom: 3px solid #1B1F3B; }
  .inv-logo-area { display: flex; align-items: center; gap: 14px; }
  .inv-logo-area img { width: 56px; height: 56px; object-fit: contain; }
  .inv-brand h1 { font-size: 28px; font-weight: 900; letter-spacing: 3px; color: #1B1F3B; }
  .inv-brand p { font-size: 10px; color: #888; letter-spacing: 1.5px; text-transform: uppercase; margin-top: 2px; }
  .inv-badge { text-align: right; }
  .inv-badge h2 { font-size: 28px; font-weight: 800; color: #1B1F3B; letter-spacing: 4px; }
  .inv-badge .inv-num { font-size: 13px; font-weight: 700; color: #555; margin-top: 4px; }
  .inv-badge .inv-date { font-size: 11px; color: #999; margin-top: 2px; }
  .inv-parties { display: flex; justify-content: space-between; margin-top: 28px; gap: 40px; }
  .inv-party { flex: 1; }
  .inv-party-label { font-size: 9px; letter-spacing: 2px; text-transform: uppercase; color: #aaa; font-weight: 700; margin-bottom: 8px; }
  .inv-party-name { font-size: 16px; font-weight: 700; color: #1B1F3B; }
  .inv-party-detail { font-size: 12px; color: #666; line-height: 1.8; margin-top: 4px; }
  .inv-table { width: 100%; border-collapse: collapse; margin-top: 32px; }
  .inv-table thead th { background: #1B1F3B; color: #fff; padding: 12px 14px; font-size: 10px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; }
  .inv-table thead th:first-child { text-align: left; }
  .inv-table thead th:last-child, .inv-table thead th:nth-child(3), .inv-table thead th:nth-child(4) { text-align: right; }
  .inv-table thead th:nth-child(2) { text-align: center; }
  .inv-table tbody td { padding: 14px; border-bottom: 1px solid #eee; font-size: 13px; }
  .inv-table tbody td:nth-child(2) { text-align: center; font-weight: 600; }
  .inv-table tbody td:nth-child(3), .inv-table tbody td:nth-child(4) { text-align: right; }
  .inv-prod-name { font-weight: 700; font-size: 14px; color: #1B1F3B; display: block; }
  .inv-prod-spec { font-size: 11px; color: #888; margin-top: 3px; display: block; }
  .inv-designs { margin-top: 28px; padding: 20px; background: #FAFBFC; border: 1px solid #eee; border-radius: 8px; }
  .inv-designs-label { font-size: 9px; letter-spacing: 2px; text-transform: uppercase; color: #aaa; font-weight: 700; margin-bottom: 14px; }
  .inv-designs-grid { display: flex; flex-wrap: wrap; gap: 12px; align-items: flex-start; }
  .inv-design-img { width: ${orientation === 'landscape' ? '280px' : '200px'}; height: auto; max-height: 300px; object-fit: contain; border: 1px solid #ddd; border-radius: 6px; background: #fff; padding: 4px; }
  .inv-totals { display: flex; justify-content: flex-end; margin-top: 24px; }
  .inv-totals table { width: 320px; }
  .inv-totals td { padding: 7px 0; font-size: 13px; }
  .inv-totals .label { color: #888; }
  .inv-totals .val { text-align: right; font-weight: 600; }
  .inv-grand { font-size: 18px !important; font-weight: 800 !important; color: #1B1F3B; border-top: 2px solid #1B1F3B; padding-top: 12px !important; }
  .inv-dp { color: #0D7377; }
  .inv-sisa { color: #C62828; font-weight: 800 !important; }
  .inv-notes { margin-top: 28px; background: #F8F9FB; border: 1px solid #eee; border-radius: 6px; padding: 16px 20px; }
  .inv-notes-label { font-size: 9px; letter-spacing: 2px; text-transform: uppercase; color: #aaa; font-weight: 700; margin-bottom: 6px; }
  .inv-notes-text { font-size: 12px; color: #555; line-height: 1.7; }
  .inv-status { margin-top: 20px; text-align: center; }
  .inv-status-badge { display: inline-block; padding: 6px 20px; border-radius: 20px; font-size: 11px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; }
  .inv-status-paid { background: #E8F5E9; color: #2E7D32; border: 2px solid #A5D6A7; }
  .inv-status-unpaid { background: #FFF3E0; color: #E65100; border: 2px solid #FFB74D; }
  .inv-footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; display: flex; justify-content: space-between; align-items: flex-end; }
  .inv-footer-info { font-size: 10px; color: #bbb; line-height: 1.8; }
  .inv-sign { text-align: center; width: 200px; }
  .inv-sign-date { font-size: 11px; color: #888; }
  .inv-sign-line { margin-top: 60px; border-top: 1px solid #333; padding-top: 6px; font-size: 12px; font-weight: 700; color: #1B1F3B; }
  .inv-sign-role { font-size: 10px; color: #999; }
</style>
</head>
<body>
<div class="inv-container">
  <div class="inv-header">
    <div class="inv-logo-area">
      <img src="${LOGO}" alt="Vorvox Logo" />
      <div class="inv-brand">
        <h1>VORVOX.ID</h1>
        <p>Vendor Sublim & Konveksi Sportswear</p>
      </div>
    </div>
    <div class="inv-badge">
      <h2>INVOICE</h2>
      <div class="inv-num">${invoice.invoice_number}</div>
      <div class="inv-date">Tanggal: ${new Date(invoice.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
    </div>
  </div>

  <div class="inv-parties">
    <div class="inv-party">
      <div class="inv-party-label">Ditagihkan Kepada</div>
      <div class="inv-party-name">${order.clients?.name || '-'}</div>
      <div class="inv-party-detail">
        ${order.clients?.email || '-'}<br />
        ${order.clients?.phone || '-'}
      </div>
    </div>
    <div class="inv-party" style="text-align: right;">
      <div class="inv-party-label">Dari</div>
      <div class="inv-party-name">Vorvox.id</div>
      <div class="inv-party-detail">
        vorvoxid@gmail.com<br />
        0856-4111-7775
      </div>
    </div>
  </div>

  <table class="inv-table">
    <thead>
      <tr>
        <th>Deskripsi Produk</th>
        <th>Qty</th>
        <th>Harga Satuan</th>
        <th>Total</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>
          <span class="inv-prod-name">${order.product_name}</span>
          <span class="inv-prod-spec">${(order.order_type === 'sublim_dtf') ? `${order.meter_qty || order.quantity} meter &bull; Sumber Kain: ${order.fabric_source === 'vorvox' ? 'Kain Vorvox' : 'Kain Sendiri'}` : `Ukuran: ${order.size} &bull; Bahan: ${order.bahan} &bull; Kerah: ${order.kerah}`}</span>
        </td>
        <td>${(order.order_type === 'sublim_dtf') ? (order.meter_qty || order.quantity) + ' m' : order.quantity + ' pcs'}</td>
        <td>Rp ${Number(order.price_per_unit).toLocaleString('id-ID')}</td>
        <td>Rp ${Number(basePriceTotal).toLocaleString('id-ID')}</td>
      </tr>
      ${extraSleeveCost > 0 ? `
      <tr>
            <td colspan="3" class="text-right" style="padding-right: 15px; color: #888;">Tambahan Lengan Panjang (${longSleevePlayersCount} pcs)</td>
            <td class="text-right">${formatRp(extraSleeveCost)}</td>
          </tr>
      ` : ''}
    </tbody>
  </table>

  ${designImagesHtml}

  <div class="inv-totals">
    <table>
      <tr><td class="label">Subtotal</td><td class="val">Rp ${Number(invoice.subtotal || basePriceTotal).toLocaleString('id-ID')}</td></tr>
      ${(invoice.discount || 0) > 0 ? `<tr><td class="label">Diskon Manual</td><td class="val" style="color:#C62828;">-Rp ${Number(invoice.discount).toLocaleString('id-ID')}</td></tr>` : ''}
      ${order.voucher_code ? `<tr><td class="label">Diskon Voucher (${order.voucher_discount}%)</td><td class="val" style="color:#C62828;">-Rp ${Number((invoice.subtotal || basePriceTotal) * (order.voucher_discount / 100)).toLocaleString('id-ID')}</td></tr>` : ''}
      <tr><td class="label inv-grand">Grand Total</td><td class="val inv-grand">Rp ${Number(invoice.grand_total || order.total_price).toLocaleString('id-ID')}</td></tr>
      ${Number(order.dp_amount) > 0 ? `
      <tr><td class="label inv-dp">Down Payment (DP)</td><td class="val inv-dp">-Rp ${Number(order.dp_amount).toLocaleString('id-ID')}</td></tr>
      <tr><td class="label inv-sisa">Sisa Tagihan</td><td class="val inv-sisa">Rp ${Number(order.remaining_amount || 0).toLocaleString('id-ID')}</td></tr>
      ` : ''}
    </table>
  </div>

  ${order.notes ? `
  <div class="inv-notes">
    <div class="inv-notes-label">Catatan Pesanan</div>
    <div class="inv-notes-text">${order.notes}</div>
  </div>` : ''}

  <div class="inv-status">
    <span class="inv-status-badge ${order.status === 'selesai' ? 'inv-status-paid' : 'inv-status-unpaid'}">
      ${order.status === 'selesai' ? '✓ LUNAS' : '⏳ BELUM LUNAS'}
    </span>
  </div>

  <div class="inv-footer">
    <div class="inv-footer-info">
      <b>Vorvox.id</b><br />
      Jl. Patimura No. 45, Jeru, Kec. Tumpang<br />
      Kab. Malang, Jawa Timur 65156<br />
      WA: 0856-4111-7775 | vorvoxid@gmail.com<br />
      www.vorvox.web.id
    </div>
    <div class="inv-sign">
      <div class="inv-sign-date">Malang, ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
      <div class="inv-sign-line">Admin Vorvox</div>
      <div class="inv-sign-role">Penanggung Jawab Produksi</div>
    </div>
  </div>
</div>
</body>
</html>`;

        setShowPrintModal(false);
        setOrderToPrint(null);

        const printWindow = window.open('', '_blank');
        printWindow.document.write(printContent);
        printWindow.document.close();
        setTimeout(() => printWindow.print(), 600);
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
        let result = orders;
        // Filter by category
        if (orderCategory === 'jersey') result = result.filter(o => (o.order_type || 'jersey') === 'jersey');
        else if (orderCategory === 'sublim_dtf') result = result.filter(o => o.order_type === 'sublim_dtf');
        else if (orderCategory === 'custom_invoice') result = result.filter(o => o.order_type === 'custom_invoice');
        // Filter by status
        if (filter === 'All') return result;
        const mapFilter = { 'Pending': 'pending_payment', 'Verifying': 'pending_verification', 'Processing': 'diproses', 'Completed': 'selesai', 'Cancelled': 'dibatalkan' };
        return result.filter(o => o.status === mapFilter[filter]);
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

    const handleDownloadCSV = async () => {
        const data = filterExportData();
        if (data.length === 0) return alert('Tidak ada data pada periode ini.');

        const totalOmset = data.reduce((acc, curr) => acc + Number(curr.total_price), 0);
        const totalDP = data.reduce((acc, curr) => acc + Number(curr.dp_amount || 0), 0);
        const totalItems = data.reduce((acc, curr) => acc + Number(curr.quantity), 0);

        const wb = new ExcelJS.Workbook();
        wb.creator = 'Vorvox.id';
        const ws = wb.addWorksheet('Rekapitulasi', { properties: { defaultColWidth: 16 } });

        // Column widths
        ws.columns = [
            { width: 14 },  // A: Tanggal
            { width: 20 },  // B: ID Pesanan
            { width: 18 },  // C: Status
            { width: 22 },  // D: Klien
            { width: 24 },  // E: Email
            { width: 16 },  // F: No. HP
            { width: 22 },  // G: Produk
            { width: 22 },  // H: Variasi
            { width: 10 },  // I: Qty
            { width: 20 },  // J: DP
            { width: 20 },  // K: Total Harga
            { width: 18 },  // L: Kode Voucher
            { width: 15 },  // M: Diskon (%)
        ];

        // --- STYLES ---
        const headerFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '1B1F3B' } };
        const titleFont = { name: 'Segoe UI', bold: true, size: 16, color: { argb: 'FFFFFF' } };
        const summaryFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '0D7377' } };
        const summaryFont = { name: 'Segoe UI', bold: true, size: 11, color: { argb: 'FFFFFF' } };
        const summaryLabelFont = { name: 'Segoe UI', size: 10, color: { argb: '8899AA' } };
        const summaryValFont = { name: 'Segoe UI', bold: true, size: 11, color: { argb: '222222' } };
        const tableHeaderFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '2D2B55' } };
        const tableHeaderFont = { name: 'Segoe UI', bold: true, size: 10, color: { argb: 'FFFFFF' } };
        const oddRowFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F5F5FA' } };
        const evenRowFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFF' } };
        const dataFont = { name: 'Segoe UI', size: 10, color: { argb: '333333' } };
        const totalFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'E8F5E9' } };
        const totalFont = { name: 'Segoe UI', bold: true, size: 11, color: { argb: '1B5E20' } };
        const thinBorder = { top: { style: 'thin', color: { argb: 'D0D0D0' } }, bottom: { style: 'thin', color: { argb: 'D0D0D0' } }, left: { style: 'thin', color: { argb: 'D0D0D0' } }, right: { style: 'thin', color: { argb: 'D0D0D0' } } };

        // Status colors for cells
        const statusColors = {
            selesai: { bg: 'C8E6C9', text: '2E7D32' },
            diproses: { bg: 'E1BEE7', text: '7B1FA2' },
            paid: { bg: 'C8E6C9', text: '2E7D32' },
            pending_verification: { bg: 'BBDEFB', text: '1565C0' },
            pending_payment: { bg: 'FFF9C4', text: 'F57F17' },
            dibatalkan: { bg: 'FFCDD2', text: 'C62828' },
        };

        // === TITLE (Row 1-2) ===
        ws.mergeCells('A1:M1');
        const titleCell = ws.getCell('A1');
        titleCell.value = 'VORVOX.ID — LAPORAN REKAPITULASI PESANAN';
        titleCell.font = titleFont;
        titleCell.fill = headerFill;
        titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
        ws.getRow(1).height = 42;
        for (let i = 2; i <= 13; i++) ws.getCell(1, i).fill = headerFill;

        ws.mergeCells('A2:M2');
        const subCell = ws.getCell('A2');
        subCell.value = `Periode: ${exportRange} | Dicetak: ${new Date().toLocaleString('id-ID')}`;
        subCell.font = { name: 'Segoe UI', italic: true, size: 9, color: { argb: 'AAAAAA' } };
        subCell.fill = headerFill;
        subCell.alignment = { horizontal: 'center', vertical: 'middle' };
        ws.getRow(2).height = 22;
        for (let i = 2; i <= 13; i++) ws.getCell(2, i).fill = headerFill;

        // === SUMMARY SECTION (Row 4) ===
        ws.mergeCells('A4:M4');
        const sumBarCell = ws.getCell('A4');
        sumBarCell.value = '📊 RINGKASAN EKSEKUTIF';
        sumBarCell.font = summaryFont;
        sumBarCell.fill = summaryFill;
        sumBarCell.alignment = { horizontal: 'center', vertical: 'middle' };
        ws.getRow(4).height = 30;
        for (let i = 2; i <= 13; i++) ws.getCell(4, i).fill = summaryFill;

        // Summary details (Row 5-7)
        const summaryRows = [
            ['Total Transaksi', `${data.length} Pesanan`, 'Total Item Terjual', `${totalItems} Pcs`],
            ['Total DP Masuk', `Rp ${totalDP.toLocaleString('id-ID')}`, 'Total Omset', `Rp ${totalOmset.toLocaleString('id-ID')}`],
            ['Sisa Piutang', `Rp ${(totalOmset - totalDP).toLocaleString('id-ID')}`, '', ''],
        ];
        summaryRows.forEach((sr, i) => {
            const row = 5 + i;
            ws.getCell(`A${row}`).value = sr[0]; ws.getCell(`A${row}`).font = summaryLabelFont;
            ws.mergeCells(`B${row}:C${row}`);
            ws.getCell(`B${row}`).value = sr[1]; ws.getCell(`B${row}`).font = summaryValFont;
            ws.getCell(`E${row}`).value = sr[2]; ws.getCell(`E${row}`).font = summaryLabelFont;
            ws.mergeCells(`F${row}:G${row}`);
            ws.getCell(`F${row}`).value = sr[3]; ws.getCell(`F${row}`).font = summaryValFont;
        });

        // === TABLE HEADER (Row 9) ===
        const thRow = 9;
        const headers = ['Tanggal', 'ID Pesanan', 'Status', 'Klien', 'Email Klien', 'No. HP', 'Produk', 'Variasi', 'Qty', 'DP', 'Total Harga', 'Kode Voucher', 'Diskon (%)'];
        headers.forEach((h, i) => {
            const cell = ws.getCell(thRow, i + 1);
            cell.value = h;
            cell.font = tableHeaderFont;
            cell.fill = tableHeaderFill;
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
            cell.border = thinBorder;
        });
        ws.getRow(thRow).height = 28;

        // === DATA ROWS ===
        data.forEach((o, idx) => {
            const row = thRow + 1 + idx;
            const isOdd = idx % 2 === 0;
            const statusLabel = o.status.replace(/_/g, ' ').toUpperCase();
            const sColor = statusColors[o.status] || { bg: 'EEEEEE', text: '666666' };

            const rowData = [
                new Date(o.created_at).toLocaleDateString('id-ID'),
                o.order_code,
                statusLabel,
                o.clients?.name || '-',
                o.clients?.email || '-',
                o.clients?.phone || '-',
                o.product_name,
                `${o.bahan} / ${o.kerah}`,
                o.quantity,
                `Rp ${Number(o.dp_amount || 0).toLocaleString('id-ID')}`,
                `Rp ${Number(o.total_price).toLocaleString('id-ID')}`,
                o.voucher_code || '-',
                o.voucher_discount ? `${o.voucher_discount}%` : '-'
            ];
            rowData.forEach((val, i) => {
                const cell = ws.getCell(row, i + 1);
                cell.value = val;
                cell.font = dataFont;
                cell.fill = isOdd ? oddRowFill : evenRowFill;
                cell.border = thinBorder;
                cell.alignment = { vertical: 'middle' };

                // Special styling for status column
                if (i === 2) {
                    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: sColor.bg } };
                    cell.font = { name: 'Segoe UI', bold: true, size: 9, color: { argb: sColor.text } };
                    cell.alignment = { horizontal: 'center', vertical: 'middle' };
                }
            });
            ws.getRow(row).height = 22;
        });

        // === TOTAL ROW ===
        const totalRow = thRow + 1 + data.length;
        ws.mergeCells(`A${totalRow}:H${totalRow}`);
        ws.getCell(`A${totalRow}`).value = 'TOTAL KESELURUHAN';
        ws.getCell(`A${totalRow}`).font = totalFont;
        ws.getCell(`A${totalRow}`).fill = totalFill;
        ws.getCell(`A${totalRow}`).alignment = { horizontal: 'right', vertical: 'middle' };
        ws.getCell(`A${totalRow}`).border = thinBorder;
        for (let i = 2; i <= 8; i++) { ws.getCell(totalRow, i).fill = totalFill; ws.getCell(totalRow, i).border = thinBorder; }

        ws.getCell(`I${totalRow}`).value = totalItems;
        ws.getCell(`I${totalRow}`).font = totalFont;
        ws.getCell(`I${totalRow}`).fill = totalFill;
        ws.getCell(`I${totalRow}`).border = thinBorder;

        ws.getCell(`J${totalRow}`).value = `Rp ${totalDP.toLocaleString('id-ID')}`;
        ws.getCell(`J${totalRow}`).font = totalFont;
        ws.getCell(`J${totalRow}`).fill = totalFill;
        ws.getCell(`J${totalRow}`).border = thinBorder;

        ws.getCell(`K${totalRow}`).value = `Rp ${totalOmset.toLocaleString('id-ID')}`;
        ws.getCell(`K${totalRow}`).font = totalFont;
        ws.getCell(`K${totalRow}`).fill = totalFill;
        ws.getCell(`K${totalRow}`).border = thinBorder;

        // Kosongkan untuk kolom voucher
        ws.getCell(`L${totalRow}`).fill = totalFill; ws.getCell(`L${totalRow}`).border = thinBorder;
        ws.getCell(`M${totalRow}`).fill = totalFill; ws.getCell(`M${totalRow}`).border = thinBorder;

        ws.getRow(totalRow).height = 30;

        // Generate & download
        const buffer = await wb.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `Laporan_Pesanan_Vorvox_${exportRange.toLowerCase()}.xlsx`;
        link.click();
    };

    const handleDownloadPDF = () => {
        const data = filterExportData();
        if (data.length === 0) return alert('Tidak ada data pada periode ini.');

        const totalOmset = data.reduce((acc, curr) => acc + Number(curr.total_price), 0);
        const totalDP = data.reduce((acc, curr) => acc + Number(curr.dp_amount || 0), 0);
        const totalItems = data.reduce((acc, curr) => acc + Number(curr.quantity), 0);
        const LOGO = 'https://lh3.googleusercontent.com/d/1Vj2HKhfRS3x9JMGN0wzvTQtln18RYc_I';

        const statusBadge = (s) => {
            const map = {
                selesai: { bg: '#E8F5E9', color: '#2E7D32', label: 'SELESAI' },
                paid: { bg: '#E8F5E9', color: '#2E7D32', label: 'PAID' },
                diproses: { bg: '#F3E5F5', color: '#7B1FA2', label: 'DIPROSES' },
                pending_verification: { bg: '#E3F2FD', color: '#1565C0', label: 'VERIFIKASI' },
                pending_payment: { bg: '#FFF8E1', color: '#F57F17', label: 'PENDING' },
                dibatalkan: { bg: '#FFEBEE', color: '#C62828', label: 'BATAL' },
            };
            const m = map[s] || { bg: '#eee', color: '#666', label: s.toUpperCase() };
            return `<span style="background:${m.bg};color:${m.color};padding:3px 10px;border-radius:12px;font-size:9px;font-weight:800;letter-spacing:1px;">${m.label}</span>`;
        };

        const printContent = `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Rekapitulasi Pesanan - ${exportRange}</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Inter', sans-serif; color: #1a1a1a; background: #fff; }
  @page { size: A4 landscape; margin: 12mm; }
  @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
  .rk-container { max-width: 1100px; margin: 0 auto; padding: 30px; }
  .rk-header { display: flex; justify-content: space-between; align-items: center; padding-bottom: 20px; border-bottom: 3px solid #1B1F3B; }
  .rk-logo-area { display: flex; align-items: center; gap: 14px; }
  .rk-logo-area img { width: 48px; height: 48px; object-fit: contain; }
  .rk-brand h1 { font-size: 22px; font-weight: 900; letter-spacing: 3px; color: #1B1F3B; }
  .rk-brand p { font-size: 9px; color: #999; letter-spacing: 1.5px; text-transform: uppercase; }
  .rk-title-area { text-align: right; }
  .rk-title-area h2 { font-size: 16px; font-weight: 800; color: #1B1F3B; letter-spacing: 2px; text-transform: uppercase; }
  .rk-title-area .rk-meta { font-size: 10px; color: #999; margin-top: 4px; }
  .rk-summary { display: flex; gap: 16px; margin-top: 24px; }
  .rk-stat { flex: 1; background: #F8F9FB; border: 1px solid #eee; border-radius: 8px; padding: 16px; }
  .rk-stat-label { font-size: 9px; letter-spacing: 2px; text-transform: uppercase; color: #aaa; font-weight: 700; }
  .rk-stat-val { font-size: 22px; font-weight: 800; color: #1B1F3B; margin-top: 4px; }
  .rk-stat-sub { font-size: 10px; color: #999; margin-top: 2px; }
  .rk-stat.green { border-left: 4px solid #2E7D32; }
  .rk-stat.blue { border-left: 4px solid #1565C0; }
  .rk-stat.teal { border-left: 4px solid #0D7377; }
  .rk-stat.red { border-left: 4px solid #C62828; }
  .rk-table-title { margin-top: 28px; font-size: 10px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; color: #1B1F3B; padding-bottom: 8px; border-bottom: 2px solid #1B1F3B; }
  .rk-table { width: 100%; border-collapse: collapse; margin-top: 0; font-size: 11px; }
  .rk-table thead th { background: #1B1F3B; color: #fff; padding: 10px 8px; font-size: 9px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; text-align: left; }
  .rk-table thead th:nth-child(n+5) { text-align: right; }
  .rk-table thead th:nth-child(4) { text-align: center; }
  .rk-table tbody tr { border-bottom: 1px solid #f0f0f0; }
  .rk-table tbody tr:nth-child(even) { background: #FAFAFA; }
  .rk-table tbody td { padding: 9px 8px; vertical-align: middle; }
  .rk-table tbody td:nth-child(n+5) { text-align: right; }
  .rk-table tbody td:nth-child(4) { text-align: center; }
  .rk-total-row td { background: #E8F5E9 !important; font-weight: 800; color: #1B5E20; font-size: 12px; padding: 12px 8px !important; border-top: 2px solid #2E7D32; }
  .rk-footer { margin-top: 40px; display: flex; justify-content: space-between; align-items: flex-end; padding-top: 16px; border-top: 1px solid #eee; }
  .rk-footer-info { font-size: 9px; color: #bbb; line-height: 1.8; }
  .rk-sign { text-align: center; width: 200px; }
  .rk-sign-date { font-size: 10px; color: #888; }
  .rk-sign-line { margin-top: 50px; border-top: 1px solid #333; padding-top: 6px; font-size: 11px; font-weight: 700; color: #1B1F3B; }
  .rk-sign-role { font-size: 9px; color: #999; }
</style>
</head>
<body>
<div class="rk-container">
  <div class="rk-header">
    <div class="rk-logo-area">
      <img src="${LOGO}" alt="Vorvox Logo" />
      <div class="rk-brand">
        <h1>VORVOX.ID</h1>
        <p>Vendor Sublim & Konveksi Sportswear</p>
      </div>
    </div>
    <div class="rk-title-area">
      <h2>Laporan Rekapitulasi</h2>
      <div class="rk-meta">Periode: ${exportRange} &bull; Dicetak: ${new Date().toLocaleString('id-ID')}</div>
    </div>
  </div>

  <div class="rk-summary">
    <div class="rk-stat blue">
      <div class="rk-stat-label">Total Transaksi</div>
      <div class="rk-stat-val">${data.length}</div>
      <div class="rk-stat-sub">Pesanan</div>
    </div>
    <div class="rk-stat teal">
      <div class="rk-stat-label">Total Item</div>
      <div class="rk-stat-val">${totalItems}</div>
      <div class="rk-stat-sub">Pcs Produksi</div>
    </div>
    <div class="rk-stat green">
      <div class="rk-stat-label">Total Omset</div>
      <div class="rk-stat-val">Rp ${totalOmset.toLocaleString('id-ID')}</div>
      <div class="rk-stat-sub">Keseluruhan</div>
    </div>
    <div class="rk-stat red">
      <div class="rk-stat-label">Sisa Piutang</div>
      <div class="rk-stat-val">Rp ${(totalOmset - totalDP).toLocaleString('id-ID')}</div>
      <div class="rk-stat-sub">Belum dibayar penuh</div>
    </div>
  </div>

  <div class="rk-table-title">Detail Transaksi</div>
  <table class="rk-table">
    <thead>
      <tr>
        <th>No</th>
        <th>Tanggal</th>
        <th>ID / Klien</th>
        <th>Status</th>
        <th>Produk</th>
        <th>Qty</th>
        <th>DP</th>
        <th>Total</th>
      </tr>
    </thead>
    <tbody>
      ${data.map((o, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${new Date(o.created_at).toLocaleDateString('id-ID')}</td>
        <td><b>${o.order_code}</b><br /><span style="color:#888;font-size:10px;">${o.clients?.name || '-'}</span></td>
        <td>${statusBadge(o.status)}</td>
        <td>${o.product_name}<br /><span style="color:#888;font-size:10px;">${o.order_type === 'sublim_dtf' ? (o.fabric_source === 'vorvox' ? 'Kain Vorvox' : 'Kain Sendiri') : `${o.bahan} / ${o.kerah}`}</span></td>
        <td style="text-align:center;font-weight:600;">${o.order_type === 'sublim_dtf' ? (o.meter_qty || o.quantity) + ' m' : o.quantity}</td>
        <td>Rp ${Number(o.dp_amount || 0).toLocaleString('id-ID')}</td>
        <td style="font-weight:600;">Rp ${Number(o.total_price).toLocaleString('id-ID')}</td>
      </tr>`).join('')}
      <tr class="rk-total-row">
        <td colspan="5" style="text-align:right;">TOTAL KESELURUHAN</td>
        <td style="text-align:center;">${totalItems}</td>
        <td>Rp ${totalDP.toLocaleString('id-ID')}</td>
        <td>Rp ${totalOmset.toLocaleString('id-ID')}</td>
      </tr>
    </tbody>
  </table>

  <div class="rk-footer">
    <div class="rk-footer-info">
      <b style="color:#888;">Vorvox.id</b><br />
      Jl. Patimura No. 45, Jeru, Kec. Tumpang, Kab. Malang<br />
      Jawa Timur 65156 | WA: 0856-4111-7775<br />
      vorvoxid@gmail.com | www.vorvox.web.id
    </div>
    <div class="rk-sign">
      <div class="rk-sign-date">Malang, ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
      <div class="rk-sign-line">Admin Vorvox</div>
      <div class="rk-sign-role">Penanggung Jawab Produksi</div>
    </div>
  </div>
</div>
</body>
</html>`;

        const printWindow = window.open('', '_blank');
        printWindow.document.write(printContent);
        printWindow.document.close();
        setTimeout(() => printWindow.print(), 600);
    };

    return (
        <div className="bg-neutral-900 border border-neutral-800">
            <div className="p-6 border-b border-neutral-800 flex flex-col gap-4">
                <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
                    <h2 className="text-white font-bold uppercase tracking-widest text-lg">Daftar Pesanan Client</h2>
                    <div className="flex gap-4 flex-wrap items-center">

                        {/* Custom Invoice Button */}
                        <button onClick={() => setShowCustomInvoice(true)}
                            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-[10px] font-bold uppercase tracking-widest rounded hover:from-purple-500 hover:to-blue-500 transition-all flex items-center gap-2 whitespace-nowrap shadow-lg shadow-purple-900/30">
                            <span className="text-base leading-none">+</span> Buat Custom Invoice
                        </button>

                        <div className="h-6 w-px bg-neutral-800 hidden sm:block"></div>

                        {/* Category Tabs */}
                        <div className="flex gap-1 p-1 bg-black rounded border border-neutral-800">
                            {[{ key: 'all', label: 'Semua' }, { key: 'jersey', label: 'Jersey' }, { key: 'sublim_dtf', label: 'Sublim / DTF' }, { key: 'custom_invoice', label: 'Custom Invoice' }].map(cat => (
                                <button key={cat.key} onClick={() => setOrderCategory(cat.key)}
                                    className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-all rounded-sm ${orderCategory === cat.key ? 'bg-purple-600 text-white' : 'bg-transparent text-neutral-400 hover:text-white'}`}>
                                    {cat.label}
                                </button>
                            ))}
                        </div>

                        <div className="h-6 w-px bg-neutral-800 hidden sm:block"></div>
                        <div className="flex gap-2 p-1 bg-black rounded border border-neutral-800">
                            {['All', 'Pending', 'Verifying', 'Processing', 'Completed'].map(f => (
                                <button key={f} onClick={() => setFilter(f)}
                                    className={`px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-all rounded-sm ${filter === f ? 'bg-white text-black' : 'bg-transparent text-neutral-400 hover:text-white'}`}>
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
                                        <td className="p-4 font-mono text-white text-xs">{o.order_code}{o.order_type === 'custom_invoice' && <span className="ml-1 px-1.5 py-0.5 bg-purple-600/30 text-purple-400 text-[8px] font-bold uppercase tracking-wider rounded border border-purple-600/50">Custom</span>}</td>
                                        <td className="p-4 font-bold text-white">{o.clients?.name} <span className="block font-normal text-xs text-neutral-500">{o.clients?.phone}</span></td>
                                        <td className="p-4">{o.product_name}</td>
                                        <td className="p-4 text-white">{o.order_type === 'sublim_dtf' ? `${o.meter_qty || o.quantity} meter` : `${o.quantity} pcs`}</td>
                                        <td className="p-4">{new Date(o.created_at).toLocaleDateString('id-ID')}</td>
                                        <td className="p-4">
                                            <select
                                                value={o.status}
                                                onChange={(e) => handleChangeStatus(o.id, e.target.value)}
                                                className={`px-2 py-1 outline-none text-[10px] font-bold uppercase tracking-wide border rounded cursor-pointer ${statusColor(o.status)}`}
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
                                                {((o.design_urls && o.design_urls.length > 0) || (o.logo_urls && o.logo_urls.length > 0)) && (
                                                    <button onClick={() => setFileModal({ isOpen: true, order: o })} className="px-3 py-1.5 bg-blue-600/20 border border-blue-600 text-blue-400 hover:bg-blue-600 hover:text-white rounded transition-colors text-[10px] font-bold uppercase whitespace-nowrap">
                                                        Lihat File
                                                    </button>
                                                )}
                                                {o.jersey_players && o.jersey_players.length > 0 && (
                                                    <button onClick={() => handleExportPlayers(o)} className="px-3 py-1.5 bg-green-600/20 border border-green-600 text-green-400 hover:bg-green-600 hover:text-white rounded transition-colors text-[10px] font-bold uppercase whitespace-nowrap">
                                                        Unduh Data Pemain
                                                    </button>
                                                )}
                                                <button onClick={() => handlePrintInvoice(o)} className="px-3 py-1.5 bg-white text-black hover:bg-gray-200 rounded transition-colors text-[10px] font-bold uppercase whitespace-nowrap">
                                                    Print/PDF INV
                                                </button>
                                                <button onClick={() => setEditInvoiceOrder(o)} className="px-3 py-1.5 bg-yellow-600/20 border border-yellow-600 text-yellow-400 hover:bg-yellow-600 hover:text-white rounded transition-colors text-[10px] font-bold uppercase whitespace-nowrap flex items-center gap-1">
                                                    <Edit size={12} /> Edit Invoice
                                                </button>
                                                <button onClick={() => handleDeleteOrder(o.id, o.order_code)} className="px-3 py-1.5 bg-red-900/30 border border-red-900 text-red-400 hover:bg-red-600 hover:text-white rounded transition-colors text-[10px] font-bold uppercase whitespace-nowrap">
                                                    Hapus
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

                {/* File Viewer Modal */}
                {
                    fileModal.isOpen && fileModal.order && (() => {
                        const o = fileModal.order;
                        const allFiles = [...(o.design_urls || []), ...(o.logo_urls || [])];
                        const isImage = (url) => /\.(jpg|jpeg|png|gif|webp|svg|bmp)$/i.test(url);
                        return (
                            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                                <div className="bg-neutral-900 border border-neutral-800 w-full max-w-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
                                    <div className="p-4 border-b border-neutral-800 flex justify-between items-center bg-black shrink-0">
                                        <h3 className="text-white font-bold uppercase tracking-widest text-sm">File Upload — {o.order_code}</h3>
                                        <button onClick={() => setFileModal({ isOpen: false, order: null })} className="text-neutral-500 hover:text-white">✕</button>
                                    </div>
                                    <div className="p-6 overflow-y-auto">
                                        {allFiles.length === 0 ? (
                                            <p className="text-neutral-500 text-sm text-center">Tidak ada file terupload.</p>
                                        ) : (
                                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                                {allFiles.map((url, idx) => (
                                                    <div key={idx} className="bg-black border border-neutral-800 rounded overflow-hidden">
                                                        {isImage(url) ? (
                                                            <a href={url} target="_blank" rel="noreferrer">
                                                                <img src={url} alt={`File ${idx + 1}`} className="w-full h-32 object-cover hover:opacity-80 transition-opacity" />
                                                            </a>
                                                        ) : (
                                                            <div className="h-32 flex items-center justify-center">
                                                                <div className="text-center">
                                                                    <div className="text-2xl mb-2">📄</div>
                                                                    <p className="text-neutral-400 text-[10px] font-bold uppercase">{url.split('.').pop()}</p>
                                                                </div>
                                                            </div>
                                                        )}
                                                        <a href={url} download target="_blank" rel="noreferrer" className="block w-full py-2 bg-neutral-800 text-center text-xs text-neutral-300 hover:bg-neutral-700 hover:text-white font-bold uppercase tracking-widest transition-colors">
                                                            Download
                                                        </a>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })()
                }

                {/* Custom Invoice Creator Modal */}
                {showCustomInvoice && (
                    <CustomInvoiceCreator onClose={() => setShowCustomInvoice(false)} onSaved={fetchOrders} />
                )}

                {/* Invoice Editor Modal */}
                {editInvoiceOrder && (
                    <InvoiceEditor order={editInvoiceOrder} onClose={() => setEditInvoiceOrder(null)} onSaved={fetchOrders} />
                )}
            </div>
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

    // Sublim pricing
    const [sublimPricing, setSublimPricing] = useState({ sublim_per_meter: 0, dtf_per_meter: 0, fabric_vorvox_extra: 0, dp_percentage: 50 });
    const [sleevePricing, setSleevePricing] = useState({ lengan_panjang_extra: 10000 });

    const [loadingParams, setLoadingParams] = useState(false);

    // Vouchers
    const [vouchers, setVouchers] = useState([]);
    const [loadingVouchers, setLoadingVouchers] = useState(false);
    const [newVoucherDiscount, setNewVoucherDiscount] = useState(10);

    const generateVoucherCode = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        const p1 = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
        const p2 = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
        return `${p1}-${p2}`;
    };

    const fetchVouchers = async () => {
        setLoadingVouchers(true);
        const { data, error } = await supabase.from('vouchers').select('*, voucher_usage(count)').order('created_at', { ascending: false });
        if (!error && data) {
            let hasUpdates = false;
            const now = new Date();
            const mapped = await Promise.all(data.map(async (v) => {
                const expDate = v.expires_at ? new Date(v.expires_at) : null;
                if (expDate && expDate < now && v.is_active) {
                    const newCode = generateVoucherCode();
                    const nextWeek = new Date();
                    nextWeek.setDate(nextWeek.getDate() + 7);

                    const { error: updErr } = await supabase.from('vouchers').update({
                        code: newCode,
                        expires_at: nextWeek.toISOString(),
                    }).eq('id', v.id);

                    if (!updErr) {
                        hasUpdates = true;
                        return { ...v, code: newCode, expires_at: nextWeek.toISOString(), usage_count: v.voucher_usage?.[0]?.count || 0 };
                    }
                }
                return { ...v, usage_count: v.voucher_usage?.[0]?.count || 0 };
            }));

            if (hasUpdates) {
                fetchVouchers(); // Refresh to get fresh data
                return;
            } else {
                setVouchers(mapped);
            }
        }
        setLoadingVouchers(false);
    };

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

        // Fetch Sublim Pricing
        supabase.from('site_content').select('value_json').eq('key', 'sublim_pricing').maybeSingle().then(({ data }) => {
            if (data?.value_json) setSublimPricing(data.value_json);
        });

        // Fetch Sleeve Pricing
        supabase.from('site_content').select('value_json').eq('key', 'sleeve_pricing').maybeSingle().then(({ data }) => {
            if (data?.value_json) setSleevePricing(data.value_json);
        });

        fetchVouchers();
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
        }, { onConflict: 'key' });
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
        }, { onConflict: 'key' });
        setLoadingAdmins(false);
        if (error) return alert('Gagal menghapus admin: ' + error.message);
        setAdminEmails(updated);
        alert(`${emailToRemove} telah dihapus dari daftar admin.`);
    };

    const handleSaveSublimPricing = async () => {
        setLoadingParams(true);
        const { error } = await supabase.from('site_content').upsert({
            key: 'sublim_pricing',
            value_json: sublimPricing
        }, { onConflict: 'key' });
        setLoadingParams(false);
        if (error) alert('Gagal menyimpan harga: ' + error.message);
        else alert('Harga Sublim / DTF berhasil disimpan!');
    };

    const handleSaveSleevePricing = async () => {
        setLoadingParams(true);
        const { error } = await supabase.from('site_content').upsert({
            key: 'sleeve_pricing',
            value_json: sleevePricing
        }, { onConflict: 'key' });
        setLoadingParams(false);
        if (error) alert('Gagal menyimpan harga lengan: ' + error.message);
        else alert('Harga lengan panjang berhasil disimpan!');
    };

    const handleCreateVoucher = async () => {
        const code = generateVoucherCode();
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        const { error } = await supabase.from('vouchers').insert({
            code,
            discount_percent: newVoucherDiscount,
            expires_at: expiresAt.toISOString(),
            is_active: true
        });

        if (error) return alert('Gagal membuat voucher: ' + error.message);
        setNewVoucherDiscount(10);
        fetchVouchers();
    };

    const handleDeleteVoucher = async (id, code) => {
        if (!confirm(`Hapus voucher ${code}?`)) return;
        const { error } = await supabase.from('vouchers').delete().eq('id', id);
        if (error) return alert('Gagal menghapus: ' + error.message);
        fetchVouchers();
    };

    const handleToggleVoucher = async (id, currentStatus) => {
        const { error } = await supabase.from('vouchers').update({ is_active: !currentStatus }).eq('id', id);
        if (error) return alert('Gagal update status: ' + error.message);
        fetchVouchers();
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

            {/* Sublim / DTF Pricing Section */}
            <div className="bg-neutral-900 border border-neutral-800 p-6 md:p-8">
                <div className="flex items-center gap-4 mb-6">
                    <Layers size={28} className="text-purple-400" />
                    <div>
                        <h2 className="text-white font-bold uppercase tracking-widest text-lg">Harga Sublim / DTF</h2>
                        <p className="text-neutral-500 text-xs mt-1">Atur harga per meter, tambahan kain, dan DP yang ditampilkan pada form order klien.</p>
                    </div>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-black border border-neutral-800 p-4">
                        <label className="block text-[10px] text-neutral-500 uppercase tracking-widest mb-2">Harga Sublim / Meter (Rp)</label>
                        <input type="number" value={sublimPricing.sublim_per_meter}
                            onChange={e => setSublimPricing({ ...sublimPricing, sublim_per_meter: Number(e.target.value) })}
                            className="w-full bg-neutral-900 border border-neutral-700 text-white p-3 outline-none text-sm" />
                    </div>
                    <div className="bg-black border border-neutral-800 p-4">
                        <label className="block text-[10px] text-neutral-500 uppercase tracking-widest mb-2">Harga DTF / Meter (Rp)</label>
                        <input type="number" value={sublimPricing.dtf_per_meter}
                            onChange={e => setSublimPricing({ ...sublimPricing, dtf_per_meter: Number(e.target.value) })}
                            className="w-full bg-neutral-900 border border-neutral-700 text-white p-3 outline-none text-sm" />
                    </div>
                    <div className="bg-black border border-neutral-800 p-4">
                        <label className="block text-[10px] text-neutral-500 uppercase tracking-widest mb-2">Tambahan Kain Vorvox / Meter (Rp)</label>
                        <input type="number" value={sublimPricing.fabric_vorvox_extra}
                            onChange={e => setSublimPricing({ ...sublimPricing, fabric_vorvox_extra: Number(e.target.value) })}
                            className="w-full bg-neutral-900 border border-neutral-700 text-white p-3 outline-none text-sm" />
                    </div>
                    <div className="bg-black border border-neutral-800 p-4">
                        <label className="block text-[10px] text-neutral-500 uppercase tracking-widest mb-2">DP Percentage (%)</label>
                        <input type="number" min="1" max="100" value={sublimPricing.dp_percentage}
                            onChange={e => setSublimPricing({ ...sublimPricing, dp_percentage: Number(e.target.value) })}
                            className="w-full bg-neutral-900 border border-neutral-700 text-white p-3 outline-none text-sm" />
                    </div>
                </div>
                <button onClick={handleSaveSublimPricing} disabled={loadingParams}
                    className="w-full py-3 mt-4 bg-purple-600 text-white font-bold uppercase text-xs tracking-widest hover:bg-purple-500 disabled:opacity-50 transition-colors">
                    {loadingParams ? 'Menyimpan...' : 'Simpan Harga Sublim / DTF'}
                </button>
            </div>

            {/* Sleeve Pricing Section */}
            <div className="bg-neutral-900 border border-neutral-800 p-6 md:p-8">
                <div className="flex items-center gap-4 mb-6">
                    <Layers size={28} className="text-blue-400" />
                    <div>
                        <h2 className="text-white font-bold uppercase tracking-widest text-lg">Harga Tambahan Lengan Panjang</h2>
                        <p className="text-neutral-500 text-xs mt-1">Biaya extra per pcs jika pemain memilih Lengan Panjang.</p>
                    </div>
                </div>
                <div className="bg-black border border-neutral-800 p-4 max-w-sm">
                    <label className="block text-[10px] text-neutral-500 uppercase tracking-widest mb-2">Tambahan Harga Lengan Panjang (Rp)</label>
                    <input type="number" value={sleevePricing.lengan_panjang_extra}
                        onChange={e => setSleevePricing({ lengan_panjang_extra: Number(e.target.value) })}
                        className="w-full bg-neutral-900 border border-neutral-700 text-white p-3 outline-none text-sm" />
                </div>
                <button onClick={handleSaveSleevePricing} disabled={loadingParams}
                    className="w-full max-w-sm py-3 mt-4 bg-blue-600 text-white font-bold uppercase text-xs tracking-widest hover:bg-blue-500 disabled:opacity-50 transition-colors">
                    {loadingParams ? 'Menyimpan...' : 'Simpan Harga Lengan'}
                </button>
            </div>

            {/* Vouchers Management Section */}
            <div className="bg-neutral-900 border border-neutral-800 p-6 md:p-8">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-4">
                        <Ticket size={28} className="text-yellow-400" />
                        <div>
                            <h2 className="text-white font-bold uppercase tracking-widest text-lg">Manajemen Voucher</h2>
                            <p className="text-neutral-500 text-xs mt-1">Buat kode diskon untuk klien. Expired otomatis reset & renew (7 hari).</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <input type="number" min="1" max="100" value={newVoucherDiscount} onChange={e => setNewVoucherDiscount(Number(e.target.value))}
                            className="w-20 bg-black border border-neutral-700 text-white p-2 outline-none text-sm text-center" placeholder="%" />
                        <span className="text-neutral-500 text-xs font-bold uppercase tracking-widest">% Diskon</span>
                        <button onClick={handleCreateVoucher} className="ml-2 px-4 py-2 bg-yellow-600/20 text-yellow-500 border border-yellow-600 hover:bg-yellow-600 hover:text-white text-xs font-bold uppercase tracking-widest transition-colors flex items-center gap-2">
                            <Plus size={14} /> Buat
                        </button>
                    </div>
                </div>

                {loadingVouchers ? (
                    <div className="p-8 flex justify-center"><Loader2 size={24} className="animate-spin text-neutral-500" /></div>
                ) : (
                    <div className="overflow-x-auto bg-black border border-neutral-800">
                        <table className="w-full text-left min-w-[600px]">
                            <thead>
                                <tr className="border-b border-neutral-800 bg-neutral-900">
                                    <th className="p-4 text-xs font-bold uppercase tracking-widest text-neutral-500">Kode Voucher</th>
                                    <th className="p-4 text-xs font-bold uppercase tracking-widest text-neutral-500 text-center">Diskon</th>
                                    <th className="p-4 text-xs font-bold uppercase tracking-widest text-neutral-500 text-center">Status</th>
                                    <th className="p-4 text-xs font-bold uppercase tracking-widest text-neutral-500 text-center">Usage</th>
                                    <th className="p-4 text-xs font-bold uppercase tracking-widest text-neutral-500 text-center">Expired At</th>
                                    <th className="p-4 text-xs font-bold uppercase tracking-widest text-neutral-500 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {vouchers.map(v => (
                                    <tr key={v.id} className="border-b border-neutral-800/50 hover:bg-neutral-900/50">
                                        <td className="p-4 font-mono text-white font-bold">{v.code}</td>
                                        <td className="p-4 text-center text-yellow-400 font-bold">{v.discount_percent}%</td>
                                        <td className="p-4 text-center">
                                            <button onClick={() => handleToggleVoucher(v.id, v.is_active)} className={`px-2 py-1 text-[10px] font-bold uppercase tracking-widest rounded transition-colors ${v.is_active ? 'bg-green-900/40 text-green-400 hover:bg-green-900/80' : 'bg-red-900/40 text-red-500 hover:bg-red-900/80'}`}>
                                                {v.is_active ? 'Aktif' : 'Nonaktif'}
                                            </button>
                                        </td>
                                        <td className="p-4 text-center text-neutral-400 text-xs font-mono">{v.usage_count}x Pakai</td>
                                        <td className="p-4 text-center text-neutral-400 text-xs font-mono">{v.expires_at ? new Date(v.expires_at).toLocaleDateString('id-ID') : '-'}</td>
                                        <td className="p-4 text-right">
                                            <button onClick={() => handleDeleteVoucher(v.id, v.code)} className="px-3 py-1.5 bg-red-900/30 border border-red-900 text-red-400 hover:bg-red-600 hover:text-white rounded transition-colors text-[10px] font-bold uppercase tracking-widest">
                                                Hapus
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {vouchers.length === 0 && (
                                    <tr><td colSpan="6" className="p-8 text-center text-neutral-500 text-sm">Belum ada data voucher.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
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
        { id: 'vendor_sublim', icon: <Layers size={20} />, label: 'Sublim / DTF' },
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
        // Cek session saat ini (termasuk setelah redirect dari Google)
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user) {
                if (FALLBACK_ADMIN_EMAILS.includes(session.user.email)) {
                    setUser(session.user);
                } else {
                    setAccessError(`Email ${session.user.email} tidak memiliki akses admin.`);
                    supabase.auth.signOut();
                    setUser(null);
                }
            } else {
                setUser(null);
            }
        });

        // Listen perubahan auth state
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session?.user) {
                if (FALLBACK_ADMIN_EMAILS.includes(session.user.email)) {
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
