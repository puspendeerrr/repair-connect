import { useState, useEffect } from 'react';
import { getUsers, toggleUserActive, verifyProvider } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import { MagnifyingGlass, ShieldCheck, Prohibit } from 'phosphor-react';

export default function AdminUsersPage() {
  const toast = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  const loadUsers = async () => {
    setLoading(true);
    try {
      const params = { limit: 50 };
      if (search) params.search = search;
      if (roleFilter) params.role = roleFilter;
      const { data } = await getUsers(params);
      setUsers(data.users);
    } catch { /* ignore */ } finally { setLoading(false); }
  };

  useEffect(() => { loadUsers(); }, [roleFilter]);

  const handleToggle = async (id) => {
    try {
      await toggleUserActive(id);
      toast.success('User status updated.');
      loadUsers();
    } catch { toast.error('Failed to update user.'); }
  };

  const handleVerify = async (id) => {
    try {
      await verifyProvider(id);
      toast.success('Provider verified!');
      loadUsers();
    } catch { toast.error('Failed to verify provider.'); }
  };

  return (
    <div className="page">
      <div className="container">
        <div className="page-header"><h1>User Management</h1><p>Search, filter, and manage platform users</p></div>
        <div className="card" style={{ padding: 16, marginBottom: 24, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
            <MagnifyingGlass size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input className="input" placeholder="Search by name or email..." value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && loadUsers()} style={{ paddingLeft: 38, width: '100%' }} />
          </div>
          {['', 'customer', 'provider', 'admin'].map((r) => (
            <button key={r} className={`btn btn-sm ${roleFilter === r ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setRoleFilter(r)}>{r || 'All'}</button>
          ))}
        </div>

        {loading ? <LoadingSpinner /> : (
          <div className="card" style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead><tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left' }}>
                <th style={{ padding: '10px 12px', color: 'var(--text-muted)' }}>Name</th>
                <th style={{ padding: '10px 12px', color: 'var(--text-muted)' }}>Email</th>
                <th style={{ padding: '10px 12px', color: 'var(--text-muted)' }}>Role</th>
                <th style={{ padding: '10px 12px', color: 'var(--text-muted)' }}>Status</th>
                <th style={{ padding: '10px 12px', color: 'var(--text-muted)' }}>Actions</th>
              </tr></thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '10px 12px' }}>{u.name}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--text-muted)' }}>{u.email}</td>
                    <td style={{ padding: '10px 12px' }}><span className={`badge ${u.role === 'provider' ? 'badge-amber' : u.role === 'admin' ? 'badge-red' : 'badge-cyan'}`}>{u.role}</span></td>
                    <td style={{ padding: '10px 12px' }}><span className={`badge ${u.isActive ? 'badge-green' : 'badge-red'}`}>{u.isActive ? 'Active' : 'Inactive'}</span></td>
                    <td style={{ padding: '10px 12px', display: 'flex', gap: 6 }}>
                      <button className="btn btn-sm btn-secondary" onClick={() => handleToggle(u._id)} title={u.isActive ? 'Deactivate' : 'Activate'}>
                        <Prohibit size={14} />
                      </button>
                      {u.role === 'provider' && (
                        <button className="btn btn-sm btn-primary" onClick={() => handleVerify(u._id)} title="Verify Provider">
                          <ShieldCheck size={14} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
