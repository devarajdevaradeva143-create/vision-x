import { useParams, useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { useApp } from '../context/AppContext';
import { Card, PageHeader, Field, DetailRow } from '../components/ui';
import { fmt } from '../utils/format';

export default function CertificateDetail() {
  const { id } = useParams();
  const { appCertificates } = useApp();
  const navigate = useNavigate();

  const cert = appCertificates.find(c => c.applicationId === id);
  if (!cert) return <Card><p>Certificate not found.</p></Card>;

  return <CertificateView cert={cert} onBack={() => navigate(-1)} />;
}

export function CertificateView({ cert, onBack }) {
  const { appInstruments, appUsers } = useApp();
  const instrument = appInstruments.find(i => i.id === cert.instrumentId);
  const officer = appUsers.find(u => u.id === cert.officerId);
  const verificationUrl = `${window.location.origin}/verify?cert=${cert.id}`;
  const isExpired = new Date(cert.expiryDate) < new Date();
  const expiringSoon = !isExpired && (new Date(cert.expiryDate) - new Date()) / (1000 * 60 * 60 * 24) <= 30;
  const expiryColor = isExpired ? '#ef4444' : expiringSoon ? '#f59e0b' : '#22c55e';

  return (
    <div>
      <PageHeader
        title="Digital Verification Certificate"
        subtitle={`Certificate ${cert.id}`}
        action={<div style={{ display: 'flex', gap: 10 }}>
          {onBack && <button onClick={onBack} style={backBtn}>← Back</button>}
          <button onClick={() => window.print()} style={downloadBtn}>⬇ Download / Print</button>
        </div>}
      />

      <div style={{ border: '2px solid #4f46e5', borderRadius: 14, overflow: 'hidden', background: '#fff' }}>
        <div style={{ background: 'linear-gradient(135deg,#4f46e5,#0ea5e9)', color: '#fff', padding: '20px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 13, opacity: 0.85 }}>Government of India · Legal Metrology Department</div>
            <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: 0.5 }}>CERTIFICATE OF VERIFICATION</div>
          </div>
          <div style={{ textAlign: 'right', fontSize: 13 }}>
            <div style={{ opacity: 0.85 }}>Certificate No.</div>
            <div style={{ fontWeight: 800, fontSize: 16 }}>{cert.id}</div>
          </div>
        </div>

        <div style={{ padding: 28 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 28 }}>
            <div>
              <DetailRow>
                <Field label="Application Ref" value={cert.applicationId} />
                <Field label="Instrument ID" value={cert.instrumentId} />
                <Field label="Owner Name" value={cert.ownerName} />
                <Field label="Instrument Type" value={cert.instrumentType} />
                <Field label="Category" value={cert.category} />
                <Field label="Serial Number" value={cert.serialNumber} />
                <Field label="Verification Date" value={fmt(cert.verificationDate)} />
                <Field label="Issue Date" value={fmt(cert.issueDate)} />
                <Field label="Expiry Date" value={fmt(cert.expiryDate)} color={expiryColor} />
                <Field label="Officer / Tester" value={cert.officerName} />
              </DetailRow>

              <div style={{ marginTop: 24, padding: 14, background: cert.result === 'CERTIFIED' ? '#f0fdf4' : '#fef2f2', border: `1px solid ${cert.result === 'CERTIFIED' ? '#bbf7d0' : '#fecaca'}`, borderRadius: 8 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: cert.result === 'CERTIFIED' ? '#15803d' : '#b91c1c' }}>
                  Verification Result: {cert.result === 'CERTIFIED' ? 'INSTRUMENT VERIFIED & CERTIFIED' : 'REJECTED'}
                </div>
                <div style={{ fontSize: 13, color: '#475569', marginTop: 4 }}>
                  This is to certify that the above instrument has been verified by the Legal Metrology Department and found to be accurate, precise and conforming to the prescribed standards.
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', gap: 10 }}>
              <div style={{ background: '#fff', padding: 12, border: '1px solid #e2e8f0', borderRadius: 8 }}>
                <QRCodeSVG value={verificationUrl} size={150} level="M" />
              </div>
              <div style={{ fontSize: 12, color: '#64748b', textAlign: 'center' }}>
                Scan to verify<br />this certificate
              </div>
            </div>
          </div>

          <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px dashed #cbd5e1', display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#64748b' }}>
            <div>This certificate is digitally verified. To verify, scan the QR code or visit the public verification page.</div>
            <div><b style={{ color: '#0f172a' }}>Verified digitally by</b> {cert.officerName}</div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 12, fontSize: 12, color: '#64748b' }}>
        Public verification link: <b>{verificationUrl}</b>
      </div>
    </div>
  );
}

const backBtn = {
  background: '#f1f5f9', color: '#334155', padding: '10px 16px', borderRadius: 8,
  fontSize: 13, fontWeight: 700, border: '1px solid #e2e8f0', cursor: 'pointer',
};

const downloadBtn = {
  background: '#4f46e5', color: '#fff', padding: '10px 16px', borderRadius: 8,
  fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer',
};
