import { useEffect, useState, useRef } from 'react';
import { Navigation2, MapPin, Package, AlertTriangle, Route } from 'lucide-react';
import { useDeliveryStore } from '../../store/deliveryStore';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';

export default function NavigationPage() {
  const navigate = useNavigate();
  const { activeDelivery } = useDeliveryStore();
  const [routeData, setRouteData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (activeDelivery?.id) {
      fetchRoute();
    }
  }, [activeDelivery?.id]);

  useEffect(() => {
    if (routeData && canvasRef.current) {
      drawMockMap();
    }
  }, [routeData]);

  const fetchRoute = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/deliveries/${activeDelivery!.id}/route`);
      setRouteData(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const drawMockMap = () => {
    const canvas = canvasRef.current;
    if (!canvas || !routeData?.route?.route) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear and set dimensions
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.parentElement!.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    
    const w = rect.width;
    const h = rect.height;

    // Draw background grid
    ctx.fillStyle = '#141420';
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = '#2a2a3d';
    ctx.lineWidth = 1;
    for (let i = 0; i < w; i += 40) {
      ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, h); ctx.stroke();
    }
    for (let i = 0; i < h; i += 40) {
      ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(w, i); ctx.stroke();
    }

    const points = routeData.route.route;
    if (points.length < 2) return;

    // Find bounds
    let minLat = Infinity, maxLat = -Infinity, minLng = Infinity, maxLng = -Infinity;
    points.forEach((p: any) => {
      minLat = Math.min(minLat, p.lat); maxLat = Math.max(maxLat, p.lat);
      minLng = Math.min(minLng, p.lng); maxLng = Math.max(maxLng, p.lng);
    });

    // Add padding
    const latRange = maxLat - minLat || 0.01;
    const lngRange = maxLng - minLng || 0.01;
    minLat -= latRange * 0.2; maxLat += latRange * 0.2;
    minLng -= lngRange * 0.2; maxLng += lngRange * 0.2;

    const toX = (lng: number) => ((lng - minLng) / (maxLng - minLng)) * w;
    const toY = (lat: number) => h - ((lat - minLat) / (maxLat - minLat)) * h;

    // Draw route line
    ctx.beginPath();
    ctx.strokeStyle = '#6366f1';
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    points.forEach((p: any, i: number) => {
      const x = toX(p.lng);
      const y = toY(p.lat);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Draw origin (agent)
    const startP = points[0];
    ctx.fillStyle = '#6366f1';
    ctx.beginPath(); ctx.arc(toX(startP.lng), toY(startP.lat), 8, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'white';
    ctx.beginPath(); ctx.arc(toX(startP.lng), toY(startP.lat), 3, 0, Math.PI * 2); ctx.fill();

    // Draw destination
    const endP = points[points.length - 1];
    ctx.fillStyle = '#ef4444';
    ctx.beginPath(); ctx.arc(toX(endP.lng), toY(endP.lat), 8, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'white';
    ctx.beginPath(); ctx.arc(toX(endP.lng), toY(endP.lat), 3, 0, Math.PI * 2); ctx.fill();
  };

  if (!activeDelivery) {
    return (
      <div className="page-content" style={{ padding: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <MapPin size={48} color="var(--color-text-secondary)" style={{ opacity: 0.3, marginBottom: 16 }} />
        <div style={{ fontSize: 16, fontWeight: 600 }}>No Active Navigation</div>
        <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginTop: 8 }}>Accept a delivery to see navigation</div>
      </div>
    );
  }

  const isGoingToPickup = ['ASSIGNED', 'ACCEPTED', 'GOING_TO_PICKUP'].includes(activeDelivery.status);
  const destName = isGoingToPickup ? activeDelivery.order?.vendor?.name : activeDelivery.order?.customer?.name;
  const destIcon = isGoingToPickup ? <Package size={20} /> : <MapPin size={20} />;

  return (
    <div className="page-content" style={{ padding: 0, display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Top Bar */}
      <div style={{ padding: '16px 20px', background: 'rgba(15, 15, 20, 0.9)', backdropFilter: 'blur(10px)', zIndex: 10, position: 'absolute', top: 0, left: 0, right: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
            {destIcon}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-primary)', textTransform: 'uppercase' }}>
              Navigating to {isGoingToPickup ? 'Pickup' : 'Customer'}
            </div>
            <div style={{ fontSize: 16, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {destName}
            </div>
          </div>
        </div>
      </div>

      {/* Map Area */}
      <div style={{ flex: 1, position: 'relative', background: '#141420' }}>
        {loading && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(20,20,32,0.8)', zIndex: 5 }}>
            <div className="pulse-dot" style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--color-primary)' }} />
          </div>
        )}
        <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
      </div>

      {/* Bottom Info Sheet */}
      <div style={{ padding: '20px', background: 'var(--color-surface)', borderTop: '1px solid var(--color-border)', borderTopLeftRadius: 24, borderTopRightRadius: 24, zIndex: 10, marginTop: '-20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--color-primary)', lineHeight: 1 }}>
              {routeData?.eta?.etaMinutes || '--'}<span style={{ fontSize: 16, fontWeight: 600, marginLeft: 4 }}>min</span>
            </div>
            <div style={{ fontSize: 14, color: 'var(--color-text-secondary)', marginTop: 4, fontWeight: 500 }}>
              {routeData?.route?.distance || '--'} km remaining
            </div>
          </div>
          
          {routeData?.eta?.status !== 'SAFE' && (
            <div className="badge" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', padding: '6px 12px' }}>
              <AlertTriangle size={14} /> Delayed
            </div>
          )}
        </div>

        <button className="btn-primary" onClick={() => navigate(`/delivery/${activeDelivery.id}`)}>
          View Delivery Details
        </button>
      </div>
    </div>
  );
}
