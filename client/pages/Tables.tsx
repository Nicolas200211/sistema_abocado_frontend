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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">Gestión de Mesas</h1>
            <p className="text-slate-400 mt-2">
              {filteredTables.length} mesas • Control en tiempo real
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-800 border border-slate-700">
            <p className="text-slate-400 text-sm font-semibold uppercase">Total</p>
            <p className="text-3xl font-bold text-white mt-2">{stats.total}</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-800 border border-slate-700">
            <p className="text-slate-400 text-sm font-semibold uppercase">Disponibles</p>
            <p className="text-3xl font-bold text-emerald-500 mt-2">{stats.available}</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-800 border border-slate-700">
            <p className="text-slate-400 text-sm font-semibold uppercase">Ocupadas</p>
            <p className="text-3xl font-bold text-blue-500 mt-2">{stats.occupied}</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-800 border border-slate-700">
            <p className="text-slate-400 text-sm font-semibold uppercase">Reservadas</p>
            <p className="text-3xl font-bold text-amber-500 mt-2">{stats.reserved}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 overflow-x-auto pb-2">
          <Filter className="w-5 h-5 text-slate-500 flex-shrink-0" />
          {filters.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={cn(
                'px-4 py-2 rounded-lg font-semibold transition-colors whitespace-nowrap text-sm',
                filter === f.value
                  ? 'bg-orange-600 text-white'
                  : 'bg-slate-800 text-slate-300 border border-slate-700 hover:border-slate-600'
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
              className="bg-slate-800 border border-slate-700 rounded-xl p-6 hover:border-orange-500 transition-colors"
            >
              <div className="flex flex-col items-center gap-4">
                <TableIcon table={table} />
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">Mesa {table.number}</p>
                  <p className="text-sm text-slate-400 mt-1">
                    Capacidad: {table.capacity} personas
                  </p>
                  {table.partySize && (
                    <p className="text-sm text-blue-400 mt-1">
                      Comensales: {table.partySize}
                    </p>
                  )}
                </div>
                {table.status === 'occupied' && (
                  <button
                    onClick={() => handleClearTable(table.id)}
                    disabled={clearTableMutation.isPending}
                    className="w-full px-3 py-2 bg-orange-600 text-white text-sm font-semibold rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50"
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
