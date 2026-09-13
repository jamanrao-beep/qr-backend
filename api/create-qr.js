const Razorpay = require('razorpay');

module.exports = async (req, res) => {
  // Enable CORS so your Shopify storefront can call this endpoint
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const key_id = process.env.RAZORPAY_KEY_ID || 'rzp_live_TbUpTqhis2nrpg';
    const key_secret = process.env.RAZORPAY_KEY_SECRET;

    if (!key_secret) {
      return res.status(500).json({
        error: 'RAZORPAY_KEY_SECRET is not configured in environment variables.'
      });
    }

    const instance = new Razorpay({
      key_id: key_id,
      key_secret: key_secret
    });

    const { amount, receipt, notes } = req.body;

    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      return res.status(400).json({ error: 'Valid amount is required (in INR)' });
    }

    // Convert INR to Paise (e.g., ₹1299 -> 129900 paise)
    const amountInPaise = Math.round(Number(amount) * 100);

    // 1. Create Order
    const orderOptions = {
      amount: amountInPaise,
      currency: 'INR',
      receipt: receipt || `order_rcptid_${Date.now()}`,
      notes: notes || {}
    };

    const order = await instance.orders.create(orderOptions);

    // 2. Generate UPI QR Code tied to this exact order
    const qrOptions = {
      type: 'upi_qr',
      name: 'Atara Men',
      usage: 'single_use',
      fixed_amount: true,
      payment_amount: amountInPaise,
      description: `Payment for Order #${order.id}`,
      customer_id: notes && notes.customer_id ? notes.customer_id : undefined,
      notes: {
        order_id: order.id,
        ...(notes || {})
      }
    };

    // Call Razorpay QR Code API
    const qrCode = await instance.qrCode.create(qrOptions);

    return res.status(200).json({
      success: true,
      order_id: order.id,
      qr_id: qrCode.id,
      image_url: qrCode.image_url,
      amount: amount,
      currency: 'INR'
    });
  } catch (error) {
    console.error('Error creating Razorpay QR code:', error);
    return res.status(500).json({
      error: error.message || 'Failed to create QR code'
    });
  }
};
