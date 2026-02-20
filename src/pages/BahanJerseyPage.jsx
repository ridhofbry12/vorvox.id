import React from 'react';
import { ArrowRight, ArrowLeft, Check } from 'lucide-react';

const bahans = [
    {
        name: 'Polyester Milky',
        desc: 'Bahan paling populer untuk jersey. Lembut, tidak panas, cepat kering, dan warna cerah.',
        pros: ['Anti-keringat', 'Ringan & nyaman', 'Warna tajam & cerah', 'Harga terjangkau'],
        tag: 'Paling Populer',
        color: 'border-yellow-500/40',
        tagColor: 'bg-yellow-500',
    },
    {
        name: 'Drifit',
        desc: 'Material performa tinggi dengan teknologi moisture-wicking yang menguapkan keringat lebih cepat.',
        pros: ['Breathable tinggi', 'Moisture-wicking', 'Cocok olahraga intens', 'Awet & tahan lama'],
        tag: 'Premium',
        color: 'border-blue-500/40',
        tagColor: 'bg-blue-500',
    },
    {
        name: 'Paragon',
        desc: 'Bahan pilihan untuk jersey kelas semi-pro. Tekstur halus, elastis, dan nyaman saat bergerak.',
        pros: ['Stretch 4 arah', 'Tidak mudah kusut', 'Dingin di kulit', 'Cocok untuk basket & futsal'],
        tag: 'Recommended',
        color: 'border-green-500/40',
        tagColor: 'bg-green-500',
    },
    {
        name: 'Hyget / PE',
        desc: 'Bahan ekonomis untuk jersey event dan turnamen dengan jumlah besar. Tetap nyaman dipakai.',
        pros: ['Harga ekonomis', 'Cocok pemesanan massal', 'Warna cerah', 'Ringan'],
        tag: 'Ekonomis',
        color: 'border-white/10',
        tagColor: 'bg-gray-500',
    },
    {
        name: 'Lacoste / Polo',
        desc: 'Bahan rajutan dengan tekstur khas polo. Digunakan untuk jersey polo dan kaos berkerah.',
        pros: ['Tekstur premium', 'Elegan & formal', 'Tidak panas', 'Cocok seragam kantor'],
        tag: null,
        color: 'border-white/10',
        tagColor: '',
    },
    {
        name: 'Cotton Combed',
        desc: 'Bahan katun 100% untuk kaos casual. Lembut di kulit, adem, dan cocok untuk sablon.',
        pros: ['100% katun alami', 'Sangat lembut', 'Cocok sablon manual', 'Casual & santai'],
        tag: 'Kaos',
        color: 'border-white/10',
        tagColor: 'bg-orange-500',
    },
];

export default function BahanJerseyPage({ setCurrentPage }) {
    return (
        <div className="pt-32 pb-20 bg-black min-h-screen">
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
                    {bahans.map((b) => (
                        <div key={b.name} className={`group p-7 bg-neutral-900 border ${b.color} hover:border-white/40 transition-all duration-300 relative`}>
                            {b.tag && (
                                <span className={`absolute top-4 right-4 text-[10px] font-black uppercase tracking-widest ${b.tagColor} text-white px-2 py-1`}>
                                    {b.tag}
                                </span>
                            )}
                            <h4 className="text-xl font-black text-white uppercase mb-3">{b.name}</h4>
                            <p className="text-gray-400 text-sm leading-relaxed mb-5 font-light">{b.desc}</p>
                            <ul className="space-y-2">
                                {b.pros.map(p => (
                                    <li key={p} className="flex items-center gap-2 text-gray-300 text-sm">
                                        <Check size={14} className="text-white flex-shrink-0" />
                                        {p}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
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
