import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Scale, AlertCircle } from 'lucide-react';

// ---------------------------------------------------------------------------
// Owner Registration
// ---------------------------------------------------------------------------
// Collects only the owner's personal details. The payment / verification fee
// flow is handled on the owner's application (see My Applications), not here.
// ---------------------------------------------------------------------------

export default function Register() {
  const { register } = useApp();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '', password: '', confirm: '' });
  const [error, setError] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      setError('Passwords do not match');
      return;
    }
    const result = register({ name: form.name, email: form.email, phone: form.phone, address: form.address, password: form.password });
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error);
    }
  };

  const inputStyle = { width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: 8, fontSize: 14 };

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ width: '100%', maxWidth: 480, background: '#fff', borderRadius: 16, padding: 36, boxShadow: '0 20px 50px rgba(0,0,0,0.3)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <Scale size={32} color="#4f46e5" />
          <div>
            <div style={{ fontWeight: 800, fontSize: 18, color: '#0f172a' }}>Register Owner</div>
            <div style={{ fontSize: 12, color: '#64748b' }}>Create your instrument owner account</div>
          </div>
        </div>

        {error && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '10px', borderRadius: 8, display: 'flex', gap: 8, alignItems: 'center', fontSize: 13, marginBottom: 16 }}><AlertCircle size={16} /> {error}</div>}

        <form onSubmit={handleSubmit}>
          <Label>Full Name</Label>
          <input name="name" value={form.name} onChange={handleChange} style={inputStyle} required />

          <Label>Email</Label>
          <input type="email" name="email" value={form.email} onChange={handleChange} style={inputStyle} required />

          <Label>Phone</Label>
          <input name="phone" value={form.phone} onChange={handleChange} style={inputStyle} required />

          <Label>Address</Label>
          <input name="address" value={form.address} onChange={handleChange} style={inputStyle} required />

          <Label>Password</Label>
          <input type="password" name="password" value={form.password} onChange={handleChange} style={inputStyle} required />

          <Label>Confirm Password</Label>
          <input type="password" name="confirm" value={form.confirm} onChange={handleChange} style={inputStyle} required />

          <button style={{ width: '100%', padding: '12px', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 700, cursor: 'pointer', marginTop: 24 }}>Register</button>
        </form>

        <div style={{ marginTop: 16, fontSize: 13, textAlign: 'center' }}>
          Already have an account? <Link to="/login" style={{ color: '#0ea5e9', fontWeight: 700 }}>Login</Link>
        </div>
      </div>
    </div>
  );
}

function Label({ children }) {
  return <div style={{ fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6, marginTop: 14 }}>{children}</div>;
}
