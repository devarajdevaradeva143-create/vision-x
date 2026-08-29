import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';
import { PageHeader, Card, StatusBadge } from '../../components/ui';
import { fmt, expiryInfo } from '../../utils/format';
import { Flag } from 'lucide-react';

export default function OwnerDashboard() {
  const { currentUser, appApplications, appInstruments, appCertificates } = useApp();
  const { t } = useLanguage();

  const myInstruments = appInstruments.filter(i => i.ownerId === currentUser.id);
  const myApps = appApplications.filter(a => a.ownerId === currentUser.id);
  const myCerts = appCertificates.filter(c => c.ownerId === currentUser.id);

  const latestCert = myCerts[0];

  const activeAlerts = myCerts
    .filter(c => c.applicationId !== undefined)
    .map(c => {
      const info = expiryInfo(c.expiryDate);
      return { cert: c, info };
    })
    .filter(x => x.info.status === 'expiring' || x.info.status === 'expired');

  const countByStatus = (s) => myApps.filter(a => a.status === s).length;

  const validityClass = (info) => {
    if (info.status === 'expired') return 'text-red-800';
    if (info.status === 'expiring') return 'text-amber-800';
    return 'text-green-800';
  };

  return (
    <div>
      <PageHeader
        title={t('welcomeOwner').replace('{name}', currentUser.name.split(' ')[0])}
        subtitle={t('manageYourAssets')}
      />

      {activeAlerts.length > 0 && (
        <div className="mb-6 grid gap-2">
          {activeAlerts.map(({ cert, info }) => {
            const ins = appInstruments.find(i => i.id === cert.instrumentId);
            const expired = info.status === 'expired';
            return (
              <div
                key={cert.id}
                className={`border-l-4 rounded-md px-4 py-3 text-sm font-semibold ${
                  expired ? 'border-red-700 bg-red-100 text-red-800' : 'border-amber-500 bg-amber-100 text-amber-800'
                }`}
              >
                {expired
                  ? t('certExpiredAlert').replace('{category}', ins?.category || t('instrument')).replace('{id}', cert.id).replace('{date}', fmt(cert.expiryDate))
                  : t('certExpiringAlert').replace('{category}', ins?.category || t('instrument')).replace('{id}', cert.id).replace('{days}', info.days).replace('{s}', info.days === 1 ? '' : 's').replace('{date}', fmt(cert.expiryDate))}
              </div>
            );
          })}
        </div>
      )}

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label={t('statInstruments')} value={myInstruments.length} className="text-blue-800" />
        <Stat label={t('statApplications')} value={myApps.length} className="text-blue-800" />
        <Stat label={t('statCertified')} value={countByStatus('CERTIFIED')} className="text-green-700" />
        <Stat label={t('statCertificates')} value={myCerts.length} className="text-amber-800" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <div className="mb-3.5 flex items-center justify-between">
            <h3 className="m-0 text-base font-bold text-gray-800">{t('recentApplications')}</h3>
            <Link to="/applications" className="text-sm font-semibold text-blue-800 hover:text-blue-900">{t('viewAll')}</Link>
          </div>
          {myApps.length === 0 && <Empty text={t('noApplicationsYet')} />}
          <div className="grid gap-2.5">
            {myApps.slice(0, 4).map(app => {
              const ins = appInstruments.find(i => i.id === app.instrumentId);
              return (
                <div key={app.id} className="flex items-center justify-between border-b border-gray-100 pb-2.5">
                  <div>
                    <div className="text-sm font-bold text-gray-800">{app.id}</div>
                    <div className="text-xs text-gray-600">{ins?.category} · {fmt(app.submissionDate)}</div>
                  </div>
                  <StatusBadge status={app.status} />
                </div>
              );
            })}
          </div>
        </Card>

        <Card>
          <div className="mb-3.5 flex items-center justify-between">
            <h3 className="m-0 text-base font-bold text-gray-800">{t('certificatesIssued')}</h3>
            <Link to="/certificates" className="text-sm font-semibold text-blue-800 hover:text-blue-900">{t('viewAll')}</Link>
          </div>
          {myCerts.length === 0 && <Empty text={t('noCertificatesYet')} />}
          <div className="grid gap-2.5">
            {myCerts.slice(0, 3).map(cert => {
              const info = expiryInfo(cert.expiryDate);
              return (
                <div key={cert.id} className="flex items-center justify-between border-b border-gray-100 pb-2.5">
                  <div>
                    <div className="text-sm font-bold text-gray-800">{cert.id}</div>
                    <div className="text-xs text-gray-600">{cert.category} · {cert.serialNumber}</div>
                  </div>
                  <span className={`text-xs font-bold ${validityClass(info)}`}>{info.label}</span>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {latestCert && (
        <Card className="mt-4">
          <h3 className="m-0 mb-1.5 text-base font-bold text-gray-800">{t('latestCertificate')}</h3>
          {latestCert ? (
            <div className="mt-2 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
              <div className="text-sm text-gray-600">
                <b className="text-gray-800">{latestCert.category}</b> · {t('validUntil').replace('{date}', fmt(latestCert.expiryDate))}
              </div>
              <Link to={`/certificates/${latestCert.applicationId}`} className="rounded-md bg-blue-800 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-900">{t('viewCertificate')}</Link>
            </div>
          ) : null}
        </Card>
      )}

      <Card className="mt-4 border-l-4 border-l-red-700">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-base font-bold text-gray-800">
              <Flag size={18} className="text-red-700" /> {t('reportProblem')}
            </div>
            <div className="mt-1 text-sm text-gray-600">{t('reportProblemPromo')}</div>
          </div>
          <Link to="/report" className="rounded-md bg-red-700 px-4 py-2.5 text-sm font-semibold whitespace-nowrap text-white hover:bg-red-800">{t('reportProblemShort')}</Link>
        </div>
      </Card>
    </div>
  );
}

function Stat({ label, value, className }) {
  return (
    <Card className="px-4 py-4 lg:px-5">
      <div className="text-sm font-medium text-gray-600">{label}</div>
      <div className={`mt-1 text-3xl font-bold ${className}`}>{value}</div>
    </Card>
  );
}

function Empty({ text }) {
  return <div className="py-5 text-center text-sm text-gray-500">{text}</div>;
}