// Ce fichier doit être créé dans le dossier /pages/api/
// Chemin complet: /pages/api/create-checkout-session.js

import Stripe from 'stripe';

// Initialisez Stripe avec votre clé secrète
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  try {
    // Récupérer les données de la requête
    const { items, shipping, shippingCost, shippingMethod, email } = req.body;
    
    console.log('Données reçues:', { items, shipping, shippingCost, shippingMethod, email });

    // Créer les lignes de produits pour Stripe
    const lineItems = items.map(item => ({
      price_data: {
        currency: 'eur',
        product_data: {
          name: item.name,
          // On ne met la description que si elle existe vraiment
          ...(item.description ? { description: item.description } : {}),
          images: item.image ? [item.image] : [],
        },
        unit_amount: Math.round(item.price * 100), // Stripe utilise les centimes
      },
      quantity: item.quantity,
    }));

    // Ajouter les frais de livraison si nécessaire
    if (shippingCost > 0) {
      lineItems.push({
        price_data: {
          currency: 'eur',
          product_data: {
            name: shippingMethod === 'express' ? 'Livraison express' : 'Livraison standard',
          },
          unit_amount: Math.round(shippingCost * 100),
        },
        quantity: 1,
      });
    }

    // Calculer le montant total actuel
    const currentTotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0) + shippingCost;
    
    // Montant minimum requis par Stripe (0,50 €)
    const MINIMUM_AMOUNT = 0.50;
    
    // Si le montant est inférieur au minimum, ajouter des frais de traitement
    if (currentTotal < MINIMUM_AMOUNT) {
      const processingFee = MINIMUM_AMOUNT - currentTotal;
      lineItems.push({
        price_data: {
          currency: 'eur',
          product_data: {
            name: 'Frais de traitement',
            description: 'Frais pour les petites commandes'
          },
          unit_amount: Math.round(processingFee * 100),
        },
        quantity: 1,
      });
      
      console.log(`Montant total (${currentTotal}€) inférieur au minimum requis. Ajout de frais de traitement de ${processingFee.toFixed(2)}€`);
    }

    // Créer la session de paiement Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: lineItems,
      shipping_address_collection: shippingMethod !== 'pickup' ? {
        allowed_countries: ['FR', 'BE', 'CH', 'LU', 'CA'],
      } : undefined,
      customer_email: email,
      shipping_options: [
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: {
              amount: Math.round(shippingCost * 100),
              currency: 'eur',
            },
            display_name: shippingMethod === 'express' ? 'Livraison express' : 
                         shippingMethod === 'standard' ? 'Livraison standard' : 
                         'Retrait en boutique',
          },
        },
      ],
      success_url: `${req.headers.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin}/checkout`,
      metadata: {
        shippingMethod,
      },
    });

    // Retourner l'ID de session au client
    res.status(200).json({ sessionId: session.id });
    console.log('Session Stripe créée avec succès, ID:', session.id);
    
  } catch (error) {
    console.error('Erreur lors de la création de la session Stripe:', error);
    res.status(500).json({ error: error.message });
  }
}