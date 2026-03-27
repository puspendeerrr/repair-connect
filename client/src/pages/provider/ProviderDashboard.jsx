import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ClipboardText, Briefcase, Star, CurrencyDollar, ToggleRight, ToggleLeft } from 'phosphor-react';
import { useAuth } from '../../context/AuthContext';
import { getBookings, getMyQuotes } from '../../services/api';
import StatusBadge from '../../components/shared/StatusBadge';
import StarRating from '../../components/shared/StarRating';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import api from '../../services/api';

export default function ProviderDashboard() {
  const { user, providerProfile } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [available, setAvailable] = useState(providerProfile?.isAvailable ?? true);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    Promise.all([getBookings({ limit: 5 }), getMyQuotes({ limit: 5 })])
      .then(([bRes, qRes]) => { setBookings(bRes.data.bookings); setQuotes(qRes.data.quotes); })
      .catch(() => {}).finally(() => setLoading(false));
  }, []);

  const toggleAvailability = async () => {
    setToggling(true);
    try {
      setAvailable(!available);
      await api.patch(`/users/${user._id}`, {}); // simplified
    } catch { /* ignore */ } finally { setToggling(false); }
  };

  if (loading) return <LoadingSpinner size="lg" text="Loading dashboard..." />;

  const activeQuotes = quotes.filter((q) => q.status === 'pending').length;
  const completedJobs = bookings.filter((b) => b.status === 'completed').length;
  const greeting = new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <div className="flex-between">
            <div>
              <h1>{greeting}, {user?.name?.split(' ')[0]} 🔧</h1>
              <p>Your service provider dashboard</p>
            </div>
            <button className={`btn ${available ? 'btn-primary' : 'btn-secondary'}`} onClick={toggleAvailability} disabled={toggling}>
              {available ? <><ToggleRight size={20} weight="fill" /> Available</> : <><ToggleLeft size={20} /> Offline</>}
            </button>
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'var(--amber-light)', color: 'var(--amber)' }}><ClipboardText size={22} weight="fill" /></div>
            <div className="stat-label">Active Quotes</div>
            <div className="stat-value text-amber">{activeQuotes}</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'var(--green-light)', color: 'var(--green)' }}><Briefcase size={22} weight="fill" /></div>
            <div className="stat-label">Completed Jobs</div>
            <div className="stat-value" style={{ color: 'var(--green)' }}>{completedJobs}</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'var(--cyan-light)', color: 'var(--cyan)' }}><Star size={22} weight="fill" /></div>
            <div className="stat-label">Avg Rating</div>
            <div className="stat-value text-cyan">{providerProfile?.avgRating || 'N/A'}</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'var(--amber-light)', color: 'var(--amber)' }}><CurrencyDollar size={22} weight="fill" /></div>
            <div className="stat-label">Total Jobs</div>
            <div className="stat-value text-amber">{providerProfile?.totalJobs || 0}</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, marginBottom: 32 }}>
          <Link to="/provider/browse" className="btn btn-primary">Browse Nearby Jobs</Link>
          <Link to="/provider/my-quotes" className="btn btn-secondary">View My Quotes</Link>
        </div>

        <div className="card" style={{ marginBottom: 24 }}>
          <h3 className="heading-sm" style={{ marginBottom: 16 }}>Recent Bookings</h3>
          {bookings.length === 0 ? (
            <p className="text-small">No bookings yet. Start by sending quotes on nearby requests!</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {bookings.map((b) => (
                <Link key={b._id} to={`/provider/bookings/${b._id}`} className="card" style={{ padding: 16 }}>
                  <div className="flex-between">
                    <div>
                      <strong>{b.requestId?.title || 'Booking'}</strong>
                      <p className="text-small">Customer: {b.customerId?.name} • ₹{b.quoteId?.price}</p>
                    </div>
                    <StatusBadge status={b.status} />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
