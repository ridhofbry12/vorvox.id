import React from 'react';
import SEO from '../components/SEO';
import { Shield, CheckCircle, RefreshCw, AlertTriangle, ArrowRight } from 'lucide-react';

const GaransiProdukPage = ({ setCurrentPage }) => {
    const warranties = [
        { icon: <Shield size={24} />, title: 'Garansi Kualitas Jahitan', desc: 'Setiap jahitan diperiksa dengan standar QC ketat. Jika terdapat cacat jahitan pada produk yang diterima, kami akan memperbaiki atau mengganti produk tanpa biaya tambahan.', period: '7 Hari' },
        { icon: <CheckCircle size={24} />, title: 'Garansi Kesesuaian Desain', desc: 'Desain yang dicetak akan sesuai dengan mockup yang telah disetujui. Jika terdapat perbedaan signifikan dari desain yang disetujui, kami siap mencetak ulang.', period: '3 Hari' },
        { icon: <RefreshCw size={24} />, title: 'Garansi Warna & Print', desc: 'Hasil printing sublimasi dijamin tidak mudah luntur, pudar, atau mengelupas dalam pemakaian normal. Garansi berlaku untuk ketahanan warna dan kualitas cetak.', period: '30 Hari' },
    ];

    const excluded = [
        'Kerusakan akibat pencucian yang tidak sesuai instruksi (misalnya: menggunakan pemutih, setrika langsung pada area print)',
        'Kerusakan akibat penggunaan berlebihan atau tidak wajar',
        'Perubahan ukuran akibat penyusutan karena pencucian dengan air panas',
        'Perbedaan warna minor yang disebabkan oleh perbedaan layar monitor/display',
        'Kesalahan data yang berasal dari pelanggan (nama, nomor, ukuran)',
    ];

    return (
        <div className="pt-32 pb-20 bg-neutral-900 min-h-screen">
            <SEO title="Garansi Produk" description="Informasi garansi produk jersey Vorvox.id. Kami menjamin kualitas setiap produk yang kami hasilkan." />
            <div className="container mx-auto px-6">
                <div className="mb-16">
                    <h3 className="text-gray-500 uppercase tracking-widest mb-3 text-sm">Jaminan Kualitas</h3>
                    <h2 className="text-5xl font-black text-white">GARANSI <br /><span className="text-gray-500">PRODUK</span></h2>
                    <p className="text-gray-400 text-lg mt-6 max-w-2xl font-light leading-relaxed">
                        Vorvox.id berkomitmen memberikan produk terbaik. Setiap jersey yang kami produksi
                        dilengkapi dengan garansi kualitas untuk menjamin kepuasan Anda.
                    </p>
                </div>

                {/* Warranty Cards */}
                <div className="grid md:grid-cols-3 gap-6 mb-16">
                    {warranties.map((w, i) => (
                        <div key={i} className="p-8 bg-black border border-white/5 hover:border-white/20 transition-all group">
                            <div className="flex justify-between items-start mb-6">
                                <div className="w-12 h-12 bg-white text-black flex items-center justify-center group-hover:scale-110 transition-transform">
                                    {w.icon}
                                </div>
                                <span className="px-3 py-1 bg-green-500/10 text-green-400 text-[10px] font-bold uppercase tracking-widest border border-green-500/20 rounded">
                                    {w.period}
                                </span>
                            </div>
                            <h4 className="text-lg font-bold text-white uppercase mb-3">{w.title}</h4>
                            <p className="text-gray-400 font-light text-sm leading-relaxed">{w.desc}</p>
                        </div>
                    ))}
                </div>

                {/* Cara Klaim */}
                <div className="p-8 bg-black border border-white/10 mb-16">
                    <h3 className="text-xl font-black text-white uppercase mb-6">Cara Klaim Garansi</h3>
                    <div className="grid md:grid-cols-4 gap-6">
                        {[
                            { no: '01', title: 'Dokumentasi', desc: 'Foto produk yang bermasalah dengan jelas dari berbagai sisi.' },
                            { no: '02', title: 'Hubungi Kami', desc: 'Kirim foto dan keluhan via WhatsApp ke 0856-4111-7775.' },
                            { no: '03', title: 'Verifikasi', desc: 'Tim kami akan memverifikasi keluhan dalam 1×24 jam kerja.' },
                            { no: '04', title: 'Proses', desc: 'Jika klaim valid, kami akan langsung memproses perbaikan/penggantian.' },
                        ].map((step, i) => (
                            <div key={i}>
                                <div className="text-4xl font-black text-white/10 mb-3">{step.no}</div>
                                <h4 className="text-sm font-bold text-white uppercase mb-2">{step.title}</h4>
                                <p className="text-gray-500 text-xs leading-relaxed">{step.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Pengecualian */}
                <div className="p-8 bg-black border border-red-900/30 mb-12">
                    <div className="flex items-center gap-3 mb-6">
                        <AlertTriangle size={20} className="text-red-400" />
                        <h3 className="text-lg font-black text-white uppercase">Pengecualian Garansi</h3>
                    </div>
                    <ul className="space-y-3">
                        {excluded.map((item, i) => (
                            <li key={i} className="flex items-start gap-3 text-gray-400 text-sm">
                                <span className="text-red-500 mt-1 flex-shrink-0">×</span>
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* CTA */}
                <div className="p-10 border border-white/10 bg-black text-center">
                    <h3 className="text-2xl font-black text-white mb-3">Ada masalah dengan pesananmu?</h3>
                    <p className="text-gray-400 mb-6 font-light">Hubungi kami segera, kami akan bantu selesaikan.</p>
                    <button onClick={() => setCurrentPage('contact')}
                        className="px-10 py-4 bg-white text-black font-bold uppercase tracking-widest hover:bg-gray-200 transition-all inline-flex items-center gap-2">
                        Hubungi Kami <ArrowRight size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default GaransiProdukPage;
