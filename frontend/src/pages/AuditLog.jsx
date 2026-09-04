import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

export default function AuditLog() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLogs() {
      try {
        const data = await api.getAuditLogs();
        setLogs(data);
      } catch (err) {
        console.error('Failed to load audit logs:', err);
      } finally {
        setLoading(false);
      }
    }
    loadLogs();
  }, []);

  return (
    <div className="card panel">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <h2 className="section-title" style={{ margin: 0 }}>System & Multi-Agent Audit Trail</h2>
          <span className="muted" style={{ fontSize: '0.85rem' }}>
            Immutable record of payment events, AI strategy decisions, policy guardrails, and customer interactions
          </span>
        </div>
        <span className="muted" style={{ fontSize: '0.85rem' }}>{logs.length} events</span>
      </div>

      {loading ? (
        <div className="muted" style={{ padding: '24px 0' }}>Loading audit logs...</div>
      ) : logs.length === 0 ? (
        <div className="muted" style={{ padding: '24px 0' }}>No audit events logged yet.</div>
      ) : (
        <ul className="timeline-list">
          {logs.map((log, idx) => {
            const isRecovered = log.eventType?.includes('RECOVERED');
            const isStop = log.eventType?.includes('UNRECOVERABLE') || log.eventType?.includes('STOP');
            const isVoice = log.actor === 'AI_VOICE_AGENT';

            return (
              <li key={log._id || log.id || idx} className={isRecovered ? 'recovered' : (isStop ? 'stop' : (isVoice ? 'voice' : ''))}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <div>
                    <strong style={{ color: isRecovered ? '#86efac' : 'var(--text)' }}>{log.eventType}</strong>
                    <span className="muted" style={{ marginLeft: '8px', fontSize: '0.8rem' }}>
                      by <strong>{log.actor}</strong>
                    </span>
                  </div>
                  <span className="muted" style={{ fontSize: '0.78rem' }}>
                    {new Date(log.createdAt).toLocaleString()}
                  </span>
                </div>

                <div style={{ fontSize: '0.9rem', marginBottom: '4px' }}>{log.description}</div>

                {log.caseId && (
                  <div style={{ fontSize: '0.78rem' }}>
                    <span className="muted">Case Reference: </span>
                    <Link to={`/cases/${log.caseId}`} style={{ color: 'var(--primary)', fontWeight: 600 }}>
                      {log.caseId}
                    </Link>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
