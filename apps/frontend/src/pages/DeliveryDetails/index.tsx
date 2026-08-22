import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Package, MapPin, Clock, User, Phone, AlertTriangle,
  CheckCircle2, Circle, Navigation, Shield, ChevronRight, Truck, MessageSquare
} from 'lucide-react';
import api from '../../services/api';
import { useDeliveryStore, type DeliveryData } from '../../store/deliveryStore';

const RISK_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
  SAFE: { color: '#22c55e', bg: 'rgba(34, 197, 94, 0.12)', label: 'ON TIME' },
  AT_RISK: { color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.12)', label: 'AT RISK' },
  HIGH_RISK: { color: '#f97316', bg: 'rgba(249, 115, 22, 0.12)', label: 'HIGH RISK' },
  CRITICAL: { color: '#ef4444', bg: 'rgba(239, 68, 68, 0.12)', label: 'SLA BREACH LIKELY' },
};

const TIMELINE_STEPS = [
  { status: 'ASSIGNED', label: 'Assigned', event: 'ASSIGNED' },
  { status: 'ACCEPTED', label: 'Accepted', event: 'ACCEPTED' },
  { status: 'GOING_TO_PICKUP', label: 'Going to Pickup', event: 'ROUTE_STARTED' },
  { status: 'ARRIVED_AT_PICKUP', label: 'Arrived at Pickup', event: 'ARRIVED_PICKUP' },
  { status: 'PICKUP_VERIFICATION', label: 'Pickup Verified', event: 'PICKUP_VERIFIED' },
  { status: 'PICKED_UP', label: 'Package Collected', event: 'PACKAGE_COLLECTED' },
  { status: 'IN_TRANSIT', label: 'In Transit', event: 'ROUTE_STARTED' },
  { status: 'ARRIVED_AT_CUSTOMER', label: 'Arrived at Customer', event: 'ARRIVED_CUSTOMER' },
  { status: 'DELIVERY_VERIFICATION', label: 'OTP Verified', event: 'OTP_VERIFIED' },
  { status: 'DELIVERED', label: 'Delivered', event: 'DELIVERED' },
];

const STATUS_ORDER = [
  'ASSIGNED', 'ACCEPTED', 'GOING_TO_PICKUP', 'ARRIVED_AT_PICKUP',
  'PICKUP_VERIFICATION', 'PICKED_UP', 'IN_TRANSIT', 'ARRIVED_AT_CUSTOMER',
  'DELIVERY_VERIFICATION', 'DELIVERED',
];

