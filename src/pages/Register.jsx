import { useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Scale, AlertCircle, CheckCircle2, Search } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { getMachineTypes, getOnlineCatalog, getMachineTypeByName, qrDataFor } from '../data/machineTypes';

// ---------------------------------------------------------------------------
// Owner Registration
// ---------------------------------------------------------------------------
// Flow:
//   Owner Details -> Select Machine Type -> Select/Add Online Weighing Machine
//   -> Automatic Verification Fee -> Automatic matching Payment QR
//   -> Payment Completed -> Register -> Create Owner Account + Verification App
//
// The fee and payment QR are read from the machine type data configured by the
// Admin (see data/machineTypes.js). They are NOT hard-coded here.
// ---------------------------------------------------------------------------

export default function Register() {
  const { register, addInstrument, addApplication } = useApp();
  const navigate = useNavigate();

  // Read the machine type list and online catalogue (from Admin-configured data).
  const machineTypes = useMemo(() => getMachineTypes(), []);
  const onlineCatalog = useMemo(() => getOnlineCatalog(), []);

  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '', password: '', confirm: '' });
  const [machineType, setMachineType] = useState('');   // selected machine type name
  const [searchTerm, setSearchTerm] = useState('');     // online machine search
  const [machine, setMachine] = useState(null);         // selected online machine (or null)
  const [manualMode, setManualMode] = useState(false);  // enter machine details manually
  const [manual, setManual] = useState({ manufacturer: '', model: '', capacity: '', serialNumber: '' });
  const [paymentDone, setPaymentDone] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // Find the selected machine type and its fee / QR data.
  const selectedType = useMemo(() => getMachineTypeByName(machineType), [machineType]);

  // Both the price and QR code must change together when machine type changes,
  // so we derive them from the same selectedType object.
  const verificationFee = selectedType ? selectedType.fee : null;
  const qrValue = selectedType ? qrDataFor(selectedType) : '';

  // Reset machine selection whenever the machine type changes.
  const handleMachineTypeChange = (e) => {
    setMachineType(e.target.value);
    setMachine(null);
    setManualMode(false);
    setPaymentDone(false);
  };

  // Filter the online catalogue by the search term and selected machine type.
  const filteredMachines = onlineCatalog.filter((m) => {
    const matchesType = m.type === machineType;
    const q = searchTerm.toLowerCase();
    const matchesSearch = !q || [m.id, m.name, m.manufacturer, m.model].some((f) => (f || '').toLowerCase().includes(q));
    return matchesType && matchesSearch;
  });

  // Select a machine from the online catalogue; clears manual mode.
  const selectMachine = (m) => {
    setMachine(m);
    setManualMode(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      setError('Passwords do not match');
      setSuccess(null);
      return;
    }
    // Payment must be completed before registering.
    if (!selectedType) {
      setError('Please select an instrument / machine type.');
      setSuccess(null);
      return;
    }
    if (!paymentDone) {
      setError('Please complete the payment before registering.');
      setSuccess(null);
      return;
    }

    const result = register({ name: form.name, email: form.email, phone: form.phone, address: form.address, password: form.password });
    if (!result.success) {
      setError(result.error);
      setSuccess(null);
      return;
    }

    // Create the owner's instrument record using the selected machine details.
    const newInstrument = {
      id: `INS${String(Math.floor(Math.random() * 9000) + 1000)}`,
      ownerId: result.user.id,
      type: 'Weighing',
      category: machineType,
      manufacturer: machine ? machine.manufacturer : manual.manufacturer,
      modelNumber: machine ? machine.model : manual.model,
      serialNumber: machine ? machine.serialNumber : manual.serialNumber,
      capacity: machine ? machine.capacity : manual.capacity,
      location: form.address,
    };
    addInstrument(newInstrument);

    // Create the verification application for the new instrument.
    addApplication({
      id: `APP-2026-${String(Math.floor(Math.random() * 9000) + 1000)}`,
      instrumentId: newInstrument.id,
      ownerId: result.user.id,
      submissionDate: new Date().toISOString().slice(0, 10),
      scheduledDate: null,
      inspectionDate: null,
      status: 'SUBMITTED',
      fee: verificationFee,
      readings: null,
      remarks: null,
    });

    setSuccess('Owner account created and verification application submitted.');
    setTimeout(() => navigate('/dashboard'), 900);
  };

  const inputStyle = { width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: 8, fontSize: 14 };

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: 20 }}>
      <div style={{ width: '100%', maxWidth: 720, background: '#fff', borderRadius: 16, padding: 36, boxShadow: '0 20px 50px rgba(0,0,0,0.3)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <Scale size={32} color="#4f46e5" />
          <div>
            <div style={{ fontWeight: 800, fontSize: 18, color: '#0f172a' }}>Register Owner</div>
            <div style={{ fontSize: 12, color: '#64748b' }}>Create your instrument owner account</div>
          </div>
        </div>

        {error && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '10px', borderRadius: 8, display: 'flex', gap: 8, alignItems: 'center', fontSize: 13, marginBottom: 16 }}><AlertCircle size={16} /> {error}</div>}
        {success && <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#15803d', padding: '10px', borderRadius: 8, display: 'flex', gap: 8, alignItems: 'center', fontSize: 13, marginBottom: 16 }}><CheckCircle2 size={16} /> {success}</div>}

        <form onSubmit={handleSubmit}>
          {/* ------------------- 1. OWNER DETAILS ------------------- */}
          <SectionTitle number="1" title="Owner Details" />

          <Label>Full Name</Label>
          <input name="name" value={form.name} onChange={handleChange} style={inputStyle} required />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <Label>Email</Label>
              <input type="email" name="email" value={form.email} onChange={handleChange} style={inputStyle} required />
            </div>
            <div>
              <Label>Phone</Label>
              <input name="phone" value={form.phone} onChange={handleChange} style={inputStyle} required />
            </div>
          </div>

          <Label>Address</Label>
          <input name="address" value={form.address} onChange={handleChange} style={inputStyle} required />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <Label>Password</Label>
              <input type="password" name="password" value={form.password} onChange={handleChange} style={inputStyle} required />
            </div>
            <div>
              <Label>Confirm Password</Label>
              <input type="password" name="confirm" value={form.confirm} onChange={handleChange} style={inputStyle} required />
            </div>
          </div>

          {/* ------------------- 2. INSTRUMENT DETAILS ------------------- */}
          <SectionTitle number="2" title="Instrument Details" />

          <Label>Instrument / Machine Type</Label>
          <select name="machineType" value={machineType} onChange={handleMachineTypeChange} style={inputStyle} required>
            <option value="">Select Machine Type</option>
            {machineTypes.map((m) => (
              <option key={m.id} value={m.name}>{m.name}</option>
            ))}
          </select>

          {/* ------------------- 3. MACHINE SELECTION ------------------- */}
          {machineType && (
            <>
              <SectionTitle number="3" title="Machine Selection" />

              <div style={{ fontSize: 13, color: '#475569', marginBottom: 4 }}>Add / Select Online Weighing Machine</div>

              {/* Searchable online machine list */}
              {onlineCatalog.some((m) => m.type === machineType) && (
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: 14, marginTop: 8 }}>
                  <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: 10 }}>Online Weighing Machines</div>

                  {/* Search box */}
                  <div style={{ position: 'relative', marginBottom: 10 }}>
                    <Search size={16} style={{ position: 'absolute', left: 10, top: 11, color: '#94a3b8' }} />
                    <input
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search Machine"
                      style={{ ...inputStyle, paddingLeft: 32 }}
                    />
                  </div>

                  {/* Filtered machine cards */}
                  {filteredMachines.length === 0 ? (
                    <div style={{ fontSize: 13, color: '#94a3b8', padding: '10px 0' }}>No matching machines found.</div>
                  ) : (
                    filteredMachines.map((m) => (
                      <div key={m.id} style={{ border: machine?.id === m.id ? '2px solid #4f46e5' : '1px solid #e2e8f0', background: '#fff', borderRadius: 8, padding: 12, marginBottom: 8 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <div style={{ fontWeight: 700, color: '#0f172a', fontSize: 14 }}>{m.name}</div>
                            <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
                              Machine ID: <b>{m.id}</b> · Type: {m.type} · Capacity: {m.capacity}
                            </div>
                            <div style={{ fontSize: 12, color: '#64748b' }}>Manufacturer: {m.manufacturer} · Model: {m.model} · Serial: {m.serialNumber}</div>
                          </div>
                          <button
                            type="button"
                            onClick={() => selectMachine(m)}
                            style={machine?.id === m.id ? selectedBtn : selectBtn}
                          >
                            {machine?.id === m.id ? 'Selected ✓' : 'Select'}
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Manual add option */}
              {!manualMode ? (
                <div style={{ marginTop: 12 }}>
                  <button type="button" onClick={() => { setManualMode(true); setMachine(null); }} style={linkBtn}>
                    + Can't find your machine? Enter details manually
                  </button>
                </div>
              ) : (
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: 14, marginTop: 8 }}>
                  <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: 10 }}>Add Machine Manually</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <div><Label>Manufacturer</Label><input value={manual.manufacturer} onChange={(e) => setManual({ ...manual, manufacturer: e.target.value })} style={inputStyle} placeholder="Manufacturer" /></div>
                    <div><Label>Model</Label><input value={manual.model} onChange={(e) => setManual({ ...manual, model: e.target.value })} style={inputStyle} placeholder="Model" /></div>
                    <div><Label>Capacity</Label><input value={manual.capacity} onChange={(e) => setManual({ ...manual, capacity: e.target.value })} style={inputStyle} placeholder="e.g. 30 kg" /></div>
                    <div><Label>Serial Number</Label><input value={manual.serialNumber} onChange={(e) => setManual({ ...manual, serialNumber: e.target.value })} style={inputStyle} placeholder="Serial No." /></div>
                  </div>
                </div>
              )}

              {/* ------------------- 4. VERIFICATION FEE ------------------- */}
              <SectionTitle number="4" title="Verification Fee" />

              {selectedType ? (
                <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 10, padding: 16 }}>
                  <div style={{ fontSize: 14, color: '#1e40af' }}>Selected Machine: <b style={{ color: '#0f172a' }}>{selectedType.name}</b></div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: '#1d4ed8', marginTop: 8 }}>Verification Fee: ₹{selectedType.fee}</div>
                </div>
              ) : (
                <div style={{ fontSize: 13, color: '#64748b', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: 14 }}>
                  Please select an instrument type to view the verification fee.
                </div>
              )}

              {/* ------------------- 5. PAYMENT ------------------- */}
              {selectedType && (
                <>
                  <SectionTitle number="5" title="Payment" />

                  <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: 20, textAlign: 'center' }}>
                    <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>Verification Payment</div>
                    <div style={{ fontSize: 13, color: '#64748b' }}>
                      Machine Type: <b style={{ color: '#0f172a' }}>{selectedType.name}</b>
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#1d4ed8', marginTop: 6 }}>Verification Fee: ₹{verificationFee}</div>

                    <div style={{ marginTop: 16 }}>Please scan the QR code below to make the payment.</div>

                    {/* Unique QR for the selected machine type */}
                    <div style={{ display: 'inline-block', padding: 10, border: '1px solid #e2e8f0', borderRadius: 10, marginTop: 12, background: '#fff' }}>
                      <QRCodeSVG value={qrValue || ' '} size={160} />
                    </div>

                    <div style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', marginTop: 14 }}>Amount to Pay: ₹{verificationFee}</div>

                    <button
                      type="button"
                      onClick={() => setPaymentDone(true)}
                      style={paymentDone ? paymentDoneBtn : paymentBtn}
                    >
                      {paymentDone ? '✓ Payment Completed' : 'Payment Completed'}
                    </button>
                    {paymentDone && (
                      <div style={{ fontSize: 12, color: '#15803d', marginTop: 8, fontWeight: 600 }}>
                        Payment received. You can now register.
                      </div>
                    )}
                  </div>
                </>
              )}
            </>
          )}

          <button style={{ width: '100%', padding: '12px', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 700, cursor: 'pointer', marginTop: 24 }}>
            Register
          </button>
        </form>

        <div style={{ marginTop: 16, fontSize: 13, textAlign: 'center' }}>
          Already have an account? <Link to="/login" style={{ color: '#0ea5e9', fontWeight: 700 }}>Login</Link>
        </div>
      </div>
    </div>
  );
}

