import { useState, useEffect } from 'react';
import { getRequests, submitQuote } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import StatusBadge from '../../components/shared/StatusBadge';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import { MapPin, Clock, CurrencyDollar, PaperPlaneTilt, X, Funnel } from 'phosphor-react';

const CATEGORIES = ['All', 'AC Repair', 'Plumbing', 'Electrical', 'Carpentry', 'Painting', 'Vehicle Repair', 'Phone Repair', 'Appliance Repair'];

export default function BrowseJobsPage() {
  const { user } = useAuth();
  const toast = useToast();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('All');
  const [radius, setRadius] = useState(25);
  const [quoting, setQuoting] = useState(null); // request ID
  const [quoteForm, setQuoteForm] = useState({ price: '', etaHours: '', message: '' });
  const [submitting, setSubmitting] = useState(false);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const params = { lat: user?.lat, lng: user?.lng, radius, limit: 50 };
      if (category !== 'All') params.category = category;
      const { data } = await getRequests(params);
      setRequests(data.requests);
    } catch { toast.error('Failed to load requests.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadRequests(); }, [category, radius]);

  const handleSubmitQuote = async () => {
    if (!quoteForm.price || !quoteForm.etaHours) return toast.error('Price and ETA are required.');
    setSubmitting(true);
    try {
      await submitQuote(quoting, { price: Number(quoteForm.price), etaHours: Number(quoteForm.etaHours), message: quoteForm.message });
      toast.success('Quote submitted!');
      setQuoting(null);
      setQuoteForm({ price: '', etaHours: '', message: '' });
      loadRequests();
    } catch (err) { toast.error(err.response?.data?.error || 'Failed to submit quote.'); }
    finally { setSubmitting(false); }
  };

  return (
    <div className="page">
      <div className="container">
        <div className="page-header"><h1>Browse Nearby Jobs</h1><p>Find repair requests in your area and send quotes</p></div>

        {/* Filters */}
        <div className="card" style={{ padding: 16, marginBottom: 24, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <Funnel size={18} style={{ color: 'var(--text-muted)' }} />
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {CATEGORIES.map((c) => (
              <button key={c} className={`btn btn-sm ${category === c ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setCategory(c)}>{c}</button>
            ))}
          </div>
          <select className="input" style={{ width: 'auto', padding: '8px 32px 8px 12px' }} value={radius} onChange={(e) => setRadius(Number(e.target.value))}>
            <option value={5}>5 km</option>
            <option value={10}>10 km</option>
            <option value={25}>25 km</option>
            <option value={50}>50 km</option>
          </select>
        </div>

        {loading ? <LoadingSpinner size="lg" /> : requests.length === 0 ? (
          <div className="empty-state"><h3>No requests found</h3><p>Try expanding your search radius or category filters.</p></div>
        ) : (
          <div className="grid-2">
            {requests.map((r) => (
              <div key={r._id} className="card card-glow">
                <div className="flex-between" style={{ marginBottom: 12 }}>
                  <span className="badge badge-muted">{r.category}</span>
                  <StatusBadge status={r.urgency} />
                </div>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 8 }}>{r.title}</h3>
                <p className="text-small" style={{ marginBottom: 12, lineHeight: 1.6 }}>{r.description?.slice(0, 120)}{r.description?.length > 120 ? '...' : ''}</p>
                <div style={{ display: 'flex', gap: 16, marginBottom: 12, fontSize: '0.813rem', color: 'var(--text-muted)' }}>
                  <span className="flex gap-sm"><CurrencyDollar size={14} /> ₹{r.budgetMin}-₹{r.budgetMax}</span>
                  <span className="flex gap-sm"><MapPin size={14} /> {r.city}{r.distance != null ? ` (${r.distance}km)` : ''}</span>
                </div>
                <button className="btn btn-primary btn-sm" style={{ width: '100%' }} onClick={() => { setQuoting(r._id); setQuoteForm({ price: '', etaHours: '', message: '' }); }}>
                  <PaperPlaneTilt size={16} /> Send Quote
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Quote Modal */}
        {quoting && (
          <div className="modal-overlay" onClick={() => setQuoting(null)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="flex-between" style={{ marginBottom: 20 }}>
                <h2>Submit Your Quote</h2>
                <button className="nav-icon-btn" onClick={() => setQuoting(null)}><X size={20} /></button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="input-group"><label>Your Price (₹) *</label><input type="number" className="input" placeholder="e.g. 1500" value={quoteForm.price} onChange={(e) => setQuoteForm({ ...quoteForm, price: e.target.value })} /></div>
                <div className="input-group"><label>Estimated Time (hours) *</label><input type="number" className="input" placeholder="e.g. 2" value={quoteForm.etaHours} onChange={(e) => setQuoteForm({ ...quoteForm, etaHours: e.target.value })} /></div>
                <div className="input-group"><label>Message (optional)</label><textarea className="input" placeholder="Describe your approach or experience with this type of repair..." value={quoteForm.message} onChange={(e) => setQuoteForm({ ...quoteForm, message: e.target.value })} /></div>
                <button className="btn btn-primary" onClick={handleSubmitQuote} disabled={submitting}>
                  {submitting ? <span className="spinner" style={{ width: 20, height: 20 }} /> : <><PaperPlaneTilt size={18} /> Submit Quote</>}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
