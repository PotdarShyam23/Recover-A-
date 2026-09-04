// Ananlytics for the bussiness which channel gives maximum recovery so they know which is the winning channel and they save money by not spendig money in least winning channel

import { dbStore } from '../db/store.js';

export class AnalyticsService {
  async getOverviewMetrics() {
    const cases = await dbStore.getAllCases();

    const totalRevenueAtRisk = cases.reduce((sum, c) => sum + Number(c.amount || 0), 0);
    const revenueRecovered = cases
      .filter(c => c.status === 'RECOVERED')
      .reduce((sum, c) => sum + Number(c.recoveredAmount || c.amount || 0), 0);

    const recoveryRate = totalRevenueAtRisk > 0 ? (revenueRecovered / totalRevenueAtRisk) * 100 : 0;
    const paymentsRecovered = cases.filter(c => c.status === 'RECOVERED').length;
    const pending = cases.filter(c => !['RECOVERED', 'STOPPED', 'UNRECOVERABLE', 'EXPIRED'].includes(c.status)).length;
    const unrecoverable = cases.filter(c => c.status === 'UNRECOVERABLE').length;
    const stopped = cases.filter(c => c.status === 'STOPPED').length;

    // Funnel counts
    const funnel = {
      paymentsAtRisk: cases.length,
      intervened: cases.filter(c => c.attemptCount > 0).length,
      customerEngaged: cases.filter(c => c.status === 'VOICE_ENGAGED' || c.status === 'PROMISE_PENDING' || c.voiceAttempts > 0).length,
      recovered: paymentsRecovered
    };

    // Revenue recovered by channel
    const byAction = {
      whatsapp: cases.filter(c => c.status === 'RECOVERED' && c.winningChannel === 'whatsapp')
                     .reduce((s, c) => s + Number(c.recoveredAmount || c.amount || 0), 0),
      voice: cases.filter(c => c.status === 'RECOVERED' && c.winningChannel === 'voice')
                  .reduce((s, c) => s + Number(c.recoveredAmount || c.amount || 0), 0),
      sms: cases.filter(c => c.status === 'RECOVERED' && c.winningChannel === 'sms')
                .reduce((s, c) => s + Number(c.recoveredAmount || c.amount || 0), 0),
      email: cases.filter(c => c.status === 'RECOVERED' && c.winningChannel === 'email')
                  .reduce((s, c) => s + Number(c.recoveredAmount || c.amount || 0), 0)
    };

    return {
      totalRevenueAtRisk,
      revenueRecovered,
      recoveryRate,
      paymentsRecovered,
      pending,
      unrecoverable,
      stopped,
      funnel,
      byAction
    };
  }
}

export default new AnalyticsService();
