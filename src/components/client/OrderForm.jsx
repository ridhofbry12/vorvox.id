import React, { useState, useEffect, useRef } from 'react';
import { Loader2, Plus, Trash2, Upload, FileImage, UserPlus } from 'lucide-react';
import { supabase } from '../../supabase';
import { createOrderWithInvoice } from '../../services/api';

// Utility for client-side image compression
const compressImage = (file, maxSizeKb = 200) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;
                // Scale down if too large
                const maxDim = 1200;
                if (width > height && width > maxDim) {
                    height *= maxDim / width;
                    width = maxDim;
                } else if (height > maxDim) {
                    width *= maxDim / height;
                    height = maxDim;
                }
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                // Compress
                let quality = 0.9;
                let dataUrl = canvas.toDataURL('image/jpeg', quality);

                // Iteratively reduce quality if still too big
                const reduceQuality = () => {
                    const sizeKb = Math.round((dataUrl.length * 3) / 4 / 1024);
                    if (sizeKb > maxSizeKb && quality > 0.1) {
                        quality -= 0.1;
                        dataUrl = canvas.toDataURL('image/jpeg', quality);
                        reduceQuality();
                    } else {
                        // Convert back to blob
                        fetch(dataUrl)
                            .then(res => res.blob())
                            .then(blob => resolve(new File([blob], file.name.replace(/\.[^/.]+$/, ".jpg"), { type: 'image/jpeg' })));
                    }
                };
                reduceQuality();
            };
        };
        reader.onerror = error => reject(error);
    });
};

