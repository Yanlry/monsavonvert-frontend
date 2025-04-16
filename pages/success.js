'use client';

import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import styles from '../styles/success.module.css'; // Vous devrez créer ce fichier

export default function Success() {
  const [isClient, setIsClient] = useState(false);
  const [orderId, setOrderId] = useState('');
  const router = useRouter();
  const { session_id } = router.query;

  useEffect(() => {
    setIsClient(true);
    
    // Générer un ID de commande simple
    const generateOrderId = () => {
      const date = new Date();
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
      return `MSV-${year}${month}${day}-${random}`;
    };
    
    // Si nous avons un ID de session, c'est que le paiement a réussi
    if (session_id) {
      console.log('Session ID reçu:', session_id);
      
      // Récupérer les données de commande du localStorage
      try {
        const pendingOrder = JSON.parse(localStorage.getItem('pendingOrder')) || {};
        console.log('Données de commande récupérées:', pendingOrder);
        
        // Créer un numéro de commande
        const newOrderId = generateOrderId();
        setOrderId(newOrderId);
        
        // Sauvegarder la commande complète pour l'historique
        const completedOrder = {
          ...pendingOrder,
          orderId: newOrderId,
          status: 'confirmed',
          paymentDate: new Date().toISOString(),
          sessionId: session_id
        };
        
        // Sauvegarder dans l'historique des commandes
        const orderHistory = JSON.parse(localStorage.getItem('orderHistory')) || [];
        orderHistory.push(completedOrder);
        localStorage.setItem('orderHistory', JSON.stringify(orderHistory));
        
        // Vider le panier après une commande réussie
        localStorage.removeItem('cart');
        localStorage.removeItem('pendingOrder');
        console.log('Panier vidé et commande enregistrée dans l\'historique');
      } catch (error) {
        console.error('Erreur lors du traitement de la commande:', error);
      }
    } else {
      // Rediriger vers la page d'accueil si pas d'ID de session
      console.log('Aucun ID de session trouvé, redirection...');
      router.push('/');
    }
  }, [session_id, router]);

  if (!isClient || !session_id) {
    return (
      <>
        <Head>
          <title>Traitement de votre commande | MonSavonVert</title>
          <meta name="description" content="Traitement de votre commande chez MonSavonVert" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <div className={styles.loadingWrapper}>
          <div className={styles.loadingLogo}>MonSavonVert</div>
          <p>Traitement de votre commande...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Commande confirmée | MonSavonVert</title>
        <meta name="description" content="Merci pour votre commande chez MonSavonVert" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className={styles.successContainer}>
        <div className={styles.successContent}>
          <div className={styles.successIcon}>
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          </div>
          
          <h1 className={styles.successTitle}>Commande confirmée !</h1>
          
          <p className={styles.successMessage}>
            Merci pour votre achat. Votre commande a été traitée avec succès.
          </p>
          
          <div className={styles.orderDetails}>
            <p className={styles.orderNumber}>
              <span>Numéro de commande:</span> 
              <strong>{orderId}</strong>
            </p>
            <p className={styles.orderInfo}>
              Vous recevrez un email de confirmation avec les détails de votre commande.
            </p>
          </div>
          
          <div className={styles.successButtons}>
            <Link href="/" legacyBehavior>
              <a className={styles.primaryButton}>
                Retour à l'accueil
              </a>
            </Link>
            <Link href="/boutique" legacyBehavior>
              <a className={styles.secondaryButton}>
                Continuer mes achats
              </a>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}