export default function DeliveryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { selectedDelivery, setSelectedDelivery, updateDeliveryInList } = useDeliveryStore();
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [risk, setRisk] = useState<any>(null);

  useEffect(() => {
    if (id) fetchDelivery();
  }, [id]);

  const fetchDelivery = async () => {
    try {
      const [delRes, riskRes] = await Promise.all([
        api.get(`/deliveries/${id}`),
        api.get(`/deliveries/${id}/risk`).catch(() => ({ data: { data: null } })),
      ]);
      setSelectedDelivery(delRes.data.data);
      setRisk(riskRes.data.data);
    } catch (err) {
      console.error('Fetch delivery error:', err);
    } finally {
      setLoading(false);
    }
  };

  const performAction = async (endpoint: string, body?: any) => {
    setActionLoading(true);
    try {
      const res = await api.post(`/deliveries/${id}/${endpoint}`, body || {});
      if (res.data.success) {
        setSelectedDelivery(res.data.data);
        updateDeliveryInList(res.data.data);
      }
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Action failed');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading || !selectedDelivery) {
    return (
      <div className="page-content" style={{ padding: 20 }}>
        <div className="skeleton" style={{ height: 200, marginBottom: 16 }} />
        <div className="skeleton" style={{ height: 300 }} />
      </div>
    );
  }

  const d = selectedDelivery;
  const riskCfg = RISK_CONFIG[d.riskLevel] || RISK_CONFIG.SAFE;
  const currentIdx = STATUS_ORDER.indexOf(d.status);
  const isTerminal = ['DELIVERED', 'FAILED', 'CANCELLED'].includes(d.status);

  const getNextAction = (): { label: string; endpoint: string; icon: any } | null => {
    switch (d.status) {
      case 'ASSIGNED': return { label: 'Accept Delivery', endpoint: 'accept', icon: <CheckCircle2 size={18} /> };
      case 'ACCEPTED': return { label: 'Start Pickup', endpoint: 'start-pickup', icon: <Navigation size={18} /> };
      case 'GOING_TO_PICKUP': return { label: 'Arrived at Pickup', endpoint: 'arrive-pickup', icon: <MapPin size={18} /> };
      case 'ARRIVED_AT_PICKUP': return { label: 'Verify Package', endpoint: 'verify-pickup', icon: <Shield size={18} /> };
      case 'PICKUP_VERIFICATION': return { label: 'Confirm Pickup', endpoint: 'confirm-pickup', icon: <Package size={18} /> };
      case 'PICKED_UP': return { label: 'Start Delivery', endpoint: 'start-delivery', icon: <Truck size={18} /> };
      case 'IN_TRANSIT': return { label: 'Arrived at Customer', endpoint: 'arrive-customer', icon: <MapPin size={18} /> };
      case 'ARRIVED_AT_CUSTOMER': return null; // Navigate to OTP page
      case 'DELIVERY_VERIFICATION': return { label: 'Complete Delivery', endpoint: 'complete', icon: <CheckCircle2 size={18} /> };
      default: return null;
    }
  };

  const nextAction = getNextAction();

  return (
    <div className="page-content" style={{ padding: '0' }}>
      {/* Header */}
      <div style={{
        padding: '16px', display: 'flex', alignItems: 'center', gap: 12,
        borderBottom: '1px solid var(--color-border)',
      }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text)', padding: 4 }}>
          <ArrowLeft size={22} />
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 18, fontWeight: 700 }}>#{d.order?.orderNumber}</div>
          <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>{d.order?.priority} Priority</div>
        </div>
        <div className="badge" style={{ background: riskCfg.bg, color: riskCfg.color }}>
          {riskCfg.label}
        </div>
      </div>

      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Risk banner */}
        {risk && risk.riskLevel !== 'SAFE' && (
          <div className="card animate-fade-in-up" style={{
            borderLeft: `3px solid ${riskCfg.color}`,
            padding: '14px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <AlertTriangle size={16} color={riskCfg.color} />
              <span style={{ fontWeight: 600, fontSize: 14, color: riskCfg.color }}>
                Risk Score: {risk.riskScore}/100
              </span>
            </div>
            {risk.reasons?.map((r: string, i: number) => (
              <div key={i} style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: 4, paddingLeft: 24 }}>
                • {r}
              </div>
            ))}
            {risk.recommendedAction && (
              <div style={{
                marginTop: 8, padding: '8px 12px', borderRadius: 8,
                background: `${riskCfg.color}10`, fontSize: 13, fontWeight: 500, color: riskCfg.color,
              }}>
                💡 {risk.recommendedAction}
              </div>
            )}
          </div>
        )}

        {/* Pickup Info */}
        <div className="card">
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Pickup
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <Package size={18} color="var(--color-primary)" />
            <div>
              <div style={{ fontWeight: 600, fontSize: 15 }}>{d.order?.vendor?.name}</div>
              <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>{d.order?.vendor?.address}</div>
            </div>
          </div>
          {d.order?.vendor?.phone && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--color-text-secondary)', paddingLeft: 28 }}>
              <Phone size={12} /> {d.order.vendor.phone}
            </div>
          )}
        </div>

        {/* Customer Info */}
        <div className="card">
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Customer
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <User size={18} color="#f59e0b" />
            <div>
              <div style={{ fontWeight: 600, fontSize: 15 }}>{d.order?.customer?.name}</div>
              <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>{d.order?.customer?.address}</div>
            </div>
          </div>
          {d.order?.customer?.phone && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--color-text-secondary)', paddingLeft: 28 }}>
              <Phone size={12} /> {d.order.customer.phone}
            </div>
          )}
          {d.order?.customer?.deliveryInstructions && (
            <div style={{
              marginTop: 8, padding: '8px 12px', borderRadius: 8, paddingLeft: 28,
              background: 'rgba(99, 102, 241, 0.06)', fontSize: 12, color: 'var(--color-text-secondary)',
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <MessageSquare size={12} /> {d.order.customer.deliveryInstructions}
            </div>
          )}
        </div>

        {/* Items */}
        {d.order?.items && d.order.items.length > 0 && (
          <div className="card">
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Items ({d.order.items.length})
            </div>
            {d.order.items.map((item, i) => (
              <div key={i} style={{
                display: 'flex', justifyContent: 'space-between', padding: '8px 0',
                borderBottom: i < d.order!.items!.length - 1 ? '1px solid var(--color-border)' : 'none',
                fontSize: 14,
              }}>
                <span>{item.name}</span>
                <span style={{ color: 'var(--color-text-secondary)', fontWeight: 600 }}>×{item.quantity}</span>
              </div>
            ))}
          </div>
        )}

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
          <div className="card" style={{ textAlign: 'center', padding: '12px 8px' }}>
            <Clock size={16} color="var(--color-primary)" style={{ margin: '0 auto 4px' }} />
            <div style={{ fontSize: 18, fontWeight: 700 }}>{d.estimatedDeliveryTime || '--'}</div>
            <div style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>ETA (min)</div>
          </div>
          <div className="card" style={{ textAlign: 'center', padding: '12px 8px' }}>
            <MapPin size={16} color="#f59e0b" style={{ margin: '0 auto 4px' }} />
            <div style={{ fontSize: 18, fontWeight: 700 }}>{d.distanceRemaining || '--'}</div>
            <div style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>Dist (km)</div>
          </div>
          <div className="card" style={{ textAlign: 'center', padding: '12px 8px' }}>
            <Shield size={16} color={riskCfg.color} style={{ margin: '0 auto 4px' }} />
            <div style={{ fontSize: 18, fontWeight: 700, color: riskCfg.color }}>{d.riskScore}</div>
            <div style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>Risk</div>
          </div>
        </div>

        {/* Timeline */}
        <div className="card">
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Delivery Timeline
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {TIMELINE_STEPS.map((step, i) => {
              const stepIdx = STATUS_ORDER.indexOf(step.status);
              const isCompleted = currentIdx > stepIdx || (isTerminal && d.status === 'DELIVERED' && stepIdx <= 9);
              const isCurrent = !isTerminal && currentIdx === stepIdx;
              const event = d.events?.find(e => e.eventType === step.event);

              return (
                <div key={i} style={{ display: 'flex', gap: 12, minHeight: 36 }}>
                  {/* Line + dot */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 20 }}>
                    {isCompleted ? (
                      <CheckCircle2 size={18} color="#22c55e" />
                    ) : isCurrent ? (
                      <div style={{
                        width: 18, height: 18, borderRadius: '50%',
                        background: 'var(--color-primary)', border: '3px solid rgba(99,102,241,0.3)',
                      }} className="pulse-dot" />
                    ) : (
                      <Circle size={18} color="var(--color-border)" />
                    )}
                    {i < TIMELINE_STEPS.length - 1 && (
                      <div style={{
                        width: 2, flex: 1, minHeight: 16,
                        background: isCompleted ? '#22c55e' : 'var(--color-border)',
                      }} />
                    )}
                  </div>
                  {/* Label */}
                  <div style={{ paddingBottom: 12 }}>
                    <div style={{
                      fontSize: 13, fontWeight: isCurrent ? 600 : 400,
                      color: isCompleted || isCurrent ? 'var(--color-text)' : 'var(--color-text-secondary)',
                    }}>
                      {step.label}
                    </div>
                    {event && (
                      <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginTop: 2 }}>
                        {new Date(event.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        {!isTerminal && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {d.status === 'ARRIVED_AT_CUSTOMER' ? (
              <button className="btn-primary" onClick={() => navigate(`/delivery/${d.id}/verify`)}
                style={{ fontSize: 16, padding: '16px' }}>
                <Shield size={20} /> Verify & Complete Delivery
              </button>
            ) : nextAction ? (
              <button className="btn-primary" onClick={() => performAction(nextAction.endpoint)}
                disabled={actionLoading} style={{ fontSize: 16, padding: '16px' }}>
                {nextAction.icon} {actionLoading ? 'Processing...' : nextAction.label}
              </button>
            ) : null}

            <button className="btn-secondary"
              onClick={() => navigate(`/delivery/${d.id}/exception`)}>
              <AlertTriangle size={16} /> Report Exception
            </button>
          </div>
        )}

        {/* Terminal state */}
        {isTerminal && (
          <div style={{
            textAlign: 'center', padding: '24px',
            background: d.status === 'DELIVERED' ? 'rgba(34, 197, 94, 0.08)' : 'rgba(239, 68, 68, 0.08)',
            borderRadius: 16, border: `1px solid ${d.status === 'DELIVERED' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
          }}>
            {d.status === 'DELIVERED' ? (
              <CheckCircle2 size={48} color="#22c55e" style={{ margin: '0 auto 12px' }} />
            ) : (
              <AlertTriangle size={48} color="#ef4444" style={{ margin: '0 auto 12px' }} />
            )}
            <div style={{ fontSize: 18, fontWeight: 700 }}>{d.status === 'DELIVERED' ? 'Delivery Completed' : 'Delivery Failed'}</div>
            {d.actualDeliveryTime && (
              <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginTop: 4 }}>
                Completed in {d.actualDeliveryTime} minutes
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
