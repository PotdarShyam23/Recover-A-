import crypto from 'crypto';

export class RazorpayProvider {
  constructor(config = {}) {
    this.keyId = config.keyId || process.env.RAZORPAY_KEY_ID || '';
    this.keySecret = config.keySecret || process.env.RAZORPAY_KEY_SECRET || '';
    this.webhookSecret = config.webhookSecret || process.env.RAZORPAY_WEBHOOK_SECRET || 'test_recoverai_secret_12345';
  }

  /**
   * Verifies the cryptographic HMAC SHA-256 signature sent in x-razorpay-signature header
   */
  verifyWebhookSignature(rawBody, signature, secret = this.webhookSecret) {
    if (!signature || !secret) {
      return false;
    }
    try {
      const payloadString = typeof rawBody === 'string' ? rawBody : JSON.stringify(rawBody);
      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(payloadString)
        .digest('hex');

      // Timing-safe comparison to prevent timing attacks
      const sigBuffer = Buffer.from(signature, 'utf8');
      const expectedBuffer = Buffer.from(expectedSignature, 'utf8');
      if (sigBuffer.length !== expectedBuffer.length) {
        return false;
      }
      return crypto.timingSafeEqual(sigBuffer, expectedBuffer);
    } catch (err) {
      return false;
    }
  }

  /**
   * Normalizes Razorpay webhook payload into standard RecoverAI PaymentEvent structure
   */
  normalizeWebhook(payload = {}) {
    const eventType = payload.event || 'payment.failed';
    const paymentEntity = payload.payload?.payment?.entity || payload.payment || {};
    const orderEntity = payload.payload?.order?.entity || payload.order || {};

    const paymentId = paymentEntity.id || `pay_mock_${Date.now()}`;
    const orderId = paymentEntity.order_id || orderEntity.id || `order_mock_${Date.now()}`;
    const amount = Number(paymentEntity.amount ? paymentEntity.amount / 100 : paymentEntity.amount_in_rupees || 5000);
    const currency = paymentEntity.currency || 'INR';
    
    // Technical Gateway decline details
    const errorCode = paymentEntity.error_code || 'GATEWAY_ERROR';
    const errorDescription = paymentEntity.error_description || 'Payment could not be completed';
    const errorSource = paymentEntity.error_source || 'customer';
    const errorStep = paymentEntity.error_step || 'payment_authorization';
    const errorReason = paymentEntity.error_reason || 'payment_failed';

    const customerEmail = paymentEntity.email || 'customer@example.com';
    const customerContact = paymentEntity.contact || '+919876543210';
    const paymentMethod = paymentEntity.method || 'upi';

    return {
      eventId: payload.id || `evt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      eventType,
      provider: 'razorpay',
      paymentId,
      orderId,
      amount,
      currency,
      paymentMethod,
      customer: {
        email: customerEmail,
        contact: customerContact
      },
      error: {
        code: errorCode,
        description: errorDescription,
        source: errorSource,
        step: errorStep,
        reason: errorReason
      },
      rawPayload: payload
    };
  }

  /**
   * Generates a 1-click Razorpay payment recovery link
   */
  async createRecoveryPaymentLink({ caseId, customerName, amount, currency = 'INR', customerPhone, customerEmail }) {
    const shortCode = Math.random().toString(36).substring(2, 9);
    const linkId = `plink_${shortCode}`;
    const paymentUrl = `https://rzp.io/i/rec_${shortCode}`;

    // If real Razorpay credentials exist, live Razorpay Links API could be invoked here.
    // For test/sandbox, we return a realistic Razorpay recovery link object.
    return {
      id: linkId,
      shortUrl: paymentUrl,
      amount,
      currency,
      status: 'created',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    };
  }
}

export default new RazorpayProvider();
