import { useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { Card, PageHeader, StatusBadge, ProgressTracker, Field, DetailRow } from '../components/ui';
import { QRCodeSVG } from 'qrcode.react';
import { getMachineTypeByName, qrDataFor } from '../data/machineTypes';
import { getDefaultOfficer } from '../data/mockData';
import { fmt } from '../utils/format';

// ---------------------------------------------------------------------------
// Application Detail (Owner view)
// ---------------------------------------------------------------------------
// Shows the application details plus a dedicated PAYMENT section.
//
// The verification fee and matching payment QR are derived from the machine
// type associated with this application (see data/machineTypes.js). They are
// never entered manually by the owner.
//
// Before payment  -> Payment Status: Pending, Application Status: Payment Pending
// After  payment  -> Payment Status: Paid,   Application Status: Submitted
// ---------------------------------------------------------------------------

export default function ApplicationDetail() {
  const { id } = useParams();
  const { appApplications, appInstruments, appUsers, appCertificates, updateApplication } = useApp();
  const { t } = useLanguage();
  const [showPayment, setShowPayment] = useState(false);

  const app = appApplications.find(a => a.id === id);

  // Machine type of this application: use the one chosen at submission time,
  // falling back to the linked instrument category if not set.
  const machineType = app ? (app.machineType || appInstruments.find(i => i.id === app.instrumentId)?.category || '') : '';

  // Find the matching fee and QR value for this machine type.
  const typeInfo = useMemo(() => getMachineTypeByName(machineType), [machineType]);
  const verificationFee = typeInfo ? typeInfo.fee : 0;
  const qrValue = typeInfo ? qrDataFor(typeInfo) : '';

  if (!app) return <Card><p className="text-sm text-gray-600">{t('applicationNotFound')}</p></Card>;

  const instrument = appInstruments.find(i => i.id === app.instrumentId);
  const owner = appUsers.find(u => u.id === app.ownerId);
  const officer = app.officerId ? appUsers.find(u => u.id === app.officerId) : null;
  const certificate = appCertificates.find(c => c.applicationId === app.id);

  const isPaid = app.paymentStatus === 'PAID';

  const completePayment = () => {
    // Once paid, the application becomes "Submitted". Assign a default officer
    // so the SAME application (same ID) appears in that officer's dashboard —
    // we only update this one application object, never create a new one.
    updateApplication(app.id, { paymentStatus: 'PAID', status: 'SUBMITTED', officerId: getDefaultOfficer() });
    setShowPayment(false);
  };

  return (
    <div>
      <PageHeader title={app.id} subtitle={t('appDetailsStatus')} action={<StatusBadge status={app.status} />} />

      <Card className="mb-4">
        <div className="mb-2.5 text-sm text-gray-700">{t('applicationStatusFlow')}</div>
        <ProgressTracker status={app.status} />
      </Card>

      {app.remarks && (app.status === 'REJECTED' || app.status === 'CERTIFIED') && (
        <div className={`mb-4 rounded-lg border p-5 shadow-sm ${app.status === 'REJECTED' ? 'border-red-200 bg-red-100' : 'border-green-200 bg-green-100'}`}>
          <div className={`mb-1.5 text-sm font-bold ${app.status === 'REJECTED' ? 'text-red-800' : 'text-green-800'}`}>{t('officerRemarksPrefix')} — {app.status}</div>
          <div className="text-sm text-gray-700">{app.remarks}</div>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h3 className="m-0 mb-4 text-base font-bold text-gray-800">{t('applicationDetails')}</h3>
          <DetailRow>
            <Field label={t('appIdField')} value={app.id} />
            <Field label={t('machineTypeField')} value={machineType} />
            <Field label={t('machineId')} value={instrument?.id || '—'} />
            <Field label={t('instrument')} value={instrument?.modelNumber || '—'} />
            <Field label={t('verificationFee')} value={verificationFee ? `₹${verificationFee}` : '—'} className={verificationFee ? 'text-blue-800' : ''} />
            <Field label={t('paymentStatus')} value={isPaid ? t('paid') : t('pendingPayment')} className={isPaid ? 'text-green-800' : 'text-amber-800'} />
          </DetailRow>
        </Card>

        <Card>
          <h3 className="m-0 mb-4 text-base font-bold text-gray-800">{t('ownerOfficer')}</h3>
          <DetailRow>
            <Field label={t('ownerName')} value={owner?.name} />
            <Field label={t('ownerEmail')} value={owner?.email} />
            <Field label={t('ownerPhone')} value={owner?.phone} />
            <Field label={t('officer')} value={officer?.name || t('assignedAfterPayment')} className={officer ? '' : 'text-gray-400'} />
          </DetailRow>
        </Card>
      </div>

      {/* ------------------- PAYMENT SECTION ------------------- */}
      <Card className="mt-4">
        <h3 className="m-0 mb-4 text-base font-bold text-gray-800">{t('paymentSection')}</h3>

        {isPaid ? (
          <div className="rounded-md border border-green-200 bg-green-100 px-5 py-5 text-center">
            <div className="text-3xl">✓</div>
            <div className="text-base font-bold text-green-800">{t('paymentCompleted')}</div>
            <div className="mt-1.5 text-sm text-gray-700">
              {t('paymentCompletedMsg').replace('{fee}', verificationFee).replace('{type}', machineType)}
            </div>
          </div>
        ) : (
          <div>
            <Field label={t('verificationFee')} value={`₹${verificationFee}`} className="text-blue-800" />
            <div className="mt-4">
              <button
                onClick={() => setShowPayment(!showPayment)}
                className={showPayment
                  ? 'cursor-pointer rounded-md border border-gray-300 bg-white px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-100'
                  : 'cursor-pointer rounded-md bg-blue-800 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-900'}
              >
                {showPayment ? t('cancel') : t('pay').replace('{fee}', verificationFee)}
              </button>
            </div>

            {showPayment && (
              <div className="mt-5 rounded-md border border-gray-200 bg-gray-50 px-4 py-5 text-center">
                <div className="font-bold text-gray-800">{t('verificationFee')}: ₹{verificationFee}</div>
                <div className="text-sm text-gray-600">{t('scanQr')}</div>

                {/* Unique QR for this application's machine type */}
                <div className="mt-3 inline-block rounded-md border border-gray-200 bg-white p-2.5">
                  <QRCodeSVG value={qrValue || ' '} size={160} />
                </div>

                <div className="mt-3.5 text-sm font-bold text-gray-800">{t('amount').replace('{fee}', verificationFee)}</div>
                <div className="mt-2 text-sm font-semibold text-amber-800">{t('paymentStatusPending')}</div>

                <button onClick={completePayment} className="mt-4 cursor-pointer rounded-md bg-green-700 px-5 py-3 text-sm font-semibold text-white hover:bg-green-800">{t('paymentCompletedBtn')}</button>
              </div>
            )}
          </div>
        )}
      </Card>

      <Card className="mt-4">
        <h3 className="m-0 mb-4 text-base font-bold text-gray-800">{t('schedule')}</h3>
        <DetailRow>
          <Field label={t('submissionDate')} value={fmt(app.submissionDate)} />
          <Field label={t('scheduledInspection')} value={app.scheduledDate ? fmt(app.scheduledDate) : t('notScheduled')} className={app.scheduledDate ? '' : 'text-amber-800'} />
          <Field label={t('actualInspectionDate')} value={app.inspectionDate ? fmt(app.inspectionDate) : '—'} />
        </DetailRow>
      </Card>

      {app.readings && (
        <Card className="mt-4">
          <h3 className="m-0 mb-4 text-base font-bold text-gray-800">{t('verificationReadings')}</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Object.entries(app.readings).map(([k, v]) => (
              <Field key={k} label={k.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())} value={v} />
            ))}
          </div>
        </Card>
      )}

      {certificate && (
        <Card className="mt-4 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <div className="text-sm font-bold text-green-800">{t('certified')}</div>
            <div className="text-sm text-gray-700">{t('certificateIssuedOn').replace('{id}', certificate.id).replace('{date}', fmt(certificate.issueDate))}</div>
          </div>
          <Link to={`/certificates/${app.id}`} className="rounded-md bg-blue-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-900">{t('viewCertificate')}</Link>
        </Card>
      )}
    </div>
  );
}