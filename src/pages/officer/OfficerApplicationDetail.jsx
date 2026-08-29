import { useParams, Link } from 'react-router-dom';
import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';
import { Card, PageHeader, StatusBadge, ProgressTracker, Field, DetailRow, Alert } from '../../components/ui';
import { fmt } from '../../utils/format';
import { generateCertificateId } from '../../data/mockData';

export default function OfficerApplicationDetail() {
  const { id } = useParams();
  const { currentUser, appApplications, appInstruments, appUsers, updateApplication, appCertificates, addCertificate } = useApp();
  const { t } = useLanguage();
  const [scheduleDate, setScheduleDate] = useState('');
  const [readings, setReadings] = useState({});
  const [remarks, setRemarks] = useState('');
  const [showInspect, setShowInspect] = useState(false);
  const [expiry, setExpiry] = useState('');
  const [showCertify, setShowCertify] = useState(false);
  const [msg, setMsg] = useState(null);

  const app = appApplications.find(a => a.id === id);
  if (!app) return <Card><p>{t('applicationNotFound')}</p></Card>;

  const instrument = appInstruments.find(i => i.id === app.instrumentId);
  const owner = appUsers.find(u => u.id === app.ownerId);
  const certificate = appCertificates.find(c => c.applicationId === app.id);
  const suppressible = app.status === 'SCHEDULED' || app.status === 'SUBMITTED';

  // Show the machine details the owner actually submitted (snapshot on the app),
  // falling back to the linked instrument / user where needed.
  const machineType = app.machineType || instrument?.category;
  const manufacturer = app.manufacturer ?? instrument?.manufacturer;
  const model = app.modelNumber ?? instrument?.modelNumber;
  const serial = app.serialNumber ?? instrument?.serialNumber;
  const capacity = app.capacity ?? instrument?.capacity;
  const location = app.location ?? instrument?.location;

  const handleSchedule = () => {
    if (!scheduleDate) return;
    if (!app.officerId) {
      updateApplication(app.id, { officerId: currentUser.id, scheduledDate: scheduleDate, status: 'SCHEDULED' });
    } else {
      updateApplication(app.id, { scheduledDate: scheduleDate, status: 'SCHEDULED' });
    }
    setMsg({ type: 'success', text: t('inspectionScheduledMsg').replace('{date}', fmt(scheduleDate)) });
  };

  const issueCertificate = (result) => {
    const existing = appCertificates.find(c => c.applicationId === app.id);
    // Store the certificate as a permanent issued SNAPSHOT: it holds every
    // detail shown on the public verification page so the QR always matches
    // the exact issued certificate and cannot be altered by later edits.
    const cert = {
      ...(existing || {}),
      id: existing?.id || generateCertificateId(),
      applicationId: app.id,
      instrumentId: app.instrumentId ?? instrument?.id ?? null,
      ownerId: owner.id,
      ownerName: owner.name,
      machineType: app.machineType || instrument?.category,
      instrumentType: instrument?.type || app.machineType,
      category: instrument?.category || app.machineType,
      manufacturer: app.manufacturer ?? instrument?.manufacturer,
      model: app.modelNumber ?? instrument?.modelNumber,
      serialNumber: app.serialNumber ?? instrument?.serialNumber,
      capacity: app.capacity ?? instrument?.capacity,
      location: app.location ?? instrument?.location,
      verificationDate: new Date().toISOString().slice(0, 10),
      issueDate: new Date().toISOString().slice(0, 10),
      expiryDate: result === 'CERTIFIED' ? expiry : null,
      result,
      status: result,
      officerId: currentUser.id,
      officerName: currentUser.name,
    };
    addCertificate(cert);
    updateApplication(app.id, { status: result, inspectionDate: new Date().toISOString().slice(0, 10) });
    setShowCertify(false);
    setMsg({ type: result === 'CERTIFIED' ? 'success' : 'error', text: result === 'CERTIFIED' ? t('certIssuedMsg').replace('{id}', cert.id) : t('appRejectedMsg') });
  };

  const commonReadings = [
    { key: 'accuracy', label: t('accuracy') },
    { key: 'repeatability', label: t('repeatability') },
    { key: 'linearity', label: t('linearity') },
    { key: 'eccentricity', label: t('eccentricity') },
  ];

  const handleReading = (k, v) => setReadings({ ...readings, [k]: v });

  const saveInspection = () => {
    updateApplication(app.id, { status: 'INSPECTED', readings, remarks });
    setShowInspect(false);
    setMsg({ type: 'success', text: t('inspectionRecordedMsg') });
  };

  return (
    <div>
      <PageHeader title={app.id} subtitle={t('processVerificationApp')} action={<StatusBadge status={app.status} />} />

      {msg && <div style={{ marginBottom: 16 }}><Alert type={msg.type}>{msg.text}</Alert></div>}

      <Card style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 13, color: '#475569', marginBottom: 10 }}>{t('applicationStatusFlow')}</div>
        <ProgressTracker status={app.status} />
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <Card>
          <h3 style={{ margin: '0 0 16px', fontSize: 16, color: '#0f172a' }}>{t('instrument')}</h3>
          <DetailRow>
            <Field label={t('instrumentType')} value={machineType} />
            <Field label={t('machineId')} value={app.instrumentId || '—'} />
            <Field label={t('manufacturer')} value={manufacturer} />
            <Field label={t('model')} value={model} />
            <Field label={t('serialNo')} value={serial} />
            <Field label={t('capacityRange')} value={capacity} />
            <Field label={t('location')} value={location} />
          </DetailRow>
        </Card>
        <Card>
          <h3 style={{ margin: '0 0 16px', fontSize: 16, color: '#0f172a' }}>{t('owner')}</h3>
          <DetailRow>
            <Field label={t('nameField')} value={owner?.name} />
            <Field label={t('emailField')} value={owner?.email} />
            <Field label={t('phoneField')} value={owner?.phone} />
            <Field label={t('addressField')} value={owner?.address} />
          </DetailRow>
        </Card>
      </div>

      <Card style={{ marginTop: 16 }}>
        <h3 style={{ margin: '0 0 16px', fontSize: 16, color: '#0f172a' }}>{t('applicationDetails')}</h3>
        <DetailRow>
          <Field label={t('appIdField')} value={app.id} />
          <Field label={t('applicationDate')} value={fmt(app.submissionDate)} />
          <Field label={t('paymentStatus')} value={app.paymentStatus === 'PAID' ? t('paid') : t('pending')} color={app.paymentStatus === 'PAID' ? '#22c55e' : '#f59e0b'} />
          <Field label={t('applicationStatusField')} value={app.status} />
        </DetailRow>
      </Card>

      <Card style={{ marginTop: 16 }}>
        <h3 style={{ margin: '0 0 16px', fontSize: 16, color: '#0f172a' }}>{t('inspectionActions')}</h3>

        {app.status === 'SUBMITTED' && (
          <div>
            <div style={{ fontSize: 14, color: '#475569', marginBottom: 10 }}>{t('reviewThisApp')}</div>
            <label style={{ fontWeight: 600, fontSize: 13, display: 'block', marginBottom: 6 }}>{t('scheduleInspectionDate')}</label>
            <input type="date" value={scheduleDate} onChange={e => setScheduleDate(e.target.value)} style={input} />
            <div style={{ marginTop: 12 }}><button onClick={handleSchedule} style={actionBtn}>{t('reviewAndSchedule')}</button></div>
          </div>
        )}

        {app.status === 'SCHEDULED' && (
          <div>
            <div style={{ fontSize: 14, color: '#475569', marginBottom: 10 }}>
              <b style={{ color: '#0f172a' }}>{t('scheduleInspectionDate')}:</b> {t('scheduledInspectionMsg').replace('{date}', fmt(app.scheduledDate))}
            </div>
            {!showInspect ? (
              <button onClick={() => setShowInspect(true)} style={actionBtn}>{t('recordInspectionResults')}</button>
            ) : (
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>{t('verificationReadingsTitle')}</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12 }}>
                  {commonReadings.map(r => (
                    <div key={r.key}>
                      <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>{r.label}</label>
                      <input style={input} placeholder={r.key === 'accuracy' ? 'e.g. ±0.0001g' : t('enterValues')} value={readings[r.key] || ''} onChange={e => handleReading(r.key, e.target.value)} />
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 12 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>{t('officerRemarks')}</label>
                  <textarea style={{ ...input, minHeight: 60 }} value={remarks} onChange={e => setRemarks(e.target.value)} placeholder="Inspection observations..." />
                </div>
                <div style={{ marginTop: 12, display: 'flex', gap: 10 }}>
                  <button onClick={saveInspection} style={actionBtn}>{t('saveAsInspected')}</button>
                  <button onClick={() => setShowInspect(false)} style={cancelBtn}>{t('cancelBtn')}</button>
                </div>
              </div>
            )}
          </div>
        )}

        {app.status === 'INSPECTED' && (
          <div>
            {app.readings ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: 12, marginBottom: 14 }}>
                {Object.entries(app.readings).map(([k, v]) => (
                  <Field key={k} label={k} value={v} />
                ))}
              </div>
            ) : null}
            <div style={{ fontSize: 13, color: '#475569', marginBottom: 8 }}><b>{t('remarks')}</b> {app.remarks || '—'}</div>
            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 14 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', marginBottom: 10 }}>{t('decision')}</div>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                {!showCertify && (
                  <>
                    <button onClick={() => { setShowCertify(true); }} style={{ ...actionBtn, background: '#22c55e' }}>{t('approveCertify')}</button>
                    <button onClick={() => {
                      updateApplication(app.id, { status: 'REJECTED', inspectionDate: new Date().toISOString().slice(0, 10) });
                      setMsg({ type: 'error', text: t('appRejectedMsg') });
                    }} style={{ ...actionBtn, background: '#ef4444' }}>{t('reject')}</button>
                  </>
                )}
                {showCertify && (
                  <div style={{ width: '100%', background: '#f8fafc', padding: 14, borderRadius: 8 }}>
                    <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>{t('certExpiryLabel')}</label>
                    <input type="date" value={expiry} onChange={e => setExpiry(e.target.value)} style={input} />
                    <div style={{ marginTop: 10, display: 'flex', gap: 10 }}>
                      <button onClick={() => issueCertificate('CERTIFIED')} disabled={!expiry} style={actionBtn}>{t('generateCertificate')}</button>
                      <button onClick={() => setShowCertify(false)} style={cancelBtn}>{t('cancelBtn')}</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {(app.status === 'CERTIFIED' || app.status === 'REJECTED') && (
          <div>
            {app.status === 'CERTIFIED' && certificate ? (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#22c55e' }}>{t('certIssuedText').replace('{id}', certificate.id)}</div>
                  <div style={{ fontSize: 13, color: '#475569' }}>{t('expires').replace('{date}', fmt(certificate.expiryDate))}</div>
                </div>
                <Link to={`/certificates/${app.id}`} style={actionBtn}>{t('viewPrintCert')}</Link>
              </div>
            ) : (
              <Alert type="error">{t('appRejectedText')}</Alert>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}

const input = {
  width: '100%', maxWidth: 320, padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: 8, fontSize: 14,
};

const actionBtn = {
  background: '#4f46e5', color: '#fff', padding: '10px 18px', borderRadius: 8,
  fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer', textDecoration: 'none', display: 'inline-block',
};

const cancelBtn = {
  background: '#f1f5f9', color: '#475569', padding: '10px 18px', borderRadius: 8,
  fontSize: 13, fontWeight: 700, border: '1px solid #e2e8f0', cursor: 'pointer',
};
