
import { isDbConnected } from './connection.js';
import Merchant from '../models/Merchant.js';
import Customer from '../models/Customer.js';
import PaymentEvent from '../models/PaymentEvent.js';
import RecoveryCase from '../models/RecoveryCase.js';
import CommunicationLog from '../models/CommunicationLog.js';
import PromiseRecord from '../models/Promise.js';
import AuditLog from '../models/AuditLog.js';

// In-Memory Fallback Container (used when MONGODB_URI has not yet been set)
const memStore = {
  merchants: new Map(),
  customers: new Map(),
  paymentEvents: new Map(),
  recoveryCases: new Map(),
  communicationLogs: new Map(),
  promises: new Map(),
  auditLogs: []
};

// Seed baseline demo data into in-memory store and/or MongoDB
export async function seedInitialData() {
  const defaultMerchant = {
    id: 'mer_default_101',
    name: 'SaaSify India Technologies',
    email: 'billing@saasify.in',
    webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET || 'test_recoverai_secret_12345',
    razorpayKeyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_recoverai',
    razorpayKeySecret: process.env.RAZORPAY_KEY_SECRET || 'rzp_secret_dummy',
    settings: {
      maxRetries: 3,
      maxWhatsAppAttempts: 2,
      maxVoiceAttempts: 1,
      quietHoursStart: 21,
      quietHoursEnd: 9,
      preferredVoiceLanguage: 'hinglish'
    }
  };

  const initialCustomers = [
    {
      id: 'CUST-1001',
      merchantId: 'mer_default_101',
      name: 'Aditi Sharma',
      phone: '+91 98765 43210',
      email: 'aditi.sharma@example.com',
      preferredLanguage: 'hinglish',
      engagement: 'high',
      paymentHistory: [5000, 15000, 28000],
      preferredChannel: 'whatsapp',
      totalSpent: 48000
    },
    {
      id: 'CUST-1002',
      merchantId: 'mer_default_101',
      name: 'Rohit Verma',
      phone: '+91 98220 11223',
      email: 'rohit.verma@example.com',
      preferredLanguage: 'hinglish',
      engagement: 'medium',
      paymentHistory: [1800, 4200, 9800],
      preferredChannel: 'sms',
      totalSpent: 15800
    },
    {
      id: 'CUST-1003',
      merchantId: 'mer_default_101',
      name: 'Maya Nair',
      phone: '+91 98111 33445',
      email: 'maya.nair@example.com',
      preferredLanguage: 'english',
      engagement: 'low',
      paymentHistory: [12000, 7500, 11000],
      preferredChannel: 'email',
      totalSpent: 30500
    },
    {
      id: 'CUST-1004',
      merchantId: 'mer_default_101',
      name: 'Ankit Joshi',
      phone: '+91 99000 11122',
      email: 'ankit.joshi@example.com',
      preferredLanguage: 'hinglish',
      engagement: 'high',
      paymentHistory: [2500, 6500, 9000],
      preferredChannel: 'whatsapp',
      totalSpent: 18000
    }
  ];

  // Seed memory store
  memStore.merchants.set(defaultMerchant.id, { ...defaultMerchant, createdAt: new Date() });
  for (const c of initialCustomers) {
    memStore.customers.set(c.id, { ...c, createdAt: new Date() });
  }

  // Seed MongoDB if connected
  if (isDbConnected()) {
    try {
      await Merchant.findOneAndUpdate(
        { id: defaultMerchant.id },
        defaultMerchant,
        { upsert: true, new: true }
      );
      for (const c of initialCustomers) {
        await Customer.findOneAndUpdate(
          { id: c.id },
          c,
          { upsert: true, new: true }
        );
      }
      console.log('✅ [Database] Initialized default merchant & customers in MongoDB.');
    } catch (err) {
      console.warn('⚠️ [Database] Seed sync notice:', err.message);
    }
  }
}

