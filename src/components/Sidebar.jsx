import { NavLink, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { Scale, LogOut, Users, ClipboardCheck, FileBadge2, Gauge, LayoutDashboard, ShieldCheck, Flag, PanelLeftClose, PanelLeftOpen } from 'lucide-react';

const roleLabelKeys = {
  owner: 'roleOwner',
  officer: 'roleOfficer',
  admin: 'roleAdmin',
};

export default function Sidebar({ collapsed, onToggle }) {
  const { currentUser, logout } = useApp();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const widthClass = collapsed ? 'lg:w-16' : 'lg:w-64';

  return (
    <aside className={`bg-[#163A5F] text-gray-100 lg:fixed lg:inset-y-0 lg:left-0 lg:z-20 lg:flex lg:flex-col transition-[width] duration-200 ease-in-out ${widthClass}`}>
      <div className="flex items-center justify-between border-b border-blue-800 px-4 py-4 lg:px-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-[#163A5F] text-amber-400">
            <Scale size={26} />
          </div>
          {!collapsed && (
            <div className="whitespace-nowrap">
              <div className="text-sm font-bold text-white">{t('portalName')}</div>
              <div className="text-xs text-blue-200">{t('portalSubtitle')}</div>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end px-2 py-2 lg:justify-center">
        <button
          onClick={onToggle}
          className="inline-flex items-center justify-center rounded-md border border-blue-700 bg-[#163A5F] p-2 text-blue-100 hover:bg-blue-700 hover:text-white"
          title={t('portalName')}
        >
          {collapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
        </button>
      </div>

      <nav className="flex flex-1 gap-1 overflow-x-auto px-2 py-3 lg:flex-col lg:gap-0 lg:overflow-y-auto lg:px-0 lg:py-4">
        <MenuLink to="/dashboard" icon={<LayoutDashboard size={18} />} label={t('dashboard')} collapsed={collapsed} />
        {currentUser?.role === 'owner' && (
          <>
            <MenuLink to="/instruments" icon={<Gauge size={18} />} label={t('myInstruments')} collapsed={collapsed} />
            <MenuLink to="/applications" icon={<ClipboardCheck size={18} />} label={t('applications')} collapsed={collapsed} />
            <MenuLink to="/certificates" icon={<FileBadge2 size={18} />} label={t('certificates')} collapsed={collapsed} />
            <MenuLink to="/report" icon={<Flag size={18} />} label={t('reportProblemShort')} collapsed={collapsed} />
          </>
        )}
        {currentUser?.role === 'officer' && (
          <>
            <MenuLink to="/officer/applications" icon={<ClipboardCheck size={18} />} label={t('applications')} collapsed={collapsed} />
            <MenuLink to="/officer/inspections" icon={<Gauge size={18} />} label={t('inspections')} collapsed={collapsed} />
            <MenuLink to="/officer/certificates" icon={<FileBadge2 size={18} />} label={t('issuedCertificates')} collapsed={collapsed} />
            <MenuLink to="/officer/complaints" icon={<Flag size={18} />} label={t('publicComplaints')} collapsed={collapsed} />
          </>
        )}
        {currentUser?.role === 'admin' && (
          <>
            <MenuLink to="/admin/users" icon={<Users size={18} />} label={t('manageUsers')} collapsed={collapsed} />
            <MenuLink to="/admin/instruments" icon={<Gauge size={18} />} label={t('instruments')} collapsed={collapsed} />
            <MenuLink to="/admin/applications" icon={<ClipboardCheck size={18} />} label={t('applications')} collapsed={collapsed} />
            <MenuLink to="/admin/certificates" icon={<FileBadge2 size={18} />} label={t('certificates')} collapsed={collapsed} />
            <MenuLink to="/admin/status" icon={<ShieldCheck size={18} />} label={t('systemStatus')} collapsed={collapsed} />
          </>
        )}
        <MenuLink to="/verify" icon={<ShieldCheck size={18} />} label={t('publicVerify')} collapsed={collapsed} />
      </nav>

      <div className="border-t border-blue-800 px-4 py-3 lg:px-5">
        {collapsed ? (
          <div className="flex justify-center">
            <button
              onClick={handleLogout}
              className="flex items-center justify-center rounded-md border border-blue-700 bg-[#163A5F] p-2 text-red-200 hover:bg-blue-700 hover:text-red-100"
              title={t('logout')}
            >
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <>
            <div className="text-sm font-semibold text-white">{currentUser?.name}</div>
            <div className="mb-2 text-xs text-blue-200">{t(roleLabelKeys[currentUser?.role])}</div>
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-2 rounded-md border border-blue-700 bg-[#163A5F] px-3 py-2 text-sm font-semibold text-red-200 hover:bg-blue-700 hover:text-red-100"
            >
              <LogOut size={16} /> {t('logout')}
            </button>
          </>
        )}
      </div>
    </aside>
  );
}

function MenuLink({ to, icon, label, collapsed }) {
  return (
    <NavLink
      to={to}
      title={collapsed ? label : undefined}
      className={({ isActive }) =>
        `flex shrink-0 items-center gap-3 rounded-md px-4 py-2.5 text-sm whitespace-nowrap lg:whitespace-normal lg:rounded-none lg:border-l-4 lg:px-5 lg:py-2.5 ${
          collapsed ? 'lg:justify-center lg:px-0' : ''
        } ${
          isActive
            ? 'border-amber-400 bg-[#163A5F] font-semibold text-white'
            : 'border-transparent text-blue-100 hover:bg-[#163A5F] hover:text-white'
        }`
      }
    >
      {icon} {!collapsed && label}
    </NavLink>
  );
}
