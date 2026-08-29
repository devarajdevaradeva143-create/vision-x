import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';
import { PageHeader, Card } from '../../components/ui';
import { expiryInfo } from '../../utils/format';

export default function AdminDashboard() {
  const { appUsers, appApplications, appInstruments, appCertificates } = useApp();
  const { t } = useLanguage();

  const owners = appUsers.filter(u => u.role === 'owner');
  const officers = appUsers.filter(u => u.role === 'officer');
  const admins = appUsers.filter(u => u.role === 'admin');

  const byStatus = (s) => appApplications.filter(a => a.status === s).length;

  const validCerts = appCertificates.filter(c => expiryInfo(c.expiryDate).status === 'valid').length;
  const expiringCerts = appCertificates.filter(c => expiryInfo(c.expiryDate).status === 'expiring').length;
  const expiredCerts = appCertificates.filter(c => expiryInfo(c.expiryDate).status === 'expired').length;

  return (
    <div>
      <PageHeader title={t('systemOverview')} subtitle={t('systemOverviewSub')} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        <Stat label={t('owners')} value={owners.length} color="#0ea5e9" />
        <Stat label={t('officers')} value={officers.length} color="#6366f1" />
        <Stat label={t('statInstruments')} value={appInstruments.length} color="#8b5cf6" />
        <Stat label={t('statApplications')} value={appApplications.length} color="#f59e0b" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
        <Card>
          <h3 style={{ margin: '0 0 14px', fontSize: 16, color: '#0f172a' }}>{t('applicationsByStatus')}</h3>
          <div style={{ display: 'grid', gap: 8 }}>
            {['SUBMITTED', 'SCHEDULED', 'INSPECTED', 'CERTIFIED', 'REJECTED'].map(s => (
              <div key={s} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: 8 }}>
                <span style={{ fontSize: 13, color: '#475569', fontWeight: 600 }}>{statusLabel(t, s)}</span>
                <span style={{ fontSize: 16, fontWeight: 800, color: statusColor(s) }}>{byStatus(s)}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h3 style={{ margin: '0 0 14px', fontSize: 16, color: '#0f172a' }}>{t('certificateValidity')}</h3>
          <div style={{ display: 'grid', gap: 8 }}>
            <ValidityRow label={t('valid')} count={validCerts} color="#22c55e" />
            <ValidityRow label={t('expiringSoon')} count={expiringCerts} color="#f59e0b" />
            <ValidityRow label={t('expired')} count={expiredCerts} color="#ef4444" />
          </div>
        </Card>

        <Card>
          <h3 style={{ margin: '0 0 14px', fontSize: 16, color: '#0f172a' }}>{t('summary')}</h3>
          <div style={{ fontSize: 13, color: '#475569', lineHeight: 1.8 }}>
            {t('summaryText').replace('{certs}', appCertificates.length).replace('{instruments}', appInstruments.length)}
          </div>
          <div style={{ marginTop: 14, padding: 10, background: '#f8fafc', borderRadius: 8, fontSize: 12, color: '#64748b' }}>
            {t('expiringNote').replace('{count}', expiringCerts)}
          </div>
        </Card>
      </div>
    </div>
  );
}

function statusLabel(t, s) {
  const key = { SUBMITTED: 'statusSubmitted', SCHEDULED: 'statusScheduled', INSPECTED: 'statusInspected', CERTIFIED: 'statusCertified', REJECTED: 'statusRejected' }[s];
  return key ? t(key) : s;
}

function Stat({ label, value, color }) {
  return (
    <Card style={{ padding: 16 }}>
      <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 800, color, marginTop: 4 }}>{value}</div>
    </Card>
  );
}

function ValidityRow({ label, count, color }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: 8 }}>
      <span style={{ fontSize: 13, color: '#475569', fontWeight: 600 }}>{label}</span>
      <span style={{ fontSize: 16, fontWeight: 800, color }}>{count}</span>
    </div>
  );
}

function statusColor(s) {
  return { SUBMITTED: '#6366f1', SCHEDULED: '#f59e0b', INSPECTED: '#0ea5e9', CERTIFIED: '#22c55e', REJECTED: '#ef4444' }[s] || '#64748b';
}
