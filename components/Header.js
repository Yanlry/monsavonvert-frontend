import Link from "next/link";
import { useContext, useState, useEffect } from "react";
import { UserContext } from "../context/UserContext";
import styles from "../styles/header.module.css"; // Nous utiliserons un nouveau fichier CSS

export default function Header({ cartCount }) {
  const { user } = useContext(UserContext);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

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

  return (
    <header className={`${styles.header} ${scrolled ? styles.headerScrolled : ""}`}>
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
                        <Link href="/boutique/peaux-sensibles" legacyBehavior>
                          <a>Peaux sensibles</a>
                        </Link>
                        <Link href="/boutique/hydratation" legacyBehavior>
                          <a>Hydratation intense</a>
                        </Link>
                      </div>
                      <div className={styles.megaMenuImage}>
                        <p>Nouveau</p>
                        <img src="/images/2.JPEG" alt="Nouvelle collection" />
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

        {/* Barre d'outils utilisateur améliorée */}
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
          
          {user ? (
            // Si l'utilisateur est connecté - Version améliorée
            <Link href="/profile" legacyBehavior>
              <a className={styles.userAccountConnected} aria-label="Mon compte">
                <div className={styles.userAvatar}>
                  {user.firstName ? user.firstName.charAt(0).toUpperCase() : '?'}
                </div>
                <div className={styles.userInfo}>
                  <span className={styles.welcomeText}>Bonjour,</span>
                  <span className={styles.userName}>{user.firstName}</span>
                </div>
              </a>
            </Link>
          ) : (
            // Si l'utilisateur n'est pas connecté - Version améliorée
            <Link href="/login" legacyBehavior>
              <a className={styles.userAccount} aria-label="Se connecter">
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
              </a>
            </Link>
          )}
          
          <Link href="/cart" legacyBehavior>
            <a className={styles.cartLink} aria-label="Panier">
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
                {cartCount > 0 && (
                  <span className={styles.cartCount}>{cartCount}</span>
                )}
              </div>
            </a>
          </Link>
        </div>
        
        {/* Menu hamburger pour mobile */}
        <button 
          className={`${styles.mobileMenuToggle} ${menuOpen ? styles.active : ''}`} 
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </header>
  );
}