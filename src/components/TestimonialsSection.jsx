import React, { useState, useEffect, useRef } from 'react';
import { Star, Upload, X, CheckCircle, User, MessageSquare } from 'lucide-react';
import { supabase } from '../supabase';

export default function TestimonialsSection() {
    const [testimonials, setTestimonials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        product: 'Jersey Futsal',
        club: '',
        rating: 5,
        comment: '',
    });
    const [file, setFile] = useState(null);
    const [submitStatus, setSubmitStatus] = useState('idle'); // idle, uploading, success, error

    // Fetch Testimonials
    useEffect(() => {
        fetchTestimonials();
    }, []);

    const fetchTestimonials = async () => {
        try {
            const { data, error } = await supabase
                .from('testimonials')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(10);

            if (error) throw error;
            setTestimonials(data || []);
        } catch (error) {
            console.error('Error fetching testimonials:', error);
            // Fallback dummy data if table not exists
            setTestimonials([
                { id: 1, name: 'Budi Santoso', product: 'Jersey Futsal', club: 'FC Thunder', rating: 5, comment: 'Kualitas bahan sangat bagus, adem dipakai main siang bolong. Sablon juga tajam!', photo_url: null },
                { id: 2, name: 'Rian Pratama', product: 'Jersey Bola', club: 'Garuda Muda', rating: 5, comment: 'Layanan cepat, desain dibantu sampai fix. Mantap Vorvox!', photo_url: null },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitStatus('uploading');

        try {
            let photoUrl = null;

            // 1. Upload Image if exists
            if (file) {
                const fileExt = file.name.split('.').pop();
                const fileName = `${Math.random()}.${fileExt}`;
                const filePath = `${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('testimonials')
                    .upload(filePath, file);

                if (uploadError) throw uploadError;

                const { data } = supabase.storage.from('testimonials').getPublicUrl(filePath);
                photoUrl = data.publicUrl;
            }

            // 2. Insert Data
            const { error: insertError } = await supabase
                .from('testimonials')
                .insert([{
                    name: formData.name,
                    product: formData.product,
                    club: formData.club,
                    rating: parseInt(formData.rating),
                    comment: formData.comment,
                    photo_url: photoUrl
                }]);

            if (insertError) throw insertError;

            setSubmitStatus('success');
            setTimeout(() => {
                setIsModalOpen(false);
                setSubmitStatus('idle');
                setFormData({ name: '', product: 'Jersey Futsal', club: '', rating: 5, comment: '' });
                setFile(null);
                fetchTestimonials(); // Refresh list
            }, 2000);

        } catch (error) {
            console.error('Error submitting testimonial:', error);
            setSubmitStatus('error');
        }
    };

    return (
        <section className="py-24 bg-white text-black">
            <div className="container mx-auto px-6">
                <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
                    <div>
                        <h3 className="text-gray-500 uppercase tracking-widest mb-3 text-sm">Testimoni</h3>
                        <h2 className="text-4xl md:text-5xl font-black uppercase">Kata Mereka <br /><span className="text-gray-400">Tentang Vorvox</span></h2>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="px-8 py-4 bg-black text-white font-bold uppercase tracking-widest hover:bg-neutral-800 transition-all flex items-center gap-2"
                    >
                        <MessageSquare size={18} /> Tulis Review
                    </button>
                </div>

                {/* List */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {loading ? (
                        <p className="text-gray-400">Memuat testimoni...</p>
                    ) : testimonials.map((t) => (
                        <div key={t.id} className="p-8 border border-gray-200 hover:shadow-xl transition-shadow bg-gray-50">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 rounded-full bg-gray-300 overflow-hidden flex-shrink-0">
                                    {t.photo_url ? (
                                        <img src={t.photo_url} alt={t.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <User className="w-full h-full p-2 text-gray-500" />
                                    )}
                                </div>
                                <div>
                                    <h4 className="font-bold text-lg leading-tight">{t.name}</h4>
                                    <div className="text-xs text-gray-500 uppercase tracking-wider">{t.club || t.product}</div>
                                </div>
                            </div>
                            <div className="flex text-yellow-500 mb-4">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} size={16} fill={i < t.rating ? "currentColor" : "none"} stroke="currentColor" className={i < t.rating ? "" : "text-gray-300"} />
                                ))}
                            </div>
                            <p className="text-gray-600 leading-relaxed text-sm">"{t.comment}"</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* MODAL */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4">
                    <div className="bg-white text-black max-w-lg w-full p-8 relative max-h-[90vh] overflow-y-auto">
                        <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-black">
                            <X size={24} />
                        </button>

                        <h3 className="text-2xl font-black uppercase mb-6">Bagikan Pengalamanmu</h3>

                        {submitStatus === 'success' ? (
                            <div className="text-center py-10">
                                <CheckCircle size={64} className="mx-auto text-green-500 mb-4" />
                                <h4 className="text-xl font-bold mb-2">Terima Kasih!</h4>
                                <p className="text-gray-500">Review kamu berhasil dikirim.</p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Nama Lengkap</label>
                                    <input
                                        required
                                        type="text"
                                        className="w-full p-3 border border-gray-300 focus:border-black outline-none"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Produk</label>
                                        <select
                                            className="w-full p-3 border border-gray-300 focus:border-black outline-none bg-white"
                                            value={formData.product}
                                            onChange={e => setFormData({ ...formData, product: e.target.value })}
                                        >
                                            {['Jersey Futsal', 'Jersey Bola', 'Jersey Basket', 'Kaos Custom', 'Lainnya'].map(o => (
                                                <option key={o} value={o}>{o}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Nama Klub (Opsional)</label>
                                        <input
                                            type="text"
                                            className="w-full p-3 border border-gray-300 focus:border-black outline-none"
                                            value={formData.club}
                                            onChange={e => setFormData({ ...formData, club: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Rating</label>
                                    <div className="flex gap-2">
                                        {[1, 2, 3, 4, 5].map(star => (
                                            <button
                                                key={star}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, rating: star })}
                                                className={`p-2 transition-colors ${formData.rating >= star ? 'text-yellow-500' : 'text-gray-300'}`}
                                            >
                                                <Star size={24} fill="currentColor" />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Komentar</label>
                                    <textarea
                                        required
                                        rows="4"
                                        className="w-full p-3 border border-gray-300 focus:border-black outline-none resize-none"
                                        value={formData.comment}
                                        onChange={e => setFormData({ ...formData, comment: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Foto Profile (Max 2MB)</label>
                                    <div className="border-2 border-dashed border-gray-300 p-6 flex flex-col items-center justify-center text-gray-400 cursor-pointer hover:border-black hover:text-black transition-colors relative">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFileChange}
                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                        />
                                        <Upload size={24} className="mb-2" />
                                        <span className="text-xs uppercase font-bold">{file ? file.name : 'Klik untuk upload foto'}</span>
                                    </div>
                                </div>

                                {submitStatus === 'error' && (
                                    <p className="text-red-500 text-xs text-center">Gagal mengirim review. Pastikan koneksi aman.</p>
                                )}

                                <button
                                    disabled={submitStatus === 'uploading'}
                                    className="w-full py-4 bg-black text-white font-bold uppercase tracking-widest hover:bg-neutral-800 transition-all disabled:opacity-50"
                                >
                                    {submitStatus === 'uploading' ? 'Mengirim...' : 'Kirim Testimoni'}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </section>
    );
}
