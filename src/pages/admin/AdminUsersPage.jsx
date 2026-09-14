import React, { useCallback, useEffect, useState } from 'react';
import { adminApi } from '../../api/apiClient';
import AppNav from '../../components/layout/AppNav';

const emptyForm = { name: '', email: '', password: '', role: 'user', points_balance: '' };
const roleLabels = { user: 'User', petugas: 'Petugas', admin: 'Admin' };

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const loadUsers = useCallback(async () => {
    setLoading(true);
    const result = await adminApi.getUsers();
    if (result.success && Array.isArray(result.data)) setUsers(result.data);
    else setError(result.error || 'Data akun tidak dapat dimuat.');
    setLoading(false);
  }, []);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  const resetForm = () => { setEditing(null); setForm(emptyForm); };
  const updateField = (field, value) => setForm(previous => ({ ...previous, [field]: value }));

  const saveUser = async (event) => {
    event.preventDefault();
    setError('');
    setSaving(true);
    const payload = { name: form.name, email: form.email, role: form.role };
    if (editing) payload.points_balance = Math.max(0, Number(form.points_balance || 0));
    if (form.password) payload.password = form.password;
    const result = editing
      ? await adminApi.updateUser(editing.id, payload)
      : await adminApi.createUser({ ...payload, password: form.password });
    setSaving(false);
    if (!result.success) {
      setError(result.error || 'Data akun gagal disimpan.');
      return;
    }
    resetForm();
    await loadUsers();
  };

  const removeUser = async (user) => {
    if (!window.confirm(`Hapus akun ${user.name}? Data akun akan dihapus.`)) return;
    const result = await adminApi.deleteUser(user.id);
    if (!result.success) setError(result.error || 'Akun gagal dihapus.');
    else loadUsers();
  };

  return (
    <>
      <AppNav />
      <main className="container-wide" style={{ padding: '2rem 1rem' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <div className="text-faint font-mono" style={{ fontSize: '0.7rem', textTransform: 'uppercase' }}>PANEL ADMIN // AKUN</div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Manajemen User, Petugas, dan Admin</h1>
          <p className="text-faint">Kelola akses akun dan role operasional EcoPoints.</p>
        </div>
        {error && <div style={{ padding: '0.75rem', marginBottom: '1rem', border: '1px solid #e5a39a', background: '#fff3f1', color: '#a63225' }}>{error}</div>}

        <div className="admin-management-layout" style={{ display: 'grid', gridTemplateColumns: 'minmax(260px, 340px) 1fr', gap: '1.5rem', alignItems: 'start' }}>
          <form className="card" style={{ padding: '1.25rem' }} onSubmit={saveUser}>
            <h2 style={{ fontSize: '1rem', marginBottom: '1rem' }}>{editing ? 'Edit Akun' : 'Tambah Akun'}</h2>
            <div className="form-group"><label className="form-label">Nama</label><input className="form-input" value={form.name} onChange={e => updateField('name', e.target.value)} pattern="[A-Za-z ]+" required /></div>
            <div className="form-group"><label className="form-label">Email</label><input className="form-input" type="email" value={form.email} onChange={e => updateField('email', e.target.value)} required /></div>
            <div className="form-group"><label className="form-label">Password {editing && <span className="text-faint">(kosongkan jika tidak diubah)</span>}</label><input className="form-input" type="password" minLength="8" value={form.password} onChange={e => updateField('password', e.target.value)} required={!editing} /></div>
            <div className="form-group"><label className="form-label">Role</label><select className="form-input" value={form.role} onChange={e => updateField('role', e.target.value)}><option value="user">User</option><option value="petugas">Petugas</option><option value="admin">Admin</option></select></div>
            {editing && <div className="form-group"><label className="form-label">Saldo Poin</label><input className="form-input" type="number" min="0" step="1" value={form.points_balance} onChange={e => updateField('points_balance', e.target.value)} required /></div>}
            <div style={{ display: 'flex', gap: '0.5rem' }}><button className="btn btn-primary" disabled={saving}>{saving ? 'Menyimpan...' : editing ? 'Simpan Perubahan' : 'Tambah Akun'}</button>{editing && <button type="button" className="btn btn-secondary" onClick={resetForm}>Batal</button>}</div>
          </form>

          <div className="data-table-container"><table className="data-table"><thead><tr><th>ID</th><th>Nama</th><th>Email</th><th>Role</th><th>Poin</th><th>Aksi</th></tr></thead><tbody>
            {loading ? <tr><td colSpan="6">Memuat akun...</td></tr> : users.map(user => <tr key={user.id}><td>#{user.id}</td><td><strong>{user.name}</strong></td><td>{user.email}</td><td><span className="badge badge-neutral">{roleLabels[user.role] || user.role}</span></td><td>{Number(user.points_balance || 0).toLocaleString('id-ID')}</td><td><button className="btn btn-sm btn-secondary" onClick={() => { setEditing(user); setForm({ name: user.name, email: user.email, password: '', role: user.role, points_balance: String(user.points_balance || 0) }); }}>Edit</button>{' '}<button className="btn btn-sm btn-danger" onClick={() => removeUser(user)}>Hapus</button></td></tr>)}
            {!loading && !users.length && <tr><td colSpan="6" className="text-faint">Belum ada akun.</td></tr>}
          </tbody></table></div>
        </div>
      </main>
    </>
  );
}
