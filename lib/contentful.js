// lib/contenful.js

import { createClient } from 'contentful';

// Créez un client API réutilisable
export const client = createClient({
  space: process.env.CONTENTFUL_SPACE_ID,
  accessToken: process.env.CONTENTFUL_ACCESS_TOKEN,
});

// Récupérer tous les produits
export async function getAllProducts() {
  const entries = await client.getEntries({
    content_type: 'product',
    order: '-sys.createdAt',
  });
  
  return entries.items.map(item => ({
    id: item.sys.id,
    ...item.fields,
  }));
}

// Récupérer un produit par son ID
export async function getProductById(id) {
  try {
    const entry = await client.getEntry(id);
    return {
      id: entry.sys.id,
      ...entry.fields,
    };
  } catch (error) {
    console.error(`Erreur lors de la récupération du produit ${id}:`, error);
    return null;
  }
}