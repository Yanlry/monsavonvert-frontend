'use client';

import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import styles from '../styles/success.module.css';

export default function Success() {
  const [isClient, setIsClient] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();
  const { session_id } = router.query;

  useEffect(() => {
    setIsClient(true);
  
    const confirmOrder = async () => {
      if (session_id) {
        console.log("Session ID reçu:", session_id);
  
        try {
          // Récupérer les données de commande du localStorage
          const pendingOrder = JSON.parse(localStorage.getItem("pendingOrder")) || {};
          console.log("Données de commande récupérées:", pendingOrder);
  
          if (!pendingOrder) {
            console.error("Données de commande manquantes");
            setError("Données de commande manquantes. Contactez notre service client.");
            setLoading(false);
            return;
          }

          // Récupérer l'ID utilisateur du localStorage
          const userId = localStorage.getItem("userId");
          if (!userId) {
            console.error("ID utilisateur non trouvé");
            setError("ID utilisateur non trouvé. Veuillez vous reconnecter.");
            setLoading(false);
            return;
          }
  
          // Appeler l'API pour associer la commande au client
          const response = await fetch(`http://localhost:8888/api/confirm-order`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${localStorage.getItem("token") || ''}`
            },
            body: JSON.stringify({
              customerId: userId, // Utiliser l'ID utilisateur du localStorage
              items: pendingOrder.items,
              totalAmount: pendingOrder.total,
              sessionId: session_id,
              shippingMethod: pendingOrder.shipping?.method || 'standard',
              shippingCost: pendingOrder.shipping?.cost || 0,
              payment: "completed" // Ajouter le statut de paiement
            }),
          });
  
          const data = await response.json();
          if (!response.ok) {
            throw new Error(data.error || "Erreur lors de la confirmation de la commande.");
          }
  
          console.log("Commande confirmée et associée au client :", data);
          
          // Définir l'ID de commande pour l'affichage
          if (data.order && data.order._id) {
            setOrderId(data.order._id);
          }
  
          // Sauvegarder la commande dans l'historique local
          const completedOrder = {
            ...pendingOrder,
            orderId: data.order?._id || 'unknown',
            status: data.order?.status || "pending",
            payment: data.order?.payment || "failed", // Inclure le statut de paiement
            paymentDate: new Date().toISOString(),
          };
  
          const orderHistory = JSON.parse(localStorage.getItem("orderHistory")) || [];
          orderHistory.push(completedOrder);
          localStorage.setItem("orderHistory", JSON.stringify(orderHistory));
  
          // Vider le panier après une commande réussie
          localStorage.removeItem("cart");
          localStorage.removeItem("pendingOrder");
          console.log("Panier vidé et commande enregistrée dans l'historique.");
          
          setLoading(false);
        } catch (error) {
          console.error("Erreur lors de la confirmation de la commande :", error);
          setError(error.message || "Une erreur est survenue.");
          setLoading(false);
        }
      } else {
        console.log("Aucun ID de session trouvé, redirection...");
        // Ne pas rediriger immédiatement, car les query params pourraient être en cours de chargement
        setTimeout(() => {
          if (!router.query.session_id) {
            router.push("/");
          }
        }, 3000);
      }
    };
  
    if (session_id) {
      confirmOrder();
    }
  }, [session_id, router]);

  if (!isClient || loading) {
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

  if (error) {
    return (
      <>
        <Head>
          <title>Erreur de commande | MonSavonVert</title>
          <meta name="description" content="Erreur lors du traitement de votre commande" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <div className={styles.successContainer}>
          <div className={styles.successContent}>
            <div className={styles.errorIcon}>
              <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
            </div>
            
            <h1 className={styles.errorTitle}>Une erreur est survenue</h1>
            
            <p className={styles.errorMessage}>
              {error}
            </p>
            
            <p className={styles.noteMessage}>
              Votre paiement a été traité avec succès, mais nous avons rencontré un problème lors de l'enregistrement de votre commande. 
              Notre équipe a été notifiée et vous contactera sous peu.
            </p>
            
            <div className={styles.successButtons}>
              <Link href="/" className={styles.primaryButton}>
                  Retour à l'accueil
              </Link>
              <Link href="/contact" className={styles.secondaryButton}>
                  Nous contacter
              </Link>
            </div>
          </div>
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
            {orderId && (
              <p className={styles.orderNumber}>
                <span>Numéro de commande:</span> 
                <strong>{orderId}</strong>
              </p>
            )}
            <p className={styles.orderInfo}>
              Vous recevrez un email de confirmation avec les détails de votre commande.
            </p>
          </div>
          
          <div className={styles.successButtons}>
            <Link href="/" className={styles.primaryButton}>
                Retour à l'accueil
            </Link>
            <Link href="/store" className={styles.secondaryButton}>
                Continuer mes achats
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}