import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi, LoginCredentials, LoginResponse } from '@/lib/api/auth.api';

interface User {
  id: string;
  username: string;
  role: 'admin' | 'chef' | 'waiter';
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (credentials: LoginCredentials) => {
    
    
    
    
    const username = credentials.username.toLowerCase();
    let role: 'admin' | 'chef' | 'waiter' = 'admin';
    
    if (username === 'admin') {
      role = 'admin';
    } else if (username === 'chef') {
      role = 'chef';
    } else if (username === 'mozo') {
      role = 'waiter';
    }
    
    const mockResponse: LoginResponse = {
      access_token: 'mock-token-' + Date.now(),
      user: {
        id: '1',
        username: credentials.username || 'usuario',
        role: role,
      },
    };

    setToken(mockResponse.access_token);
    setUser(mockResponse.user);

    localStorage.setItem('token', mockResponse.access_token);
    localStorage.setItem('user', JSON.stringify(mockResponse.user));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        isAuthenticated: !!user,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
