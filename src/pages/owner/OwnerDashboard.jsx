import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { PageHeader, Card, StatusBadge } from '../../components/ui';
import { fmt, daysUntil, expiryInfo } from '../../utils/format';

export default function OwnerDashboard() {
  const { currentUser, appApplications, appInstruments, appCertificates } = useApp();

  const myInstruments = appInstruments.filter(i => i.ownerId === currentUser.id);
  const myApps = appApplications.filter(a => a.ownerId === currentUser.id);
  const myCerts = appCertificates.filter(c => c.ownerId === currentUser.id);

  const latestCert = myCerts[0];

  const activeAlerts = myCerts
    .filter(c => c.applicationId !== undefined)
    .map(c => {
      const info = expiryInfo(c.expiryDate);
      return { cert: c, info };
    })
    .filter(x => x.info.status === 'expiring' || x.info.status === 'expired');

  const countByStatus = (s) => myApps.filter(a => a.status === s).length;

  return (
    <div>
      <PageHeader
        title={`Welcome, ${currentUser.name.split(' ')[0]}`}
        subtitle="Manage your instruments, applications and certificates"
      />

      {activeAlerts.length > 0 && (
        <div style={{ marginBottom: 24, display: 'grid', gap: 8 }}>
          {activeAlerts.map(({ cert, info }) => {
            const ins = appInstruments.find(i => i.id === cert.instrumentId);
            return (
              <div key={cert.id} style={{
                background: info.status === 'expired' ? '#fef2f2' : '#fffbeb',
                border: `1px solid ${info.status === 'expired' ? '#fecaca' : '#fde68a'}`,
                borderLeft: `5px solid ${info.color}`,
                color: info.status === 'expired' ? '#b91c1c' : '#b45309',
                padding: '12px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600,
              }}>
                {info.status === 'expired'
                  ? `Your ${ins?.category || 'instrument'} certificate (${cert.id}) has EXPIRED on ${fmt(cert.expiryDate)}. Please re-apply for verification immediately.`
                  : `Your ${ins?.category || 'instrument'} certificate will expire in ${info.days} day${info.days === 1 ? '' : 's'} (on ${fmt(cert.expiryDate)}). Please schedule verification.`}
              </div>
            );
          })}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        <Stat label="Instruments" value={myInstruments.length} color="#0ea5e9" />
        <Stat label="Applications" value={myApps.length} color="#6366f1" />
        <Stat label="Certified" value={countByStatus('CERTIFIED')} color="#22c55e" />
        <Stat label="Certificates" value={myCerts.length} color="#f59e0b" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <h3 style={{ margin: 0, fontSize: 16, color: '#0f172a' }}>Recent Applications</h3>
            <Link to="/applications" style={{ color: '#0ea5e9', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>View all</Link>
          </div>
          {myApps.length === 0 && <Empty text="No applications yet" />}
          <div style={{ display: 'grid', gap: 10 }}>
            {myApps.slice(0, 4).map(app => {
              const ins = appInstruments.find(i => i.id === app.instrumentId);
              return (
                <div key={app.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: 10 }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>{app.id}</div>
                    <div style={{ fontSize: 12, color: '#64748b' }}>{ins?.category} · {fmt(app.submissionDate)}</div>
                  </div>
                  <StatusBadge status={app.status} />
                </div>
              );
            })}
          </div>
        </Card>

        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <h3 style={{ margin: 0, fontSize: 16, color: '#0f172a' }}>Certificates</h3>
            <Link to="/certificates" style={{ color: '#0ea5e9', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>View all</Link>
          </div>
          {myCerts.length === 0 && <Empty text="No certificates issued yet" />}
          <div style={{ display: 'grid', gap: 10 }}>
            {myCerts.slice(0, 3).map(cert => {
              const info = expiryInfo(cert.expiryDate);
              return (
                <div key={cert.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: 10 }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>{cert.id}</div>
                    <div style={{ fontSize: 12, color: '#64748b' }}>{cert.category} · {cert.serialNumber}</div>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: info.color }}>{info.label}</span>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {latestCert && (
        <Card style={{ marginTop: 16 }}>
          <h3 style={{ margin: '0 0 6px', fontSize: 16, color: '#0f172a' }}>Latest Certificate</h3>
          {latestCert ? (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
              <div style={{ color: '#64748b', fontSize: 14 }}>
                <b style={{ color: '#0f172a' }}>{latestCert.category}</b> · Valid until {fmt(latestCert.expiryDate)}
              </div>
              <Link to={`/certificates/${latestCert.applicationId}`} style={linkBtn}>View Certificate</Link>
            </div>
          ) : null}
        </Card>
      )}
    </div>
  );
}

function Stat({ label, value, color }) {
  return (
    <Card style={{ padding: 18 }}>
      <div style={{ fontSize: 13, color: '#64748b', fontWeight: 600 }}>{label}</div>
      <div style={{ fontSize: 30, fontWeight: 800, color, marginTop: 4 }}>{value}</div>
    </Card>
  );
}

function Empty({ text }) {
  return <div style={{ color: '#94a3b8', fontSize: 13, padding: '20px 0', textAlign: 'center' }}>{text}</div>;
}

const linkBtn = {
  background: '#4f46e5', color: '#fff', padding: '8px 16px', borderRadius: 8,
  fontSize: 13, fontWeight: 600, textDecoration: 'none',
};