function SectionTitle({ number, title }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '26px 0 6px', paddingBottom: 8, borderBottom: '2px solid #e2e8f0' }}>
      <span style={{ background: '#4f46e5', color: '#fff', borderRadius: 6, width: 24, height: 24, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700 }}>{number}</span>
      <span style={{ fontWeight: 800, color: '#0f172a', fontSize: 16 }}>{title}</span>
    </div>
  );
}

function Label({ children }) {
  return <div style={{ fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6, marginTop: 14 }}>{children}</div>;
}

// Reusable button styles (subtle government-style transitions only).
const selectBtn = {
  background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', borderRadius: 6,
  fontSize: 13, fontWeight: 700, cursor: 'pointer', padding: '8px 16px', transition: 'background 0.15s',
};
const selectedBtn = {
  background: '#4f46e5', color: '#fff', border: 'none', borderRadius: 6,
  fontSize: 13, fontWeight: 700, cursor: 'pointer', padding: '8px 16px',
};
const linkBtn = {
  background: 'none', border: 'none', color: '#0ea5e9', fontWeight: 700, fontSize: 13, cursor: 'pointer', padding: 0,
};
const paymentBtn = {
  width: '100%', maxWidth: 280, marginTop: 14, padding: '12px', background: '#4f46e5',
  color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: 'pointer', transition: 'background 0.15s',
};
const paymentDoneBtn = {
  width: '100%', maxWidth: 280, marginTop: 14, padding: '12px', background: '#22c55e',
  color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: 'pointer',
};
