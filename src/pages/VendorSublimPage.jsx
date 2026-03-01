import React, { useState, useEffect } from 'react';
import { ArrowRight, ArrowLeft, Check, Zap, Layers, Timer, Package, Loader2, Star, Shirt, Users, Scissors } from 'lucide-react';
import { supabase } from '../supabase';
import SEO from '../components/SEO';

const IconMap = {
    'Zap': <Zap size={22} />,
    'Layers': <Layers size={22} />,
    'Timer': <Timer size={22} />,
    'Package': <Package size={22} />,
    'Check': <Check size={22} />,
    'ArrowRight': <ArrowRight size={22} />,
    'Star': <Star size={22} />,
    'Shirt': <Shirt size={22} />,
    'Users': <Users size={22} />,
    'Scissors': <Scissors size={22} />
};

const proses = [
    { no: '01', title: 'Konsultasi & File Desain', desc: 'Kirimkan brief, logo, dan konsep desain kamu via WhatsApp. Tim desainer kami siap bantu konversi ke format print.' },
    { no: '02', title: 'Mock-up & Approval', desc: 'Kami kirimkan preview digital (mock-up) sebelum produksi dimulai. Revisi tidak terbatas hingga kamu puas.' },
    { no: '03', title: 'Printing & Produksi', desc: 'File yang sudah di-approve langsung masuk antrian mesin sublim. Estimasi 3–10 hari kerja.' },
    { no: '04', title: 'QC & Packing', desc: 'Setiap item diperiksa satu per satu sebelum dikemas rapi dan dikirim ke seluruh Indonesia.' },
];

