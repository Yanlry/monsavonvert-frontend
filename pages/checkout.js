'use client';

import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import styles from '../styles/checkout.module.css'; // Vous devrez créer ce fichier
import { loadStripe } from '@stripe/stripe-js'; // Importation de Stripe

// Initialisez Stripe avec votre clé publique
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

// Expressions régulières pour la validation
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const PHONE_REGEX = /^(\+\d{1,3}[- ]?)?\d{9,15}$/; // Format international flexible
const POSTAL_CODE_REGEX = /^\d{5}$/; // Pour la France (5 chiffres)
const ADDRESS_REGEX = /^\d+\s+\S+/; // Commence par un numéro suivi d'un espace et du nom de rue
const API_URL = process.env.NEXT_PUBLIC_API_URL;

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
    termsAccepted: false,
  });
  
  // État pour les erreurs de validation
  const [formErrors, setFormErrors] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    country: '',
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
  
  // États pour le modal
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalTitle, setModalTitle] = useState('');
  
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
    // Fonction de validation des champs
    const validateFields = () => {
      const errors = {};
      
      // Validation prénom
      if (!formData.firstName.trim()) {
        errors.firstName = '';
      }
      
      // Validation nom
      if (!formData.lastName.trim()) {
        errors.lastName = '';
      }
      
      // Validation email
      if (!formData.email.trim()) {
        errors.email = '';
      } else if (!EMAIL_REGEX.test(formData.email)) {
        errors.email = 'Format d\'email invalide';
      }
      
      // Validation téléphone
      if (!formData.phone.trim()) {
        errors.phone = '';
      } else if (!PHONE_REGEX.test(formData.phone)) {
        errors.phone = 'Format de téléphone invalide';
      }
      
      // Validation adresse
      if (!formData.address.trim()) {
        errors.address = '';
      } else if (!ADDRESS_REGEX.test(formData.address)) {
        errors.address = 'Format: Numéro + nom de la rue';
      }
      
      // Validation ville
      if (!formData.city.trim()) {
        errors.city = '';
      }
      
      // Validation code postal
      if (!formData.postalCode.trim()) {
        errors.postalCode = '';
      } else if (!POSTAL_CODE_REGEX.test(formData.postalCode) && formData.country === 'France') {
        errors.postalCode = 'Le code postal doit contenir 5 chiffres';
      }
      
      // Mise à jour des erreurs
      setFormErrors(errors);
      
      // Vérification que tous les champs obligatoires sont remplis
      const allFieldsFilled = formData.firstName.trim() && 
                              formData.lastName.trim() && 
                              formData.email.trim() && 
                              formData.phone.trim() && 
                              formData.address.trim() && 
                              formData.city.trim() && 
                              formData.postalCode.trim();
      
      // Vérification qu'aucune erreur de format n'est présente
      const noFormatErrors = !errors.email && !errors.phone && !errors.address && !errors.postalCode;
      
      // Retourne vrai si tous les champs sont remplis, sans erreur de format, et les termes acceptés
      return allFieldsFilled && noFormatErrors && formData.termsAccepted;
    };
    
    // Vérification de la validité du formulaire
    const isValid = validateFields();
    setIsFormValid(isValid);
    console.log('Validation du formulaire:', isValid);
  }, [formData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Nettoyage des données utilisateur pour éviter les injections XSS
    const sanitizedValue = value.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    
    setFormData((prevData) => ({
      ...prevData,
      [name]: sanitizedValue,
    }));
    console.log(`Champ ${name} mis à jour avec la valeur: ${sanitizedValue}`);
  };
  
  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: checked,
    }));
    console.log(`Champ ${name} mis à jour avec la valeur: ${checked}`);
  };

  // Gestionnaire de changement de méthode de livraison
  const handleShippingChange = (method) => {
    setShippingMethod(method);
    console.log('Méthode de livraison sélectionnée:', method);
  };

  // Récupération du prix total du panier
  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2);
  };
  
  // Calcul des frais de livraison
  const getShippingCost = () => {
    // Vérification si le panier atteint le seuil de 29€ pour la livraison standard gratuite
    const cartTotal = parseFloat(getTotalPrice());
    
    switch (shippingMethod) {
      case 'express':
        return 9.95;
      case 'pickup':
        return 0;
      default: // standard
        // Livraison standard gratuite si le panier est >= 29€
        return cartTotal >= 29 ? 0 : 4.95;
    }
  };
  
  // Calcul du total final
  const getFinalTotal = () => {
    return (parseFloat(getTotalPrice()) + getShippingCost()).toFixed(2);
  };

  const goToNextStep = async () => {
    if (currentStep === 1) {
      if (!isFormValid) {
        // Utilisation du modal pour afficher les erreurs
        setModalTitle('Informations incomplètes');
        setModalMessage('Veuillez remplir correctement tous les champs du formulaire et accepter les termes et conditions avant de continuer.');
        setShowModal(true);
        return;
      }
  
      try {
        const response = await fetch(`${API_URL}/customers`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });
  
        const data = await response.json();
        if (!response.ok) {
          // Utilisation du modal au lieu de alert
          setModalTitle('Erreur');
          setModalMessage(data.error || 'Erreur lors de la gestion des informations client.');
          setShowModal(true);
          return;
        }
  
        console.log(data.message); // Affiche si le client est trouvé ou créé
  
        // Si un mot de passe temporaire est retourné, l'afficher dans le modal
        if (data.temporaryPassword) {
          setModalTitle('Compte créé');
          setModalMessage(`Un compte utilisateur a été créé pour vous. Votre mot de passe temporaire est : ${data.temporaryPassword}. Veuillez le modifier après connexion.`);
          setShowModal(true);
          // On continue quand même à l'étape suivante
          setCurrentStep(currentStep + 1);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else if (data.message && data.message.includes('existant')) {
          // Si le client existe déjà
          setModalTitle('Client existant');
          setModalMessage('Un compte avec ces informations existe déjà. Vous pouvez continuer votre commande ou vous connecter à votre compte.');
          setShowModal(true);
          // On continue quand même à l'étape suivante
          setCurrentStep(currentStep + 1);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          // Cas normal, on passe simplement à l'étape suivante
          setCurrentStep(currentStep + 1);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      } catch (error) {
        console.error('Erreur lors de la gestion des informations client :', error);
        // Utilisation du modal au lieu de alert
        setModalTitle('Erreur');
        setModalMessage('Une erreur est survenue. Veuillez réessayer.');
        setShowModal(true);
      }
    } else if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
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
        // Utilisation du modal au lieu de alert
        setModalTitle('Erreur de paiement');
        setModalMessage(error.message);
        setShowModal(true);
        setIsLoading(false);
      }
      
    } catch (error) {
      console.error('Erreur lors du processus de paiement:', error);
      // Utilisation du modal au lieu de alert
      setModalTitle('Erreur de paiement');
      setModalMessage('Une erreur est survenue lors de la préparation du paiement. Veuillez réessayer.');
      setShowModal(true);
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

      <div className={styles.container}>
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
                            className={`${styles.formInput} ${formErrors.firstName ? styles.inputError : ''}`}
                            value={formData.firstName}
                            onChange={handleInputChange}
                            required
                            placeholder="Jean"
                          />
                          {formErrors.firstName && (
                            <p className={styles.errorText}>{formErrors.firstName}</p>
                          )}
                        </div>
                        <div className={styles.formGroup}>
                          <label htmlFor="lastName">Nom *</label>
                          <input
                            type="text"
                            id="lastName"
                            name="lastName"
                            className={`${styles.formInput} ${formErrors.lastName ? styles.inputError : ''}`}
                            value={formData.lastName}
                            onChange={handleInputChange}
                            required
                            placeholder="Dupont"
                          />
                          {formErrors.lastName && (
                            <p className={styles.errorText}>{formErrors.lastName}</p>
                          )}
                        </div>
                        <div className={styles.formGroup}>
                          <label htmlFor="email">Email *</label>
                          <input
                            type="email"
                            id="email"
                            name="email"
                            className={`${styles.formInput} ${formErrors.email ? styles.inputError : ''}`}
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                            placeholder="jean.dupont@example.com"
                          />
                          {formErrors.email && (
                            <p className={styles.errorText}>{formErrors.email}</p>
                          )}
                        </div>
                        <div className={styles.formGroup}>
                          <label htmlFor="phone">Téléphone *</label>
                          <input
                            type="tel"
                            id="phone"
                            name="phone"
                            className={`${styles.formInput} ${formErrors.phone ? styles.inputError : ''}`}
                            value={formData.phone}
                            onChange={handleInputChange}
                            required
                            placeholder="+33 6 12 34 56 78"
                          />
                          {formErrors.phone && (
                            <p className={styles.errorText}>{formErrors.phone}</p>
                          )}
                        </div>
                        <div className={styles.formGroupFull}>
                          <label htmlFor="address">Adresse *</label>
                          <input
                            type="text"
                            id="address"
                            name="address"
                            className={`${styles.formInput} ${formErrors.address ? styles.inputError : ''}`}
                            value={formData.address}
                            onChange={handleInputChange}
                            required
                            placeholder="42 rue des Oliviers"
                            autoComplete="street-address"
                          />
                          {formErrors.address && (
                            <p className={styles.errorText}>{formErrors.address}</p>
                          )}
                        </div>
                        <div className={styles.formGroup}>
                          <label htmlFor="city">Ville *</label>
                          <input
                            type="text"
                            id="city"
                            name="city"
                            className={`${styles.formInput} ${formErrors.city ? styles.inputError : ''}`}
                            value={formData.city}
                            onChange={handleInputChange}
                            required
                            placeholder="Lyon"
                          />
                          {formErrors.city && (
                            <p className={styles.errorText}>{formErrors.city}</p>
                          )}
                        </div>
                        <div className={styles.formGroup}>
                          <label htmlFor="postalCode">Code postal *</label>
                          <input
                            type="text"
                            id="postalCode"
                            name="postalCode"
                            className={`${styles.formInput} ${formErrors.postalCode ? styles.inputError : ''}`}
                            value={formData.postalCode}
                            onChange={handleInputChange}
                            required
                            placeholder="69001"
                          />
                          {formErrors.postalCode && (
                            <p className={styles.errorText}>{formErrors.postalCode}</p>
                          )}
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
                        <div className={styles.formGroupFull}>
                          <label htmlFor="termsAccepted" className={styles.checkboxLabel}>
                            <input
                              type="checkbox"
                              id="termsAccepted"
                              name="termsAccepted"
                              className={styles.checkboxInput}
                              checked={formData.termsAccepted}
                              onChange={handleCheckboxChange}
                            />
                            J'accepte les <Link href="/terms" legacyBehavior><a>termes et conditions</a></Link>.
                          </label>
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
                          disabled={!isFormValid} // Désactiver si le formulaire n'est pas valide
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
                            {/* Indication de la promotion */}
                            <p className={styles.shippingPromo}>Gratuite à partir de 29€ d'achat</p>
                          </div>
                          <div className={styles.shippingOptionPrice}>
                            {parseFloat(getTotalPrice()) >= 29 ? 'Gratuit' : '4,95 €'}
                          </div>
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
                            <img src="/images/payments/americanexpress.png" alt="americanexpress" className={styles.paymentLogo} />
                            <img src="/images/payments/diners.png" alt="Diners Club" className={styles.paymentLogo} />
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

        {/* Modal */}
        {showModal && (
          <div className={styles.modalOverlay}>
            <div className={styles.modal}>
              <div className={styles.modalHeader}>
                <h3 className={styles.modalTitle}>{modalTitle}</h3>
                <button className={styles.modalClose} onClick={() => setShowModal(false)}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
              <div className={styles.modalBody}>
                <p>{modalMessage}</p>
              </div>
              <div className={styles.modalFooter}>
                <button className={`${styles.button} ${styles.primaryButton}`} onClick={() => setShowModal(false)}>
                  Fermer
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}