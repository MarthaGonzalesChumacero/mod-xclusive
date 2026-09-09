import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  soloAdmin?: boolean;
}

export default function RutaProtegida({ children, soloAdmin = false }: Props) {
  const { usuario, cargando } = useAuth();

  if (cargando) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
    </div>
  );

  if (!usuario) return <Navigate to="/login" replace />;
  if (soloAdmin && usuario.rol !== 'administrador') return <Navigate to="/" replace />;

  return <>{children}</>;
}
