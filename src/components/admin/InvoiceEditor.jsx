import React, { useState, useRef } from 'react';
import { supabase } from '../../supabase';
import { X, Upload, Loader2, Save, Printer, Trash2 } from 'lucide-react';

const formatRp = (num) => {
    const n = Number(num) || 0;
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);
};

export default function InvoiceEditor({ order, onClose, onSaved }) {
    const invoice = order.invoices?.[0];

    // Editable fields
    const [productName, setProductName] = useState(order.product_name || '');
    const [quantity, setQuantity] = useState(order.quantity || 0);
    const [pricePerUnit, setPricePerUnit] = useState(order.price_per_unit || 0);
    const [discount, setDiscount] = useState(invoice?.discount || 0);
    const [dpAmount, setDpAmount] = useState(order.dp_amount || 0);
    const [notes, setNotes] = useState(order.notes || '');
    const [bahan, setBahan] = useState(order.bahan || '');
    const [kerah, setKerah] = useState(order.kerah || '');
    const [size, setSize] = useState(order.size || '');

    // Design images — existing + new uploads
    const [existingImages, setExistingImages] = useState(order.design_urls || []);
    const [newImages, setNewImages] = useState([]); // { file, preview }
    const fileInputRef = useRef(null);

    const [saving, setSaving] = useState(false);

    // Calculations
    const subtotal = (Number(quantity) || 0) * (Number(pricePerUnit) || 0);
    const grandTotal = subtotal - (Number(discount) || 0);
    const remaining = grandTotal - (Number(dpAmount) || 0);

    // Image handling
    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);
        const imgs = files.map(file => ({
            file,
            preview: URL.createObjectURL(file),
        }));
        setNewImages(prev => [...prev, ...imgs]);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const removeExistingImage = (idx) => {
        setExistingImages(prev => prev.filter((_, i) => i !== idx));
    };

    const removeNewImage = (idx) => {
        setNewImages(prev => {
            URL.revokeObjectURL(prev[idx].preview);
            return prev.filter((_, i) => i !== idx);
        });
    };

    // Upload new images to Supabase Storage
    const uploadNewImages = async () => {
        const urls = [];
        for (const img of newImages) {
            const ext = img.file.name.split('.').pop();
            const fileName = `invoice-designs/${order.id}_${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
            const { error } = await supabase.storage.from('vorvox-assets').upload(fileName, img.file);
            if (error) {
                console.error('Upload error:', error);
                continue;
            }
            const { data: urlData } = supabase.storage.from('vorvox-assets').getPublicUrl(fileName);
            if (urlData?.publicUrl) urls.push(urlData.publicUrl);
        }
        return urls;
    };

    // Save edits
    const handleSave = async () => {
        setSaving(true);
        try {
            // Upload new images
            let uploadedUrls = [];
            if (newImages.length > 0) {
                uploadedUrls = await uploadNewImages();
            }
            const allDesignUrls = [...existingImages, ...uploadedUrls];

            const totalPrice = grandTotal;
            const remainingAmount = remaining > 0 ? remaining : 0;

            // Update order
            const { error: orderErr } = await supabase.from('orders').update({
                product_name: productName,
                quantity: Number(quantity),
                price_per_unit: Number(pricePerUnit),
                total_price: totalPrice,
                dp_amount: Number(dpAmount),
                remaining_amount: remainingAmount,
                notes: notes || null,
                bahan: bahan,
                kerah: kerah,
                size: size,
                design_urls: allDesignUrls,
            }).eq('id', order.id);

            if (orderErr) throw new Error('Gagal update pesanan: ' + orderErr.message);

            // Update invoice
            if (invoice) {
                const { error: invErr } = await supabase.from('invoices').update({
                    subtotal: subtotal,
                    discount: Number(discount),
                    grand_total: totalPrice,
                }).eq('id', invoice.id);

                if (invErr) throw new Error('Gagal update invoice: ' + invErr.message);
            }

            alert('✅ Invoice berhasil diperbarui!');
            if (onSaved) onSaved();
            onClose();
        } catch (err) {
            console.error('Save error:', err);
            alert('❌ Gagal menyimpan: ' + err.message);
        } finally {
            setSaving(false);
        }
    };

    // Print with updated data
    const handlePrint = () => {
        const LOGO = 'https://lh3.googleusercontent.com/d/1Vj2HKhfRS3x9JMGN0wzvTQtln18RYc_I';
        const dateFormatted = new Date(order.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

        const allImages = [...existingImages, ...newImages.map(i => i.preview)];
        const designImagesHtml = allImages.length > 0 ? `
  <div class="inv-designs">
    <div class="inv-designs-label">Lampiran Desain</div>
    <div class="inv-designs-grid">
      ${allImages.map((url, i) => `<img src="${url}" alt="Desain ${i + 1}" class="inv-design-img" />`).join('\n      ')}
    </div>
  </div>` : '';

        const printContent = `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Invoice ${invoice?.invoice_number || order.order_code}</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Inter', sans-serif; color: #1a1a1a; background: #fff; }
  @page { size: A4; margin: 15mm; }
  @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } .inv-designs { break-inside: avoid; } }
  .inv-container { max-width: 780px; margin: 0 auto; padding: 40px; }
  .inv-header { display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 24px; border-bottom: 3px solid #1B1F3B; }
  .inv-logo-area { display: flex; align-items: center; gap: 14px; }
  .inv-logo-area img { width: 56px; height: 56px; object-fit: contain; }
  .inv-brand h1 { font-size: 28px; font-weight: 900; letter-spacing: 3px; color: #1B1F3B; }
  .inv-brand p { font-size: 10px; color: #888; letter-spacing: 1.5px; text-transform: uppercase; margin-top: 2px; }
  .inv-badge { text-align: right; }
  .inv-badge h2 { font-size: 28px; font-weight: 800; color: #1B1F3B; letter-spacing: 4px; }
  .inv-badge .inv-num { font-size: 13px; font-weight: 700; color: #555; margin-top: 4px; }
  .inv-badge .inv-date { font-size: 11px; color: #999; margin-top: 2px; }
  .inv-parties { display: flex; justify-content: space-between; margin-top: 28px; gap: 40px; }
  .inv-party { flex: 1; }
  .inv-party-label { font-size: 9px; letter-spacing: 2px; text-transform: uppercase; color: #aaa; font-weight: 700; margin-bottom: 8px; }
  .inv-party-name { font-size: 16px; font-weight: 700; color: #1B1F3B; }
  .inv-party-detail { font-size: 12px; color: #666; line-height: 1.8; margin-top: 4px; }
  .inv-table { width: 100%; border-collapse: collapse; margin-top: 32px; }
  .inv-table thead th { background: #1B1F3B; color: #fff; padding: 12px 14px; font-size: 10px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; }
  .inv-table thead th:first-child { text-align: left; }
  .inv-table thead th:last-child, .inv-table thead th:nth-child(3), .inv-table thead th:nth-child(4) { text-align: right; }
  .inv-table thead th:nth-child(2) { text-align: center; }
  .inv-table tbody td { padding: 14px; border-bottom: 1px solid #eee; font-size: 13px; }
  .inv-table tbody td:nth-child(2) { text-align: center; font-weight: 600; }
  .inv-table tbody td:nth-child(3), .inv-table tbody td:nth-child(4) { text-align: right; }
  .inv-prod-name { font-weight: 700; font-size: 14px; color: #1B1F3B; display: block; }
  .inv-prod-spec { font-size: 11px; color: #888; margin-top: 3px; display: block; }
  .inv-designs { margin-top: 28px; padding: 20px; background: #FAFBFC; border: 1px solid #eee; border-radius: 8px; }
  .inv-designs-label { font-size: 9px; letter-spacing: 2px; text-transform: uppercase; color: #aaa; font-weight: 700; margin-bottom: 14px; }
  .inv-designs-grid { display: flex; flex-wrap: wrap; gap: 12px; }
  .inv-design-img { width: 200px; height: auto; max-height: 260px; object-fit: contain; border: 1px solid #ddd; border-radius: 6px; background: #fff; padding: 4px; }
  .inv-totals { display: flex; justify-content: flex-end; margin-top: 24px; }
  .inv-totals table { width: 320px; }
  .inv-totals td { padding: 7px 0; font-size: 13px; }
  .inv-totals .label { color: #888; }
  .inv-totals .val { text-align: right; font-weight: 600; }
  .inv-grand { font-size: 18px !important; font-weight: 800 !important; color: #1B1F3B; border-top: 2px solid #1B1F3B; padding-top: 12px !important; }
  .inv-dp { color: #0D7377; }
  .inv-sisa { color: #C62828; font-weight: 800 !important; }
  .inv-notes { margin-top: 28px; background: #F8F9FB; border: 1px solid #eee; border-radius: 6px; padding: 16px 20px; }
  .inv-notes-label { font-size: 9px; letter-spacing: 2px; text-transform: uppercase; color: #aaa; font-weight: 700; margin-bottom: 6px; }
  .inv-notes-text { font-size: 12px; color: #555; line-height: 1.7; }
  .inv-status { margin-top: 20px; text-align: center; }
  .inv-status-badge { display: inline-block; padding: 6px 20px; border-radius: 20px; font-size: 11px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; }
  .inv-status-paid { background: #E8F5E9; color: #2E7D32; border: 2px solid #A5D6A7; }
  .inv-status-unpaid { background: #FFF3E0; color: #E65100; border: 2px solid #FFB74D; }
  .inv-footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; display: flex; justify-content: space-between; align-items: flex-end; }
  .inv-footer-info { font-size: 10px; color: #bbb; line-height: 1.8; }
  .inv-sign { text-align: center; width: 200px; }
  .inv-sign-date { font-size: 11px; color: #888; }
  .inv-sign-line { margin-top: 60px; border-top: 1px solid #333; padding-top: 6px; font-size: 12px; font-weight: 700; color: #1B1F3B; }
  .inv-sign-role { font-size: 10px; color: #999; }
</style>
</head>
<body>
<div class="inv-container">
  <div class="inv-header">
    <div class="inv-logo-area">
      <img src="${LOGO}" alt="Vorvox Logo" />
      <div class="inv-brand">
        <h1>VORVOX.ID</h1>
        <p>Vendor Sublim & Konveksi Sportswear</p>
      </div>
    </div>
    <div class="inv-badge">
      <h2>INVOICE</h2>
      <div class="inv-num">${invoice?.invoice_number || order.order_code}</div>
      <div class="inv-date">Tanggal: ${dateFormatted}</div>
    </div>
  </div>

  <div class="inv-parties">
    <div class="inv-party">
      <div class="inv-party-label">Ditagihkan Kepada</div>
      <div class="inv-party-name">${order.clients?.name || '-'}</div>
      <div class="inv-party-detail">
        ${order.clients?.email || '-'}<br />
        ${order.clients?.phone || '-'}
      </div>
    </div>
    <div class="inv-party" style="text-align: right;">
      <div class="inv-party-label">Dari</div>
      <div class="inv-party-name">Vorvox.id</div>
      <div class="inv-party-detail">
        vorvoxid@gmail.com<br />
        0856-4111-7775
      </div>
    </div>
  </div>

  <table class="inv-table">
    <thead>
      <tr>
        <th>Deskripsi Produk</th>
        <th>Qty</th>
        <th>Harga Satuan</th>
        <th>Total</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>
          <span class="inv-prod-name">${productName}</span>
          <span class="inv-prod-spec">${[bahan, kerah, size].filter(Boolean).join(' • ')}</span>
        </td>
        <td>${quantity}</td>
        <td>Rp ${Number(pricePerUnit).toLocaleString('id-ID')}</td>
        <td>Rp ${subtotal.toLocaleString('id-ID')}</td>
      </tr>
    </tbody>
  </table>

  ${designImagesHtml}

  <div class="inv-totals">
    <table>
      <tr><td class="label">Subtotal</td><td class="val">Rp ${subtotal.toLocaleString('id-ID')}</td></tr>
      ${Number(discount) > 0 ? `<tr><td class="label">Diskon</td><td class="val" style="color:#C62828;">-Rp ${Number(discount).toLocaleString('id-ID')}</td></tr>` : ''}
      <tr><td class="label inv-grand">Grand Total</td><td class="val inv-grand">Rp ${grandTotal.toLocaleString('id-ID')}</td></tr>
      ${Number(dpAmount) > 0 ? `
      <tr><td class="label inv-dp">Down Payment (DP)</td><td class="val inv-dp">-Rp ${Number(dpAmount).toLocaleString('id-ID')}</td></tr>
      <tr><td class="label inv-sisa">Sisa Tagihan</td><td class="val inv-sisa">Rp ${(remaining > 0 ? remaining : 0).toLocaleString('id-ID')}</td></tr>
      ` : ''}
    </table>
  </div>

  ${notes ? `
  <div class="inv-notes">
    <div class="inv-notes-label">Catatan</div>
    <div class="inv-notes-text">${notes}</div>
  </div>` : ''}

  <div class="inv-status">
    <span class="inv-status-badge ${order.status === 'selesai' ? 'inv-status-paid' : 'inv-status-unpaid'}">
      ${order.status === 'selesai' ? '✓ LUNAS' : '⏳ BELUM LUNAS'}
    </span>
  </div>

  <div class="inv-footer">
    <div class="inv-footer-info">
      <b>Vorvox.id</b><br />
      Jl. Patimura No. 45, Jeru, Kec. Tumpang<br />
      Kab. Malang, Jawa Timur 65156<br />
      WA: 0856-4111-7775 | vorvoxid@gmail.com<br />
      www.vorvox.web.id
    </div>
    <div class="inv-sign">
      <div class="inv-sign-date">Malang, ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
      <div class="inv-sign-line">Admin Vorvox</div>
      <div class="inv-sign-role">Penanggung Jawab Produksi</div>
    </div>
  </div>
</div>
</body>
</html>`;

        const printWindow = window.open('', '_blank');
        printWindow.document.write(printContent);
        printWindow.document.close();
        setTimeout(() => printWindow.print(), 600);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="bg-neutral-900 border border-neutral-800 w-full max-w-4xl shadow-2xl my-4 max-h-[95vh] flex flex-col">
                {/* Header */}
                <div className="p-4 border-b border-neutral-800 flex justify-between items-center bg-black shrink-0">
                    <h3 className="text-white font-bold uppercase tracking-widest text-sm">
                        Edit Invoice — {order.order_code}
                    </h3>
                    <button onClick={onClose} className="text-neutral-500 hover:text-white transition-colors" disabled={saving}>
                        <X size={20} />
                    </button>
                </div>

                {/* Form Body */}
                <div className="p-6 overflow-y-auto flex-1 space-y-6">

                    {/* Client Info (read-only) */}
                    <div className="bg-black border border-neutral-800 rounded p-4">
                        <label className="text-neutral-500 text-[10px] uppercase tracking-widest font-bold block mb-2">Informasi Klien</label>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                                <span className="text-neutral-600 text-[9px] block uppercase">Nama</span>
                                <span className="text-white font-bold">{order.clients?.name || '-'}</span>
                            </div>
                            <div>
                                <span className="text-neutral-600 text-[9px] block uppercase">Email</span>
                                <span className="text-neutral-400">{order.clients?.email || '-'}</span>
                            </div>
                            <div>
                                <span className="text-neutral-600 text-[9px] block uppercase">Telepon</span>
                                <span className="text-neutral-400">{order.clients?.phone || '-'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Product Info */}
                    <div>
                        <label className="text-neutral-500 text-[10px] uppercase tracking-widest font-bold block mb-2">Deskripsi Produk</label>
                        <input type="text" value={productName} onChange={e => setProductName(e.target.value)}
                            className="w-full bg-black border border-neutral-800 text-white p-3 outline-none focus:border-neutral-600 transition-colors text-sm mb-3" placeholder="Nama Produk" />
                        <div className="grid grid-cols-3 gap-3">
                            <input type="text" value={bahan} onChange={e => setBahan(e.target.value)} placeholder="Bahan"
                                className="bg-black border border-neutral-800 text-white p-3 outline-none focus:border-neutral-600 text-sm" />
                            <input type="text" value={kerah} onChange={e => setKerah(e.target.value)} placeholder="Kerah"
                                className="bg-black border border-neutral-800 text-white p-3 outline-none focus:border-neutral-600 text-sm" />
                            <input type="text" value={size} onChange={e => setSize(e.target.value)} placeholder="Ukuran"
                                className="bg-black border border-neutral-800 text-white p-3 outline-none focus:border-neutral-600 text-sm" />
                        </div>
                    </div>

                    {/* Quantity & Price */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-neutral-500 text-[10px] uppercase tracking-widest font-bold block mb-2">Quantity</label>
                            <input type="number" min="1" value={quantity} onChange={e => setQuantity(e.target.value)}
                                className="w-full bg-black border border-neutral-800 text-white p-3 outline-none focus:border-neutral-600 text-sm text-center" />
                        </div>
                        <div>
                            <label className="text-neutral-500 text-[10px] uppercase tracking-widest font-bold block mb-2">Harga Satuan (Rp)</label>
                            <input type="number" min="0" value={pricePerUnit} onChange={e => setPricePerUnit(e.target.value)}
                                className="w-full bg-black border border-neutral-800 text-white p-3 outline-none focus:border-neutral-600 text-sm text-right" />
                        </div>
                    </div>

                    {/* Upload Desain */}
                    <div>
                        <label className="text-neutral-500 text-[10px] uppercase tracking-widest font-bold block mb-2">Lampiran Foto / Desain</label>
                        <div className="bg-black border border-neutral-800 rounded p-4">
                            <div className="flex flex-wrap gap-3 mb-3">
                                {/* Existing images */}
                                {existingImages.map((url, idx) => (
                                    <div key={`existing-${idx}`} className="relative group">
                                        <img src={url} alt={`Existing ${idx + 1}`} className="w-24 h-24 object-cover rounded border border-neutral-700" />
                                        <button onClick={() => removeExistingImage(idx)}
                                            className="absolute -top-2 -right-2 w-5 h-5 bg-red-600 text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                                            <X size={12} />
                                        </button>
                                        <span className="absolute bottom-0 left-0 right-0 bg-black/70 text-[8px] text-neutral-400 text-center py-0.5">Tersimpan</span>
                                    </div>
                                ))}
                                {/* New uploads */}
                                {newImages.map((img, idx) => (
                                    <div key={`new-${idx}`} className="relative group">
                                        <img src={img.preview} alt={`New ${idx + 1}`} className="w-24 h-24 object-cover rounded border border-green-700" />
                                        <button onClick={() => removeNewImage(idx)}
                                            className="absolute -top-2 -right-2 w-5 h-5 bg-red-600 text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                                            <X size={12} />
                                        </button>
                                        <span className="absolute bottom-0 left-0 right-0 bg-green-900/70 text-[8px] text-green-400 text-center py-0.5">Baru</span>
                                    </div>
                                ))}
                            </div>
                            <button onClick={() => fileInputRef.current?.click()}
                                className="flex items-center gap-2 px-4 py-2 border border-dashed border-neutral-700 text-neutral-400 hover:text-white hover:border-neutral-500 rounded transition-colors text-xs font-bold uppercase tracking-wider">
                                <Upload size={14} /> Tambah Foto Desain
                            </button>
                            <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
                            <p className="text-neutral-600 text-[10px] mt-2">Foto akan tampil di bawah tabel produk pada invoice cetak.</p>
                        </div>
                    </div>

                    {/* Financials */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-neutral-500 text-[10px] uppercase tracking-widest font-bold block mb-2">Diskon (Rp)</label>
                            <input type="number" min="0" value={discount} onChange={e => setDiscount(e.target.value)}
                                className="w-full bg-black border border-neutral-800 text-white p-3 outline-none focus:border-neutral-600 text-sm" />
                        </div>
                        <div>
                            <label className="text-neutral-500 text-[10px] uppercase tracking-widest font-bold block mb-2">DP (Rp)</label>
                            <input type="number" min="0" value={dpAmount} onChange={e => setDpAmount(e.target.value)}
                                className="w-full bg-black border border-neutral-800 text-white p-3 outline-none focus:border-neutral-600 text-sm" />
                        </div>
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="text-neutral-500 text-[10px] uppercase tracking-widest font-bold block mb-2">Catatan</label>
                        <textarea rows={3} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Catatan tambahan..."
                            className="w-full bg-black border border-neutral-800 text-white p-3 outline-none focus:border-neutral-600 text-sm resize-none" />
                    </div>

                    {/* Summary */}
                    <div className="bg-black border border-neutral-800 rounded p-4">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-neutral-500 text-sm">Subtotal ({quantity} × {formatRp(pricePerUnit)})</span>
                            <span className="text-white font-bold">{formatRp(subtotal)}</span>
                        </div>
                        {Number(discount) > 0 && (
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-neutral-500 text-sm">Diskon</span>
                                <span className="text-red-400 font-bold">-{formatRp(discount)}</span>
                            </div>
                        )}
                        <div className="flex justify-between items-center pt-2 border-t border-neutral-800 mb-2">
                            <span className="text-white font-bold text-lg">Grand Total</span>
                            <span className="text-white font-black text-lg">{formatRp(grandTotal)}</span>
                        </div>
                        {Number(dpAmount) > 0 && (
                            <>
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-teal-400 text-sm">DP</span>
                                    <span className="text-teal-400 font-bold">-{formatRp(dpAmount)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-red-400 font-bold text-sm">Sisa Tagihan</span>
                                    <span className="text-red-400 font-black">{formatRp(remaining > 0 ? remaining : 0)}</span>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-4 border-t border-neutral-800 bg-black shrink-0 flex flex-col sm:flex-row gap-3">
                    <button onClick={onClose} disabled={saving}
                        className="py-3 px-6 border border-neutral-700 text-neutral-400 hover:text-white hover:border-neutral-500 font-bold uppercase tracking-widest text-xs transition-colors">
                        Batal
                    </button>
                    <button onClick={handlePrint} disabled={saving}
                        className="py-3 px-6 border border-neutral-700 text-neutral-400 hover:text-white hover:border-neutral-500 font-bold uppercase tracking-widest text-xs transition-colors flex items-center justify-center gap-2">
                        <Printer size={14} /> Print Preview
                    </button>
                    <button onClick={handleSave} disabled={saving}
                        className="flex-1 py-3 bg-green-600 text-white font-bold uppercase tracking-widest text-xs hover:bg-green-500 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                        {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                        {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
                    </button>
                </div>
            </div>
        </div>
    );
}
