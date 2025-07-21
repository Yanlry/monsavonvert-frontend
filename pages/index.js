"use client";

import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import Header from "../components/Header";
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
        "Découvrez notre collection de soins faits à la main avec des ingrédients naturels",
    },
    {
      image: "/images/4.JPEG",
      title: "Fabrication Syriénne, ingrédients locaux",
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
      icon: "🌿",
      title: "100% Naturel",
      description:
        "Ingrédients certifiés biologiques, sans produits chimiques ni conservateurs artificiels",
    },
    {
      id: 2,
      icon: "🤲",
      title: "Fabrication Artisanale",
      description:
        "Chaque savon est fabriqué à la main dans notre atelier selon des méthodes traditionnelles",
    },
    {
      id: 3,
      icon: "🌍",
      title: "Écoresponsable",
      description:
        "Emballages biodégradables et minimisés pour réduire notre impact environnemental",
    },
    {
      id: 4,
      icon: "✨",
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
      icon: "🌸",
      description: "Savon d'Alep doux pour peaux sensibles et usage quotidien",
      suitableFor: "Visage, peaux sensibles, enfants",
      link: "/produit/680bd95433437078ee079529",
      image: "/images/1.JPEG",
    },
    {
      id: 2,
      name: "Équilibre & Purification",
      percentage: "20%",
      icon: "🍃",
      description:
        "Savon d'Alep équilibrant pour peaux mixtes et imperfections",
      suitableFor: "Peaux mixtes, acné légère, cuir chevelu gras",
      link: "/produit/680a5ac9841615e1719b023b",
      image: "/images/2.JPEG",
    },
    {
      id: 3,
      name: "Soin Intensif",
      percentage: "30%",
      icon: "⚡",
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
        <Head>
          <title>MonSavonVert | Savonnerie Artisanale Bio & Écologique</title>
          <meta
            name="description"
            content="Savons artisanaux et cosmétiques naturels fabriqués à la main en France. Ingrédients 100% bio et emballages écologiques."
          />
          <link rel="icon" href="/favicon.ico" />
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
      <Head>
        <title>MonSavonVert | Savonnerie Artisanale Bio & Écologique</title>
        <meta
          name="description"
          content="Savons artisanaux et cosmétiques naturels fabriqués à la main en France. Ingrédients 100% bio et emballages écologiques."
        />
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta
          property="og:title"
          content="MonSavonVert | Savonnerie Artisanale Bio"
        />
        <meta
          property="og:description"
          content="Découvrez nos savons artisanaux et produits de soins naturels, faits à la main avec des ingrédients biologiques."
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
                        <span>Notre philosophie</span>
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
              <div className={styles.trustItem}>
                <div className={styles.trustIcon}>🇸🇾</div>
                <div className={styles.trustText}>
                  <span className={styles.trustTitle}>Fabrication</span>
                  <span className={styles.trustDesc}>Syrienne</span>
                </div>
              </div>

              <div className={styles.trustItem}>
                <div className={styles.trustIcon}>🌱</div>
                <div className={styles.trustText}>
                  <span className={styles.trustTitle}>Ingrédients</span>
                  <span className={styles.trustDesc}>naturels</span>
                </div>
              </div>

              <div className={styles.trustItem}>
                <div className={styles.trustIcon}>♻️</div>
                <div className={styles.trustText}>
                  <span className={styles.trustTitle}>Emballages</span>
                  <span className={styles.trustDesc}>réduits</span>
                </div>
              </div>

              <div className={styles.trustItem}>
                <div className={styles.trustIcon}>📦</div>
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
                  {productCategories.map((category, index) => (
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
                              {category.icon}
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
                            <div className={styles.categoryIndicatorDot}></div>
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
                  ))}
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
                    Une passion pour les produits naturels et un engagement
                    envers la durabilité environnementale.
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
                      <span>Depuis 2018</span>
                    </div>
                  </div>
                </div>

                {/* Colonne texte */}
                <div className={styles.aboutTextCol}>
                  <div className={styles.aboutContent}>
                    <p className={styles.aboutText}>
                      MonSavonVert est né d'une passion pour les produits
                      naturels et d'un engagement envers la durabilité
                      environnementale. Tout a commencé en 2018, dans une petite
                      cuisine où nous expérimentions des recettes de savons
                      naturels pour notre propre utilisation.
                    </p>
                    <p className={styles.aboutText}>
                      Aujourd'hui, chaque savon est toujours fabriqué à la main
                      dans notre atelier avec des ingrédients biologiques
                      soigneusement sélectionnés pour leurs bienfaits. Nous
                      contrôlons chaque étape du processus, de la sélection des
                      matières premières jusqu'à l'emballage final.
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
                    Chez MonSavonVert, nous croyons qu'il est possible de
                    prendre soin de soi tout en prenant soin de la planète.
                    Notre engagement environnemental va bien au-delà de nos
                    produits.
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
                        <span className={styles.badgeIcon}>♻️</span>
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
                        icon: "♻️",
                        title: "Zéro Déchet",
                        description:
                          "Nos emballages sont biodégradables ou recyclables, et nous utilisons du papier ensemencé qui peut être planté après utilisation.",
                        color: "green",
                      },
                      {
                        icon: "🌱",
                        title: "Circuit Court",
                        description:
                          "Nous privilégions les fournisseurs locaux pour réduire l'empreinte carbone et soutenir l'économie locale.",
                        color: "teal",
                      },
                      {
                        icon: "⚡",
                        title: "Énergie Verte",
                        description:
                          "Notre atelier fonctionne à l'énergie verte et nous optimisons notre consommation d'eau dans tous nos processus.",
                        color: "blue",
                      },
                      {
                        icon: "🐰",
                        title: "Vegan et sans cruauté",
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
                  {brandFeatures.map((feature, index) => (
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
                    <div className={styles.bannerIcon}>✨</div>
                  </div>
                  <h3 className={styles.bannerTitle}>
                    Des savons qui respectent votre peau et la planète
                  </h3>
                  <p className={styles.bannerText}>
                    Nos formules exclusives sont le fruit de recherches
                    approfondies et d'un savoir-faire traditionnel.
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

          {/* Section Instagram Feed */}
          <section className={styles.instagramSection}>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionIntro}>
                <span className={styles.sectionTag}>@monsavonvert</span>
                <h2 className={styles.sectionTitle}>
                  Suivez-nous sur Instagram
                </h2>
                <p className={styles.sectionDescription}>
                  Rejoignez notre communauté et découvrez nos coulisses
                </p>
              </div>
            </div>

            <div className={styles.instagramGrid}>
              {[1, 2, 3, 4, 5].map((num) => (
                <a
                  key={num}
                  href="https://instagram.com/monsavonvert"
                  className={styles.instagramItem}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <div className={styles.instagramImageContainer}>
                    <img
                      src={`/images/${num}.JPEG`}
                      alt="Instagram MonSavonVert"
                      className={styles.instagramImage}
                    />
                    <div className={styles.instagramOverlay}>
                      <div className={styles.instagramIcon}>
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
                          <rect
                            x="2"
                            y="2"
                            width="20"
                            height="20"
                            rx="5"
                            ry="5"
                          ></rect>
                          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                        </svg>
                      </div>
                    </div>
                  </div>
                </a>
              ))}
            </div>

            <div className={styles.instagramCta}>
              <a
                href="https://instagram.com/monsavonvert"
                className={styles.instagramButton}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span>Voir notre profil Instagram</span>
                <span className={styles.buttonIcon}>→</span>
              </a>
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

        {/* Footer */}
        <footer className={styles.footer}>
          <div className={styles.footerTop}>
            <div className={styles.footerWrapper}>
              <div className={styles.footerColumn}>
                <div className={styles.footerLogo}>MonSavonVert</div>
                <p className={styles.footerAbout}>
                  Savons artisanaux, naturels et écologiques fabriqués avec
                  passion en Syrie dans l'antique ville d'Alep.
                </p>
                <div className={styles.footerSocial}>
                  <a
                    href="https://facebook.com/monsavonvert"
                    className={styles.socialLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Facebook"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      width="20"
                      height="20"
                      stroke="currentColor"
                      strokeWidth="2"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                    </svg>
                  </a>
                  <a
                    href="https://instagram.com/monsavonvert"
                    className={styles.socialLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Instagram"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      width="20"
                      height="20"
                      stroke="currentColor"
                      strokeWidth="2"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect
                        x="2"
                        y="2"
                        width="20"
                        height="20"
                        rx="5"
                        ry="5"
                      ></rect>
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                    </svg>
                  </a>
                  <a
                    href="https://pinterest.com/monsavonvert"
                    className={styles.socialLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Pinterest"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      width="20"
                      height="20"
                      stroke="currentColor"
                      strokeWidth="2"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M8 12a4 4 0 1 1 8 0 4 4 0 0 1-8 0zm2-6h4"></path>
                      <path d="M9 18l3-3 3 3"></path>
                      <path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"></path>
                    </svg>
                  </a>
                </div>
                <div className={styles.paymentMethods}>
                  <span className={styles.paymentTitle}>
                    Moyens de paiement
                  </span>
                  <div className={styles.paymentIcons}>
                    <img src="/images/payments/visa.png" alt="Visa" />
                    <img
                      src="/images/payments/mastercard.png"
                      alt="Mastercard"
                    />
                    <img
                      src="/images/payments/americanexpress.png"
                      alt="American Express"
                    />
                    <img src="/images/payments/applepay.png" alt="Apple Pay" />
                  </div>
                </div>
              </div>

              <div className={styles.footerNavColumns}>
                <div className={styles.footerColumn}>
                  <h3 className={styles.footerTitle}>Boutique</h3>
                  <div className={styles.footerLinks}>
                    <Link
                      href="/boutique/nouveautes"
                      className={styles.footerLink}
                    >
                      Nouveautés
                    </Link>
                    <Link href="/boutique/visage" className={styles.footerLink}>
                      Soins visage
                    </Link>
                    <Link href="/boutique/corps" className={styles.footerLink}>
                      Soins corps
                    </Link>
                    <Link
                      href="/boutique/cheveux"
                      className={styles.footerLink}
                    >
                      Cheveux
                    </Link>
                    <Link
                      href="/boutique/coffrets"
                      className={styles.footerLink}
                    >
                      Coffrets cadeaux
                    </Link>
                    <Link
                      href="/boutique/accessoires"
                      className={styles.footerLink}
                    >
                      Accessoires
                    </Link>
                  </div>
                </div>

                <div className={styles.footerColumn}>
                  <h3 className={styles.footerTitle}>Informations</h3>
                  <div className={styles.footerLinks}>
                    <Link href="/a-propos" className={styles.footerLink}>
                      Notre histoire
                    </Link>
                    <Link href="/virtues" className={styles.footerLink}>
                      Vertu & bienfaits
                    </Link>
                    <Link href="/blog" className={styles.footerLink}>
                      Journal
                    </Link>
                    <Link href="/faq" className={styles.footerLink}>
                      FAQ
                    </Link>
                    <Link href="/contact" className={styles.footerLink}>
                      Contact
                    </Link>
                    <Link
                      href="/programme-fidelite"
                      className={styles.footerLink}
                    >
                      Programme fidélité
                    </Link>
                  </div>
                </div>

                <div className={styles.footerColumn}>
                  <h3 className={styles.footerTitle}>Contact</h3>
                  <div className={styles.contactInfo}>
                    <div className={styles.contactItem}>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className={styles.contactIcon}
                      >
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                      </svg>
                      <a href="tel:+33612345678" className={styles.contactLink}>
                        +33 6 12 34 56 78
                      </a>
                    </div>

                    <div className={styles.contactItem}>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className={styles.contactIcon}
                      >
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                        <polyline points="22,6 12,13 2,6"></polyline>
                      </svg>
                      <a
                        href="mailto:info@monsavonvert.fr"
                        className={styles.contactLink}
                      >
                        info@monsavonvert.fr
                      </a>
                    </div>

                    <div className={styles.contactItem}>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className={styles.contactIcon}
                      >
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                        <circle cx="12" cy="10" r="3"></circle>
                      </svg>
                      <span className={styles.contactText}>
                        15 rue des Artisans
                        <br />
                        69001 Lyon, France
                      </span>
                    </div>

                    <div className={styles.contactItem}>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className={styles.contactIcon}
                      >
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="12"></line>
                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                      </svg>
                      <span className={styles.contactText}>
                        Lun-Ven: 9h-18h
                        <br />
                        Sam: 10h-17h
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.footerBottom}>
            <div className={styles.footerBottomContent}>
              <p className={styles.copyright}>
                © 2025 MonSavonVert. Tous droits réservés.
              </p>
              <div className={styles.footerLegalLinks}>
                <Link href="/cgv" className={styles.footerSmallLink}>
                  CGV
                </Link>
                <span className={styles.footerDivider}>•</span>
                <Link
                  href="/politique-de-confidentialite"
                  className={styles.footerSmallLink}
                >
                  Politique de confidentialité
                </Link>
                <span className={styles.footerDivider}>•</span>
                <Link
                  href="/mentions-legales"
                  className={styles.footerSmallLink}
                >
                  Mentions légales
                </Link>
                <span className={styles.footerDivider}>•</span>
                <Link href="/cookies" className={styles.footerSmallLink}>
                  Gestion des cookies
                </Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
