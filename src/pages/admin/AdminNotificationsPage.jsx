import React, { useState, useEffect } from 'react';
import AdminNav from '../../components/layout/AdminNav';
import { adminApi } from '../../api/apiClient';

const TEMPLATES = [
  {
    label: '🎉 Bonus Poin Dobel',
    title: 'Bonus Dobel Poin Hari Ini! ⭐',
    body: 'Setor sampah anorganikmu hari ini di drop point terdekat dan dapatkan 2x lipat EcoPoints!'
  },
  {
    label: '♻️ Pengingat Setor',
    title: 'Yuk Pilah & Setor Sampahmu! 🌿',
    body: 'Sampah daur ulang di rumah sudah menumpuk? Tukarkan jadi saldo poin sekarang juga.'
  },
  {
    label: '🎁 Hadiah Baru',
    title: 'Katalog Hadiah Baru Tersedia! 🛍️',
    body: 'Voucher belanja dan pulsa baru baru saja ditambahkan. Yuk tukarkan EcoPoints kamu!'
  },
  {
    label: '📢 Info Drop Point',
    title: 'Drop Point EcoPoints Buka Hari Ini 🕒',
    body: 'Petugas siap melayani penimbangan sampah Anda mulai pukul 08.00 - 16.00 WIB.'
  }
];

