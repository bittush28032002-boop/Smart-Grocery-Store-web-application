import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Address } from '../types';
import { getAddresses, addAddress, deleteAddress } from '../services/groceryService';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { MapPin, Plus, Trash2, User as UserIcon, Mail } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { toast } from 'sonner';

export const Profile: React.FC = () => {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newAddress, setNewAddress] = useState({
    label: '',
    street: '',
    city: '',
    state: '',
    zip: ''
  });

  React.useEffect(() => {
    if (user) {
      const unsubscribe = getAddresses(user.uid, setAddresses);
      return unsubscribe;
    }
  }, [user]);

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    await addAddress(user.uid, newAddress);
    setIsAddOpen(false);
    setNewAddress({ label: '', street: '', city: '', state: '', zip: '' });
    toast.success("Address added successfully");
  };

  const handleDelete = async (id: string) => {
    if (!user) return;
    await deleteAddress(user.uid, id);
    toast.success("Address deleted");
  };

  if (!user) return <div className="text-center py-20">Please login to view profile</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Account Details</h2>
        <Card>
          <CardContent className="p-6 flex items-center gap-6">
            <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
              {user.photoURL ? (
                <img src={user.photoURL} alt={user.displayName || ''} className="h-full w-full object-cover" />
              ) : (
                <UserIcon className="h-10 w-10 text-primary" />
              )}
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-bold">{user.displayName}</h3>
              <p className="text-muted-foreground flex items-center gap-2">
                <Mail className="h-4 w-4" /> {user.email}
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Saved Addresses</h2>
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2">
                <Plus className="h-4 w-4" /> Add Address
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Address</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddAddress} className="space-y-4">
                <Input 
                  placeholder="Label (e.g. Home, Work)" 
                  required 
                  value={newAddress.label}
                  onChange={e => setNewAddress({...newAddress, label: e.target.value})}
                />
                <Input 
                  placeholder="Street Address" 
                  required 
                  value={newAddress.street}
                  onChange={e => setNewAddress({...newAddress, street: e.target.value})}
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input 
                    placeholder="City" 
                    required 
                    value={newAddress.city}
                    onChange={e => setNewAddress({...newAddress, city: e.target.value})}
                  />
                  <Input 
                    placeholder="State" 
                    required 
                    value={newAddress.state}
                    onChange={e => setNewAddress({...newAddress, state: e.target.value})}
                  />
                </div>
                <Input 
                  placeholder="ZIP Code" 
                  required 
                  value={newAddress.zip}
                  onChange={e => setNewAddress({...newAddress, zip: e.target.value})}
                />
                <Button type="submit" className="w-full">Save Address</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map(address => (
            <Card key={address.id}>
              <CardContent className="p-4 flex items-start justify-between">
                <div className="flex gap-3">
                  <MapPin className="h-5 w-5 text-primary mt-1" />
                  <div>
                    <h4 className="font-bold">{address.label}</h4>
                    <p className="text-sm text-muted-foreground">{address.street}</p>
                    <p className="text-sm text-muted-foreground">{address.city}, {address.state} {address.zip}</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(address.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
          {addresses.length === 0 && (
            <div className="col-span-full py-12 text-center border border-dashed rounded-xl">
              <p className="text-muted-foreground">No addresses saved yet.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
