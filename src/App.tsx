
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Layout from "@/components/Layout";
import ProtectedRoute from "@/components/ProtectedRoute";

// Páginas públicas
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegistroPage from "./pages/RegistroPage";
import NotFound from "./pages/NotFound";
import CitaPublicaPage from "./pages/cliente/CitaPublicaPage";
import VerificarCitaPage from "./pages/cliente/VerificarCitaPage";

// Páginas de admin
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminSolicitudesPage from "./pages/admin/AdminSolicitudesPage";
import AdminCitasPage from "./pages/admin/AdminCitasPage";

// Páginas de negocio
import NegocioDashboard from "./pages/negocio/NegocioDashboard";
import NegocioCitasPage from "./pages/negocio/NegocioCitasPage";
import NegocioServiciosPage from "./pages/negocio/NegocioServiciosPage";
import NegocioHorariosPage from "./pages/negocio/NegocioHorariosPage";
import NegocioPerfilPage from "./pages/negocio/NegocioPerfilPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Layout>
            <Routes>
              {/* Rutas públicas */}
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/registro" element={<RegistroPage />} />
              <Route path="/verificar-cita" element={<VerificarCitaPage />} />
              <Route path="/:slug/cita" element={<CitaPublicaPage />} />
              
              {/* Rutas de administrador */}
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/solicitudes" 
                element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminSolicitudesPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/citas" 
                element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminCitasPage />
                  </ProtectedRoute>
                } 
              />
              
              {/* Rutas de negocio */}
              <Route 
                path="/negocio" 
                element={
                  <ProtectedRoute requiredRole="negocio">
                    <NegocioDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/negocio/citas" 
                element={
                  <ProtectedRoute requiredRole="negocio">
                    <NegocioCitasPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/negocio/servicios" 
                element={
                  <ProtectedRoute requiredRole="negocio">
                    <NegocioServiciosPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/negocio/horarios" 
                element={
                  <ProtectedRoute requiredRole="negocio">
                    <NegocioHorariosPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/negocio/perfil" 
                element={
                  <ProtectedRoute requiredRole="negocio">
                    <NegocioPerfilPage />
                  </ProtectedRoute>
                } 
              />
              
              {/* Ruta para errores 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