export default function AdminNotificationsPage() {
  const [target, setTarget] = useState('all'); // 'all' | 'user'
  const [userId, setUserId] = useState('');
  const [users, setUsers] = useState([]);
  const [title, setTitle] = useState('Pemberitahuan EcoPoints 🌿');
  const [body, setBody] = useState('Halo nasabah setia EcoPoints! Jangan lupa pilah sampahmu hari ini.');
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [sending, setSending] = useState(false);
  const [feedback, setFeedback] = useState(null); // { type: 'success'|'error', message }
  const [history, setHistory] = useState(() => {
    try {
      const saved = localStorage.getItem('ep_admin_notif_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    const fetchUsers = async () => {
      setLoadingUsers(true);
      const res = await adminApi.getUsers();
      if (res.success && Array.isArray(res.data)) {
        const nasabahOnly = res.data.filter(u => u.role === 'nasabah' || u.role === 'user');
        setUsers(nasabahOnly.length > 0 ? nasabahOnly : res.data);
        if (nasabahOnly.length > 0) {
          setUserId(String(nasabahOnly[0].id));
        }
      }
      setLoadingUsers(false);
    };
    fetchUsers();
  }, []);

  const handleApplyTemplate = (tpl) => {
    setTitle(tpl.title);
    setBody(tpl.body);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) {
      setFeedback({ type: 'error', message: 'Judul dan isi notifikasi tidak boleh kosong.' });
      return;
    }

    if (target === 'user' && !userId) {
      setFeedback({ type: 'error', message: 'Pilih nasabah tujuan terlebih dahulu.' });
      return;
    }

    setSending(true);
    setFeedback(null);

    const payload = {
      target,
      title: title.trim(),
      body: body.trim(),
      ...(target === 'user' ? { user_id: Number(userId) } : {})
    };

    const res = await adminApi.sendNotification(payload);

    if (res.success) {
      const targetLabel = target === 'all'
        ? 'Semua Perangkat Nasabah (Broadcast)'
        : (users.find(u => String(u.id) === String(userId))?.name || `User #${userId}`);

      const newLog = {
        id: Date.now(),
        time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
        title,
        body,
        target: targetLabel,
        status: 'Sent'
      };

      const updatedHistory = [newLog, ...history].slice(0, 10);
      setHistory(updatedHistory);
      localStorage.setItem('ep_admin_notif_history', JSON.stringify(updatedHistory));

      setFeedback({
        type: 'success',
        message: res.message || 'Push notifikasi berhasil dikirim ke smartphone nasabah!'
      });
    } else {
      setFeedback({
        type: 'error',
        message: res.error || 'Gagal mengirim notifikasi. Pastikan Firebase Credentials server aktif.'
      });
    }

    setSending(false);
  };

  const selectedUserObj = users.find(u => String(u.id) === String(userId));

  return (
    <>
      <AdminNav />
      <main className="container-wide admin-page-content" style={{ padding: '2rem 1rem' }}>
        {/* Header */}
        <div style={{ marginBottom: '1.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <div style={{
              width: 40, height: 40,
              background: 'var(--color-primary)', color: 'var(--color-paper)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 800, fontSize: '0.75rem', fontFamily: 'var(--font-mono)'
            }}>FCM</div>
            <div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em' }}>Push Notifikasi</h1>
              <p className="text-faint font-mono" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Kirim pesan langsung ke smartphone nasabah via Firebase Cloud Messaging
              </p>
            </div>
          </div>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div style={{
            padding: '1rem',
            marginBottom: '1.5rem',
            border: feedback.type === 'success' ? '1px solid #7cb992' : '1px solid #e5a39a',
            background: feedback.type === 'success' ? '#edf8f1' : '#fff3f1',
            color: feedback.type === 'success' ? '#1b5e20' : '#a63225',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div>
              <strong>{feedback.type === 'success' ? '✅ Berhasil!' : '❌ Gagal!'}</strong> {feedback.message}
            </div>
            <button
              onClick={() => setFeedback(null)}
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontWeight: 700 }}
            >✕</button>
          </div>
        )}

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '2rem',
          alignItems: 'start'
        }}>
          {/* Form Kirim Notifikasi */}
          <div className="card" style={{ padding: '1.5rem', background: 'var(--color-surface)' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.25rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>
              Buat Pesan Notifikasi
            </h2>

            {/* Template Cepat */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label className="font-mono text-faint" style={{ fontSize: '0.75rem', textTransform: 'uppercase', display: 'block', marginBottom: '0.4rem' }}>
                Template Cepat:
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {TEMPLATES.map((tpl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleApplyTemplate(tpl)}
                    className="btn btn-sm btn-secondary"
                    style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}
                  >
                    {tpl.label}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleSend}>
              {/* Target Selector */}
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label">Target Pengiriman</label>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.25rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="target"
                      value="all"
                      checked={target === 'all'}
                      onChange={() => setTarget('all')}
                    />
                    <span>Broadcast (Semua Nasabah)</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="target"
                      value="user"
                      checked={target === 'user'}
                      onChange={() => setTarget('user')}
                    />
                    <span>Nasabah Tertentu</span>
                  </label>
                </div>
              </div>

              {/* Specific User Dropdown */}
              {target === 'user' && (
                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label className="form-label">Pilih Nasabah Tujuan</label>
                  <select
                    className="form-input"
                    value={userId}
                    onChange={e => setUserId(e.target.value)}
                    disabled={loadingUsers}
                    required
                  >
                    {users.map(u => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.email}) - {u.role.toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Judul Notifikasi */}
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label">Judul Notifikasi</label>
                <input
                  type="text"
                  className="form-input"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Contoh: Poin Berhasil Ditambahkan"
                  maxLength={60}
                  required
                />
                <span className="font-mono text-faint" style={{ fontSize: '0.7rem', display: 'block', marginTop: '0.2rem', textAlign: 'right' }}>
                  {title.length}/60 karakter
                </span>
              </div>

              {/* Pesan Notifikasi */}
              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label className="form-label">Isi Pesan Notifikasi</label>
                <textarea
                  className="form-textarea"
                  value={body}
                  onChange={e => setBody(e.target.value)}
                  rows={3}
                  placeholder="Tulis pesan lengkap yang akan muncul di layar HP nasabah..."
                  maxLength={180}
                  required
                />
                <span className="font-mono text-faint" style={{ fontSize: '0.7rem', display: 'block', marginTop: '0.2rem', textAlign: 'right' }}>
                  {body.length}/180 karakter
                </span>
              </div>

              {/* Tombol Submit */}
              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', padding: '0.75rem', fontWeight: 800, fontSize: '0.9rem' }}
                disabled={sending}
              >
                {sending ? 'Mengirim ke Firebase FCM...' : '🚀 Kirim Push Notifikasi'}
              </button>
            </form>
          </div>

          {/* Live Mobile Device Preview */}
          <div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.25rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>
              Pratinjau Smartphone (Live Preview)
            </h2>

            {/* Phone Frame */}
            <div style={{
              maxWidth: 340,
              margin: '0 auto',
              background: '#121212',
              borderRadius: 36,
              padding: '16px 12px 24px 12px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.35)',
              border: '4px solid #2a2a2a',
              position: 'relative'
            }}>
              {/* Phone Speaker & Notch */}
              <div style={{
                width: 100, height: 18,
                background: '#000',
                borderRadius: 12,
                margin: '0 auto 16px auto',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#1a1a1a', marginRight: 8 }}></div>
                <div style={{ width: 40, height: 4, borderRadius: 2, background: '#222' }}></div>
              </div>

              {/* Lockscreen Time */}
              <div style={{ textAlign: 'center', color: '#fff', marginBottom: 20 }}>
                <div style={{ fontSize: '2.5rem', fontWeight: 700, lineHeight: 1 }}>14:30</div>
                <div style={{ fontSize: '0.8rem', color: '#aaa', marginTop: 4 }}>Rabu, 16 September</div>
              </div>

              {/* Push Notification Card */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.92)',
                borderRadius: 18,
                padding: '12px 14px',
                color: '#1a1a1a',
                boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
                animation: 'fadeIn 0.3s ease'
              }}>
                {/* Notif Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{
                      width: 20, height: 20,
                      borderRadius: 6,
                      background: 'var(--color-primary)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#fff', fontSize: '0.65rem', fontWeight: 900
                    }}>🌱</div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#333' }}>EcoPoints</span>
                  </div>
                  <span style={{ fontSize: '0.7rem', color: '#888' }}>Baru saja</span>
                </div>

                {/* Notif Content */}
                <div style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: 2, color: '#111' }}>
                  {title || 'Judul Notifikasi'}
                </div>
                <div style={{ fontSize: '0.78rem', color: '#444', lineHeight: 1.35 }}>
                  {body || 'Isi pesan notifikasi akan tampil di sini...'}
                </div>

                {target === 'user' && selectedUserObj && (
                  <div style={{ marginTop: 6, paddingTop: 4, borderTop: '1px dashed #ddd', fontSize: '0.7rem', color: '#777' }}>
                    Penerima: <strong>{selectedUserObj.name}</strong>
                  </div>
                )}
              </div>

              {/* Bottom Nav Bar */}
              <div style={{
                width: 110, height: 4,
                background: '#555',
                borderRadius: 2,
                margin: '36px auto 0 auto'
              }}></div>
            </div>

            {/* Riwayat Pengiriman Terakhir */}
            {history.length > 0 && (
              <div className="card" style={{ marginTop: '1.5rem', padding: '1rem', background: 'var(--color-surface)' }}>
                <h3 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.75rem', textTransform: 'uppercase', color: 'var(--color-ink-faint)' }}>
                  Log Terkirim Sesi Ini
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {history.map(item => (
                    <div key={item.id} style={{
                      padding: '0.6rem 0.75rem',
                      border: '1px solid var(--color-border)',
                      background: '#fff',
                      fontSize: '0.75rem'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                        <strong>{item.title}</strong>
                        <span className="font-mono text-faint">{item.date}, {item.time}</span>
                      </div>
                      <div className="text-faint" style={{ marginBottom: 2 }}>{item.body}</div>
                      <div className="font-mono" style={{ fontSize: '0.7rem', color: 'var(--color-primary)' }}>
                        Target: {item.target}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
