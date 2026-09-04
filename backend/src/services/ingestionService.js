import { dbStore } from '../db/store.js';
import razorpayProvider from '../adapters/payment/razorpayProvider.js';
import recoveryEngine from './recoveryEngine.js';

export class IngestionService {
  /**
   * Ingests a raw Razorpay webhook payload, verifies HMAC, deduplicates, and triggers recovery
   */

  // info will be get by the webhook of razorpay from apiroutes.js
  async handleRazorpayWebhook(rawBody, signature, secret) {
    // 1. Verify signature
    const isValid = razorpayProvider.verifyWebhookSignature(rawBody, signature, secret);
    if (!isValid && process.env.NODE_ENV === 'production') {
      const err = new Error('Invalid Razorpay webhook signature');
      err.status = 401;//(unauthorised)
      throw err;
    }

    // 2. Normalize event
    const normalized = razorpayProvider.normalizeWebhook(rawBody);

    // 3. Idempotency check in database

    //Idempotency 0 duplicates
    const existing = await dbStore.findEventByEventId(normalized.eventId);
    if (existing) {
      return { status: 'duplicate', message: 'Event already processed', eventId: normalized.eventId };
    }

    // 4. Save raw event for auditability

    // saving all the data
    const merchant = await dbStore.getMerchant();
    await dbStore.savePaymentEvent({
      id: `pevt_${Date.now()}`,
      eventId: normalized.eventId,
      merchantId: merchant ? merchant.id : 'mer_default_101',
      eventType: normalized.eventType,
      provider: 'razorpay',
      paymentId: normalized.paymentId,
      orderId: normalized.orderId,
      customerId: normalized.customer?.contact || normalized.customer?.email,
      amount: normalized.amount,
      currency: normalized.currency,
      paymentMethod: normalized.paymentMethod,
      errorCode: normalized.error?.code,
      errorDescription: normalized.error?.description,
      errorSource: normalized.error?.source,
      errorStep: normalized.error?.step,
      errorReason: normalized.error?.reason,
      rawPayload: rawBody
    });

    // 5. Route event by type

    // ivoke specific route by the eventType
    if (normalized.eventType === 'payment.failed') {
      const result = await recoveryEngine.processFailedPayment(normalized);
      return { status: 'processed', eventType: normalized.eventType, result };
    }

    if (normalized.eventType === 'payment.captured' || normalized.eventType === 'order.paid') {
      const result = await recoveryEngine.processPaymentCaptured(normalized);
      return { status: 'processed', eventType: normalized.eventType, result };
    }

    return { status: 'ignored', eventType: normalized.eventType, message: 'Non-recovery event' };
  }
}

export default new IngestionService();
