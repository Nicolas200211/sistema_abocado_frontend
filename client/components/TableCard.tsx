import { Table } from "@/types/restaurant";
import { Users, Clock, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMemo } from "react";

interface TableCardProps {
  table: Table;
  onClick?: () => void;
  interactive?: boolean;
}

export default function TableCard({
  table,
  onClick,
  interactive = false,
}: TableCardProps) {
  const statusConfig = {
    available: {
      bg: "bg-green-50",
      border: "border-green-200",
      badge: "bg-green-100 text-green-800",
      label: "Disponible",
    },
    occupied: {
      bg: "bg-blue-50",
      border: "border-blue-200",
      badge: "bg-blue-100 text-blue-800",
      label: "Ocupada",
    },
    reserved: {
      bg: "bg-yellow-50",
      border: "border-yellow-200",
      badge: "bg-yellow-100 text-yellow-800",
      label: "Reservada",
    },
  };

  const config = statusConfig[table.status];

  const orderDetails = useMemo(() => {
    if (!table.currentOrder) return null;

    const totalItems = table.currentOrder.items.length;
    const readyItems = table.currentOrder.items.filter(
      (i) => i.status === "ready"
    ).length;
    const preparingItems = table.currentOrder.items.filter(
      (i) => i.status === "preparing"
    ).length;

    return { totalItems, readyItems, preparingItems };
  }, [table.currentOrder]);

  return (
    <div
      onClick={onClick}
      className={cn(
        "p-6 rounded-xl border-2 transition-all duration-200",
        config.bg,
        config.border,
        interactive && "cursor-pointer hover:shadow-lg hover:scale-105"
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-2xl font-bold text-slate-900">
            Mesa {table.number}
          </h3>
          <span className={cn("inline-block mt-2 px-3 py-1 rounded-full text-sm font-semibold", config.badge)}>
            {config.label}
          </span>
        </div>
        <Users className="w-6 h-6 text-slate-400" />
      </div>

      <div className="space-y-2 text-sm">
        <p className="text-slate-600">
          <span className="font-semibold">Capacidad:</span> {table.capacity}{" "}
          personas
        </p>
        {table.partySize && (
          <p className="text-slate-600">
            <span className="font-semibold">Comensales:</span> {table.partySize}
          </p>
        )}

        {orderDetails && (
          <div className="mt-4 pt-4 border-t border-slate-200 space-y-2">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-orange-500" />
              <span className="text-slate-600">
                {orderDetails.preparingItems} en preparación
              </span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-slate-600">
                {orderDetails.readyItems} listo
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
