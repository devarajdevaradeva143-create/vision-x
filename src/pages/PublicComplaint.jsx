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

  const handleEvidence = (files) => {
    const list = Array.from(files || []).slice(0, 4);
    const ok = [];
    setEvidenceError('');
    for (const f of list) {
      if (f.size > 2 * 1024 * 1024) { setEvidenceError(t('complaintEvidenceTooBig')); continue; }
      ok.push({ name: f.name, size: f.size, url: URL.createObjectURL(f) });
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
      // Keep the uploaded evidence as base64-safe metadata (names/file sizes).
      evidence: evidence.map(e => ({ name: e.name, size: e.size })),
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
        <Card style={{ textAlign: 'center', padding: 40 }}>
          <CheckCircle2 size={48} color="#22c55e" style={{ margin: '0 auto 12px' }} />
          <h2 style={{ margin: '0 0 6px', fontSize: 22, color: '#0f172a' }}>{t('complaintSubmittedTitle')}</h2>
          <p style={{ color: '#64748b', fontSize: 14, margin: '0 0 24px' }}>{t('complaintForwarded')}</p>
          <div style={{ maxWidth: 420, margin: '0 auto', textAlign: 'left', display: 'grid', gap: 10, background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: 18 }}>
            <Row k={t('complaintIdLabel')} v={submitted.id} strong />
            <Row k={t('certificateNumber')} v={submitted.certificateId} />
            <Row k={t('machineOrInstrumentId')} v={submitted.instrumentId} />
            <Row k={t('complaintTypeLabel')} v={submitted.complaintType} />
            <Row k={t('complaintStatusLabel')} v={t('complaintPending')} />
          </div>
          <button onClick={startNew} style={submitBtn}>{t('back')}</button>
        </Card>
      </PublicShell>
    );
  }

  return (
    <PublicShell>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <h2 style={{ margin: 0, fontSize: 22, color: '#0f172a' }}>{t('complaintFormTitle')}</h2>
      </div>
      <p style={{ color: '#64748b', fontSize: 14, margin: '0 0 20px' }}>{t('complaintFormSubtitle')}</p>

      {error && <div style={{ marginBottom: 16 }}><Alert type="error">{error}</Alert></div>}

      {/* Certificate selector (read-only link) */}
      <Card style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#475569', marginBottom: 10 }}>{t('complaintLinkedTo')}</div>
        {!linkedCertificate ? (
          <div style={{ display: 'flex', gap: 10 }}>
            <input
              value={certNum}
              onChange={e => setCertNum(e.target.value)}
              placeholder={t('complaintSelectCertificate')}
              style={{ flex: 1, padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: 8, fontSize: 14 }}
            />
            <button style={submitBtn} onClick={() => { /* cert re-resolves each render */ }}>
              {t('complaintSearchGo')}
            </button>
          </div>
        ) : (
          <DetailRow>
            <Field label={t('certificateNumber')} value={linkedCertificate.id} />
            <Field label={t('applicationIdField')} value={linkedCertificate.applicationId} />
            <Field label={t('machineOrInstrumentId')} value={linkedCertificate.instrumentId} />
            <Field label={t('ownerName')} value={linkedCertificate.ownerName} />
            <Field label={t('machineTypeField')} value={linkedCertificate.category || instrument?.category} />
            <Field label={t('serialNumber')} value={linkedCertificate.serialNumber} />
            <Field label={t('location')} value={instrument?.location || linkedCertificate.location} />
            <Field label={t('certificateStatus')} value={linkedCertificate.result === 'CERTIFIED' ? t('verifiedCertified') : t('rejectedStatus')} />
            <Field label={t('verificationDate')} value={fmt(linkedCertificate.verificationDate)} />
            <Field label={t('expiryDate')} value={fmt(linkedCertificate.expiryDate)} />
          </DetailRow>
        )}
        {!linkedCertificate && (
          <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 10 }}>{t('complaintChooseCertHint')}</div>
        )}
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Complaint details */}
        <Card>
          <h3 style={{ margin: '0 0 14px', fontSize: 16, color: '#0f172a', display: 'flex', gap: 8, alignItems: 'center' }}>
            <Flag size={18} color="#ef4444" /> {t('reportProblemShort')}
          </h3>
          <Label>{t('complaintTypeLabel')}</Label>
          <select value={type} onChange={e => setType(e.target.value)} style={input}>
            <option value="">{t('complaintTypePlaceholder')}</option>
            {complaintTypes.map(ct => <option key={ct} value={ct}>{ct}</option>)}
          </select>

          <Label>{t('complaintDescriptionLabel')}</Label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder={t('complaintDescriptionPlaceholder')} style={{ ...input, minHeight: 110 }} />

          {/* Evidence upload */}
          <Label>{t('complaintEvidenceLabel')}</Label>
          {evidenceError && <div style={{ color: '#b91c1c', fontSize: 12, marginBottom: 6 }}>{evidenceError}</div>}
          <label style={uploadBox}>
            <Upload size={18} color="#64748b" style={{ margin: '0 auto 6px' }} />
            <span style={{ fontSize: 12, color: '#64748b' }}>{t('complaintEvidenceHint')}</span>
            <input type="file" accept="image/*,video/*" multiple hidden onChange={e => handleEvidence(e.target.files)} />
          </label>
          {evidence.map((e, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, color: '#475569', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 6, padding: '6px 10px', marginTop: 6 }}>
              <span>📎 {e.name}</span>
              <span style={{ color: '#94a3b8' }}>{(e.size / 1024).toFixed(0)} KB</span>
            </div>
          ))}

          {/* Location capture */}
          <Label>{t('complaintLocationLabel')}</Label>
          {locationMsg && <div style={{ fontSize: 12, color: locationMsg.type === 'success' ? '#15803d' : '#b91c1c', marginBottom: 6 }}>{locationMsg.text}</div>}
          <button onClick={handleCaptureLocation} disabled={capturing} style={locationBtn}>
            <MapPin size={16} /> {capturing ? t('complaintCapturing') : t('complaintCaptureLocation')}
          </button>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 10 }}>
            <div>
              <Label>{t('complaintLatitude')}</Label>
              <input value={latitude} onChange={e => setLatitude(e.target.value)} placeholder="12.9716" style={input} />
            </div>
            <div>
              <Label>{t('complaintLongitude')}</Label>
              <input value={longitude} onChange={e => setLongitude(e.target.value)} placeholder="77.5946" style={input} />
            </div>
          </div>
        </Card>

        {/* Contact details */}
        <Card>
          <h3 style={{ margin: '0 0 14px', fontSize: 16, color: '#0f172a' }}>{t('complaintContactHeader')}</h3>
          <Label>{t('complaintNameOptional')}</Label>
          <input value={name} onChange={e => setName(e.target.value)} style={input} />
          <Label>{t('complaintMobile')}</Label>
          <input value={mobile} onChange={e => setMobile(e.target.value)} style={input} />
          <Label>{t('complaintEmailOptional')}</Label>
          <input value={email} onChange={e => setEmail(e.target.value)} style={input} />

          <button onClick={handleSubmit} style={submitBtn}>{t('submitComplaint')}</button>
        </Card>
      </div>
    </PublicShell>
  );
}