export default function OrderForm({ clientId, onOrderSuccess }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    // Master Data
    const [dbProducts, setDbProducts] = useState([]);
    const [dbBahan, setDbBahan] = useState([]);
    const [dbKerah, setDbKerah] = useState([]);

    // Form Selections
    const [selectedProduct, setSelectedProduct] = useState('');
    const [selectedBahan, setSelectedBahan] = useState('');
    const [selectedKerah, setSelectedKerah] = useState('');
    const [notes, setNotes] = useState('');

    // Dynamic Sizes
    const [sizes, setSizes] = useState([{ size: 'L', qty: 1 }]);

    // Uploads
    const [designFiles, setDesignFiles] = useState([]);
    const [logoFiles, setLogoFiles] = useState([]);

    // Players
    const [players, setPlayers] = useState([]); // { playerName, playerNumber }

    // Computed
    const totalQty = sizes.reduce((acc, curr) => acc + (Number(curr.qty) || 0), 0);
    const [pricePerUnit, setPricePerUnit] = useState(0);
    const [totalPrice, setTotalPrice] = useState(0);
    const [dpAmount, setDpAmount] = useState(0);
    const [dpPercentage, setDpPercentage] = useState(50);
    const [remainingAmount, setRemainingAmount] = useState(0);

    // Fetch Master Data
    useEffect(() => {
        const fetchMaster = async () => {
            const [prodRes, bahanRes, kerahRes] = await Promise.all([
                supabase.from('products').select('title, base_price, dp_percentage'),
                supabase.from('bahan_jersey').select('name, additional_price').eq('is_active', true),
                supabase.from('model_kerah').select('name, additional_price').eq('is_active', true)
            ]);

            if (prodRes.data?.length > 0) {
                setDbProducts(prodRes.data);
                setSelectedProduct(prodRes.data[0].title);
            }
            if (bahanRes.data?.length > 0) {
                setDbBahan(bahanRes.data);
                setSelectedBahan(bahanRes.data[0].name);
            }
            if (kerahRes.data?.length > 0) {
                setDbKerah(kerahRes.data);
                setSelectedKerah(kerahRes.data[0].name);
            }
        };
        fetchMaster();
    }, []);

    // Calculator
    useEffect(() => {
        if (!dbProducts.length) return;

        const prod = dbProducts.find(p => p.title === selectedProduct);
        const b = dbBahan.find(b => b.name === selectedBahan);
        const k = dbKerah.find(k => k.name === selectedKerah);

        const base = Number(prod?.base_price || 0);
        const addBahan = Number(b?.additional_price || 0);
        const addKerah = Number(k?.additional_price || 0);
        const dpPct = Number(prod?.dp_percentage || 50);

        const unit = base + addBahan + addKerah;
        const total = unit * totalQty;
        const dp = (dpPct / 100) * total;
        const rem = total - dp;

        setPricePerUnit(unit);
        setTotalPrice(total);
        setDpPercentage(dpPct);
        setDpAmount(dp);
        setRemainingAmount(rem);
    }, [selectedProduct, selectedBahan, selectedKerah, totalQty, dbProducts, dbBahan, dbKerah]);


    // Action Handlers
    const addSizeRow = () => setSizes([...sizes, { size: 'M', qty: 1 }]);
    const updateSizeRow = (index, field, val) => {
        const newSizes = [...sizes];
        newSizes[index][field] = val;
        setSizes(newSizes);
    };
    const removeSizeRow = (index) => setSizes(sizes.filter((_, i) => i !== index));

    const addPlayerRow = () => setPlayers([...players, { player_name: '', player_number: '' }]);
    const updatePlayerRow = (index, field, val) => {
        const newPs = [...players];
        newPs[index][field] = val;
        setPlayers(newPs);
    };
    const removePlayerRow = (index) => setPlayers(players.filter((_, i) => i !== index));

    const handleFileSelect = async (e, type) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        const currentLength = type === 'design' ? designFiles.length : logoFiles.length;
        if (currentLength + files.length > 10) {
            alert('Maksimal 10 file per kategori');
            return;
        }

        setLoading(true);
        try {
            const compressedForms = [];
            for (let f of files) {
                const compressed = await compressImage(f, 200); // max 200kb
                compressedForms.push(compressed);
            }

            if (type === 'design') setDesignFiles([...designFiles, ...compressedForms]);
            else setLogoFiles([...logoFiles, ...compressedForms]);
        } catch (err) {
            console.error(err);
            alert('Gagal memproses gambar');
        }
        setLoading(false);
    };

    const removeFile = (index, type) => {
        if (type === 'design') setDesignFiles(designFiles.filter((_, i) => i !== index));
        else setLogoFiles(logoFiles.filter((_, i) => i !== index));
    };

    const uploadFilesToSupabase = async (files, folder) => {
        const urls = [];
        for (let file of files) {
            const ext = file.name.split('.').pop();
            const fileName = `${clientId}_${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`;
            const path = `${folder}/${fileName}`;

            const { data, error } = await supabase.storage.from('vorvox-assets').upload(path, file);
            if (!error && data) {
                const { data: publicUrlData } = supabase.storage.from('vorvox-assets').getPublicUrl(path);
                urls.push(publicUrlData.publicUrl);
            }
        }
        return urls;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccessMsg('');

        if (totalQty < 1) {
            setError('Jumlah total minimal 1 pcs.');
            setLoading(false); return;
        }

        try {
            // 1. Upload Images
            const designUrls = await uploadFilesToSupabase(designFiles, 'designs');
            const logoUrls = await uploadFilesToSupabase(logoFiles, 'logos');

            // 2. Prepare Order Data
            const orderData = {
                client_id: clientId,
                product_name: selectedProduct,
                quantity: totalQty,
                size: 'Variative', // Legacy column
                sizes: sizes, // New column JSONB
                bahan: selectedBahan,
                kerah: selectedKerah,
                notes,
                price_per_unit: pricePerUnit,
                total_price: totalPrice,
                dp_amount: dpAmount,
                remaining_amount: remainingAmount,
                design_urls: designUrls,
                logo_urls: logoUrls
            };

            // 3. Create Order
            const { order, invoice } = await createOrderWithInvoice(orderData);

            // 4. Insert Players if any
            if (players.length > 0) {
                const validPlayers = players.filter(p => p.player_name || p.player_number).map(p => ({
                    order_id: order.id,
                    player_name: p.player_name,
                    player_number: p.player_number
                }));
                if (validPlayers.length > 0) {
                    await supabase.from('jersey_players').insert(validPlayers);
                }
            }

            // Reset Form (Partial for UX, keep Master Data)
            setSizes([{ size: 'L', qty: 1 }]);
            setPlayers([]);
            setDesignFiles([]);
            setLogoFiles([]);
            setNotes('');
            setSuccessMsg('Pesanan berhasil dibuat! Silakan cek Riwayat Pesanan untuk melakukan pembayaran DP.');

            onOrderSuccess(); // Refresh parent

        } catch (err) {
            console.error(err);
            setError(err.message || 'Terjadi kesalahan saat membuat pesanan.');
        } finally {
            setLoading(false);
        }
    };

    const formatRp = (num) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);

    return (
        <div className="bg-neutral-900 border border-neutral-800 p-6 md:p-8">
            <h2 className="text-2xl font-black uppercase tracking-widest text-white mb-8 pb-4 border-b border-neutral-800">Custom Order</h2>

            {error && <div className="mb-6 p-4 bg-red-900/20 border border-red-900 text-red-400 text-sm">{error}</div>}
            {successMsg && <div className="mb-6 p-4 bg-green-900/20 border border-green-900 text-green-400 text-sm font-bold">{successMsg}</div>}

            <form onSubmit={handleSubmit} className="space-y-10">
                {/* BAGIAN 1: PRODUK & BAHAN */}
                <div className="space-y-6">
                    <h3 className="text-neutral-500 font-bold uppercase tracking-widest text-xs">1. Detail Produk</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <select className="bg-black border border-neutral-800 text-white p-4 outline-none text-sm" value={selectedProduct} onChange={e => setSelectedProduct(e.target.value)}>
                            {dbProducts.map(p => <option key={p.title} value={p.title}>{p.title} (Base: {formatRp(p.base_price)})</option>)}
                        </select>
                        <select className="bg-black border border-neutral-800 text-white p-4 outline-none text-sm" value={selectedBahan} onChange={e => setSelectedBahan(e.target.value)}>
                            {dbBahan.map(b => <option key={b.name} value={b.name}>Bahan: {b.name} (+{formatRp(b.additional_price)})</option>)}
                        </select>
                        <select className="bg-black border border-neutral-800 text-white p-4 outline-none text-sm" value={selectedKerah} onChange={e => setSelectedKerah(e.target.value)}>
                            {dbKerah.map(k => <option key={k.name} value={k.name}>Kerah: {k.name} (+{formatRp(k.additional_price)})</option>)}
                        </select>
                    </div>
                </div>

                {/* BAGIAN 2: UKURAN */}
                <div className="space-y-4">
                    <div className="flex justify-between items-end border-b border-neutral-800 pb-2">
                        <h3 className="text-neutral-500 font-bold uppercase tracking-widest text-xs">2. Rincian Ukuran & Qty</h3>
                        <span className="text-white text-sm font-bold">Total Qty: {totalQty}</span>
                    </div>
                    {sizes.map((row, idx) => (
                        <div key={idx} className="flex items-center gap-4">
                            <select className="flex-1 bg-black border border-neutral-800 text-white p-3 outline-none text-sm"
                                value={row.size} onChange={e => updateSizeRow(idx, 'size', e.target.value)}>
                                {['S', 'M', 'L', 'XL', '2XL', '3XL', 'Custom'].map(sz => <option key={sz} value={sz}>{sz}</option>)}
                            </select>
                            <input type="number" min="1" className="w-24 bg-black border border-neutral-800 text-white p-3 outline-none text-sm text-center"
                                value={row.qty} onChange={e => updateSizeRow(idx, 'qty', parseInt(e.target.value) || 0)} />
                            <button type="button" onClick={() => removeSizeRow(idx)} disabled={sizes.length === 1} className="p-3 text-red-500 hover:bg-neutral-800 disabled:opacity-30"><Trash2 size={18} /></button>
                        </div>
                    ))}
                    <button type="button" onClick={addSizeRow} className="text-xs font-bold text-neutral-400 hover:text-white uppercase tracking-widest flex items-center gap-2"><Plus size={14} /> Tambah Ukuran Lain</button>
                </div>

                {/* BAGIAN 3: UPLOAD */}
                <div className="space-y-4">
                    <h3 className="text-neutral-500 font-bold uppercase tracking-widest text-xs border-b border-neutral-800 pb-2">3. Upload File (Desain & Logo)</h3>
                    <p className="text-xs text-neutral-500">Maks. 10 file per kategori. Ukuran otomatis dikompresi &lt; 200KB.</p>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="border border-dashed border-neutral-700 p-6 flex flex-col items-center justify-center text-center">
                            <input type="file" id="design-upload" multiple accept="image/*" className="hidden" onChange={e => handleFileSelect(e, 'design')} />
                            <label htmlFor="design-upload" className="cursor-pointer flex flex-col items-center gap-2 text-neutral-400 hover:text-white transition-colors">
                                <FileImage size={32} />
                                <span className="text-sm font-bold uppercase tracking-widest mt-2">Upload Referensi Desain</span>
                            </label>
                            {designFiles.length > 0 && (
                                <div className="mt-4 flex flex-wrap gap-2 justify-center">
                                    {designFiles.map((f, i) => (
                                        <div key={i} className="relative group">
                                            <img src={URL.createObjectURL(f)} className="w-12 h-12 object-cover border border-neutral-600 rounded" alt="thmb" />
                                            <button type="button" onClick={() => removeFile(i, 'design')} className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1 opacity-0 group-hover:opacity-100"><XIcon size={10} /></button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="border border-dashed border-neutral-700 p-6 flex flex-col items-center justify-center text-center">
                            <input type="file" id="logo-upload" multiple accept="image/*" className="hidden" onChange={e => handleFileSelect(e, 'logo')} />
                            <label htmlFor="logo-upload" className="cursor-pointer flex flex-col items-center gap-2 text-neutral-400 hover:text-white transition-colors">
                                <Upload size={32} />
                                <span className="text-sm font-bold uppercase tracking-widest mt-2">Upload Logo Tim/Sponsor</span>
                            </label>
                            {logoFiles.length > 0 && (
                                <div className="mt-4 flex flex-wrap gap-2 justify-center">
                                    {logoFiles.map((f, i) => (
                                        <div key={i} className="relative group">
                                            <img src={URL.createObjectURL(f)} className="w-12 h-12 object-cover border border-neutral-600 rounded bg-white p-1" alt="thmb" />
                                            <button type="button" onClick={() => removeFile(i, 'logo')} className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1 opacity-0 group-hover:opacity-100"><XIcon size={10} /></button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* BAGIAN 4: NAMA & NOMOR */}
                <div className="space-y-4">
                    <h3 className="text-neutral-500 font-bold uppercase tracking-widest text-xs border-b border-neutral-800 pb-2">4. Data Pemain (Opsional)</h3>
                    {players.map((p, idx) => (
                        <div key={idx} className="flex items-center gap-4">
                            <span className="text-neutral-600 font-mono text-xs w-6">{idx + 1}.</span>
                            <input type="text" placeholder="Nama Punggung" className="flex-1 bg-black border border-neutral-800 text-white p-3 outline-none text-sm"
                                value={p.player_name} onChange={e => updatePlayerRow(idx, 'player_name', e.target.value)} />
                            <input type="text" placeholder="Nomor" className="w-24 bg-black border border-neutral-800 text-white p-3 outline-none text-sm text-center"
                                value={p.player_number} onChange={e => updatePlayerRow(idx, 'player_number', e.target.value)} />
                            <button type="button" onClick={() => removePlayerRow(idx)} className="p-3 text-red-500 hover:bg-neutral-800"><Trash2 size={18} /></button>
                        </div>
                    ))}
                    {players.length < totalQty && (
                        <button type="button" onClick={addPlayerRow} className="text-xs font-bold text-neutral-400 hover:text-white uppercase tracking-widest flex items-center gap-2"><UserPlus size={14} /> Tambah Data Pemain</button>
                    )}
                </div>

                {/* BAGIAN 5: CATATAN TAMBAHAN */}
                <div>
                    <label className="text-neutral-500 font-bold uppercase tracking-widest text-xs block mb-2">5. Catatan Tambahan</label>
                    <textarea rows="3" placeholder="Sebutkan detail corak, letak logo, dll..." className="w-full bg-black border border-neutral-800 text-white p-4 outline-none text-sm resize-y" value={notes} onChange={e => setNotes(e.target.value)} />
                </div>

                {/* KALKULATOR TOTAL */}
                <div className="bg-black p-6 border border-neutral-700 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-bl-full pointer-events-none"></div>
                    <h3 className="text-white font-bold uppercase tracking-widest mb-6 border-b border-neutral-800 pb-2">Estimasi Biaya</h3>

                    <div className="space-y-3 mb-6">
                        <div className="flex justify-between text-sm text-neutral-400">
                            <span>Harga Satuan (Produk + Bahan + Kerah)</span>
                            <span className="font-mono">{formatRp(pricePerUnit)}</span>
                        </div>
                        <div className="flex justify-between text-sm text-neutral-400">
                            <span>Total Qty</span>
                            <span className="font-mono">x {totalQty} pcs</span>
                        </div>
                        <div className="flex justify-between text-lg font-bold text-white pt-3 border-t border-neutral-800/50">
                            <span>GRAND TOTAL</span>
                            <span className="font-mono">{formatRp(totalPrice)}</span>
                        </div>
                    </div>

                    <div className="p-4 bg-neutral-900 border border-neutral-800">
                        <div className="flex justify-between text-sm mb-2 text-red-400 font-bold">
                            <span>WAJIB DP ({dpPercentage}%)</span>
                            <span className="font-mono">{formatRp(dpAmount)}</span>
                        </div>
                        <div className="flex justify-between text-xs text-neutral-500">
                            <span>Sisa Pembayaran (Pelunasan)</span>
                            <span className="font-mono">{formatRp(remainingAmount)}</span>
                        </div>
                    </div>
                </div>

                {/* SUBMIT */}
                <button type="submit" disabled={loading || totalQty < 1} className="w-full bg-white text-black font-black uppercase tracking-widest py-5 hover:bg-gray-200 transition-colors disabled:opacity-50 flex items-center justify-center gap-3">
                    {loading ? <Loader2 className="animate-spin" size={24} /> : 'SELESAIKAN ORDER & LANJUT BAYAR DP'}
                </button>
            </form>
        </div>
    );
}

// Simple internal icon for close since not imported from lucide
function XIcon({ size = 14 }) {
    return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;
}
