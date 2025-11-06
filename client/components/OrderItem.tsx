import { OrderItem as OrderItemType, Dish } from "@/types/restaurant";
import { Clock, CheckCircle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMemo } from "react";

interface OrderItemProps {
  item: OrderItemType;
  dish: Dish;
  tableNumber?: number;
  onStatusChange?: (status: OrderItemType["status"]) => void;
  compact?: boolean;
}

export default function OrderItem({
  item,
  dish,
  tableNumber,
  onStatusChange,
  compact = false,
}: OrderItemProps) {
  const statusConfig = {
    pending: {
      bg: "bg-red-950",
      border: "border-red-700",
      badge: "bg-red-900 text-red-200",
      icon: AlertCircle,
      label: "Pendiente",
      color: "text-red-400",
    },
    preparing: {
      bg: "bg-amber-950",
      border: "border-amber-700",
      badge: "bg-amber-900 text-amber-200",
      icon: Clock,
      label: "En Preparación",
      color: "text-amber-400",
    },
    ready: {
      bg: "bg-emerald-950",
      border: "border-emerald-700",
      badge: "bg-emerald-900 text-emerald-200",
      icon: CheckCircle,
      label: "Listo",
      color: "text-emerald-400",
    },
  };

  const config = statusConfig[item.status];
  const Icon = config.icon;

  const elapsedTime = useMemo(() => {
    const now = new Date();
    const start = item.startedAt || item.completedAt;
    if (!start) return null;

    const elapsed = Math.floor((now.getTime() - start.getTime()) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;

    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  }, [item.startedAt, item.completedAt]);

  if (compact) {
    return (
      <div className={cn("p-3 rounded-lg border-2", config.bg, config.border)}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1">
            <p className="font-semibold text-slate-900 text-sm">
              {item.quantity}x {dish.name}
            </p>
            {tableNumber && (
              <p className="text-xs text-slate-600">Mesa {tableNumber}</p>
            )}
            {item.notes && (
              <p className="text-xs text-slate-600 italic mt-1">{item.notes}</p>
            )}
          </div>
          <span className={cn("inline-block px-2 py-1 rounded text-xs font-semibold", config.badge)}>
            {config.label}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "p-5 rounded-xl border-2 transition-all duration-200",
        config.bg,
        config.border
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <Icon className={cn("w-5 h-5", config.color)} />
            <span className={cn("inline-block px-3 py-1 rounded-full text-sm font-semibold", config.badge)}>
              {config.label}
            </span>
          </div>
        </div>
        {elapsedTime && (
          <span className="text-sm font-mono text-slate-400">{elapsedTime}</span>
        )}
      </div>

      <div className="mb-4">
        <p className="text-lg font-bold text-white">
          {item.quantity}x {dish.name}
        </p>
        {tableNumber && (
          <p className="text-sm text-slate-400 mt-1">Mesa {tableNumber}</p>
        )}
      </div>

      {item.notes && (
        <div className="mb-4 p-3 bg-slate-700 rounded-lg border-l-4 border-orange-500">
          <p className="text-sm text-slate-200">
            <span className="font-semibold">Nota:</span> {item.notes}
          </p>
        </div>
      )}

      {onStatusChange && (
        <div className="flex gap-2">
          {item.status !== "pending" && (
            <button
              onClick={() => onStatusChange("pending")}
              className="flex-1 px-3 py-2 text-sm font-semibold text-red-400 bg-slate-700 border border-red-700 rounded-lg hover:bg-red-900 hover:bg-opacity-30 transition-colors"
            >
              Pendiente
            </button>
          )}
          {item.status !== "preparing" && (
            <button
              onClick={() => onStatusChange("preparing")}
              className="flex-1 px-3 py-2 text-sm font-semibold text-amber-400 bg-slate-700 border border-amber-700 rounded-lg hover:bg-amber-900 hover:bg-opacity-30 transition-colors"
            >
              Preparando
            </button>
          )}
          {item.status !== "ready" && (
            <button
              onClick={() => onStatusChange("ready")}
              className="flex-1 px-3 py-2 text-sm font-semibold text-emerald-400 bg-slate-700 border border-emerald-700 rounded-lg hover:bg-emerald-900 hover:bg-opacity-30 transition-colors"
            >
              Listo
            </button>
          )}
        </div>
      )}
    </div>
  );
}
