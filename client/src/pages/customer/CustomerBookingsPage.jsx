import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getBookings } from '../../services/api';
import StatusBadge from '../../components/shared/StatusBadge';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import { Briefcase } from 'phosphor-react';

export default function CustomerBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getBookings({ limit: 50 }).then(({ data }) => setBookings(data.bookings)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner size="lg" />;

  return (
    <div className="page">
      <div className="container">
        <div className="page-header"><h1>My Bookings</h1><p>Track and manage all your service bookings</p></div>
        {bookings.length === 0 ? (
          <div className="empty-state"><Briefcase size={48} /><h3>No bookings yet</h3><p>Accept a quote on one of your requests to create a booking.</p></div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {bookings.map((b) => (
              <Link key={b._id} to={`/customer/bookings/${b._id}`} className="card card-glow" style={{ padding: 20 }}>
                <div className="flex-between">
                  <div>
                    <strong style={{ fontSize: '0.938rem' }}>{b.requestId?.title || 'Booking'}</strong>
                    <p className="text-small">{b.requestId?.category} • Provider: {b.providerId?.name}</p>
                    <p className="text-small">₹{b.quoteId?.price}</p>
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
