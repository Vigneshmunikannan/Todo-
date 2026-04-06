import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';

const DEPARTMENTS = [
  'Computer Science', 'Information Technology', 'Electronics',
  'Mechanical', 'Civil', 'Electrical', 'Chemical', 'Biotechnology', 'Other',
];

const ProfilePage = () => {
  const { user, updateUser } = useAuth();

  const [form, setForm] = useState({
    username:   user?.username   ?? '',
    email:      user?.email      ?? '',
    year:       user?.year       ?? '',
    department: user?.department ?? '',
    age:        user?.age        ?? '',
  });
  const [errors, setErrors]     = useState({});
  const [apiError, setApiError] = useState('');
  const [success, setSuccess]   = useState('');
  const [loading, setLoading]   = useState(false);

  // ── Validation ─────────────────────────────────────────────────────────────
  const validate = () => {
    const e = {};
    if (form.username && form.username.length < 3)
      e.username = 'Min 3 characters';
    if (form.username && !/^[a-zA-Z0-9_]+$/.test(form.username))
      e.username = 'Letters, numbers, underscores only';
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = 'Enter a valid email';
    if (form.year && (form.year < 1 || form.year > 5))
      e.year = 'Year must be 1–5';
    if (form.age && (form.age < 16 || form.age > 100))
      e.age = 'Age must be 16–100';
    return e;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
    setApiError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fieldErrors = validate();
    if (Object.keys(fieldErrors).length) { setErrors(fieldErrors); return; }

    // Only send fields that actually changed
    const updates = {};
    Object.keys(form).forEach((key) => {
      const val = key === 'year' || key === 'age' ? Number(form[key]) : form[key];
      if (val !== (user?.[key])) updates[key] = val;
    });

    if (Object.keys(updates).length === 0) {
      setSuccess('No changes to save.');
      return;
    }

    setLoading(true);
    setApiError('');
    setSuccess('');
    try {
      await updateUser(updates);
      setSuccess('Profile updated successfully! ✅');
    } catch (err) {
      const serverErrors = err.response?.data?.errors;
      if (serverErrors?.length) {
        const mapped = {};
        serverErrors.forEach(({ field, message }) => { mapped[field] = message; });
        setErrors(mapped);
      } else {
        setApiError(err.response?.data?.message || 'Update failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="main-content">
        <div className="page-header">
          <h1 className="page-title">Profile Settings</h1>
          <p className="page-subtitle">Update your account information below</p>
        </div>

        <div className="profile-card">
          {/* Avatar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 32 }}>
            <div className="profile-avatar">
              {user?.username?.slice(0, 2).toUpperCase() ?? '??'}
            </div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#fff' }}>
                {user?.username}
              </div>
              <div style={{ fontSize: 13, color: 'var(--color-muted)', marginTop: 4 }}>
                {user?.email}
              </div>
            </div>
          </div>

          <div className="divider" />

          {/* Alerts */}
          {apiError && (
            <div className="alert alert-error" style={{ marginTop: 0, marginBottom: 20 }}>
              <span>⚠️</span> {apiError}
            </div>
          )}
          {success && (
            <div className="alert alert-success" style={{ marginTop: 0, marginBottom: 20 }}>
              <span>✅</span> {success}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            {/* Username + Email */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="prof-username">Username</label>
                <input
                  id="prof-username"
                  type="text"
                  name="username"
                  className={`form-input ${errors.username ? 'error' : ''}`}
                  value={form.username}
                  onChange={handleChange}
                />
                {errors.username && <p className="field-error">⚡ {errors.username}</p>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="prof-email">Email</label>
                <input
                  id="prof-email"
                  type="email"
                  name="email"
                  className={`form-input ${errors.email ? 'error' : ''}`}
                  value={form.email}
                  onChange={handleChange}
                />
                {errors.email && <p className="field-error">⚡ {errors.email}</p>}
              </div>
            </div>

            {/* Department */}
            <div className="form-group">
              <label className="form-label" htmlFor="prof-department">Department</label>
              <select
                id="prof-department"
                name="department"
                className={`form-input ${errors.department ? 'error' : ''}`}
                value={form.department}
                onChange={handleChange}
                style={{ cursor: 'pointer' }}
              >
                <option value="">Select department</option>
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
              {errors.department && <p className="field-error">⚡ {errors.department}</p>}
            </div>

            {/* Year + Age */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="prof-year">Academic Year (1–5)</label>
                <input
                  id="prof-year"
                  type="number"
                  name="year"
                  min="1" max="5"
                  className={`form-input ${errors.year ? 'error' : ''}`}
                  value={form.year}
                  onChange={handleChange}
                />
                {errors.year && <p className="field-error">⚡ {errors.year}</p>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="prof-age">Age</label>
                <input
                  id="prof-age"
                  type="number"
                  name="age"
                  min="16" max="100"
                  className={`form-input ${errors.age ? 'error' : ''}`}
                  value={form.age}
                  onChange={handleChange}
                />
                {errors.age && <p className="field-error">⚡ {errors.age}</p>}
              </div>
            </div>

            <div className="divider" />

            <button
              id="profile-save"
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? <><div className="spinner" /> Saving…</> : 'Save Changes'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default ProfilePage;
