import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';
import { PageHeader, Card, Table, StatusBadge, EmptyState } from '../../components/ui';
import { fmt } from '../../utils/format';

export default function AdminApplications() {
  const { appApplications, appInstruments, appUsers } = useApp();
  const { t } = useLanguage();

  return (
    <div>
      <PageHeader title={t('applications')} subtitle={t('allAppsSub')} />
      {appApplications.length === 0 ? <EmptyState message={t('noAppsAdmin')} /> : (
        <Card>
          <Table headers={[t('appIdTable'), t('certInstrument'), t('ownerCert'), t('officerTable'), t('submittedTable'), t('statusTable')]}>
            {appApplications.map(app => {
              const ins = appInstruments.find(i => i.id === app.instrumentId);
              const owner = appUsers.find(u => u.id === app.ownerId);
              const officer = app.officerId ? appUsers.find(u => u.id === app.officerId) : null;
              return (
                <tr key={app.id} className="border-b border-gray-100">
                  <td className="px-4 py-3 text-sm font-bold text-gray-800">{app.id}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{ins?.category} ({ins?.id})</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{owner?.name}</td>
                  <td className={`px-4 py-3 text-sm ${officer ? 'text-gray-700' : 'text-gray-400'}`}>{officer?.name || t('unassigned')}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{fmt(app.submissionDate)}</td>
                  <td className="px-4 py-3"><StatusBadge status={app.status} /></td>
                </tr>
              );
            })}
          </Table>
        </Card>
      )}
    </div>
  );
}