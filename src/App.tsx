
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import RouteGuard from "./components/RouteGuard";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Aprendizado from "./pages/Aprendizado";
import NotFound from "./pages/NotFound";
import SobreNos from "./pages/SobreNos";
import Apoiar from "./pages/Apoiar";
import Simulado from "./pages/Simulado";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Index />} />
            <Route path="/sobre-nos" element={<SobreNos />} />
            <Route path="/apoiar" element={<Apoiar />} />
            
            {/* Auth routes - accessible only when NOT logged in */}
            <Route element={<RouteGuard requiresAuth={false} />}>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
            </Route>
            
            {/* Protected routes - require authentication */}
            <Route element={<RouteGuard requiresAuth={true} />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/aprendizado" element={<Aprendizado />} />
              <Route path="/simulado/:id" element={<Simulado />} />
              {/* Add more protected routes here */}
              {/* <Route path="/simulado" element={<Simulado />} /> */}
              {/* <Route path="/plano" element={<Plano />} /> */}
            </Route>
            
            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
