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

  const visibleCoupons = useMemo(() => {
    if (showUsed) return couponsData;
    return couponsData.filter((c) => !c.isUsed);
  }, [couponsData, showUsed]);

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
        <div className="toolbar">
          <span className="toolbar__label">הצג קופונים שמומשו</span>
          <input
            type="checkbox"
            className="toolbar__checkbox"
            checked={showUsed}
            onChange={(e) => setShowUsed(e.target.checked)}
          />
        </div>

        {loading && (
          <div className="spinner-overlay">
            <div className="spinner" />
          </div>
        )}

        {!loading && visibleCoupons.length === 0 && (
          <div className="empty-state">אין קופונים להציג</div>
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
