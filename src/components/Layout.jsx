import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Scale, LogOut, Users, ClipboardCheck, FileBadge2, Gauge, LayoutDashboard, ShieldCheck } from 'lucide-react';

const roleLabels = {
  owner: 'Instrument Owner',
  officer: 'Government Officer / Tester',
  admin: 'Administrator',
};

export default function Layout({ children }) {
  const { currentUser, logout } = useApp();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <aside style={{ width: 260, background: '#0f172a', color: '#e2e8f0', display: 'flex', flexDirection: 'column', position: 'fixed', top: 0, bottom: 0, left: 0 }}>
        <div style={{ padding: '20px 16px', borderBottom: '1px solid #1e293b' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Scale size={28} style={{ color: '#38bdf8' }} />
            <div>
              <div style={{ fontWeight: 700, fontSize: 16, color: '#fff' }}>Legal Metrology</div>
              <div style={{ fontSize: 11, color: '#94a3b8' }}>Instrument Verification System</div>
            </div>
          </div>
        </div>

        <nav style={{ flex: 1, padding: '16px 0', overflowY: 'auto' }}>
          <MenuLink to="/dashboard" icon={<LayoutDashboard size={18} />} label="Dashboard" />
          {currentUser?.role === 'owner' && (
            <>
              <MenuLink to="/instruments" icon={<Gauge size={18} />} label="My Instruments" />
              <MenuLink to="/applications" icon={<ClipboardCheck size={18} />} label="Applications" />
              <MenuLink to="/certificates" icon={<FileBadge2 size={18} />} label="Certificates" />
            </>
          )}
          {currentUser?.role === 'officer' && (
            <>
              <MenuLink to="/officer/applications" icon={<ClipboardCheck size={18} />} label="Applications" />
              <MenuLink to="/officer/inspections" icon={<Gauge size={18} />} label="Inspections" />
              <MenuLink to="/officer/certificates" icon={<FileBadge2 size={18} />} label="Issued Certificates" />
            </>
          )}
          {currentUser?.role === 'admin' && (
            <>
              <MenuLink to="/admin/users" icon={<Users size={18} />} label="Manage Users" />
              <MenuLink to="/admin/instruments" icon={<Gauge size={18} />} label="Instruments" />
              <MenuLink to="/admin/applications" icon={<ClipboardCheck size={18} />} label="Applications" />
              <MenuLink to="/admin/certificates" icon={<FileBadge2 size={18} />} label="Certificates" />
              <MenuLink to="/admin/status" icon={<ShieldCheck size={18} />} label="System Status" />
            </>
          )}
          <MenuLink to="/verify" icon={<ShieldCheck size={18} />} label="Public Verify" />
        </nav>

        <div style={{ padding: '16px', borderTop: '1px solid #1e293b' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>{currentUser?.name}</div>
          <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 10 }}>{roleLabels[currentUser?.role]}</div>
          <button onClick={handleLogout} style={logoutStyle}>
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      <main style={{ flex: 1, marginLeft: 260, padding: '28px 36px', background: '#f1f5f9' }}>
        {children}
      </main>
    </div>
  );
}

const logoutStyle = {
  width: '100%',
  padding: '8px 12px',
  background: '#1e293b',
  color: '#f87171',
  border: 'none',
  borderRadius: 6,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  fontSize: 13,
  fontWeight: 600,
};

function MenuLink({ to, icon, label }) {
  return (
    <NavLink
      to={to}
      style={({ isActive }) => ({
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '10px 20px',
        textDecoration: 'none',
        color: isActive ? '#38bdf8' : '#94a3b8',
        fontWeight: isActive ? 600 : 400,
        borderLeft: isActive ? '3px solid #38bdf8' : '3px solid transparent',
        background: isActive ? 'rgba(56,189,248,0.08)' : 'transparent',
        fontSize: 14,
      })}
    >
      {icon} {label}
    </NavLink>
  );
}
