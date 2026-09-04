const API_BASE = import.meta.env.VITE_API_BASE || 
  (typeof window !== 'undefined' && window.location.port === '5173' 
    ? 'http://localhost:4001/api' 
    : '/api');

async function fetchJson(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  });

  if (!res.ok) {
    let errorMsg = `API Error ${res.status}`;
    try {
      const body = await res.json();
      errorMsg = body.error || body.message || errorMsg;
    } catch {}
    throw new Error(errorMsg);
  }

  return await res.json();
}

export const api = {
  // Health
  getHealth: () => fetchJson('/health'),

  // Analytics
  getMetrics: () => fetchJson('/metrics'),

  // Cases
  getCases: (status = '') => fetchJson(`/recovery-cases${status ? `?status=${status}` : ''}`),
  getCase: (id) => fetchJson(`/recovery-cases/${id}`),

  // Case Actions
  dispatchOutreach: (id, channel = 'whatsapp') =>
    fetchJson(`/recovery-cases/${id}/message`, {
      method: 'POST',
      body: JSON.stringify({ channel })
    }),

  triggerVoiceCall: (id, responseText = null) =>
    fetchJson(`/recovery-cases/${id}/voice`, {
      method: 'POST',
      body: JSON.stringify({ response: responseText })
    }),

  sendCustomerReply: (id, replyText) =>
    fetchJson(`/recovery-cases/${id}/customer-reply`, {
      method: 'POST',
      body: JSON.stringify({ replyText })
    }),

  simulatePaymentSuccess: (id) =>
    fetchJson(`/recovery-cases/${id}/simulate-success`, {
      method: 'POST'
    }),

  // Promises & Audit
  getPromises: () => fetchJson('/promises'),
  getAuditLogs: () => fetchJson('/audit'),

  // Test Lab / Simulator
  getScenarios: () => fetchJson('/simulator/scenarios'),
  triggerWebhook: (payload) =>
    fetchJson('/simulator/trigger-webhook', {
      method: 'POST',
      body: JSON.stringify(payload)
    })
};

export default api;
