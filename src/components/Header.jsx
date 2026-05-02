import { useAuth } from './AuthProvider';

export default function Header({ onAddCoupon }) {
  const { signOut } = useAuth();

  return (
    <header className="header">
      <button className="header__btn" onClick={signOut}>
        התנתקות
      </button>
      <span className="header__title">קופונים</span>
      <button className="header__btn" onClick={onAddCoupon}>
        + הוספה
      </button>
    </header>
  );
}
