import React, { useEffect, useState } from 'react';
import { Product } from '../types';
import { getProducts } from '../services/groceryService';
import { getSmartRecommendations, smartSearch } from '../services/geminiService';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Skeleton } from '../components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Sparkles } from 'lucide-react';

interface HomeProps {
  searchQuery: string;
}

export const Home: React.FC<HomeProps> = ({ searchQuery }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('all');
  const { addItem } = useCart();
  const { user } = useAuth();

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const allProducts = await getProducts();
      console.log('Fetched products:', allProducts.length);
      
      let filtered = allProducts;
      if (searchQuery) {
        filtered = await smartSearch(searchQuery, allProducts);
      } else if (category !== 'all') {
        filtered = allProducts.filter(p => p.category === category);
      }
      
      setProducts(filtered);
      
      // Load recommendations if user is logged in
      if (user) {
        // In a real app, we'd fetch order history here
        const recs = await getSmartRecommendations([], allProducts);
        setRecommendations(recs);
      }
      
      setLoading(false);
    };
    loadData();
  }, [category, searchQuery, user]);

  return (
    <div className="space-y-8">
      {recommendations.length > 0 && !searchQuery && (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-yellow-500" />
            <h2 className="text-2xl font-bold tracking-tight">Smart Recommendations</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {recommendations.map(product => (
              <ProductCard key={product.id} product={product} onAdd={() => addItem(product.id)} />
            ))}
          </div>
        </section>
      )}

      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-2xl font-bold tracking-tight">
            {searchQuery ? `Search results for "${searchQuery}"` : 'Our Products'}
          </h2>
          {!searchQuery && (
            <Tabs defaultValue="all" onValueChange={setCategory}>
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="fruits">Fruits</TabsTrigger>
                <TabsTrigger value="vegetables">Vegetables</TabsTrigger>
                <TabsTrigger value="dairy">Dairy</TabsTrigger>
                <TabsTrigger value="snacks">Snacks</TabsTrigger>
              </TabsList>
            </Tabs>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="aspect-square rounded-xl" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map(product => (
              <ProductCard key={product.id} product={product} onAdd={() => addItem(product.id)} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 space-y-4">
            <p className="text-muted-foreground">No products found.</p>
            {user && user.email === 'bittush28032002@gmail.com' && (
              <Button onClick={() => {
                import('../seed').then(m => m.seedData()).then(() => window.location.reload());
              }}>
                Seed Initial Data
              </Button>
            )}
          </div>
        )}
      </section>
    </div>
  );
};

const ProductCard: React.FC<{ product: Product; onAdd: () => void }> = ({ product, onAdd }) => (
  <Card className="overflow-hidden group hover:shadow-lg transition-shadow">
    <div className="aspect-square relative overflow-hidden">
      <img 
        src={product.image} 
        alt={product.name} 
        className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
        referrerPolicy="no-referrer"
      />
      <Badge className="absolute top-2 right-2 bg-background/80 backdrop-blur text-foreground">
        {product.category}
      </Badge>
    </div>
    <CardHeader className="p-4">
      <div className="flex justify-between items-start">
        <CardTitle className="text-lg">{product.name}</CardTitle>
        <span className="font-bold text-primary">${product.price.toFixed(2)}</span>
      </div>
    </CardHeader>
    <CardContent className="p-4 pt-0">
      <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>
    </CardContent>
    <CardFooter className="p-4">
      <Button className="w-full" onClick={onAdd}>Add to Cart</Button>
    </CardFooter>
  </Card>
);
