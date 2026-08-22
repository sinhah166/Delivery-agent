import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import api from '../../services/api';

const EXCEPTION_TYPES = [
  { id: 'VENDOR_CLOSED', label: 'Vendor Closed', category: 'PICKUP', severity: 'HIGH' },
  { id: 'ITEM_UNAVAILABLE', label: 'Item Unavailable', category: 'PICKUP', severity: 'MEDIUM' },
  { id: 'HEAVY_TRAFFIC', label: 'Heavy Traffic', category: 'TRANSIT', severity: 'LOW' },
  { id: 'VEHICLE_ISSUE', label: 'Vehicle Issue', category: 'TRANSIT', severity: 'HIGH' },
  { id: 'CUSTOMER_UNAVAILABLE', label: 'Customer Unavailable', category: 'DELIVERY', severity: 'MEDIUM' },
  { id: 'WRONG_ADDRESS', label: 'Wrong Address', category: 'DELIVERY', severity: 'MEDIUM' },
];

export default function ExceptionsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState(EXCEPTION_TYPES[0]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await api.post(`/deliveries/${id}/exception`, {
        type: selectedType.id,
        category: selectedType.category,
        severity: selectedType.severity,
        recommendedAction: notes,
      });
      navigate(-1);
    } catch (err) {
      console.error(err);
      alert('Failed to report exception');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-content" style={{ padding: 0 }}>
      <div style={{
        padding: '16px', display: 'flex', alignItems: 'center', gap: 12,
        borderBottom: '1px solid var(--color-border)',
      }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text)', padding: 4 }}>
          <ArrowLeft size={22} />
        </button>
        <div style={{ fontSize: 18, fontWeight: 700 }}>Report Exception</div>
      </div>

      <div style={{ padding: '20px 16px' }}>
        <div className="card" style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 12 }}>Exception Type</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {EXCEPTION_TYPES.map(type => (
              <label key={type.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, borderRadius: 8, background: selectedType.id === type.id ? 'var(--color-primary-dark)' : 'var(--color-surface)', border: `1px solid ${selectedType.id === type.id ? 'var(--color-primary)' : 'var(--color-border)'}`, cursor: 'pointer' }}>
                <input type="radio" name="exceptionType" checked={selectedType.id === type.id} onChange={() => setSelectedType(type)} style={{ display: 'none' }} />
                <div style={{ width: 16, height: 16, borderRadius: '50%', border: `2px solid ${selectedType.id === type.id ? 'white' : 'var(--color-border)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {selectedType.id === type.id && <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'white' }} />}
                </div>
                <div style={{ flex: 1, fontSize: 14, fontWeight: 500 }}>{type.label}</div>
              </label>
            ))}
          </div>
        </div>

        <div className="card" style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 12 }}>Additional Notes (Optional)</div>
          <textarea className="input" rows={4} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Provide more details..." style={{ resize: 'none' }} />
        </div>

        <button className="btn-danger" onClick={handleSubmit} disabled={loading} style={{ fontSize: 16, padding: '16px' }}>
          <AlertTriangle size={20} />
          {loading ? 'Submitting...' : 'Submit Report'}
        </button>
      </div>
    </div>
  );
}
