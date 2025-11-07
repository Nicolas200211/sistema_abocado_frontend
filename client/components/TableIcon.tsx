import { Table } from "@/types/restaurant";
import { cn } from "@/lib/utils";
import { Square, UtensilsCrossed } from "lucide-react";

interface TableIconProps {
  table: Table;
  onClick?: () => void;
  interactive?: boolean;
}

export default function TableIcon({
  table,
  onClick,
  interactive = false,
}: TableIconProps) {
  const statusConfig = {
    available: {
      bg: "bg-emerald-600 hover:bg-emerald-500",
      border: "border-emerald-500",
      text: "text-emerald-100",
    },
    occupied: {
      bg: "bg-blue-600 hover:bg-blue-500",
      border: "border-blue-500",
      text: "text-blue-100",
    },
    reserved: {
      bg: "bg-amber-600 hover:bg-amber-500",
      border: "border-amber-500",
      text: "text-amber-100",
    },
  };

  const config = statusConfig[table.status];

  return (
    <button
      onClick={onClick}
      className={cn(
        "relative w-24 h-24 rounded-lg border-2 flex flex-col items-center justify-center transition-all duration-200",
        config.bg,
        config.border,
        interactive && "cursor-pointer hover:shadow-lg hover:scale-110"
      )}
      title={`Mesa ${table.number}`}
    >
      
      <div className="relative mb-1">
        <Square
          className={cn("w-8 h-8", config.text)}
          strokeWidth={2.5}
          fill="none"
        />
      </div>

      
      <span className={cn("text-lg font-bold", config.text)}>
        {table.number}
      </span>

      
      {table.partySize ? (
        <span className={cn("text-xs font-semibold", config.text)}>
          {table.partySize}/{table.capacity}
        </span>
      ) : (
        <span className={cn("text-xs font-semibold", config.text)}>
          {table.capacity}p
        </span>
      )}
    </button>
  );
}
