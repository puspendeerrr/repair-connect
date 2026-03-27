export default function StatusBadge({ status }) {
  const map = {
    open: 'badge-cyan',
    quoted: 'badge-amber',
    booked: 'badge-amber',
    confirmed: 'badge-amber',
    in_progress: 'badge-cyan',
    completed: 'badge-green',
    closed: 'badge-muted',
    cancelled: 'badge-red',
    disputed: 'badge-red',
    pending: 'badge-amber',
    accepted: 'badge-green',
    rejected: 'badge-red',
    success: 'badge-green',
    failed: 'badge-red',
    normal: 'badge-muted',
    urgent: 'badge-amber',
    emergency: 'badge-red',
  };
  const label = (status || '').replace(/_/g, ' ');
  return <span className={`badge ${map[status] || 'badge-muted'}`}>{label}</span>;
}
