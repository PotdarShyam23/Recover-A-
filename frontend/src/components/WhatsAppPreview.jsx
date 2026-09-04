import { useState } from 'react';

export default function WhatsAppPreview({ customerName, phone, messageText, paymentLink, onSendReply }) {
  const [inputReply, setInputReply] = useState('');
  const [sending, setSending] = useState(false);

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!inputReply.trim()) return;
    setSending(true);
    try {
      await onSendReply(inputReply);
      setInputReply('');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="whatsapp-mockup">
      {/* WhatsApp Header */}
      <div className="wa-header">
        <div className="wa-avatar">🤖</div>
        <div className="wa-contact-info">
          <div className="wa-name">
            SaaSify Billing Support <span className="wa-verified">✔</span>
          </div>
          <div className="wa-status">Online • Verified Business</div>
        </div>
        <div className="wa-header-icons">📞 🎥 ︙</div>
      </div>

      {/* WhatsApp Chat Body */}
      <div className="wa-body">
        <div className="wa-encryption-notice">
          🔒 Messages and calls are end-to-end encrypted. No one outside of this chat can read them.
        </div>

        {/* Outbound Recovery Message Bubble */}
        <div className="wa-bubble wa-outbound">
          <div className="wa-message-text">
            {messageText || `Hi ${customerName}! We noticed your payment couldn't be completed. You can complete it securely in 1-click here:`}
          </div>

          {paymentLink && (
            <div className="wa-link-preview">
              <div className="wa-link-title">💳 Razorpay 1-Click Recovery Checkout</div>
              <div className="wa-link-url">{paymentLink}</div>
              <a
                href={paymentLink}
                target="_blank"
                rel="noreferrer"
                className="wa-pay-btn"
              >
                Pay Now via Razorpay ⚡
              </a>
            </div>
          )}

          <div className="wa-time-row">
            <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            <span className="wa-ticks">✓✓</span>
          </div>
        </div>
      </div>

      {/* WhatsApp Input Bar */}
      <form className="wa-input-bar" onSubmit={handleReplySubmit}>
        <span style={{ fontSize: '1.1rem', cursor: 'pointer' }}>😊 📎</span>
        <input
          type="text"
          placeholder="Reply (e.g. 'Friday ko salary aayegi')"
          value={inputReply}
          onChange={(e) => setInputReply(e.target.value)}
          disabled={sending}
        />
        <button type="submit" disabled={sending || !inputReply.trim()}>
          {sending ? '...' : '➤'}
        </button>
      </form>
    </div>
  );
}
