import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, MapPin, Clock, ChevronRight, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import api from '../../services/api';
import { useDeliveryStore, type DeliveryData } from '../../store/deliveryStore';

const RISK_COLORS: Record<string, string> = {
  SAFE: '#22c55e', AT_RISK: '#f59e0b', HIGH_RISK: '#f97316', CRITICAL: '#ef4444',
};

const STATUS_ICONS: Record<string, any> = {
  DELIVERED: <CheckCircle2 size={14} color="#22c55e" />,
  FAILED: <XCircle size={14} color="#ef4444" />,
  CANCELLED: <XCircle size={14} color="#6b7280" />,
};

const FILTERS = ['all', 'active', 'pending', 'completed', 'failed'];

export default function DeliveriesPage() {
  const navigate = useNavigate();
  const { deliveries, setDeliveries, filter, setFilter } = useDeliveryStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDeliveries();
  }, [filter]);

  const fetchDeliveries = async () => {
    try {
      const res = await api.get(`/deliveries?status=${filter}`);
      setDeliveries(res.data.data);
    } catch (err) {
      console.error('Fetch deliveries error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    if (['DELIVERED'].includes(status)) return '#22c55e';
    if (['FAILED', 'CANCELLED'].includes(status)) return '#ef4444';
    if (status === 'ASSIGNED') return '#8b5cf6';
    return '#6366f1';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      ASSIGNED: 'Pending', ACCEPTED: 'Accepted', GOING_TO_PICKUP: 'To Pickup',
      ARRIVED_AT_PICKUP: 'At Pickup', PICKUP_VERIFICATION: 'Verifying',
      PICKED_UP: 'Picked Up', IN_TRANSIT: 'In Transit',
      ARRIVED_AT_CUSTOMER: 'At Customer', DELIVERY_VERIFICATION: 'Verifying',
      DELIVERED: 'Delivered', FAILED: 'Failed', CANCELLED: 'Cancelled',
    };
    return labels[status] || status;
  };

  return (
    <div className="page-content" style={{ padding: '20px 16px' }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 20, letterSpacing: '-0.5px' }}>Deliveries</h1>

      {/* Filter tabs */}
      <div style={{
        display: 'flex', gap: 6, marginBottom: 20, overflowX: 'auto',
        paddingBottom: 4, WebkitOverflowScrolling: 'touch',
      }}>
        {FILTERS.map((f) => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: '8px 16px', borderRadius: 20, border: 'none', cursor: 'pointer',
            fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap',
            background: filter === f ? 'var(--color-primary)' : 'var(--color-surface)',
            color: filter === f ? 'white' : 'var(--color-text-secondary)',
            transition: 'all 0.2s',
          }}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Delivery Cards */}
      <div className="stagger-children" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 120 }} />
          ))
        ) : deliveries.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 16px', color: 'var(--color-text-secondary)' }}>
            <Package size={48} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
            <div style={{ fontSize: 15, fontWeight: 500 }}>No deliveries found</div>
          </div>
        ) : (
          deliveries.map((d: DeliveryData) => (
            <div key={d.id} className="card" style={{ cursor: 'pointer', padding: '14px 16px' }}
              onClick={() => navigate(`/delivery/${d.id}`)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {STATUS_ICONS[d.status] || <Package size={14} color="var(--color-primary)" />}
                  <span style={{ fontSize: 15, fontWeight: 700 }}>#{d.order?.orderNumber}</span>
                  {d.order?.priority === 'URGENT' && (
                    <span className="badge" style={{ background: 'rgba(239, 68, 68, 0.12)', color: '#ef4444', fontSize: 10 }}>
                      URGENT
                    </span>
                  )}
                  {d.order?.priority === 'HIGH' && (
                    <span className="badge" style={{ background: 'rgba(245, 158, 11, 0.12)', color: '#f59e0b', fontSize: 10 }}>
                      HIGH
                    </span>
                  )}
                </div>
                <span className="badge" style={{
                  background: `${getStatusColor(d.status)}15`,
                  color: getStatusColor(d.status),
                }}>
                  {getStatusLabel(d.status)}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                  <Package size={13} color="var(--color-text-secondary)" />
                  <span style={{ color: 'var(--color-text-secondary)' }}>{d.order?.vendor?.name}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                  <MapPin size={13} color="var(--color-text-secondary)" />
                  <span style={{ color: 'var(--color-text-secondary)' }}>{d.order?.customer?.name}</span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', gap: 16 }}>
                  {d.estimatedDeliveryTime && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--color-text-secondary)' }}>
                      <Clock size={12} /> {d.estimatedDeliveryTime}m
                    </div>
                  )}
                  {d.distanceRemaining && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--color-text-secondary)' }}>
                      <MapPin size={12} /> {d.distanceRemaining}km
                    </div>
                  )}
                  {d.riskLevel !== 'SAFE' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: RISK_COLORS[d.riskLevel] }}>
                      <AlertTriangle size={12} /> {d.riskLevel.replace('_', ' ')}
                    </div>
                  )}
                </div>
                <ChevronRight size={16} color="var(--color-text-secondary)" />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
