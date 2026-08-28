import { useApp } from '../../context/AppContext';
import { PageHeader, Card, Table, StatusBadge, EmptyState } from '../../components/ui';
import { fmt } from '../../utils/format';

export default function AdminApplications() {
  const { appApplications, appInstruments, appUsers } = useApp();

  return (
    <div>
      <PageHeader title="Applications" subtitle="All verification applications in the system" />
      {appApplications.length === 0 ? <EmptyState message="No applications." /> : (
        <Card>
          <Table headers={['App ID', 'Instrument', 'Owner', 'Officer', 'Submitted', 'Status']}>
            {appApplications.map(app => {
              const ins = appInstruments.find(i => i.id === app.instrumentId);
              const owner = appUsers.find(u => u.id === app.ownerId);
              const officer = app.officerId ? appUsers.find(u => u.id === app.officerId) : null;
              return (
                <tr key={app.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px 14px', fontWeight: 700, color: '#0f172a' }}>{app.id}</td>
                  <td style={{ padding: '12px 14px', color: '#475569' }}>{ins?.category} ({ins?.id})</td>
                  <td style={{ padding: '12px 14px', color: '#475569' }}>{owner?.name}</td>
                  <td style={{ padding: '12px 14px', color: officer ? '#475569' : '#94a3b8' }}>{officer?.name || 'Unassigned'}</td>
                  <td style={{ padding: '12px 14px', color: '#475569' }}>{fmt(app.submissionDate)}</td>
                  <td style={{ padding: '12px 14px' }}><StatusBadge status={app.status} /></td>
                </tr>
              );
            })}
          </Table>
        </Card>
      )}
    </div>
  );
}
