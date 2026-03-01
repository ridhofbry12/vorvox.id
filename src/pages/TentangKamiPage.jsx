import React from 'react';
import SEO from '../components/SEO';
import { ArrowRight, Shield, Award, CheckCircle, Users, Heart, Target } from 'lucide-react';

const TentangKamiPage = ({ setCurrentPage }) => {
    return (
        <div className="pt-32 pb-20 bg-black min-h-screen">
            <SEO title="Tentang Kami" description="Kenali lebih dekat Vorvox.id — vendor konveksi jersey dan sportswear premium di Malang, Jawa Timur." />
            <div className="container mx-auto px-6">
                {/* Header */}
                <div className="mb-16">
                    <h3 className="text-gray-500 uppercase tracking-widest mb-3 text-sm">Tentang Kami</h3>
                    <h2 className="text-5xl md:text-6xl font-black text-white leading-none tracking-tighter">
                        VORVOX<span className="text-gray-500">.ID</span>
                    </h2>
                    <p className="text-gray-400 text-lg mt-6 max-w-2xl font-light leading-relaxed">
                        Vendor konveksi jersey dan sportswear premium yang berlokasi di Malang, Jawa Timur.
                        Kami hadir sebagai solusi produksi jersey berkualitas tinggi untuk tim, klub, event, dan korporat di seluruh Indonesia.
                    </p>
                </div>

                {/* Vision & Mission */}
                <div className="grid md:grid-cols-2 gap-6 mb-16">
                    <div className="p-8 bg-neutral-900 border border-white/5 hover:border-white/20 transition-all">
                        <div className="w-12 h-12 bg-white text-black flex items-center justify-center mb-6">
                            <Target size={24} />
                        </div>
                        <h3 className="text-xl font-black text-white uppercase mb-4">Visi Kami</h3>
                        <p className="text-gray-400 leading-relaxed font-light">
                            Menjadi vendor konveksi jersey terpercaya dan terdepan di Indonesia dengan mengutamakan kualitas,
                            inovasi, dan kepuasan pelanggan dalam setiap produksi.
                        </p>
                    </div>
                    <div className="p-8 bg-neutral-900 border border-white/5 hover:border-white/20 transition-all">
                        <div className="w-12 h-12 bg-white text-black flex items-center justify-center mb-6">
                            <Heart size={24} />
                        </div>
                        <h3 className="text-xl font-black text-white uppercase mb-4">Misi Kami</h3>
                        <p className="text-gray-400 leading-relaxed font-light">
                            Menyediakan layanan produksi jersey dengan standar QC tertinggi, harga kompetitif,
                            serta proses yang transparan dari desain hingga pengiriman ke seluruh Indonesia.
                        </p>
                    </div>
                </div>

                {/* Why Choose Us */}
                <div className="mb-16">
                    <h3 className="text-gray-500 uppercase tracking-widest mb-3 text-sm">Kenapa Vorvox?</h3>
                    <h2 className="text-3xl md:text-4xl font-black text-white mb-10">KEUNGGULAN <span className="text-gray-500">KAMI</span></h2>
                    <div className="grid md:grid-cols-3 gap-6">
                        {[
                            { icon: <Shield size={24} />, title: 'Kualitas Terjamin', desc: 'Setiap produk melalui quality control ketat sebelum sampai ke tangan kamu. Garansi kualitas tanpa kompromi.' },
                            { icon: <Award size={24} />, title: 'Pengalaman Bertahun-tahun', desc: 'Dipercaya ratusan klien dari berbagai tim, klub, dan event olahraga di seluruh Indonesia.' },
                            { icon: <CheckCircle size={24} />, title: 'Proses Transparan', desc: 'Update progress produksi secara real-time. Kamu bisa pantau proses dari awal hingga jersey dikirim.' },
                        ].map((item, i) => (
                            <div key={i} className="p-8 bg-neutral-900 border border-white/5 hover:border-white/20 transition-all group">
                                <div className="w-12 h-12 bg-white text-black flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    {item.icon}
                                </div>
                                <h4 className="text-lg font-bold text-white uppercase mb-3">{item.title}</h4>
                                <p className="text-gray-400 font-light text-sm leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Team / Info */}
                <div className="p-10 border border-white/10 bg-neutral-900">
                    <div className="grid md:grid-cols-2 gap-10 items-center">
                        <div>
                            <h3 className="text-2xl font-black text-white mb-4">Workshop Kami</h3>
                            <p className="text-gray-400 font-light leading-relaxed mb-4">
                                Workshop kami berlokasi di Jl. Patimura No. 45, Jeru, Kec. Tumpang,
                                Kab. Malang, Jawa Timur 65156. Dilengkapi dengan mesin sublimasi,
                                mesin jahit industrial, dan tim produksi berpengalaman.
                            </p>
                            <div className="flex items-center gap-4 mt-6">
                                <div className="flex items-center gap-2 text-white">
                                    <Users size={16} />
                                    <span className="text-sm font-bold">10+ Tim Produksi</span>
                                </div>
                                <div className="w-px h-4 bg-white/20" />
                                <div className="flex items-center gap-2 text-white">
                                    <CheckCircle size={16} />
                                    <span className="text-sm font-bold">500+ Klien Puas</span>
                                </div>
                            </div>
                        </div>
                        <div className="text-center">
                            <img src="https://lh3.googleusercontent.com/d/1Vj2HKhfRS3x9JMGN0wzvTQtln18RYc_I" alt="Vorvox Logo"
                                className="w-40 h-40 mx-auto object-contain opacity-30" />
                        </div>
                    </div>
                </div>

                {/* CTA */}
                <div className="mt-12 p-10 border border-white/10 bg-black text-center">
                    <h3 className="text-2xl font-black text-white mb-3">Tertarik bekerja sama?</h3>
                    <p className="text-gray-400 mb-6 font-light">Konsultasikan kebutuhan jersey kamu dengan tim kami — GRATIS.</p>
                    <button onClick={() => setCurrentPage('contact')}
                        className="px-10 py-4 bg-white text-black font-bold uppercase tracking-widest hover:bg-gray-200 transition-all inline-flex items-center gap-2">
                        Hubungi Kami <ArrowRight size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TentangKamiPage;
