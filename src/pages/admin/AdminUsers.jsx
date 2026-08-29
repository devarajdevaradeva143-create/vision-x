import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';
import { PageHeader, Card, Table, Alert } from '../../components/ui';

export default function AdminUsers() {
  const { appUsers, addUser, updateUser, deleteUser } = useApp();
  const { t } = useLanguage();
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
    setMsg({ type: 'success', text: t('accountCreatedMsg').replace('{role}', form.role.toUpperCase()).replace('{id}', id) });
    setShowAdd(false);
    setForm({ name: '', email: '', password: '', role: 'owner', phone: '', department: '', address: '' });
  };

  const toggleActive = (user) => {
    updateUser(user.id, { active: !user.active });
    setMsg({ type: 'success', text: user.active ? t('deactivatedMsg').replace('{name}', user.name) : t('activatedMsg').replace('{name}', user.name) });
  };

  const setRole = (user, role) => {
    updateUser(user.id, { role });
    setMsg({ type: 'success', text: t('roleChangedMsg').replace('{name}', user.name).replace('{role}', role) });
  };

  const input = 'w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:border-blue-700 focus:outline-none';
  const Label = ({ children }) => <div className="mb-1 mt-2.5 text-sm font-medium text-gray-700">{children}</div>;

  return (
    <div>
      <PageHeader
        title={t('manageUsers')}
        subtitle={t('manageUsersSub')}
        action={<button onClick={() => setShowAdd(!showAdd)} className="cursor-pointer rounded-md bg-blue-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-900">{showAdd ? t('cancel') : t('addUser')}</button>}
      />

      {msg && <div className="mb-4"><Alert type={msg.type}>{msg.text}</Alert></div>}

      {showAdd && (
        <Card className="mb-5">
          <h3 className="m-0 mb-3 text-base font-bold text-gray-800">{t('addNewUser')}</h3>
          <form onSubmit={handleAdd}>
            <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
              <div><Label>{t('fullName')}</Label><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className={input} required /></div>
              <div><Label>{t('email')}</Label><input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className={input} required /></div>
              <div><Label>{t('password')}</Label><input value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} className={input} required /></div>
              <div><Label>{t('role')}</Label>
                <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} className={input}>
                  <option value="owner">{t('owner')}</option>
                  <option value="officer">{t('officer')}</option>
                  <option value="admin">{t('admin')}</option>
                </select>
              </div>
              <div><Label>{t('phoneField')}</Label><input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className={input} /></div>
              <div><Label>{form.role === 'owner' ? t('address') : t('department')}</Label>
                <input value={form.role === 'owner' ? form.address : form.department} onChange={e => setForm({ ...form, [form.role === 'owner' ? 'address' : 'department']: e.target.value })} className={input} />
              </div>
            </div>
            <button className="mt-4 cursor-pointer rounded-md bg-blue-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-900">{t('createUser')}</button>
          </form>
        </Card>
      )}

      <Card>
        <div className="mb-4 flex flex-wrap gap-2">
          {['ALL', 'owner', 'officer', 'admin'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={
                filter === f
                  ? 'cursor-pointer rounded-md bg-blue-800 px-3.5 py-2 text-xs font-semibold text-white hover:bg-blue-900'
                  : 'cursor-pointer rounded-md border border-gray-300 bg-white px-3.5 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100'
              }
            >{f === 'ALL' ? t('filterAll') : f}</button>
          ))}
        </div>
        <Table headers={[t('tableId'), t('nameTable'), t('email'), t('roleTable'), t('statusTableUser'), t('actions')]}>
          {filtered.map(user => (
            <tr key={user.id} className="border-b border-gray-100">
              <td className="px-4 py-3 text-sm font-bold text-blue-800">{user.id}</td>
              <td className="px-4 py-3 text-sm font-medium text-gray-800">{user.name}<div className="text-xs font-normal text-gray-500">{user[user.role === 'owner' ? 'address' : 'department']}</div></td>
              <td className="px-4 py-3 text-sm text-gray-700">{user.email}</td>
              <td className="px-4 py-3">
                <select value={user.role} onChange={e => setRole(user, e.target.value)} className="rounded-md border border-gray-300 px-2 py-1.5 text-xs text-gray-700 focus:border-blue-700 focus:outline-none">
                  <option value="owner">owner</option>
                  <option value="officer">officer</option>
                  <option value="admin">admin</option>
                </select>
              </td>
              <td className="px-4 py-3">
                <span className={`text-xs font-bold ${user.active !== false ? 'text-green-800' : 'text-red-800'}`}>{user.active !== false ? t('active') : t('inactive')}</span>
              </td>
              <td className="px-4 py-3">
                <button onClick={() => toggleActive(user)} className="cursor-pointer rounded-md border border-gray-300 bg-white px-2.5 py-1 text-xs font-medium text-gray-700 hover:bg-gray-100">{user.active !== false ? t('deactivate') : t('activate')}</button>
                {' '}
                <button onClick={() => { deleteUser(user.id); setMsg({ type: 'success', text: t('deletedMsg').replace('{name}', user.name) }); }} className="cursor-pointer rounded-md border border-gray-300 bg-white px-2.5 py-1 text-xs font-medium text-red-700 hover:bg-red-50">{t('delete')}</button>
              </td>
            </tr>
          ))}
        </Table>
      </Card>
    </div>
  );
}