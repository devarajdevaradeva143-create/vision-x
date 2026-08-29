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
        action={<button onClick={() => setShowForm(!showForm)} className="cursor-pointer rounded-md bg-blue-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-900">{showForm ? t('cancel') : t('newApplication')}</button>}
      />

      {showForm && (
        <Card className="mb-5">
          <h3 className="m-0 mb-2 text-base font-bold text-gray-800">{t('submitVerificationApplication')}</h3>
          <p className="m-0 mb-3 text-sm text-gray-600">{t('selectMachineHint')}</p>
          {error && <div className="mb-3"><Alert type="error">{error}</Alert></div>}

          <div className="mb-1.5 text-sm font-medium text-gray-700">{t('machineType')}</div>
          <select value={machineType} onChange={e => { setMachineType(e.target.value); setError(''); }} className={selectStyle}>
            <option value="">{t('selectMachineType')}</option>
            {machineTypes.map(m => <option key={m.id} value={m.name}>{m.name} — ₹{m.fee}</option>)}
          </select>

          <div className="mb-1.5 mt-3.5 text-sm font-medium text-gray-700">{t('instrumentOptional')}</div>
          <select value={selectedInstrument} onChange={e => setSelectedInstrument(e.target.value)} className={selectStyle}>
            <option value="">{t('noInstrumentOpt')}</option>
            {myInstruments.map(ins => <option key={ins.id} value={ins.id}>{ins.category} — {ins.modelNumber} ({ins.id})</option>)}
          </select>

          {!selectedInstrument && (
            <div className="mt-2.5 grid gap-2.5 sm:grid-cols-2">
              {[['manufacturer', t('manufacturer')], ['modelNumber', t('modelNumber')], ['serialNumber', t('serialNumber')], ['capacity', t('capacityRange')], ['location', t('location')]].map(([key, label]) => (
                <div key={key} className={key === 'location' ? 'sm:col-span-2' : ''}>
                  <div className="mb-1 text-sm font-medium text-gray-700">{label}</div>
                  <input value={details[key]} onChange={e => setDetails(d => ({ ...d, [key]: e.target.value }))} className={selectStyle} placeholder={`e.g. ${key === 'location' ? 'Mumbai Central Lab' : key === 'capacity' ? '220 g' : 'Mettler Toledo'}`} />
                </div>
              ))}
            </div>
          )}

          {machineType && (
            <div className="mt-3.5 rounded-md border border-blue-200 bg-blue-100 px-3.5 py-3 text-sm text-blue-800">
              {t('machineType')}: <b className="text-gray-800">{machineType}</b><br />
              {t('feeForType')}<b className="text-blue-900">₹{feeForType}</b>
            </div>
          )}

          <div className="mt-3.5">
            <button onClick={submitApplication} className="cursor-pointer rounded-md bg-blue-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-900">{t('submitApplication')}</button>
          </div>
        </Card>
      )}

      {myApps.length === 0 ? (
        <EmptyState message={t('noAppsMsg')} />
      ) : (
        <Card>
          <Table headers={[t('appId'), t('machineType'), t('submitted'), t('scheduled'), t('payment'), t('status'), '']}>
            {myApps.map(app => (
              <tr key={app.id} className="border-b border-gray-100">
                <td className="px-4 py-3 text-sm font-bold text-gray-800">{app.id}</td>
                <td className="px-4 py-3 text-sm text-gray-700">{app.machineType}</td>
                <td className="px-4 py-3 text-sm text-gray-700">{fmt(app.submissionDate)}</td>
                <td className={`px-4 py-3 text-sm ${app.scheduledDate ? 'text-gray-700' : 'text-gray-400'}`}>{app.scheduledDate ? fmt(app.scheduledDate) : t('notScheduled')}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-bold ${app.paymentStatus === 'PAID' ? 'text-green-800' : 'text-amber-800'}`}>
                    {app.paymentStatus === 'PAID' ? t('paid') : t('pending')}
                  </span>
                </td>
                <td className="px-4 py-3"><StatusBadge status={app.status} /></td>
                <td className="px-4 py-3"><Link to={`/applications/${app.id}`} className="text-sm font-medium text-blue-800 hover:text-blue-900">{t('view')}</Link></td>
              </tr>
            ))}
          </Table>
        </Card>
      )}
    </div>
  );
}

const selectStyle = 'w-full max-w-md rounded-md border border-gray-300 px-3 py-2.5 text-sm text-gray-800 focus:border-blue-700 focus:outline-none';