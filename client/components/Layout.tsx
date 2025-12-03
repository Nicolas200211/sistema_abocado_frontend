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
  Bell,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: ReactNode;
  allowedRoles?: string[];
}

const allNavItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: <BarChart3 className="w-5 h-5" /> },
  { label: "Mesas", href: "/tables", icon: <Users className="w-5 h-5" />, allowedRoles: ['admin', 'waiter'] },
  { label: "Carta", href: "/menu", icon: <BookOpen className="w-5 h-5" /> },
  {
    label: "Cocina",
    href: "/kitchen",
    icon: <ChefHat className="w-5 h-5" />,
    allowedRoles: ['admin', 'chef'],
  },
  {
    label: "Órdenes",
    href: "/service",
    icon: <UtensilsCrossed className="w-5 h-5" />,
    allowedRoles: ['admin', 'waiter'],
  },
  {
    label: "Entrega",
    href: "/ready",
    icon: <Bell className="w-5 h-5" />,
    allowedRoles: ['admin', 'waiter'],
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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50 flex flex-col">
      <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/50 shadow-lg">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl blur-md opacity-50 group-hover:opacity-75 transition-opacity" />
                <div className="relative w-11 h-11 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center font-bold text-white shadow-lg">
                  A
                </div>
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
                  <div className="text-right border-r border-slate-700/50 pr-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-500/20 to-red-600/20 border border-orange-500/30 flex items-center justify-center">
                        <UserCircle className="w-5 h-5 text-orange-500" />
                      </div>
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
                    className="text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors"
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

      <nav className="bg-slate-900/50 backdrop-blur-sm border-b border-slate-800/50 px-6">
        <div className="flex gap-1 overflow-x-auto">
          {allNavItems
            .filter((item) => {
              if (!item.allowedRoles) return true;
              if (!user) return false;
              return item.allowedRoles.includes(user.role);
            })
            .map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center gap-2.5 px-5 py-3.5 border-b-2 transition-all duration-200 text-sm font-medium whitespace-nowrap relative",
                  location.pathname === item.href
                    ? "border-orange-500 text-orange-500 bg-slate-800/30"
                    : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/20"
                )}
              >
                {item.icon}
                <span>{item.label}</span>
                {location.pathname === item.href && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-orange-500 to-red-600" />
                )}
              </Link>
            ))}
        </div>
      </nav>

      <main className="flex-1 px-6 py-8">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>

      <footer className="bg-slate-950/50 backdrop-blur-sm border-t border-slate-800/50 mt-auto">
        <div className="px-6 py-4 text-center text-slate-500 text-xs">
          <p>© 2024 Abocado - Sistema de Gestión de Restaurante | Versión 1.0</p>
        </div>
      </footer>
    </div>
  );
}
