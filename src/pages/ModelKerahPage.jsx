import React from 'react';
import { ArrowRight, ArrowLeft } from 'lucide-react';

const kerahTypes = [
    {
        name: 'O-Neck (Round)',
        desc: 'Kerah bulat klasik, paling umum digunakan untuk jersey dan kaos olahraga.',
        img: null,
        popular: true,
    },
    {
        name: 'V-Neck',
        desc: 'Kerah berbentuk V yang memberikan kesan ramping dan modern. Cocok untuk jersey casual.',
        img: null,
        popular: false,
    },
    {
        name: 'Polo / Berkerah',
        desc: 'Kerah kaku khas kemeja polo. Digunakan untuk seragam kantor, turnamen resmi, dan jersey formal.',
        img: null,
        popular: false,
    },
    {
        name: 'Kerah Rebah (Camp Collar)',
        desc: 'Kerah yang terlipat ke bawah. Memberikan tampilan santai & stylish, cocok untuk jersey lifestyle.',
        img: null,
        popular: false,
    },
    {
        name: 'Kerah Zipper (Half-Zip)',
        desc: 'Dilengkapi ritsleting setengah dari depan. Fleksibel — bisa terbuka atau tertutup sesuai kebutuhan.',
        img: null,
        popular: false,
    },
    {
        name: 'Full Zip',
        desc: 'Ritsleting penuh dari bawah ke atas. Sering digunakan untuk jaket, hoodie, dan jersey tracksuit.',
        img: null,
        popular: false,
    },
];

const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

export default function ModelKerahPage({ setCurrentPage }) {
    return (
        <div className="pt-32 pb-20 bg-black min-h-screen">
            <div className="container mx-auto px-6">
                {/* Breadcrumb */}
                <div className="text-gray-600 text-xs uppercase tracking-widest mb-8 flex items-center gap-2">
                    <button onClick={() => setCurrentPage('home')} className="hover:text-white transition-colors">Home</button>
                    <span>/</span>
                    <button onClick={() => setCurrentPage('size-chart')} className="hover:text-white transition-colors">Informasi</button>
                    <span>/</span>
                    <span className="text-white">Model Kerah</span>
                </div>

                <div className="mb-14">
                    <h3 className="text-gray-500 uppercase tracking-widest mb-3 text-sm">Desain Kerah</h3>
                    <h2 className="text-5xl font-black text-white">MODEL <br /><span className="text-gray-500">KERAH JERSEY</span></h2>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
                    {kerahTypes.map((k) => (
                        <div key={k.name} className="group p-7 bg-neutral-900 border border-white/5 hover:border-white/30 transition-all duration-300 relative">
                            {k.popular && (
                                <span className="absolute top-4 right-4 text-[10px] font-black uppercase tracking-widest bg-white text-black px-2 py-1">
                                    Paling Umum
                                </span>
                            )}
                            {/* Visual placeholder — shape illustration */}
                            <div className="w-full h-36 bg-black border border-white/10 flex items-center justify-center mb-5 overflow-hidden">
                                <div className="relative">
                                    {/* Simple kerah illustration using CSS */}
                                    {k.name.includes('O-Neck') && (
                                        <div className="w-16 h-16 rounded-full border-4 border-white/60 flex items-center justify-center">
                                            <span className="text-white/30 text-xs font-bold">O</span>
                                        </div>
                                    )}
                                    {k.name.includes('V-Neck') && (
                                        <svg width="64" height="64" viewBox="0 0 64 64">
                                            <polygon points="32,48 8,8 56,8" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="3" />
                                        </svg>
                                    )}
                                    {k.name.includes('Polo') && (
                                        <div className="w-16 h-12 border-4 border-white/60 relative">
                                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-6 border-b-4 border-white/60" />
                                        </div>
                                    )}
                                    {k.name.includes('Rebah') && (
                                        <div className="w-16 h-10 border-b-4 border-white/60 relative">
                                            <div className="absolute top-0 left-0 w-8 h-4 border-r-2 border-white/40 rotate-12" />
                                            <div className="absolute top-0 right-0 w-8 h-4 border-l-2 border-white/40 -rotate-12" />
                                        </div>
                                    )}
                                    {(k.name.includes('Half-Zip') || k.name.includes('Full Zip')) && (
                                        <div className="flex flex-col items-center gap-1">
                                            <div className="w-2 h-2 bg-white/60 rounded-full" />
                                            {[...Array(k.name.includes('Full') ? 6 : 3)].map((_, i) => (
                                                <div key={i} className="w-1 h-3 bg-white/40" />
                                            ))}
                                        </div>
                                    )}
                                    {!k.name.includes('O-Neck') && !k.name.includes('V-Neck') && !k.name.includes('Polo') && !k.name.includes('Rebah') && !k.name.includes('Zip') && (
                                        <div className="w-16 h-16 border-2 border-white/30 flex items-center justify-center text-white/30 text-xs">KERAH</div>
                                    )}
                                </div>
                            </div>
                            <h4 className="text-lg font-black text-white uppercase mb-2">{k.name}</h4>
                            <p className="text-gray-400 text-sm leading-relaxed font-light">{k.desc}</p>
                        </div>
                    ))}
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                    <button onClick={() => setCurrentPage('contact')}
                        className="px-10 py-4 bg-white text-black font-bold uppercase tracking-widest hover:bg-gray-200 flex items-center gap-2 group transition-all">
                        Pesan Sekarang <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
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
