import { useState, useMemo } from "react";
import Layout from "@/components/Layout";
import OrderItem from "@/components/OrderItem";
import { mockOrders, mockDishes } from "@/lib/mockData";
import { AlertCircle, Clock, CheckCircle, Flame } from "lucide-react";
import { cn } from "@/lib/utils";

type FilterStatus = "all" | "pending" | "preparing" | "ready";

export default function Kitchen() {
  const [orders, setOrders] = useState(mockOrders);
  const [filter, setFilter] = useState<FilterStatus>("all");

  const dishes = useMemo(() => {
    return new Map(mockDishes.map((d) => [d.id, d]));
  }, []);

  const allItems = useMemo(() => {
    return orders.flatMap((order) =>
      order.items.map((item) => ({
        ...item,
        orderId: order.id,
        tableId: order.tableId,
      }))
    );
  }, [orders]);

  const pendingItems = useMemo(() => {
    const items = allItems.filter((i) => i.status === "pending");
    return filter === "all" ? items : items;
  }, [allItems, filter]);

  const preparingItems = useMemo(() => {
    const items = allItems.filter((i) => i.status === "preparing");
    return filter === "all" ? items : items;
  }, [allItems, filter]);

  const readyItems = useMemo(() => {
    const items = allItems.filter((i) => i.status === "ready");
    return filter === "all" ? items : items;
  }, [allItems, filter]);

  const stats = {
    pending: pendingItems.length,
    preparing: preparingItems.length,
    ready: readyItems.length,
  };

  const handleStatusChange = (
    orderId: string,
    itemId: string,
    newStatus: string
  ) => {
    setOrders((prevOrders) =>
      prevOrders.map((order) => {
        if (order.id === orderId) {
          return {
            ...order,
            items: order.items.map((item) => {
              if (item.id === itemId) {
                return {
                  ...item,
                  status: newStatus as "pending" | "preparing" | "ready",
                  startedAt:
                    newStatus === "preparing" ? new Date() : item.startedAt,
                  completedAt:
                    newStatus === "ready" ? new Date() : item.completedAt,
                };
              }
              return item;
            }),
          };
        }
        return order;
      })
    );
  };

  const OrderCard = ({
    item,
    dish,
  }: {
    item: typeof allItems extends Array<infer T> ? T : never;
    dish: ReturnType<typeof dishes.get>;
  }) => {
    if (!dish) return null;

    const getStatusColor = (status: string) => {
      switch (status) {
        case "pending":
          return {
            bg: "bg-red-50",
            border: "border-red-300",
            badge: "bg-red-100 text-red-700",
            indicator: "bg-red-500",
          };
        case "preparing":
          return {
            bg: "bg-amber-50",
            border: "border-amber-300",
            badge: "bg-amber-100 text-amber-700",
            indicator: "bg-amber-500",
          };
        case "ready":
          return {
            bg: "bg-emerald-50",
            border: "border-emerald-300",
            badge: "bg-emerald-100 text-emerald-700",
            indicator: "bg-emerald-500",
          };
        default:
          return {
            bg: "bg-slate-50",
            border: "border-slate-300",
            badge: "bg-slate-100 text-slate-700",
            indicator: "bg-slate-500",
          };
      }
    };

    const color = getStatusColor(item.status);

    return (
      <div
        className={cn(
          "p-4 rounded-lg border-l-4 transition-all duration-200 hover:shadow-lg",
          color.bg,
          color.border
        )}
        style={{ borderLeftColor: color.indicator }}
      >
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1">
            <p className="text-lg font-bold text-slate-900 leading-tight">
              {item.quantity}x {dish.name}
            </p>
            <p className="text-xs text-slate-600 mt-1">
              Mesa {item.tableId.replace("t", "")}
            </p>
          </div>
          <div className="text-right">
            <span className={cn("inline-block px-3 py-1 rounded-full text-xs font-bold", color.badge)}>
              {item.status === "pending"
                ? "Pendiente"
                : item.status === "preparing"
                  ? "En Preparación"
                  : "Listo"}
            </span>
          </div>
        </div>

        {item.notes && (
          <div className="mb-3 p-2 bg-white rounded border-l-2 border-orange-400">
            <p className="text-xs font-semibold text-slate-700">Nota especial:</p>
            <p className="text-xs text-slate-600 mt-1">{item.notes}</p>
          </div>
        )}

        <div className="flex gap-2">
          {item.status !== "pending" && (
            <button
              onClick={() => handleStatusChange(item.orderId, item.id, "pending")}
              className="flex-1 px-2 py-1 text-xs font-semibold text-red-600 bg-white border border-red-200 rounded hover:bg-red-50 transition-colors"
            >
              Pendiente
            </button>
          )}
          {item.status !== "preparing" && (
            <button
              onClick={() =>
                handleStatusChange(item.orderId, item.id, "preparing")
              }
              className="flex-1 px-2 py-1 text-xs font-semibold text-amber-600 bg-white border border-amber-200 rounded hover:bg-amber-50 transition-colors"
            >
              Preparar
            </button>
          )}
          {item.status !== "ready" && (
            <button
              onClick={() => handleStatusChange(item.orderId, item.id, "ready")}
              className="flex-1 px-2 py-1 text-xs font-semibold text-emerald-600 bg-white border border-emerald-200 rounded hover:bg-emerald-50 transition-colors"
            >
              Listo
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <Layout>
      <div className="space-y-8">
        
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Flame className="w-8 h-8 text-orange-600" />
            <h1 className="text-4xl font-black bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              Cocina
            </h1>
            <Flame className="w-8 h-8 text-orange-600" />
          </div>
          <p className="text-slate-600 text-lg mt-2">
            Estación de Preparación - Tiempo Real
          </p>
        </div>

        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-50 to-red-100 p-6 border border-red-200 shadow-lg">
            <div className="absolute top-0 right-0 w-24 h-24 bg-red-200 rounded-full -mr-8 -mt-8 opacity-20"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <p className="text-red-700 font-bold text-sm uppercase tracking-wide">
                  Pendientes
                </p>
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <p className="text-5xl font-black text-red-600 mb-2">
                {stats.pending}
              </p>
              <p className="text-xs text-red-600 font-semibold">
                Esperando inicio
              </p>
            </div>
          </div>

          
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-50 to-amber-100 p-6 border border-amber-200 shadow-lg">
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-200 rounded-full -mr-8 -mt-8 opacity-20"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <p className="text-amber-700 font-bold text-sm uppercase tracking-wide">
                  En Preparación
                </p>
                <Clock className="w-8 h-8 text-amber-600" />
              </div>
              <p className="text-5xl font-black text-amber-600 mb-2">
                {stats.preparing}
              </p>
              <p className="text-xs text-amber-600 font-semibold">En la cocina</p>
            </div>
          </div>

          
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100 p-6 border border-emerald-200 shadow-lg">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-200 rounded-full -mr-8 -mt-8 opacity-20"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <p className="text-emerald-700 font-bold text-sm uppercase tracking-wide">
                  Listos para Servir
                </p>
                <CheckCircle className="w-8 h-8 text-emerald-600" />
              </div>
              <p className="text-5xl font-black text-emerald-600 mb-2">
                {stats.ready}
              </p>
              <p className="text-xs text-emerald-600 font-semibold">
                Esperando recogida
              </p>
            </div>
          </div>
        </div>

        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-4 h-4 rounded-full bg-red-500"></div>
              <h2 className="text-xl font-bold text-slate-900">Pendientes</h2>
              <span className="ml-auto inline-block px-3 py-1 rounded-full bg-red-100 text-red-700 text-sm font-bold">
                {stats.pending}
              </span>
            </div>
            <div className="flex-1 space-y-3">
              {pendingItems.length === 0 ? (
                <div className="h-full rounded-xl border-2 border-dashed border-red-200 flex items-center justify-center p-6">
                  <p className="text-center text-red-600 text-sm font-semibold">
                    Sin pedidos pendientes
                  </p>
                </div>
              ) : (
                pendingItems.map((item) => {
                  const dish = dishes.get(item.dishId);
                  return (
                    <OrderCard
                      key={item.id}
                      item={item}
                      dish={dish}
                    />
                  );
                })
              )}
            </div>
          </div>

          
          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-4 h-4 rounded-full bg-amber-500"></div>
              <h2 className="text-xl font-bold text-slate-900">
                En Preparación
              </h2>
              <span className="ml-auto inline-block px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-sm font-bold">
                {stats.preparing}
              </span>
            </div>
            <div className="flex-1 space-y-3">
              {preparingItems.length === 0 ? (
                <div className="h-full rounded-xl border-2 border-dashed border-amber-200 flex items-center justify-center p-6">
                  <p className="text-center text-amber-600 text-sm font-semibold">
                    Sin platos en preparación
                  </p>
                </div>
              ) : (
                preparingItems.map((item) => {
                  const dish = dishes.get(item.dishId);
                  return (
                    <OrderCard
                      key={item.id}
                      item={item}
                      dish={dish}
                    />
                  );
                })
              )}
            </div>
          </div>

          
          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-4 h-4 rounded-full bg-emerald-500"></div>
              <h2 className="text-xl font-bold text-slate-900">
                Listos para Servir
              </h2>
              <span className="ml-auto inline-block px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-sm font-bold">
                {stats.ready}
              </span>
            </div>
            <div className="flex-1 space-y-3">
              {readyItems.length === 0 ? (
                <div className="h-full rounded-xl border-2 border-dashed border-emerald-200 flex items-center justify-center p-6">
                  <p className="text-center text-emerald-600 text-sm font-semibold">
                    Sin platos listos
                  </p>
                </div>
              ) : (
                readyItems.map((item) => {
                  const dish = dishes.get(item.dishId);
                  return (
                    <OrderCard
                      key={item.id}
                      item={item}
                      dish={dish}
                    />
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
