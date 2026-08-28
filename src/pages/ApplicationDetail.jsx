import { useParams, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Card, PageHeader, StatusBadge, ProgressTracker, Field, DetailRow } from '../components/ui';
import { fmt } from '../utils/format';

export default function ApplicationDetail() {
  const { id } = useParams();
  const { appApplications, appInstruments, appUsers, appCertificates } = useApp();

  const app = appApplications.find(a => a.id === id);
  if (!app) return <Card><p>Application not found.</p></Card>;

  const instrument = appInstruments.find(i => i.id === app.instrumentId);
  const owner = appUsers.find(u => u.id === app.ownerId);
  const officer = app.officerId ? appUsers.find(u => u.id === app.officerId) : null;
  const certificate = appCertificates.find(c => c.applicationId === app.id);

  return (
    <div>
      <PageHeader title={app.id} subtitle="Application details & status" action={<StatusBadge status={app.status} />} />

      <Card style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 13, color: '#475569', marginBottom: 10 }}>Application Status Flow</div>
        <ProgressTracker status={app.status} />
      </Card>

      {app.remarks && (app.status === 'REJECTED' || app.status === 'CERTIFIED') && (
        <Card style={{ marginBottom: 16, background: app.status === 'REJECTED' ? '#fef2f2' : '#f0fdf4', borderColor: app.status === 'REJECTED' ? '#fecaca' : '#bbf7d0' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: app.status === 'REJECTED' ? '#b91c1c' : '#15803d', marginBottom: 6 }}>Officer Remarks — {app.status}</div>
          <div style={{ fontSize: 14, color: '#334155' }}>{app.remarks}</div>
        </Card>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <Card>
          <h3 style={{ margin: '0 0 16px', fontSize: 16, color: '#0f172a' }}>Instrument Details</h3>
          {instrument ? (
            <DetailRow>
              <Field label="Instrument ID" value={instrument.id} />
              <Field label="Type" value={instrument.type} />
              <Field label="Category" value={instrument.category} />
              <Field label="Manufacturer" value={instrument.manufacturer} />
              <Field label="Model Number" value={instrument.modelNumber} />
              <Field label="Serial Number" value={instrument.serialNumber} />
              <Field label="Capacity" value={instrument.capacity} />
              <Field label="Location" value={instrument.location} />
            </DetailRow>
          ) : <p style={{ color: '#94a3b8' }}>Instrument not found.</p>}
        </Card>

        <Card>
          <h3 style={{ margin: '0 0 16px', fontSize: 16, color: '#0f172a' }}>Owner & Officer</h3>
          <DetailRow>
            <Field label="Owner Name" value={owner?.name} />
            <Field label="Owner Email" value={owner?.email} />
            <Field label="Owner Phone" value={owner?.phone} />
            <Field label="Officer" value={officer?.name || 'Not assigned yet'} color={officer ? undefined : '#94a3b8'} />
          </DetailRow>
        </Card>
      </div>

      <Card style={{ marginTop: 16 }}>
        <h3 style={{ margin: '0 0 16px', fontSize: 16, color: '#0f172a' }}>Schedule</h3>
        <DetailRow>
          <Field label="Submission Date" value={fmt(app.submissionDate)} />
          <Field label="Scheduled Inspection" value={app.scheduledDate ? fmt(app.scheduledDate) : 'Not scheduled'} color={app.scheduledDate ? undefined : '#f59e0b'} />
          <Field label="Actual Inspection Date" value={app.inspectionDate ? fmt(app.inspectionDate) : '—'} />
        </DetailRow>
      </Card>

      {app.readings && (
        <Card style={{ marginTop: 16 }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 16, color: '#0f172a' }}>Verification Readings</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px,1fr))', gap: 16 }}>
            {Object.entries(app.readings).map(([k, v]) => (
              <Field key={k} label={k.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())} value={v} />
            ))}
          </div>
        </Card>
      )}

      {certificate && (
        <Card style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 13, color: '#22c55e', fontWeight: 700 }}>CERTIFIED</div>
            <div style={{ fontSize: 14, color: '#475569' }}>Certificate <b style={{ color: '#0f172a' }}>{certificate.id}</b> issued on {fmt(certificate.issueDate)}</div>
          </div>
          <Link to={`/certificates/${app.id}`} style={viewBtn}>View Certificate</Link>
        </Card>
      )}
    </div>
  );
}

const viewBtn = {
  background: '#4f46e5', color: '#fff', padding: '10px 18px', borderRadius: 8,
  fontSize: 13, fontWeight: 700, textDecoration: 'none',
};
