'use client';

import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import styles from '../styles/info.module.css';
import Header from "../components/Header";

export default function AboutPage() {
  // État pour détecter si nous sommes côté client
  const [isClient, setIsClient] = useState(false);
  
  // État pour l'animation du header au scroll
  const [scrolled, setScrolled] = useState(false);
  
  // État pour le panier (simulé)
  const [cartCount, setCartCount] = useState(0);
  
  // Fonction pour simuler l'ajout au panier
  const addToCart = () => {
    setCartCount(cartCount + 1);
    if (typeof window !== 'undefined') {
      const cartIcon = document.getElementById('cartIcon');
      if (cartIcon) {
        cartIcon.classList.add(styles.cartBump);
        setTimeout(() => cartIcon.classList.remove(styles.cartBump), 300);
      }
    }
  };

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
    const storedCart = JSON.parse(localStorage.getItem('cart')) || [];
    const totalItems = storedCart.reduce((sum, item) => sum + item.quantity, 0);
    setCartCount(totalItems);
  }, []);

  
  // Données de la timeline
  const timelineItems = [
    {
      year: "2018",
      content: "Création de MonSavonVert dans la cuisine de Marie et Thomas. Premiers savons vendus sur les marchés locaux.",
      position: "left"
    },
    {
      year: "2019",
      content: "Déménagement dans notre premier atelier et lancement de notre boutique en ligne. Développement de notre gamme de produits.",
      position: "right"
    },
    {
      year: "2020",
      content: "Certification officielle de nos produits biologiques. Partenariats avec des boutiques éco-responsables dans toute la France.",
      position: "left"
    },
    {
      year: "2022",
      content: "Acquisition de notre ferme actuelle et installation de notre nouvel atelier avec des équipements plus respectueux de l'environnement.",
      position: "right"
    },
    {
      year: "2024",
      content: "Lancement de notre programme zéro-déchet et de notre nouvelle gamme de savons spécialisés pour tous types de peau.",
      position: "left"
    }
  ];

  // Données des valeurs
  const values = [
    {
      title: "Durabilité",
      description: "Nous fabriquons nos produits de manière à minimiser notre impact sur l'environnement, en utilisant des ingrédients biologiques et des emballages recyclables ou compostables.",
      icon: "🌱"
    },
    {
      title: "Transparence",
      description: "Nous sommes totalement transparents sur les ingrédients que nous utilisons et nos méthodes de fabrication. Aucun secret, juste des produits naturels.",
      icon: "👁️"
    },
    {
      title: "Qualité",
      description: "Nous ne compromettrons jamais la qualité de nos produits. Chaque savon est fabriqué avec soin et attention, en utilisant les meilleurs ingrédients.",
      icon: "⭐"
    },
    {
      title: "Éthique",
      description: "Nous croyons en un commerce équitable et respectueux. Tous nos ingrédients sont sourcés de manière éthique et nous payons un prix juste à nos fournisseurs.",
      icon: "🤝"
    },
  ];

  // Rendu de base sans contenu dynamique (pour éviter les erreurs d'hydratation)
  if (!isClient) {
    return (
      <>
        <Head>
          <title>À propos | MonSavonVert</title>
          <meta name="description" content="Découvrez notre histoire, nos valeurs et notre équipe passionnée de savonniers artisanaux." />
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
        <title>À propos | MonSavonVert</title>
        <meta name="description" content="Découvrez notre histoire, nos valeurs et notre équipe passionnée de savonniers artisanaux." />
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      <div className={styles.container}>
        {/* Header avec navigation */}
        <header className={`${styles.header} ${scrolled ? styles.headerScrolled : ''}`}>
                         <Header cartCount={cartCount}/>
         
        </header>

        <main className={styles.mainContent}>
          {/* Hero section */}
          <section className={styles.pageHero}>
            <div className={styles.pageHeroContent}>
              <h1 className={styles.pageTitle}>Notre Histoire</h1>
              <div className={styles.pageBreadcrumb}>
                <Link href="/" legacyBehavior><a>Accueil</a></Link>
                <span className={styles.breadcrumbSeparator}>/</span>
                <span className={styles.breadcrumbCurrent}>À propos</span>
              </div>
            </div>
          </section>

          {/* Introduction section */}
          <section className={styles.introSection}>
            <div className={styles.introImageColumn}>
              <div className={styles.introImage}>
                <img src="/images/1.JPEG" alt="Notre histoire" />
              </div>
            </div>
            <div className={styles.introContentColumn}>
              <div className={styles.introContent}>
                <span className={styles.sectionTag}>À propos de nous</span>
                <h2 className={styles.introTitle}>Notre passion, notre histoire</h2>
                <p className={styles.introParagraph}>
                  Fondée en 2018 par Marie et Thomas, MonSavonVert est née d'une passion commune pour les produits naturels et écologiques. Après des années à travailler dans l'industrie cosmétique, nous avons décidé de revenir à l'essentiel : des produits simples, authentiques et respectueux de l'environnement.
                </p>
                <p className={styles.introParagraph}>
                  Notre atelier, situé au cœur d'une petite ferme biologique dans le sud de la France, nous permet de cultiver nous-mêmes certains des ingrédients que nous utilisons dans nos savons. Chaque savon est fabriqué à la main, en petits lots, selon des méthodes traditionnelles.
                </p>
                <p className={styles.introParagraph}>
                  Nous croyons fermement que prendre soin de sa peau ne devrait pas nuire à notre planète. C'est pourquoi nous nous engageons à utiliser uniquement des ingrédients biologiques et des emballages compostables ou recyclables.
                </p>
                <div className={styles.introCertifications}>
                  <div className={styles.certificationBadge}>
                    <img src="/images/bio.png" alt="Certification Bio" />
                    <span>Bio</span>
                  </div>
                  <div className={styles.certificationBadge}>
                    <img src="/images/cruelty-free.png" alt="Cruelty Free" />
                    <span>Sans cruauté</span>
                  </div>
                  <div className={styles.certificationBadge}>
                    <img src="/images/vegan.png" alt="Vegan" />
                    <span>Vegan</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Timeline section */}
          <section className={styles.timelineSection}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Notre parcours</h2>
              <p className={styles.sectionSubtitle}>L'évolution de MonSavonVert au fil des années</p>
            </div>
            
            <div className={styles.timeline}>
              {timelineItems.map((item, index) => (
                <div 
                  key={index} 
                  className={`${styles.timelineItem} ${item.position === 'left' ? styles.timelineItemLeft : styles.timelineItemRight}`}
                >
                  <div className={styles.timelinePoint}></div>
                  <div className={`${styles.timelineContent} ${item.position === 'left' ? styles.timelineContentLeft : styles.timelineContentRight}`}>
                    <div className={styles.timelineYear}>{item.year}</div>
                    <p className={styles.timelineText}>{item.content}</p>
                  </div>
                </div>
              ))}
              <div className={styles.timelineLine}></div>
            </div>
          </section>
          
          {/* Values section */}
          <section className={styles.valuesSection}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Nos valeurs</h2>
              <p className={styles.sectionSubtitle}>Les principes qui guident chacune de nos actions</p>
            </div>
            
            <div className={styles.valuesGrid}>
              {values.map((value, index) => (
                <div key={index} className={styles.valueCard}>
                  <div className={styles.valueIcon}>{value.icon}</div>
                  <h3 className={styles.valueTitle}>{value.title}</h3>
                  <p className={styles.valueDescription}>{value.description}</p>
                </div>
              ))}
            </div>
          </section>
          
          {/* Contact CTA section */}
          <section className={styles.contactCta}>
            <div className={styles.ctaContent}>
              <h2 className={styles.ctaTitle}>Envie d'en savoir plus ?</h2>
              <p className={styles.ctaText}>
                Vous souhaitez découvrir davantage sur notre histoire ou notre processus de fabrication ?
              </p>
              <Link href="/contact" legacyBehavior>
                <a className={`${styles.button} ${styles.primaryButton}`}>
                  Contactez-nous
                </a>
              </Link>
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