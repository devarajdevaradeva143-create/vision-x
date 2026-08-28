import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Scale, AlertCircle } from 'lucide-react';

export default function Login() {
  const { login } = useApp();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const result = login(email, password);
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ width: '100%', maxWidth: 900, display: 'grid', gridTemplateColumns: '1fr 1fr', background: '#fff', borderRadius: 16, overflow: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,0.3)' }}>
        <div style={{ background: 'linear-gradient(135deg,#0ea5e9,#4f46e5)', color: '#fff', padding: 40, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <Scale size={40} />
            <div>
              <div style={{ fontWeight: 800, fontSize: 20 }}>Legal Metrology</div>
              <div style={{ fontSize: 13, opacity: 0.9 }}>Instrument Verification System</div>
            </div>
          </div>
          <h1 style={{ fontSize: 26, margin: '20px 0 12px', lineHeight: 1.2 }}>Digital Verification & Certification of Weighing & Measuring Instruments</h1>
          <p style={{ opacity: 0.9, fontSize: 14, lineHeight: 1.6 }}>
            A National prototype connecting instrument owners, government officers and the public through a transparent verification workflow.
          </p>
          <div style={{ marginTop: 20, display: 'flex', gap: 10, flexWrap: 'wrap', fontSize: 12 }}>
            {['Owner', 'Officer', 'Admin', 'Public Verify'].map(r => (
              <span key={r} style={{ background: 'rgba(255,255,255,0.15)', padding: '4px 12px', borderRadius: 999 }}>{r}</span>
            ))}
          </div>
        </div>

        <div style={{ padding: 40 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', margin: '0 0 6px' }}>Login</h2>
          <p style={{ color: '#64748b', fontSize: 13, margin: '0 0 24px' }}>Sign in to access your dashboard</p>

          {error && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '10px', borderRadius: 8, display: 'flex', gap: 8, alignItems: 'center', fontSize: 13, marginBottom: 16 }}><AlertCircle size={16} /> {error}</div>}

          <form onSubmit={handleSubmit}>
            <Label>Email</Label>
            <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required />

            <Label>Password</Label>
            <Input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />

            <button style={submitBtn}>Sign In</button>
          </form>

          <div style={{ marginTop: 16, fontSize: 13 }}>
            New owner? <Link to="/register" style={{ color: '#0ea5e9', fontWeight: 700 }}>Register here</Link>
          </div>

          <div style={{ marginTop: 28, background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: 16, fontSize: 12, color: '#475569' }}>
            <div style={{ fontWeight: 700, marginBottom: 8 }}>Demo Accounts</div>
            <div style={{ display: 'grid', gap: 4 }}>
              <DemoRow role="Owner" email="rajesh@example.com" pass="owner123" />
              <DemoRow role="Officer" email="vikram@gov.in" pass="officer123" />
              <DemoRow role="Admin" email="admin@gov.in" pass="admin123" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DemoRow({ role, email, pass }) {
  return <div><b style={{ color: '#0f172a' }}>{role}:</b> {email} / {pass}</div>;
}

function Label({ children }) {
  return <div style={{ fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6, marginTop: 14 }}>{children}</div>;
}

function Input(props) {
  return <input {...props} style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: 8, fontSize: 14 }} />;
}

const submitBtn = {
  width: '100%', padding: '12px', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: 8,
  fontSize: 15, fontWeight: 700, cursor: 'pointer', marginTop: 24,
};
