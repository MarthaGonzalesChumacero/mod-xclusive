import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from 'react';

interface Usuario {
  uid?: string;
  id?: string;
  nombre: string;
  apellido?: string;
  email: string;
  rol?: string;
}

interface AuthContextType {
  usuario: Usuario | null;
  token: string | null;
  login: (token: string, usuario: Usuario) => void;
  logout: () => void;
  cargando: boolean;
}

const AuthContext = createContext<AuthContextType>(
  {} as AuthContextType
);

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    try {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('usuario');

      // Verificar que realmente existan datos válidos
      if (
        storedToken &&
        storedUser &&
        storedUser !== 'undefined' &&
        storedUser !== 'null'
      ) {
        const usuarioGuardado = JSON.parse(storedUser);

        setToken(storedToken);
        setUsuario(usuarioGuardado);
      } else {
        // Limpiar datos incorrectos
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');

        setToken(null);
        setUsuario(null);
      }
    } catch (error) {
      console.error(
        'Error al recuperar la sesión:',
        error
      );

      // Si hay datos dañados, los eliminamos
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');

      setToken(null);
      setUsuario(null);
    } finally {
      setCargando(false);
    }
  }, []);

  const login = (
    newToken: string,
    newUsuario: Usuario
  ) => {
    // Evita guardar "undefined"
    if (!newToken || !newUsuario) {
      console.error(
        'No se pudo guardar la sesión: token o usuario inválido'
      );
      return;
    }

    localStorage.setItem('token', newToken);
    localStorage.setItem(
      'usuario',
      JSON.stringify(newUsuario)
    );

    setToken(newToken);
    setUsuario(newUsuario);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');

    setToken(null);
    setUsuario(null);
  };

  return (
    <AuthContext.Provider
      value={{
        usuario,
        token,
        login,
        logout,
        cargando,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);