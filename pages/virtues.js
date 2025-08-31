"use client";

import { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import styles from "../styles/virtues.module.css";
import Header from "../components/Header";
import footer from "../components/footer"; // NOUVEAU: Import du composant footer

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
    if (typeof document !== "undefined") {
      document.body.classList.add(styles.resetMargins);
      document.documentElement.classList.add(styles.resetMargins);
    }

    // Détection du scroll pour le header
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };

    // Gestionnaires d'événements
    if (typeof window !== "undefined") {
      window.addEventListener("scroll", handleScroll);

      // Récupérer le nombre d'articles dans le panier
      try {
        const storedCart = JSON.parse(localStorage.getItem("cart")) || [];
        const totalItems = storedCart.reduce(
          (sum, item) => sum + item.quantity,
          0
        );
        setCartCount(totalItems);
        console.log("Nombre d'articles dans le panier:", totalItems);
      } catch (error) {
        console.error("Erreur lors du chargement du panier:", error);
      }
    }

    // Nettoyage
    return () => {
      if (typeof document !== "undefined") {
        document.body.classList.remove(styles.resetMargins);
        document.documentElement.classList.remove(styles.resetMargins);
      }
      if (typeof window !== "undefined") {
        window.removeEventListener("scroll", handleScroll);
      }
    };
  }, []);

  // Données sur les bienfaits du savon d'Alep
  const alepSoapBenefits = [
    {
      id: 1,
      icon: "🌿",
      title: "Purement Naturel",
      description:
        "Fabriqué uniquement avec de l'huile d'olive, de l'huile de baie de laurier et de la soude, sans parfums ni colorants artificiels",
    },
    {
      id: 2,
      icon: "🧴",
      title: "Adapté à tous",
      description:
        "Convient à tous les types de peau, même les plus sensibles et réactives, grâce à son pH neutre et sa formule douce",
    },
    {
      id: 3,
      icon: "⏳",
      title: "Savoir-faire millénaire",
      description:
        "Recette ancestrale originaire de Syrie transmise de génération en génération depuis plus de 3000 ans",
    },
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
        "Convient à toute la famille, y compris les enfants",
      ],
      description:
        "Avec seulement 5% d'huile de baie de laurier, ce savon offre une action douce tout en préservant les bienfaits apaisants. Sa formule délicate en fait un choix parfait pour le soin quotidien du visage et du corps, même pour les peaux sensibles et celle des enfants. Il nettoie en profondeur sans agresser ni dessécher l'épiderme.",
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
        "Shampooing naturel pour cheveux gras",
      ],
      description:
        "Avec 20% d'huile de baie de laurier, ce savon offre un parfait équilibre entre action purifiante et hydratation. Sa concentration moyenne en fait un allié idéal pour les peaux à tendance grasse ou mixte. Ses propriétés antibactériennes naturelles aident à réguler le sébum, réduire les imperfections et apaiser les petites irritations cutanées.",
    },
    {
      id: 3,
      percentage: "35%",
      title: "Savon d'Alep Intense",
      image: "/images/3.JPEG",
      suitableFor: "Problèmes cutanés, peaux très grasses, usage thérapeutique",
      benefits: [
        "Puissantes propriétés antiseptiques et cicatrisantes",
        "Soulagement des affections cutanées (eczéma, psoriasis)",
        "Action anti-acnéique renforcée",
        "Hydratation profonde des peaux très sèches",
        "Effet assainissant pour les cuirs chevelus à problèmes",
      ],
      description:
        "Avec 35% d'huile de baie de laurier, ce savon représente la concentration la plus élevée et la plus efficace. Sa formule puissante est recommandée pour les problèmes cutanés spécifiques. Traditionnellement utilisé pour ses vertus thérapeutiques, il offre un soulagement aux peaux souffrant d'eczéma, de psoriasis ou d'acné sévère grâce à ses exceptionnelles propriétés antiseptiques et cicatrisantes.",
    },
  ];

  // Rendu de base sans contenu dynamique (pour éviter les erreurs d'hydratation)
  if (!isClient) {
    return (
      <>
        <Head>
          <title>Vertus & Bienfaits | MonSavonVert</title>
          <meta
            name="description"
            content="Découvrez tous les bienfaits des savons d'Alep et leurs différentes concentrations en huile de baie de laurier."
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
        <title>Vertus & Bienfaits | MonSavonVert</title>
        <meta
          name="description"
          content="Découvrez tous les bienfaits des savons d'Alep et leurs différentes concentrations en huile de baie de laurier."
        />
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      <div className={styles.container}>
        {/* Header avec navigation */}
        <header
          className={`${styles.header} ${
            scrolled ? styles.headerScrolled : ""
          }`}
        >
          <Header cartCount={cartCount} />
        </header>

        <main className={styles.mainContent}>
          {/* Hero section */}
          <section className={styles.pageHero}>
            <div className={styles.pageHeroContent}>
              <h1 className={styles.pageTitle}>Vertus & Bienfaits</h1>
            </div>
          </section>

          {/* Section d'introduction */}
          <section className={styles.introSection}>
            <div className={styles.flexContainer}>
              <div className={styles.introContent}>
                <h2 className={styles.introTitle}>
                  Le trésor ancestral de la cosmétique
                </h2>
                <div className={styles.introText}>
                  <p>
                    Le savon d'Alep est considéré comme l'ancêtre de tous les
                    savons durs. Originaire de la ville d'Alep en Syrie, ce
                    savon traditionnel est fabriqué depuis plus de 3000 ans
                    selon une recette et un savoir-faire transmis de génération
                    en génération.
                  </p>
                  <p>
                    Sa composition est d'une simplicité remarquable : de l'huile
                    d'olive, de l'huile de baie de laurier et de la soude. C'est
                    la concentration en huile de baie de laurier qui détermine
                    ses propriétés et ses bienfaits spécifiques.
                  </p>
                  <p>
                    Ce savon 100% naturel est reconnu pour ses exceptionnelles
                    propriétés dermatologiques. Sa richesse en antioxydants, en
                    vitamines et en acides gras essentiels en fait un allié
                    précieux pour tous les types de peau, même les plus
                    sensibles.
                  </p>
                </div>
              </div>
              <div className={styles.introImageWrapper}>
                <img
                  src="/images/8.JPEG"
                  alt="Savon d'Alep traditionnel"
                  className={styles.introImage}
                />
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
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>
                L'huile de baie de laurier: le secret de ses vertus
              </h2>
              <p className={styles.sectionSubtitle}>
                Comprendre le composant magique qui donne au savon d'Alep toutes
                ses propriétés
              </p>
            </div>

            <div className={styles.laurelContent}>
              <div className={styles.laurelImageWrapper}>
                <img
                  src="/images/7.JPEG"
                  alt="Huile de baie de laurier"
                  className={styles.laurelImage}
                />
              </div>
              <div className={styles.laurelInfo}>
                <h3>Un concentré de bienfaits naturels</h3>
                <p>
                  L'huile de baie de laurier est extraite des baies du laurier
                  noble (Laurus nobilis), un arbuste méditerranéen aux vertus
                  médicinales reconnues depuis l'Antiquité. Riche en composés
                  actifs, cette huile précieuse est le secret qui fait du savon
                  d'Alep un produit d'exception.
                </p>

                <h3>Ses propriétés exceptionnelles</h3>
                <ul className={styles.propertiesList}>
                  <li>
                    <svg
                      viewBox="0 0 24 24"
                      width="24"
                      height="24"
                      stroke="currentColor"
                      strokeWidth="2"
                      fill="none"
                    >
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                      <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                    <span>
                      <strong>Antiseptique & antibactérienne</strong> - Combat
                      naturellement les bactéries et prévient les infections
                      cutanées
                    </span>
                  </li>
                  <li>
                    <svg
                      viewBox="0 0 24 24"
                      width="24"
                      height="24"
                      stroke="currentColor"
                      strokeWidth="2"
                      fill="none"
                    >
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                      <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                    <span>
                      <strong>Anti-inflammatoire</strong> - Apaise les
                      irritations et réduit les rougeurs cutanées
                    </span>
                  </li>
                  <li>
                    <svg
                      viewBox="0 0 24 24"
                      width="24"
                      height="24"
                      stroke="currentColor"
                      strokeWidth="2"
                      fill="none"
                    >
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                      <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                    <span>
                      <strong>Séborégulatrice</strong> - Équilibre la production
                      de sébum, idéale pour les peaux mixtes à grasses
                    </span>
                  </li>
                  <li>
                    <svg
                      viewBox="0 0 24 24"
                      width="24"
                      height="24"
                      stroke="currentColor"
                      strokeWidth="2"
                      fill="none"
                    >
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                      <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                    <span>
                      <strong>Cicatrisante</strong> - Favorise la guérison des
                      petites lésions et accélère la régénération cellulaire
                    </span>
                  </li>
                  <li>
                    <svg
                      viewBox="0 0 24 24"
                      width="24"
                      height="24"
                      stroke="currentColor"
                      strokeWidth="2"
                      fill="none"
                    >
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                      <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                    <span>
                      <strong>Antioxydante</strong> - Protège la peau contre les
                      agressions extérieures et les radicaux libres
                    </span>
                  </li>
                </ul>

                <p className={styles.laurelNote}>
                  <strong>
                    La concentration en huile de baie de laurier est clé :
                  </strong>{" "}
                  Plus le pourcentage est élevé, plus les propriétés curatives
                  du savon sont intenses. C'est cette concentration qui
                  détermine l'efficacité du savon selon les différents types de
                  peau et problèmes cutanés.
                </p>
              </div>
            </div>
          </section>

          {/* Caractéristiques générales du savon d'Alep */}
          <section className={styles.featuresSection}>
            <div className={styles.contentContainer}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>
                  Pourquoi choisir le savon d'Alep ?
                </h2>
                <p className={styles.sectionSubtitle}>
                  Un produit d'exception aux multiples vertus pour votre peau et
                  l'environnement
                </p>
              </div>

              <div className={styles.featuresContainer}>
                <div className={styles.featuresGrid}>
                  {alepSoapBenefits.map((feature) => (
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
            </div>
          </section>

          {/* Sections des différentes concentrations */}
          <section className={styles.concentrationsSection}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>
                Les différentes concentrations et leurs bienfaits
              </h2>
              <p className={styles.sectionSubtitle}>
                Chaque concentration d'huile de baie de laurier offre des vertus
                spécifiques adaptées à vos besoins
              </p>
            </div>

            <div className={styles.concentrationsContent}>
              {concentrationDetails.map((concentration, index) => (
                <div
                  key={concentration.id}
                  className={`${styles.concentrationCard} ${
                    index % 2 !== 0 ? styles.reverseCard : ""
                  }`}
                >
                  <div className={styles.concentrationImageWrapper}>
                    <img
                      src={concentration.image}
                      alt={`Savon d'Alep ${concentration.percentage} huile de baie de laurier`}
                      className={styles.concentrationImage}
                    />
                  </div>
                  <div className={styles.concentrationInfo}>
                    <h3 className={styles.concentrationTitle}>
                      {concentration.title}
                    </h3>
                    <div className={styles.concentrationSuitable}>
                      <span>Idéal pour :</span> {concentration.suitableFor}
                    </div>
                    <p className={styles.concentrationDescription}>
                      {concentration.description}
                    </p>
                    <h4 className={styles.benefitsTitle}>
                      Bienfaits spécifiques
                    </h4>
                    <ul className={styles.benefitsList}>
                      {concentration.benefits.map((benefit, idx) => (
                        <li key={idx}>
                          <svg
                            viewBox="0 0 24 24"
                            width="18"
                            height="18"
                            stroke="currentColor"
                            strokeWidth="2"
                            fill="none"
                          >
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                            <polyline points="22 4 12 14.01 9 11.01"></polyline>
                          </svg>
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>
                    <a
                      href={`/store#savon-${concentration.percentage.replace(
                        "%",
                        ""
                      )}`}
                      className={styles.shopButton}
                    >
                      Découvrir le savon à {concentration.percentage}
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Section utilisation optimale */}
          <section className={styles.usageSection}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>
                Comment utiliser votre savon d'Alep
              </h2>
              <p className={styles.sectionSubtitle}>
                Maximisez les bienfaits de votre savon avec ces conseils
                d'utilisation
              </p>
            </div>

            <div className={styles.usageContent}>
              <div className={styles.usageStep}>
                <div className={styles.usageStepNumber}>1</div>
                <div className={styles.usageStepContent}>
                  <h3>Préparation</h3>
                  <p>
                    Mouillez votre peau avec de l'eau tiède pour ouvrir les
                    pores. Humidifiez également le savon d'Alep.
                  </p>
                </div>
              </div>

              <div className={styles.usageStep}>
                <div className={styles.usageStepNumber}>2</div>
                <div className={styles.usageStepContent}>
                  <h3>Application</h3>
                  <p>
                    Frottez doucement le savon entre vos mains pour créer une
                    mousse riche et crémeuse. Appliquez sur la peau en massant
                    délicatement avec des mouvements circulaires.
                  </p>
                </div>
              </div>

              <div className={styles.usageStep}>
                <div className={styles.usageStepNumber}>3</div>
                <div className={styles.usageStepContent}>
                  <h3>Temps de pause</h3>
                  <p>
                    Pour les problèmes cutanés spécifiques, laissez la mousse
                    agir 1 à 2 minutes sur la peau afin que les principes actifs
                    puissent pénétrer et faire effet.
                  </p>
                </div>
              </div>

              <div className={styles.usageStep}>
                <div className={styles.usageStepNumber}>4</div>
                <div className={styles.usageStepContent}>
                  <h3>Rinçage</h3>
                  <p>
                    Rincez abondamment à l'eau tiède puis terminez par un jet
                    d'eau fraîche pour refermer les pores et tonifier la peau.
                  </p>
                </div>
              </div>

              <div className={styles.usageTips}>
                <h3>Conseils pour prolonger la durée de vie de votre savon</h3>
                <ul>
                  <li>
                    <svg
                      viewBox="0 0 24 24"
                      width="16"
                      height="16"
                      stroke="currentColor"
                      strokeWidth="2"
                      fill="none"
                    >
                      <polyline points="9 11 12 14 22 4"></polyline>
                      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
                    </svg>
                    <span>
                      Utilisez un porte-savon drainant pour éviter que le savon
                      ne baigne dans l'eau
                    </span>
                  </li>
                  <li>
                    <svg
                      viewBox="0 0 24 24"
                      width="16"
                      height="16"
                      stroke="currentColor"
                      strokeWidth="2"
                      fill="none"
                    >
                      <polyline points="9 11 12 14 22 4"></polyline>
                      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
                    </svg>
                    <span>
                      Conservez le savon dans un endroit sec et aéré entre
                      chaque utilisation
                    </span>
                  </li>
                  <li>
                    <svg
                      viewBox="0 0 24 24"
                      width="16"
                      height="16"
                      stroke="currentColor"
                      strokeWidth="2"
                      fill="none"
                    >
                      <polyline points="9 11 12 14 22 4"></polyline>
                      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
                    </svg>
                    <span>
                      Coupez le savon en deux pour n'utiliser qu'une moitié à la
                      fois
                    </span>
                  </li>
                  <li>
                    <svg
                      viewBox="0 0 24 24"
                      width="16"
                      height="16"
                      stroke="currentColor"
                      strokeWidth="2"
                      fill="none"
                    >
                      <polyline points="9 11 12 14 22 4"></polyline>
                      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
                    </svg>
                    <span>
                      Laissez sécher le savon après chaque utilisation
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* CTA vers Comment choisir */}
          <section className={styles.ctaSection}>
            <div className={styles.ctaContent}>
              <h2>Vous ne savez pas quelle concentration choisir ?</h2>
              <p>
                Découvrez notre guide personnalisé pour trouver le savon d'Alep 
                parfaitement adapté à votre type de peau et à vos besoins spécifiques.
              </p>
              <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link href="/how-to-choose" className={styles.ctaButton}>
                  Comment choisir ?
                </Link>
                <Link href="/store" className={styles.ctaButton} style={{ backgroundColor: 'transparent', border: '2px solid white', color: 'white' }}>
                  Découvrir nos savons
                </Link>
              </div>
            </div>
          </section>
        </main>

        <footer />
      </div>
    </>
  );
}