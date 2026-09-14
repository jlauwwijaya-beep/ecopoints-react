import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi, depositApi, rewardApi } from '../api/apiClient';

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
    location: 'Drop Point RW 04 Kebayoran'
  },
  {
    id: 'DEP-2025-002',
    date: '14 Mei 2025, 14:15',
    category: 'anorganik',
    type: 'Kardus & Kertas Dupleks',
    weight: 8.0,
    points: 1200,
    status: 'verified',
    location: 'Drop Point Utama Balai Warga'
  },
  {
    id: 'DEP-2025-003',
    date: '18 Mei 2025, 10:00',
    category: 'organik',
    type: 'Kompos & Sisa Dapur Organik',
    weight: 6.2,
    points: 310,
    status: 'verified',
    location: 'Unit Komposting Mandiri'
  },
  {
    id: 'DEP-2025-004',
    date: '22 Mei 2025, 16:40',
    category: 'b3',
    type: 'Baterai Bekas & Aki Kering',
    weight: 1.5,
    points: 1500,
    status: 'pending',
    location: 'Drop Point RW 04 Kebayoran'
  },
  {
    id: 'DEP-2025-005',
    date: '24 Mei 2025, 11:20',
    category: 'anorganik',
    type: 'Kaleng Alumunium Minuman',
    weight: 2.0,
    points: 600,
    status: 'pending',
    location: 'Drop Point Stasiun MRT'
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
  },
  {
    id: 'TXN-903',
    date: '15 Mei 2025',
    description: 'Penukaran Voucher Belanja Minimarket Rp 25.000',
    type: 'debit',
    amount: 1000,
    balance: 1550
  },
  {
    id: 'TXN-904',
    date: '18 Mei 2025',
    description: 'Setoran Kompos & Organik 6.2kg [DEP-2025-003]',
    type: 'credit',
    amount: 310,
    balance: 1860
  },
  {
    id: 'TXN-905',
    date: '20 Mei 2025',
    description: 'Tukar Pulsa / Token Listrik PLN Rp 20.000',
    type: 'debit',
    amount: 850,
    balance: 1010
  },
  {
    id: 'TXN-906',
    date: '21 Mei 2025',
    description: 'Bonus Referral Nasabah Baru #EP882',
    type: 'credit',
    amount: 340,
    balance: 1350
  }
];

