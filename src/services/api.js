import { supabase } from '../supabase';

// ─── CLIENT API ───────────────────────────────────────────────────

/**
 * Registrasi/Login Client
 * Mencari client berdasarkan email. Jika ada, return data.
 * Jika tidak ada, insert data baru dan return data.
 */
export const registerOrLoginClient = async (clientData) => {
    // 1. Coba cari klien berdasarkan email
    const { data: existingClient, error: fetchError } = await supabase
        .from('clients')
        .select('*')
        .eq('email', clientData.email)
        .maybeSingle();

    if (fetchError) {
        console.error('Error mengecek client:', fetchError);
        throw new Error('Gagal memeriksa data klien: ' + fetchError.message);
    }

    if (existingClient) {
        return existingClient;
    }

    // 2. Jika belum ada, buat baru
    const { data: newClient, error: insertError } = await supabase
        .from('clients')
        .insert([{
            name: clientData.name,
            email: clientData.email,
            phone: clientData.phone
        }])
        .select()
        .single();

    if (insertError) {
        console.error('Error membuat client baru:', insertError);
        throw new Error('Gagal mendaftar. Pastikan format email benar. Error: ' + insertError.message);
    }

    return newClient;
};

/**
 * Buat pesanan baru beserta invoisnya
 */
export const createOrderWithInvoice = async (orderData) => {
    // Generate order code unik
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderCode = `ORD-${dateStr}-${randomSuffix}`;

    // Set status
    const status = 'pending';

    // 1. Insert Order
    // Extra columns for Phase 2: dp_amount, remaining_amount, sizes, design_urls, logo_urls
    const { data: newOrder, error: orderError } = await supabase
        .from('orders')
        .insert([{
            ...orderData,
            order_code: orderCode,
            status: 'pending_payment' // default new flow
        }])
        .select()
        .single();

    if (orderError) {
        console.error('Error insert order:', orderError);
        throw new Error('Gagal membuat pesanan: ' + orderError.message);
    }

    // Generate invoice number
    const invNumber = `INV-${dateStr.slice(0, 6)}-${randomSuffix}`;

    // 2. Insert Invoice (Tagihan yang tercetak adalah tagihan keseluruhan, namun bayar awal = DP)
    const invoiceData = {
        order_id: newOrder.id,
        invoice_number: invNumber,
        subtotal: orderData.total_price,
        discount: 0,
        grand_total: orderData.total_price,
        payment_status: 'unpaid'
    };

    const { data: newInvoice, error: invError } = await supabase
        .from('invoices')
        .insert([invoiceData])
        .select()
        .single();

    if (invError) {
        console.error('Error insert invoice:', invError);
        // Pertimbangkan rollback/delete order jika ini bukan MVP
        throw new Error('Pesanan dibuat tapi gagal menerbitkan Invoice.');
    }

    return { order: newOrder, invoice: newInvoice };
};

/**
 * Ambil riwayat pesanan klien
 */
export const getClientOrders = async (clientId) => {
    const { data, error } = await supabase
        .from('orders')
        .select(`
            *,
            invoices (*)
        `)
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching client orders:', error);
        throw new Error('Gagal memuat riwayat pesanan.');
    }

    return data;
};

// ─── ADMIN API ────────────────────────────────────────────────────

/**
 * Ambil semua pesanan untuk dashboard admin
 */
export const getAllOrdersAdmin = async () => {
    const { data, error } = await supabase
        .from('orders')
        .select(`
            *,
            clients (name, email, phone),
            invoices (*)
        `)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching all orders:', error);
        throw new Error('Gagal memuat data pesanan.');
    }

    return data;
};

/**
 * Update status pesanan (Admin)
 */
export const updateOrderStatus = async (orderId, newStatus) => {
    const { data, error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId)
        .select()
        .single();

    if (error) {
        console.error('Error updating order status:', error);
        throw new Error('Gagal mengupdate status pesanan.');
    }

    return data;
};
