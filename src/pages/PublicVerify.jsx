import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Card, Field, DetailRow, Alert } from '../components/ui';
import { fmt, expiryInfo } from '../utils/format';
import { Scale, ShieldCheck, ShieldAlert, BadgeX } from 'lucide-react';

export default function PublicVerify() {
  const { appCertificates, appApplications, appInstruments, appUsers } = useApp();
  const [query, setQuery] = useState('');
  const [result, setResult] = useState(null);
  const [searched, setSearched] = useState(false);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const certParam = searchParams.get('cert');
    if (certParam) {
      const cert = appCertificates.find(c => c.id === certParam || c.applicationId === certParam);
      if (cert) {
        setQuery(cert.id);
        setResult(resolveResult(cert.id));
        setSearched(true);
      }
    }
    // eslint-disable-next-line
  }, [searchParams]);

  const resolveResult = (q) => {
    const clean = q.trim();
    if (!clean) return null;

    const certByCertNo = appCertificates.find(c => c.id === clean);
    const certByAppId = appCertificates.find(c => c.applicationId === clean);
    const certByInsId = appCertificates.find(c => c.instrumentId === clean);

    const cert = certByCertNo || certByAppId || certByInsId;
    if (cert) return { cert };

    const app = appApplications.find(a => a.id === clean);
    if (app) {
      return { app, rejected: app.status === 'REJECTED' };
    }

    return { notFound: true };
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setSearched(true);
    setResult(resolveResult(query));
  };

  return (
    <div style={{ minHeight: '100vh', padding: 40, background: 'linear-gradient(135deg,#0f172a,#1e293b)' }}>
      <div style={{ maxWidth: 760, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, color: '#fff' }}>
            <Scale size={32} color="#38bdf8" />
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: 22, fontWeight: 800 }}>Public Certificate Verification</div>
              <div style={{ fontSize: 13, color: '#94a3b8' }}>Legal Metrology Department</div>
            </div>
          </div>
        </div>

        <Card style={{ background: '#fff', borderRadius: 16, padding: 24 }}>
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: 10 }}>
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Enter Instrument ID, Certificate No. or Application Reference ID"
              style={{ flex: 1, padding: '14px 16px', border: '2px solid #cbd5e1', borderRadius: 10, fontSize: 15 }}
            />
            <button style={searchBtn}>Verify</button>
          </form>
          <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 10 }}>
            Try: <b>INS001</b> (certified) · <b>CERT-2025-003</b> (expired) · <b>APP-2026-005</b> (rejected)
          </div>

          {searched && (
            <div style={{ marginTop: 24 }}>
              {!result && <Alert type="info">Please enter a valid ID to verify.</Alert>}
              {result?.notFound && <Alert type="error">No record found for "<b>{query}</b>". Please check the ID and try again.</Alert>}
              {result?.rejected && <VerificationResult status="rejected" app={result.app} />}
              {result?.cert && <VerificationResult status={resolutionToStatus(result.cert)} cert={result.cert} />}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

function resolutionToStatus(cert) {
  const info = expiryInfo(cert.expiryDate);
  if (info.status === 'expired') return 'expired';
  return 'verified';
}

function VerificationResult({ status, cert, app }) {
  const { appApplications, appInstruments, appUsers } = useApp();

  if (status === 'rejected' && app) {
    const instrument = appInstruments.find(i => i.id === app.instrumentId);
    const officer = app.officerId ? appUsers.find(u => u.id === app.officerId) : null;
    return (
      <div style={{ border: '2px solid #ef4444', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ background: '#ef4444', color: '#fff', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <BadgeX size={26} />
          <div>
            <div style={{ fontSize: 20, fontWeight: 800 }}>REJECTED</div>
            <div style={{ fontSize: 13, opacity: 0.9 }}>Verification not approved</div>
          </div>
        </div>
        <div style={{ padding: 20, background: '#fff' }}>
          <DetailRow>
            <Field label="Application Ref" value={app.id} />
            <Field label="Instrument ID" value={instrument?.id} />
            <Field label="Category" value={instrument?.category} />
            <Field label="Officer" value={officer?.name || '—'} />
            <Field label="Remarks" value={app.remarks || '—'} />
          </DetailRow>
        </div>
      </div>
    );
  }

  if (status === 'verified' && cert) {
    const info = expiryInfo(cert.expiryDate);
    const instrument = appInstruments.find(i => i.id === cert.instrumentId);
    const officer = appUsers.find(u => u.id === cert.officerId);
    const isExpired = status === 'expired';

    const bannerColor = isExpired ? '#ef4444' : '#22c55e';
    const bannerIcon = isExpired ? <ShieldAlert size={26} /> : <ShieldCheck size={26} />;
    const bannerLabel = isExpired ? 'EXPIRED' : 'VERIFIED';
    const bannerSub = isExpired ? 'This certificate has expired' : 'Certificate is valid';

    return (
      <div style={{ border: `2px solid ${bannerColor}`, borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ background: bannerColor, color: '#fff', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 10 }}>
          {bannerIcon}
          <div>
            <div style={{ fontSize: 20, fontWeight: 800 }}>{bannerLabel}</div>
            <div style={{ fontSize: 13, opacity: 0.9 }}>{bannerSub}</div>
          </div>
        </div>
        <div style={{ padding: 20, background: '#fff', display: 'grid', gap: 20 }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }}>Certificate Details</div>
            <DetailRow>
              <Field label="Certificate Number" value={cert.id} />
              <Field label="Application Ref" value={cert.applicationId} />
              <Field label="Instrument ID" value={cert.instrumentId} />
              <Field label="Owner Name" value={cert.ownerName} />
              <Field label="Instrument Type" value={cert.instrumentType} />
              <Field label="Category" value={cert.category} />
              <Field label="Serial Number" value={cert.serialNumber} />
            </DetailRow>
          </div>
          <div style={{ borderTop: '1px dashed #cbd5e1', paddingTop: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }}>Verification Status</div>
            <DetailRow>
              <Field label="Verification Date" value={fmt(cert.verificationDate)} />
              <Field label="Issue Date" value={fmt(cert.issueDate)} />
              <Field label="Expiry Date" value={fmt(cert.expiryDate)} color={info.color} />
              <Field label="Validity" value={info.label} color={info.color} />
              <Field label="Officer / Tester" value={cert.officerName} />
            </DetailRow>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

const searchBtn = {
  background: '#4f46e5', color: '#fff', padding: '0 28px', borderRadius: 10,
  fontSize: 15, fontWeight: 700, border: 'none', cursor: 'pointer',
};
