import mongoose from 'mongoose';

const communicationLogSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  caseId: { type: String, required: true, index: true },
  customerId: { type: String, required: true, index: true },
  channel: { type: String, enum: ['whatsapp', 'sms', 'email', 'voice'], required: true },
  direction: { type: String, enum: ['OUTBOUND', 'INBOUND'], required: true },
  recipient: { type: String, required: true },
  messageText: { type: String, required: true },
  paymentLink: { type: String },
  status: {
    type: String,
    enum: ['QUEUED', 'SENT', 'DELIVERED', 'READ', 'RESPONDED', 'COMPLETED', 'FAILED'],
    default: 'SENT'
  },
  metadata: { type: mongoose.Schema.Types.Mixed } // Stores voice transcript, duration, carrier IDs
}, { timestamps: true });

export const CommunicationLog = mongoose.models.CommunicationLog || mongoose.model('CommunicationLog', communicationLogSchema);
export default CommunicationLog;
