import { GoogleGenAI, Type } from "@google/genai";
import { Product, Order } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export const getSmartRecommendations = async (orderHistory: Order[], allProducts: Product[]) => {
  if (orderHistory.length === 0) return allProducts.slice(0, 4);

  try {
    const purchasedProductNames = orderHistory.flatMap(o => o.items.map(i => i.name));
    const productCatalog = allProducts.map(p => ({ id: p.id, name: p.name, category: p.category }));

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Based on this user's purchase history: ${purchasedProductNames.join(', ')}. 
      Recommend 4 products from this catalog: ${JSON.stringify(productCatalog)}.
      Return only the IDs of the recommended products as a JSON array.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });

    const recommendedIds = JSON.parse(response.text || '[]');
    return allProducts.filter(p => recommendedIds.includes(p.id));
  } catch (error) {
    console.error('Gemini Recommendation Error:', error);
    return allProducts.slice(0, 4);
  }
};

export const smartSearch = async (query: string, allProducts: Product[]) => {
  try {
    const productCatalog = allProducts.map(p => ({ id: p.id, name: p.name, description: p.description, category: p.category }));

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `The user is searching for: "${query}". 
      Find the most relevant products from this catalog: ${JSON.stringify(productCatalog)}.
      Return the IDs of the top matching products as a JSON array.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });

    const matchedIds = JSON.parse(response.text || '[]');
    return allProducts.filter(p => matchedIds.includes(p.id));
  } catch (error) {
    console.error('Gemini Search Error:', error);
    return allProducts.filter(p => 
      p.name.toLowerCase().includes(query.toLowerCase()) || 
      p.category.toLowerCase().includes(query.toLowerCase())
    );
  }
};
