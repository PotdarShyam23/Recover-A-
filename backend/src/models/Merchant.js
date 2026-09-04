import mongoose from 'mongoose';

const merchantSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  webhookSecret: { type: String, default: 'test_recoverai_secret_12345' },
  razorpayKeyId: { type: String, default: '' },
  razorpayKeySecret: { type: String, default: '' },
  settings: {
    maxRetries: { type: Number, default: 3 },
    maxWhatsAppAttempts: { type: Number, default: 2 },
    maxVoiceAttempts: { type: Number, default: 1 },
    quietHoursStart: { type: Number, default: 21 }, // 9 PM
    quietHoursEnd: { type: Number, default: 9 },     // 9 AM
    preferredVoiceLanguage: { type: String, default: 'hinglish' }
  }
}, { timestamps: true });

export const Merchant = mongoose.models.Merchant || mongoose.model('Merchant', merchantSchema);
export default Merchant;
