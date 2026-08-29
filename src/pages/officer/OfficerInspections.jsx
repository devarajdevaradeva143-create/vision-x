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
                <tr key={app.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px 14px', fontWeight: 700, color: '#0f172a' }}>{app.id}</td>
                  <td style={{ padding: '12px 14px', color: '#475569' }}>{ins?.id}</td>
                  <td style={{ padding: '12px 14px', color: '#475569' }}>{ins?.category}</td>
                  <td style={{ padding: '12px 14px', color: '#475569' }}>{app.scheduledDate ? fmt(app.scheduledDate) : '—'}</td>
                  <td style={{ padding: '12px 14px' }}><StatusBadge status={app.status} /></td>
                  <td style={{ padding: '12px 14px' }}>
                    <Link to={`/officer/applications/${app.id}`} style={{ color: '#0ea5e9', fontWeight: 600, fontSize: 13, textDecoration: 'none' }}>
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
