import { useState } from 'react';
import { useAuth } from './AuthProvider';
import FloatingLabelInput from './FloatingLabelInput';

export default function Login() {
  const { signIn, signUp, loading } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (isRegister) {
        await signUp(email, password);
      } else {
        await signIn(email, password);
      }
    } catch (err) {
      setError(err.message || 'שגיאה, נסה שנית');
    }
  };

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={handleSubmit}>
        <h1 className="login-card__title">קופונים</h1>

        {error && <div className="login-card__error">{error}</div>}

        <FloatingLabelInput
          label="אימייל"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <FloatingLabelInput
          label="סיסמה"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button
          type="submit"
          className="btn btn--primary"
          style={{ width: '100%', padding: '12px', fontSize: '16px' }}
          disabled={loading}
        >
          {loading ? 'אנא המתן...' : isRegister ? 'הרשמה' : 'התחבר'}
        </button>

        <button
          type="button"
          className="btn btn--outline"
          style={{ width: '100%', padding: '10px', fontSize: '14px', marginTop: '10px' }}
          onClick={() => { setIsRegister((v) => !v); setError(''); }}
        >
          {isRegister ? 'כבר רשום? התחבר' : 'משתמש חדש? הירשם'}
        </button>
      </form>
    </div>
  );
}
