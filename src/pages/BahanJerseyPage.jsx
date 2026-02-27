import React, { useState, useEffect } from 'react';
import { ArrowRight, ArrowLeft, Check, Loader2 } from 'lucide-react';
import { supabase } from '../supabase';
import SEO from '../components/SEO';

export default function BahanJerseyPage({ setCurrentPage }) {
    const [bahans, setBahans] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBahan = async () => {
            const { data, error } = await supabase.from('page_materials').select('*').order('created_at', { ascending: true });
            if (error) console.error("Error loading bahan:", error);
            else setBahans(data || []);
            setLoading(false);
        };
        fetchBahan();
    }, []);

    return (
        <div className="pt-32 pb-20 bg-black min-h-screen">
            <SEO title="Pilihan Bahan Jersey" description="Kenali berbagai macam bahan jersey olahraga premium yang tersedia di Vorvox.id. Pilih bahan terbaik untuk tim Anda." />
            <div className="container mx-auto px-6">
                <div className="text-gray-600 text-xs uppercase tracking-widest mb-8 flex items-center gap-2">
                    <button onClick={() => setCurrentPage('home')} className="hover:text-white transition-colors">Home</button>
                    <span>/</span>
                    <button onClick={() => setCurrentPage('size-chart')} className="hover:text-white transition-colors">Informasi</button>
                    <span>/</span>
                    <span className="text-white">Bahan Jersey</span>
                </div>

                <div className="mb-14">
                    <h3 className="text-gray-500 uppercase tracking-widest mb-3 text-sm">Material</h3>
                    <h2 className="text-5xl font-black text-white">PILIHAN <br /><span className="text-gray-500">BAHAN JERSEY</span></h2>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
                    {loading ? (
                        <div className="col-span-full py-20 flex justify-center"><Loader2 className="animate-spin text-white" /></div>
                    ) : (
                        bahans.map((b) => (
                            <div key={b.id || b.name} className={`group p-7 bg-neutral-900 border ${b.border_color || 'border-white/10'} hover:border-white/40 transition-all duration-300 relative`}>
                                {b.badge_text && (
                                    <span className={`absolute top-4 right-4 text-[10px] font-black uppercase tracking-widest ${b.badge_color || 'bg-white text-black'} px-2 py-1`}>
                                        {b.badge_text}
                                    </span>
                                )}
                                <h4 className="text-xl font-black text-white uppercase mb-3">{b.name}</h4>
                                <p className="text-gray-400 text-sm leading-relaxed mb-5 font-light">{b.desc || b.description}</p>
                                <ul className="space-y-2">
                                    {(b.pros_list || []).map(p => (
                                        <li key={p} className="flex items-center gap-2 text-gray-300 text-sm">
                                            <Check size={14} className="text-white flex-shrink-0" />
                                            {p}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))
                    )}
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                    <button onClick={() => setCurrentPage('contact')}
                        className="px-10 py-4 bg-white text-black font-bold uppercase tracking-widest hover:bg-gray-200 flex items-center gap-2 group transition-all">
                        Konsultasi Bahan <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                    <button onClick={() => setCurrentPage('size-chart')}
                        className="px-10 py-4 border border-white/20 text-white font-bold uppercase tracking-widest hover:bg-white/10 flex items-center gap-2 transition-all">
                        <ArrowLeft size={18} /> Kembali
                    </button>
                </div>
            </div>
        </div>
    );
}
