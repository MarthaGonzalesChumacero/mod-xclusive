require('dotenv').config();
const { db } = require('./src/config/firebase');

const productos = [
  {
    nombre: 'Chaqueta Premium Negra',
    descripcion: 'Chaqueta de cuero vegano con acabados dorados. Elegante y resistente.',
    categoria: 'Formal',
    precio: 189.99,
    stock: 15,
    imagen: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400',
    createdAt: new Date().toISOString()
  },
  {
    nombre: 'Vestido Dorado de Noche',
    descripcion: 'Vestido midi con detalles dorados. Perfecto para eventos especiales.',
    categoria: 'Formal',
    precio: 129.99,
    stock: 8,
    imagen: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400',
    createdAt: new Date().toISOString()
  },
  {
    nombre: 'Jeans Slim Fit Oscuro',
    descripcion: 'Pantalón de mezclilla de corte ajustado. Tela premium de alta durabilidad.',
    categoria: 'Casual',
    precio: 79.99,
    stock: 30,
    imagen: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400',
    createdAt: new Date().toISOString()
  },
  {
    nombre: 'Blusa Blanca Elegante',
    descripcion: 'Blusa de seda sintética con cuello en V. Clásica y versátil.',
    categoria: 'Casual',
    precio: 59.99,
    stock: 20,
    imagen: 'https://images.unsplash.com/photo-1564257631407-4deb1f99d992?w=400',
    createdAt: new Date().toISOString()
  },
  {
    nombre: 'Zapatillas Urbanas Blancas',
    descripcion: 'Calzado deportivo de cuero blanco con suela de goma negra.',
    categoria: 'Calzado',
    precio: 99.99,
    stock: 25,
    imagen: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400',
    createdAt: new Date().toISOString()
  },
  {
    nombre: 'Cinturón de Cuero Negro',
    descripcion: 'Cinturón artesanal de cuero genuino con hebilla dorada.',
    categoria: 'Accesorios',
    precio: 39.99,
    stock: 50,
    imagen: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400',
    createdAt: new Date().toISOString()
  }
];

async function seed() {
  console.log('Creando productos de prueba en Firestore...');
  for (const producto of productos) {
    const ref = await db.collection('productos').add(producto);
    console.log(`✅ Creado: ${producto.nombre} (ID: ${ref.id})`);
  }
  console.log('\n🎉 Todos los productos de prueba creados exitosamente.');
  process.exit(0);
}

seed().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
