import React, { useState } from 'react';
import { ArrowRight, ArrowLeft } from 'lucide-react';

const sizeData = [
    { size: 'S', lebar: 46, panjang: 69 },
    { size: 'M', lebar: 49, panjang: 72 },
    { size: 'L', lebar: 52, panjang: 75 },
    { size: 'XL', lebar: 55, panjang: 78 },
    { size: '2XL', lebar: 58, panjang: 81 },
    { size: '3XL', lebar: 61, panjang: 84 },
    { size: '4XL', lebar: 64, panjang: 87 },
    { size: '5XL', lebar: 67, panjang: 90 },
    { size: '6XL', lebar: 70, panjang: 93 },
];

const cmToInch = (cm) => (cm / 2.54).toFixed(1);

export default function SizeChartPage({ setCurrentPage }) {
    const [unit, setUnit] = useState('cm');

    const val = (cm) => unit === 'cm' ? `${cm} cm` : `${cmToInch(cm)}"`;

    const infoCards = [
        { title: 'Bahan Jersey', desc: 'Lihat pilihan bahan premium kami', page: 'bahan-jersey', color: 'from-blue-900/30' },
        { title: 'Model Kerah', desc: 'Pilih model kerah sesuai selera', page: 'model-kerah', color: 'from-purple-900/30' },
        { title: 'Font Collection', desc: 'Koleksi font untuk nama & nomor', page: 'font-collection', color: 'from-green-900/30' },
    ];

    return (
        <div className="pt-32 pb-20 bg-black min-h-screen">
            <div className="container mx-auto px-6 max-w-4xl">
                {/* Breadcrumb */}
                <div className="text-gray-600 text-xs uppercase tracking-widest mb-8 flex items-center gap-2">
                    <button onClick={() => setCurrentPage('home')} className="hover:text-white transition-colors">Home</button>
                    <span>/</span>
                    <span className="text-white">Size Chart</span>
                </div>

                <div className="mb-12">
                    <h3 className="text-gray-500 uppercase tracking-widest mb-3 text-sm">Panduan Ukuran</h3>
                    <h2 className="text-5xl font-black text-white">SIZE CHART <br /><span className="text-gray-500">JERSEY</span></h2>
                </div>

                {/* Unit Toggle */}
                <div className="flex items-center gap-3 mb-8">
                    <span className="text-gray-400 text-sm font-bold uppercase tracking-widest">Satuan:</span>
                    <div className="flex border border-white/10 overflow-hidden">
                        {['cm', 'inch'].map(u => (
                            <button key={u} onClick={() => setUnit(u)}
                                className={`px-6 py-2 text-xs font-black uppercase tracking-widest transition-all ${unit === u ? 'bg-white text-black' : 'bg-transparent text-gray-400 hover:text-white'}`}>
                                {u.toUpperCase()}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto mb-12">
                    <table className="w-full text-left border border-white/10">
                        <thead>
                            <tr className="bg-white text-black">
                                <th className="px-6 py-4 font-black uppercase tracking-widest text-sm">Size</th>
                                <th className="px-6 py-4 font-black uppercase tracking-widest text-sm">Lebar</th>
                                <th className="px-6 py-4 font-black uppercase tracking-widest text-sm">Panjang</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {sizeData.map((row, i) => (
                                <tr key={row.size}
                                    className={`transition-colors hover:bg-white/10 cursor-default ${i % 2 === 0 ? 'bg-neutral-950' : 'bg-neutral-900'}`}>
                                    <td className="px-6 py-4 font-black text-white text-lg">{row.size}</td>
                                    <td className="px-6 py-4 text-gray-300 font-mono">{val(row.lebar)}</td>
                                    <td className="px-6 py-4 text-gray-300 font-mono">{val(row.panjang)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <p className="text-gray-600 text-xs mt-3">* Ukuran dapat berbeda ±1–2 cm tergantung model dan bahan jersey.</p>
                </div>

                {/* Info Cards */}
                <div className="grid md:grid-cols-3 gap-4 mb-12">
                    {infoCards.map((c) => (
                        <button key={c.page} onClick={() => setCurrentPage(c.page)}
                            className={`group p-6 bg-gradient-to-br ${c.color} to-neutral-900 border border-white/10 hover:border-white/40 text-left transition-all duration-300`}>
                            <h4 className="text-white font-black uppercase mb-2 group-hover:text-gray-200">{c.title}</h4>
                            <p className="text-gray-500 text-xs mb-4">{c.desc}</p>
                            <ArrowRight size={16} className="text-gray-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
                        </button>
                    ))}
                </div>

                {/* CTA */}
                <div className="flex flex-col sm:flex-row gap-4">
                    <button onClick={() => setCurrentPage('contact')}
                        className="px-10 py-4 bg-white text-black font-bold uppercase tracking-widest hover:bg-gray-200 flex items-center gap-2 group transition-all">
                        Pesan Sekarang <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                    <button onClick={() => setCurrentPage('home')}
                        className="px-10 py-4 border border-white/20 text-white font-bold uppercase tracking-widest hover:bg-white/10 flex items-center gap-2 transition-all">
                        <ArrowLeft size={18} /> Kembali
                    </button>
                </div>
            </div>
        </div>
    );
}
