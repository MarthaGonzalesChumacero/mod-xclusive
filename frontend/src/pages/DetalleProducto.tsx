import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingBag, Star, ArrowLeft, Plus, Minus, Package } from 'lucide-react';
import api from '../services/api';
import { useCarrito } from '../context/CarritoContext';

interface Producto {
  id: string;
  nombre: string;
  descripcion: string;
  categoria: string;
  precio: number;
  stock: number;
  imagen: string;
}

export default function DetalleProducto() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [producto, setProducto] = useState<Producto | null>(null);
  const [cargando, setCargando] = useState(true);
  const [cantidad, setCantidad] = useState(1);
  const [agregado, setAgregado] = useState(false);
  const { agregarItem, items } = useCarrito();

  useEffect(() => {
    if (!id) return;
    api.get(`/productos/${id}`)
      .then(r => { setProducto(r.data); setCargando(false); })
      .catch(() => { navigate('/productos'); });
  }, [id, navigate]);

  const enCarrito = items.find(i => i.id === id);

  const handleAgregar = () => {
    if (!producto) return;
    for (let i = 0; i < cantidad; i++) {
      agregarItem({ id: producto.id, nombre: producto.nombre, precio: producto.precio, imagen: producto.imagen, stock: producto.stock });
    }
    setAgregado(true);
    setTimeout(() => setAgregado(false), 2000);
  };

  if (cargando) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
    </div>
  );

  if (!producto) return null;

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-primary transition-colors mb-8">
        <ArrowLeft size={16} /> Volver al catálogo
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Imagen */}
        <div className="bg-neutral-100 rounded-2xl overflow-hidden h-96 md:h-auto flex items-center justify-center">
          {producto.imagen ? (
            <img src={producto.imagen} alt={producto.nombre} className="w-full h-full object-cover" />
          ) : (
            <ShoppingBag size={80} className="text-neutral-200" />
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col justify-center">
          <span className="text-accent text-xs font-semibold tracking-widest uppercase mb-2">{producto.categoria}</span>
          <h1 className="text-3xl font-bold text-primary mb-3">{producto.nombre}</h1>

          <div className="flex items-center gap-2 mb-4">
            {[...Array(5)].map((_, i) => <Star key={i} size={16} className="fill-accent text-accent" />)}
            <span className="text-sm text-gray-400">(Reviews)</span>
          </div>

          <p className="text-gray-600 mb-6 leading-relaxed">{producto.descripcion}</p>

          <div className="text-4xl font-bold text-primary mb-6">${producto.precio.toFixed(2)}</div>

          {/* Stock */}
          <div className="flex items-center gap-2 mb-6">
            <Package size={16} className={producto.stock > 0 ? 'text-green-500' : 'text-red-400'} />
            <span className={`text-sm font-medium ${producto.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
              {producto.stock > 0 ? `${producto.stock} unidades disponibles` : 'Sin stock'}
            </span>
          </div>

          {/* Cantidad */}
          {producto.stock > 0 && (
            <div className="flex items-center gap-4 mb-6">
              <span className="text-sm font-medium text-gray-700">Cantidad:</span>
              <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                <button
                  id="btn-menos-cantidad"
                  onClick={() => setCantidad(c => Math.max(1, c - 1))}
                  className="px-4 py-2 hover:bg-neutral-100 transition-colors"
                >
                  <Minus size={16} />
                </button>
                <span className="px-4 py-2 font-semibold min-w-[3rem] text-center">{cantidad}</span>
                <button
                  id="btn-mas-cantidad"
                  onClick={() => setCantidad(c => Math.min(producto.stock, c + 1))}
                  className="px-4 py-2 hover:bg-neutral-100 transition-colors"
                >
                  <Plus size={16} />
                </button>
              </div>
              {enCarrito && <span className="text-xs text-accent">({enCarrito.cantidad} en carrito)</span>}
            </div>
          )}

          <button
            id="btn-agregar-carrito-detalle"
            onClick={handleAgregar}
            disabled={producto.stock === 0}
            className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all ${
              agregado
                ? 'bg-green-500 text-white'
                : 'bg-primary text-white hover:bg-accent hover:text-primary'
            } disabled:opacity-40`}
          >
            <ShoppingBag size={22} />
            {agregado ? '¡Añadido al carrito!' : 'Agregar al Carrito'}
          </button>
        </div>
      </div>
    </div>
  );
}
