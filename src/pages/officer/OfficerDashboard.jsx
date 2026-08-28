import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { PageHeader, Card, StatusBadge } from '../../components/ui';
import { fmt } from '../../utils/format';

export default function OfficerDashboard() {
  const { currentUser, appApplications, appInstruments } = useApp();

  const myApps = appApplications.filter(a => a.officerId === currentUser.id);
  const submitted = myApps.filter(a => a.status === 'SUBMITTED');
  const scheduled = myApps.filter(a => a.status === 'SCHEDULED');
  const inspired = myApps.filter(a => a.status === 'INSPECTED');
  const certified = myApps.filter(a => a.status === 'CERTIFIED');
  const rejected = myApps.filter(a => a.status === 'REJECTED');

  const pendingInspection = myApps.filter(a => a.status === 'SUBMITTED' || a.status === 'SCHEDULED');

  return (
    <div>
      <PageHeader title={`Welcome, ${currentUser.name}`} subtitle={`${currentUser.department}`} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16, marginBottom: 24 }}>
        <Stat label="Submitted" value={submitted.length} color="#6366f1" />
        <Stat label="Scheduled" value={scheduled.length} color="#f59e0b" />
        <Stat label="Inspected" value={inspired.length} color="#0ea5e9" />
        <Stat label="Certified" value={certified.length} color="#22c55e" />
        <Stat label="Rejected" value={rejected.length} color="#ef4444" />
      </div>

      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <h3 style={{ margin: 0, fontSize: 16, color: '#0f172a' }}>Pending for Review / Scheduling</h3>
          <Link to="/officer/applications" style={{ color: '#0ea5e9', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>All applications</Link>
        </div>
        {pendingInspection.length === 0 ? (
          <p style={{ color: '#94a3b8', fontSize: 13 }}>No pending applications.</p>
        ) : (
          <div style={{ display: 'grid', gap: 10 }}>
            {pendingInspection.map(app => {
              const ins = appInstruments.find(i => i.id === app.instrumentId);
              return (
                <div key={app.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: 10 }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>{app.id}</div>
                    <div style={{ fontSize: 12, color: '#64748b' }}>{ins?.category} · {ins?.serialNumber} · Submitted {fmt(app.submissionDate)}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <StatusBadge status={app.status} />
                    <Link to={`/officer/applications/${app.id}`} style={reviewBtn}>Review</Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <Card>
        <h3 style={{ margin: '0 0 14px', fontSize: 16, color: '#0f172a' }}>Recently Certified</h3>
        {certified.length === 0 ? (
          <p style={{ color: '#94a3b8', fontSize: 13 }}>No certified applications yet.</p>
        ) : (
          <div style={{ display: 'grid', gap: 10 }}>
            {certified.slice(0, 4).map(app => {
              const ins = appInstruments.find(i => i.id === app.instrumentId);
              return (
                <div key={app.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: 10 }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>{app.id}</div>
                    <div style={{ fontSize: 12, color: '#64748b' }}>{ins?.category} · Inspected {fmt(app.inspectionDate)}</div>
                  </div>
                  <Link to={`/officer/applications/${app.id}`} style={{ color: '#0ea5e9', fontWeight: 600, fontSize: 13, textDecoration: 'none' }}>View</Link>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}

function Stat({ label, value, color }) {
  return (
    <Card style={{ padding: 16 }}>
      <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 800, color, marginTop: 4 }}>{value}</div>
    </Card>
  );
}

const reviewBtn = {
  background: '#4f46e5', color: '#fff', padding: '8px 14px', borderRadius: 8,
  fontSize: 12, fontWeight: 700, textDecoration: 'none',
};
