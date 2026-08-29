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
    <div style={{ minHeight: '100vh' }} className="bg-gray-100 p-4 sm:p-8 lg:p-12">
      <div className="mx-auto max-w-3xl">
        <div className="mb-7 text-center">
          <div className="inline-flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-md bg-blue-900 text-amber-400">
              <Scale size={30} />
            </div>
            <div className="text-left">
              <div className="text-lg font-bold text-blue-900 sm:text-xl">{t('certificateVerification')}</div>
              <div className="text-xs text-gray-600 sm:text-sm">{t('legalMetrologyDepartment')}</div>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
          <form onSubmit={handleSearch} className="flex flex-col gap-3 sm:flex-row sm:gap-2.5">
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder={t('enterCertPlaceholder')}
              className="flex-1 rounded-md border border-gray-300 px-4 py-3 text-sm text-gray-800 focus:border-blue-700 focus:outline-none"
            />
            <button className="cursor-pointer rounded-md bg-blue-800 px-8 py-3 text-sm font-semibold text-white hover:bg-blue-900">
              {t('verify')}
            </button>
          </form>
          <div className="mt-2.5 text-xs text-gray-500">
            {t('tryHint').replace('{a}', 'CERT-2026-001').replace('{b}', 'CERT-2025-003')}
          </div>

          {searched && !cert && result?.notFound && (
            <div className="mt-4"><Alert type="error">{t('certNotVerified')}</Alert></div>
          )}
          {cert && <CertificateResult cert={cert} />}
        </div>
      </div>
    </div>
  );
}

// Compute the certificate status from the issued snapshot.
function certStatus(cert, t) {
  if (cert.status === 'REVOKED') return { label: t('statusRevoked'), text: 'text-red-800', band: 'bg-red-700', ring: 'border-red-700', icon: <Ban size={26} />, sub: t('statusRevokedSub') };
  if (cert.result === 'REJECTED' || cert.status === 'REJECTED') return { label: t('statusRejected'), text: 'text-red-800', band: 'bg-red-700', ring: 'border-red-700', icon: <BadgeX size={26} />, sub: t('statusRejectedSub') };
  const info = expiryInfo(cert.expiryDate);
  if (info.status === 'expired') return { label: t('statusExpired'), text: 'text-red-800', band: 'bg-red-700', ring: 'border-red-700', icon: <ShieldAlert size={26} />, sub: t('certExpiredSub') };
  if (info.status === 'expiring') return { label: t('statusExpiringSoon'), text: 'text-amber-800', band: 'bg-amber-600', ring: 'border-amber-500', icon: <ShieldAlert size={26} />, sub: t('certExpiringSub').replace('{days}', info.days) };
  return { label: t('statusValid'), text: 'text-green-800', band: 'bg-green-700', ring: 'border-green-700', icon: <ShieldCheck size={26} />, sub: t('certValidSub') };
}

function CertificateResult({ cert }) {
  const { appUsers } = useApp();
  const { t } = useLanguage();
  const status = certStatus(cert, t);
  const isExpired = status.label === t('statusExpired') || status.label === t('statusExpiringSoon');
  const officer = appUsers.find(u => u.id === cert.officerId);
  const revoked = status.label === t('statusRevoked');

  return (
    <div className="mt-6">
      <div className={`overflow-hidden rounded-lg border-2 ${status.ring}`}>
        <div className={`flex items-center gap-2.5 ${status.band} px-5 py-4 text-white`}>
          {status.icon}
          <div>
            <div className="text-lg font-bold">{status.label}</div>
            <div className="text-xs opacity-90">{status.sub}</div>
          </div>
        </div>

        <div className="bg-white p-5">
          {revoked && <Alert type="error">{t('certificateRevoked')}</Alert>}
          <div className="mb-2.5 text-xs font-bold uppercase tracking-wide text-gray-600">
            {t('certificateNumber')} <b className="text-sm text-gray-800">{cert.id}</b>
          </div>
          <DetailRow>
            <Field label={t('certificateStatus')} value={status.label} className={status.text} />
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
            <Field label={t('expiryDate')} value={fmt(cert.expiryDate)} className={isExpired ? status.text : ''} />
            <Field label={t('verificationResultField')} value={cert.result === 'CERTIFIED' ? t('verifiedCertified') : t('rejectedStatus')} className={cert.result === 'CERTIFIED' ? 'text-green-800' : 'text-red-800'} />
            <Field label={t('officerTester')} value={cert.officerName || officer?.name} />
          </DetailRow>

          {/* Public complaint entry point — opens the complaint form with THIS
              exact certificate already attached (via ?cert= number), so the
              public user never re-enters or edits the certificate details. */}
          <div className="mt-5 text-center">
            <Link to={`/report?cert=${cert.id}`} className="inline-block rounded-md bg-red-700 px-6 py-3 text-sm font-semibold text-white hover:bg-red-800">
              🚨 {t('reportProblem')}
            </Link>
          </div>

          <div className="mt-3.5 border-t border-dashed border-gray-300 pt-3.5 text-center text-sm text-gray-600">
            {t('verifiedFromSystem')}
          </div>
        </div>
      </div>
    </div>
  );
}