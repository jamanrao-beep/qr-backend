const Razorpay = require('razorpay');

module.exports = async (req, res) => {
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

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const key_id = process.env.RAZORPAY_KEY_ID || 'rzp_live_TbUpTqhis2nrpg';
    const key_secret = process.env.RAZORPAY_KEY_SECRET;

    if (!key_secret) {
      return res.status(500).json({
        error: 'RAZORPAY_KEY_SECRET is not configured.'
      });
    }

    const { qr_id, order_id } = req.query;

    if (!qr_id && !order_id) {
      return res.status(400).json({ error: 'qr_id or order_id is required' });
    }

    const instance = new Razorpay({
      key_id: key_id,
      key_secret: key_secret
    });

    if (qr_id) {
      const qrData = await instance.qrCode.fetch(qr_id);
      
      // QR status can be 'active', 'closed', etc.
      // If payments have been received for this QR:
      const payments = await instance.qrCode.fetchAllPayments(qr_id);
      
      const successfulPayment = payments && payments.items && payments.items.find(p => p.status === 'captured');

      return res.status(200).json({
        success: true,
        is_paid: !!successfulPayment,
        payment_id: successfulPayment ? successfulPayment.id : null,
        status: successfulPayment ? 'paid' : qrData.status
      });
    } else if (order_id) {
      const orderPayments = await instance.orders.fetchPayments(order_id);
      const successfulPayment = orderPayments && orderPayments.items && orderPayments.items.find(p => p.status === 'captured');

      return res.status(200).json({
        success: true,
        is_paid: !!successfulPayment,
        payment_id: successfulPayment ? successfulPayment.id : null,
        status: successfulPayment ? 'paid' : 'unpaid'
      });
    }
  } catch (error) {
    console.error('Error checking payment status:', error);
    return res.status(500).json({
      error: error.message || 'Failed to check status'
    });
  }
};
