import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';
import { PageHeader, Card, StatusBadge, ComplaintStatusBadge } from '../../components/ui';
import { fmt } from '../../utils/format';

export default function OfficerDashboard() {
  const { currentUser, appApplications, appInstruments, appComplaints } = useApp();
  const { t } = useLanguage();

  const myApps = appApplications.filter(a => a.officerId === currentUser.id);
  const submitted = myApps.filter(a => a.status === 'SUBMITTED');
  const scheduled = myApps.filter(a => a.status === 'SCHEDULED');
  const inspired = myApps.filter(a => a.status === 'INSPECTED');
  const certified = myApps.filter(a => a.status === 'CERTIFIED');
  const rejected = myApps.filter(a => a.status === 'REJECTED');

  const pendingInspection = myApps.filter(a => a.status === 'SUBMITTED' || a.status === 'SCHEDULED');

  const activeComplaints = appComplaints.filter(c => c.status !== 'RESOLVED');
  const recentComplaints = [...appComplaints].sort((a, b) => new Date(b.submittedAt || 0) - new Date(a.submittedAt || 0)).slice(0, 5);

  return (
    <div>
      <PageHeader title={t('welcomeOfficer').replace('{name}', currentUser.name)} subtitle={`${currentUser.department}`} />

      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-6">
        <Stat label={t('statSubmitted')} value={submitted.length} className="text-blue-800" />
        <Stat label={t('statScheduled')} value={scheduled.length} className="text-amber-800" />
        <Stat label={t('statInspected')} value={inspired.length} className="text-blue-800" />
        <Stat label={t('statCertifiedAdmin')} value={certified.length} className="text-green-700" />
        <Stat label={t('statRejected')} value={rejected.length} className="text-red-700" />
        <Stat label={t('pendingComplaints')} value={activeComplaints.length} className="text-amber-800" />
      </div>

      <Card className="mb-4">
        <div className="mb-3.5 flex items-center justify-between">
          <h3 className="m-0 text-base font-bold text-gray-800">{t('pendingReviewScheduling')}</h3>
          <Link to="/officer/applications" className="text-sm font-semibold text-blue-800 hover:text-blue-900">{t('allApplications')}</Link>
        </div>
        {pendingInspection.length === 0 ? (
          <p className="text-sm text-gray-500">{t('noPendingApplications')}</p>
        ) : (
          <div className="grid gap-2.5">
            {pendingInspection.map(app => {
              const ins = appInstruments.find(i => i.id === app.instrumentId);
              return (
                <div key={app.id} className="flex items-center justify-between border-b border-gray-100 pb-2.5">
                  <div>
                    <div className="text-sm font-bold text-gray-800">{app.id}</div>
                    <div className="text-xs text-gray-600">{ins?.category} · {ins?.serialNumber} · {t('statSubmitted')} {fmt(app.submissionDate)}</div>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <StatusBadge status={app.status} />
                    <Link to={`/officer/applications/${app.id}`} className="rounded-md bg-blue-800 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-900">{t('review')}</Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <Card>
        <h3 className="m-0 mb-3.5 text-base font-bold text-gray-800">{t('recentlyCertified')}</h3>        {certified.length === 0 ? (
          <p className="text-sm text-gray-500">{t('noCertifiedYet')}</p>
        ) : (
          <div className="grid gap-2.5">
            {certified.slice(0, 4).map(app => {
              const ins = appInstruments.find(i => i.id === app.instrumentId);
              return (
                <div key={app.id} className="flex items-center justify-between border-b border-gray-100 pb-2.5">
                  <div>
                    <div className="text-sm font-bold text-gray-800">{app.id}</div>
                    <div className="text-xs text-gray-600">{ins?.category} · {t('statInspected')} {fmt(app.inspectionDate)}</div>
                  </div>
                  <Link to={`/officer/applications/${app.id}`} className="text-sm font-medium text-blue-800 hover:text-blue-900">{t('viewLink')}</Link>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <Card className="mt-4">
        <div className="mb-3.5 flex items-center justify-between">
          <h3 className="m-0 text-base font-bold text-gray-800">{t('publicComplaints')}</h3>
          <Link to="/officer/complaints" className="text-sm font-semibold text-blue-800 hover:text-blue-900">{t('viewAll')}</Link>
        </div>
        {recentComplaints.length === 0 ? (
          <p className="text-sm text-gray-500">{t('noComplaintsMsg')}</p>
        ) : (
          <div className="grid gap-2.5">
            {recentComplaints.map(c => {
              const ins = appInstruments.find(i => i.id === c.instrumentId);
              return (
                <div key={c.id} className="flex items-center justify-between border-b border-gray-100 pb-2.5">
                  <div>
                    <div className="text-sm font-bold text-gray-800">
                      {c.id} <span className="font-medium text-blue-800">· {c.certificateId}</span>
                    </div>
                    <div className="text-xs text-gray-600">{c.complaintType} · {ins?.location || t('location')} · {c.filedAt || fmt(c.submittedAt)} {c.filedTime ? `, ${c.filedTime}` : ''}</div>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <ComplaintStatusBadge status={c.status} />
                    <Link to={`/officer/complaints/${c.id}`} className="rounded-md bg-blue-800 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-900">{t('viewLink')}</Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}

function Stat({ label, value, className }) {
  return (
    <Card className="px-4 py-4">
      <div className="text-xs font-medium text-gray-600">{label}</div>
      <div className={`mt-1 text-2xl font-bold ${className}`}>{value}</div>
    </Card>
  );
}