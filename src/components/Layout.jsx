import { NavLink, useNavigate } from 'react-router-dom';
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
    <div className="min-h-screen lg:flex">
      <aside className="bg-blue-900 text-gray-100 lg:fixed lg:inset-y-0 lg:left-0 lg:z-20 lg:flex lg:w-64 lg:flex-col">
        <div className="flex items-center justify-between border-b border-blue-800 px-4 py-4 lg:px-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-blue-800 text-amber-400">
              <Scale size={26} />
            </div>
            <div>
              <div className="text-sm font-bold text-white">{t('portalName')}</div>
              <div className="text-xs text-blue-200">{t('portalSubtitle')}</div>
            </div>
          </div>
          <LanguageSelector />
        </div>

        <nav className="flex flex-1 gap-1 overflow-x-auto px-2 py-3 lg:flex-col lg:gap-0 lg:overflow-y-auto lg:px-0 lg:py-4">
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

        <div className="border-t border-blue-800 px-4 py-3 lg:px-5">
          <div className="text-sm font-semibold text-white">{currentUser?.name}</div>
          <div className="mb-2 text-xs text-blue-200">{t(roleLabelKeys[currentUser?.role])}</div>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2 rounded-md border border-blue-700 bg-blue-800 px-3 py-2 text-sm font-semibold text-red-200 hover:bg-blue-700 hover:text-red-100"
          >
            <LogOut size={16} /> {t('logout')}
          </button>
        </div>
      </aside>

      <main className="min-h-screen flex-1 bg-gray-100 p-4 sm:p-6 lg:ml-64 lg:p-8">
        {children}
      </main>
    </div>
  );
}

function MenuLink({ to, icon, label }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex shrink-0 items-center gap-3 rounded-md px-4 py-2.5 text-sm whitespace-nowrap lg:whitespace-normal lg:rounded-none lg:border-l-4 lg:px-5 lg:py-2.5 ${
          isActive
            ? 'border-amber-400 bg-blue-800 font-semibold text-white'
            : 'border-transparent text-blue-100 hover:bg-blue-800 hover:text-white'
        }`
      }
    >
      {icon} {label}
    </NavLink>
  );
}