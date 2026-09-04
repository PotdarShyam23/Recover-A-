import mongoose from 'mongoose';

const recoveryCaseSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  merchantId: { type: String, required: true, index: true },
  customerId: { type: String, required: true, index: true },
  paymentId: { type: String, required: true, index: true },
  initialEventId: { type: String, required: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'INR' },
  status: {
    type: String,
    enum: [
      'EVALUATING',
      'RECOVERABLE',
      'UNRECOVERABLE',
      'CONTACTED',
      'AWAITING_PAYMENT',
      'VOICE_ENGAGED',
      'PROMISE_PENDING',
      'RECOVERED',
      'STOPPED',
      'EXPIRED'
    ],
    default: 'EVALUATING',
    index: true
  },
  recoverabilityReason: { type: String },
  failureCategory: { type: String }, // 'DROP_OFF', 'INSUFFICIENT_FUNDS', 'MANDATE_ISSUE', 'SUSPECTED_FRAUD', 'OTHER'
  strategyAction: { type: String },  // 'whatsapp', 'sms', 'email', 'voice', 'wait', 'stop'
  strategyReason: { type: String },
  aiConfidence: { type: Number, default: 0.8 },
  channelSequence: [{ type: String }],
  attemptCount: { type: Number, default: 0 },
  messageAttempts: { type: Number, default: 0 },
  voiceAttempts: { type: Number, default: 0 },
  nextActionAt: { type: Date },
  recoveryLinkId: { type: String },
  recoveryLinkUrl: { type: String },
  recoveredAmount: { type: Number, default: 0 },
  recoveredAt: { type: Date },
  winningChannel: { type: String },
  stopReason: { type: String }
}, { timestamps: true });

export const RecoveryCase = mongoose.models.RecoveryCase || mongoose.model('RecoveryCase', recoveryCaseSchema);
export default RecoveryCase;
