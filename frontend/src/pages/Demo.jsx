import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

export default function Demo() {
  const [scenarios, setScenarios] = useState([]);
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [customPayload, setCustomPayload] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadScenarios() {
      try {
        const data = await api.getScenarios();
        setScenarios(data);
        if (data.length > 0) {
          setSelectedScenario(data[0]);
          setCustomPayload(JSON.stringify(data[0].payload, null, 2));
        }
      } catch (err) {
        console.error('Failed to load scenarios:', err);
      }
    }
    loadScenarios();
  }, []);

  function handleSelectScenario(s) {
    setSelectedScenario(s);
    setCustomPayload(JSON.stringify(s.payload, null, 2));
    setResult(null);
  }

  async function handleTriggerWebhook() {
    setLoading(true);
    setResult(null);
    try {
      const parsed = JSON.parse(customPayload);
      const res = await api.triggerWebhook(parsed);
      setResult(res);
    } catch (err) {
      setResult({ ok: false, error: err.message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid">
      <div className="card panel">
        <h2 className="section-title">🧪 RecoverAI Test Lab & Razorpay Webhook Simulator</h2>
        <p className="muted" style={{ fontSize: '0.9rem', lineHeight: 1.5, margin: '0 0 16px' }}>
          Select a realistic payment failure scenario or paste your own raw Razorpay webhook payload.
          RecoverAI will verify the HMAC signature, classify recoverability, trigger the dynamic LLM multi-agents, and generate 1-click recovery links.
        </p>

        {/* Pre-built Scenarios */}
        <div className="scenario-grid">
          {scenarios.map((s) => (
            <div
              key={s.id}
              className={`scenario-card ${selectedScenario?.id === s.id ? 'active' : ''}`}
              onClick={() => handleSelectScenario(s)}
            >
              <div className="scenario-title">{s.name}</div>
              <div className="scenario-desc">{s.description}</div>
            </div>
          ))}
        </div>

        {/* Payload Editor & Ingestion Button */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Raw Razorpay Webhook Payload (JSON)</span>
            <span className="muted" style={{ fontSize: '0.78rem' }}>Signed with merchant secret</span>
          </div>

          <textarea
            value={customPayload}
            onChange={(e) => setCustomPayload(e.target.value)}
            rows={12}
            style={{
              width: '100%',
              borderRadius: '10px',
              padding: '14px',
              fontSize: '0.85rem',
              fontFamily: 'monospace',
              background: '#05131f',
              border: '1px solid rgba(255,255,255,0.12)',
              color: '#a5f3fc',
              marginBottom: '14px'
            }}
          />

          <div className="button-group">
            <button
              type="button"
              onClick={handleTriggerWebhook}
              disabled={loading}
            >
              {loading ? 'Processing via AI Agents...' : '🚀 Fire Webhook to Ingestion Engine'}
            </button>
          </div>
        </div>
      </div>

      {/* Response Preview */}
      {result && (
        <div className="card panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h2 className="section-title" style={{ margin: 0 }}>Engine Execution Result</h2>
            {result.result?.result?.caseRecord?.id && (
              <Link
                to={`/cases/${result.result.result.caseRecord.id}`}
                style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '0.9rem' }}
              >
                Inspect Created Case ({result.result.result.caseRecord.id}) →
              </Link>
            )}
          </div>

          <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', maxHeight: '450px' }}>
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
