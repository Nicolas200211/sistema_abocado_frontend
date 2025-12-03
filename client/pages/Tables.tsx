import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Layout from '@/components/Layout';
import TableIcon from '@/components/TableIcon';
import { tablesApi, Table } from '@/lib/api';
import { Plus, Filter, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

type TableFilter = 'all' | 'available' | 'occupied' | 'reserved';

export default function Tables() {
  const [filter, setFilter] = useState<TableFilter>('all');
  const queryClient = useQueryClient();

  const { data: tables = [], isLoading, error } = useQuery({
    queryKey: ['tables'],
    queryFn: tablesApi.getAll,
  });

  const clearTableMutation = useMutation({
    mutationFn: (tableId: string) => tablesApi.clear(tableId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables'] });
      toast.success('Mesa limpiada correctamente');
    },
    onError: () => {
      toast.error('Error al limpiar la mesa');
    },
  });

  const filteredTables = tables.filter((table: Table) => {
    if (filter === 'all') return true;
    return table.status === filter;
  });

  const stats = {
    total: tables.length,
    available: tables.filter((t: Table) => t.status === 'available').length,
    occupied: tables.filter((t: Table) => t.status === 'occupied').length,
    reserved: tables.filter((t: Table) => t.status === 'reserved').length,
  };

  const filters: { label: string; value: TableFilter; color: string }[] = [
    { label: 'Todas', value: 'all', color: 'text-slate-600' },
    { label: 'Disponibles', value: 'available', color: 'text-green-600' },
    { label: 'Ocupadas', value: 'occupied', color: 'text-blue-600' },
    { label: 'Reservadas', value: 'reserved', color: 'text-yellow-600' },
  ];

  const handleClearTable = (tableId: string) => {
    if (confirm('¿Estás seguro de limpiar esta mesa?')) {
      clearTableMutation.mutate(tableId);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-96">
          <p className="text-red-500">Error al cargar las mesas</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
            Gestión de Mesas
          </h1>
          <p className="text-slate-400 text-lg">
            {filteredTables.length} mesas • Control en tiempo real
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="relative overflow-hidden bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-5 shadow-xl">
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">Total</p>
            <p className="text-3xl font-bold text-white">{stats.total}</p>
          </div>
          <div className="relative overflow-hidden bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-sm border border-emerald-500/30 rounded-2xl p-5 shadow-xl">
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">Disponibles</p>
            <p className="text-3xl font-bold text-emerald-400">{stats.available}</p>
          </div>
          <div className="relative overflow-hidden bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-sm border border-blue-500/30 rounded-2xl p-5 shadow-xl">
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">Ocupadas</p>
            <p className="text-3xl font-bold text-blue-400">{stats.occupied}</p>
          </div>
          <div className="relative overflow-hidden bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-sm border border-amber-500/30 rounded-2xl p-5 shadow-xl">
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">Reservadas</p>
            <p className="text-3xl font-bold text-amber-400">{stats.reserved}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 overflow-x-auto pb-2">
          <Filter className="w-5 h-5 text-slate-500 flex-shrink-0" />
          {filters.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={cn(
                'px-5 py-2.5 rounded-xl font-semibold transition-all duration-200 whitespace-nowrap text-sm',
                filter === f.value
                  ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg shadow-orange-500/25'
                  : 'bg-slate-800/50 text-slate-300 border border-slate-700/50 hover:border-slate-600 hover:bg-slate-800'
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {filteredTables.map((table: Table) => (
            <div
              key={table.id}
              className="relative overflow-hidden bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 hover:border-orange-500/50 hover:shadow-xl hover:shadow-orange-500/10 transition-all duration-300 group"
            >
              <div className="flex flex-col items-center gap-4">
                <div className="transform group-hover:scale-110 transition-transform duration-300">
                  <TableIcon table={table} />
                </div>
                <div className="text-center w-full">
                  <p className="text-2xl font-bold text-white mb-1">Mesa {table.number}</p>
                  <p className="text-sm text-slate-400">
                    Capacidad: {table.capacity} personas
                  </p>
                  {table.partySize && (
                    <p className="text-sm text-blue-400 mt-1 font-medium">
                      {table.partySize} comensales
                    </p>
                  )}
                </div>
                {table.status === 'occupied' && (
                  <button
                    onClick={() => handleClearTable(table.id)}
                    disabled={clearTableMutation.isPending}
                    className="w-full px-4 py-2.5 bg-gradient-to-r from-orange-600 to-red-600 text-white text-sm font-semibold rounded-xl hover:from-orange-700 hover:to-red-700 transition-all duration-200 disabled:opacity-50 shadow-lg shadow-orange-500/25"
                  >
                    {clearTableMutation.isPending ? 'Limpiando...' : 'Limpiar Mesa'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredTables.length === 0 && (
          <div className="text-center py-20">
            <p className="text-slate-400 text-lg">No hay mesas con este estado</p>
          </div>
        )}
      </div>
    </Layout>
  );
}
