import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import LanguageSelector from './LanguageSelector';
import { Scale, LogOut, Users, ClipboardCheck, FileBadge2, Gauge, LayoutDashboard, ShieldCheck, Flag } from 'lucide-react';

const roleLabelKeys = {
  owner: 'roleOwner',
  officer: 'roleOfficer',
  admin: 'roleAdmin',
};

export default function Layout({ children }) {
  const { currentUser, logout } = useApp();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <aside style={{ width: 260, background: '#0f172a', color: '#e2e8f0', display: 'flex', flexDirection: 'column', position: 'fixed', top: 0, bottom: 0, left: 0 }}>
        <div style={{ padding: '20px 16px', borderBottom: '1px solid #1e293b' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Scale size={28} style={{ color: '#38bdf8' }} />
              <div>
                <div style={{ fontWeight: 700, fontSize: 16, color: '#fff' }}>{t('portalName')}</div>
                <div style={{ fontSize: 11, color: '#94a3b8' }}>{t('portalSubtitle')}</div>
              </div>
            </div>
            {/* Language selector — visible only here (after login) */}
            <LanguageSelector />
          </div>
        </div>

        <nav style={{ flex: 1, padding: '16px 0', overflowY: 'auto' }}>
          <MenuLink to="/dashboard" icon={<LayoutDashboard size={18} />} label={t('dashboard')} />
          {currentUser?.role === 'owner' && (
            <>
              <MenuLink to="/instruments" icon={<Gauge size={18} />} label={t('myInstruments')} />
              <MenuLink to="/applications" icon={<ClipboardCheck size={18} />} label={t('applications')} />
              <MenuLink to="/certificates" icon={<FileBadge2 size={18} />} label={t('certificates')} />
              <MenuLink to="/report" icon={<Flag size={18} />} label={t('reportProblemShort')} />
            </>
          )}
          {currentUser?.role === 'officer' && (
            <>
              <MenuLink to="/officer/applications" icon={<ClipboardCheck size={18} />} label={t('applications')} />
              <MenuLink to="/officer/inspections" icon={<Gauge size={18} />} label={t('inspections')} />
              <MenuLink to="/officer/certificates" icon={<FileBadge2 size={18} />} label={t('issuedCertificates')} />
              <MenuLink to="/officer/complaints" icon={<Flag size={18} />} label={t('publicComplaints')} />
            </>
          )}
          {currentUser?.role === 'admin' && (
            <>
              <MenuLink to="/admin/users" icon={<Users size={18} />} label={t('manageUsers')} />
              <MenuLink to="/admin/instruments" icon={<Gauge size={18} />} label={t('instruments')} />
              <MenuLink to="/admin/applications" icon={<ClipboardCheck size={18} />} label={t('applications')} />
              <MenuLink to="/admin/certificates" icon={<FileBadge2 size={18} />} label={t('certificates')} />
              <MenuLink to="/admin/status" icon={<ShieldCheck size={18} />} label={t('systemStatus')} />
            </>
          )}
          <MenuLink to="/verify" icon={<ShieldCheck size={18} />} label={t('publicVerify')} />
        </nav>

        <div style={{ padding: '16px', borderTop: '1px solid #1e293b' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>{currentUser?.name}</div>
          <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 10 }}>{t(roleLabelKeys[currentUser?.role])}</div>
          <button onClick={handleLogout} style={logoutStyle}>
            <LogOut size={16} /> {t('logout')}
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
