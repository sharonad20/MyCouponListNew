import { AuthProvider, useAuth } from './components/AuthProvider';
import Login from './components/Login';
import CouponsPage from './CouponsPage';

function AppContent() {
  const { user } = useAuth();
  return user ? <CouponsPage /> : <Login />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
