import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import OrderItem from "@/components/OrderItem";
import { tablesApi, dishesApi, ordersApi } from "@/lib/api";
import { CreditCard, Plus, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Service() {
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);

  const { data: tables = [], isLoading: tablesLoading } = useQuery({
    queryKey: ['tables'],
    queryFn: tablesApi.getAll,
  });

  const { data: dishes = [], isLoading: dishesLoading } = useQuery({
    queryKey: ['dishes'],
    queryFn: dishesApi.getAll,
  });

  const { data: orders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: () => ordersApi.getAll({ status: 'active' }),
  });

  const dishesMap = useMemo(() => {
    return new Map(dishes.map((d) => [d.id, d]));
  }, [dishes]);

  const tablesWithOrders = useMemo(() => {
    return tables.map(table => {
      const order = orders.find(o => o.tableId === table.id);
      return {
        ...table,
        currentOrder: order,
      };
    });
  }, [tables, orders]);

  const selectedTable = selectedTableId
    ? tablesWithOrders.find((t) => t.id === selectedTableId)
    : null;

  const occupiedTables = tablesWithOrders.filter((t) => t.status === "occupied");

  const isLoading = tablesLoading || dishesLoading || ordersLoading;

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Mesas y Órdenes</h1>
          <p className="text-slate-400">
            Gestiona las mesas y sus órdenes ({occupiedTables.length} ocupadas)
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Tables List */}
          <div className="lg:col-span-2">
            <div className="space-y-3">
              <p className="text-sm font-semibold text-slate-400 uppercase tracking-wide">
                Mesas Ocupadas
              </p>
              {occupiedTables.length === 0 ? (
                <div className="p-8 rounded-xl bg-slate-800 border border-slate-700 text-center">
                  <p className="text-slate-400">No hay mesas ocupadas</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {occupiedTables.map((table) => (
                    <button
                      key={table.id}
                      onClick={() => setSelectedTableId(table.id)}
                      className={cn(
                        "p-4 rounded-lg border-2 transition-all duration-200 text-left",
                        selectedTableId === table.id
                          ? "bg-orange-600 bg-opacity-20 border-orange-500"
                          : "bg-slate-800 border-slate-700 hover:border-slate-600"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-bold text-white text-lg">
                            Mesa {table.number}
                          </p>
                          <p className="text-sm text-slate-400 mt-1">
                            {table.partySize} comensales
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-slate-400">
                            {table.currentOrder?.items.length || 0} platos
                          </p>
                          <p className="font-bold text-orange-500 text-sm mt-1">
                            ${table.currentOrder?.total.toFixed(2) || "0.00"}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Order Details */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-4">
              {selectedTable ? (
                <div className="p-6 rounded-xl bg-slate-800 border border-slate-700 space-y-4">
                  <h2 className="text-lg font-bold text-white">
                    Mesa {selectedTable.number}
                  </h2>

                  {selectedTable.currentOrder && (
                    <div className="space-y-4">
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {selectedTable.currentOrder.items.map((item) => {
                          const dish = dishesMap.get(String(item.dishId));
                          if (!dish) return null;

                          return (
                            <div
                              key={item.id}
                              className="p-3 bg-slate-700 rounded-lg text-sm"
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-semibold text-white">
                                  {item.quantity}x {dish.name}
                                </span>
                                <span className={cn(
                                  "px-2 py-0.5 rounded text-xs font-bold",
                                  item.status === "delivered"
                                    ? "bg-slate-600 text-slate-200"
                                    : item.status === "ready"
                                      ? "bg-emerald-600 text-emerald-200"
                                      : item.status === "preparing"
                                        ? "bg-amber-600 text-amber-200"
                                        : "bg-red-600 text-red-200"
                                )}>
                                  {item.status === "delivered"
                                    ? "Entregado"
                                    : item.status === "ready"
                                      ? "Listo"
                                      : item.status === "preparing"
                                        ? "Preparando"
                                        : "Pendiente"}
                                </span>
                              </div>
                              <p className="text-slate-400 text-xs">
                                ${(dish.price * item.quantity).toFixed(2)}
                              </p>
                            </div>
                          );
                        })}
                      </div>

                      <div className="border-t border-slate-700 pt-4">
                        <div className="flex justify-between items-center mb-4 text-lg font-bold">
                          <span className="text-white">Total:</span>
                          <span className="text-orange-500">
                            ${selectedTable.currentOrder.total.toFixed(2)}
                          </span>
                        </div>

                        <div className="space-y-2">
                          <button className="w-full py-2 bg-slate-700 text-slate-200 font-semibold rounded-lg hover:bg-slate-600 transition-colors flex items-center justify-center gap-2 text-sm">
                            <Plus className="w-4 h-4" />
                            Agregar
                          </button>
                          <button className="w-full py-2 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 transition-colors flex items-center justify-center gap-2 text-sm">
                            <CreditCard className="w-4 h-4" />
                            Pagar
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-6 rounded-xl bg-slate-800 border border-slate-700 text-center">
                  <p className="text-slate-400 text-sm">
                    Selecciona una mesa
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
