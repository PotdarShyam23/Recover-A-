import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'crypto';
import razorpayProvider from '../src/adapters/payment/razorpayProvider.js';
import ingestionService from '../src/services/ingestionService.js';

test('RazorpayProvider - HMAC Signature Verification', () => {
  const secret = 'test_webhook_secret_key_123';
  const payload = { event: 'payment.failed', id: 'evt_12345' };
  const rawBody = JSON.stringify(payload);

  const validSignature = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
  const invalidSignature = 'invalid_tampered_signature';

  assert.equal(razorpayProvider.verifyWebhookSignature(rawBody, validSignature, secret), true);
  assert.equal(razorpayProvider.verifyWebhookSignature(rawBody, invalidSignature, secret), false);
});

test('RazorpayProvider - Event Normalization', () => {
  const razorpayPayload = {
    event: 'payment.failed',
    id: 'evt_rzp_98765',
    payload: {
      payment: {
        entity: {
          id: 'pay_ABC123',
          amount: 750000, // 7500 INR in paise
          currency: 'INR',
          method: 'upi',
          contact: '+919876543210',
          email: 'aditi.sharma@example.com',
          error_code: 'BAD_REQUEST_PAYMENT_TIMED_OUT',
          error_description: 'Customer timed out during UPI 2FA authorization',
          error_source: 'customer',
          error_step: 'payment_authorization',
          error_reason: 'payment_cancelled'
        }
      }
    }
  };

  const normalized = razorpayProvider.normalizeWebhook(razorpayPayload);

  assert.equal(normalized.eventType, 'payment.failed');
  assert.equal(normalized.paymentId, 'pay_ABC123');
  assert.equal(normalized.amount, 7500);
  assert.equal(normalized.error.code, 'BAD_REQUEST_PAYMENT_TIMED_OUT');
  assert.equal(normalized.paymentMethod, 'upi');
});

test('IngestionService - Idempotency Prevention', async () => {
  const secret = 'test_recoverai_secret_12345';
  const eventId = `evt_idemp_${Date.now()}`;
  const payload = {
    event: 'payment.failed',
    id: eventId,
    payload: {
      payment: {
        entity: {
          id: `pay_idemp_${Date.now()}`,
          amount: 500000,
          currency: 'INR',
          contact: '+919876543210',
          email: 'aditi.sharma@example.com'
        }
      }
    }
  };

  const signature = crypto.createHmac('sha256', secret).update(JSON.stringify(payload)).digest('hex');

  // First ingestion
  const res1 = await ingestionService.handleRazorpayWebhook(payload, signature, secret);
  assert.equal(res1.status, 'processed');

  // Second ingestion with duplicate event ID
  const res2 = await ingestionService.handleRazorpayWebhook(payload, signature, secret);
  assert.equal(res2.status, 'duplicate');
});
