import { useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import { ordersApi, dishesApi, tablesApi } from "@/lib/api";
import { CheckCircle, Bell, Loader2, UtensilsCrossed, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function ReadyItems() {
  const queryClient = useQueryClient();

  const { data: orders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: () => ordersApi.getAll({ status: 'active' }),
  });

  const { data: dishes = [], isLoading: dishesLoading } = useQuery({
    queryKey: ['dishes'],
    queryFn: dishesApi.getAll,
  });

  const { data: tables = [], isLoading: tablesLoading } = useQuery({
    queryKey: ['tables'],
    queryFn: tablesApi.getAll,
  });

  const dishesMap = useMemo(() => {
    return new Map(dishes.map((d) => [d.id, d]));
  }, [dishes]);

  const tablesMap = useMemo(() => {
    return new Map(tables.map((t) => [t.id, t]));
  }, [tables]);

  // Agrupar items por mesa: bebidas pending (para preparar) y items ready (para entregar)
  const itemsByTable = useMemo(() => {
    const itemsByTableMap = new Map<string, Array<{
      item: any;
      orderId: string;
      tableId: string;
      dishCategory: string;
    }>>();

    orders.forEach((order) => {
      order.items.forEach((item) => {
        const dish = dishesMap.get(String(item.dishId));
        if (!dish) return;

        // Mozo ve: bebidas y postres en pending (para servir) + todos los items en ready (para entregar)
        // NO muestra items entregados
        const shouldShow = 
          item.status !== 'delivered' &&
          (
            ((dish.category === 'bebida' || dish.category === 'postre') && item.status === 'pending') ||
            item.status === 'ready'
          );

        if (shouldShow) {
          const tableId = order.tableId;
          if (!itemsByTableMap.has(tableId)) {
            itemsByTableMap.set(tableId, []);
          }
          itemsByTableMap.get(tableId)!.push({
            item,
            orderId: order.id,
            tableId,
            dishCategory: dish.category,
          });
        }
      });
    });

    return Array.from(itemsByTableMap.entries()).map(([tableId, items]) => ({
      tableId,
      table: tablesMap.get(tableId),
      items,
    })).filter((group) => group.table);
  }, [orders, tablesMap, dishesMap]);

  const totalReadyItems = useMemo(() => {
    return itemsByTable.reduce((sum, group) => sum + group.items.length, 0);
  }, [itemsByTable]);

  const updateItemStatusMutation = useMutation({
    mutationFn: ({ orderId, itemId, status }: { orderId: string; itemId: string; status: 'ready' | 'delivered' }) =>
      ordersApi.updateItem(orderId, itemId, { status }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      if (variables.status === 'delivered') {
        toast.success('Item marcado como entregado');
      } else {
        toast.success('Item marcado como listo');
      }
    },
    onError: () => {
      toast.error('Error al actualizar el estado');
    },
  });

  const handleMarkAsReady = (orderId: string, itemId: string) => {
    updateItemStatusMutation.mutate({ orderId, itemId, status: 'ready' });
  };

  const handleMarkAsDelivered = (orderId: string, itemId: string) => {
    updateItemStatusMutation.mutate({ orderId, itemId, status: 'delivered' });
  };

  const isLoading = ordersLoading || dishesLoading || tablesLoading;

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
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Bell className="w-8 h-8 text-emerald-600" />
            <h1 className="text-4xl font-black bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
              Entrega
            </h1>
            <Bell className="w-8 h-8 text-emerald-600" />
          </div>
          <p className="text-slate-600 text-lg mt-2">
            Bebidas y postres pendientes, platos listos para entregar - Organizados por mesa
          </p>
        </div>

        {/* Total Ready Items Card */}
        {totalReadyItems > 0 && (
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-50 to-green-100 p-6 border border-emerald-200 shadow-lg">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-200 rounded-full -mr-16 -mt-16 opacity-20"></div>
            <div className="relative z-10 text-center">
              <div className="flex items-center justify-center gap-3 mb-2">
                <CheckCircle className="w-8 h-8 text-emerald-600" />
                <p className="text-emerald-700 font-bold text-lg">
                  {totalReadyItems} {totalReadyItems === 1 ? 'item' : 'items'}
                </p>
              </div>
              <p className="text-sm text-emerald-600 font-semibold">
                Pendientes de preparar y listos para servir
              </p>
            </div>
          </div>
        )}

        {/* Items by Table */}
        {itemsByTable.length === 0 ? (
          <div className="p-12 rounded-2xl bg-slate-800 border border-slate-700 text-center">
            <UtensilsCrossed className="w-16 h-16 text-slate-500 mx-auto mb-4" />
            <p className="text-xl font-bold text-slate-400 mb-2">
              No hay items pendientes
            </p>
            <p className="text-sm text-slate-500">
              Las bebidas pendientes y platos listos aparecerán aquí
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {itemsByTable.map(({ table, items }) => {
              if (!table) return null;

              return (
                <div
                  key={table.id}
                  className="rounded-xl bg-gradient-to-br from-emerald-50 to-green-50 border-2 border-emerald-300 shadow-lg overflow-hidden"
                >
                  {/* Table Header */}
                  <div className="bg-emerald-600 px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-2xl font-black text-white">
                          Mesa {table.number}
                        </h3>
                        <p className="text-emerald-100 text-sm mt-1">
                          {items.length} {items.length === 1 ? 'item' : 'items'}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-7 h-7 text-white" />
                      </div>
                    </div>
                  </div>

                  {/* Items List */}
                  <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
                    {items.map(({ item, orderId, dishCategory }) => {
                      const dish = dishesMap.get(String(item.dishId));
                      if (!dish) return null;

                      const isPending = item.status === 'pending';
                      const isReady = item.status === 'ready';
                      const isBeverage = dishCategory === 'bebida';
                      const isDessert = dishCategory === 'postre';

                      return (
                        <div
                          key={item.id}
                          className={cn(
                            "p-4 bg-white rounded-lg border shadow-sm",
                            isPending ? "border-amber-200 bg-amber-50" : "border-emerald-200"
                          )}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <p className="text-lg font-bold text-slate-900">
                                {item.quantity}x {dish.name}
                              </p>
                              {item.notes && (
                                <p className="text-xs text-slate-600 mt-1 italic">
                                  Nota: {item.notes}
                                </p>
                              )}
                            </div>
                            <span className={cn(
                              "ml-2 inline-block px-2 py-1 rounded-full text-xs font-bold",
                              isPending 
                                ? "bg-amber-100 text-amber-700" 
                                : "bg-emerald-100 text-emerald-700"
                            )}>
                              {isPending ? 'Pendiente' : 'Listo'}
                            </span>
                          </div>
                          <div className="flex items-center justify-between mt-3">
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                              <UtensilsCrossed className="w-3 h-3" />
                              <span>Orden #{orderId.slice(0, 8)}</span>
                            </div>
                            {isPending && (isBeverage || dishCategory === 'postre') ? (
                              <button
                                onClick={() => handleMarkAsReady(orderId, item.id)}
                                disabled={updateItemStatusMutation.isPending}
                                className="px-4 py-2 bg-amber-600 text-white text-sm font-semibold rounded-lg hover:bg-amber-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <CheckCircle2 className="w-4 h-4" />
                                Marcar como Listo
                              </button>
                            ) : isReady ? (
                              <button
                                onClick={() => handleMarkAsDelivered(orderId, item.id)}
                                disabled={updateItemStatusMutation.isPending}
                                className="px-4 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <CheckCircle2 className="w-4 h-4" />
                                Marcar como Entregado
                              </button>
                            ) : null}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}

