import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Routes, Route } from 'react-router-dom';
import {
    Menu, X, Instagram, Mail, Phone, MapPin,
    ArrowRight, ArrowLeft, CheckCircle, Shirt, Zap, Package,
    Scissors, Star, Users, Youtube, Search, ChevronLeft, ChevronRight, Loader2
} from 'lucide-react';
import { supabase } from './supabase';
import AdminApp from './AdminApp';
import SizeChartPage from './pages/SizeChartPage';
import BahanJerseyPage from './pages/BahanJerseyPage';
import ModelKerahPage from './pages/ModelKerahPage';
import FontCollectionPage from './pages/FontCollectionPage';
import VendorSublimPage from './pages/VendorSublimPage';
import ProductDetailPage from './pages/ProductDetailPage';
import ClientDashboardPage from './pages/ClientDashboardPage';
import TestimonialsSection from './components/TestimonialsSection';
import SEO from './components/SEO';

// ──────────────────────────────────────────────────────────────────
// HOOK: Animated Counter
// ──────────────────────────────────────────────────────────────────
function useCountUp(target, duration = 1800, started = false) {
    const [count, setCount] = useState(0);
    useEffect(() => {
        if (!started) return;
        let start = 0;
        const step = Math.ceil(target / (duration / 16));
        const timer = setInterval(() => {
            start += step;
            if (start >= target) { setCount(target); clearInterval(timer); }
            else setCount(start);
        }, 16);
        return () => clearInterval(timer);
    }, [target, duration, started]);
    return count;
}

