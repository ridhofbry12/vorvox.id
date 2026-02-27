import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Save, Image as ImageIcon } from 'lucide-react';
import { supabase } from '../../supabase';
import ImageUploader from './ImageUploader';

export default function PortfolioManager() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);

    // Form state
    const [name, setName] = useState('');
    const [category, setCategory] = useState('Jersey Futsal');
    const [imageUrl, setImageUrl] = useState('');

    const CATEGORIES = ['Jersey Futsal', 'Jersey Bola', 'Jersey Basket', 'Kaos', 'Jaket'];

    useEffect(() => {
        fetchItems();
    }, []);

    const fetchItems = async () => {
        setLoading(true);
        const { data, error } = await supabase.from('portfolio').select('*').order('created_at', { ascending: false });
        if (error) console.error('Error fetching portfolio:', error);
        else setItems(data || []);
        setLoading(false);
    };

    const handleEdit = (item) => {
        setCurrentItem(item);
        setName(item.name);
        setCategory(item.category);
        setImageUrl(item.image_url);
        setIsEditing(true);
    };

    const handleAddNew = () => {
        setCurrentItem(null);
        setName('');
        setCategory('Jersey Futsal');
        setImageUrl('');
        setIsEditing(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Yakin ingin menghapus item portofolio ini?')) return;
        const { error } = await supabase.from('portfolio').delete().eq('id', id);
        if (error) alert(error.message);
        else fetchItems();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const payload = {
            name,
            category,
            image_url: imageUrl
        };

        if (currentItem) {
            const { error } = await supabase.from('portfolio').update(payload).eq('id', currentItem.id);
            if (error) alert(error.message);
        } else {
            const { error } = await supabase.from('portfolio').insert([payload]);
            if (error) alert(error.message);
        }

        setIsEditing(false);
        fetchItems();
    };

    if (loading && !isEditing) {
        return <div className="text-neutral-500 text-xs uppercase tracking-widest animate-pulse">Memuat Portofolio...</div>;
    }

    if (isEditing) {
        return (
            <div className="bg-neutral-900 border border-neutral-800 p-8 max-w-2xl mx-auto">
                <div className="flex justify-between items-center mb-8 border-b border-neutral-800 pb-4">
                    <h2 className="text-xl font-bold uppercase tracking-widest">{currentItem ? 'Edit Portofolio' : 'Tambah Portofolio'}</h2>
                    <button onClick={() => setIsEditing(false)} className="text-neutral-500 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="text-xs uppercase text-neutral-500 font-bold tracking-widest block mb-2">Nama Tim / Event</label>
                        <input required type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-black text-white p-3 border border-neutral-800 focus:border-white outline-none" placeholder="Contoh: FC Persada Futsal" />
                    </div>

                    <div>
                        <label className="text-xs uppercase text-neutral-500 font-bold tracking-widest block mb-2">Kategori Produk</label>
                        <select required value={category} onChange={e => setCategory(e.target.value)} className="w-full bg-black text-white p-3 border border-neutral-800 focus:border-white outline-none">
                            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>

                    <ImageUploader
                        label="Foto Hasil Jadi"
                        value={imageUrl}
                        onChange={setImageUrl}
                        folder="portfolio"
                    />

                    <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-neutral-800">
                        <button type="button" onClick={() => setIsEditing(false)} className="px-6 py-3 border border-neutral-700 hover:bg-neutral-800 transition-colors uppercase text-xs font-bold tracking-widest">
                            Batal
                        </button>
                        <button type="submit" disabled={!imageUrl} className="px-8 py-3 bg-white text-black hover:bg-gray-200 transition-colors uppercase text-xs font-bold tracking-widest flex items-center gap-2 disabled:opacity-50">
                            <Save size={16} /> Simpan Portofolio
                        </button>
                    </div>
                </form>
            </div>
        );
    }

    return (
        <div className="bg-neutral-900 border border-neutral-800">
            <div className="p-6 border-b border-neutral-800 flex justify-between items-center">
                <h2 className="text-white font-bold uppercase tracking-widest text-lg">Galeri Portofolio</h2>
                <button onClick={handleAddNew} className="flex items-center gap-2 bg-white text-black px-4 py-2 text-xs font-bold uppercase tracking-widest hover:bg-gray-200 transition-colors">
                    <Plus size={16} /> Tambah Foto
                </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-6">
                {items.length === 0 ? (
                    <div className="col-span-full py-12 text-center text-neutral-600">Belum ada portofolio.</div>
                ) : items.map(item => (
                    <div key={item.id} className="relative group bg-black border border-neutral-800 aspect-square overflow-hidden">
                        {item.image_url ? (
                            <img src={item.image_url} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 opacity-60 group-hover:opacity-100" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center"><ImageIcon className="text-neutral-700" size={32} /></div>
                        )}

                        <div className="absolute inset-0 flex flex-col justify-end p-4 bg-gradient-to-t from-black via-black/40 to-transparent">
                            <h4 className="text-sm font-bold text-white uppercase truncate">{item.name}</h4>
                            <p className="text-[10px] text-neutral-400 uppercase tracking-widest">{item.category}</p>
                        </div>

                        {/* Actions overlay */}
                        <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => handleEdit(item)} className="p-1.5 bg-black/80 hover:bg-white hover:text-black transition-colors rounded text-white">
                                <Edit2 size={14} />
                            </button>
                            <button onClick={() => handleDelete(item.id)} className="p-1.5 bg-black/80 hover:bg-red-500 transition-colors rounded text-red-500 hover:text-white">
                                <Trash2 size={14} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
