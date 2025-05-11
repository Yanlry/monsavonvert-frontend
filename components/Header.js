import { useContext, useState, useEffect } from "react";
import Link from "next/link";
import { UserContext } from "../context/UserContext";
import styles from "../styles/header.module.css";

export default function Header({ cartCount }) {
  // États pour gérer les interactions utilisateur
  const { user, setUser } = useContext(UserContext);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [adminMenuOpen, setAdminMenuOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);

  // Effet pour la détection du scroll avec une transition douce
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Effet pour fermer le menu admin si on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (adminMenuOpen && !event.target.closest('.profileDropdownArea')) {
        setAdminMenuOpen(false);
      }
    };

    if (adminMenuOpen) {
      document.addEventListener('click', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [adminMenuOpen]);

  // Récupération des données utilisateur depuis le stockage
  useEffect(() => {
    // Récupérer les informations d'authentification
    const role = localStorage.getItem('role') || sessionStorage.getItem('role');
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const userId = localStorage.getItem('userId') || sessionStorage.getItem('userId');
    const firstName = localStorage.getItem('firstName') || sessionStorage.getItem('firstName');
    const userEmail = localStorage.getItem('userEmail') || sessionStorage.getItem('userEmail');
    
    // Stocker le rôle dans l'état local
    setUserRole(role);
    
    // Si l'utilisateur est connecté mais le contexte user est vide ou incomplet
    if (token && (!user || !user.role)) {
      // Reconstruire l'objet utilisateur pour le contexte
      const reconstructedUser = {
        _id: userId,
        userId: userId,
        firstName: firstName,
        email: userEmail,
        role: role,
        token: token
      };
      
      // Mettre à jour le contexte si setUser est disponible
      if (setUser) {
        setUser(reconstructedUser);
      }
    }
  }, [user, setUser]);

  // Fonction pour fermer le menu quand on clique sur un lien
  const closeMenu = () => {
    setMenuOpen(false);
    setActiveCategory(null);
  };

  // Fonction pour basculer l'état du menu admin
  const toggleAdminMenu = (e) => {
    e.preventDefault();
    setAdminMenuOpen(!adminMenuOpen);
  };

  // Gestion du hover pour les catégories
  const handleCategoryHover = (category) => {
    setActiveCategory(category);
  };

  const handleCategoryLeave = () => {
    setActiveCategory(null);
  };

  // Fonction pour déterminer l'URL du profil en fonction du rôle
  const getProfileUrl = () => {
    // Utiliser le rôle du contexte OU l'état local (en cas de rafraîchissement)
    const effectiveRole = (user && user.role) || userRole;
    
    // Si l'utilisateur est admin, rediriger vers le dashboard admin
    if (effectiveRole === "admin") {
      return "#"; // On ne redirige plus, on ouvre un menu
    }
    // Sinon, rediriger vers la page de profil standard
    return "/profile";
  };

  // Fonction pour se déconnecter
  const handleLogout = (e) => {
    e.preventDefault();
    // Suppression des données de stockage
    const storageItems = ['userEmail', 'token', 'role', 'userId', 'firstName'];
    
    storageItems.forEach(item => {
      localStorage.removeItem(item);
      sessionStorage.removeItem(item);
    });
    
    // Réinitialiser le contexte utilisateur
    if (setUser) {
      setUser(null);
    }
    
    // Rediriger vers la page de connexion
    window.location.href = '/login';
  };

  return (
    <header className={`${styles.header} ${scrolled ? styles.headerScrolled : ""}`}>
      <div className={styles.headerContent}>
        {/* Logo avec animation au survol */}
        <div className={styles.logoContainer}>
          <Link href="/" className={styles.logoLink}>
            <div className={styles.logoWrapper}>
              <div className={styles.logoIconWrapper}>
                <span className={styles.logoIcon}>🧼</span>
              </div>
              <div className={styles.logoTextWrapper}>
                <span className={styles.logo}>MonSavonVert</span>
                <span className={styles.logoTagline}>Naturel & Artisanal</span>
              </div>
            </div>
          </Link>
        </div>

        {/* Navigation principale avec méga-menu */}
        <nav className={`${styles.mainNav} ${menuOpen ? styles.active : ""}`}>
          <ul className={styles.navList}>
            <li className={styles.navItem}>
              <Link href="/" className={styles.navLink} onClick={closeMenu}>
                <span className={styles.navLinkText}>Accueil</span>
              </Link>
            </li>
            
            <li 
              className={styles.navItem} 
              onMouseEnter={() => handleCategoryHover('shop')}
              onMouseLeave={handleCategoryLeave}
            >
              <div className={styles.navLinkWrapper}>
                <Link 
                  href="/store" 
                  className={`${styles.navLink} ${activeCategory === 'shop' ? styles.navLinkActive : ''}`} 
                  onClick={closeMenu}
                >
                  <span className={styles.navLinkText}>Boutique</span>
                  <span className={styles.navLinkIcon}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </span>
                </Link>
                
                <div className={`${styles.megaMenu} ${activeCategory === 'shop' ? styles.megaMenuVisible : ''}`}>
                  <div className={styles.megaMenuHeader}>
                    <h2 className={styles.megaMenuTitle}>Découvrez nos collections</h2>
                    <p className={styles.megaMenuSubtitle}>Des savons artisanaux faits avec amour et respect pour la nature</p>
                  </div>
                  
                  <div className={styles.megaMenuGrid}>
                    <div className={styles.megaMenuCategory}>
                      <h3>Visage</h3>
                      <div className={styles.megaMenuLinks}>
                        <Link href="/boutique/savon-visage" onClick={closeMenu} className={styles.megaMenuLink}>
                          <span className={styles.megaMenuIcon}>✨</span>
                          <div className={styles.megaMenuLinkContent}>
                            <span className={styles.megaMenuLinkTitle}>Savons visage</span>
                            <span className={styles.megaMenuLinkDesc}>Nettoyants doux adaptés à tous types de peau</span>
                          </div>
                        </Link>
                        <Link href="/boutique/argile" onClick={closeMenu} className={styles.megaMenuLink}>
                          <span className={styles.megaMenuIcon}>🌿</span>
                          <div className={styles.megaMenuLinkContent}>
                            <span className={styles.megaMenuLinkTitle}>Masques à l'argile</span>
                            <span className={styles.megaMenuLinkDesc}>Purifiants et reminéralisants</span>
                          </div>
                        </Link>
                      </div>
                    </div>
                    
                    <div className={styles.megaMenuCategory}>
                      <h3>Corps</h3>
                      <div className={styles.megaMenuLinks}>
                        <Link href="/boutique/savon-corps" onClick={closeMenu} className={styles.megaMenuLink}>
                          <span className={styles.megaMenuIcon}>💧</span>
                          <div className={styles.megaMenuLinkContent}>
                            <span className={styles.megaMenuLinkTitle}>Savons corps</span>
                            <span className={styles.megaMenuLinkDesc}>Hydratation et soin du corps</span>
                          </div>
                        </Link>
                        <Link href="/boutique/gommages" onClick={closeMenu} className={styles.megaMenuLink}>
                          <span className={styles.megaMenuIcon}>✨</span>
                          <div className={styles.megaMenuLinkContent}>
                            <span className={styles.megaMenuLinkTitle}>Gommages</span>
                            <span className={styles.megaMenuLinkDesc}>Exfoliants naturels</span>
                          </div>
                        </Link>
                      </div>
                    </div>
                    
                    <div className={styles.megaMenuCategory}>
                      <h3>Collections</h3>
                      <div className={styles.megaMenuLinks}>
                        <Link href="/boutique/aromatherapie" onClick={closeMenu} className={styles.megaMenuLink}>
                          <span className={styles.megaMenuIcon}>🌸</span>
                          <div className={styles.megaMenuLinkContent}>
                            <span className={styles.megaMenuLinkTitle}>Aromathérapie</span>
                            <span className={styles.megaMenuLinkDesc}>Bienfaits des huiles essentielles</span>
                          </div>
                        </Link>
                        <Link href="/boutique/peaux-sensibles" onClick={closeMenu} className={styles.megaMenuLink}>
                          <span className={styles.megaMenuIcon}>🍃</span>
                          <div className={styles.megaMenuLinkContent}>
                            <span className={styles.megaMenuLinkTitle}>Peaux sensibles</span>
                            <span className={styles.megaMenuLinkDesc}>Sans parfum et hypoallergéniques</span>
                          </div>
                        </Link>
                      </div>
                    </div>
                    
                    <div className={styles.megaMenuPromo}>
                      <div className={styles.megaMenuPromoContent}>
                        <div className={styles.megaMenuImageLabel}>Nouveau</div>
                        <h3 className={styles.megaMenuPromoTitle}>Collection Summer</h3>
                        <p className={styles.megaMenuPromoDesc}>Des savons rafraîchissants aux agrumes pour l'été</p>
                        <Link href="/boutique/nouveautes" className={styles.megaMenuButton} onClick={closeMenu}>
                          <span>Découvrir</span>
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                            <polyline points="12 5 19 12 12 19"></polyline>
                          </svg>
                        </Link>
                      </div>
                      <div className={styles.megaMenuPromoImage}>
                        <img src="/images/2.JPEG" alt="Nouvelle collection" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </li>
            
            <li 
              className={styles.navItem}
              onMouseEnter={() => handleCategoryHover('virtues')}
              onMouseLeave={handleCategoryLeave}
            >
              <Link 
                href="/virtues" 
                className={`${styles.navLink} ${activeCategory === 'virtues' ? styles.navLinkActive : ''}`} 
                onClick={closeMenu}
              >
                <span className={styles.navLinkText}>Vertus & bienfaits</span>
              </Link>
            </li>
            
            <li 
              className={styles.navItem}
              onMouseEnter={() => handleCategoryHover('story')}
              onMouseLeave={handleCategoryLeave}
            >
              <Link 
                href="/info" 
                className={`${styles.navLink} ${activeCategory === 'story' ? styles.navLinkActive : ''}`} 
                onClick={closeMenu}
              >
                <span className={styles.navLinkText}>Notre Histoire</span>
              </Link>
            </li>
            
            <li 
              className={styles.navItem}
              onMouseEnter={() => handleCategoryHover('contact')}
              onMouseLeave={handleCategoryLeave}
            >
              <Link 
                href="/contact" 
                className={`${styles.navLink} ${activeCategory === 'contact' ? styles.navLinkActive : ''}`} 
                onClick={closeMenu}
              >
                <span className={styles.navLinkText}>Contact</span>
              </Link>
            </li>
            
            {/* Élément de connexion pour mobile uniquement - AJOUT */}
            <li className={styles.mobileLoginItem}>
              {user ? (
                <div className="profileDropdownArea" style={{ position: 'relative', width: '100%' }}>
                  {/* Menu profil adapté selon le rôle (admin ou utilisateur) */}
                  {((user && user.role === "admin") || userRole === "admin") ? (
                    <a href="#" className={`${styles.mobileUserAccount} ${styles.mobileAdminAccount}`} onClick={toggleAdminMenu} aria-label="Menu admin">
                      <div className={styles.userAvatar}>
                        {user.firstName ? user.firstName.charAt(0).toUpperCase() : "A"}
                      </div>
                      <div className={styles.userInfoWrapper}>
                        <div className={styles.userInfo}>
                          <span className={styles.welcomeText}>Bonjour,</span>
                          <span className={styles.userName}>{user.firstName}</span>
                        </div>
                        <span className={styles.adminBadge}>Admin</span>
                      </div>
                    </a>
                  ) : (
                    <Link href={getProfileUrl()} className={styles.mobileUserAccount} aria-label="Mon compte" onClick={closeMenu}>
                      <div className={styles.userAvatar}>
                        {user.firstName ? user.firstName.charAt(0).toUpperCase() : "?"}
                      </div>
                      <div className={styles.userInfoWrapper}>
                        <div className={styles.userInfo}>
                          <span className={styles.welcomeText}>Bonjour,</span>
                          <span className={styles.userName}>{user.firstName}</span>
                        </div>
                      </div>
                    </Link>
                  )}
                  
                  {/* Menu déroulant admin avec animations */}
                  {adminMenuOpen && ((user && user.role === "admin") || userRole === "admin") && (
                    <div className={styles.mobileAdminDropdownMenu}>
                      <div className={styles.adminMenuHeader}>
                        <div className={styles.adminMenuAvatar}>
                          {user.firstName ? user.firstName.charAt(0).toUpperCase() : "A"}
                        </div>
                        <div className={styles.adminMenuUser}>
                          <span className={styles.adminMenuName}>{user.firstName}</span>
                          <span className={styles.adminMenuEmail}>{user.email}</span>
                        </div>
                      </div>
                      
                      <div className={styles.adminMenuDivider}></div>
                      
                      <ul>
                        <li>
                          <Link href="/admin/dashboard" className={styles.adminMenuLink} onClick={closeMenu}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <rect x="3" y="3" width="7" height="7"></rect>
                              <rect x="14" y="3" width="7" height="7"></rect>
                              <rect x="14" y="14" width="7" height="7"></rect>
                              <rect x="3" y="14" width="7" height="7"></rect>
                            </svg>
                            <span>Tableau de bord</span>
                          </Link>
                        </li>
                        <li>
                          <Link href="/admin/orders" className={styles.adminMenuLink} onClick={closeMenu}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                              <line x1="3" y1="6" x2="21" y2="6"></line>
                              <path d="M16 10a4 4 0 0 1-8 0"></path>
                            </svg>
                            <span>Commandes</span>
                          </Link>
                        </li>
                        <li>
                          <Link href="/admin/products" className={styles.adminMenuLink} onClick={closeMenu}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                            </svg>
                            <span>Produits</span>
                          </Link>
                        </li>
                        <li>
                          <Link href="/admin/customers" className={styles.adminMenuLink} onClick={closeMenu}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                              <circle cx="9" cy="7" r="4"></circle>
                              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                            </svg>
                            <span>Clients</span>
                          </Link>
                        </li>
                        <li>
                          <Link href="/admin/settings" className={styles.adminMenuLink} onClick={closeMenu}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <circle cx="12" cy="12" r="3"></circle>
                              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                            </svg>
                            <span>Paramètres</span>
                          </Link>
                        </li>
                      </ul>
                      
                      <div className={styles.adminMenuDivider}></div>
                      
                      <div className={styles.adminMenuFooter}>
                        <a 
                          href="#" 
                          className={`${styles.adminMenuLink} ${styles.logoutLink}`}
                          onClick={handleLogout}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                            <polyline points="16 17 21 12 16 7"></polyline>
                            <line x1="21" y1="12" x2="9" y2="12"></line>
                          </svg>
                          <span>Se déconnecter</span>
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link href="/login" className={styles.mobileLoginLink} aria-label="Se connecter" onClick={closeMenu}>
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
                    className={styles.userAccountIcon}
                  >
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                  <span className={styles.navLinkText}>Connexion</span>
                </Link>
              )}
            </li>
          </ul>
        </nav>

        {/* Outils utilisateur (profil et panier) */}
        <div className={styles.userTools}>
          {user ? (
            <div className="profileDropdownArea" style={{ position: 'relative' }}>
              {/* Menu profil adapté selon le rôle (admin ou utilisateur) */}
              {((user && user.role === "admin") || userRole === "admin") ? (
                <a href="#" className={styles.userAccountConnected} onClick={toggleAdminMenu} aria-label="Menu admin">
                  <div className={styles.userAvatar}>
                    {user.firstName ? user.firstName.charAt(0).toUpperCase() : "A"}
                  </div>
                  <div className={styles.userInfoWrapper}>
                    <div className={styles.userInfo}>
                      <span className={styles.welcomeText}>Bonjour,</span>
                      <span className={styles.userName}>{user.firstName}</span>
                    </div>
                    <span className={styles.adminBadge}>Admin</span>
                  </div>
                </a>
              ) : (
                <Link href={getProfileUrl()} className={styles.userAccountConnected} aria-label="Mon compte">
                  <div className={styles.userAvatar}>
                    {user.firstName ? user.firstName.charAt(0).toUpperCase() : "?"}
                  </div>
                  <div className={styles.userInfoWrapper}>
                    <div className={styles.userInfo}>
                      <span className={styles.welcomeText}>Bonjour,</span>
                      <span className={styles.userName}>{user.firstName}</span>
                    </div>
                  </div>
                </Link>
              )}
              
              {/* Menu déroulant admin avec animations */}
              {adminMenuOpen && ((user && user.role === "admin") || userRole === "admin") && (
                <div className={styles.adminDropdownMenu}>
                  <div className={styles.adminMenuHeader}>
                    <div className={styles.adminMenuAvatar}>
                      {user.firstName ? user.firstName.charAt(0).toUpperCase() : "A"}
                    </div>
                    <div className={styles.adminMenuUser}>
                      <span className={styles.adminMenuName}>{user.firstName}</span>
                      <span className={styles.adminMenuEmail}>{user.email}</span>
                    </div>
                  </div>
                  
                  <div className={styles.adminMenuDivider}></div>
                  
                  <ul>
                    <li>
                      <Link href="/admin/dashboard" className={styles.adminMenuLink}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="3" width="7" height="7"></rect>
                          <rect x="14" y="3" width="7" height="7"></rect>
                          <rect x="14" y="14" width="7" height="7"></rect>
                          <rect x="3" y="14" width="7" height="7"></rect>
                        </svg>
                        <span>Tableau de bord</span>
                      </Link>
                    </li>
                    <li>
                      <Link href="/admin/orders" className={styles.adminMenuLink}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                          <line x1="3" y1="6" x2="21" y2="6"></line>
                          <path d="M16 10a4 4 0 0 1-8 0"></path>
                        </svg>
                        <span>Commandes</span>
                      </Link>
                    </li>
                    <li>
                      <Link href="/admin/products" className={styles.adminMenuLink}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                        </svg>
                        <span>Produits</span>
                      </Link>
                    </li>
                    <li>
                      <Link href="/admin/customers" className={styles.adminMenuLink}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                          <circle cx="9" cy="7" r="4"></circle>
                          <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                        </svg>
                        <span>Clients</span>
                      </Link>
                    </li>
                    <li>
                      <Link href="/admin/settings" className={styles.adminMenuLink}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="3"></circle>
                          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                        </svg>
                        <span>Paramètres</span>
                      </Link>
                    </li>
                  </ul>
                  
                  <div className={styles.adminMenuDivider}></div>
                  
                  <div className={styles.adminMenuFooter}>
                    <a 
                      href="#" 
                      className={`${styles.adminMenuLink} ${styles.logoutLink}`}
                      onClick={handleLogout}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                        <polyline points="16 17 21 12 16 7"></polyline>
                        <line x1="21" y1="12" x2="9" y2="12"></line>
                      </svg>
                      <span>Se déconnecter</span>
                    </a>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link href="/login" className={styles.userAccount} aria-label="Se connecter">
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
                className={styles.userAccountIcon}
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              <span className={styles.userAccountText}>Connexion</span>
            </Link>
          )}

          {/* Panier avec notification */}
          <Link href="/cart" className={styles.cartLink} aria-label="Panier">
            <div className={styles.cartIconWrapper}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={styles.cartIcon}
              >
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
              {cartCount > 0 && (
                <div className={styles.cartCountWrapper}>
                  <span className={styles.cartCount}>{cartCount}</span>
                </div>
              )}
            </div>
          </Link>
        </div>

        {/* Menu hamburger pour mobile avec animation */}
        <button
          className={`${styles.mobileMenuToggle} ${menuOpen ? styles.active : ""}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
      
      {/* Overlay pour fermer le menu en cliquant à l'extérieur */}
      {menuOpen && (
        <div className={styles.menuOverlay} onClick={() => setMenuOpen(false)}></div>
      )}
    </header>
  );
}