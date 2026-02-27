import React, { useState, useEffect } from 'react';
import { supabase } from './supabase';
import {
    LayoutDashboard, ShoppingBag, Users, Settings,
    LogOut, Bell, Chrome, ShieldOff, MoreVertical,
    Folder, FileText, Image as ImageIcon, Layers, Table, Package, DollarSign
} from 'lucide-react';
import ProductsManager from './components/admin/ProductsManager';
import PortfolioManager from './components/admin/PortfolioManager';
import ContentManager from './components/admin/ContentManager';
import VendorSublimManager from './components/admin/VendorSublimManager';
import PageDataManager from './components/admin/PageDataManager';

// ─── Konfigurasi ─────────────────────────────────────────────────
const ALLOWED_EMAILS = [
    'mhmmadridho64@gmail.com',
    'ridhofebriyansyah75@gmail.com',
];

// ─── Data Dummy ──────────────────────────────────────────────────
const initialOrders = [
    { id: '#ORD-001', client: 'PT. Teknologi Maju', type: 'Seragam Kantor', qty: 50, date: '2026-02-10', status: 'Pending', total: 'Rp 7.500.000' },
    { id: '#ORD-002', client: 'Komunitas Motor BDG', type: 'Hoodie Zipper', qty: 24, date: '2026-02-12', status: 'Processing', total: 'Rp 4.800.000' },
    { id: '#ORD-003', client: 'Cafe Senja', type: 'Apron Canvas', qty: 15, date: '2026-02-14', status: 'Completed', total: 'Rp 2.250.000' },
    { id: '#ORD-004', client: 'Univ. Indonesia (Event)', type: 'Kaos Event', qty: 200, date: '2026-02-15', status: 'Pending', total: 'Rp 15.000.000' },
    { id: '#ORD-005', client: 'StartUp Indo', type: 'Polo Shirt', qty: 30, date: '2026-02-16', status: 'Processing', total: 'Rp 3.600.000' },
];

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

