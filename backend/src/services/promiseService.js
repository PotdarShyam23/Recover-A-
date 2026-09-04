import { PROMISE_STATES } from '../config/constants.js';


// all the info will be extraxted by the response if ther ei spromise it will saved in the DB 

export function parseCustomerPromise(responseText) {
  const lower = (responseText || '').toLowerCase();

  if (lower.includes('cancel') || lower.includes('not continue') || lower.includes('unsubscribe')) {
    return {
      intent: 'cancel_subscription',
      confidence: 0.96,
      promised_date: null
    };
  }

  const dateMatch = responseText.match(/(\d{4}-\d{2}-\d{2}|\d{1,2}\s+(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*)/i);
  if (dateMatch) {
    const raw = dateMatch[1];
    let iso = raw;

    if (!raw.includes('-')) {
      const parsed = new Date(raw);
      iso = parsed.toISOString().slice(0, 10);
    }

    return {
      intent: 'promise_to_pay',
      promised_date: iso,
      confidence: 0.94
    };
  }

  if (lower.includes('salary') || lower.includes('friday') || lower.includes('monday') || lower.includes('tomorrow') || lower.includes('next')) {
    return {
      intent: 'promise_to_pay',
      promised_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      confidence: 0.88
    };
  }

  return {
    intent: 'unknown',
    confidence: 0.5,
    promised_date: null
  };
}

// saving everything in DB
export function createPromise(caseRecord, parsed) {
  return {
    id: `PROM-${Date.now()}`,
    customer_id: caseRecord.customer_id,
    payment_id: caseRecord.payment_id,
    promised_date: parsed.promised_date || null,
    status: PROMISE_STATES.PENDING,
    confidence: parsed.confidence,
    source: 'customer_response',
    created_at: new Date().toISOString()
  };
}
