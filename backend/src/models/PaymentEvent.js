import mongoose from 'mongoose';

const paymentEventSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  eventId: { type: String, required: true, unique: true, index: true }, // Razorpay event_id for idempotency
  merchantId: { type: String, required: true, index: true },
  eventType: { type: String, required: true }, // 'payment.failed', 'payment.captured', 'order.paid'
  provider: { type: String, default: 'razorpay' },
  paymentId: { type: String, index: true },
  orderId: { type: String, index: true },
  customerId: { type: String, index: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'INR' },
  paymentMethod: { type: String },
  errorCode: { type: String },
  errorDescription: { type: String },
  errorSource: { type: String },
  errorStep: { type: String },
  errorReason: { type: String },
  rawPayload: { type: mongoose.Schema.Types.Mixed, required: true }
}, { timestamps: true });

export const PaymentEvent = mongoose.models.PaymentEvent || mongoose.model('PaymentEvent', paymentEventSchema);
export default PaymentEvent;
