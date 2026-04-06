import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';

const DashboardPage = () => {
  const { user } = useAuth();

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'long', year: 'numeric',
      })
    : '—';

  const stats = [
    { icon: '📅', value: `Year ${user?.year ?? '—'}`, label: 'Academic Year' },
    { icon: '🏫', value: user?.department ?? '—', label: 'Department' },
    { icon: '🎂', value: `${user?.age ?? '—'} yrs`, label: 'Age' },
    { icon: '📆', value: memberSince, label: 'Member Since' },
  ];

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="main-content">
        {/* Header */}
        <div className="page-header">
          <h1 className="page-title">
            👋 Hello, <span style={{ color: 'var(--color-primary)' }}>{user?.username}</span>!
          </h1>
          <p className="page-subtitle">
            Welcome to your personal dashboard. Here's a snapshot of your account.
          </p>
        </div>

        {/* Stats */}
        <div className="stats-grid">
          {stats.map((s) => (
            <div key={s.label} className="stat-card">
              <span className="stat-icon">{s.icon}</span>
              <span className="stat-value" style={{ fontSize: s.label === 'Department' || s.label === 'Member Since' ? 16 : 28 }}>
                {s.value}
              </span>
              <span className="stat-label">{s.label}</span>
            </div>
          ))}
        </div>

        {/* Account Info Card */}
        <div className="profile-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 8 }}>
            <div className="profile-avatar">
              {user?.username?.slice(0, 2).toUpperCase() ?? '??'}
            </div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#fff' }}>
                {user?.username}
              </div>
              <div style={{ fontSize: 14, color: 'var(--color-muted)', marginTop: 4 }}>
                {user?.email}
              </div>
              <span className="badge badge-purple" style={{ marginTop: 8 }}>
                Active Account
              </span>
            </div>
          </div>

          <div className="divider" />

          <div className="profile-meta">
            <div className="meta-item">
              <span className="meta-label">User ID</span>
              <span className="meta-value" style={{ fontSize: 12, fontFamily: 'monospace', color: 'var(--color-muted)' }}>
                {user?.id}
              </span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Email</span>
              <span className="meta-value">{user?.email}</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Department</span>
              <span className="meta-value">{user?.department}</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Academic Year</span>
              <span className="meta-value">Year {user?.year}</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Age</span>
              <span className="meta-value">{user?.age}</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Account Created</span>
              <span className="meta-value">{memberSince}</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
