'use client';

import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import styles from '../styles/profile.module.css';

export default function Profile() {
  // États
  const [isClient, setIsClient] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [cartCount, setCartCount] = useState(0);
  const [activeTab, setActiveTab] = useState('dashboard');
  const router = useRouter();
  
  // Données simulées
  const [userData, setUserData] = useState(null);
  const [userOrders, setUserOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [wishlist, setWishlist] = useState([]);

  // États pour les mots de passe
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // États pour contrôler la visibilité des mots de passe
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // État pour les critères de validation du mot de passe
  const [criteria, setCriteria] = useState({
    minLength: false,     // 6 caractères minimum
    hasUpperCase: false,  // 1 majuscule
    hasNumber: false,     // 1 chiffre
    hasSpecialChar: false // 1 caractère spécial
  });

  // États pour le modal de messages
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalType, setModalType] = useState('error'); // 'error' ou 'success'

  // États pour le modal d'adresse
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [addressMode, setAddressMode] = useState('add'); // 'add' ou 'edit'
  const [currentAddressIndex, setCurrentAddressIndex] = useState(-1);
  const [currentAddress, setCurrentAddress] = useState({
    street: '',
    postalCode: '',
    city: '',
    country: 'France',
    isDefault: false
  });

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

  // Fonction pour afficher le modal avec un message
  const showMessageModal = (message, type = 'error') => {
    setModalMessage(message);
    setModalType(type);
    setShowModal(true);
  };

  // Fonction pour ouvrir le modal d'adresse en mode ajout
  const handleAddAddress = () => {
    setCurrentAddress({
      street: '',
      postalCode: '',
      city: '',
      country: 'France',
      isDefault: addresses.length === 0 // Première adresse par défaut
    });
    setAddressMode('add');
    setCurrentAddressIndex(-1);
    setShowAddressModal(true);
  };

  // Fonction pour ouvrir le modal d'adresse en mode édition
  const handleEditAddress = (index) => {
    setCurrentAddress({ ...addresses[index] });
    setAddressMode('edit');
    setCurrentAddressIndex(index);
    setShowAddressModal(true);
  };

  // Fonction pour sauvegarder une adresse (ajout ou modification)
  const handleSaveAddress = () => {
    // Validation des champs
    if (!currentAddress.street || !currentAddress.postalCode || !currentAddress.city) {
      showMessageModal('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    let updatedAddresses = [...addresses];
    
    if (addressMode === 'add') {
      // Ajout d'une nouvelle adresse
      updatedAddresses.push(currentAddress);
    } else {
      // Modification d'une adresse existante
      updatedAddresses[currentAddressIndex] = currentAddress;
    }

    // Si l'adresse actuelle est définie comme par défaut, mettre les autres à false
    if (currentAddress.isDefault) {
      updatedAddresses = updatedAddresses.map((addr, i) => {
        if (addressMode === 'add' && i !== updatedAddresses.length - 1) {
          return { ...addr, isDefault: false };
        } else if (addressMode === 'edit' && i !== currentAddressIndex) {
          return { ...addr, isDefault: false };
        }
        return addr;
      });
    }

    // Mise à jour des adresses
    setAddresses(updatedAddresses);
    
    // Mise à jour des données utilisateur via l'API
    handleUpdateUser({ addresses: updatedAddresses });
    
    // Fermeture du modal
    setShowAddressModal(false);
  };

  // Vérification de la connexion et chargement des données
  useEffect(() => {
    if (!isClient) return;

    const fetchUserData = async () => {
      try {
        const userId = localStorage.getItem('userId');
        console.log('🔍 [Frontend] userId récupéré depuis localStorage:', userId);

        if (!userId) {
          console.error('❌ [Frontend] Aucun userId trouvé, redirection vers login.');
          router.push('/login');
          return;
        }

        // Requête pour récupérer les données utilisateur
        const response = await fetch(`http://localhost:8888/users/${userId}`);
        const data = await response.json();

        if (data.result) {
          console.log('✅ [Frontend] Données utilisateur récupérées:', data.user);
          setUserData(data.user); // Met à jour les données utilisateur
          setAddresses(data.user.addresses || []); // Met à jour les adresses
        } else {
          console.error('❌ [Frontend] Erreur lors de la récupération des données utilisateur:', data.error);
          showMessageModal(`Erreur: ${data.error}`);
        }
      } catch (error) {
        console.error('❌ [Frontend] Erreur lors de la récupération des données utilisateur:', error);
        showMessageModal('Erreur de connexion au serveur. Veuillez réessayer plus tard.');
      }
    };

    fetchUserData();
  }, [isClient, router]);

  // Effet pour valider le mot de passe à chaque changement
  useEffect(() => {
    console.log('Validation du mot de passe en cours...');
    
    setCriteria({
      minLength: newPassword.length >= 6,
      hasUpperCase: /[A-Z]/.test(newPassword),
      hasNumber: /[0-9]/.test(newPassword),
      hasSpecialChar: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>\/?]+/.test(newPassword)
    });
    
    console.log('Critères validés:', {
      minLength: newPassword.length >= 6,
      hasUpperCase: /[A-Z]/.test(newPassword),
      hasNumber: /[0-9]/.test(newPassword),
      hasSpecialChar: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>\/?]+/.test(newPassword)
    });
  }, [newPassword]);

  const handleUpdateUser = async (updatedFields) => {
    try {
      const userId = localStorage.getItem('userId');
      console.log('🔍 [Frontend] userId récupéré depuis localStorage:', userId);

      if (!userId) {
        console.error('❌ [Frontend] Erreur : ID utilisateur introuvable.');
        showMessageModal('Erreur : ID utilisateur introuvable.');
        return;
      }

      console.log('📤 [Frontend] Envoi de la requête PUT à /users/update/:id avec userId:', userId);
      const response = await fetch(`http://localhost:8888/users/update/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedFields),
      });

      const data = await response.json();
      console.log('📥 [Frontend] Réponse reçue du backend:', data);

      if (data.result) {
        console.log('✅ [Frontend] Mise à jour réussie des données utilisateur.');
        setUserData(data.user); // Met à jour les données localement
        showMessageModal('Vos informations ont été mises à jour avec succès.', 'success');
      } else {
        console.error('❌ [Frontend] Erreur lors de la mise à jour des données utilisateur:', data.error);
        showMessageModal(`Erreur : ${data.error}`);
      }
    } catch (error) {
      console.error('❌ [Frontend] Erreur lors de la mise à jour des informations utilisateur:', error);
      showMessageModal('Une erreur est survenue lors de la mise à jour.');
    }
  };
  
  // Fonction pour formater une date
  const formatDate = (dateString) => {
    return dateString; // Déjà formaté dans notre exemple
  };
  
  // Fonction pour se déconnecter
  const handleLogout = () => {
    localStorage.removeItem('userEmail');
    router.push('/login');
  };
  
  // Fonction pour obtenir la classe du statut
  const getStatusClass = (status) => {
    const statusClasses = {
      'pending': styles.statusPending,
      'processing': styles.statusProcessing,
      'shipped': styles.statusShipped,
      'delivered': styles.statusDelivered,
      'cancelled': styles.statusCancelled
    };
    
    return statusClasses[status] || '';
  };

  const handleChangePassword = async () => {
    const userId = localStorage.getItem('userId');
    
    // Vérifier que tous les champs sont remplis
    if (!currentPassword || !newPassword || !confirmPassword) {
      showMessageModal('Veuillez remplir tous les champs.');
      return;
    }
    
    // Vérifier que les mots de passe correspondent
    if (newPassword !== confirmPassword) {
      showMessageModal('Le nouveau mot de passe et la confirmation ne correspondent pas.');
      return;
    }
    
    // Vérifier que tous les critères sont remplis
    const allCriteriaMet = Object.values(criteria).every(c => c === true);
    if (!allCriteriaMet) {
      showMessageModal('Votre mot de passe ne respecte pas tous les critères de sécurité.');
      return;
    }
  
    try {
      console.log('📤 [Frontend] Envoi de la requête PUT à /users/change-password/:id');
      const response = await fetch(`http://localhost:8888/users/change-password/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
  
      const data = await response.json();
      console.log('📥 [Frontend] Réponse reçue du backend:', data);
  
      if (data.result) {
        showMessageModal('Mot de passe mis à jour avec succès.', 'success');
        // Réinitialiser les champs après succès
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        showMessageModal(`Erreur : ${data.error}`);
      }
    } catch (error) {
      console.error('❌ [Frontend] Erreur lors de la mise à jour du mot de passe:', error);
      showMessageModal('Une erreur est survenue lors de la mise à jour.');
    }
  };

  // Rendu de base sans contenu dynamique (pour éviter les erreurs d'hydratation)
  if (!isClient || !userData) {
    return (
      <>
        <Head>
          <title>Mon Profil | MonSavonVert</title>
          <meta name="description" content="Gérez votre compte et suivez vos commandes - MonSavonVert" />
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
        <title>Mon Profil | MonSavonVert</title>
        <meta name="description" content="Gérez votre compte et suivez vos commandes - MonSavonVert" />
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      {/* Modal pour les messages */}
      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={`${styles.modal} ${modalType === 'success' ? styles.successModal : styles.errorModal}`}>
            <div className={styles.modalContent}>
              <div className={styles.modalIcon}>
                {modalType === 'success' ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                  </svg>
                )}
              </div>
              <h3 className={styles.modalTitle}>{modalType === 'success' ? 'Succès' : 'Attention'}</h3>
              <p className={styles.modalMessage}>{modalMessage}</p>
              <button 
                className={styles.modalButton} 
                onClick={() => setShowModal(false)}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal pour l'ajout/modification d'adresse */}
      {showAddressModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalContent}>
              <h3 className={styles.modalTitle}>
                {addressMode === 'add' ? 'Ajouter une adresse' : 'Modifier l\'adresse'}
              </h3>
              
              <div className={styles.addressForm}>
                <div className={styles.formGroup}>
                  <label htmlFor="street">Adresse*</label>
                  <input
                    type="text"
                    id="street"
                    value={currentAddress.street}
                    onChange={(e) => setCurrentAddress({...currentAddress, street: e.target.value})}
                    placeholder="Ex: 15 rue des Artisans"
                    required
                  />
                </div>
                
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label htmlFor="postalCode">Code postal*</label>
                    <input
                      type="text"
                      id="postalCode"
                      value={currentAddress.postalCode}
                      onChange={(e) => setCurrentAddress({...currentAddress, postalCode: e.target.value})}
                      placeholder="Ex: 69001"
                      required
                    />
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label htmlFor="city">Ville*</label>
                    <input
                      type="text"
                      id="city"
                      value={currentAddress.city}
                      onChange={(e) => setCurrentAddress({...currentAddress, city: e.target.value})}
                      placeholder="Ex: Lyon"
                      required
                    />
                  </div>
                </div>
                
                <div className={styles.formGroup}>
                  <label htmlFor="country">Pays</label>
                  <input
                    type="text"
                    id="country"
                    value={currentAddress.country}
                    onChange={(e) => setCurrentAddress({...currentAddress, country: e.target.value})}
                    placeholder="Ex: France"
                  />
                </div>
                
                <div className={styles.formCheckbox}>
                  <input
                    type="checkbox"
                    id="isDefault"
                    checked={currentAddress.isDefault}
                    onChange={(e) => setCurrentAddress({...currentAddress, isDefault: e.target.checked})}
                  />
                  <label htmlFor="isDefault">Définir comme adresse par défaut</label>
                </div>
                
                <div className={styles.modalActions}>
                  <button 
                    className={styles.modalCancelButton}
                    onClick={() => setShowAddressModal(false)}
                  >
                    Annuler
                  </button>
                  
                  <button 
                    className={styles.modalButton}
                    onClick={handleSaveAddress}
                  >
                    {addressMode === 'add' ? 'Ajouter' : 'Enregistrer'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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
              <Link href="/profile" legacyBehavior>
                <a className={`${styles.userAccount} ${styles.active}`} aria-label="Mon compte">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </a>
              </Link>
              <Link href="/panier" legacyBehavior>
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
              <h1 className={styles.pageTitle}>Mon Compte</h1>
              <div className={styles.pageBreadcrumb}>
                <Link href="/" legacyBehavior><a>Accueil</a></Link>
                <span className={styles.breadcrumbSeparator}>/</span>
                <span className={styles.breadcrumbCurrent}>Mon Compte</span>
              </div>
            </div>
          </section>

          {/* Section du profil */}
          <section className={styles.profileSection}>
            <div className={styles.profileContainer}>
              {/* Navigation du profil */}
              <div className={styles.profileSidebar}>
                <div className={styles.userInfo}>
                  <div className={styles.userAvatar}>
                    <span>{userData.firstName.charAt(0)}{userData.lastName.charAt(0)}</span>
                  </div>
                  <div className={styles.userName}>
                    <h2>{userData.firstName} {userData.lastName}</h2>
                    <p>{userData.email}</p>
                  </div>
                </div>
                
                <nav className={styles.profileNav}>
                  <ul>
                    <li>
                      <button 
                        className={`${styles.profileNavLink} ${activeTab === 'dashboard' ? styles.active : ''}`}
                        onClick={() => setActiveTab('dashboard')}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="3" width="7" height="7"></rect>
                          <rect x="14" y="3" width="7" height="7"></rect>
                          <rect x="14" y="14" width="7" height="7"></rect>
                          <rect x="3" y="14" width="7" height="7"></rect>
                        </svg>
                        <span>Tableau de bord</span>
                      </button>
                    </li>
                    <li>
                      <button 
                        className={`${styles.profileNavLink} ${activeTab === 'orders' ? styles.active : ''}`}
                        onClick={() => setActiveTab('orders')}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                          <line x1="3" y1="6" x2="21" y2="6"></line>
                          <path d="M16 10a4 4 0 0 1-8 0"></path>
                        </svg>
                        <span>Mes commandes</span>
                      </button>
                    </li>
                    <li>
                      <button 
                        className={`${styles.profileNavLink} ${activeTab === 'wishlist' ? styles.active : ''}`}
                        onClick={() => setActiveTab('wishlist')}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                        </svg>
                        <span>Ma liste d'envies</span>
                      </button>
                    </li>
                    <li>
                      <button 
                        className={`${styles.profileNavLink} ${activeTab === 'addresses' ? styles.active : ''}`}
                        onClick={() => setActiveTab('addresses')}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                          <circle cx="12" cy="10" r="3"></circle>
                        </svg>
                        <span>Mes adresses</span>
                      </button>
                    </li>
                    <li>
                      <button 
                        className={`${styles.profileNavLink} ${activeTab === 'settings' ? styles.active : ''}`}
                        onClick={() => setActiveTab('settings')}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="3"></circle>
                          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                        </svg>
                        <span>Paramètres</span>
                      </button>
                    </li>
                  </ul>
                  
                  <button className={styles.logoutButton} onClick={handleLogout}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                      <polyline points="16 17 21 12 16 7"></polyline>
                      <line x1="21" y1="12" x2="9" y2="12"></line>
                    </svg>
                    <span>Se déconnecter</span>
                  </button>
                </nav>
              </div>
              
              {/* Contenu principal du profil */}
              <div className={styles.profileContent}>
                {activeTab === 'dashboard' && (
                  <div className={styles.dashboardTab}>
                    <div className={styles.welcomeMessage}>
                      <h2>Bonjour, {userData.firstName} !</h2>
                      <p>Bienvenue sur votre espace personnel. Ici, vous pouvez gérer vos commandes, consulter votre liste d'envies et modifier vos informations personnelles.</p>
                    </div>
                    
                    <div className={styles.dashboardGrid}>
                      <div className={styles.dashboardCard}>
                        <div className={styles.cardIcon}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                            <line x1="3" y1="6" x2="21" y2="6"></line>
                            <path d="M16 10a4 4 0 0 1-8 0"></path>
                          </svg>
                        </div>
                        <h3>Commandes</h3>
                        <p>{userOrders.length} commandes passées</p>
                        <button 
                          className={styles.cardButton}
                          onClick={() => setActiveTab('orders')}
                        >
                          Voir mes commandes
                        </button>
                      </div>
                      
                      <div className={styles.dashboardCard}>
                        <div className={styles.cardIcon}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                          </svg>
                        </div>
                        <h3>Liste d'envies</h3>
                        <p>{wishlist.length} produits favoris</p>
                        <button 
                          className={styles.cardButton}
                          onClick={() => setActiveTab('wishlist')}
                        >
                          Voir ma liste d'envies
                        </button>
                      </div>
                      
                      <div className={styles.dashboardCard}>
                        <div className={styles.cardIcon}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                            <circle cx="12" cy="10" r="3"></circle>
                          </svg>
                        </div>
                        <h3>Adresses</h3>
                        <p>{addresses.length} adresses enregistrées</p>
                        <button 
                          className={styles.cardButton}
                          onClick={() => setActiveTab('addresses')}
                        >
                          Gérer mes adresses
                        </button>
                      </div>
                      
                      <div className={styles.dashboardCard}>
                        <div className={styles.cardIcon}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="3"></circle>
                            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                          </svg>
                        </div>
                        <h3>Paramètres</h3>
                        <p>Gérer vos informations personnelles</p>
                        <button 
                          className={styles.cardButton}
                          onClick={() => setActiveTab('settings')}
                        >
                          Modifier mes paramètres
                        </button>
                      </div>
                    </div>
                    
                    <div className={styles.recentOrdersSection}>
                      <h3>Commandes récentes</h3>
                      {userOrders.length > 0 ? (
                        <div className={styles.recentOrdersTable}>
                          <div className={styles.orderTableHeader}>
                            <div className={styles.orderIdColumn}>Commande</div>
                            <div className={styles.orderDateColumn}>Date</div>
                            <div className={styles.orderStatusColumn}>Statut</div>
                            <div className={styles.orderTotalColumn}>Total</div>
                            <div className={styles.orderActionColumn}>Action</div>
                          </div>
                          {userOrders.slice(0, 2).map(order => (
                            <div key={order.id} className={styles.orderTableRow}>
                              <div className={styles.orderIdColumn}>{order.id}</div>
                              <div className={styles.orderDateColumn}>{formatDate(order.date)}</div>
                              <div className={styles.orderStatusColumn}>
                                <span className={`${styles.orderStatus} ${getStatusClass(order.status)}`}>
                                  {order.statusLabel}
                                </span>
                              </div>
                              <div className={styles.orderTotalColumn}>{order.total.toFixed(2)} €</div>
                              <div className={styles.orderActionColumn}>
                                <Link href={`/profile/orders/${order.id}`} legacyBehavior>
                                  <a className={styles.viewOrderButton}>Voir</a>
                                </Link>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className={styles.emptyState}>Vous n'avez pas encore passé de commande.</p>
                      )}
                      {userOrders.length > 2 && (
                        <button 
                          className={styles.viewAllButton}
                          onClick={() => setActiveTab('orders')}
                        >
                          Voir toutes mes commandes
                        </button>
                      )}
                    </div>
                  </div>
                )}
                
                {activeTab === 'orders' && (
                  <div className={styles.ordersTab}>
                    <div className={styles.tabHeader}>
                      <h2>Mes commandes</h2>
                      <p>Consultez l'historique et le statut de vos commandes</p>
                    </div>
                    
                    {userOrders.length > 0 ? (
                      <div className={styles.ordersTable}>
                        <div className={styles.orderTableHeader}>
                          <div className={styles.orderIdColumn}>Commande</div>
                          <div className={styles.orderDateColumn}>Date</div>
                          <div className={styles.orderStatusColumn}>Statut</div>
                          <div className={styles.orderTotalColumn}>Total</div>
                          <div className={styles.orderActionColumn}>Action</div>
                        </div>
                        {userOrders.map(order => (
                          <div key={order.id} className={styles.orderTableRow}>
                            <div className={styles.orderIdColumn}>{order.id}</div>
                            <div className={styles.orderDateColumn}>{formatDate(order.date)}</div>
                            <div className={styles.orderStatusColumn}>
                              <span className={`${styles.orderStatus} ${getStatusClass(order.status)}`}>
                                {order.statusLabel}
                              </span>
                            </div>
                            <div className={styles.orderTotalColumn}>{order.total.toFixed(2)} €</div>
                            <div className={styles.orderActionColumn}>
                              <Link href={`/profile/orders/${order.id}`} legacyBehavior>
                                <a className={styles.viewOrderButton}>Voir</a>
                              </Link>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className={styles.emptyState}>
                        <div className={styles.emptyStateIcon}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                            <line x1="3" y1="6" x2="21" y2="6"></line>
                            <path d="M16 10a4 4 0 0 1-8 0"></path>
                          </svg>
                        </div>
                        <h3>Aucune commande</h3>
                        <p>Vous n'avez pas encore passé de commande.</p>
                        <Link href="/store" legacyBehavior>
                          <a className={styles.emptyStateButton}>
                            Découvrir nos produits
                          </a>
                        </Link>
                      </div>
                    )}
                  </div>
                )}
                
                {activeTab === 'wishlist' && (
                  <div className={styles.wishlistTab}>
                    <div className={styles.tabHeader}>
                      <h2>Ma liste d'envies</h2>
                      <p>Retrouvez tous vos produits favoris</p>
                    </div>
                    
                    {wishlist.length > 0 ? (
                      <div className={styles.wishlistGrid}>
                        {wishlist.map(product => (
                          <div key={product.id} className={styles.wishlistItem}>
                            <button className={styles.removeFromWishlist}>
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                              </svg>
                            </button>
                            <div className={styles.wishlistImageContainer}>
                              <img src={product.image} alt={product.name} className={styles.wishlistImage} />
                            </div>
                            <div className={styles.wishlistContent}>
                              <h3 className={styles.wishlistProductName}>{product.name}</h3>
                              <p className={styles.wishlistProductPrice}>{product.price.toFixed(2)} €</p>
                              <div className={styles.wishlistActions}>
                                <button 
                                  className={styles.addToCartButton}
                                  disabled={!product.stock}
                                >
                                  {product.stock ? 'Ajouter au panier' : 'Indisponible'}
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className={styles.emptyState}>
                        <div className={styles.emptyStateIcon}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                          </svg>
                        </div>
                        <h3>Liste d'envies vide</h3>
                        <p>Vous n'avez pas encore ajouté de produits à votre liste d'envies.</p>
                        <Link href="/store" legacyBehavior>
                          <a className={styles.emptyStateButton}>
                            Découvrir nos produits
                          </a>
                        </Link>
                      </div>
                    )}
                  </div>
                )}
                
                {activeTab === 'addresses' && (
                  <div className={styles.addressesTab}>
                    <div className={styles.tabHeader}>
                      <h2>Mes adresses</h2>
                      <p>Gérez vos adresses de livraison et de facturation</p>
                      {/* Bouton Ajouter en haut si on a déjà des adresses */}
                      {addresses.length > 0 && (
                        <button 
                          className={styles.addAddressButton}
                          onClick={handleAddAddress}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                          </svg>
                          Ajouter une adresse
                        </button>
                      )}
                    </div>
                    
                    {addresses.length > 0 ? (
                      <div className={styles.addressesGrid}>
                        {addresses.map((address, index) => (
                          <div key={index} className={`${styles.addressCard} ${address.isDefault ? styles.defaultAddress : ''}`}>
                            {address.isDefault && (
                              <div className={styles.defaultAddressBadge}>Adresse par défaut</div>
                            )}
                            <div className={styles.addressCardContent}>
                              <p>{address.street}</p>
                              <p>{address.postalCode}, {address.city}</p>
                              <p>{address.country}</p>
                            </div>
                            <div className={styles.addressCardActions}>
                              <button
                                className={styles.editAddressButton}
                                onClick={() => handleEditAddress(index)}
                              >
                                Modifier
                              </button>
                              {!address.isDefault && addresses.length > 1 && (
                                <button
                                  className={styles.deleteAddressButton}
                                  onClick={() => {
                                    const updatedAddresses = addresses.filter((_, i) => i !== index);
                                    setAddresses(updatedAddresses);
                                    handleUpdateUser({ addresses: updatedAddresses });
                                  }}
                                >
                                  Supprimer
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className={styles.emptyState}>
                        <div className={styles.emptyStateIcon}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                            <circle cx="12" cy="10" r="3"></circle>
                          </svg>
                        </div>
                        <h3>Aucune adresse</h3>
                        <p>Vous n'avez pas encore ajouté d'adresse.</p>
                        <button 
                          className={styles.emptyStateButton}
                          onClick={handleAddAddress}
                        >
                          Ajouter une adresse
                        </button>
                      </div>
                    )}
                  </div>
                )}
                
                {activeTab === 'settings' && (
                  <div className={styles.settingsTab}>
                    <div className={styles.tabHeader}>
                      <h2>Paramètres du compte</h2>
                      <p>Gérez vos informations personnelles et vos préférences</p>
                    </div>
                    
                    <div className={styles.settingsForm}>
                    <div className={styles.settingsSection}>
  <h3>Informations personnelles</h3>
  <div className={styles.formRow}>
    <div className={styles.formGroup}>
      <label htmlFor="firstName">Prénom</label>
      <input
        type="text"
        id="firstName"
        value={userData.firstName || ''}
        onChange={(e) => setUserData({ ...userData, firstName: e.target.value })}
      />
    </div>
    <div className={styles.formGroup}>
      <label htmlFor="lastName">Nom</label>
      <input
        type="text"
        id="lastName"
        value={userData.lastName || ''}
        onChange={(e) => setUserData({ ...userData, lastName: e.target.value })}
      />
    </div>
  </div>
  <div className={styles.formRow}>
    <div className={styles.formGroup}>
      <label htmlFor="email">Email</label>
      <input
        type="email"
        id="email"
        value={userData.email || ''}
        onChange={(e) => setUserData({ ...userData, email: e.target.value })}
      />
    </div>
    <div className={styles.formGroup}>
      <label htmlFor="phone">Téléphone</label>
      <input
        type="tel"
        id="phone"
        value={userData.phone || ''}
        onChange={(e) => setUserData({ ...userData, phone: e.target.value })}
      />
    </div>
  </div>
  <button
    className={styles.saveSettingsButton}
    onClick={() => handleUpdateUser(userData)}
  >
    Enregistrer les modifications
  </button>
</div>
                      
                      {/* DÉBUT DE LA SECTION MODIFIÉE - CHANGEMENT DE MOT DE PASSE */}
                      <div className={styles.settingsSection}>
                        <h3>Changer de mot de passe</h3>

                        <div className={styles.formGroup}>
                          <label htmlFor="currentPassword">Mot de passe actuel</label>
                          <div className={styles.passwordInputWrapper}>
                            <input 
                              type={showCurrentPassword ? "text" : "password"} 
                              id="currentPassword" 
                              placeholder="Votre mot de passe actuel"
                              value={currentPassword}
                              onChange={(e) => setCurrentPassword(e.target.value)}
                            />
                            <button 
                              type="button"
                              className={styles.togglePasswordButton}
                              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            >
                              {showCurrentPassword ? '🙈' : '👁️'}
                            </button>
                          </div>
                        </div>

                        <div className={styles.formRow}>
                          <div className={styles.formGroup}>
                            <label htmlFor="newPassword">Nouveau mot de passe</label>
                            <div className={styles.passwordInputWrapper}>
                              <input 
                                type={showNewPassword ? "text" : "password"} 
                                id="newPassword" 
                                placeholder="Votre nouveau mot de passe"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                              />
                              <button 
                                type="button"
                                className={styles.togglePasswordButton}
                                onClick={() => setShowNewPassword(!showNewPassword)}
                              >
                                {showNewPassword ? '🙈' : '👁️'}
                              </button>
                            </div>
                          </div>
                          <div className={styles.formGroup}>
                            <label htmlFor="confirmPassword">Confirmer le mot de passe</label>
                            <div className={styles.passwordInputWrapper}>
                              <input 
                                type={showConfirmPassword ? "text" : "password"} 
                                id="confirmPassword" 
                                placeholder="Confirmez votre nouveau mot de passe"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                              />
                              <button 
                                type="button"
                                className={styles.togglePasswordButton}
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              >
                                {showConfirmPassword ? '🙈' : '👁️'}
                              </button>
                            </div>
                          </div>
                        </div>
                        
                        {/* Section des critères de validation */}
                        <div className={styles.passwordCriteria}>
                          <h4>Votre mot de passe doit contenir :</h4>
                          <ul>
                            <li className={criteria.minLength ? styles.criteriaValid : styles.criteriaInvalid}>
                              6 caractères minimum
                            </li>
                            <li className={criteria.hasUpperCase ? styles.criteriaValid : styles.criteriaInvalid}>
                              1 lettre majuscule
                            </li>
                            <li className={criteria.hasNumber ? styles.criteriaValid : styles.criteriaInvalid}>
                              1 chiffre
                            </li>
                            <li className={criteria.hasSpecialChar ? styles.criteriaValid : styles.criteriaInvalid}>
                              1 caractère spécial
                            </li>
                          </ul>
                        </div>

                        <button 
                          className={styles.savePasswordButton}
                          onClick={handleChangePassword}
                        >
                          Mettre à jour le mot de passe
                        </button>
                      </div>
                      {/* FIN DE LA SECTION MODIFIÉE */}
                      
                      <div className={styles.settingsSection}>
                        <h3>Préférences de communication</h3>
                        
                        <div className={styles.preferenceOption}>
                          <input type="checkbox" id="newsletterPreference" defaultChecked={true} />
                          <label htmlFor="newsletterPreference">
                            <span>Recevoir la newsletter</span>
                            <p>Recevez nos actualités, offres exclusives et conseils sur nos produits</p>
                          </label>
                        </div>
                        
                        <div className={styles.preferenceOption}>
                          <input type="checkbox" id="orderUpdatesPreference" defaultChecked={true} />
                          <label htmlFor="orderUpdatesPreference">
                            <span>Mises à jour des commandes</span>
                            <p>Recevez des notifications concernant vos commandes</p>
                          </label>
                        </div>
                        
                        <button className={styles.savePreferencesButton}>
                          Enregistrer les préférences
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
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