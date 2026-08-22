import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Truck, Eye, EyeOff } from 'lucide-react';
import api from '../../services/api';
import { useAuthStore } from '../../store/authStore';

export default function LoginPage() {
  const [identifier, setIdentifier] = useState('+91-9876543210');
  const [password, setPassword] = useState('demo123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { identifier, password });
      if (res.data.success) {
        login(res.data.data.token, res.data.data.agent);
        navigate('/');
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mobile-frame" style={{ background: 'var(--color-bg)' }}>
      {/* Top Banner Area (simulating the image with a gradient) */}
      <div style={{
        height: '35%',
        background: 'linear-gradient(to bottom, #111827, var(--color-bg))',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 40 }}>
          <Truck size={32} color="var(--color-primary)" />
          <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.5px', color: 'white' }}>RAILQUICK</h1>
        </div>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: 12, marginTop: 4 }}>You Order, We Deliver.</p>
        
        {/* Dark overlay fade at bottom of image area */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: 60,
          background: 'linear-gradient(to bottom, transparent, var(--color-bg))'
        }} />
      </div>

      {/* Login Form Area */}
      <div style={{ padding: '0 24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, color: 'white', marginBottom: 4 }}>Delivery Partner Login</h2>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: 13, marginBottom: 32 }}>Login to continue delivering happiness</p>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Mobile Number Input */}
          <div style={{ position: 'relative' }}>
            <div style={{
              position: 'absolute', left: 16, top: 0, bottom: 0, display: 'flex', alignItems: 'center', color: 'var(--color-text-secondary)'
            }}>
              <span style={{ fontSize: 16 }}>👤</span>
            </div>
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="Mobile Number"
              style={{
                width: '100%', padding: '16px 16px 16px 44px',
                background: 'var(--color-surface)', border: '1px solid var(--color-border)',
                borderRadius: 12, color: 'white', fontSize: 15, outline: 'none'
              }}
              required
            />
          </div>

          {/* Password Input */}
          <div style={{ position: 'relative' }}>
            <div style={{
              position: 'absolute', left: 16, top: 0, bottom: 0, display: 'flex', alignItems: 'center', color: 'var(--color-text-secondary)'
            }}>
              <span style={{ fontSize: 16 }}>🔒</span>
            </div>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              style={{
                width: '100%', padding: '16px 44px 16px 44px',
                background: 'var(--color-surface)', border: '1px solid var(--color-border)',
                borderRadius: 12, color: 'white', fontSize: 15, outline: 'none'
              }}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute', right: 16, top: 0, bottom: 0, display: 'flex', alignItems: 'center',
                background: 'none', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer'
              }}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* Options */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--color-text-secondary)', fontSize: 13, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{ accentColor: 'var(--color-primary)', width: 16, height: 16 }}
              />
              Remember me
            </label>
            <button type="button" style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontSize: 13, cursor: 'pointer' }}>
              Forgot Password?
            </button>
          </div>

          {error && (
            <div style={{
              padding: '12px', borderRadius: 8, background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)', color: 'var(--color-critical)', fontSize: 13, textAlign: 'center'
            }}>
              {error}
            </div>
          )}

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', padding: '16px', marginTop: 16,
              background: 'white', color: '#000', border: 'none',
              borderRadius: 12, fontSize: 16, fontWeight: 700, cursor: 'pointer',
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div style={{ marginTop: 'auto', marginBottom: 32, textAlign: 'center' }}>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 13 }}>
            New partner? <span style={{ color: 'var(--color-primary)', cursor: 'pointer' }}>Register Here</span>
          </p>
        </div>
      </div>
    </div>
  );
}
