import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Search, Filter, Star } from 'lucide-react';
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

const CATEGORIAS = ['Todas', 'Ropa', 'Accesorios', 'Calzado', 'Deportivo', 'Formal', 'Casual'];

export default function Productos() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [filtrados, setFiltrados] = useState<Producto[]>([]);
  const [cargando, setCargando] = useState(true);
  const [buscar, setBuscar] = useState('');
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('Todas');
  const { agregarItem } = useCarrito();

  useEffect(() => {
    api.get('/productos')
      .then(r => { setProductos(r.data); setFiltrados(r.data); setCargando(false); })
      .catch(() => setCargando(false));
  }, []);

  useEffect(() => {
    let resultado = productos;
    if (categoriaSeleccionada !== 'Todas') {
      resultado = resultado.filter(p => p.categoria === categoriaSeleccionada);
    }
    if (buscar.trim()) {
      resultado = resultado.filter(p => p.nombre.toLowerCase().includes(buscar.toLowerCase()));
    }
    setFiltrados(resultado);
  }, [buscar, categoriaSeleccionada, productos]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      {/* Encabezado */}
      <div className="mb-8">
        <p className="text-accent text-sm font-semibold tracking-widest uppercase mb-1">Descubre</p>
        <h1 className="text-3xl font-bold text-primary">Nuestro Catálogo</h1>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            id="input-buscar-producto"
            type="text"
            placeholder="Buscar producto..."
            value={buscar}
            onChange={e => setBuscar(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <select
            id="select-categoria"
            value={categoriaSeleccionada}
            onChange={e => setCategoriaSeleccionada(e.target.value)}
            className="pl-10 pr-8 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent bg-white appearance-none"
          >
            {CATEGORIAS.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {/* Resultados */}
      <p className="text-sm text-gray-400 mb-6">{filtrados.length} producto{filtrados.length !== 1 ? 's' : ''} encontrado{filtrados.length !== 1 ? 's' : ''}</p>

      {cargando ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
        </div>
      ) : filtrados.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <ShoppingBag size={48} className="mx-auto mb-4 opacity-30" />
          <p>No se encontraron productos.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtrados.map(p => (
            <div key={p.id} className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="relative overflow-hidden bg-neutral-100 h-48">
                {p.imagen ? (
                  <img src={p.imagen} alt={p.nombre} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ShoppingBag size={40} className="text-neutral-200" />
                  </div>
                )}
                {p.stock === 0 && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">Sin Stock</span>
                  </div>
                )}
                <span className="absolute top-2 left-2 bg-primary text-white text-xs px-2 py-0.5 rounded-full">{p.categoria}</span>
              </div>
              <div className="p-4">
                <div className="flex items-center gap-0.5 mb-1">
                  {[...Array(5)].map((_, i) => <Star key={i} size={11} className="fill-accent text-accent" />)}
                </div>
                <h3 className="font-semibold text-sm text-primary mb-1 group-hover:text-accent transition-colors line-clamp-1">{p.nombre}</h3>
                <p className="text-xs text-gray-400 mb-3 line-clamp-2">{p.descripcion}</p>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-primary">${p.precio.toFixed(2)}</span>
                  <div className="flex gap-1.5">
                    <Link
                      to={`/productos/${p.id}`}
                      className="text-xs border border-gray-200 px-2.5 py-1 rounded-lg hover:border-accent hover:text-accent transition-colors"
                    >
                      Ver
                    </Link>
                    <button
                      id={`btn-agregar-${p.id}`}
                      onClick={() => agregarItem({ id: p.id, nombre: p.nombre, precio: p.precio, imagen: p.imagen, stock: p.stock })}
                      disabled={p.stock === 0}
                      className="text-xs bg-primary text-white px-2.5 py-1 rounded-lg hover:bg-accent hover:text-primary transition-colors disabled:opacity-40"
                    >
                      + Carrito
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
