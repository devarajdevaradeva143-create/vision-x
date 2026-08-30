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
  if (!app) return <Card><p className="text-sm text-gray-600">{t('applicationNotFound')}</p></Card>;

  const instrument = appInstruments.find(i => i.id === app.instrumentId);
  const owner = appUsers.find(u => u.id === app.ownerId);
  const certificate = appCertificates.find(c => c.applicationId === app.id);

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

  const handlePhotoUpload = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      updateApplication(app.id, { machinePhoto: ev.target.result });
      setMsg({ type: 'success', text: t('photoUploaded') });
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    updateApplication(app.id, { machinePhoto: null });
    setMsg({ type: 'success', text: t('photoRemoved') });
  };

  const issueCertificate = (result) => {
    const existing = appCertificates.find(c => c.applicationId === app.id);
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
      machinePhoto: app.machinePhoto || null,
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

      {msg && <div className="mb-4"><Alert type={msg.type}>{msg.text}</Alert></div>}

      <Card className="mb-4">
        <div className="mb-2.5 text-sm text-gray-700">{t('applicationStatusFlow')}</div>
        <ProgressTracker status={app.status} />
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h3 className="m-0 mb-4 text-base font-bold text-gray-800">{t('instrument')}</h3>
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
          <h3 className="m-0 mb-4 text-base font-bold text-gray-800">{t('owner')}</h3>
          <DetailRow>
            <Field label={t('nameField')} value={owner?.name} />
            <Field label={t('emailField')} value={owner?.email} />
            <Field label={t('phoneField')} value={owner?.phone} />
            <Field label={t('addressField')} value={owner?.address} />
          </DetailRow>
        </Card>
      </div>

      <Card className="mt-4">
        <h3 className="m-0 mb-4 text-base font-bold text-gray-800">{t('applicationDetails')}</h3>
        <DetailRow>
          <Field label={t('appIdField')} value={app.id} />
          <Field label={t('applicationDate')} value={fmt(app.submissionDate)} />
          <Field label={t('paymentStatus')} value={app.paymentStatus === 'PAID' ? t('paid') : t('pending')} className={app.paymentStatus === 'PAID' ? 'text-green-800' : 'text-amber-800'} />
          <Field label={t('applicationStatusField')} value={app.status} />
        </DetailRow>
      </Card>

      <Card className="mt-4">
        <h3 className="m-0 mb-4 text-base font-bold text-gray-800">{t('inspectionActions')}</h3>

        {app.status === 'SUBMITTED' && (
          <div>
            <div className="mb-2.5 text-sm text-gray-700">{t('reviewThisApp')}</div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">{t('scheduleInspectionDate')}</label>
            <input type="date" value={scheduleDate} onChange={e => setScheduleDate(e.target.value)} className={input} />
            <div className="mt-3"><button onClick={handleSchedule} className="cursor-pointer rounded-md bg-blue-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-900">{t('reviewAndSchedule')}</button></div>
          </div>
        )}

        {app.status === 'SCHEDULED' && (
          <div>
            <div className="mb-2.5 text-sm text-gray-700">
              <b className="text-gray-800">{t('scheduleInspectionDate')}:</b> {t('scheduledInspectionMsg').replace('{date}', fmt(app.scheduledDate))}
            </div>
            {!showInspect ? (
              <button onClick={() => setShowInspect(true)} className="cursor-pointer rounded-md bg-blue-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-900">{t('recordInspectionResults')}</button>
            ) : (
              <div>
                <div className="mb-2.5 text-sm font-bold text-gray-800">{t('verificationReadingsTitle')}</div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {commonReadings.map(r => (
                    <div key={r.key}>
                      <label className="mb-1 block text-sm font-medium text-gray-700">{r.label}</label>
                      <input className={input} placeholder={r.key === 'accuracy' ? 'e.g. ±0.0001g' : t('enterValues')} value={readings[r.key] || ''} onChange={e => handleReading(r.key, e.target.value)} />
                    </div>
                  ))}
                </div>
                <div className="mt-3">
                  <label className="mb-1 block text-sm font-medium text-gray-700">{t('officerRemarks')}</label>
                  <textarea className={`${input} min-h-[60px]`} value={remarks} onChange={e => setRemarks(e.target.value)} placeholder="Inspection observations..." />
                </div>
                <div className="mt-3 flex gap-2.5">
                  <button onClick={saveInspection} className="cursor-pointer rounded-md bg-blue-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-900">{t('saveAsInspected')}</button>
                  <button onClick={() => setShowInspect(false)} className="cursor-pointer rounded-md border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100">{t('cancelBtn')}</button>
                </div>
              </div>
            )}
          </div>
        )}

        {app.status === 'INSPECTED' && (
          <div>
            {app.readings && (
              <div className="mb-3.5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {Object.entries(app.readings).map(([k, v]) => (
                  <Field key={k} label={k} value={v} />
                ))}
              </div>
            )}
            <div className="mb-2 text-sm text-gray-700"><b className="text-gray-800">{t('remarks')}</b> {app.remarks || '—'}</div>

            {/* Machine photo upload */}
            <div className="mb-3.5">
              <label className="mb-1.5 block text-sm font-medium text-gray-700">{t('uploadMachinePhoto')}</label>
              <input type="file" accept="image/*" onChange={handlePhotoUpload} className="w-full max-w-sm cursor-pointer text-sm text-gray-600 file:mr-4 file:rounded-md file:border-0 file:bg-blue-800 file:py-2 file:px-4 file:text-sm file:font-semibold file:text-white hover:file:bg-blue-900" />
              {app.machinePhoto && (
                <div className="mt-2 flex items-center gap-3">
                  <img src={app.machinePhoto} alt={t('machinePhoto')} className="h-32 w-32 object-contain rounded-md border border-gray-200" />
                  <button onClick={handleRemovePhoto} className="cursor-pointer rounded-md bg-red-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-800">{t('removeQR')}</button>
                </div>
              )}
              {!app.machinePhoto && (
                <div className="mt-1 text-xs text-gray-500">{t('noPhotoUploaded')}</div>
              )}
            </div>

            <div className="border-t border-gray-200 pt-3.5">
              <div className="mb-2.5 text-sm font-bold text-gray-800">{t('decision')}</div>
              <div className="flex flex-wrap items-center gap-3">
                {!showCertify && (
                  <>
                    <button onClick={() => { setShowCertify(true); }} className="cursor-pointer rounded-md bg-green-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-800">{t('approveCertify')}</button>
                    <button onClick={() => {
                      updateApplication(app.id, { status: 'REJECTED', inspectionDate: new Date().toISOString().slice(0, 10) });
                      setMsg({ type: 'error', text: t('appRejectedMsg') });
                    }} className="cursor-pointer rounded-md bg-red-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-800">{t('reject')}</button>
                  </>
                )}
                {showCertify && (
                  <div className="w-full rounded-md bg-gray-50 p-3.5">
                    <label className="mb-1 block text-sm font-medium text-gray-700">{t('certExpiryLabel')}</label>
                    <input type="date" value={expiry} onChange={e => setExpiry(e.target.value)} className={input} />
                    <div className="mt-2.5 flex flex-wrap gap-2.5">
                      <button onClick={() => issueCertificate('CERTIFIED')} disabled={!expiry} className="cursor-pointer rounded-md bg-blue-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-900 disabled:cursor-not-allowed disabled:opacity-60">{t('generateCertificate')}</button>
                      <button onClick={() => setShowCertify(false)} className="cursor-pointer rounded-md border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100">{t('cancelBtn')}</button>
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
              <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
                <div>
                  <div className="text-sm font-bold text-green-800">{t('certIssuedText').replace('{id}', certificate.id)}</div>
                  <div className="text-sm text-gray-700">{t('expires').replace('{date}', fmt(certificate.expiryDate))}</div>
                  {certificate.machinePhoto && (
                    <div className="mt-2">
                      <img src={certificate.machinePhoto} alt={t('machinePhoto')} className="h-40 w-40 object-contain rounded-md border border-gray-200" />
                    </div>
                  )}
                </div>
                <Link to={`/certificates/${app.id}`} className="rounded-md bg-blue-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-900">{t('viewPrintCert')}</Link>
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

const input = 'w-full max-w-md rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:border-blue-700 focus:outline-none';