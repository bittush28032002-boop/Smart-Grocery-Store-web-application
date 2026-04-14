import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Order } from '../types';
import { getOrders } from '../services/groceryService';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Package, Calendar, MapPin, ChevronRight } from 'lucide-react';
import { Skeleton } from '../components/ui/skeleton';

export const Orders: React.FC = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      const loadOrders = async () => {
        const data = await getOrders(user.uid);
        setOrders(data);
        setLoading(false);
      };
      loadOrders();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Your Orders</h2>
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-32 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Your Orders</h2>
      {orders.length > 0 ? (
        <div className="space-y-4">
          {orders.map(order => (
            <Card key={order.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
                <div className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-primary" />
                  <CardTitle className="text-base">Order #{order.id.slice(-6).toUpperCase()}</CardTitle>
                </div>
                <Badge variant={order.status === 'delivered' ? 'default' : 'secondary'}>
                  {order.status.toUpperCase()}
                </Badge>
              </CardHeader>
              <CardContent className="p-4 pt-0 space-y-4">
                <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {order.createdAt?.toDate().toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {order.address.label}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex -space-x-2 overflow-hidden">
                    {order.items.slice(0, 3).map((item, i) => (
                      <div key={i} className="h-8 w-8 rounded-full border-2 border-background bg-muted flex items-center justify-center text-[10px] font-bold">
                        {item.name[0]}
                      </div>
                    ))}
                    {order.items.length > 3 && (
                      <div className="h-8 w-8 rounded-full border-2 border-background bg-muted flex items-center justify-center text-[10px] font-bold">
                        +{order.items.length - 3}
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">{order.items.length} items</p>
                    <p className="font-bold text-lg">${order.total.toFixed(2)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 border rounded-xl border-dashed">
          <Package className="h-12 w-12 text-muted-foreground mx-auto opacity-20 mb-4" />
          <p className="text-muted-foreground">You haven't placed any orders yet.</p>
        </div>
      )}
    </div>
  );
};
