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
    if (Array.isArray(item.items) && item.items.length > 0) {
      item.items.forEach((it) => {
        const id = it.waste_type_id || it.waste_type?.id || "unknown";
        const current = groups[id] || {
          waste_type_id: id,
          waste_type_name: it.waste_type_name || it.waste_type?.name || "Jenis sampah",
          total_weight_kg: 0,
          total_deposits: 0,
          total_points: 0,
        };
        current.total_weight_kg += Number(it.actual_weight_kg || it.weight_kg || 0);
        current.total_deposits += 1;
        current.total_points += Number(it.earned_points || it.points_earned || 0);
        groups[id] = current;
      });
    } else {
      const id = item.waste_type?.id || item.waste_type_id || "unknown";
      const current = groups[id] || {
        waste_type_id: id,
        waste_type_name: item.waste_type?.name || item.waste_type_name || "Jenis sampah",
        total_weight_kg: 0,
        total_deposits: 0,
        total_points: 0,
      };
      current.total_weight_kg += Number(item.total_weight_kg || item.weight_kg || 0);
      current.total_deposits += 1;
      current.total_points += Number(item.earned_points || item.points_earned || 0);
      groups[id] = current;
    }
    return groups;
  }, {});

  return {
    total_weight_kg: verified.reduce(
      (total, item) => total + Number(item.total_weight_kg || item.weight_kg || 0),
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
  const [usersMap, setUsersMap] = useState({});
  const [rewardsMap, setRewardsMap] = useState({});
  const [redemptionFilter, setRedemptionFilter] = useState("all");
  const [redemptionSearch, setRedemptionSearch] = useState("");
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
    if (section === "redemptions") {
      const [redemptionRes, rewardsRes, usersRes] = await Promise.all([
        adminApi.getRedemptions(),
        rewardApi.getAll().catch(() => null),
        adminApi.getUsers().catch(() => null),
      ]);

      if (rewardsRes?.success && Array.isArray(rewardsRes.data)) {
        const rMap = {};
        rewardsRes.data.forEach((r) => {
          rMap[r.id] = r;
        });
        setRewardsMap(rMap);
      }

      if (usersRes?.success && Array.isArray(usersRes.data)) {
        const uMap = {};
        usersRes.data.forEach((u) => {
          uMap[u.id] = u;
        });
        setUsersMap(uMap);
      }

      result = redemptionRes;
    }
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

  const getCustomerName = (item) => {
    return (
      item.user_name ||
      item.userName ||
      usersMap[item.user_id]?.name ||
      item.user?.name ||
      (item.user_id ? `Nasabah #${item.user_id}` : "-")
    );
  };

  const getCustomerEmail = (item) => {
    return (
      item.user_email ||
      item.userEmail ||
      usersMap[item.user_id]?.email ||
      item.user?.email ||
      ""
    );
  };

  const getRewardName = (item) => {
    return (
      item.reward_name ||
      item.rewardName ||
      rewardsMap[item.reward_id]?.name ||
      item.reward?.name ||
      (item.reward_id ? `Hadiah #${item.reward_id}` : "-")
    );
  };

  const getRewardCategory = (item) => {
    return (
      item.reward?.category ||
      rewardsMap[item.reward_id]?.category ||
      "Hadiah"
    );
  };

  const filteredRedemptions = data.filter((item) => {
    if (redemptionFilter !== "all") {
      if (redemptionFilter === "completed") {
        if (item.status !== "completed" && item.status !== "verified") return false;
      } else if (redemptionFilter === "cancelled") {
        if (item.status !== "cancelled" && item.status !== "rejected") return false;
      } else if (item.status !== redemptionFilter) {
        return false;
      }
    }
    if (redemptionSearch.trim()) {
      const q = redemptionSearch.toLowerCase();
      const uName = getCustomerName(item).toLowerCase();
      const uEmail = getCustomerEmail(item).toLowerCase();
      const rName = getRewardName(item).toLowerCase();
      const idStr = String(item.id);
      const paddedId = String(item.id).padStart(4, "0");
      return (
        uName.includes(q) ||
        uEmail.includes(q) ||
        rName.includes(q) ||
        idStr.includes(q) ||
        paddedId.includes(q)
      );
    }
    return true;
  });

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
          <div>
            {/* Filter & Search Toolbar */}
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "1rem",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "1.25rem",
              }}
            >
              {/* Status Filter Tabs */}
              <div
                style={{
                  display: "flex",
                  gap: "0.5rem",
                  flexWrap: "wrap",
                }}
              >
                {[
                  { key: "all", label: "Semua", count: data.length },
                  {
                    key: "pending",
                    label: "Menunggu",
                    count: data.filter((d) => d.status === "pending").length,
                  },
                  {
                    key: "completed",
                    label: "Selesai",
                    count: data.filter(
                      (d) => d.status === "completed" || d.status === "verified",
                    ).length,
                  },
                  {
                    key: "cancelled",
                    label: "Dibatalkan",
                    count: data.filter(
                      (d) => d.status === "cancelled" || d.status === "rejected",
                    ).length,
                  },
                ].map((f) => (
                  <button
                    key={f.key}
                    type="button"
                    onClick={() => setRedemptionFilter(f.key)}
                    className="btn btn-sm"
                    style={{
                      background:
                        redemptionFilter === f.key
                          ? "var(--color-ink)"
                          : "var(--color-surface)",
                      color:
                        redemptionFilter === f.key
                          ? "var(--color-paper)"
                          : "var(--color-ink-muted)",
                      border:
                        redemptionFilter === f.key
                          ? "1px solid var(--color-ink)"
                          : "1px solid var(--color-border)",
                      transition: "all 0.15s ease",
                      fontWeight: redemptionFilter === f.key ? 700 : 500,
                    }}
                  >
                    {f.label} ({f.count})
                  </button>
                ))}
              </div>

              {/* Search Box */}
              <div
                style={{
                  position: "relative",
                  minWidth: "260px",
                  maxWidth: "360px",
                  flex: "1 1 auto",
                }}
              >
                <input
                  type="text"
                  placeholder="Cari ID, nasabah, hadiah..."
                  value={redemptionSearch}
                  onChange={(e) => setRedemptionSearch(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.55rem 2rem 0.55rem 0.75rem",
                    fontSize: "0.85rem",
                    border: "1px solid var(--color-border)",
                    backgroundColor: "#fff",
                    borderRadius: "4px",
                  }}
                />
                {redemptionSearch && (
                  <button
                    type="button"
                    onClick={() => setRedemptionSearch("")}
                    style={{
                      position: "absolute",
                      right: "0.5rem",
                      top: "50%",
                      transform: "translateY(-50%)",
                      padding: "0.2rem 0.4rem",
                      fontSize: "0.8rem",
                      color: "var(--color-ink-faint)",
                      fontWeight: 700,
                    }}
                    title="Hapus pencarian"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Redemptions Table */}
            <div className="data-table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th style={{ width: "95px" }}>ID</th>
                    <th>Nasabah</th>
                    <th>Hadiah</th>
                    <th style={{ width: "120px" }}>Poin</th>
                    <th style={{ width: "130px" }}>Tanggal</th>
                    <th style={{ width: "120px" }}>Status</th>
                    <th style={{ width: "160px" }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: "center", padding: "2.5rem" }}>
                        <div className="font-mono text-faint">Memuat data penukaran...</div>
                      </td>
                    </tr>
                  ) : (
                    filteredRedemptions.map((item) => {
                      const custName = getCustomerName(item);
                      const custEmail = getCustomerEmail(item);
                      const rewName = getRewardName(item);
                      const rewCategory = getRewardCategory(item);
                      const custInitial = (custName.replace(/^Nasabah #/, "N") || "U")
                        .charAt(0)
                        .toUpperCase();

                      return (
                        <tr key={item.id}>
                          {/* ID Cantik */}
                          <td>
                            <span
                              className="font-mono"
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "0.2rem",
                                fontSize: "0.8125rem",
                                fontWeight: 700,
                                background: "#fff",
                                border: "1px solid var(--color-border)",
                                padding: "0.25rem 0.55rem",
                                borderRadius: "4px",
                                color: "var(--color-ink)",
                                boxShadow: "0 1px 2px rgba(0, 0, 0, 0.04)",
                                letterSpacing: "0.02em",
                              }}
                            >
                              <span
                                style={{
                                  color: "var(--color-primary)",
                                  fontWeight: 800,
                                }}
                              >
                                #
                              </span>
                              <span>{String(item.id).padStart(4, "0")}</span>
                            </span>
                          </td>

                          {/* Nama Nasabah */}
                          <td>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "0.65rem",
                              }}
                            >
                              <div
                                style={{
                                  width: 32,
                                  height: 32,
                                  borderRadius: "50%",
                                  background: "var(--color-primary)",
                                  color: "#fff",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontSize: "0.78rem",
                                  fontWeight: 700,
                                  flexShrink: 0,
                                }}
                              >
                                {custInitial}
                              </div>
                              <div>
                                <div
                                  style={{
                                    fontWeight: 600,
                                    color: "var(--color-ink)",
                                    fontSize: "0.875rem",
                                  }}
                                >
                                  {custName}
                                </div>
                                <div
                                  className="text-faint font-mono"
                                  style={{ fontSize: "0.72rem" }}
                                >
                                  {custEmail || (item.user_id ? `ID Nasabah: ${item.user_id}` : "")}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Nama Hadiah */}
                          <td>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "0.65rem",
                              }}
                            >
                              <div
                                style={{
                                  width: 32,
                                  height: 32,
                                  borderRadius: "6px",
                                  background: "var(--color-poin-light)",
                                  border: "1px solid #E3CE74",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontSize: "1rem",
                                  flexShrink: 0,
                                }}
                              >
                                🎁
                              </div>
                              <div>
                                <div
                                  style={{
                                    fontWeight: 600,
                                    color: "var(--color-ink)",
                                    fontSize: "0.875rem",
                                  }}
                                >
                                  {rewName}
                                </div>
                                <div
                                  className="text-faint"
                                  style={{
                                    fontSize: "0.72rem",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "0.35rem",
                                    flexWrap: "wrap",
                                  }}
                                >
                                  <span>{rewCategory}</span>
                                  {item.voucher_code && (
                                    <span
                                      className="font-mono"
                                      style={{
                                        color: "var(--color-primary)",
                                        fontWeight: 600,
                                      }}
                                    >
                                      • Kode: {item.voucher_code}
                                    </span>
                                  )}
                                  {item.notes && (
                                    <span style={{ fontStyle: "italic" }}>
                                      • "{item.notes}"
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Poin Digunakan */}
                          <td
                            className="font-mono"
                            style={{
                              fontWeight: 700,
                              color: "var(--color-primary)",
                            }}
                          >
                            {Number(item.points_used || 0).toLocaleString("id-ID")}{" "}
                            <span
                              style={{
                                fontSize: "0.72rem",
                                fontWeight: 500,
                                color: "var(--color-ink-muted)",
                              }}
                            >
                              pts
                            </span>
                          </td>

                          {/* Tanggal */}
                          <td
                            style={{
                              fontSize: "0.8125rem",
                              color: "var(--color-ink-muted)",
                            }}
                          >
                            {formatDate(item.created_at)}
                          </td>

                          {/* Status */}
                          <td>
                            <span
                              className={`badge ${
                                item.status === "completed" || item.status === "verified"
                                  ? "badge-verified"
                                  : item.status === "cancelled" || item.status === "rejected"
                                    ? "badge-rejected"
                                    : "badge-pending"
                              }`}
                            >
                              {item.status}
                            </span>
                          </td>

                          {/* Aksi */}
                          <td>
                            {item.status === "pending" ? (
                              <div style={{ display: "flex", gap: "0.35rem" }}>
                                <button
                                  className="btn btn-sm btn-primary"
                                  disabled={statusLoading === item.id}
                                  onClick={() => updateRedemption(item, "completed")}
                                >
                                  {statusLoading === item.id ? "..." : "Selesaikan"}
                                </button>{" "}
                                <button
                                  className="btn btn-sm btn-danger"
                                  disabled={statusLoading === item.id}
                                  onClick={() => updateRedemption(item, "cancelled")}
                                >
                                  {statusLoading === item.id ? "..." : "Batalkan"}
                                </button>
                              </div>
                            ) : (
                              <span
                                className="text-faint font-mono"
                                style={{ fontSize: "0.75rem" }}
                              >
                                -
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                  {!loading && !filteredRedemptions.length && (
                    <tr>
                      <td colSpan="7" className="text-faint" style={{ textAlign: "center", padding: "2rem" }}>
                        {redemptionSearch || redemptionFilter !== "all"
                          ? "Tidak ada penukaran yang cocok dengan filter atau pencarian."
                          : "Belum ada penukaran."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
