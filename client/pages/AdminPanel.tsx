import { useEffect, useMemo, useState } from 'react';
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/auth.context';
import { dishesApi, Dish } from '@/lib/api/dishes.api';
import { staffApi } from '@/lib/api/staff.api';
import { StaffMember } from '@/types/restaurant';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Pencil, Trash2, Plus, Users, Utensils } from 'lucide-react';

type DishFormState = {
  name: string;
  description: string;
  price: string;
  category: 'principal' | 'lado' | 'bebida' | 'postre';
  prepTime: string;
  image: string;
  available: boolean;
};

type StaffFormState = {
  name: string;
  email: string;
  phone: string;
  role: 'chef' | 'waiter' | 'bartender';
};

const initialDishForm: DishFormState = {
  name: '',
  description: '',
  price: '',
  category: 'principal',
  prepTime: '10',
  image: '',
  available: true,
};

const initialStaffForm: StaffFormState = {
  name: '',
  email: '',
  phone: '',
  role: 'chef',
};

export default function AdminPanel() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [activeTab, setActiveTab] = useState<'dishes' | 'staff'>('dishes');

  const [dishForm, setDishForm] = useState<DishFormState>(initialDishForm);
  const [isDishDialogOpen, setIsDishDialogOpen] = useState(false);
  const [editingDish, setEditingDish] = useState<Dish | null>(null);

  const [staffForm, setStaffForm] = useState<StaffFormState>(initialStaffForm);
  const [isStaffDialogOpen, setIsStaffDialogOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [dishesData, staffData] = await Promise.all([
        dishesApi.getAll(),
        staffApi.getAll(),
      ]);
      setDishes([...dishesData]);
      setStaff([...staffData]);
    } catch (error) {
      console.error(error);
      toast.error('Error al cargar datos del panel');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const resetDishForm = () => {
    setDishForm(initialDishForm);
    setEditingDish(null);
  };

  const resetStaffForm = () => {
    setStaffForm(initialStaffForm);
    setEditingStaff(null);
  };

  const handleSubmitDish = async () => {
    if (!dishForm.name || !dishForm.description || !dishForm.price || !dishForm.image) {
      toast.error('Completa todos los campos del plato');
      return;
    }

    const payload = {
      name: dishForm.name,
      description: dishForm.description,
      price: Number(dishForm.price),
      category: dishForm.category,
      prepTime: Number(dishForm.prepTime),
      image: dishForm.image,
      available: dishForm.available,
    };

    try {
      if (editingDish) {
        await dishesApi.update(editingDish.id, payload);
        toast.success('Plato actualizado correctamente');
      } else {
        await dishesApi.create(payload);
        toast.success('Plato agregado correctamente');
      }
      await loadData();
      setIsDishDialogOpen(false);
      resetDishForm();
    } catch (error) {
      console.error(error);
      toast.error('No se pudo guardar el plato');
    }
  };

  const handleEditDish = (dish: Dish) => {
    setEditingDish(dish);
    setDishForm({
      name: dish.name,
      description: dish.description,
      price: dish.price.toString(),
      category: dish.category,
      prepTime: dish.prepTime.toString(),
      image: dish.image,
      available: dish.available,
    });
    setIsDishDialogOpen(true);
  };

  const handleDeleteDish = async (dish: Dish) => {
    if (!confirm(`¿Eliminar plato "${dish.name}"?`)) return;
    try {
      await dishesApi.delete(dish.id);
      toast.success('Plato eliminado');
      await loadData();
    } catch (error) {
      console.error(error);
      toast.error('No se pudo eliminar el plato');
    }
  };

  const handleSubmitStaff = async () => {
    if (!staffForm.name || !staffForm.email || !staffForm.phone) {
      toast.error('Completa todos los campos del personal');
      return;
    }

    try {
      if (editingStaff) {
        await staffApi.update(editingStaff.id, {
          ...staffForm,
        });
        toast.success('Personal actualizado correctamente');
      } else {
        await staffApi.create({
          ...staffForm,
        });
        toast.success('Personal registrado correctamente');
      }
      await loadData();
      setIsStaffDialogOpen(false);
      resetStaffForm();
    } catch (error) {
      console.error(error);
      toast.error('No se pudo guardar al personal');
    }
  };

  const handleEditStaff = (member: StaffMember) => {
    setEditingStaff(member);
    setStaffForm({
      name: member.name,
      email: member.email,
      phone: member.phone,
      role: member.role,
    });
    setIsStaffDialogOpen(true);
  };

  const handleDeleteStaff = async (member: StaffMember) => {
    if (!confirm(`¿Eliminar a ${member.name}?`)) return;
    try {
      await staffApi.delete(member.id);
      toast.success('Personal eliminado');
      await loadData();
    } catch (error) {
      console.error(error);
      toast.error('No se pudo eliminar al personal');
    }
  };

  const formattedStaff = useMemo(
    () =>
      staff.map((member) => ({
        ...member,
        hireDateInstance: member.hireDate instanceof Date ? member.hireDate : new Date(member.hireDate),
      })),
    [staff],
  );

  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">Panel Administrador</h1>
            <p className="text-slate-400 mt-2">
              Gestiona el menú, personal y recursos del restaurante.
            </p>
          </div>
          <div className="text-sm text-slate-400">
            Usuario: <span className="font-semibold text-orange-400">{user?.username}</span> (Administrador)
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'dishes' | 'staff')} className="space-y-6">
          <TabsList className="bg-slate-800 border border-slate-700">
            <TabsTrigger value="dishes" className="data-[state=active]:bg-orange-600 data-[state=active]:text-white">
              <Utensils className="w-4 h-4 mr-2" />
              Platos y Bebidas
            </TabsTrigger>
            <TabsTrigger value="staff" className="data-[state=active]:bg-orange-600 data-[state=active]:text-white">
              <Users className="w-4 h-4 mr-2" />
              Personal
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dishes" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-white">Gestión de Platos y Bebidas</h2>
                <p className="text-slate-400">Administra todo el menú incluído bebidas y postres.</p>
              </div>
              <Dialog open={isDishDialogOpen} onOpenChange={(open) => { setIsDishDialogOpen(open); if (!open) resetDishForm(); }}>
                <DialogTrigger asChild>
                  <Button className="bg-orange-600 hover:bg-orange-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Nuevo plato / bebida
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-slate-900 border border-slate-700 text-white">
                  <DialogHeader>
                    <DialogTitle>{editingDish ? 'Editar plato' : 'Registrar nuevo plato'}</DialogTitle>
                    <DialogDescription className="text-slate-400">
                      Completa la información del plato o bebida. Los cambios se reflejarán inmediatamente.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4 text-left">
                    <div className="space-y-2">
                      <Label htmlFor="dish-name">Nombre</Label>
                      <Input
                        id="dish-name"
                        value={dishForm.name}
                        onChange={(e) => setDishForm((prev) => ({ ...prev, name: e.target.value }))}
                        placeholder="Ej. Pollo a la brasa"
                        className="bg-slate-800 border-slate-700 text-white"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="dish-price">Precio (S/)</Label>
                      <Input
                        id="dish-price"
                        type="number"
                        min={0}
                        step="0.1"
                        value={dishForm.price}
                        onChange={(e) => setDishForm((prev) => ({ ...prev, price: e.target.value }))}
                        className="bg-slate-800 border-slate-700 text-white"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="dish-category">Categoría</Label>
                      <Select
                        value={dishForm.category}
                        onValueChange={(value: DishFormState['category']) =>
                          setDishForm((prev) => ({ ...prev, category: value }))
                        }
                      >
                        <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                          <SelectValue placeholder="Selecciona una categoría" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-700 text-white">
                          <SelectItem value="principal">Plato Principal</SelectItem>
                          <SelectItem value="lado">Acompañamiento</SelectItem>
                          <SelectItem value="bebida">Bebida</SelectItem>
                          <SelectItem value="postre">Postre</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="dish-preptime">Tiempo de preparación (min)</Label>
                      <Input
                        id="dish-preptime"
                        type="number"
                        min={1}
                        value={dishForm.prepTime}
                        onChange={(e) => setDishForm((prev) => ({ ...prev, prepTime: e.target.value }))}
                        className="bg-slate-800 border-slate-700 text-white"
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="dish-image">URL de imagen</Label>
                      <Input
                        id="dish-image"
                        value={dishForm.image}
                        onChange={(e) => setDishForm((prev) => ({ ...prev, image: e.target.value }))}
                        placeholder="https://..."
                        className="bg-slate-800 border-slate-700 text-white"
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="dish-description">Descripción</Label>
                      <Textarea
                        id="dish-description"
                        value={dishForm.description}
                        onChange={(e) => setDishForm((prev) => ({ ...prev, description: e.target.value }))}
                        placeholder="Describe el plato y sus ingredientes principales"
                        className="bg-slate-800 border-slate-700 text-white min-h-[100px]"
                      />
                    </div>
                  </div>

                  <DialogFooter className="flex justify-end gap-2">
                    <Button variant="ghost" onClick={() => { setIsDishDialogOpen(false); resetDishForm(); }}>
                      Cancelar
                    </Button>
                    <Button onClick={handleSubmitDish} className="bg-orange-600 hover:bg-orange-700">
                      {editingDish ? 'Guardar cambios' : 'Registrar plato'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {isLoading ? (
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-10 text-center text-slate-400">
                Cargando información...
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 justify-items-center">
                {dishes.map((dish) => (
                  <Card key={dish.id} className="w-full max-w-[280px] sm:max-w-[320px] min-h-[360px] bg-slate-800 border border-slate-700 overflow-hidden flex flex-col">
                    <div className="relative h-48 w-full overflow-hidden">
                      <img
                        src={dish.image}
                        alt={dish.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-3 left-3">
                        <Badge className="bg-orange-600 text-white capitalize">
                          {dish.category === 'principal' && 'Principal'}
                          {dish.category === 'lado' && 'Acompañamiento'}
                          {dish.category === 'bebida' && 'Bebida'}
                          {dish.category === 'postre' && 'Postre'}
                        </Badge>
                      </div>
                      {!dish.available && (
                        <div className="absolute bottom-3 left-3 bg-red-600 text-white px-3 py-1 rounded-lg text-xs font-semibold">
                          No disponible
                        </div>
                      )}
                    </div>
                    <CardHeader className="flex-1">
                      <div className="flex flex-col gap-2">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <CardTitle className="text-white">{dish.name}</CardTitle>
                            <CardDescription className="text-slate-400 line-clamp-3">
                              {dish.description}
                            </CardDescription>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-orange-500">S/ {dish.price.toFixed(2)}</p>
                            <p className="text-xs text-slate-400 mt-1">{dish.prepTime} min preparación</p>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="mt-auto">
                      <div className="flex justify-end gap-2 border-t border-slate-700 pt-3">
                        <Button variant="ghost" size="icon" onClick={() => handleEditDish(dish)} className="text-slate-400 hover:text-white">
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteDish(dish)} className="text-red-500 hover:text-red-300">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="staff" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-white">Gestión de Personal</h2>
                <p className="text-slate-400">Administra chefs, meseros y bartenders.</p>
              </div>
              <Dialog open={isStaffDialogOpen} onOpenChange={(open) => { setIsStaffDialogOpen(open); if (!open) resetStaffForm(); }}>
                <DialogTrigger asChild>
                  <Button className="bg-orange-600 hover:bg-orange-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Registrar personal
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-slate-900 border border-slate-700 text-white">
                  <DialogHeader>
                    <DialogTitle>{editingStaff ? 'Editar personal' : 'Registrar personal'}</DialogTitle>
                    <DialogDescription className="text-slate-400">
                      Gestiona los datos del personal del restaurante.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4 text-left">
                    <div className="space-y-2">
                      <Label htmlFor="staff-name">Nombre completo</Label>
                      <Input
                        id="staff-name"
                        value={staffForm.name}
                        onChange={(e) => setStaffForm((prev) => ({ ...prev, name: e.target.value }))}
                        placeholder="Ej. Juan Pérez"
                        className="bg-slate-800 border-slate-700 text-white"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="staff-role">Rol</Label>
                      <Select
                        value={staffForm.role}
                        onValueChange={(value: StaffFormState['role']) =>
                          setStaffForm((prev) => ({ ...prev, role: value }))
                        }
                      >
                        <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                          <SelectValue placeholder="Selecciona un rol" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-700 text-white">
                          <SelectItem value="chef">Chef</SelectItem>
                          <SelectItem value="waiter">Mesero</SelectItem>
                          <SelectItem value="bartender">Bartender</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="staff-email">Correo</Label>
                      <Input
                        id="staff-email"
                        type="email"
                        value={staffForm.email}
                        onChange={(e) => setStaffForm((prev) => ({ ...prev, email: e.target.value }))}
                        placeholder="correo@ejemplo.com"
                        className="bg-slate-800 border-slate-700 text-white"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="staff-phone">Teléfono</Label>
                      <Input
                        id="staff-phone"
                        value={staffForm.phone}
                        onChange={(e) => setStaffForm((prev) => ({ ...prev, phone: e.target.value }))}
                        placeholder="+51 ..."
                        className="bg-slate-800 border-slate-700 text-white"
                      />
                    </div>
                  </div>

                  <DialogFooter>
                    <Button variant="ghost" onClick={() => { setIsStaffDialogOpen(false); resetStaffForm(); }}>
                      Cancelar
                    </Button>
                    <Button onClick={handleSubmitStaff} className="bg-orange-600 hover:bg-orange-700">
                      {editingStaff ? 'Guardar cambios' : 'Registrar personal'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {isLoading ? (
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-10 text-center text-slate-400">
                Cargando información...
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {formattedStaff.map((member) => (
                  <Card key={member.id} className="bg-slate-800 border border-slate-700">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-white">{member.name}</CardTitle>
                        <Badge className="bg-orange-600 text-white capitalize">{member.role}</Badge>
                      </div>
                      <CardDescription className="text-slate-400">
                        Ingreso: {member.hireDateInstance.toLocaleDateString('es-PE')}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-1 text-sm text-slate-300">
                        <p><span className="text-slate-500">Correo:</span> {member.email}</p>
                        <p><span className="text-slate-500">Teléfono:</span> {member.phone}</p>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEditStaff(member)} className="text-slate-400 hover:text-white">
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteStaff(member)} className="text-red-500 hover:text-red-300">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}

