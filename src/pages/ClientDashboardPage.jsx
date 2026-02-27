import React, { useState } from 'react';
import { useClientSession } from '../hooks/useClientSession';
import ClientLoginForm from '../components/client/ClientLoginForm';
import OrderForm from '../components/client/OrderForm';
import ClientOrderHistory from '../components/client/ClientOrderHistory';
import { LogOut, Home, Loader2 } from 'lucide-react';
import SEO from '../components/SEO';

export default function ClientDashboardPage({ setCurrentPage }) {
    const { client, loading, login, logout } = useClientSession();
    // Trigger refresh history saat order baru disubmit
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const handleOrderSuccess = () => {
        setRefreshTrigger(prev => prev + 1);
        // Bisa tambahkan toast notifikasi disini
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    if (loading) {
        return (
            <div className="pt-32 pb-20 bg-black min-h-screen text-white flex justify-center items-center">
                <Loader2 className="animate-spin text-white" size={32} />
            </div>
        );
    }

    if (!client) {
        // Mode Login / Register
        return (
            <div className="pt-32 pb-20 bg-black min-h-screen text-white">
                <SEO title="Pemesanan Online" description="Sistem portal pemesanan vorvox khusus untuk client." />
                <div className="container mx-auto px-6">
                    <div className="mb-8 flex items-center gap-2 text-xs uppercase tracking-widest text-neutral-500">
                        <button onClick={() => setCurrentPage('home')} className="hover:text-white flex items-center gap-1"><Home size={14} /> Home</button>
                        <span>/</span>
                        <span className="text-white">Pemesanan</span>
                    </div>
                    <ClientLoginForm onLoginSuccess={login} />
                </div>
            </div>
        );
    }

    // Mode Terautentikasi (Dashboard Pemesanan)
    const [orderType, setOrderType] = useState('jersey');

    return (
        <div className="pt-32 pb-20 bg-black min-h-screen text-white">
            <SEO title="Dashboard Pemesanan" description="Manage pesanan dan riwayat invoice Anda." />

            <div className="container mx-auto px-6 max-w-6xl">
                {/* Header Dashboard */}
                <div className="bg-neutral-900 border border-neutral-800 p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                    <div>
                        <h1 className="text-3xl font-black uppercase tracking-tighter mb-1">
                            HELLO, <span className="text-neutral-500">{client.name}</span>
                        </h1>
                        <p className="text-neutral-400 text-sm">Kelola pesanan baru dan pantau riwayat produksi di sini.</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <button onClick={() => setCurrentPage('home')} className="text-xs font-bold uppercase tracking-widest text-neutral-500 hover:text-white flex items-center gap-2">
                            <Home size={16} /> Home Utama
                        </button>
                        <button onClick={logout} className="px-5 py-2.5 border border-red-900/50 text-red-500 hover:bg-red-900/20 text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-colors">
                            <LogOut size={16} /> Keluar
                        </button>
                    </div>
                </div>

                {/* Order Type Tab Toggle */}
                <div className="flex gap-2 mb-6 p-1 bg-neutral-900 border border-neutral-800 w-fit">
                    {[{ key: 'jersey', label: 'Jersey & Sportswear' }, { key: 'sublim_dtf', label: 'Sublim & DTF' }].map(tab => (
                        <button key={tab.key} onClick={() => setOrderType(tab.key)}
                            className={`px-6 py-3 text-xs font-bold uppercase tracking-widest transition-all ${orderType === tab.key ? 'bg-white text-black' : 'text-neutral-400 hover:text-white'}`}>
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Konten Utama */}
                <div className="grid lg:grid-cols-12 gap-8">
                    {/* Kiri: Form Order (7 Kolom) */}
                    <div className="lg:col-span-7">
                        <OrderForm clientId={client.id} onOrderSuccess={handleOrderSuccess} orderType={orderType} key={orderType} />
                    </div>

                    {/* Kanan: History (5 Kolom) */}
                    <div className="lg:col-span-5">
                        <ClientOrderHistory clientId={client.id} refreshTrigger={refreshTrigger} />
                    </div>
                </div>
            </div>
        </div>
    );
}
