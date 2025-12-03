import { useState, useEffect } from 'react';
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
  const { login, isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, authLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login({ username, password });
      navigate('/dashboard');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      
      if (errorMessage.includes('conectar') || errorMessage.includes('servidor')) {
        setError('No se pudo conectar con el servidor. Verifica que el backend esté corriendo.');
      } else if (errorMessage.includes('401') || errorMessage.includes('credenciales') || errorMessage.includes('Invalid')) {
        setError('Usuario o contraseña incorrectos');
      } else {
        setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-grid-slate-800/[0.2] bg-[size:20px_20px] [mask-image:radial-gradient(ellipse_at_center,white,transparent)]" />
      <Card className="w-full max-w-md bg-slate-800/90 backdrop-blur-xl border-slate-700/50 shadow-2xl relative z-10">
        <CardHeader className="space-y-6 text-center pb-8">
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl blur-xl opacity-50" />
              <div className="relative bg-gradient-to-br from-orange-500 to-red-600 p-5 rounded-2xl shadow-lg">
                <ChefHat className="w-10 h-10 text-white" />
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
              Abocado Restaurant
            </CardTitle>
            <CardDescription className="text-slate-400 text-base">
              Sistema de gestión de restaurante
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <Alert variant="destructive" className="bg-red-950/50 border-red-800/50 backdrop-blur-sm">
                <AlertDescription className="text-red-200">{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="username" className="text-slate-200 font-medium">
                Usuario
              </Label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Ingresa tu usuario"
                  className="pl-12 h-12 bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-orange-500 focus:ring-orange-500/20 transition-all"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-200 font-medium">
                Contraseña
              </Label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Ingresa tu contraseña"
                  className="pl-12 h-12 bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-orange-500 focus:ring-orange-500/20 transition-all"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-semibold shadow-lg shadow-orange-500/25 transition-all duration-200"
              disabled={isLoading}
            >
              {isLoading ? 'Ingresando...' : 'Iniciar Sesión'}
            </Button>

            <div className="bg-slate-900/50 backdrop-blur-sm rounded-xl p-4 space-y-3 border border-slate-700/50">
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide">
                Usuarios de prueba
              </p>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-800/50">
                  <span className="text-sm text-slate-300 font-medium">Admin</span>
                  <span className="text-xs text-orange-400 font-mono">admin / admin123</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-800/50">
                  <span className="text-sm text-slate-300 font-medium">Chef</span>
                  <span className="text-xs text-orange-400 font-mono">chef / chef123</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-800/50">
                  <span className="text-sm text-slate-300 font-medium">Mozo</span>
                  <span className="text-xs text-orange-400 font-mono">mozo / mozo123</span>
                </div>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