const INITIAL_REWARDS = [
  {
    id: 'REW-01',
    name: 'Voucher Belanja Sembako Rp 25.000',
    cost: 1000,
    category: 'Voucher',
    stock: 15,
    description: 'Dapat digunakan di seluruh jaringan minimarket mitra & warung binaan RW.'
  },
  {
    id: 'REW-02',
    name: 'Token Listrik PLN Rp 20.000',
    cost: 850,
    category: 'Utilitas',
    stock: 40,
    description: 'Kode token 20 digit dikirim otomatis ke nomor ponsel terdaftar.'
  },
  {
    id: 'REW-03',
    name: 'Bibit Tanaman Sayur & Kompos 5kg',
    cost: 400,
    category: 'Eko-Produk',
    stock: 25,
    description: 'Pupuk kompos murni hasil olahan warga + 2 paket benih cabai rawit & kangkung.'
  },
  {
    id: 'REW-04',
    name: 'Tumbler Stainless Steel EcoPoints 600ml',
    cost: 1200,
    category: 'Merchandise',
    stock: 8,
    description: 'Edisi terbatas bergravir laser EcoPoints, insulasi dingin & panas 12 jam.'
  },
  {
    id: 'REW-05',
    name: 'Voucher BBM MyPertamina Rp 15.000',
    cost: 650,
    category: 'Transportasi',
    stock: 18,
    description: 'Kode voucher digital untuk SPBU di area Jabodetabek.'
  },
  {
    id: 'REW-06',
    name: 'Saldo E-Wallet (GoPay/OVO) Rp 50.000',
    cost: 2100,
    category: 'Uang Digital',
    stock: 12,
    description: 'Transfer saldo instan ke nomor akun e-wallet terdaftar.'
  }
];

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('ep_token') || null);
  const [apiConnected, setApiConnected] = useState(false);

  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('ep_user');
      return saved ? JSON.parse(saved) : DEFAULT_USER;
    } catch {
      return DEFAULT_USER;
    }
  });

  const [deposits, setDeposits] = useState(() => {
    try {
      const saved = localStorage.getItem('ep_deposits');
      return saved ? JSON.parse(saved) : INITIAL_DEPOSITS;
    } catch {
      return INITIAL_DEPOSITS;
    }
  });

  const [transactions, setTransactions] = useState(() => {
    try {
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

  // Listen for unauthorized 401 events
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

  // Try checking API connection and user profile on mount
  useEffect(() => {
    async function checkApi() {
      if (token) {
        const res = await authApi.getMe();
        if (res.success && res.data) {
          setApiConnected(true);
          setUser(prev => ({
            ...prev,
            ...res.data,
            points: res.data.points_balance ?? res.data.points ?? prev?.points ?? 0
          }));
        }
      }
    }
    checkApi();
  }, [token]);

  // Sync state to local storage
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
    localStorage.setItem('ep_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('ep_rewards', JSON.stringify(rewards));
  }, [rewards]);

  const login = async (email, password) => {
    // 1. Coba request ke REST API Backend Golang
    const res = await authApi.login(email, password);

    if (res.success && res.data) {
      const authToken = res.data.token || res.data.access_token;
      const apiUser = res.data.user || res.data;
      const points = apiUser.points_balance ?? apiUser.points ?? 1350;

      const userData = {
        id: apiUser.id || 'usr-api',
        name: apiUser.name || email.split('@')[0],
        email: apiUser.email || email,
        role: apiUser.role || 'user',
        points: points,
        memberId: `EP-ID-${apiUser.id || '8821'}`
      };

      setToken(authToken);
      setUser(userData);
      setApiConnected(true);
      return { success: true, user: userData, fromApi: true };
    }

    // 2. Fallback jika API offline / belum jalan
    const fallbackUser = {
      ...DEFAULT_USER,
      email: email || DEFAULT_USER.email,
      name: email === DEFAULT_USER.email ? DEFAULT_USER.name : (email.split('@')[0] || 'Nasabah Eco')
    };
    setUser(fallbackUser);
    return {
      success: true,
      user: fallbackUser,
      fromApi: false,
      notice: res.isOffline ? 'Mode Offline: Backend belum aktif, menggunakan data simulasi.' : null
    };
  };

  const register = async (name, email, password) => {
    // 1. Coba request ke REST API
    const res = await authApi.register(name, email, password);

    if (res.success && res.data) {
      return login(email, password);
    }

    // 2. Fallback jika offline
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
    return { success: true, user: newUser, fromApi: false };
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('ep_token');
    localStorage.removeItem('ep_user');
  };

  const addDeposit = async (depositData) => {
    const newId = `DEP-${new Date().getFullYear()}-${String(deposits.length + 1).padStart(3, '0')}`;
    const newDate = new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const newDepositItem = {
      id: newId,
      date: newDate,
      category: depositData.category,
      type: depositData.type,
      weight: parseFloat(depositData.weight),
      points: Math.floor(depositData.points),
      status: 'pending',
      location: depositData.location || 'Drop Point Utama'
    };

    // Kirim ke API jika terhubung
    try {
      await depositApi.create({
        waste_type_id: depositData.waste_type_id || 1,
        weight_kg: parseFloat(depositData.weight),
        notes: depositData.notes || '',
        drop_point_id: depositData.drop_point_id || 1
      });
    } catch (e) {
      // Abaikan jika offline
    }

    setDeposits(prev => [newDepositItem, ...prev]);
    return newDepositItem;
  };

  const redeemReward = async (rewardId) => {
    const reward = rewards.find(r => r.id === rewardId);
    if (!reward) {
      return { success: false, message: 'Reward tidak ditemukan.' };
    }

    if (!user || user.points < reward.cost) {
      return { success: false, message: 'Poin Anda tidak mencukupi untuk menukar reward ini.' };
    }

    const newBalance = user.points - reward.cost;

    // Coba kirim ke API jika ada endpoint redeem
    try {
      await rewardApi.redeem(rewardId);
    } catch (e) {
      // Offline fallback
    }

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
      prev.map(r => (r.id === rewardId ? { ...r, stock: Math.max(0, r.stock - 1) } : r))
    );

    return { success: true, message: `Berhasil menukarkan ${reward.name}!` };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        apiConnected,
        isAuthenticated: !!user,
        deposits,
        transactions,
        rewards,
        login,
        register,
        logout,
        addDeposit,
        redeemReward
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
