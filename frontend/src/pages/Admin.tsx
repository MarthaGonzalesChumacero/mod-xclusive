import {
  useEffect,
  useState,
  type FormEvent,
  type ChangeEvent,
} from 'react';

import {
  ShoppingBag,
  Plus,
  Edit2,
  Trash2,
  X,
  Package,
  ChevronDown,
  ImagePlus,
} from 'lucide-react';

import api from '../services/api';
import { gqlRequest } from '../services/graphql';
import { subirImagenCloudinary } from '../services/cloudinary';

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
  productos: {
    nombre: string;
    cantidad: number;
    subtotal: number;
  }[];
}

const ESTADOS = [
  'Pendiente',
  'Procesando',
  'Enviado',
  'Entregado',
];

const ESTADO_COLORES: Record<string, string> = {
  Pendiente: 'bg-yellow-100 text-yellow-700',
  Procesando: 'bg-blue-100 text-blue-700',
  Enviado: 'bg-purple-100 text-purple-700',
  Entregado: 'bg-green-100 text-green-700',
};

const FORM_INICIAL = {
  nombre: '',
  descripcion: '',
  categoria: 'Ropa',
  precio: '',
  stock: '',
  imagen: '',
};

export default function Admin() {
  const [tab, setTab] =
    useState<'productos' | 'pedidos'>('productos');

  const [productos, setProductos] =
    useState<Producto[]>([]);

  const [pedidos, setPedidos] =
    useState<Pedido[]>([]);

  const [cargandoP, setCargandoP] =
    useState(true);

  const [modalAbierto, setModalAbierto] =
    useState(false);

  const [editando, setEditando] =
    useState<Producto | null>(null);

  const [form, setForm] =
    useState(FORM_INICIAL);

  const [guardando, setGuardando] =
    useState(false);

  const [error, setError] =
    useState('');

  // Imagen seleccionada desde la computadora
  const [archivoImagen, setArchivoImagen] =
    useState<File | null>(null);

  // Imagen que se mostrará antes de guardar
  const [previewImagen, setPreviewImagen] =
    useState('');

  const [subiendoImagen, setSubiendoImagen] =
    useState(false);

  const cargarProductos = () => {
    api
      .get('/productos')
      .then((r) => {
        setProductos(r.data);
        setCargandoP(false);
      })
      .catch(() => {
        setCargandoP(false);
      });
  };

  const cargarPedidos = () => {
    const query = `
      query {
        pedidos {
          id
          usuarioId
          total
          estado
          fecha
          productos {
            nombre
            cantidad
            subtotal
          }
        }
      }
    `;

    gqlRequest<{ pedidos: Pedido[] }>(query)
      .then((d) => setPedidos(d.pedidos))
      .catch(() => {});
  };

  useEffect(() => {
    cargarProductos();
    cargarPedidos();
  }, []);

  // ===============================
  // ABRIR MODAL
  // ===============================
  const abrirModal = (producto?: Producto) => {
    setError('');
    setArchivoImagen(null);

    if (producto) {
      setEditando(producto);

      setForm({
        nombre: producto.nombre,
        descripcion: producto.descripcion,
        categoria: producto.categoria,
        precio: String(producto.precio),
        stock: String(producto.stock),
        imagen: producto.imagen,
      });

      // Mostrar la imagen que ya tiene
      setPreviewImagen(producto.imagen || '');
    } else {
      setEditando(null);
      setForm(FORM_INICIAL);
      setPreviewImagen('');
    }

    setModalAbierto(true);
  };

  // ===============================
  // SELECCIONAR IMAGEN
  // ===============================
  const handleSeleccionarImagen = (
    e: ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const formatosPermitidos = ['image/jpeg', 'image/png', 'image/webp'];
    if (!formatosPermitidos.includes(file.type)) {
      setError(
        'Formato no permitido. Por favor selecciona una imagen JPG, PNG o WEBP.'
      );
      return;
    }

    // Máximo 5 MB
    if (file.size > 5 * 1024 * 1024) {
      setError(
        'La imagen no debe superar los 5 MB.'
      );
      return;
    }

    setError('');
    setArchivoImagen(file);

    // Crear vista previa
    const reader = new FileReader();

    reader.onload = () => {
      setPreviewImagen(
        typeof reader.result === 'string'
          ? reader.result
          : ''
      );
    };

    reader.readAsDataURL(file);
  };

  // ===============================
  // GUARDAR PRODUCTO
  // ===============================
  const handleGuardar = async (
    e: FormEvent
  ) => {
    e.preventDefault();

    setGuardando(true);
    setError('');

    try {
      let imagenUrl = form.imagen;

      // Si eligió una imagen nueva,
      // primero se sube a Cloudinary
      if (archivoImagen) {
        setSubiendoImagen(true);

        imagenUrl =
          await subirImagenCloudinary(
            archivoImagen
          );

        setSubiendoImagen(false);
      }

      const payload = {
        ...form,
        precio: parseFloat(form.precio),
        stock: parseInt(form.stock),
        imagen: imagenUrl,
      };

      if (editando) {
        await api.put(
          `/productos/${editando.id}`,
          payload
        );
      } else {
        await api.post(
          '/productos',
          payload
        );
      }

      setModalAbierto(false);
      setArchivoImagen(null);
      setPreviewImagen('');
      setForm(FORM_INICIAL);

      cargarProductos();
    } catch (err: unknown) {
      setSubiendoImagen(false);

      const mensajeApi = (
        err as {
          response?: {
            data?: {
              error?: string;
            };
          };
        }
      )?.response?.data?.error;

      const mensajeGeneral =
        err instanceof Error ? err.message : undefined;

      setError(
        mensajeApi ||
        mensajeGeneral ||
        'Error al guardar el producto o procesar la imagen.'
      );
    } finally {
      setGuardando(false);
      setSubiendoImagen(false);
    }
  };

  // ===============================
  // ELIMINAR PRODUCTO
  // ===============================
  const handleEliminar = async (
    id: string
  ) => {
    if (
      !confirm(
        '¿Eliminar este producto?'
      )
    ) {
      return;
    }

    await api.delete(
      `/productos/${id}`
    );

    cargarProductos();
  };

  // ===============================
  // CAMBIAR ESTADO PEDIDO
  // ===============================
  const handleCambiarEstado = async (
    pedidoId: string,
    nuevoEstado: string
  ) => {
    const mutation = `
      mutation {
        actualizarEstadoPedido(
          id: "${pedidoId}",
          estado: "${nuevoEstado}"
        ) {
          id
          estado
        }
      }
    `;

    try {
      await gqlRequest(mutation);
      cargarPedidos();
    } catch (err: unknown) {
      alert(
        (err as Error).message
      );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">

      <div className="flex items-center gap-3 mb-8">
        <h1 className="text-3xl font-bold text-primary">
          Panel Administrador
        </h1>
      </div>

      {/* TABS */}
      <div className="flex gap-2 mb-8 border-b border-gray-200">

        <button
          id="tab-productos"
          onClick={() =>
            setTab('productos')
          }
          className={`pb-3 px-4 text-sm font-semibold transition-colors border-b-2 ${
            tab === 'productos'
              ? 'border-accent text-accent'
              : 'border-transparent text-gray-500 hover:text-primary'
          }`}
        >
          <ShoppingBag
            size={16}
            className="inline mr-2"
          />
          Productos
        </button>

        <button
          id="tab-pedidos"
          onClick={() =>
            setTab('pedidos')
          }
          className={`pb-3 px-4 text-sm font-semibold transition-colors border-b-2 ${
            tab === 'pedidos'
              ? 'border-accent text-accent'
              : 'border-transparent text-gray-500 hover:text-primary'
          }`}
        >
          <Package
            size={16}
            className="inline mr-2"
          />
          Pedidos
        </button>
      </div>

      {/* ============================
          PRODUCTOS
      ============================ */}

      {tab === 'productos' && (
        <>
          <div className="flex justify-between items-center mb-6">

            <p className="text-sm text-gray-500">
              {productos.length} productos
              en el catálogo
            </p>

            <button
              id="btn-nuevo-producto"
              onClick={() =>
                abrirModal()
              }
              className="bg-primary text-white px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 hover:bg-accent hover:text-primary transition-all"
            >
              <Plus size={18} />
              Nuevo Producto
            </button>

          </div>

          {cargandoP ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-accent" />
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">

              <table className="w-full text-sm">

                <thead className="bg-neutral-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-5 py-3 font-semibold text-gray-600">
                      Producto
                    </th>

                    <th className="text-left px-5 py-3 font-semibold text-gray-600 hidden md:table-cell">
                      Categoría
                    </th>

                    <th className="text-left px-5 py-3 font-semibold text-gray-600">
                      Precio
                    </th>

                    <th className="text-left px-5 py-3 font-semibold text-gray-600">
                      Stock
                    </th>

                    <th className="text-right px-5 py-3 font-semibold text-gray-600">
                      Acciones
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-50">

                  {productos.map((p) => (
                    <tr
                      key={p.id}
                      className="hover:bg-neutral-50 transition-colors"
                    >

                      <td className="px-5 py-4">

                        <div className="flex items-center gap-3">

                          <div className="w-10 h-10 bg-neutral-100 rounded-lg overflow-hidden flex-shrink-0">

                            {p.imagen ? (
                              <img
                                src={p.imagen}
                                alt={p.nombre}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <ShoppingBag
                                  size={16}
                                  className="text-neutral-300"
                                />
                              </div>
                            )}

                          </div>

                          <div>

                            <p className="font-medium text-primary">
                              {p.nombre}
                            </p>

                            <p className="text-xs text-gray-400 truncate max-w-[200px]">
                              {p.descripcion}
                            </p>

                          </div>

                        </div>

                      </td>

                      <td className="px-5 py-4 hidden md:table-cell">

                        <span className="bg-neutral-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                          {p.categoria}
                        </span>

                      </td>

                      <td className="px-5 py-4 font-semibold text-primary">
                        ${p.precio.toFixed(2)}
                      </td>

                      <td className="px-5 py-4">

                        <span
                          className={`text-xs font-medium px-2 py-1 rounded-full ${
                            p.stock > 0
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-600'
                          }`}
                        >
                          {p.stock}
                        </span>

                      </td>

                      <td className="px-5 py-4 text-right">

                        <div className="flex justify-end gap-2">

                          <button
                            id={`btn-editar-${p.id}`}
                            onClick={() =>
                              abrirModal(p)
                            }
                            className="p-2 rounded-lg hover:bg-blue-50 text-blue-500 transition-colors"
                          >
                            <Edit2 size={16} />
                          </button>

                          <button
                            id={`btn-eliminar-${p.id}`}
                            onClick={() =>
                              handleEliminar(
                                p.id
                              )
                            }
                            className="p-2 rounded-lg hover:bg-red-50 text-red-500 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>

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

      {/* ============================
          PEDIDOS
      ============================ */}

      {tab === 'pedidos' && (
        <div className="space-y-4">

          {pedidos.length === 0 ? (

            <div className="text-center py-12 text-gray-400 bg-white rounded-2xl shadow-sm">

              <Package
                size={48}
                className="mx-auto mb-3 opacity-20"
              />

              <p>
                No hay pedidos registrados.
              </p>

            </div>

          ) : (

            pedidos.map((pedido) => (

              <div
                key={pedido.id}
                className="bg-white rounded-2xl shadow-sm p-5"
              >

                <div className="flex flex-wrap items-center gap-4 justify-between">

                  <div>

                    <p className="font-semibold text-primary">
                      Pedido #
                      {pedido.id.slice(
                        0,
                        8
                      )}
                    </p>

                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(
                        pedido.fecha
                      ).toLocaleDateString(
                        'es-ES',
                        {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        }
                      )}
                    </p>

                    <p className="text-xs text-gray-500 mt-0.5">
                      Usuario:{' '}
                      {pedido.usuarioId.slice(
                        0,
                        12
                      )}
                      ...
                    </p>

                  </div>

                  <div className="flex items-center gap-4">

                    <span className="font-bold text-primary">
                      $
                      {pedido.total.toFixed(
                        2
                      )}
                    </span>

                    <div className="relative">

                      <select
                        id={`select-estado-${pedido.id}`}
                        value={
                          pedido.estado
                        }
                        onChange={(e) =>
                          handleCambiarEstado(
                            pedido.id,
                            e.target.value
                          )
                        }
                        className={`text-xs font-medium px-3 py-1.5 rounded-full appearance-none pr-7 cursor-pointer border-0 ${
                          ESTADO_COLORES[
                            pedido.estado
                          ] ||
                          'bg-gray-100'
                        }`}
                      >

                        {ESTADOS.map(
                          (estado) => (
                            <option
                              key={
                                estado
                              }
                              value={
                                estado
                              }
                            >
                              {estado}
                            </option>
                          )
                        )}

                      </select>

                      <ChevronDown
                        size={12}
                        className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none"
                      />

                    </div>

                  </div>

                </div>

                <div className="border-t mt-4 pt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">

                  {pedido.productos.map(
                    (p, i) => (

                      <div
                        key={i}
                        className="text-xs text-gray-500 bg-neutral-50 px-3 py-2 rounded-lg flex justify-between"
                      >

                        <span>
                          {p.nombre} ×
                          {p.cantidad}
                        </span>

                        <span className="font-medium text-primary">
                          $
                          {p.subtotal.toFixed(
                            2
                          )}
                        </span>

                      </div>

                    )
                  )}

                </div>

              </div>

            ))
          )}

        </div>
      )}

      {/* ============================
          MODAL CREAR / EDITAR
      ============================ */}

      {modalAbierto && (

        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">

          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">

            <div className="flex items-center justify-between px-6 py-4 border-b">

              <h2 className="font-bold text-primary text-lg">
                {editando
                  ? 'Editar Producto'
                  : 'Nuevo Producto'}
              </h2>

              <button
                id="btn-cerrar-modal"
                onClick={() =>
                  setModalAbierto(false)
                }
                className="text-gray-400 hover:text-primary"
              >
                <X size={22} />
              </button>

            </div>

            <form
              id="form-producto-admin"
              onSubmit={
                handleGuardar
              }
              className="px-6 py-5 space-y-4"
            >

              {error && (
                <div className="bg-red-50 text-red-700 text-sm px-4 py-2 rounded-lg">
                  {error}
                </div>
              )}

              {/* NOMBRE */}
              <div>

                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre
                </label>

                <input
                  id="input-nombre"
                  type="text"
                  required
                  value={form.nombre}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      nombre:
                        e.target.value,
                    }))
                  }
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                />

              </div>

              {/* DESCRIPCIÓN */}
              <div>

                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción
                </label>

                <input
                  id="input-descripcion"
                  type="text"
                  value={
                    form.descripcion
                  }
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      descripcion:
                        e.target.value,
                    }))
                  }
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                />

              </div>

              {/* PRECIO */}
              <div>

                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Precio ($)
                </label>

                <input
                  id="input-precio"
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={form.precio}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      precio:
                        e.target.value,
                    }))
                  }
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                />

              </div>

              {/* STOCK */}
              <div>

                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Stock
                </label>

                <input
                  id="input-stock"
                  type="number"
                  min="0"
                  required
                  value={form.stock}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      stock:
                        e.target.value,
                    }))
                  }
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                />

              </div>

              {/* CATEGORÍA */}
              <div>

                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categoría
                </label>

                <select
                  id="input-categoria"
                  value={
                    form.categoria
                  }
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      categoria:
                        e.target.value,
                    }))
                  }
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent bg-white"
                >

                  {[
                    'Ropa',
                    'Accesorios',
                    'Calzado',
                    'Deportivo',
                    'Formal',
                    'Casual',
                  ].map((categoria) => (

                    <option
                      key={
                        categoria
                      }
                      value={
                        categoria
                      }
                    >
                      {categoria}
                    </option>

                  ))}

                </select>

              </div>

              {/* =========================
                  IMAGEN
              ========================= */}

              <div>

                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Imagen del producto
                </label>

                <label
                  htmlFor="input-imagen"
                  className="border-2 border-dashed border-gray-200 rounded-xl p-5 flex flex-col items-center justify-center cursor-pointer hover:border-accent transition-colors"
                >

                  <ImagePlus
                    size={30}
                    className="text-gray-400 mb-2"
                  />

                  <span className="text-sm font-medium text-gray-600">
                    Seleccionar imagen
                  </span>

                  <span className="text-xs text-gray-400 mt-1">
                    JPG, PNG o WEBP · Máx. 5 MB
                  </span>

                </label>

                <input
                  id="input-imagen"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={
                    handleSeleccionarImagen
                  }
                  className="hidden"
                />

              </div>

              {/* VISTA PREVIA */}
              {previewImagen && (

                <div>

                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Vista previa
                  </p>

                  <div className="w-full h-56 rounded-xl overflow-hidden bg-neutral-100 border border-gray-200">

                    <img
                      src={
                        previewImagen
                      }
                      alt="Vista previa"
                      className="w-full h-full object-cover"
                    />

                  </div>

                </div>

              )}

              {/* BOTÓN GUARDAR */}
              <button
                id="btn-guardar-producto"
                type="submit"
                disabled={
                  guardando ||
                  subiendoImagen
                }
                className="w-full bg-primary text-white py-3 rounded-xl font-semibold hover:bg-accent hover:text-primary transition-all disabled:opacity-50"
              >

                {subiendoImagen
                  ? 'Subiendo imagen...'
                  : guardando
                  ? 'Guardando...'
                  : editando
                  ? 'Actualizar Producto'
                  : 'Crear Producto'}

              </button>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}