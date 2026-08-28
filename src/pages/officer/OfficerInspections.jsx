import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { PageHeader, Card, Table, StatusBadge, EmptyState } from '../../components/ui';
import { fmt } from '../../utils/format';

export default function OfficerInspections() {
  const { currentUser, appApplications, appInstruments } = useApp();
  const myApps = appApplications.filter(a => a.officerId === currentUser.id && (a.status === 'SCHEDULED' || a.status === 'INSPECTED'));

  return (
    <div>
      <PageHeader title="Inspections" subtitle="Instruments scheduled or in progress for inspection" />
      {myApps.length === 0 ? (
        <EmptyState message="No inspections scheduled or in progress." />
      ) : (
        <Card>
          <Table headers={['App ID', 'Instrument', 'Category', 'Scheduled', 'Status', '']}>
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
                      {app.status === 'SCHEDULED' ? 'Inspect' : 'Complete Decision'}
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
