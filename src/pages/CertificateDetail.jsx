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
  const { t } = useLanguage();

  const cert = appCertificates.find(c => c.applicationId === id);
  if (!cert) return <Card><p className="text-sm text-gray-600">{t('certificateNotFound')}</p></Card>;

  return <CertificateView cert={cert} onBack={() => navigate(-1)} />;
}

export function CertificateView({ cert, onBack }) {
  const { t } = useLanguage();
  const verificationUrl = buildVerifyUrl(cert.id);
  const isExpired = new Date(cert.expiryDate) < new Date();
  const expiringSoon = !isExpired && (new Date(cert.expiryDate) - new Date()) / (1000 * 60 * 60 * 24) <= 30;
  const statusLabel = cert.status === 'REVOKED' ? t('statusRevoked') : isExpired ? t('statusExpired') : expiringSoon ? t('statusExpiringSoon') : t('statusValid');
  const expiryClass = isExpired ? 'text-red-800' : expiringSoon ? 'text-amber-800' : 'text-green-800';

  return (
    <div>
      <PageHeader
        title={t('digitalVerificationCertificate')}
        subtitle={t('certificatePrefix').replace('{id}', cert.id)}
        action={<div className="flex gap-2.5">
          {onBack && <button onClick={onBack} className="cursor-pointer rounded-md border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100">{t('back')}</button>}
          <button onClick={() => window.print()} className="cursor-pointer rounded-md bg-blue-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-900">{t('downloadPrint')}</button>
        </div>}
      />

      <div className="overflow-hidden rounded-lg border-2 border-blue-800 bg-white">
        <div className="flex items-center justify-between bg-blue-900 px-6 py-5 text-white sm:px-7">
          <div>
            <div className="text-xs text-blue-200">{t('govtHeader')}</div>
            <div className="text-lg font-bold tracking-wide sm:text-2xl">{t('certificateOfVerification')}</div>
          </div>
          <div className="text-right text-xs sm:text-sm">
            <div className="text-blue-200">{t('certificateNo')}</div>
            <div className="text-sm font-bold sm:text-base">{cert.id}</div>
          </div>
        </div>

        <div className="p-6 sm:p-7">
          <div className="grid gap-7 md:grid-cols-[2fr_1fr]">
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
                <Field label={t('expiryDate')} value={fmt(cert.expiryDate)} className={expiryClass} />
                <Field label={t('certificateStatus')} value={statusLabel} className={expiryClass} />
                <Field label={t('officerTester')} value={cert.officerName} />
              </DetailRow>

              {cert.machinePhoto && (
                <div className="mt-4">
                  <div className="mb-1.5 text-sm font-bold text-gray-800">{t('machinePhoto')}</div>
                  <img src={cert.machinePhoto} alt={t('machinePhoto')} className="h-48 w-48 object-contain rounded-md border border-gray-200" />
                </div>
              )}

              <div className={`mt-6 rounded-md border p-3.5 ${cert.result === 'CERTIFIED' ? 'border-green-200 bg-green-100' : 'border-red-200 bg-red-100'}`}>
                <div className={`text-sm font-semibold ${cert.result === 'CERTIFIED' ? 'text-green-800' : 'text-red-800'}`}>
                  {t('verificationResult')}{cert.result === 'CERTIFIED' ? t('verifiedCertified') : t('rejectedStatus')}
                </div>
                <div className="mt-1 text-sm text-gray-700">
                  {t('certBody')}
                </div>
              </div>
            </div>

            <div className="flex flex-col items-start justify-start gap-2.5 md:items-center">
              <div className="rounded-md border border-gray-200 bg-white p-3">
                <QRCodeSVG value={verificationUrl} size={150} level="M" />
              </div>
              <div className="text-center text-xs whitespace-pre-line text-gray-600">
                {t('scanToVerify')}
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-1 border-t border-dashed border-gray-300 pt-4 text-xs text-gray-600 sm:flex-row sm:justify-between">
            <div>{t('digitallyVerified')}</div>
            <div><b className="text-gray-800">{t('verifiedDigitallyBy')}</b> {cert.officerName}</div>
          </div>
        </div>
      </div>

      <div className="mt-3 text-xs text-gray-600">
        {t('publicVerificationLink')} <b className="text-gray-800">{verificationUrl}</b>
      </div>
    </div>
  );
}