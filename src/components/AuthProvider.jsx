import { createContext, useContext, useState, useCallback } from 'react';
import CryptoJS from 'crypto-js';

const API = import.meta.env.VITE_API_URL;
const ENCRYPT_KEY = import.meta.env.VITE_ENCRYPT_KEY;

export function encryptText(text) {
  if (!text) return '';
  return CryptoJS.AES.encrypt(text, ENCRYPT_KEY).toString();
}

export function decryptText(cipherText) {
  if (!cipherText) return '';
  try {
    const bytes = CryptoJS.AES.decrypt(cipherText, ENCRYPT_KEY);
    return bytes.toString(CryptoJS.enc.Utf8) || cipherText;
  } catch {
    return cipherText;
  }
}

// PostgreSQL returns snake_case — map to camelCase for the frontend
function mapCoupon(row) {
  return {
    _id: row.id,
    userId: row.user_id,
    title: row.title,
    category: row.category,
    totalAmount: parseFloat(row.total_amount) || 0,
    remainAmount: parseFloat(row.remain_amount) || 0,
    description: row.description,
    expireDate: row.expire_date,
    purchaseDate: row.purchase_date,
    isUsed: row.is_used,
  };
}

async function apiFetch(path, options = {}, token = null) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${API}${path}`, { ...options, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'שגיאת שרת');
  return data;
}

const AuthContext = createContext(null);

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [user, setUser] = useState(() => {
    const t = localStorage.getItem('token');
    const email = localStorage.getItem('userEmail');
    return t ? { token: t, email } : null;
  });
  const [couponsData, setCouponsData] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchCoupons = useCallback(async (t) => {
    const data = await apiFetch('/api/coupons', {}, t);
    setCouponsData(data.map(mapCoupon));
  }, []);

  const signIn = async (email, password) => {
    setLoading(true);
    try {
      const data = await apiFetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      localStorage.setItem('token', data.token);
      localStorage.setItem('userEmail', data.email);
      setToken(data.token);
      setUser({ token: data.token, email: data.email });
      await fetchCoupons(data.token);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email, password) => {
    setLoading(true);
    try {
      const data = await apiFetch('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      localStorage.setItem('token', data.token);
      localStorage.setItem('userEmail', data.email);
      setToken(data.token);
      setUser({ token: data.token, email: data.email });
      setCouponsData([]);
    } finally {
      setLoading(false);
    }
  };

  const signOut = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
    setToken(null);
    setUser(null);
    setCouponsData([]);
  };

  const refreshCoupons = useCallback(() => fetchCoupons(token), [fetchCoupons, token]);

  const createCoupon = async (coupon) => {
    await apiFetch('/api/coupons', {
      method: 'POST',
      body: JSON.stringify({
        ...coupon,
        description: encryptText(coupon.description),
      }),
    }, token);
    await refreshCoupons();
  };

  const updateCoupon = async (updatedCoupon, oldCoupon) => {
    await apiFetch(`/api/coupons/${oldCoupon._id}`, {
      method: 'PUT',
      body: JSON.stringify({
        ...updatedCoupon,
        description: encryptText(updatedCoupon.description),
      }),
    }, token);
    await refreshCoupons();
  };

  const deleteCoupon = async (coupon) => {
    await apiFetch(`/api/coupons/${coupon._id}`, { method: 'DELETE' }, token);
    await refreshCoupons();
  };

  const setCouponUsed = async (coupon) => {
    await apiFetch(`/api/coupons/${coupon._id}/used`, { method: 'PATCH' }, token);
    await refreshCoupons();
  };

  // load coupons on mount if already logged in
  useState(() => {
    if (token) fetchCoupons(token);
  });

  return (
    <AuthContext.Provider
      value={{
        user,
        couponsData,
        loading,
        signIn,
        signUp,
        signOut,
        createCoupon,
        updateCoupon,
        deleteCoupon,
        setCouponUsed,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
