
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import RouteGuard from "./components/RouteGuard";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Aprendizado from "./pages/Aprendizado";
import AprendizadoDisciplina from "./pages/AprendizadoDisciplina";
import NotFound from "./pages/NotFound";
import SobreNos from "./pages/SobreNos";
import Apoiar from "./pages/Apoiar";
import Ajuda from "./pages/Ajuda";
import Simulado from "./pages/Simulado";
import SimuladosList from "./pages/SimuladosList";
import Redacao from "./pages/Redacao";
import RedacaoFeedback from "./pages/RedacaoFeedback";
import Diagnostico from "./pages/Diagnostico";
import Plano from "./pages/Plano";
import PlanoHistorico from "./pages/PlanoHistorico";
import Admin from "./pages/Admin";
import Unauthorized from "./pages/Unauthorized";
import React from 'react';

// Initialize the query client outside the component
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  return (
    <React.StrictMode>
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <Sonner richColors closeButton />
            <LanguageProvider>
              <AuthProvider>
                <Routes>
                  {/* Public routes - always accessible */}
                  <Route path="/" element={<Index />} />
                  <Route path="/sobre-nos" element={<SobreNos />} />
                  <Route path="/apoiar" element={<Apoiar />} />
                  <Route path="/ajuda" element={<Ajuda />} />
                  
                  {/* Auth routes - accessible only when NOT logged in */}
                  <Route element={<RouteGuard requiresAuth={false} />}>
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                  </Route>
                  
                  {/* Protected routes - require authentication */}
                  <Route element={<RouteGuard requiresAuth={true} />}>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/aprendizado" element={<Aprendizado />} />
                    <Route path="/aprendizado/:disciplina" element={<AprendizadoDisciplina />} />
                    <Route path="/simulado" element={<SimuladosList />} />
                    <Route path="/simulado/:id" element={<Simulado />} />
                    <Route path="/redacao" element={<Redacao />} />
                    <Route path="/redacao/feedback" element={<RedacaoFeedback />} />
                    <Route path="/diagnostico" element={<Diagnostico />} />
                    <Route path="/plano" element={<Plano />} />
                    <Route path="/plano/historico" element={<PlanoHistorico />} />
                  </Route>
                  
                  {/* Admin routes - require authentication AND admin role */}
                  <Route element={<RouteGuard requiresAuth={true} requiresAdmin={true} />}>
                    <Route path="/admin" element={<Admin />} />
                  </Route>
                  
                  {/* Unauthorized access page */}
                  <Route path="/unauthorized" element={<Unauthorized />} />
                  
                  {/* Catch-all route */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </AuthProvider>
            </LanguageProvider>
          </TooltipProvider>
        </QueryClientProvider>
      </BrowserRouter>
    </React.StrictMode>
  );
}

export default App;
