import { Dish } from "@/lib/api";
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
        "p-6 rounded-2xl border-2 transition-all duration-300 h-full flex flex-col relative overflow-hidden group",
        selected
          ? "border-orange-500/50 bg-gradient-to-br from-orange-600/20 to-red-600/20 backdrop-blur-sm shadow-xl shadow-orange-500/10"
          : "border-slate-700/50 bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-sm hover:border-orange-500/50 hover:shadow-xl hover:shadow-orange-500/10 hover:scale-[1.02]",
        interactive && "cursor-pointer"
      )}
    >
      <div className="mb-4 transform group-hover:scale-105 transition-transform duration-300 rounded-lg overflow-hidden bg-slate-700/50">
        {dish.image && dish.image.startsWith('http') ? (
          <img 
            src={dish.image} 
            alt={dish.name}
            className="w-full h-48 object-cover rounded-lg"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const fallback = target.nextElementSibling as HTMLElement;
              if (fallback) fallback.style.display = 'flex';
            }}
            loading="lazy"
          />
        ) : null}
        <div className={`w-full h-48 flex items-center justify-center text-6xl bg-slate-700/50 rounded-lg ${dish.image && dish.image.startsWith('http') ? 'hidden' : ''}`}>
          {dish.image || '🍽️'}
        </div>
      </div>

      <h3 className="text-lg font-bold text-white mb-2">{dish.name}</h3>

      <p className="text-sm text-slate-400 mb-5 flex-1 line-clamp-2">
        {dish.description}
      </p>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            {categoryLabels[dish.category]}
          </span>
          <div className="flex items-center gap-1.5 text-slate-500 text-sm">
            <Clock className="w-4 h-4" />
            <span>{dish.prepTime}m</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-700/50">
          <span className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
            ${dish.price.toFixed(2)}
          </span>
          {interactive && onAdd && (
            <button
              onClick={onAdd}
              className={cn(
                "p-2.5 rounded-xl transition-all duration-200 shadow-lg",
                selected
                  ? "bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-orange-500/25"
                  : "bg-slate-700/50 text-slate-300 hover:bg-gradient-to-r hover:from-orange-600 hover:to-red-600 hover:text-white hover:shadow-orange-500/25 border border-slate-600/50"
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
