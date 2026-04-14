export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  role: 'user' | 'admin';
  createdAt: any;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'fruits' | 'vegetables' | 'dairy' | 'snacks' | 'beverages';
  image: string;
  stock: number;
  searchKeywords: string[];
}

export interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  addedAt: any;
  product?: Product; // Populated for UI
}

export interface Address {
  id: string;
  label: string;
  street: string;
  city: string;
  state: string;
  zip: string;
}

export interface Order {
  id: string;
  userId: string;
  items: {
    productId: string;
    name: string;
    price: number;
    quantity: number;
  }[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered';
  address: Address;
  createdAt: any;
}
