import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getBookings } from '../../services/api';
import StatusBadge from '../../components/shared/StatusBadge';
import LoadingSpinner from '../../components/shared/LoadingSpinner';

export default function ProviderBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getBookings({ limit: 50 }).then(({ data }) => setBookings(data.bookings)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner size="lg" />;

  return (
    <div className="page">
      <div className="container">
        <div className="page-header"><h1>My Bookings</h1><p>Manage all your assigned jobs</p></div>
        {bookings.length === 0 ? (
          <div className="empty-state"><h3>No bookings yet</h3><p>Start by sending quotes on nearby requests.</p></div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {bookings.map((b) => (
              <Link key={b._id} to={`/provider/bookings/${b._id}`} className="card card-glow" style={{ padding: 20 }}>
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
  );
}
