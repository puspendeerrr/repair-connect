import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getRequest, getRequestQuotes, acceptQuote } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import StatusBadge from '../../components/shared/StatusBadge';
import StarRating from '../../components/shared/StarRating';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import { MapPin, Clock, CurrencyDollar, User, Check } from 'phosphor-react';

export default function RequestDetailPage() {
  const { id } = useParams();
  const toast = useToast();
  const navigate = useNavigate();
  const [request, setRequest] = useState(null);
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [reqRes, quoteRes] = await Promise.all([getRequest(id), getRequestQuotes(id)]);
        setRequest(reqRes.data.request);
        setQuotes(quoteRes.data.quotes);
      } catch { toast.error('Failed to load request.'); } finally { setLoading(false); }
    };
    load();
  }, [id]);

  const handleAccept = async (quoteId) => {
    setAccepting(quoteId);
    try {
      await acceptQuote(quoteId);
      toast.success('Quote accepted! Booking created.');
      navigate('/customer/bookings');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to accept quote.');
    } finally { setAccepting(null); }
  };

  if (loading) return <LoadingSpinner size="lg" />;
  if (!request) return <div className="page"><div className="container"><p>Request not found.</p></div></div>;

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 800, margin: '0 auto' }}>
        <div className="card" style={{ marginBottom: 24 }}>
          <div className="flex-between" style={{ marginBottom: 16 }}>
            <h2 className="heading-md">{request.title}</h2>
            <StatusBadge status={request.status} />
          </div>
          <p className="text-body" style={{ marginBottom: 16 }}>{request.description}</p>
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            <span className="flex gap-sm"><MapPin size={16} /> {request.city}</span>
            <span className="badge badge-muted">{request.category}</span>
            <StatusBadge status={request.urgency} />
            <span>₹{request.budgetMin} - ₹{request.budgetMax}</span>
          </div>
          {request.images?.length > 0 && (
            <div style={{ display: 'flex', gap: 8, marginTop: 16, flexWrap: 'wrap' }}>
              {request.images.map((img, i) => (
                <img key={i} src={img} alt="Request" style={{ width: 100, height: 100, objectFit: 'cover', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }} />
              ))}
            </div>
          )}
        </div>

        <h3 className="heading-sm" style={{ marginBottom: 16 }}>Quotes Received ({quotes.length})</h3>
        {quotes.length === 0 ? (
          <div className="empty-state"><p>No quotes yet. Technicians nearby will send quotes soon.</p></div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {quotes.map((q) => (
              <div key={q._id} className="card card-glow" style={{ padding: 20 }}>
                <div className="flex-between" style={{ marginBottom: 12 }}>
                  <div className="flex gap-md" style={{ alignItems: 'center' }}>
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--amber-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--amber)' }}>
                      <User size={20} />
                    </div>
                    <div>
                      <strong>{q.providerId?.userId?.name || 'Provider'}</strong>
                      <div className="flex gap-sm" style={{ alignItems: 'center' }}>
                        <StarRating rating={q.providerId?.avgRating || 0} size={14} />
                        <span className="text-small">{q.providerId?.avgRating || 'New'}</span>
                      </div>
                    </div>
                  </div>
                  <StatusBadge status={q.status} />
                </div>
                <div style={{ display: 'flex', gap: 24, marginBottom: 12, fontSize: '0.938rem' }}>
                  <span className="flex gap-sm" style={{ alignItems: 'center', color: 'var(--amber)' }}><CurrencyDollar size={18} /> ₹{q.price}</span>
                  <span className="flex gap-sm" style={{ alignItems: 'center', color: 'var(--text-muted)' }}><Clock size={18} /> {q.etaHours}h ETA</span>
                </div>
                {q.message && <p className="text-body" style={{ marginBottom: 12, fontSize: '0.875rem' }}>{q.message}</p>}
                {q.status === 'pending' && request.status !== 'booked' && (
                  <button className="btn btn-primary btn-sm" onClick={() => handleAccept(q._id)} disabled={accepting === q._id}>
                    {accepting === q._id ? <span className="spinner" style={{ width: 16, height: 16 }} /> : <><Check size={16} /> Accept Quote</>}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
