import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Save } from 'lucide-react';
import { supabase } from '../../supabase';

export default function PageDataManager() {
    const [activeTab, setActiveTab] = useState('page_size_chart'); // table name
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    // Form States
    const [isEditing, setIsEditing] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);
    const [formData, setFormData] = useState({});

    const TABS = [
        { id: 'page_size_chart', label: 'Size Chart' },
        { id: 'page_materials', label: 'Bahan Jersey' },
        { id: 'page_collars', label: 'Model Kerah' },
        { id: 'page_fonts', label: 'Koleksi Font' }
    ];

    useEffect(() => {
        fetchData(activeTab);
    }, [activeTab]);

    const fetchData = async (table) => {
        setLoading(true);
        const { data, error } = await supabase.from(table).select('*').order(table === 'page_size_chart' ? 'order_index' : 'created_at', { ascending: true });
        if (error) console.error(`Error fetching ${table}:`, error);
        else setItems(data || []);
        setLoading(false);
    };

    const handleTabChange = (tabId) => {
        setActiveTab(tabId);
        setIsEditing(false);
    };

    const handleEdit = (item) => {
        setCurrentItem(item);

        // Populate form based on active tab
        let initialForm = {};
        if (activeTab === 'page_size_chart') {
            initialForm = { size_label: item.size_label, width_cm: item.width_cm, length_cm: item.length_cm, order_index: item.order_index || 0 };
        } else if (activeTab === 'page_materials') {
            initialForm = { name: item.name, description: item.description, pros_list: (item.pros_list || []).join('\n'), badge_text: item.badge_text || '', badge_color: item.badge_color || '', border_color: item.border_color || '' };
        } else if (activeTab === 'page_collars') {
            initialForm = { name: item.name, description: item.description, is_popular: item.is_popular, icon_svg_type: item.icon_svg_type || '' };
        } else if (activeTab === 'page_fonts') {
            initialForm = { name: item.name, css_style_json: typeof item.css_style_json === 'string' ? item.css_style_json : JSON.stringify(item.css_style_json, null, 2) };
        }

        setFormData(initialForm);
        setIsEditing(true);
    };

    const handleAddNew = () => {
        setCurrentItem(null);
        let initialForm = {};
        if (activeTab === 'page_size_chart') {
            initialForm = { size_label: '', width_cm: 0, length_cm: 0, order_index: items.length + 1 };
        } else if (activeTab === 'page_materials') {
            initialForm = { name: '', description: '', pros_list: '', badge_text: '', badge_color: '', border_color: '' };
        } else if (activeTab === 'page_collars') {
            initialForm = { name: '', description: '', is_popular: false, icon_svg_type: '' };
        } else if (activeTab === 'page_fonts') {
            initialForm = { name: '', css_style_json: '{\n  "fontFamily": "Impact, sans-serif",\n  "fontWeight": "bold"\n}' };
        }
        setFormData(initialForm);
        setIsEditing(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Yakin ingin menghapus item ini?')) return;
        const { error } = await supabase.from(activeTab).delete().eq('id', id);
        if (error) alert(error.message);
        else fetchData(activeTab);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        let payload = { ...formData };

        // Pre-process before save depending on tab
        if (activeTab === 'page_materials') {
            payload.pros_list = formData.pros_list.split('\n').filter(p => p.trim());
        }
        if (activeTab === 'page_fonts') {
            try {
                payload.css_style_json = JSON.parse(formData.css_style_json);
            } catch (err) {
                alert('Format CSS JSON tidak valid!');
                return;
            }
        }

        if (currentItem) {
            const { error } = await supabase.from(activeTab).update(payload).eq('id', currentItem.id);
            if (error) alert(error.message);
        } else {
            const { error } = await supabase.from(activeTab).insert([payload]);
            if (error) alert(error.message);
        }

        setIsEditing(false);
        fetchData(activeTab);
    };

    // --- Dynamic Form Renderers ---
    const renderForm = () => {
        if (activeTab === 'page_size_chart') {
            return (
                <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                        <label className="text-xs uppercase text-neutral-500 font-bold tracking-widest block mb-2">Simbol Ukuran</label>
                        <input required type="text" value={formData.size_label || ''} onChange={e => setFormData({ ...formData, size_label: e.target.value.toUpperCase() })} placeholder="S / M / L" className="w-full bg-black text-white p-3 border border-neutral-800 outline-none" />
                    </div>
                    <div>
                        <label className="text-xs uppercase text-neutral-500 font-bold tracking-widest block mb-2">Lebar (cm)</label>
                        <input required type="number" step="0.1" value={formData.width_cm || 0} onChange={e => setFormData({ ...formData, width_cm: parseFloat(e.target.value) })} className="w-full bg-black text-white p-3 border border-neutral-800 outline-none" />
                    </div>
                    <div>
                        <label className="text-xs uppercase text-neutral-500 font-bold tracking-widest block mb-2">Panjang (cm)</label>
                        <input required type="number" step="0.1" value={formData.length_cm || 0} onChange={e => setFormData({ ...formData, length_cm: parseFloat(e.target.value) })} className="w-full bg-black text-white p-3 border border-neutral-800 outline-none" />
                    </div>
                    <div className="col-span-2">
                        <label className="text-xs uppercase text-neutral-500 font-bold tracking-widest block mb-2">Urutan Tampil (Order Index)</label>
                        <input required type="number" value={formData.order_index || 0} onChange={e => setFormData({ ...formData, order_index: parseInt(e.target.value) })} className="w-full bg-black text-white p-3 border border-neutral-800 outline-none" />
                    </div>
                </div>
            );
        }

        if (activeTab === 'page_fonts') {
            return (
                <div className="space-y-4">
                    <div>
                        <label className="text-xs uppercase text-neutral-500 font-bold tracking-widest block mb-2">Nama Font (Display)</label>
                        <input required type="text" value={formData.name || ''} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="Block Bold" className="w-full bg-black text-white p-3 border border-neutral-800 outline-none" />
                    </div>
                    <div>
                        <label className="text-xs uppercase text-neutral-500 font-bold tracking-widest block mb-2">CSS JSON Style</label>
                        <textarea required rows="10" value={formData.css_style_json || ''} onChange={e => setFormData({ ...formData, css_style_json: e.target.value })} className="w-full bg-black text-white p-3 border border-neutral-800 font-mono text-sm outline-none resize-y" />
                        <p className="text-[10px] mt-1 text-neutral-500">Format JSON murni untuk properti style React (camelCase key).</p>
                    </div>
                </div>
            );
        }

        if (activeTab === 'page_materials') {
            return (
                <div className="space-y-4">
                    <div>
                        <label className="text-xs uppercase text-neutral-500 font-bold tracking-widest block mb-2">Nama Bahan</label>
                        <input required type="text" value={formData.name || ''} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full bg-black text-white p-3 border border-neutral-800 outline-none" />
                    </div>
                    <div>
                        <label className="text-xs uppercase text-neutral-500 font-bold tracking-widest block mb-2">Deskripsi</label>
                        <textarea required rows="3" value={formData.description || ''} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full bg-black text-white p-3 border border-neutral-800 outline-none resize-y" />
                    </div>
                    <div>
                        <label className="text-xs uppercase text-neutral-500 font-bold tracking-widest block mb-2">Kelebihan (Tekan Enter per poin)</label>
                        <textarea rows="4" value={formData.pros_list || ''} onChange={e => setFormData({ ...formData, pros_list: e.target.value })} className="w-full bg-black text-white p-3 border border-neutral-800 outline-none resize-y text-sm" />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="text-[10px] uppercase text-neutral-500 font-bold tracking-widest block mb-2">Badge Text</label>
                            <input type="text" value={formData.badge_text || ''} onChange={e => setFormData({ ...formData, badge_text: e.target.value })} placeholder="Premium" className="w-full bg-black text-white p-3 border border-neutral-800 outline-none text-xs" />
                        </div>
                        <div>
                            <label className="text-[10px] uppercase text-neutral-500 font-bold tracking-widest block mb-2">Badge Color</label>
                            <input type="text" value={formData.badge_color || ''} onChange={e => setFormData({ ...formData, badge_color: e.target.value })} placeholder="bg-yellow-500" className="w-full bg-black text-white p-3 border border-neutral-800 outline-none text-xs" />
                        </div>
                        <div>
                            <label className="text-[10px] uppercase text-neutral-500 font-bold tracking-widest block mb-2">Border Color</label>
                            <input type="text" value={formData.border_color || ''} onChange={e => setFormData({ ...formData, border_color: e.target.value })} placeholder="border-yellow-500" className="w-full bg-black text-white p-3 border border-neutral-800 outline-none text-xs" />
                        </div>
                    </div>
                </div>
            );
        }

        if (activeTab === 'page_collars') {
            return (
                <div className="space-y-4">
                    <div>
                        <label className="text-xs uppercase text-neutral-500 font-bold tracking-widest block mb-2">Nama Kerah</label>
                        <input required type="text" value={formData.name || ''} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full bg-black text-white p-3 border border-neutral-800 outline-none" />
                    </div>
                    <div>
                        <label className="text-xs uppercase text-neutral-500 font-bold tracking-widest block mb-2">Deskripsi</label>
                        <textarea required rows="3" value={formData.description || ''} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full bg-black text-white p-3 border border-neutral-800 outline-none resize-y" />
                    </div>
                    <div className="flex items-center gap-6 mt-4">
                        <label className="flex items-center gap-3 bg-black p-4 border border-neutral-800 cursor-pointer flex-1">
                            <input type="checkbox" checked={formData.is_popular || false} onChange={e => setFormData({ ...formData, is_popular: e.target.checked })} className="w-5 h-5 accent-white cursor-pointer" />
                            <div className="text-sm font-bold text-white uppercase tracking-wider">Populer</div>
                        </label>
                        <div className="flex-1">
                            <label className="text-[10px] uppercase text-neutral-500 font-bold tracking-widest block mb-1">SVG Icon Template (Optional)</label>
                            <input type="text" value={formData.icon_svg_type || ''} onChange={e => setFormData({ ...formData, icon_svg_type: e.target.value })} placeholder="OVneck" className="w-full bg-black text-white p-3 border border-neutral-800 outline-none text-xs" />
                        </div>
                    </div>
                </div>
            );
        }
    };

    // --- Dynamic Table Renderers ---
    const renderTableHeaders = () => {
        if (activeTab === 'page_size_chart') return <><th className="p-4">Label</th><th className="p-4">Dimensi (cm)</th><th className="p-4">Urutan</th></>;
        if (activeTab === 'page_fonts') return <><th className="p-4">Nama Font</th><th className="p-4 hidden md:table-cell">Preview Styles</th></>;
        if (activeTab === 'page_materials') return <><th className="p-4">Nama Bahan</th><th className="p-4 hidden lg:table-cell">Deskripsi</th><th className="p-4">Badge</th></>;
        if (activeTab === 'page_collars') return <><th className="p-4">Model Kerah</th><th className="p-4 hidden md:table-cell">Popularitas</th></>;
    };

    const renderTableRow = (item) => {
        if (activeTab === 'page_size_chart') return (
            <>
                <td className="p-4 font-bold text-white text-lg">{item.size_label}</td>
                <td className="p-4 text-mono text-neutral-400">{item.width_cm} x {item.length_cm}</td>
                <td className="p-4 text-xs">{item.order_index}</td>
            </>
        );
        if (activeTab === 'page_fonts') return (
            <>
                <td className="p-4 font-bold text-white">{item.name}</td>
                <td className="p-4 hidden md:table-cell text-xs font-mono truncate max-w-xs">{JSON.stringify(item.css_style_json)}</td>
            </>
        );
        if (activeTab === 'page_materials') return (
            <>
                <td className="p-4 font-bold text-white">{item.name}</td>
                <td className="p-4 hidden lg:table-cell truncate max-w-xs text-xs">{item.description}</td>
                <td className="p-4"><span className="px-2 py-1 bg-neutral-800 text-[10px] uppercase tracking-widest">{item.badge_text || '-'}</span></td>
            </>
        );
        if (activeTab === 'page_collars') return (
            <>
                <td className="p-4 font-bold text-white">{item.name}</td>
                <td className="p-4 hidden md:table-cell text-xs">{item.is_popular ? '⭐ Populer' : '-'}</td>
            </>
        );
    };

    return (
        <div className="bg-neutral-900 border border-neutral-800">
            {/* TABS */}
            <div className="flex border-b border-neutral-800 overflow-x-auto">
                {TABS.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => handleTabChange(tab.id)}
                        className={`flex-1 min-w-[120px] py-4 px-4 text-xs font-bold uppercase tracking-widest transition-colors whitespace-nowrap ${activeTab === tab.id ? 'bg-white text-black' : 'text-neutral-500 hover:text-white hover:bg-neutral-800'}`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {isEditing ? (
                <div className="p-8 max-w-3xl mx-auto">
                    <div className="flex justify-between items-center mb-8 border-b border-neutral-800 pb-4">
                        <h2 className="text-xl font-bold uppercase tracking-widest">
                            {currentItem ? 'Edit Data' : 'Tambah Baru'}
                        </h2>
                        <button onClick={() => setIsEditing(false)} className="text-neutral-500 hover:text-white transition-colors">
                            <X size={24} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit}>
                        {renderForm()}

                        <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-neutral-800">
                            <button type="button" onClick={() => setIsEditing(false)} className="px-6 py-3 border border-neutral-700 hover:bg-neutral-800 transition-colors uppercase text-xs font-bold tracking-widest">
                                Batal
                            </button>
                            <button type="submit" className="px-8 py-3 bg-white text-black hover:bg-gray-200 transition-colors uppercase text-xs font-bold tracking-widest flex items-center gap-2">
                                <Save size={16} /> Simpan
                            </button>
                        </div>
                    </form>
                </div>
            ) : (
                <>
                    <div className="p-6 border-b border-neutral-800 flex justify-between items-center">
                        <h2 className="text-neutral-400 font-bold uppercase tracking-widest text-sm">
                            Kelola {TABS.find(t => t.id === activeTab)?.label}
                        </h2>
                        <button onClick={handleAddNew} className="flex items-center gap-2 bg-white text-black px-4 py-2 text-xs font-bold uppercase tracking-widest hover:bg-gray-200 transition-colors">
                            <Plus size={16} /> Tambah Baru
                        </button>
                    </div>

                    {loading ? (
                        <div className="p-12 text-center text-neutral-500 text-xs uppercase tracking-widest animate-pulse">Memuat Data...</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-neutral-400">
                                <thead className="bg-black text-neutral-500 uppercase tracking-wider text-xs font-bold border-b border-neutral-800">
                                    <tr>
                                        {renderTableHeaders()}
                                        <th className="p-4 text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-800">
                                    {items.length === 0 ? (
                                        <tr><td colSpan="5" className="p-8 text-center text-neutral-600">Belum ada data.</td></tr>
                                    ) : items.map(item => (
                                        <tr key={item.id} className="hover:bg-neutral-800/50 transition-colors">
                                            {renderTableRow(item)}
                                            <td className="p-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button onClick={() => handleEdit(item)} className="p-2 hover:bg-white hover:text-black hover:shadow-lg transition-all rounded"><Edit2 size={16} /></button>
                                                    <button onClick={() => handleDelete(item.id)} className="p-2 hover:bg-red-500 hover:text-white transition-all rounded text-red-500/70"><Trash2 size={16} /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
