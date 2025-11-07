import { useMemo } from "react";
import Layout from "@/components/Layout";
import { mockTables, mockOrders, mockDishes } from "@/lib/mockData";
import {
  Users,
  Clock,
  CheckCircle,
  TrendingUp,
  AlertCircle,
  Activity,
} from "lucide-react";

export default function Index() {
  const allOrderItems = useMemo(() => {
    return mockOrders.flatMap((order) => order.items);
  }, []);

  const stats = {
    tablesTotal: mockTables.length,
    tablesOccupied: mockTables.filter((t) => t.status === "occupied").length,
    tablesAvailable: mockTables.filter((t) => t.status === "available").length,
    ordersActive: mockOrders.filter((o) => o.status === "active").length,
    itemsPending: allOrderItems.filter((i) => i.status === "pending").length,
    itemsPreparing: allOrderItems.filter((i) => i.status === "preparing")
      .length,
    itemsReady: allOrderItems.filter((i) => i.status === "ready").length,
    revenue: mockOrders.reduce((sum, order) => sum + order.total, 0),
  };

  const occupancyRate = Math.round(
    (stats.tablesOccupied / stats.tablesTotal) * 100
  );

  return (
    <Layout>
      <div className="space-y-8">
        
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-slate-400">
            Resumen general del estado del restaurante
          </p>
        </div>

        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-slate-400 text-sm font-semibold uppercase tracking-wide">
                  Ocupación
                </p>
                <p className="text-4xl font-black text-white mt-2">
                  {stats.tablesOccupied}/{stats.tablesTotal}
                </p>
              </div>
              <Users className="w-8 h-8 text-blue-500 flex-shrink-0" />
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${occupancyRate}%` }}
              ></div>
            </div>
            <p className="text-xs text-slate-500 mt-2">{occupancyRate}% ocupación</p>
          </div>

          
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-slate-400 text-sm font-semibold uppercase tracking-wide">
                  Pendientes
                </p>
                <p className="text-4xl font-black text-red-500 mt-2">
                  {stats.itemsPending}
                </p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-500 flex-shrink-0" />
            </div>
            <p className="text-xs text-slate-500">
              Órdenes esperando inicio
            </p>
          </div>

          
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-slate-400 text-sm font-semibold uppercase tracking-wide">
                  Preparando
                </p>
                <p className="text-4xl font-black text-amber-500 mt-2">
                  {stats.itemsPreparing}
                </p>
              </div>
              <Clock className="w-8 h-8 text-amber-500 flex-shrink-0" />
            </div>
            <p className="text-xs text-slate-500">En cocina ahora</p>
          </div>

          
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-slate-400 text-sm font-semibold uppercase tracking-wide">
                  Listos
                </p>
                <p className="text-4xl font-black text-emerald-500 mt-2">
                  {stats.itemsReady}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-emerald-500 flex-shrink-0" />
            </div>
            <p className="text-xs text-slate-500">Esperando recogida</p>
          </div>
        </div>

        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-slate-400 text-sm font-semibold uppercase tracking-wide">
                Ingresos
              </p>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-3xl font-bold text-white">
              S/ {stats.revenue.toFixed(2)}
            </p>
            <p className="text-xs text-slate-500 mt-2">Órdenes completadas</p>
          </div>

          
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-slate-400 text-sm font-semibold uppercase tracking-wide">
                Órdenes Activas
              </p>
              <Activity className="w-5 h-5 text-purple-500" />
            </div>
            <p className="text-3xl font-bold text-white">{stats.ordersActive}</p>
            <p className="text-xs text-slate-500 mt-2">En proceso</p>
          </div>

          
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-slate-400 text-sm font-semibold uppercase tracking-wide">
                Mesas Disponibles
              </p>
              <Users className="w-5 h-5 text-cyan-500" />
            </div>
            <p className="text-3xl font-bold text-white">
              {stats.tablesAvailable}
            </p>
            <p className="text-xs text-slate-500 mt-2">Listas para clientes</p>
          </div>
        </div>

        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <h2 className="text-lg font-bold text-white mb-6">
              Estado de Ítems
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span className="text-slate-300">Pendientes</span>
                </div>
                <span className="font-bold text-white">{stats.itemsPending}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                  <span className="text-slate-300">En Preparación</span>
                </div>
                <span className="font-bold text-white">
                  {stats.itemsPreparing}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                  <span className="text-slate-300">Listos</span>
                </div>
                <span className="font-bold text-white">{stats.itemsReady}</span>
              </div>
            </div>
          </div>

          
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <h2 className="text-lg font-bold text-white mb-6">
              Estado del Sistema
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-700 bg-opacity-50">
                <span className="text-slate-300">Servidor</span>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                  <span className="text-sm font-semibold text-green-500">
                    Activo
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-700 bg-opacity-50">
                <span className="text-slate-300">Base de Datos</span>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                  <span className="text-sm font-semibold text-green-500">
                    Activo
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-700 bg-opacity-50">
                <span className="text-slate-300">Conexión</span>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                  <span className="text-sm font-semibold text-green-500">
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
