import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Wrench, Bell, SignOut, List, X, User } from 'phosphor-react';
import { useState } from 'react';
import './Navbar.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  const getDashboardPath = () => {
    if (!user) return '/login';
    if (user.role === 'admin') return '/admin/dashboard';
    if (user.role === 'provider') return '/provider/dashboard';
    return '/customer/dashboard';
  };

  return (
    <nav className="navbar">
      <div className="navbar-inner container">
        <Link to="/" className="navbar-brand">
          <Wrench size={24} weight="fill" />
          <span>Repair Connect</span>
        </Link>

        <div className={`navbar-links ${mobileOpen ? 'open' : ''}`}>
          {!user ? (
            <>
              <Link to="/" className={location.pathname === '/' ? 'active' : ''}>Home</Link>
              <Link to="/login" className="btn btn-primary btn-sm">Get Started</Link>
            </>
          ) : (
            <>
              <Link to={getDashboardPath()} className="nav-link">Dashboard</Link>
              {user.role === 'customer' && (
                <>
                  <Link to="/customer/post-request" className="nav-link">Post Request</Link>
                  <Link to="/customer/bookings" className="nav-link">My Bookings</Link>
                </>
              )}
              {user.role === 'provider' && (
                <>
                  <Link to="/provider/browse" className="nav-link">Browse Jobs</Link>
                  <Link to="/provider/my-quotes" className="nav-link">My Quotes</Link>
                  <Link to="/provider/bookings" className="nav-link">Bookings</Link>
                </>
              )}
              {user.role === 'admin' && (
                <>
                  <Link to="/admin/users" className="nav-link">Users</Link>
                  <Link to="/admin/disputes" className="nav-link">Disputes</Link>
                </>
              )}
              <Link to="/notifications" className="nav-icon-btn">
                <Bell size={20} />
              </Link>
              <div className="nav-user">
                <div className="nav-avatar">
                  {user.profileImage ? (
                    <img src={user.profileImage} alt={user.name} />
                  ) : (
                    <User size={18} />
                  )}
                </div>
                <span className="nav-username">{user.name}</span>
                <button onClick={handleLogout} className="nav-icon-btn" title="Logout">
                  <SignOut size={18} />
                </button>
              </div>
            </>
          )}
        </div>

        <button className="mobile-toggle" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X size={24} /> : <List size={24} />}
        </button>
      </div>
    </nav>
  );
}
