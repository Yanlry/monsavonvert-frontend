import Link from "next/link";
import { useContext, useState, useEffect } from "react";
import { UserContext } from "../context/UserContext";
import styles from "../styles/header.module.css";

export default function Header({ cartCount }) {
  const { user, setUser } = useContext(UserContext);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [adminMenuOpen, setAdminMenuOpen] = useState(false); // Nouvel état pour le menu admin

  // Effet pour détecter le scroll
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
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

    // Ajouter l'écouteur d'événement seulement si le menu est ouvert
    if (adminMenuOpen) {
      document.addEventListener('click', handleClickOutside);
    }
    
    // Nettoyage
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [adminMenuOpen]);

  // Nouvel effet pour récupérer le rôle depuis localStorage/sessionStorage
  useEffect(() => {
    // Récupérer les informations d'authentification
    const role = localStorage.getItem('role') || sessionStorage.getItem('role');
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const userId = localStorage.getItem('userId') || sessionStorage.getItem('userId');
    const firstName = localStorage.getItem('firstName') || sessionStorage.getItem('firstName');
    const userEmail = localStorage.getItem('userEmail') || sessionStorage.getItem('userEmail');
    
    console.log("Header - Rôle détecté:", role);
    
    // Stocker le rôle dans l'état local
    setUserRole(role);
    
    // Si l'utilisateur est connecté (token présent) mais le contexte user est vide ou incomplet
    if (token && (!user || !user.role)) {
      console.log("Reconstruction de l'objet utilisateur après rafraîchissement");
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
  };

  // Fonction pour basculer l'état du menu admin
  const toggleAdminMenu = (e) => {
    if (e) e.preventDefault();
    setAdminMenuOpen(!adminMenuOpen);
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
    localStorage.removeItem('userEmail');
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userId');
    localStorage.removeItem('firstName');
    sessionStorage.removeItem('userEmail');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('role');
    sessionStorage.removeItem('userId');
    sessionStorage.removeItem('firstName');
    
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
        <div className={styles.logoContainer}>
          <Link href="/" className={styles.logoLink}>
            <span className={styles.logo}>MonSavonVert</span>
          </Link>
        </div>

        {/* Navigation principale - Ajout de la classe active conditionnelle */}
        <nav className={`${styles.mainNav} ${menuOpen ? styles.active : ""}`}>
          <ul className={styles.navList}>
            <li className={styles.navItem}>
              <Link href="/" className={styles.navLink} onClick={closeMenu}>
                Accueil
              </Link>
            </li>
            <li className={styles.navItem}>
              <div className={styles.navLinkWrapper}>
                <Link href="/store" className={styles.navLink} onClick={closeMenu}>
                  Boutique
                </Link>
                <div className={styles.megaMenu}>
                  <div className={styles.megaMenuGrid}>
                    <div className={styles.megaMenuCategory}>
                      <h3>Catégories</h3>
                      <Link href="/boutique/visage" onClick={closeMenu}>
                        Soins visage
                      </Link>
                      <Link href="/boutique/corps" onClick={closeMenu}>
                        Soins corps
                      </Link>
                      <Link href="/boutique/cheveux" onClick={closeMenu}>
                        Cheveux
                      </Link>
                      <Link href="/boutique/accessoires" onClick={closeMenu}>
                        Accessoires
                      </Link>
                    </div>
                    <div className={styles.megaMenuCategory}>
                      <h3>Collections</h3>
                      <Link href="/boutique/aromatherapie" onClick={closeMenu}>
                        Aromathérapie
                      </Link>
                      <Link href="/boutique/peaux-sensibles" onClick={closeMenu}>
                        Peaux sensibles
                      </Link>
                      <Link href="/boutique/hydratation" onClick={closeMenu}>
                        Hydratation intense
                      </Link>
                    </div>
                    <div className={styles.megaMenuImage}>
                      <p>Nouveau</p>
                      <img src="/images/2.JPEG" alt="Nouvelle collection" />
                      <Link href="/boutique/nouveautes" className={styles.megaMenuButton} onClick={closeMenu}>
                        Découvrir
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </li>
            <li className={styles.navItem}>
              <Link href="/virtues" className={styles.navLink} onClick={closeMenu}>
                Vertu & bienfaits
              </Link>
            </li>
            <li className={styles.navItem}>
              <Link href="/info" className={styles.navLink} onClick={closeMenu}>
                Notre Histoire
              </Link>
            </li>
            <li className={styles.navItem}>
              <Link href="/contact" className={styles.navLink} onClick={closeMenu}>
                Contact
              </Link>
            </li>
          </ul>
        </nav>

        {/* Barre d'outils utilisateur améliorée */}
        <div className={styles.userTools}>
          {user ? (
            <div className="profileDropdownArea" style={{ position: 'relative' }}>
              {/* Si admin, afficher un lien qui gère le menu déroulant */}
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
              
              {/* Menu déroulant admin */}
              {adminMenuOpen && ((user && user.role === "admin") || userRole === "admin") && (
                <div className={styles.adminDropdownMenu || "adminDropdownMenu"}>
                  <ul>
                    <li>
                      <Link href="/admin/dashboard" className={styles.adminMenuLink || "adminMenuLink"}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="3" width="7" height="7"></rect>
                          <rect x="14" y="3" width="7" height="7"></rect>
                          <rect x="14" y="14" width="7" height="7"></rect>
                          <rect x="3" y="14" width="7" height="7"></rect>
                        </svg>
                        Tableau de bord
                      </Link>
                    </li>
                    <li>
                      <Link href="/admin/orders" className={styles.adminMenuLink || "adminMenuLink"}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                          <line x1="3" y1="6" x2="21" y2="6"></line>
                          <path d="M16 10a4 4 0 0 1-8 0"></path>
                        </svg>
                        Commandes
                      </Link>
                    </li>
                    <li>
                      <Link href="/admin/products" className={styles.adminMenuLink || "adminMenuLink"}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                        </svg>
                        Produits
                      </Link>
                    </li>
                    <li>
                      <Link href="/admin/customers" className={styles.adminMenuLink || "adminMenuLink"}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                          <circle cx="9" cy="7" r="4"></circle>
                          <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                        </svg>
                        Clients
                      </Link>
                    </li>
                    <li>
                      <Link href="/admin/settings" className={styles.adminMenuLink || "adminMenuLink"}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="3"></circle>
                          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                        </svg>
                        Paramètres
                      </Link>
                    </li>
                    <li className={styles.divider || "divider"}>
                      <a 
                        href="#" 
                        className={`${styles.adminMenuLink || "adminMenuLink"} ${styles.logoutLink || "logoutLink"}`}
                        onClick={handleLogout}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                          <polyline points="16 17 21 12 16 7"></polyline>
                          <line x1="21" y1="12" x2="9" y2="12"></line>
                        </svg>
                        Se déconnecter
                      </a>
                    </li>
                  </ul>
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
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              <span>Connexion</span>
            </Link>
          )}

          <Link href="/cart" className={styles.cartLink} aria-label="Panier">
            <div className={styles.cartIcon}>
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
              {cartCount > 0 && <span className={styles.cartCount}>{cartCount}</span>}
            </div>
          </Link>
        </div>

        {/* Menu hamburger pour mobile */}
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
      {menuOpen && <div className={styles.menuOverlay} onClick={() => setMenuOpen(false)}></div>}
    </header>
  );
}