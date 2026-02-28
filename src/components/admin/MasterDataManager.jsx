import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabase';
import { Plus, Trash2, Edit2, Check, X, CreditCard, Layers, Tag, Save } from 'lucide-react';

const MasterDataManager = () => {
    return (
        <div className="space-y-12">
            <div>
                <h2 className="text-2xl font-black text-white uppercase tracking-tighter mb-2">Master Data</h2>
                <p className="text-neutral-500 text-sm">Kelola Metode Pembayaran, Bahan Jersey, dan Model Kerah.</p>
            </div>

            <ProductManager />

            <SectionManager
                title="Metode Pembayaran"
                table="payment_methods"
                icon={<CreditCard />}
                hasDescription={true}
                hasPrice={false}
            />

            <SectionManager
                title="Bahan Jersey (Harga Tambahan)"
                table="bahan_jersey"
                icon={<Layers />}
                hasDescription={false}
                hasPrice={true}
            />

            <SectionManager
                title="Model Kerah (Harga Tambahan)"
                table="model_kerah"
                icon={<Tag />}
                hasDescription={false}
                hasPrice={true}
            />
        </div>
    );
};

const ProductManager = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({ title: '', base_price: 0, dp_percentage: 50 });

    const fetchItems = async () => {
        setLoading(true);
        const { data, error } = await supabase.from('products').select('id, title, base_price, dp_percentage, image_url').order('created_at', { ascending: true });
        if (!error) setItems(data || []);
        setLoading(false);
    };

    useEffect(() => {
        fetchItems();
    }, []);

    const handleSave = async () => {
        if (!formData.title) return alert('Nama Produk harus diisi');

        const payload = {
            title: formData.title,
            base_price: Number(formData.base_price),
            dp_percentage: Number(formData.dp_percentage)
        };

        if (editingId) {
            const { error } = await supabase.from('products').update(payload).eq('id', editingId);
            if (!error) {
                setEditingId(null);
                setFormData({ title: '', base_price: 0, dp_percentage: 50 });
                fetchItems();
            } else {
                alert('Error update: ' + error.message);
            }
        } else {
            // Minimal required for insert (mocking the rest)
            payload.slug = formData.title.toLowerCase().replace(/ /g, '-');
            payload.short_desc = 'Deskripsi singkat auto-generated';
            payload.full_desc = 'Deskripsi lengkap auto-generated';
            payload.image_url = 'https://via.placeholder.com/800x800';

            const { error } = await supabase.from('products').insert([payload]);
            if (!error) {
                setFormData({ title: '', base_price: 0, dp_percentage: 50 });
                fetchItems();
            } else {
                alert('Error insert: ' + error.message);
            }
        }
    };

    const handleEdit = (item) => {
        setEditingId(item.id);
        setFormData({
            title: item.title,
            base_price: item.base_price || 0,
            dp_percentage: item.dp_percentage || 50
        });
    };

    const handleDelete = async (id) => {
        if (!confirm('Hapus produk ini?')) return;
        const { error } = await supabase.from('products').delete().eq('id', id);
        if (!error) fetchItems();
    };

    const handleCancel = () => {
        setEditingId(null);
        setFormData({ title: '', base_price: 0, dp_percentage: 50 });
    };

    // We only allow editing price here to keep it simple and safe for the UI
    return (
        <div className="bg-neutral-900 border border-neutral-800 p-6 mb-12">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-900/50 text-blue-400 border border-blue-900 rounded-lg"><Tag /></div>
                <div>
                    <h3 className="text-white font-bold uppercase tracking-wider text-sm">Produk / Jenis Pesanan</h3>
                    <p className="text-xs text-neutral-500">Atur harga dasar (Base Price) dan persen DP untuk tiap produk.</p>
                </div>
            </div>

            {/* Form */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-black border border-neutral-800">
                <div className="space-y-1">
                    <label className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold">Nama Produk</label>
                    <input type="text" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="w-full bg-neutral-900 border border-neutral-800 text-white p-3 outline-none focus:border-white transition-colors text-sm" placeholder="Contoh: Jersey Basket" />
                </div>
                <div className="space-y-1">
                    <label className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold">Base Price (Rp)</label>
                    <input type="number" value={formData.base_price} onChange={e => setFormData({ ...formData, base_price: e.target.value })} className="w-full bg-neutral-900 border border-neutral-800 text-white p-3 outline-none focus:border-white transition-colors text-sm" placeholder="Contoh: 150000" />
                </div>
                <div className="space-y-1">
                    <label className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold">DP Percentage (%)</label>
                    <input type="number" value={formData.dp_percentage} onChange={e => setFormData({ ...formData, dp_percentage: e.target.value })} className="w-full bg-neutral-900 border border-neutral-800 text-white p-3 outline-none focus:border-white transition-colors text-sm" placeholder="Contoh: 50" />
                </div>
                <div className="md:col-span-3 flex justify-end gap-4 mt-2">
                    {editingId && (
                        <button onClick={handleCancel} className="flex items-center gap-2 px-4 py-3 bg-neutral-800 text-white text-xs font-bold uppercase tracking-widest hover:bg-neutral-700 transition-colors">
                            <X size={16} /> Batal
                        </button>
                    )}
                    <button onClick={handleSave} className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white text-xs font-bold uppercase tracking-widest hover:bg-blue-500 transition-colors">
                        <Save size={16} /> {editingId ? 'Update Harga' : 'Tambah Produk'}
                    </button>
                </div>
            </div>

            {/* Table */}
            {loading ? <div className="text-neutral-500 text-sm">Memuat data produk...</div> : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-neutral-800 text-xs uppercase tracking-widest text-neutral-500">
                                <th className="p-3 font-normal">Gambar</th>
                                <th className="p-3 font-normal">Nama Produk</th>
                                <th className="p-3 font-normal">Harga Dasar (Rp)</th>
                                <th className="p-3 font-normal text-center">Persentase DP</th>
                                <th className="p-3 font-normal text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.length === 0 ? (
                                <tr><td colSpan={5} className="p-4 text-center text-neutral-600 text-sm">Belum ada produk</td></tr>
                            ) : items.map(item => (
                                <tr key={item.id} className="border-b border-neutral-800 hover:bg-neutral-800/50">
                                    <td className="p-3">
                                        {item.image_url ? (
                                            <img src={item.image_url} alt={item.title} className="w-10 h-10 object-cover rounded" />
                                        ) : <div className="w-10 h-10 bg-neutral-800 rounded flex items-center justify-center text-xs text-neutral-500">-</div>}
                                    </td>
                                    <td className="p-3 text-white font-bold">{item.title}</td>
                                    <td className="p-3 text-blue-400 font-mono text-sm">Rp {(item.base_price || 0).toLocaleString('id-ID')}</td>
                                    <td className="p-3 text-center text-white">{item.dp_percentage || 0}%</td>
                                    <td className="p-3 text-right space-x-2 whitespace-nowrap">
                                        <button onClick={() => handleEdit(item)} className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded transition-colors" title="Edit"><Edit2 size={16} /></button>
                                        <button onClick={() => handleDelete(item.id)} className="p-2 text-red-500 hover:text-white hover:bg-red-900/50 rounded transition-colors" title="Hapus"><Trash2 size={16} /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

const SectionManager = ({ title, table, icon, hasDescription, hasPrice }) => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({ name: '', description: '', additional_price: 0, image_url: '', is_active: true });

    // Khusus untuk icon_url vs image_url based on table
    const imgField = table === 'payment_methods' ? 'icon_url' : 'image_url';

    const fetchItems = async () => {
        setLoading(true);
        const { data, error } = await supabase.from(table).select('*').order('created_at', { ascending: true });
        if (!error) setItems(data || []);
        setLoading(false);
    };

    useEffect(() => {
        fetchItems();
    }, [table]);

    const handleSave = async () => {
        if (!formData.name) return alert('Nama harus diisi');

        const payload = {
            name: formData.name,
            is_active: formData.is_active,
            [imgField]: formData.image_url
        };

        if (hasDescription) payload.description = formData.description;
        if (hasPrice) payload.additional_price = Number(formData.additional_price);

        if (editingId) {
            const { error } = await supabase.from(table).update(payload).eq('id', editingId);
            if (!error) {
                setEditingId(null);
                setFormData({ name: '', description: '', additional_price: 0, image_url: '', is_active: true });
                fetchItems();
            } else {
                alert('Error update: ' + error.message);
            }
        } else {
            const { error } = await supabase.from(table).insert([payload]);
            if (!error) {
                setFormData({ name: '', description: '', additional_price: 0, image_url: '', is_active: true });
                fetchItems();
            } else {
                alert('Error insert: ' + error.message);
            }
        }
    };

    const handleEdit = (item) => {
        setEditingId(item.id);
        setFormData({
            name: item.name,
            description: item.description || '',
            additional_price: item.additional_price || 0,
            image_url: item[imgField] || '',
            is_active: item.is_active
        });
    };

    const handleDelete = async (id) => {
        if (!confirm('Hapus item ini?')) return;
        const { error } = await supabase.from(table).delete().eq('id', id);
        if (!error) fetchItems();
    };

    const handleCancel = () => {
        setEditingId(null);
        setFormData({ name: '', description: '', additional_price: 0, image_url: '', is_active: true });
    };

    return (
        <div className="bg-neutral-900 border border-neutral-800 p-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-black text-white rounded-lg">{icon}</div>
                <h3 className="text-white font-bold uppercase tracking-wider text-sm">{title}</h3>
            </div>

            {/* Form */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 p-4 bg-black border border-neutral-800">
                <div className="space-y-1">
                    <label className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold">Nama</label>
                    <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full bg-neutral-900 border border-neutral-800 text-white p-3 outline-none focus:border-white transition-colors text-sm" placeholder="Contoh: Transfer BCA" />
                </div>

                {hasDescription && (
                    <div className="space-y-1">
                        <label className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold">Deskripsi / No Rekening</label>
                        <input type="text" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full bg-neutral-900 border border-neutral-800 text-white p-3 outline-none focus:border-white transition-colors text-sm" placeholder="87123182 a/n Vorvox" />
                    </div>
                )}

                {hasPrice && (
                    <div className="space-y-1">
                        <label className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold">Harga Tambahan (Rp)</label>
                        <input type="number" value={formData.additional_price} onChange={e => setFormData({ ...formData, additional_price: e.target.value })} className="w-full bg-neutral-900 border border-neutral-800 text-white p-3 outline-none focus:border-white transition-colors text-sm" placeholder="0" />
                    </div>
                )}

                <div className="space-y-1">
                    <label className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold">URL Gambar / Logo / QRIS</label>
                    <input type="text" value={formData.image_url} onChange={e => setFormData({ ...formData, image_url: e.target.value })} className="w-full bg-neutral-900 border border-neutral-800 text-white p-3 outline-none focus:border-white transition-colors text-sm" placeholder="https://..." />
                </div>

                <div className="space-y-1 md:col-span-2 flex items-center gap-4 mt-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={formData.is_active} onChange={e => setFormData({ ...formData, is_active: e.target.checked })} className="accent-white w-4 h-4 cursor-pointer" />
                        <span className="text-xs text-white uppercase tracking-widest font-bold">Aktif</span>
                    </label>
                    <div className="flex-1"></div>
                    {editingId && (
                        <button onClick={handleCancel} className="flex items-center gap-2 px-4 py-3 bg-neutral-800 text-white text-xs font-bold uppercase tracking-widest hover:bg-neutral-700 transition-colors">
                            <X size={16} /> Batal
                        </button>
                    )}
                    <button onClick={handleSave} className="flex items-center gap-2 px-6 py-3 bg-white text-black text-xs font-bold uppercase tracking-widest hover:bg-gray-200 transition-colors">
                        <Save size={16} /> {editingId ? 'Update' : 'Tambah'}
                    </button>
                </div>
            </div>

            {/* Table */}
            {loading ? <div className="text-neutral-500 text-sm">Memuat data...</div> : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-neutral-800 text-xs uppercase tracking-widest text-neutral-500">
                                <th className="p-3 font-normal">Gambar</th>
                                <th className="p-3 font-normal">Nama</th>
                                {hasDescription && <th className="p-3 font-normal">Deskripsi</th>}
                                {hasPrice && <th className="p-3 font-normal">+ Harga</th>}
                                <th className="p-3 font-normal text-center">Status</th>
                                <th className="p-3 font-normal text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.length === 0 ? (
                                <tr><td colSpan={6} className="p-4 text-center text-neutral-600 text-sm">Belum ada data</td></tr>
                            ) : items.map(item => (
                                <tr key={item.id} className="border-b border-neutral-800 hover:bg-neutral-800/50">
                                    <td className="p-3">
                                        {item[imgField] ? (
                                            <img src={item[imgField]} alt={item.name} className="w-10 h-10 object-contain bg-white rounded p-1" />
                                        ) : <div className="w-10 h-10 bg-neutral-800 rounded flex items-center justify-center text-xs text-neutral-500">-</div>}
                                    </td>
                                    <td className="p-3 text-white font-bold">{item.name}</td>
                                    {hasDescription && <td className="p-3 text-neutral-400 text-sm">{item.description || '-'}</td>}
                                    {hasPrice && <td className="p-3 text-neutral-400 text-sm">Rp {Number(item.additional_price).toLocaleString('id-ID')}</td>}
                                    <td className="p-3 text-center">
                                        {item.is_active ? <span className="text-green-400 text-xs px-2 py-1 bg-green-900/20 rounded">Aktif</span> : <span className="text-red-400 text-xs px-2 py-1 bg-red-900/20 rounded">Nonaktif</span>}
                                    </td>
                                    <td className="p-3 text-right space-x-2 whitespace-nowrap">
                                        <button onClick={() => handleEdit(item)} className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded transition-colors" title="Edit"><Edit2 size={16} /></button>
                                        <button onClick={() => handleDelete(item.id)} className="p-2 text-red-500 hover:text-white hover:bg-red-900/50 rounded transition-colors" title="Hapus"><Trash2 size={16} /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default MasterDataManager;
