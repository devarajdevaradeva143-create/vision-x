import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { PageHeader, Card, Table, StatusBadge, EmptyState, Alert } from '../../components/ui';
import { fmt } from '../../utils/format';
import { generateApplicationId } from '../../data/mockData';

export default function OwnerApplications() {
  const { currentUser, appApplications, appInstruments, addApplication } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');

  const allMyInstruments = appInstruments.filter(i => i.ownerId === currentUser.id);
  const myInstruments = allMyInstruments.filter(i => i.paymentStatus === 'PAID');
  const myApps = appApplications.filter(a => a.ownerId === currentUser.id);
  const [selectedInstrument, setSelectedInstrument] = useState('');

  const submitApplication = () => {
    if (!selectedInstrument) {
      setError('Please select an instrument to apply for verification.');
      return;
    }
    const app = {
      id: generateApplicationId(),
      instrumentId: selectedInstrument,
      ownerId: currentUser.id,
      officerId: null,
      submissionDate: new Date().toISOString().slice(0, 10),
      scheduledDate: null,
      inspectionDate: null,
      status: 'SUBMITTED',
      readings: null,
      remarks: null,
    };
    addApplication(app);
    setShowForm(false);
    setSelectedInstrument('');
    setError('');
  };

  return (
    <div>
      <PageHeader
        title="Applications"
        subtitle="Submit verification applications and track their progress"
        action={<button onClick={() => setShowForm(!showForm)} style={addBtn}>{showForm ? 'Cancel' : '+ New Application'}</button>}
      />

      {showForm && (
        <Card style={{ marginBottom: 20 }}>
          <h3 style={{ margin: '0 0 8px', fontSize: 16, color: '#0f172a' }}>Submit Verification Application</h3>
          <p style={{ margin: '0 0 12px', color: '#64748b', fontSize: 13 }}>Apply to get your instrument verified and certified by a Government Officer.</p>
          {error && <Alert type="error">{error}</Alert>}
          {allMyInstruments.length === 0 ? (
            <Alert type="warning">You need to <Link to="/instruments" style={{ color: '#0ea5e9', fontWeight: 700 }}>register an instrument</Link> first.</Alert>
          ) : myInstruments.length === 0 ? (
            <Alert type="warning">Complete payment on your instrument before applying for verification.</Alert>
          ) : (
            <>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>Select Instrument</div>
              <select value={selectedInstrument} onChange={e => setSelectedInstrument(e.target.value)} style={{ padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: 8, fontSize: 14, width: '100%', maxWidth: 480 }}>
                <option value="">Choose an instrument...</option>
                {myInstruments.map(ins => <option key={ins.id} value={ins.id}>{ins.category} — {ins.modelNumber} ({ins.id})</option>)}
              </select>
              <div style={{ marginTop: 14 }}>
                <button onClick={submitApplication} style={addBtn}>Submit Application</button>
              </div>
            </>
          )}
        </Card>
      )}

      {myApps.length === 0 ? (
        <EmptyState message="You have not submitted any verification applications." />
      ) : (
        <Card>
          <Table headers={['Application ID', 'Instrument', 'Submitted', 'Scheduled', 'Status', '']}>
            {myApps.map(app => {
              const ins = appInstruments.find(i => i.id === app.instrumentId);
              return (
                <tr key={app.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px 14px', fontWeight: 700, color: '#0f172a' }}>{app.id}</td>
                  <td style={{ padding: '12px 14px', color: '#475569' }}>{ins?.category}<div style={{ fontSize: 12, color: '#94a3b8' }}>{ins?.id}</div></td>
                  <td style={{ padding: '12px 14px', color: '#475569' }}>{fmt(app.submissionDate)}</td>
                  <td style={{ padding: '12px 14px', color: app.scheduledDate ? '#475569' : '#94a3b8' }}>{app.scheduledDate ? fmt(app.scheduledDate) : 'Not scheduled'}</td>
                  <td style={{ padding: '12px 14px' }}><StatusBadge status={app.status} /></td>
                  <td style={{ padding: '12px 14px' }}><Link to={`/applications/${app.id}`} style={viewBtn}>View</Link></td>
                </tr>
              );
            })}
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