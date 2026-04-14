import { db } from './firebase';
import { collection, doc, setDoc, getDocs } from 'firebase/firestore';

const sampleProducts = [
  {
    name: "Organic Bananas",
    description: "Fresh organic bananas from Ecuador.",
    price: 1.99,
    category: "fruits",
    image: "https://picsum.photos/seed/banana/400/400",
    stock: 100,
    searchKeywords: ["banana", "fruit", "organic"]
  },
  {
    name: "Red Apples",
    description: "Crisp and sweet red apples.",
    price: 2.49,
    category: "fruits",
    image: "https://picsum.photos/seed/apple/400/400",
    stock: 150,
    searchKeywords: ["apple", "fruit", "red"]
  },
  {
    name: "Fresh Spinach",
    description: "Nutritious green spinach leaves.",
    price: 3.99,
    category: "vegetables",
    image: "https://picsum.photos/seed/spinach/400/400",
    stock: 80,
    searchKeywords: ["spinach", "vegetable", "green"]
  },
  {
    name: "Whole Milk",
    description: "Fresh farm whole milk, 1 gallon.",
    price: 4.50,
    category: "dairy",
    image: "https://picsum.photos/seed/milk/400/400",
    stock: 50,
    searchKeywords: ["milk", "dairy", "whole"]
  },
  {
    name: "Greek Yogurt",
    description: "Creamy Greek yogurt, plain.",
    price: 1.25,
    category: "dairy",
    image: "https://picsum.photos/seed/yogurt/400/400",
    stock: 200,
    searchKeywords: ["yogurt", "dairy", "greek"]
  },
  {
    name: "Potato Chips",
    description: "Classic salted potato chips.",
    price: 3.29,
    category: "snacks",
    image: "https://picsum.photos/seed/chips/400/400",
    stock: 120,
    searchKeywords: ["chips", "snack", "potato"]
  },
  {
    name: "Orange Juice",
    description: "100% pure squeezed orange juice.",
    price: 5.99,
    category: "beverages",
    image: "https://picsum.photos/seed/orangejuice/400/400",
    stock: 60,
    searchKeywords: ["juice", "orange", "beverage"]
  }
];

export const seedData = async () => {
  try {
    const productsRef = collection(db, 'products');
    const snapshot = await getDocs(productsRef);
    
    if (snapshot.empty) {
      console.log('Seeding sample products...');
      for (const p of sampleProducts) {
        const newDocRef = doc(productsRef);
        await setDoc(newDocRef, p);
      }
      console.log('Seeding complete.');
    } else {
      console.log(`Products already seeded: ${snapshot.size} items found.`);
    }
  } catch (error) {
    console.error('Error seeding data:', error);
  }
};
