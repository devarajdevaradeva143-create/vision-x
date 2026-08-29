import { useState, useEffect } from 'react';
import { useSearchParams, useParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
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
              <div style={{ fontSize: 22, fontWeight: 800 }}>Certificate Verification</div>
              <div style={{ fontSize: 13, color: '#94a3b8' }}>Legal Metrology Department</div>
            </div>
          </div>
        </div>

        <div style={{ background: '#fff', borderRadius: 16, padding: 24 }}>
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: 10 }}>
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Enter Certificate Number, Application or Instrument ID"
              style={{ flex: 1, padding: '14px 16px', border: '2px solid #cbd5e1', borderRadius: 10, fontSize: 15 }}
            />
            <button style={searchBtn}>Verify</button>
          </form>
          <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 10 }}>
            Try: <b>CERT-2026-001</b> (valid) · <b>CERT-2025-003</b> (expired)
          </div>

          {searched && !cert && result?.notFound && (
            <Alert type="error">Certificate could not be verified.</Alert>
          )}
          {cert && <CertificateResult cert={cert} />}
        </div>
      </div>
    </div>
  );
}

// Compute the certificate status from the issued snapshot.
function certStatus(cert) {
  if (cert.status === 'REVOKED') return { label: 'REVOKED', color: '#ef4444', icon: <Ban size={26} />, sub: 'This certificate has been revoked.' };
  if (cert.result === 'REJECTED' || cert.status === 'REJECTED') return { label: 'REJECTED', color: '#ef4444', icon: <BadgeX size={26} />, sub: 'Verification not approved.' };
  const info = expiryInfo(cert.expiryDate);
  if (info.status === 'expired') return { label: 'EXPIRED', color: '#ef4444', icon: <ShieldAlert size={26} />, sub: 'Certificate Expired.' };
  if (info.status === 'expiring') return { label: 'EXPIRING SOON', color: '#f59e0b', icon: <ShieldAlert size={26} />, sub: `Certificate expires in ${info.days} day${info.days === 1 ? '' : 's'}.` };
  return { label: 'VERIFIED / VALID', color: '#22c55e', icon: <ShieldCheck size={26} />, sub: 'Certificate is valid.' };
}

function CertificateResult({ cert }) {
  const { appUsers } = useApp();
  const status = certStatus(cert);
  const isExpired = status.label === 'EXPIRED' || status.label === 'EXPIRING SOON';
  const officer = appUsers.find(u => u.id === cert.officerId);
  const revoked = status.label === 'REVOKED';

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
          {revoked && <Alert type="error">Certificate Revoked.</Alert>}
          <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }}>
            Certificate Number: <b style={{ color: '#0f172a', fontSize: 14 }}>{cert.id}</b>
          </div>
          <DetailRow>
            <Field label="Certificate Status" value={status.label} color={status.color} />
            <Field label="Application ID" value={cert.applicationId} />
            <Field label="Owner Name" value={cert.ownerName} />
            <Field label="Machine Type" value={cert.machineType} />
            <Field label="Machine ID" value={cert.instrumentId} />
            <Field label="Manufacturer" value={cert.manufacturer} />
            <Field label="Model" value={cert.model} />
            <Field label="Serial Number" value={cert.serialNumber} />
            <Field label="Capacity" value={cert.capacity} />
            <Field label="Location" value={cert.location} />
            <Field label="Verification Date" value={fmt(cert.verificationDate)} />
            <Field label="Issue Date" value={fmt(cert.issueDate)} />
            <Field label="Expiry Date" value={fmt(cert.expiryDate)} color={isExpired ? status.color : undefined} />
            <Field label="Verification Result" value={cert.result === 'CERTIFIED' ? 'VERIFIED & CERTIFIED' : 'REJECTED'} color={cert.result === 'CERTIFIED' ? '#22c55e' : '#ef4444'} />
            <Field label="Officer / Tester" value={cert.officerName || officer?.name} />
          </DetailRow>

          <div style={{ marginTop: 20, paddingTop: 14, borderTop: '1px dashed #cbd5e1', textAlign: 'center', fontSize: 13, color: '#64748b' }}>
            ✓ Verified from the Online Verification System
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
