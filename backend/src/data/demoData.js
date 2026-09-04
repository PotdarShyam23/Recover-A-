export const customers = [
  {
    id: 'CUST-1001',
    name: 'Aditi Sharma',
    phone: '+91 98765 43210',
    email: 'aditi.sharma@example.com',
    engagement: 'high',
    payment_history: [5000, 15000, 28000],
    preferred_channel: 'whatsapp'
  },
  {
    id: 'CUST-1002',
    name: 'Rohit Verma',
    phone: '+91 98220 11223',
    email: 'rohit.verma@example.com',
    engagement: 'medium',
    payment_history: [1800, 4200, 9800],
    preferred_channel: 'sms'
  },
  {
    id: 'CUST-1003',
    name: 'Maya Nair',
    phone: '+91 98111 33445',
    email: 'maya.nair@example.com',
    engagement: 'low',
    payment_history: [12000, 7500, 11000],
    preferred_channel: 'email'
  },
  {
    id: 'CUST-1004',
    name: 'Ankit Joshi',
    phone: '+91 99000 11122',
    email: 'ankit.joshi@example.com',
    engagement: 'high',
    payment_history: [2500, 6500, 9000],
    preferred_channel: 'whatsapp'
  },
  {
    id: 'CUST-1005',
    name: 'Neha Iyer',
    phone: '+91 97654 23111',
    email: 'neha.iyer@example.com',
    engagement: 'medium',
    payment_history: [2000, 15000, 5200],
    preferred_channel: 'whatsapp'
  }
];

export const payments = [
  {
    id: 'PAY-5001',
    customer_id: 'CUST-1001',
    amount: 5000,
    status: 'failed',
    created_at: '2026-08-30T12:00:00.000Z',
    subscription_id: 'SUB-2401',
    payment_method: 'UPI'
  },
  {
    id: 'PAY-5002',
    customer_id: 'CUST-1002',
    amount: 1500,
    status: 'failed',
    created_at: '2026-08-31T09:30:00.000Z',
    subscription_id: 'SUB-2402',
    payment_method: 'Credit Card'
  },
  {
    id: 'PAY-5003',
    customer_id: 'CUST-1003',
    amount: 12000,
    status: 'failed',
    created_at: '2026-09-01T13:15:00.000Z',
    subscription_id: 'SUB-2403',
    payment_method: 'Debit Card'
  },
  {
    id: 'PAY-5004',
    customer_id: 'CUST-1004',
    amount: 2500,
    status: 'failed',
    created_at: '2026-09-02T08:45:00.000Z',
    subscription_id: 'SUB-2404',
    payment_method: 'Netbanking'
  },
  {
    id: 'PAY-5005',
    customer_id: 'CUST-1005',
    amount: 2000,
    status: 'failed',
    created_at: '2026-08-29T18:05:00.000Z',
    subscription_id: 'SUB-2405',
    payment_method: 'UPI'
  },
  {
    id: 'PAY-5006',
    customer_id: 'CUST-1001',
    amount: 8200,
    status: 'failed',
    created_at: '2026-08-25T11:20:00.000Z',
    subscription_id: null,
    payment_method: 'Wallet'
  }
];

export const initialRecoveryCases = [
  {
    id: 'RC-1001',
    payment_id: 'PAY-5001',
    customer_id: 'CUST-1001',
    amount: 5000,
    state: 'RECOVERY_PENDING',
    attempt_count: 1,
    next_action: 'retry',
    next_action_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    recovery_score: 0.87,
    max_attempts: 3,
    last_action: 'retry',
    customer_engagement: 'high',
    success_probability: 0.79,
    previous_successful_payment_delay_days: 3,
    previous_recovery_attempts: 1,
    promise: null,
    notification_count: 0,
    voice_attempts: 0,
    message_attempts: 0,
    stop_reason: null
  },
  {
    id: 'RC-1002',
    payment_id: 'PAY-5002',
    customer_id: 'CUST-1002',
    amount: 1500,
    state: 'RECOVERY_PENDING',
    attempt_count: 3,
    next_action: 'stop',
    next_action_at: new Date().toISOString(),
    recovery_score: 0.12,
    max_attempts: 3,
    last_action: 'voice',
    customer_engagement: 'low',
    success_probability: 0.08,
    previous_successful_payment_delay_days: 7,
    previous_recovery_attempts: 3,
    promise: null,
    notification_count: 2,
    voice_attempts: 1,
    message_attempts: 2,
    stop_reason: 'Recovery policy limit reached with no customer engagement.'
  },
  {
    id: 'RC-1003',
    payment_id: 'PAY-5003',
    customer_id: 'CUST-1003',
    amount: 12000,
    state: 'PROMISE_PENDING',
    attempt_count: 2,
    next_action: 'schedule_retry',
    next_action_at: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
    recovery_score: 0.71,
    max_attempts: 3,
    last_action: 'whatsapp',
    customer_engagement: 'medium',
    success_probability: 0.69,
    previous_successful_payment_delay_days: 4,
    previous_recovery_attempts: 2,
    promise: {
      promised_date: '2026-09-04',
      status: 'PENDING',
      confidence: 0.94,
      source: 'customer_message'
    },
    notification_count: 1,
    voice_attempts: 0,
    message_attempts: 1,
    stop_reason: null
  },
  {
    id: 'RC-1004',
    payment_id: 'PAY-5004',
    customer_id: 'CUST-1004',
    amount: 2500,
    state: 'RECOVERY_PENDING',
    attempt_count: 1,
    next_action: 'whatsapp',
    next_action_at: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    recovery_score: 0.79,
    max_attempts: 3,
    last_action: 'retry',
    customer_engagement: 'high',
    success_probability: 0.76,
    previous_successful_payment_delay_days: 2,
    previous_recovery_attempts: 1,
    promise: null,
    notification_count: 0,
    voice_attempts: 0,
    message_attempts: 0,
    stop_reason: null
  },
  {
    id: 'RC-1005',
    payment_id: 'PAY-5005',
    customer_id: 'CUST-1005',
    amount: 2000,
    state: 'RECOVERY_PENDING',
    attempt_count: 2,
    next_action: 'schedule_retry',
    next_action_at: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
    recovery_score: 0.9,
    max_attempts: 3,
    last_action: 'retry',
    customer_engagement: 'medium',
    success_probability: 0.88,
    previous_successful_payment_delay_days: 1,
    previous_recovery_attempts: 2,
    promise: null,
    notification_count: 0,
    voice_attempts: 0,
    message_attempts: 0,
    stop_reason: null
  },
  {
    id: 'RC-1006',
    payment_id: 'PAY-5006',
    customer_id: 'CUST-1001',
    amount: 8200,
    state: 'RECOVERY_PENDING',
    attempt_count: 0,
    next_action: 'retry',
    next_action_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    recovery_score: 0.82,
    max_attempts: 3,
    last_action: 'payment_at_risk',
    customer_engagement: 'high',
    success_probability: 0.81,
    previous_successful_payment_delay_days: 3,
    previous_recovery_attempts: 0,
    promise: null,
    notification_count: 0,
    voice_attempts: 0,
    message_attempts: 0,
    stop_reason: null
  }
];

export const auditTrail = [];
