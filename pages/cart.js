"use client";

import { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import styles from "../styles/cart.module.css";
import Header from "../components/Header";
import Footer from "../components/Footer"; // NOUVEAU: Import du composant footer

export default function Cart() {
  // État pour détecter si nous sommes côté client
  const [isClient, setIsClient] = useState(false);

  // État pour l'animation du header au scroll
  const [scrolled, setScrolled] = useState(false);

  // État pour le panier
  const [cartItems, setCartItems] = useState([]);
  const [cartCount, setCartCount] = useState(0);

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

  const getTotalPrice = () => {
    return cartItems
      .reduce((total, item) => total + item.price * item.quantity, 0)
      .toFixed(2);
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
                    <div className={styles.summaryRow}>
                      <span>Sous-total</span>
                      <span>{getTotalPrice()} €</span>
                    </div>
                    <div className={styles.summaryRow}>
                      <span>Livraison</span>
                      <span>Calculée à l'étape suivante</span>
                    </div>
                    <div className={styles.summaryRowTotal}>
                      <span>Total</span>
                      <span>{getTotalPrice()} €</span>
                    </div>
                    <div className={styles.promoCode}>
                      <input
                        type="text"
                        placeholder="Code promo"
                        className={styles.promoInput}
                      />
                      <button className={styles.promoButton}>Appliquer</button>
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