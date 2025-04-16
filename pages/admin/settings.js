'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import styles from '../../styles/admin-settings.module.css'; // Réutilisation du même fichier CSS

export default function AdminSettings() {
  // États
  const [isClient, setIsClient] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState({
    // Paramètres généraux
    general: {
      siteName: 'MonSavonVert',
      siteDescription: 'Savons artisanaux naturels et écologiques',
      contactEmail: 'contact@monsavonvert.fr',
      phoneNumber: '06 12 34 56 78',
      address: '15 rue des Savonniers, 75011 Paris',
      logo: '/images/logo.png',
      favicon: '/favicon.ico'
    },
    // Paramètres de boutique
    shop: {
      currency: 'EUR',
      currencySymbol: '€',
      vatRate: 20,
      productsPerPage: 8,
      showOutOfStock: true,
      enableReviews: true,
      minOrderAmount: 15,
      freeShippingThreshold: 49
    },
    // Paramètres de livraison
    shipping: {
      defaultShippingCost: 5.90,
      carriers: [
        { id: 1, name: 'Colissimo', price: 5.90, estimatedDays: '2-3', isDefault: true, isActive: true },
        { id: 2, name: 'Mondial Relay', price: 4.50, estimatedDays: '3-5', isDefault: false, isActive: true },
        { id: 3, name: 'Chronopost', price: 9.90, estimatedDays: '1', isDefault: false, isActive: true },
        { id: 4, name: 'DPD', price: 5.50, estimatedDays: '2-4', isDefault: false, isActive: false }
      ]
    },
    // Paramètres de paiement
    payment: {
      paymentMethods: [
        { id: 1, name: 'Carte bancaire', isActive: true, fees: 0 },
        { id: 2, name: 'PayPal', isActive: true, fees: 0 },
        { id: 3, name: 'Apple Pay', isActive: true, fees: 0 },
        { id: 4, name: 'Virement bancaire', isActive: false, fees: 0 }
      ],
      stripeEnabled: true,
      stripePublicKey: 'pk_test_xxxxxxxxxxxxxxxxxxxxx',
      paypalEnabled: true,
      paypalClientId: 'client_id_xxxxxxxxxxxxxxxxx'
    },
    // Paramètres d'emails
    emails: {
      senderName: 'MonSavonVert',
      senderEmail: 'noreply@monsavonvert.fr',
      orderConfirmationTemplate: 'Merci pour votre commande {order_number}. Nous préparons votre colis avec soin.',
      shippingConfirmationTemplate: 'Votre commande {order_number} a été expédiée. Numéro de suivi: {tracking_number}.',
      welcomeEmailTemplate: 'Bienvenue chez MonSavonVert, {customer_name}! Merci d\'avoir créé un compte.',
      abandonedCartTemplate: 'Bonjour {customer_name}, vous avez des articles dans votre panier. Souhaitez-vous les récupérer?'
    },
    // Paramètres SEO
    seo: {
      metaTitle: 'MonSavonVert | Savons artisanaux naturels et écologiques',
      metaDescription: 'Découvrez notre gamme de savons artisanaux fabriqués à la main avec des ingrédients naturels et biologiques. Livraison offerte dès 29€ d\'achat.',
      ogImage: '/images/og-image.jpg',
      googleAnalyticsId: 'UA-XXXXXXXXX-X',
      enableSitemap: true,
      robotsTxt: 'User-agent: *\nAllow: /'
    },
    // Paramètres sociaux
    social: {
      facebook: 'https://facebook.com/monsavonvert',
      instagram: 'https://instagram.com/monsavonvert',
      pinterest: 'https://pinterest.com/monsavonvert',
      twitter: '',
      youtube: '',
      linkedin: ''
    },
    // Paramètres légaux
    legal: {
      termsOfService: 'Les présentes conditions générales de vente régissent l\'utilisation de notre site...',
      privacyPolicy: 'Nous collectons vos données personnelles dans le but de traiter vos commandes...',
      refundPolicy: 'Vous disposez d\'un délai de 14 jours à compter de la réception de votre commande pour nous retourner les articles...',
      cookiePolicy: 'Notre site utilise des cookies pour améliorer votre expérience de navigation...',
      lastUpdated: '2025-03-15'
    },
    // Paramètres avancés
    advanced: {
      maintenanceMode: false,
      maintenanceMessage: 'Notre site est actuellement en maintenance. Nous serons de retour très bientôt.',
      debugMode: false,
      cacheEnabled: true,
      apiKey: 'api_key_xxxxxxxxxxxxxxxxxxxxxxxx',
      customCss: '/* Styles personnalisés */\n\n/* Fin des styles personnalisés */'
    }
  });
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const router = useRouter();

  // Effet pour l'initialisation côté client
  useEffect(() => {
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

// Vérification de l'authentification
useEffect(() => {
  if (!isClient) return;
  
  try {
    // Vérifier si l'utilisateur est connecté en tant qu'admin
    const email = localStorage.getItem('userEmail');
    const userRole = localStorage.getItem('userRole');

    console.log('Vérification des autorisations pour:', email);
    console.log('Rôle utilisateur:', userRole);

    // Vérifier si les informations sont présentes
    if (!email || !userRole) {
      console.log('Informations manquantes - Email ou Rôle non trouvé');
      router.push('/login');
      return;
    }

    // Vérifier si l'utilisateur a le rôle admin
    if (userRole !== 'admin') {
      console.log('Accès refusé: L\'utilisateur n\'a pas le rôle admin');
      router.push('/profile');
      return;
    }

    // Si l'utilisateur est bien un admin, autoriser l'accès
    console.log('Accès autorisé pour l\'administrateur');
    setUserEmail(email);
    setIsAuthorized(true);
    setIsLoading(false);
  } catch (error) {
    console.error('Erreur lors de la vérification des autorisations:', error);
    router.push('/login');
  }
}, [isClient, router]);

  // Fonction pour mettre à jour les paramètres
  const updateSetting = (category, field, value) => {
    setSettings(prevSettings => ({
      ...prevSettings,
      [category]: {
        ...prevSettings[category],
        [field]: value
      }
    }));
  };

  // Fonction pour mettre à jour les paramètres imbriqués
  const updateNestedSetting = (category, index, field, value) => {
    setSettings(prevSettings => {
      const updatedCategory = [...prevSettings[category]];
      updatedCategory[index] = {
        ...updatedCategory[index],
        [field]: value
      };
      
      return {
        ...prevSettings,
        [category]: updatedCategory
      };
    });
  };

  // Fonction pour mettre à jour une méthode de paiement
  const updatePaymentMethod = (index, field, value) => {
    const updatedPaymentMethods = [...settings.payment.paymentMethods];
    updatedPaymentMethods[index] = {
      ...updatedPaymentMethods[index],
      [field]: value
    };
    
    setSettings(prevSettings => ({
      ...prevSettings,
      payment: {
        ...prevSettings.payment,
        paymentMethods: updatedPaymentMethods
      }
    }));
  };

  // Fonction pour mettre à jour un transporteur
  const updateCarrier = (index, field, value) => {
    const updatedCarriers = [...settings.shipping.carriers];
    updatedCarriers[index] = {
      ...updatedCarriers[index],
      [field]: value
    };
    
    setSettings(prevSettings => ({
      ...prevSettings,
      shipping: {
        ...prevSettings.shipping,
        carriers: updatedCarriers
      }
    }));
  };

  // Fonction pour enregistrer les paramètres
  const saveSettings = () => {
    // Simulation d'une sauvegarde
    console.log('Enregistrement des paramètres:', settings);
    setToastMessage('Les paramètres ont été enregistrés avec succès.');
    setShowSuccessToast(true);
    
    // Masquer le toast après 3 secondes
    setTimeout(() => {
      setShowSuccessToast(false);
    }, 3000);
  };

  // Fonction pour définir un transporteur par défaut
  const setDefaultCarrier = (carrierId) => {
    const updatedCarriers = settings.shipping.carriers.map(carrier => ({
      ...carrier,
      isDefault: carrier.id === carrierId
    }));
    
    setSettings(prevSettings => ({
      ...prevSettings,
      shipping: {
        ...prevSettings.shipping,
        carriers: updatedCarriers
      }
    }));
  };

  // Rendu de base sans contenu dynamique (pour éviter les erreurs d'hydratation)
  if (!isClient) {
    return (
      <>
        <Head>
          <title>Paramètres | MonSavonVert</title>
          <meta name="description" content="Paramètres d'administration - MonSavonVert" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <div className={styles.loadingWrapper}>
          <div className={styles.loadingLogo}>MonSavonVert</div>
        </div>
      </>
    );
  }

  // Rendu principal de l'application
  return (
    <>
      <Head>
        <title>Paramètres | MonSavonVert</title>
        <meta name="description" content="Paramètres d'administration - MonSavonVert" />
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      <div className={styles.globalWrapper}>
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
                  <Link href="/admin/dashboard" legacyBehavior>
                    <a className={styles.navLink}>Tableau de bord</a>
                  </Link>
                </li>
                <li className={styles.navItem}>
                  <Link href="/admin/orders" legacyBehavior>
                    <a className={styles.navLink}>Commandes</a>
                  </Link>
                </li>
                <li className={styles.navItem}>
                  <Link href="/admin/products" legacyBehavior>
                    <a className={styles.navLink}>Produits</a>
                  </Link>
                </li>
                <li className={styles.navItem}>
                  <Link href="/admin/customers" legacyBehavior>
                    <a className={styles.navLink}>Clients</a>
                  </Link>
                </li>
                <li className={styles.navItem}>
                  <Link href="/admin/settings" legacyBehavior>
                    <a className={`${styles.navLink} ${styles.active}`}>Paramètres</a>
                  </Link>
                </li>
              </ul>
            </nav>

            {/* Profil administrateur */}
            <div className={styles.adminProfile}>
              <div className={styles.adminAvatar}>
                <span>A</span>
              </div>
              <div className={styles.adminInfo}>
                <span className={styles.adminName}>Admin</span>
                <span className={styles.adminEmail}>{userEmail}</span>
              </div>
            </div>
          </div>
        </header>

        <main className={styles.mainContent}>
          {/* Page title section */}
          <section className={styles.pageHeaderSection}>
            <div className={styles.pageHeaderContent}>
              <div className={styles.pageTitle}>
                <h1>Paramètres</h1>
                <p className={styles.pageDescription}>
                  Configurez les paramètres de votre boutique en ligne
                </p>
              </div>
              <div className={styles.pageActions}>
                <button className={styles.saveButton} onClick={saveSettings}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                    <polyline points="17 21 17 13 7 13 7 21"></polyline>
                    <polyline points="7 3 7 8 15 8"></polyline>
                  </svg>
                  Enregistrer les modifications
                </button>
              </div>
            </div>
          </section>
          
          {/* Contenu principal */}
          <section className={styles.settingsSection}>
            <div className={styles.settingsContainer}>
              {isLoading ? (
                <div className={styles.loadingOrders}>
                  <div className={styles.spinner}></div>
                  <p>Chargement des paramètres...</p>
                </div>
              ) : (
                <div className={styles.settingsContent}>
                  {/* Navigation des onglets */}
                  <div className={styles.settingsTabs}>
                    <button 
                      className={`${styles.settingsTab} ${activeTab === 'general' ? styles.activeSettingsTab : ''}`}
                      onClick={() => setActiveTab('general')}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="12"></line>
                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                      </svg>
                      Général
                    </button>
                    <button 
                      className={`${styles.settingsTab} ${activeTab === 'shop' ? styles.activeSettingsTab : ''}`}
                      onClick={() => setActiveTab('shop')}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                        <line x1="3" y1="6" x2="21" y2="6"></line>
                        <path d="M16 10a4 4 0 0 1-8 0"></path>
                      </svg>
                      Boutique
                    </button>
                    <button 
                      className={`${styles.settingsTab} ${activeTab === 'shipping' ? styles.activeSettingsTab : ''}`}
                      onClick={() => setActiveTab('shipping')}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="1" y="3" width="15" height="13"></rect>
                        <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
                        <circle cx="5.5" cy="18.5" r="2.5"></circle>
                        <circle cx="18.5" cy="18.5" r="2.5"></circle>
                      </svg>
                      Livraison
                    </button>
                    <button 
                      className={`${styles.settingsTab} ${activeTab === 'payment' ? styles.activeSettingsTab : ''}`}
                      onClick={() => setActiveTab('payment')}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                        <line x1="1" y1="10" x2="23" y2="10"></line>
                      </svg>
                      Paiement
                    </button>
                    <button 
                      className={`${styles.settingsTab} ${activeTab === 'emails' ? styles.activeSettingsTab : ''}`}
                      onClick={() => setActiveTab('emails')}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                        <polyline points="22,6 12,13 2,6"></polyline>
                      </svg>
                      Emails
                    </button>
                    <button 
                      className={`${styles.settingsTab} ${activeTab === 'seo' ? styles.activeSettingsTab : ''}`}
                      onClick={() => setActiveTab('seo')}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                      </svg>
                      SEO
                    </button>
                    <button 
                      className={`${styles.settingsTab} ${activeTab === 'social' ? styles.activeSettingsTab : ''}`}
                      onClick={() => setActiveTab('social')}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                      </svg>
                      Réseaux sociaux
                    </button>
                    <button 
                      className={`${styles.settingsTab} ${activeTab === 'legal' ? styles.activeSettingsTab : ''}`}
                      onClick={() => setActiveTab('legal')}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
                      </svg>
                      Mentions légales
                    </button>
                    <button 
                      className={`${styles.settingsTab} ${activeTab === 'advanced' ? styles.activeSettingsTab : ''}`}
                      onClick={() => setActiveTab('advanced')}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="3"></circle>
                        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                      </svg>
                      Avancé
                    </button>
                  </div>
                  
                  {/* Contenu des onglets */}
                  <div className={styles.settingsPanel}>
                    {/* Onglet Général */}
                    {activeTab === 'general' && (
                      <div className={styles.settingsPanelContent}>
                        <h2>Paramètres généraux</h2>
                        <p className={styles.settingsPanelDescription}>
                          Configuration générale de votre boutique en ligne
                        </p>
                        
                        <div className={styles.settingsForm}>
                          <div className={styles.formGroup}>
                            <label htmlFor="siteName">Nom du site</label>
                            <input 
                              type="text" 
                              id="siteName" 
                              value={settings.general.siteName} 
                              onChange={(e) => updateSetting('general', 'siteName', e.target.value)} 
                            />
                          </div>
                          
                          <div className={styles.formGroup}>
                            <label htmlFor="siteDescription">Description du site</label>
                            <input 
                              type="text" 
                              id="siteDescription" 
                              value={settings.general.siteDescription} 
                              onChange={(e) => updateSetting('general', 'siteDescription', e.target.value)} 
                            />
                          </div>
                          
                          <div className={styles.formGroup}>
                            <label htmlFor="contactEmail">Email de contact</label>
                            <input 
                              type="email" 
                              id="contactEmail" 
                              value={settings.general.contactEmail} 
                              onChange={(e) => updateSetting('general', 'contactEmail', e.target.value)} 
                            />
                          </div>
                          
                          <div className={styles.formGroup}>
                            <label htmlFor="phoneNumber">Numéro de téléphone</label>
                            <input 
                              type="tel" 
                              id="phoneNumber" 
                              value={settings.general.phoneNumber} 
                              onChange={(e) => updateSetting('general', 'phoneNumber', e.target.value)} 
                            />
                          </div>
                          
                          <div className={styles.formGroup}>
                            <label htmlFor="address">Adresse</label>
                            <textarea 
                              id="address" 
                              value={settings.general.address} 
                              onChange={(e) => updateSetting('general', 'address', e.target.value)}
                              rows="3"
                            ></textarea>
                          </div>
                          
                          <div className={styles.formGroupFile}>
                            <label>Logo</label>
                            <div className={styles.filePreview}>
                              <img src={settings.general.logo} alt="Logo" />
                            </div>
                            <div className={styles.fileActions}>
                              <button className={styles.fileUploadButton}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                  <polyline points="17 8 12 3 7 8"></polyline>
                                  <line x1="12" y1="3" x2="12" y2="15"></line>
                                </svg>
                                Choisir un fichier
                              </button>
                            </div>
                          </div>
                          
                          <div className={styles.formGroupFile}>
                            <label>Favicon</label>
                            <div className={styles.filePreview}>
                              <img src={settings.general.favicon} alt="Favicon" className={styles.faviconPreview} />
                            </div>
                            <div className={styles.fileActions}>
                              <button className={styles.fileUploadButton}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                  <polyline points="17 8 12 3 7 8"></polyline>
                                  <line x1="12" y1="3" x2="12" y2="15"></line>
                                </svg>
                                Choisir un fichier
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Onglet Boutique */}
                    {activeTab === 'shop' && (
                      <div className={styles.settingsPanelContent}>
                        <h2>Paramètres de la boutique</h2>
                        <p className={styles.settingsPanelDescription}>
                          Configuration des options de votre boutique en ligne
                        </p>
                        
                        <div className={styles.settingsForm}>
                          <div className={styles.formRow}>
                            <div className={styles.formGroup}>
                              <label htmlFor="currency">Devise</label>
                              <select 
                                id="currency" 
                                value={settings.shop.currency} 
                                onChange={(e) => updateSetting('shop', 'currency', e.target.value)}
                              >
                                <option value="EUR">Euro (EUR)</option>
                                <option value="USD">Dollar américain (USD)</option>
                                <option value="GBP">Livre sterling (GBP)</option>
                                <option value="CHF">Franc suisse (CHF)</option>
                                <option value="CAD">Dollar canadien (CAD)</option>
                              </select>
                            </div>
                            
                            <div className={styles.formGroup}>
                              <label htmlFor="currencySymbol">Symbole monétaire</label>
                              <input 
                                type="text" 
                                id="currencySymbol" 
                                value={settings.shop.currencySymbol} 
                                onChange={(e) => updateSetting('shop', 'currencySymbol', e.target.value)} 
                              />
                            </div>
                          </div>
                          
                          <div className={styles.formRow}>
                            <div className={styles.formGroup}>
                              <label htmlFor="vatRate">Taux de TVA (%)</label>
                              <input 
                                type="number" 
                                id="vatRate" 
                                value={settings.shop.vatRate} 
                                onChange={(e) => updateSetting('shop', 'vatRate', parseInt(e.target.value))} 
                                min="0"
                                max="100"
                              />
                            </div>
                            
                            <div className={styles.formGroup}>
                              <label htmlFor="productsPerPage">Produits par page</label>
                              <input 
                                type="number" 
                                id="productsPerPage" 
                                value={settings.shop.productsPerPage} 
                                onChange={(e) => updateSetting('shop', 'productsPerPage', parseInt(e.target.value))} 
                                min="1"
                                max="100"
                              />
                            </div>
                          </div>
                          
                          <div className={styles.formRow}>
                            <div className={styles.formGroup}>
                              <label htmlFor="minOrderAmount">Montant minimum de commande (€)</label>
                              <input 
                                type="number" 
                                id="minOrderAmount" 
                                value={settings.shop.minOrderAmount} 
                                onChange={(e) => updateSetting('shop', 'minOrderAmount', parseFloat(e.target.value))} 
                                min="0"
                                step="0.01"
                              />
                            </div>
                            
                            <div className={styles.formGroup}>
                              <label htmlFor="freeShippingThreshold">Seuil de livraison gratuite (€)</label>
                              <input 
                                type="number" 
                                id="freeShippingThreshold" 
                                value={settings.shop.freeShippingThreshold} 
                                onChange={(e) => updateSetting('shop', 'freeShippingThreshold', parseFloat(e.target.value))} 
                                min="0"
                                step="0.01"
                              />
                            </div>
                          </div>
                          
                          <div className={styles.formGroup}>
                            <div className={styles.checkboxControl}>
                              <input 
                                type="checkbox" 
                                id="showOutOfStock" 
                                checked={settings.shop.showOutOfStock} 
                                onChange={(e) => updateSetting('shop', 'showOutOfStock', e.target.checked)} 
                              />
                              <label htmlFor="showOutOfStock">Afficher les produits en rupture de stock</label>
                            </div>
                          </div>
                          
                          <div className={styles.formGroup}>
                            <div className={styles.checkboxControl}>
                              <input 
                                type="checkbox" 
                                id="enableReviews" 
                                checked={settings.shop.enableReviews} 
                                onChange={(e) => updateSetting('shop', 'enableReviews', e.target.checked)} 
                              />
                              <label htmlFor="enableReviews">Activer les avis clients</label>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Onglet Livraison */}
                    {activeTab === 'shipping' && (
                      <div className={styles.settingsPanelContent}>
                        <h2>Paramètres de livraison</h2>
                        <p className={styles.settingsPanelDescription}>
                          Configuration des options de livraison et des transporteurs
                        </p>
                        
                        <div className={styles.settingsForm}>
                          <div className={styles.formGroup}>
                            <label htmlFor="defaultShippingCost">Frais de livraison par défaut (€)</label>
                            <input 
                              type="number" 
                              id="defaultShippingCost" 
                              value={settings.shipping.defaultShippingCost} 
                              onChange={(e) => updateSetting('shipping', 'defaultShippingCost', parseFloat(e.target.value))} 
                              min="0"
                              step="0.01"
                            />
                          </div>
                          
                          <div className={styles.tableSection}>
                            <div className={styles.tableSectionHeader}>
                              <h3>Transporteurs</h3>
                              <button className={styles.addButton}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <line x1="12" y1="5" x2="12" y2="19"></line>
                                  <line x1="5" y1="12" x2="19" y2="12"></line>
                                </svg>
                                Ajouter un transporteur
                              </button>
                            </div>
                            
                            <table className={styles.settingsTable}>
                              <thead>
                                <tr>
                                  <th>Nom</th>
                                  <th>Prix (€)</th>
                                  <th>Délai estimé (jours)</th>
                                  <th>Par défaut</th>
                                  <th>Statut</th>
                                  <th>Actions</th>
                                </tr>
                              </thead>
                              <tbody>
                                {settings.shipping.carriers.map((carrier, index) => (
                                  <tr key={carrier.id}>
                                    <td>
                                      <input 
                                        type="text" 
                                        value={carrier.name} 
                                        onChange={(e) => updateCarrier(index, 'name', e.target.value)} 
                                      />
                                    </td>
                                    <td>
                                      <input 
                                        type="number" 
                                        value={carrier.price} 
                                        onChange={(e) => updateCarrier(index, 'price', parseFloat(e.target.value))} 
                                        min="0"
                                        step="0.01"
                                      />
                                    </td>
                                    <td>
                                      <input 
                                        type="text" 
                                        value={carrier.estimatedDays} 
                                        onChange={(e) => updateCarrier(index, 'estimatedDays', e.target.value)} 
                                      />
                                    </td>
                                    <td>
                                      <input 
                                        type="radio" 
                                        name="defaultCarrier" 
                                        checked={carrier.isDefault} 
                                        onChange={() => setDefaultCarrier(carrier.id)} 
                                      />
                                    </td>
                                    <td>
                                      <div className={styles.toggleSwitch}>
                                        <input 
                                          type="checkbox" 
                                          id={`carrier-${carrier.id}`} 
                                          checked={carrier.isActive} 
                                          onChange={(e) => updateCarrier(index, 'isActive', e.target.checked)} 
                                        />
                                        <label htmlFor={`carrier-${carrier.id}`}></label>
                                      </div>
                                    </td>
                                    <td>
                                      <button className={styles.deleteButton}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                          <polyline points="3 6 5 6 21 6"></polyline>
                                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                        </svg>
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Onglet Paiement */}
                    {activeTab === 'payment' && (
                      <div className={styles.settingsPanelContent}>
                        <h2>Paramètres de paiement</h2>
                        <p className={styles.settingsPanelDescription}>
                          Configuration des méthodes de paiement et des passerelles
                        </p>
                        
                        <div className={styles.settingsForm}>
                          <div className={styles.tableSection}>
                            <div className={styles.tableSectionHeader}>
                              <h3>Méthodes de paiement</h3>
                              <button className={styles.addButton}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <line x1="12" y1="5" x2="12" y2="19"></line>
                                  <line x1="5" y1="12" x2="19" y2="12"></line>
                                </svg>
                                Ajouter une méthode
                              </button>
                            </div>
                            
                            <table className={styles.settingsTable}>
                              <thead>
                                <tr>
                                  <th>Nom</th>
                                  <th>Frais (%)</th>
                                  <th>Statut</th>
                                  <th>Actions</th>
                                </tr>
                              </thead>
                              <tbody>
                                {settings.payment.paymentMethods.map((method, index) => (
                                  <tr key={method.id}>
                                    <td>
                                      <input 
                                        type="text" 
                                        value={method.name} 
                                        onChange={(e) => updatePaymentMethod(index, 'name', e.target.value)} 
                                      />
                                    </td>
                                    <td>
                                      <input 
                                        type="number" 
                                        value={method.fees} 
                                        onChange={(e) => updatePaymentMethod(index, 'fees', parseFloat(e.target.value))} 
                                        min="0"
                                        step="0.01"
                                      />
                                    </td>
                                    <td>
                                      <div className={styles.toggleSwitch}>
                                        <input 
                                          type="checkbox" 
                                          id={`payment-${method.id}`} 
                                          checked={method.isActive} 
                                          onChange={(e) => updatePaymentMethod(index, 'isActive', e.target.checked)} 
                                        />
                                        <label htmlFor={`payment-${method.id}`}></label>
                                      </div>
                                    </td>
                                    <td>
                                      <button className={styles.deleteButton}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                          <polyline points="3 6 5 6 21 6"></polyline>
                                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                        </svg>
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                          
                          <div className={styles.settingsSection}>
                            <h3>Stripe</h3>
                            
                            <div className={styles.formGroup}>
                              <div className={styles.checkboxControl}>
                                <input 
                                  type="checkbox" 
                                  id="stripeEnabled" 
                                  checked={settings.payment.stripeEnabled} 
                                  onChange={(e) => updateSetting('payment', 'stripeEnabled', e.target.checked)} 
                                />
                                <label htmlFor="stripeEnabled">Activer Stripe</label>
                              </div>
                            </div>
                            
                            {settings.payment.stripeEnabled && (
                              <div className={styles.formGroup}>
                                <label htmlFor="stripePublicKey">Clé publique Stripe</label>
                                <input 
                                  type="text" 
                                  id="stripePublicKey" 
                                  value={settings.payment.stripePublicKey} 
                                  onChange={(e) => updateSetting('payment', 'stripePublicKey', e.target.value)} 
                                />
                              </div>
                            )}
                          </div>
                          
                          <div className={styles.settingsSection}>
                            <h3>PayPal</h3>
                            
                            <div className={styles.formGroup}>
                              <div className={styles.checkboxControl}>
                                <input 
                                  type="checkbox" 
                                  id="paypalEnabled" 
                                  checked={settings.payment.paypalEnabled} 
                                  onChange={(e) => updateSetting('payment', 'paypalEnabled', e.target.checked)} 
                                />
                                <label htmlFor="paypalEnabled">Activer PayPal</label>
                              </div>
                            </div>
                            
                            {settings.payment.paypalEnabled && (
                              <div className={styles.formGroup}>
                                <label htmlFor="paypalClientId">Client ID PayPal</label>
                                <input 
                                  type="text" 
                                  id="paypalClientId" 
                                  value={settings.payment.paypalClientId} 
                                  onChange={(e) => updateSetting('payment', 'paypalClientId', e.target.value)} 
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Onglet Emails */}
                    {activeTab === 'emails' && (
                      <div className={styles.settingsPanelContent}>
                        <h2>Paramètres des emails</h2>
                        <p className={styles.settingsPanelDescription}>
                          Configuration des modèles d'emails et des notifications
                        </p>
                        
                        <div className={styles.settingsForm}>
                          <div className={styles.formRow}>
                            <div className={styles.formGroup}>
                              <label htmlFor="senderName">Nom de l'expéditeur</label>
                              <input 
                                type="text" 
                                id="senderName" 
                                value={settings.emails.senderName} 
                                onChange={(e) => updateSetting('emails', 'senderName', e.target.value)} 
                              />
                            </div>
                            
                            <div className={styles.formGroup}>
                              <label htmlFor="senderEmail">Email de l'expéditeur</label>
                              <input 
                                type="email" 
                                id="senderEmail" 
                                value={settings.emails.senderEmail} 
                                onChange={(e) => updateSetting('emails', 'senderEmail', e.target.value)} 
                              />
                            </div>
                          </div>
                          
                          <div className={styles.formGroup}>
                            <label htmlFor="orderConfirmationTemplate">Confirmation de commande</label>
                            <textarea 
                              id="orderConfirmationTemplate" 
                              value={settings.emails.orderConfirmationTemplate} 
                              onChange={(e) => updateSetting('emails', 'orderConfirmationTemplate', e.target.value)} 
                              rows="4"
                            ></textarea>
                            <span className={styles.fieldHelp}>Variables disponibles: {order_number}, {customer_name}, {order_date}, {order_total}</span>
                          </div>
                          
                          <div className={styles.formGroup}>
                            <label htmlFor="shippingConfirmationTemplate">Confirmation d'expédition</label>
                            <textarea 
                              id="shippingConfirmationTemplate" 
                              value={settings.emails.shippingConfirmationTemplate} 
                              onChange={(e) => updateSetting('emails', 'shippingConfirmationTemplate', e.target.value)} 
                              rows="4"
                            ></textarea>
                            <span className={styles.fieldHelp}>Variables disponibles: {order_number}, {customer_name}, {shipping_date}, {tracking_number}</span>
                          </div>
                          
                          <div className={styles.formGroup}>
                            <label htmlFor="welcomeEmailTemplate">Email de bienvenue</label>
                            <textarea 
                              id="welcomeEmailTemplate" 
                              value={settings.emails.welcomeEmailTemplate} 
                              onChange={(e) => updateSetting('emails', 'welcomeEmailTemplate', e.target.value)} 
                              rows="4"
                            ></textarea>
                            <span className={styles.fieldHelp}>Variables disponibles: {customer_name}, {registration_date}</span>
                          </div>
                          
                          <div className={styles.formGroup}>
                            <label htmlFor="abandonedCartTemplate">Panier abandonné</label>
                            <textarea 
                              id="abandonedCartTemplate" 
                              value={settings.emails.abandonedCartTemplate} 
                              onChange={(e) => updateSetting('emails', 'abandonedCartTemplate', e.target.value)} 
                              rows="4"
                            ></textarea>
                            <span className={styles.fieldHelp}>Variables disponibles: {customer_name}, {cart_total}, {cart_items_count}</span>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Onglet SEO */}
                    {activeTab === 'seo' && (
                      <div className={styles.settingsPanelContent}>
                        <h2>Paramètres SEO</h2>
                        <p className={styles.settingsPanelDescription}>
                          Configuration des métadonnées et des outils d'optimisation pour les moteurs de recherche
                        </p>
                        
                        <div className={styles.settingsForm}>
                          <div className={styles.formGroup}>
                            <label htmlFor="metaTitle">Titre de la page d'accueil</label>
                            <input 
                              type="text" 
                              id="metaTitle" 
                              value={settings.seo.metaTitle} 
                              onChange={(e) => updateSetting('seo', 'metaTitle', e.target.value)} 
                            />
                          </div>
                          
                          <div className={styles.formGroup}>
                            <label htmlFor="metaDescription">Description de la page d'accueil</label>
                            <textarea 
                              id="metaDescription" 
                              value={settings.seo.metaDescription} 
                              onChange={(e) => updateSetting('seo', 'metaDescription', e.target.value)} 
                              rows="3"
                            ></textarea>
                            <span className={styles.fieldHelp}>Recommandé: 150-160 caractères maximum</span>
                          </div>
                          
                          <div className={styles.formGroupFile}>
                            <label>Image Open Graph (pour les réseaux sociaux)</label>
                            <div className={styles.filePreview}>
                              <img src={settings.seo.ogImage} alt="Open Graph" />
                            </div>
                            <div className={styles.fileActions}>
                              <button className={styles.fileUploadButton}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                  <polyline points="17 8 12 3 7 8"></polyline>
                                  <line x1="12" y1="3" x2="12" y2="15"></line>
                                </svg>
                                Choisir un fichier
                              </button>
                            </div>
                            <span className={styles.fieldHelp}>Dimension recommandée: 1200 x 630 pixels</span>
                          </div>
                          
                          <div className={styles.formGroup}>
                            <label htmlFor="googleAnalyticsId">ID Google Analytics</label>
                            <input 
                              type="text" 
                              id="googleAnalyticsId" 
                              value={settings.seo.googleAnalyticsId} 
                              onChange={(e) => updateSetting('seo', 'googleAnalyticsId', e.target.value)} 
                            />
                          </div>
                          
                          <div className={styles.formGroup}>
                            <div className={styles.checkboxControl}>
                              <input 
                                type="checkbox" 
                                id="enableSitemap" 
                                checked={settings.seo.enableSitemap} 
                                onChange={(e) => updateSetting('seo', 'enableSitemap', e.target.checked)} 
                              />
                              <label htmlFor="enableSitemap">Générer automatiquement le sitemap.xml</label>
                            </div>
                          </div>
                          
                          <div className={styles.formGroup}>
                            <label htmlFor="robotsTxt">Fichier robots.txt</label>
                            <textarea 
                              id="robotsTxt" 
                              value={settings.seo.robotsTxt} 
                              onChange={(e) => updateSetting('seo', 'robotsTxt', e.target.value)} 
                              rows="5"
                              className={styles.codeInput}
                            ></textarea>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Onglet Réseaux sociaux */}
                    {activeTab === 'social' && (
                      <div className={styles.settingsPanelContent}>
                        <h2>Paramètres des réseaux sociaux</h2>
                        <p className={styles.settingsPanelDescription}>
                          Configuration des liens vers vos profils sur les réseaux sociaux
                        </p>
                        
                        <div className={styles.settingsForm}>
                          <div className={styles.formGroup}>
                            <label htmlFor="facebook">
                              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3b5998" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                              </svg>
                              Facebook
                            </label>
                            <input 
                              type="url" 
                              id="facebook" 
                              value={settings.social.facebook} 
                              onChange={(e) => updateSetting('social', 'facebook', e.target.value)} 
                              placeholder="https://facebook.com/votre-page"
                            />
                          </div>
                          
                          <div className={styles.formGroup}>
                            <label htmlFor="instagram">
                              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#e1306c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                              </svg>
                              Instagram
                            </label>
                            <input 
                              type="url" 
                              id="instagram" 
                              value={settings.social.instagram} 
                              onChange={(e) => updateSetting('social', 'instagram', e.target.value)} 
                              placeholder="https://instagram.com/votre-compte"
                            />
                          </div>
                          
                          <div className={styles.formGroup}>
                            <label htmlFor="pinterest">
                              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#bd081c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M8 12a4 4 0 1 1 8 0 4 4 0 0 1-8 0zm2-6h4"></path>
                                <path d="M9 18l3-3 3 3"></path>
                                <path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"></path>
                              </svg>
                              Pinterest
                            </label>
                            <input 
                              type="url" 
                              id="pinterest" 
                              value={settings.social.pinterest} 
                              onChange={(e) => updateSetting('social', 'pinterest', e.target.value)} 
                              placeholder="https://pinterest.com/votre-compte"
                            />
                          </div>
                          
                          <div className={styles.formGroup}>
                            <label htmlFor="twitter">
                              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1da1f2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path>
                              </svg>
                              Twitter
                            </label>
                            <input 
                              type="url" 
                              id="twitter" 
                              value={settings.social.twitter} 
                              onChange={(e) => updateSetting('social', 'twitter', e.target.value)} 
                              placeholder="https://twitter.com/votre-compte"
                            />
                          </div>
                          
                          <div className={styles.formGroup}>
                            <label htmlFor="youtube">
                              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ff0000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path>
                                <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon>
                              </svg>
                              YouTube
                            </label>
                            <input 
                              type="url" 
                              id="youtube" 
                              value={settings.social.youtube} 
                              onChange={(e) => updateSetting('social', 'youtube', e.target.value)} 
                              placeholder="https://youtube.com/votre-chaîne"
                            />
                          </div>
                          
                          <div className={styles.formGroup}>
                            <label htmlFor="linkedin">
                              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0077b5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                                <rect x="2" y="9" width="4" height="12"></rect>
                                <circle cx="4" cy="4" r="2"></circle>
                              </svg>
                              LinkedIn
                            </label>
                            <input 
                              type="url" 
                              id="linkedin" 
                              value={settings.social.linkedin} 
                              onChange={(e) => updateSetting('social', 'linkedin', e.target.value)} 
                              placeholder="https://linkedin.com/company/votre-entreprise"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Onglet Mentions légales */}
                    {activeTab === 'legal' && (
                      <div className={styles.settingsPanelContent}>
                        <h2>Mentions légales</h2>
                        <p className={styles.settingsPanelDescription}>
                          Configuration des textes légaux et des mentions obligatoires
                        </p>
                        
                        <div className={styles.settingsForm}>
                          <div className={styles.formGroup}>
                            <label htmlFor="termsOfService">Conditions générales de vente</label>
                            <textarea 
                              id="termsOfService" 
                              value={settings.legal.termsOfService} 
                              onChange={(e) => updateSetting('legal', 'termsOfService', e.target.value)} 
                              rows="8"
                            ></textarea>
                          </div>
                          
                          <div className={styles.formGroup}>
                            <label htmlFor="privacyPolicy">Politique de confidentialité</label>
                            <textarea 
                              id="privacyPolicy" 
                              value={settings.legal.privacyPolicy} 
                              onChange={(e) => updateSetting('legal', 'privacyPolicy', e.target.value)} 
                              rows="8"
                            ></textarea>
                          </div>
                          
                          <div className={styles.formGroup}>
                            <label htmlFor="refundPolicy">Politique de remboursement</label>
                            <textarea 
                              id="refundPolicy" 
                              value={settings.legal.refundPolicy} 
                              onChange={(e) => updateSetting('legal', 'refundPolicy', e.target.value)} 
                              rows="6"
                            ></textarea>
                          </div>
                          
                          <div className={styles.formGroup}>
                            <label htmlFor="cookiePolicy">Politique de cookies</label>
                            <textarea 
                              id="cookiePolicy" 
                              value={settings.legal.cookiePolicy} 
                              onChange={(e) => updateSetting('legal', 'cookiePolicy', e.target.value)} 
                              rows="6"
                            ></textarea>
                          </div>
                          
                          <div className={styles.formGroup}>
                            <label htmlFor="lastUpdated">Date de dernière mise à jour</label>
                            <input 
                              type="date" 
                              id="lastUpdated" 
                              value={settings.legal.lastUpdated} 
                              onChange={(e) => updateSetting('legal', 'lastUpdated', e.target.value)} 
                            />
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Onglet Avancé */}
                    {activeTab === 'advanced' && (
                      <div className={styles.settingsPanelContent}>
                        <h2>Paramètres avancés</h2>
                        <p className={styles.settingsPanelDescription}>
                          Configuration des options avancées et techniques
                        </p>
                        
                        <div className={styles.settingsForm}>
                          <div className={styles.settingsSection}>
                            <h3>Maintenance</h3>
                            
                            <div className={styles.formGroup}>
                              <div className={styles.checkboxControl}>
                                <input 
                                  type="checkbox" 
                                  id="maintenanceMode" 
                                  checked={settings.advanced.maintenanceMode} 
                                  onChange={(e) => updateSetting('advanced', 'maintenanceMode', e.target.checked)} 
                                />
                                <label htmlFor="maintenanceMode">Activer le mode maintenance</label>
                              </div>
                            </div>
                            
                            {settings.advanced.maintenanceMode && (
                              <div className={styles.formGroup}>
                                <label htmlFor="maintenanceMessage">Message de maintenance</label>
                                <textarea 
                                  id="maintenanceMessage" 
                                  value={settings.advanced.maintenanceMessage} 
                                  onChange={(e) => updateSetting('advanced', 'maintenanceMessage', e.target.value)} 
                                  rows="3"
                                ></textarea>
                              </div>
                            )}
                          </div>
                          
                          <div className={styles.settingsSection}>
                            <h3>Développement</h3>
                            
                            <div className={styles.formGroup}>
                              <div className={styles.checkboxControl}>
                                <input 
                                  type="checkbox" 
                                  id="debugMode" 
                                  checked={settings.advanced.debugMode} 
                                  onChange={(e) => updateSetting('advanced', 'debugMode', e.target.checked)} 
                                />
                                <label htmlFor="debugMode">Activer le mode debug</label>
                              </div>
                            </div>
                            
                            <div className={styles.formGroup}>
                              <div className={styles.checkboxControl}>
                                <input 
                                  type="checkbox" 
                                  id="cacheEnabled" 
                                  checked={settings.advanced.cacheEnabled} 
                                  onChange={(e) => updateSetting('advanced', 'cacheEnabled', e.target.checked)} 
                                />
                                <label htmlFor="cacheEnabled">Activer le cache</label>
                              </div>
                            </div>
                            
                            <div className={styles.formGroup}>
                              <label htmlFor="apiKey">Clé API</label>
                              <div className={styles.inputWithButton}>
                                <input 
                                  type="text" 
                                  id="apiKey" 
                                  value={settings.advanced.apiKey} 
                                  onChange={(e) => updateSetting('advanced', 'apiKey', e.target.value)} 
                                />
                                <button className={styles.regenerateButton}>
                                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M23 4v6h-6"></path>
                                    <path d="M1 20v-6h6"></path>
                                    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10"></path>
                                    <path d="M20.49 15a9 9 0 0 1-14.85 3.36L1 14"></path>
                                  </svg>
                                  Régénérer
                                </button>
                              </div>
                            </div>
                          </div>
                          
                          <div className={styles.formGroup}>
                            <label htmlFor="customCss">CSS personnalisé</label>
                            <textarea 
                              id="customCss" 
                              value={settings.advanced.customCss} 
                              onChange={(e) => updateSetting('advanced', 'customCss', e.target.value)} 
                              rows="8"
                              className={styles.codeInput}
                            ></textarea>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </section>
        </main>

        {/* Footer simplifié pour l'admin */}
        <footer className={styles.adminFooter}>
          <div className={styles.footerContent}>
            <p className={styles.copyright}>© 2025 MonSavonVert. Panneau d'administration.</p>
            <div className={styles.footerLinks}>
              <Link href="/admin/help" legacyBehavior><a>Aide</a></Link>
              <Link href="/admin/documentation" legacyBehavior><a>Documentation</a></Link>
              <button onClick={() => {
                localStorage.removeItem('userEmail');
                localStorage.removeItem('token');
                localStorage.removeItem('userRole');
                console.log('Déconnexion réussie');
                router.push('/login');
              }}>
                Se déconnecter
              </button>
            </div>
          </div>
        </footer>
      </div>

      {/* Toast de succès */}
      {showSuccessToast && (
        <div className={styles.toast}>
          <div className={styles.toastContent}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4caf50" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      <style jsx>{`
        .settingsSection {
          flex: 1;
          padding: var(--spacing-xl) 0;
        }
        
        .settingsContainer {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 var(--spacing-xl);
        }
        
        .settingsContent {
          display: flex;
          gap: 30px;
          min-height: 600px;
        }
        
        .settingsTabs {
          width: 220px;
          display: flex;
          flex-direction: column;
          gap: 5px;
          padding-top: 20px;
        }
        
        .settingsTab {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 15px;
          border-radius: 8px;
          background: none;
          border: none;
          text-align: left;
          color: var(--color-text);
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .settingsTab:hover {
          background-color: rgba(0, 0, 0, 0.05);
          color: var(--color-primary);
        }
        
        .activeSettingsTab {
          background-color: rgba(76, 175, 80, 0.1);
          color: var(--color-primary);
          font-weight: 600;
        }
        
        .settingsPanel {
          flex: 1;
          background-color: white;
          border-radius: 12px;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
          min-height: 100%;
        }
        
        .settingsPanelContent {
          padding: 30px;
        }
        
        .settingsPanelContent h2 {
          font-size: 20px;
          font-weight: 600;
          color: var(--color-text);
          margin: 0 0 5px;
        }
        
        .settingsPanelDescription {
          color: var(--color-text-light);
          margin-bottom: 30px;
        }
        
        .settingsForm {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        
        .formGroup {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        
        .formGroup label {
          font-weight: 500;
          color: var(--color-text);
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .formGroup input[type="text"],
        .formGroup input[type="email"],
        .formGroup input[type="tel"],
        .formGroup input[type="url"],
        .formGroup input[type="number"],
        .formGroup input[type="date"],
        .formGroup select,
        .formGroup textarea {
          padding: 10px 12px;
          border: 1px solid var(--color-border);
          border-radius: 6px;
          font-size: 14px;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }
        
        .formGroup input:focus,
        .formGroup select:focus,
        .formGroup textarea:focus {
          outline: none;
          border-color: var(--color-primary);
          box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.1);
        }
        
        .formRow {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }
        
        .checkboxControl {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        
        .checkboxControl input[type="checkbox"] {
          width: 18px;
          height: 18px;
        }
        
        .fieldHelp {
          font-size: 12px;
          color: var(--color-text-light);
          margin-top: 4px;
        }
        
        .filePreview {
          width: 120px;
          height: 80px;
          border-radius: 6px;
          overflow: hidden;
          border: 1px solid var(--color-border);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 10px;
        }
        
        .filePreview img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .faviconPreview {
          width: 32px !important;
          height: 32px !important;
          object-fit: contain !important;
        }
        
        .fileUploadButton {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          border: 1px solid var(--color-border);
          border-radius: 6px;
          background-color: white;
          color: var(--color-text);
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .fileUploadButton:hover {
          border-color: var(--color-primary);
          color: var(--color-primary);
        }
        
        .settingsSection {
          background-color: #f9fbf7;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 20px;
        }
        
        .settingsSection h3 {
          font-size: 16px;
          font-weight: 600;
          margin: 0 0 15px;
          color: var(--color-text);
        }
        
        .tableSection {
          margin-bottom: 30px;
        }
        
        .tableSectionHeader {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
        }
        
        .tableSectionHeader h3 {
          font-size: 16px;
          font-weight: 600;
          margin: 0;
          color: var(--color-text);
        }
        
        .addButton {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          background-color: var(--color-primary);
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s ease;
        }
        
        .addButton:hover {
          background-color: var(--color-primary-dark);
        }
        
        .settingsTable {
          width: 100%;
          border-collapse: collapse;
          font-size: 14px;
        }
        
        .settingsTable th {
          text-align: left;
          padding: 12px;
          border-bottom: 1px solid var(--color-border);
          color: var(--color-text-light);
          font-weight: 600;
        }
        
        .settingsTable td {
          padding: 12px;
          border-bottom: 1px solid var(--color-border);
        }
        
        .settingsTable input[type="text"],
        .settingsTable input[type="number"] {
          width: 100%;
          padding: 8px;
          border: 1px solid var(--color-border);
          border-radius: 4px;
        }
        
        .settingsTable input[type="radio"],
        .settingsTable input[type="checkbox"] {
          margin: 0;
        }
        
        .deleteButton {
          background: none;
          border: none;
          color: var(--color-error);
          cursor: pointer;
          padding: 6px;
          border-radius: 4px;
          transition: background-color 0.2s ease;
        }
        
        .deleteButton:hover {
          background-color: rgba(244, 67, 54, 0.1);
        }
        
        .toggleSwitch {
          position: relative;
          display: inline-block;
          width: 40px;
          height: 22px;
        }
        
        .toggleSwitch input {
          opacity: 0;
          width: 0;
          height: 0;
        }
        
        .toggleSwitch label {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: #ccc;
          border-radius: 34px;
          transition: .4s;
        }
        
        .toggleSwitch label:before {
          position: absolute;
          content: "";
          height: 18px;
          width: 18px;
          left: 2px;
          bottom: 2px;
          background-color: white;
          border-radius: 50%;
          transition: .4s;
        }
        
        .toggleSwitch input:checked + label {
          background-color: var(--color-primary);
        }
        
        .toggleSwitch input:checked + label:before {
          transform: translateX(18px);
        }
        
        .codeInput {
          font-family: var(--font-mono);
          font-size: 13px;
        }
        
        .inputWithButton {
          display: flex;
          gap: 10px;
        }
        
        .inputWithButton input {
          flex: 1;
        }
        
        .regenerateButton {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 0 12px;
          background-color: var(--color-text);
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 14px;
          cursor: pointer;
          transition: background-color 0.2s ease;
        }
        
        .regenerateButton:hover {
          background-color: black;
        }
        
        .saveButton {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          background-color: var(--color-primary);
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .saveButton:hover {
          background-color: var(--color-primary-dark);
          transform: translateY(-2px);
        }
        
        .toast {
          position: fixed;
          bottom: 30px;
          right: 30px;
          padding: 16px 20px;
          background-color: #4caf50;
          color: white;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          z-index: 1000;
          animation: slideInUp 0.3s ease-out forwards;
        }
        
        .toastContent {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        
        @keyframes slideInUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        
        @media (max-width: 1024px) {
          .settingsContent {
            flex-direction: column;
          }
          
          .settingsTabs {
            width: 100%;
            flex-direction: row;
            overflow-x: auto;
            padding: 0 0 10px;
          }
          
          .settingsTab {
            white-space: nowrap;
          }
          
          .formRow {
            grid-template-columns: 1fr;
          }
        }
        
        @media (max-width: 768px) {
          .settingsPanelContent {
            padding: 20px;
          }
          
          .settingsTable {
            overflow-x: auto;
            display: block;
          }
        }
      `}</style>
    </>
  );
}