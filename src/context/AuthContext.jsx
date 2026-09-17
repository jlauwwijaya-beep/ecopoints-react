import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi, depositApi, rewardApi, masterApi, pointApi, healthApi, setAuthToken, resolveApiAssetUrl } from '../api/apiClient';

const AuthContext = createContext(null);

const DEFAULT_USER = {
  id: 'usr-1',
  name: 'Budi Pratama',
  email: 'nasabah@ecopoints.id',
  role: 'nasabah',
  points: 1350,
  phone: '0812-8899-7711',
  memberId: 'EP-ID-8821',
  joinedDate: '12 Jan 2025'
};

const INITIAL_DEPOSITS = [
  {
    id: 'DEP-2025-001',
    date: '10 Mei 2025, 09:30',
    category: 'anorganik',
    type: 'Plastik PET (Botol Bersih)',
    weight: 4.5,
    points: 1350,
    status: 'verified',
    location: 'Drop Point EcoPoints Pusat'
  },
  {
    id: 'DEP-2025-002',
    date: '14 Mei 2025, 14:15',
    category: 'anorganik',
    type: 'Kardus Box',
    weight: 8.0,
    points: 1200,
    status: 'verified',
    location: 'Drop Point EcoPoints Jakarta Selatan'
  }
];

const INITIAL_TRANSACTIONS = [
  {
    id: 'TXN-901',
    date: '10 Mei 2025',
    description: 'Setoran Plastik PET 4.5kg [DEP-2025-001]',
    type: 'credit',
    amount: 1350,
    balance: 1350
  },
  {
    id: 'TXN-902',
    date: '14 Mei 2025',
    description: 'Setoran Kardus & Kertas 8.0kg [DEP-2025-002]',
    type: 'credit',
    amount: 1200,
    balance: 2550
  }
];

const INITIAL_REWARDS = [
  {
    id: 3,
    name: 'Voucher Belanja Rp 50.000',
    cost: 500,
    category: 'Voucher',
    stock: 20,
    description: 'Voucher belanja minimarket rekanan.'
  }
];

function formatApiDeposit(d) {
  const createdDate = d.created_at ? new Date(d.created_at) : new Date();
  const dateStr = createdDate.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const items = Array.isArray(d.items) ? d.items : [];
  let wasteName = 'Sampah Terpilah';
  if (items.length > 1) {
    const firstType = items[0].waste_type_name || items[0].waste_type?.name || 'Sampah';
    wasteName = `${firstType} (+${items.length - 1} jenis lain)`;
  } else if (items.length === 1) {
    wasteName = items[0].waste_type_name || items[0].waste_type?.name || 'Sampah';
  } else if (d.waste_type) {
    wasteName = d.waste_type.name;
  } else if (d.waste_type_name) {
    wasteName = d.waste_type_name;
  }

  let cat = 'anorganik';
  const lower = wasteName.toLowerCase();
  if (lower.includes('organik') || lower.includes('kompos')) {
    cat = 'organik';
  } else if (lower.includes('e-waste') || lower.includes('elektronik') || lower.includes('baterai') || lower.includes('b3')) {
    cat = 'b3';
  }

  const weight = d.total_weight_kg !== undefined && d.total_weight_kg !== null
    ? d.total_weight_kg
    : (d.weight_kg !== undefined && d.weight_kg !== null ? d.weight_kg : 0);

  const isRejectedOrCancelled = d.status === 'rejected' || d.status === 'cancelled' || d.status === 'canceled';
  const points = isRejectedOrCancelled
    ? 0
    : (d.earned_points !== undefined && d.earned_points !== null
        ? d.earned_points
        : (d.points_earned !== undefined && d.points_earned !== null
            ? d.points_earned
            : (d.estimated_points !== undefined && d.estimated_points !== null
                ? d.estimated_points
                : Math.round(weight * (d.waste_type?.points_per_kg || 500)))));

  return {
    id: `DEP-${String(d.id).padStart(4, '0')}`,
    rawId: d.id,
    date: dateStr,
    category: cat,
    type: wasteName,
    weight: Number(weight),
    points: Number(points),
    status: d.status || 'verified',
    location: d.drop_point ? d.drop_point.name : (d.drop_point_name || 'Drop Point EcoPoints Pusat'),
    items: items
  };
}

