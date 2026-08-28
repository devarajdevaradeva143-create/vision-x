import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PageHeader, Card, Table, Alert } from '../../components/ui';

export default function AdminUsers() {
  const { appUsers, addUser, updateUser, deleteUser } = useApp();
  const [filter, setFilter] = useState('ALL');
  const [showAdd, setShowAdd] = useState(false);
  const [msg, setMsg] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'owner', phone: '', department: '', address: '' });

  const filtered = filter === 'ALL' ? appUsers : appUsers.filter(u => u.role === filter);

  const handleAdd = (e) => {
    e.preventDefault();
    const id = form.role === 'owner' ? `OWN${String(appUsers.filter(u => u.role === 'owner').length + 1).padStart(3, '0')}`
      : form.role === 'officer' ? `OFF${String(appUsers.filter(u => u.role === 'officer').length + 1).padStart(3, '0')}`
      : `ADM${String(appUsers.filter(u => u.role === 'admin').length + 1).padStart(3, '0')}`;
    addUser({ id, ...form });
    setMsg({ type: 'success', text: `${form.role.toUpperCase()} account created (${id}).` });
    setShowAdd(false);
    setForm({ name: '', email: '', password: '', role: 'owner', phone: '', department: '', address: '' });
  };

  const toggleActive = (user) => {
    updateUser(user.id, { active: !user.active });
    setMsg({ type: 'success', text: `${user.name} ${user.active ? 'deactivated' : 'activated'}.` });
  };

  const setRole = (user, role) => {
    updateUser(user.id, { role });
    setMsg({ type: 'success', text: `${user.name} role changed to ${role}.` });
  };

  const input = { width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: 8, fontSize: 14 };
  const Label = ({ children }) => <div style={{ fontSize: 12, fontWeight: 600, color: '#334155', marginBottom: 4, marginTop: 10 }}>{children}</div>;

  return (
    <div>
      <PageHeader
        title="Manage Users"
        subtitle="Owners, Government Officers and Administrators"
        action={<button onClick={() => setShowAdd(!showAdd)} style={addBtn}>{showAdd ? 'Cancel' : '+ Add User'}</button>}
      />

      {msg && <div style={{ marginBottom: 16 }}><Alert type={msg.type}>{msg.text}</Alert></div>}

      {showAdd && (
        <Card style={{ marginBottom: 20 }}>
          <h3 style={{ margin: '0 0 12px', fontSize: 16, color: '#0f172a' }}>Add New User</h3>
          <form onSubmit={handleAdd}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
              <div><Label>Full Name</Label><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={input} required /></div>
              <div><Label>Email</Label><input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} style={input} required /></div>
              <div><Label>Password</Label><input value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} style={input} required /></div>
              <div><Label>Role</Label>
                <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} style={input}>
                  <option value="owner">Owner</option>
                  <option value="officer">Officer</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div><Label>Phone</Label><input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} style={input} /></div>
              <div><Label>{form.role === 'owner' ? 'Address' : 'Department'}</Label>
                <input value={form.role === 'owner' ? form.address : form.department} onChange={e => setForm({ ...form, [form.role === 'owner' ? 'address' : 'department']: e.target.value })} style={input} />
              </div>
            </div>
            <button style={{ ...addBtn, marginTop: 16 }}>Create User</button>
          </form>
        </Card>
      )}

      <Card>
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          {['ALL', 'owner', 'officer', 'admin'].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{ padding: '7px 14px', borderRadius: 999, border: '1px solid #cbd5e1', fontSize: 13, fontWeight: 600, cursor: 'pointer', background: filter === f ? '#4f46e5' : '#fff', color: filter === f ? '#fff' : '#475569', textTransform: 'capitalize' }}>{f}</button>
          ))}
        </div>
        <Table headers={['ID', 'Name', 'Email', 'Role', 'Status', 'Actions']}>
          {filtered.map(user => (
            <tr key={user.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
              <td style={{ padding: '12px 14px', fontWeight: 700, color: '#0ea5e9' }}>{user.id}</td>
              <td style={{ padding: '12px 14px', color: '#0f172a', fontWeight: 600 }}>{user.name}<div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 400 }}>{user[user.role === 'owner' ? 'address' : 'department']}</div></td>
              <td style={{ padding: '12px 14px', color: '#475569' }}>{user.email}</td>
              <td style={{ padding: '12px 14px' }}>
                <select value={user.role} onChange={e => setRole(user, e.target.value)} style={{ padding: '5px 8px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 12, textTransform: 'capitalize' }}>
                  <option value="owner">owner</option>
                  <option value="officer">officer</option>
                  <option value="admin">admin</option>
                </select>
              </td>
              <td style={{ padding: '12px 14px' }}>
                <span style={{ fontWeight: 700, color: user.active !== false ? '#22c55e' : '#ef4444', fontSize: 12 }}>{user.active !== false ? 'Active' : 'Inactive'}</span>
              </td>
              <td style={{ padding: '12px 14px' }}>
                <button onClick={() => toggleActive(user)} style={miniBtn}>{user.active !== false ? 'Deactivate' : 'Activate'}</button>
                {' '}
                <button onClick={() => { deleteUser(user.id); setMsg({ type: 'success', text: `${user.name} deleted.` }); }} style={{ ...miniBtn, color: '#ef4444' }}>Delete</button>
              </td>
            </tr>
          ))}
        </Table>
      </Card>
    </div>
  );
}

const addBtn = { background: '#4f46e5', color: '#fff', padding: '10px 18px', borderRadius: 8, fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer' };
const miniBtn = { background: '#f1f5f9', color: '#334155', border: '1px solid #e2e8f0', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer', padding: '4px 10px' };
