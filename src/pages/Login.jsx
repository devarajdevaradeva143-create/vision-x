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
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4 sm:p-6">
      <div className="w-full max-w-5xl overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm min-h-[440px]">
        {/* Government accent band */}
        <div className="flex h-1.5">
          <div className="flex-1 bg-[#0D2B43]" />
          <div className="flex-1 bg-amber-400" />
          <div className="flex-1 bg-green-700" />
        </div>

        <div className="grid md:grid-cols-2">
          <div className="flex flex-col justify-center bg-[#0D2B43] p-10 text-white lg:p-12">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-md bg-[#0D2B43] text-amber-400">
                <Scale size={32} />
              </div>
              <div>
                <div className="text-lg font-bold">Legal Metrology</div>
                <div className="text-sm text-blue-200">Instrument Verification System</div>
              </div>
            </div>
            <h1 className="mt-3 text-xl leading-snug font-bold lg:text-2xl">Digital Verification & Certification of Weighing & Measuring Instruments</h1>
            <p className="mt-3 text-sm leading-relaxed text-blue-100">
              A National prototype connecting instrument owners, government officers and the public through a transparent verification workflow.
            </p>
            <div className="mt-5 flex flex-wrap gap-2 text-xs">
              {['Owner', 'Officer', 'Admin', 'Public Verify'].map(r => (
                <span key={r} className="rounded-md bg-[#0D2B43] px-3 py-1 font-medium text-blue-100">{r}</span>
              ))}
            </div>
          </div>

          <div className="p-8 sm:p-10 lg:p-12">
            <h2 className="m-0 text-lg font-bold text-gray-800">Login</h2>
            <p className="mt-1 mb-5 text-sm text-gray-600">Sign in to access your dashboard</p>

            {error && (
              <div className="mb-4 flex items-center gap-2 rounded-md border border-red-200 bg-red-100 px-3 py-2.5 text-sm text-red-800">
                <AlertCircle size={16} /> {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <Label>Email</Label>
              <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required />

              <Label>Password</Label>
              <Input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />

              <button className="mt-5 w-full cursor-pointer rounded-md bg-[#0D2B43] px-4 py-3 text-sm font-semibold text-white hover:bg-[#0D2B43]">
                Sign In
              </button>
            </form>

            <div className="mt-4 text-sm">
              New owner? <Link to="/register" className="font-semibold text-blue-800 hover:text-blue-900">Register here</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Label({ children }) {
  return <div className="mb-1.5 mt-3 text-sm font-semibold text-gray-700">{children}</div>;
}

function Input(props) {
  const { className, ...rest } = props;
  return <input {...rest} className={`w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm text-gray-800 focus:border-blue-700 focus:outline-none ${className || ''}`} />;
}