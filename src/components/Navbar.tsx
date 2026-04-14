import React from 'react';
import { ShoppingCart, User, LogOut, Search, Store } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';

interface NavbarProps {
  onSearch: (query: string) => void;
  onNavigate: (page: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onSearch, onNavigate }) => {
  const { user, login, logout } = useAuth();
  const { items } = useCart();

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <div 
          className="flex items-center gap-2 cursor-pointer" 
          onClick={() => onNavigate('home')}
        >
          <Store className="h-6 w-6 text-primary" />
          <span className="font-bold text-xl hidden sm:inline-block">SmartGrocer</span>
        </div>

        <div className="flex-1 max-w-md relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search groceries..." 
            className="pl-10"
            onChange={(e) => onSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => onNavigate('cart')} className="relative">
            <ShoppingCart className="h-5 w-5" />
            {items.length > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px]">
                {items.length}
              </Badge>
            )}
          </Button>

          {user && user.email === 'bittush28032002@gmail.com' && (
            <Button variant="outline" size="sm" onClick={() => {
              import('../seed').then(m => m.seedData()).then(() => window.location.reload());
            }}>
              Seed
            </Button>
          )}

          {user ? (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={() => onNavigate('profile')}>
                <User className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={logout}>
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          ) : (
            <Button onClick={login}>Login</Button>
          )}
        </div>
      </div>
    </nav>
  );
};
