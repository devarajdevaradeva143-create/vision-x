import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';
import { Card, PageHeader, Field, DetailRow, Alert, ComplaintStatusBadge } from '../../components/ui';
import { fmt } from '../../utils/format';
import { complaintStatusFlow } from '../../data/mockData';

// ---------------------------------------------------------------------------
// Officer Complaint Detail.
//
// Opens the EXACT complaint the public user filed, always linked to the exact
// certificate + instrument via the stored reference keys (certificateId,
// applicationId, instrumentId). The officer works this single record through the
// complaint status flow (PENDING -> ... -> RESOLVED) and can attach inspection
// remarks / action / fine / re-verification and final resolution remarks.
// ---------------------------------------------------------------------------

export default function OfficerComplaintDetail() {
  const { id } = useParams();
  const { appComplaints, appCertificates, appInstruments, updateComplaint } = useApp();
  const { t } = useLanguage();

  const complaint = appComplaints.find(c => c.id === id);
  const saved = complaint?.progress || {};

  const [remarks, setRemarks] = useState(saved.remarks || '');
  const [actionTaken, setActionTaken] = useState(saved.actionTaken || '');
  const [finePenalty, setFinePenalty] = useState(saved.finePenalty || '');
  const [reverification, setReverification] = useState(saved.reverificationRequired || false);
  const [finalRemarks, setFinalRemarks] = useState(saved.finalRemarks || '');
  const [msg, setMsg] = useState(null);

  if (!complaint) return <Card><p className="text-sm text-gray-600">{t('complaintNotFound')}</p></Card>;

  // Resolve the EXACT certificate and instrument referenced by this complaint.
  const cert = appCertificates.find(c => c.id === complaint.certificateId);
  const instrument = appInstruments.find(i => i.id === complaint.instrumentId);

  const currentIndex = complaintStatusFlow.indexOf(complaint.status);
  const nextStatus = currentIndex >= 0 && currentIndex < complaintStatusFlow.length - 1
    ? complaintStatusFlow[currentIndex + 1]
    : null;

  const progressUpdates = () => ({
    remarks,
    actionTaken,
    finePenalty,
    reverificationRequired: reverification,
    finalRemarks,
  });

  const storeProgress = () => {
    updateComplaint(complaint.id, { progress: progressUpdates() });
    setMsg({ type: 'success', text: t('statusSavedMsg').replace('{id}', complaint.id) });
  };

  const advanceStatus = () => {
    if (!nextStatus) return;
    // Require final resolution remarks before closing the complaint.
    if (nextStatus === 'RESOLVED' && !finalRemarks.trim()) {
      setMsg({ type: 'error', text: t('needFinalRemarks') });
      return;
    }
    updateComplaint(complaint.id, { status: nextStatus, progress: progressUpdates() });
    setMsg({ type: 'success', text: t('statusSavedMsg').replace('{id}', complaint.id) });
  };

  const progress = complaint.progress || {};

  const certStatusClass = (c) => {
    if (c?.result === 'CERTIFIED') return 'text-green-800';
    if (c?.result === 'REJECTED') return 'text-red-800';
    return '';
  };

  return (
    <div>
      <PageHeader
        title={complaint.id}
        subtitle={t('complaintDetails')}
        action={<ComplaintStatusBadge status={complaint.status} />}
      />

      {msg && <div className="mb-4"><Alert type={msg.type}>{msg.text}</Alert></div>}

      {/* Public complaint snapshot */}
      <Card className="mb-4">
        <h3 className="m-0 mb-4 text-base font-bold text-gray-800">{t('complaintPublicSection')}</h3>
        <DetailRow>
          <Field label={t('complaintIdLabel')} value={complaint.id} />
          <Field label={t('certificateNumber')} value={complaint.certificateId} />
          <Field label={t('machineOrInstrumentId')} value={complaint.instrumentId} />
          <Field label={t('complaintTypeLabel')} value={complaint.complaintType} />
          <Field label={t('complaintDateTime')} value={`${complaint.filedAt || fmt(complaint.submittedAt)}, ${complaint.filedTime || ''}`} />
          <Field label={t('complaintOwnerCol')} value={complaint.ownerName} />
        </DetailRow>
        <div className="mt-4">
          <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">{t('complaintDescriptionCol')}</div>
          <div className="mt-1 text-sm text-gray-700">{complaint.description}</div>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <div>
            <div className="mb-2 text-sm font-semibold text-gray-700">{t('complaintContact')}</div>
            <div className="text-sm text-gray-700">
              <div>{complaint.contactName}</div>
              <div>{complaint.contactMobile}</div>
              {complaint.contactEmail && <div>{complaint.contactEmail}</div>}
            </div>
          </div>
          <div>
            <div className="mb-2 text-sm font-semibold text-gray-700">{t('complaintGeoLocation')}</div>
            <div className="text-sm text-gray-700">
              {complaint.latitude || complaint.longitude
                ? <span>{t('lat')}: {complaint.latitude} · {t('lng')}: {complaint.longitude}</span>
                : '—'}
            </div>
          </div>
        </div>

        {/* Evidence */}
        <div className="mt-5">
          <div className="mb-2 text-sm font-semibold text-gray-700">{t('complaintEvidenceSection')}</div>
          {complaint.evidence && complaint.evidence.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {complaint.evidence.map((e, i) => (
                <span key={i} className="rounded-md border border-gray-200 bg-gray-50 px-2.5 py-1.5 text-xs text-gray-700">📎 {e.name}</span>
              ))}
            </div>
          ) : (
            <span className="text-sm text-gray-500">{t('noEvidenceMsg')}</span>
          )}
        </div>
      </Card>

      {/* Certificate / instrument info from the linked record */}
      <Card className="mb-4">
        <h3 className="m-0 mb-4 text-base font-bold text-gray-800">{t('complaintCertInfo')}</h3>
        <DetailRow>
          <Field label={t('certificateNumber')} value={cert?.id || complaint.certificateId} />
          <Field label={t('applicationIdField')} value={cert?.applicationId || complaint.applicationId} />
          <Field label={t('machineOrInstrumentId')} value={instrument?.id || complaint.instrumentId} />
          <Field label={t('ownerName')} value={cert?.ownerName || complaint.ownerName} />
          <Field label={t('machineTypeField')} value={cert?.category || instrument?.category} />
          <Field label={t('manufacturer')} value={cert?.manufacturer || instrument?.manufacturer} />
          <Field label={t('model')} value={cert?.model || instrument?.modelNumber} />
          <Field label={t('serialNumber')} value={cert?.serialNumber || instrument?.serialNumber} />
          <Field label={t('capacityRange')} value={cert?.capacity || instrument?.capacity} />
          <Field label={t('location')} value={cert?.location || instrument?.location} />
          <Field label={t('certificateStatus')} value={cert?.result === 'CERTIFIED' ? t('verifiedCertified') : cert?.result === 'REJECTED' ? t('rejectedStatus') : '—'} className={certStatusClass(cert)} />
          <Field label={t('complaintGeoLocation')} value={cert?.latitude && cert?.longitude ? `${t('lat')}: ${cert.latitude} · ${t('lng')}: ${cert.longitude}` : (instrument?.latitude && instrument?.longitude ? `${t('lat')}: ${instrument.latitude} · ${t('lng')}: ${instrument.longitude}` : '—')} />
          <Field label={t('verificationDate')} value={fmt(cert?.verificationDate)} />
          <Field label={t('expiryDate')} value={fmt(cert?.expiryDate)} />
          <Field label={t('issueDate')} value={fmt(cert?.issueDate)} />
        </DetailRow>
      </Card>

      {/* Workflow + officer actions */}
      <Card>
        <h3 className="m-0 mb-4 text-base font-bold text-gray-800">{t('complaintWorkflowTitle')}</h3>

        {/* Progress tracker for the complaint status flow */}
        <div className="mb-5 flex flex-wrap items-center">
          {complaintStatusFlow.map((s, i) => {
            const done = i <= currentIndex;
            return (
              <div key={s} className="flex items-center">
                <div className="flex items-center gap-1.5">
                  <div className={`flex h-5.5 w-5.5 items-center justify-center rounded-full text-[11px] font-bold ${done ? 'bg-green-700 text-white' : 'bg-gray-200 text-gray-500'}`}>
                    {done ? (i === currentIndex ? String(i + 1) : '✓') : String(i + 1)}
                  </div>
                  <span className={`text-[11px] font-semibold ${done ? 'text-green-700' : 'text-gray-500'}`}>{s}</span>
                </div>
                {i < complaintStatusFlow.length - 1 && <div className={`mx-1.5 h-0.5 w-5 ${i < currentIndex ? 'bg-green-700' : 'bg-gray-200'}`} />}
              </div>
            );
          })}
        </div>

        <div className="mb-3 text-sm font-semibold text-gray-700">{t('complaintOfficerActions')}</div>
        <div className="grid gap-3">
          <div>
            <Label>{t('inspectionRemarks')}</Label>
            <textarea value={remarks} onChange={e => setRemarks(e.target.value)} className={`${input} min-h-[60px]`} />
          </div>
          <div>
            <Label>{t('actionTakenLabel')}</Label>
            <input value={actionTaken} onChange={e => setActionTaken(e.target.value)} className={input} />
          </div>
          <div>
            <Label>{t('finePenaltyLabel')}</Label>
            <input value={finePenalty} onChange={e => setFinePenalty(e.target.value)} className={input} />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" checked={reverification} onChange={e => setReverification(e.target.checked)} id="reverification" className="h-4 w-4 accent-blue-800" />
            <label htmlFor="reverification" className="text-sm text-gray-700">{t('reverificationRequired')}</label>
          </div>
          <div>
            <Label>{t('finalResolutionRemarks')}</Label>
            <textarea value={finalRemarks} onChange={e => setFinalRemarks(e.target.value)} className={`${input} min-h-[60px]`} />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2.5">
          <button onClick={storeProgress} className="cursor-pointer rounded-md border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100">{t('saveComplaintProgress')}</button>
          {nextStatus && (
            <button onClick={advanceStatus} className="cursor-pointer rounded-md bg-blue-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-900">
              {t('markStatus').replace('{status}', t(`complaintStatus_${nextStatus.replace(/ /g, '_')}`))}
            </button>
          )}
          <Link to="/officer/complaints" className="text-sm font-medium text-blue-800 hover:text-blue-900">{t('back')}</Link>
        </div>
      </Card>
    </div>
  );
}

function Label({ children }) {
  return <div className="mb-1 text-sm font-medium text-gray-700">{children}</div>;
}

const input = 'w-full max-w-md rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:border-blue-700 focus:outline-none';