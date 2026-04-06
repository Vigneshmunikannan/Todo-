import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV_ITEMS = [
  { icon: '📊', label: 'Dashboard', path: '/dashboard' },
  { icon: '👤', label: 'Profile',   path: '/profile' },
];

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const initials = user?.username
    ? user.username.slice(0, 2).toUpperCase()
    : '??';

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">✅</div>
        <span className="sidebar-logo-text">TodoAuth</span>
      </div>

      {/* User chip */}
      <div className="sidebar-user">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 34, height: 34, borderRadius: '50%',
              background: 'linear-gradient(135deg, #6c63ff, #ff6b9d)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 700, fontSize: 13, color: '#fff', flexShrink: 0,
            }}
          >
            {initials}
          </div>
          <div>
            <div className="sidebar-user-name">@{user?.username}</div>
            <div className="sidebar-user-dept">{user?.department}</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="sidebar-nav">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
          >
            <span className="nav-item-icon">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>

      {/* Logout */}
      <div className="sidebar-footer">
        <button
          id="sidebar-logout"
          className="nav-item"
          onClick={handleLogout}
          style={{ color: '#f87171', width: '100%' }}
        >
          <span className="nav-item-icon">🚪</span>
          Sign Out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
