import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Separator } from '../components/ui/separator';
import { Trash2, Plus, Minus, ShoppingBag, MapPin, CreditCard } from 'lucide-react';
import { placeOrder, getAddresses } from '../services/groceryService';
import { Address } from '../types';
import { toast } from 'sonner';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { PaymentForm } from '../components/PaymentForm';
import axios from 'axios';

const stripePromise = loadStripe(process.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder');

export const Cart: React.FC<{ onNavigate: (page: string) => void }> = ({ onNavigate }) => {
  const { items, total, updateQuantity, clear } = useCart();
  const { user } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  React.useEffect(() => {
    if (user) {
      const unsubscribe = getAddresses(user.uid, (data) => {
        setAddresses(data);
        if (data.length > 0 && !selectedAddress) setSelectedAddress(data[0]);
      });
      return unsubscribe;
    }
  }, [user]);

  const startCheckout = async () => {
    if (!user) {
      toast.error("Please login to checkout");
      return;
    }
    if (!selectedAddress) {
      toast.error("Please select an address");
      onNavigate('profile');
      return;
    }

    try {
      setIsCheckingOut(true);
      const { data } = await axios.post('/api/create-payment-intent', {
        amount: total
      });
      setClientSecret(data.clientSecret);
      setShowPayment(true);
    } catch (error) {
      console.error("Payment Intent Error:", error);
      toast.error("Failed to initialize payment. Please check Stripe configuration.");
      // Fallback for demo if no key is provided
      if (!process.env.VITE_STRIPE_PUBLISHABLE_KEY) {
        setShowPayment(true);
      }
    } finally {
      setIsCheckingOut(false);
    }
  };

  const handlePaymentSuccess = async () => {
    if (!user || !selectedAddress) return;

    const orderData = {
      userId: user.uid,
      items: items.map(item => ({
        productId: item.productId,
        name: item.product?.name || 'Unknown',
        price: item.product?.price || 0,
        quantity: item.quantity
      })),
      total,
      status: 'pending' as const,
      address: selectedAddress,
      createdAt: new Date()
    };

    const orderId = await placeOrder(orderData);
    if (orderId) {
      await clear();
      toast.success("Order placed successfully!");
      onNavigate('orders');
    } else {
      toast.error("Failed to place order");
    }
  };

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <ShoppingBag className="h-16 w-16 text-muted-foreground opacity-20" />
        <h2 className="text-2xl font-bold">Your cart is empty</h2>
        <p className="text-muted-foreground">Add some fresh groceries to get started!</p>
        <Button onClick={() => onNavigate('home')}>Browse Products</Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-4">
        <h2 className="text-2xl font-bold">Shopping Cart</h2>
        {items.map(item => (
          <Card key={item.id}>
            <CardContent className="p-4 flex items-center gap-4">
              <img 
                src={item.product?.image} 
                alt={item.product?.name} 
                className="h-20 w-20 object-cover rounded-md"
                referrerPolicy="no-referrer"
              />
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold truncate">{item.product?.name}</h3>
                <p className="text-sm text-muted-foreground">${item.product?.price.toFixed(2)} each</p>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-8 w-8"
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-8 text-center font-medium">{item.quantity}</span>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-8 w-8"
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="text-right min-w-[80px]">
                <p className="font-bold">${((item.product?.price || 0) * item.quantity).toFixed(2)}</p>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-destructive h-8 w-8"
                  onClick={() => updateQuantity(item.id, 0)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="space-y-6">
        <Card>
          <CardContent className="p-6 space-y-4">
            <h3 className="text-xl font-bold">Order Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Delivery</span>
                <span className="text-green-600">FREE</span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            {!showPayment ? (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <MapPin className="h-4 w-4" /> Delivery Address
                  </label>
                  {addresses.length > 0 ? (
                    <div className="space-y-2">
                      {addresses.map(addr => (
                        <div 
                          key={addr.id}
                          className={`p-3 border rounded-md cursor-pointer transition-colors ${selectedAddress?.id === addr.id ? 'border-primary bg-primary/5' : 'hover:bg-muted'}`}
                          onClick={() => setSelectedAddress(addr)}
                        >
                          <p className="font-medium text-sm">{addr.label}</p>
                          <p className="text-xs text-muted-foreground">{addr.street}, {addr.city}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 border border-dashed rounded-md text-center">
                      <p className="text-sm text-muted-foreground mb-2">No addresses saved</p>
                      <Button variant="outline" size="sm" onClick={() => onNavigate('profile')}>Add Address</Button>
                    </div>
                  )}
                </div>

                <Button 
                  className="w-full h-12 text-lg gap-2" 
                  onClick={startCheckout}
                  disabled={isCheckingOut || items.length === 0}
                >
                  <CreditCard className="h-5 w-5" />
                  {isCheckingOut ? 'Initializing...' : 'Proceed to Payment'}
                </Button>
              </>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold">Payment Details</h4>
                  <Button variant="ghost" size="sm" onClick={() => setShowPayment(false)}>Change Address</Button>
                </div>
                {clientSecret ? (
                  <Elements stripe={stripePromise} options={{ clientSecret }}>
                    <PaymentForm 
                      amount={total} 
                      onSuccess={handlePaymentSuccess} 
                      onCancel={() => setShowPayment(false)} 
                    />
                  </Elements>
                ) : (
                  <div className="p-4 border rounded-md bg-muted/50 text-center space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Stripe is not configured. In a real app, you would see the payment form here.
                    </p>
                    <Button className="w-full" onClick={handlePaymentSuccess}>
                      Simulate Successful Payment
                    </Button>
                    <Button variant="ghost" className="w-full" onClick={() => setShowPayment(false)}>
                      Go Back
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
