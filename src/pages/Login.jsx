import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { AlertCircle, Mail, Lock, Eye, EyeOff, Scale } from 'lucide-react';

const ROLES = [
  {
    id: 'owner',
    label: 'Owner',
    desc: 'Manage instruments, submit applications & track certificates',
    icon: (
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="6" y="14" width="28" height="22" rx="2" stroke="#0D2B43" strokeWidth="2" fill="none"/>
        <rect x="14" y="6" width="12" height="10" rx="1" stroke="#0D2B43" strokeWidth="2" fill="none"/>
        <line x1="10" y1="20" x2="30" y2="20" stroke="#0D2B43" strokeWidth="1.5"/>
        <line x1="10" y1="24" x2="30" y2="24" stroke="#0D2B43" strokeWidth="1.5"/>
        <line x1="10" y1="28" x2="26" y2="28" stroke="#0D2B43" strokeWidth="1.5"/>
        <path d="M14 2 L14 6 L26 6 L26 2" stroke="#B8860B" strokeWidth="1.5" fill="none"/>
        <line x1="18" y1="4" x2="22" y2="4" stroke="#B8860B" strokeWidth="1"/>
      </svg>
    ),
  },
  {
    id: 'officer',
    label: 'Officer',
    desc: 'Review, inspect, certify applications & manage complaints',
    icon: (
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 4 L34 10 L34 20 C34 28 28 34 20 36 C12 34 6 28 6 20 L6 10 Z" stroke="#0D2B43" strokeWidth="2" fill="none"/>
        <path d="M20 8 L28 12 L28 20 C28 26 24 30 20 32 C16 30 12 26 12 20 L12 12 Z" stroke="#B8860B" strokeWidth="1.5" fill="none"/>
        <circle cx="20" cy="20" r="4" stroke="#0D2B43" strokeWidth="2" fill="none"/>
        <circle cx="20" cy="20" r="1.5" fill="#0D2B43"/>
      </svg>
    ),
  },
  {
    id: 'public',
    label: 'Public User',
    desc: 'Verify instruments, register complaints & check certificates',
    icon: (
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="20" cy="14" r="6" stroke="#0D2B43" strokeWidth="2" fill="none"/>
        <path d="M8 34 C8 26 12 22 20 22 C28 22 32 26 32 34" stroke="#0D2B43" strokeWidth="2" fill="none"/>
        <circle cx="20" cy="14" r="2" stroke="#B8860B" strokeWidth="1.5" fill="none"/>
        <path d="M6 28 Q10 24 14 28" stroke="#B8860B" strokeWidth="1" fill="none"/>
        <path d="M34 28 Q30 24 26 28" stroke="#B8860B" strokeWidth="1" fill="none"/>
      </svg>
    ),
  },
  {
    id: 'admin',
    label: 'Admin',
    desc: 'Manage users, instruments, applications & system settings',
    icon: (
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="20" cy="16" r="5" stroke="#0D2B43" strokeWidth="2" fill="none"/>
        <path d="M6 30 C6 24 10 20 20 20 C30 20 34 24 34 30" stroke="#0D2B43" strokeWidth="2" fill="none"/>
        <circle cx="20" cy="16" r="2" stroke="#B8860B" strokeWidth="1.5" fill="none"/>
        <path d="M10 22 L14 20" stroke="#B8860B" strokeWidth="1" fill="none"/>
        <path d="M26 20 L30 22" stroke="#B8860B" strokeWidth="1" fill="none"/>
        <path d="M14 26 L18 24" stroke="#B8860B" strokeWidth="1" fill="none"/>
        <path d="M22 24 L26 26" stroke="#B8860B" strokeWidth="1" fill="none"/>
      </svg>
    ),
  },
];

