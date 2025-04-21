import Link from "next/link";
import { useContext, useState, useEffect } from "react";
import { UserContext } from "../context/UserContext";
import styles from "../styles/header.module.css";

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

  // Fonction pour fermer le menu quand on clique sur un lien
  const closeMenu = () => {
    setMenuOpen(false);
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
            <Link href="/profile" className={styles.userAccountConnected} aria-label="Mon compte">
              <div className={styles.userAvatar}>
                {user.firstName ? user.firstName.charAt(0).toUpperCase() : "?"}
              </div>
              <div className={styles.userInfo}>
                <span className={styles.welcomeText}>Bonjour,</span>
                <span className={styles.userName}>{user.firstName}</span>
              </div>
            </Link>
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