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

  if (!complaint) return <Card><p>{t('complaintNotFound')}</p></Card>;

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

  return (
    <div>
      <PageHeader
        title={complaint.id}
        subtitle={t('complaintDetails')}
        action={<ComplaintStatusBadge status={complaint.status} />}
      />

      {msg && <div style={{ marginBottom: 16 }}><Alert type={msg.type}>{msg.text}</Alert></div>}

      {/* Public complaint snapshot */}
      <Card style={{ marginBottom: 16 }}>
        <h3 style={{ margin: '0 0 16px', fontSize: 16, color: '#0f172a' }}>{t('complaintPublicSection')}</h3>
        <DetailRow>
          <Field label={t('complaintIdLabel')} value={complaint.id} />
          <Field label={t('certificateNumber')} value={complaint.certificateId} />
          <Field label={t('machineOrInstrumentId')} value={complaint.instrumentId} />
          <Field label={t('complaintTypeLabel')} value={complaint.complaintType} />
          <Field label={t('complaintDateTime')} value={`${complaint.filedAt || fmt(complaint.submittedAt)}, ${complaint.filedTime || ''}`} />
          <Field label={t('complaintOwnerCol')} value={complaint.ownerName} />
        </DetailRow>
        <div style={{ marginTop: 16 }}>
          <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>{t('complaintDescriptionCol')}</div>
          <div style={{ fontSize: 14, color: '#334155', marginTop: 4 }}>{complaint.description}</div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 20 }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#475569', marginBottom: 8 }}>{t('complaintContact')}</div>
            <div style={{ fontSize: 13, color: '#334155' }}>
              <div>{complaint.contactName}</div>
              <div>{complaint.contactMobile}</div>
              {complaint.contactEmail && <div>{complaint.contactEmail}</div>}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#475569', marginBottom: 8 }}>{t('complaintGeoLocation')}</div>
            <div style={{ fontSize: 13, color: '#334155' }}>
              {complaint.latitude || complaint.longitude
                ? <span>{t('lat')}: {complaint.latitude} · {t('lng')}: {complaint.longitude}</span>
                : '—'}
            </div>
          </div>
        </div>

        {/* Evidence */}
        <div style={{ marginTop: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#475569', marginBottom: 8 }}>{t('complaintEvidenceSection')}</div>
          {complaint.evidence && complaint.evidence.length > 0 ? (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {complaint.evidence.map((e, i) => (
                <span key={i} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 6, padding: '6px 10px', fontSize: 12, color: '#475569' }}>📎 {e.name}</span>
              ))}
            </div>
          ) : (
            <span style={{ fontSize: 13, color: '#94a3b8' }}>{t('noEvidenceMsg')}</span>
          )}
        </div>
      </Card>

      {/* Certificate / instrument info from the linked record */}
      <Card style={{ marginBottom: 16 }}>
        <h3 style={{ margin: '0 0 16px', fontSize: 16, color: '#0f172a' }}>{t('complaintCertInfo')}</h3>
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
          <Field label={t('certificateStatus')} value={cert?.result === 'CERTIFIED' ? t('verifiedCertified') : cert?.result === 'REJECTED' ? t('rejectedStatus') : '—'} color={cert?.result === 'CERTIFIED' ? '#22c55e' : cert?.result === 'REJECTED' ? '#ef4444' : undefined} />
          <Field label={t('complaintGeoLocation')} value={cert?.latitude && cert?.longitude ? `${t('lat')}: ${cert.latitude} · ${t('lng')}: ${cert.longitude}` : (instrument?.latitude && instrument?.longitude ? `${t('lat')}: ${instrument.latitude} · ${t('lng')}: ${instrument.longitude}` : '—')} />
          <Field label={t('verificationDate')} value={fmt(cert?.verificationDate)} />
          <Field label={t('expiryDate')} value={fmt(cert?.expiryDate)} />
          <Field label={t('issueDate')} value={fmt(cert?.issueDate)} />
        </DetailRow>
      </Card>

      {/* Workflow + officer actions */}
      <Card>
        <h3 style={{ margin: '0 0 16px', fontSize: 16, color: '#0f172a' }}>{t('complaintWorkflowTitle')}</h3>

        {/* Progress tracker for the complaint status flow */}
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', marginBottom: 20 }}>
          {complaintStatusFlow.map((s, i) => {
            const done = i <= currentIndex;
            const color = done ? '#22c55e' : '#cbd5e1';
            return (
              <div key={s} style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 22, height: 22, borderRadius: '50%', background: done ? '#22c55e' : '#e2e8f0', color: done ? '#fff' : '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700 }}>
                    {done ? (i === currentIndex ? String(i + 1) : '✓') : String(i + 1)}
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 600, color: done ? '#15803d' : '#94a3b8' }}>{s}</span>
                </div>
                {i < complaintStatusFlow.length - 1 && <div style={{ width: 20, height: 2, background: i < currentIndex ? '#22c55e' : '#e2e8f0', margin: '0 6px' }} />}
              </div>
            );
          })}
        </div>

        <div style={{ fontSize: 13, fontWeight: 700, color: '#475569', marginBottom: 12 }}>{t('complaintOfficerActions')}</div>
        <div style={{ display: 'grid', gap: 12 }}>
          <div>
            <Label>{t('inspectionRemarks')}</Label>
            <textarea value={remarks} onChange={e => setRemarks(e.target.value)} style={{ ...input, minHeight: 60 }} />
          </div>
          <div>
            <Label>{t('actionTakenLabel')}</Label>
            <input value={actionTaken} onChange={e => setActionTaken(e.target.value)} style={input} />
          </div>
          <div>
            <Label>{t('finePenaltyLabel')}</Label>
            <input value={finePenalty} onChange={e => setFinePenalty(e.target.value)} style={input} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input type="checkbox" checked={reverification} onChange={e => setReverification(e.target.checked)} id="reverification" />
            <label htmlFor="reverification" style={{ fontSize: 13, color: '#334155' }}>{t('reverificationRequired')}</label>
          </div>
          <div>
            <Label>{t('finalResolutionRemarks')}</Label>
            <textarea value={finalRemarks} onChange={e => setFinalRemarks(e.target.value)} style={{ ...input, minHeight: 60 }} />
          </div>
        </div>

        <div style={{ marginTop: 16, display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <button onClick={storeProgress} style={saveBtn}>{t('saveComplaintProgress')}</button>
          {nextStatus && (
            <button onClick={advanceStatus} style={advanceBtn}>
              {t('markStatus').replace('{status}', t(`complaintStatus_${nextStatus.replace(/ /g, '_')}`))}
            </button>
          )}
          <Link to="/officer/complaints" style={{ color: '#0ea5e9', fontWeight: 600, fontSize: 13, textDecoration: 'none' }}>{t('back')}</Link>
        </div>
      </Card>
    </div>
  );
}

function Label({ children }) {
  return <div style={{ fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 4 }}>{children}</div>;
}

const input = {
  width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: 8, fontSize: 14, boxSizing: 'border-box', maxWidth: 500,
};

const saveBtn = {
  background: '#f1f5f9', color: '#334155', padding: '10px 18px', borderRadius: 8,
  fontSize: 13, fontWeight: 700, border: '1px solid #e2e8f0', cursor: 'pointer',
};

const advanceBtn = {
  background: '#4f46e5', color: '#fff', padding: '10px 18px', borderRadius: 8,
  fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer',
};
