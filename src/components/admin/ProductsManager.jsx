import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Save, Image as ImageIcon } from 'lucide-react';
import { supabase } from '../../supabase';
import ImageUploader from './ImageUploader';

export default function ProductsManager() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [currentProduct, setCurrentProduct] = useState(null);

    // Form state
    const [title, setTitle] = useState('');
    const [slug, setSlug] = useState('');
    const [shortDesc, setShortDesc] = useState('');
    const [fullDesc, setFullDesc] = useState('');
    const [specs, setSpecs] = useState(''); // Textarea for JSON or newline separated
    const [badge, setBadge] = useState('');
    const [iconType, setIconType] = useState('Zap');
    const [tags, setTags] = useState('');
    const [imageUrl, setImageUrl] = useState('');

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        setLoading(true);
        const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
        if (error) console.error('Error fetching products:', error);
        else setProducts(data || []);
        setLoading(false);
    };

    const generateSlug = (text) => {
        return text.toString().toLowerCase()
            .replace(/\s+/g, '-')           // Replace spaces with -
            .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
            .replace(/\-\-+/g, '-')         // Replace multiple - with single -
            .replace(/^-+/, '')             // Trim - from start of text
            .replace(/-+$/, '');            // Trim - from end of text
    };

    const handleTitleChange = (e) => {
        setTitle(e.target.value);
        if (!currentProduct) { // Auto slug only for new products
            setSlug(generateSlug(e.target.value));
        }
    };

    const handleEdit = (product) => {
        setCurrentProduct(product);
        setTitle(product.title);
        setSlug(product.slug);
        setShortDesc(product.short_desc || '');
        setFullDesc(product.full_desc || '');

        // Convert JSON array back to newline separated string for textarea
        let specsString = '';
        if (product.specs_json) {
            try {
                const parsed = typeof product.specs_json === 'string' ? JSON.parse(product.specs_json) : product.specs_json;
                specsString = parsed.map(s => `${s.label}: ${s.value}`).join('\n');
            } catch (e) {
                console.error(e);
            }
        }
        setSpecs(specsString);

        setBadge(product.badge || '');
        setIconType(product.icon_type || 'Zap');
        setTags((product.tags || []).join(', '));
        setImageUrl(product.image_url || '');
        setIsEditing(true);
    };

    const handleAddNew = () => {
        setCurrentProduct(null);
        setTitle('');
        setSlug('');
        setShortDesc('');
        setFullDesc('');
        setSpecs('');
        setBadge('');
        setIconType('Zap');
        setTags('');
        setImageUrl('');
        setIsEditing(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Yakin ingin menghapus produk ini?')) return;
        const { error } = await supabase.from('products').delete().eq('id', id);
        if (error) alert(error.message);
        else fetchProducts();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Parse tags
        const tagsArray = tags.split(',').map(t => t.trim()).filter(t => t);

        // Parse specs (Format expected: Label: Value \n Label: Value)
        let specsJson = [];
        if (specs) {
            specsJson = specs.split('\n').map(line => {
                const parts = line.split(':');
                if (parts.length >= 2) {
                    return { label: parts[0].trim(), value: parts.slice(1).join(':').trim() };
                }
                return { label: 'Info', value: line.trim() };
            });
        }

        const payload = {
            title,
            slug,
            short_desc: shortDesc,
            full_desc: fullDesc,
            specs_json: specsJson,
            badge,
            icon_type: iconType,
            tags: tagsArray,
            image_url: imageUrl
        };

        if (currentProduct) {
            const { error } = await supabase.from('products').update(payload).eq('id', currentProduct.id);
            if (error) alert(error.message);
        } else {
            const { error } = await supabase.from('products').insert([payload]);
            if (error) alert(error.message);
        }

        setIsEditing(false);
        fetchProducts();
    };

    if (loading && !isEditing) {
        return <div className="text-neutral-500 text-xs uppercase tracking-widest animate-pulse">Memuat Produk...</div>;
    }

    if (isEditing) {
        return (
            <div className="bg-neutral-900 border border-neutral-800 p-8">
                <div className="flex justify-between items-center mb-8 border-b border-neutral-800 pb-4">
                    <h2 className="text-xl font-bold uppercase tracking-widest">{currentProduct ? 'Edit Produk' : 'Tambah Produk Baru'}</h2>
                    <button onClick={() => setIsEditing(false)} className="text-neutral-500 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Kiri */}
                        <div className="space-y-6">
                            <div>
                                <label className="text-xs uppercase text-neutral-500 font-bold tracking-widest block mb-2">Nama Produk</label>
                                <input required type="text" value={title} onChange={handleTitleChange} className="w-full bg-black text-white p-3 border border-neutral-800 focus:border-white outline-none" />
                            </div>

                            <div>
                                <label className="text-xs uppercase text-neutral-500 font-bold tracking-widest block mb-2">Slug URL (Otomatis)</label>
                                <input required type="text" value={slug} onChange={e => setSlug(e.target.value)} className="w-full bg-black text-neutral-400 p-3 border border-neutral-800 focus:border-white outline-none font-mono text-sm" />
                            </div>

                            <div>
                                <label className="text-xs uppercase text-neutral-500 font-bold tracking-widest block mb-2">Deskripsi Singkat (List Page)</label>
                                <textarea required rows="3" value={shortDesc} onChange={e => setShortDesc(e.target.value)} className="w-full bg-black text-white p-3 border border-neutral-800 focus:border-white outline-none resize-none" />
                            </div>

                            <div>
                                <label className="text-xs uppercase text-neutral-500 font-bold tracking-widest block mb-2">Tags (Pisahkan dengan koma)</label>
                                <input type="text" value={tags} onChange={e => setTags(e.target.value)} placeholder="futsal, polyster, premium" className="w-full bg-black text-white p-3 border border-neutral-800 focus:border-white outline-none" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs uppercase text-neutral-500 font-bold tracking-widest block mb-2">Badge (Opsional)</label>
                                    <input type="text" value={badge} onChange={e => setBadge(e.target.value)} placeholder="Terbaru / Terlaris" className="w-full bg-black text-white p-3 border border-neutral-800 focus:border-white outline-none" />
                                </div>
                                <div>
                                    <label className="text-xs uppercase text-neutral-500 font-bold tracking-widest block mb-2">Icon Type</label>
                                    <select value={iconType} onChange={e => setIconType(e.target.value)} className="w-full bg-black text-white p-3 border border-neutral-800 focus:border-white outline-none">
                                        <option value="Zap">Zap (Petir)</option>
                                        <option value="Star">Star (Bintang)</option>
                                        <option value="Shirt">Shirt (Kaos)</option>
                                        <option value="Package">Package (Box)</option>
                                        <option value="Users">Users</option>
                                        <option value="Scissors">Scissors</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Kanan */}
                        <div className="space-y-6">
                            <ImageUploader
                                label="Foto Utama Produk"
                                value={imageUrl}
                                onChange={setImageUrl}
                                folder="products"
                            />

                            <div>
                                <label className="text-xs uppercase text-neutral-500 font-bold tracking-widest block mb-2">Deskripsi Lengkap (Product Detail Page)</label>
                                <textarea required rows="5" value={fullDesc} onChange={e => setFullDesc(e.target.value)} className="w-full bg-black text-white p-3 border border-neutral-800 focus:border-white outline-none resize-y" />
                            </div>

                            <div>
                                <label className="text-xs uppercase text-neutral-500 font-bold tracking-widest block mb-2">Spesifikasi (Format: Label: Value per baris)</label>
                                <textarea rows="4" value={specs} onChange={e => setSpecs(e.target.value)} placeholder="Material: Polyester Milky&#10;Printing: Full Sublimation" className="w-full bg-black text-white p-3 border border-neutral-800 focus:border-white outline-none resize-y font-mono text-xs" />
                                <p className="text-[10px] mt-1 text-neutral-600">Tekan enter untuk spesifikasi baru. Pisahkan label dan nilai dengan titik dua (:)</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-neutral-800">
                        <button type="button" onClick={() => setIsEditing(false)} className="px-6 py-3 border border-neutral-700 hover:bg-neutral-800 transition-colors uppercase text-xs font-bold tracking-widest">
                            Batal
                        </button>
                        <button type="submit" className="px-8 py-3 bg-white text-black hover:bg-gray-200 transition-colors uppercase text-xs font-bold tracking-widest flex items-center gap-2">
                            <Save size={16} /> Simpan Produk
                        </button>
                    </div>
                </form>
            </div>
        );
    }

    return (
        <div className="bg-neutral-900 border border-neutral-800">
            <div className="p-6 border-b border-neutral-800 flex justify-between items-center">
                <h2 className="text-white font-bold uppercase tracking-widest text-lg">Katalog Produk</h2>
                <button onClick={handleAddNew} className="flex items-center gap-2 bg-white text-black px-4 py-2 text-xs font-bold uppercase tracking-widest hover:bg-gray-200 transition-colors">
                    <Plus size={16} /> Tambah Produk
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-neutral-400">
                    <thead className="bg-black text-neutral-500 uppercase tracking-wider text-xs font-bold border-b border-neutral-800">
                        <tr>
                            <th className="p-4 w-16">Foto</th>
                            <th className="p-4">Nama Produk</th>
                            <th className="p-4">Slug URL</th>
                            <th className="p-4 hidden md:table-cell">Badge</th>
                            <th className="p-4 text-right">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-800">
                        {products.length === 0 ? (
                            <tr><td colSpan="5" className="p-8 text-center text-neutral-600">Belum ada produk.</td></tr>
                        ) : products.map(p => (
                            <tr key={p.id} className="hover:bg-neutral-800/50 transition-colors">
                                <td className="p-4">
                                    {p.image_url ? (
                                        <img src={p.image_url} alt={p.title} className="w-10 h-10 object-cover border border-neutral-700" />
                                    ) : (
                                        <div className="w-10 h-10 bg-black border border-neutral-700 flex items-center justify-center"><ImageIcon size={16} className="text-neutral-600" /></div>
                                    )}
                                </td>
                                <td className="p-4 font-bold text-white">{p.title}</td>
                                <td className="p-4 font-mono text-xs">{p.slug}</td>
                                <td className="p-4 hidden md:table-cell">
                                    {p.badge && <span className="px-2 py-1 bg-neutral-800 text-xs text-white uppercase tracking-widest border border-neutral-700">{p.badge}</span>}
                                </td>
                                <td className="p-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        <button onClick={() => handleEdit(p)} className="p-2 hover:bg-white hover:text-black hover:shadow-lg transition-all rounded"><Edit2 size={16} /></button>
                                        <button onClick={() => handleDelete(p.id)} className="p-2 hover:bg-red-500 hover:text-white transition-all rounded text-red-500/70"><Trash2 size={16} /></button>
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
