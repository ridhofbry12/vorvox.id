import React, { useState, useEffect } from 'react';
import { Save, Plus, Trash2 } from 'lucide-react';
import { supabase } from '../../supabase';

export default function ContentManager() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Stats array mapping
    const [stats, setStats] = useState([]);
    const [statsId, setStatsId] = useState(null);

    useEffect(() => {
        fetchContent();
    }, []);

    const fetchContent = async () => {
        setLoading(true);
        const { data, error } = await supabase.from('site_content').select('*').eq('key', 'home_stats').single();

        if (error) {
            console.error('Error fetching site_content:', error);
            // Default if not found
            setStats([
                { raw: 10000, label: 'Jersey Diproduksi', suffix: '+', prefix: '' },
                { raw: 500, label: 'Klien Puas', suffix: '+', prefix: '' }
            ]);
        } else if (data) {
            setStatsId(data.id);
            setStats(typeof data.value_json === 'string' ? JSON.parse(data.value_json) : data.value_json);
        }

        setLoading(false);
    };

    const handleSaveStats = async () => {
        setSaving(true);
        const payload = {
            key: 'home_stats',
            value_json: stats,
            description: 'Statistik di halaman beranda'
        };

        if (statsId) {
            const { error } = await supabase.from('site_content').update(payload).eq('id', statsId);
            if (error) alert('Gagal menyimpan: ' + error.message);
            else alert('Statistik berhasil disimpan!');
        } else {
            const { data, error } = await supabase.from('site_content').insert([payload]).select();
            if (error) {
                alert('Gagal menyimpan: ' + error.message);
            } else if (data && data[0]) {
                setStatsId(data[0].id);
                alert('Statistik berhasil disimpan!');
            }
        }
        setSaving(false);
    };

    const updateStat = (index, field, value) => {
        const newStats = [...stats];
        if (field === 'raw') value = Number(value) || 0;
        newStats[index] = { ...newStats[index], [field]: value };
        setStats(newStats);
    };

    const addStat = () => {
        setStats([...stats, { raw: 0, label: 'Label Baru', suffix: '', prefix: '' }]);
    };

    const removeStat = (index) => {
        setStats(stats.filter((_, i) => i !== index));
    };

    if (loading) {
        return <div className="text-neutral-500 text-xs uppercase tracking-widest animate-pulse">Memuat Pengaturan...</div>;
    }

    return (
        <div className="space-y-8">
            <div className="bg-neutral-900 border border-neutral-800 p-8">
                <div className="flex justify-between items-center mb-6 border-b border-neutral-800 pb-4">
                    <div>
                        <h2 className="text-xl font-bold uppercase tracking-widest text-white">Statistik Beranda</h2>
                        <p className="text-xs text-neutral-500 mt-1">Angka statistik yang akan beranimasi di Homepage.</p>
                    </div>
                    <button
                        onClick={handleSaveStats}
                        disabled={saving}
                        className="flex items-center gap-2 bg-white text-black px-6 py-2 text-xs font-bold uppercase tracking-widest hover:bg-gray-200 transition-colors disabled:opacity-50"
                    >
                        {saving ? <span className="animate-pulse">Menyimpan...</span> : <><Save size={16} /> Simpan Pengaturan</>}
                    </button>
                </div>

                <div className="space-y-4">
                    {stats.map((stat, i) => (
                        <div key={i} className="flex flex-col md:flex-row items-start md:items-end gap-4 p-4 bg-black border border-neutral-800">
                            <div className="flex-1 w-full">
                                <label className="text-[10px] uppercase text-neutral-500 font-bold tracking-widest block mb-1">Label / Judul</label>
                                <input type="text" value={stat.label} onChange={e => updateStat(i, 'label', e.target.value)} className="w-full bg-neutral-900 text-white p-2 border border-neutral-800 outline-none text-sm" />
                            </div>
                            <div className="w-full md:w-32">
                                <label className="text-[10px] uppercase text-neutral-500 font-bold tracking-widest block mb-1">Angka (Raw)</label>
                                <input type="number" value={stat.raw} onChange={e => updateStat(i, 'raw', e.target.value)} className="w-full bg-neutral-900 text-white p-2 border border-neutral-800 outline-none text-sm tabular-nums" />
                            </div>
                            <div className="w-full md:w-20">
                                <label className="text-[10px] uppercase text-neutral-500 font-bold tracking-widest block mb-1">Prefix</label>
                                <input type="text" value={stat.prefix || ''} onChange={e => updateStat(i, 'prefix', e.target.value)} placeholder="Rp/+" className="w-full bg-neutral-900 text-white p-2 border border-neutral-800 outline-none text-sm" />
                            </div>
                            <div className="w-full md:w-20">
                                <label className="text-[10px] uppercase text-neutral-500 font-bold tracking-widest block mb-1">Suffix</label>
                                <input type="text" value={stat.suffix || ''} onChange={e => updateStat(i, 'suffix', e.target.value)} placeholder="K/+" className="w-full bg-neutral-900 text-white p-2 border border-neutral-800 outline-none text-sm" />
                            </div>
                            <button onClick={() => removeStat(i)} className="p-2 bg-red-500 text-white hover:bg-red-600 transition-colors mt-4 md:mt-0 title='Hapus'">
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ))}

                    <button onClick={addStat} className="w-full py-4 border border-dashed border-neutral-700 text-neutral-500 hover:text-white hover:border-white transition-colors flex items-center justify-center gap-2 text-xs uppercase font-bold tracking-widest mt-4">
                        <Plus size={16} /> Tambah Statistik Baru
                    </button>
                </div>
            </div>

            {/* Future settings can go here */}
            <div className="bg-neutral-900 border border-neutral-800 p-8 text-center text-neutral-500 text-sm">
                Modul pengaturan Hero Slides, Teks Kontak, dan Social Media akan segera ditambahkan di sini.
            </div>
        </div>
    );
}
