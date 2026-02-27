import React, { useState, useEffect } from 'react';
import { ArrowLeft, ChevronDown, Check, Loader2, Star, Info } from 'lucide-react';
import { supabase } from '../supabase';
import SEO from '../components/SEO';

export default function ProductDetailPage({ category, setCurrentPage }) {
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProduct = async () => {
            setLoading(true);
            if (!category) {
                setLoading(false);
                return;
            }

            const { data, error } = await supabase
                .from('products')
                .select('*')
                .eq('title', category)
                .single();

            if (error) {
                console.error("Error fetching product details:", error);
            } else {
                setProduct(data);
            }
            setLoading(false);
        };
        fetchProduct();
    }, [category]);

    if (loading) {
        return (
            <div className="pt-32 pb-20 bg-black min-h-screen flex items-center justify-center">
                <Loader2 size={32} className="animate-spin text-white" />
            </div>
        );
    }

    if (!product) {
        return (
            <div className="pt-32 pb-20 bg-black min-h-screen text-center text-white flex flex-col items-center justify-center">
                <h1 className="text-4xl font-black mb-4 uppercase">Produk Tidak Ditemukan</h1>
                <p className="text-gray-400 mb-8">Kategori / Produk {category} tidak tersedia atau telah dihapus.</p>
                <button onClick={() => setCurrentPage('services')} className="px-8 py-4 border border-white/20 hover:bg-white hover:text-black transition-all font-bold uppercase tracking-widest text-sm">
                    Kembali ke Katalog
                </button>
            </div>
        );
    }

    let parsedSpecs = {};
    if (product.specs_json) {
        try {
            parsedSpecs = typeof product.specs_json === 'string' ? JSON.parse(product.specs_json) : product.specs_json;
        } catch (e) {
            console.error("Failed to parse specs", e);
        }
    }
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
            <SEO
                title={product ? product.title : 'Detail Produk'}
                description={product ? product.desc : 'Detail produk dari Vorvox.id'}
            />
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
                            src={product.image_url || getPlaceholderImage(category)}
                            alt={product.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                        {product.badge_text && (
                            <div className={`absolute top-4 left-4 text-xs font-bold px-3 py-1 uppercase tracking-widest ${product.badge_text === 'Baru' ? 'bg-yellow-400 text-black' : 'bg-white text-black'}`}>
                                {product.badge_text}
                            </div>
                        )}
                    </div>

                    {/* Details */}
                    <div>
                        <h1 className="text-4xl md:text-5xl font-black uppercase mb-4">{product.title}</h1>
                        <div className="flex items-center gap-4 mb-6">
                            <div className="flex text-yellow-500">
                                {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
                            </div>
                            <span className="text-gray-400 text-sm">(Rating Tinggi from reviews)</span>
                        </div>

                        <p className="text-gray-400 text-lg leading-relaxed mb-8 font-light border-l-4 border-white/20 pl-6">
                            {product.long_desc || product.short_desc}
                        </p>

                        <div className="space-y-4 mb-10">
                            {product.tags && product.tags.length > 0 && (
                                <div className="flex gap-2 mb-4">
                                    {product.tags.map(t => (
                                        <span key={t} className="px-2 py-1 bg-white/10 text-white text-xs uppercase tracking-wider">{t}</span>
                                    ))}
                                </div>
                            )}
                            <div className="flex items-center gap-3 text-sm text-gray-300">
                                <Info size={16} className="text-white" />
                                <span>Kustomisasi Desain Tanpa Batas</span>
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

                {/* Specs Tab */}
                {Object.keys(parsedSpecs).length > 0 && (
                    <div className="mt-20 border-t border-white/10 pt-10">
                        <h3 className="text-xl font-bold uppercase mb-6">Spesifikasi Standar</h3>
                        <div className="grid md:grid-cols-3 gap-8 text-sm text-gray-400">
                            {Object.entries(parsedSpecs).map(([key, val], idx) => (
                                <div key={idx}>
                                    <h4 className="text-white font-bold mb-2 capitalize">{key}</h4>
                                    <p>{val}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
