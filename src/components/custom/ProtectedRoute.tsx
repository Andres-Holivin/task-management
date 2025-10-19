import { useAuthState } from '@/store/auth';
import { Navigate } from 'react-router-dom';


interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated } = useAuthState();

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}
