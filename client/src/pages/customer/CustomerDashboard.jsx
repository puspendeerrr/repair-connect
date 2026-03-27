import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, ClipboardText, Briefcase, CurrencyDollar } from 'phosphor-react';
import { useAuth } from '../../context/AuthContext';
import { getRequests, getBookings } from '../../services/api';
import StatusBadge from '../../components/shared/StatusBadge';
import LoadingSpinner from '../../components/shared/LoadingSpinner';

export default function CustomerDashboard() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [reqRes, bookRes] = await Promise.all([
          getRequests({ mine: 'true', limit: 5 }),
          getBookings({ limit: 5 }),
        ]);
        setRequests(reqRes.data.requests);
        setBookings(bookRes.data.bookings);
      } catch { /* ignore */ } finally { setLoading(false); }
    };
    load();
  }, []);

  if (loading) return <LoadingSpinner size="lg" text="Loading dashboard..." />;

  const activeRequests = requests.filter((r) => ['open', 'quoted'].includes(r.status)).length;
  const completedJobs = bookings.filter((b) => b.status === 'completed').length;

  const greeting = new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <h1>{greeting}, {user?.name?.split(' ')[0]} 👋</h1>
          <p>Here's what's happening with your repairs</p>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'var(--cyan-light)', color: 'var(--cyan)' }}>
              <ClipboardText size={22} weight="fill" />
            </div>
            <div className="stat-label">Active Requests</div>
            <div className="stat-value text-cyan">{activeRequests}</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'var(--green-light)', color: 'var(--green)' }}>
              <Briefcase size={22} weight="fill" />
            </div>
            <div className="stat-label">Completed Jobs</div>
            <div className="stat-value" style={{ color: 'var(--green)' }}>{completedJobs}</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'var(--amber-light)', color: 'var(--amber)' }}>
              <CurrencyDollar size={22} weight="fill" />
            </div>
            <div className="stat-label">Total Bookings</div>
            <div className="stat-value text-amber">{bookings.length}</div>
          </div>
        </div>

        <Link to="/customer/post-request" className="btn btn-primary btn-lg" style={{ marginBottom: 32 }}>
          <Plus size={18} /> Post a Repair Request
        </Link>

        <div className="card" style={{ marginBottom: 24 }}>
          <h3 className="heading-sm" style={{ marginBottom: 16 }}>Recent Requests</h3>
          {requests.length === 0 ? (
            <p className="text-small">No requests yet. Post your first repair request!</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {requests.map((r) => (
                <Link key={r._id} to={`/customer/requests/${r._id}`} className="card" style={{ padding: 16 }}>
                  <div className="flex-between">
                    <div>
                      <strong style={{ fontSize: '0.938rem' }}>{r.title}</strong>
                      <p className="text-small">{r.category} • {r.city}</p>
                    </div>
                    <StatusBadge status={r.status} />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <h3 className="heading-sm" style={{ marginBottom: 16 }}>Recent Bookings</h3>
          {bookings.length === 0 ? (
            <p className="text-small">No bookings yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {bookings.map((b) => (
                <Link key={b._id} to={`/customer/bookings/${b._id}`} className="card" style={{ padding: 16 }}>
                  <div className="flex-between">
                    <div>
                      <strong style={{ fontSize: '0.938rem' }}>{b.requestId?.title || 'Booking'}</strong>
                      <p className="text-small">₹{b.quoteId?.price} • {b.providerId?.name}</p>
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
