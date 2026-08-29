import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { PageHeader, Card, Table, StatusBadge, EmptyState, Alert } from '../../components/ui';
import { fmt } from '../../utils/format';
import { generateApplicationId } from '../../data/mockData';
import { getMachineTypes, getMachineTypeByName } from '../../data/machineTypes';

export default function OwnerApplications() {
  const { currentUser, appApplications, appInstruments, addApplication } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  const [machineType, setMachineType] = useState('');
  const [selectedInstrument, setSelectedInstrument] = useState('');

  const machineTypes = getMachineTypes();
  const myInstruments = appInstruments.filter(i => i.ownerId === currentUser.id);
  const myApps = appApplications.filter(a => a.ownerId === currentUser.id);

  // The fee is derived from the selected machine type (not entered manually).
  const feeForType = getMachineTypeByName(machineType)?.fee;

  const submitApplication = () => {
    if (!machineType) {
      setError('Please select a machine type for verification.');
      return;
    }
    // A new application starts in the "Payment Pending" state. It moves to
    // "Submitted" only after the owner completes payment on the detail page.
    const app = {
      id: generateApplicationId(),
      instrumentId: selectedInstrument || null,
      ownerId: currentUser.id,
      officerId: null,
      machineType,
      submissionDate: new Date().toISOString().slice(0, 10),
      scheduledDate: null,
      inspectionDate: null,
      status: 'PAYMENT_PENDING',
      paymentStatus: 'PENDING',
      readings: null,
      remarks: null,
    };
    addApplication(app);
    setShowForm(false);
    setMachineType('');
    setSelectedInstrument('');
    setError('');
  };

  return (
    <div>
      <PageHeader
        title="Applications"
        subtitle="Submit verification applications, complete payment and track progress"
        action={<button onClick={() => setShowForm(!showForm)} style={addBtn}>{showForm ? 'Cancel' : '+ New Application'}</button>}
      />

      {showForm && (
        <Card style={{ marginBottom: 20 }}>
          <h3 style={{ margin: '0 0 8px', fontSize: 16, color: '#0f172a' }}>Submit Verification Application</h3>
          <p style={{ margin: '0 0 12px', color: '#64748b', fontSize: 13 }}>Select the machine type to start a verification application. The fee is calculated automatically.</p>
          {error && <Alert type="error">{error}</Alert>}

          <div style={{ fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>Machine Type</div>
          <select value={machineType} onChange={e => { setMachineType(e.target.value); setError(''); }} style={selectStyle}>
            <option value="">Select Machine Type...</option>
            {machineTypes.map(m => <option key={m.id} value={m.name}>{m.name} — ₹{m.fee}</option>)}
          </select>

          <div style={{ fontSize: 13, fontWeight: 600, color: '#334155', margin: '14px 0 6px' }}>Instrument (optional)</div>
          <select value={selectedInstrument} onChange={e => setSelectedInstrument(e.target.value)} style={selectStyle}>
            <option value="">No instrument (add later)</option>
            {myInstruments.map(ins => <option key={ins.id} value={ins.id}>{ins.category} — {ins.modelNumber} ({ins.id})</option>)}
          </select>

          {machineType && (
            <div style={{ marginTop: 14, background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 10, padding: 12, fontSize: 14, color: '#1e40af' }}>
              Machine Type: <b style={{ color: '#0f172a' }}>{machineType}</b><br />
              Verification Fee: <b style={{ color: '#1d4ed8' }}>₹{feeForType}</b>
            </div>
          )}

          <div style={{ marginTop: 14 }}>
            <button onClick={submitApplication} style={addBtn}>Submit Application</button>
          </div>
        </Card>
      )}

      {myApps.length === 0 ? (
        <EmptyState message="You have not submitted any verification applications." />
      ) : (
        <Card>
          <Table headers={['Application ID', 'Machine Type', 'Submitted', 'Scheduled', 'Payment', 'Status', '']}>
            {myApps.map(app => (
              <tr key={app.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '12px 14px', fontWeight: 700, color: '#0f172a' }}>{app.id}</td>
                <td style={{ padding: '12px 14px', color: '#475569' }}>{app.machineType}</td>
                <td style={{ padding: '12px 14px', color: '#475569' }}>{fmt(app.submissionDate)}</td>
                <td style={{ padding: '12px 14px', color: app.scheduledDate ? '#475569' : '#94a3b8' }}>{app.scheduledDate ? fmt(app.scheduledDate) : 'Not scheduled'}</td>
                <td style={{ padding: '12px 14px' }}>
                  <span style={{ fontWeight: 700, fontSize: 12, color: app.paymentStatus === 'PAID' ? '#22c55e' : '#f59e0b' }}>
                    {app.paymentStatus === 'PAID' ? 'Paid' : 'Pending'}
                  </span>
                </td>
                <td style={{ padding: '12px 14px' }}><StatusBadge status={app.status} /></td>
                <td style={{ padding: '12px 14px' }}><Link to={`/applications/${app.id}`} style={viewBtn}>View</Link></td>
              </tr>
            ))}
          </Table>
        </Card>
      )}
    </div>
  );
}

const addBtn = {
  background: '#4f46e5', color: '#fff', padding: '10px 18px', borderRadius: 8,
  fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer',
};

const viewBtn = {
  color: '#0ea5e9', fontWeight: 600, fontSize: 13, textDecoration: 'none',
};

const selectStyle = {
  padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: 8,
  fontSize: 14, width: '100%', maxWidth: 480,
};
