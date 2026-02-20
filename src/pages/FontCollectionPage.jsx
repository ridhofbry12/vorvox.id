import React, { useState } from 'react';
import { ArrowRight, ArrowLeft } from 'lucide-react';

const fonts = [
    { name: 'Block Bold', style: { fontWeight: 900, letterSpacing: '-0.02em', fontFamily: 'Impact, sans-serif' } },
    { name: 'College', style: { fontWeight: 800, letterSpacing: '0.05em', fontFamily: '"Arial Black", sans-serif' } },
    { name: 'Italic Bold', style: { fontWeight: 800, fontStyle: 'italic', letterSpacing: '0.02em' } },
    { name: 'Outline', style: { fontWeight: 900, WebkitTextStroke: '2px white', color: 'transparent', letterSpacing: '0.04em' } },
    { name: 'Rounded', style: { fontWeight: 700, fontFamily: '"Trebuchet MS", sans-serif', letterSpacing: '0.08em' } },
    { name: 'Serif Classic', style: { fontWeight: 700, fontFamily: '"Georgia", serif', letterSpacing: '0.01em' } },
    { name: 'Script / Italic', style: { fontStyle: 'italic', fontWeight: 600, fontFamily: '"Palatino Linotype", serif', letterSpacing: '0.02em' } },
    { name: 'Condensed', style: { fontWeight: 900, letterSpacing: '-0.04em', transform: 'scaleX(0.8)', display: 'inline-block' } },
    { name: 'Wide', style: { fontWeight: 700, letterSpacing: '0.2em' } },
];

export default function FontCollectionPage({ setCurrentPage }) {
    const [preview, setPreview] = useState('VORVOX 10');

    return (
        <div className="pt-32 pb-20 bg-black min-h-screen">
            <div className="container mx-auto px-6">
                {/* Breadcrumb */}
                <div className="text-gray-600 text-xs uppercase tracking-widest mb-8 flex items-center gap-2">
                    <button onClick={() => setCurrentPage('home')} className="hover:text-white transition-colors">Home</button>
                    <span>/</span>
                    <button onClick={() => setCurrentPage('size-chart')} className="hover:text-white transition-colors">Informasi</button>
                    <span>/</span>
                    <span className="text-white">Font Collection</span>
                </div>

                <div className="mb-10">
                    <h3 className="text-gray-500 uppercase tracking-widest mb-3 text-sm">Koleksi Font</h3>
                    <h2 className="text-5xl font-black text-white">FONT NAMA <br /><span className="text-gray-500">&amp; NOMOR PUNGGUNG</span></h2>
                </div>

                {/* Live Preview Input */}
                <div className="mb-12 p-6 bg-neutral-900 border border-white/10">
                    <label className="text-xs uppercase tracking-widest text-gray-500 font-bold block mb-3">Preview Teks</label>
                    <input
                        type="text"
                        value={preview}
                        onChange={e => setPreview(e.target.value.toUpperCase())}
                        maxLength={12}
                        placeholder="Ketik nama atau nomor..."
                        className="w-full bg-black text-white text-xl font-bold p-4 outline-none focus:ring-1 focus:ring-white border border-white/10 uppercase tracking-widest"
                    />
                    <p className="text-gray-600 text-xs mt-2">Ketik nama atau nomor kamu untuk melihat preview di semua font di bawah.</p>
                </div>

                {/* Font Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-16">
                    {fonts.map((f, i) => (
                        <div key={i} className="group bg-neutral-900 border border-white/5 hover:border-white/30 transition-all duration-300 overflow-hidden">
                            {/* Font display */}
                            <div className="p-8 bg-black flex items-center justify-center min-h-[120px]">
                                <span
                                    className="text-4xl text-white text-center"
                                    style={f.style}
                                >
                                    {preview || 'VORVOX 10'}
                                </span>
                            </div>
                            <div className="p-4 border-t border-white/5">
                                <span className="text-xs uppercase tracking-widest text-gray-400 font-bold">{f.name}</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Note */}
                <div className="p-6 border border-white/10 bg-neutral-900 mb-10">
                    <p className="text-gray-400 text-sm leading-relaxed">
                        <span className="text-white font-bold">Catatan:</span> Pilihan font di atas adalah referensi gaya. Font final di jersey akan disesuaikan saat proses desain bersama tim kami.
                        Kamu bebas request gaya font lain selama proses konsultasi.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                    <button onClick={() => setCurrentPage('contact')}
                        className="px-10 py-4 bg-white text-black font-bold uppercase tracking-widest hover:bg-gray-200 flex items-center gap-2 group transition-all">
                        Request Font Custom <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
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
