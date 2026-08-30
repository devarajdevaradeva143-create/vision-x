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
    <div className="min-h-screen bg-gray-100 overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-[45%_55%] gap-0 h-screen">
        <div className="bg-[#0D2B43] flex flex-col p-6 text-white sm:p-8">
          <div className="h-1.5">
            <div className="flex-1 bg-[#0D2B43]" />
            <div className="flex-1 bg-amber-400" />
            <div className="flex-1 bg-green-700" />
          </div>

          <div className="flex-1">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-md bg-[#0D2B43] text-amber-400">
                <Scale size={32} />
              </div>
              <div>
                <div className="text-lg font-bold">Legal Metrology</div>
                <div className="text-sm text-blue-200">Instrument Verification System</div>
              </div>
            </div>
            <p className="mt-2 text-blue-100 text-sm">Government Digital Service Portal</p>
            <h1 className="mt-3 text-xl leading-snug font-bold lg:text-2xl">Digital Verification & Certification of Weighing & Measuring Instruments</h1>
            <p className="mt-3 text-sm leading-relaxed text-blue-100">
              A National prototype connecting instrument owners, government officers and the public through a transparent verification workflow.
            </p>
            <p className="mt-3 text-xs text-blue-100">
              This digital portal enables instrument owners, government officers and citizens to manage verification, certification, inspection and complaint services through a secure and transparent workflow.
            </p>
            <div className="mt-5 flex flex-wrap gap-2 text-xs">
              {['Owner', 'Officer', 'Admin', 'Public Verify', 'Public Complaint'].map(r => (
                <span key={r} className="rounded-md bg-[#0D2B43] px-3 py-1 font-medium text-blue-100">{r}</span>
              ))}
            </div>
            <div className="mt-6 text-xs text-blue-100">
              <div className="flex flex-wrap gap-2">
                Instrument Registration • Online Verification • Digital Certificates • QR Certificate Verification • Complaint Registration • Payment & Fee Management • Officer Inspection Workflow • Instrument Digital Identity
              </div>
            </div>
          </div>
        </div>

<div className="bg-white flex flex-col overflow-hidden p-8 sm:p-10 lg:p-12">
          <h2 className="m-0 text-lg font-bold text-gray-800">Login</h2>
          <p className="mt-1 mb-4 text-xs text-gray-400">Secure Sign In</p>
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
          <div className="mt-4 text-xs text-gray-400">
            This portal is intended for authorised users of the Legal Metrology digital verification system.
          </div>

          <div className="mt-4 text-sm">
            New owner? <Link to="/register" className="font-semibold text-blue-800 hover:text-blue-900">Register here</Link>
          </div>
          <div className="mt-3 text-xs text-gray-400">
            <a className="text-gray-400 hover:text-white transition-colors" href="#">Forgot Password?</a>
            <span className="mx-2">|</span>
            <a className="text-gray-400 hover:text-white transition-colors" href="#">Need Help?</a>
            <span className="mx-2">|</span>
            <a className="text-gray-400 hover:text-white transition-colors" href="#">Contact Support</a>
          </div>
          <div className="mt-6 text-xs text-gray-500 border-t border-gray-200 py-2">
            <div className="flex justify-between items-start flex-wrap gap-4">
              <div>Government Digital Prototype</div>
              <div>Secure Portal</div>
              <div>Mobile Friendly</div>
              <div>QR Enabled Services</div>
              <div>Version 1.0</div>
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
