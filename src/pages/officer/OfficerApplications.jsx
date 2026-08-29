import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';
import { PageHeader, Card, Table, StatusBadge, EmptyState } from '../../components/ui';
import { fmt } from '../../utils/format';

const filters = ['ALL', 'SUBMITTED', 'SCHEDULED', 'INSPECTED', 'CERTIFIED', 'REJECTED'];

export default function OfficerApplications() {
  const { currentUser, appApplications, appInstruments, appUsers } = useApp();
  const { t } = useLanguage();
  const [filter, setFilter] = useState('SUBMITTED');

  // Show only applications assigned to this officer (currentUser.id). New owner
  // submissions are assigned to OFF001 on payment, so they surface here as the
  // exact same application the owner submitted.
  const myApps = appApplications.filter(a => a.officerId === currentUser.id);
  const filtered = filter === 'ALL' ? myApps : myApps.filter(a => a.status === filter);

  return (
    <div>
      <PageHeader title={t('applications')} subtitle={t('reviewScheduleProcess')} />

      <div className="mb-5 flex flex-wrap gap-2">
        {filters.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={
              filter === f
                ? 'cursor-pointer rounded-md bg-blue-800 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-900'
                : 'cursor-pointer rounded-md border border-gray-300 bg-white px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100'
            }
          >{f === 'ALL' ? t('filterAll') : f}</button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState message={t('noAppsInCategory')} />
      ) : (
        <Card>
          <Table headers={[t('appIdTable'), t('instrumentTable'), t('ownerTable'), t('submittedTable'), t('scheduledTable'), t('statusTable'), '']}>
            {filtered.map(app => {
              const machineType = app.machineType || appInstruments.find(i => i.id === app.instrumentId)?.category;
              const owner = appUsers.find(u => u.id === app.ownerId);
              return (
                <tr key={app.id} className="border-b border-gray-100">
                  <td className="px-4 py-3 text-sm font-bold text-gray-800">{app.id}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{machineType}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{owner?.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{fmt(app.submissionDate)}</td>
                  <td className={`px-4 py-3 text-sm ${app.scheduledDate ? 'text-gray-700' : 'text-gray-400'}`}>{app.scheduledDate ? fmt(app.scheduledDate) : '—'}</td>
                  <td className="px-4 py-3"><StatusBadge status={app.status} /></td>
                  <td className="px-4 py-3">
                    <Link to={`/officer/applications/${app.id}`} className="text-sm font-medium text-blue-800 hover:text-blue-900">
                      {app.status === 'SUBMITTED' ? t('reviewBtn') : app.status === 'SCHEDULED' ? t('inspectBtn') : t('viewLink')}
                    </Link>
                  </td>
                </tr>
              );
            })}
          </Table>
        </Card>
      )}
    </div>
  );
}