"use client";

import { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import styles from "../styles/cart.module.css";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function Cart() {
  // État pour détecter si nous sommes côté client
  const [isClient, setIsClient] = useState(false);

  // État pour l'animation du header au scroll
  const [scrolled, setScrolled] = useState(false);

  // État pour le panier
  const [cartItems, setCartItems] = useState([]);
  const [cartCount, setCartCount] = useState(0);

  // NOUVEAU: États pour les codes promo
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [promoError, setPromoError] = useState('');
  const [promoSuccess, setPromoSuccess] = useState('');

  // Effets au chargement
  useEffect(() => {
    // Marquer que nous sommes côté client
    setIsClient(true);

    // Réinitialisation des marges
    if (typeof document !== "undefined") {
      document.body.classList.add(styles.resetMargins);
      document.documentElement.classList.add(styles.resetMargins);
    }

    // Détection du scroll pour le header
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };

    // Gestionnaires d'événements
    if (typeof window !== "undefined") {
      window.addEventListener("scroll", handleScroll);
    }

    // Récupérer les articles du panier depuis le localStorage
    try {
      const storedCart = JSON.parse(localStorage.getItem("cart")) || [];
      setCartItems(storedCart);
      const totalItems = storedCart.reduce(
        (sum, item) => sum + item.quantity,
        0
      );
      setCartCount(totalItems);
      console.log("Panier chargé avec succès:", storedCart);

      // NOUVEAU: Récupérer le code promo appliqué s'il y en a un
      const savedPromo = JSON.parse(localStorage.getItem("appliedPromo"));
      if (savedPromo) {
        setAppliedPromo(savedPromo);
        console.log("Code promo appliqué récupéré:", savedPromo);
      }
    } catch (error) {
      console.error("Erreur lors du chargement du panier:", error);
    }

    // Nettoyage
    return () => {
      if (typeof document !== "undefined") {
        document.body.classList.remove(styles.resetMargins);
        document.documentElement.classList.remove(styles.resetMargins);
      }
      if (typeof window !== "undefined") {
        window.removeEventListener("scroll", handleScroll);
      }
    };
  }, []);

  const updateCartCount = (updatedCart) => {
    try {
      const totalItems = updatedCart.reduce(
        (sum, item) => sum + item.quantity,
        0
      );
      localStorage.setItem("cart", JSON.stringify(updatedCart));
      setCartItems(updatedCart);
      setCartCount(totalItems);
      console.log("Panier mis à jour, nouveau total:", totalItems);

      if (typeof window !== "undefined") {
        const cartIcon = document.getElementById("cartIcon");
        if (cartIcon) {
          // Mise à jour visuelle du panier
          if (cartIcon.classList) {
            cartIcon.classList.add(styles.cartBump);
            setTimeout(() => cartIcon.classList.remove(styles.cartBump), 300);
          }
        } else {
          console.warn("Élément cartIcon non trouvé dans le DOM");
        }
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour du panier:", error);
    }
  };

  const removeFromCart = (id) => {
    console.log("Suppression de l'article:", id);
    const updatedCart = cartItems.filter((item) => item.id !== id);
    updateCartCount(updatedCart);
  };

  const updateQuantity = (id, amount) => {
    console.log(
      "Modification de la quantité pour l'article:",
      id,
      "ajout de:",
      amount
    );
    const updatedCart = cartItems.map((item) => {
      if (item.id === id) {
        return { ...item, quantity: Math.max(1, item.quantity + amount) };
      }
      return item;
    });
    updateCartCount(updatedCart);
  };

  // NOUVEAU: Fonction pour calculer le sous-total (sans réduction)
  const getSubTotal = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  // NOUVEAU: Fonction pour calculer la réduction
  const getDiscountAmount = () => {
    if (!appliedPromo) return 0;
    
    const subTotal = getSubTotal();
    
    if (appliedPromo.type === 'percentage') {
      return (subTotal * appliedPromo.discount) / 100;
    } else {
      // Réduction fixe, mais pas plus que le sous-total
      return Math.min(appliedPromo.discount, subTotal);
    }
  };

  // NOUVEAU: Fonction pour calculer le prix total final
  const getTotalPrice = () => {
    const subTotal = getSubTotal();
    const discountAmount = getDiscountAmount();
    return Math.max(0, subTotal - discountAmount).toFixed(2);
  };

  // NOUVEAU: Fonction pour appliquer un code promo
  const applyPromoCode = () => {
    console.log("Tentative d'application du code promo:", promoCode);
    
    // Réinitialiser les messages
    setPromoError('');
    setPromoSuccess('');
    
    if (!promoCode.trim()) {
      setPromoError('Veuillez saisir un code promo');
      return;
    }

    try {
      // Récupérer les codes promo depuis le localStorage
      const promoCodes = JSON.parse(localStorage.getItem('promoCodes')) || [];
      console.log("Codes promo disponibles:", promoCodes);
      
      // Chercher le code promo (insensible à la casse)
      const foundPromo = promoCodes.find(promo => 
        promo.code.toLowerCase() === promoCode.toLowerCase().trim() && 
        promo.active === true
      );
      
      if (!foundPromo) {
        setPromoError('Code promo invalide ou expiré');
        console.log("Code promo non trouvé ou inactif");
        return;
      }

      // Vérifier si un code promo est déjà appliqué
      if (appliedPromo) {
        setPromoError('Un code promo est déjà appliqué. Supprimez-le d\'abord.');
        return;
      }

      // Appliquer le code promo
      setAppliedPromo(foundPromo);
      localStorage.setItem('appliedPromo', JSON.stringify(foundPromo));
      setPromoSuccess(`Code promo "${foundPromo.code}" appliqué avec succès !`);
      setPromoCode(''); // Vider le champ
      
      console.log("Code promo appliqué:", foundPromo);
      
    } catch (error) {
      console.error('Erreur lors de l\'application du code promo:', error);
      setPromoError('Erreur lors de l\'application du code promo');
    }
  };

  // NOUVEAU: Fonction pour supprimer le code promo appliqué
  const removePromoCode = () => {
    console.log("Suppression du code promo appliqué");
    setAppliedPromo(null);
    localStorage.removeItem('appliedPromo');
    setPromoSuccess('');
    setPromoError('');
  };

  // Rendu de base sans contenu dynamique (pour éviter les erreurs d'hydratation)
  if (!isClient) {
    return (
      <>
        <Head>
          <title>Mon Panier | MonSavonVert</title>
          <meta
            name="description"
            content="Votre panier d'achats chez MonSavonVert - Savons artisanaux écologiques"
          />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <div className={styles.loadingWrapper}>
          <div className={styles.loadingLogo}>MonSavonVert</div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Mon Panier | MonSavonVert</title>
        <meta
          name="description"
          content="Votre panier d'achats chez MonSavonVert - Savons artisanaux"
        />
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      <div className={styles.container}>
        {/* Header avec navigation */}
        <header
          className={`${styles.header} ${
            scrolled ? styles.headerScrolled : ""
          }`}
        >
          <Header cartCount={cartCount}/>
        </header>

        <main className={styles.mainContent}>
          {/* Hero section */}
          <section className={styles.pageHero}>
            <div className={styles.pageHeroContent}>
              <h1 className={styles.pageTitle}>Votre Panier</h1>
              <div className={styles.pageBreadcrumb}>
                <Link href="/">
                  Accueil
                </Link>
                <span className={styles.breadcrumbSeparator}>/</span>
                <span className={styles.breadcrumbCurrent}>Panier</span>
              </div>
            </div>
          </section>

          {/* Contenu du panier */}
          <section className={styles.cartSection}>
            <div className={styles.cartContainer}>
              {cartItems.length > 0 ? (
                <div className={styles.cartContent}>
                  <div className={styles.cartItemsList}>
                    {cartItems.map((item) => (
                      <div key={item.id} className={styles.cartItemCard}>
                        <div className={styles.cartItemImage}>
                          <img src={item.image} alt={item.name} />
                        </div>
                        <div className={styles.cartItemDetails}>
                          <h3 className={styles.cartItemName}>{item.name}</h3>
                          <p className={styles.cartItemPrice}>
                            {item.price.toFixed(2)} €
                          </p>
                        </div>
                        <div className={styles.cartItemActions}>
                          <div className={styles.quantityControl}>
                            <button
                              onClick={() => updateQuantity(item.id, -1)}
                              className={styles.quantityButton}
                              aria-label="Diminuer la quantité"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                              </svg>
                            </button>
                            <span className={styles.quantityValue}>
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, 1)}
                              className={styles.quantityButton}
                              aria-label="Augmenter la quantité"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <line x1="12" y1="5" x2="12" y2="19"></line>
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                              </svg>
                            </button>
                          </div>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className={styles.removeItemButton}
                            aria-label="Supprimer l'article"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <polyline points="3 6 5 6 21 6"></polyline>
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                              <line x1="10" y1="11" x2="10" y2="17"></line>
                              <line x1="14" y1="11" x2="14" y2="17"></line>
                            </svg>
                          </button>
                        </div>
                        <div className={styles.cartItemTotal}>
                          <span>
                            {(item.price * item.quantity).toFixed(2)} €
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className={styles.cartSummary}>
                    <h2 className={styles.summaryTitle}>Récapitulatif</h2>
                    
                    {/* Sous-total */}
                    <div className={styles.summaryRow}>
                      <span>Sous-total</span>
                      <span>{getSubTotal().toFixed(2)} €</span>
                    </div>
                    
                    {/* NOUVEAU: Affichage du code promo appliqué */}
                    {appliedPromo && (
                      <div className={styles.summaryRow} style={{color: '#22c55e'}}>
                        <span>Réduction ({appliedPromo.code})</span>
                        <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                          <span>-{getDiscountAmount().toFixed(2)} €</span>
                          <button 
                            onClick={removePromoCode}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#ef4444',
                              cursor: 'pointer',
                              padding: '2px',
                              fontSize: '12px'
                            }}
                            title="Supprimer le code promo"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    )}
                    
                    <div className={styles.summaryRow}>
                      <span>Livraison</span>
                      <span>Calculée à l'étape suivante</span>
                    </div>
                    
                    {/* Total final */}
                    <div className={styles.summaryRowTotal}>
                      <span>Total</span>
                      <span>{getTotalPrice()} €</span>
                    </div>
                    
                    {/* NOUVEAU: Section code promo améliorée */}
                    <div className={styles.promoCode}>
                      {!appliedPromo ? (
                        <>
                          <input
                            type="text"
                            placeholder="Code promo"
                            value={promoCode}
                            onChange={(e) => {
                              setPromoCode(e.target.value);
                              setPromoError(''); // Effacer l'erreur quand l'utilisateur tape
                              setPromoSuccess('');
                            }}
                            className={styles.promoInput}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                applyPromoCode();
                              }
                            }}
                          />
                          <button 
                            className={styles.promoButton}
                            onClick={applyPromoCode}
                            disabled={!promoCode.trim()}
                          >
                            Appliquer
                          </button>
                        </>
                      ) : (
                        <div className={styles.appliedPromoDisplay}>
                          <span style={{color: '#22c55e', fontWeight: 'bold'}}>
                            ✓ Code "{appliedPromo.code}" appliqué
                          </span>
                        </div>
                      )}
                      
                      {/* Messages d'erreur et de succès */}
                      {promoError && (
                        <div className={styles.promoMessage} style={{color: '#ef4444', fontSize: '14px', marginTop: '8px'}}>
                          {promoError}
                        </div>
                      )}
                      {promoSuccess && (
                        <div className={styles.promoMessage} style={{color: '#22c55e', fontSize: '14px', marginTop: '8px'}}>
                          {promoSuccess}
                        </div>
                      )}
                    </div>
                    
                    <Link
                      href="/checkout"
                      className={`${styles.button} ${styles.primaryButton} ${styles.checkoutButton}`}
                    >
                      Passer à la caisse
                    </Link>
                    <Link href="/store" className={styles.continueShopping}>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <line x1="19" y1="12" x2="5" y2="12"></line>
                        <polyline points="12 19 5 12 12 5"></polyline>
                      </svg>
                      Continuer mes achats
                    </Link>
                  </div>
                </div>
              ) : (
                <div className={styles.emptyCart}>
                  <div className={styles.emptyCartIcon}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="64"
                      height="64"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="9" cy="21" r="1"></circle>
                      <circle cx="20" cy="21" r="1"></circle>
                      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                    </svg>
                  </div>
                  <h2 className={styles.emptyCartTitle}>
                    Votre panier est vide
                  </h2>
                  <p className={styles.emptyCartText}>
                    Vous n'avez pas encore ajouté d'articles à votre panier.
                  </p>
                  <Link href="/store" className={`${styles.button} ${styles.primaryButton}`}>
                    Découvrir nos produits
                  </Link>
                </div>
              )}
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
}