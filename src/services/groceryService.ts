import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  onSnapshot, 
  addDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { db, OperationType, handleFirestoreError } from '../firebase';
import { Product, CartItem, Order, Address, UserProfile } from '../types';

// Products
export const getProducts = async (category?: string) => {
  const path = 'products';
  try {
    const q = category 
      ? query(collection(db, path), where('category', '==', category))
      : collection(db, path);
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
};

export const getProduct = async (id: string) => {
  const path = `products/${id}`;
  try {
    const docSnap = await getDoc(doc(db, 'products', id));
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Product;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return null;
  }
};

// Cart
export const getCart = (userId: string, callback: (items: CartItem[]) => void) => {
  const path = `users/${userId}/cart`;
  const q = query(collection(db, 'users', userId, 'cart'), orderBy('addedAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CartItem)));
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, path);
  });
};

export const addToCart = async (userId: string, productId: string, quantity: number = 1) => {
  const path = `users/${userId}/cart/${productId}`;
  try {
    const cartRef = doc(db, 'users', userId, 'cart', productId);
    const cartSnap = await getDoc(cartRef);
    
    if (cartSnap.exists()) {
      await updateDoc(cartRef, {
        quantity: cartSnap.data().quantity + quantity
      });
    } else {
      await setDoc(cartRef, {
        productId,
        quantity,
        addedAt: serverTimestamp()
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
};

export const updateCartQuantity = async (userId: string, itemId: string, quantity: number) => {
  const path = `users/${userId}/cart/${itemId}`;
  try {
    if (quantity <= 0) {
      await deleteDoc(doc(db, 'users', userId, 'cart', itemId));
    } else {
      await updateDoc(doc(db, 'users', userId, 'cart', itemId), { quantity });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
};

export const clearCart = async (userId: string) => {
  const path = `users/${userId}/cart`;
  try {
    const snapshot = await getDocs(collection(db, 'users', userId, 'cart'));
    const promises = snapshot.docs.map(d => deleteDoc(d.ref));
    await Promise.all(promises);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
};

// Orders
export const placeOrder = async (order: Omit<Order, 'id'>) => {
  const path = 'orders';
  try {
    const docRef = await addDoc(collection(db, path), {
      ...order,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
    return null;
  }
};

export const getOrders = async (userId: string) => {
  const path = 'orders';
  try {
    const q = query(
      collection(db, path), 
      where('userId', '==', userId), 
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
};

// Addresses
export const getAddresses = (userId: string, callback: (addresses: Address[]) => void) => {
  const path = `users/${userId}/addresses`;
  const q = collection(db, 'users', userId, 'addresses');
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Address)));
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, path);
  });
};

export const addAddress = async (userId: string, address: Omit<Address, 'id'>) => {
  const path = `users/${userId}/addresses`;
  try {
    await addDoc(collection(db, 'users', userId, 'addresses'), address);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
};

export const deleteAddress = async (userId: string, addressId: string) => {
  const path = `users/${userId}/addresses/${addressId}`;
  try {
    await deleteDoc(doc(db, 'users', userId, 'addresses', addressId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
};

// User Profile
export const syncUserProfile = async (user: any) => {
  const path = `users/${user.uid}`;
  try {
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      const profile: UserProfile = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || 'Guest',
        photoURL: user.photoURL || '',
        role: 'user',
        createdAt: serverTimestamp()
      };
      await setDoc(userRef, profile);
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
};
