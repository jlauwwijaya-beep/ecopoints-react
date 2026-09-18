import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { adminApi, depositApi, pointApi, masterApi } from '../../api/apiClient';
import AdminNav from '../../components/layout/AdminNav';

// ─── Color palette sesuai design system EcoPoints ──────────────────────────
const COLORS = {
  primary: '#26473A',
  organik: '#7C8A3E',
  anorganik: '#2E6E76',
  b3: '#A6472B',
  poin: '#D6B33D',
  paper: '#F3F1EA',
  border: '#D6D2C6',
  ink: '#1E211C',
  muted: '#8E9189',
};

const PIE_COLORS = ['#26473A', '#7C8A3E', '#2E6E76', '#A6472B', '#D6B33D', '#5A5E55'];

// ─── Helper ─────────────────────────────────────────────────────────────────
function fmtNum(n) {
  return Number(n || 0).toLocaleString('id-ID');
}

function monthLabel(dateStr) {
  return new Date(dateStr + '-01').toLocaleDateString('id-ID', { month: 'short', year: '2-digit' });
}

function monthKey(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

/** Bangun data tren bulanan dari list deposit */
function buildMonthlyTrend(deposits, transactions) {
  const map = {};
  const now = new Date();

  for (let offset = 7; offset >= 0; offset -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - offset, 1);
    const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    map[month] = { month, setoran: 0, kg: 0, poin: 0 };
  }

  deposits.forEach(d => {
    const month = monthKey(d.created_at || d.CreatedAt);
    if (!month || !map[month]) return;
    map[month].setoran += 1;
    map[month].kg += Number(d.weight_kg || 0);
  });

  (transactions || []).forEach(transaction => {
    const month = monthKey(transaction.created_at || transaction.CreatedAt);
    if (month && map[month] && transaction.type === 'credit') {
      map[month].poin += Number(transaction.amount || 0);
    }
  });

  return Object.values(map)
    .sort((a, b) => a.month.localeCompare(b.month))
    .map(d => ({ ...d, label: monthLabel(d.month), kg: +d.kg.toFixed(1) }));
}

/** Bangun data komposisi jenis sampah */
function buildWasteComposition(byWasteType) {
  return (byWasteType || []).map(item => ({
    name: item.waste_type_name || 'Lainnya',
    value: Number(item.total_weight_kg || 0),
    deposits: item.total_deposits || 0,
  }));
}

// ─── Custom Tooltip ──────────────────────────────────────────────────────────
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: COLORS.ink, color: COLORS.paper,
      border: `1px solid ${COLORS.border}`, padding: '10px 14px',
      fontSize: '0.8rem', lineHeight: 1.8, borderRadius: 2,
    }}>
      <div style={{ fontWeight: 700, marginBottom: 4 }}>{label}</div>
      {payload.map(p => (
        <div key={p.dataKey}>
          <span style={{ color: p.color }}>■</span>{' '}
          {p.name}: <strong>{typeof p.value === 'number' ? p.value.toLocaleString('id-ID') : p.value}</strong>
          {p.dataKey === 'kg' ? ' kg' : p.dataKey === 'poin' ? ' poin' : ''}
        </div>
      ))}
    </div>
  );
}

