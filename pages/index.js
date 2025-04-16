"use client";

import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
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

  // Fonction pour simuler l'ajout au panier
  const addToCart = () => {
    setCartCount(cartCount + 1);
    if (typeof window !== "undefined") {
      const cartIcon = document.getElementById("cartIcon");
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
    document.body.classList.add(styles.resetMargins);
    document.documentElement.classList.add(styles.resetMargins);

    // Détection du scroll pour le header
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };

    // Animation du slider automatique
    const sliderTimer = setInterval(() => {
      setCurrentSlide((prev) => (prev === totalSlides - 1 ? 0 : prev + 1));
    }, 6000);

    // Gestionnaires d'événements
    window.addEventListener("scroll", handleScroll);

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
    const storedCart = JSON.parse(localStorage.getItem("cart")) || [];
    const totalItems = storedCart.reduce((sum, item) => sum + item.quantity, 0);
    setCartCount(totalItems);
  }, []);

  // Slides du hero
  const heroSlides = [
    {
      image: "/images/5.JPEG",
      title: "Savons artisanaux, naturels et écologiques",
      subtitle:
        "Découvrez notre collection de soins faits à la main avec des ingrédients biologiques",
    },
    {
      image: "/images/6.JPEG",
      title: "Prendre soin de votre peau et de la planète",
      subtitle:
        "Des formules douces et respectueuses pour un bien-être quotidien",
    },
    {
      image: "/images/4.JPEG",
      title: "Fabrication française, ingrédients locaux",
      subtitle:
        "Nous privilégions les circuits courts et l'artisanat de qualité",
    },
  ];

  // Données pour les produits en avant
  const featuredProducts = [
    {
      id: 1,
      name: "Savon Exfoliant à l'Avoine",
      price: 8.9,
      image: "/images/2.JPEG",
      badge: "Bestseller",
      rating: 4.9,
      reviewCount: 124,
    },
    {
      id: 2,
      name: "Shampooing Solide Nourrissant",
      price: 11.5,
      image: "/images/1.JPEG",
      badge: "Nouveau",
      rating: 4.7,
      reviewCount: 86,
    },
    {
      id: 3,
      name: "Savon Surgras à l'Huile d'Olive",
      price: 7.9,
      image: "/images/3.JPEG",
      badge: null,
      rating: 4.8,
      reviewCount: 93,
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
        "Chaque savon est fabriqué à la main dans notre atelier selon des méthodes traditionnelles",
    },
    {
      id: 4,
      icon: "🌍",
      title: "Écoresponsable",
      description:
        "Chaque savon est fabriqué à la main dans notre atelier selon des méthodes traditionnelles",
    },
  ];

  // Catégories produits
  const productCategories = [
    {
      id: 1,
      name: "Douceur Quotidienne",
      percentage: "5%",
      icon: "🌸", // Vous pouvez remplacer par une icône SVG
      description: "Savon d'Alep doux pour peaux sensibles et usage quotidien",
      suitableFor: "Visage, peaux sensibles, enfants",
      link: "/products/savon-alep-5",
    },
    {
      id: 2,
      name: "Équilibre & Purification",
      percentage: "20%",
      icon: "🍃", // Vous pouvez remplacer par une icône SVG
      description:
        "Savon d'Alep équilibrant pour peaux mixtes et imperfections",
      suitableFor: "Peaux mixtes, acné légère, cuir chevelu gras",
      link: "/products/savon-alep-20",
    },
    {
      id: 3,
      name: "Soin Intensif",
      percentage: "30%",
      icon: "⚡", // Vous pouvez remplacer par une icône SVG
      description:
        "Savon d'Alep thérapeutique pour problèmes cutanés spécifiques",
      suitableFor: "Eczéma, psoriasis, acné sévère",
      link: "/products/savon-alep-30",
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
          <div className={styles.loadingLogo}>MonSavonVert</div>
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
      </Head>

      <div className={styles.container}>
        {/* Header avec navigation */}
        <header
          className={`${styles.header} ${
            scrolled ? styles.headerScrolled : ""
          }`}
        >
          <div className={styles.headerContent}>
            <div className={styles.logoContainer}>
              <Link href="/" legacyBehavior>
                <a className={styles.logoLink}>
                  <span className={styles.logo}>Mon Savon Vert</span>
                </a>
              </Link>
            </div>

            {/* Navigation principale */}
            <nav className={styles.mainNav}>
              <ul className={styles.navList}>
                <li className={styles.navItem}>
                  <Link href="/store" legacyBehavior>
                    <a className={styles.navLink}>
                      Boutique
                      <div className={styles.megaMenu}>
                        <div className={styles.megaMenuGrid}>
                          <div className={styles.megaMenuCategory}>
                            <h3>Collections</h3>
                            <Link href="/store" legacyBehavior>
                              <a>Peau normale à sèche</a>
                            </Link>
                            <Link
                              href="/store"
                              legacyBehavior
                            >
                              <a>Peau mixte</a>
                            </Link>
                            <Link href="/store" legacyBehavior>
                              <a>Peau à problèmes</a>
                            </Link>
                          </div>
                          <div className={styles.megaMenuImage}>
                            <p>Nouveau</p>
                            <img
                              src="/images/2.JPEG"
                              alt="Nouvelle collection"
                            />
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
                  <Link href="/blog" legacyBehavior>
                    <a className={styles.navLink}>Journal</a>
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
              <Link href="/login" legacyBehavior>
                <a className={styles.userAccount} aria-label="Mon compte">
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
                </a>
              </Link>
              <Link href="/cart" legacyBehavior>
                <a className={styles.cartLink} aria-label="Panier">
                  <div className={styles.cartIcon} id="cartIcon">
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
          </div>
        </header>

        <main className={styles.mainContent}>
          {/* Hero Section avec Slider */}
          <section className={styles.heroSlider}>
            <div
              className={styles.slidesContainer}
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {heroSlides.map((slide, index) => (
                <div
                  key={index}
                  className={`${styles.slide} ${
                    index === currentSlide ? styles.activeSlide : ""
                  }`}
                  style={{
                    backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.4)), url(${slide.image})`,
                  }}
                >
                  <div className={styles.slideContent}>
                    <h1 className={styles.slideTitle}>{slide.title}</h1>
                    <p className={styles.slideSubtitle}>{slide.subtitle}</p>
                    <div className={styles.slideButtons}>
                      <Link href="/store" legacyBehavior>
                        <a
                          className={`${styles.button} ${styles.primaryButton}`}
                        >
                          Découvrir nos produits
                        </a>
                      </Link>
                      <Link href="/info" legacyBehavior>
                        <a className={`${styles.button} ${styles.ghostButton}`}>
                          Notre philosophie
                        </a>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Indicateurs de slide */}
            <div className={styles.slideIndicators}>
              {Array.from({ length: totalSlides }).map((_, index) => (
                <button
                  key={index}
                  className={`${styles.indicator} ${
                    index === currentSlide ? styles.activeIndicator : ""
                  }`}
                  onClick={() => setCurrentSlide(index)}
                  aria-label={`Slide ${index + 1}`}
                />
              ))}
            </div>
          </section>

          {/* Bannière de confiance */}
          <section className={styles.trustBanner}>
            <div className={styles.trustItem}>
              <div className={styles.trustIcon}>🇸🇾</div>
              <div className={styles.trustText}>
                Fabrication
                <br />
                Syrienne
              </div>
            </div>
            <div className={styles.trustDivider}></div>
            <div className={styles.trustItem}>
              <div className={styles.trustIcon}>🌱</div>
              <div className={styles.trustText}>
                Ingrédients
                <br />
                naturels
              </div>
            </div>
            <div className={styles.trustDivider}></div>
            <div className={styles.trustItem}>
              <div className={styles.trustIcon}>♻️</div>
              <div className={styles.trustText}>
                Emballages
                <br />
                réduits
              </div>
            </div>
            <div className={styles.trustDivider}></div>
            <div className={styles.trustItem}>
              <div className={styles.trustIcon}>📦</div>
              <div className={styles.trustText}>
                Livraison offerte
                <br />
                dès 29€
              </div>
            </div>
          </section>

          {/* Présentation des produits phares */}
          <section className={styles.featuredProductsSection}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>
                Nos produits les plus appréciés
              </h2>
              <p className={styles.sectionSubtitle}>
                Des savons artisanaux, élaborés avec passion pour prendre soin
                de vous au naturel
              </p>
            </div>

            <div className={styles.productsGrid}>
              {featuredProducts.map((product) => (
                <div key={product.id} className={styles.productCard}>
                  {product.badge && (
                    <div
                      className={`${styles.productBadge} ${
                        styles[
                          `badge-${product.badge
                            .toLowerCase()
                            .replace(" ", "-")}`
                        ]
                      }`}
                    >
                      {product.badge}
                    </div>
                  )}
                  <div className={styles.productImageContainer}>
                    <img
                      src={product.image}
                      alt={product.name}
                      className={styles.productImage}
                    />
                    <div className={styles.productActions}>
                      <button
                        className={styles.addToCartButton}
                        onClick={addToCart}
                        aria-label="Ajouter au panier"
                      >
                        Ajouter au panier
                      </button>
                      <button
                        className={styles.quickViewButton}
                        aria-label="Aperçu rapide"
                      >
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
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                          <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                      </button>
                      <button
                        className={styles.wishlistButton}
                        aria-label="Ajouter aux favoris"
                      >
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
                          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div className={styles.productInfo}>
                    <h3 className={styles.productName}>{product.name}</h3>
                    <div className={styles.productRating}>
                      <div className={styles.stars}>
                        {"★".repeat(Math.floor(product.rating))}
                        {product.rating % 1 !== 0 && "½"}
                        {"☆".repeat(5 - Math.ceil(product.rating))}
                      </div>
                      <div className={styles.reviewCount}>
                        ({product.reviewCount})
                      </div>
                    </div>
                    <div className={styles.productPrice}>
                      {product.price.toFixed(2)} €
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className={styles.sectionFooter}>
              <Link href="/boutique" legacyBehavior>
                <a className={`${styles.button} ${styles.outlineButton}`}>
                  Voir tous nos produits
                </a>
              </Link>
            </div>
          </section>

          {/* Bannière Livraison */}
          <section className={styles.shippingBanner}>
            <div className={styles.shippingContent}>
              <h2 className={styles.shippingTitle}>Livraison gratuite</h2>
              <p className={styles.shippingText}>
                Pour toute commande à partir de 29€
              </p>
              <Link href="/store" legacyBehavior>
                <a className={`${styles.button} ${styles.whiteButton}`}>
                  En profiter maintenant
                </a>
              </Link>
            </div>
          </section>
          {/* Catégories de produits */}
          <section className={styles.categoriesSection}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Nos catégories</h2>
              <p className={styles.sectionSubtitle}>
                Explorez notre gamme complète de produits naturels et
                écologiques
              </p>
            </div>

            <div className={styles.categoriesGrid}>
              {productCategories.map((category) => (
                <Link key={category.id} href="/store" legacyBehavior>
                  <a className={styles.categoryCard}>
                    <div className={styles.categoryImageContainer}>
                      <div className={styles.categoryImageOverlay}></div>
                      <img
                        src={category.image || `/images/${category.id}.JPEG`}
                        alt={category.name}
                        className={styles.categoryImage}
                      />
                    </div>
                    <div className={styles.categoryInfo}>
                      <h3 className={styles.categoryName}>{category.name}</h3>
                      <p className={styles.categoryDescription}>
                        {category.description}
                      </p>
                      <span className={styles.categoryLink}>
                        Découvrir <span className={styles.arrowIcon}>→</span>
                      </span>
                    </div>
                  </a>
                </Link>
              ))}
            </div>
          </section>

          {/* Notre Philosophie (About Section) */}
          <section className={styles.aboutSection}>
            <div className={styles.aboutImageColumn}>
              <div className={styles.aboutImage}>
                <img
                  src="/images/9.JPEG"
                  alt="Fabrication artisanale de savons"
                />
              </div>
            </div>
            <div className={styles.aboutContentColumn}>
              <div className={styles.aboutContent}>
                <span className={styles.sectionTag}>Notre Histoire</span>
                <h2 className={styles.aboutTitle}>
                  Des savons 100% artisanaux
                </h2>
                <p className={styles.aboutText}>
                  MonSavonVert est né d'une passion pour les produits naturels
                  et d'un engagement envers la durabilité environnementale. Tout
                  a commencé en 2018, dans une petite cuisine où nous
                  expérimentions des recettes de savons naturels pour notre
                  propre utilisation.
                </p>
                <p className={styles.aboutText}>
                  Aujourd'hui, chaque savon est toujours fabriqué à la main dans
                  notre atelier avec des ingrédients biologiques soigneusement
                  sélectionnés pour leurs bienfaits. Nous contrôlons chaque
                  étape du processus, de la sélection des matières premières
                  jusqu'à l'emballage final.
                </p>
                <div className={styles.certifications}>
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
                <Link href="/notre-histoire" legacyBehavior>
                  <a className={`${styles.button} ${styles.outlineButton}`}>
                    En savoir plus
                  </a>
                </Link>
              </div>
            </div>
          </section>

          <section className={styles.featuresSection}>
            <div className={styles.container}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>
                  Pourquoi choisir MonSavonVert ?
                </h2>
                <p className={styles.sectionSubtitle}>
                  Des produits cosmétiques respectueux de votre peau et de
                  l'environnement
                </p>
              </div>

              <div className={styles.featuresGrid}>
                {brandFeatures.map((feature) => (
                  <div key={feature.id} className={styles.featureCard}>
                    <div className={styles.featureIcon}>{feature.icon}</div>
                    <h3 className={styles.featureTitle}>{feature.title}</h3>
                    <p className={styles.featureDescription}>
                      {feature.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Section Engagement Environnemental */}
          <section className={styles.environmentSection}>
            <div className={styles.environmentContent}>
              <span className={styles.sectionTag}>Notre Engagement</span>
              <h2 className={styles.environmentTitle}>
                Un impact positif pour la planète
              </h2>
              <p className={styles.environmentText}>
                Chez MonSavonVert, nous croyons qu'il est possible de prendre
                soin de soi tout en prenant soin de la planète. Notre engagement
                environnemental va bien au-delà de nos produits.
              </p>

              <div className={styles.environmentGrid}>
                <div className={styles.environmentItem}>
                  <div className={styles.environmentItemIcon}>♻️</div>
                  <h3 className={styles.environmentItemTitle}>Zéro Déchet</h3>
                  <p>
                    Nos emballages sont biodégradables ou recyclables, et nous
                    utilisons du papier ensemencé qui peut être planté après
                    utilisation.
                  </p>
                </div>
                <div className={styles.environmentItem}>
                  <div className={styles.environmentItemIcon}>🌱</div>
                  <h3 className={styles.environmentItemTitle}>Circuit Court</h3>
                  <p>
                    Nous privilégions les fournisseurs locaux pour réduire
                    l'empreinte carbone et soutenir l'économie locale.
                  </p>
                </div>
                <div className={styles.environmentItem}>
                  <div className={styles.environmentItemIcon}>⚡</div>
                  <h3 className={styles.environmentItemTitle}>Énergie Verte</h3>
                  <p>
                    Notre atelier fonctionne à l'énergie verte et nous
                    optimisons notre consommation d'eau dans tous nos processus.
                  </p>
                </div>
                <div className={styles.environmentItem}>
                  <div className={styles.environmentItemIcon}>🐰</div>
                  <h3 className={styles.environmentItemTitle}>
                    Vegan et sans cruauté animale
                  </h3>
                  <p>
                    Nos savons sont formulés sans aucun ingrédient d'origine
                    animale et ne sont jamais testés sur les animaux.
                  </p>
                </div>
              </div>

              <Link href="/virtues" legacyBehavior>
                <a className={`${styles.button} ${styles.greenButton}`}>
                  Découvrir nos actions
                </a>
              </Link>
            </div>
            <div className={styles.environmentImageColumn}>
              <div className={styles.environmentImage}>
                <img src="/images/6.JPEG" alt="Engagement environnemental" />
              </div>
            </div>
          </section>

          {/* Témoignages clients */}
          <section className={styles.testimonialsSection}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Ce que disent nos clients</h2>
              <div className={styles.overallRating}>
                <div className={styles.ratingStars}>★★★★★</div>
                <div className={styles.ratingText}>
                  4.9/5 basé sur 256 avis vérifiés
                </div>
              </div>
            </div>

            <div className={styles.testimonialsGrid}>
              <div className={styles.testimonialCard}>
                <div className={styles.testimonialContent}>
                  <div className={styles.testimonialStars}>★★★★★</div>
                  <p className={styles.testimonialText}>
                    "J'ai découvert ces savons il y a 6 mois et ma peau s'est
                    transformée. Plus de problèmes de sécheresse et l'odeur est
                    divine ! Je recommande particulièrement le savon à l'avoine
                    pour les peaux sensibles."
                  </p>
                </div>
                <div className={styles.testimonialAuthor}>
                  <div className={styles.testimonialAvatar}>ML</div>
                  <div className={styles.testimonialInfo}>
                    <p className={styles.testimonialName}>Marie L.</p>
                    <p className={styles.testimonialLocation}>Lyon, France</p>
                  </div>
                  <div className={styles.verifiedBadge} title="Achat vérifié">
                    ✓
                  </div>
                </div>
              </div>

              <div className={styles.testimonialCard}>
                <div className={styles.testimonialContent}>
                  <div className={styles.testimonialStars}>★★★★★</div>
                  <p className={styles.testimonialText}>
                    "En tant qu'homme barbu, j'utilise leur savon pour le visage
                    et la barbe. Ma peau est apaisée et ma barbe plus douce que
                    jamais. Le service client est également excellent, très
                    réactif."
                  </p>
                </div>
                <div className={styles.testimonialAuthor}>
                  <div className={styles.testimonialAvatar}>TP</div>
                  <div className={styles.testimonialInfo}>
                    <p className={styles.testimonialName}>Thomas P.</p>
                    <p className={styles.testimonialLocation}>Paris, France</p>
                  </div>
                  <div className={styles.verifiedBadge} title="Achat vérifié">
                    ✓
                  </div>
                </div>
              </div>

              <div className={styles.testimonialCard}>
                <div className={styles.testimonialContent}>
                  <div className={styles.testimonialStars}>★★★★★</div>
                  <p className={styles.testimonialText}>
                    "J'apprécie particulièrement leur engagement écologique. Les
                    emballages sont magnifiques et peuvent être plantés dans le
                    jardin ! Un vrai plus par rapport aux autres marques."
                  </p>
                </div>
                <div className={styles.testimonialAuthor}>
                  <div className={styles.testimonialAvatar}>SM</div>
                  <div className={styles.testimonialInfo}>
                    <p className={styles.testimonialName}>Sophie M.</p>
                    <p className={styles.testimonialLocation}>
                      Marseille, France
                    </p>
                  </div>
                  <div className={styles.verifiedBadge} title="Achat vérifié">
                    ✓
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.testimonialsCta}>
              <Link href="/avis-clients" legacyBehavior>
                <a className={`${styles.button} ${styles.textButton}`}>
                  Voir tous les avis <span className={styles.arrowIcon}>→</span>
                </a>
              </Link>
            </div>
          </section>

          {/* Section Instagram Feed */}
          <section className={styles.instagramSection}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Suivez-nous sur Instagram</h2>
              <p className={styles.sectionSubtitle}>@monsavonvert</p>
            </div>

            <div className={styles.instagramGrid}>
              {[1, 2, 3, 4, 5, 6].map((num) => (
                <a
                  key={num}
                  href="https://instagram.com/monsavonvert"
                  className={styles.instagramItem}
                  target="_blank"
                  rel="noopener noreferrer"
                >
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
                </a>
              ))}
            </div>
          </section>

          {/* Section Newsletter */}
          <section className={styles.newsletterSection}>
            <div className={styles.newsletterContent}>
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
                    S'abonner
                  </button>
                </div>
                <label className={styles.consentLabel}>
                  <input type="checkbox" required />
                  <span>
                    J'accepte de recevoir des emails et je confirme avoir lu la{" "}
                    <Link href="/politique-de-confidentialite" legacyBehavior>
                      <a>politique de confidentialité</a>
                    </Link>
                    .
                  </span>
                </label>
              </form>
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
                  Savons artisanaux, naturels et écologiques fabriqués avec
                  passion en France depuis 2018.
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
                    <img src="/images/visa.svg" alt="Visa" />
                    <img src="/images/mastercard.svg" alt="Mastercard" />
                    <img src="/images/paypal.svg" alt="PayPal" />
                    <img src="/images/applepay.svg" alt="Apple Pay" />
                  </div>
                </div>
              </div>

              <div className={styles.footerColumn}>
                <h3 className={styles.footerTitle}>Boutique</h3>
                <Link href="/boutique/nouveautes" legacyBehavior>
                  <a className={styles.footerLink}>Nouveautés</a>
                </Link>
                <Link href="/boutique/visage" legacyBehavior>
                  <a className={styles.footerLink}>Soins visage</a>
                </Link>
                <Link href="/boutique/corps" legacyBehavior>
                  <a className={styles.footerLink}>Soins corps</a>
                </Link>
                <Link href="/boutique/cheveux" legacyBehavior>
                  <a className={styles.footerLink}>Cheveux</a>
                </Link>
                <Link href="/boutique/coffrets" legacyBehavior>
                  <a className={styles.footerLink}>Coffrets cadeaux</a>
                </Link>
                <Link href="/boutique/accessoires" legacyBehavior>
                  <a className={styles.footerLink}>Accessoires</a>
                </Link>
              </div>

              <div className={styles.footerColumn}>
                <h3 className={styles.footerTitle}>Informations</h3>
                <Link href="/a-propos" legacyBehavior>
                  <a className={styles.footerLink}>Notre histoire</a>
                </Link>
                <Link href="/virtues" legacyBehavior>
                  <a className={styles.footerLink}>Vertu & bienfaits</a>
                </Link>
                <Link href="/blog" legacyBehavior>
                  <a className={styles.footerLink}>Journal</a>
                </Link>
                <Link href="/faq" legacyBehavior>
                  <a className={styles.footerLink}>FAQ</a>
                </Link>
                <Link href="/contact" legacyBehavior>
                  <a className={styles.footerLink}>Contact</a>
                </Link>
                <Link href="/programme-fidelite" legacyBehavior>
                  <a className={styles.footerLink}>Programme fidélité</a>
                </Link>
              </div>

              <div className={styles.footerColumn}>
                <h3 className={styles.footerTitle}>Contact</h3>
                <p className={styles.contactInfo}>
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
                  >
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                  </svg>
                  <a href="tel:+33612345678">+33 6 12 34 56 78</a>
                </p>
                <p className={styles.contactInfo}>
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
                  >
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                  </svg>
                  <a href="mailto:info@monsavonvert.fr">info@monsavonvert.fr</a>
                </p>
                <p className={styles.contactInfo}>
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
                  >
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                  <span>
                    15 rue des Artisans
                    <br />
                    69001 Lyon, France
                  </span>
                </p>
                <p className={styles.contactInfo}>
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
                  >
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                  </svg>
                  <span>
                    Lun-Ven: 9h-18h
                    <br />
                    Sam: 10h-17h
                  </span>
                </p>
              </div>
            </div>
          </div>

          <div className={styles.footerBottom}>
            <div className={styles.footerBottomContent}>
              <p className={styles.copyright}>
                © 2023 MonSavonVert. Tous droits réservés.
              </p>
              <div className={styles.footerLinks}>
                <Link href="/cgv" legacyBehavior>
                  <a className={styles.footerSmallLink}>CGV</a>
                </Link>
                <Link href="/politique-de-confidentialite" legacyBehavior>
                  <a className={styles.footerSmallLink}>
                    Politique de confidentialité
                  </a>
                </Link>
                <Link href="/mentions-legales" legacyBehavior>
                  <a className={styles.footerSmallLink}>Mentions légales</a>
                </Link>
                <Link href="/cookies" legacyBehavior>
                  <a className={styles.footerSmallLink}>Gestion des cookies</a>
                </Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