// ──────────────────────────────────────────────────────────────────
// Navbar
// ──────────────────────────────────────────────────────────────────
const Navbar = ({ currentPage, setCurrentPage }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    useEffect(() => {
        const h = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', h);
        return () => window.removeEventListener('scroll', h);
    }, []);

    const links = [
        { name: 'Home', id: 'home' },
        { name: 'Produk', id: 'services' },
        { name: 'Vendor Sublim', id: 'vendor-sublim' },
        { name: 'Size Chart', id: 'size-chart' },
        { name: 'Portofolio', id: 'portfolio' },
        { name: 'Pemesanan', id: 'pemesanan' },
        { name: 'Cara Order', id: 'order' },
        { name: 'Kontak', id: 'contact' },
    ];

    return (
        <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-black/95 py-4 border-b border-white/10' : 'bg-transparent py-6'}`}>
            <div className="container mx-auto px-11 flex justify-between items-center">
                <div className="cursor-pointer lg:mr-12 xl:mr-20" onClick={() => setCurrentPage('home')}>
                    <img src="https://lh3.googleusercontent.com/d/1Vj2HKhfRS3x9JMGN0wzvTQtln18RYc_I" alt="VORVOX.ID" className="h-14 md:h-20 object-contain transition-all duration-300" />
                </div>
                <div className="hidden lg:flex space-x-6 items-center">
                    {links.map(l => (
                        <button key={l.id} onClick={() => setCurrentPage(l.id)}
                            className={`text-sm font-medium tracking-widest uppercase transition-colors ${currentPage === l.id ? 'text-white border-b border-white' : 'text-gray-400 hover:text-white'}`}>
                            {l.name}
                        </button>
                    ))}
                    <button onClick={() => setCurrentPage('contact')} className="px-6 py-2 bg-white text-black text-xs font-bold uppercase tracking-widest hover:bg-gray-200 transition-all">
                        Konsultasi Sekarang
                    </button>
                </div>
                <div className="lg:hidden text-white cursor-pointer" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                    {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
                </div>
            </div>
            {isMenuOpen && (
                <div className="fixed inset-0 bg-black z-40 flex flex-col items-center justify-center space-y-8">
                    {links.map(l => (
                        <button key={l.id} onClick={() => { setCurrentPage(l.id); setIsMenuOpen(false); }}
                            className="text-2xl font-bold text-white uppercase tracking-tighter hover:text-gray-300 transition-colors">{l.name}</button>
                    ))}
                    <button onClick={() => { setCurrentPage('contact'); setIsMenuOpen(false); }}
                        className="px-8 py-3 bg-white text-black font-bold uppercase tracking-widest hover:bg-gray-200 transition-all">
                        Konsultasi Sekarang
                    </button>
                    <X className="absolute top-6 right-6 text-white cursor-pointer hover:rotate-90 transition-transform duration-300" size={32} onClick={() => setIsMenuOpen(false)} />
                </div>
            )}
        </nav>
    );
};

// ──────────────────────────────────────────────────────────────────
// FEATURE 2 — Hero Slider
// ──────────────────────────────────────────────────────────────────
const HeroSlider = ({ setCurrentPage, heroSlides }) => {
    const [active, setActive] = useState(0);
    const timerRef = useRef(null);

    const next = useCallback(() => {
        if (heroSlides.length > 0) setActive(p => (p + 1) % heroSlides.length);
    }, [heroSlides.length]);

    const prev = () => {
        if (heroSlides.length > 0) setActive(p => (p - 1 + heroSlides.length) % heroSlides.length);
    };

    useEffect(() => {
        timerRef.current = setInterval(next, 5000);
        return () => clearInterval(timerRef.current);
    }, [next]);

    if (!heroSlides || heroSlides.length === 0) return <div className="h-screen bg-black flex items-center justify-center"><Loader2 className="animate-spin text-white" /></div>;

    const slide = heroSlides[active];

    return (
        <section className="relative h-screen flex items-center bg-black overflow-hidden">
            {/* Background image with transition */}
            {heroSlides.map((s, i) => (
                <div key={s.id || i} className={`absolute inset-0 transition-opacity duration-1000 ${i === active ? 'opacity-100' : 'opacity-0'}`}>
                    <img src={s.image_url} alt={s.headline} className="w-full h-full object-cover opacity-30" />
                    <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent" />
                </div>
            ))}

            {/* Content */}
            <div className="container mx-auto px-6 relative z-10">
                <div className="max-w-3xl">
                    <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 px-4 py-2 mb-2">
                        <div className="w-2 h-2 bg-green-00 rounded-full animate-pulse" />
                        <span className="text-white text-xs uppercase tracking-[0.3em] font-bold">Rajinlah Menabung dan Jangan Lupa Olahraga</span>
                    </div>
                    <h1 key={active} className="text-6xl md:text-6xl font-black text-white leading-none mb-2 tracking-tighter animate-fadeIn">
                        {slide.headline} <br />
                        <span className="text-outline-white text-transparent">{slide.sub}</span>
                    </h1>
                    <p className="text-gray-400 text-lg mb-10 max-w-xl leading-relaxed font-light">{slide.desc}</p>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <button onClick={() => setCurrentPage(slide.cta_link || 'services')}
                            className="px-10 py-4 bg-white text-black font-bold uppercase tracking-widest hover:bg-gray-200 flex items-center gap-2 group transition-all">
                            Lihat Produk <ArrowRight className="group-hover:translate-x-2 transition-transform" size={18} />
                        </button>
                        <button onClick={() => setCurrentPage('contact')}
                            className="px-10 py-4 border border-white/20 text-white font-bold uppercase tracking-widest hover:bg-white/10 transition-all">
                            Konsultasi Sekarang
                        </button>
                    </div>
                </div>
            </div>

            {/* Prev / Next buttons */}
            <button onClick={prev} className="absolute left-6 top-1/2 -translate-y-1/2 z-10 w-12 h-12 border border-white/20 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all">
                <ChevronLeft size={24} />
            </button>
            <button onClick={() => { next(); clearInterval(timerRef.current); timerRef.current = setInterval(next, 5000); }}
                className="absolute right-6 top-1/2 -translate-y-1/2 z-10 w-12 h-12 border border-white/20 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all">
                <ChevronRight size={24} />
            </button>

            {/* Dot indicators */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 flex gap-3">
                {heroSlides.map((_, i) => (
                    <button key={i} onClick={() => setActive(i)}
                        className={`transition-all duration-300 rounded-full ${i === active ? 'w-8 h-2 bg-white' : 'w-2 h-2 bg-white/30 hover:bg-white/60'}`} />
                ))}
            </div>

            {/* Slide counter */}
            <div className="absolute bottom-10 right-10 text-white/30 text-xs font-mono z-10">
                {String(active + 1).padStart(2, '0')} / {String(heroSlides.length).padStart(2, '0')}
            </div>
        </section>
    );
};

// ──────────────────────────────────────────────────────────────────
// FEATURE 3 — Animated Counter Stats Section
// ──────────────────────────────────────────────────────────────────
const AnimatedStats = ({ statsData }) => {
    const ref = useRef(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const obs = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
            { threshold: 0.3 }
        );
        if (ref.current) obs.observe(ref.current);
        return () => obs.disconnect();
    }, []);

    if (!statsData || statsData.length === 0) return null;

    return (
        <section ref={ref} className="py-20 bg-white text-black">
            <div className="container mx-auto px-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                    {statsData.map((s) => {
                        const count = useCountUp(s.raw, 1600, visible);
                        const display = s.raw >= 1000 ? (count / 1000).toFixed(count >= s.raw ? 0 : 1) + 'K' : count;
                        return (
                            <div key={s.label}>
                                <div className="text-5xl font-black mb-2 tabular-nums">
                                    {s.prefix}{display}{s.suffix}
                                </div>
                                <div className="text-xs uppercase tracking-widest text-gray-500 font-bold">{s.label}</div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

// ──────────────────────────────────────────────────────────────────
// HomePage
// ──────────────────────────────────────────────────────────────────
const HomePage = ({ setCurrentPage, setSelectedCategory, heroSlides, statsData, products }) => (
    <div>
        <SEO title="Home" description="Selamat datang di Vorvox.id - Vendor dan Konveksi Jersey Premium solusi terbaik untuk seragam olahraga dan event Anda." />
        <HeroSlider setCurrentPage={setCurrentPage} heroSlides={heroSlides} />
        <AnimatedStats statsData={statsData} />

        {/* Highlight products */}
        <section className="py-24 bg-neutral-950">
            <div className="container mx-auto px-6">
                <div className="mb-14">
                    <h3 className="text-gray-500 uppercase tracking-widest mb-3 text-sm">Produk Unggulan</h3>
                    <h2 className="text-4xl md:text-5xl font-black text-white">JERSEY &amp; KAOS <br /><span className="text-gray-500">UNTUK SEMUA KEBUTUHAN</span></h2>
                </div>
                <div className="grid md:grid-cols-3 gap-6">
                    {products.slice(0, 3).map((p, i) => (
                        <div key={p.id || i} className="group relative overflow-hidden aspect-[4/3] bg-neutral-900 cursor-pointer"
                            onClick={() => { setSelectedCategory(p.title); setCurrentPage('product-detail'); }}>
                            <img src={p.image_url} alt={p.title} className="w-full h-full object-cover opacity-50 group-hover:opacity-70 group-hover:scale-110 transition-all duration-700" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent p-6 flex flex-col justify-end">
                                <h4 className="text-xl font-black text-white uppercase tracking-tighter mb-2">{p.title}</h4>
                                <p className="text-gray-400 text-sm font-light opacity-0 group-hover:opacity-100 transition-opacity duration-300">{p.short_desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>

        {/* ── VENDOR SUBLIM SPOILER ── */}
        <section className="bg-black border-t border-white/5">
            {/* Top label bar */}
            <div className="border-b border-white/10 py-4 px-6">
                <div className="container mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
                        <span className="text-xs uppercase tracking-[0.3em] font-black text-yellow-400">Layanan Baru</span>
                    </div>
                    <button onClick={() => setCurrentPage('vendor-sublim')}
                        className="text-xs uppercase tracking-widest text-gray-400 hover:text-white font-bold flex items-center gap-2 transition-colors group">
                        Lihat Selengkapnya <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </div>

            {/* Main spoiler content */}
            <div className="relative overflow-hidden">
                {/* BG machine image */}
                <img
                    src="https://lh3.googleusercontent.com/d/1LzUcdSHmsJw_iVcGhSFTzlm5VL4pa_sW"
                    alt="Vendor Sublim"
                    className="absolute inset-0 w-full h-full object-cover opacity-20"
                />
                <div className="relative z-10 container mx-auto px-6 py-20">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        {/* Left: text */}
                        <div>
                            <h3 className="text-gray-500 uppercase tracking-widest mb-4 text-sm">Mitra Printing Textile</h3>
                            <h2 className="text-5xl md:text-6xl font-black text-white leading-none mb-6 tracking-tighter">
                                VENDOR<br />
                                <span className="text-gray-500">SUBLIM</span>
                            </h2>
                            <p className="text-gray-400 text-lg leading-relaxed mb-8 font-light max-w-md">
                                Semua kebutuhan printing textile jadi lebih mudah &amp; murah.
                                Pengerjaan dalam satu lokasi — dari desain, sublim, hingga jahit.
                            </p>
                            <div className="flex flex-wrap gap-3 mb-10">
                                {['Jersey Olahraga', 'Seragam Printing', 'Totebag', 'Hijab Printing', 'Fashion'].map(t => (
                                    <span key={t} className="px-3 py-1.5 border border-white/20 text-xs uppercase tracking-widest text-gray-300 font-bold">
                                        {t}
                                    </span>
                                ))}
                            </div>
                            <button onClick={() => setCurrentPage('vendor-sublim')}
                                className="px-10 py-4 bg-white text-black font-bold uppercase tracking-widest hover:bg-gray-200 flex items-center gap-2 group transition-all w-fit">
                                Lihat Layanan Sublim <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>

                        {/* Right: category preview grid */}
                        <div className="grid grid-cols-2 gap-4">
                            {[
                                {
                                    title: 'Jersey Olahraga\nPrinting',
                                    img: 'https://lh3.googleusercontent.com/d/1akNfYSFQQvh9E9rRrX0imUcIFx_kE9mi',
                                    tall: true,
                                },
                                {
                                    title: 'Seragam\nPrinting',
                                    img: 'https://lh3.googleusercontent.com/d/1JWGaXDo6mF0yW_ByVB2vjMg9z3yguger',
                                    tall: false,
                                },
                                {
                                    title: 'Fashion\nLainnya',
                                    img: 'https://lh3.googleusercontent.com/d/10XuFIrc3uYPb1a2q94m9RMICCRlHzehV',
                                    tall: false,
                                },
                            ].map((c, i) => (
                                <div key={i}
                                    onClick={() => setCurrentPage('vendor-sublim')}
                                    className={`group relative overflow-hidden cursor-pointer bg-neutral-900 ${i === 0 ? 'row-span-2' : ''}`}
                                    style={{ minHeight: i === 0 ? '320px' : '148px' }}>
                                    <img src={c.img} alt={c.title}
                                        className="w-full h-full object-cover opacity-50 group-hover:opacity-75 group-hover:scale-110 transition-all duration-700 absolute inset-0" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                                    <div className="absolute bottom-0 left-0 p-4">
                                        <h4 className="text-sm font-black text-white uppercase tracking-tight whitespace-pre-line leading-tight">{c.title}</h4>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>

        {/* ── TESTIMONIALS ── */}
        <TestimonialsSection />

    </div>
);

// ──────────────────────────────────────────────────────────────────
// FEATURE 7 — ServicesPage with Search
// ──────────────────────────────────────────────────────────────────
const popularTags = ['futsal', 'satuan', 'printing', 'bola', 'vendor'];

const IconMap = {
    'Zap': <Zap />,
    'Star': <Star />,
    'Package': <Package />,
    'Users': <Users />,
    'Shirt': <Shirt />,
    'Scissors': <Scissors />
};

const ServicesPage = ({ setCurrentPage, setSelectedCategory, products }) => {
    const [query, setQuery] = useState('');
    const filtered = query.trim()
        ? products.filter(p =>
            p.title.toLowerCase().includes(query.toLowerCase()) ||
            (p.tags && p.tags.some(t => t.toLowerCase().includes(query.toLowerCase())))
        )
        : products;

    return (
        <div className="pt-32 pb-20 bg-neutral-900 min-h-screen">
            <div className="container mx-auto px-6">
                <div className="mb-12">
                    <h3 className="text-gray-500 uppercase tracking-widest mb-3 text-sm">Katalog Produk</h3>
                    <h2 className="text-5xl font-black text-white">SEMUA JENIS <br /><span className="text-gray-500">JERSEY &amp; KAOS</span></h2>
                </div>

                {/* SEARCH BAR */}
                <div className="mb-10">
                    <div className="relative max-w-xl">
                        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                        <input
                            type="text"
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                            placeholder="Cari produk jersey..."
                            className="w-full bg-black text-white pl-12 pr-4 py-4 border border-white/10 focus:border-white outline-none transition-colors text-sm"
                        />
                        {query && (
                            <button onClick={() => setQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors">
                                <X size={16} />
                            </button>
                        )}
                    </div>
                    {/* Popular tags */}
                    <div className="flex gap-2 mt-3 flex-wrap items-center">
                        <span className="text-gray-600 text-xs uppercase tracking-widest font-bold">Populer:</span>
                        {popularTags.map(t => (
                            <button key={t} onClick={() => setQuery(t)}
                                className="px-3 py-1 text-xs border border-white/10 text-gray-400 hover:border-white hover:text-white transition-all">
                                {t}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Product Grid */}
                {filtered.length === 0 ? (
                    <div className="text-center py-20 text-gray-500">
                        <Search size={40} className="mx-auto mb-4 opacity-30" />
                        <p className="text-sm">Tidak ada produk yang cocok dengan "<span className="text-white">{query}</span>"</p>
                        <button onClick={() => setQuery('')} className="mt-4 text-xs uppercase text-white/40 hover:text-white border-b border-white/20 pb-0.5 transition-colors">Reset pencarian</button>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-3 gap-6">
                        {filtered.map((p, i) => (
                            <div key={i} onClick={() => {
                                if (p.title === 'Vendor Sublim') { setCurrentPage('vendor-sublim'); }
                                else { setSelectedCategory(p.title); setCurrentPage('product-detail'); }
                            }}
                                className={`group p-8 bg-black border border-white/5 hover:border-white/30 transition-all duration-300 relative cursor-pointer`}>
                                {p.badge && (
                                    <span className={`absolute top-4 right-4 text-[10px] font-black uppercase tracking-widest px-2 py-1 ${p.badge === 'Baru' ? 'bg-yellow-400 text-black' : 'bg-white text-black'}`}>{p.badge}</span>
                                )}
                                <div className="w-12 h-12 bg-white text-black flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    {IconMap[p.icon_type] || <Zap />}
                                </div>
                                <h4 className="text-xl font-bold text-white mb-3 uppercase">{p.title}</h4>
                                <p className="text-gray-400 leading-relaxed font-light text-sm">{p.short_desc}</p>
                                {p.title === 'Vendor Sublim' && <div className="mt-4 text-xs text-gray-500 uppercase tracking-widest font-bold flex items-center gap-1">Lihat Detail →</div>}
                            </div>
                        ))}
                    </div>
                )}

                {/* CTA */}
                <div className="mt-16 p-10 border border-white/10 bg-black text-center">
                    <h3 className="text-2xl font-black text-white mb-3">Butuh custom lebih spesifik?</h3>
                    <p className="text-gray-400 mb-6 font-light">Konsultasikan kebutuhan jersey kamu dengan tim kami — GRATIS.</p>
                    <button className="px-10 py-4 bg-white text-black font-bold uppercase tracking-widest hover:bg-gray-200 transition-all inline-flex items-center gap-2">
                        WhatsApp Sekarang <ArrowRight size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
};

// ──────────────────────────────────────────────────────────────────
// FEATURE 6 — Portfolio with Lightbox
// ──────────────────────────────────────────────────────────────────
const PortfolioPage = ({ portfolioItems }) => {
    const [active, setActive] = useState('Semua');
    const [lightbox, setLightbox] = useState(null); // index of opened image

    // Extract unique categories based on fetched items
    const dynamicCats = [...new Set(portfolioItems.map(p => p.category))];
    const cats = ['Semua', ...dynamicCats];

    const filtered = active === 'Semua' ? portfolioItems : portfolioItems.filter(p => p.category === active);

    // Keyboard navigation
    useEffect(() => {
        if (lightbox === null) return;
        const handler = (e) => {
            if (e.key === 'ArrowRight') setLightbox(i => (i + 1) % filtered.length);
            if (e.key === 'ArrowLeft') setLightbox(i => (i - 1 + filtered.length) % filtered.length);
            if (e.key === 'Escape') setLightbox(null);
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [lightbox, filtered.length]);

    // Lock body scroll when lightbox open
    useEffect(() => {
        document.body.style.overflow = lightbox !== null ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [lightbox]);

    return (
        <div className="pt-32 pb-20 bg-black min-h-screen">
            <SEO title="Portofolio Karya" description="Galeri hasil produksi jersey dan kaos dari Vorvox.id. Kualitas terjamin dengan ribuan client dan brand mempercayakan produksinya." />
            <div className="container mx-auto px-6">
                <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
                    <div>
                        <h3 className="text-gray-500 uppercase tracking-widest mb-3 text-sm">Portofolio</h3>
                        <h2 className="text-5xl font-black text-white uppercase">Karya Pilihan</h2>
                    </div>
                    <div className="flex gap-3 flex-wrap">
                        {cats.map(c => (
                            <button key={c} onClick={() => setActive(c)}
                                className={`px-4 py-2 text-xs font-bold uppercase tracking-widest border transition-all ${active === c ? 'bg-white text-black border-white' : 'border-white/20 text-white hover:border-white'}`}>
                                {c}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filtered.map((p, i) => (
                        <div key={p.id || i} className="group relative aspect-square bg-neutral-900 overflow-hidden cursor-zoom-in" onClick={() => setLightbox(i)}>
                            <img src={p.image_url} alt={p.name} className="w-full h-full object-cover grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-8">
                                <span className="text-white/50 text-xs uppercase tracking-[0.3em] mb-2">{p.category}</span>
                                <h4 className="text-2xl font-black text-white uppercase tracking-tighter">{p.name}</h4>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* LIGHTBOX */}
            {lightbox !== null && (
                <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center" onClick={() => setLightbox(null)}>
                    {/* Close */}
                    <button className="absolute top-6 right-6 w-10 h-10 border border-white/20 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all z-10">
                        <X size={20} />
                    </button>

                    {/* Counter */}
                    <div className="absolute top-6 left-6 text-white/40 text-xs font-mono z-10">
                        {String(lightbox + 1).padStart(2, '0')} / {String(filtered.length).padStart(2, '0')}
                    </div>

                    {/* Prev */}
                    <button className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 border border-white/20 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all z-10"
                        onClick={e => { e.stopPropagation(); setLightbox(i => (i - 1 + filtered.length) % filtered.length); }}>
                        <ChevronLeft size={24} />
                    </button>

                    {/* Image */}
                    <div className="max-w-4xl max-h-[80vh] mx-16" onClick={e => e.stopPropagation()}>
                        <img src={filtered[lightbox].image_url} alt={filtered[lightbox].name}
                            className="max-w-full max-h-[70vh] object-contain" />
                        <div className="mt-4 text-center">
                            <div className="text-white font-black text-xl uppercase">{filtered[lightbox].name}</div>
                            <div className="text-gray-500 text-xs uppercase tracking-widest mt-1">{filtered[lightbox].category}</div>
                        </div>
                    </div>

                    {/* Next */}
                    <button className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 border border-white/20 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all z-10"
                        onClick={e => { e.stopPropagation(); setLightbox(i => (i + 1) % filtered.length); }}>
                        <ChevronRight size={24} />
                    </button>

                    {/* Dots */}
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                        {filtered.map((_, i) => (
                            <button key={i} onClick={e => { e.stopPropagation(); setLightbox(i); }}
                                className={`transition-all rounded-full ${i === lightbox ? 'w-6 h-2 bg-white' : 'w-2 h-2 bg-white/30'}`} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

// ──────────────────────────────────────────────────────────────────
// OrderPage
// ──────────────────────────────────────────────────────────────────
const OrderPage = () => {
    const steps = [
        { no: '01', title: 'Konsultasi & Desain', desc: 'Hubungi kami via WhatsApp. Tim kami siap bantu buat desain jersey kamu secara gratis.' },
        { no: '02', title: 'Acc Desain & DP', desc: 'Setelah desain disetujui, lakukan pembayaran DP 50% untuk memulai proses produksi.' },
        { no: '03', title: 'Produksi', desc: 'Jersey kamu masuk antrian produksi. Estimasi 7–14 hari kerja tergantung jumlah order.' },
        { no: '04', title: 'QC & Pengiriman', desc: 'Setiap produk melalui quality control ketat sebelum dikemas dan dikirim ke alamatmu.' },
    ];
    return (
        <div className="pt-32 pb-20 bg-neutral-900 min-h-screen">
            <div className="container mx-auto px-6">
                <div className="mb-16">
                    <h3 className="text-gray-500 uppercase tracking-widest mb-3 text-sm">Panduan</h3>
                    <h2 className="text-5xl font-black text-white">CARA <br /><span className="text-gray-500">PEMESANAN</span></h2>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {steps.map((s, i) => (
                        <div key={i} className="p-8 bg-black border border-white/5 hover:border-white/20 transition-all">
                            <div className="text-6xl font-black text-white/10 mb-4">{s.no}</div>
                            <h4 className="text-lg font-bold text-white uppercase mb-3">{s.title}</h4>
                            <p className="text-gray-400 text-sm leading-relaxed font-light">{s.desc}</p>
                        </div>
                    ))}
                </div>
                <div className="mt-12 p-10 border border-white/10 bg-black flex flex-col md:flex-row items-center justify-between gap-6">
                    <div>
                        <h3 className="text-xl font-black text-white mb-1">Siap bikin jersey impianmu?</h3>
                        <p className="text-gray-400 text-sm">Konsultasi GRATIS, respon cepat via WhatsApp!</p>
                    </div>
                    <a href="https://wa.me/6285641117775" target="_blank" rel="noreferrer"
                        className="px-10 py-4 bg-white text-black font-bold uppercase tracking-widest hover:bg-gray-200 transition-all whitespace-nowrap flex items-center gap-2">
                        Chat WhatsApp <ArrowRight size={18} />
                    </a>
                </div>
            </div>
        </div>
    );
};

// ──────────────────────────────────────────────────────────────────
// ContactPage
// ──────────────────────────────────────────────────────────────────
const ContactPage = ({ products }) => {
    const [status, setStatus] = useState(null);
    const handleSubmit = (e) => { e.preventDefault(); setStatus('loading'); setTimeout(() => setStatus('success'), 1500); };
    return (
        <div className="pt-32 pb-20 bg-white min-h-screen">
            <div className="container mx-auto px-6">
                <div className="grid lg:grid-cols-2 gap-20">
                    <div>
                        <h3 className="text-gray-400 uppercase tracking-widest mb-3 text-sm">Hubungi Kami</h3>
                        <h2 className="text-6xl font-black text-black mb-8 uppercase tracking-tighter">Order <br />Jersey Kamu.</h2>
                        <p className="text-gray-600 mb-12 text-lg font-light">Konsultasikan desain jersey atau kaos kamu bersama kami. Gratis konsultasi, respon cepat!</p>
                        <div className="space-y-8">
                            {[
                                { icon: <Phone size={20} />, label: 'WhatsApp', val: '+62 85641117775' },
                                { icon: <Mail size={20} />, label: 'Email', val: 'vorvoxid@gmail.com' },
                                { icon: <MapPin size={20} />, label: 'Workshop', val: 'Jl. Patimura No. 45, Jeru, Kec.Tumpang, Kab.Malang' },
                            ].map(({ icon, label, val }) => (
                                <div key={label} className="flex items-start gap-4">
                                    <div className="p-3 bg-black text-white">{icon}</div>
                                    <div>
                                        <div className="text-xs uppercase text-black font-bold mb-1">{label}</div>
                                        <div className="text-xl text-black font-bold">{val}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="bg-black p-10 shadow-2xl">
                        {status === 'success' ? (
                            <div className="h-full flex flex-col items-center justify-center text-center text-white py-20">
                                <CheckCircle size={64} className="mb-6" />
                                <h4 className="text-3xl font-black mb-4">PESAN TERKIRIM!</h4>
                                <p className="text-gray-400">Tim kami akan menghubungi kamu dalam 24 jam.</p>
                                <button onClick={() => setStatus(null)} className="mt-8 text-xs uppercase tracking-widest font-bold border-b border-white pb-1">Kirim Pesan Lain</button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs uppercase text-gray-500 font-bold tracking-widest">Nama Lengkap</label>
                                        <input required type="text" className="w-full bg-neutral-900 text-white p-4 outline-none focus:ring-1 focus:ring-white" placeholder="John Doe" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs uppercase text-gray-500 font-bold tracking-widest">WhatsApp</label>
                                        <input required type="tel" className="w-full bg-neutral-900 text-white p-4 outline-none focus:ring-1 focus:ring-white" placeholder="0812..." />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs uppercase text-gray-500 font-bold tracking-widest">Jenis Produk</label>
                                    <select className="w-full bg-neutral-900 text-white p-4 outline-none focus:ring-1 focus:ring-white">
                                        {products.map(p => <option key={p.title || p.id}>{p.title}</option>)}
                                        <option>Kaos Custom</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs uppercase text-gray-500 font-bold tracking-widest">Detail Pesanan</label>
                                    <textarea rows="4" className="w-full bg-neutral-900 text-white p-4 outline-none focus:ring-1 focus:ring-white resize-none" placeholder="Jumlah, desain, deadline, dll..."></textarea>
                                </div>
                                <button disabled={status === 'loading'}
                                    className="w-full py-5 bg-white text-black font-black uppercase tracking-[0.2em] hover:bg-gray-200 transition-all disabled:opacity-70">
                                    {status === 'loading' ? 'MENGIRIM...' : 'KIRIM KONSULTASI'}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// ──────────────────────────────────────────────────────────────────
// Footer
// ──────────────────────────────────────────────────────────────────
const Footer = ({ setCurrentPage }) => (
    <footer className="bg-neutral-950 text-white pt-20 pb-10 border-t border-white/5">
        <div className="container mx-auto px-6">
            <div className="grid md:grid-cols-4 gap-12 mb-16">
                <div>
                    <div className="mb-6">
                        <img src="https://lh3.googleusercontent.com/d/1C6FaUvu1NdcAZ2f-RFuAMsDS2BFUgaEv" alt="VORVOX.ID" className="h-20 object-contain" />
                    </div>
                    <p className="text-gray-500 text-sm leading-relaxed mb-6">Spesialis konveksi jersey &amp; kaos premium untuk tim, klub, event, dan korporat di seluruh Indonesia.</p>
                    <div className="space-y-2 text-sm text-gray-500 mb-6">
                        {[
                            { icon: <Phone size={14} />, val: '+62 856-4111-7775' },
                            { icon: <Mail size={14} />, val: 'vorvoxid@gmail.com' },
                            { icon: <MapPin size={14} />, val: 'Jl. Patimura No. 45, Jeru, Kec.Tumpang, Kab.Malang' },
                        ].map(({ icon, val }) => (
                            <div key={val} className="flex items-start gap-2"><span className="mt-0.5 flex-shrink-0">{icon}</span><span>{val}</span></div>
                        ))}
                    </div>
                    <div className="flex gap-3">
                        {[
                            { Icon: Phone, label: 'WhatsApp' },
                            { Icon: Instagram, label: 'Instagram' },
                            { Icon: Youtube, label: 'YouTube' },
                        ].map(({ Icon, label }) => (
                            <div key={label} title={label} className="w-9 h-9 border border-white/10 flex items-center justify-center hover:bg-white hover:text-black transition-all cursor-pointer text-gray-400">
                                <Icon size={16} />
                            </div>
                        ))}
                    </div>
                </div>

                <div>
                    <h4 className="text-xs uppercase tracking-widest font-black mb-6">Produk</h4>
                    <ul className="space-y-3 text-gray-500 text-sm">
                        {['Jersey Futsal', 'Jersey Bola', 'Jersey Basket', 'Bikin Jersey Satuan', 'Vendor Jersey', 'Konveksi Jersey'].map(n => (
                            <li key={n} className="hover:text-white cursor-pointer transition-colors" onClick={() => setCurrentPage('services')}>{n}</li>
                        ))}
                    </ul>
                </div>

                <div>
                    <h4 className="text-xs uppercase tracking-widest font-black mb-6">Informasi</h4>
                    <ul className="space-y-3 text-gray-500 text-sm">
                        {[
                            ['Size Chart', 'size-chart'],
                            ['Bahan Jersey', 'bahan-jersey'],
                            ['Model Kerah', 'model-kerah'],
                            ['Font Collection', 'font-collection'],
                            ['Cara Pemesanan', 'order'],
                            ['Promo Terbaru', 'contact'],
                        ].map(([n, page]) => (
                            <li key={n} className="hover:text-white cursor-pointer transition-colors" onClick={() => setCurrentPage(page)}>{n}</li>
                        ))}
                    </ul>
                </div>

                <div>
                    <h4 className="text-xs uppercase tracking-widest font-black mb-6">Lainnya</h4>
                    <ul className="space-y-3 text-gray-500 text-sm">
                        {[['Tentang Kami', 'home'], ['Hubungi Kami', 'contact'], ['Portofolio', 'portfolio']].map(([n, page]) => (
                            <li key={n} className="hover:text-white cursor-pointer transition-colors" onClick={() => setCurrentPage(page)}>{n}</li>
                        ))}
                        {['Garansi Produk', 'Ketentuan Order', 'Kebijakan Privasi'].map(n => (
                            <li key={n} className="hover:text-white cursor-pointer transition-colors">{n}</li>
                        ))}
                    </ul>
                </div>
            </div>
            <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="text-gray-600 text-xs">© 2026 VORVOX.ID — Konveksi Jersey Premium Indonesia.</div>
                <div className="text-gray-600 text-xs uppercase tracking-widest">Made in Indonesia.</div>
            </div>
        </div>
    </footer>
);

// ──────────────────────────────────────────────────────────────────
// Website App
// ──────────────────────────────────────────────────────────────────
const WebsiteApp = () => {
    const [currentPage, setCurrentPage] = useState('home');
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [loadingData, setLoadingData] = useState(true);

    // Global CMS States
    const [products, setProducts] = useState([]);
    const [portfolioItems, setPortfolioItems] = useState([]);
    const [heroSlides, setHeroSlides] = useState([]);
    const [statsData, setStatsData] = useState([]);

    useEffect(() => { window.scrollTo(0, 0); }, [currentPage]);

    // Fetch Base Global CMS Data
    useEffect(() => {
        const fetchGlobalData = async () => {
            setLoadingData(true);
            try {
                const [prodRes, portRes, heroRes, statsRes] = await Promise.all([
                    supabase.from('products').select('*').order('created_at', { ascending: false }),
                    supabase.from('portfolio').select('*').order('created_at', { ascending: false }),
                    supabase.from('hero_slides').select('*').order('order_index', { ascending: true }),
                    supabase.from('site_content').select('*').eq('key', 'home_stats').single()
                ]);

                if (prodRes.data) setProducts(prodRes.data);
                if (portRes.data) setPortfolioItems(portRes.data);
                if (heroRes.data) setHeroSlides(heroRes.data);
                if (statsRes.data && statsRes.data.value_json) {
                    setStatsData(typeof statsRes.data.value_json === 'string' ? JSON.parse(statsRes.data.value_json) : statsRes.data.value_json);
                }
            } catch (error) {
                console.error("Global CMS Fetch Error: ", error);
            }
            setLoadingData(false);
        };
        fetchGlobalData();
    }, []);

    const renderPage = () => {
        if (loadingData) {
            return <div className="min-h-screen bg-black flex items-center justify-center text-white"><Loader2 size={32} className="animate-spin" /></div>;
        }

        switch (currentPage) {
            case 'home': return <HomePage setCurrentPage={setCurrentPage} setSelectedCategory={setSelectedCategory} heroSlides={heroSlides} statsData={statsData} products={products} />;
            case 'services': return <ServicesPage setCurrentPage={setCurrentPage} setSelectedCategory={setSelectedCategory} products={products} />;
            case 'portfolio': return <PortfolioPage portfolioItems={portfolioItems} />;
            case 'order': return <OrderPage />;
            case 'contact': return <ContactPage products={products} />;
            case 'size-chart': return <SizeChartPage setCurrentPage={setCurrentPage} />;
            case 'bahan-jersey': return <BahanJerseyPage setCurrentPage={setCurrentPage} />;
            case 'model-kerah': return <ModelKerahPage setCurrentPage={setCurrentPage} />;
            case 'font-collection': return <FontCollectionPage setCurrentPage={setCurrentPage} />;
            case 'vendor-sublim': return <VendorSublimPage setCurrentPage={setCurrentPage} />;
            case 'pemesanan': return <ClientDashboardPage setCurrentPage={setCurrentPage} />;
            case 'product-detail': return <ProductDetailPage category={selectedCategory} setCurrentPage={setCurrentPage} />;
            default: return <HomePage setCurrentPage={setCurrentPage} setSelectedCategory={setSelectedCategory} heroSlides={heroSlides} statsData={statsData} products={products} />;
        }
    };

    return (
        <div className="font-sans text-white bg-black min-h-screen flex flex-col">
            <Navbar currentPage={currentPage} setCurrentPage={setCurrentPage} />
            <main className="flex-grow">{renderPage()}</main>
            <Footer setCurrentPage={setCurrentPage} />
            {/* Floating WA */}
            <a href="https://wa.me/6285641117775" target="_blank" rel="noreferrer"
                className="fixed bottom-8 right-8 w-14 h-14 bg-green-500 hover:bg-green-400 text-white rounded-full shadow-2xl flex items-center justify-center z-40 transition-all hover:scale-110">
                <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
            </a>
        </div>
    );
};

// ──────────────────────────────────────────────────────────────────
// Root Router
// ──────────────────────────────────────────────────────────────────
export default function App() {
    return (
        <Routes>
            <Route path="/" element={<WebsiteApp />} />
            <Route path="/admin" element={<AdminApp />} />
            <Route path="*" element={<WebsiteApp />} />
        </Routes>
    );
}
