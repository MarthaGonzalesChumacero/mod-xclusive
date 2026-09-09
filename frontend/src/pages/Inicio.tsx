import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, ArrowRight, Star } from 'lucide-react';
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

export default function Inicio() {
  const [destacados, setDestacados] = useState<Producto[]>([]);
  const { agregarItem } = useCarrito();

  useEffect(() => {
    api.get('/productos').then(r => setDestacados(r.data.slice(0, 6))).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative bg-primary text-white overflow-hidden">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 40px, rgba(212,175,55,0.1) 40px, rgba(212,175,55,0.1) 80px)' }} />
        <div className="relative max-w-7xl mx-auto px-6 py-28 flex flex-col items-center text-center gap-6">
          <span className="text-accent text-sm font-semibold tracking-[0.3em] uppercase">Nueva Colección 2026</span>
          <h1 className="text-5xl md:text-7xl font-bold leading-tight">
            Viste con<br /><span className="text-accent">Exclusividad</span>
          </h1>
          <p className="text-neutral-300 max-w-xl text-lg">
            Prendas seleccionadas para quienes exigen lo mejor. Estilo, calidad y elegancia en cada pieza.
          </p>
          <div className="flex gap-4 mt-4 flex-wrap justify-center">
            <Link
              to="/productos"
              id="btn-hero-catalogo"
              className="bg-accent text-primary font-bold px-8 py-3 rounded-full flex items-center gap-2 hover:bg-yellow-400 transition-all hover:scale-105"
            >
              Ver Catálogo <ArrowRight size={18} />
            </Link>
            <Link
              to="/registro"
              id="btn-hero-registro"
              className="border border-white/30 text-white px-8 py-3 rounded-full hover:border-accent hover:text-accent transition-all"
            >
              Crear Cuenta
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-accent/10 border-y border-accent/20 py-8">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-3 gap-4 text-center">
          {[
            { num: '+500', label: 'Prendas exclusivas' },
            { num: '+2K', label: 'Clientes satisfechos' },
            { num: '100%', label: 'Calidad garantizada' },
          ].map(s => (
            <div key={s.label}>
              <p className="text-2xl md:text-3xl font-bold text-primary">{s.num}</p>
              <p className="text-sm text-gray-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Productos destacados */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="flex items-center justify-between mb-10">
          <div>
            <p className="text-accent text-sm font-semibold tracking-widest uppercase mb-1">Lo más vendido</p>
            <h2 className="text-3xl font-bold text-primary">Productos Destacados</h2>
          </div>
          <Link to="/productos" className="flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-accent transition-colors">
            Ver todo <ArrowRight size={16} />
          </Link>
        </div>

        {destacados.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <ShoppingBag size={48} className="mx-auto mb-4 opacity-30" />
            <p>Cargando productos del catálogo...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {destacados.map(p => (
              <div key={p.id} className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="relative overflow-hidden bg-neutral-100 h-56">
                  {p.imagen ? (
                    <img src={p.imagen} alt={p.nombre} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ShoppingBag size={48} className="text-neutral-200" />
                    </div>
                  )}
                  <span className="absolute top-3 left-3 bg-primary text-white text-xs px-2 py-1 rounded-full">{p.categoria}</span>
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-1 mb-2">
                    {[...Array(5)].map((_, i) => <Star key={i} size={12} className="fill-accent text-accent" />)}
                  </div>
                  <h3 className="font-semibold text-primary mb-1 group-hover:text-accent transition-colors">{p.nombre}</h3>
                  <p className="text-sm text-gray-400 mb-4 line-clamp-2">{p.descripcion}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold text-primary">${p.precio.toFixed(2)}</span>
                    <div className="flex gap-2">
                      <Link
                        to={`/productos/${p.id}`}
                        className="text-xs border border-gray-200 px-3 py-1.5 rounded-lg hover:border-accent hover:text-accent transition-colors"
                      >
                        Ver más
                      </Link>
                      <button
                        onClick={() => agregarItem({ id: p.id, nombre: p.nombre, precio: p.precio, imagen: p.imagen, stock: p.stock })}
                        disabled={p.stock === 0}
                        className="text-xs bg-primary text-white px-3 py-1.5 rounded-lg hover:bg-accent hover:text-primary transition-colors disabled:opacity-40"
                      >
                        {p.stock === 0 ? 'Sin stock' : 'Añadir'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* CTA Banner */}
      <section className="bg-primary text-white py-16 text-center px-6">
        <h2 className="text-3xl font-bold mb-3">¿Lista para elevar tu estilo?</h2>
        <p className="text-neutral-300 mb-6">Únete a miles de personas que ya confían en MOD XCLUSIVE</p>
        <Link to="/registro" className="bg-accent text-primary font-bold px-8 py-3 rounded-full hover:bg-yellow-400 transition-all hover:scale-105 inline-flex items-center gap-2">
          Comenzar ahora <ArrowRight size={18} />
        </Link>
      </section>

      {/* Footer */}
      <footer className="bg-neutral-800 text-neutral-400 text-sm py-6 text-center">
        © 2026 MOD XCLUSIVE. Todos los derechos reservados. — Martha Gonzales Chumacero
      </footer>
    </div>
  );
}