function formatApiTransaction(t, currentBalance) {
  const dateStr = t.created_at
    ? new Date(t.created_at).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      })
    : 'Hari ini';

  return {
    id: `TXN-${String(t.id).padStart(4, '0')}`,
    rawId: t.id,
    date: dateStr,
    description: t.description || (t.type === 'credit' ? 'Setoran Sampah' : 'Penukaran Reward'),
    type: t.type,
    amount: t.amount,
    balance: currentBalance || 0
  };
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('ep_token') || null);
  const [apiConnected, setApiConnected] = useState(false);
  const [wasteTypes, setWasteTypes] = useState([]);
  const [dropPoints, setDropPoints] = useState([]);

  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('ep_user');
      return saved ? JSON.parse(saved) : DEFAULT_USER;
    } catch {
      return DEFAULT_USER;
    }
  });

  const [hiddenDepositIds, setHiddenDepositIds] = useState(() => {
    try {
      const savedUser = JSON.parse(localStorage.getItem('ep_user') || 'null');
      const saved = localStorage.getItem(`ep_hidden_deposits_${savedUser?.id || 'guest'}`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [deposits, setDeposits] = useState(() => {
    try {
      if (localStorage.getItem('ep_token')) return [];
      const saved = localStorage.getItem('ep_deposits');
      return saved ? JSON.parse(saved) : INITIAL_DEPOSITS;
    } catch {
      return INITIAL_DEPOSITS;
    }
  });

  const [transactions, setTransactions] = useState(() => {
    try {
      if (localStorage.getItem('ep_token')) return [];
      const saved = localStorage.getItem('ep_transactions');
      return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
    } catch {
      return INITIAL_TRANSACTIONS;
    }
  });

  const [rewards, setRewards] = useState(() => {
    try {
      const saved = localStorage.getItem('ep_rewards');
      return saved ? JSON.parse(saved) : INITIAL_REWARDS;
    } catch {
      return INITIAL_REWARDS;
    }
  });

  // Check API health and load master data
  const loadMasterData = useCallback(async () => {
    const health = await healthApi.check();
    if (health.success) {
      setApiConnected(true);
    } else {
      setApiConnected(false);
    }

    // Load waste types
    const wtRes = await masterApi.getWasteTypes();
    if (wtRes.success && Array.isArray(wtRes.data)) {
      setWasteTypes(wtRes.data);
    }

    // Load drop points
    const dpRes = await masterApi.getDropPoints();
    if (dpRes.success && Array.isArray(dpRes.data)) {
      setDropPoints(dpRes.data);
    }

    // Load rewards
    const rewRes = await rewardApi.getAll();
    if (rewRes.success && Array.isArray(rewRes.data) && rewRes.data.length > 0) {
      const mapped = rewRes.data.map(r => ({
        id: r.id,
        name: r.name,
        cost: r.point_cost,
        stock: r.stock,
        category: r.category || 'Voucher',
        description: r.description || 'Reward penukaran EcoPoints resmi.',
        image: resolveApiAssetUrl(r.image)
      }));
      setRewards(mapped);
    }
  }, []);

  // Load user data & deposits from API when authenticated
  const loadUserData = useCallback(async (authToken) => {
    if (!authToken) return;

    // 1. Get Me
    const meRes = await authApi.getMe();
    if (meRes.success && meRes.data) {
      setApiConnected(true);
      const points = meRes.data.points_balance ?? meRes.data.points ?? 0;
      setUser(prev => ({
        ...prev,
        id: meRes.data.id,
        name: meRes.data.name,
        email: meRes.data.email,
        role: meRes.data.role,
        points: points,
        memberId: `EP-ID-${String(meRes.data.id).padStart(4, '0')}`
      }));
    }

    // 2. Get user deposits
    const depRes = await depositApi.getAll();
    if (depRes.success && Array.isArray(depRes.data)) {
      const formatted = depRes.data
        .map(formatApiDeposit)
        .filter(deposit => !hiddenDepositIds.includes(String(deposit.rawId)));
      setDeposits(formatted);
    }

    // 3. Get point transactions
    const txnRes = await pointApi.getTransactions();
    if (txnRes.success && Array.isArray(txnRes.data)) {
      const userPoints = meRes.success && meRes.data ? (meRes.data.points_balance ?? meRes.data.points ?? 0) : 0;
      const formattedTxns = txnRes.data.map(t => formatApiTransaction(t, userPoints));
      setTransactions(formattedTxns);
    }
  }, [hiddenDepositIds]);

  // Handle 401 unauthorized
  useEffect(() => {
    const handleUnauthorized = () => {
      setToken(null);
      setUser(null);
      localStorage.removeItem('ep_token');
      localStorage.removeItem('ep_user');
    };
    window.addEventListener('ep_unauthorized', handleUnauthorized);
    return () => window.removeEventListener('ep_unauthorized', handleUnauthorized);
  }, []);

  // Initial load on mount
  useEffect(() => {
    loadMasterData();
    if (token) {
      loadUserData(token);
    }
  }, [token, loadMasterData, loadUserData]);

  // Sync to local storage
  useEffect(() => {
    if (user) {
      localStorage.setItem('ep_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('ep_user');
    }
  }, [user]);

  useEffect(() => {
    if (token) {
      localStorage.setItem('ep_token', token);
    } else {
      localStorage.removeItem('ep_token');
    }
  }, [token]);

  useEffect(() => {
    localStorage.setItem('ep_deposits', JSON.stringify(deposits));
  }, [deposits]);

  useEffect(() => {
    localStorage.setItem(`ep_hidden_deposits_${user?.id || 'guest'}`, JSON.stringify(hiddenDepositIds));
  }, [hiddenDepositIds, user]);

  useEffect(() => {
    localStorage.setItem('ep_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('ep_rewards', JSON.stringify(rewards));
  }, [rewards]);

  const login = async (email, password) => {
    const res = await authApi.login(email, password);

    if (res.success && res.data) {
      const authToken = res.data.token || res.data.access_token;
      const apiUser = res.data.user || res.data;
      const points = apiUser.points_balance ?? apiUser.points ?? 0;

      const userData = {
        id: apiUser.id,
        name: apiUser.name || email.split('@')[0],
        email: apiUser.email || email,
        role: apiUser.role || 'user',
        points: points,
        memberId: `EP-ID-${String(apiUser.id).padStart(4, '0')}`,
        phone: '0812-8899-7711',
        joinedDate: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
      };

      // Set token and user synchronously so any subsequent API call or route check has them immediately
      setAuthToken(authToken);
      localStorage.setItem('ep_token', authToken);
      localStorage.setItem('ep_user', JSON.stringify(userData));

      setToken(authToken);
      setUser(userData);
      setDeposits([]);
      setTransactions([]);
      const savedHidden = localStorage.getItem(`ep_hidden_deposits_${userData.id}`);
      setHiddenDepositIds(savedHidden ? JSON.parse(savedHidden) : []);
      setApiConnected(true);

      // Load remote deposits and master data for this session asynchronously
      loadUserData(authToken);
      loadMasterData();

      return { success: true, user: userData, fromApi: true };
    }

    // Jika server backend online tapi kredensial salah, berikan pesan error
    if (!res.isOffline) {
      return {
        success: false,
        message: res.error || 'Email atau kata sandi salah. Silakan coba lagi.',
        fromApi: true
      };
    }

    // Fallback HANYA jika server backend benar-benar offline (unreachable)
    const fallbackUser = {
      ...DEFAULT_USER,
      email: email || DEFAULT_USER.email,
      name: email === DEFAULT_USER.email ? DEFAULT_USER.name : (email.split('@')[0] || 'Nasabah Eco')
    };
    setUser(fallbackUser);
    localStorage.setItem('ep_user', JSON.stringify(fallbackUser));
    return {
      success: true,
      user: fallbackUser,
      fromApi: false,
      notice: 'Mode Offline: Backend tidak dapat dijangkau, menggunakan data simulasi lokal.'
    };
  };

  const register = async (name, email, password) => {
    const res = await authApi.register(name, email, password);
    if (res.success && res.data) {
      return login(email, password);
    }

    // Jika API online dan gagal (contoh email duplikat atau validasi gagal)
    if (!res.isOffline) {
      return {
        success: false,
        message: res.error || 'Gagal mendaftar. Pastikan email belum terdaftar dan sandi minimal 6 karakter.'
      };
    }

    // Fallback jika API offline
    const newUser = {
      id: 'usr-' + Date.now(),
      name: name || 'Nasabah Baru',
      email: email || 'baru@ecopoints.id',
      role: 'nasabah',
      points: 100,
      phone: '0812-0000-0000',
      memberId: 'EP-ID-' + Math.floor(1000 + Math.random() * 9000),
      joinedDate: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
    };
    setUser(newUser);
    localStorage.setItem('ep_user', JSON.stringify(newUser));
    return { success: true, user: newUser, fromApi: false };
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setAuthToken(null);
    localStorage.removeItem('ep_token');
    localStorage.removeItem('ep_user');
  };

  const clearDepositHistory = () => {
    const ids = deposits.map(deposit => String(deposit.rawId ?? deposit.id));
    setHiddenDepositIds(previous => [...new Set([...previous, ...ids])]);
    setDeposits([]);
  };

  const addDeposit = async (depositData) => {
    let apiSuccess = false;
    let savedItem = null;

    // Send to Go API if token available
    if (token) {
      let payload;
      if (Array.isArray(depositData.items) && depositData.items.length > 0) {
        payload = {
          drop_point_id: depositData.drop_point_id ? Number(depositData.drop_point_id) : null,
          notes: depositData.notes || '',
          items: depositData.items.map(it => ({
            waste_type_id: Number(it.waste_type_id || 1),
            weight_kg: parseFloat(it.weight_kg ?? it.weight ?? 0)
          }))
        };
      } else {
        payload = {
          waste_type_id: Number(depositData.waste_type_id || 1),
          weight_kg: parseFloat(depositData.weight || 0),
          drop_point_id: depositData.drop_point_id ? Number(depositData.drop_point_id) : null,
          notes: depositData.notes || '',
          items: [
            {
              waste_type_id: Number(depositData.waste_type_id || 1),
              weight_kg: parseFloat(depositData.weight || 0)
            }
          ]
        };
      }

      const res = await depositApi.create(payload);
      if (res.success && res.data) {
        apiSuccess = true;
        savedItem = formatApiDeposit(res.data);
        // Refresh profile to get updated points
        loadUserData(token);
      }
    }

    // If not from API or API failed, create local fallback item
    if (!savedItem) {
      const newId = `DEP-${new Date().getFullYear()}-${String(deposits.length + 1).padStart(3, '0')}`;
      const newDate = new Date().toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      const totalWeight = depositData.items
        ? depositData.items.reduce((s, it) => s + (parseFloat(it.weight_kg || it.weight) || 0), 0)
        : parseFloat(depositData.weight || 0);

      const totalPts = Math.floor(depositData.points || 0);

      savedItem = {
        id: newId,
        date: newDate,
        category: depositData.category || 'anorganik',
        type: depositData.type || 'Sampah Terpilah',
        weight: totalWeight,
        points: totalPts,
        status: 'verified',
        location: depositData.location || 'Drop Point EcoPoints Pusat',
        items: depositData.items || []
      };

      // Add points to local user
      setUser(prev => ({
        ...prev,
        points: (prev?.points || 0) + totalPts
      }));
    }

    setDeposits(prev => [savedItem, ...prev]);

    if (apiSuccess) {
      return { success: true, data: savedItem, apiSuccess: true };
    }

    // Record credit transaction
    const newTxn = {
      id: 'TXN-' + Math.floor(1000 + Math.random() * 9000),
      date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
      description: `Setoran ${savedItem.type} ${savedItem.weight}kg [${savedItem.id}]`,
      type: 'credit',
      amount: savedItem.points,
      balance: (user?.points || 0) + savedItem.points
    };
    setTransactions(prev => [newTxn, ...prev]);

    return { success: true, data: savedItem, apiSuccess };
  };

  const redeemReward = async (rewardId) => {
    const reward = rewards.find(r => r.id === rewardId || String(r.id) === String(rewardId));
    if (!reward) {
      return { success: false, message: 'Reward tidak ditemukan.' };
    }

    if (!user || user.points < reward.cost) {
      return { success: false, message: 'Poin Anda tidak mencukupi untuk menukar reward ini.' };
    }

    // Call Go API redeem endpoint
    if (token) {
      const res = await rewardApi.redeem(reward.id);
      if (res.success && res.data) {
        const newBalance = Number(res.data.new_balance ?? 0);
        setUser(prev => ({
          ...prev,
          points: newBalance
        }));
        setRewards(prev =>
          prev.map(r => (r.id === reward.id ? { ...r, stock: Math.max(0, r.stock - 1) } : r))
        );
        const newTxn = {
          id: 'TXN-' + Math.floor(1000 + Math.random() * 9000),
          date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
          description: `Penukaran ${reward.name}`,
          type: 'debit',
          amount: reward.cost,
          balance: newBalance
        };
        setTransactions(prev => [newTxn, ...prev]);
        loadUserData(token);
        return { success: true, message: res.message || `Berhasil menukarkan ${reward.name}!` };
      }
    }

    // Local fallback
    const newBalance = user.points - reward.cost;
    setUser(prev => ({
      ...prev,
      points: newBalance
    }));

    const newTxn = {
      id: 'TXN-' + Math.floor(1000 + Math.random() * 9000),
      date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
      description: `Penukaran ${reward.name}`,
      type: 'debit',
      amount: reward.cost,
      balance: newBalance
    };

    setTransactions(prev => [newTxn, ...prev]);
    setRewards(prev =>
      prev.map(r => (r.id === reward.id ? { ...r, stock: Math.max(0, r.stock - 1) } : r))
    );

    return { success: true, message: `Berhasil menukarkan ${reward.name}!` };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        apiConnected,
        wasteTypes,
        dropPoints,
        isAuthenticated: !!user,
        deposits,
        transactions,
        clearDepositHistory,
        rewards,
        login,
        register,
        logout,
        addDeposit,
        redeemReward,
        refreshData: loadMasterData
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
