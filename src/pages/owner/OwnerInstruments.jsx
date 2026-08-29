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

  const inputStyle = { width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: 8, fontSize: 14 };
  const Label = ({ children }) => <div style={{ fontSize: 12, fontWeight: 600, color: '#334155', marginBottom: 4, marginTop: 10 }}>{children}</div>;

  const selectedCategories = form.type ? instrumentCategories.find(c => c.type === form.type)?.categories || [] : [];

  return (
    <div>
      <PageHeader
        title={t('myInstruments')}
        subtitle={t('registerAndManage')}
        action={<button onClick={() => setShowForm(!showForm)} style={addBtn}>{showForm ? t('cancel') : t('addInstrument')}</button>}
      />

      {showForm && (
        <Card style={{ marginBottom: 20 }}>
          <h3 style={{ margin: '0 0 12px', fontSize: 16, color: '#0f172a' }}>{t('registerNewInstrument')}</h3>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div>
                <Label>{t('instrumentType')}</Label>
                <select name="type" value={form.type} onChange={handleTypeChange} style={inputStyle} required>
                  <option value="">{t('selectType')}</option>
                  {instrumentCategories.map(c => <option key={c.type} value={c.type}>{c.type}</option>)}
                </select>
              </div>
              <div>
                <Label>{t('category')}</Label>
                <select name="category" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} style={inputStyle} required disabled={!form.type}>
                  <option value="">{t('selectCategory')}</option>
                  {selectedCategories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div><Label>{t('manufacturer')}</Label><input name="manufacturer" value={form.manufacturer} onChange={e => setForm({ ...form, manufacturer: e.target.value })} style={inputStyle} required /></div>
              <div><Label>{t('modelNumber')}</Label><input name="modelNumber" value={form.modelNumber} onChange={e => setForm({ ...form, modelNumber: e.target.value })} style={inputStyle} required /></div>
              <div><Label>{t('serialNumber')}</Label><input name="serialNumber" value={form.serialNumber} onChange={e => setForm({ ...form, serialNumber: e.target.value })} style={inputStyle} required /></div>
              <div><Label>{t('capacityRange')}</Label><input name="capacity" value={form.capacity} onChange={e => setForm({ ...form, capacity: e.target.value })} style={inputStyle} required placeholder="e.g. 220 g" /></div>
              <div style={{ gridColumn: '1 / -1' }}><Label>{t('location')}</Label><input name="location" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} style={inputStyle} required /></div>
            </div>
            <button style={{ ...addBtn, marginTop: 16 }}>{t('saveInstrument')}</button>
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
              <tr key={ins.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '12px 14px', fontWeight: 700, color: '#0ea5e9' }}>{ins.id}</td>
                <td style={{ padding: '12px 14px' }}>{ins.category}</td>
                <td style={{ padding: '12px 14px', color: '#475569' }}>{ins.manufacturer}</td>
                <td style={{ padding: '12px 14px', color: '#475569' }}>{ins.modelNumber}</td>
                <td style={{ padding: '12px 14px', color: '#475569' }}>{ins.serialNumber}</td>
                <td style={{ padding: '12px 14px', color: '#475569' }}>{ins.capacity}</td>
                <td style={{ padding: '12px 14px', color: '#475569' }}>{ins.location}</td>
                <td style={{ padding: '12px 14px' }}>
                  {cert ? (
                    <Link to={`/certificates/${cert.applicationId}`} title="View certificate QR">
                      <QRCodeSVG value={buildVerifyUrl(cert.id)} size={40} />
                    </Link>
                  ) : (
                    <span style={{ color: '#cbd5e1', fontSize: 12 }}>—</span>
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

const addBtn = {
  background: '#4f46e5', color: '#fff', padding: '10px 18px', borderRadius: 8,
  fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer',
};
