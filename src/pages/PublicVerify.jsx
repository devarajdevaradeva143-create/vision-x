import { useState, useEffect } from 'react';
import { useSearchParams, useParams, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { Field, DetailRow, Alert } from '../components/ui';
import { fmt, expiryInfo } from '../utils/format';
import { Scale, ShieldCheck, ShieldAlert, BadgeX, Ban } from 'lucide-react';

// ---------------------------------------------------------------------------
// Public Certificate Verification page.
// Opens from a scanned QR (path /verify/:certId) or a manual search.
// We retrieve the EXACT certificate by its certificate number and show the
// full issued snapshot — never sample data.
// ---------------------------------------------------------------------------

export default function PublicVerify() {
  const { appCertificates } = useApp();
  const { t } = useLanguage();
  const [query, setQuery] = useState('');
  const [result, setResult] = useState(null);
  const [searched, setSearched] = useState(false);
  const [searchParams] = useSearchParams();
  const params = useParams();

  // Look up a certificate STRICTLY by its certificate number (id).
  const resolveByNumber = (n) => {
    const cert = appCertificates.find(c => c.id === n);
    return cert ? { cert } : { notFound: true };
  };

  // QR-scanned certificate numbers resolve strictly by certificate number.
  useEffect(() => {
    const fromPath = params.certId;
    const fromQuery = searchParams.get('cert');
    const number = (fromPath || fromQuery || '').trim();
    if (number) {
      setQuery(number);
      setResult(resolveByNumber(number));
      setSearched(true);
    }
    // eslint-disable-next-line
  }, [params.certId, searchParams]);

  // Manual search is more permissive (cert / application / instrument).
  const handleSearch = (e) => {
    e.preventDefault();
    setSearched(true);
    const clean = query.trim();
    if (!clean) return setResult(null);
    const cert = appCertificates.find(c =>
      c.id === clean || c.applicationId === clean || c.instrumentId === clean);
    setResult(cert ? { cert } : { notFound: true });
  };

  const cert = result?.cert;

  return (
    <div style={{ minHeight: '100vh', padding: 40, background: 'linear-gradient(135deg,#0f172a,#1e293b)' }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, color: '#fff' }}>
            <Scale size={32} color="#38bdf8" />
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: 22, fontWeight: 800 }}>{t('certificateVerification')}</div>
              <div style={{ fontSize: 13, color: '#94a3b8' }}>{t('legalMetrologyDepartment')}</div>
            </div>
          </div>
        </div>

        <div style={{ background: '#fff', borderRadius: 16, padding: 24 }}>
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: 10 }}>
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder={t('enterCertPlaceholder')}
              style={{ flex: 1, padding: '14px 16px', border: '2px solid #cbd5e1', borderRadius: 10, fontSize: 15 }}
            />
            <button style={searchBtn}>{t('verify')}</button>
          </form>
          <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 10 }}>
            {t('tryHint').replace('{a}', 'CERT-2026-001').replace('{b}', 'CERT-2025-003')}
          </div>

          {searched && !cert && result?.notFound && (
            <Alert type="error">{t('certNotVerified')}</Alert>
          )}
          {cert && <CertificateResult cert={cert} />}
        </div>
      </div>
    </div>
  );
}

// Compute the certificate status from the issued snapshot.
function certStatus(cert, t) {
  if (cert.status === 'REVOKED') return { label: t('statusRevoked'), color: '#ef4444', icon: <Ban size={26} />, sub: t('statusRevokedSub') };
  if (cert.result === 'REJECTED' || cert.status === 'REJECTED') return { label: t('statusRejected'), color: '#ef4444', icon: <BadgeX size={26} />, sub: t('statusRejectedSub') };
  const info = expiryInfo(cert.expiryDate);
  if (info.status === 'expired') return { label: t('statusExpired'), color: '#ef4444', icon: <ShieldAlert size={26} />, sub: t('certExpiredSub') };
  if (info.status === 'expiring') return { label: t('statusExpiringSoon'), color: '#f59e0b', icon: <ShieldAlert size={26} />, sub: t('certExpiringSub').replace('{days}', info.days) };
  return { label: t('statusValid'), color: '#22c55e', icon: <ShieldCheck size={26} />, sub: t('certValidSub') };
}

function CertificateResult({ cert }) {
  const { appUsers } = useApp();
  const { t } = useLanguage();
  const status = certStatus(cert, t);
  const isExpired = status.label === t('statusExpired') || status.label === t('statusExpiringSoon');
  const officer = appUsers.find(u => u.id === cert.officerId);
  const revoked = status.label === t('statusRevoked');

  return (
    <div style={{ marginTop: 24 }}>
      <div style={{ border: `2px solid ${status.color}`, borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ background: status.color, color: '#fff', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 10 }}>
          {status.icon}
          <div>
            <div style={{ fontSize: 20, fontWeight: 800 }}>{status.label}</div>
            <div style={{ fontSize: 13, opacity: 0.9 }}>{status.sub}</div>
          </div>
        </div>

        <div style={{ padding: 20, background: '#fff' }}>
          {revoked && <Alert type="error">{t('certificateRevoked')}</Alert>}
          <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }}>
            {t('certificateNumber')} <b style={{ color: '#0f172a', fontSize: 14 }}>{cert.id}</b>
          </div>
          <DetailRow>
            <Field label={t('certificateStatus')} value={status.label} color={status.color} />
            <Field label={t('applicationIdField')} value={cert.applicationId} />
            <Field label={t('ownerName')} value={cert.ownerName} />
            <Field label={t('machineTypeField')} value={cert.machineType} />
            <Field label={t('machineOrInstrId')} value={cert.instrumentId} />
            <Field label={t('manufacturer')} value={cert.manufacturer} />
            <Field label={t('model')} value={cert.model} />
            <Field label={t('serialNumber')} value={cert.serialNumber} />
            <Field label={t('capacityRange')} value={cert.capacity} />
            <Field label={t('location')} value={cert.location} />
            <Field label={t('verificationDate')} value={fmt(cert.verificationDate)} />
            <Field label={t('issueDate')} value={fmt(cert.issueDate)} />
            <Field label={t('expiryDate')} value={fmt(cert.expiryDate)} color={isExpired ? status.color : undefined} />
            <Field label={t('verificationResultField')} value={cert.result === 'CERTIFIED' ? t('verifiedCertified') : t('rejectedStatus')} color={cert.result === 'CERTIFIED' ? '#22c55e' : '#ef4444'} />
            <Field label={t('officerTester')} value={cert.officerName || officer?.name} />
          </DetailRow>

          {/* Public complaint entry point — opens the complaint form with THIS
              exact certificate already attached (via ?cert= number), so the
              public user never re-enters or edits the certificate details. */}
          <div style={{ marginTop: 20, textAlign: 'center' }}>
            <Link to={`/report?cert=${cert.id}`} style={reportBtn}>
              🚨 {t('reportProblem')}
            </Link>
          </div>

          <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px dashed #cbd5e1', textAlign: 'center', fontSize: 13, color: '#64748b' }}>
            {t('verifiedFromSystem')}
          </div>
        </div>
      </div>
    </div>
  );
}

const searchBtn = {
  background: '#4f46e5', color: '#fff', padding: '0 28px', borderRadius: 10,
  fontSize: 15, fontWeight: 700, border: 'none', cursor: 'pointer',
};

const reportBtn = {
  display: 'inline-block', background: '#ef4444', color: '#fff', padding: '12px 24px',
  borderRadius: 10, fontSize: 14, fontWeight: 700, textDecoration: 'none',
};
