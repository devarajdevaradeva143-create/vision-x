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

  const inputStyle = 'w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm text-gray-800 focus:border-blue-700 focus:outline-none';

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4 sm:p-6">
      <div className="w-full max-w-md overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="flex h-1.5">
          <div className="flex-1 bg-blue-800" />
          <div className="flex-1 bg-amber-400" />
          <div className="flex-1 bg-green-700" />
        </div>
        <div className="p-6 sm:p-8">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-blue-800 text-amber-400">
              <Scale size={24} />
            </div>
            <div>
              <div className="text-base font-bold text-gray-800">Register Owner</div>
              <div className="text-xs text-gray-600">Create your instrument owner account</div>
            </div>
          </div>

          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-md border border-red-200 bg-red-100 px-3 py-2.5 text-sm text-red-800">
              <AlertCircle size={16} /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <Label>Full Name</Label>
            <input name="name" value={form.name} onChange={handleChange} className={inputStyle} required />

            <Label>Email</Label>
            <input type="email" name="email" value={form.email} onChange={handleChange} className={inputStyle} required />

            <Label>Phone</Label>
            <input name="phone" value={form.phone} onChange={handleChange} className={inputStyle} required />

            <Label>Address</Label>
            <input name="address" value={form.address} onChange={handleChange} className={inputStyle} required />

            <Label>Password</Label>
            <input type="password" name="password" value={form.password} onChange={handleChange} className={inputStyle} required />

            <Label>Confirm Password</Label>
            <input type="password" name="confirm" value={form.confirm} onChange={handleChange} className={inputStyle} required />

            <button className="mt-5 w-full cursor-pointer rounded-md bg-blue-800 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-900">Register</button>
          </form>

          <div className="mt-4 text-center text-sm">
            Already have an account? <Link to="/login" className="font-semibold text-blue-800 hover:text-blue-900">Login</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function Label({ children }) {
  return <div className="mb-1.5 mt-3 text-sm font-semibold text-gray-700">{children}</div>;
}