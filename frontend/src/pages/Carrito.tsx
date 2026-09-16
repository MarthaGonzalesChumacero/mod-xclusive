import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { useCarrito } from '../context/CarritoContext';
import { useAuth } from '../context/AuthContext';
import { gqlRequest } from '../services/graphql';

export default function Carrito() {
  const {
    items,
    quitarItem,
    actualizarCantidad,
    limpiarCarrito,
    totalPrecio,
  } = useCarrito();

  const { usuario } = useAuth();
  const navigate = useNavigate();

  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');

  const handleComprar = async () => {
    if (!usuario) {
      navigate('/login');
      return;
    }

    setProcesando(true);
    setError('');
    setExito('');

    try {
      const productosInput = items.map((i) => ({
        productoId: i.id,
        cantidad: i.cantidad,
      }));

      const mutation = `
        mutation CrearPedido(
          $usuarioId: ID!,
          $productos: [ProductoInput!]!
        ) {
          crearPedido(
            usuarioId: $usuarioId,
            productos: $productos
          ) {
            id
            total
            estado
          }
        }
      `;

      const data = await gqlRequest<{
        crearPedido: {
          id: string;
          total: number;
          estado: string;
        };
      }>(
        mutation,
        {
          usuarioId: usuario.id,
          productos: productosInput,
        }
      );

      limpiarCarrito();

      setExito(
        `¡Pedido #${data.crearPedido.id.slice(0, 8)} creado! Total: $${data.crearPedido.total.toFixed(2)}`
      );

      setTimeout(() => {
        navigate('/perfil');
      }, 2500);
    } catch (err: unknown) {
      setError(
        (err as Error).message || 'Error al procesar el pedido.'
      );
    } finally {
      setProcesando(false);
    }
  };

  if (items.length === 0 && !exito) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-gray-400">
        <ShoppingBag size={64} className="opacity-20" />

        <p className="text-xl font-light">
          Tu carrito está vacío
        </p>

        <Link
          to="/productos"
          className="bg-primary text-white px-6 py-2.5 rounded-full text-sm hover:bg-accent hover:text-primary transition-all"
        >
          Ir al catálogo
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-primary mb-8">
        Mi Carrito
      </h1>

      {exito && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-6 py-4 rounded-xl mb-6 text-center font-medium">
          {exito}
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl mb-6">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl p-4 shadow-sm flex gap-4 items-center"
            >
              <div className="w-20 h-20 bg-neutral-100 rounded-xl overflow-hidden flex-shrink-0">
                {item.imagen ? (
                  <img
                    src={item.imagen}
                    alt={item.nombre}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ShoppingBag
                      size={28}
                      className="text-neutral-300"
                    />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-primary truncate">
                  {item.nombre}
                </h3>

                <p className="text-accent font-bold">
                  ${item.precio.toFixed(2)}
                </p>
              </div>

              <div className="flex items-center border border-gray-200 rounded-xl">
                <button
                  onClick={() =>
                    actualizarCantidad(
                      item.id,
                      item.cantidad - 1
                    )
                  }
                  className="px-3 py-2 hover:bg-neutral-100 rounded-l-xl"
                >
                  <Minus size={14} />
                </button>

                <span className="px-3 py-2 text-sm font-semibold">
                  {item.cantidad}
                </span>

                <button
                  onClick={() =>
                    actualizarCantidad(
                      item.id,
                      item.cantidad + 1
                    )
                  }
                  disabled={item.cantidad >= item.stock}
                  className="px-3 py-2 hover:bg-neutral-100 rounded-r-xl disabled:opacity-40"
                >
                  <Plus size={14} />
                </button>
              </div>

              <span className="font-bold text-primary min-w-[60px] text-right">
                ${(item.precio * item.cantidad).toFixed(2)}
              </span>

              <button
                id={`btn-quitar-${item.id}`}
                onClick={() => quitarItem(item.id)}
                className="text-gray-300 hover:text-red-500 transition-colors ml-2"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>

        {/* Resumen */}
        <div className="bg-white rounded-2xl p-6 shadow-sm h-fit sticky top-24">
          <h2 className="font-bold text-lg text-primary mb-4">
            Resumen del Pedido
          </h2>

          <div className="space-y-2 mb-4 text-sm">
            {items.map((i) => (
              <div
                key={i.id}
                className="flex justify-between text-gray-600"
              >
                <span className="truncate mr-2">
                  {i.nombre} ×{i.cantidad}
                </span>

                <span className="flex-shrink-0">
                  ${(i.precio * i.cantidad).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          <div className="border-t pt-4 flex justify-between font-bold text-lg text-primary mb-6">
            <span>Total</span>
            <span>${totalPrecio.toFixed(2)}</span>
          </div>

          <button
            id="btn-confirmar-pedido"
            onClick={handleComprar}
            disabled={procesando}
            className="w-full bg-primary text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-accent hover:text-primary transition-all disabled:opacity-50"
          >
            {procesando ? (
              'Procesando...'
            ) : (
              <>
                Confirmar Pedido
                <ArrowRight size={18} />
              </>
            )}
          </button>

          {!usuario && (
            <p className="text-xs text-gray-400 text-center mt-3">
              Debes iniciar sesión para comprar
            </p>
          )}
        </div>
      </div>
    </div>
  );
}