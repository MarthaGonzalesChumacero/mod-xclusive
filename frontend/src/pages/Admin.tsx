import { useEffect, useState, FormEvent } from 'react';
import { ShoppingBag, Plus, Edit2, Trash2, X, Package, ChevronDown } from 'lucide-react';
import api from '../services/api';
import { gqlRequest } from '../services/graphql';

interface Producto {
  id: string;
  nombre: string;
  descripcion: string;
  categoria: string;
  precio: number;
  stock: number;
  imagen: string;
}

interface Pedido {
  id: string;
  usuarioId: string;
  total: number;
  estado: string;
  fecha: string;
  productos: { nombre: string; cantidad: number; subtotal: number }[];
}

const ESTADOS = ['Pendiente', 'Procesando', 'Enviado', 'Entregado'];
const ESTADO_COLORES: Record<string, string> = {
  'Pendiente': 'bg-yellow-100 text-yellow-700',
  'Procesando': 'bg-blue-100 text-blue-700',
  'Enviado': 'bg-purple-100 text-purple-700',
  'Entregado': 'bg-green-100 text-green-700',
};

const FORM_INICIAL = { nombre: '', descripcion: '', categoria: 'Ropa', precio: '', stock: '', imagen: '' };

export default function Admin() {
  const [tab, setTab] = useState<'productos' | 'pedidos'>('productos');
  const [productos, setProductos] = useState<Producto[]>([]);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [cargandoP, setCargandoP] = useState(true);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [editando, setEditando] = useState<Producto | null>(null);
  const [form, setForm] = useState(FORM_INICIAL);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');

  const cargarProductos = () => {
    api.get('/productos').then(r => { setProductos(r.data); setCargandoP(false); });
  };

  const cargarPedidos = () => {
    const query = `query { pedidos { id usuarioId total estado fecha productos { nombre cantidad subtotal } } }`;
    gqlRequest<{ pedidos: Pedido[] }>(query).then(d => setPedidos(d.pedidos)).catch(() => {});
  };

  useEffect(() => { cargarProductos(); cargarPedidos(); }, []);

  const abrirModal = (producto?: Producto) => {
    setError('');
    if (producto) {
      setEditando(producto);
      setForm({ nombre: producto.nombre, descripcion: producto.descripcion, categoria: producto.categoria, precio: String(producto.precio), stock: String(producto.stock), imagen: producto.imagen });
    } else {
      setEditando(null);
      setForm(FORM_INICIAL);
    }
    setModalAbierto(true);
  };

  const handleGuardar = async (e: FormEvent) => {
    e.preventDefault();
    setGuardando(true);
    setError('');
    const payload = { ...form, precio: parseFloat(form.precio), stock: parseInt(form.stock) };
    try {
      if (editando) {
        await api.put(`/productos/${editando.id}`, payload);
      } else {
        await api.post('/productos', payload);
      }
      setModalAbierto(false);
      cargarProductos();
    } catch (err: unknown) {
      setError((err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Error al guardar.');
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminar = async (id: string) => {
    if (!confirm('¿Eliminar este producto?')) return;
    await api.delete(`/productos/${id}`);
    cargarProductos();
  };

  const handleCambiarEstado = async (pedidoId: string, nuevoEstado: string) => {
    const mutation = `
      mutation { actualizarEstadoPedido(id: "${pedidoId}", estado: "${nuevoEstado}") { id estado } }
    `;
    try {
      await gqlRequest(mutation);
      cargarPedidos();
    } catch (err: unknown) {
      alert((err as Error).message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="flex items-center gap-3 mb-8">
        <h1 className="text-3xl font-bold text-primary">Panel Administrador</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 border-b border-gray-200">
        <button
          id="tab-productos"
          onClick={() => setTab('productos')}
          className={`pb-3 px-4 text-sm font-semibold transition-colors border-b-2 ${tab === 'productos' ? 'border-accent text-accent' : 'border-transparent text-gray-500 hover:text-primary'}`}
        >
          <ShoppingBag size={16} className="inline mr-2" />Productos
        </button>
        <button
          id="tab-pedidos"
          onClick={() => setTab('pedidos')}
          className={`pb-3 px-4 text-sm font-semibold transition-colors border-b-2 ${tab === 'pedidos' ? 'border-accent text-accent' : 'border-transparent text-gray-500 hover:text-primary'}`}
        >
          <Package size={16} className="inline mr-2" />Pedidos
        </button>
      </div>

      {/* === TAB PRODUCTOS === */}
      {tab === 'productos' && (
        <>
          <div className="flex justify-between items-center mb-6">
            <p className="text-sm text-gray-500">{productos.length} productos en el catálogo</p>
            <button
              id="btn-nuevo-producto"
              onClick={() => abrirModal()}
              className="bg-primary text-white px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 hover:bg-accent hover:text-primary transition-all"
            >
              <Plus size={18} /> Nuevo Producto
            </button>
          </div>

          {cargandoP ? (
            <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-accent"></div></div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-neutral-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-5 py-3 font-semibold text-gray-600">Producto</th>
                    <th className="text-left px-5 py-3 font-semibold text-gray-600 hidden md:table-cell">Categoría</th>
                    <th className="text-left px-5 py-3 font-semibold text-gray-600">Precio</th>
                    <th className="text-left px-5 py-3 font-semibold text-gray-600">Stock</th>
                    <th className="text-right px-5 py-3 font-semibold text-gray-600">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {productos.map(p => (
                    <tr key={p.id} className="hover:bg-neutral-50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-neutral-100 rounded-lg overflow-hidden flex-shrink-0">
                            {p.imagen ? <img src={p.imagen} alt={p.nombre} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><ShoppingBag size={16} className="text-neutral-300" /></div>}
                          </div>
                          <div>
                            <p className="font-medium text-primary">{p.nombre}</p>
                            <p className="text-xs text-gray-400 truncate max-w-[200px]">{p.descripcion}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 hidden md:table-cell">
                        <span className="bg-neutral-100 text-gray-600 text-xs px-2 py-1 rounded-full">{p.categoria}</span>
                      </td>
                      <td className="px-5 py-4 font-semibold text-primary">${p.precio.toFixed(2)}</td>
                      <td className="px-5 py-4">
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${p.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                          {p.stock}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button id={`btn-editar-${p.id}`} onClick={() => abrirModal(p)} className="p-2 rounded-lg hover:bg-blue-50 text-blue-500 transition-colors"><Edit2 size={16} /></button>
                          <button id={`btn-eliminar-${p.id}`} onClick={() => handleEliminar(p.id)} className="p-2 rounded-lg hover:bg-red-50 text-red-500 transition-colors"><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* === TAB PEDIDOS === */}
      {tab === 'pedidos' && (
        <div className="space-y-4">
          {pedidos.length === 0 ? (
            <div className="text-center py-12 text-gray-400 bg-white rounded-2xl shadow-sm">
              <Package size={48} className="mx-auto mb-3 opacity-20" />
              <p>No hay pedidos registrados.</p>
            </div>
          ) : pedidos.map(pedido => (
            <div key={pedido.id} className="bg-white rounded-2xl shadow-sm p-5">
              <div className="flex flex-wrap items-center gap-4 justify-between">
                <div>
                  <p className="font-semibold text-primary">Pedido #{pedido.id.slice(0, 8)}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{new Date(pedido.fecha).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  <p className="text-xs text-gray-500 mt-0.5">Usuario: {pedido.usuarioId.slice(0, 12)}...</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-bold text-primary">${pedido.total.toFixed(2)}</span>
                  <div className="relative">
                    <select
                      id={`select-estado-${pedido.id}`}
                      value={pedido.estado}
                      onChange={e => handleCambiarEstado(pedido.id, e.target.value)}
                      className={`text-xs font-medium px-3 py-1.5 rounded-full appearance-none pr-7 cursor-pointer border-0 ${ESTADO_COLORES[pedido.estado] || 'bg-gray-100'}`}
                    >
                      {ESTADOS.map(e => <option key={e} value={e}>{e}</option>)}
                    </select>
                    <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
              </div>
              <div className="border-t mt-4 pt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {pedido.productos.map((p, i) => (
                  <div key={i} className="text-xs text-gray-500 bg-neutral-50 px-3 py-2 rounded-lg flex justify-between">
                    <span>{p.nombre} ×{p.cantidad}</span>
                    <span className="font-medium text-primary">${p.subtotal.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* === MODAL CREAR/EDITAR PRODUCTO === */}
      {modalAbierto && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="font-bold text-primary text-lg">{editando ? 'Editar Producto' : 'Nuevo Producto'}</h2>
              <button id="btn-cerrar-modal" onClick={() => setModalAbierto(false)} className="text-gray-400 hover:text-primary"><X size={22} /></button>
            </div>
            <form id="form-producto-admin" onSubmit={handleGuardar} className="px-6 py-5 space-y-4">
              {error && <div className="bg-red-50 text-red-700 text-sm px-4 py-2 rounded-lg">{error}</div>}
              {[
                { label: 'Nombre', key: 'nombre', type: 'text', required: true },
                { label: 'Descripción', key: 'descripcion', type: 'text' },
                { label: 'Precio ($)', key: 'precio', type: 'number', required: true },
                { label: 'Stock', key: 'stock', type: 'number', required: true },
                { label: 'URL de imagen', key: 'imagen', type: 'url' },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
                  <input
                    id={`input-${f.key}`}
                    type={f.type}
                    required={f.required}
                    value={form[f.key as keyof typeof form]}
                    onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                <select
                  id="input-categoria"
                  value={form.categoria}
                  onChange={e => setForm(prev => ({ ...prev, categoria: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent bg-white"
                >
                  {['Ropa', 'Accesorios', 'Calzado', 'Deportivo', 'Formal', 'Casual'].map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <button
                id="btn-guardar-producto"
                type="submit"
                disabled={guardando}
                className="w-full bg-primary text-white py-3 rounded-xl font-semibold hover:bg-accent hover:text-primary transition-all disabled:opacity-50"
              >
                {guardando ? 'Guardando...' : editando ? 'Actualizar Producto' : 'Crear Producto'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
