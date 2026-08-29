import { useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Card, PageHeader, StatusBadge, ProgressTracker, Field, DetailRow } from '../components/ui';
import { QRCodeSVG } from 'qrcode.react';
import { getMachineTypeByName, qrDataFor } from '../data/machineTypes';
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
  const [showPayment, setShowPayment] = useState(false);

  const app = appApplications.find(a => a.id === id);

  // Machine type of this application: use the one chosen at submission time,
  // falling back to the linked instrument category if not set.
  const machineType = app ? (app.machineType || appInstruments.find(i => i.id === app.instrumentId)?.category || '') : '';

  // Find the matching fee and QR value for this machine type.
  const typeInfo = useMemo(() => getMachineTypeByName(machineType), [machineType]);
  const verificationFee = typeInfo ? typeInfo.fee : 0;
  const qrValue = typeInfo ? qrDataFor(typeInfo) : '';

  if (!app) return <Card><p>Application not found.</p></Card>;

  const instrument = appInstruments.find(i => i.id === app.instrumentId);
  const owner = appUsers.find(u => u.id === app.ownerId);
  const officer = app.officerId ? appUsers.find(u => u.id === app.officerId) : null;
  const certificate = appCertificates.find(c => c.applicationId === app.id);

  const isPaid = app.paymentStatus === 'PAID';

  const completePayment = () => {
    // Once paid, the application becomes "Submitted" and the tester can process it.
    updateApplication(app.id, { paymentStatus: 'PAID', status: 'SUBMITTED' });
    setShowPayment(false);
  };

  return (
    <div>
      <PageHeader title={app.id} subtitle="Application details, payment & status" action={<StatusBadge status={app.status} />} />

      <Card style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 13, color: '#475569', marginBottom: 10 }}>Application Status Flow</div>
        <ProgressTracker status={app.status} />
      </Card>

      {app.remarks && (app.status === 'REJECTED' || app.status === 'CERTIFIED') && (
        <Card style={{ marginBottom: 16, background: app.status === 'REJECTED' ? '#fef2f2' : '#f0fdf4', borderColor: app.status === 'REJECTED' ? '#fecaca' : '#bbf7d0' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: app.status === 'REJECTED' ? '#b91c1c' : '#15803d', marginBottom: 6 }}>Officer Remarks — {app.status}</div>
          <div style={{ fontSize: 14, color: '#334155' }}>{app.remarks}</div>
        </Card>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <Card>
          <h3 style={{ margin: '0 0 16px', fontSize: 16, color: '#0f172a' }}>Application Details</h3>
          <DetailRow>
            <Field label="Application ID" value={app.id} />
            <Field label="Machine Type" value={machineType} />
            <Field label="Machine ID" value={instrument?.id || '—'} />
            <Field label="Instrument" value={instrument?.modelNumber || '—'} />
            <Field label="Verification Fee" value={verificationFee ? `₹${verificationFee}` : '—'} color={verificationFee ? '#1d4ed8' : '#94a3b8'} />
            <Field label="Payment Status" value={isPaid ? 'Paid' : 'Pending Payment'} color={isPaid ? '#22c55e' : '#f59e0b'} />
          </DetailRow>
        </Card>

        <Card>
          <h3 style={{ margin: '0 0 16px', fontSize: 16, color: '#0f172a' }}>Owner & Officer</h3>
          <DetailRow>
            <Field label="Owner Name" value={owner?.name} />
            <Field label="Owner Email" value={owner?.email} />
            <Field label="Owner Phone" value={owner?.phone} />
            <Field label="Officer" value={officer?.name || 'Assigned after payment'} color={officer ? undefined : '#94a3b8'} />
          </DetailRow>
        </Card>
      </div>

      {/* ------------------- PAYMENT SECTION ------------------- */}
      <Card style={{ marginTop: 16 }}>
        <h3 style={{ margin: '0 0 16px', fontSize: 16, color: '#0f172a' }}>Payment</h3>

        {isPaid ? (
          <div style={{ textAlign: 'center', padding: 20, background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10 }}>
            <div style={{ fontSize: 32 }}>✓</div>
            <div style={{ fontWeight: 800, color: '#15803d', fontSize: 16 }}>Payment Completed</div>
            <div style={{ fontSize: 13, color: '#475569', marginTop: 6 }}>
              Fee ₹{verificationFee} for {machineType} has been paid. Your application is now <b>Submitted</b> and a Government Tester can schedule verification.
            </div>
          </div>
        ) : (
          <div>
            <Field label="Verification Fee" value={`₹${verificationFee}`} color="#1d4ed8" />
            <div style={{ marginTop: 16 }}>
              <button onClick={() => setShowPayment(!showPayment)} style={showPayment ? cancelBtn : payBtn}>
                {showPayment ? 'Cancel' : `Pay ₹${verificationFee}`}
              </button>
            </div>

            {showPayment && (
              <div style={{ textAlign: 'center', marginTop: 20, padding: 20, border: '1px solid #e2e8f0', borderRadius: 10, background: '#f8fafc' }}>
                <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>Verification Fee: ₹{verificationFee}</div>
                <div style={{ fontSize: 13, color: '#64748b' }}>Scan the QR code below to make payment</div>

                {/* Unique QR for this application's machine type */}
                <div style={{ display: 'inline-block', padding: 10, background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, marginTop: 12 }}>
                  <QRCodeSVG value={qrValue || ' '} size={160} />
                </div>

                <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', marginTop: 14 }}>Amount: ₹{verificationFee}</div>
                <div style={{ marginTop: 8, fontSize: 13, color: '#f59e0b', fontWeight: 600 }}>Payment Status: Pending</div>

                <button onClick={completePayment} style={completeBtn}>Payment Completed</button>
              </div>
            )}
          </div>
        )}
      </Card>

      <Card style={{ marginTop: 16 }}>
        <h3 style={{ margin: '0 0 16px', fontSize: 16, color: '#0f172a' }}>Schedule</h3>
        <DetailRow>
          <Field label="Submission Date" value={fmt(app.submissionDate)} />
          <Field label="Scheduled Inspection" value={app.scheduledDate ? fmt(app.scheduledDate) : 'Not scheduled'} color={app.scheduledDate ? undefined : '#f59e0b'} />
          <Field label="Actual Inspection Date" value={app.inspectionDate ? fmt(app.inspectionDate) : '—'} />
        </DetailRow>
      </Card>

      {app.readings && (
        <Card style={{ marginTop: 16 }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 16, color: '#0f172a' }}>Verification Readings</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px,1fr))', gap: 16 }}>
            {Object.entries(app.readings).map(([k, v]) => (
              <Field key={k} label={k.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())} value={v} />
            ))}
          </div>
        </Card>
      )}

      {certificate && (
        <Card style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 13, color: '#22c55e', fontWeight: 700 }}>CERTIFIED</div>
            <div style={{ fontSize: 14, color: '#475569' }}>Certificate <b style={{ color: '#0f172a' }}>{certificate.id}</b> issued on {fmt(certificate.issueDate)}</div>
          </div>
          <Link to={`/certificates/${app.id}`} style={viewBtn}>View Certificate</Link>
        </Card>
      )}
    </div>
  );
}

const payBtn = {
  background: '#4f46e5', color: '#fff', padding: '12px 22px', borderRadius: 8,
  fontSize: 14, fontWeight: 700, border: 'none', cursor: 'pointer',
};
const cancelBtn = {
  background: '#f1f5f9', color: '#334155', padding: '12px 22px', borderRadius: 8,
  fontSize: 14, fontWeight: 700, border: '1px solid #e2e8f0', cursor: 'pointer',
};
const completeBtn = {
  background: '#22c55e', color: '#fff', padding: '12px 22px', borderRadius: 8,
  fontSize: 14, fontWeight: 700, border: 'none', cursor: 'pointer', marginTop: 16,
};
const viewBtn = {
  background: '#4f46e5', color: '#fff', padding: '10px 18px', borderRadius: 8,
  fontSize: 13, fontWeight: 700, textDecoration: 'none',
};