export default function VendorSublimPage({ setCurrentPage }) {
    const [kategori, setKategori] = useState([]);
    const [keunggulanData, setKeunggulanData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const [katRes, keuRes] = await Promise.all([
                supabase.from('vendor_sublim_kategori').select('*').order('created_at', { ascending: true }),
                supabase.from('vendor_sublim_keunggulan').select('*').order('created_at', { ascending: true })
            ]);

            if (katRes.data) setKategori(katRes.data);
            if (keuRes.data) setKeunggulanData(keuRes.data);
            setLoading(false);
        };
        fetchData();
    }, []);

    const parseTags = (tagData) => {
        if (!tagData) return [];
        if (Array.isArray(tagData)) return tagData;
        try { return JSON.parse(tagData); } catch { return []; }
    };

    return (
        <div className="pt-28 bg-black min-h-screen text-white">
            <SEO
                title="Sublim / DTF Printing"
                description="Semua kebutuhan printing textile jadi lebih mudah & murah. Pengerjaan dalam satu lokasi dan bisa dibantu hingga full order."
            />
            {/* ── HERO ── */}
            <section className="relative min-h-[60vh] flex items-center overflow-hidden">
                <img
                    src="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&q=80&w=1800"
                    alt="Sublim / DTF"
                    className="absolute inset-0 w-full h-full object-cover opacity-20"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent" />
                <div className="container mx-auto px-6 relative z-10">
                    {/* Breadcrumb */}
                    <div className="text-gray-600 text-xs uppercase tracking-widest mb-8 flex items-center gap-2">
                        <button onClick={() => setCurrentPage('home')} className="hover:text-white transition-colors">Home</button>
                        <span>/</span>
                        <button onClick={() => setCurrentPage('services')} className="hover:text-white transition-colors">Produk</button>
                        <span>/</span>
                        <span className="text-white">Sublim / DTF</span>
                    </div>

                    <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 px-4 py-2 mb-6">
                        <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
                        <span className="text-white text-xs uppercase tracking-[0.3em] font-bold">Mitra Printing Textile Terpercaya</span>
                    </div>

                    <h1 className="text-5xl md:text-8xl font-black leading-none tracking-tighter mb-6">
                        VENDOR<br />
                        <span className="text-gray-500">SUBLIM</span>
                    </h1>
                    <p className="text-gray-400 text-base md:text-lg max-w-xl leading-relaxed mb-10 font-light">
                        Semua kebutuhan printing textile jadi lebih mudah &amp; murah.
                        Pengerjaan dalam satu lokasi dan bisa dibantu hingga full order.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <a href="https://wa.me/6285641117775?text=Halo%20Vorvox%2C%20saya%20ingin%20konsultasi%20layanan%20sublim%20%2F%20DTF.%20Bisa%20dibantu%3F" target="_blank" rel="noreferrer"
                            className="px-10 py-4 bg-white text-black font-bold uppercase tracking-widest hover:bg-gray-200 flex items-center gap-2 group transition-all">
                            Konsultasi Gratis <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </a>
                        <button onClick={() => setCurrentPage('contact')}
                            className="px-10 py-4 border border-white/20 text-white font-bold uppercase tracking-widest hover:bg-white/10 transition-all">
                            Lihat Katalog
                        </button>
                    </div>
                </div>
            </section>

            {/* ── KATEGORI PRODUK ── */}
            <section className="py-24 bg-neutral-950">
                <div className="container mx-auto px-6">
                    <div className="mb-14">
                        <h3 className="text-gray-500 uppercase tracking-widest mb-3 text-sm">Apa yang Kami Cetak</h3>
                        <h2 className="text-4xl md:text-5xl font-black">KATEGORI <br /><span className="text-gray-500">PRODUK SUBLIM</span></h2>
                    </div>

                    {/* Grid: 2 col atas + 1 col bawah full */}
                    {loading ? (
                        <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-white" /></div>
                    ) : (
                        <>
                            <div className="grid md:grid-cols-2 gap-6 mb-6">
                                {kategori.filter(k => !k.grid_span).map((k, i) => (
                                    <div key={k.id || i} className="group relative overflow-hidden aspect-[4/3] bg-neutral-900 cursor-pointer"
                                        onClick={() => setCurrentPage('contact')}>
                                        <img src={k.image_url} alt={k.name}
                                            className="w-full h-full object-cover opacity-50 group-hover:opacity-70 group-hover:scale-110 transition-all duration-700" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
                                        <div className="absolute inset-0 p-8 flex flex-col justify-end">
                                            <h3 className="text-2xl font-black uppercase tracking-tighter text-white mb-2">{k.name}</h3>
                                            <p className="text-gray-400 text-sm font-light mb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">{k.description}</p>
                                            <div className="flex flex-wrap gap-2">
                                                {parseTags(k.tags).map(t => (
                                                    <span key={t} className="text-[10px] uppercase tracking-widest font-bold border border-white/30 px-2 py-1 text-white/70">{t}</span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Full Width card bawah */}
                            {kategori.filter(k => k.grid_span).map((k, i) => (
                                <div key={k.id || i} className="group relative overflow-hidden h-64 bg-neutral-900 cursor-pointer"
                                    onClick={() => setCurrentPage('contact')}>
                                    <img src={k.image_url} alt={k.name}
                                        className="w-full h-full object-cover object-top opacity-40 group-hover:opacity-60 group-hover:scale-105 transition-all duration-700" />
                                    <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent" />
                                    <div className="absolute inset-0 px-6 md:px-12 flex flex-col justify-center">
                                        <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tighter text-white mb-2">{k.name}</h3>
                                        <p className="text-gray-400 text-sm font-light max-w-xl mb-4">{k.description}</p>
                                        <div className="flex flex-wrap gap-2">
                                            {parseTags(k.tags).map(t => (
                                                <span key={t} className="text-[10px] uppercase tracking-widest font-bold border border-white/30 px-2 py-1 text-white/70">{t}</span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </>
                    )}
                </div>
            </section>

            {/* ── KEUNGGULAN ── */}
            <section className="py-24 bg-white text-black">
                <div className="container mx-auto px-6">
                    <div className="mb-14">
                        <h3 className="text-gray-400 uppercase tracking-widest mb-3 text-sm">Kenapa Pilih Kami</h3>
                        <h2 className="text-4xl md:text-5xl font-black">KEUNGGULAN <br /><span className="text-gray-400">SUBLIM / DTF</span></h2>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {loading ? (
                            <div className="col-span-full py-10 flex justify-center"><Loader2 className="animate-spin text-black" /></div>
                        ) : (
                            keunggulanData.map((k, i) => (
                                <div key={k.id || i} className="p-8 border border-black/10 hover:border-black hover:shadow-xl transition-all duration-300 group">
                                    <div className="w-12 h-12 bg-black text-white flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                        {IconMap[k.icon_type] || <Zap size={22} />}
                                    </div>
                                    <h4 className="text-lg font-black uppercase mb-3">{k.title}</h4>
                                    <p className="text-gray-500 text-sm leading-relaxed font-light">{k.description}</p>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </section>

            {/* ── PROSES ── */}
            <section className="py-24 bg-neutral-950">
                <div className="container mx-auto px-6">
                    <div className="mb-14">
                        <h3 className="text-gray-500 uppercase tracking-widest mb-3 text-sm">Alur Kerja</h3>
                        <h2 className="text-4xl md:text-5xl font-black text-white">PROSES <br /><span className="text-gray-500">SUBLIM PRINTING</span></h2>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {proses.map((p, i) => (
                            <div key={i} className="relative p-8 bg-black border border-white/5 hover:border-white/20 transition-all">
                                {/* Step line connector */}
                                {i < proses.length - 1 && (
                                    <div className="hidden lg:block absolute top-14 right-0 w-6 h-px bg-white/10 translate-x-full -translate-y-1/2" />
                                )}
                                <div className="text-6xl font-black text-white/8 mb-4 tabular-nums">{p.no}</div>
                                <h4 className="text-base font-black text-white uppercase mb-3">{p.title}</h4>
                                <p className="text-gray-400 text-sm leading-relaxed font-light">{p.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── BAHAN SUBLIM ── */}
            <section className="py-20 bg-black border-t border-white/5">
                <div className="container mx-auto px-6">
                    <div className="grid md:grid-cols-2 gap-16 items-center">
                        <div>
                            <h3 className="text-gray-500 uppercase tracking-widest mb-3 text-sm">Material</h3>
                            <h2 className="text-3xl md:text-4xl font-black text-white mb-6">BAHAN YANG <br /><span className="text-gray-500">KOMPATIBEL</span></h2>
                            <p className="text-gray-400 leading-relaxed mb-8 font-light text-sm md:text-base">
                                Teknik sublimasi hanya bisa diterapkan pada bahan berbasis polyester (minimal 65% polyester content).
                                Semakin tinggi kandungan polyester, semakin tajam dan akurat warna yang dihasilkan.
                            </p>
                            <div className="space-y-4">
                                {[
                                    { bahan: 'Polyester Milky 100%', cocok: 'Sangat Cocok', bar: 100, color: 'bg-white' },
                                    { bahan: 'Drifit / Microfiber', cocok: 'Sangat Cocok', bar: 95, color: 'bg-white' },
                                    { bahan: 'Poly-Spandex (CVC)', cocok: 'Cocok', bar: 75, color: 'bg-gray-400' },
                                    { bahan: 'Polyester 65% + Cotton', cocok: 'Cukup', bar: 50, color: 'bg-gray-600' },
                                    { bahan: 'Cotton 100%', cocok: 'Tidak Cocok', bar: 0, color: 'bg-red-500' },
                                ].map(b => (
                                    <div key={b.bahan}>
                                        <div className="flex justify-between text-xs mb-1">
                                            <span className="text-gray-300 font-bold uppercase tracking-widest">{b.bahan}</span>
                                            <span className={`font-bold uppercase tracking-widest ${b.bar === 0 ? 'text-red-400' : 'text-gray-400'}`}>{b.cocok}</span>
                                        </div>
                                        <div className="h-1 bg-white/10">
                                            <div className={`h-1 ${b.color} transition-all`} style={{ width: `${b.bar}%` }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="relative aspect-square bg-neutral-900 overflow-hidden">
                            <img
                                src="https://lh3.googleusercontent.com/d/1JWGaXDo6mF0yW_ByVB2vjMg9z3yguger"
                                alt="Mesin Sublim"
                                className="w-full h-full object-cover opacity-60"
                            />
                            <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black to-transparent">
                                <div className="text-white font-black text-2xl uppercase">Mesin Sublim</div>
                                <div className="text-gray-400 text-sm mt-1">Industrial-grade, resolusi tinggi</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── CTA STRIP ── */}
            <section className="py-20 bg-white text-black">
                <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="text-center md:text-left">
                        <h3 className="text-2xl md:text-3xl font-black uppercase mb-2">Siap Cetak Jersey Sublim?</h3>
                        <p className="text-gray-500 font-light text-sm md:text-base">Konsultasi gratis, estimasi harga instan via WhatsApp.</p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                        <a href="https://wa.me/6285641117775?text=Halo%20Vorvox%2C%20saya%20ingin%20konsultasi%20layanan%20sublim%20%2F%20DTF.%20Bisa%20dibantu%3F" target="_blank" rel="noreferrer"
                            className="w-full sm:w-auto justify-center px-10 py-4 bg-black text-white font-bold uppercase tracking-widest hover:bg-neutral-800 flex items-center gap-2 group transition-all whitespace-nowrap">
                            Chat WhatsApp <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </a>
                        <button onClick={() => setCurrentPage('portfolio')}
                            className="w-full sm:w-auto justify-center px-8 py-4 border-2 border-black text-black font-bold uppercase tracking-widest hover:bg-black hover:text-white transition-all whitespace-nowrap">
                            Lihat Portofolio
                        </button>
                    </div>
                </div>
            </section>

            {/* ── BACK BUTTON ── */}
            <div className="py-8 bg-black border-t border-white/5">
                <div className="container mx-auto px-6">
                    <button onClick={() => setCurrentPage('services')}
                        className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors text-sm uppercase tracking-widest font-bold">
                        <ArrowLeft size={16} /> Kembali ke Produk
                    </button>
                </div>
            </div>
        </div>
    );
}
