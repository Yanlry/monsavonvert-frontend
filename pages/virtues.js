'use client';

import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import styles from '../styles/virtues.module.css';

export default function VertusBienfaits() {
  // État pour détecter si nous sommes côté client
  const [isClient, setIsClient] = useState(false);
  
  // État pour l'animation du header au scroll
  const [scrolled, setScrolled] = useState(false);
  
  // État pour le panier (simulé)
  const [cartCount, setCartCount] = useState(0);
  
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
      
      // Récupérer le nombre d'articles dans le panier
      try {
        const storedCart = JSON.parse(localStorage.getItem('cart')) || [];
        const totalItems = storedCart.reduce((sum, item) => sum + item.quantity, 0);
        setCartCount(totalItems);
        console.log('Nombre d\'articles dans le panier:', totalItems);
      } catch (error) {
        console.error('Erreur lors du chargement du panier:', error);
      }
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

  // Données sur les bienfaits du savon d'Alep
  const alepSoapBenefits = [
    {
      id: 1,
      icon: "🌿",
      title: "Purement Naturel",
      description: "Fabriqué uniquement avec de l'huile d'olive, de l'huile de baie de laurier et de la soude, sans parfums ni colorants artificiels"
    },
    {
      id: 2,
      icon: "🧴",
      title: "Adapté à tous",
      description: "Convient à tous les types de peau, même les plus sensibles et réactives, grâce à son pH neutre et sa formule douce"
    },
    {
      id: 3,
      icon: "⏳",
      title: "Savoir-faire millénaire",
      description: "Recette ancestrale originaire de Syrie transmise de génération en génération depuis plus de 3000 ans"
    }
  ];

  // Données sur les différentes concentrations
  const concentrationDetails = [
    {
      id: 1,
      percentage: "5%",
      title: "Savon d'Alep Doux",
      image: "/images/5.JPEG",
      suitableFor: "Peaux sensibles, enfants, visage",
      benefits: [
        "Hydratation quotidienne de la peau",
        "Nettoyage doux sans dessécher",
        "Adapté aux peaux normales à sensibles",
        "Parfait pour le visage et le corps",
        "Convient à toute la famille, y compris les enfants"
      ],
      description: "Avec seulement 5% d'huile de baie de laurier, ce savon offre une action douce tout en préservant les bienfaits apaisants. Sa formule délicate en fait un choix parfait pour le soin quotidien du visage et du corps, même pour les peaux sensibles et celle des enfants. Il nettoie en profondeur sans agresser ni dessécher l'épiderme."
    },
    {
      id: 2,
      percentage: "20%",
      title: "Savon d'Alep Équilibrant",
      image: "/images/4.JPEG",
      suitableFor: "Peaux mixtes à grasses, imperfections, cheveux",
      benefits: [
        "Régulation naturelle du sébum",
        "Action purifiante contre les imperfections",
        "Effet apaisant sur les irritations",
        "Excellent pour l'acné légère à modérée",
        "Shampooing naturel pour cheveux gras"
      ],
      description: "Avec 20% d'huile de baie de laurier, ce savon offre un parfait équilibre entre action purifiante et hydratation. Sa concentration moyenne en fait un allié idéal pour les peaux à tendance grasse ou mixte. Ses propriétés antibactériennes naturelles aident à réguler le sébum, réduire les imperfections et apaiser les petites irritations cutanées."
    },
    {
      id: 3,
      percentage: "30%",
      title: "Savon d'Alep Intense",
      image: "/images/3.JPEG",
      suitableFor: "Problèmes cutanés, peaux très grasses, usage thérapeutique",
      benefits: [
        "Puissantes propriétés antiseptiques et cicatrisantes",
        "Soulagement des affections cutanées (eczéma, psoriasis)",
        "Action anti-acnéique renforcée",
        "Hydratation profonde des peaux très sèches",
        "Effet assainissant pour les cuirs chevelus à problèmes"
      ],
      description: "Avec 30% d'huile de baie de laurier, ce savon représente la concentration la plus élevée et la plus efficace. Sa formule puissante est recommandée pour les problèmes cutanés spécifiques. Traditionnellement utilisé pour ses vertus thérapeutiques, il offre un soulagement aux peaux souffrant d'eczéma, de psoriasis ou d'acné sévère grâce à ses exceptionnelles propriétés antiseptiques et cicatrisantes."
    }
  ];

  // Rendu de base sans contenu dynamique (pour éviter les erreurs d'hydratation)
  if (!isClient) {
    return (
      <>
        <Head>
          <title>Vertus & Bienfaits | MonSavonVert</title>
          <meta name="description" content="Découvrez tous les bienfaits des savons d'Alep et leurs différentes concentrations en huile de baie de laurier." />
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
        <title>Vertus & Bienfaits | MonSavonVert</title>
        <meta name="description" content="Découvrez tous les bienfaits des savons d'Alep et leurs différentes concentrations en huile de baie de laurier." />
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
              <h1 className={styles.pageTitle}>Vertus & Bienfaits</h1>
              <div className={styles.pageBreadcrumb}>
                <Link href="/" legacyBehavior><a>Accueil</a></Link>
                <span className={styles.breadcrumbSeparator}>/</span>
                <span className={styles.breadcrumbCurrent}>Vertu & bienfaits</span>
              </div>
            </div>
          </section>

          {/* Section d'introduction */}
          <section className={styles.introSection}>
            <div className={styles.container}>
              <div className={styles.introContent}>
                <span className={styles.sectionTag}>Le savon d'Alep</span>
                <h2 className={styles.introTitle}>Le trésor ancestral de la cosmétique</h2>
                <div className={styles.introText}>
                  <p>
                    Le savon d'Alep est considéré comme l'ancêtre de tous les savons durs. Originaire de la ville d'Alep en Syrie, ce savon traditionnel est fabriqué depuis plus de 3000 ans selon une recette et un savoir-faire transmis de génération en génération.
                  </p>
                  <p>
                    Sa composition est d'une simplicité remarquable : de l'huile d'olive, de l'huile de baie de laurier et de la soude. C'est la concentration en huile de baie de laurier qui détermine ses propriétés et ses bienfaits spécifiques.
                  </p>
                  <p>
                    Ce savon 100% naturel est reconnu pour ses exceptionnelles propriétés dermatologiques. Sa richesse en antioxydants, en vitamines et en acides gras essentiels en fait un allié précieux pour tous les types de peau, même les plus sensibles.
                  </p>
                </div>
              </div>
              <div className={styles.introImageWrapper}>
                <img src="/images/8.JPEG" alt="Savon d'Alep traditionnel" className={styles.introImage} />
                <div className={styles.introBadges}>
                  <div className={styles.introBadge}>
                    <span>100%</span>
                    <p>Naturel</p>
                  </div>
                  <div className={styles.introBadge}>
                    <span>3000+</span>
                    <p>Ans d'histoire</p>
                  </div>
                  <div className={styles.introBadge}>
                    <span>0%</span>
                    <p>Additifs chimiques</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section sur l'huile de baie de laurier */}
          <section className={styles.laurelSection}>
            <div className={styles.container}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>L'huile de baie de laurier: le secret de ses vertus</h2>
                <p className={styles.sectionSubtitle}>
                  Comprendre le composant magique qui donne au savon d'Alep toutes ses propriétés
                </p>
              </div>
              
              <div className={styles.laurelContent}>
                <div className={styles.laurelImageWrapper}>
                  <img src="/images/7.JPEG" alt="Huile de baie de laurier" className={styles.laurelImage} />
                </div>
                <div className={styles.laurelInfo}>
                  <h3>Un concentré de bienfaits naturels</h3>
                  <p>
                    L'huile de baie de laurier est extraite des baies du laurier noble (Laurus nobilis), un arbuste méditerranéen aux vertus médicinales reconnues depuis l'Antiquité. Riche en composés actifs, cette huile précieuse est le secret qui fait du savon d'Alep un produit d'exception.
                  </p>
                  
                  <h3>Ses propriétés exceptionnelles</h3>
                  <ul className={styles.propertiesList}>
                    <li>
                      <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                        <polyline points="22 4 12 14.01 9 11.01"></polyline>
                      </svg>
                      <span>
                        <strong>Antiseptique & antibactérienne</strong> - Combat naturellement les bactéries et prévient les infections cutanées
                      </span>
                    </li>
                    <li>
                      <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                        <polyline points="22 4 12 14.01 9 11.01"></polyline>
                      </svg>
                      <span>
                        <strong>Anti-inflammatoire</strong> - Apaise les irritations et réduit les rougeurs cutanées
                      </span>
                    </li>
                    <li>
                      <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                        <polyline points="22 4 12 14.01 9 11.01"></polyline>
                      </svg>
                      <span>
                        <strong>Séborégulatrice</strong> - Équilibre la production de sébum, idéale pour les peaux mixtes à grasses
                      </span>
                    </li>
                    <li>
                      <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                        <polyline points="22 4 12 14.01 9 11.01"></polyline>
                      </svg>
                      <span>
                        <strong>Cicatrisante</strong> - Favorise la guérison des petites lésions et accélère la régénération cellulaire
                      </span>
                    </li>
                    <li>
                      <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                        <polyline points="22 4 12 14.01 9 11.01"></polyline>
                      </svg>
                      <span>
                        <strong>Antioxydante</strong> - Protège la peau contre les agressions extérieures et les radicaux libres
                      </span>
                    </li>
                  </ul>
                  
                  <p className={styles.laurelNote}>
                    <strong>La concentration en huile de baie de laurier est clé :</strong> Plus le pourcentage est élevé, plus les propriétés curatives du savon sont intenses. C'est cette concentration qui détermine l'efficacité du savon selon les différents types de peau et problèmes cutanés.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Caractéristiques générales du savon d'Alep */}
          <section className={styles.featuresSection}>
            <div className={styles.container}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Pourquoi choisir le savon d'Alep ?</h2>
                <p className={styles.sectionSubtitle}>
                  Un produit d'exception aux multiples vertus pour votre peau et l'environnement
                </p>
              </div>
              
              <div className={styles.featuresContainer}>
                <div className={styles.featuresGrid}>
                  {alepSoapBenefits.map((feature) => (
                    <div key={feature.id} className={styles.featureCard}>
                      <div className={styles.featureIcon}>{feature.icon}</div>
                      <h3 className={styles.featureTitle}>{feature.title}</h3>
                      <p className={styles.featureDescription}>{feature.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Sections des différentes concentrations */}
          <section className={styles.concentrationsSection}>
            <div className={styles.container}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Les différentes concentrations et leurs bienfaits</h2>
                <p className={styles.sectionSubtitle}>
                  Chaque concentration d'huile de baie de laurier offre des vertus spécifiques adaptées à vos besoins
                </p>
              </div>
              
              <div className={styles.concentrationsContent}>
                {concentrationDetails.map((concentration, index) => (
                  <div key={concentration.id} className={`${styles.concentrationCard} ${index % 2 !== 0 ? styles.reverseCard : ''}`}>
                    <div className={styles.concentrationImageWrapper}>
                      <div className={styles.concentrationPercentage}>
                        <span>{concentration.percentage}</span>
                        <p>Huile de<br />baie de laurier</p>
                      </div>
                      <img 
                        src={concentration.image} 
                        alt={`Savon d'Alep ${concentration.percentage} huile de baie de laurier`} 
                        className={styles.concentrationImage}
                      />
                    </div>
                    <div className={styles.concentrationInfo}>
                      <h3 className={styles.concentrationTitle}>{concentration.title}</h3>
                      <div className={styles.concentrationSuitable}>
                        <span>Idéal pour :</span> {concentration.suitableFor}
                      </div>
                      <p className={styles.concentrationDescription}>
                        {concentration.description}
                      </p>
                      <h4 className={styles.benefitsTitle}>Bienfaits spécifiques</h4>
                      <ul className={styles.benefitsList}>
                        {concentration.benefits.map((benefit, idx) => (
                          <li key={idx}>
                            <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none">
                              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                              <polyline points="22 4 12 14.01 9 11.01"></polyline>
                            </svg>
                            <span>{benefit}</span>
                          </li>
                        ))}
                      </ul>
                      <a href={`/store#savon-${concentration.percentage.replace('%', '')}`} className={styles.shopButton}>
                        Découvrir le savon à {concentration.percentage}
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Guide de choix */}
          <section className={styles.guideSection}>
            <div className={styles.container}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Comment choisir votre savon d'Alep ?</h2>
                <p className={styles.sectionSubtitle}>
                  Guide simple pour sélectionner la concentration parfaite selon votre type de peau
                </p>
              </div>
              
              <div className={styles.guideContent}>
                <div className={styles.guideTable}>
                  <div className={styles.guideTableHeader}>
                    <div className={styles.guideTableCell}>Type de peau/Besoin</div>
                    <div className={styles.guideTableCell}>Concentration recommandée</div>
                    <div className={styles.guideTableCell}>Pourquoi</div>
                  </div>
                  
                  <div className={styles.guideTableRow}>
                    <div className={styles.guideTableCell}>
                      <strong>Peau normale à sèche</strong>
                    </div>
                    <div className={styles.guideTableCell}>
                      <span className={styles.concentrationTag}>5%</span>
                    </div>
                    <div className={styles.guideTableCell}>
                      Hydratation légère, nettoyage doux quotidien
                    </div>
                  </div>
                  
                  <div className={styles.guideTableRow}>
                    <div className={styles.guideTableCell}>
                      <strong>Peau sensible/Enfants</strong>
                    </div>
                    <div className={styles.guideTableCell}>
                      <span className={styles.concentrationTag}>5%</span>
                    </div>
                    <div className={styles.guideTableCell}>
                      Formule douce, apaisante, non irritante
                    </div>
                  </div>
                  
                  <div className={styles.guideTableRow}>
                    <div className={styles.guideTableCell}>
                      <strong>Peau mixte</strong>
                    </div>
                    <div className={styles.guideTableCell}>
                      <span className={styles.concentrationTag}>5-20%</span>
                    </div>
                    <div className={styles.guideTableCell}>
                      Équilibre entre hydratation et régulation du sébum
                    </div>
                  </div>
                  
                  <div className={styles.guideTableRow}>
                    <div className={styles.guideTableCell}>
                      <strong>Peau grasse/Acné légère</strong>
                    </div>
                    <div className={styles.guideTableCell}>
                      <span className={styles.concentrationTag}>20%</span>
                    </div>
                    <div className={styles.guideTableCell}>
                      Propriétés séborégulatrices et antibactériennes
                    </div>
                  </div>
                  
                  <div className={styles.guideTableRow}>
                    <div className={styles.guideTableCell}>
                      <strong>Acné modérée à sévère</strong>
                    </div>
                    <div className={styles.guideTableCell}>
                      <span className={styles.concentrationTag}>20-30%</span>
                    </div>
                    <div className={styles.guideTableCell}>
                      Action antiseptique puissante, diminue l'inflammation
                    </div>
                  </div>
                  
                  <div className={styles.guideTableRow}>
                    <div className={styles.guideTableCell}>
                      <strong>Eczéma/Psoriasis</strong>
                    </div>
                    <div className={styles.guideTableCell}>
                      <span className={styles.concentrationTag}>30%</span>
                    </div>
                    <div className={styles.guideTableCell}>
                      Effet apaisant intense, propriétés anti-inflammatoires et cicatrisantes
                    </div>
                  </div>
                  
                  <div className={styles.guideTableRow}>
                    <div className={styles.guideTableCell}>
                      <strong>Cheveux gras</strong>
                    </div>
                    <div className={styles.guideTableCell}>
                      <span className={styles.concentrationTag}>20%</span>
                    </div>
                    <div className={styles.guideTableCell}>
                      Régule l'excès de sébum, purifie le cuir chevelu
                    </div>
                  </div>
                  
                  <div className={styles.guideTableRow}>
                    <div className={styles.guideTableCell}>
                      <strong>Pellicules/Démangeaisons</strong>
                    </div>
                    <div className={styles.guideTableCell}>
                      <span className={styles.concentrationTag}>30%</span>
                    </div>
                    <div className={styles.guideTableCell}>
                      Propriétés antifongiques, apaise le cuir chevelu
                    </div>
                  </div>
                </div>
                
                <div className={styles.guideNote}>
                  <div className={styles.guideNoteIcon}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="8" x2="12" y2="12"></line>
                      <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                  </div>
                  <div className={styles.guideNoteContent}>
                    <h4>Conseil d'utilisation</h4>
                    <p>
                      Si vous utilisez le savon d'Alep pour la première fois, nous recommandons de commencer par la concentration à 5%, particulièrement si vous avez la peau sensible. Vous pourrez ensuite augmenter progressivement la concentration selon les besoins de votre peau.
                    </p>
                    <p>
                      Pour les problèmes cutanés spécifiques, consultez un dermatologue avant d'utiliser la concentration à 30%.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section utilisation optimale */}
          <section className={styles.usageSection}>
            <div className={styles.container}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Comment utiliser votre savon d'Alep</h2>
                <p className={styles.sectionSubtitle}>
                  Maximisez les bienfaits de votre savon avec ces conseils d'utilisation
                </p>
              </div>
              
              <div className={styles.usageContent}>
                <div className={styles.usageStep}>
                  <div className={styles.usageStepNumber}>1</div>
                  <div className={styles.usageStepContent}>
                    <h3>Préparation</h3>
                    <p>
                      Mouillez votre peau avec de l'eau tiède pour ouvrir les pores. Humidifiez également le savon d'Alep.
                    </p>
                  </div>
                </div>
                
                <div className={styles.usageStep}>
                  <div className={styles.usageStepNumber}>2</div>
                  <div className={styles.usageStepContent}>
                    <h3>Application</h3>
                    <p>
                      Frottez doucement le savon entre vos mains pour créer une mousse riche et crémeuse. Appliquez sur la peau en massant délicatement avec des mouvements circulaires.
                    </p>
                  </div>
                </div>
                
                <div className={styles.usageStep}>
                  <div className={styles.usageStepNumber}>3</div>
                  <div className={styles.usageStepContent}>
                    <h3>Temps de pause</h3>
                    <p>
                      Pour les problèmes cutanés spécifiques, laissez la mousse agir 1 à 2 minutes sur la peau afin que les principes actifs puissent pénétrer et faire effet.
                    </p>
                  </div>
                </div>
                
                <div className={styles.usageStep}>
                  <div className={styles.usageStepNumber}>4</div>
                  <div className={styles.usageStepContent}>
                    <h3>Rinçage</h3>
                    <p>
                      Rincez abondamment à l'eau tiède puis terminez par un jet d'eau fraîche pour refermer les pores et tonifier la peau.
                    </p>
                  </div>
                </div>
                
                <div className={styles.usageTips}>
                  <h3>Conseils pour prolonger la durée de vie de votre savon</h3>
                  <ul>
                    <li>
                      <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none">
                        <polyline points="9 11 12 14 22 4"></polyline>
                        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
                      </svg>
                      <span>Utilisez un porte-savon drainant pour éviter que le savon ne baigne dans l'eau</span>
                    </li>
                    <li>
                      <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none">
                        <polyline points="9 11 12 14 22 4"></polyline>
                        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
                      </svg>
                      <span>Conservez le savon dans un endroit sec et aéré entre chaque utilisation</span>
                    </li>
                    <li>
                      <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none">
                        <polyline points="9 11 12 14 22 4"></polyline>
                        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
                      </svg>
                      <span>Coupez le savon en deux pour n'utiliser qu'une moitié à la fois</span>
                    </li>
                    <li>
                      <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none">
                        <polyline points="9 11 12 14 22 4"></polyline>
                        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
                      </svg>
                      <span>Laissez sécher le savon après chaque utilisation</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* CTA final */}
          <section className={styles.ctaSection}>
            <div className={styles.container}>
              <div className={styles.ctaContent}>
                <h2>Prêt à découvrir les bienfaits du savon d'Alep ?</h2>
                <p>
                  Choisissez la concentration adaptée à votre peau et profitez de tous les bienfaits de ce trésor ancestral de la cosmétique naturelle.
                </p>
                <Link href="/store" legacyBehavior>
                  <a className={styles.ctaButton}>
                    Découvrir notre gamme de savons d'Alep
                  </a>
                </Link>
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