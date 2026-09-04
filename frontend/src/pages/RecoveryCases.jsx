import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';

export default function RecoveryCases() {
  const [cases, setCases] = useState([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCases() {
      setLoading(true);
      try {
        const data = await api.getCases(filter);
        setCases(data);
      } catch (err) {
        console.error('Failed to load cases:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchCases();
  }, [filter]);

  const filterOptions = [
    { label: 'All Cases', value: '' },
    { label: 'Recoverable', value: 'RECOVERABLE' },
    { label: 'Contacted', value: 'CONTACTED' },
    { label: 'Voice Engaged', value: 'VOICE_ENGAGED' },
    { label: 'Promise Pending', value: 'PROMISE_PENDING' },
    { label: 'Recovered', value: 'RECOVERED' },
    { label: 'Unrecoverable (Filtered)', value: 'UNRECOVERABLE' }
  ];

  return (
    <div className="card panel">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2 className="section-title" style={{ margin: 0 }}>Recovery Cases Directory</h2>
        <span className="muted" style={{ fontSize: '0.85rem' }}>{cases.length} cases found</span>
      </div>

      {/* Filter Tabs */}
      <div className="filter-tabs">
        {filterOptions.map((opt) => (
          <button
            key={opt.value}
            type="button"
            className={`filter-pill ${filter === opt.value ? 'active' : ''}`}
            onClick={() => setFilter(opt.value)}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="muted" style={{ padding: '24px 0' }}>Loading cases...</div>
      ) : cases.length === 0 ? (
        <div className="muted" style={{ padding: '24px 0' }}>
          No cases match this filter. Use the <strong>Test Lab</strong> to simulate Razorpay payment events.
        </div>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Case ID</th>
              <th>Customer</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Strategy</th>
              <th>Failure Code</th>
              <th>Touches</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {cases.map((c) => (
              <tr key={c.id}>
                <td>
                  <strong>{c.id}</strong>
                  <div className="muted" style={{ fontSize: '0.75rem' }}>{c.paymentId}</div>
                </td>
                <td>{c.customerId}</td>
                <td><strong>₹{c.amount?.toLocaleString('en-IN')}</strong></td>
                <td><StatusBadge status={c.status} /></td>
                <td>
                  <span style={{ textTransform: 'capitalize' }}>{c.strategyAction || 'Evaluating'}</span>
                </td>
                <td className="muted" style={{ fontSize: '0.8rem' }}>
                  {c.errorCode || c.failureCategory || 'DROP_OFF'}
                </td>
                <td>
                  <span style={{ fontSize: '0.82rem' }}>
                    💬 {c.messageAttempts || 0} | 🎙️ {c.voiceAttempts || 0}
                  </span>
                </td>
                <td>
                  <Link to={`/cases/${c.id}`} style={{ color: 'var(--primary)', fontWeight: 600 }}>
                    Inspect →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
