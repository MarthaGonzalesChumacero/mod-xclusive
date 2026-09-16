import { createContext, useContext, useState, type ReactNode } from 'react';

export interface ItemCarrito {
  id: string;
  nombre: string;
  precio: number;
  imagen: string;
  cantidad: number;
  stock: number;
}

interface CarritoContextType {
  items: ItemCarrito[];
  agregarItem: (producto: Omit<ItemCarrito, 'cantidad'>) => void;
  quitarItem: (id: string) => void;
  actualizarCantidad: (id: string, cantidad: number) => void;
  limpiarCarrito: () => void;
  totalItems: number;
  totalPrecio: number;
}

const CarritoContext = createContext<CarritoContextType>({} as CarritoContextType);

export function CarritoProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ItemCarrito[]>([]);

  const agregarItem = (producto: Omit<ItemCarrito, 'cantidad'>) => {
    setItems(prev => {
      const existe = prev.find(i => i.id === producto.id);
      if (existe) {
        if (existe.cantidad >= producto.stock) return prev;
        return prev.map(i => i.id === producto.id ? { ...i, cantidad: i.cantidad + 1 } : i);
      }
      return [...prev, { ...producto, cantidad: 1 }];
    });
  };

  const quitarItem = (id: string) => setItems(prev => prev.filter(i => i.id !== id));

  const actualizarCantidad = (id: string, cantidad: number) => {
    if (cantidad <= 0) { quitarItem(id); return; }
    setItems(prev => prev.map(i => i.id === id ? { ...i, cantidad } : i));
  };

  const limpiarCarrito = () => setItems([]);

  const totalItems = items.reduce((s, i) => s + i.cantidad, 0);
  const totalPrecio = items.reduce((s, i) => s + i.precio * i.cantidad, 0);

  return (
    <CarritoContext.Provider value={{ items, agregarItem, quitarItem, actualizarCantidad, limpiarCarrito, totalItems, totalPrecio }}>
      {children}
    </CarritoContext.Provider>
  );
}

export const useCarrito = () => useContext(CarritoContext);
