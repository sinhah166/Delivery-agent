import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, CheckCircle2, XCircle } from 'lucide-react';
import api from '../../services/api';
import { useDeliveryStore } from '../../store/deliveryStore';

export default function DeliveryVerifyPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { updateDeliveryInList, setSelectedDelivery } = useDeliveryStore();
  const [otp, setOtp] = useState(['', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) value = value[value.length - 1];
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError('');

    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const verifyOtp = async () => {
    const otpStr = otp.join('');
    if (otpStr.length !== 4) {
      setError('Please enter a 4-digit OTP');
      return;
    }

    setLoading(true);
    setError('');
    try {
      // First verify OTP
      const verifyRes = await api.post(`/deliveries/${id}/verify-delivery`, { otp: otpStr });
      if (verifyRes.data.success) {
        // Then complete delivery
        const completeRes = await api.post(`/deliveries/${id}/complete`);
        if (completeRes.data.success) {
          setVerified(true);
          updateDeliveryInList(completeRes.data.data);
          setSelectedDelivery(completeRes.data.data);
          setTimeout(() => navigate('/'), 2500);
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  if (verified) {
    return (
      <div className="mobile-frame" style={{ justifyContent: 'center', alignItems: 'center' }}>
        <div className="animate-fade-in-up" style={{ textAlign: 'center', padding: 40 }}>
          <div style={{
            width: 96, height: 96, borderRadius: '50%',
            background: 'rgba(34, 197, 94, 0.15)', display: 'flex',
            alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px',
            border: '3px solid rgba(34, 197, 94, 0.3)',
          }}>
            <CheckCircle2 size={48} color="#22c55e" />
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Delivery Verified!</h2>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 14 }}>
            Delivery has been completed successfully
          </p>
          <div style={{
            marginTop: 20, padding: '10px 20px', borderRadius: 20,
            background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e',
            fontSize: 13, fontWeight: 600,
          }}>
            Redirecting to dashboard...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-content" style={{ padding: 0 }}>
      {/* Header */}
      <div style={{
        padding: '16px', display: 'flex', alignItems: 'center', gap: 12,
        borderBottom: '1px solid var(--color-border)',
      }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text)', padding: 4 }}>
          <ArrowLeft size={22} />
        </button>
        <div style={{ fontSize: 18, fontWeight: 700 }}>Delivery Verification</div>
      </div>

      <div style={{ padding: '32px 24px', textAlign: 'center' }}>
        <div style={{
          width: 72, height: 72, borderRadius: 20,
          background: 'rgba(99, 102, 241, 0.12)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px',
        }}>
          <Shield size={36} color="var(--color-primary)" />
        </div>

        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Enter Customer OTP</h2>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: 14, marginBottom: 32 }}>
          Ask the customer for the 4-digit verification code
        </p>

        {/* OTP Input */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginBottom: 24 }}>
          {otp.map((digit, i) => (
            <input
              key={i}
              ref={(el) => { inputRefs.current[i] = el; }}
              className="otp-input"
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleOtpChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
            />
          ))}
        </div>

        {error && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            marginBottom: 20, padding: '10px 16px', borderRadius: 10,
            background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', fontSize: 13,
          }}>
            <XCircle size={16} /> {error}
          </div>
        )}

        <button className="btn-primary" onClick={verifyOtp} disabled={loading || otp.join('').length !== 4}
          style={{ fontSize: 16, padding: '16px' }}>
          <Shield size={20} />
          {loading ? 'Verifying...' : 'Verify & Complete Delivery'}
        </button>

        <div style={{
          marginTop: 24, padding: '14px 20px', borderRadius: 12,
          background: 'var(--color-surface)', border: '1px solid var(--color-border)',
          fontSize: 12, color: 'var(--color-text-secondary)',
        }}>
          <strong style={{ color: 'var(--color-text)' }}>Demo OTP:</strong> Check delivery details for the OTP code
        </div>
      </div>
    </div>
  );
}
