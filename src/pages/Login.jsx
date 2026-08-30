import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Scale, AlertCircle, Eye, EyeOff, Mail, Lock } from 'lucide-react';

export default function Login() {
  const { login } = useApp();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
    <div className="min-h-screen bg-gray-100 relative overflow-hidden">
      <div className="h-screen w-full relative">
        {/* Left section - 55% deep navy government panel */}
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

            {/* Service Section - four clean blocks */}
            <div className="mt-6 flex gap-2 flex-wrap justify-center text-xs">
              <span key="Owner" className="rounded-md bg-amber-400/20 px-3 py-1.5 font-medium text-amber-300 border border-amber-400/30">Owner</span>
              <span key="Officer" className="rounded-md bg-amber-400/20 px-3 py-1.5 font-medium text-amber-300 border border-amber-400/30">Officer</span>
              <span key="Admin" className="rounded-md bg-amber-400/20 px-3 py-1.5 font-medium text-amber-300 border border-amber-400/30">Admin</span>
              <span key="PublicVerify" className="rounded-md bg-amber-400/20 px-3 py-1.5 font-medium text-amber-300 border border-amber-400/30">Public<br/>Verify</span>
            </div>
          </div>
        </div>

        {/* Diagonal separator between blue and white sections */}
        <div className="absolute top-0 right-[40%] h-full w-4 bg-[#0D2B43] transform rotate-[3deg] origin-top-right" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0% 100%)' }} />

        {/* Right section - 45% white login card area */}
        <div className="absolute right-0 top-0 h-full w-2/5 bg-white flex items-center justify-center p-6 sm:p-8">
          {/* Login card - full width, no extra margins */}
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800 m-0">Welcome Back!</h2>
              <p className="mt-2 text-sm text-gray-500">Sign in to access your dashboard</p>
            </div>

            {error && (
              <div className="mb-6 flex items-center gap-2 rounded-md border border-red-200 bg-red-100 px-3 py-2.5 text-sm text-red-800">
                <AlertCircle size={16} /> {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
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
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 text-sm text-gray-800 focus:border-[#0D2B43] focus:outline-none focus:ring-1 focus:ring-[#0D2B43]"
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
                    className="w-full pl-10 pr-12 py-3 rounded-lg border border-gray-300 text-sm text-gray-800 focus:border-[#0D2B43] focus:outline-none focus:ring-1 focus:ring-[#0D2B43]"
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
                className="w-full cursor-pointer rounded-lg bg-[#0D2B43] px-4 py-3.5 text-sm font-semibold text-white hover:bg-[#0A2338] transition-colors"
              >
                Sign In
              </button>
            </form>

            <div className="mt-6 text-sm text-center">
              New user? <Link to="/register" className="font-semibold text-[#0D2B43] hover:text-amber-600 ml-1">Register here</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}