'use client';

import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import styles from '../styles/store.module.css';

export default function Boutique() {
  // État pour détecter si nous sommes côté client
  const [isClient, setIsClient] = useState(false);
  
  // État pour les produits (vide par défaut avant chargement depuis l'API)
  const [products, setProducts] = useState([]);
  
  // État pour le chargement des produits
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // État pour la pagination
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 3; // Exactement 3 produits par ligne/page
  
  // État pour le tri et les filtres
  const [sortBy, setSortBy] = useState('popularity');
  const [filterBy, setFilterBy] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // État pour l'animation du header au scroll
  const [scrolled, setScrolled] = useState(false);
  
  // État pour le panier
  const [cartCount, setCartCount] = useState(0);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);

  // Effet pour charger les produits depuis l'API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:8888/products');
        
        // Vérifier si la réponse est ok
        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Vérifier si la requête a réussi et si products existe
        if (data.result && data.products) {
          console.log('Produits récupérés depuis l\'API:', data.products);
          setProducts(data.products);
        } else {
          console.error('Format de réponse API incorrect:', data);
          setError('Format de données incorrect');
        }
      } catch (err) {
        console.error('Erreur lors de la récupération des produits:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    // Ne charger les produits que côté client
    if (isClient) {
      fetchProducts();
    }
  }, [isClient]);

  // Fonction pour ajouter au panier
  const addToCart = (product) => {
    // Vérifier que localStorage est disponible (côté client)
    if (typeof window === 'undefined') return;

    const storedCart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingItem = storedCart.find(item => item.id === product._id);

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      storedCart.push({ 
        id: product._id, 
        name: product.title, 
        price: product.price, 
        image: product.images[0], // Première image comme image principale
        quantity: 1 
      });
    }

    localStorage.setItem('cart', JSON.stringify(storedCart));
    setCartCount(prev => prev + 1);
    setCartItems(storedCart);
    setIsCartOpen(true);

    // Animation du panier
    const cartIcon = document.getElementById('cartIcon');
    if (cartIcon) {
      cartIcon.classList.add(styles.cartBump);
      setTimeout(() => cartIcon.classList.remove(styles.cartBump), 300);
    }
  };

  useEffect(() => {
    // Marquer que nous sommes côté client
    setIsClient(true);
    
    // Réinitialisation des marges
    if (typeof document !== 'undefined') {
      document.body.classList.add(styles.resetMargins);
      document.documentElement.classList.add(styles.resetMargins);
    }
    
    // Détection du scroll pour le header
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };
    
    // Gestionnaires d'événements
    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', handleScroll);
    }
    
    // Nettoyage
    return () => {
      if (typeof document !== 'undefined') {
        document.body.classList.remove(styles.resetMargins);
        document.documentElement.classList.remove(styles.resetMargins);
      }
      if (typeof window !== 'undefined') {
        window.removeEventListener('scroll', handleScroll);
      }
    };
  }, []);

  useEffect(() => {
    // Synchroniser le nombre d'articles dans le panier avec le localStorage
    if (typeof window !== 'undefined') {
      const storedCart = JSON.parse(localStorage.getItem('cart') || '[]');
      const totalItems = storedCart.reduce((sum, item) => sum + item.quantity, 0);
      setCartCount(totalItems);
      setCartItems(storedCart);
    }
  }, []);
  
  // Calcul des produits à afficher selon pagination, filtre, et recherche
  const filteredProducts = products
    .filter(product => {
      if (filterBy === 'all') return true;
      // Si des catégories sont ajoutées plus tard, on pourra filtrer ici
      return true;
    })
    .filter(product => {
      if (!searchTerm.trim()) return true;
      return (
        product.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
    
  // Tri des produits
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return (a.price || 0) - (b.price || 0);
      case 'price-high':
        return (b.price || 0) - (a.price || 0);
      case 'newest':
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      default: // popularité par défaut - fallback sur createdAt
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    }
  });
  
  // Pagination
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = sortedProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(sortedProducts.length / productsPerPage);
  
  // Fonctions de navigation entre les pages
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const nextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

  // Fonction pour mettre à jour la quantité d'un article dans le panier
  const updateCartItemQuantity = (itemId, newQuantity) => {
    if (typeof window === 'undefined') return;
    
    // Récupération du panier actuel
    const storedCart = JSON.parse(localStorage.getItem('cart') || '[]');
    
    // Recherche de l'article avec l'ID spécifié
    const itemIndex = storedCart.findIndex(item => item.id === itemId);
    
    if (itemIndex !== -1) {
      // Calculer la différence de quantité pour mettre à jour le compteur
      const oldQuantity = storedCart[itemIndex].quantity;
      const quantityDiff = newQuantity - oldQuantity;
      
      // Mise à jour de la quantité
      storedCart[itemIndex].quantity = newQuantity;
      
      // Mise à jour du localStorage
      localStorage.setItem('cart', JSON.stringify(storedCart));
      
      // Mise à jour des états du panier
      setCartItems([...storedCart]);
      setCartCount(prev => prev + quantityDiff);
      
      // Log pour le diagnostic
      console.log(`Quantité mise à jour: article #${itemId}, nouvelle quantité: ${newQuantity}`);
    } else {
      console.error(`Article avec l'ID ${itemId} non trouvé dans le panier`);
    }
  };

  // Fonction pour supprimer un article du panier
  const removeCartItem = (itemId) => {
    if (typeof window === 'undefined') return;
    
    // Récupération du panier actuel
    const storedCart = JSON.parse(localStorage.getItem('cart') || '[]');
    
    // Recherche de l'article avec l'ID spécifié
    const itemIndex = storedCart.findIndex(item => item.id === itemId);
    
    if (itemIndex !== -1) {
      // Récupérer la quantité de l'article à supprimer pour mettre à jour le compteur
      const removedQuantity = storedCart[itemIndex].quantity;
      
      // Suppression de l'article
      storedCart.splice(itemIndex, 1);
      
      // Mise à jour du localStorage
      localStorage.setItem('cart', JSON.stringify(storedCart));
      
      // Mise à jour des états du panier
      setCartItems([...storedCart]);
      setCartCount(prev => prev - removedQuantity);
      
      // Log pour le diagnostic
      console.log(`Article #${itemId} supprimé du panier`);
      
      // Si le panier est maintenant vide, on peut fermer la bannière
      if (storedCart.length === 0) {
        setTimeout(() => setIsCartOpen(false), 300);
      }
    } else {
      console.error(`Article avec l'ID ${itemId} non trouvé dans le panier`);
    }
  };

  // Fonction pour calculer le sous-total du panier
  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  // Seuil pour la livraison gratuite
  const FREE_SHIPPING_THRESHOLD = 29;

  // Fonction pour calculer les frais de livraison
  const calculateShipping = () => {
    const subtotal = calculateSubtotal();
    // Livraison gratuite à partir de 49€
    if (subtotal >= FREE_SHIPPING_THRESHOLD) {
      return 0;
    }
    // Sinon, frais fixes de 5.90€
    return 5.90;
  };

  // Fonction pour calculer le total du panier
  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const shipping = calculateShipping();
    return subtotal + shipping;
  };

  // Fonction pour vérifier si on doit afficher le message de livraison gratuite
  const shouldShowFreeShippingMessage = () => {
    const subtotal = calculateSubtotal();
    return subtotal > 0 && subtotal < FREE_SHIPPING_THRESHOLD;
  };

  // Fonction pour obtenir le message de livraison gratuite
  const getFreeShippingMessage = () => {
    const subtotal = calculateSubtotal();
    const remaining = FREE_SHIPPING_THRESHOLD - subtotal;
    
    if (remaining <= 0) {
      return "Vous bénéficiez de la livraison gratuite !";
    }
    
    return `Plus que ${remaining.toFixed(2)} € pour bénéficier de la livraison gratuite`;
  };

  // Fonction pour obtenir la date de livraison estimée
  const getEstimatedDeliveryDate = () => {
    const today = new Date();
    
    // Ajouter 3 jours ouvrables pour la livraison
    const deliveryDate = new Date(today);
    let daysToAdd = 3;
    
    while (daysToAdd > 0) {
      deliveryDate.setDate(deliveryDate.getDate() + 1);
      // Si ce n'est pas un week-end (0 = dimanche, 6 = samedi)
      if (deliveryDate.getDay() !== 0 && deliveryDate.getDay() !== 6) {
        daysToAdd--;
      }
    }
    
    // Formatage de la date en français
    const options = { weekday: 'long', day: 'numeric', month: 'long' };
    return deliveryDate.toLocaleDateString('fr-FR', options);
  };

  // Rendu de base sans contenu dynamique (pour éviter les erreurs d'hydratation)
  if (!isClient) {
    return (
      <>
        <Head>
          <title>Boutique | MonSavonVert</title>
          <meta name="description" content="Découvrez notre gamme de savons artisanaux naturels et écologiques." />
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
        <title>Boutique | MonSavonVert</title>
        <meta name="description" content="Découvrez notre gamme de savons artisanaux naturels et écologiques." />
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      <div className={styles.container}>
        {/* Header avec navigation */}
        <header className={`${styles.header} ${scrolled ? styles.headerScrolled : ''}`}>
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
                    <a className={`${styles.navLink} ${styles.active}`}>Boutique</a>
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
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </button>
              <Link href="/login" legacyBehavior>
                <a className={styles.userAccount} aria-label="Mon compte">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </a>
              </Link>
              <Link href="/cart" legacyBehavior>
                <a className={styles.cartLink} aria-label="Panier">
                  <div className={styles.cartIcon} id="cartIcon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
          {/* Hero de la boutique */}
          <div className={styles.storeHero}>
            <div className={styles.storeHeroContent}>
              <h1 className={styles.storeTitle}>Notre Collection</h1>
              <p className={styles.storeSubtitle}>
                Découvrez notre gamme de savons artisanaux élaborés avec des ingrédients biologiques, 
                conçus pour prendre soin de votre peau et de la planète.
              </p>
            </div>
          </div>
          
          {/* Affichage des produits ou message de chargement/erreur */}
          {loading ? (
            <div className={styles.loadingState}>
              <div className={styles.spinner}></div>
              <p>Chargement des produits...</p>
            </div>
          ) : error ? (
            <div className={styles.errorState}>
              <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              <h2>Une erreur est survenue</h2>
              <p>{error}</p>
              <p>Veuillez rafraîchir la page ou réessayer plus tard.</p>
            </div>
          ) : products.length === 0 ? (
            <div className={styles.emptyState}>
              <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
              <h2>Aucun produit disponible pour le moment</h2>
              <p>Notre catalogue est en cours de mise à jour. Revenez bientôt pour découvrir nos produits.</p>
            </div>
          ) : (
            <>
              {/* Grille de produits */}
              <div className={styles.enhancedProductGrid}>
                {currentProducts.map((product) => {
                  // Déterminer si c'est un nouveau produit (moins de 30 jours)
                  const isNew = new Date(product.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
                  
                  return (
                    <div key={product._id} className={styles.enhancedProductCard}>
                      {isNew && <div className={styles.productBadge}>Nouveau</div>}
                      <Link href={`/produit/${product._id}`} legacyBehavior>
                        <a className={styles.productImageContainer}>
                          <img
                            src={product.images && product.images.length > 0 ? product.images[0] : '/images/default-product.png'}
                            alt={product.title}
                            className={styles.productImage}
                          />
                          <div className={styles.productOverlay}>
                            <button 
                              className={styles.addToCartButton}
                              onClick={(e) => {
                                e.preventDefault();
                                addToCart(product);
                              }}
                              aria-label="Ajouter au panier"
                            >
                              Ajouter au panier
                            </button>
                            <button className={styles.quickViewButton} aria-label="Aperçu rapide">
                              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                <circle cx="12" cy="12" r="3"></circle>
                              </svg>
                            </button>
                          </div>
                        </a>
                      </Link>
                      <div className={styles.productInfo}>
                        <h3 className={styles.productName}>{product.title}</h3>
                        <div className={styles.productRating}>
                          <div className={styles.stars}>
                            {"★".repeat(5)} {/* On met 5 étoiles par défaut */}
                          </div>
                          <div className={styles.reviewCount}>
                            ({product.reviews ? product.reviews.length : 0})
                          </div>
                        </div>
                        <div className={styles.productPrice}>{product.price ? `${product.price.toFixed(2)} €` : 'Prix indisponible'}</div>
                        <p className={styles.productDescription}>
                          {product.description || 'Aucune description disponible'}
                        </p>
                        <div className={styles.productActions}>
                          <button 
                            className={styles.addToCartButtonLarge}
                            onClick={() => addToCart(product)}
                            disabled={product.stock <= 0}
                          >
                            {product.stock > 0 ? 'Ajouter au panier' : 'Rupture de stock'}
                          </button>
                          <Link href={`/produit/${product._id}`} legacyBehavior>
                            <a className={styles.viewDetailsButton}>
                              Voir les détails
                            </a>
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* Pagination si nécessaire */}
              {totalPages > 1 && (
                <div className={styles.pagination}>
                  <button 
                    onClick={prevPage} 
                    disabled={currentPage === 1}
                    className={styles.paginationButton}
                  >
                    &laquo; Précédent
                  </button>
                  
                  <div className={styles.pageNumbers}>
                    {Array.from({ length: totalPages }, (_, i) => (
                      <button
                        key={i + 1}
                        onClick={() => paginate(i + 1)}
                        className={`${styles.pageNumber} ${currentPage === i + 1 ? styles.activePage : ''}`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                  
                  <button 
                    onClick={nextPage} 
                    disabled={currentPage === totalPages}
                    className={styles.paginationButton}
                  >
                    Suivant &raquo;
                  </button>
                </div>
              )}
            </>
          )}
          
          {/* Section des avantages */}
          <div className={styles.benefitsSection}>
            <div className={styles.benefitCard}>
              <div className={styles.benefitIcon}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
              </div>
              <h3>100% Naturel</h3>
              <p>Des ingrédients biologiques sélectionnés avec soin pour leur qualité exceptionnelle.</p>
            </div>
            
            <div className={styles.benefitCard}>
              <div className={styles.benefitIcon}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
              </div>
              <h3>Fabrication Française</h3>
              <p>Tous nos produits sont fabriqués à la main en France dans notre atelier local.</p>
            </div>
            
            <div className={styles.benefitCard}>
              <div className={styles.benefitIcon}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path>
                  <line x1="4" y1="22" x2="4" y2="15"></line>
                </svg>
              </div>
              <h3>Écologique</h3>
              <p>Zéro déchet, emballages biodégradables et processus de fabrication respectueux de l'environnement.</p>
            </div>
          </div>
          
          {/* Section de témoignages */}
          <div className={styles.testimonialsSection}>
            <h2 className={styles.sectionTitle}>Ce que nos clients disent</h2>
            <div className={styles.testimonialCards}>
              <div className={styles.testimonialCard}>
                <div className={styles.testimonialStars}>{"★".repeat(5)}</div>
                <p className={styles.testimonialText}>"Ces savons ont transformé ma routine de soins. Ma peau n'a jamais été aussi douce et hydratée, même en hiver!"</p>
                <p className={styles.testimonialAuthor}>Marie L.</p>
              </div>
              
              <div className={styles.testimonialCard}>
                <div className={styles.testimonialStars}>{"★".repeat(5)}</div>
                <p className={styles.testimonialText}>"J'ai enfin trouvé des produits qui respectent mes valeurs écologiques tout en étant efficaces. Je recommande!"</p>
                <p className={styles.testimonialAuthor}>Thomas B.</p>
              </div>
              
              <div className={styles.testimonialCard}>
                <div className={styles.testimonialStars}>{"★".repeat(5)}</div>
                <p className={styles.testimonialText}>"L'odeur est divine et les ingrédients sont d'une qualité exceptionnelle. Je n'utiliserai plus jamais d'autres savons."</p>
                <p className={styles.testimonialAuthor}>Sophie M.</p>
              </div>
            </div>
          </div>
          
          {/* Section de promotion */}
          <div className={styles.enhancedPromoSection}>
            <div className={styles.promoContent}>
              <h2 className={styles.promoTitle}>Livraison gratuite</h2>
              <p className={styles.promoText}>Pour toute commande à partir de 29€</p>
              <a href="/boutique" className={styles.promoButton}>Voir tous nos produits</a>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className={styles.footer}>
          <div className={styles.footerTop}>
            <div className={styles.footerContent}>
              <div className={styles.footerColumn}>
                <div className={styles.footerLogo}>MonSavonVert</div>
                <p className={styles.footerAbout}>
                  Savons artisanaux, naturels et écologiques fabriqués avec passion en France depuis 2018.
                </p>
                <div className={styles.footerSocial}>
                  <a href="https://facebook.com/monsavonvert" className={styles.socialLink} target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                    <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                    </svg>
                  </a>
                  <a href="https://instagram.com/monsavonvert" className={styles.socialLink} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                    <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                    </svg>
                  </a>
                  <a href="https://pinterest.com/monsavonvert" className={styles.socialLink} target="_blank" rel="noopener noreferrer" aria-label="Pinterest">
                    <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M8 12a4 4 0 1 1 8 0 4 4 0 0 1-8 0zm2-6h4"></path>
                      <path d="M9 18l3-3 3 3"></path>
                      <path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"></path>
                    </svg>
                  </a>
                </div>
              </div>
              
              <div className={styles.footerColumn}>
                <h3 className={styles.footerTitle}>Boutique</h3>
                <Link href="/boutique/nouveautes" legacyBehavior><a className={styles.footerLink}>Nouveautés</a></Link>
                <Link href="/boutique/visage" legacyBehavior><a className={styles.footerLink}>Soins visage</a></Link>
                <Link href="/boutique/corps" legacyBehavior><a className={styles.footerLink}>Soins corps</a></Link>
                <Link href="/boutique/cheveux" legacyBehavior><a className={styles.footerLink}>Cheveux</a></Link>
                <Link href="/boutique/coffrets" legacyBehavior><a className={styles.footerLink}>Coffrets cadeaux</a></Link>
              </div>
              
              <div className={styles.footerColumn}>
                <h3 className={styles.footerTitle}>Informations</h3>
                <Link href="/a-propos" legacyBehavior><a className={styles.footerLink}>Notre histoire</a></Link>
                <Link href="/virtues" legacyBehavior><a className={styles.footerLink}>Vertu & bienfaits</a></Link>
                <Link href="/blog" legacyBehavior><a className={styles.footerLink}>Journal</a></Link>
                <Link href="/faq" legacyBehavior><a className={styles.footerLink}>FAQ</a></Link>
                <Link href="/contact" legacyBehavior><a className={styles.footerLink}>Contact</a></Link>
              </div>
              
              <div className={styles.footerColumn}>
                <h3 className={styles.footerTitle}>Contact</h3>
                <p className={styles.contactInfo}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                  </svg>
                  <a href="tel:+33612345678">+33 6 12 34 56 78</a>
                </p>
                <p className={styles.contactInfo}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                  </svg>
                  <a href="mailto:info@monsavonvert.fr">info@monsavonvert.fr</a>
                </p>
              </div>
            </div>
          </div>
          
          <div className={styles.footerBottom}>
            <div className={styles.footerBottomContent}>
              <p className={styles.copyright}>© 2023 MonSavonVert. Tous droits réservés.</p>
              <div className={styles.footerLinks}>
                <Link href="/cgv" legacyBehavior><a className={styles.footerSmallLink}>CGV</a></Link>
                <Link href="/politique-de-confidentialite" legacyBehavior><a className={styles.footerSmallLink}>Politique de confidentialité</a></Link>
                <Link href="/mentions-legales" legacyBehavior><a className={styles.footerSmallLink}>Mentions légales</a></Link>
              </div>
            </div>
          </div>
        </footer>
      </div>

      {isCartOpen && (
  <div className={styles.cartBannerOverlay}>
    <div className={styles.cartBanner}>
      <div className={styles.cartHeader}>
        <h2>Votre Panier <span className={styles.itemCount}>({cartItems.reduce((total, item) => total + item.quantity, 0)} articles)</span></h2>
        <button className={styles.closeBanner} onClick={() => setIsCartOpen(false)} aria-label="Fermer">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      
      {cartItems.length === 0 ? (
        <div className={styles.emptyCart}>
          <div className={styles.emptyCartIcon}>
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
          </div>
          <p className={styles.emptyCartMessage}>Votre panier est vide</p>
          <p className={styles.emptyCartSubMessage}>Ajoutez des articles pour commencer vos achats</p>
          <button className={styles.continueShopping} onClick={() => setIsCartOpen(false)}>
            Découvrir nos produits
          </button>
        </div>
      ) : (
        <>
          <div className={styles.cartItemsContainer}>
            <ul className={styles.cartItems}>
              {cartItems.map((item) => {
                // Calcul du prix total pour cet article
                const itemTotal = (item.price * item.quantity).toFixed(2);
                
                return (
                  <li key={item.id} className={styles.cartItem}>
                    <div className={styles.cartItemImage}>
                      <img src={item.image} alt={item.name} />
                    </div>
                    
                    <div className={styles.cartItemContent}>
                      <div className={styles.cartItemInfo}>
                        <h3 className={styles.cartItemName}>{item.name}</h3>
                        <p className={styles.cartItemPrice}>{item.price.toFixed(2)} €</p>
                      </div>
                      
                      <div className={styles.cartItemActions}>
                        <div className={styles.quantityControl}>
                          <button 
                            className={styles.quantityButton} 
                            onClick={() => updateCartItemQuantity(item.id, Math.max(1, item.quantity - 1))}
                            disabled={item.quantity <= 1}
                            aria-label="Diminuer la quantité"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <line x1="5" y1="12" x2="19" y2="12"></line>
                            </svg>
                          </button>
                          
                          <span className={styles.quantityValue}>{item.quantity}</span>
                          
                          <button 
                            className={styles.quantityButton} 
                            onClick={() => updateCartItemQuantity(item.id, item.quantity + 1)}
                            aria-label="Augmenter la quantité"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <line x1="12" y1="5" x2="12" y2="19"></line>
                              <line x1="5" y1="12" x2="19" y2="12"></line>
                            </svg>
                          </button>
                        </div>
                        
                        <button 
                          className={styles.removeItemButton}
                          onClick={() => removeCartItem(item.id)}
                          aria-label="Supprimer l'article"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                          </svg>
                        </button>
                      </div>
                      
                      <div className={styles.cartItemTotal}>
                        <span>Total: <strong>{itemTotal} €</strong></span>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
          
          <div className={styles.cartSummary}>
            <div className={styles.cartSummaryRow}>
              <span>Sous-total</span>
              <span>{calculateSubtotal().toFixed(2)} €</span>
            </div>
            
            <div className={styles.cartSummaryRow}>
              <span>Frais de livraison</span>
              <span>{calculateShipping() > 0 ? `${calculateShipping().toFixed(2)} €` : 'Gratuit'}</span>
            </div>
            
            {shouldShowFreeShippingMessage() && (
              <div className={styles.freeShippingMessage}>
                <div className={styles.freeShippingIcon}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
                    <line x1="9" y1="9" x2="9.01" y2="9"></line>
                    <line x1="15" y1="9" x2="15.01" y2="9"></line>
                  </svg>
                </div>
                <span>
                  {getFreeShippingMessage()}
                </span>
              </div>
            )}
            
            <div className={styles.cartTotal}>
              <span>Total</span>
              <span>{calculateTotal().toFixed(2)} €</span>
            </div>
            
            <div className={styles.estimatedDelivery}>
              <div className={styles.deliveryIcon}>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="1" y="3" width="15" height="13"></rect>
                  <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
                  <circle cx="5.5" cy="18.5" r="2.5"></circle>
                  <circle cx="18.5" cy="18.5" r="2.5"></circle>
                </svg>
              </div>
              <div>
                <span className={styles.deliveryTitle}>Livraison estimée</span>
                <span className={styles.deliveryDate}>
                  {getEstimatedDeliveryDate()}
                </span>
              </div>
            </div>
          </div>
          
          <div className={styles.cartActions}>
            <Link href="/cart" legacyBehavior>
              <a className={styles.viewCartButton}>Voir le panier</a>
            </Link>
            
            <Link href="/checkout" legacyBehavior>
              <a className={styles.checkoutButton}>
                Passer commande
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </a>
            </Link>
          </div>
        </>
      )}
      
      <div className={styles.secureCheckout}>
        <div className={styles.secureIcon}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
        </div>
        <span>Paiement 100% sécurisé</span>
      </div>
      
      {cartItems.length > 0 && (
        <div className={styles.paymentMethods}>
          <span className={styles.paymentTitle}>Nous acceptons</span>
          <div className={styles.paymentIcons}>
            <div className={styles.paymentIcon} title="Visa">
              <svg viewBox="0 0 38 24" xmlns="http://www.w3.org/2000/svg" role="img" width="38" height="24" aria-labelledby="pi-visa"><title id="pi-visa">Visa</title><path opacity=".07" d="M35 0H3C1.3 0 0 1.3 0 3v18c0 1.7 1.4 3 3 3h32c1.7 0 3-1.3 3-3V3c0-1.7-1.4-3-3-3z"></path><path fill="#fff" d="M35 1c1.1 0 2 .9 2 2v18c0 1.1-.9 2-2 2H3c-1.1 0-2-.9-2-2V3c0-1.1.9-2 2-2h32"></path><path d="M28.3 10.1H28c-.4 1-.7 1.5-1 3h1.9c-.3-1.5-.3-2.2-.6-3zm2.9 5.9h-1.7c-.1 0-.1 0-.2-.1l-.2-.9-.1-.2h-2.4c-.1 0-.2 0-.2.2l-.3.9c0 .1-.1.1-.1.1h-2.1l.2-.5L27 8.7c0-.5.3-.7.8-.7h1.5c.1 0 .2 0 .2.2l1.4 6.5c.1.4.2.7.2 1.1.1.1.1.1.1.2zm-13.4-.3l.4-1.8c.1 0 .2.1.2.1.7.3 1.4.5 2.1.4.2 0 .5-.1.7-.2.5-.2.5-.7.1-1.1-.2-.2-.5-.3-.8-.5-.4-.2-.8-.4-1.1-.7-1.2-1-.8-2.4-.1-3.1.6-.4.9-.8 1.7-.8 1.2 0 2.5 0 3.1.2h.1c-.1.6-.2 1.1-.4 1.7-.5-.2-1-.4-1.5-.4-.3 0-.6 0-.9.1-.2 0-.3.1-.4.2-.2.2-.2.5 0 .7l.5.4c.4.2.8.4 1.1.6.5.3 1 .8 1.1 1.4.2.9-.1 1.7-.9 2.3-.5.4-.7.6-1.4.6-1.4 0-2.5.1-3.4-.2-.1.2-.1.2-.2.1zm-3.5.3c.1-.7.1-.7.2-1 .5-2.2 1-4.5 1.4-6.7.1-.2.1-.3.3-.3H18c-.2 1.2-.4 2.1-.7 3.2-.3 1.5-.6 3-1 4.5 0 .2-.1.2-.3.2M5 8.2c0-.1.2-.2.3-.2h3.4c.5 0 .9.3 1 .8l.9 4.4c0 .1 0 .1.1.2 0-.1.1-.1.1-.1l2.1-5.1c-.1-.1 0-.2.1-.2h2.1c0 .1 0 .1-.1.2l-3.1 7.3c-.1.2-.1.3-.2.4-.1.1-.3 0-.5 0H9.7c-.1 0-.2 0-.2-.2L7.9 9.5c-.2-.2-.5-.5-.9-.6-.6-.3-1.7-.5-1.9-.5L5 8.2z" fill="#142688"></path></svg>
            </div>
            <div className={styles.paymentIcon} title="Mastercard">
              <svg viewBox="0 0 38 24" xmlns="http://www.w3.org/2000/svg" role="img" width="38" height="24" aria-labelledby="pi-master"><title id="pi-master">Mastercard</title><path opacity=".07" d="M35 0H3C1.3 0 0 1.3 0 3v18c0 1.7 1.4 3 3 3h32c1.7 0 3-1.3 3-3V3c0-1.7-1.4-3-3-3z"></path><path fill="#fff" d="M35 1c1.1 0 2 .9 2 2v18c0 1.1-.9 2-2 2H3c-1.1 0-2-.9-2-2V3c0-1.1.9-2 2-2h32"></path><circle fill="#EB001B" cx="15" cy="12" r="7"></circle><circle fill="#F79E1B" cx="23" cy="12" r="7"></circle><path fill="#FF5F00" d="M22 12c0-2.4-1.2-4.5-3-5.7-1.8 1.3-3 3.4-3 5.7s1.2 4.5 3 5.7c1.8-1.2 3-3.3 3-5.7z"></path></svg>
            </div>
            <div className={styles.paymentIcon} title="American Express">
              <svg xmlns="http://www.w3.org/2000/svg" role="img" viewBox="0 0 38 24" width="38" height="24" aria-labelledby="pi-american_express"><title id="pi-american_express">American Express</title><g fill="none"><path fill="#000" d="M35,0 L3,0 C1.3,0 0,1.3 0,3 L0,21 C0,22.7 1.4,24 3,24 L35,24 C36.7,24 38,22.7 38,21 L38,3 C38,1.3 36.6,0 35,0 Z" opacity=".07"></path><path fill="#006FCF" d="M35,1 C36.1,1 37,1.9 37,3 L37,21 C37,22.1 36.1,23 35,23 L3,23 C1.9,23 1,22.1 1,21 L1,3 C1,1.9 1.9,1 3,1 L35,1"></path><path fill="#FFF" d="M8.971,10.268 L9.745,12.144 L8.203,12.144 L8.971,10.268 Z M25.046,10.346 L22.069,10.346 L22.069,11.173 L24.998,11.173 L24.998,12.412 L22.075,12.412 L22.075,13.334 L25.052,13.334 L25.052,14.073 L27.129,11.828 L25.052,9.488 L25.046,10.346 L25.046,10.346 Z M10.983,8.006 L14.978,8.006 L15.865,9.941 L16.687,8 L27.057,8 L28.135,9.19 L29.25,8 L34.013,8 L30.494,11.852 L33.977,15.68 L29.143,15.68 L28.065,14.49 L26.94,15.68 L10.03,15.68 L9.536,14.49 L8.406,14.49 L7.911,15.68 L4,15.68 L7.286,8 L10.716,8 L10.983,8.006 Z M19.646,9.084 L17.407,9.084 L15.907,12.62 L14.282,9.084 L12.06,9.084 L12.06,13.894 L10,9.084 L8.007,9.084 L5.625,14.596 L7.18,14.596 L7.674,13.406 L10.27,13.406 L10.764,14.596 L13.484,14.596 L13.484,10.661 L15.235,14.602 L16.425,14.602 L18.165,10.673 L18.165,14.603 L19.623,14.603 L19.647,9.083 L19.646,9.084 Z M28.986,11.852 L31.517,9.084 L29.695,9.084 L28.094,10.81 L26.546,9.084 L20.652,9.084 L20.652,14.602 L26.462,14.602 L28.076,12.864 L29.624,14.602 L31.499,14.602 L28.987,11.852 L28.986,11.852 Z"></path></g></svg>
            </div>
            <div className={styles.paymentIcon} title="PayPal">
              <svg viewBox="0 0 38 24" xmlns="http://www.w3.org/2000/svg" width="38" height="24" role="img" aria-labelledby="pi-paypal"><title id="pi-paypal">PayPal</title><path opacity=".07" d="M35 0H3C1.3 0 0 1.3 0 3v18c0 1.7 1.4 3 3 3h32c1.7 0 3-1.3 3-3V3c0-1.7-1.4-3-3-3z"></path><path fill="#fff" d="M35 1c1.1 0 2 .9 2 2v18c0 1.1-.9 2-2 2H3c-1.1 0-2-.9-2-2V3c0-1.1.9-2 2-2h32"></path><path fill="#003087" d="M23.9 8.3c.2-1 0-1.7-.6-2.3-.6-.7-1.7-1-3.1-1h-4.1c-.3 0-.5.2-.6.5L14 15.6c0 .2.1.4.3.4H17l.4-3.4 1.8-2.2 4.7-2.1z"></path><path fill="#3086C8" d="M23.9 8.3l-.2.2c-.5 2.8-2.2 3.8-4.6 3.8H18c-.3 0-.5.2-.6.5l-.6 3.9-.2 1c0 .2.1.4.3.4H19c.3 0 .5-.2.5-.4v-.1l.4-2.4v-.1c0-.2.3-.4.5-.4h.3c2.1 0 3.7-.8 4.1-3.2.2-1 .1-1.8-.4-2.4-.1-.5-.3-.7-.5-.8z"></path><path fill="#012169" d="M23.3 8.1c-.1-.1-.2-.1-.3-.1-.1 0-.2 0-.3-.1-.3-.1-.7-.1-1.1-.1h-3c-.1 0-.2 0-.2.1-.2.1-.3.2-.3.4l-.7 4.4v.1c0-.3.3-.5.6-.5h1.3c2.5 0 4.1-1 4.6-3.8v-.2c-.1-.1-.3-.2-.5-.2h-.1z"></path></svg>
            </div>
          </div>
        </div>
      )}
    </div>
  </div>
)}
    </>
  );
}