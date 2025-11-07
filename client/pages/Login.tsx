import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth.context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Lock, User, ChefHat } from 'lucide-react';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login({ username, password });
      navigate('/dashboard');
    } catch (err) {
      setError('Usuario o contraseña incorrectos');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        
        <div className="hidden lg:block relative h-[600px] rounded-2xl overflow-hidden shadow-2xl">
          <img 
            src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80" 
            alt="Restaurant Abocado" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-orange-600/90 backdrop-blur-sm p-3 rounded-xl">
                <ChefHat className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-white">Restaurant Abocado</h2>
                <p className="text-slate-200">Ayacucho, Huamanga, Perú</p>
              </div>
            </div>
          </div>
        </div>

        
        <Card className="w-full bg-slate-800 border-slate-700">
          <CardHeader className="space-y-4 text-center">
            <div className="flex justify-center">
              <div className="bg-orange-600 p-4 rounded-full">
                <ChefHat className="w-12 h-12 text-white" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold text-white">
              Abocado Restaurant
            </CardTitle>
            <CardDescription className="text-slate-400">
              Ingresa tus credenciales para acceder
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert variant="destructive" className="bg-red-900 border-red-800">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="username" className="text-slate-300">
                  Usuario
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Ingresa tu usuario"
                    className="pl-10 bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-300">
                  Contraseña
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Ingresa tu contraseña"
                    className="pl-10 bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-6"
                disabled={isLoading}
              >
                {isLoading ? 'Ingresando...' : 'Iniciar Sesión'}
              </Button>

              <div className="bg-slate-700 rounded-lg p-4 space-y-2">
                <p className="text-xs text-slate-400 font-semibold">
                  Usuarios de prueba:
                </p>
                <div className="text-xs text-slate-300 space-y-1">
                  <div className="flex justify-between">
                    <span>Admin:</span>
                    <span className="text-orange-400">admin / admin123</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Chef:</span>
                    <span className="text-orange-400">chef / chef123</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Mozo:</span>
                    <span className="text-orange-400">mozo / mozo123</span>
                  </div>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
