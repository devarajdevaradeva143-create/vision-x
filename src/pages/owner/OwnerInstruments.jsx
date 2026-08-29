import { useState } from 'react';
import { Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';
import { PageHeader, Card, Table, EmptyState } from '../../components/ui';
import { instrumentCategories } from '../../data/mockData';
import { buildVerifyUrl } from '../../utils/verifyUrl';

export default function OwnerInstruments() {
  const { currentUser, appInstruments, addInstrument, appCertificates } = useApp();
  const { t } = useLanguage();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ type: '', category: '', manufacturer: '', modelNumber: '', serialNumber: '', capacity: '', location: '' });

  const myInstruments = appInstruments.filter(i => i.ownerId === currentUser.id);

  const handleTypeChange = (e) => {
    setForm({ ...form, type: e.target.value, category: '' });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    addInstrument({
      id: `INS${String(appInstruments.length + 1).padStart(3, '0')}`,
      ownerId: currentUser.id,
      ...form,
    });
    setShowForm(false);
    setForm({ type: '', category: '', manufacturer: '', modelNumber: '', serialNumber: '', capacity: '', location: '' });
  };

  const inputStyle = 'w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:border-blue-700 focus:outline-none';
  const Label = ({ children }) => <div className="mb-1 mt-2.5 text-sm font-medium text-gray-700">{children}</div>;

  const selectedCategories = form.type ? instrumentCategories.find(c => c.type === form.type)?.categories || [] : [];

  return (
    <div>
      <PageHeader
        title={t('myInstruments')}
        subtitle={t('registerAndManage')}
        action={<button onClick={() => setShowForm(!showForm)} className="cursor-pointer rounded-md bg-blue-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-900">{showForm ? t('cancel') : t('addInstrument')}</button>}
      />

      {showForm && (
        <Card className="mb-5">
          <h3 className="m-0 mb-3 text-base font-bold text-gray-800">{t('registerNewInstrument')}</h3>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-3.5 sm:grid-cols-2">
              <div>
                <Label>{t('instrumentType')}</Label>
                <select name="type" value={form.type} onChange={handleTypeChange} className={inputStyle} required>
                  <option value="">{t('selectType')}</option>
                  {instrumentCategories.map(c => <option key={c.type} value={c.type}>{c.type}</option>)}
                </select>
              </div>
              <div>
                <Label>{t('category')}</Label>
                <select name="category" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className={inputStyle} required disabled={!form.type}>
                  <option value="">{t('selectCategory')}</option>
                  {selectedCategories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div><Label>{t('manufacturer')}</Label><input name="manufacturer" value={form.manufacturer} onChange={e => setForm({ ...form, manufacturer: e.target.value })} className={inputStyle} required /></div>
              <div><Label>{t('modelNumber')}</Label><input name="modelNumber" value={form.modelNumber} onChange={e => setForm({ ...form, modelNumber: e.target.value })} className={inputStyle} required /></div>
              <div><Label>{t('serialNumber')}</Label><input name="serialNumber" value={form.serialNumber} onChange={e => setForm({ ...form, serialNumber: e.target.value })} className={inputStyle} required /></div>
              <div><Label>{t('capacityRange')}</Label><input name="capacity" value={form.capacity} onChange={e => setForm({ ...form, capacity: e.target.value })} className={inputStyle} required placeholder="e.g. 220 g" /></div>
              <div className="sm:col-span-2"><Label>{t('location')}</Label><input name="location" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} className={inputStyle} required /></div>
            </div>
            <button className="mt-4 cursor-pointer rounded-md bg-blue-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-900">{t('saveInstrument')}</button>
          </form>
        </Card>
      )}

      {myInstruments.length === 0 ? (
        <EmptyState message={t('noInstrumentsMsg')} />
      ) : (
        <Card>
          <Table headers={[t('tableId'), t('category'), t('manufacturer'), t('modelNumber'), t('serialNo'), t('capacityRange'), t('location'), t('qr')]}>
            {myInstruments.map(ins => {
              const cert = appCertificates.find(c => c.instrumentId === ins.id);
              return (
              <tr key={ins.id} className="border-b border-gray-100">
                <td className="px-4 py-3 text-sm font-bold text-blue-800">{ins.id}</td>
                <td className="px-4 py-3 text-sm text-gray-800">{ins.category}</td>
                <td className="px-4 py-3 text-sm text-gray-700">{ins.manufacturer}</td>
                <td className="px-4 py-3 text-sm text-gray-700">{ins.modelNumber}</td>
                <td className="px-4 py-3 text-sm text-gray-700">{ins.serialNumber}</td>
                <td className="px-4 py-3 text-sm text-gray-700">{ins.capacity}</td>
                <td className="px-4 py-3 text-sm text-gray-700">{ins.location}</td>
                <td className="px-4 py-3">
                  {cert ? (
                    <Link to={`/certificates/${cert.applicationId}`} title="View certificate QR">
                      <QRCodeSVG value={buildVerifyUrl(cert.id)} size={40} />
                    </Link>
                  ) : (
                    <span className="text-xs text-gray-300">—</span>
                  )}
                </td>
              </tr>
              );
            })}
          </Table>
        </Card>
      )}
    </div>
  );
}