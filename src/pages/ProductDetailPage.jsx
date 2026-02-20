import React from 'react';
import { ArrowLeft, ShoppingCart, Info, Star } from 'lucide-react';

export default function ProductDetailPage({ category, setCurrentPage }) {
    // Placeholder images based on category or default
    const getPlaceholderImage = (cat) => {
        if (!cat) return 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&q=80&w=1200';
        const lower = cat.toLowerCase();
        if (lower.includes('futsal')) return 'https://images.unsplash.com/photo-1552667466-07770ae110d0?auto=format&fit=crop&q=80&w=1200';
        if (lower.includes('bola')) return 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80&w=1200';
        if (lower.includes('basket')) return 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&q=80&w=1200';
        return 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&q=80&w=1200';
    };

    return (
        <div className="pt-32 pb-20 bg-black min-h-screen text-white">
            <div className="container mx-auto px-6">
                {/* Breadcrumb */}
                <div className="text-gray-600 text-xs uppercase tracking-widest mb-8 flex items-center gap-2">
                    <button onClick={() => setCurrentPage('home')} className="hover:text-white transition-colors">Home</button>
                    <span>/</span>
                    <button onClick={() => setCurrentPage('services')} className="hover:text-white transition-colors">Produk</button>
                    <span>/</span>
                    <span className="text-white">{category || 'Detail Produk'}</span>
                </div>

                <div className="grid md:grid-cols-2 gap-12">
                    {/* Image */}
                    <div className="bg-neutral-900 aspect-[4/3] overflow-hidden relative group">
                        <img
                            src={getPlaceholderImage(category)}
                            alt={category}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                        <div className="absolute top-4 left-4 bg-white text-black text-xs font-bold px-3 py-1 uppercase tracking-widest">
                            Best Seller
                        </div>
                    </div>

                    {/* Details */}
                    <div>
                        <h1 className="text-4xl md:text-5xl font-black uppercase mb-4">{category || 'NAMA PRODUK'}</h1>
                        <div className="flex items-center gap-4 mb-6">
                            <div className="flex text-yellow-500">
                                {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
                            </div>
                            <span className="text-gray-400 text-sm">(4.9/5.0 from 100+ reviews)</span>
                        </div>

                        <p className="text-gray-400 text-lg leading-relaxed mb-8 font-light border-l-4 border-white/20 pl-6">
                            Ini adalah halaman detail untuk kategori <span className="text-white font-bold">{category}</span>.
                            Deskripsi lengkap produk, spesifikasi teknis, dan variasi akan ditampilkan di sini setelah integrasi backend.
                        </p>

                        <div className="space-y-4 mb-10">
                            <div className="flex items-center gap-3 text-sm text-gray-300">
                                <Info size={16} className="text-white" />
                                <span>Min. Order: 12 Pcs (Tim) / 1 Pcs (Satuan)</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-gray-300">
                                <ShoppingCart size={16} className="text-white" />
                                <span>Pengerjaan: 7-14 Hari Kerja</span>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <button
                                onClick={() => setCurrentPage('contact')}
                                className="px-8 py-4 bg-white text-black font-bold uppercase tracking-widest hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
                            >
                                Pesan Sekarang
                            </button>
                            <button
                                onClick={() => setCurrentPage('services')}
                                className="px-8 py-4 border border-white/20 text-white font-bold uppercase tracking-widest hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                            >
                                <ArrowLeft size={18} /> Kembali
                            </button>
                        </div>
                    </div>
                </div>

                {/* Dummy Specs Tab */}
                <div className="mt-20 border-t border-white/10 pt-10">
                    <h3 className="text-xl font-bold uppercase mb-6">Spesifikasi Standar</h3>
                    <div className="grid md:grid-cols-3 gap-8 text-sm text-gray-400">
                        <div>
                            <h4 className="text-white font-bold mb-2">Material</h4>
                            <p>Drifit Milano / Brazil / Benzema (Premium Polyester)</p>
                        </div>
                        <div>
                            <h4 className="text-white font-bold mb-2">Printing</h4>
                            <p>Full Dye-Sublimation (Epson F-Series), Tinta Original</p>
                        </div>
                        <div>
                            <h4 className="text-white font-bold mb-2">Jahitan</h4>
                            <p>Kualitas Distro, Obras Rapi, Kuat & Tahan Lama</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
