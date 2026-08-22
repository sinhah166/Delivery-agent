import { Outlet, NavLink } from 'react-router-dom';
import { Home, Package, Navigation, Activity, User } from 'lucide-react';
import MobileFrame from './MobileFrame';

export default function AppLayout() {
  return (
    <MobileFrame>
      <Outlet />
      
      {/* Bottom Navigation */}
      <nav className="bottom-nav" style={{ 
        background: 'var(--color-bg)', borderTop: '1px solid var(--color-border)',
        display: 'flex', justifyContent: 'space-around', padding: '12px 0', paddingBottom: 'calc(12px + env(safe-area-inset-bottom))'
      }}>
        <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} style={({ isActive }) => ({ color: isActive ? 'var(--color-primary)' : 'var(--color-text-secondary)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, textDecoration: 'none', fontSize: 11, fontWeight: isActive ? 600 : 500 })}>
          <Home size={22} />
          <span>Home</span>
        </NavLink>
        <NavLink to="/deliveries" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} style={({ isActive }) => ({ color: isActive ? 'var(--color-primary)' : 'var(--color-text-secondary)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, textDecoration: 'none', fontSize: 11, fontWeight: isActive ? 600 : 500 })}>
          <Package size={22} />
          <span>Deliveries</span>
        </NavLink>
        <NavLink to="/performance" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} style={({ isActive }) => ({ color: isActive ? 'var(--color-primary)' : 'var(--color-text-secondary)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, textDecoration: 'none', fontSize: 11, fontWeight: isActive ? 600 : 500 })}>
          <Activity size={22} />
          <span>Earnings</span>
        </NavLink>
        <NavLink to="/profile" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} style={({ isActive }) => ({ color: isActive ? 'var(--color-primary)' : 'var(--color-text-secondary)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, textDecoration: 'none', fontSize: 11, fontWeight: isActive ? 600 : 500 })}>
          <User size={22} />
          <span>Profile</span>
        </NavLink>
      </nav>
    </MobileFrame>
  );
}
