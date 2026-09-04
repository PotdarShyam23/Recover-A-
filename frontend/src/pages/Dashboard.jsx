import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';

export default function Dashboard() {
  const [metrics, setMetrics] = useState(null);
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [metricsData, casesData] = await Promise.all([
          api.getMetrics(),
          api.getCases()
        ]);
        setMetrics(metricsData);
        setCases(casesData);
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading || !metrics) {
    return <div className="card panel">Loading live recovery analytics…</div>;
  }

  return (
    <div className="grid">
      {/* Top Metrics Cards */}
      <div className="metrics-grid">
        <div className="card metric-card">
          <div className="label">Revenue at Risk</div>
          <div className="value">₹{metrics.totalRevenueAtRisk.toLocaleString('en-IN')}</div>
          <div className="subtext">From failed checkout events</div>
        </div>

        <div className="card metric-card" style={{ borderColor: 'rgba(34, 197, 94, 0.3)' }}>
          <div className="label" style={{ color: '#86efac' }}>Recovered Revenue</div>
          <div className="value" style={{ color: '#86efac' }}>₹{metrics.revenueRecovered.toLocaleString('en-IN')}</div>
          <div className="subtext">Attributed via 1-click links</div>
        </div>

        <div className="card metric-card">
          <div className="label">Recovery Rate</div>
          <div className="value highlight">{metrics.recoveryRate.toFixed(1)}%</div>
          <div className="subtext">{metrics.paymentsRecovered} payments recovered</div>
        </div>

        <div className="card metric-card">
          <div className="label">Active Recoverable</div>
          <div className="value">{metrics.pending}</div>
          <div className="subtext">In active recovery cycle</div>
        </div>

        <div className="card metric-card">
          <div className="label">Unrecoverable</div>
          <div className="value" style={{ color: '#fca5a5' }}>{metrics.unrecoverable}</div>
          <div className="subtext">Filtered (Fraud / Fatal decline)</div>
        </div>

        <div className="card metric-card">
          <div className="label">Stopped</div>
          <div className="value">{metrics.stopped}</div>
          <div className="subtext">Policy touch limit reached</div>
        </div>
      </div>

      {/* Recovery Funnel & Channel Breakdown */}
      <div className="hero">
        <div className="card panel">
          <h2 className="section-title">Merchant Recovery Funnel</h2>
          <div className="funnel">
            <div className="step">
              <span>1. Payments at Risk</span>
              <strong>{metrics.funnel.paymentsAtRisk}</strong>
            </div>
            <div className="step">
              <span>2. Intervened (Outreach)</span>
              <strong>{metrics.funnel.intervened}</strong>
            </div>
            <div className="step">
              <span>3. Customer Engaged</span>
              <strong>{metrics.funnel.customerEngaged}</strong>
            </div>
            <div className="step">
              <span style={{ color: '#86efac' }}>4. Recovered</span>
              <strong style={{ color: '#86efac' }}>{metrics.funnel.recovered}</strong>
            </div>
          </div>
        </div>

        <div className="card panel">
          <h2 className="section-title">Recovered by Channel</h2>
          <div className="timeline-list">
            <li className="voice">
              <strong>🎙️ Hinglish Voice Agent:</strong> ₹{(metrics.byAction?.voice || 0).toLocaleString('en-IN')}
            </li>
            <li>
              <strong>💬 WhatsApp 1-Click Link:</strong> ₹{(metrics.byAction?.whatsapp || 0).toLocaleString('en-IN')}
            </li>
            <li>
              <strong>📱 SMS Recovery Link:</strong> ₹{(metrics.byAction?.sms || 0).toLocaleString('en-IN')}
            </li>
            <li>
              <strong>✉️ Email Invoice:</strong> ₹{(metrics.byAction?.email || 0).toLocaleString('en-IN')}
            </li>
          </div>
        </div>
      </div>

      {/* Active Recovery Cases Table */}
      <div className="card panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 className="section-title" style={{ margin: 0 }}>Recent Recovery Cases</h2>
          <Link to="/cases" style={{ color: 'var(--primary)', fontSize: '0.9rem', fontWeight: 600 }}>
            View All Cases →
          </Link>
        </div>

        {cases.length === 0 ? (
          <div className="muted" style={{ padding: '20px 0' }}>
            No recovery cases recorded yet. Go to <strong>Test Lab & Webhooks</strong> to trigger a Razorpay failure scenario.
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Case ID</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Strategy / Action</th>
                <th>Failure Context</th>
                <th>Winning Channel</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {cases.slice(0, 8).map((c) => (
                <tr key={c.id}>
                  <td>
                    <strong>{c.id}</strong>
                    <div className="muted" style={{ fontSize: '0.75rem' }}>{c.paymentId}</div>
                  </td>
                  <td><strong>₹{c.amount?.toLocaleString('en-IN')}</strong></td>
                  <td><StatusBadge status={c.status} /></td>
                  <td>
                    <span style={{ textTransform: 'capitalize' }}>{c.strategyAction || 'Evaluating'}</span>
                    <div className="muted" style={{ fontSize: '0.75rem' }}>
                      {c.voiceAttempts > 0 ? '🎙️ Voice Engaged' : (c.messageAttempts > 0 ? '💬 Message Sent' : 'Initial Evaluation')}
                    </div>
                  </td>
                  <td className="muted" style={{ fontSize: '0.82rem' }}>
                    {c.failureCategory || 'DROP_OFF'}
                  </td>
                  <td>
                    {c.status === 'RECOVERED' ? (
                      <span className="status-badge badge-success">{c.winningChannel || 'Direct Link'}</span>
                    ) : 'Pending'}
                  </td>
                  <td>
                    <Link to={`/cases/${c.id}`} style={{ color: 'var(--primary)', fontWeight: 600 }}>
                      Open Case
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
