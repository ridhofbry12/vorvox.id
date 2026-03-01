import React from 'react';
import SEO from '../components/SEO';
import { ArrowRight, FileText } from 'lucide-react';

const KetentuanOrderPage = ({ setCurrentPage }) => {
    const sections = [
        {
            title: 'Minimum Order',
            items: [
                'Minimal pemesanan jersey custom printing sublimasi: 12 pcs per desain.',
                'Untuk pesanan di bawah minimum, akan dikenakan biaya tambahan satuan.',
                'Pemesanan sublim kain per meter minimal 5 meter.',
            ],
        },
        {
            title: 'Proses Pemesanan',
            items: [
                'Konsultasi desain melalui WhatsApp atau form di website.',
                'Desain akan dikerjakan oleh tim desain kami (gratis revisi hingga 3 kali).',
                'Setelah desain disetujui, pelanggan melakukan pembayaran DP minimal 50%.',
                'Produksi dimulai setelah DP diterima dan diverifikasi.',
                'Sisa pembayaran (pelunasan) dilakukan sebelum pengiriman.',
            ],
        },
        {
            title: 'Estimasi Pengerjaan',
            items: [
                'Jersey custom sublimasi: 7–14 hari kerja sejak DP diterima.',
                'Sublim kain per meter: 3–7 hari kerja.',
                'DTF printing: 3–5 hari kerja.',
                'Estimasi dapat berubah tergantung jumlah antrian dan kuantitas pesanan.',
                'Kami akan menginformasikan jika terjadi keterlambatan produksi.',
            ],
        },
        {
            title: 'Pembayaran',
            items: [
                'Pembayaran dilakukan melalui transfer bank yang tersedia di halaman pemesanan.',
                'DP minimal 50% dari total harga pesanan.',
                'Pelunasan dilakukan sebelum produk dikirim.',
                'Bukti transfer wajib diunggah melalui sistem untuk verifikasi.',
            ],
        },
        {
            title: 'Pembatalan & Pengembalian Dana',
            items: [
                'Pembatalan sebelum masuk produksi: DP dikembalikan 100%.',
                'Pembatalan setelah desain disetujui dan masuk produksi: DP tidak dapat dikembalikan.',
                'Produk yang sudah dalam proses cetak/jahit tidak dapat dibatalkan.',
                'Pengembalian dana diproses dalam 3–5 hari kerja melalui transfer bank.',
            ],
        },
        {
            title: 'Pengiriman',
            items: [
                'Pengiriman ke seluruh Indonesia melalui jasa ekspedisi (JNE, J&T, SiCepat, dll).',
                'Ongkos kirim ditanggung oleh pembeli.',
                'Bisa request COD untuk area Malang Raya (dengan perjanjian).',
                'Nomor resi akan diberikan setelah paket dikirim.',
            ],
        },
        {
            title: 'Data Pesanan',
            items: [
                'Pelanggan bertanggung jawab atas kebenaran data yang diinput (nama, nomor, ukuran).',
                'Kesalahan data dari pelanggan bukan tanggung jawab Vorvox.id.',
                'Pastikan untuk double-check semua data sebelum konfirmasi final.',
            ],
        },
    ];

    return (
        <div className="pt-32 pb-20 bg-neutral-900 min-h-screen">
            <SEO title="Ketentuan Order" description="Ketentuan dan syarat pemesanan jersey di Vorvox.id. Baca sebelum melakukan pemesanan." />
            <div className="container mx-auto px-6">
                <div className="mb-16">
                    <h3 className="text-gray-500 uppercase tracking-widest mb-3 text-sm">Syarat & Ketentuan</h3>
                    <h2 className="text-5xl font-black text-white">KETENTUAN <br /><span className="text-gray-500">ORDER</span></h2>
                    <p className="text-gray-400 text-lg mt-6 max-w-2xl font-light leading-relaxed">
                        Harap baca ketentuan berikut sebelum melakukan pemesanan di Vorvox.id.
                        Dengan melakukan pemesanan, Anda dianggap telah menyetujui seluruh ketentuan yang berlaku.
                    </p>
                </div>

                <div className="space-y-6 mb-12">
                    {sections.map((section, idx) => (
                        <div key={idx} className="p-8 bg-black border border-white/5 hover:border-white/20 transition-all">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-8 h-8 bg-white text-black flex items-center justify-center text-xs font-black">
                                    {String(idx + 1).padStart(2, '0')}
                                </div>
                                <h3 className="text-lg font-bold text-white uppercase">{section.title}</h3>
                            </div>
                            <ul className="space-y-2 ml-11">
                                {section.items.map((item, i) => (
                                    <li key={i} className="flex items-start gap-2 text-gray-400 text-sm">
                                        <span className="text-white/30 mt-1 flex-shrink-0">•</span>
                                        <span className="leading-relaxed">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* CTA */}
                <div className="p-10 border border-white/10 bg-black flex flex-col md:flex-row items-center justify-between gap-6">
                    <div>
                        <h3 className="text-xl font-black text-white mb-1">Sudah paham ketentuannya?</h3>
                        <p className="text-gray-400 text-sm">Yuk mulai bikin jersey impianmu sekarang!</p>
                    </div>
                    <button onClick={() => setCurrentPage('pemesanan')}
                        className="px-10 py-4 bg-white text-black font-bold uppercase tracking-widest hover:bg-gray-200 transition-all whitespace-nowrap flex items-center gap-2">
                        Pesan Sekarang <ArrowRight size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default KetentuanOrderPage;
