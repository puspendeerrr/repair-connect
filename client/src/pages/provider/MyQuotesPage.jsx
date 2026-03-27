import { useState, useEffect } from 'react';
import { getMyQuotes } from '../../services/api';
import StatusBadge from '../../components/shared/StatusBadge';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import { ClipboardText } from 'phosphor-react';

export default function MyQuotesPage() {
  const [quotes, setQuotes] = useState([]);
  const [tab, setTab] = useState('pending');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getMyQuotes({ status: tab, limit: 50 }).then(({ data }) => setQuotes(data.quotes)).catch(() => {}).finally(() => setLoading(false));
  }, [tab]);

  return (
    <div className="page">
      <div className="container">
        <div className="page-header"><h1>My Quotes</h1><p>Track all quotes you've sent</p></div>
        <div className="tabs">
          {['pending', 'accepted', 'rejected'].map((t) => (
            <button key={t} className={`tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>{t}</button>
          ))}
        </div>
        {loading ? <LoadingSpinner /> : quotes.length === 0 ? (
          <div className="empty-state"><ClipboardText size={48} /><h3>No {tab} quotes</h3><p>Browse nearby jobs to start sending quotes.</p></div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {quotes.map((q) => (
              <div key={q._id} className="card" style={{ padding: 20 }}>
                <div className="flex-between" style={{ marginBottom: 8 }}>
                  <strong>{q.requestId?.title || 'Request'}</strong>
                  <StatusBadge status={q.status} />
                </div>
                <p className="text-small">{q.requestId?.category} • {q.requestId?.customerId?.city}</p>
                <div style={{ display: 'flex', gap: 20, marginTop: 8, fontSize: '0.875rem' }}>
                  <span className="text-amber">₹{q.price}</span>
                  <span className="text-small">{q.etaHours}h ETA</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
