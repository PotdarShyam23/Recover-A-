import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';

export default function Promises() {
  const [promises, setPromises] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPromises() {
      try {
        const data = await api.getPromises();
        setPromises(data);
      } catch (err) {
        console.error('Failed to load promises:', err);
      } finally {
        setLoading(false);
      }
    }
    loadPromises();
  }, []);

  return (
    <div className="card panel">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <h2 className="section-title" style={{ margin: 0 }}>Promise-to-Pay Commitments</h2>
          <span className="muted" style={{ fontSize: '0.85rem' }}>
            Extracted commitments from Hinglish Voice Calls and customer WhatsApp replies
          </span>
        </div>
        <span className="muted" style={{ fontSize: '0.85rem' }}>{promises.length} promises tracked</span>
      </div>

      {loading ? (
        <div className="muted" style={{ padding: '24px 0' }}>Loading promises...</div>
      ) : promises.length === 0 ? (
        <div className="muted" style={{ padding: '24px 0' }}>
          No promises recorded yet. Use the <strong>Test Lab</strong> or open a case to trigger the Hinglish Voice Agent or simulate a customer reply.
        </div>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Promise ID</th>
              <th>Case Reference</th>
              <th>Customer</th>
              <th>Promised Date</th>
              <th>Confidence</th>
              <th>Source Channel</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {promises.map((p) => (
              <tr key={p.id}>
                <td><strong>{p.id}</strong></td>
                <td>
                  <Link to={`/cases/${p.caseId}`} style={{ color: 'var(--primary)', fontWeight: 600 }}>
                    {p.caseId}
                  </Link>
                </td>
                <td>{p.customerId}</td>
                <td>
                  <strong style={{ color: '#c4b5fd' }}>{p.promisedDate}</strong>
                </td>
                <td>{(p.confidence * 100).toFixed(0)}%</td>
                <td>
                  <span style={{ textTransform: 'capitalize' }}>
                    {p.sourceChannel === 'voice' ? '🎙️ Hinglish Voice' : '💬 WhatsApp'}
                  </span>
                </td>
                <td><StatusBadge status={p.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
