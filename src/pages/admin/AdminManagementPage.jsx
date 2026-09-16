import React, { useCallback, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  adminApi,
  depositApi,
  masterApi,
  pointApi,
  rewardApi,
  resolveApiAssetUrl,
} from "../../api/apiClient";
import AdminNav from "../../components/layout/AdminNav";

const sectionMeta = {
  overview: {
    title: "Panel Admin",
    subtitle: "Kontrol operasional EcoPoints dalam satu tempat.",
  },
  points: {
    title: "Konfigurasi Poin",
    subtitle: "Atur nilai rupiah dan poin untuk setiap jenis sampah.",
  },
  rewards: {
    title: "Manajemen Katalog Hadiah",
    subtitle: "Kelola hadiah yang tersedia untuk penukaran nasabah.",
  },
  redemptions: {
    title: "Pantau Penukaran",
    subtitle: "Periksa dan proses permintaan penukaran hadiah.",
  },
  reports: {
    title: "Laporan",
    subtitle: "Pantau ringkasan dampak dan aktivitas EcoPoints.",
  },
};

function formatDate(value) {
  return value
    ? new Date(value).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "-";
}

function buildReportFallback(deposits, transactions) {
  const verified = deposits.filter((item) => item.status === "verified");
  const byType = verified.reduce((groups, item) => {
    const id = item.waste_type?.id || item.waste_type_id || "unknown";
    const current = groups[id] || {
      waste_type_id: id,
      waste_type_name: item.waste_type?.name || "Jenis sampah",
      total_weight_kg: 0,
      total_deposits: 0,
      total_points: 0,
    };
    current.total_weight_kg += Number(item.weight_kg || 0);
    current.total_deposits += 1;
    current.total_points += Number(item.points_earned || 0);
    groups[id] = current;
    return groups;
  }, {});

  return {
    total_weight_kg: verified.reduce(
      (total, item) => total + Number(item.weight_kg || 0),
      0,
    ),
    total_users: 0,
    total_deposits: deposits.length,
    total_points_issued: transactions
      .filter((item) => item.type === "credit")
      .reduce((total, item) => total + Number(item.amount || 0), 0),
    total_points_redeemed: transactions
      .filter((item) => item.type === "debit")
      .reduce((total, item) => total + Number(item.amount || 0), 0),
    by_waste_type: Object.values(byType),
    by_drop_point: [],
  };
}

function Stat({ label, value, suffix = "" }) {
  return (
    <div className="card" style={{ padding: "1.25rem" }}>
      <div
        className="text-faint font-mono"
        style={{ fontSize: "0.7rem", textTransform: "uppercase" }}
      >
        {label}
      </div>
      <div style={{ fontSize: "1.8rem", fontWeight: 800, marginTop: "0.5rem" }}>
        {value}
        {suffix && (
          <small
            className="text-muted"
            style={{ fontSize: "0.8rem", marginLeft: "0.25rem" }}
          >
            {suffix}
          </small>
        )}
      </div>
    </div>
  );
}

function ErrorMessage({ message }) {
  return message ? (
    <div
      style={{
        padding: "0.75rem",
        marginBottom: "1rem",
        border: "1px solid #e5a39a",
        background: "#fff3f1",
        color: "#a63225",
      }}
    >
      {message}
    </div>
  ) : null;
}

