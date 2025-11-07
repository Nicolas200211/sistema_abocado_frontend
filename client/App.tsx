import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/auth.context";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Home from "./pages/Home";
import Tables from "./pages/Tables";
import Kitchen from "./pages/Kitchen";
import Menu from "./pages/Menu";
import AdminPanel from "./pages/AdminPanel";
import Service from "./pages/Service";
import Login from "./pages/Login";
import PublicMenu from "./pages/PublicMenu";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/carta" element={<PublicMenu />} />
            <Route path="/dashboard" element={<ProtectedRoute><Index /></ProtectedRoute>} />
            <Route path="/tables" element={<ProtectedRoute allowedRoles={['admin', 'waiter']}><Tables /></ProtectedRoute>} />
            <Route path="/kitchen" element={<ProtectedRoute allowedRoles={['admin', 'chef']}><Kitchen /></ProtectedRoute>} />
            <Route path="/menu" element={<ProtectedRoute><Menu /></ProtectedRoute>} />
            <Route path="/service" element={<ProtectedRoute allowedRoles={['admin', 'waiter']}><Service /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminPanel /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
