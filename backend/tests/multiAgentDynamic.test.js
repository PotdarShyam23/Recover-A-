import test from 'node:test';
import assert from 'node:assert/strict';
import { decideRecoveryStrategy, generateOutreachMessage } from '../src/services/aiService.js';
import { evaluatePolicyGuardrails } from '../src/services/recoveryPolicy.js';

test('AI Strategy Agent - Situational Evaluation (No Hardcoded Amount Thresholds)', async () => {
  // Test Case 1: Initial drop-off scenario
  const context1 = {
    amount: 1200,
    currency: 'INR',
    errorCode: 'BAD_REQUEST_PAYMENT_TIMED_OUT',
    errorDescription: 'User session expired during 3DS',
    customerTier: 'high',
    customerPreferredChannel: 'whatsapp',
    attemptCount: 0,
    messageAttempts: 0,
    voiceAttempts: 0,
    hasActivePromise: false
  };

  const strategy1 = await decideRecoveryStrategy(context1);
  assert.equal(strategy1.isRecoverable, true);
  assert.ok(['whatsapp', 'sms'].includes(strategy1.action));
  assert.ok(strategy1.channelSequence.length > 0);

  // Test Case 2: Fatal Fraud Flag Detection
  const contextFraud = {
    amount: 50000,
    currency: 'INR',
    errorCode: 'BAD_REQUEST_PAYMENT_POSSIBLE_FRAUD',
    errorDescription: 'Card reported stolen by issuing bank',
    customerTier: 'low',
    attemptCount: 0,
    messageAttempts: 0,
    voiceAttempts: 0,
    hasActivePromise: false
  };

  const strategyFraud = await decideRecoveryStrategy(contextFraud);
  assert.equal(strategyFraud.isRecoverable, false);
  assert.equal(strategyFraud.action, 'stop');
});

test('AI Outreach Generator - Personalized Dynamic Copy', async () => {
  const copy = await generateOutreachMessage({
    customerName: 'Aditi Sharma',
    merchantName: 'SaaSify India',
    amount: 5500,
    currency: 'INR',
    channel: 'whatsapp',
    recoveryUrl: 'https://rzp.io/i/rec_test123',
    preferredLanguage: 'hinglish'
  });

  assert.ok(copy.messageText.includes('Aditi Sharma'));
  assert.ok(copy.messageText.includes('5500'));
  assert.ok(copy.messageText.includes('https://rzp.io/i/rec_test123'));
});

test('Policy Guardrails - Anti-spam touch limits', () => {
  const exhaustedCase = {
    amount: 5000,
    attemptCount: 3,
    messageAttempts: 2,
    voiceAttempts: 1,
    createdAt: new Date()
  };

  const guardrailVoice = evaluatePolicyGuardrails(exhaustedCase, 'voice');
  assert.equal(guardrailVoice.approved, false);
  assert.equal(guardrailVoice.fallbackAction, 'stop');
});
