import { useState } from 'react';
import { useAuth } from './AuthProvider';
import { decryptText } from './AuthProvider';

const CATEGORY_COLORS = ['#129BDB', '#e67e22', '#2ecc71', '#9b59b6', '#e74c3c', '#1abc9c', '#f39c12', '#3498db'];

function categoryColor(category) {
  if (!category) return '#aaa';
  let hash = 0;
  for (let i = 0; i < category.length; i++) hash = category.charCodeAt(i) + ((hash << 5) - hash);
  return CATEGORY_COLORS[Math.abs(hash) % CATEGORY_COLORS.length];
}

function formatDate(date) {
  if (!date) return null;
  try {
    return new Date(date).toLocaleDateString('he-IL');
  } catch {
    return null;
  }
}

function isExpiringSoon(date) {
  if (!date) return false;
  const diff = new Date(date) - new Date();
  return diff > 0 && diff < 7 * 24 * 60 * 60 * 1000;
}

function isExpired(date) {
  if (!date) return false;
  return new Date(date) < new Date();
}

export default function Coupon({ coupon, onEdit }) {
  const { setCouponUsed, deleteCoupon } = useAuth();
  const [expanded, setExpanded] = useState(false);

  const description = decryptText(coupon.description ?? '');
  const expiringSoon = !coupon.isUsed && isExpiringSoon(coupon.expireDate);
  const expired = !coupon.isUsed && isExpired(coupon.expireDate);

  const handleDelete = () => {
    if (window.confirm('האם אתה בטוח שברצונך למחוק את הקופון?')) {
      deleteCoupon(coupon);
    }
  };

  return (
    <div className={`coupon-card${expiringSoon ? ' coupon-card--expiring' : ''}${expired ? ' coupon-card--expired' : ''}`}>
      <div className="coupon-card__header" onClick={() => setExpanded((v) => !v)}>
        <span className="coupon-card__title">{coupon.title}</span>
        <div className="coupon-card__badges">
          {coupon.category && (
            <span className="badge--category" style={{ background: categoryColor(coupon.category) }}>
              {coupon.category}
            </span>
          )}
          {coupon.remainAmount > 0 && !coupon.isUsed && (
            <span className="badge--amount">&#8362;{coupon.remainAmount}</span>
          )}
          {expiringSoon && <span className="badge--warning">פג בקרוב</span>}
          {expired && <span className="badge--expired-badge">פג תוקף</span>}
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
            <span>&#8362;{coupon.totalAmount ?? 0}</span>
          </div>

          <div className="coupon-detail">
            <span className="coupon-detail__label">נותר</span>
            <span>&#8362;{coupon.remainAmount ?? 0}</span>
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
            <button className="btn btn--danger" onClick={handleDelete}>מחיקה</button>
          </div>
        </div>
      )}
    </div>
  );
}
