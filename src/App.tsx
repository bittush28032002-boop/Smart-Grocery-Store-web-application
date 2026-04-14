import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { Navbar } from './components/Navbar';
import { Home } from './pages/Home';
import { Cart } from './pages/Cart';
import { Orders } from './pages/Orders';
import { Profile } from './pages/Profile';
import { Toaster } from './components/ui/sonner';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <Home searchQuery={searchQuery} />;
      case 'cart':
        return <Cart onNavigate={setCurrentPage} />;
      case 'orders':
        return <Orders />;
      case 'profile':
        return <Profile />;
      default:
        return <Home searchQuery={searchQuery} />;
    }
  };

  return (
    <AuthProvider>
      <CartProvider>
        <div className="min-h-screen bg-background font-sans antialiased">
          <Navbar 
            onSearch={setSearchQuery} 
            onNavigate={setCurrentPage} 
          />
          <main className="container mx-auto px-4 py-8 max-w-7xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentPage}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {renderPage()}
              </motion.div>
            </AnimatePresence>
          </main>
          <Toaster />
        </div>
      </CartProvider>
    </AuthProvider>
  );
}
