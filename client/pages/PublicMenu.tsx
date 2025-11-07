import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dishesApi, Dish } from '@/lib/api';
import { Filter, ChefHat, Clock, LogIn } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

type CategoryFilter = 'all' | 'principal' | 'lado' | 'bebida' | 'postre';

export default function PublicMenu() {
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [category, setCategory] = useState<CategoryFilter>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDishes();
  }, []);

  const loadDishes = async () => {
    try {
      setLoading(true);
      const data = await dishesApi.getAll();
      setDishes(data);
    } catch (err) {
      setError('Error al cargar los platos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredDishes = category === 'all'
    ? dishes.filter(d => d.available)
    : dishes.filter(d => d.category === category && d.available);

  const categories = [
    { label: 'Todos', value: 'all' as CategoryFilter },
    { label: 'Principales', value: 'principal' as CategoryFilter },
    { label: 'Acompañamientos', value: 'lado' as CategoryFilter },
    { label: 'Bebidas', value: 'bebida' as CategoryFilter },
    { label: 'Postres', value: 'postre' as CategoryFilter },
  ];

  const getCategoryColor = (cat: string) => {
    const colors = {
      principal: 'bg-orange-500',
      lado: 'bg-yellow-500',
      bebida: 'bg-blue-500',
      postre: 'bg-pink-500',
    };
    return colors[cat as keyof typeof colors] || 'bg-gray-500';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Cargando menú...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-red-500 text-xl">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="sticky top-0 z-10 bg-slate-950 bg-opacity-95 backdrop-blur-sm border-b border-slate-700 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
                <ChefHat className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Restaurant Abocado</h1>
                <p className="text-slate-400">Nuestra carta de platos</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm text-slate-400">Platos disponibles</p>
                <p className="text-2xl font-bold text-orange-500">{filteredDishes.length}</p>
              </div>
              <Link to="/login">
                <Button
                  variant="outline"
                  className="border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white"
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  Acceso Personal
                </Button>
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-3 overflow-x-auto pb-2">
            <Filter className="w-5 h-5 text-slate-500 flex-shrink-0" />
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setCategory(cat.value)}
                className={cn(
                  'px-4 py-2 rounded-lg font-semibold transition-all duration-200 whitespace-nowrap text-sm',
                  category === cat.value
                    ? 'bg-orange-600 text-white shadow-lg scale-105'
                    : 'bg-slate-800 text-slate-300 border border-slate-700 hover:border-slate-600 hover:bg-slate-700'
                )}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-10 justify-items-center">
          {filteredDishes.map((dish) => (
            <Card
              key={dish.id}
              className="w-full max-w-[280px] sm:max-w-[320px] min-h-[360px] bg-slate-800 border-slate-700 hover:border-orange-500 transition-all duration-300 hover:shadow-xl hover:shadow-orange-500/20 hover:scale-105 overflow-hidden flex flex-col"
            >
              <div className="relative h-48 w-full overflow-hidden">
                <img 
                  src={dish.image} 
                  alt={dish.name}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                />
                <div className="absolute top-3 right-3">
                  <Badge className={cn('text-white shadow-lg', getCategoryColor(dish.category))}>
                    {dish.category}
                  </Badge>
                </div>
              </div>
              <CardHeader>
                <CardTitle className="text-white text-xl">{dish.name}</CardTitle>
                <CardDescription className="text-slate-400 line-clamp-2">
                  {dish.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between border-t border-slate-700 pt-3">
                  <div className="flex items-center gap-2 text-slate-400 text-sm">
                    <Clock className="w-4 h-4" />
                    <span>{dish.prepTime} min</span>
                  </div>
                  <div className="text-2xl font-bold text-orange-500">
                    S/ {dish.price.toFixed(2)}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredDishes.length === 0 && (
          <div className="text-center py-20">
            <p className="text-slate-400 text-lg">No hay platos disponibles en esta categoría</p>
          </div>
        )}
      </div>

      <footer className="bg-slate-950 border-t border-slate-800 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center">
          <p className="text-slate-500 text-sm">
            © 2024 Restaurant Abocado - Todos los derechos reservados
          </p>
        </div>
      </footer>
    </div>
  );
}
