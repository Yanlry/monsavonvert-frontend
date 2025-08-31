"use client";

import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import Header from "../components/Header";
import Footer from "../components/footer"; // NOUVEAU: Import du composant footer
import styles from "../styles/home.module.css";

export default function Home() {
  // État pour détecter si nous sommes côté client
  const [isClient, setIsClient] = useState(false);

  // État pour gérer le slider du hero
  const [currentSlide, setCurrentSlide] = useState(0);
  const totalSlides = 3;

  // État pour l'animation du header au scroll
  const [scrolled, setScrolled] = useState(false);

  // État pour le panier (simulé)
  const [cartCount, setCartCount] = useState(0);

  // Références pour les animations
  const heroRef = useRef(null);
  const featuredRef = useRef(null);
  const categoriesRef = useRef(null);
  const aboutRef = useRef(null);
  const featuresRef = useRef(null);
  const testimonialRef = useRef(null);

  // Animation au scroll
  const handleScrollAnimation = () => {
    const elements = [
      heroRef,
      featuredRef,
      categoriesRef,
      aboutRef,
      featuresRef,
      testimonialRef,
    ];

    elements.forEach((ref) => {
      if (!ref.current) return;

      const rect = ref.current.getBoundingClientRect();
      const isVisible = rect.top < window.innerHeight - 100;

      if (isVisible) {
        ref.current.classList.add(styles.animateIn);
      }
    });
  };

  // Effets au chargement
  useEffect(() => {
    // Marquer que nous sommes côté client
    setIsClient(true);

    // Réinitialisation des marges
    document.body.classList.add(styles.resetMargins);
    document.documentElement.classList.add(styles.resetMargins);

    // Détection du scroll pour le header
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
      handleScrollAnimation();
    };

    // Animation du slider automatique
    const sliderTimer = setInterval(() => {
      setCurrentSlide((prev) => (prev === totalSlides - 1 ? 0 : prev + 1));
    }, 6000);

    // Gestionnaires d'événements
    window.addEventListener("scroll", handleScroll);

    // Déclencher l'animation initiale
    setTimeout(handleScrollAnimation, 500);

    // Nettoyage
    return () => {
      document.body.classList.remove(styles.resetMargins);
      document.documentElement.classList.remove(styles.resetMargins);
      window.removeEventListener("scroll", handleScroll);
      clearInterval(sliderTimer);
    };
  }, [totalSlides]);

  useEffect(() => {
    // Synchroniser le nombre d'articles dans le panier avec le localStorage
    const storedCart = localStorage.getItem("cart")
      ? JSON.parse(localStorage.getItem("cart"))
      : [];
    const totalItems = Array.isArray(storedCart)
      ? storedCart.reduce((sum, item) => sum + (item.quantity || 0), 0)
      : 0;
    setCartCount(totalItems);

    // Log pour diagnostic
    console.log("Cart data loaded:", { storedCart, totalItems });
  }, []);

  // Slides du hero
  const heroSlides = [
    {
      image: "/images/6.JPEG",
      title: "Savons artisanaux, naturels et écologiques",
      subtitle:
        "Découvrez notre collection ancestrale fabriqué avec des ingrédients naturels",
    },
    {
      image: "/images/4.JPEG",
      title: "Fabrication Syrienne, ingrédients locaux",
      subtitle:
        "Tradition et savoir-faire syrien pour des produits authentiques et de qualité",
    },
    {
      image: "/images/5.JPEG",
      title: "Prendre soin de votre peau et de la planète",
      subtitle:
        "Des formules douces et respectueuses pour un bien-être quotidien",
    },
  ];

  // Fonctionnalités/avantages de la marque
  const brandFeatures = [
    {
      id: 1,
      icon: (
        <svg
          viewBox="0 0 24 24"
          width="36"
          height="36"
          stroke="currentColor"
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 2a3 3 0 0 0-3 3c0 1.5 1 3 1 3s1-1.5 1-3a3 3 0 0 0-3-3z" />
          <path d="M7.64 6.64a7 7 0 1 0 8.72 0" />
          <path d="M12 10v4" />
          <path d="M8 18c2-2 4-2 4-2s2 0 4 2" />
        </svg>
      ),
      title: "100% Naturel",
      description:
        "Ingrédients certifiés biologiques, sans produits chimiques ni conservateurs artificiels",
    },
    {
      id: 2,
      icon: (
        <svg
          viewBox="0 0 24 24"
          width="36"
          height="36"
          stroke="currentColor"
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z" />
          <line x1="16" y1="8" x2="2" y2="22" />
          <line x1="17.5" y1="15" x2="9" y2="15" />
        </svg>
      ),
      title: "Fabrication Artisanale",
      description:
        "Chaque savon est fabriqués selon la tradition syrienne utilisant des méthodes ancestrales",
    },
    {
      id: 3,
      icon: (
        <svg
          viewBox="0 0 24 24"
          width="36"
          height="36"
          stroke="currentColor"
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      ),
      title: "Écoresponsable",
      description:
        "Emballages biodégradables et minimisés pour réduire notre impact environnemental",
    },
    {
      id: 4,
      icon: (
        <svg
          viewBox="0 0 24 24"
          width="36"
          height="36"
          stroke="currentColor"
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
        </svg>
      ),
      title: "Qualité Premium",
      description:
        "Des produits de haute qualité conçus pour nourrir et respecter votre peau",
    },
  ];

  // Catégories produits
  const productCategories = [
    {
      id: 1,
      name: "Douceur Quotidienne",
      percentage: "5%",
      icon: (
        <svg
          viewBox="0 0 24 24"
          width="24"
          height="24"
          stroke="currentColor"
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 2L2 7v10c0 5.55 3.84 10 9 10s9-4.45 9-10V7l-10-5z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      ),
      description: "Savon d'Alep doux pour peaux sensibles et usage quotidien",
      suitableFor: "Peaux sèches, peaux normales, enfants",
      link: "/produit/680bd95433437078ee079529",
      image: "/images/1.JPEG",
    },
    {
      id: 2,
      name: "Équilibre & Purification",
      percentage: "20%",
      icon: (
        <svg
          viewBox="0 0 24 24"
          width="24"
          height="24"
          stroke="currentColor"
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 2a3 3 0 0 0-3 3c0 1.5 1 3 1 3s1-1.5 1-3a3 3 0 0 0-3-3z" />
          <path d="M7.64 6.64a7 7 0 1 0 8.72 0" />
          <path d="M12 10v4" />
        </svg>
      ),
      description:
        "Savon d'Alep équilibrant pour peaux mixtes et imperfections",
      suitableFor: "Peaux mixtes, acné légère, cuir chevelu gras",
      link: "/produit/680a5ac9841615e1719b023b",
      image: "/images/2.JPEG",
    },
    {
      id: 3,
      name: "Soin Intensif",
      percentage: "35%",
      icon: (
        <svg
          viewBox="0 0 24 24"
          width="24"
          height="24"
          stroke="currentColor"
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
      ),
      description:
        "Savon d'Alep thérapeutique pour problèmes cutanés spécifiques",
      suitableFor: "Eczéma, psoriasis, acné sévère",
      link: "/produit/67fe455e3de677d3ffa1cf89",
      image: "/images/3.JPEG",
    },
  ];

  // Rendu de base sans contenu dynamique (pour éviter les erreurs d'hydratation)
  if (!isClient) {
    return (
      <>
        {/* PREMIER BLOC HEAD CORRIGÉ - Utilise maintenant logo.png */}
        <Head>
          <title>MonSavonVert | Un savon ancestral et écologique</title>
          <meta name="description" content="Savons artisanaux et cosmétiques naturels. Ingrédients 100% naturel." />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          
          {/* Favicon utilisant votre logo.png */}
          <link rel="icon" type="image/png" href="/logo.png" />
          <link rel="shortcut icon" type="image/png" href="/logo.png" />
          
          {/* Pour les appareils Apple */}
          <link rel="apple-touch-icon" href="/logo.png" />
          
          {/* Méta tags Open Graph */}
          <meta property="og:title" content="MonSavonVert | Savonnerie Artisanale Bio" />
          <meta property="og:description" content="Découvrez nos savons artisanaux et produits de soins naturels, fabriqués selon la tradition syrienne avec des ingrédients naturels." />
          <meta property="og:image" content="/images/og-image.jpg" />
          
          {/* Polices Google */}
          <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700&family=Playfair+Display:wght@400;500;700&display=swap" rel="stylesheet" />
        </Head>
        <div className={styles.loadingWrapper}>
          <div className={styles.loadingLogo}>
            <span className={styles.loadingText}>MonSavonVert</span>
            <div className={styles.spinner}></div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {/* DEUXIÈME BLOC HEAD CORRIGÉ - Utilise maintenant logo.png au lieu de favicon.ico */}
      <Head>
        <title>MonSavonVert | Savonnerie Artisanale & Écologique</title>
        <meta
          name="description"
          content="Savons artisanaux et cosmétiques naturels fabriqués selon la tradition syrienne. Ingrédients 100% bio et emballages écologiques."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        
        {/* Favicon utilisant votre logo.png au lieu de favicon.ico */}
        <link rel="icon" type="image/png" href="/logo.png" />
        <link rel="shortcut icon" type="image/png" href="/logo.png" />
        
        {/* Pour les appareils Apple */}
        <link rel="apple-touch-icon" href="/logo.png" />
        
        <meta
          property="og:title"
          content="MonSavonVert | Savonnerie Artisanale Bio"
        />
        <meta
          property="og:description"
          content="Découvrez nos savons artisanaux et produits de soins naturels, fabriqués selon la tradition syrienne avec des ingrédients naturels."
        />
        <meta property="og:image" content="/images/og-image.jpg" />
        <link
          href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700&family=Playfair+Display:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </Head>

      <div className={styles.siteContainer}>
        {/* Header avec navigation */}
        <header
          className={`${styles.header} ${
            scrolled ? styles.headerScrolled : ""
          }`}
        >
          <Header cartCount={cartCount} />
        </header>

        <main className={styles.mainContent}>
          {/* Hero Section avec Slider */}
          <section ref={heroRef} className={styles.heroSection}>
            <div className={styles.heroOverlay}></div>
            <div
              className={styles.heroSlidesContainer}
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {heroSlides.map((slide, index) => (
                <div
                  key={index}
                  className={`${styles.heroSlide} ${
                    index === currentSlide ? styles.activeSlide : ""
                  }`}
                >
                  <div
                    className={styles.heroBackground}
                    style={{
                      backgroundImage: `url(${slide.image})`,
                    }}
                  ></div>
                  <div className={styles.heroContent}>
                    <h1 className={styles.heroTitle}>
                      {slide.title.split(" ").map((word, i) => (
                        <span
                          key={i}
                          className={styles.heroWord}
                          style={{
                            animationDelay: `${i * 0.1}s`,
                            marginRight: "0.3em", // Ajout d'une marge à droite
                          }}
                        >
                          {word}
                        </span>
                      ))}
                    </h1>
                    <p className={styles.heroSubtitle}>{slide.subtitle}</p>
                    <div className={styles.heroButtons}>
                      <Link href="/store" className={styles.primaryButton}>
                        <span>Découvrir nos produits</span>
                        <span className={styles.buttonIcon}>→</span>
                      </Link>
                      <Link href="/info" className={styles.secondaryButton}>
                        <span>Une histoire ancestrale</span>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Indicateurs de slide */}
            <div className={styles.heroIndicators}>
              {Array.from({ length: totalSlides }).map((_, index) => (
                <button
                  key={index}
                  className={`${styles.heroIndicator} ${
                    index === currentSlide ? styles.activeIndicator : ""
                  }`}
                  onClick={() => setCurrentSlide(index)}
                  aria-label={`Slide ${index + 1}`}
                >
                  <span className={styles.indicatorInner}></span>
                </button>
              ))}
            </div>

            <div className={styles.scrollIndicator}>
              <div className={styles.scrollIcon}>
                <div className={styles.scrollDot}></div>
              </div>
              <span>Découvrir</span>
            </div>
          </section>

          {/* Bannière de confiance */}
          <section className={styles.trustBanner}>
            <div className={styles.trustWrapper}>
              {/* Fabrication Syrienne - Icône maison/atelier */}
              <div className={styles.trustItem}>
                <div className={styles.trustIcon}>
                  <svg
                    viewBox="0 0 24 24"
                    width="24"
                    height="24"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    {/* Icône maison simple et claire */}
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    <polyline points="9,22 9,12 15,12 15,22" />
                  </svg>
                </div>
                <div className={styles.trustText}>
                  <span className={styles.trustTitle}>Fabrication</span>
                  <span className={styles.trustDesc}>Syrienne</span>
                </div>
              </div>

              {/* Ingrédients naturels - Icône feuille simple */}
              <div className={styles.trustItem}>
                <div className={styles.trustIcon}>
                  <svg
                    viewBox="0 0 24 24"
                    width="24"
                    height="24"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    {/* Icône feuille élégante et simple */}
                    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
                    <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
                  </svg>
                </div>
                <div className={styles.trustText}>
                  <span className={styles.trustTitle}>Ingrédients</span>
                  <span className={styles.trustDesc}>naturels</span>
                </div>
              </div>

              {/* Emballages réduits - Icône globe terrestre */}
              <div className={styles.trustItem}>
                <div className={styles.trustIcon}>
                  <svg
                    viewBox="0 0 24 24"
                    width="24"
                    height="24"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    {/* Icône globe simple et reconnaissable */}
                    <circle cx="12" cy="12" r="10" />
                    <path d="M2 12h20" />
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                  </svg>
                </div>
                <div className={styles.trustText}>
                  <span className={styles.trustTitle}>Emballages</span>
                  <span className={styles.trustDesc}>réduits</span>
                </div>
              </div>

              {/* Livraison offerte - Icône camion simple */}
              <div className={styles.trustItem}>
                <div className={styles.trustIcon}>
                  <svg
                    viewBox="0 0 24 24"
                    width="24"
                    height="24"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    {/* Icône camion épurée et claire */}
                    <rect x="1" y="3" width="15" height="13" />
                    <polygon points="16,8 20,8 23,11 23,16 16,16 16,8" />
                    <circle cx="5.5" cy="18.5" r="2.5" />
                    <circle cx="18.5" cy="18.5" r="2.5" />
                  </svg>
                </div>
                <div className={styles.trustText}>
                  <span className={styles.trustTitle}>Livraison offerte</span>
                  <span className={styles.trustDesc}>dès 29€</span>
                </div>
              </div>
            </div>
          </section>

          {/* Catégories de produits */}
          <section ref={categoriesRef} className={styles.categoriesSection}>
            <div className={styles.categoriesBgPattern}></div>
            <div className={styles.categoriesContainer}>
              <div className={styles.categoriesHeaderContainer}>
                <div className={styles.categoriesHeader}>
                  <div className={styles.headerDecorLine}></div>

                  <span className={styles.environmentTag}>Nos catégories</span>
                  <h2 className={styles.categoriesHeading}>
                    Trouvez votre{" "}
                    <span className={styles.categoryHighlight}>
                      savon parfait
                    </span>
                  </h2>
                  <p className={styles.categoriesSubheading}>
                    Explorez notre gamme complète de produits naturels et
                    écologiques adaptés à chaque type de peau.
                  </p>
                </div>
              </div>

              <div className={styles.categoryShowcase}>
                <div className={styles.categoryCardsRow}>
                  {productCategories.map((category, index) => {
                    // Définir les icônes simples pour chaque catégorie
                    const getSimpleIcon = (index) => {
                      switch (index) {
                        case 0: // Douceur Quotidienne
                          return (
                            <svg
                              viewBox="0 0 24 24"
                              width="24"
                              height="24"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              fill="none"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              {/* Icône coeur simple pour douceur */}
                              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                            </svg>
                          );
                        case 1: // Équilibre & Purification
                          return (
                            <svg
                              viewBox="0 0 24 24"
                              width="24"
                              height="24"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              fill="none"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              {/* Belle fleur comme dans la trust banner */}
                              <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
                              <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
                            </svg>
                          );
                        case 2: // Soin Intensif
                          return (
                            <svg
                              viewBox="0 0 24 24"
                              width="24"
                              height="24"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              fill="none"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              {/* Icône bouclier pour protection/soin intensif */}
                              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                              <path d="M9 12l2 2 4-4" />
                            </svg>
                          );
                        default:
                          return (
                            <svg
                              viewBox="0 0 24 24"
                              width="24"
                              height="24"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              fill="none"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <circle cx="12" cy="12" r="10" />
                            </svg>
                          );
                      }
                    };

                    return (
                      <Link
                        key={category.id}
                        href={category.link}
                        className={`${styles.categoryCardNew} ${
                          styles[`categoryColor${index + 1}`]
                        }`}
                      >
                        <div className={styles.categoryGradientBg}></div>
                        <div className={styles.categoryMediaStack}>
                          <div className={styles.categoryImageFrame}>
                            <div
                              className={styles.categoryImageWrapper}
                              style={{
                                backgroundImage: `url(${category.image})`,
                              }}
                            >
                              <div className={styles.categoryImageFilter}></div>
                            </div>
                          </div>
                          <div className={styles.categoryBadge}>
                            <div className={styles.badgeContent}>
                              <span className={styles.badgeValue}>
                                {category.percentage}
                              </span>
                              <span className={styles.badgeType}>
                                Huile de
                                <br />
                                baie de laurier
                              </span>
                            </div>
                          </div>
                          <div className={styles.categoryIconCircle}>
                            <div className={styles.categoryIconWrapper}>
                              <span className={styles.categoryIconSymbol}>
                                {getSimpleIcon(index)}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className={styles.categoryDetailsContainer}>
                          <div className={styles.categoryHeader}>
                            <h3 className={styles.categoryTitle}>
                              {category.name}
                            </h3>
                            <div className={styles.categoryIndicator}>
                              <div
                                className={styles.categoryIndicatorDot}
                              ></div>
                            </div>
                          </div>

                          <p className={styles.categoryText}>
                            {category.description}
                          </p>

                          <div className={styles.categoryFooter}>
                            <div className={styles.categorySpecifics}>
                              <span className={styles.categorySpecTitle}>
                                Idéal pour:
                              </span>
                              <span className={styles.categorySpecValue}>
                                {category.suitableFor}
                              </span>
                            </div>

                            <div className={styles.categoryAction}>
                              <span className={styles.categoryActionText}>
                                Découvrir
                              </span>
                              <span className={styles.categoryActionIcon}>
                                <svg
                                  width="18"
                                  height="18"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    d="M5 12H19"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                  <path
                                    d="M12 5L19 12L12 19"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              </span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>

              <div className={styles.categoryExploreMore}>
                <Link href="/store" className={styles.exploreButton}>
                  <span className={styles.exploreText}>
                    Voir toutes nos gammes
                  </span>
                  <span className={styles.exploreIcon}>
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <circle
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="2"
                      />
                      <path
                        d="M12 8L16 12L12 16"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M8 12H16"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                </Link>
              </div>
            </div>

            <div className={styles.categoryAccentShape1}></div>
            <div className={styles.categoryAccentShape2}></div>
          </section>

          {/* Bannière Livraison */}
          <section className={styles.shippingBannerNew}>
            <div className={styles.shippingContainer}>
              <div className={styles.shippingCard}>
                <div className={styles.shippingCardGlass}></div>
                <div className={styles.shippingDots}></div>

                <div className={styles.shippingInfo}>
                  <div className={styles.shippingTitleGroup}>
                    <h3 className={styles.shippingTitleNew}>
                      Livraison gratuite
                    </h3>
                    <div className={styles.shippingBadge}>Économisez</div>
                  </div>
                  <p className={styles.shippingDescription}>
                    Pour toute commande à partir de{" "}
                    <span className={styles.shippingHighlight}>29€</span>
                  </p>
                </div>

                <div className={styles.shippingAction}>
                  <Link href="/store" className={styles.shippingButtonNew}>
                    <span className={styles.buttonTextNew}>En profiter</span>
                    <span className={styles.buttonArrowNew}>→</span>
                  </Link>
                </div>
              </div>
            </div>

            <div className={styles.shippingDecorLeft}></div>
            <div className={styles.shippingDecorRight}></div>
          </section>

          {/* Histoire de la marque */}
          <section ref={aboutRef} className={styles.aboutSection}>
            <div className={styles.aboutContainer}>
              {/* En-tête centré */}
              <div className={styles.aboutHeaderWrap}>
                <div className={styles.aboutHeader}>
                  <div className={styles.headerDecorLine}></div>
                  <span className={styles.environmentTag}>Notre Histoire</span>
                  <h2 className={styles.aboutHeading}>
                    Des savons{" "}
                    <span className={styles.headingEmphasis}>
                      100% artisanaux
                    </span>
                  </h2>
                  <p className={styles.aboutSubheading}>
                    Une passion pour les soins naturels, le respect de la peau
                    et l'engagement pour la planète.
                  </p>
                </div>
              </div>

              {/* Contenu principal */}
              <div className={styles.aboutRow}>
                {/* Colonne image */}
                <div className={styles.aboutImageCol}>
                  <div className={styles.aboutImageFrame}>
                    <img
                      src="/images/9.JPEG"
                      alt="Fabrication artisanale de savons"
                      className={styles.aboutImage}
                    />
                    <div className={styles.aboutImageBadge}>
                      <span>Depuis 2022</span>
                    </div>
                  </div>
                </div>

                {/* Colonne texte */}
                <div className={styles.aboutTextCol}>
                  <div className={styles.aboutContent}>
                    <p className={styles.aboutText}>
                      MonSavonVert est né de la volonté de soulager les
                      problèmes de peau tout en redonnant vie au savoir-faire
                      ancestral du savon d'Alep, mis à mal par la guerre en
                      Syrie.
                    </p>
                    <p className={styles.aboutText}>
                      Chaque savon est fabriqués en syrie avec des ingrédients
                      naturels choisis pour leurs bienfaits, dans une démarche
                      durable qui évite le plastique et respecte la tradition.
                    </p>

                    <div className={styles.certifications}>
                      <div className={styles.certBadge}>
                        <img src="/images/bio.png" alt="Certification Bio" />
                        <span>Bio</span>
                      </div>
                      <div className={styles.certBadge}>
                        <img
                          src="/images/cruelty-free.png"
                          alt="Cruelty Free"
                        />
                        <span>Sans cruauté</span>
                      </div>
                      <div className={styles.certBadge}>
                        <img src="/images/vegan.png" alt="Vegan" />
                        <span>Vegan</span>
                      </div>
                    </div>

                    <Link href="/notre-histoire" className={styles.aboutButton}>
                      <span>En savoir plus</span>
                      <span className={styles.buttonIcon}>→</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section Engagement Environnemental */}
          <section className={styles.environmentSection}>
            <div className={styles.environmentBg}></div>
            <div className={styles.environmentContainer}>
              <div className={styles.environmentHeader}>
                <div className={styles.headerDecorLine}></div>

                <span className={styles.environmentTag}>Notre Engagement</span>
                <h2 className={styles.environmentTitle}>
                  Un impact positif{" "}
                  <span className={styles.titleHighlight}>pour la planète</span>
                </h2>
                <div className={styles.environmentIntro}>
                  <p className={styles.environmentText}>
                    Ici nous croyons qu'il est possible de prendre soin de soi
                    tout en prenant soin de la planète. Notre engagement
                    environnemental va bien au-delà de nos produits.
                  </p>
                </div>
              </div>

              <div className={styles.environmentMain}>
                <div className={styles.environmentImagePanel}>
                  <div className={styles.environmentMediaWrapper}>
                    <div className={styles.environmentImageContainer}>
                      <img
                        src="/images/6.JPEG"
                        alt="Engagement environnemental"
                        className={styles.environmentImage}
                      />
                      <div className={styles.environmentImageOverlay}></div>
                    </div>
                    <div className={styles.environmentAccentBorder}></div>
                    <div className={styles.environmentAccentDots}></div>
                    <div className={styles.environmentBadge}>
                      <div className={styles.environmentBadgeInner}>
                        <span className={styles.badgeIcon}>
                          {/* Icône feuille simple pour ECO FRIENDLY */}
                          <svg
                            viewBox="0 0 24 24"
                            width="20"
                            height="20"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
                            <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
                          </svg>
                        </span>
                        <span className={styles.badgeText}>
                          ECO
                          <br />
                          FRIENDLY
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className={styles.environmentContentPanel}>
                  <div className={styles.environmentCardsContainer}>
                    {[
                      {
                        icon: (
                          <svg
                            viewBox="0 0 24 24"
                            width="24"
                            height="24"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            {/* Icône poubelle simple pour zéro déchet */}
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          </svg>
                        ),
                        title: "Minimalisme",
                        description:
                          "Un seul emballage simple et protecteur recouvre chaque savon, sans plastique inutile.",
                        color: "green",
                      },
                      {
                        icon: (
                          <svg
                            viewBox="0 0 24 24"
                            width="24"
                            height="24"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            {/* Icône pin/localisation pour circuit court */}
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                            <circle cx="12" cy="10" r="3" />
                          </svg>
                        ),
                        title: "Empreinte réduite",
                        description:
                          "Nous privilégions les fournisseurs locaux pour réduire l'empreinte carbone et soutenir l'économie locale.",
                        color: "teal",
                      },
                      {
                        icon: (
                          <svg
                            viewBox="0 0 24 24"
                            width="24"
                            height="24"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            {/* Icône éclair simple pour énergie */}
                            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                          </svg>
                        ),
                        title: "Durabilité",
                        description:
                          "Un savon solide dure longtemps, limite les déchets plastiques des gels douche et réduit l'impact environnemental.",
                        color: "blue",
                      },
                      {
                        icon: (
                          <svg
                            viewBox="0 0 24 24"
                            width="24"
                            height="24"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            {/* Icône cœur simple pour vegan et sans cruauté */}
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                          </svg>
                        ),
                        title: "Sans cruauté",
                        description:
                          "Nos savons sont formulés sans aucun ingrédient d'origine animale et ne sont jamais testés sur les animaux.",
                        color: "purple",
                      },
                    ].map((item, index) => (
                      <div
                        key={index}
                        className={`${styles.environmentCard} ${
                          styles[`environmentCard${item.color}`]
                        }`}
                      >
                        <div className={styles.environmentCardContent}>
                          <div className={styles.environmentCardIconWrap}>
                            <div className={styles.environmentCardIcon}>
                              {item.icon}
                            </div>
                          </div>
                          <h3 className={styles.environmentCardTitle}>
                            {item.title}
                          </h3>
                          <p className={styles.environmentCardText}>
                            {item.description}
                          </p>
                        </div>
                        <div className={styles.cardGlow}></div>
                      </div>
                    ))}
                  </div>

                  <div className={styles.environmentAction}>
                    <Link href="/virtues" className={styles.environmentButton}>
                      <span className={styles.buttonText}>
                        Découvrir nos actions
                      </span>
                      <span className={styles.buttonIcon}>
                        <svg
                          viewBox="0 0 24 24"
                          width="24"
                          height="24"
                          stroke="currentColor"
                          strokeWidth="2"
                          fill="none"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <line x1="5" y1="12" x2="19" y2="12"></line>
                          <polyline points="12 5 19 12 12 19"></polyline>
                        </svg>
                      </span>
                    </Link>
                  </div>
                </div>
              </div>

              <div className={styles.environmentStats}>
                <div className={styles.environmentStatItem}>
                  <div className={styles.environmentStatValue}>85%</div>
                  <div className={styles.environmentStatLabel}>
                    Moins d'emballage
                  </div>
                </div>
                <div className={styles.environmentStatItem}>
                  <div className={styles.environmentStatValue}>100%</div>
                  <div className={styles.environmentStatLabel}>
                    Biodégradable
                  </div>
                </div>
                <div className={styles.environmentStatItem}>
                  <div className={styles.environmentStatValue}>0</div>
                  <div className={styles.environmentStatLabel}>Test animal</div>
                </div>
              </div>
            </div>

            <div className={styles.environmentAccentShape1}></div>
            <div className={styles.environmentAccentShape2}></div>
          </section>

          {/* Caractéristiques de la marque */}
          <section ref={featuresRef} className={styles.featuresSection}>
            <div className={styles.featuresBgEffect}></div>
            <div className={styles.featuresContainer}>
              <div className={styles.featuresHeaderWrap}>
                <div className={styles.featuresHeader}>
                  <div className={styles.headerDecorLine}></div>
                  <span className={styles.environmentTag}>Nos valeurs</span>
                  <h2 className={styles.featuresHeading}>
                    Pourquoi choisir{" "}
                    <span className={styles.headingEmphasis}>MonSavonVert</span>{" "}
                    ?
                  </h2>
                  <p className={styles.featuresSubheading}>
                    Des produits cosmétiques respectueux de votre peau et de
                    l'environnement, élaborés avec passion et expertise.
                  </p>
                </div>
              </div>

              <div className={styles.featuresMainContent}>
                <div className={styles.featuresVisual}>
                  <div className={styles.featuresCenterpiece}>
                    <div className={styles.centerpieceInner}>
                      <img
                        src="/images/5.JPEG"
                        alt="Nos valeurs"
                        className={styles.featuresMainImage}
                      />
                      <div className={styles.imageOverlay}></div>
                    </div>
                    <div className={styles.centerpieceBorder}></div>
                    <div className={styles.centerpieceGlow}></div>
                  </div>
                </div>

                <div className={styles.featuresCardGrid}>
                  {[
                    {
                      id: 1,
                      icon: (
                        <svg
                          viewBox="0 0 24 24"
                          width="36"
                          height="36"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          fill="none"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          {/* Icône feuille pour 100% Naturel */}
                          <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
                          <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
                        </svg>
                      ),
                      title: "100% Naturel",
                      description:
                        "Ingrédients naturels, sans produits chimiques ni conservateurs artificiels",
                    },
                    {
                      id: 2,
                      icon: (
                        <svg
                          viewBox="0 0 24 24"
                          width="36"
                          height="36"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          fill="none"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          {/* Icône marteau pour Fabrication Artisanale */}
                          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                        </svg>
                      ),
                      title: "Fabrication Artisanale",
                      description:
                        "Chaque savon est fabriqué artisanalement dans les manufactures ancestrales de Syrie, perpétuant un savoir-faire traditionnel millénaire",
                    },
                    {
                      id: 3,
                      icon: (
                        <svg
                          viewBox="0 0 24 24"
                          width="36"
                          height="36"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          fill="none"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          {/* Icône globe pour Écoresponsable */}
                          <circle cx="12" cy="12" r="10" />
                          <path d="M2 12h20" />
                          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                        </svg>
                      ),
                      title: "Écoresponsable",
                      description:
                        "Emballages recyclable et minimisés pour réduire notre impact environnemental",
                    },
                    {
                      id: 4,
                      icon: (
                        <svg
                          viewBox="0 0 24 24"
                          width="36"
                          height="36"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          fill="none"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          {/* Icône étoile pour Qualité Premium */}
                          <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
                        </svg>
                      ),
                      title: "Qualité Premium",
                      description:
                        "Des produits de haute qualité conçus pour nourrir et respecter votre peau",
                    },
                  ].map((feature, index) => (
                    <div
                      key={feature.id}
                      className={`${styles.featureCardNew} ${
                        styles[`featureCard${index + 1}`]
                      }`}
                      style={{ "--delay": `${index * 0.1}s` }}
                    >
                      <div className={styles.featureCardGlow}></div>
                      <div className={styles.featureCardContent}>
                        <div className={styles.featureIconContainer}>
                          <div className={styles.featureIconOuter}>
                            <div className={styles.featureIconInner}>
                              {feature.icon}
                            </div>
                          </div>
                        </div>
                        <div className={styles.featureTextContent}>
                          <h3 className={styles.featureCardHeading}>
                            {feature.title}
                          </h3>
                          <p className={styles.featureCardDescription}>
                            {feature.description}
                          </p>
                        </div>
                        <div className={styles.featureCardArrow}>
                          <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M5 12H19"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M12 5L19 12L12 19"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.featuresExtraBanner}>
                <div className={styles.bannerContent}>
                  <div className={styles.bannerIconWrap}>
                    <div className={styles.bannerIcon}>
                      <svg
                        viewBox="0 0 24 24"
                        width="24"
                        height="24"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        {/* Icône étoile simple pour la bannière */}
                        <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
                      </svg>
                    </div>
                  </div>
                  <h3 className={styles.bannerTitle}>
                    Un savon millénaires qui respectent votre peau et la planète
                  </h3>
                  <p className={styles.bannerText}>
                    Héritiers d'une tradition ancestrale, les savons d'Alep sont
                    naturellement reconnus pour leurs propriétés bienfaisantes
                    uniques, transmises à travers les siècles.
                  </p>
                </div>
                <div className={styles.bannerEffect}></div>
              </div>
            </div>

            <div className={styles.featuresAccentShape1}></div>
            <div className={styles.featuresAccentShape2}></div>
            <div className={styles.featuresPatternGrid}></div>
          </section>
          {/* Témoignages clients */}
          <section ref={testimonialRef} className={styles.testimonialsSimple}>
            <div className={styles.testimonialsContainer}>
              {/* En-tête */}
              <div className={styles.testimonialsHeader}>
                <div className={styles.headerDecorLine}></div>

                <span className={styles.testimonialsTag}>Témoignages</span>
                <h2 className={styles.testimonialsTitle}>
                  Ce que disent nos clients
                </h2>
                <div className={styles.ratingBox}>
                  <div className={styles.ratingStars}>★★★★★</div>
                  <div className={styles.ratingScore}>
                    4.9/5 basé sur 256 avis vérifiés
                  </div>
                </div>
              </div>

              {/* Cartes de témoignages */}
              <div className={styles.testimonialsGrid}>
                {/* Carte 1 */}
                <div className={styles.testimonialCard}>
                  <div className={styles.testimonialTop}>
                    <div className={styles.testimonialUser}>
                      <div className={styles.testimonialAvatar}>ML</div>
                      <div className={styles.testimonialInfo}>
                        <p className={styles.testimonialName}>Marie L.</p>
                        <p className={styles.testimonialLocation}>
                          Lyon, France
                        </p>
                      </div>
                    </div>
                    <div className={styles.testimonialBadge}>✓</div>
                  </div>

                  <div className={styles.testimonialContent}>
                    <div className={styles.testimonialStars}>★★★★★</div>
                    <p className={styles.testimonialText}>
                      J'ai découvert ces savons il y a 6 mois et ma peau s'est
                      transformée. Plus de problèmes de sécheresse et l'odeur
                      est divine ! Je recommande particulièrement le savon à
                      l'avoine pour les peaux sensibles.
                    </p>
                  </div>
                </div>

                {/* Carte 2 */}
                <div className={styles.testimonialCard}>
                  <div className={styles.testimonialTop}>
                    <div className={styles.testimonialUser}>
                      <div className={styles.testimonialAvatar}>TP</div>
                      <div className={styles.testimonialInfo}>
                        <p className={styles.testimonialName}>Thomas P.</p>
                        <p className={styles.testimonialLocation}>
                          Paris, France
                        </p>
                      </div>
                    </div>
                    <div className={styles.testimonialBadge}>✓</div>
                  </div>

                  <div className={styles.testimonialContent}>
                    <div className={styles.testimonialStars}>★★★★★</div>
                    <p className={styles.testimonialText}>
                      En tant qu'homme barbu, j'utilise leur savon pour le
                      visage et la barbe. Ma peau est apaisée et ma barbe plus
                      douce que jamais. Le service client est également
                      excellent, très réactif.
                    </p>
                  </div>
                </div>

                {/* Carte 3 */}
                <div className={styles.testimonialCard}>
                  <div className={styles.testimonialTop}>
                    <div className={styles.testimonialUser}>
                      <div className={styles.testimonialAvatar}>SM</div>
                      <div className={styles.testimonialInfo}>
                        <p className={styles.testimonialName}>Sophie M.</p>
                        <p className={styles.testimonialLocation}>
                          Marseille, France
                        </p>
                      </div>
                    </div>
                    <div className={styles.testimonialBadge}>✓</div>
                  </div>

                  <div className={styles.testimonialContent}>
                    <div className={styles.testimonialStars}>★★★★★</div>
                    <p className={styles.testimonialText}>
                      J'apprécie particulièrement leur engagement écologique.
                      Les emballages sont magnifiques et peuvent être plantés
                      dans le jardin ! Un vrai plus par rapport aux autres
                      marques.
                    </p>
                  </div>
                </div>
              </div>

              {/* Bouton */}
              <div className={styles.testimonialAction}>
                <Link href="/avis-clients" className={styles.testimonialButton}>
                  <span>Voir tous les avis</span>
                  <span className={styles.buttonArrow}>→</span>
                </Link>
              </div>
            </div>
          </section>

          {/* Section Newsletter */}
          <section className={styles.newsletterSection}>
            <div className={styles.newsletterWrapper}>
              <div className={styles.newsletterContent}>
                <div className={styles.newsletterDecor}></div>
                <h2 className={styles.newsletterTitle}>
                  Rejoignez notre communauté
                </h2>
                <p className={styles.newsletterText}>
                  Inscrivez-vous à notre newsletter pour recevoir des conseils
                  beauté, nos nouveautés et des offres exclusives.
                </p>
                <form className={styles.newsletterForm}>
                  <div className={styles.inputGroup}>
                    <input
                      type="email"
                      placeholder="Votre adresse email"
                      className={styles.newsletterInput}
                      required
                    />
                    <button type="submit" className={styles.newsletterButton}>
                      <span>S'abonner</span>
                      <span className={styles.buttonArrow}>→</span>
                    </button>
                  </div>
                  <label className={styles.consentLabel}>
                    <input
                      type="checkbox"
                      required
                      className={styles.consentCheckbox}
                    />
                    <div className={styles.checkmark}></div>
                    <span>
                      J'accepte de recevoir des emails et je confirme avoir lu
                      la{" "}
                      <Link
                        href="/politique-de-confidentialite"
                        className={styles.policyLink}
                      >
                        politique de confidentialité
                      </Link>
                      .
                    </span>
                  </label>
                </form>
              </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
}