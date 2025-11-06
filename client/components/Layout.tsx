import { ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/auth.context";
import { Button } from "@/components/ui/button";
import {
  UtensilsCrossed,
  Users,
  ChefHat,
  BookOpen,
  BarChart3,
  LogOut,
  UserCircle,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: ReactNode;
}

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/", icon: <BarChart3 className="w-5 h-5" /> },
  { label: "Mesas", href: "/tables", icon: <Users className="w-5 h-5" /> },
  { label: "Carta", href: "/menu", icon: <BookOpen className="w-5 h-5" /> },
  {
    label: "Cocina",
    href: "/kitchen",
    icon: <ChefHat className="w-5 h-5" />,
  },
  {
    label: "Servicio",
    href: "/service",
    icon: <UtensilsCrossed className="w-5 h-5" />,
  },
];

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleName = (role: string) => {
    const roles = {
      admin: 'Administrador',
      chef: 'Chef',
      waiter: 'Mozo',
    };
    return roles[role as keyof typeof roles] || role;
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-slate-950 border-b border-slate-800 shadow-lg">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center font-bold text-white">
                A
              </div>
              <div>
                <div className="text-lg font-bold text-white">Abocado</div>
                <div className="text-xs text-slate-400">Sistema de Restaurante</div>
              </div>
            </Link>

            <div className="flex items-center gap-6">
              <div className="text-right hidden sm:block">
                <p className="text-sm text-slate-400">
                  {new Date().toLocaleDateString("es-ES", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
                <p className="text-sm font-semibold text-slate-200">
                  {new Date().toLocaleTimeString("es-ES", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>

              {user && (
                <div className="flex items-center gap-4">
                  <div className="text-right border-r border-slate-700 pr-4">
                    <div className="flex items-center gap-2">
                      <UserCircle className="w-5 h-5 text-orange-500" />
                      <div>
                        <p className="text-sm font-semibold text-white">{user.username}</p>
                        <p className="text-xs text-slate-400">{getRoleName(user.role)}</p>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={handleLogout}
                    variant="ghost"
                    size="sm"
                    className="text-slate-400 hover:text-white hover:bg-slate-800"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Salir
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-slate-900 border-b border-slate-800 px-6">
        <div className="flex gap-0 overflow-x-auto">
          {navItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center gap-2 px-4 py-3 border-b-2 transition-colors duration-200 text-sm font-medium whitespace-nowrap",
                location.pathname === item.href
                  ? "border-orange-500 text-orange-500 bg-slate-800 bg-opacity-50"
                  : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800 hover:bg-opacity-30"
              )}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 px-6 py-8">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-800 mt-12">
        <div className="px-6 py-4 text-center text-slate-500 text-xs">
          <p>© 2024 Abocado - Sistema de Gestión de Restaurante | Versión 1.0</p>
        </div>
      </footer>
    </div>
  );
}
