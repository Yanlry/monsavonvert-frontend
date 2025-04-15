"use client";

import { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import styles from "../styles/cart.module.css";

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
          content="Votre panier d'achats chez MonSavonVert - Savons artisanaux écologiques"
        />
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      <div className={styles.globalWrapper}>
        {/* Header avec navigation */}
        <header
          className={`${styles.header} ${
            scrolled ? styles.headerScrolled : ""
          }`}
        >
          <div className={styles.headerContent}>
            <div className={styles.logoContainer}>
              <Link href="/" legacyBehavior>
                <a className={styles.logoLink}>
                  <span className={styles.logo}>MonSavonVert</span>
                </a>
              </Link>
            </div>

            {/* Navigation principale */}
            <nav className={styles.mainNav}>
              <ul className={styles.navList}>
                <li className={styles.navItem}>
                  <Link href="/" legacyBehavior>
                    <a className={styles.navLink}>Accueil</a>
                  </Link>
                </li>
                <li className={styles.navItem}>
                  <Link href="/store" legacyBehavior>
                    <a className={styles.navLink}>
                      Boutique
                      <div className={styles.megaMenu}>
                        <div className={styles.megaMenuGrid}>
                          <div className={styles.megaMenuCategory}>
                            <h3>Catégories</h3>
                            <Link href="/boutique/visage" legacyBehavior>
                              <a>Soins visage</a>
                            </Link>
                            <Link href="/boutique/corps" legacyBehavior>
                              <a>Soins corps</a>
                            </Link>
                            <Link href="/boutique/cheveux" legacyBehavior>
                              <a>Cheveux</a>
                            </Link>
                            <Link href="/boutique/accessoires" legacyBehavior>
                              <a>Accessoires</a>
                            </Link>
                          </div>
                          <div className={styles.megaMenuCategory}>
                            <h3>Collections</h3>
                            <Link href="/boutique/aromatherapie" legacyBehavior>
                              <a>Aromathérapie</a>
                            </Link>
                            <Link
                              href="/boutique/peaux-sensibles"
                              legacyBehavior
                            >
                              <a>Peaux sensibles</a>
                            </Link>
                            <Link href="/boutique/hydratation" legacyBehavior>
                              <a>Hydratation intense</a>
                            </Link>
                          </div>
                          <div className={styles.megaMenuImage}>
                            <p>Nouveau</p>
                            <img
                              src="/images/2.JPEG"
                              alt="Nouvelle collection"
                            />
                            <Link href="/boutique/nouveautes" legacyBehavior>
                              <a className={styles.megaMenuButton}>Découvrir</a>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </a>
                  </Link>
                </li>
                <li className={styles.navItem}>
                  <Link href="/virtues" legacyBehavior>
                    <a className={styles.navLink}>Vertu & bienfaits</a>
                  </Link>
                </li>
                <li className={styles.navItem}>
                  <Link href="/info" legacyBehavior>
                    <a className={styles.navLink}>Notre Histoire</a>
                  </Link>
                </li>
                <li className={styles.navItem}>
                  <Link href="/contact" legacyBehavior>
                    <a className={styles.navLink}>Contact</a>
                  </Link>
                </li>
              </ul>
            </nav>

            {/* Barre d'outils utilisateur */}
            <div className={styles.userTools}>
              <button className={styles.searchToggle} aria-label="Rechercher">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </button>
              <Link href="/login" legacyBehavior>
                <a className={styles.userAccount} aria-label="Mon compte">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </a>
              </Link>
              <Link href="/cart" legacyBehavior>
                <a className={styles.cartLink} aria-label="Panier">
                  <div className={styles.cartIcon} id="cartIcon">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="9" cy="21" r="1"></circle>
                      <circle cx="20" cy="21" r="1"></circle>
                      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                    </svg>
                    {cartCount > 0 && (
                      <span className={styles.cartCount}>{cartCount}</span>
                    )}
                  </div>
                </a>
              </Link>
            </div>
          </div>
        </header>

        <main className={styles.mainContent}>
          {/* Hero section */}
          <section className={styles.pageHero}>
            <div className={styles.pageHeroContent}>
              <h1 className={styles.pageTitle}>Votre Panier</h1>
              <div className={styles.pageBreadcrumb}>
                <Link href="/" legacyBehavior>
                  <a>Accueil</a>
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
                    <Link href="/checkout" legacyBehavior>
                      <a
                        className={`${styles.button} ${styles.primaryButton} ${styles.checkoutButton}`}
                      >
                        Passer à la caisse
                      </a>
                    </Link>
                    <Link href="/store" legacyBehavior>
                      <a className={styles.continueShopping}>
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
                      </a>
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
                  <Link href="/store" legacyBehavior>
                    <a className={`${styles.button} ${styles.primaryButton}`}>
                      Découvrir nos produits
                    </a>
                  </Link>
                </div>
              )}
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className={styles.footer}>
          <div className={styles.footerTop}>
            <div className={styles.footerContent}>
              <div className={styles.footerColumn}>
                <div className={styles.footerLogo}>MonSavonVert</div>
                <p className={styles.footerAbout}>
                  Savons artisanaux, naturels et écologiques fabriqués avec
                  passion en France depuis 2018.
                </p>
                <div className={styles.footerSocial}>
                  <a
                    href="https://facebook.com/monsavonvert"
                    className={styles.socialLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Facebook"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      width="20"
                      height="20"
                      stroke="currentColor"
                      strokeWidth="2"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                    </svg>
                  </a>
                  <a
                    href="https://instagram.com/monsavonvert"
                    className={styles.socialLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Instagram"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      width="20"
                      height="20"
                      stroke="currentColor"
                      strokeWidth="2"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect
                        x="2"
                        y="2"
                        width="20"
                        height="20"
                        rx="5"
                        ry="5"
                      ></rect>
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                    </svg>
                  </a>
                  <a
                    href="https://pinterest.com/monsavonvert"
                    className={styles.socialLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Pinterest"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      width="20"
                      height="20"
                      stroke="currentColor"
                      strokeWidth="2"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M8 12a4 4 0 1 1 8 0 4 4 0 0 1-8 0zm2-6h4"></path>
                      <path d="M9 18l3-3 3 3"></path>
                      <path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"></path>
                    </svg>
                  </a>
                </div>
              </div>

              <div className={styles.footerColumn}>
                <h3 className={styles.footerTitle}>Boutique</h3>
                <Link href="/boutique/nouveautes" legacyBehavior>
                  <a className={styles.footerLink}>Nouveautés</a>
                </Link>
                <Link href="/boutique/visage" legacyBehavior>
                  <a className={styles.footerLink}>Soins visage</a>
                </Link>
                <Link href="/boutique/corps" legacyBehavior>
                  <a className={styles.footerLink}>Soins corps</a>
                </Link>
                <Link href="/boutique/cheveux" legacyBehavior>
                  <a className={styles.footerLink}>Cheveux</a>
                </Link>
                <Link href="/boutique/coffrets" legacyBehavior>
                  <a className={styles.footerLink}>Coffrets cadeaux</a>
                </Link>
                <Link href="/boutique/accessoires" legacyBehavior>
                  <a className={styles.footerLink}>Accessoires</a>
                </Link>
              </div>

              <div className={styles.footerColumn}>
                <h3 className={styles.footerTitle}>Informations</h3>
                <Link href="/a-propos" legacyBehavior>
                  <a className={styles.footerLink}>Notre histoire</a>
                </Link>
                <Link href="/virtues" legacyBehavior>
                  <a className={styles.footerLink}>Vertu & bienfaits</a>
                </Link>
                <Link href="/blog" legacyBehavior>
                  <a className={styles.footerLink}>Journal</a>
                </Link>
                <Link href="/faq" legacyBehavior>
                  <a className={styles.footerLink}>FAQ</a>
                </Link>
                <Link href="/contact" legacyBehavior>
                  <a className={styles.footerLink}>Contact</a>
                </Link>
                <Link href="/programme-fidelite" legacyBehavior>
                  <a className={styles.footerLink}>Programme fidélité</a>
                </Link>
              </div>

              <div className={styles.footerColumn}>
                <h3 className={styles.footerTitle}>Contact</h3>
                <p className={styles.contactInfo}>
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
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                  </svg>
                  <a href="tel:+33612345678">+33 6 12 34 56 78</a>
                </p>
                <p className={styles.contactInfo}>
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
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                  </svg>
                  <a href="mailto:info@monsavonvert.fr">info@monsavonvert.fr</a>
                </p>
                <p className={styles.contactInfo}>
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
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                  <span>
                    15 rue des Artisans
                    <br />
                    69001 Lyon, France
                  </span>
                </p>
              </div>
            </div>
          </div>

          <div className={styles.footerBottom}>
            <div className={styles.footerBottomContent}>
              <p className={styles.copyright}>
                © 2023 MonSavonVert. Tous droits réservés.
              </p>
              <div className={styles.footerLinks}>
                <Link href="/cgv" legacyBehavior>
                  <a className={styles.footerSmallLink}>CGV</a>
                </Link>
                <Link href="/politique-de-confidentialite" legacyBehavior>
                  <a className={styles.footerSmallLink}>
                    Politique de confidentialité
                  </a>
                </Link>
                <Link href="/mentions-legales" legacyBehavior>
                  <a className={styles.footerSmallLink}>Mentions légales</a>
                </Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