function RoleIcon({ id, icon, active, onClick }) {
  return (
    <div
      className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
        active
          ? 'border-amber-500 bg-amber-50 shadow-sm'
          : 'border-gray-200 bg-white hover:border-blue-400 hover:bg-blue-50'
      }`}
      onClick={onClick}
    >
      <div className={`flex items-center justify-center ${active ? 'text-amber-600' : 'text-[#0D2B43]'}`}>
        {icon}
      </div>
      <span className={`text-xs font-semibold ${active ? 'text-amber-700' : 'text-gray-700'}`}>
        {ROLES.find(r => r.id === id)?.label}
      </span>
    </div>
  );
}

export default function Login() {
  const { login } = useApp();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [selectedRole, setSelectedRole] = useState('');

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
    <div className="min-h-screen bg-gray-100 relative overflow-hidden">
      <div className="h-screen w-full relative">
        {/* Left section - deep navy government panel */}
        <div className="absolute left-0 top-0 h-full w-3/5 bg-[#0D2B43] relative flex flex-col">

          {/* Government emblem at top-left */}
          <div className="absolute top-6 left-6 flex items-center gap-2 text-amber-400 z-10">
            <div className="h-8 w-8 rounded-md bg-[#0D2B43] flex items-center justify-center opacity-80">
              <Scale size={20} />
            </div>
            <div>
              <div className="text-sm font-bold">Government of India</div>
              <div className="text-xs">Legal Metrology</div>
            </div>
          </div>

          {/* Main content area */}
          <div className="flex-1 p-6 sm:p-8 lg:p-10 flex flex-col justify-center gap-4 z-10">
            <h1 className="text-2xl lg:text-3xl font-bold leading-tight text-white">
              Digital Verification & Certification of Weighing & Measuring <span className="text-amber-400 font-bold">Instruments</span>
            </h1>
            <p className="text-blue-100 text-sm leading-relaxed">
              A national initiative connecting instrument owners, government officers and field personnel through a transparent verification workflow.
            </p>
            <p className="text-blue-100 text-sm leading-relaxed">
              This digital portal enables instrument owners, government officers and citizens to manage verification, certification, inspection and complaint services through a secure and integrated system.
            </p>

            {/* Role Cards */}
            <div className="mt-4">
              <div className="text-xs font-semibold text-amber-300 uppercase tracking-wider mb-3">Select Your Role</div>
              <div className="grid grid-cols-2 gap-3">
                {ROLES.map(role => (
                  <RoleIcon
                    key={role.id}
                    id={role.id}
                    icon={role.icon}
                    active={selectedRole === role.id}
                    onClick={() => setSelectedRole(role.id)}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Diagonal separator */}
        <div className="absolute top-0 right-[40%] h-full w-4 bg-[#0D2B43] transform rotate-[3deg] origin-top-right" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0% 100%)' }} />

        {/* Right section - white login card area */}
        <div className="absolute right-0 top-0 h-full w-[42%] bg-white flex items-center justify-center p-8 sm:p-10">
          <div className="w-full max-w-lg overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
              <div className="flex h-1.5">
                <div className="flex-1 bg-blue-800" />
                <div className="flex-1 bg-amber-400" />
                <div className="flex-1 bg-green-700" />
              </div>
              <div className="p-10 sm:p-12">
                <div className="text-center mb-12">
                  <h2 className="text-4xl font-bold text-gray-800 m-0">Welcome Back!</h2>
                  <p className="mt-2 text-base text-gray-500">Sign in to access your dashboard</p>
                </div>

                {error && (
                  <div className="mb-10 flex items-center gap-2 rounded-md border border-red-200 bg-red-100 px-3 py-2.5 text-sm text-red-800">
                    <AlertCircle size={16} /> {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-7">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 size-5" />
                      <input
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        required
                        className="w-full pl-10 pr-4 py-3.5 rounded-lg border border-gray-300 text-sm text-gray-800 focus:border-[#0D2B43] focus:outline-none focus:ring-1 focus:ring-[#0D2B43]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 size-5" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        className="w-full pl-10 pr-12 py-4 rounded-lg border border-gray-300 text-sm text-gray-800 focus:border-[#0D2B43] focus:outline-none focus:ring-1 focus:ring-[#0D2B43]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full cursor-pointer rounded-lg bg-[#0D2B43] px-4 py-5 text-base font-semibold text-white hover:bg-[#0A2338] transition-colors"
                  >
                    Sign In
                  </button>
                </form>

                <div className="mt-10 text-sm text-center">
                  New user? <Link to="/register" className="font-semibold text-[#0D2B43] hover:text-amber-600 ml-1">Register here</Link>
                </div>
              </div>
            </div>
        </div>
      </div>
    </div>
  );
}