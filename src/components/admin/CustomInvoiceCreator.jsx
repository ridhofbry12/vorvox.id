import React, { useState, useRef } from 'react';
import { supabase } from '../../supabase';
import { X, Plus, Trash2, Printer, Upload, Loader2, Save } from 'lucide-react';
import PrintOptionsModal from './PrintOptionsModal';

const INVOICE_TYPES = [
    { value: 'non_sublim', label: 'Non Sublim' },
    { value: 'vendor', label: 'Vendor' },
    { value: 'dtf', label: 'DTF' },
];

const generateInvoiceNumber = () => {
    const now = new Date();
    const yy = String(now.getFullYear()).slice(-2);
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const hh = String(now.getHours()).padStart(2, '0');
    const mi = String(now.getMinutes()).padStart(2, '0');
    const ss = String(now.getSeconds()).padStart(2, '0');
    return `CINV-${yy}${mm}${dd}-${hh}${mi}${ss}`;
};

const generateOrderCode = () => {
    const now = new Date();
    const yy = String(now.getFullYear()).slice(-2);
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const hh = String(now.getHours()).padStart(2, '0');
    const mi = String(now.getMinutes()).padStart(2, '0');
    return `CUS-${yy}${mm}${dd}-${hh}${mi}`;
};

const formatRp = (num) => {
    const n = Number(num) || 0;
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);
};

const EMPTY_ITEM = { name: '', spec: '', qty: 1, price: 0 };

