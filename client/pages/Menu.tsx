import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Layout from '@/components/Layout';
import DishCard from '@/components/DishCard';
import { dishesApi, Dish, tablesApi, ordersApi, CreateOrderItemDto } from '@/lib/api';
import { Filter, Plus, Minus, Send, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

type CategoryFilter = 'all' | 'principal' | 'lado' | 'bebida' | 'postre';

interface CartItem {
  dishId: string;
  quantity: number;
}

export default function Menu() {
  const [category, setCategory] = useState<CategoryFilter>('all');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedTable, setSelectedTable] = useState<string>('');
  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: dishes = [], isLoading: dishesLoading } = useQuery({
    queryKey: ['dishes'],
    queryFn: dishesApi.getAll,
  });

  const { data: tables = [] } = useQuery({
    queryKey: ['tables'],
    queryFn: tablesApi.getAll,
  });

  const createOrderMutation = useMutation({
    mutationFn: ordersApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['tables'] });
      toast.success('Orden creada exitosamente');
      setCart([]);
      setSelectedTable('');
      setIsOrderDialogOpen(false);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al crear la orden');
    },
  });

  const filteredDishes = category === 'all'
    ? dishes
    : dishes.filter((d: Dish) => d.category === category);

  const cartTotal = cart.reduce((sum, item) => {
    const dish = dishes.find((d: Dish) => d.id === item.dishId);
    return sum + (dish ? dish.price * item.quantity : 0);
  }, 0);

  const availableTables = tables.filter((t) => t.status === 'available');

  const handleAddToCart = (dishId: string) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.dishId === dishId);
      if (existing) {
        return prev.map((item) =>
          item.dishId === dishId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { dishId, quantity: 1 }];
    });
  };

  const handleRemoveFromCart = (dishId: string) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.dishId === dishId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const handleSubmitOrder = () => {
    if (!selectedTable) {
      toast.error('Selecciona una mesa');
      return;
    }

    if (cart.length === 0) {
      toast.error('El carrito está vacío');
      return;
    }

    const orderItems: CreateOrderItemDto[] = cart.map((item) => ({
      dishId: item.dishId,
      quantity: item.quantity,
    }));

    createOrderMutation.mutate({
      tableId: selectedTable,
      items: orderItems,
    });
  };

  const categories = [
    { label: 'Todos', value: 'all' as CategoryFilter },
    { label: 'Principales', value: 'principal' as CategoryFilter },
    { label: 'Lados', value: 'lado' as CategoryFilter },
    { label: 'Bebidas', value: 'bebida' as CategoryFilter },
    { label: 'Postres', value: 'postre' as CategoryFilter },
  ];

  if (dishesLoading) {
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
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Carta de Platos</h1>
          <p className="text-slate-400">
            {filteredDishes.length} platos disponibles
          </p>
        </div>

        <div className="flex items-center gap-3 overflow-x-auto pb-2">
          <Filter className="w-5 h-5 text-slate-500 flex-shrink-0" />
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setCategory(cat.value)}
              className={cn(
                'px-4 py-2 rounded-lg font-semibold transition-colors whitespace-nowrap text-sm',
                category === cat.value
                  ? 'bg-orange-600 text-white'
                  : 'bg-slate-800 text-slate-300 border border-slate-700 hover:border-slate-600'
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {filteredDishes.map((dish: Dish) => {
                const cartItem = cart.find((item) => item.dishId === dish.id);
                return (
                  <div key={dish.id} className="relative">
                    <DishCard
                      dish={dish}
                      interactive={true}
                      selected={!!cartItem}
                      onAdd={() => handleAddToCart(dish.id)}
                    />
                    {cartItem && (
                      <div className="absolute top-4 right-4 bg-orange-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                        {cartItem.quantity}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-8 p-6 rounded-xl bg-slate-800 border border-slate-700 space-y-4">
              <h2 className="text-lg font-bold text-white">Orden Actual</h2>

              {cart.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-slate-400 text-sm">
                    Sin platos seleccionados
                  </p>
                </div>
              ) : (
                <>
                  <div className="space-y-3 max-h-80 overflow-y-auto">
                    {cart.map((cartItem) => {
                      const dish = dishes.find(
                        (d: Dish) => d.id === cartItem.dishId
                      );
                      if (!dish) return null;

                      return (
                        <div
                          key={dish.id}
                          className="p-3 bg-slate-700 rounded-lg space-y-2"
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-semibold text-white text-sm">
                                {dish.name}
                              </p>
                              <p className="text-xs text-slate-400 mt-1">
                                ${(dish.price * cartItem.quantity).toFixed(2)}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleRemoveFromCart(dish.id)}
                              className="flex-1 flex items-center justify-center gap-1 py-1 px-2 text-slate-300 bg-slate-600 border border-slate-500 rounded hover:bg-slate-500 transition-colors"
                            >
                              <Minus className="w-4 h-4" />
                              <span className="text-xs font-semibold">
                                {cartItem.quantity}
                              </span>
                            </button>
                            <button
                              onClick={() => handleAddToCart(dish.id)}
                              className="flex-1 flex items-center justify-center gap-1 py-1 px-2 text-orange-500 bg-slate-600 border border-slate-500 rounded hover:bg-slate-500 transition-colors"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="border-t border-slate-700 pt-4 space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm text-slate-400">
                        <span>Subtotal:</span>
                        <span>${cartTotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm text-slate-400">
                        <span>Impuestos (10%):</span>
                        <span>${(cartTotal * 0.1).toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="flex justify-between text-lg font-bold text-white bg-orange-600 bg-opacity-20 p-3 rounded-lg border border-orange-600 border-opacity-30">
                      <span>Total:</span>
                      <span className="text-orange-500">
                        ${(cartTotal * 1.1).toFixed(2)}
                      </span>
                    </div>

                    <Dialog open={isOrderDialogOpen} onOpenChange={setIsOrderDialogOpen}>
                      <DialogTrigger asChild>
                        <Button className="w-full py-6 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 transition-colors flex items-center justify-center gap-2">
                          <Send className="w-4 h-4" />
                          Enviar Orden
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-slate-800 border-slate-700">
                        <DialogHeader>
                          <DialogTitle className="text-white">Seleccionar Mesa</DialogTitle>
                          <DialogDescription className="text-slate-400">
                            Elige la mesa para esta orden
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <Select value={selectedTable} onValueChange={setSelectedTable}>
                            <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                              <SelectValue placeholder="Selecciona una mesa" />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-800 border-slate-700">
                              {availableTables.map((table) => (
                                <SelectItem key={table.id} value={table.id} className="text-white">
                                  Mesa {table.number} (Capacidad: {table.capacity})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Button
                            onClick={handleSubmitOrder}
                            disabled={createOrderMutation.isPending || !selectedTable}
                            className="w-full bg-orange-600 hover:bg-orange-700"
                          >
                            {createOrderMutation.isPending ? 'Enviando...' : 'Confirmar Orden'}
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
