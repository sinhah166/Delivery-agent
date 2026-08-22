import { useNavigate } from 'react-router-dom';
import { ChevronLeft, User, CreditCard, Truck, HelpCircle, Bell, Info, LogOut, Star } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import api from '../../services/api';

export default function ProfilePage() {
  const navigate = useNavigate();
  const agent = useAuthStore((s) => s.agent);
  const logout = useAuthStore((s) => s.logout);

  const handleLogout = async () => {
    try {
      if (agent) {
        await api.patch('/agents/me/status', { status: 'OFFLINE' });
      }
    } catch (err) {
      console.error('Failed to set offline before logout', err);
    }
    logout();
    navigate('/login');
  };

  const menuItems = [
    { icon: <User size={20} />, label: 'Personal Information' },
    { icon: <CreditCard size={20} />, label: 'Bank Details' },
    { icon: <Truck size={20} />, label: 'My Vehicles' },
    { icon: <HelpCircle size={20} />, label: 'Help & Support' },
    { icon: <Bell size={20} />, label: 'Notification Settings' },
    { icon: <Info size={20} />, label: 'About Us' },
  ];

  return (
    <div className="page-content" style={{ background: 'var(--color-bg)', minHeight: '100%', color: 'white', display: 'flex', flexDirection: 'column' }}>
      
      {/* Header */}
      <div style={{ padding: '24px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
        <ChevronLeft size={24} color="white" onClick={() => navigate(-1)} style={{ cursor: 'pointer' }} />
        <h1 style={{ fontSize: 18, fontWeight: 700, flex: 1, textAlign: 'center', marginRight: 24 }}>Profile</h1>
      </div>

      <div style={{ padding: '0 20px', flex: 1 }}>
        {/* Profile Info */}
        <div style={{ 
          display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32,
          background: 'var(--color-surface)', padding: '20px', borderRadius: 16
        }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <User size={32} color="white" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>{agent?.name || 'Agent'} <span>✓</span></h2>
            </div>
            <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 4 }}>{agent?.phone || '+91 98765 43210'}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--color-text-secondary)' }}>
              <Star size={14} color="#FBBF24" fill="#FBBF24" />
              <span style={{ color: 'white', fontWeight: 600 }}>{agent?.rating?.toFixed(1) || '4.8'}</span>
              <span>({agent?.totalDeliveries || '120'} Deliveries)</span>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <div style={{ background: 'var(--color-surface)', borderRadius: 16, padding: '8px 0' }}>
          {menuItems.map((item, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '16px 20px', borderBottom: i < menuItems.length - 1 ? '1px solid var(--color-border)' : 'none',
              cursor: 'pointer'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ color: 'var(--color-text-secondary)' }}>{item.icon}</div>
                <div style={{ fontSize: 14, fontWeight: 500 }}>{item.label}</div>
              </div>
              <ChevronLeft size={20} color="var(--color-text-secondary)" style={{ transform: 'rotate(180deg)' }} />
            </div>
          ))}
        </div>

        {/* Logout Button */}
        <button 
          onClick={handleLogout}
          style={{ 
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            width: '100%', padding: '16px', marginTop: 32, marginBottom: 32,
            background: 'none', border: 'none', color: '#ef4444', fontSize: 15, fontWeight: 600, cursor: 'pointer'
          }}
        >
          <LogOut size={20} />
          Logout
        </button>
      </div>

    </div>
  );
}