// ─── Dashboard ────────────────────────────────────────────────────
const Dashboard = () => (
    <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
                { title: 'Total Pendapatan', value: 'Rp 128.5M', icon: <DollarSign />, change: '+12.5%' },
                { title: 'Pesanan Aktif', value: '24', icon: <ShoppingBag />, change: '+4' },
                { title: 'Produksi Selesai', value: '1.240', icon: <Package />, change: '+18%' },
                { title: 'Klien Baru', value: '8', icon: <Users />, change: '+2' },
            ].map((stat, idx) => (
                <div key={idx} className="bg-neutral-900 border border-neutral-800 p-6 hover:border-neutral-700 transition-colors">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-black text-white rounded-lg">{stat.icon}</div>
                        <span className="text-green-400 text-xs font-bold bg-green-900/20 px-2 py-1 rounded">{stat.change}</span>
                    </div>
                    <h3 className="text-neutral-400 text-xs uppercase tracking-widest font-bold mb-1">{stat.title}</h3>
                    <div className="text-2xl font-black text-white">{stat.value}</div>
                </div>
            ))}
        </div>
        <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-neutral-900 border border-neutral-800 p-6">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-white font-bold uppercase tracking-wider text-sm">Statistik Produksi</h3>
                    <select className="bg-black text-white text-xs p-2 border border-neutral-800 outline-none">
                        <option>Bulan Ini</option><option>Tahun Ini</option>
                    </select>
                </div>
                <div className="h-64 flex items-end gap-3">
                    {[40, 65, 45, 80, 55, 90, 70, 85].map((h, i) => (
                        <div key={i} className="flex-1 bg-neutral-800 hover:bg-white transition-colors relative group cursor-pointer" style={{ height: `${h}%` }}>
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white text-black text-xs font-bold px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">{h}%</div>
                        </div>
                    ))}
                </div>
                <div className="flex justify-between mt-4 text-xs text-neutral-500 uppercase font-bold tracking-widest">
                    <span>M1</span><span>M2</span><span>M3</span><span>M4</span>
                </div>
            </div>
            <div className="bg-neutral-900 border border-neutral-800 p-6">
                <h3 className="text-white font-bold uppercase tracking-wider text-sm mb-6">Target Bulanan</h3>
                {[{ label: 'Sablon', pct: 75, done: '1500', total: '2000' }, { label: 'Bordir', pct: 45, done: '450', total: '1000' }, { label: 'Jahit', pct: 90, done: '900', total: '1000' }].map(({ label, pct, done, total }) => (
                    <div key={label} className="mb-6 last:mb-0">
                        <div className="flex justify-between text-xs mb-2">
                            <span className="text-neutral-400">{label} ({pct}%)</span>
                            <span className="text-white font-bold">{done}/{total} pcs</span>
                        </div>
                        <div className="w-full h-3 bg-neutral-800 rounded-full">
                            <div className="h-full bg-white rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
);

// ─── Orders ───────────────────────────────────────────────────────
const Orders = () => {
    const [filter, setFilter] = useState('All');
    const statusColor = (s) => ({
        Completed: 'bg-green-900/30 text-green-400 border-green-900',
        Processing: 'bg-blue-900/30 text-blue-400 border-blue-900',
        Pending: 'bg-yellow-900/30 text-yellow-400 border-yellow-900',
    }[s] || 'bg-neutral-800 text-neutral-400');
    const filtered = filter === 'All' ? initialOrders : initialOrders.filter(o => o.status === filter);
    return (
        <div className="bg-neutral-900 border border-neutral-800">
            <div className="p-6 border-b border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h2 className="text-white font-bold uppercase tracking-widest text-lg">Daftar Pesanan</h2>
                <div className="flex gap-2 flex-wrap">
                    {['All', 'Pending', 'Processing', 'Completed'].map(f => (
                        <button key={f} onClick={() => setFilter(f)}
                            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border transition-all ${filter === f ? 'bg-white text-black border-white' : 'bg-transparent text-neutral-400 border-neutral-700 hover:border-white'}`}>
                            {f}
                        </button>
                    ))}
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-neutral-400">
                    <thead className="bg-black text-neutral-500 uppercase tracking-wider text-xs font-bold border-b border-neutral-800">
                        <tr>{['ID Pesanan', 'Klien', 'Jenis', 'Qty', 'Tanggal', 'Status', 'Total', 'Aksi'].map(h => <th key={h} className="p-4">{h}</th>)}</tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-800">
                        {filtered.map(o => (
                            <tr key={o.id} className="hover:bg-neutral-800/50 transition-colors">
                                <td className="p-4 font-mono text-white">{o.id}</td>
                                <td className="p-4 font-bold text-white">{o.client}</td>
                                <td className="p-4">{o.type}</td>
                                <td className="p-4 text-white">{o.qty} pcs</td>
                                <td className="p-4">{o.date}</td>
                                <td className="p-4"><span className={`px-3 py-1 text-xs font-bold uppercase tracking-wide border rounded ${statusColor(o.status)}`}>{o.status}</span></td>
                                <td className="p-4 text-white font-mono">{o.total}</td>
                                <td className="p-4 text-right"><button className="p-2 hover:bg-white hover:text-black rounded transition-colors"><MoreVertical size={16} /></button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="p-4 border-t border-neutral-800 text-center text-xs text-neutral-500 uppercase tracking-widest cursor-pointer hover:text-white transition-colors">
                Lihat Semua Pesanan
            </div>
        </div>
    );
};

// ─── Settings ─────────────────────────────────────────────────────
const SettingsPage = () => (
    <div className="bg-neutral-900 border border-neutral-800 p-8 min-h-[400px] flex flex-col items-center justify-center text-neutral-500">
        <Settings size={48} className="mb-4 text-neutral-700" />
        <h3 className="text-white font-bold uppercase tracking-widest mb-2">Pengaturan Akun</h3>
        <p className="text-sm">Fitur konfigurasi sistem admin akan tersedia segera.</p>
    </div>
);

// ─── Admin Panel Shell ────────────────────────────────────────────
const AdminPanel = ({ user, onLogout }) => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const menuItems = [
        { id: 'dashboard', icon: <LayoutDashboard size={20} />, label: 'Beranda Admin' },
        { id: 'orders', icon: <ShoppingBag size={20} />, label: 'Pesanan' },
        { id: 'products', icon: <Package size={20} />, label: 'Katalog Produk' },
        { id: 'vendor_sublim', icon: <Layers size={20} />, label: 'Vendor Sublim' },
        { id: 'page_data', icon: <Table size={20} />, label: 'Data Tabel & Info' },
        { id: 'portfolio', icon: <ImageIcon size={20} />, label: 'Galeri Portofolio' },
        { id: 'content', icon: <FileText size={20} />, label: 'Konten Teks Web' },
        { id: 'settings', icon: <Settings size={20} />, label: 'Pengaturan' },
    ];
    const avatar = user?.user_metadata?.avatar_url;
    const name = user?.user_metadata?.full_name || user?.email;

    return (
        <div className="flex min-h-screen bg-black text-white">
            {/* Sidebar */}
            <aside className="w-64 border-r border-neutral-800 bg-black flex-shrink-0 fixed h-full z-10 hidden md:flex flex-col">
                <div className="p-8 border-b border-neutral-800">
                    <h1 className="text-xl font-black tracking-tighter">VORVOX<span className="text-neutral-500">.ADMIN</span></h1>
                </div>
                <nav className="flex-1 p-4 space-y-1">
                    {menuItems.map(item => (
                        <button key={item.id} onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center gap-4 px-4 py-3 text-sm font-bold uppercase tracking-wider transition-all ${activeTab === item.id ? 'bg-white text-black' : 'text-neutral-500 hover:text-white hover:bg-neutral-900'}`}>
                            {item.icon}{item.label}
                        </button>
                    ))}
                </nav>
                {/* User info */}
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
            </aside>

            {/* Main */}
            <main className="flex-1 md:ml-64 bg-black min-h-screen">
                <header className="h-20 border-b border-neutral-800 flex items-center justify-between px-8 bg-black/80 backdrop-blur sticky top-0 z-20">
                    <span className="uppercase text-xs font-bold tracking-widest text-neutral-400">{activeTab} Overview</span>
                    <div className="flex items-center gap-6">
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
                <div className="p-8 pb-32">
                    {activeTab === 'dashboard' && <Dashboard />}
                    {activeTab === 'orders' && <Orders />}
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

    useEffect(() => {
        // Cek session saat ini (termasuk setelah redirect dari Google)
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user) {
                if (ALLOWED_EMAILS.includes(session.user.email)) {
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
                if (ALLOWED_EMAILS.includes(session.user.email)) {
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
            <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');`}</style>
            {user ? <AdminPanel user={user} onLogout={handleLogout} /> : <LoginPage error={accessError} />}
        </div>
    );
}
