import express from 'express';
import crypto from 'crypto';
import { dbStore } from '../db/store.js';
import ingestionService from '../services/ingestionService.js';
import recoveryEngine from '../services/recoveryEngine.js';
import analyticsService from '../services/analyticsService.js';
import razorpayProvider from '../adapters/payment/razorpayProvider.js';

const router = express.Router();

/**
 * 1. Health check & System Status
 */

// just systemn check
router.get('/health', async (req, res) => {
  const merchant = await dbStore.getMerchant();
  res.json({
    status: 'ok',
    system: 'RecoverAI Revenue Recovery Engine (MERN)',
    merchant: merchant ? merchant.name : 'Configured',
    timestamp: new Date().toISOString()
  });
});

/**
 * 2. Razorpay Webhook Ingestion Endpoint
 */

// fake webhook took the sign send the body signature secret to ingestion
router.post('/webhooks/razorpay', async (req, res) => {
  try {
    const signature = req.headers['x-razorpay-signature'] || req.headers['x-test-signature'];
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET || 'test_recoverai_secret_12345';
    
    const result = await ingestionService.handleRazorpayWebhook(req.body, signature, secret);
    res.json({ ok: true, result });
  } catch (error) {
    console.error('Webhook processing error:', error.message);
    res.status(error.status || 500).json({ ok: false, error: error.message });
  }
});

/**
 * 3. Recovery Cases List & Detail
 */

// all the recovery cases 
router.get('/recovery-cases', async (req, res) => {
  // status contains everything

  const { status } = req.query;
  // get all cases if it have 
  const cases = await dbStore.getAllCases(status ? { status } : {});
  res.json(cases);
});
// specefic person

router.get('/recovery-cases/:id', async (req, res) => {
  // fecth that id
  const caseRecord = await dbStore.getCaseById(req.params.id);
  // not found
  if (!caseRecord) return res.status(404).json({ error: 'Case not found' });
// found submit
  const [customer, communications, promise, auditLogs] = await Promise.all([
    dbStore.getCustomer(caseRecord.customerId),
    dbStore.getCommunicationsForCase(caseRecord.id),
    dbStore.getPromiseForCase(caseRecord.id),
    dbStore.getAuditLogs({ caseId: caseRecord.id })
  ]);

  res.json({
    ...caseRecord,
    customer,
    communications,
    promise,
    auditLogs
  });
});

/**
 * 4. Case Actions (Outreach, Voice Agent, Promise Capture)
 */

