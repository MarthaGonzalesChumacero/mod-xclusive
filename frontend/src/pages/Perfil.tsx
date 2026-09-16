import { useEffect, useState } from 'react';
import { User, Package, LogOut, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { gqlRequest } from '../services/graphql';

interface Pedido {
  id: string;
  total: number;
  estado: string;
  fecha: string;
  productos: { nombre: string; cantidad: number; subtotal: number }[];
}

const ESTADO_COLORES: Record<string, string> = {
  'Pendiente': 'bg-yellow-100 text-yellow-700',
  'Procesando': 'bg-blue-100 text-blue-700',
  'Enviado': 'bg-purple-100 text-purple-700',
  'Entregado': 'bg-green-100 text-green-700',
};

export default function Perfil() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [cargando, setCargando] = useState(true);
  const [pedidoAbierto, setPedidoAbierto] = useState<string | null>(null);

  useEffect(() => {
    if (!usuario) return;
    const query = `
      query {
        pedidos(usuarioId: "${usuario.id}") {
          id total estado fecha
          productos { nombre cantidad subtotal }
        }
      }
    `;
    gqlRequest<{ pedidos: Pedido[] }>(query)
      .then(d => { setPedidos(d.pedidos); setCargando(false); })
      .catch(() => setCargando(false));
  }, [usuario]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      {/* Encabezado de perfil */}
      <div className="bg-primary text-white rounded-2xl p-8 mb-8 flex items-center gap-6">
        <div className="bg-accent/20 rounded-full p-4">
          <User size={40} className="text-accent" />
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{usuario?.nombre}</h1>
          <p className="text-neutral-300 text-sm">{usuario?.email}</p>
          <span className="inline-block mt-2 text-xs bg-accent/20 text-accent px-3 py-1 rounded-full capitalize">{usuario?.rol}</span>
        </div>
        <button
          id="btn-logout-perfil"
          onClick={handleLogout}
          className="flex items-center gap-2 text-sm text-neutral-300 hover:text-red-400 transition-colors"
        >
          <LogOut size={18} /> Salir
        </button>
      </div>

      {/* Historial de pedidos */}
      <div>
        <h2 className="text-xl font-bold text-primary mb-5 flex items-center gap-2">
          <Package size={22} /> Mis Pedidos
        </h2>

        {cargando ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-accent"></div>
          </div>
        ) : pedidos.length === 0 ? (
          <div className="text-center py-12 text-gray-400 bg-white rounded-2xl shadow-sm">
            <Package size={48} className="mx-auto mb-3 opacity-20" />
            <p>No tienes pedidos aún.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pedidos.map(pedido => (
              <div key={pedido.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <button
                  className="w-full flex items-center justify-between p-5 hover:bg-neutral-50 transition-colors"
                  onClick={() => setPedidoAbierto(pedidoAbierto === pedido.id ? null : pedido.id)}
                >
                  <div className="flex items-center gap-4">
                    <div className="text-left">
                      <p className="font-semibold text-primary text-sm">Pedido #{pedido.id.slice(0, 8)}</p>
                      <p className="text-xs text-gray-400">{new Date(pedido.fecha).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>
                    <span className={`text-xs font-medium px-3 py-1 rounded-full ${ESTADO_COLORES[pedido.estado] || 'bg-gray-100 text-gray-600'}`}>
                      {pedido.estado}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-primary">${pedido.total.toFixed(2)}</span>
                    <ChevronRight size={18} className={`text-gray-400 transition-transform ${pedidoAbierto === pedido.id ? 'rotate-90' : ''}`} />
                  </div>
                </button>
                {pedidoAbierto === pedido.id && (
                  <div className="border-t px-5 py-4 bg-neutral-50">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Detalle del pedido</p>
                    <div className="space-y-2">
                      {pedido.productos.map((p, i) => (
                        <div key={i} className="flex justify-between text-sm">
                          <span className="text-gray-600">{p.nombre} ×{p.cantidad}</span>
                          <span className="font-medium">${p.subtotal.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
