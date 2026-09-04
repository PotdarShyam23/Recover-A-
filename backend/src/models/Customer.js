import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  merchantId: { type: String, required: true, index: true },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  preferredLanguage: { type: String, default: 'hinglish' },
  engagement: { type: String, enum: ['high', 'medium', 'low'], default: 'medium' },
  paymentHistory: [{ type: Number }],
  preferredChannel: { type: String, enum: ['whatsapp', 'sms', 'email', 'voice'], default: 'whatsapp' },
  totalSpent: { type: Number, default: 0 }
}, { timestamps: true });

export const Customer = mongoose.models.Customer || mongoose.model('Customer', customerSchema);
export default Customer;
