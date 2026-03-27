import { useState, useEffect } from 'react';
import { Users, ClipboardText, Briefcase, CurrencyDollar, WarningCircle } from 'phosphor-react';
import { getUsers, getBookings } from '../../services/api';
import LoadingSpinner from '../../components/shared/LoadingSpinner';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ users: 0, providers: 0, bookings: 0, disputes: 0 });
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [uRes, bRes] = await Promise.all([getUsers({ limit: 10 }), getBookings({ limit: 100 })]);
        const allUsers = uRes.data;
        setRecentUsers(allUsers.users.slice(0, 8));
        setStats({
          users: allUsers.total,
          providers: allUsers.users.filter((u) => u.role === 'provider').length,
          bookings: bRes.data.total,
          disputes: bRes.data.bookings.filter((b) => b.status === 'disputed').length,
        });
      } catch { /* ignore */ } finally { setLoading(false); }
    };
    load();
  }, []);

  if (loading) return <LoadingSpinner size="lg" text="Loading admin dashboard..." />;

  return (
    <div className="page">
      <div className="container">
        <div className="page-header"><h1>Admin Dashboard</h1><p>Platform overview and management</p></div>
        <div className="stats-grid">
          <div className="stat-card"><div className="stat-icon" style={{ background: 'var(--cyan-light)', color: 'var(--cyan)' }}><Users size={22} weight="fill" /></div><div className="stat-label">Total Users</div><div className="stat-value text-cyan">{stats.users}</div></div>
          <div className="stat-card"><div className="stat-icon" style={{ background: 'var(--amber-light)', color: 'var(--amber)' }}><ClipboardText size={22} weight="fill" /></div><div className="stat-label">Providers</div><div className="stat-value text-amber">{stats.providers}</div></div>
          <div className="stat-card"><div className="stat-icon" style={{ background: 'var(--green-light)', color: 'var(--green)' }}><Briefcase size={22} weight="fill" /></div><div className="stat-label">Total Bookings</div><div className="stat-value" style={{ color: 'var(--green)' }}>{stats.bookings}</div></div>
          <div className="stat-card"><div className="stat-icon" style={{ background: 'var(--red-light)', color: 'var(--red)' }}><WarningCircle size={22} weight="fill" /></div><div className="stat-label">Disputes</div><div className="stat-value" style={{ color: 'var(--red)' }}>{stats.disputes}</div></div>
        </div>
        <div className="card">
          <h3 className="heading-sm" style={{ marginBottom: 16 }}>Recent Registrations</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead><tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left' }}>
                <th style={{ padding: '10px 12px', color: 'var(--text-muted)', fontWeight: 500 }}>Name</th>
                <th style={{ padding: '10px 12px', color: 'var(--text-muted)', fontWeight: 500 }}>Email</th>
                <th style={{ padding: '10px 12px', color: 'var(--text-muted)', fontWeight: 500 }}>Role</th>
                <th style={{ padding: '10px 12px', color: 'var(--text-muted)', fontWeight: 500 }}>City</th>
              </tr></thead>
              <tbody>
                {recentUsers.map((u) => (
                  <tr key={u._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '10px 12px' }}>{u.name}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--text-muted)' }}>{u.email}</td>
                    <td style={{ padding: '10px 12px' }}><span className={`badge ${u.role === 'provider' ? 'badge-amber' : 'badge-cyan'}`}>{u.role}</span></td>
                    <td style={{ padding: '10px 12px', color: 'var(--text-muted)' }}>{u.city || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