// Unified Store Accessors
export const dbStore = {
  // Merchant
  async getMerchant(id = 'mer_default_101') {
    if (isDbConnected()) {
      return await Merchant.findOne({ id }).lean();
    }
    return memStore.merchants.get(id) || null;
  },

  // Customer
  async getCustomer(id) {
    if (isDbConnected()) {
      return await Customer.findOne({ id }).lean();
    }
    return memStore.customers.get(id) || null;
  },

  async getAllCustomers() {
    if (isDbConnected()) {
      return await Customer.find({}).lean();
    }
    return Array.from(memStore.customers.values());
  },

  async saveCustomer(customerData) {
    if (isDbConnected()) {
      return await Customer.findOneAndUpdate(
        { id: customerData.id },
        customerData,
        { upsert: true, new: true }
      ).lean();
    }
    memStore.customers.set(customerData.id, { ...customerData, createdAt: new Date() });
    return customerData;
  },

  // Payment Events
  async findEventByEventId(eventId) {
    if (isDbConnected()) {
      return await PaymentEvent.findOne({ eventId }).lean();
    }
    return memStore.paymentEvents.get(eventId) || null;
  },

  async savePaymentEvent(eventData) {
    if (isDbConnected()) {
      const doc = new PaymentEvent(eventData);
      return await doc.save();
    }
    memStore.paymentEvents.set(eventData.eventId, { ...eventData, receivedAt: new Date() });
    return eventData;
  },

  // Recovery Cases
  async getCaseById(id) {
    if (isDbConnected()) {
      return await RecoveryCase.findOne({ id }).lean();
    }
    return memStore.recoveryCases.get(id) || null;
  },

  async findCaseByPaymentId(paymentId) {
    if (isDbConnected()) {
      return await RecoveryCase.findOne({ paymentId }).lean();
    }
    for (const c of memStore.recoveryCases.values()) {
      if (c.paymentId === paymentId) return c;
    }
    return null;
  },

  async findCaseByRecoveryLinkId(recoveryLinkId) {
    if (isDbConnected()) {
      return await RecoveryCase.findOne({ recoveryLinkId }).lean();
    }
    for (const c of memStore.recoveryCases.values()) {
      if (c.recoveryLinkId === recoveryLinkId) return c;
    }
    return null;
  },

  async getAllCases(filter = {}) {
    if (isDbConnected()) {
      const query = {};
      if (filter.status) query.status = filter.status;
      return await RecoveryCase.find(query).sort({ createdAt: -1 }).lean();
    }
    let list = Array.from(memStore.recoveryCases.values());
    if (filter.status) {
      list = list.filter(c => c.status === filter.status);
    }
    return list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  async saveCase(caseData) {
    if (isDbConnected()) {
      return await RecoveryCase.findOneAndUpdate(
        { id: caseData.id },
        caseData,
        { upsert: true, new: true }
      ).lean();
    }
    const existing = memStore.recoveryCases.get(caseData.id) || {};
    const updated = {
      ...existing,
      ...caseData,
      createdAt: existing.createdAt || new Date(),
      updatedAt: new Date()
    };
    memStore.recoveryCases.set(caseData.id, updated);
    return updated;
  },

  // Communication Logs
  async logCommunication(logData) {
    if (isDbConnected()) {
      const doc = new CommunicationLog(logData);
      return await doc.save();
    }
    memStore.communicationLogs.set(logData.id, { ...logData, createdAt: new Date() });
    return logData;
  },

  async getCommunicationsForCase(caseId) {
    if (isDbConnected()) {
      return await CommunicationLog.find({ caseId }).sort({ createdAt: 1 }).lean();
    }
    return Array.from(memStore.communicationLogs.values())
      .filter(l => l.caseId === caseId)
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  },

  // Promises
  async savePromise(promiseData) {
    if (isDbConnected()) {
      return await PromiseRecord.findOneAndUpdate(
        { id: promiseData.id },
        promiseData,
        { upsert: true, new: true }
      ).lean();
    }
    memStore.promises.set(promiseData.id, { ...promiseData, createdAt: new Date(), updatedAt: new Date() });
    return promiseData;
  },

  async getAllPromises() {
    if (isDbConnected()) {
      return await PromiseRecord.find({}).sort({ createdAt: -1 }).lean();
    }
    return Array.from(memStore.promises.values()).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  async getPromiseForCase(caseId) {
    if (isDbConnected()) {
      return await PromiseRecord.findOne({ caseId }).lean();
    }
    for (const p of memStore.promises.values()) {
      if (p.caseId === caseId) return p;
    }
    return null;
  },

  // Audit Logs
  async logAudit(auditData) {
    if (isDbConnected()) {
      const doc = new AuditLog(auditData);
      return await doc.save();
    }
    const entry = { ...auditData, id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`, createdAt: new Date() };
    memStore.auditLogs.unshift(entry);
    return entry;
  },

  async getAuditLogs(filter = {}) {
    if (isDbConnected()) {
      const query = {};
      if (filter.caseId) query.caseId = filter.caseId;
      return await AuditLog.find(query).sort({ createdAt: -1 }).limit(100).lean();
    }
    let list = memStore.auditLogs;
    if (filter.caseId) {
      list = list.filter(a => a.caseId === filter.caseId);
    }
    return list.slice(0, 100);
  }
};
