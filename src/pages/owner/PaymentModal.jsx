import { useState, useEffect } from 'react';
import { Card } from '../../components/ui';

export default function PaymentModal({ title, amount, onSuccess, onClose }) {
  const [stage, setStage] = useState('pay');
  const [paymentId, setPaymentId] = useState(null);

  useEffect(() => {
    if (stage === 'loading') {
      const timer = setTimeout(() => {
        const id = `PAY${Date.now()}`;
        setPaymentId(id);
        setStage('success');
        onSuccess(id);
      }, 1500);
      return () => clearTimeout(timer);
    }
    if (stage === 'success') {
      const timer = setTimeout(() => {
        onClose();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [stage, onSuccess, onClose]);

  if (stage === 'pay') {
    return (
      <div style={overlayStyle}>
        <div style={modalStyle}>
          <Card style={{ padding: 24 }}>
            <h3 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 700, color: '#0f172a' }}>{title}</h3>
            <p style={{ margin: '0 0 20px', fontSize: 14, color: '#64748b' }}>Registration fee for instrument verification</p>
            <div style={{ fontSize: 28, fontWeight: 800, color: '#0f172a', marginBottom: 24 }}>₹{amount}</div>
            <button onClick={() => setStage('loading')} style={payBtnStyle} disabled={stage === 'loading'}>
              Pay ₹{amount}
            </button>
            <button onClick={onClose} style={{ ...cancelBtnStyle, marginTop: 12 }}>Cancel</button>
          </Card>
        </div>
      </div>
    );
  }

  if (stage === 'loading') {
    return (
      <div style={overlayStyle}>
        <div style={modalStyle}>
          <Card style={{ padding: 24, textAlign: 'center' }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>⏳</div>
            <div style={{ fontSize: 16, fontWeight: 600, color: '#0f172a' }}>Processing payment...</div>
            <div style={{ marginTop: 8, fontSize: 13, color: '#64748b' }}>Please wait</div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <Card style={{ padding: 24, textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>✓</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#15803d', marginBottom: 8 }}>Payment Successful</div>
          <div style={{ fontSize: 13, color: '#64748b', marginBottom: 16 }}>Reference ID: <b style={{ color: '#0f172a' }}>{paymentId}</b></div>
          <div style={{ fontSize: 13, color: '#64748b' }}>Closing automatically...</div>
        </Card>
      </div>
    </div>
  );
}

const overlayStyle = {
  position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', display: 'flex',
  alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20,
};

const modalStyle = {
  width: '100%', maxWidth: 420, background: '#fff', borderRadius: 12,
  boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
};

const payBtnStyle = {
  width: '100%', padding: '12px', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: 8,
  fontSize: 15, fontWeight: 700, cursor: 'pointer',
};

const cancelBtnStyle = {
  width: '100%', padding: '10px', background: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0', borderRadius: 8,
  fontSize: 13, fontWeight: 600, cursor: 'pointer',
};