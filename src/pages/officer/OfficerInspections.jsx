import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';
import { PageHeader, Card, Table, StatusBadge, EmptyState } from '../../components/ui';
import { fmt } from '../../utils/format';

export default function OfficerInspections() {
  const { currentUser, appApplications, appInstruments } = useApp();
  const { t } = useLanguage();
  const myApps = appApplications.filter(a => a.officerId === currentUser.id && (a.status === 'SCHEDULED' || a.status === 'INSPECTED'));

  return (
    <div>
      <PageHeader title={t('inspections')} subtitle={t('inspectionsSubtitle')} />
      {myApps.length === 0 ? (
        <EmptyState message={t('noInspectionsMsg')} />
      ) : (
        <Card>
          <Table headers={[t('appIdTable'), t('certInstrument'), t('instrumentCat'), t('scheduledTable'), t('statusTable'), '']}>
            {myApps.map(app => {
              const ins = appInstruments.find(i => i.id === app.instrumentId);
              return (
                <tr key={app.id} className="border-b border-gray-100">
                  <td className="px-4 py-3 text-sm font-bold text-gray-800">{app.id}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{ins?.id}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{ins?.category}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{app.scheduledDate ? fmt(app.scheduledDate) : '—'}</td>
                  <td className="px-4 py-3"><StatusBadge status={app.status} /></td>
                  <td className="px-4 py-3">
                    <Link to={`/officer/applications/${app.id}`} className="text-sm font-medium text-blue-800 hover:text-blue-900">
                      {app.status === 'SCHEDULED' ? t('inspectBtn') : t('completeDecision')}
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