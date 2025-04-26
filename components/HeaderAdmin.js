// Chemin du fichier: components/admin/HeaderAdmin.js

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from '../styles/header-admin.module.css'; // Changé pour utiliser le nouveau module CSS

/**
 * Composant Header pour le tableau de bord administrateur
 * avec navigation principale du site et menu déroulant admin
 */
const HeaderAdmin = ({ userEmail, activePage }) => {
  // États
  const [scrolled, setScrolled] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // Effet pour détecter le défilement
  useEffect(() => {
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
      if (typeof window !== 'undefined') {
        window.removeEventListener('scroll', handleScroll);
      }
    };
  }, []);

  // Effet pour fermer le menu profil si on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuOpen && !event.target.closest('.profileDropdownArea')) {
        setProfileMenuOpen(false);
      }
    };

    // Ajouter l'écouteur d'événement seulement si le menu est ouvert
    if (profileMenuOpen && typeof document !== 'undefined') {
      document.addEventListener('click', handleClickOutside);
    }
    
    // Nettoyage
    return () => {
      if (typeof document !== 'undefined') {
        document.removeEventListener('click', handleClickOutside);
      }
    };
  }, [profileMenuOpen]);

  // Fonction pour fermer le menu mobile quand on clique sur un lien
  const closeMenu = () => {
    setMenuOpen(false);
  };

  // Fonction pour basculer l'état du menu profil
  const toggleProfileMenu = (e) => {
    e.preventDefault();
    setProfileMenuOpen(!profileMenuOpen);
  };

  return (
    <header className={`${styles.header} ${scrolled ? styles.headerScrolled : ''}`}>
      <div className={styles.headerContent}>
        <div className={styles.logoContainer}>
          <Link href="/" legacyBehavior>
            <a className={styles.logoLink}>
              <span className={styles.logo}>MonSavonVert</span>
            </a>
          </Link>
        </div>

        {/* Navigation principale - identique au header principal du site */}
        <nav className={`${styles.mainNav} ${menuOpen ? styles.active : ''}`}>
          <ul className={styles.navList}>
            <li className={styles.navItem}>
              <Link href="/" legacyBehavior>
                <a className={styles.navLink} onClick={closeMenu}>
                  Accueil
                </a>
              </Link>
            </li>
            <li className={styles.navItem}>
              <Link href="/store" legacyBehavior>
                <a className={styles.navLink} onClick={closeMenu}>
                  Boutique
                </a>
              </Link>
            </li>
            <li className={styles.navItem}>
              <Link href="/virtues" legacyBehavior>
                <a className={styles.navLink} onClick={closeMenu}>
                  Vertu & bienfaits
                </a>
              </Link>
            </li>
            <li className={styles.navItem}>
              <Link href="/info" legacyBehavior>
                <a className={styles.navLink} onClick={closeMenu}>
                  Notre Histoire
                </a>
              </Link>
            </li>
            <li className={styles.navItem}>
              <Link href="/contact" legacyBehavior>
                <a className={styles.navLink} onClick={closeMenu}>
                  Contact
                </a>
              </Link>
            </li>
          </ul>
        </nav>

        {/* Profil administrateur avec menu déroulant */}
        <div className="profileDropdownArea" style={{ position: 'relative' }}>
          <div className={styles.adminProfile} onClick={toggleProfileMenu}>
            <div className={styles.adminAvatar}>
              <span>A</span>
            </div>
            <div className={styles.adminInfo}>
              <span className={styles.adminName}>Admin</span>
              <span className={styles.adminEmail}>{userEmail}</span>
            </div>
          </div>
          
          {/* Menu déroulant qui s'affiche au clic sur le profil */}
          {profileMenuOpen && (
            <div className={styles.adminDropdownMenu}>
              <ul>
                <li>
                  <Link href="/admin/dashboard" legacyBehavior>
                    <a className={`${styles.adminMenuLink} ${activePage === 'dashboard' ? styles.activeAdminLink : ''}`}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="7" height="7"></rect>
                        <rect x="14" y="3" width="7" height="7"></rect>
                        <rect x="14" y="14" width="7" height="7"></rect>
                        <rect x="3" y="14" width="7" height="7"></rect>
                      </svg>
                      Tableau de bord
                    </a>
                  </Link>
                </li>
                <li>
                  <Link href="/admin/orders" legacyBehavior>
                    <a className={`${styles.adminMenuLink} ${activePage === 'orders' ? styles.activeAdminLink : ''}`}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                        <line x1="3" y1="6" x2="21" y2="6"></line>
                        <path d="M16 10a4 4 0 0 1-8 0"></path>
                      </svg>
                      Commandes
                    </a>
                  </Link>
                </li>
                <li>
                  <Link href="/admin/products" legacyBehavior>
                    <a className={`${styles.adminMenuLink} ${activePage === 'products' ? styles.activeAdminLink : ''}`}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                      </svg>
                      Produits
                    </a>
                  </Link>
                </li>
                <li>
                  <Link href="/admin/customers" legacyBehavior>
                    <a className={`${styles.adminMenuLink} ${activePage === 'customers' ? styles.activeAdminLink : ''}`}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                        <circle cx="9" cy="7" r="4"></circle>
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                      </svg>
                      Clients
                    </a>
                  </Link>
                </li>
                <li>
                  <Link href="/admin/settings" legacyBehavior>
                    <a className={`${styles.adminMenuLink} ${activePage === 'settings' ? styles.activeAdminLink : ''}`}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="3"></circle>
                        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                      </svg>
                      Paramètres
                    </a>
                  </Link>
                </li>
                <li className={styles.divider}>
                  <a 
                    href="#" 
                    className={`${styles.adminMenuLink} ${styles.logoutLink}`}
                    onClick={(e) => {
                      e.preventDefault();
                      localStorage.removeItem('userEmail');
                      localStorage.removeItem('token');
                      localStorage.removeItem('role');
                      sessionStorage.removeItem('userEmail');
                      sessionStorage.removeItem('token');
                      sessionStorage.removeItem('role');
                      window.location.href = '/login';
                    }}
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

        {/* Menu hamburger pour mobile */}
        <button 
          className={`${styles.mobileMenuToggle} ${menuOpen ? styles.mobileMenuToggleActive : ''}`}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      {/* Overlay pour fermer le menu en cliquant à l'extérieur sur mobile */}
      {menuOpen && (
        <div 
          className={styles.mobileOverlay}
          onClick={closeMenu}
        ></div>
      )}
    </header>
  );
};

export default HeaderAdmin;