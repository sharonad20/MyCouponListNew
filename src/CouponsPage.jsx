import { useState, useMemo } from 'react';
import { useAuth } from './components/AuthProvider';
import Header from './components/Header';
import Coupon from './components/Coupon';
import AddCoupon from './components/AddCoupon';

export default function CouponsPage() {
  const { couponsData, loading, createCoupon, updateCoupon } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [couponToUpdate, setCouponToUpdate] = useState(null);
  const [showUsed, setShowUsed] = useState(false);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('purchaseDate');

  const stats = useMemo(() => {
    const active = couponsData.filter((c) => !c.isUsed);
    const totalValue = active.reduce((sum, c) => sum + (c.remainAmount || 0), 0);
    return { total: couponsData.length, used: couponsData.length - active.length, totalValue };
  }, [couponsData]);

  const visibleCoupons = useMemo(() => {
    let list = showUsed ? couponsData : couponsData.filter((c) => !c.isUsed);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((c) =>
        c.title?.toLowerCase().includes(q) || c.category?.toLowerCase().includes(q)
      );
    }
    return [...list].sort((a, b) => {
      if (sortBy === 'expireDate') {
        if (!a.expireDate) return 1;
        if (!b.expireDate) return -1;
        return new Date(a.expireDate) - new Date(b.expireDate);
      }
      if (sortBy === 'remainAmount') return (b.remainAmount || 0) - (a.remainAmount || 0);
      return new Date(b.purchaseDate) - new Date(a.purchaseDate);
    });
  }, [couponsData, showUsed, search, sortBy]);

  const openAdd = () => { setCouponToUpdate(null); setShowModal(true); };
  const openEdit = (coupon) => { setCouponToUpdate(coupon); setShowModal(true); };

  const handleSubmit = async (formData) => {
    if (couponToUpdate) {
      await updateCoupon(formData, couponToUpdate);
    } else {
      await createCoupon(formData);
    }
    setShowModal(false);
    setCouponToUpdate(null);
  };

  return (
    <>
      <Header onAddCoupon={openAdd} />

      <main className="page">
        <div className="stats-bar">
          <div className="stats-bar__item">
            <span className="stats-bar__value">{stats.total}</span>
            <span className="stats-bar__label">קופונים</span>
          </div>
          <div className="stats-bar__item">
            <span className="stats-bar__value">{stats.used}</span>
            <span className="stats-bar__label">מומשו</span>
          </div>
          <div className="stats-bar__item">
            <span className="stats-bar__value">&#8362;{stats.totalValue.toFixed(0)}</span>
            <span className="stats-bar__label">שווי פעיל</span>
          </div>
        </div>

        <div className="toolbar">
          <input
            type="search"
            className="toolbar__search"
            placeholder="חיפוש לפי שם או קטגוריה..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="toolbar__controls">
            <select className="toolbar__sort" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="purchaseDate">חדש ראשון</option>
              <option value="expireDate">פג תוקף ראשון</option>
              <option value="remainAmount">סכום גבוה ראשון</option>
            </select>
            <label className="toolbar__used-label">
              <input
                type="checkbox"
                className="toolbar__checkbox"
                checked={showUsed}
                onChange={(e) => setShowUsed(e.target.checked)}
              />
              <span>הצג מומשים</span>
            </label>
          </div>
        </div>

        {loading && (
          <div className="spinner-overlay">
            <div className="spinner" />
          </div>
        )}

        {!loading && visibleCoupons.length === 0 && (
          <div className="empty-state">
            <div className="empty-state__icon">&#127915;</div>
            <div>{search ? 'לא נמצאו קופונים תואמים' : 'אין קופונים להציג'}</div>
            {!search && <div className="empty-state__sub">לחץ על + כדי להוסיף קופון חדש</div>}
          </div>
        )}

        {visibleCoupons.map((coupon) => (
          <Coupon key={String(coupon._id)} coupon={coupon} onEdit={openEdit} />
        ))}
      </main>

      {showModal && (
        <AddCoupon
          couponToUpdate={couponToUpdate}
          onClose={() => { setShowModal(false); setCouponToUpdate(null); }}
          onSubmit={handleSubmit}
        />
      )}
    </>
  );
}