export default function AdminManagementPage({ section = "overview" }) {
  const { pathname } = useLocation();
  const [data, setData] = useState([]);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [statusLoading, setStatusLoading] = useState(null);
  const [form, setForm] = useState({
    name: "",
    category: "Voucher",
    point_cost: "",
    stock: "",
    unit_price_per_kg: "",
    points_per_kg: "",
    description: "",
    image: "",
  });
  const [imageFile, setImageFile] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    let result;
    if (section === "points") result = await masterApi.getWasteTypes();
    if (section === "rewards") result = await rewardApi.getAll();
    if (section === "redemptions") result = await adminApi.getRedemptions();
    if (section === "reports" || section === "overview")
      result = await adminApi.getReportsSummary();
    if (result?.success) {
      if (section === "reports" || section === "overview")
        setReport(result.data || {});
      else setData(Array.isArray(result.data) ? result.data : []);
    } else if (
      result &&
      (section === "reports" || section === "overview") &&
      result.status === 404
    ) {
      const [depositResult, transactionResult] = await Promise.all([
        depositApi.getAll(),
        pointApi.getTransactions(),
      ]);
      const deposits =
        depositResult.success && Array.isArray(depositResult.data)
          ? depositResult.data
          : [];
      const transactions =
        transactionResult.success && Array.isArray(transactionResult.data)
          ? transactionResult.data
          : [];
      setReport(buildReportFallback(deposits, transactions));
    } else if (result)
      setError(result.error || "Data belum dapat dimuat. Pastikan API aktif.");
    setLoading(false);
  }, [section]);

  useEffect(() => {
    load();
  }, [load]);

  const resetForm = () => {
    setEditing(null);
    setForm({
      name: "",
      category: "Voucher",
      point_cost: "",
      stock: "",
      unit_price_per_kg: "",
      points_per_kg: "",
      description: "",
      image: "",
    });
    setImageFile(null);
  };

  const editItem = (item) => {
    setEditing(item);
    setForm(
      section === "points"
        ? {
            name: item.name,
            unit_price_per_kg: item.unit_price_per_kg,
            points_per_kg: item.points_per_kg,
            description: item.description || "",
            image: "",
          }
        : {
            name: item.name,
            category: item.category || "Voucher",
            point_cost: item.point_cost,
            stock: item.stock,
            description: item.description || "",
            image: item.image || "",
          },
    );
    setImageFile(null);
  };

  const saveItem = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    let image = form.image || undefined;
    if (section === "rewards" && imageFile) {
      const upload = await adminApi.uploadRewardImage(imageFile);
      if (!upload.success) {
        setError(upload.error || "Upload gambar gagal.");
        setSaving(false);
        return;
      }
      image = upload.data?.image;
    }
    const result =
      section === "points"
        ? editing
          ? await adminApi.updateWasteType(editing.id, {
              name: form.name,
              unit_price_per_kg: Number(form.unit_price_per_kg),
              points_per_kg: Number(form.points_per_kg),
              description: form.description,
            })
          : await adminApi.createWasteType({
              name: form.name,
              unit_price_per_kg: Number(form.unit_price_per_kg),
              points_per_kg: Number(form.points_per_kg),
              description: form.description,
              is_active: true,
            })
        : editing
          ? await adminApi.updateReward(editing.id, {
              name: form.name,
              category: form.category,
              point_cost: Number(form.point_cost),
              stock: Number(form.stock),
              description: form.description,
              ...(image ? { image } : {}),
            })
          : await adminApi.createReward({
              name: form.name,
              category: form.category,
              point_cost: Number(form.point_cost),
              stock: Number(form.stock),
              description: form.description,
              ...(image ? { image } : {}),
              is_active: true,
            });
    if (!result.success) setError(result.error || "Perubahan gagal disimpan.");
    else {
      resetForm();
      await load();
    }
    setSaving(false);
  };

  const removeItem = async (item) => {
    if (!window.confirm(`Hapus ${item.name}?`)) return;
    const result =
      section === "points"
        ? await adminApi.deleteWasteType(item.id)
        : await adminApi.deleteReward(item.id);
    if (!result.success) setError(result.error || "Data gagal dihapus.");
    else load();
  };

  const updateRedemption = async (item, status) => {
    setStatusLoading(item.id);
    const result = await adminApi.updateRedemptionStatus(item.id, status);
    if (!result.success) setError(result.error || "Status gagal diperbarui.");
    else load();
    setStatusLoading(null);
  };

  const meta = sectionMeta[section] || sectionMeta.overview;
  return (
    <>
      <AdminNav />
      <main
        key={pathname}
        className="container-wide admin-page-content"
        style={{ padding: "2rem 1rem" }}
      >
        <div style={{ marginBottom: "1.5rem" }}>
          <h1 style={{ fontSize: "1.6rem", fontWeight: 800 }}>{meta.title}</h1>
          <p className="text-faint">{meta.subtitle}</p>
        </div>
        <ErrorMessage message={error} />

        {(section === "overview" || section === "reports") && (
          <>
            {loading ? (
              <div className="text-faint">Memuat laporan...</div>
            ) : (
              <>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                    gap: "1rem",
                    marginBottom: "1.5rem",
                  }}
                >
                  <Stat
                    label="Total Setoran"
                    value={report?.total_deposits || 0}
                  />
                  <Stat
                    label="Berat Terverifikasi"
                    value={Number(report?.total_weight_kg || 0).toFixed(1)}
                    suffix="kg"
                  />
                  <Stat
                    label="Poin Diterbitkan"
                    value={(report?.total_points_issued || 0).toLocaleString(
                      "id-ID",
                    )}
                  />
                  <Stat
                    label="Poin Ditukar"
                    value={(report?.total_points_redeemed || 0).toLocaleString(
                      "id-ID",
                    )}
                  />
                </div>
                <div className="card" style={{ padding: "1.25rem" }}>
                  <h2 style={{ fontSize: "1rem", marginBottom: "1rem" }}>
                    Distribusi berdasarkan jenis sampah
                  </h2>
                  <div className="data-table-container">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Jenis</th>
                          <th>Berat</th>
                          <th>Setoran</th>
                          <th>Poin</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(report?.by_waste_type || []).map((item) => (
                          <tr key={item.waste_type_id}>
                            <td>{item.waste_type_name}</td>
                            <td>
                              {Number(item.total_weight_kg || 0).toFixed(1)} kg
                            </td>
                            <td>{item.total_deposits}</td>
                            <td>
                              {(item.total_points || 0).toLocaleString("id-ID")}
                            </td>
                          </tr>
                        ))}
                        {!(report?.by_waste_type || []).length && (
                          <tr>
                            <td colSpan="4" className="text-faint">
                              Belum ada data laporan.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </>
        )}

        {(section === "points" || section === "rewards") && (
          <div
            className="admin-management-layout"
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(260px, 340px) 1fr",
              gap: "1.5rem",
              alignItems: "start",
            }}
          >
            <form
              className="card"
              style={{ padding: "1.25rem" }}
              onSubmit={saveItem}
            >
              <h2 style={{ fontSize: "1rem", marginBottom: "1rem" }}>
                {editing ? "Edit Data" : "Tambah Data"}
              </h2>
              <div className="form-group">
                <label className="form-label">Nama</label>
                <input
                  className="form-input"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              {section === "rewards" && (
                <div className="form-group">
                  <label className="form-label">Kategori</label>
                  <select
                    className="form-input"
                    value={form.category}
                    onChange={(e) =>
                      setForm({ ...form, category: e.target.value })
                    }
                    required
                  >
                    <option value="E-Wallet">E-Wallet</option>
                    <option value="Listrik & Pulsa">Listrik & Pulsa</option>
                    <option value="Voucher">Voucher</option>
                  </select>
                </div>
              )}
              {section === "points" ? (
                <>
                  <div className="form-group">
                    <label className="form-label">Harga per kg</label>
                    <input
                      className="form-input"
                      type="number"
                      min="0"
                      value={form.unit_price_per_kg}
                      onChange={(e) =>
                        setForm({ ...form, unit_price_per_kg: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Poin per kg</label>
                    <input
                      className="form-input"
                      type="number"
                      min="0"
                      value={form.points_per_kg}
                      onChange={(e) =>
                        setForm({ ...form, points_per_kg: e.target.value })
                      }
                      required
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="form-group">
                    <label className="form-label">Biaya poin</label>
                    <input
                      className="form-input"
                      type="number"
                      min="1"
                      value={form.point_cost}
                      onChange={(e) =>
                        setForm({ ...form, point_cost: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Stok</label>
                    <input
                      className="form-input"
                      type="number"
                      min="0"
                      value={form.stock}
                      onChange={(e) =>
                        setForm({ ...form, stock: e.target.value })
                      }
                      required
                    />
                  </div>
                </>
              )}
              <div className="form-group">
                <label className="form-label">Deskripsi</label>
                <textarea
                  className="form-textarea"
                  rows="3"
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                />
              </div>
              {section === "rewards" && (
                <div className="form-group">
                  <label className="form-label">Foto Voucher</label>
                  <input
                    className="form-input"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                  />
                  {(imageFile || form.image) && (
                    <img
                      src={
                        imageFile
                          ? URL.createObjectURL(imageFile)
                          : resolveApiAssetUrl(form.image)
                      }
                      alt="Pratinjau voucher"
                      style={{
                        width: "100%",
                        height: 120,
                        objectFit: "cover",
                        marginTop: "0.5rem",
                        border: "1px solid var(--color-border)",
                      }}
                    />
                  )}
                </div>
              )}
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button className="btn btn-primary" disabled={saving}>
                  {saving
                    ? "Menyimpan..."
                    : editing
                      ? "Simpan Perubahan"
                      : "Tambah"}
                </button>
                {editing && (
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={resetForm}
                  >
                    Batal
                  </button>
                )}
              </div>
            </form>
            <div className="data-table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Nama</th>
                    {section === "points" ? (
                      <>
                        <th>Rp/kg</th>
                        <th>Poin/kg</th>
                      </>
                    ) : (
                      <>
                        <th>Biaya</th>
                        <th>Stok</th>
                      </>
                    )}
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="5">Memuat data...</td>
                    </tr>
                  ) : (
                    data.map((item) => (
                      <tr key={item.id}>
                        <td>
                          <strong>{item.name}</strong>
                          <div
                            className="text-faint"
                            style={{ fontSize: "0.75rem" }}
                          >
                            {item.description || "-"}
                          </div>
                        </td>
                        {section === "points" ? (
                          <>
                            <td>
                              {Number(
                                item.unit_price_per_kg || 0,
                              ).toLocaleString("id-ID")}
                            </td>
                            <td>{item.points_per_kg}</td>
                          </>
                        ) : (
                          <>
                            <td>
                              {Number(item.point_cost || 0).toLocaleString(
                                "id-ID",
                              )}{" "}
                              pts
                            </td>
                            <td>{item.stock}</td>
                          </>
                        )}
                        <td>
                          <button
                            className="btn btn-sm btn-secondary"
                            onClick={() => editItem(item)}
                          >
                            Edit
                          </button>{" "}
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => removeItem(item)}
                          >
                            Hapus
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                  {!loading && !data.length && (
                    <tr>
                      <td colSpan="5" className="text-faint">
                        Belum ada data.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {section === "redemptions" && (
          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nasabah</th>
                  <th>Hadiah</th>
                  <th>Poin</th>
                  <th>Tanggal</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7">Memuat data...</td>
                  </tr>
                ) : (
                  data.map((item) => (
                    <tr key={item.id}>
                      <td>#{item.id}</td>
                      <td>{item.user?.name || `User #${item.user_id}`}</td>
                      <td>
                        {item.reward?.name || `Reward #${item.reward_id}`}
                      </td>
                      <td>{item.points_used}</td>
                      <td>{formatDate(item.created_at)}</td>
                      <td>
                        <span
                          className={`badge ${item.status === "completed" ? "badge-verified" : item.status === "cancelled" ? "badge-rejected" : "badge-pending"}`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td>
                        {item.status === "pending" && (
                          <>
                            <button
                              className="btn btn-sm btn-primary"
                              disabled={statusLoading === item.id}
                              onClick={() =>
                                updateRedemption(item, "completed")
                              }
                            >
                              Selesaikan
                            </button>{" "}
                            <button
                              className="btn btn-sm btn-danger"
                              disabled={statusLoading === item.id}
                              onClick={() =>
                                updateRedemption(item, "cancelled")
                              }
                            >
                              Batalkan
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))
                )}
                {!loading && !data.length && (
                  <tr>
                    <td colSpan="7" className="text-faint">
                      Belum ada penukaran.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </>
  );
}
