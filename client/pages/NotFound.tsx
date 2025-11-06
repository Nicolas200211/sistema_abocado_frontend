import Layout from "@/components/Layout";
import { Link } from "react-router-dom";
import { AlertTriangle, Home } from "lucide-react";

export default function NotFound() {
  return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <AlertTriangle className="w-24 h-24 text-orange-600 mb-6" />
        <h1 className="text-4xl font-bold text-slate-900 mb-2">
          404 - Página no encontrada
        </h1>
        <p className="text-slate-600 text-lg mb-8">
          La página que buscas no existe
        </p>
        <Link
          to="/"
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-200"
        >
          <Home className="w-5 h-5" />
          Volver al Inicio
        </Link>
      </div>
    </Layout>
  );
}
