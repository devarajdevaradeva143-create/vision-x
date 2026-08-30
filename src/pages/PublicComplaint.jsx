import { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { Card, Field, DetailRow, Alert } from '../components/ui';
import { fmt } from '../utils/format';
import { complaintTypes, generateComplaintId } from '../data/mockData';
import { Scale, MapPin, Upload, CheckCircle2, Flag } from 'lucide-react';

// ---------------------------------------------------------------------------
// Public Complaint Form.
//
// It is ALWAYS linked to an EXACT certificate. The certificate is resolved by
// certificate number (from the ?cert= query param, set when the citizen clicks
// "Report a Problem" on a verified certificate). The certificate, application
// and instrument ids are read-only: the citizen cannot change them, so the
// complaint is bound to the exact record they were viewing.
//   Instrument -> Certificate -> Complaint -> Inspection -> Action -> Resolution
// ---------------------------------------------------------------------------

export default function PublicComplaint() {
  const { currentUser, appCertificates, appInstruments, addComplaint } = useApp();
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [certNum, setCertNum] = useState(searchParams.get('cert') || '');
  // Resolve the exact certificate record (and its linked instrument) by number.
  const cert = appCertificates.find(c => c.id === certNum);
  const linkedCertificate = cert || null;
  const instrument = linkedCertificate
    ? appInstruments.find(i => i.id === linkedCertificate.instrumentId)
    : null;

  // Complaint form state
  const [type, setType] = useState('');
  const [description, setDescription] = useState('');
  const [evidence, setEvidence] = useState([]);
  const [evidenceError, setEvidenceError] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [capturing, setCapturing] = useState(false);
  const [locationMsg, setLocationMsg] = useState(null);
  const [name, setName] = useState(currentUser?.name || '');
  const [mobile, setMobile] = useState(currentUser?.phone || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(null);

  // Auto-fill contact from the logged-in profile when possible.
  const handleCaptureLocation = () => {
    if (!navigator.geolocation) {
      setLocationMsg({ type: 'error', text: t('complaintLocationDenied') });
      return;
    }
    setCapturing(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(pos.coords.latitude.toFixed(6));
        setLongitude(pos.coords.longitude.toFixed(6));
        setCapturing(false);
        setLocationMsg({ type: 'success', text: t('complaintLocationCaptured') });
      },
      () => {
        setCapturing(false);
        setLocationMsg({ type: 'error', text: t('complaintLocationDenied') });
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  // Read an uploaded file as a base64 data URL so the actual image/video bytes
  // are persisted with the complaint record (survives localStorage + officer
  // view), instead of a temporary, session-only object URL that gets lost.
  const fileToDataUrl = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });

  const handleEvidence = async (files) => {
    const list = Array.from(files || []).slice(0, 4);
    const ok = [];
    setEvidenceError('');
    for (const f of list) {
      if (f.size > 2 * 1024 * 1024) { setEvidenceError(t('complaintEvidenceTooBig')); continue; }
      try {
        // base64 data URL keeps the real visible originals for the officer preview.
        const url = await fileToDataUrl(f);
        ok.push({ name: f.name, size: f.size, url, type: f.type });
      } catch {
        // Skip files that could not be read locally.
      }
    }
    setEvidence(prev => [...prev, ...ok]);
  };

  const handleSubmit = () => {
    setError('');
    if (!linkedCertificate) return setError(t('complaintPickCertInvalid'));
    if (!type) return setError(t('complaintTypePlaceholder'));
    if (!description.trim()) return setError(t('complaintDescriptionPlaceholder'));
    if (!name.trim() || !mobile.trim()) return setError(t('complaintContactHeader'));

    const complaint = {
      id: generateComplaintId(),
      certificateId: linkedCertificate.id,
      applicationId: linkedCertificate.applicationId,
      instrumentId: linkedCertificate.instrumentId,
      ownerId: linkedCertificate.ownerId,
      ownerName: linkedCertificate.ownerName,
      complaintType: type,
      description: description.trim(),
      // Keep the uploaded evidence as base64 data URLs so the officer can view
      // the EXACT originals (image/video) later — not just file names.
      evidence: evidence.map(e => ({ name: e.name, size: e.size, url: e.url, type: e.type })),
      latitude: latitude || null,
      longitude: longitude || null,
      contactName: name.trim(),
      contactMobile: mobile.trim(),
      contactEmail: email.trim() || null,
      status: 'PENDING',
      // Both a human display date/time and an ISO timestamp for sorting.
      submittedAt: new Date().toISOString(),
      filedAt: fmt(new Date().toISOString()),
      filedTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }),
      progress: {
        remarks: '',
        actionTaken: '',
        finePenalty: '',
        reverificationRequired: false,
        finalRemarks: '',
      },
    };
    addComplaint(complaint);
    setSubmitted(complaint);
  };

  const startNew = () => {
    setSubmitted(null);
    navigate('/verify');
  };

  // Success screen ---------------------------------------------------------
  if (submitted) {
    return (
      <PublicShell>
        <Card className="py-10 text-center">
          <CheckCircle2 size={48} className="mx-auto mb-3 text-green-700" />
          <h2 className="m-0 mb-1.5 text-xl font-bold text-gray-800">{t('complaintSubmittedTitle')}</h2>
          <p className="m-0 mb-6 text-sm text-gray-600">{t('complaintForwarded')}</p>
          <div className="mx-auto grid max-w-md gap-2.5 rounded-md border border-gray-200 bg-gray-50 p-4 text-left">
            <Row k={t('complaintIdLabel')} v={submitted.id} strong />
            <Row k={t('certificateNumber')} v={submitted.certificateId} />
            <Row k={t('machineOrInstrumentId')} v={submitted.instrumentId} />
            <Row k={t('complaintTypeLabel')} v={submitted.complaintType} />
            <Row k={t('complaintStatusLabel')} v={t('complaintPending')} />
          </div>
          <button onClick={startNew} className="mt-4 w-full cursor-pointer rounded-md bg-blue-800 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-900 sm:w-auto sm:px-10">{t('back')}</button>
        </Card>
      </PublicShell>
    );
  }

  return (
    <PublicShell>
      <div className="mb-1.5 flex items-center justify-between">
        <h2 className="m-0 text-xl font-bold text-gray-800">{t('complaintFormTitle')}</h2>
      </div>
      <p className="m-0 mb-5 text-sm text-gray-600">{t('complaintFormSubtitle')}</p>

      {error && <div className="mb-4"><Alert type="error">{error}</Alert></div>}

      {/* Certificate selector (read-only link) */}
      <Card className="mb-4">
        <div className="mb-2.5 text-sm font-semibold text-gray-700">{t('complaintLinkedTo')}</div>
        {!linkedCertificate ? (
          <div className="flex gap-2.5">
            <input
              value={certNum}
              onChange={e => setCertNum(e.target.value)}
              placeholder={t('complaintSelectCertificate')}
              className="min-w-0 flex-1 rounded-md border border-gray-300 px-3 py-2.5 text-sm text-gray-800 focus:border-blue-700 focus:outline-none"
            />
            <button className="cursor-pointer rounded-md bg-blue-800 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-900" onClick={() => { /* cert re-resolves each render */ }}>
              {t('complaintSearchGo')}
            </button>
          </div>
        ) : (
          <>
            <DetailRow>
              <Field label={t('certificateNumber')} value={linkedCertificate.id} />
              <Field label={t('applicationIdField')} value={linkedCertificate.applicationId} />
              <Field label={t('machineOrInstrumentId')} value={linkedCertificate.instrumentId} />
              <Field label={t('ownerName')} value={linkedCertificate.ownerName} />
              <Field label={t('machineTypeField')} value={linkedCertificate.category || instrument?.category} />
              <Field label={t('serialNumber')} value={linkedCertificate.serialNumber} />
              <Field label={t('location')} value={instrument?.location || linkedCertificate.location} />
              <Field label={t('certificateStatus')} value={linkedCertificate.result === 'CERTIFIED' ? t('verifiedCertified') : t('rejectedStatus')} className={linkedCertificate.result === 'CERTIFIED' ? 'text-green-800' : 'text-red-800'} />
              <Field label={t('verificationDate')} value={fmt(linkedCertificate.verificationDate)} />
              <Field label={t('expiryDate')} value={fmt(linkedCertificate.expiryDate)} />
            </DetailRow>
          </>
        )}
        {!linkedCertificate && (
          <div className="mt-2.5 text-xs text-gray-500">{t('complaintChooseCertHint')}</div>
        )}
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Complaint details */}
        <Card>
          <h3 className="m-0 mb-3.5 flex items-center gap-2 text-base font-bold text-gray-800">
            <Flag size={18} className="text-red-700" /> {t('reportProblemShort')}
          </h3>
          <Label>{t('complaintTypeLabel')}</Label>
          <select value={type} onChange={e => setType(e.target.value)} className={input}>
            <option value="">{t('complaintTypePlaceholder')}</option>
            {complaintTypes.map(ct => <option key={ct} value={ct}>{ct}</option>)}
          </select>

          <Label>{t('complaintDescriptionLabel')}</Label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder={t('complaintDescriptionPlaceholder')} className={`${input} min-h-28`} />

          {/* Evidence upload */}
          <Label>{t('complaintEvidenceLabel')}</Label>
          {evidenceError && <div className="mb-1.5 text-xs text-red-800">{evidenceError}</div>}
          <label className="flex cursor-pointer flex-col items-center rounded-md border border-dashed border-gray-300 bg-gray-50 px-4 py-4 text-center hover:bg-gray-100">
            <Upload size={18} className="mx-auto mb-1.5 text-gray-500" />
            <span className="text-xs text-gray-600">{t('complaintEvidenceHint')}</span>
            <input type="file" accept="image/*,video/*" multiple hidden onChange={e => handleEvidence(e.target.files)} />
          </label>
          {evidence.map((e, i) => (
            <div key={i} className="mt-1.5 flex items-center justify-between rounded-md border border-gray-200 bg-gray-50 px-2.5 py-1.5 text-xs text-gray-700">
              <span>📎 {e.name}</span>
              <span className="text-gray-500">{(e.size / 1024).toFixed(0)} KB</span>
            </div>
          ))}

          {/* Location capture */}
          <Label>{t('complaintLocationLabel')}</Label>
          {locationMsg && <div className={`mb-1.5 text-xs ${locationMsg.type === 'success' ? 'text-green-800' : 'text-red-800'}`}>{locationMsg.text}</div>}
          <button onClick={handleCaptureLocation} disabled={capturing} className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3.5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-60">
            <MapPin size={16} /> {capturing ? t('complaintCapturing') : t('complaintCaptureLocation')}
          </button>
          <div className="mt-2.5 grid grid-cols-2 gap-2.5">
            <div>
              <Label>{t('complaintLatitude')}</Label>
              <input value={latitude} onChange={e => setLatitude(e.target.value)} placeholder="12.9716" className={input} />
            </div>
            <div>
              <Label>{t('complaintLongitude')}</Label>
              <input value={longitude} onChange={e => setLongitude(e.target.value)} placeholder="77.5946" className={input} />
            </div>
          </div>
        </Card>

        {/* Contact details */}
        <Card>
          <h3 className="m-0 mb-3.5 text-base font-bold text-gray-800">{t('complaintContactHeader')}</h3>
          <Label>{t('complaintNameOptional')}</Label>
          <input value={name} onChange={e => setName(e.target.value)} className={input} />
          <Label>{t('complaintMobile')}</Label>
          <input value={mobile} onChange={e => setMobile(e.target.value)} className={input} />
          <Label>{t('complaintEmailOptional')}</Label>
          <input value={email} onChange={e => setEmail(e.target.value)} className={input} />

          <button onClick={handleSubmit} className="mt-4 w-full cursor-pointer rounded-md bg-red-700 px-4 py-3 text-sm font-semibold text-white hover:bg-red-800">{t('submitComplaint')}</button>
        </Card>
      </div>
    </PublicShell>
  );
}

// Wraps the public complaint page in the same look as the public verify page.
function PublicShell({ children }) {
  const { t } = useLanguage();
  return (
    <div style={{ minHeight: '100vh' }} className="bg-gray-100 p-4 sm:p-8 lg:p-12">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 text-center">
          <div className="inline-flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-md bg-blue-900 text-amber-400">
              <Scale size={30} />
            </div>
            <div className="text-left">
              <div className="text-lg font-bold text-blue-900 sm:text-xl">{t('publicComplaints')}</div>
              <div className="text-xs text-gray-600 sm:text-sm">{t('legalMetrologyDepartment')}</div>
            </div>
          </div>
          <div className="mt-1.5">
            <Link to="/verify" className="text-sm font-medium text-blue-800 hover:text-blue-900">← {t('certificateVerification')}</Link>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}

function Label({ children }) {
  return <div className="mb-1 mt-2.5 text-sm font-medium text-gray-700">{children}</div>;
}

function Row({ k, v, strong }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-sm text-gray-600">{k}</span>
      <span className={`text-sm ${strong ? 'font-bold text-gray-800' : 'font-medium text-gray-700'}`}>{v}</span>
    </div>
  );
}

const input = 'w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:border-blue-700 focus:outline-none';