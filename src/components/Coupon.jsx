import { useState } from 'react';
import { useAuth } from './AuthProvider';
import { decryptText } from './AuthProvider';

function formatDate(date) {
  if (!date) return null;
  try {
    return new Date(date).toLocaleDateString('he-IL');
  } catch {
    return null;
  }
}

export default function Coupon({ coupon, onEdit }) {
  const { setCouponUsed, deleteCoupon } = useAuth();
  const [expanded, setExpanded] = useState(false);

  const description = decryptText(coupon.description ?? '');

  return (
    <div className="coupon-card">
      <div className="coupon-card__header" onClick={() => setExpanded((v) => !v)}>
        <span className="coupon-card__title">{coupon.title}</span>
        <div className="coupon-card__badges">
          {coupon.isUsed && <span className="badge--used">מומש</span>}
          <span className="coupon-card__arrow">{expanded ? '▲' : '▼'}</span>
        </div>
      </div>

      {expanded && (
        <div className="coupon-card__body">
          {coupon.category ? (
            <div className="coupon-detail">
              <span className="coupon-detail__label">קטגוריה</span>
              <span>{coupon.category}</span>
            </div>
          ) : null}

          {coupon.purchaseDate && (
            <div className="coupon-detail">
              <span className="coupon-detail__label">תאריך יצירה</span>
              <span>{formatDate(coupon.purchaseDate)}</span>
            </div>
          )}

          <div className="coupon-detail">
            <span className="coupon-detail__label">סכום</span>
            <span>₪{coupon.totalAmount ?? 0}</span>
          </div>

          <div className="coupon-detail">
            <span className="coupon-detail__label">נותר</span>
            <span>₪{coupon.remainAmount ?? 0}</span>
          </div>

          {coupon.expireDate && (
            <div className="coupon-detail">
              <span className="coupon-detail__label">תאריך תפוגה</span>
              <span>{formatDate(coupon.expireDate)}</span>
            </div>
          )}

          {description ? (
            <div className="coupon-detail" style={{ flexDirection: 'column', gap: '4px' }}>
              <span className="coupon-detail__label">פרטים</span>
              <span style={{ whiteSpace: 'pre-wrap', fontSize: '13px', marginTop: '4px' }}>
                {description}
              </span>
            </div>
          ) : null}

          <div className="coupon-card__actions">
            <button
              className={`btn ${coupon.isUsed ? 'btn--outline' : 'btn--primary'}`}
              onClick={() => setCouponUsed(coupon)}
            >
              {coupon.isUsed ? 'בטל מימוש' : 'מומש'}
            </button>
            <button className="btn btn--outline" onClick={() => onEdit(coupon)}>עריכה</button>
            <button className="btn btn--danger" onClick={() => deleteCoupon(coupon)}>מחיקה</button>
          </div>
        </div>
      )}
    </div>
  );
}
