import { Table } from "@/types/restaurant";
import { cn } from "@/lib/utils";
import { CheckCircle, Clock } from "lucide-react";

interface TableVisualProps {
  table: Table;
  onClick?: () => void;
  interactive?: boolean;
}

export default function TableVisual({
  table,
  onClick,
  interactive = false,
}: TableVisualProps) {
  const statusConfig = {
    available: {
      tableBg: "bg-emerald-600",
      chairBg: "bg-emerald-500",
      infoBg: "bg-emerald-950",
      border: "border-emerald-600",
      label: "Disponible",
      labelColor: "text-emerald-400",
    },
    occupied: {
      tableBg: "bg-blue-600",
      chairBg: "bg-blue-500",
      infoBg: "bg-blue-950",
      border: "border-blue-600",
      label: "Ocupada",
      labelColor: "text-blue-400",
    },
    reserved: {
      tableBg: "bg-amber-600",
      chairBg: "bg-amber-500",
      infoBg: "bg-amber-950",
      border: "border-amber-600",
      label: "Reservada",
      labelColor: "text-amber-400",
    },
  };

  const config = statusConfig[table.status];

  // Determine number of chairs based on capacity
  const chairCount = Math.min(table.capacity, 6);
  const chairPositions = Array.from({ length: chairCount });

  // Calculate chair positions around table (circular arrangement)
  const getChairPosition = (index: number) => {
    const angle = (index / chairCount) * (2 * Math.PI) - Math.PI / 2;
    const radius = 80; // Distance from center
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    return { x, y };
  };

  const orderDetails = table.currentOrder
    ? {
        totalItems: table.currentOrder.items.length,
        readyItems: table.currentOrder.items.filter((i) => i.status === "ready")
          .length,
        preparingItems: table.currentOrder.items.filter(
          (i) => i.status === "preparing"
        ).length,
      }
    : null;

  return (
    <div
      onClick={onClick}
      className={cn(
        "flex flex-col items-center justify-center p-6 rounded-2xl transition-all duration-200 h-full",
        "bg-slate-800 border-2",
        interactive && "cursor-pointer hover:shadow-2xl hover:scale-105",
        config.border
      )}
    >
      {/* Table Visual */}
      <div className="relative w-48 h-48 flex items-center justify-center mb-6">
        {/* Chairs Container */}
        {chairPositions.map((_, index) => {
          const pos = getChairPosition(index);
          const rotation = (index / chairCount) * 360;
          return (
            <div
              key={`chair-${index}`}
              className="absolute"
              style={{
                transform: `translate(calc(-50% + ${pos.x}px), calc(-50% + ${pos.y}px))`,
              }}
            >
              {/* Chair */}
              <div
                className={cn(
                "w-8 h-8 rounded-md transition-all duration-200",
                config.chairBg,
                "shadow-md border border-slate-600"
              )}
                style={{
                  transform: `rotate(${rotation}deg)`,
                }}
              />
            </div>
          );
        })}

        {/* Table */}
        <div
          className={cn(
            "w-32 h-32 rounded-full flex items-center justify-center shadow-lg border-4 border-slate-700 relative z-10",
            config.tableBg
          )}
        >
          <div className="text-center">
            <div className="text-4xl font-black text-white drop-shadow-lg">
              {table.number}
            </div>
            <div className="text-xs font-bold text-white drop-shadow-lg mt-2">
              {table.capacity}p
            </div>
          </div>
        </div>
      </div>

      {/* Status and Info */}
      <div className="w-full">
        <div className="text-center mb-4">
          <span
            className={cn(
              "inline-block px-4 py-1 rounded-full text-sm font-bold",
              "bg-slate-700 border-2",
              config.border,
              config.labelColor
            )}
          >
            {config.label}
          </span>
        </div>

        {table.partySize && (
          <div className="text-center text-sm font-semibold text-slate-300 mb-3">
            {table.partySize} comensales
          </div>
        )}

        {/* Order Status */}
        {orderDetails && (
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-center gap-2 text-slate-300">
              <Clock className="w-4 h-4 text-orange-500" />
              <span>{orderDetails.preparingItems} preparando</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-slate-300">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              <span>{orderDetails.readyItems} listos</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