export default function CustomInvoiceCreator({ onClose, onSaved }) {
    // Invoice type
    const [invoiceType, setInvoiceType] = useState('non_sublim');

    // Client info
    const [clientName, setClientName] = useState('');
    const [clientEmail, setClientEmail] = useState('');
    const [clientPhone, setClientPhone] = useState('');

    // Invoice meta
    const [invoiceNumber, setInvoiceNumber] = useState(generateInvoiceNumber());
    const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);

    // Product items
    const [items, setItems] = useState([{ ...EMPTY_ITEM }]);

    // Financials
    const [discount, setDiscount] = useState(0);
    const [dpAmount, setDpAmount] = useState(0);
    const [notes, setNotes] = useState('');
    const [paymentStatus, setPaymentStatus] = useState('unpaid');

    // Design images
    const [designImages, setDesignImages] = useState([]); // array of { file, preview, url? }
    const fileInputRef = useRef(null);

    // Loading/saving state
    const [saving, setSaving] = useState(false);
    const [showPrintModal, setShowPrintModal] = useState(false);
    const [justPrint, setJustPrint] = useState(false); // Flag if we only print without saving

    // ─── Item CRUD ───
    const addItem = () => setItems([...items, { ...EMPTY_ITEM }]);
    const removeItem = (idx) => {
        if (items.length <= 1) return;
        setItems(items.filter((_, i) => i !== idx));
    };
    const updateItem = (idx, field, value) => {
        const updated = [...items];
        updated[idx] = { ...updated[idx], [field]: value };
        setItems(updated);
    };

    // ─── Calculations ───
    const subtotal = items.reduce((sum, it) => sum + (Number(it.qty) || 0) * (Number(it.price) || 0), 0);
    const grandTotal = subtotal - (Number(discount) || 0);
    const totalQty = items.reduce((sum, it) => sum + (Number(it.qty) || 0), 0);
    const remainingAmount = grandTotal - (Number(dpAmount) || 0);

    // ─── Image Upload ───
    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);
        const newImages = files.map(file => ({
            file,
            preview: URL.createObjectURL(file),
        }));
        setDesignImages(prev => [...prev, ...newImages]);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const removeImage = (idx) => {
        setDesignImages(prev => {
            URL.revokeObjectURL(prev[idx].preview);
            return prev.filter((_, i) => i !== idx);
        });
    };

    // ─── Upload images to Supabase Storage ───
    const uploadDesignImages = async () => {
        const urls = [];
        for (const img of designImages) {
            const ext = img.file.name.split('.').pop();
            const fileName = `custom-invoice/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
            const { data, error } = await supabase.storage.from('vorvox-assets').upload(fileName, img.file);
            if (error) {
                console.error('Upload error:', error);
                continue;
            }
            const { data: urlData } = supabase.storage.from('vorvox-assets').getPublicUrl(fileName);
            if (urlData?.publicUrl) urls.push(urlData.publicUrl);
        }
        return urls;
    };

    // ─── Get invoice type label ───
    const getTypeLabel = () => INVOICE_TYPES.find(t => t.value === invoiceType)?.label || invoiceType;
    const getTypeBadgeColor = () => {
        if (invoiceType === 'vendor') return 'background:#7B1FA2;color:#fff;';
        if (invoiceType === 'dtf') return 'background:#E65100;color:#fff;';
        return 'background:#1565C0;color:#fff;';
    };

    // ─── Map payment status to order status ───
    const getOrderStatus = () => {
        if (paymentStatus === 'paid') return 'selesai';
        return 'pending_payment';
    };

    // ─── SAVE TO DATABASE ───
    const handleSave = async () => {
        if (!clientName.trim()) return alert('Nama klien wajib diisi.');
        if (items.every(it => !it.name.trim())) return alert('Minimal satu produk harus diisi.');

        setSaving(true);
        try {
            // 1. Upsert client
            const email = clientEmail.trim() || `custom_${Date.now()}@vorvox.local`;
            let clientId;
            const { data: existingClient } = await supabase.from('clients').select('id').eq('email', email).maybeSingle();
            if (existingClient) {
                clientId = existingClient.id;
                // Update name/phone if provided
                await supabase.from('clients').update({ name: clientName, phone: clientPhone || null }).eq('id', clientId);
            } else {
                const { data: newClient, error: clientErr } = await supabase.from('clients').insert({
                    name: clientName,
                    email: email,
                    phone: clientPhone || null,
                }).select('id').single();
                if (clientErr) throw new Error('Gagal menyimpan data klien: ' + clientErr.message);
                clientId = newClient.id;
            }

            // 2. Upload design images
            let designUrls = [];
            if (designImages.length > 0) {
                designUrls = await uploadDesignImages();
            }

            // 3. Build product description for order
            const validItems = items.filter(it => it.name.trim());
            const productName = validItems.map(it => it.name).join(', ');
            const firstItem = validItems[0];
            const pricePerUnit = validItems.length === 1 ? Number(firstItem.price) || 0 : Math.round(subtotal / totalQty);

            const orderCode = generateOrderCode();
            const orderStatus = getOrderStatus();

            // 4. Insert order
            const { data: newOrder, error: orderErr } = await supabase.from('orders').insert({
                client_id: clientId,
                order_code: orderCode,
                product_name: productName,
                quantity: totalQty,
                size: '-',
                bahan: getTypeLabel(),
                kerah: '-',
                notes: notes || null,
                price_per_unit: pricePerUnit,
                total_price: grandTotal,
                dp_amount: Number(dpAmount) || 0,
                remaining_amount: remainingAmount > 0 ? remainingAmount : 0,
                design_urls: designUrls,
                logo_urls: [],
                status: orderStatus,
                order_type: 'custom_invoice',
                sublim_category: invoiceType,
            }).select('id').single();

            if (orderErr) throw new Error('Gagal menyimpan pesanan: ' + orderErr.message);

            // 5. Insert invoice
            const { error: invErr } = await supabase.from('invoices').insert({
                order_id: newOrder.id,
                invoice_number: invoiceNumber,
                subtotal: subtotal,
                discount: Number(discount) || 0,
                grand_total: grandTotal,
                payment_status: paymentStatus,
            });

            if (invErr) throw new Error('Gagal menyimpan invoice: ' + invErr.message);

            alert('✅ Custom Invoice berhasil disimpan ke pesanan!');
            if (onSaved) onSaved();
            onClose();
        } catch (err) {
            console.error('Save error:', err);
            alert('❌ Gagal menyimpan: ' + err.message);
        } finally {
            setSaving(false);
        }
    };

    // ─── SAVE & PRINT ───
    const handleSaveAndPrint = async () => {
        if (!clientName.trim()) return alert('Nama klien wajib diisi.');
        if (items.every(it => !it.name.trim())) return alert('Minimal satu produk harus diisi.');

        // Save first
        setSaving(true);
        try {
            const email = clientEmail.trim() || `custom_${Date.now()}@vorvox.local`;
            let clientId;
            const { data: existingClient } = await supabase.from('clients').select('id').eq('email', email).maybeSingle();
            if (existingClient) {
                clientId = existingClient.id;
                await supabase.from('clients').update({ name: clientName, phone: clientPhone || null }).eq('id', clientId);
            } else {
                const { data: newClient, error: clientErr } = await supabase.from('clients').insert({
                    name: clientName, email: email, phone: clientPhone || null
                }).select('id').single();
                if (clientErr) throw new Error('Gagal menyimpan data klien: ' + clientErr.message);
                clientId = newClient.id;
            }

            let designUrls = [];
            if (designImages.length > 0) {
                designUrls = await uploadDesignImages();
            }

            const validItems = items.filter(it => it.name.trim());
            const productName = validItems.map(it => it.name).join(', ');
            const firstItem = validItems[0];
            const pricePerUnit = validItems.length === 1 ? Number(firstItem.price) || 0 : Math.round(subtotal / totalQty);
            const orderCode = generateOrderCode();
            const orderStatus = getOrderStatus();

            const { data: newOrder, error: orderErr } = await supabase.from('orders').insert({
                client_id: clientId, order_code: orderCode, product_name: productName,
                quantity: totalQty, size: '-', bahan: getTypeLabel(), kerah: '-',
                notes: notes || null, price_per_unit: pricePerUnit, total_price: grandTotal,
                dp_amount: Number(dpAmount) || 0, remaining_amount: remainingAmount > 0 ? remainingAmount : 0,
                design_urls: designUrls, logo_urls: [], status: orderStatus,
                order_type: 'custom_invoice', sublim_category: invoiceType,
            }).select('id').single();
            if (orderErr) throw new Error('Gagal menyimpan pesanan: ' + orderErr.message);

            const { error: invErr } = await supabase.from('invoices').insert({
                order_id: newOrder.id, invoice_number: invoiceNumber,
                subtotal: subtotal, discount: Number(discount) || 0,
                grand_total: grandTotal, payment_status: paymentStatus,
            });
            if (invErr) throw new Error('Gagal menyimpan invoice: ' + invErr.message);

            // Instead of immediate print, we want choice. Let's just handleSave and then handlePrintInvoice
            // which opens the modal, but we must make sure the modal doesn't close "onClose", let's adjust:
            // Let user pick orientation, but CustomInvoice isn't closing until print is clicked

            // To simplify flow without breaking CustomInvoice closing logic:
            alert('✅ Custom Invoice berhasil disimpan ke pesanan!');
            if (onSaved) onSaved();

            // We open the modal for print, so don't close the parent yet
            setJustPrint(false);
            setShowPrintModal(true);
        } catch (err) {
            console.error('Save error:', err);
            alert('❌ Gagal menyimpan: ' + err.message);
        } finally {
            setSaving(false);
        }
    };

    // ─── Print Invoice (no save) ───
    const handlePrintInvoice = () => {
        if (!clientName.trim()) return alert('Nama klien wajib diisi.');
        if (items.every(it => !it.name.trim())) return alert('Minimal satu produk harus diisi.');
        setJustPrint(true);
        setShowPrintModal(true);
    };

    // ─── Confirm & Execute Print ───
    const confirmPrintInvoice = (orientation) => {
        if (items.every(it => !it.name.trim())) return alert('Minimal satu produk harus diisi.');

        const LOGO = 'https://lh3.googleusercontent.com/d/1Vj2HKhfRS3x9JMGN0wzvTQtln18RYc_I';
        const dateFormatted = new Date(invoiceDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

        const productRows = items
            .filter(it => it.name.trim())
            .map(it => {
                const total = (Number(it.qty) || 0) * (Number(it.price) || 0);
                return `
      <tr>
        <td>
          <span class="inv-prod-name">${it.name}</span>
          ${it.spec ? `<span class="inv-prod-spec">${it.spec}</span>` : ''}
        </td>
        <td>${it.qty}</td>
        <td>Rp ${Number(it.price).toLocaleString('id-ID')}</td>
        <td>Rp ${total.toLocaleString('id-ID')}</td>
      </tr>`;
            }).join('\n');

        const designImagesHtml = designImages.length > 0 ? `
  <div class="inv-designs">
    <div class="inv-designs-label">Desain Jersey</div>
    <div class="inv-designs-grid">
      ${designImages.map((img, i) => `<img src="${img.preview}" alt="Desain ${i + 1}" class="inv-design-img" />`).join('\n      ')}
    </div>
  </div>` : '';

        // Add landscape orientation to the CSS if selected
        const pageLayoutCss = orientation === 'landscape' ? '@page { size: A4 landscape; margin: 15mm; }' : '@page { size: A4 portrait; margin: 15mm; }';

        const printContent = `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Custom Invoice ${invoiceNumber}</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Inter', sans-serif; color: #1a1a1a; background: #fff; }
  ${pageLayoutCss}
  @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } .inv-designs { break-inside: avoid; } }
  .inv-container { max-width: ${orientation === 'landscape' ? '1080px' : '780px'}; margin: 0 auto; padding: 40px; }
  .inv-header { display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 24px; border-bottom: 3px solid #1B1F3B; }
  .inv-logo-area { display: flex; align-items: center; gap: 14px; }
  .inv-logo-area img { width: 56px; height: 56px; object-fit: contain; }
  .inv-brand h1 { font-size: 28px; font-weight: 900; letter-spacing: 3px; color: #1B1F3B; }
  .inv-brand p { font-size: 10px; color: #888; letter-spacing: 1.5px; text-transform: uppercase; margin-top: 2px; }
  .inv-badge { text-align: right; }
  .inv-badge h2 { font-size: 28px; font-weight: 800; color: #1B1F3B; letter-spacing: 4px; }
  .inv-badge .inv-num { font-size: 13px; font-weight: 700; color: #555; margin-top: 4px; }
  .inv-badge .inv-date { font-size: 11px; color: #999; margin-top: 2px; }
  .inv-type-badge { display: inline-block; padding: 4px 14px; border-radius: 4px; font-size: 10px; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase; margin-top: 6px; ${getTypeBadgeColor()} }
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
  .inv-design-img { width: ${orientation === 'landscape' ? '280px' : '200px'}; height: auto; max-height: 260px; object-fit: contain; border: 1px solid #ddd; border-radius: 6px; background: #fff; padding: 4px; }
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
      <div class="inv-num">${invoiceNumber}</div>
      <div class="inv-date">Tanggal: ${dateFormatted}</div>
      <div class="inv-type-badge">${getTypeLabel()}</div>
    </div>
  </div>

  <div class="inv-parties">
    <div class="inv-party">
      <div class="inv-party-label">Ditagihkan Kepada</div>
      <div class="inv-party-name">${clientName || '-'}</div>
      <div class="inv-party-detail">
        ${clientEmail || '-'}<br />
        ${clientPhone || '-'}
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
      ${productRows}
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
      <tr><td class="label inv-sisa">Sisa Tagihan</td><td class="val inv-sisa">Rp ${remainingAmount.toLocaleString('id-ID')}</td></tr>
      ` : ''}
    </table>
  </div>

  ${notes ? `
  <div class="inv-notes">
    <div class="inv-notes-label">Catatan</div>
    <div class="inv-notes-text">${notes}</div>
  </div>` : ''}

  <div class="inv-status">
    <span class="inv-status-badge ${paymentStatus === 'paid' ? 'inv-status-paid' : 'inv-status-unpaid'}">
      ${paymentStatus === 'paid' ? '✓ LUNAS' : '⏳ BELUM LUNAS'}
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

        // If it was Save & Print, close CustomInvoiceCreator after printing
        if (!justPrint) {
            onClose();
        }
    };

    // ─── RENDER ───
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="bg-neutral-900 border border-neutral-800 w-full max-w-4xl shadow-2xl my-4 max-h-[95vh] flex flex-col">
                {/* Header */}
                <div className="p-4 border-b border-neutral-800 flex justify-between items-center bg-black shrink-0">
                    <h3 className="text-white font-bold uppercase tracking-widest text-sm">Buat Custom Invoice</h3>
                    <button onClick={onClose} className="text-neutral-500 hover:text-white transition-colors" disabled={saving}>
                        <X size={20} />
                    </button>
                </div>

                {/* Form Body */}
                <div className="p-6 overflow-y-auto flex-1 space-y-6">

                    {/* Invoice Type */}
                    <div>
                        <label className="text-neutral-500 text-[10px] uppercase tracking-widest font-bold block mb-2">Tipe Invoice</label>
                        <div className="flex gap-2">
                            {INVOICE_TYPES.map(t => (
                                <button key={t.value} onClick={() => setInvoiceType(t.value)}
                                    className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border rounded transition-all ${invoiceType === t.value
                                        ? t.value === 'vendor' ? 'bg-purple-600 border-purple-600 text-white'
                                            : t.value === 'dtf' ? 'bg-orange-600 border-orange-600 text-white'
                                                : 'bg-blue-600 border-blue-600 text-white'
                                        : 'bg-transparent border-neutral-700 text-neutral-400 hover:text-white hover:border-neutral-500'
                                        }`}>
                                    {t.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Invoice Meta */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-neutral-500 text-[10px] uppercase tracking-widest font-bold block mb-2">Nomor Invoice</label>
                            <input type="text" value={invoiceNumber} onChange={e => setInvoiceNumber(e.target.value)}
                                className="w-full bg-black border border-neutral-800 text-white p-3 outline-none focus:border-neutral-600 transition-colors text-sm font-mono" />
                        </div>
                        <div>
                            <label className="text-neutral-500 text-[10px] uppercase tracking-widest font-bold block mb-2">Tanggal Invoice</label>
                            <input type="date" value={invoiceDate} onChange={e => setInvoiceDate(e.target.value)}
                                className="w-full bg-black border border-neutral-800 text-white p-3 outline-none focus:border-neutral-600 transition-colors text-sm" />
                        </div>
                    </div>

                    {/* Client Info */}
                    <div>
                        <label className="text-neutral-500 text-[10px] uppercase tracking-widest font-bold block mb-2">Informasi Klien</label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <input type="text" placeholder="Nama Klien *" value={clientName} onChange={e => setClientName(e.target.value)}
                                className="bg-black border border-neutral-800 text-white p-3 outline-none focus:border-neutral-600 transition-colors text-sm" />
                            <input type="email" placeholder="Email" value={clientEmail} onChange={e => setClientEmail(e.target.value)}
                                className="bg-black border border-neutral-800 text-white p-3 outline-none focus:border-neutral-600 transition-colors text-sm" />
                            <input type="tel" placeholder="No. Telepon" value={clientPhone} onChange={e => setClientPhone(e.target.value)}
                                className="bg-black border border-neutral-800 text-white p-3 outline-none focus:border-neutral-600 transition-colors text-sm" />
                        </div>
                    </div>

                    {/* Product Items */}
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="text-neutral-500 text-[10px] uppercase tracking-widest font-bold">Deskripsi Produk</label>
                            <button onClick={addItem} className="flex items-center gap-1 px-3 py-1.5 bg-white text-black text-[10px] font-bold uppercase tracking-wider rounded hover:bg-gray-200 transition-colors">
                                <Plus size={12} /> Tambah Baris
                            </button>
                        </div>
                        <div className="space-y-3">
                            {items.map((item, idx) => (
                                <div key={idx} className="bg-black border border-neutral-800 p-3 rounded">
                                    <div className="grid grid-cols-12 gap-2 items-start">
                                        <div className="col-span-12 md:col-span-5">
                                            <input type="text" placeholder="Nama Produk" value={item.name} onChange={e => updateItem(idx, 'name', e.target.value)}
                                                className="w-full bg-neutral-900 border border-neutral-800 text-white p-2 outline-none focus:border-neutral-600 text-sm mb-1" />
                                            <input type="text" placeholder="Spesifikasi (opsional)" value={item.spec} onChange={e => updateItem(idx, 'spec', e.target.value)}
                                                className="w-full bg-neutral-900 border border-neutral-800 text-neutral-400 p-2 outline-none focus:border-neutral-600 text-xs" />
                                        </div>
                                        <div className="col-span-4 md:col-span-2">
                                            <label className="text-neutral-600 text-[9px] block mb-1">QTY</label>
                                            <input type="number" min="1" value={item.qty} onChange={e => updateItem(idx, 'qty', e.target.value)}
                                                className="w-full bg-neutral-900 border border-neutral-800 text-white p-2 outline-none focus:border-neutral-600 text-sm text-center" />
                                        </div>
                                        <div className="col-span-4 md:col-span-2">
                                            <label className="text-neutral-600 text-[9px] block mb-1">HARGA</label>
                                            <input type="number" min="0" value={item.price} onChange={e => updateItem(idx, 'price', e.target.value)}
                                                className="w-full bg-neutral-900 border border-neutral-800 text-white p-2 outline-none focus:border-neutral-600 text-sm text-right" />
                                        </div>
                                        <div className="col-span-3 md:col-span-2">
                                            <label className="text-neutral-600 text-[9px] block mb-1">TOTAL</label>
                                            <div className="text-white text-sm font-bold p-2 text-right">
                                                {formatRp((Number(item.qty) || 0) * (Number(item.price) || 0))}
                                            </div>
                                        </div>
                                        <div className="col-span-1 flex items-center justify-center pt-3">
                                            {items.length > 1 && (
                                                <button onClick={() => removeItem(idx)} className="text-red-500 hover:text-red-400 transition-colors">
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Upload Desain Jersey */}
                    <div>
                        <label className="text-neutral-500 text-[10px] uppercase tracking-widest font-bold block mb-2">Upload Desain Jersey</label>
                        <div className="bg-black border border-neutral-800 rounded p-4">
                            <div className="flex flex-wrap gap-3 mb-3">
                                {designImages.map((img, idx) => (
                                    <div key={idx} className="relative group">
                                        <img src={img.preview} alt={`Desain ${idx + 1}`} className="w-24 h-24 object-cover rounded border border-neutral-700" />
                                        <button onClick={() => removeImage(idx)}
                                            className="absolute -top-2 -right-2 w-5 h-5 bg-red-600 text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                                            <X size={12} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <button onClick={() => fileInputRef.current?.click()}
                                className="flex items-center gap-2 px-4 py-2 border border-dashed border-neutral-700 text-neutral-400 hover:text-white hover:border-neutral-500 rounded transition-colors text-xs font-bold uppercase tracking-wider">
                                <Upload size={14} /> Pilih Gambar Desain
                            </button>
                            <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
                            <p className="text-neutral-600 text-[10px] mt-2">Gambar desain akan tampil di bawah tabel produk pada invoice cetak.</p>
                        </div>
                    </div>

                    {/* Financials */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="text-neutral-500 text-[10px] uppercase tracking-widest font-bold block mb-2">Diskon (Rp)</label>
                            <input type="number" min="0" value={discount} onChange={e => setDiscount(e.target.value)}
                                className="w-full bg-black border border-neutral-800 text-white p-3 outline-none focus:border-neutral-600 transition-colors text-sm" />
                        </div>
                        <div>
                            <label className="text-neutral-500 text-[10px] uppercase tracking-widest font-bold block mb-2">Down Payment / DP (Rp)</label>
                            <input type="number" min="0" value={dpAmount} onChange={e => setDpAmount(e.target.value)}
                                className="w-full bg-black border border-neutral-800 text-white p-3 outline-none focus:border-neutral-600 transition-colors text-sm" />
                        </div>
                        <div>
                            <label className="text-neutral-500 text-[10px] uppercase tracking-widest font-bold block mb-2">Status Pembayaran</label>
                            <select value={paymentStatus} onChange={e => setPaymentStatus(e.target.value)}
                                className="w-full bg-black border border-neutral-800 text-white p-3 outline-none focus:border-neutral-600 transition-colors text-sm cursor-pointer">
                                <option value="unpaid">Belum Lunas</option>
                                <option value="paid">Lunas</option>
                            </select>
                        </div>
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="text-neutral-500 text-[10px] uppercase tracking-widest font-bold block mb-2">Catatan (Opsional)</label>
                        <textarea rows={3} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Catatan tambahan untuk invoice..."
                            className="w-full bg-black border border-neutral-800 text-white p-3 outline-none focus:border-neutral-600 transition-colors text-sm resize-none" />
                    </div>

                    {/* Summary */}
                    <div className="bg-black border border-neutral-800 rounded p-4">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-neutral-500 text-sm">Subtotal</span>
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
                                    <span className="text-red-400 font-black">{formatRp(remainingAmount)}</span>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Info */}
                    <div className="bg-blue-900/20 border border-blue-900/50 rounded p-3">
                        <p className="text-blue-400 text-xs">
                            💡 <strong>Simpan</strong> akan menyimpan invoice ke daftar pesanan dan termasuk dalam perhitungan omset dashboard.
                            Status bisa diubah nanti di halaman Pesanan.
                        </p>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-4 border-t border-neutral-800 bg-black shrink-0 flex flex-col sm:flex-row gap-3">
                    <button onClick={onClose} disabled={saving}
                        className="py-3 px-6 border border-neutral-700 text-neutral-400 hover:text-white hover:border-neutral-500 font-bold uppercase tracking-widest text-xs transition-colors">
                        Batal
                    </button>
                    <button onClick={handlePrintInvoice} disabled={saving}
                        className="py-3 px-6 border border-neutral-700 text-neutral-400 hover:text-white hover:border-neutral-500 font-bold uppercase tracking-widest text-xs transition-colors flex items-center justify-center gap-2">
                        <Printer size={14} /> Print Saja
                    </button>
                    <button onClick={handleSave} disabled={saving}
                        className="flex-1 py-3 bg-green-600 text-white font-bold uppercase tracking-widest text-xs hover:bg-green-500 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                        {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                        {saving ? 'Menyimpan...' : 'Simpan ke Pesanan'}
                    </button>
                    <button onClick={handleSaveAndPrint} disabled={saving}
                        className="flex-1 py-3 bg-white text-black font-bold uppercase tracking-widest text-xs hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                        {saving ? <Loader2 size={16} className="animate-spin" /> : <Printer size={16} />}
                        {saving ? 'Menyimpan...' : 'Simpan & Print'}
                    </button>
                </div>
            </div>

            {showPrintModal && (
                <PrintOptionsModal
                    onClose={() => setShowPrintModal(false)}
                    onConfirm={(orientation) => {
                        setShowPrintModal(false);
                        if (!justPrint) {
                            // First, wait for DB save to finish if we are in save & print flow.
                            // However, handleSaveAndPrint handles DB first, then opens print window.
                            // To accommodate orientation choice elegantly, let's open modal before save
                            // We can just execute the actual HTML render here
                        }
                        // For simplicity since all state is local, we just build the HTML
                        confirmPrintInvoice(orientation);
                    }}
                />
            )}
        </div>
    );
}
