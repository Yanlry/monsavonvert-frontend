'use client';

import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import styles from '../styles/checkout.module.css'; // Vous devrez créer ce fichier
import { loadStripe } from '@stripe/stripe-js'; // Importation de Stripe

// Initialisez Stripe avec votre clé publique
// IMPORTANT: On utilise directement la clé comme une chaîne de caractères
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

export default function Checkout() {
  // État pour détecter si nous sommes côté client
  const [isClient, setIsClient] = useState(false);
  
  // État pour l'animation du header au scroll
  const [scrolled, setScrolled] = useState(false);
  
  // États pour le formulaire
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'France',
  });
  
  // État pour les étapes du processus de commande
  const [currentStep, setCurrentStep] = useState(1);
  
  // État pour les articles du panier
  const [cartItems, setCartItems] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  
  // État pour la méthode de livraison
  const [shippingMethod, setShippingMethod] = useState('standard');
  
  // État pour vérifier si le formulaire est valide
  const [isFormValid, setIsFormValid] = useState(false);
  
  // État pour afficher un message de chargement pendant la redirection vers Stripe
  const [isLoading, setIsLoading] = useState(false);
  
  // Router pour la navigation
  const router = useRouter();

  // Effets au chargement
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
    
    // Récupérer les articles du panier depuis le localStorage
    try {
      const storedCart = JSON.parse(localStorage.getItem('cart')) || [];
      setCartItems(storedCart);
      const totalItems = storedCart.reduce((sum, item) => sum + item.quantity, 0);
      setCartCount(totalItems);
      console.log('Panier chargé avec succès:', storedCart);
      
      // Rediriger vers la page panier si le panier est vide
      if (storedCart.length === 0) {
        console.log('Panier vide, redirection vers la page panier');
        router.push('/cart');
      }
    } catch (error) {
      console.error('Erreur lors du chargement du panier:', error);
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
  }, [router]);
  
  // Effet pour vérifier si le formulaire est valide
  useEffect(() => {
    const { firstName, lastName, email, phone, address, city, postalCode, country } = formData;
    const isValid = firstName && lastName && email && phone && address && city && postalCode && country;
    setIsFormValid(isValid);
    console.log('Validation du formulaire:', isValid);
  }, [formData]);

  // Gestionnaire de changement des champs du formulaire
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
    console.log(`Champ ${name} mis à jour avec la valeur: ${value}`);
  };

  // Gestionnaire de changement de méthode de livraison
  const handleShippingChange = (method) => {
    setShippingMethod(method);
    console.log('Méthode de livraison sélectionnée:', method);
  };

  // Fonction pour passer à l'étape suivante
  const goToNextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
      console.log('Passage à l\'étape', currentStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Fonction pour revenir à l'étape précédente
  const goToPreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      console.log('Retour à l\'étape', currentStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };
  
  // Récupération du prix total du panier
  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2);
  };
  
  // Calcul des frais de livraison
  const getShippingCost = () => {
    switch (shippingMethod) {
      case 'express':
        return 9.95;
      case 'pickup':
        return 0;
      default: // standard
        return 4.95;
    }
  };
  
  // Calcul du total final
  const getFinalTotal = () => {
    return (parseFloat(getTotalPrice()) + getShippingCost()).toFixed(2);
  };
  
  // Fonction pour rediriger vers Stripe Checkout
  const handleCheckout = async () => {
    try {
      setIsLoading(true); // Activer l'indicateur de chargement
      console.log('Préparation de la session Stripe...');
      
      // Enregistrer les données de commande dans le localStorage
      const orderData = {
        items: cartItems,
        customer: formData,
        shipping: {
          method: shippingMethod,
          cost: getShippingCost()
        },
        total: getFinalTotal()
      };
      
      localStorage.setItem('pendingOrder', JSON.stringify(orderData));
      console.log('Données de commande enregistrées:', orderData);
      
      // Créer une session Stripe côté client en appelant votre API
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: cartItems,
          shipping: {
            name: `${formData.firstName} ${formData.lastName}`,
            address: {
              line1: formData.address,
              postal_code: formData.postalCode,
              city: formData.city,
              country: formData.country,
            },
          },
          shippingCost: getShippingCost(),
          shippingMethod: shippingMethod,
          email: formData.email,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de la création de la session de paiement');
      }
      
      const { sessionId } = await response.json();
      console.log('Session Stripe créée avec succès, ID:', sessionId);
      
      // Rediriger vers Stripe Checkout
      const stripe = await stripePromise;
      const { error } = await stripe.redirectToCheckout({ sessionId });
      
      if (error) {
        console.error('Erreur lors de la redirection vers Stripe:', error);
        alert(`Erreur de paiement: ${error.message}`);
        setIsLoading(false);
      }
      
    } catch (error) {
      console.error('Erreur lors du processus de paiement:', error);
      alert('Une erreur est survenue lors de la préparation du paiement. Veuillez réessayer.');
      setIsLoading(false);
    }
  };

  // Rendu de base sans contenu dynamique (pour éviter les erreurs d'hydratation)
  if (!isClient) {
    return (
      <>
        <Head>
          <title>Finaliser ma commande | MonSavonVert</title>
          <meta name="description" content="Finaliser votre commande chez MonSavonVert - Savons artisanaux écologiques" />
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
        <title>Finaliser ma commande | MonSavonVert</title>
        <meta name="description" content="Finaliser votre commande chez MonSavonVert - Savons artisanaux écologiques" />
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      <div className={styles.globalWrapper}>
        {/* Header avec navigation - Copié de la page panier */}
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
                    <a className={styles.navLink}>Boutique
                      <div className={styles.megaMenu}>
                        <div className={styles.megaMenuGrid}>
                          <div className={styles.megaMenuCategory}>
                            <h3>Catégories</h3>
                            <Link href="/boutique/visage" legacyBehavior><a>Soins visage</a></Link>
                            <Link href="/boutique/corps" legacyBehavior><a>Soins corps</a></Link>
                            <Link href="/boutique/cheveux" legacyBehavior><a>Cheveux</a></Link>
                            <Link href="/boutique/accessoires" legacyBehavior><a>Accessoires</a></Link>
                          </div>
                          <div className={styles.megaMenuCategory}>
                            <h3>Collections</h3>
                            <Link href="/boutique/aromatherapie" legacyBehavior><a>Aromathérapie</a></Link>
                            <Link href="/boutique/peaux-sensibles" legacyBehavior><a>Peaux sensibles</a></Link>
                            <Link href="/boutique/hydratation" legacyBehavior><a>Hydratation intense</a></Link>
                          </div>
                          <div className={styles.megaMenuImage}>
                            <p>Nouveau</p>
                            <img src="/images/2.JPEG" alt="Nouvelle collection" />
                            <Link href="/boutique/nouveautes" legacyBehavior><a className={styles.megaMenuButton}>Découvrir</a></Link>
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
          {/* Hero section */}
          <section className={styles.pageHero}>
            <div className={styles.pageHeroContent}>
              <h1 className={styles.pageTitle}>Récapitulatif de commande</h1>
              <div className={styles.pageBreadcrumb}>
                <Link href="/" legacyBehavior><a>Accueil</a></Link>
                <span className={styles.breadcrumbSeparator}>/</span>
                <Link href="/cart" legacyBehavior><a>Panier</a></Link>
                <span className={styles.breadcrumbSeparator}>/</span>
                <span className={styles.breadcrumbCurrent}>Récapitulatif</span>
              </div>
            </div>
          </section>

          {/* Indicateur d'étapes */}
          <section className={styles.checkoutSteps}>
            <div className={styles.stepIndicator}>
              <div className={`${styles.step} ${currentStep >= 1 ? styles.stepActive : ''}`}>
                <div className={styles.stepNumber}>1</div>
                <div className={styles.stepLabel}>Informations</div>
              </div>
              <div className={styles.stepLine}></div>
              <div className={`${styles.step} ${currentStep >= 2 ? styles.stepActive : ''}`}>
                <div className={styles.stepNumber}>2</div>
                <div className={styles.stepLabel}>Livraison</div>
              </div>
              <div className={styles.stepLine}></div>
              <div className={`${styles.step} ${currentStep >= 3 ? styles.stepActive : ''}`}>
                <div className={styles.stepNumber}>3</div>
                <div className={styles.stepLabel}>Paiement</div>
              </div>
            </div>
          </section>

          {/* Contenu principal */}
          <section className={styles.checkoutSection}>
            <div className={styles.checkoutContainer}>
              <div className={styles.checkoutContent}>
                <div className={styles.checkoutForm}>
                  {/* Étape 1: Informations client */}
                  {currentStep === 1 && (
                    <div className={styles.checkoutStep}>
                      <h2 className={styles.stepTitle}>Vos informations</h2>
                      <div className={styles.formGrid}>
                        <div className={styles.formGroup}>
                          <label htmlFor="firstName">Prénom *</label>
                          <input
                            type="text"
                            id="firstName"
                            name="firstName"
                            className={styles.formInput}
                            value={formData.firstName}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                        <div className={styles.formGroup}>
                          <label htmlFor="lastName">Nom *</label>
                          <input
                            type="text"
                            id="lastName"
                            name="lastName"
                            className={styles.formInput}
                            value={formData.lastName}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                        <div className={styles.formGroup}>
                          <label htmlFor="email">Email *</label>
                          <input
                            type="email"
                            id="email"
                            name="email"
                            className={styles.formInput}
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                        <div className={styles.formGroup}>
                          <label htmlFor="phone">Téléphone *</label>
                          <input
                            type="tel"
                            id="phone"
                            name="phone"
                            className={styles.formInput}
                            value={formData.phone}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                        <div className={styles.formGroupFull}>
                          <label htmlFor="address">Adresse *</label>
                          <input
                            type="text"
                            id="address"
                            name="address"
                            className={styles.formInput}
                            value={formData.address}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                        <div className={styles.formGroup}>
                          <label htmlFor="city">Ville *</label>
                          <input
                            type="text"
                            id="city"
                            name="city"
                            className={styles.formInput}
                            value={formData.city}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                        <div className={styles.formGroup}>
                          <label htmlFor="postalCode">Code postal *</label>
                          <input
                            type="text"
                            id="postalCode"
                            name="postalCode"
                            className={styles.formInput}
                            value={formData.postalCode}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                        <div className={styles.formGroup}>
                          <label htmlFor="country">Pays *</label>
                          <select
                            id="country"
                            name="country"
                            className={styles.formSelect}
                            value={formData.country}
                            onChange={handleInputChange}
                            required
                          >
                            <option value="France">France</option>
                            <option value="Belgique">Belgique</option>
                            <option value="Suisse">Suisse</option>
                            <option value="Luxembourg">Luxembourg</option>
                            <option value="Canada">Canada</option>
                          </select>
                        </div>
                      </div>
                      <div className={styles.formActions}>
                        <Link href="/cart" legacyBehavior>
                          <a className={styles.backButton}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <line x1="19" y1="12" x2="5" y2="12"></line>
                              <polyline points="12 19 5 12 12 5"></polyline>
                            </svg>
                            Retour au panier
                          </a>
                        </Link>
                        <button 
                          onClick={goToNextStep}
                          className={`${styles.button} ${styles.primaryButton}`}
                          disabled={!isFormValid}
                        >
                          Continuer
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                            <polyline points="12 5 19 12 12 19"></polyline>
                          </svg>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Étape 2: Livraison */}
                  {currentStep === 2 && (
                    <div className={styles.checkoutStep}>
                      <h2 className={styles.stepTitle}>Méthode de livraison</h2>
                      <div className={styles.shippingOptions}>
                        <div 
                          className={`${styles.shippingOption} ${shippingMethod === 'standard' ? styles.shippingOptionSelected : ''}`}
                          onClick={() => handleShippingChange('standard')}
                        >
                          <div className={styles.shippingOptionRadio}>
                            <div className={styles.radioOuter}>
                              {shippingMethod === 'standard' && <div className={styles.radioInner}></div>}
                            </div>
                          </div>
                          <div className={styles.shippingOptionInfo}>
                            <h3>Livraison standard</h3>
                            <p>Livraison en 3-5 jours ouvrés</p>
                          </div>
                          <div className={styles.shippingOptionPrice}>4,95 €</div>
                        </div>
                        
                        <div 
                          className={`${styles.shippingOption} ${shippingMethod === 'express' ? styles.shippingOptionSelected : ''}`}
                          onClick={() => handleShippingChange('express')}
                        >
                          <div className={styles.shippingOptionRadio}>
                            <div className={styles.radioOuter}>
                              {shippingMethod === 'express' && <div className={styles.radioInner}></div>}
                            </div>
                          </div>
                          <div className={styles.shippingOptionInfo}>
                            <h3>Livraison express</h3>
                            <p>Livraison en 24-48h</p>
                          </div>
                          <div className={styles.shippingOptionPrice}>9,95 €</div>
                        </div>
                        
                        <div 
                          className={`${styles.shippingOption} ${shippingMethod === 'pickup' ? styles.shippingOptionSelected : ''}`}
                          onClick={() => handleShippingChange('pickup')}
                        >
                          <div className={styles.shippingOptionRadio}>
                            <div className={styles.radioOuter}>
                              {shippingMethod === 'pickup' && <div className={styles.radioInner}></div>}
                            </div>
                          </div>
                          <div className={styles.shippingOptionInfo}>
                            <h3>Retrait en boutique</h3>
                            <p>15 rue des Artisans, 69001 Lyon</p>
                          </div>
                          <div className={styles.shippingOptionPrice}>Gratuit</div>
                        </div>
                      </div>
                      
                      <div className={styles.formActions}>
                        <button 
                          onClick={goToPreviousStep}
                          className={styles.backButton}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="19" y1="12" x2="5" y2="12"></line>
                            <polyline points="12 19 5 12 12 5"></polyline>
                          </svg>
                          Retour
                        </button>
                        <button 
                          onClick={goToNextStep}
                          className={`${styles.button} ${styles.primaryButton}`}
                        >
                          Continuer
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                            <polyline points="12 5 19 12 12 19"></polyline>
                          </svg>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Étape 3: Paiement */}
                  {currentStep === 3 && (
                    <div className={styles.checkoutStep}>
                      <h2 className={styles.stepTitle}>Méthode de paiement</h2>
                      <div className={styles.paymentInfo}>
                        <div className={styles.paymentMethods}>
                          <p className={styles.paymentNote}>
                            En cliquant sur "Payer", vous serez redirigé vers notre partenaire de paiement sécurisé Stripe.
                          </p>
                          <div className={styles.paymentLogos}>
                            <img src="/images/payments/visa.png" alt="Visa" className={styles.paymentLogo} />
                            <img src="/images/payments/mastercard.png" alt="Mastercard" className={styles.paymentLogo} />
                            <img src="/images/payments/paypal.png" alt="Paypal" className={styles.paymentLogo} />
                            <img src="/images/payments/applepay.png" alt="Apple Pay" className={styles.paymentLogo} />
                          </div>
                        </div>
                        
                        <div className={styles.addressReview}>
                          <h3>Adresse de livraison</h3>
                          <p>
                            {formData.firstName} {formData.lastName}<br />
                            {formData.address}<br />
                            {formData.postalCode} {formData.city}<br />
                            {formData.country}<br />
                            {formData.phone}
                          </p>
                          <button 
                            onClick={() => setCurrentStep(1)}
                            className={styles.editButton}
                          >
                            Modifier
                          </button>
                        </div>
                        
                        <div className={styles.shippingReview}>
                          <h3>Mode de livraison</h3>
                          <p>
                            {shippingMethod === 'standard' && 'Livraison standard (3-5 jours ouvrés)'}
                            {shippingMethod === 'express' && 'Livraison express (24-48h)'}
                            {shippingMethod === 'pickup' && 'Retrait en boutique (15 rue des Artisans, 69001 Lyon)'}
                          </p>
                          <button 
                            onClick={() => setCurrentStep(2)}
                            className={styles.editButton}
                          >
                            Modifier
                          </button>
                        </div>
                      </div>
                      
                      <div className={styles.formActions}>
                        <button 
                          onClick={goToPreviousStep}
                          className={styles.backButton}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="19" y1="12" x2="5" y2="12"></line>
                            <polyline points="12 19 5 12 12 5"></polyline>
                          </svg>
                          Retour
                        </button>
                        <button 
                          onClick={handleCheckout}
                          className={`${styles.button} ${styles.primaryButton} ${styles.paymentButton}`}
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <>
                              <span className={styles.loadingSpinner}></span>
                              Traitement en cours...
                            </>
                          ) : (
                            <>
                              Payer {getFinalTotal()} €
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                                <line x1="1" y1="10" x2="23" y2="10"></line>
                              </svg>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Récapitulatif de la commande */}
                <div className={styles.orderSummary}>
                  <h2 className={styles.summaryTitle}>Récapitulatif</h2>
                  
                  <div className={styles.orderItems}>
                    {cartItems.map(item => (
                      <div key={item.id} className={styles.orderItem}>
                        <div className={styles.orderItemImage}>
                          <img src={item.image} alt={item.name} />
                          <span className={styles.orderItemQuantity}>{item.quantity}</span>
                        </div>
                        <div className={styles.orderItemDetails}>
                          <h3 className={styles.orderItemName}>{item.name}</h3>
                          <p className={styles.orderItemPrice}>{(item.price * item.quantity).toFixed(2)} €</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className={styles.summaryRow}>
                    <span>Sous-total</span>
                    <span>{getTotalPrice()} €</span>
                  </div>
                  <div className={styles.summaryRow}>
                    <span>Livraison</span>
                    <span>
                      {getShippingCost() === 0 
                        ? 'Gratuit' 
                        : `${getShippingCost().toFixed(2)} €`
                      }
                    </span>
                  </div>
                  <div className={styles.summaryRowTotal}>
                    <span>Total</span>
                    <span>{getFinalTotal()} €</span>
                  </div>
                  
                  <div className={styles.promoCode}>
                    <input type="text" placeholder="Code promo" className={styles.promoInput} />
                    <button className={styles.promoButton}>Appliquer</button>
                  </div>
                  
                  <div className={styles.secureNotice}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                    <p>Paiement sécurisé par cryptage SSL</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>

        {/* Footer - Copié de la page panier */}
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
                <Link href="/boutique/accessoires" legacyBehavior><a className={styles.footerLink}>Accessoires</a></Link>
              </div>
              
              <div className={styles.footerColumn}>
                <h3 className={styles.footerTitle}>Informations</h3>
                <Link href="/a-propos" legacyBehavior><a className={styles.footerLink}>Notre histoire</a></Link>
                <Link href="/virtues" legacyBehavior><a className={styles.footerLink}>Vertu & bienfaits</a></Link>
                <Link href="/blog" legacyBehavior><a className={styles.footerLink}>Journal</a></Link>
                <Link href="/faq" legacyBehavior><a className={styles.footerLink}>FAQ</a></Link>
                <Link href="/contact" legacyBehavior><a className={styles.footerLink}>Contact</a></Link>
                <Link href="/programme-fidelite" legacyBehavior><a className={styles.footerLink}>Programme fidélité</a></Link>
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
                <p className={styles.contactInfo}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                  <span>15 rue des Artisans<br />69001 Lyon, France</span>
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
    </>
  );
}