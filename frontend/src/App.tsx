import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CarritoProvider } from './context/CarritoContext';
import Navbar from './components/Navbar';
import RutaProtegida from './components/RutaProtegida';
import Inicio from './pages/Inicio';
import Login from './pages/Login';
import Registro from './pages/Registro';
import Productos from './pages/Productos';
import DetalleProducto from './pages/DetalleProducto';
import Carrito from './pages/Carrito';
import Perfil from './pages/Perfil';
import Admin from './pages/Admin';

function App() {
  return (
    <AuthProvider>
      <CarritoProvider>
        <BrowserRouter basename="/mod-xclusive">
          <Routes>
            {/* Rutas sin Navbar (auth) */}
            <Route path="/login" element={<Login />} />
            <Route path="/registro" element={<Registro />} />

            {/* Rutas con Navbar */}
            <Route
              path="/*"
              element={
                <div className="min-h-screen flex flex-col bg-neutral-100">
                  <Navbar />

                  <main className="flex-grow">
                    <Routes>
                      <Route path="/" element={<Inicio />} />
                      <Route path="/productos" element={<Productos />} />
                      <Route
                        path="/productos/:id"
                        element={<DetalleProducto />}
                      />
                      <Route path="/carrito" element={<Carrito />} />

                      <Route
                        path="/perfil"
                        element={
                          <RutaProtegida>
                            <Perfil />
                          </RutaProtegida>
                        }
                      />

                      <Route
                        path="/admin"
                        element={
                          <RutaProtegida soloAdmin>
                            <Admin />
                          </RutaProtegida>
                        }
                      />
                    </Routes>
                  </main>
                </div>
              }
            />
          </Routes>
        </BrowserRouter>
      </CarritoProvider>
    </AuthProvider>
  );
}

export default App;