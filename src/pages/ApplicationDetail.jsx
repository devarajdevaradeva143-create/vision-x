import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { Card, PageHeader, StatusBadge, ProgressTracker, Field, DetailRow } from '../components/ui';
import { getMachineTypeByName } from '../data/machineTypes';
import { getDefaultOfficer } from '../data/mockData';
import { fmt } from '../utils/format';

function formatCountdown(remainingMs) {
  const totalSeconds = Math.max(0, Math.ceil(remainingMs / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

function generateTxnId() {
  const rand = String(Math.floor(Math.random() * 100000000)).padStart(8, '0');
  return `TXN-DEMO-${rand}`;
}

function formatMessageTime(dateStr) {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) + ' ' +
      d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
  } catch { return dateStr; }
}

export default function ApplicationDetail() {
  const { id } = useParams();
  const { appApplications, appInstruments, appUsers, appCertificates, updateApplication } = useApp();
  const { t } = useLanguage();
  const [paymentPhase, setPaymentPhase] = useState('idle');
  const [countdown, setCountdown] = useState(0);
  const [txnId, setTxnId] = useState('');
  const [confirmedAt, setConfirmedAt] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [showMessages, setShowMessages] = useState(false);
  const timerRef = useRef(null);
  const phaseRef = useRef(paymentPhase);
  const messagesEndRef = useRef(null);

  const app = appApplications.find(a => a.id === id);

  const machineType = app ? (app.machineType || appInstruments.find(i => i.id === app.instrumentId)?.category || '') : '';
  const typeInfo = getMachineTypeByName(machineType);
  const verificationFee = typeInfo ? typeInfo.fee : 0;
  const qrImage = typeInfo ? typeInfo.qrImage : null;

  useEffect(() => {
    phaseRef.current = paymentPhase;
  }, [paymentPhase]);

  // Auto-start 15-second payment timer when payment is pending
  // eslint-disable-next-line react/set-state-in-effect
  useEffect(() => {
    if (app && app.paymentStatus !== 'PAID' && paymentPhase === 'idle') {
      setPaymentPhase('waiting');
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Start 15-second countdown when payment phase becomes "waiting"
  // eslint-disable-next-line react/set-state-in-effect
  useEffect(() => {
    if (paymentPhase === 'waiting') {
       const startTime = Date.now();
       const countdownDuration = 15 * 1000;

       timerRef.current = setInterval(() => {
         const elapsed = Date.now() - startTime;
         const remaining = countdownDuration - elapsed;

         if (remaining <= 0) {
           clearInterval(timerRef.current);
           timerRef.current = null;
           const now = new Date();
           const txn = generateTxnId();
           setTxnId(txn);
           setConfirmedAt(now.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) + ', ' + now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }));
           setPaymentPhase('paid');
           if (id) {
             updateApplication(id, { paymentStatus: 'PAID', status: 'SUBMITTED', officerId: getDefaultOfficer() });
           }
         } else {
           setCountdown(remaining);
         }
       }, 250);
     }

     return () => {
       if (timerRef.current) {
         clearInterval(timerRef.current);
         timerRef.current = null;
       }
     };
   }, [paymentPhase, id, updateApplication]);

  // Sync paymentPhase with app.paymentStatus from context
  // eslint-disable-next-line react/set-state-in-effect
  useEffect(() => {
    if (app && app.paymentStatus === 'PAID') {
      setPaymentPhase('paid');
    }
  }, [app]);

  if (!app) return <Card><p className="text-sm text-gray-600">{t('applicationNotFound')}</p></Card>;

  const instrument = appInstruments.find(i => i.id === app.instrumentId);
  const owner = appUsers.find(u => u.id === app.ownerId);
  const officer = app.officerId ? appUsers.find(u => u.id === app.officerId) : null;
  const certificate = appCertificates.find(c => c.applicationId === app.id);

  const isPaid = app.paymentStatus === 'PAID' || paymentPhase === 'paid';

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    const now = new Date().toISOString();
    const updatedApp = {
      ...app,
      messages: [
        ...(app.messages || []),
        { from: 'owner', to: 'officer', text: newMessage.trim(), timestamp: now },
      ],
    };
    updateApplication(app.id, { messages: updatedApp.messages });
    setNewMessage('');
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
            <Field label={t('paymentStatus')} value={isPaid ? t('paymentPaid') : t('pendingPayment')} className={isPaid ? 'text-green-800' : 'text-amber-800'} />
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
            <div className="text-base font-bold text-green-800">{t('paymentSuccessful')}</div>
            <div className="mt-1.5 text-sm text-gray-700">
              {txnId && `${t('transactionId')}: ${txnId}`}
              {confirmedAt && `\n${t('confirmed')}: ${confirmedAt}`}
            </div>
            <div className="mt-2 text-sm text-gray-700">
              {t('paymentCompletedMsg').replace('{fee}', verificationFee).replace('{type}', machineType)}
            </div>
          </div>
        ) : (
          <div>
            <Field label={t('verificationFee')} value={`₹${verificationFee}`} className="text-blue-800" />
            <div className="mt-5 rounded-md border border-gray-200 bg-gray-50 px-4 py-5 text-center">
              <div className="font-bold text-gray-800">{t('verificationFee')}: ₹{verificationFee}</div>
              <div className="mt-1 text-xs text-gray-500">{t('qrValidFor').replace('{time}', '5:00')}</div>
              <div className="mt-1 text-sm text-gray-600">{t('scanAndPay')}</div>
              {qrImage ? (
                <div className="mt-3 inline-block rounded-md border border-gray-200 bg-white p-2.5">
                  <img src={qrImage} alt={`${machineType} QR`} className="h-40 w-40 object-contain" />
                </div>
              ) : (
                <div className="mt-3 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {t('qrNotAvailable')}
                </div>
              )}
              {paymentPhase === 'waiting' && (
                <div className="mt-4">
                  <div className="text-lg font-bold text-amber-800">{t('waitingForPayment')}</div>
                  <div className="mt-1 text-sm font-semibold text-amber-700">
                    {t('countdownTimer').replace('{time}', formatCountdown(countdown))}
                  </div>
                  <div className="mt-1 text-xs text-amber-600">{t('paymentPending')}</div>
                </div>
              )}
              {paymentPhase === 'paid' && !confirmedAt && (
                <div className="mt-4">
                  <div className="text-sm font-semibold text-amber-700">{t('paymentPending')}</div>
                </div>
              )}
              {confirmedAt && (
                <div className="mt-3 rounded-md border border-green-200 bg-green-50 px-4 py-3">
                  <div className="text-base font-bold text-green-800">{t('paymentSuccessful')}</div>
                  <div className="mt-1.5 text-sm font-semibold text-gray-800">{t('transactionId')}: <span className="font-mono">{txnId}</span></div>
                  <div className="mt-1 text-sm text-gray-700">{t('confirmed')}: {confirmedAt}</div>
                </div>
              )}
            </div>
          </div>
        )}
      </Card>

      {/* ------------------- MESSAGE BOX ------------------- */}
      <Card className="mt-4">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="m-0 text-base font-bold text-gray-800">{t('messageBox')}</h3>
          <button
            onClick={() => setShowMessages(!showMessages)}
            className="cursor-pointer rounded-md bg-blue-800 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-900"
          >
            {t('chat')}
          </button>
        </div>

        {showMessages && (
          <div>
            <div className="mb-3 text-xs text-gray-500">{t('officerMessage')} / {t('ownerMessage')} — {t('messageBox')}</div>
            <div className="mb-2 max-h-64 overflow-y-auto rounded-md border border-gray-200 bg-gray-50 p-3">
              {(app.messages && app.messages.length > 0) ? (
                app.messages.map((msg, idx) => (
                  <div key={idx} className={`mb-2 ${msg.from === 'owner' ? 'text-right' : 'text-left'}`}>
                    <div className={`inline-block rounded-md px-3 py-2 text-sm ${
                      msg.from === 'owner' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                    }`}>
                      <div className="text-xs font-bold mb-0.5">
                        {msg.from === 'owner' ? t('ownerMessage') : t('officerMessage')}
                      </div>
                      <div>{msg.text}</div>
                      <div className="mt-0.5 text-xs opacity-70">{formatMessageTime(msg.timestamp)}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-sm text-gray-400">{t('noMessages')}</div>
              )}
              <div ref={messagesEndRef} />
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                placeholder={t('messagePlaceholder')}
                className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:border-blue-700 focus:outline-none"
              />
              <button
                onClick={handleSendMessage}
                className="cursor-pointer rounded-md bg-blue-800 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-900"
              >
                {t('sendMessage')}
              </button>
            </div>
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