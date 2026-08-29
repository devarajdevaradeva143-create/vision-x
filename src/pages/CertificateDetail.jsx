import { useParams, useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { Card, PageHeader, Field, DetailRow } from '../components/ui';
import { fmt } from '../utils/format';
import { buildVerifyUrl } from '../utils/verifyUrl';

export default function CertificateDetail() {
  const { id } = useParams();
  const { appCertificates } = useApp();
  const navigate = useNavigate();

  const cert = appCertificates.find(c => c.applicationId === id);
  if (!cert) return <Card><p>Certificate not found.</p></Card>;

  return <CertificateView cert={cert} onBack={() => navigate(-1)} />;
}

export function CertificateView({ cert, onBack }) {
  const { t } = useLanguage();
  // Build the public verification URL (uses VITE_PUBLIC_URL, never localhost).
  const verificationUrl = buildVerifyUrl(cert.id);
  const isExpired = new Date(cert.expiryDate) < new Date();
  const expiringSoon = !isExpired && (new Date(cert.expiryDate) - new Date()) / (1000 * 60 * 60 * 24) <= 30;
  const statusLabel = cert.status === 'REVOKED' ? t('statusRevoked') : isExpired ? t('statusExpired') : expiringSoon ? t('statusExpiringSoon') : t('statusValid');
  const expiryColor = isExpired ? '#ef4444' : expiringSoon ? '#f59e0b' : '#22c55e';

  return (
    <div>
      <PageHeader
        title={t('digitalVerificationCertificate')}
        subtitle={t('certificatePrefix').replace('{id}', cert.id)}
        action={<div style={{ display: 'flex', gap: 10 }}>
          {onBack && <button onClick={onBack} style={backBtn}>{t('back')}</button>}
          <button onClick={() => window.print()} style={downloadBtn}>{t('downloadPrint')}</button>
        </div>}
      />

      <div style={{ border: '2px solid #4f46e5', borderRadius: 14, overflow: 'hidden', background: '#fff' }}>
        <div style={{ background: 'linear-gradient(135deg,#4f46e5,#0ea5e9)', color: '#fff', padding: '20px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 13, opacity: 0.85 }}>{t('govtHeader')}</div>
            <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: 0.5 }}>{t('certificateOfVerification')}</div>
          </div>
          <div style={{ textAlign: 'right', fontSize: 13 }}>
            <div style={{ opacity: 0.85 }}>{t('certificateNo')}</div>
            <div style={{ fontWeight: 800, fontSize: 16 }}>{cert.id}</div>
          </div>
        </div>

        <div style={{ padding: 28 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 28 }}>
            <div>
              <DetailRow>
                <Field label={t('applicationRef')} value={cert.applicationId} />
                <Field label={t('machineOrInstrumentId')} value={cert.instrumentId} />
                <Field label={t('ownerName')} value={cert.ownerName} />
                <Field label={t('machineTypeField')} value={cert.machineType} />
                <Field label={t('manufacturer')} value={cert.manufacturer} />
                <Field label={t('model')} value={cert.model} />
                <Field label={t('serialNumber')} value={cert.serialNumber} />
                <Field label={t('capacityRange')} value={cert.capacity} />
                <Field label={t('location')} value={cert.location} />
                <Field label={t('verificationDate')} value={fmt(cert.verificationDate)} />
                <Field label={t('issueDate')} value={fmt(cert.issueDate)} />
                <Field label={t('expiryDate')} value={fmt(cert.expiryDate)} color={expiryColor} />
                <Field label={t('certificateStatus')} value={statusLabel} color={expiryColor} />
                <Field label={t('officerTester')} value={cert.officerName} />
              </DetailRow>

              <div style={{ marginTop: 24, padding: 14, background: cert.result === 'CERTIFIED' ? '#f0fdf4' : '#fef2f2', border: `1px solid ${cert.result === 'CERTIFIED' ? '#bbf7d0' : '#fecaca'}`, borderRadius: 8 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: cert.result === 'CERTIFIED' ? '#15803d' : '#b91c1c' }}>
                  {t('verificationResult')}{cert.result === 'CERTIFIED' ? t('verifiedCertified') : t('rejectedStatus')}
                </div>
                <div style={{ fontSize: 13, color: '#475569', marginTop: 4 }}>
                  {t('certBody')}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', gap: 10 }}>
              <div style={{ background: '#fff', padding: 12, border: '1px solid #e2e8f0', borderRadius: 8 }}>
                <QRCodeSVG value={verificationUrl} size={150} level="M" />
              </div>
              <div style={{ fontSize: 12, color: '#64748b', textAlign: 'center', whiteSpace: 'pre-line' }}>
                {t('scanToVerify')}
              </div>
            </div>
          </div>

          <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px dashed #cbd5e1', display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#64748b' }}>
            <div>{t('digitallyVerified')}</div>
            <div><b style={{ color: '#0f172a' }}>{t('verifiedDigitallyBy')}</b> {cert.officerName}</div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 12, fontSize: 12, color: '#64748b' }}>
        {t('publicVerificationLink')} <b>{verificationUrl}</b>
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
