import React, { useState, useEffect } from 'react';
import { Save, Plus, Trash2, Upload, Image as ImageIcon } from 'lucide-react';
import { supabase } from '../../supabase';

export default function ContentManager() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Stats array mapping
    const [stats, setStats] = useState([]);
    const [statsId, setStatsId] = useState(null);

    // Sublim/DTF Homepage Section
    const [sublimContent, setSublimContent] = useState({
        subtitle: 'Mitra Printing Textile',
        title_line1: 'SUBLIM',
        title_line2: '/ DTF',
        description: 'Semua kebutuhan printing textile jadi lebih mudah & murah. Pengerjaan dalam satu lokasi — dari desain, sublim, hingga jahit.',
        tags: ['Jersey Olahraga', 'Seragam Printing', 'Totebag', 'Hijab Printing', 'Fashion'],
        bg_image: 'https://lh3.googleusercontent.com/d/1LzUcdSHmsJw_iVcGhSFTzlm5VL4pa_sW',
        grid_items: [
            { title: 'Jersey Olahraga\nPrinting', img: 'https://lh3.googleusercontent.com/d/1akNfYSFQQvh9E9rRrX0imUcIFx_kE9mi', tall: true },
            { title: 'Seragam\nPrinting', img: 'https://lh3.googleusercontent.com/d/1JWGaXDo6mF0yW_ByVB2vjMg9z3yguger', tall: false },
            { title: 'Fashion\nLainnya', img: 'https://lh3.googleusercontent.com/d/10XuFIrc3uYPb1a2q94m9RMICCRlHzehV', tall: false },
        ],
    });
    const [sublimContentId, setSublimContentId] = useState(null);

    // Sublim/DTF Page Hero Image
    const [sublimHeroImage, setSublimHeroImage] = useState('https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&q=80&w=1800');
    const [sublimHeroId, setSublimHeroId] = useState(null);

    useEffect(() => {
        fetchContent();
    }, []);

    const fetchContent = async () => {
        setLoading(true);
        const [statsRes, sublimRes, heroImgRes] = await Promise.all([
            supabase.from('site_content').select('*').eq('key', 'home_stats').single(),
            supabase.from('site_content').select('*').eq('key', 'sublim_homepage').maybeSingle(),
            supabase.from('site_content').select('*').eq('key', 'sublim_hero_image').maybeSingle(),
        ]);

        // Stats
        if (statsRes.error) {
            setStats([
                { raw: 10000, label: 'Jersey Diproduksi', suffix: '+', prefix: '' },
                { raw: 500, label: 'Klien Puas', suffix: '+', prefix: '' }
            ]);
        } else if (statsRes.data) {
            setStatsId(statsRes.data.id);
            setStats(typeof statsRes.data.value_json === 'string' ? JSON.parse(statsRes.data.value_json) : statsRes.data.value_json);
        }

        // Sublim Homepage Content
        if (sublimRes.data) {
            setSublimContentId(sublimRes.data.id);
            const val = typeof sublimRes.data.value_json === 'string' ? JSON.parse(sublimRes.data.value_json) : sublimRes.data.value_json;
            setSublimContent(prev => ({ ...prev, ...val }));
        }

        // Sublim Hero Image
        if (heroImgRes.data) {
            setSublimHeroId(heroImgRes.data.id);
            const val = typeof heroImgRes.data.value_json === 'string' ? JSON.parse(heroImgRes.data.value_json) : heroImgRes.data.value_json;
            if (val?.image_url) setSublimHeroImage(val.image_url);
        }

        setLoading(false);
    };

    // ── SAVE FUNCTIONS ──

    const handleSaveStats = async () => {
        setSaving(true);
        const payload = { key: 'home_stats', value_json: stats, description: 'Statistik di halaman beranda' };
        if (statsId) {
            const { error } = await supabase.from('site_content').update(payload).eq('id', statsId);
            if (error) alert('Gagal menyimpan: ' + error.message);
            else alert('Statistik berhasil disimpan!');
        } else {
            const { data, error } = await supabase.from('site_content').insert([payload]).select();
            if (error) alert('Gagal menyimpan: ' + error.message);
            else if (data?.[0]) { setStatsId(data[0].id); alert('Statistik berhasil disimpan!'); }
        }
        setSaving(false);
    };

    const handleSaveSublimContent = async () => {
        setSaving(true);
        const payload = { key: 'sublim_homepage', value_json: sublimContent, description: 'Konten Sublim/DTF di halaman beranda' };
        const { data, error } = await supabase.from('site_content').upsert(payload, { onConflict: 'key' }).select();
        if (error) alert('Gagal menyimpan: ' + error.message);
        else {
            if (data?.[0]) setSublimContentId(data[0].id);
            alert('Konten Sublim/DTF berhasil disimpan!');
        }
        setSaving(false);
    };

    const handleSaveSublimHero = async () => {
        setSaving(true);
        const payload = { key: 'sublim_hero_image', value_json: { image_url: sublimHeroImage }, description: 'Hero image halaman Sublim/DTF' };
        const { data, error } = await supabase.from('site_content').upsert(payload, { onConflict: 'key' }).select();
        if (error) alert('Gagal menyimpan: ' + error.message);
        else {
            if (data?.[0]) setSublimHeroId(data[0].id);
            alert('Hero image Sublim/DTF berhasil disimpan!');
        }
        setSaving(false);
    };

    // ── HELPER FUNCTIONS ──

    const updateStat = (index, field, value) => {
        const newStats = [...stats];
        if (field === 'raw') value = Number(value) || 0;
        newStats[index] = { ...newStats[index], [field]: value };
        setStats(newStats);
    };

    const addStat = () => setStats([...stats, { raw: 0, label: 'Label Baru', suffix: '', prefix: '' }]);
    const removeStat = (index) => setStats(stats.filter((_, i) => i !== index));

    const updateSublim = (field, value) => setSublimContent(prev => ({ ...prev, [field]: value }));
    const updateSublimTag = (index, value) => {
        const newTags = [...sublimContent.tags];
        newTags[index] = value;
        updateSublim('tags', newTags);
    };
    const addSublimTag = () => updateSublim('tags', [...sublimContent.tags, 'Tag Baru']);
    const removeSublimTag = (index) => updateSublim('tags', sublimContent.tags.filter((_, i) => i !== index));

    const updateGridItem = (index, field, value) => {
        const items = [...sublimContent.grid_items];
        items[index] = { ...items[index], [field]: value };
        updateSublim('grid_items', items);
    };

    // Upload image to Supabase storage
    const handleImageUpload = async (file, callback) => {
        const ext = file.name.split('.').pop();
        const fileName = `content/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
        const { error } = await supabase.storage.from('vorvox-assets').upload(fileName, file);
        if (error) { alert('Upload gagal: ' + error.message); return; }
        const { data: urlData } = supabase.storage.from('vorvox-assets').getPublicUrl(fileName);
        if (urlData?.publicUrl) callback(urlData.publicUrl);
    };

    if (loading) return <div className="text-neutral-500 text-xs uppercase tracking-widest animate-pulse">Memuat Pengaturan...</div>;

    return (
        <div className="space-y-8">
            {/* ═══ STATISTIK BERANDA ═══ */}
            <div className="bg-neutral-900 border border-neutral-800 p-8">
                <div className="flex justify-between items-center mb-6 border-b border-neutral-800 pb-4">
                    <div>
                        <h2 className="text-xl font-bold uppercase tracking-widest text-white">Statistik Beranda</h2>
                        <p className="text-xs text-neutral-500 mt-1">Angka statistik yang akan beranimasi di Homepage.</p>
                    </div>
                    <button onClick={handleSaveStats} disabled={saving}
                        className="flex items-center gap-2 bg-white text-black px-6 py-2 text-xs font-bold uppercase tracking-widest hover:bg-gray-200 transition-colors disabled:opacity-50">
                        {saving ? <span className="animate-pulse">Menyimpan...</span> : <><Save size={16} /> Simpan</>}
                    </button>
                </div>
                <div className="space-y-4">
                    {stats.map((stat, i) => (
                        <div key={i} className="flex flex-col md:flex-row items-start md:items-end gap-4 p-4 bg-black border border-neutral-800">
                            <div className="flex-1 w-full">
                                <label className="text-[10px] uppercase text-neutral-500 font-bold tracking-widest block mb-1">Label</label>
                                <input type="text" value={stat.label} onChange={e => updateStat(i, 'label', e.target.value)} className="w-full bg-neutral-900 text-white p-2 border border-neutral-800 outline-none text-sm" />
                            </div>
                            <div className="w-full md:w-32">
                                <label className="text-[10px] uppercase text-neutral-500 font-bold tracking-widest block mb-1">Angka</label>
                                <input type="number" value={stat.raw} onChange={e => updateStat(i, 'raw', e.target.value)} className="w-full bg-neutral-900 text-white p-2 border border-neutral-800 outline-none text-sm tabular-nums" />
                            </div>
                            <div className="w-full md:w-20">
                                <label className="text-[10px] uppercase text-neutral-500 font-bold tracking-widest block mb-1">Prefix</label>
                                <input type="text" value={stat.prefix || ''} onChange={e => updateStat(i, 'prefix', e.target.value)} placeholder="Rp" className="w-full bg-neutral-900 text-white p-2 border border-neutral-800 outline-none text-sm" />
                            </div>
                            <div className="w-full md:w-20">
                                <label className="text-[10px] uppercase text-neutral-500 font-bold tracking-widest block mb-1">Suffix</label>
                                <input type="text" value={stat.suffix || ''} onChange={e => updateStat(i, 'suffix', e.target.value)} placeholder="+" className="w-full bg-neutral-900 text-white p-2 border border-neutral-800 outline-none text-sm" />
                            </div>
                            <button onClick={() => removeStat(i)} className="p-2 bg-red-500 text-white hover:bg-red-600 transition-colors"><Trash2 size={16} /></button>
                        </div>
                    ))}
                    <button onClick={addStat} className="w-full py-4 border border-dashed border-neutral-700 text-neutral-500 hover:text-white hover:border-white transition-colors flex items-center justify-center gap-2 text-xs uppercase font-bold tracking-widest mt-4">
                        <Plus size={16} /> Tambah Statistik
                    </button>
                </div>
            </div>

            {/* ═══ KONTEN SUBLIM/DTF (BERANDA) ═══ */}
            <div className="bg-neutral-900 border border-neutral-800 p-8">
                <div className="flex justify-between items-center mb-6 border-b border-neutral-800 pb-4">
                    <div>
                        <h2 className="text-xl font-bold uppercase tracking-widest text-white">Konten Sublim / DTF (Beranda)</h2>
                        <p className="text-xs text-neutral-500 mt-1">Teks, gambar, dan tag yang tampil di section Sublim/DTF halaman beranda.</p>
                    </div>
                    <button onClick={handleSaveSublimContent} disabled={saving}
                        className="flex items-center gap-2 bg-white text-black px-6 py-2 text-xs font-bold uppercase tracking-widest hover:bg-gray-200 transition-colors disabled:opacity-50">
                        {saving ? <span className="animate-pulse">Menyimpan...</span> : <><Save size={16} /> Simpan</>}
                    </button>
                </div>

                <div className="space-y-4">
                    {/* Subtitle & Titles */}
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="text-[10px] uppercase text-neutral-500 font-bold tracking-widest block mb-1">Subtitle</label>
                            <input type="text" value={sublimContent.subtitle} onChange={e => updateSublim('subtitle', e.target.value)} className="w-full bg-black text-white p-2 border border-neutral-800 outline-none text-sm" />
                        </div>
                        <div>
                            <label className="text-[10px] uppercase text-neutral-500 font-bold tracking-widest block mb-1">Judul Baris 1</label>
                            <input type="text" value={sublimContent.title_line1} onChange={e => updateSublim('title_line1', e.target.value)} className="w-full bg-black text-white p-2 border border-neutral-800 outline-none text-sm" />
                        </div>
                        <div>
                            <label className="text-[10px] uppercase text-neutral-500 font-bold tracking-widest block mb-1">Judul Baris 2</label>
                            <input type="text" value={sublimContent.title_line2} onChange={e => updateSublim('title_line2', e.target.value)} className="w-full bg-black text-white p-2 border border-neutral-800 outline-none text-sm" />
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="text-[10px] uppercase text-neutral-500 font-bold tracking-widest block mb-1">Deskripsi</label>
                        <textarea rows={3} value={sublimContent.description} onChange={e => updateSublim('description', e.target.value)}
                            className="w-full bg-black text-white p-2 border border-neutral-800 outline-none text-sm resize-none" />
                    </div>

                    {/* BG Image */}
                    <div>
                        <label className="text-[10px] uppercase text-neutral-500 font-bold tracking-widest block mb-1">Background Image URL</label>
                        <div className="flex gap-2">
                            <input type="text" value={sublimContent.bg_image} onChange={e => updateSublim('bg_image', e.target.value)} className="flex-1 bg-black text-white p-2 border border-neutral-800 outline-none text-sm" />
                            <label className="px-3 py-2 bg-purple-600 text-white text-xs font-bold uppercase cursor-pointer hover:bg-purple-500 transition-colors flex items-center gap-1">
                                <Upload size={14} /> Upload
                                <input type="file" accept="image/*" className="hidden" onChange={e => {
                                    if (e.target.files[0]) handleImageUpload(e.target.files[0], url => updateSublim('bg_image', url));
                                }} />
                            </label>
                        </div>
                        {sublimContent.bg_image && <img src={sublimContent.bg_image} alt="Preview" className="mt-2 h-20 object-cover rounded border border-neutral-800 opacity-60" />}
                    </div>

                    {/* Tags */}
                    <div>
                        <label className="text-[10px] uppercase text-neutral-500 font-bold tracking-widest block mb-1">Tags</label>
                        <div className="flex flex-wrap gap-2">
                            {sublimContent.tags.map((tag, i) => (
                                <div key={i} className="flex items-center gap-1 bg-black border border-neutral-800 px-2 py-1">
                                    <input type="text" value={tag} onChange={e => updateSublimTag(i, e.target.value)} className="bg-transparent text-white outline-none text-xs w-28" />
                                    <button onClick={() => removeSublimTag(i)} className="text-red-500 hover:text-red-400"><Trash2 size={12} /></button>
                                </div>
                            ))}
                            <button onClick={addSublimTag} className="px-3 py-1 border border-dashed border-neutral-700 text-neutral-500 hover:text-white text-xs"><Plus size={12} /></button>
                        </div>
                    </div>

                    {/* Grid Items */}
                    <div>
                        <label className="text-[10px] uppercase text-neutral-500 font-bold tracking-widest block mb-2">Grid Gambar (Kanan)</label>
                        <div className="space-y-3">
                            {sublimContent.grid_items.map((item, i) => (
                                <div key={i} className="flex items-center gap-3 p-3 bg-black border border-neutral-800">
                                    {item.img && <img src={item.img} alt="" className="w-16 h-16 object-cover rounded border border-neutral-700 flex-shrink-0" />}
                                    <div className="flex-1 space-y-2">
                                        <input type="text" value={item.title.replace(/\n/g, ' / ')} onChange={e => updateGridItem(i, 'title', e.target.value.replace(/ \/ /g, '\n'))}
                                            className="w-full bg-neutral-900 text-white p-2 border border-neutral-800 outline-none text-xs" placeholder="Judul (pakai / untuk baris baru)" />
                                        <div className="flex gap-2">
                                            <input type="text" value={item.img} onChange={e => updateGridItem(i, 'img', e.target.value)}
                                                className="flex-1 bg-neutral-900 text-white p-2 border border-neutral-800 outline-none text-xs" placeholder="Image URL" />
                                            <label className="px-2 py-1 bg-purple-600 text-white text-[10px] font-bold uppercase cursor-pointer hover:bg-purple-500 flex items-center gap-1">
                                                <Upload size={12} />
                                                <input type="file" accept="image/*" className="hidden" onChange={e => {
                                                    if (e.target.files[0]) handleImageUpload(e.target.files[0], url => updateGridItem(i, 'img', url));
                                                }} />
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* ═══ HERO IMAGE SUBLIM/DTF PAGE ═══ */}
            <div className="bg-neutral-900 border border-neutral-800 p-8">
                <div className="flex justify-between items-center mb-6 border-b border-neutral-800 pb-4">
                    <div>
                        <h2 className="text-xl font-bold uppercase tracking-widest text-white">Hero Image — Halaman Sublim / DTF</h2>
                        <p className="text-xs text-neutral-500 mt-1">Gambar background hero di halaman Sublim / DTF.</p>
                    </div>
                    <button onClick={handleSaveSublimHero} disabled={saving}
                        className="flex items-center gap-2 bg-white text-black px-6 py-2 text-xs font-bold uppercase tracking-widest hover:bg-gray-200 transition-colors disabled:opacity-50">
                        {saving ? <span className="animate-pulse">Menyimpan...</span> : <><Save size={16} /> Simpan</>}
                    </button>
                </div>
                <div className="flex gap-4 items-start">
                    <div className="flex-1">
                        <label className="text-[10px] uppercase text-neutral-500 font-bold tracking-widest block mb-1">Image URL</label>
                        <div className="flex gap-2">
                            <input type="text" value={sublimHeroImage} onChange={e => setSublimHeroImage(e.target.value)}
                                className="flex-1 bg-black text-white p-2 border border-neutral-800 outline-none text-sm" />
                            <label className="px-3 py-2 bg-purple-600 text-white text-xs font-bold uppercase cursor-pointer hover:bg-purple-500 transition-colors flex items-center gap-1">
                                <Upload size={14} /> Upload
                                <input type="file" accept="image/*" className="hidden" onChange={e => {
                                    if (e.target.files[0]) handleImageUpload(e.target.files[0], setSublimHeroImage);
                                }} />
                            </label>
                        </div>
                    </div>
                    {sublimHeroImage && <img src={sublimHeroImage} alt="Hero Preview" className="w-32 h-20 object-cover rounded border border-neutral-800" />}
                </div>
            </div>
        </div>
    );
}
