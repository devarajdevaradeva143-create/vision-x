import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { PageHeader, Card, Table, StatusBadge, EmptyState } from '../../components/ui';
import { fmt } from '../../utils/format';

const filters = ['ALL', 'SUBMITTED', 'SCHEDULED', 'INSPECTED', 'CERTIFIED', 'REJECTED'];

export default function OfficerApplications() {
  const { currentUser, appApplications, appInstruments, appUsers } = useApp();
  const [filter, setFilter] = useState('ALL');

  const myApps = appApplications.filter(a => a.officerId === currentUser.id || (a.officerId === null && a.status === 'SUBMITTED'));
  const filtered = filter === 'ALL' ? myApps : myApps.filter(a => a.status === filter);

  return (
    <div>
      <PageHeader title="Applications" subtitle="Review, schedule and process verification applications" />

      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {filters.map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: '8px 16px', borderRadius: 999, border: '1px solid #cbd5e1', fontSize: 13, fontWeight: 600,
            cursor: 'pointer', background: filter === f ? '#4f46e5' : '#fff', color: filter === f ? '#fff' : '#475569',
          }}>{f}</button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState message="No applications in this category." />
      ) : (
        <Card>
          <Table headers={['App ID', 'Instrument', 'Category', 'Owner', 'Submitted', 'Scheduled', 'Status', '']}>
            {filtered.map(app => {
              const ins = appInstruments.find(i => i.id === app.instrumentId);
              const owner = appUsers.find(u => u.id === app.ownerId);
              return (
                <tr key={app.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px 14px', fontWeight: 700, color: '#0f172a' }}>{app.id}</td>
                  <td style={{ padding: '12px 14px', color: '#475569' }}>{ins?.id}</td>
                  <td style={{ padding: '12px 14px', color: '#475569' }}>{ins?.category}</td>
                  <td style={{ padding: '12px 14px', color: '#475569' }}>{owner?.name}</td>
                  <td style={{ padding: '12px 14px', color: '#475569' }}>{fmt(app.submissionDate)}</td>
                  <td style={{ padding: '12px 14px', color: app.scheduledDate ? '#475569' : '#94a3b8' }}>{app.scheduledDate ? fmt(app.scheduledDate) : '—'}</td>
                  <td style={{ padding: '12px 14px' }}><StatusBadge status={app.status} /></td>
                  <td style={{ padding: '12px 14px' }}>
                    <Link to={`/officer/applications/${app.id}`} style={{ color: '#0ea5e9', fontWeight: 600, fontSize: 13, textDecoration: 'none' }}>
                      {app.status === 'SUBMITTED' ? 'Review' : app.status === 'SCHEDULED' ? 'Inspect' : 'View'}
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
