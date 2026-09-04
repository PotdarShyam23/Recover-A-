import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
  caseId: { type: String, index: true },
  merchantId: { type: String, required: true, index: true },
  eventType: { type: String, required: true },
  action: { type: String, required: true },
  actor: {
    type: String,
    enum: ['SYSTEM', 'AI_OUTREACH_AGENT', 'AI_STRATEGY_AGENT', 'AI_VOICE_AGENT', 'POLICY_GUARDRAIL', 'CUSTOMER', 'MERCHANT', 'RAZORPAY_WEBHOOK'],
    default: 'SYSTEM'
  },
  description: { type: String, required: true },
  metadata: { type: mongoose.Schema.Types.Mixed }
}, { timestamps: true });

export const AuditLog = mongoose.models.AuditLog || mongoose.model('AuditLog', auditLogSchema);
export default AuditLog;
