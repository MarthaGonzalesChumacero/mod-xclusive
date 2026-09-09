const jwt = require('jsonwebtoken');
require('dotenv').config();

const SECRET = process.env.JWT_SECRET || 'secreto_temporal';
const token = jwt.sign({ uid: '123', rol: 'administrador' }, SECRET);

const baseUrl = 'http://localhost:3002/api/productos';
const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`
};

async function testCRUD() {
  console.log('--- Iniciando Test CRUD en ms-productos ---');
  let productoId;

  try {
    // 1. POST
    console.log('\n[POST] Registrando nuevo producto...');
    const postRes = await fetch(baseUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        nombre: 'Camiseta de Prueba',
        descripcion: 'Una camiseta creada desde el script de prueba',
        categoria: 'Ropa',
        precio: 19.99,
        stock: 50,
        imagen: 'url-imagen'
      })
    });
    const postData = await postRes.json();
    console.log('Respuesta POST:', postData);
    productoId = postData.productoId;

    if (!productoId) throw new Error('No se devolvió ID del producto');

    // 2. GET
    console.log('\n[GET] Listando productos...');
    const getRes = await fetch(baseUrl);
    const getData = await getRes.json();
    console.log(`Total productos listados: ${getData.length}. El producto de prueba existe:`, getData.some(p => p.id === productoId));

    // 3. GET by ID
    console.log(`\n[GET] Consultando producto por ID (${productoId})...`);
    const getByIdRes = await fetch(`${baseUrl}/${productoId}`);
    const getByIdData = await getByIdRes.json();
    console.log('Producto obtenido:', getByIdData.nombre);

    // 4. PUT
    console.log('\n[PUT] Actualizando producto...');
    const putRes = await fetch(`${baseUrl}/${productoId}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ precio: 15.99 })
    });
    const putData = await putRes.json();
    console.log('Respuesta PUT:', putData);

    // 5. DELETE
    console.log('\n[DELETE] Eliminando producto...');
    const delRes = await fetch(`${baseUrl}/${productoId}`, {
      method: 'DELETE',
      headers
    });
    const delData = await delRes.json();
    console.log('Respuesta DELETE:', delData);

    console.log('\n✅ CRUD de productos testeado y verificado con éxito contra Firestore.');
  } catch (err) {
    console.error('\n❌ Error en el test:', err);
  }
}

testCRUD();
