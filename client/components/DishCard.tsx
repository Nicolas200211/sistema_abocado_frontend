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
        "p-5 rounded-xl border-2 transition-all duration-200 h-full flex flex-col",
        selected
          ? "border-orange-500 bg-orange-600 bg-opacity-20"
          : "border-slate-700 bg-slate-800 hover:border-orange-500 hover:border-opacity-50",
        interactive && "cursor-pointer"
      )}
    >
      <div className="text-4xl mb-3">{dish.image}</div>

      <h3 className="text-lg font-bold text-white mb-2">{dish.name}</h3>

      <p className="text-sm text-slate-400 mb-4 flex-1">
        {dish.description}
      </p>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase">
            {categoryLabels[dish.category]}
          </span>
          <div className="flex items-center gap-1 text-slate-500 text-sm">
            <Clock className="w-4 h-4" />
            <span>{dish.prepTime}m</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-slate-700">
          <span className="text-2xl font-bold text-orange-500">
            ${dish.price.toFixed(2)}
          </span>
          {interactive && onAdd && (
            <button
              onClick={onAdd}
              className={cn(
                "p-2 rounded-lg transition-colors duration-200",
                selected
                  ? "bg-orange-600 text-white"
                  : "bg-slate-700 text-slate-300 hover:bg-orange-600 hover:text-white"
              )}
            >
              <Plus className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
