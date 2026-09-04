import React from 'react';

export default function StatusBadge({ status }) {
  const getBadgeClass = (s) => {
    switch (s) {
      case 'RECOVERED':
      case 'HONORED':
        return 'badge-success';
      case 'PROMISE_PENDING':
      case 'VOICE_ENGAGED':
        return 'badge-promise';
      case 'CONTACTED':
      case 'AWAITING_PAYMENT':
      case 'RECOVERABLE':
        return 'badge-info';
      case 'UNRECOVERABLE':
      case 'STOPPED':
      case 'BROKEN':
        return 'badge-stop';
      default:
        return 'badge-default';
    }
  };

  return (
    <span className={`status-badge ${getBadgeClass(status)}`}>
      {status || 'UNKNOWN'}
    </span>
  );
}
