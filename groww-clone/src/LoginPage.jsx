// src/auth/LoginPage.jsx
import { useState } from 'react';
import { useAuth } from './AuthContext';
import './LoginPage.css';

function ApexLogo({ size = 52 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M50 8L92 82H8L50 8Z" stroke="#22d3ee" strokeWidth="7" strokeLinejoin="round" />
      <path d="M33 62L50 42L67 62" stroke="white" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="50" cy="26" r="4" fill="#22d3ee" />
    </svg>
  );
}

export default function LoginPage() {
  const { login, error, setError } = useAuth();
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [showPass, setShowPass]   = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [shake, setShake]         = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const ok = await login(email, password);
    setSubmitting(false);
    if (!ok) {
      setShake(true);
      setTimeout(() => setShake(false), 600);
    }
  };

  const fillDemo = (role) => {
    setError('');
    if (role === 'admin') {
      setEmail('goraang@apexcrypto.io');
      setPassword('Admin@123');
    } else {
      setEmail('demo@apexcrypto.io');
      setPassword('Demo@123');
    }
  };

  return (
    <div className="login-bg">
      {/* Animated background grid */}
      <div className="login-grid" aria-hidden="true" />

      <div className={`login-card ${shake ? 'shake' : ''}`}>
        {/* Branding */}
        <div className="login-brand">
          <ApexLogo size={52} />
          <h1 className="login-title">Apex<span>Crypto</span></h1>
          <p className="login-subtitle">TERMINAL ACCESS</p>
        </div>

        {/* Error banner */}
        {error && (
          <div className="login-error" role="alert">
            <span className="error-icon">⚠</span>
            {error}
          </div>
        )}

        {/* Form */}
        <form className="login-form" onSubmit={handleSubmit} noValidate>
          <div className="field-group">
            <label className="field-label" htmlFor="email">EMAIL</label>
            <input
              id="email"
              className="field-input"
              type="email"
              placeholder="you@apexcrypto.io"
              value={email}
              onChange={e => { setEmail(e.target.value); setError(''); }}
              required
              autoComplete="email"
              autoFocus
            />
          </div>

          <div className="field-group">
            <label className="field-label" htmlFor="password">PASSWORD</label>
            <div className="pass-wrap">
              <input
                id="password"
                className="field-input"
                type={showPass ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={e => { setPassword(e.target.value); setError(''); }}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                className="pass-toggle"
                onClick={() => setShowPass(v => !v)}
                aria-label={showPass ? 'Hide password' : 'Show password'}
              >
                {showPass ? '🙈' : '👁'}
              </button>
            </div>
          </div>

          <button className="login-btn" type="submit" disabled={submitting}>
            {submitting
              ? <span className="spinner" />
              : 'AUTHORIZE ACCESS'}
          </button>
        </form>

        {/* Quick-fill demo credentials */}
        <div className="demo-section">
          <div className="demo-label">QUICK ACCESS</div>
          <div className="demo-btns">
            <button className="demo-btn admin" onClick={() => fillDemo('admin')}>
              <span className="demo-role">ADMIN</span>
              <span className="demo-hint">Goraang Nayyar</span>
            </button>
            <button className="demo-btn viewer" onClick={() => fillDemo('viewer')}>
              <span className="demo-role">VIEWER</span>
              <span className="demo-hint">Demo User</span>
            </button>
          </div>
        </div>

        <div className="login-footer">
          Secured with JWT · 256-bit encryption
        </div>
      </div>
    </div>
  );
}