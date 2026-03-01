import React from 'react';
import SEO from '../components/SEO';
import { Shield, Lock, Eye, Database, Mail, ArrowRight } from 'lucide-react';

const KebijakanPrivasiPage = ({ setCurrentPage }) => {
    const sections = [
        {
            icon: <Database size={20} />,
            title: 'Data yang Kami Kumpulkan',
            content: [
                'Nama lengkap, alamat email, dan nomor telepon saat melakukan pemesanan.',
                'Alamat pengiriman untuk keperluan logistik.',
                'Data desain (file yang Anda upload) untuk keperluan produksi.',
                'Bukti pembayaran untuk verifikasi transaksi.',
                'Data nama & nomor punggung pemain untuk produksi jersey.',
            ],
        },
        {
            icon: <Eye size={20} />,
            title: 'Penggunaan Data',
            content: [
                'Memproses dan menyelesaikan pesanan Anda.',
                'Berkomunikasi mengenai status pesanan, produksi, dan pengiriman.',
                'Mengirimkan informasi promo atau penawaran khusus (dengan persetujuan Anda).',
                'Meningkatkan layanan dan pengalaman pelanggan.',
                'Memenuhi kewajiban hukum yang berlaku.',
            ],
        },
        {
            icon: <Shield size={20} />,
            title: 'Perlindungan Data',
            content: [
                'Data Anda disimpan secara aman menggunakan enkripsi standar industri.',
                'Akses ke data pelanggan dibatasi hanya untuk personel yang berwenang.',
                'Kami tidak menjual, menyewakan, atau membagikan data Anda kepada pihak ketiga tanpa persetujuan.',
                'Data desain Anda hanya digunakan untuk keperluan produksi pesanan.',
                'Kami menggunakan Supabase sebagai penyedia layanan database & autentikasi yang memenuhi standar keamanan internasional.',
            ],
        },
        {
            icon: <Lock size={20} />,
            title: 'Hak Anda',
            content: [
                'Mengakses data pribadi yang kami simpan tentang Anda.',
                'Meminta perbaikan data yang tidak akurat.',
                'Meminta penghapusan data pribadi Anda (dengan batasan tertentu terkait kewajiban hukum).',
                'Menolak penggunaan data untuk keperluan pemasaran.',
                'Untuk menjalankan hak-hak di atas, silakan hubungi kami melalui email atau WhatsApp.',
            ],
        },
        {
            icon: <Mail size={20} />,
            title: 'Cookie & Analitik',
            content: [
                'Website kami mungkin menggunakan cookie untuk meningkatkan pengalaman pengguna.',
                'Cookie digunakan untuk mengingat preferensi dan sesi login Anda.',
                'Kami menggunakan analitik dasar untuk memahami bagaimana pengguna menggunakan website kami.',
                'Anda dapat menolak cookie melalui pengaturan browser Anda.',
            ],
        },
    ];

    return (
        <div className="pt-32 pb-20 bg-black min-h-screen">
            <SEO title="Kebijakan Privasi" description="Kebijakan privasi Vorvox.id — bagaimana kami mengumpulkan, menggunakan, dan melindungi data Anda." />
            <div className="container mx-auto px-6">
                <div className="mb-16">
                    <h3 className="text-gray-500 uppercase tracking-widest mb-3 text-sm">Legal</h3>
                    <h2 className="text-5xl font-black text-white">KEBIJAKAN <br /><span className="text-gray-500">PRIVASI</span></h2>
                    <p className="text-gray-400 text-lg mt-6 max-w-2xl font-light leading-relaxed">
                        Vorvox.id menghormati privasi Anda. Kebijakan ini menjelaskan bagaimana kami
                        mengumpulkan, menggunakan, dan melindungi informasi pribadi Anda saat menggunakan
                        layanan kami.
                    </p>
                    <p className="text-gray-600 text-sm mt-3">Terakhir diperbarui: 2 Maret 2026</p>
                </div>

                <div className="space-y-6 mb-12">
                    {sections.map((section, idx) => (
                        <div key={idx} className="p-8 bg-neutral-900 border border-white/5 hover:border-white/20 transition-all">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-white text-black flex items-center justify-center">
                                    {section.icon}
                                </div>
                                <h3 className="text-lg font-bold text-white uppercase">{section.title}</h3>
                            </div>
                            <ul className="space-y-2 ml-13">
                                {section.content.map((item, i) => (
                                    <li key={i} className="flex items-start gap-2 text-gray-400 text-sm">
                                        <span className="text-white/30 mt-1 flex-shrink-0">•</span>
                                        <span className="leading-relaxed">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Contact */}
                <div className="p-8 bg-neutral-900 border border-white/10">
                    <h3 className="text-lg font-black text-white uppercase mb-4">Pertanyaan Tentang Privasi?</h3>
                    <p className="text-gray-400 text-sm mb-4 leading-relaxed">
                        Jika Anda memiliki pertanyaan atau kekhawatiran tentang kebijakan privasi kami,
                        silakan hubungi kami:
                    </p>
                    <div className="space-y-2 text-sm text-gray-400">
                        <p><span className="text-white font-bold">Email:</span> vorvoxid@gmail.com</p>
                        <p><span className="text-white font-bold">WhatsApp:</span> +62 856-4111-7775</p>
                        <p><span className="text-white font-bold">Alamat:</span> Jl. Patimura No. 45, Jeru, Kec. Tumpang, Kab. Malang, Jawa Timur 65156</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default KebijakanPrivasiPage;