// it just a reoutr for whatsapp
router.post('/recovery-cases/:id/message', async (req, res) => {
  try {
    const caseRecord = await dbStore.getCaseById(req.params.id);
    if (!caseRecord) return res.status(404).json({ error: 'Case not found' });

    const customer = await dbStore.getCustomer(caseRecord.customerId);
    const channel = req.body.channel || 'whatsapp';
    const result = await recoveryEngine.executeOutreach(caseRecord, customer, channel);

    res.json({ ok: true, result, case: caseRecord });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// route for voice


router.post('/recovery-cases/:id/voice', async (req, res) => {
  try {
    const caseRecord = await dbStore.getCaseById(req.params.id);
    if (!caseRecord) return res.status(404).json({ error: 'Case not found' });

    const customer = await dbStore.getCustomer(caseRecord.customerId);
    const userResponseSimulation = req.body.response || null;
    const result = await recoveryEngine.executeHinglishVoiceCall(caseRecord, customer, userResponseSimulation);

    res.json({ ok: true, result, case: caseRecord });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// fake customer response for just check working model as i did not telecom gateway thats why
router.post('/recovery-cases/:id/customer-reply', async (req, res) => {
  try {
    const { replyText } = req.body;
    const result = await recoveryEngine.processCustomerReply(req.params.id, replyText || 'Friday ko salary aayegi tab kar dunga');
    res.json({ ok: true, result });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Natural Indian Voice Audio Streaming (High-Quality MP3, No Robotic Voice)
router.get('/voice/tts', async (req, res) => {
  try {
    const text = req.query.text || 'Namaste ji';
    const lang = req.query.lang || 'hi';
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=${lang}&q=${encodeURIComponent(text.slice(0, 200))}`;
    const upstream = await fetch(url);
    if (!upstream.ok) return res.status(upstream.status).send('TTS error');
    res.set('Content-Type', 'audio/mpeg');
    const buffer = Buffer.from(await upstream.arrayBuffer());
    res.send(buffer);
  } catch (err) {
    res.status(500).send(err.message);
  }
});
// for simualtion 
router.post('/recovery-cases/:id/simulate-success', async (req, res) => {
  try {
    const caseRecord = await dbStore.getCaseById(req.params.id);
    if (!caseRecord) return res.status(404).json({ error: 'Case not found' });

    const result = await recoveryEngine.processPaymentCaptured({
      paymentId: caseRecord.paymentId,
      amount: caseRecord.amount
    });

    res.json({ ok: true, result, case: await dbStore.getCaseById(req.params.id) });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

/**
 * 5. Promises, Metrics, and Audit
 */

// promise to pay data
router.get('/promises', async (req, res) => {
  const promises = await dbStore.getAllPromises();
  res.json(promises);
});
// metrics data
router.get('/metrics', async (req, res) => {
  const metrics = await analyticsService.getOverviewMetrics();
  res.json(metrics);
});
// audit data
router.get('/audit', async (req, res) => {
  const logs = await dbStore.getAuditLogs();
  res.json(logs);
});

/**
 * 6. Test Lab / Webhook Simulator Scenarios
 */

// facke type scenario 

// UPI drom bad payment gateway
// send wp mssg directly 
router.get('/simulator/scenarios', (req, res) => {
  res.json([
    {
      id: 'drop_off_upi',
      name: 'UPI Drop-off / 3DS Timeout (High Intent)',
      description: 'Customer abandoned OTP screen during UPI payment. Recoverable with direct 1-click WhatsApp recovery link.',
      payload: {
        event: 'payment.failed',
        id: `evt_test_${Date.now()}`,
        payload: {
          payment: {
            entity: {
              id: `pay_drop_${Date.now().toString().slice(-4)}`,
              amount: 550000, // ₹5,500
              currency: 'INR',
              method: 'upi',
              contact: '+919876543210',
              email: 'aditi.sharma@example.com',
              error_code: 'BAD_REQUEST_PAYMENT_TIMED_OUT',
              error_description: 'User timed out during 3DS / UPI pin authorization',
              error_source: 'customer',
              error_step: 'payment_authorization',
              error_reason: 'payment_cancelled'
            }
          }
        }
      }
    },
    {
      // not fund call the agent promise to apy tracker
      id: 'insufficient_funds_voice',
      name: 'Insufficient Balance (Voice Agent Escalation)',
      description: 'Card charge declined for insufficient balance. Triggers Hinglish Voice Agent to capture promise-to-pay date.',
      payload: {
        event: 'payment.failed',
        id: `evt_test_${Date.now()}`,
        payload: {
          payment: {
            entity: {
              id: `pay_insuf_${Date.now().toString().slice(-4)}`,
              amount: 1400000, // ₹14,000
              currency: 'INR',
              method: 'card',
              contact: '+919822011223',
              email: 'rohit.verma@example.com',
              error_code: 'BAD_REQUEST_PAYMENT_ACCOUNT_INSUFFICIENT_BALANCE',
              error_description: 'Account balance insufficient to complete subscription payment',
              error_source: 'bank',
              error_step: 'payment_authorization',
              error_reason: 'payment_declined'
            }
          }
        }
      }
    },
    {
      // fraud stop the recovery model 

      id: 'stolen_card_fraud',
      name: 'Suspected Fraud / Stolen Card (Unrecoverable)',
      description: 'Bank flagged card as stolen. RecoverAI immediately classifies as UNRECOVERABLE to protect the merchant.',
      payload: {
        event: 'payment.failed',
        id: `evt_test_${Date.now()}`,
        payload: {
          payment: {
            entity: {
              id: `pay_fraud_${Date.now().toString().slice(-4)}`,
              amount: 2500000, // ₹25,000
              currency: 'INR',
              method: 'card',
              contact: '+919811133445',
              email: 'maya.nair@example.com',
              error_code: 'BAD_REQUEST_PAYMENT_POSSIBLE_FRAUD',
              error_description: 'Card reported stolen or flagged with high fraud risk',
              error_source: 'gateway',
              error_step: 'risk_check',
              error_reason: 'fraud_flag'
            }
          }
        }
      }
    }
  ]);
});

// now for both data sharing from razorpay to merchant DB passwoerd sent
router.post('/simulator/trigger-webhook', async (req, res) => {
  try {
    const payload = req.body;
    // took the webhook secret from rhe razorpay 
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET || 'test_recoverai_secret_12345';
    // Generate valid HMAC signature for the test payload

    // hashing password genrated scret + hash convet into json then convert to hexadecinal
    const signature = crypto.createHmac('sha256', secret).update(JSON.stringify(payload)).digest('hex');
    // sent to ingestion layer 
    const result = await ingestionService.handleRazorpayWebhook(payload, signature, secret);
    res.json({ ok: true, signatureGenerated: signature, result });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

export default router;
