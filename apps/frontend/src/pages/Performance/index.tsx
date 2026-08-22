import { useEffect, useState } from 'react';
import { TrendingUp, Clock, CheckCircle2, XCircle, Activity, Award } from 'lucide-react';
import api from '../../services/api';

export default function PerformancePage() {
  const [performance, setPerformance] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPerformance();
  }, []);

  const fetchPerformance = async () => {
    try {
      const res = await api.get('/agents/me/performance');
      setPerformance(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !performance) return <div className="page-content" style={{ padding: 20 }}><div className="skeleton" style={{ height: 200 }} /></div>;

  return (
    <div className="page-content" style={{ padding: '20px 16px' }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 20, letterSpacing: '-0.5px' }}>Performance</h1>

      <div className="card" style={{ marginBottom: 20, background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))', color: 'white', border: 'none' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 600, opacity: 0.9 }}>Overall Rating</div>
          <Award size={24} color="#fbbf24" />
        </div>
        <div style={{ fontSize: 36, fontWeight: 800 }}>{performance.rating.toFixed(1)}</div>
        <div style={{ fontSize: 13, opacity: 0.8, marginTop: 4 }}>Top 10% of agents this week</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <CheckCircle2 size={16} color="#22c55e" />
            <span style={{ fontSize: 12, color: 'var(--color-text-secondary)', fontWeight: 500 }}>Completed</span>
          </div>
          <div style={{ fontSize: 24, fontWeight: 700 }}>{performance.completedDeliveries}</div>
        </div>
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <TrendingUp size={16} color="#3b82f6" />
            <span style={{ fontSize: 12, color: 'var(--color-text-secondary)', fontWeight: 500 }}>Success Rate</span>
          </div>
          <div style={{ fontSize: 24, fontWeight: 700 }}>{performance.successRate}%</div>
        </div>
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <Clock size={16} color="#f59e0b" />
            <span style={{ fontSize: 12, color: 'var(--color-text-secondary)', fontWeight: 500 }}>Avg Time</span>
          </div>
          <div style={{ fontSize: 24, fontWeight: 700 }}>{performance.averageDeliveryTime}m</div>
        </div>
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <XCircle size={16} color="#ef4444" />
            <span style={{ fontSize: 12, color: 'var(--color-text-secondary)', fontWeight: 500 }}>Failed</span>
          </div>
          <div style={{ fontSize: 24, fontWeight: 700 }}>{performance.failedDeliveries}</div>
        </div>
      </div>

      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <Activity size={18} color="var(--color-primary)" />
          <span style={{ fontSize: 14, fontWeight: 600 }}>Weekly Trend</span>
        </div>
        <div style={{ height: 120, display: 'flex', alignItems: 'flex-end', gap: 8 }}>
          {[60, 80, 50, 90, 70, 100, 85].map((h, i) => (
            <div key={i} style={{ flex: 1, background: 'var(--color-primary)', height: `${h}%`, borderRadius: '4px 4px 0 0', opacity: i === 6 ? 1 : 0.5 }} />
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 11, color: 'var(--color-text-secondary)' }}>
          <span>Mon</span><span>Sun</span>
        </div>
      </div>
    </div>
  );
}
