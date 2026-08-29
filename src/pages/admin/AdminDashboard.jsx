import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';
import { PageHeader, Card } from '../../components/ui';
import { expiryInfo } from '../../utils/format';

export default function AdminDashboard() {
  const { appUsers, appApplications, appInstruments, appCertificates } = useApp();
  const { t } = useLanguage();

  const owners = appUsers.filter(u => u.role === 'owner');
  const officers = appUsers.filter(u => u.role === 'officer');
  const admins = appUsers.filter(u => u.role === 'admin');

  const byStatus = (s) => appApplications.filter(a => a.status === s).length;

  const validCerts = appCertificates.filter(c => expiryInfo(c.expiryDate).status === 'valid').length;
  const expiringCerts = appCertificates.filter(c => expiryInfo(c.expiryDate).status === 'expiring').length;
  const expiredCerts = appCertificates.filter(c => expiryInfo(c.expiryDate).status === 'expired').length;

  return (
    <div>
      <PageHeader title={t('systemOverview')} subtitle={t('systemOverviewSub')} />

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label={t('owners')} value={owners.length} className="text-blue-800" />
        <Stat label={t('officers')} value={officers.length} className="text-green-700" />
        <Stat label={t('statInstruments')} value={appInstruments.length} className="text-blue-800" />
        <Stat label={t('statApplications')} value={appApplications.length} className="text-amber-800" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <h3 className="m-0 mb-3.5 text-base font-bold text-gray-800">{t('applicationsByStatus')}</h3>
          <div className="grid gap-2">
            {['SUBMITTED', 'SCHEDULED', 'INSPECTED', 'CERTIFIED', 'REJECTED'].map(s => (
              <div key={s} className="flex items-center justify-between border-b border-gray-100 pb-2">
                <span className="text-sm font-medium text-gray-700">{statusLabel(t, s)}</span>
                <span className={`text-base font-bold ${statusClass(s)}`}>{byStatus(s)}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h3 className="m-0 mb-3.5 text-base font-bold text-gray-800">{t('certificateValidity')}</h3>
          <div className="grid gap-2">
            <ValidityRow label={t('valid')} count={validCerts} className="text-green-700" />
            <ValidityRow label={t('expiringSoon')} count={expiringCerts} className="text-amber-800" />
            <ValidityRow label={t('expired')} count={expiredCerts} className="text-red-700" />
          </div>
        </Card>

        <Card>
          <h3 className="m-0 mb-3.5 text-base font-bold text-gray-800">{t('summary')}</h3>
          <div className="text-sm leading-relaxed text-gray-700">
            {t('summaryText').replace('{certs}', appCertificates.length).replace('{instruments}', appInstruments.length)}
          </div>
          <div className="mt-3.5 rounded-md bg-gray-50 px-3 py-2.5 text-xs text-gray-600">
            {t('expiringNote').replace('{count}', expiringCerts)}
          </div>
        </Card>
      </div>
    </div>
  );
}

function statusLabel(t, s) {
  const key = { SUBMITTED: 'statusSubmitted', SCHEDULED: 'statusScheduled', INSPECTED: 'statusInspected', CERTIFIED: 'statusCertified', REJECTED: 'statusRejected' }[s];
  return key ? t(key) : s;
}

function Stat({ label, value, className }) {
  return (
    <Card className="px-4 py-4 lg:px-5">
      <div className="text-sm font-medium text-gray-600">{label}</div>
      <div className={`mt-1 text-3xl font-bold ${className}`}>{value}</div>
    </Card>
  );
}

function ValidityRow({ label, count, className }) {
  return (
    <div className="flex items-center justify-between border-b border-gray-100 pb-2">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <span className={`text-base font-bold ${className}`}>{count}</span>
    </div>
  );
}

function statusClass(s) {
  return { SUBMITTED: 'text-blue-800', SCHEDULED: 'text-amber-800', INSPECTED: 'text-blue-800', CERTIFIED: 'text-green-700', REJECTED: 'text-red-700' }[s] || 'text-gray-600';
}