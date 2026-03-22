import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function Login() {
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const { login } = useAuth();
  const navigate  = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim())  return toast.error('Email address is required');
    if (!password)      return toast.error('Password is required');

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) return toast.error('Enter a valid email address');

    setLoading(true);
    try {
      await login(email.trim(), password);
      toast.success('Welcome back! 👋');
      navigate('/', { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'linear-gradient(160deg,#1a4fd6 0%,#0e2a8a 100%)' }}>
      {/* Logo area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'white', padding: '40px 24px 32px' }}>
        <div style={{ fontSize: 56, marginBottom: 10 }}></div>
        <h1 style={{ fontSize: 32, fontWeight: 800, margin: 0 }}>CreditBook</h1>
        <p style={{ opacity: .7, marginTop: 8, fontSize: 14 }}>Digital Ledger App</p>
      </div>

      {/* Login card — slides up from bottom */}
      <div style={{ background: 'white', borderRadius: '24px 24px 0 0', padding: '32px 24px 48px' }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>Welcome back 👋</h2>
        <p style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 28 }}>Login to manage your business</p>

        <form onSubmit={handleSubmit}>
          {/* Email */}
          <div className="field">
            <label>Email Address</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 16 }}>✉️</span>
              <input
                type="email" inputMode="email"
                placeholder="Enter your email"
                value={email} onChange={e => setEmail(e.target.value)}
                autoFocus autoComplete="email"
                style={{ flex: 1, fontSize: 15, background: 'transparent', border: 'none', outline: 'none' }}
              />
            </div>
          </div>

          {/* Password */}
          <div className="field">
            <label>Password</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 16 }}>🔒</span>
              <input
                type={showPass ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password} onChange={e => setPassword(e.target.value)}
                autoComplete="current-password"
                style={{ flex: 1, fontSize: 15, background: 'transparent', border: 'none', outline: 'none' }}
              />
              <button type="button" onClick={() => setShowPass(s => !s)} style={{ fontSize: 16, color: 'var(--text3)', flexShrink: 0, background: 'none', border: 'none', cursor: 'pointer' }}>
                {showPass ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', padding: '15px', borderRadius: 50,
              background: loading ? 'var(--border)' : 'linear-gradient(135deg,#1a4fd6,#0e2a8a)',
              color: 'white', fontSize: 15, fontWeight: 700, border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer', marginTop: 8,
              boxShadow: loading ? 'none' : '0 4px 20px rgba(26,79,214,.35)',
              transition: 'all .2s', fontFamily: 'inherit'
            }}>
            {loading ? 'Logging in…' : '🔓 Login'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <p style={{ fontSize: 14, color: 'var(--text3)' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: 'var(--blue)', fontWeight: 700 }}>Create account</Link>
          </p>
        </div>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '24px 0' }}>
          <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          <span style={{ fontSize: 12, color: 'var(--text4)', fontWeight: 600 }}>YOUR DETAILS ARE SAFE</span>
          <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
        </div>

        {/* Trust badges */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 20 }}>
          {[
            { icon: '🔒', text: 'Encrypted' },
            { icon: '🛡️', text: 'Secure' },
            { icon: '📱', text: 'Private' },
          ].map(({ icon, text }) => (
            <div key={text} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 20 }}>{icon}</div>
              <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--text3)', marginTop: 3 }}>{text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
