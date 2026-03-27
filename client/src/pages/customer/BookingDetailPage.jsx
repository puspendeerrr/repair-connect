import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getBooking, updateBooking, createReview } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import StatusBadge from '../../components/shared/StatusBadge';
import StarRating from '../../components/shared/StarRating';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import { User, ChatCircle, CurrencyDollar } from 'phosphor-react';
import { Link } from 'react-router-dom';

export default function BookingDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const toast = useToast();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getBooking(id).then(({ data }) => setBooking(data.booking)).catch(() => {}).finally(() => setLoading(false));
  }, [id]);

  const handleStatusUpdate = async (status) => {
    try {
      const { data } = await updateBooking(id, { status });
      setBooking(data.booking);
      toast.success(`Booking marked as ${status.replace('_', ' ')}`);
    } catch { toast.error('Failed to update booking.'); }
  };

  const handleReview = async () => {
    if (!rating) return toast.error('Please select a rating.');
    setSubmitting(true);
    try {
      await createReview({ bookingId: id, rating, comment });
      toast.success('Review submitted!');
      setRating(0); setComment('');
    } catch (err) { toast.error(err.response?.data?.error || 'Failed to submit review.'); }
    finally { setSubmitting(false); }
  };

  if (loading) return <LoadingSpinner size="lg" />;
  if (!booking) return <div className="page"><div className="container"><p>Booking not found.</p></div></div>;

  const otherPerson = user?.role === 'customer' ? booking.providerId : booking.customerId;
  const isProvider = user?._id === booking.providerId?._id;

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 700, margin: '0 auto' }}>
        <div className="card" style={{ marginBottom: 24 }}>
          <div className="flex-between" style={{ marginBottom: 16 }}>
            <h2 className="heading-md">{booking.requestId?.title || 'Booking Details'}</h2>
            <StatusBadge status={booking.status} />
          </div>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 16, padding: 16, background: 'var(--bg-input)', borderRadius: 'var(--radius-sm)' }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--amber-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--amber)' }}>
              <User size={24} />
            </div>
            <div>
              <strong>{otherPerson?.name}</strong>
              <p className="text-small">{otherPerson?.city} • {otherPerson?.phone}</p>
            </div>
          </div>
          <p><strong>Price:</strong> ₹{booking.quoteId?.price}</p>
          <p><strong>ETA:</strong> {booking.quoteId?.etaHours}h</p>
          <p><strong>Category:</strong> {booking.requestId?.category}</p>
        </div>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 24 }}>
          <Link to={`/chat/${booking._id}`} className="btn btn-secondary"><ChatCircle size={18} /> Chat</Link>
          {isProvider && booking.status === 'confirmed' && (
            <button className="btn btn-primary" onClick={() => handleStatusUpdate('in_progress')}>Start Job</button>
          )}
          {isProvider && booking.status === 'in_progress' && (
            <button className="btn btn-primary" onClick={() => handleStatusUpdate('completed')}>Mark Completed</button>
          )}
          {booking.status === 'completed' && !isProvider && (
            <button className="btn btn-primary"><CurrencyDollar size={18} /> Pay Now</button>
          )}
        </div>

        {booking.status === 'completed' && (
          <div className="card">
            <h3 className="heading-sm" style={{ marginBottom: 16 }}>Leave a Review</h3>
            <StarRating rating={rating} onRate={setRating} size={24} interactive />
            <textarea className="input" placeholder="Write your review..." value={comment} onChange={(e) => setComment(e.target.value)} style={{ width: '100%', marginTop: 12 }} />
            <button className="btn btn-primary btn-sm" onClick={handleReview} disabled={submitting} style={{ marginTop: 12 }}>
              {submitting ? <span className="spinner" style={{ width: 16, height: 16 }} /> : 'Submit Review'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
