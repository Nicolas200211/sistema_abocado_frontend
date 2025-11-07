import { Dish } from "@/types/restaurant";
import { Plus, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface DishCardProps {
  dish: Dish;
  onAdd?: () => void;
  interactive?: boolean;
  selected?: boolean;
}

const categoryLabels: Record<string, string> = {
  principal: "Plato Principal",
  lado: "Lado",
  bebida: "Bebida",
  postre: "Postre",
};

export default function DishCard({
  dish,
  onAdd,
  interactive = false,
  selected = false,
}: DishCardProps) {
  return (
    <div
      className={cn(
        "w-full max-w-[280px] sm:max-w-[320px] min-h-[360px] rounded-xl border border-slate-700 bg-slate-800 hover:border-orange-500 transition-all duration-200 overflow-hidden flex flex-col",
        interactive && "cursor-pointer"
      )}
    >
      <div className="relative h-48 w-full overflow-hidden">
        <img 
          src={dish.image} 
          alt={dish.name}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
        />
      </div>

      <div className="p-4 flex flex-col gap-3 flex-1">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white">{dish.name}</h3>
          <span className="text-xs font-semibold text-orange-400 uppercase">
            {categoryLabels[dish.category]}
          </span>
        </div>

        <p className="text-sm text-slate-400 line-clamp-3 flex-1">
          {dish.description}
        </p>

        <div className="flex items-center justify-between pt-3 border-t border-slate-700">
          <div className="flex items-center gap-1 text-slate-500 text-sm">
            <Clock className="w-4 h-4" />
            <span>{dish.prepTime}m</span>
          </div>
          <span className="text-xl font-bold text-orange-500">
            S/ {dish.price.toFixed(2)}
          </span>
        </div>

        {interactive && onAdd && (
          <button
            onClick={onAdd}
            className={cn(
              "mt-auto w-full py-2 rounded-lg text-sm font-semibold transition-colors duration-200",
              selected
                ? "bg-orange-600 text-white"
                : "bg-slate-700 text-slate-300 hover:bg-orange-600 hover:text-white"
            )}
          >
            <Plus className="w-4 h-4 inline-block mr-2" />
            Añadir
          </button>
        )}
      </div>
    </div>
  );
}
