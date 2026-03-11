import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Textos from "./pages/Textos";
import Noticias from "./pages/Noticias";
import Partido from "./pages/Partido";
import Contato from "./pages/Contato";
import Filiese from "./pages/Filiese";
import SobreNos from "./pages/SobreNos";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import Autor from "./pages/Autor";
import Artigo from "./pages/Artigo";
import Autores from "./pages/Autores";
import Categoria from "./pages/Categoria";
import Busca from "./pages/Busca";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/textos" element={<Textos />} />
          <Route path="/noticias" element={<Noticias />} />
          <Route path="/sobre-nos" element={<SobreNos />} />
          <Route path="/partido" element={<Partido />} />
          <Route path="/contato" element={<Contato />} />
          <Route path="/filie-se" element={<Filiese />} />
          <Route path="/artigo/:slug" element={<Artigo />} />
          <Route path="/autor/:slug" element={<Autor />} />
          <Route path="/autores" element={<Autores />} />
          <Route path="/categoria/:slug" element={<Categoria />} />
          <Route path="/busca" element={<Busca />} />
          <Route path="/gatewayhorsemint/login" element={<AdminLogin />} />
          <Route path="/gatewayhorsemint" element={<AdminDashboard />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
