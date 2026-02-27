import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Save, Image as ImageIcon } from 'lucide-react';
import { supabase } from '../../supabase';
import ImageUploader from './ImageUploader';

export default function VendorSublimManager() {
    const [categories, setCategories] = useState([]);
    const [advantages, setAdvantages] = useState([]);

    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('categories'); // categories | advantages

    // Form States
    const [isEditing, setIsEditing] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);
    const [formData, setFormData] = useState({
        title: '', description: '', image_url: '', tags: '', is_wide: false, icon_type: 'Check', order_index: 0
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        const [catRes, advRes] = await Promise.all([
            supabase.from('vendor_sublim_kategori').select('*').order('order_index', { ascending: true }),
            supabase.from('vendor_sublim_keunggulan').select('*').order('order_index', { ascending: true })
        ]);

        if (catRes.error) console.error('Error fetching categories:', catRes.error);
        else setCategories(catRes.data || []);

        if (advRes.error) console.error('Error fetching advantages:', advRes.error);
        else setAdvantages(advRes.data || []);

        setLoading(false);
    };

    const handleEdit = (item, type) => {
        setCurrentItem(item);
        if (type === 'categories') {
            setFormData({
                title: item.title,
                description: item.description,
                image_url: item.image_url,
                tags: (item.tags || []).join(', '),
                is_wide: item.is_wide,
                order_index: item.order_index || 0
            });
        } else {
            setFormData({
                title: item.title,
                description: item.description,
                icon_type: item.icon_type,
                order_index: item.order_index || 0
            });
        }
        setIsEditing(type); // 'categories' or 'advantages'
    };

    const handleAddNew = (type) => {
        setCurrentItem(null);
        setFormData(type === 'categories'
            ? { title: '', description: '', image_url: '', tags: '', is_wide: false, order_index: categories.length + 1 }
            : { title: '', description: '', icon_type: 'Check', order_index: advantages.length + 1 }
        );
        setIsEditing(type);
    };

    const handleDelete = async (id, table) => {
        if (!window.confirm('Yakin ingin menghapus item ini?')) return;
        const { error } = await supabase.from(table).delete().eq('id', id);
        if (error) alert(error.message);
        else fetchData();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const table = isEditing === 'categories' ? 'vendor_sublim_kategori' : 'vendor_sublim_keunggulan';

        let payload = {};
        if (isEditing === 'categories') {
            payload = {
                title: formData.title,
                description: formData.description,
                image_url: formData.image_url,
                tags: formData.tags.split(',').map(t => t.trim()).filter(t => t),
                is_wide: formData.is_wide,
                order_index: formData.order_index
            };
        } else {
            payload = {
                title: formData.title,
                description: formData.description,
                icon_type: formData.icon_type,
                order_index: formData.order_index
            };
        }

        if (currentItem) {
            const { error } = await supabase.from(table).update(payload).eq('id', currentItem.id);
            if (error) alert(error.message);
        } else {
            const { error } = await supabase.from(table).insert([payload]);
            if (error) alert(error.message);
        }

        setIsEditing(false);
        fetchData();
    };

    if (loading && !isEditing) {
        return <div className="text-neutral-500 text-xs uppercase tracking-widest animate-pulse">Memuat Data Vendor...</div>;
    }

    if (isEditing) {
        return (
            <div className="bg-neutral-900 border border-neutral-800 p-8 max-w-2xl mx-auto">
                <div className="flex justify-between items-center mb-8 border-b border-neutral-800 pb-4">
                    <h2 className="text-xl font-bold uppercase tracking-widest">
                        {currentItem ? 'Edit' : 'Tambah'} {isEditing === 'categories' ? 'Kategori Cetak' : 'Keunggulan'}
                    </h2>
                    <button onClick={() => setIsEditing(false)} className="text-neutral-500 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="text-xs uppercase text-neutral-500 font-bold tracking-widest block mb-2">Judul</label>
                        <input required type="text" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="w-full bg-black text-white p-3 border border-neutral-800 outline-none" />
                    </div>

                    <div>
                        <label className="text-xs uppercase text-neutral-500 font-bold tracking-widest block mb-2">Deskripsi</label>
                        <textarea required rows="3" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full bg-black text-white p-3 border border-neutral-800 outline-none resize-none" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs uppercase text-neutral-500 font-bold tracking-widest block mb-2">Urutan (Angka)</label>
                            <input required type="number" value={formData.order_index} onChange={e => setFormData({ ...formData, order_index: parseInt(e.target.value) || 0 })} className="w-full bg-black text-white p-3 border border-neutral-800 outline-none" />
                        </div>
                        {isEditing === 'advantages' && (
                            <div>
                                <label className="text-xs uppercase text-neutral-500 font-bold tracking-widest block mb-2">Icon Type</label>
                                <select value={formData.icon_type} onChange={e => setFormData({ ...formData, icon_type: e.target.value })} className="w-full bg-black text-white p-3 border border-neutral-800 outline-none">
                                    <option value="Zap">Petir (Zap)</option>
                                    <option value="Layers">Layer (Tumpukan)</option>
                                    <option value="Timer">Waktu (Timer)</option>
                                    <option value="Package">Box (Package)</option>
                                    <option value="Check">Centang (Check)</option>
                                    <option value="ArrowRight">Panah (Arrow)</option>
                                </select>
                            </div>
                        )}
                    </div>

                    {isEditing === 'categories' && (
                        <>
                            <div>
                                <label className="text-xs uppercase text-neutral-500 font-bold tracking-widest block mb-2">Tags (Pisahkan dg Koma)</label>
                                <input type="text" value={formData.tags} onChange={e => setFormData({ ...formData, tags: e.target.value })} className="w-full bg-black text-white p-3 border border-neutral-800 outline-none" placeholder="Futsal, Basket, Bola" />
                            </div>

                            <label className="flex items-center gap-3 bg-black p-4 border border-neutral-800 cursor-pointer">
                                <input type="checkbox" checked={formData.is_wide} onChange={e => setFormData({ ...formData, is_wide: e.target.checked })} className="w-5 h-5 accent-white cursor-pointer" />
                                <div>
                                    <div className="text-sm font-bold text-white uppercase tracking-wider">Tampilan Full Windows</div>
                                    <div className="text-xs text-neutral-500">Centang jika ini kategori besar (ditampilkan penuh di bawah)</div>
                                </div>
                            </label>

                            <ImageUploader
                                label="Foto Preview Kategori"
                                value={formData.image_url}
                                onChange={url => setFormData({ ...formData, image_url: url })}
                                folder="vendor"
                            />
                        </>
                    )}

                    <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-neutral-800">
                        <button type="button" onClick={() => setIsEditing(false)} className="px-6 py-3 border border-neutral-700 hover:bg-neutral-800 transition-colors uppercase text-xs font-bold tracking-widest">
                            Batal
                        </button>
                        <button type="submit" className="px-8 py-3 bg-white text-black hover:bg-gray-200 transition-colors uppercase text-xs font-bold tracking-widest flex items-center gap-2">
                            <Save size={16} /> Simpan Data
                        </button>
                    </div>
                </form>
            </div>
        );
    }

    return (
        <div className="bg-neutral-900 border border-neutral-800">
            {/* TABS */}
            <div className="flex border-b border-neutral-800">
                <button
                    onClick={() => setActiveTab('categories')}
                    className={`flex-1 py-4 text-xs font-bold uppercase tracking-widest transition-colors ${activeTab === 'categories' ? 'bg-white text-black' : 'text-neutral-500 hover:text-white hover:bg-neutral-800'}`}
                >
                    Kategori Cetak
                </button>
                <button
                    onClick={() => setActiveTab('advantages')}
                    className={`flex-1 py-4 text-xs font-bold uppercase tracking-widest transition-colors ${activeTab === 'advantages' ? 'bg-white text-black' : 'text-neutral-500 hover:text-white hover:bg-neutral-800'}`}
                >
                    Keunggulan Sublim
                </button>
            </div>

            <div className="p-6 border-b border-neutral-800 flex justify-between items-center">
                <h2 className="text-neutral-400 font-bold uppercase tracking-widest text-sm">
                    {activeTab === 'categories' ? 'Daftar Kategori Produk' : 'Daftar Nilai Jual'}
                </h2>
                <button onClick={() => handleAddNew(activeTab)} className="flex items-center gap-2 bg-white text-black px-4 py-2 text-xs font-bold uppercase tracking-widest hover:bg-gray-200 transition-colors">
                    <Plus size={16} /> Tambah Baru
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-neutral-400">
                    <thead className="bg-black text-neutral-500 uppercase tracking-wider text-xs font-bold border-b border-neutral-800">
                        <tr>
                            <th className="p-4 w-12 text-center">No</th>
                            {activeTab === 'categories' && <th className="p-4 w-16">Foto</th>}
                            <th className="p-4">Judul</th>
                            <th className="p-4 hidden md:table-cell">Deskripsi Singkat</th>
                            <th className="p-4 text-right">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-800">
                        {(activeTab === 'categories' ? categories : advantages).map((item, index) => (
                            <tr key={item.id} className="hover:bg-neutral-800/50 transition-colors">
                                <td className="p-4 text-center font-mono opacity-50">{item.order_index}</td>
                                {activeTab === 'categories' && (
                                    <td className="p-4">
                                        {item.image_url ? (
                                            <img src={item.image_url} alt={item.title} className="w-10 h-10 object-cover border border-neutral-700" />
                                        ) : (
                                            <div className="w-10 h-10 bg-black flex items-center justify-center"><ImageIcon size={16} className="text-neutral-600" /></div>
                                        )}
                                    </td>
                                )}
                                <td className="p-4 font-bold text-white">
                                    {item.title}
                                    {item.is_wide && <span className="ml-2 px-2 py-0.5 bg-neutral-800 text-[10px] text-white uppercase tracking-widest border border-neutral-700">Full Width</span>}
                                </td>
                                <td className="p-4 hidden md:table-cell truncate max-w-xs">{item.description}</td>
                                <td className="p-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        <button onClick={() => handleEdit(item, activeTab)} className="p-2 hover:bg-white hover:text-black hover:shadow-lg transition-all rounded"><Edit2 size={16} /></button>
                                        <button onClick={() => handleDelete(item.id, activeTab === 'categories' ? 'vendor_sublim_kategori' : 'vendor_sublim_keunggulan')} className="p-2 hover:bg-red-500 hover:text-white transition-all rounded text-red-500/70"><Trash2 size={16} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