// ─── Stat Card ───────────────────────────────────────────────────────────────
function StatCard({ label, value, suffix, color, delta }) {
  return (
    <div style={{
      background: '#fff', border: `1px solid ${COLORS.border}`,
      padding: '1.25rem 1.5rem', borderTop: `3px solid ${color || COLORS.primary}`,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ fontSize: '0.7rem', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.07em', color: COLORS.muted }}>
          {label}
        </div>
      </div>
      <div style={{ marginTop: '0.6rem', fontSize: '2rem', fontWeight: 800, lineHeight: 1, color: COLORS.ink }}>
        {value}
        {suffix && <small style={{ fontSize: '0.85rem', fontWeight: 500, color: COLORS.muted, marginLeft: 4 }}>{suffix}</small>}
      </div>
      {delta !== undefined && (
        <div style={{ marginTop: '0.4rem', fontSize: '0.75rem', color: delta >= 0 ? '#26473A' : '#A6472B' }}>
          {delta >= 0 ? '▲' : '▼'} {Math.abs(delta)}% vs bulan lalu
        </div>
      )}
    </div>
  );
}

// ─── Section Heading ─────────────────────────────────────────────────────────
function SectionHeading({ children, sub }) {
  return (
    <div style={{ marginBottom: '1rem' }}>
      <h2 style={{ fontSize: '1rem', fontWeight: 800, color: COLORS.ink }}>{children}</h2>
      {sub && <p style={{ fontSize: '0.78rem', color: COLORS.muted, marginTop: 2 }}>{sub}</p>}
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [report, setReport] = useState(null);
  const [monthlyData, setMonthlyData] = useState([]);
  const [pieData, setPieData] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [reportRes, depositRes, txRes, lbRes] = await Promise.all([
        adminApi.getReportsSummary(),
        depositApi.getAll(),
        pointApi.getTransactions(),
        masterApi.getLeaderboard(),
      ]);

      // Report summary
      let rpt = reportRes.success ? reportRes.data : null;
      const deposits = depositRes.success && Array.isArray(depositRes.data) ? depositRes.data : [];
      const txs = txRes.success && Array.isArray(txRes.data) ? txRes.data : [];

      if (!rpt) {
        // Fallback — hitung manual dari deposit
        const verified = deposits.filter(d => d.status === 'verified');
        const byType = {};
        verified.forEach(d => {
          if (Array.isArray(d.items) && d.items.length > 0) {
            d.items.forEach(it => {
              const id = it.waste_type_id || it.waste_type?.id || 'unknown';
              if (!byType[id]) byType[id] = { waste_type_id: id, waste_type_name: it.waste_type_name || it.waste_type?.name || 'Lainnya', total_weight_kg: 0, total_deposits: 0, total_points: 0 };
              byType[id].total_weight_kg += Number(it.actual_weight_kg || it.weight_kg || 0);
              byType[id].total_deposits += 1;
              byType[id].total_points += Number(it.earned_points || it.points_earned || 0);
            });
          } else {
            const id = d.waste_type?.id || d.waste_type_id || 'unknown';
            if (!byType[id]) byType[id] = { waste_type_id: id, waste_type_name: d.waste_type?.name || d.waste_type_name || 'Lainnya', total_weight_kg: 0, total_deposits: 0, total_points: 0 };
            byType[id].total_weight_kg += Number(d.total_weight_kg || d.weight_kg || 0);
            byType[id].total_deposits += 1;
            byType[id].total_points += Number(d.earned_points || d.points_earned || 0);
          }
        });
        rpt = {
          total_deposits: deposits.length,
          total_weight_kg: verified.reduce((s, d) => s + Number(d.total_weight_kg || d.weight_kg || 0), 0),
          total_points_issued: txs.filter(t => t.type === 'credit').reduce((s, t) => s + Number(t.amount || 0), 0),
          total_points_redeemed: txs.filter(t => t.type === 'debit').reduce((s, t) => s + Number(t.amount || 0), 0),
          by_waste_type: Object.values(byType),
          total_users: 0,
        };
      }

      setReport(rpt);
      setMonthlyData(buildMonthlyTrend(deposits, txs));
      setPieData(buildWasteComposition(rpt.by_waste_type));
      const rawLb = Array.isArray(lbRes.data) ? lbRes.data : [];
      const sortedLb = [...rawLb]
        .sort((a, b) => Number(b.total_kg || 0) - Number(a.total_kg || 0))
        .slice(0, 5)
        .map((entry, idx) => ({ ...entry, rank: idx + 1 }));
      setLeaderboard(sortedLb);
    } catch (e) {
      setError('Gagal memuat data dashboard.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const netPoin = (report?.total_points_issued || 0) - (report?.total_points_redeemed || 0);

  return (
    <>
      <AdminNav />
      <main className="admin-page-content" style={{ backgroundColor: COLORS.paper, minHeight: '100vh', padding: '2rem 0 4rem' }}>
        <div className="container-wide" style={{ padding: '0 1rem' }}>

          {/* Header */}
          <div style={{ marginBottom: '1.75rem', paddingBottom: '1rem', borderBottom: `1px solid ${COLORS.border}` }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: COLORS.muted, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              ADMIN · PANEL KONTROL
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.25rem', color: COLORS.ink }}>
              Dashboard Analytics
            </h1>
          </div>

          {error && (
            <div style={{ padding: '0.75rem', marginBottom: '1.5rem', border: '1px solid #e5a39a', background: '#fff3f1', color: '#a63225', fontSize: '0.875rem' }}>
              {error}
            </div>
          )}

          {loading ? (
            <div style={{ textAlign: 'center', padding: '4rem', color: COLORS.muted, fontFamily: 'var(--font-mono)' }}>
              Memuat data dashboard…
            </div>
          ) : (
            <>
              {/* ── STAT CARDS ─────────────────────────────────────────── */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2.5rem' }}>
                <StatCard label="Total Setoran" value={fmtNum(report?.total_deposits)} color={COLORS.organik} />
                <StatCard label="Berat Terverifikasi" value={Number(report?.total_weight_kg || 0).toFixed(1)} suffix="kg" color={COLORS.anorganik} />
                <StatCard label="Poin Diterbitkan" value={fmtNum(report?.total_points_issued)} color={COLORS.poin} />
                <StatCard label="Poin Ditukar" value={fmtNum(report?.total_points_redeemed)} color={COLORS.b3} />
                <StatCard label="Poin Beredar" value={fmtNum(netPoin)} color={COLORS.primary} />
              </div>

              {/* ── AREA CHART: Tren Bulanan ────────────────────────────── */}
              <div style={{ background: '#fff', border: `1px solid ${COLORS.border}`, padding: '1.5rem', marginBottom: '2rem' }}>
                <SectionHeading sub="Jumlah setoran dan total berat sampah 8 bulan terakhir">
                    Tren Setoran Bulanan
                </SectionHeading>
                {monthlyData.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '3rem', color: COLORS.muted, fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
                    Belum ada data setoran untuk ditampilkan.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={280}>
                    <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="gradSetoran" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.25} />
                          <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0.02} />
                        </linearGradient>
                        <linearGradient id="gradKg" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={COLORS.anorganik} stopOpacity={0.25} />
                          <stop offset="95%" stopColor={COLORS.anorganik} stopOpacity={0.02} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
                      <XAxis dataKey="label" tick={{ fontSize: 11, fontFamily: 'var(--font-mono)' }} />
                      <YAxis tick={{ fontSize: 11, fontFamily: 'var(--font-mono)' }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend wrapperStyle={{ fontSize: '0.8rem' }} />
                      <Area type="monotone" dataKey="setoran" name="Jumlah Setoran" stroke={COLORS.primary} fill="url(#gradSetoran)" strokeWidth={2} dot={{ r: 3 }} />
                      <Area type="monotone" dataKey="kg" name="Berat (kg)" stroke={COLORS.anorganik} fill="url(#gradKg)" strokeWidth={2} dot={{ r: 3 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>

              {/* ── BAR + PIE CHART ────────────────────────────────────── */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>

                {/* Bar Chart: Poin per bulan */}
                <div style={{ background: '#fff', border: `1px solid ${COLORS.border}`, padding: '1.5rem' }}>
                  <SectionHeading sub="Total poin diterbitkan per bulan">
                    Distribusi Poin Bulanan
                  </SectionHeading>
                  {monthlyData.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem', color: COLORS.muted, fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
                      Belum ada data.
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height={240}>
                      <BarChart data={monthlyData} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} vertical={false} />
                        <XAxis dataKey="label" tick={{ fontSize: 10, fontFamily: 'var(--font-mono)' }} />
                        <YAxis tick={{ fontSize: 10, fontFamily: 'var(--font-mono)' }} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="poin" name="Poin Diterbitkan" fill={COLORS.poin} radius={[3, 3, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>

                {/* Pie Chart: Komposisi jenis sampah */}
                <div style={{ background: '#fff', border: `1px solid ${COLORS.border}`, padding: '1.5rem' }}>
                  <SectionHeading sub="Proporsi berat sampah berdasarkan jenis">
                    Komposisi Jenis Sampah
                  </SectionHeading>
                  {pieData.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem', color: COLORS.muted, fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
                      Belum ada data.
                    </div>
                  ) : (
                    <>
                      <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                          <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={55}
                            outerRadius={85}
                            paddingAngle={3}
                            dataKey="value"
                          >
                            {pieData.map((entry, i) => (
                              <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(val) => [`${Number(val).toFixed(1)} kg`, 'Berat']} />
                        </PieChart>
                      </ResponsiveContainer>
                      {/* Legend manual */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginTop: '0.75rem' }}>
                        {pieData.map((item, i) => (
                          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.78rem' }}>
                            <span style={{ width: 10, height: 10, borderRadius: '50%', background: PIE_COLORS[i % PIE_COLORS.length], flexShrink: 0 }} />
                            <span style={{ flex: 1, color: COLORS.ink }}>{item.name}</span>
                            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{item.value.toFixed(1)} kg</span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* ── LEADERBOARD TABLE ──────────────────────────────────── */}
              <div style={{ background: '#fff', border: `1px solid ${COLORS.border}`, padding: '1.5rem', marginBottom: '2rem' }}>
                <SectionHeading sub="Top 5 nasabah berdasarkan total berat (kg) sampah yang telah disetorkan">
                  Top Nasabah (Setoran Sampah Terbanyak)
                </SectionHeading>
                {leaderboard.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '2rem', color: COLORS.muted, fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
                    Data leaderboard belum tersedia.
                  </div>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <table className="data-table" style={{ width: '100%' }}>
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Nasabah</th>
                          <th>Total Setor (kg)</th>
                          <th>Saldo Poin</th>
                        </tr>
                      </thead>
                      <tbody>
                        {leaderboard.map((entry, i) => {
                          return (
                            <tr key={entry.user_id}>
                              <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                                #{entry.rank || i + 1}
                              </td>
                              <td>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                  <div style={{
                                    width: 32, height: 32, borderRadius: '50%',
                                    background: COLORS.primary, color: '#fff',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '0.78rem', fontWeight: 700, flexShrink: 0,
                                  }}>
                                    {(entry.name || 'U').charAt(0).toUpperCase()}
                                  </div>
                                  <span style={{ fontWeight: 600 }}>{entry.name || `User #${entry.user_id}`}</span>
                                </div>
                              </td>
                              <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: COLORS.primary }}>
                                {Number(entry.total_kg || 0).toFixed(1)} kg
                              </td>
                              <td style={{ fontFamily: 'var(--font-mono)' }}>
                                {fmtNum(entry.points_balance)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* ── QUICK LINKS ───────────────────────────────────────── */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                {[
                  { label: 'Kelola Setoran', path: '/admin/deposits', desc: 'Verifikasi & pantau setoran nasabah' },
                  { label: 'Katalog Hadiah', path: '/admin/rewards', desc: 'Tambah atau edit hadiah penukaran' },
                  { label: 'Konfigurasi Poin', path: '/admin/points', desc: 'Atur nilai poin per jenis sampah' },
                  { label: 'Manajemen Akun', path: '/admin/users', desc: 'Kelola data nasabah & petugas' },
                ].map(item => (
                  <Link key={item.path} to={item.path} style={{
                    display: 'block', background: '#fff',
                    border: `1px solid ${COLORS.border}`,
                    padding: '1rem 1.25rem',
                    transition: 'border-color 0.15s, box-shadow 0.15s',
                    textDecoration: 'none',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = COLORS.primary; e.currentTarget.style.boxShadow = '3px 3px 0 rgba(38,71,58,0.12)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = COLORS.border; e.currentTarget.style.boxShadow = 'none'; }}
                  >
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: COLORS.ink }}>{item.label}</div>
                    <div style={{ fontSize: '0.76rem', color: COLORS.muted, marginTop: 4 }}>{item.desc}</div>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      </main>
    </>
  );
}
