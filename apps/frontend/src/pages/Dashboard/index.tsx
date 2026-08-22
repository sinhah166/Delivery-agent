import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Star, Train, MapPin, ChevronRight, User } from 'lucide-react';
import api from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { useDeliveryStore, type DeliveryData } from '../../store/deliveryStore';

export default function DashboardPage() {
  const navigate = useNavigate();
  const agent = useAuthStore((s) => s.agent);
  const updateAgent = useAuthStore((s) => s.updateAgent);
  const { activeDelivery, setActiveDelivery, setDeliveries } = useDeliveryStore();
  const [performance, setPerformance] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [activeRes, allRes, perfRes] = await Promise.all([
        api.get('/deliveries/active'),
        api.get('/deliveries'),
        api.get('/agents/me/performance'),
      ]);
      setActiveDelivery(activeRes.data.data);
      setDeliveries(allRes.data.data);
      setPerformance(perfRes.data.data);
    } catch (err) {
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async () => {
    const newStatus = agent?.status === 'ONLINE' ? 'OFFLINE' : 'ONLINE';
    try {
      await api.patch('/agents/me/status', { status: newStatus });
      updateAgent({ status: newStatus });
    } catch (err) {
      console.error('Status toggle error:', err);
    }
  };

  return (
    <div className="page-content" style={{ background: 'var(--color-bg)', minHeight: '100%', color: 'white' }}>
      
      {/* Header section */}
      <div style={{ padding: '24px 20px 16px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Menu size={24} color="white" />
          <div 
            onClick={toggleStatus}
            style={{ 
              display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer',
              background: agent?.status === 'ONLINE' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(156, 163, 175, 0.1)',
              padding: '6px 12px', borderRadius: 20
            }}
          >
            <span style={{ fontSize: 13, fontWeight: 600, color: 'white' }}>
              {agent?.status === 'ONLINE' ? 'Online' : 'Offline'}
            </span>
            <div style={{
              width: 32, height: 18, borderRadius: 10, position: 'relative',
              background: agent?.status === 'ONLINE' ? 'var(--color-safe)' : '#4B5563',
              transition: 'all 0.3s'
            }}>
              <div style={{
                width: 14, height: 14, borderRadius: '50%', background: 'white',
                position: 'absolute', top: 2, left: agent?.status === 'ONLINE' ? 16 : 2,
                transition: 'all 0.3s'
              }} />
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 2 }}>Good Morning,</div>
            <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 6 }}>{agent?.name || 'Agent'}</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--color-text-secondary)' }}>
              <Star size={14} color="#FBBF24" fill="#FBBF24" />
              <span style={{ color: 'white', fontWeight: 600 }}>{performance?.rating?.toFixed(1) || '0.0'}</span>
              <span>({performance?.totalDeliveries || 0} Deliveries)</span>
            </div>
          </div>
          <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--color-surface-2)', overflow: 'hidden' }}>
            {/* Avatar placeholder */}
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#2563EB' }}>
              <User size={24} color="white" />
            </div>
          </div>
        </div>
      </div>

      {/* Active Delivery Section */}
      <div style={{ padding: '0 20px' }}>
        {activeDelivery ? (
          <div style={{ background: 'var(--color-surface)', borderRadius: 16, overflow: 'hidden' }}>
            <div style={{ padding: '16px', borderBottom: '1px solid var(--color-border)' }}>
              <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: 4 }}>Active Delivery</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: 18, fontWeight: 700 }}>#{activeDelivery.order?.orderNumber}</div>
                <div style={{ 
                  background: 'rgba(28, 100, 242, 0.15)', color: 'var(--color-primary)', 
                  padding: '4px 10px', borderRadius: 4, fontSize: 10, fontWeight: 700, letterSpacing: '0.5px' 
                }}>
                  {activeDelivery.status.replace(/_/g, ' ')}
                </div>
              </div>
            </div>

            <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Train Info */}
              <div style={{ display: 'flex', gap: 12 }}>
                <Train size={20} color="var(--color-text-secondary)" style={{ marginTop: 2 }} />
                <div>
                  <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginBottom: 2 }}>Train</div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>
                    {activeDelivery.order?.trainNumber} - {activeDelivery.order?.trainName}
                  </div>
                </div>
              </div>

              {/* Stations */}
              <div style={{ display: 'flex', gap: 40, marginLeft: 32 }}>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginBottom: 2 }}>From</div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>New Delhi (NDLS)</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginBottom: 2 }}>To</div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>Jaipur (JP)</div>
                </div>
              </div>

              {/* Coach / Seat / Passenger */}
              <div style={{ display: 'flex', gap: 40, marginLeft: 32, marginTop: 4 }}>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginBottom: 2 }}>Coach / Seat</div>
                  <div style={{ fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 16, height: 16, background: 'rgba(255,255,255,0.1)', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9 }}>💺</div>
                    {activeDelivery.order?.coach} / {activeDelivery.order?.seat}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginBottom: 2 }}>Passenger</div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{activeDelivery.order?.customer?.name}</div>
                </div>
              </div>
            </div>

            <div style={{ padding: '16px' }}>
              <button 
                onClick={() => navigate(`/delivery/${activeDelivery.id}`)}
                style={{
                  width: '100%', background: 'var(--color-primary)', color: 'white',
                  border: 'none', padding: '14px', borderRadius: 10,
                  fontSize: 14, fontWeight: 600, cursor: 'pointer'
                }}
              >
                View Details
              </button>
            </div>
          </div>
        ) : (
          <div style={{ background: 'var(--color-surface)', borderRadius: 16, padding: '32px 16px', textAlign: 'center' }}>
            <Train size={40} color="var(--color-text-secondary)" style={{ margin: '0 auto 12px' }} />
            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>No Active Delivery</div>
            <div style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>New train deliveries will appear here</div>
            <button 
              onClick={() => navigate('/deliveries')}
              style={{
                background: 'var(--color-primary)', color: 'white',
                border: 'none', padding: '10px 20px', borderRadius: 8,
                fontSize: 13, fontWeight: 600, cursor: 'pointer', marginTop: 16
              }}
            >
              View Deliveries
            </button>
          </div>
        )}
      </div>

      {/* Today's Summary */}
      <div style={{ padding: '24px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ fontSize: 15, fontWeight: 600 }}>Today's Summary</h2>
          <span style={{ fontSize: 13, color: 'var(--color-primary)', cursor: 'pointer' }}>View All</span>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ flex: 1, background: 'var(--color-surface)', padding: '16px', borderRadius: 12, textAlign: 'center' }}>
            <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>{performance?.totalDeliveries || '06'}</div>
            <div style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>Deliveries</div>
          </div>
          <div style={{ flex: 1, background: 'var(--color-surface)', padding: '16px', borderRadius: 12, textAlign: 'center' }}>
            <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>05</div>
            <div style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>Completed</div>
          </div>
          <div style={{ flex: 1.2, background: 'var(--color-surface)', padding: '16px', borderRadius: 12, textAlign: 'center' }}>
            <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>₹1,240</div>
            <div style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>Earnings</div>
          </div>
        </div>
      </div>

    </div>
  );
}
