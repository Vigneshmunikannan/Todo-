import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const DEPARTMENTS = [
  'Computer Science', 'Information Technology', 'Electronics',
  'Mechanical', 'Civil', 'Electrical', 'Chemical', 'Biotechnology', 'Other',
];

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [form, setForm] = useState({
    username: '', email: '', password: '',
    year: '', department: '', age: '',
  });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);

  // ── Validation ─────────────────────────────────────────────────────────────
  const validate = () => {
    const e = {};
    if (!form.username.trim()) e.username = 'Username is required';
    else if (form.username.length < 3) e.username = 'Min 3 characters';
    else if (!/^[a-zA-Z0-9_]+$/.test(form.username)) e.username = 'Letters, numbers, underscores only';

    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email';

    if (!form.password) e.password = 'Password is required';
    else if (form.password.length < 8) e.password = 'Min 8 characters';
    else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(form.password))
      e.password = 'Must have uppercase, lowercase and a number';

    if (!form.year) e.year = 'Year is required';
    else if (form.year < 1 || form.year > 5) e.year = 'Year must be 1–5';

    if (!form.department) e.department = 'Department is required';

    if (!form.age) e.age = 'Age is required';
    else if (form.age < 16 || form.age > 100) e.age = 'Age must be 16–100';

    return e;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
    setApiError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fieldErrors = validate();
    if (Object.keys(fieldErrors).length) { setErrors(fieldErrors); return; }

    setLoading(true);
    setApiError('');
    try {
      await register({
        ...form,
        year: Number(form.year),
        age: Number(form.age),
      });
      navigate('/dashboard', { replace: true });
    } catch (err) {
      const serverErrors = err.response?.data?.errors;
      if (serverErrors?.length) {
        const mapped = {};
        serverErrors.forEach(({ field, message }) => { mapped[field] = message; });
        setErrors(mapped);
      } else {
        setApiError(err.response?.data?.message || 'Registration failed. Try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ maxWidth: 560 }}>

        {/* Logo */}
        <div className="auth-logo">
          <div className="auth-logo-icon">✅</div>
          <span className="auth-logo-text">TodoAuth</span>
        </div>

        <h1 className="auth-title">Create account</h1>
        <p className="auth-subtitle">Join TodoAuth — it's free forever</p>

        {apiError && (
          <div className="alert alert-error">
            <span>⚠️</span> {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {/* Row 1: Username + Email */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="reg-username">Username</label>
              <input
                id="reg-username"
                type="text"
                name="username"
                className={`form-input ${errors.username ? 'error' : ''}`}
                placeholder="john_doe"
                value={form.username}
                onChange={handleChange}
                autoComplete="username"
              />
              {errors.username && <p className="field-error">⚡ {errors.username}</p>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-email">Email</label>
              <input
                id="reg-email"
                type="email"
                name="email"
                className={`form-input ${errors.email ? 'error' : ''}`}
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
              />
              {errors.email && <p className="field-error">⚡ {errors.email}</p>}
            </div>
          </div>

          {/* Password */}
          <div className="form-group">
            <label className="form-label" htmlFor="reg-password">Password</label>
            <input
              id="reg-password"
              type="password"
              name="password"
              className={`form-input ${errors.password ? 'error' : ''}`}
              placeholder="Min 8 chars — uppercase, lowercase, number"
              value={form.password}
              onChange={handleChange}
              autoComplete="new-password"
            />
            {errors.password && <p className="field-error">⚡ {errors.password}</p>}
          </div>

          {/* Row 2: Department */}
          <div className="form-group">
            <label className="form-label" htmlFor="reg-department">Department</label>
            <select
              id="reg-department"
              name="department"
              className={`form-input ${errors.department ? 'error' : ''}`}
              value={form.department}
              onChange={handleChange}
              style={{ cursor:'pointer' }}
            >
              <option value="">Select department</option>
              {DEPARTMENTS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
            {errors.department && <p className="field-error">⚡ {errors.department}</p>}
          </div>

          {/* Row 3: Year + Age */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="reg-year">Year (1–5)</label>
              <input
                id="reg-year"
                type="number"
                name="year"
                min="1" max="5"
                className={`form-input ${errors.year ? 'error' : ''}`}
                placeholder="e.g. 2"
                value={form.year}
                onChange={handleChange}
              />
              {errors.year && <p className="field-error">⚡ {errors.year}</p>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-age">Age</label>
              <input
                id="reg-age"
                type="number"
                name="age"
                min="16" max="100"
                className={`form-input ${errors.age ? 'error' : ''}`}
                placeholder="e.g. 20"
                value={form.age}
                onChange={handleChange}
              />
              {errors.age && <p className="field-error">⚡ {errors.age}</p>}
            </div>
          </div>

          <button
            id="register-submit"
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? <><div className="spinner" /> Creating account…</> : 'Create Account →'}
          </button>
        </form>

        <div className="auth-switch">
          Already have an account?{' '}
          <Link to="/login" className="btn btn-ghost">Sign in</Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
