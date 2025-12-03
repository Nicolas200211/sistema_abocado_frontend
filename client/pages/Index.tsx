import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import { tablesApi, ordersApi, dishesApi } from "@/lib/api";
import {
  Users,
  Clock,
  CheckCircle,
  TrendingUp,
  AlertCircle,
  Activity,
  Loader2,
} from "lucide-react";

export default function Index() {
  const { data: tables = [], isLoading: tablesLoading } = useQuery({
    queryKey: ['tables'],
    queryFn: tablesApi.getAll,
  });

  const { data: orders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: () => ordersApi.getAll({ status: 'active' }),
  });

  const { data: dishes = [], isLoading: dishesLoading } = useQuery({
    queryKey: ['dishes'],
    queryFn: dishesApi.getAll,
  });

  const allOrderItems = useMemo(() => {
    return orders.flatMap((order) => order.items);
  }, [orders]);

  const stats = {
    tablesTotal: tables.length,
    tablesOccupied: tables.filter((t) => t.status === "occupied").length,
    tablesAvailable: tables.filter((t) => t.status === "available").length,
    ordersActive: orders.filter((o) => o.status === "active").length,
    itemsPending: allOrderItems.filter((i) => i.status === "pending").length,
    itemsPreparing: allOrderItems.filter((i) => i.status === "preparing")
      .length,
    itemsReady: allOrderItems.filter((i) => i.status === "ready").length,
    revenue: orders.reduce((sum, order) => sum + (order.total || 0), 0),
  };

  const isLoading = tablesLoading || ordersLoading || dishesLoading;

  const occupancyRate = Math.round(
    (stats.tablesOccupied / stats.tablesTotal) * 100
  );

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-slate-400 text-lg">
            Resumen general del estado del restaurante
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="relative overflow-hidden bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-blue-500/20 transition-colors" />
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-3">
                    Ocupación
                  </p>
                  <p className="text-4xl font-black text-white mb-2">
                    {stats.tablesOccupied}<span className="text-2xl text-slate-500">/{stats.tablesTotal}</span>
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-400" />
                </div>
              </div>
              <div className="w-full bg-slate-700/50 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-500 to-blue-600 h-2.5 rounded-full transition-all duration-500 shadow-lg shadow-blue-500/50"
                  style={{ width: `${occupancyRate}%` }}
                />
              </div>
              <p className="text-xs text-slate-400 mt-3 font-medium">{occupancyRate}% ocupación</p>
            </div>
          </div>

          <div className="relative overflow-hidden bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-red-500/20 transition-colors" />
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-3">
                    Pendientes
                  </p>
                  <p className="text-4xl font-black text-red-400 mb-2">
                    {stats.itemsPending}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-red-500/20 border border-red-500/30 flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-red-400" />
                </div>
              </div>
              <p className="text-xs text-slate-400 font-medium">Órdenes esperando inicio</p>
            </div>
          </div>

          <div className="relative overflow-hidden bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-amber-500/20 transition-colors" />
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-3">
                    Preparando
                  </p>
                  <p className="text-4xl font-black text-amber-400 mb-2">
                    {stats.itemsPreparing}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-amber-400" />
                </div>
              </div>
              <p className="text-xs text-slate-400 font-medium">En cocina ahora</p>
            </div>
          </div>

          <div className="relative overflow-hidden bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-emerald-500/20 transition-colors" />
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-3">
                    Listos
                  </p>
                  <p className="text-4xl font-black text-emerald-400 mb-2">
                    {stats.itemsReady}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-emerald-400" />
                </div>
              </div>
              <p className="text-xs text-slate-400 font-medium">Esperando recogida</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="relative overflow-hidden bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">
                Ingresos
              </p>
              <div className="w-10 h-10 rounded-xl bg-green-500/20 border border-green-500/30 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-400" />
              </div>
            </div>
            <p className="text-3xl font-bold text-white mb-1">
              ${stats.revenue.toFixed(2)}
            </p>
            <p className="text-xs text-slate-400 font-medium">Órdenes completadas</p>
          </div>

          <div className="relative overflow-hidden bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">
                Órdenes Activas
              </p>
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
                <Activity className="w-5 h-5 text-purple-400" />
              </div>
            </div>
            <p className="text-3xl font-bold text-white mb-1">{stats.ordersActive}</p>
            <p className="text-xs text-slate-400 font-medium">En proceso</p>
          </div>

          <div className="relative overflow-hidden bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">
                Mesas Disponibles
              </p>
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center">
                <Users className="w-5 h-5 text-cyan-400" />
              </div>
            </div>
            <p className="text-3xl font-bold text-white mb-1">
              {stats.tablesAvailable}
            </p>
            <p className="text-xs text-slate-400 font-medium">Listas para clientes</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="relative overflow-hidden bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 shadow-xl">
            <h2 className="text-xl font-bold text-white mb-6">
              Estado de Ítems
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl bg-slate-900/50 border border-slate-700/50">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-red-500 shadow-lg shadow-red-500/50" />
                  <span className="text-slate-300 font-medium">Pendientes</span>
                </div>
                <span className="font-bold text-white text-lg">{stats.itemsPending}</span>
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl bg-slate-900/50 border border-slate-700/50">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-amber-500 shadow-lg shadow-amber-500/50" />
                  <span className="text-slate-300 font-medium">En Preparación</span>
                </div>
                <span className="font-bold text-white text-lg">
                  {stats.itemsPreparing}
                </span>
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl bg-slate-900/50 border border-slate-700/50">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/50" />
                  <span className="text-slate-300 font-medium">Listos</span>
                </div>
                <span className="font-bold text-white text-lg">{stats.itemsReady}</span>
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 shadow-xl">
            <h2 className="text-xl font-bold text-white mb-6">
              Estado del Sistema
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl bg-slate-900/50 border border-slate-700/50">
                <span className="text-slate-300 font-medium">Servidor</span>
                <div className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse shadow-lg shadow-green-500/50" />
                  <span className="text-sm font-semibold text-green-400">
                    Activo
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl bg-slate-900/50 border border-slate-700/50">
                <span className="text-slate-300 font-medium">Base de Datos</span>
                <div className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse shadow-lg shadow-green-500/50" />
                  <span className="text-sm font-semibold text-green-400">
                    Activo
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl bg-slate-900/50 border border-slate-700/50">
                <span className="text-slate-300 font-medium">Conexión</span>
                <div className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse shadow-lg shadow-green-500/50" />
                  <span className="text-sm font-semibold text-green-400">
                    Estable
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
