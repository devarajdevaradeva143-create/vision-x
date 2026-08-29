import { useState } from 'react';
import { PageHeader, Card, Table, Alert } from '../../components/ui';
import { QRCodeSVG } from 'qrcode.react';
import { getMachineTypes, saveMachineTypes, getOnlineCatalog, saveOnlineCatalog } from '../../data/machineTypes';

// ---------------------------------------------------------------------------
// Admin QR Management
// ---------------------------------------------------------------------------
// Lets an Administrator create / edit:
//   - Machine Type
//   - Verification Fee
//   - Payment QR Code (stored as the QR text value)
//
// The Owner Registration form reads this saved data, so the fee and QR shown
// to the owner always match what the Admin has configured here.
// ---------------------------------------------------------------------------

const input = { width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: 8, fontSize: 14 };
const Label = ({ children }) => <div style={{ fontSize: 12, fontWeight: 600, color: '#334155', marginBottom: 4, marginTop: 10 }}>{children}</div>;
const addBtn = { background: '#4f46e5', color: '#fff', padding: '10px 18px', borderRadius: 8, fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer' };
const miniBtn = { background: '#f1f5f9', color: '#334155', border: '1px solid #e2e8f0', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer', padding: '4px 10px' };
const dangerBtn = { ...miniBtn, color: '#ef4444' };

export default function AdminQR() {
  // Load saved machine types and online catalogue once on mount.
  const [types, setTypes] = useState(getMachineTypes);
  const [catalog, setCatalog] = useState(getOnlineCatalog);
  const [msg, setMsg] = useState(null);
  const [form, setForm] = useState({ name: '', fee: '', qrValue: '' });
  const [editId, setEditId] = useState(null);
  const [catForm, setCatForm] = useState({ name: '', manufacturer: '', model: '', capacity: '', serialNumber: '', type: '' });
  const [showAdd, setShowAdd] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    if (!form.name || !form.fee) return setMsg({ type: 'error', text: 'Machine Type and Fee are required.' });

    if (editId) {
      // Update the existing machine type.
      const updated = types.map((m) => m.id === editId ? { ...m, name: form.name, fee: Number(form.fee), qrValue: form.qrValue || m.qrValue } : m);
      saveMachineTypes(updated);
      setTypes(updated);
      setMsg({ type: 'success', text: `Machine type "${form.name}" updated.` });
    } else {
      // Create a new machine type with its own unique QR value.
      const newType = {
        id: `MT${String(types.length + 1).padStart(3, '0')}`,
        name: form.name,
        fee: Number(form.fee),
        qrValue: form.qrValue || `LMPAY:${form.name.toUpperCase().replace(/\s+/g, '-')}:${form.fee}`,
      };
      const updated = [...types, newType];
      saveMachineTypes(updated);
      setTypes(updated);
      setMsg({ type: 'success', text: `Machine type "${form.name}" created.` });
    }

    setShowAdd(false);
    setEditId(null);
    setForm({ name: '', fee: '', qrValue: '' });
  };

  const startEdit = (m) => {
    setShowAdd(true);
    setEditId(m.id);
    setForm({ name: m.name, fee: String(m.fee), qrValue: m.qrValue });
  };

  const handleDelete = (m) => {
    const updated = types.filter((t) => t.id !== m.id);
    saveMachineTypes(updated);
    setTypes(updated);
    setMsg({ type: 'success', text: `Machine type "${m.name}" deleted.` });
  };

  const handleAddMachine = (e) => {
    e.preventDefault();
    const newMachine = {
      id: `WM-${String(catalog.length + 1001)}`,
      ...catForm,
      type: catForm.type || 'Other',
    };
    const updated = [...catalog, newMachine];
    saveOnlineCatalog(updated);
    setCatalog(updated);
    setCatForm({ name: '', manufacturer: '', model: '', capacity: '', serialNumber: '', type: '' });
    setMsg({ type: 'success', text: `Online machine "${newMachine.id}" added to catalogue.` });
  };

  const handleDeleteMachine = (mc) => {
    const updated = catalog.filter((c) => c.id !== mc.id);
    saveOnlineCatalog(updated);
    setCatalog(updated);
    setMsg({ type: 'success', text: `Online machine "${mc.id}" removed.` });
  };

  return (
    <div>
      <PageHeader
        title="Payment QR & Fees Management"
        subtitle="Configure machine types, verification fees and payment QR codes"
        action={<button onClick={() => { setShowAdd(!showAdd); setEditId(null); setForm({ name: '', fee: '', qrValue: '' }); }} style={addBtn}>{showAdd ? 'Cancel' : '+ Add Machine Type'}</button>}
      />

      {msg && <div style={{ marginBottom: 16 }}><Alert type={msg.type}>{msg.text}</Alert></div>}

      {showAdd && (
        <Card style={{ marginBottom: 20 }}>
          <h3 style={{ margin: '0 0 12px', fontSize: 16, color: '#0f172a' }}>{editId ? 'Edit Machine Type' : 'Add Machine Type'}</h3>
          <form onSubmit={handleSave}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
              <div><Label>Machine Type</Label><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={input} required placeholder="e.g. Platform Weighing Machine" /></div>
              <div><Label>Verification Fee (₹)</Label><input type="number" min="0" value={form.fee} onChange={e => setForm({ ...form, fee: e.target.value })} style={input} required placeholder="e.g. 400" /></div>
              <div><Label>Payment QR Value (optional)</Label><input value={form.qrValue} onChange={e => setForm({ ...form, qrValue: e.target.value })} style={input} placeholder="Unique QR text for this machine" /></div>
            </div>
            <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
              <button style={addBtn}>{editId ? 'Save Changes' : 'Save'}</button>
              {form.qrValue && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <QRCodeSVG value={form.qrValue || ' '} size={80} />
                  <span style={{ fontSize: 12, color: '#64748b' }}>Preview of the QR<br />that will be shown</span>
                </div>
              )}
            </div>
          </form>
        </Card>
      )}

      <Card style={{ marginBottom: 20 }}>
        <h3 style={{ margin: '0 0 12px', fontSize: 16, color: '#0f172a' }}>Machine Types & Payment QR</h3>
        <Table headers={['Machine Type', 'Fee', 'Payment QR', 'Actions']}>
          {types.map((m) => (
            <tr key={m.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
              <td style={{ padding: '12px 14px', fontWeight: 600, color: '#0f172a' }}>{m.name}</td>
              <td style={{ padding: '12px 14px', color: '#475569' }}>₹{m.fee}</td>
              <td style={{ padding: '12px 14px' }}><QRCodeSVG value={m.qrValue || ' '} size={56} /></td>
              <td style={{ padding: '12px 14px' }}>
                <button onClick={() => startEdit(m)} style={miniBtn}>Edit</button>
                {' '}
                <button onClick={() => handleDelete(m)} style={dangerBtn}>Delete</button>
              </td>
            </tr>
          ))}
        </Table>
      </Card>

      <Card>
        <h3 style={{ margin: '0 0 12px', fontSize: 16, color: '#0f172a' }}>Online Weighing Machine Catalogue</h3>
        <p style={{ margin: '0 0 16px', fontSize: 13, color: '#64748b' }}>These machines appear in the searchable list on the Owner Registration form.</p>
        <form onSubmit={handleAddMachine}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
            <div><Label>Name</Label><input value={catForm.name} onChange={e => setCatForm({ ...catForm, name: e.target.value })} style={input} required placeholder="e.g. Retail Weighing Scale" /></div>
            <div><Label>Manufacturer</Label><input value={catForm.manufacturer} onChange={e => setCatForm({ ...catForm, manufacturer: e.target.value })} style={input} placeholder="Manufacturer" /></div>
            <div><Label>Model</Label><input value={catForm.model} onChange={e => setCatForm({ ...catForm, model: e.target.value })} style={input} placeholder="Model" /></div>
            <div><Label>Capacity</Label><input value={catForm.capacity} onChange={e => setCatForm({ ...catForm, capacity: e.target.value })} style={input} placeholder="e.g. 30 kg" /></div>
            <div><Label>Serial Number</Label><input value={catForm.serialNumber} onChange={e => setCatForm({ ...catForm, serialNumber: e.target.value })} style={input} placeholder="Serial No." /></div>
            <div><Label>Machine Type</Label>
              <select value={catForm.type} onChange={e => setCatForm({ ...catForm, type: e.target.value })} style={input}>
                <option value="">Select Machine Type</option>
                {types.map((t) => <option key={t.id} value={t.name}>{t.name}</option>)}
              </select>
            </div>
          </div>
          <button style={{ ...addBtn, marginTop: 16 }}>Add to Catalogue</button>
        </form>

        <Table headers={['Machine ID', 'Name', 'Type', 'Manufacturer', 'Model', 'Capacity', 'Serial No.', 'Actions']}>
          {catalog.map((mc) => (
            <tr key={mc.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
              <td style={{ padding: '12px 14px', fontWeight: 700, color: '#0ea5e9' }}>{mc.id}</td>
              <td style={{ padding: '12px 14px', fontWeight: 600, color: '#0f172a' }}>{mc.name}</td>
              <td style={{ padding: '12px 14px', color: '#475569' }}>{mc.type}</td>
              <td style={{ padding: '12px 14px', color: '#475569' }}>{mc.manufacturer}</td>
              <td style={{ padding: '12px 14px', color: '#475569' }}>{mc.model}</td>
              <td style={{ padding: '12px 14px', color: '#475569' }}>{mc.capacity}</td>
              <td style={{ padding: '12px 14px', color: '#475569' }}>{mc.serialNumber}</td>
              <td style={{ padding: '12px 14px' }}><button onClick={() => handleDeleteMachine(mc)} style={dangerBtn}>Delete</button></td>
            </tr>
          ))}
        </Table>
      </Card>
    </div>
  );
}

