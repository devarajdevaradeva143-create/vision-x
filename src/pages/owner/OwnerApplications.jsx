import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';
import { PageHeader, Card, Table, StatusBadge, EmptyState, Alert } from '../../components/ui';
import { fmt } from '../../utils/format';
import { generateApplicationId } from '../../data/mockData';
import { getMachineTypes, getMachineTypeByName } from '../../data/machineTypes';

export default function OwnerApplications() {
  const { currentUser, appApplications, appInstruments, addApplication } = useApp();
  const { t } = useLanguage();
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  const [machineType, setMachineType] = useState('');
  const [selectedInstrument, setSelectedInstrument] = useState('');

  const machineTypes = getMachineTypes();
  const myInstruments = appInstruments.filter(i => i.ownerId === currentUser.id);
  const myApps = appApplications.filter(a => a.ownerId === currentUser.id);

  // The fee is derived from the selected machine type (not entered manually).
  const feeForType = getMachineTypeByName(machineType)?.fee;

  // Optional machine details (used when no linked instrument is selected) so the
  // officer always sees the complete submitted instrument info.
  const [details, setDetails] = useState({ manufacturer: '', modelNumber: '', serialNumber: '', capacity: '', location: '' });

  const submitApplication = () => {
    if (!machineType) {
      setError(t('pleaseSelectMachine'));
      return;
    }
    // Snapshot the machine details into THIS application object (same ID through
    // the whole flow) so the officer shows exactly what the owner submitted.
    const linked = appInstruments.find(i => i.id === selectedInstrument);
    const machine = linked
      ? { manufacturer: linked.manufacturer, modelNumber: linked.modelNumber, serialNumber: linked.serialNumber, capacity: linked.capacity, location: linked.location }
      : details;
    const app = {
      id: generateApplicationId(),
      instrumentId: selectedInstrument || null,
      ownerId: currentUser.id,
      officerId: null,
      machineType,
      ...machine,
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
    setDetails({ manufacturer: '', modelNumber: '', serialNumber: '', capacity: '', location: '' });
    setError('');
  };

  return (
    <div>
      <PageHeader
        title={t('applications')}
        subtitle={t('submitAppsSubtitle')}
        action={<button onClick={() => setShowForm(!showForm)} style={addBtn}>{showForm ? t('cancel') : t('newApplication')}</button>}
      />

      {showForm && (
        <Card style={{ marginBottom: 20 }}>
          <h3 style={{ margin: '0 0 8px', fontSize: 16, color: '#0f172a' }}>{t('submitVerificationApplication')}</h3>
          <p style={{ margin: '0 0 12px', color: '#64748b', fontSize: 13 }}>{t('selectMachineHint')}</p>
          {error && <Alert type="error">{error}</Alert>}

          <div style={{ fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>{t('machineType')}</div>
          <select value={machineType} onChange={e => { setMachineType(e.target.value); setError(''); }} style={selectStyle}>
            <option value="">{t('selectMachineType')}</option>
            {machineTypes.map(m => <option key={m.id} value={m.name}>{m.name} — ₹{m.fee}</option>)}
          </select>

          <div style={{ fontSize: 13, fontWeight: 600, color: '#334155', margin: '14px 0 6px' }}>{t('instrumentOptional')}</div>
          <select value={selectedInstrument} onChange={e => setSelectedInstrument(e.target.value)} style={selectStyle}>
            <option value="">{t('noInstrumentOpt')}</option>
            {myInstruments.map(ins => <option key={ins.id} value={ins.id}>{ins.category} — {ins.modelNumber} ({ins.id})</option>)}
          </select>

          {!selectedInstrument && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 10 }}>
              {[['manufacturer', t('manufacturer')], ['modelNumber', t('modelNumber')], ['serialNumber', t('serialNumber')], ['capacity', t('capacityRange')], ['location', t('location')]].map(([key, label]) => (
                <div key={key} style={key === 'location' ? { gridColumn: '1 / -1' } : {}}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#334155', marginBottom: 4 }}>{label}</div>
                  <input value={details[key]} onChange={e => setDetails(d => ({ ...d, [key]: e.target.value }))} style={selectStyle} placeholder={`e.g. ${key === 'location' ? 'Mumbai Central Lab' : key === 'capacity' ? '220 g' : 'Mettler Toledo'}`} />
                </div>
              ))}
            </div>
          )}

          {machineType && (
            <div style={{ marginTop: 14, background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 10, padding: 12, fontSize: 14, color: '#1e40af' }}>
              {t('machineType')}: <b style={{ color: '#0f172a' }}>{machineType}</b><br />
              {t('feeForType')}<b style={{ color: '#1d4ed8' }}>₹{feeForType}</b>
            </div>
          )}

          <div style={{ marginTop: 14 }}>
            <button onClick={submitApplication} style={addBtn}>{t('submitApplication')}</button>
          </div>
        </Card>
      )}

      {myApps.length === 0 ? (
        <EmptyState message={t('noAppsMsg')} />
      ) : (
        <Card>
          <Table headers={[t('appId'), t('machineType'), t('submitted'), t('scheduled'), t('payment'), t('status'), '']}>
            {myApps.map(app => (
              <tr key={app.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '12px 14px', fontWeight: 700, color: '#0f172a' }}>{app.id}</td>
                <td style={{ padding: '12px 14px', color: '#475569' }}>{app.machineType}</td>
                <td style={{ padding: '12px 14px', color: '#475569' }}>{fmt(app.submissionDate)}</td>
                <td style={{ padding: '12px 14px', color: app.scheduledDate ? '#475569' : '#94a3b8' }}>{app.scheduledDate ? fmt(app.scheduledDate) : t('notScheduled')}</td>
                <td style={{ padding: '12px 14px' }}>
                  <span style={{ fontWeight: 700, fontSize: 12, color: app.paymentStatus === 'PAID' ? '#22c55e' : '#f59e0b' }}>
                    {app.paymentStatus === 'PAID' ? t('paid') : t('pending')}
                  </span>
                </td>
                <td style={{ padding: '12px 14px' }}><StatusBadge status={app.status} /></td>
                <td style={{ padding: '12px 14px' }}><Link to={`/applications/${app.id}`} style={viewBtn}>{t('view')}</Link></td>
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
