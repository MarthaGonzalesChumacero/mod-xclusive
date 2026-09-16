import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, User, LogOut, Shield, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCarrito } from '../context/CarritoContext';

export default function Navbar() {
  const { usuario, logout } = useAuth();
  const { totalItems } = useCarrito();
  const navigate = useNavigate();
  const [menuAbierto, setMenuAbierto] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMenuAbierto(false);
  };

  return (
    <nav className="bg-primary text-white sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <span className="text-accent font-bold text-xl tracking-widest group-hover:opacity-80 transition-opacity">
              MOD XCLUSIVE
            </span>
          </Link>

          {/* Nav Links — Desktop */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/productos" className="text-sm font-medium text-neutral-200 hover:text-accent transition-colors tracking-wide">
              Catálogo
            </Link>
            {(usuario?.rol === 'administrador' || usuario?.rol === 'admin') && (
              <Link to="/admin" className="flex items-center gap-1 text-sm font-medium text-accent hover:text-yellow-300 transition-colors">
                <Shield size={15} /> Admin
              </Link>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            {/* Carrito */}
            <Link to="/carrito" id="btn-carrito" className="relative hover:text-accent transition-colors">
              <ShoppingBag size={22} />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-accent text-primary text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>

            {/* Usuario Desktop */}
            <div className="hidden md:flex items-center gap-3">
              {usuario ? (
                <>
                  <Link to="/perfil" id="btn-perfil" className="flex items-center gap-2 text-sm hover:text-accent transition-colors">
                    <User size={18} />
                    <span className="max-w-[120px] truncate">{usuario.nombre}</span>
                  </Link>
                  <button id="btn-logout" onClick={handleLogout} className="hover:text-red-400 transition-colors">
                    <LogOut size={18} />
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" id="btn-login" className="text-sm hover:text-accent transition-colors font-medium">
                    Iniciar Sesión
                  </Link>
                  <Link to="/registro" id="btn-registro" className="bg-accent text-primary text-sm font-semibold px-4 py-1.5 rounded hover:bg-yellow-400 transition-colors">
                    Registrarse
                  </Link>
                </>
              )}
            </div>

            {/* Mobile menu toggle */}
            <button className="md:hidden" onClick={() => setMenuAbierto(!menuAbierto)}>
              {menuAbierto ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {menuAbierto && (
        <div className="md:hidden bg-neutral-800 px-4 pb-4 pt-2 space-y-3">
          <Link to="/productos" onClick={() => setMenuAbierto(false)} className="block text-sm py-2 hover:text-accent transition-colors">Catálogo</Link>
          {(usuario?.rol === 'administrador' || usuario?.rol === 'admin') && (
            <Link to="/admin" onClick={() => setMenuAbierto(false)} className="block text-sm py-2 text-accent">Panel Admin</Link>
          )}
          {usuario ? (
            <>
              <Link to="/perfil" onClick={() => setMenuAbierto(false)} className="block text-sm py-2 hover:text-accent">Mi Perfil</Link>
              <button onClick={handleLogout} className="block text-sm py-2 text-red-400">Cerrar Sesión</button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setMenuAbierto(false)} className="block text-sm py-2 hover:text-accent">Iniciar Sesión</Link>
              <Link to="/registro" onClick={() => setMenuAbierto(false)} className="block text-sm py-2 text-accent font-semibold">Registrarse</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
