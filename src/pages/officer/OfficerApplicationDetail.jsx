import { useParams, Link } from 'react-router-dom';
import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Card, PageHeader, StatusBadge, ProgressTracker, Field, DetailRow, Alert } from '../../components/ui';
import { fmt } from '../../utils/format';
import { generateCertificateId } from '../../data/mockData';

export default function OfficerApplicationDetail() {
  const { id } = useParams();
  const { currentUser, appApplications, appInstruments, appUsers, updateApplication, appCertificates, addCertificate } = useApp();
  const [scheduleDate, setScheduleDate] = useState('');
  const [readings, setReadings] = useState({});
  const [remarks, setRemarks] = useState('');
  const [showInspect, setShowInspect] = useState(false);
  const [expiry, setExpiry] = useState('');
  const [showCertify, setShowCertify] = useState(false);
  const [msg, setMsg] = useState(null);

  const app = appApplications.find(a => a.id === id);
  if (!app) return <Card><p>Application not found.</p></Card>;

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
    setMsg({ type: 'success', text: `Inspection scheduled for ${fmt(scheduleDate)}` });
  };

  const issueCertificate = (result) => {
    const existing = appCertificates.find(c => c.applicationId === app.id);
    const cert = {
      ...(existing || {}),
      id: existing?.id || generateCertificateId(),
      applicationId: app.id,
      instrumentId: instrument.id,
      ownerId: owner.id,
      ownerName: owner.name,
      instrumentType: instrument.type,
      category: instrument.category,
      serialNumber: instrument.serialNumber,
      verificationDate: new Date().toISOString().slice(0, 10),
      issueDate: new Date().toISOString().slice(0, 10),
      expiryDate: result === 'CERTIFIED' ? expiry : null,
      result,
      officerId: currentUser.id,
      officerName: currentUser.name,
    };
    addCertificate(cert);
    updateApplication(app.id, { status: result, inspectionDate: new Date().toISOString().slice(0, 10) });
    setShowCertify(false);
    setMsg({ type: result === 'CERTIFIED' ? 'success' : 'error', text: result === 'CERTIFIED' ? `Certificate ${cert.id} has been issued!` : 'Application has been REJECTED.' });
  };

  const commonReadings = [
    { key: 'accuracy', label: 'Accuracy' },
    { key: 'repeatability', label: 'Repeatability' },
    { key: 'linearity', label: 'Linearity' },
    { key: 'eccentricity', label: 'Eccentricity' },
  ];

  const handleReading = (k, v) => setReadings({ ...readings, [k]: v });

  const saveInspection = () => {
    updateApplication(app.id, { status: 'INSPECTED', readings, remarks });
    setShowInspect(false);
    setMsg({ type: 'success', text: 'Inspection readings recorded. Application moved to INSPECTED.' });
  };

  return (
    <div>
      <PageHeader title={app.id} subtitle="Process verification application" action={<StatusBadge status={app.status} />} />

      {msg && <div style={{ marginBottom: 16 }}><Alert type={msg.type}>{msg.text}</Alert></div>}

      <Card style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 13, color: '#475569', marginBottom: 10 }}>Application Status Flow</div>
        <ProgressTracker status={app.status} />
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <Card>
          <h3 style={{ margin: '0 0 16px', fontSize: 16, color: '#0f172a' }}>Instrument</h3>
          <DetailRow>
            <Field label="Machine / Instrument Type" value={machineType} />
            <Field label="Machine ID" value={app.instrumentId || '—'} />
            <Field label="Manufacturer" value={manufacturer} />
            <Field label="Model" value={model} />
            <Field label="Serial No." value={serial} />
            <Field label="Capacity" value={capacity} />
            <Field label="Location" value={location} />
          </DetailRow>
        </Card>
        <Card>
          <h3 style={{ margin: '0 0 16px', fontSize: 16, color: '#0f172a' }}>Owner</h3>
          <DetailRow>
            <Field label="Name" value={owner?.name} />
            <Field label="Email" value={owner?.email} />
            <Field label="Phone" value={owner?.phone} />
            <Field label="Address" value={owner?.address} />
          </DetailRow>
        </Card>
      </div>

      <Card style={{ marginTop: 16 }}>
        <h3 style={{ margin: '0 0 16px', fontSize: 16, color: '#0f172a' }}>Application Details</h3>
        <DetailRow>
          <Field label="Application ID" value={app.id} />
          <Field label="Application Date" value={fmt(app.submissionDate)} />
          <Field label="Payment Status" value={app.paymentStatus === 'PAID' ? 'Paid' : 'Pending'} color={app.paymentStatus === 'PAID' ? '#22c55e' : '#f59e0b'} />
          <Field label="Application Status" value={app.status} />
        </DetailRow>
      </Card>

      <Card style={{ marginTop: 16 }}>
        <h3 style={{ margin: '0 0 16px', fontSize: 16, color: '#0f172a' }}>Inspection Actions</h3>

        {app.status === 'SUBMITTED' && (
          <div>
            <div style={{ fontSize: 14, color: '#475569', marginBottom: 10 }}>Review this application.</div>
            <label style={{ fontWeight: 600, fontSize: 13, display: 'block', marginBottom: 6 }}>Schedule Inspection Date</label>
            <input type="date" value={scheduleDate} onChange={e => setScheduleDate(e.target.value)} style={input} />
            <div style={{ marginTop: 12 }}><button onClick={handleSchedule} style={actionBtn}>Review & Schedule</button></div>
          </div>
        )}

        {app.status === 'SCHEDULED' && (
          <div>
            <div style={{ fontSize: 14, color: '#475569', marginBottom: 10 }}>
              <b style={{ color: '#0f172a' }}>Scheduled inspection:</b> {fmt(app.scheduledDate)}. Record the inspection readings and results.
            </div>
            {!showInspect ? (
              <button onClick={() => setShowInspect(true)} style={actionBtn}>Record Inspection Results</button>
            ) : (
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>Verification Readings (enter values)</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12 }}>
                  {commonReadings.map(r => (
                    <div key={r.key}>
                      <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>{r.label}</label>
                      <input style={input} placeholder={r.key === 'accuracy' ? 'e.g. ±0.0001g' : 'e.g. Within limits'} value={readings[r.key] || ''} onChange={e => handleReading(r.key, e.target.value)} />
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 12 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>Officer Remarks</label>
                  <textarea style={{ ...input, minHeight: 60 }} value={remarks} onChange={e => setRemarks(e.target.value)} placeholder="Inspection observations..." />
                </div>
                <div style={{ marginTop: 12, display: 'flex', gap: 10 }}>
                  <button onClick={saveInspection} style={actionBtn}>Save as Inspected</button>
                  <button onClick={() => setShowInspect(false)} style={cancelBtn}>Cancel</button>
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
            <div style={{ fontSize: 13, color: '#475569', marginBottom: 8 }}><b>Remarks:</b> {app.remarks || '—'}</div>
            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 14 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', marginBottom: 10 }}>Decision</div>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                {!showCertify && (
                  <>
                    <button onClick={() => { setShowCertify(true); }} style={{ ...actionBtn, background: '#22c55e' }}>Approve & Certify</button>
                    <button onClick={() => {
                      updateApplication(app.id, { status: 'REJECTED', inspectionDate: new Date().toISOString().slice(0, 10) });
                      setMsg({ type: 'error', text: 'Application has been REJECTED.' });
                    }} style={{ ...actionBtn, background: '#ef4444' }}>Reject</button>
                  </>
                )}
                {showCertify && (
                  <div style={{ width: '100%', background: '#f8fafc', padding: 14, borderRadius: 8 }}>
                    <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>Certificate Expiry Date (typically 1 year from issue)</label>
                    <input type="date" value={expiry} onChange={e => setExpiry(e.target.value)} style={input} />
                    <div style={{ marginTop: 10, display: 'flex', gap: 10 }}>
                      <button onClick={() => issueCertificate('CERTIFIED')} disabled={!expiry} style={actionBtn}>Generate Certificate</button>
                      <button onClick={() => setShowCertify(false)} style={cancelBtn}>Cancel</button>
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
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#22c55e' }}>Certificate <b>{certificate.id}</b> issued</div>
                  <div style={{ fontSize: 13, color: '#475569' }}>Expires {fmt(certificate.expiryDate)}</div>
                </div>
                <Link to={`/certificates/${app.id}`} style={actionBtn}>View / Print Certificate</Link>
              </div>
            ) : (
              <Alert type="error">This application was rejected. Owner must repair and re-apply.</Alert>
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
