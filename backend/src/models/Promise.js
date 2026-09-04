import mongoose from 'mongoose';

const promiseSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  caseId: { type: String, required: true, index: true },
  customerId: { type: String, required: true, index: true },
  promisedDate: { type: String, required: true }, // Format 'YYYY-MM-DD'
  confidence: { type: Number, default: 0.9 },
  status: {
    type: String,
    enum: ['PENDING', 'SCHEDULED', 'HONORED', 'BROKEN', 'EXPIRED'],
    default: 'PENDING',
    index: true
  },
  sourceChannel: { type: String, default: 'voice' },
  sourceText: { type: String, required: true },
  extractedIntent: { type: String, default: 'promise_to_pay' }
}, { timestamps: true });

export const PromiseRecord = mongoose.models.PromiseRecord || mongoose.model('PromiseRecord', promiseSchema);
export default PromiseRecord;