// Wraps the public complaint page in the same look as the public verify page.
function PublicShell({ children }) {
  const { t } = useLanguage();
  return (
    <div style={{ minHeight: '100vh', padding: 40, background: 'linear-gradient(135deg,#0f172a,#1e293b)' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, color: '#fff' }}>
            <Scale size={32} color="#38bdf8" />
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: 22, fontWeight: 800 }}>{t('publicComplaints')}</div>
              <div style={{ fontSize: 13, color: '#94a3b8' }}>{t('legalMetrologyDepartment')}</div>
            </div>
          </div>
          <div style={{ marginTop: 6 }}>
            <Link to="/verify" style={{ color: '#38bdf8', fontSize: 13, textDecoration: 'none' }}>← {t('certificateVerification')}</Link>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}

function Label({ children }) {
  return <div style={{ fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 4, marginTop: 10 }}>{children}</div>;
}

function Row({ k, v, strong }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}>
      <span style={{ color: '#64748b', fontSize: 13 }}>{k}</span>
      <span style={{ color: strong ? '#0f172a' : '#334155', fontSize: 13, fontWeight: strong ? 800 : 500 }}>{v}</span>
    </div>
  );
}

const input = {
  width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: 8, fontSize: 14, boxSizing: 'border-box',
};

const uploadBox = {
  display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer',
  padding: 18, border: '1px dashed #cbd5e1', borderRadius: 8, background: '#f8fafc', textAlign: 'center',
};

const locationBtn = {
  display: 'flex', alignItems: 'center', gap: 8, background: '#f1f5f9', color: '#334155',
  padding: '10px 14px', borderRadius: 8, fontSize: 13, fontWeight: 600, border: '1px solid #e2e8f0', cursor: 'pointer',
};

const submitBtn = {
  width: '100%', padding: '12px', background: '#ef4444', color: '#fff', borderRadius: 8,
  fontSize: 14, fontWeight: 700, border: 'none', cursor: 'pointer', marginTop: 16,
};
