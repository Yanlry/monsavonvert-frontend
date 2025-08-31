"use client";

import { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import styles from "../styles/info.module.css";
import Header from "../components/Header";
import Footer from "../components/Footer"; // NOUVEAU: Import du composant footer

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

  useEffect(() => {
    // Synchroniser le nombre d'articles dans le panier avec le localStorage
    const storedCart = JSON.parse(localStorage.getItem("cart")) || [];
    const totalItems = storedCart.reduce((sum, item) => sum + item.quantity, 0);
    setCartCount(totalItems);
  }, []);

  // Données de la timeline historique
  const timelineItems = [
    {
      year: "VIIIe siècle",
      title: "Naissance du premier savon d'Alep",
      content:
        "Les maîtres savonniers développent une recette secrète à base d'huile d'olive et de baies de laurier dans l'antique cité syrienne, transmise de génération en génération.",
      position: "left",
    },
    {
      year: "XIIe siècle",
      title: "L'âge d'or du savon d'Alep",
      content:
        "Les Croisés découvrent ce trésor syrien et l'importent en Europe, donnant naissance aux savonneries de Marseille et de Castille. Alep devient le berceau mondial de la savonnerie.",
      position: "right",
    },
    {
      year: "1900-2010",
      title: "Apogée de l'industrie du savon d'Alep",
      content:
        "Plus de 100 savonneries traditionnelles façonnent des millions de pains de savon chaque année, perpétuant un savoir-faire millénaire dans toute la région d'Alep.",
      position: "left",
    },
    {
      year: "2011-2018",
      title: "La guerre en Syrie bouleverse tout",
      content:
        "De nombreuses savonneries d'Alep sont détruites ou contraintes d'arrêter leur production. Une partie de cette tradition artisanale ancestrale risque de disparaître.",
      position: "right",
    },
    {
      year: "2023",
      title: "Naissance de MonSavonVert",
      content:
        "Passionnés par l'authenticité du savon d'Alep, nous décidons d'importer directement ces savons traditionnels pour contribuer au maintien de cette économie locale et préserver ce patrimoine.",
      position: "left",
    },
    {
      year: "2024",
      title: "Développement de notre gamme",
      content:
        "Nous travaillons avec des artisans syriens pour vous proposer des savons d'Alep authentiques, fabriqués selon les méthodes traditionnelles millénaires.",
      position: "right",
    },
  ];

  // Nos valeurs fondamentales
  const values = [
    {
      title: "Authenticité",
      description:
        "Nos savons d'Alep sont importés directement de Syrie et fabriqués selon les méthodes ancestrales : huile d'olive première pression, huile de baies de laurier, et un savoir-faire transmis depuis plus de mille ans.",
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
          <path d="M12 2L2 7v10c0 5.55 3.84 10 9 10s9-4.45 9-10V7l-10-5z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      ),
    },
    {
      title: "Tradition",
      description:
        "Nous contribuons à préserver un patrimoine mondial unique. Le savon d'Alep représente plus de mille ans de tradition artisanale syrienne que nous souhaitons faire découvrir et maintenir vivante.",
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
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9,22 9,12 15,12 15,22" />
        </svg>
      ),
    },
    {
      title: "Qualité",
      description:
        "Fabriqués selon les méthodes traditionnelles, nos savons vieillissent naturellement pendant 18 mois minimum. Cette maturation lente leur confère leur douceur exceptionnelle et leurs propriétés uniques.",
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
    },
    {
      title: "Engagement",
      description:
        "En choisissant nos savons d'Alep, vous participez au maintien d'une économie artisanale traditionnelle et contribuez à la préservation de ce savoir-faire millénaire unique au monde.",
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
          <path d="M20 6L9 17l-5-5" />
        </svg>
      ),
    },
  ];

  // Rendu de base sans contenu dynamique (pour éviter les erreurs d'hydratation)
  if (!isClient) {
    return (
      <>
        <Head>
          <title>
            Notre Histoire | MonSavonVert - Savons d'Alep Authentiques
          </title>
          <meta
            name="description"
            content="Découvrez l'histoire millénaire du savon d'Alep et notre démarche d'importation directe depuis la Syrie."
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
        <title>
          Notre Histoire | MonSavonVert - Savons d'Alep Authentiques
        </title>
        <meta
          name="description"
          content="Découvrez l'histoire millénaire du savon d'Alep et notre démarche d'importation directe depuis la Syrie pour préserver cette tradition artisanale."
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
              <h1 className={styles.pageTitle}>
                L'Histoire Millénaire du Savon d'Alep
              </h1>
            </div>
          </section>

          {/* Introduction section */}
          <section className={styles.introSection}>
            <div className={styles.introImageColumn}>
              <div className={styles.introImage}>
                <img
                  src="/images/1.JPEG"
                  alt="Artisan fabriquant du savon d'Alep traditionnel"
                />
              </div>
            </div>
            <div className={styles.introContentColumn}>
              <div className={styles.introContent}>
                <span className={styles.sectionTag}>Un héritage en péril</span>
                <h2 className={styles.introTitle}>
                  Préserver un trésor de l'humanité
                </h2>
                <p className={styles.introParagraph}>
                  Le savon d'Alep n'est pas qu'un simple produit de beauté.
                  C'est l'ancêtre de tous les savons du monde, né il y a plus de
                  mille ans dans les souks de l'antique cité syrienne d'Alep.
                  Cette merveille artisanale, fabriquée selon une recette
                  secrète transmise de maître à apprenti depuis des siècles,
                  représente un patrimoine culturel inestimable.
                </p>
                <p className={styles.introParagraph}>
                  La guerre en Syrie a malheureusement perturbé la production de
                  ces savons traditionnels. De nombreuses savonneries ont dû
                  cesser leur activité ou ont été endommagées. Cette situation
                  nous a sensibilisés à l'importance de préserver ce
                  savoir-faire millénaire.
                </p>
                <p className={styles.introParagraph}>
                  En 2023, MonSavonVert a vu le jour avec une mission simple
                  mais importante : importer directement des savons d'Alep
                  authentiques pour vous faire découvrir ce trésor de
                  l'artisanat syrien, tout en contribuant au maintien de cette
                  économie traditionnelle locale.
                </p>
                <div className={styles.introCertifications}>
                  <div className={styles.certificationBadge}>
                    <img src="/images/bio.png" alt="Artisanal" />
                    <span>100% Artisanal</span>
                  </div>
                  <div className={styles.certificationBadge}>
                    <img src="/images/cruelty-free.png" alt="Naturel" />
                    <span>100% Naturel</span>
                  </div>
                  <div className={styles.certificationBadge}>
                    <img src="/images/vegan.png" alt="Authentique Alep" />
                    <span>Authentique d'Alep</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Timeline section */}
          <section className={styles.timelineSection}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Mille ans d'histoire</h2>
              <p className={styles.sectionSubtitle}>
                Du berceau de la savonnerie mondiale à la renaissance d'un art
                en péril
              </p>
            </div>

            <div className={styles.timeline}>
              {timelineItems.map((item, index) => (
                <div
                  key={index}
                  className={`${styles.timelineItem} ${
                    item.position === "left"
                      ? styles.timelineItemLeft
                      : styles.timelineItemRight
                  }`}
                >
                  <div className={styles.timelinePoint}></div>
                  <div
                    className={`${styles.timelineContent} ${
                      item.position === "left"
                        ? styles.timelineContentLeft
                        : styles.timelineContentRight
                    }`}
                  >
                    <div className={styles.timelineYear}>{item.year}</div>
                    <h3 className={styles.timelineTitle}>{item.title}</h3>
                    <p className={styles.timelineText}>{item.content}</p>
                  </div>
                </div>
              ))}
              <div className={styles.timelineLine}></div>
            </div>
          </section>

          {/* Section sur la fabrication traditionnelle */}
          <section className={styles.craftSection}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>
                L'art ancestral de la fabrication
              </h2>
              <p className={styles.sectionSubtitle}>
                Un processus inchangé depuis mille ans
              </p>
            </div>

            <div className={styles.craftContent}>
              <div className={styles.craftStep}>
                <div className={styles.craftNumber}>1</div>
                <h3>La récolte des baies de laurier</h3>
                <p>
                  Chaque automne, les baies de laurier sauvage sont récoltées à
                  la main dans les montagnes syriennes. Cette huile précieuse,
                  au cœur de la recette, ne peut être remplacée par aucun autre
                  ingrédient.
                </p>
              </div>

              <div className={styles.craftStep}>
                <div className={styles.craftNumber}>2</div>
                <h3>La saponification ancestrale</h3>
                <p>
                  Dans d'immenses cuves en cuivre, l'huile d'olive première
                  pression est mélangée à la soude naturelle et cuite lentement
                  pendant trois jours. Les maîtres savonniers surveillent jour
                  et nuit cette alchimie délicate.
                </p>
              </div>

              <div className={styles.craftStep}>
                <div className={styles.craftNumber}>3</div>
                <h3>Le coulage et la découpe</h3>
                <p>
                  Le savon liquide est coulé sur le sol de l'atelier, puis
                  découpé à la main en cubes parfaits. Chaque pain porte la
                  marque du maître savonnier, garantie d'authenticité transmise
                  depuis des générations.
                </p>
              </div>

              <div className={styles.craftStep}>
                <div className={styles.craftNumber}>4</div>
                <h3>Le séchage naturel</h3>
                <p>
                  Les savons sont empilés en tours géométriques parfaites dans
                  des caves naturelles où ils sèchent pendant 18 mois minimum.
                  Cette maturation lente leur confère leur couleur dorée et leur
                  douceur exceptionnelle.
                </p>
              </div>
            </div>
          </section>

          {/* Values section */}
          <section className={styles.valuesSection}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Nos engagements</h2>
              <p className={styles.sectionSubtitle}>
                Les valeurs qui guident notre mission de préservation
              </p>
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

          {/* Section pourquoi choisir */}
          <section className={styles.whySection}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>
                Pourquoi choisir nos savons d'Alep ?
              </h2>
              <p className={styles.sectionSubtitle}>
                Un choix authentique pour votre peau et pour préserver une
                tradition
              </p>
            </div>

            <div className={styles.whyGrid}>
              <div className={styles.whyCard}>
                <div className={styles.whyIcon}>
                  <svg
                    viewBox="0 0 24 24"
                    width="48"
                    height="48"
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
                </div>
                <h3 className={styles.whyTitle}>100% Naturel</h3>
                <p className={styles.whyDescription}>
                  Uniquement de l'huile d'olive, de l'huile de baies de laurier,
                  de l'eau et de l'hydroxyde de sodium. La soude caustique,
                  indispensable à la saponification, disparaît entièrement lors
                  de cette réaction naturelle qui transforme les huiles en
                  savon. Aucun additif, conservateur ou parfum artificiel.
                </p>
              </div>

              <div className={styles.whyCard}>
                <div className={styles.whyIcon}>
                  <svg
                    viewBox="0 0 24 24"
                    width="48"
                    height="48"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12,6 12,12 16,14" />
                  </svg>
                </div>
                <h3 className={styles.whyTitle}>Maturation 18 mois</h3>
                <p className={styles.whyDescription}>
                  Nos savons sont vieillis naturellement pendant au minimum 18
                  mois selon la méthode ancestrale. Cette longue maturation
                  permet à la saponification de se parfaire, évapore l'humidité
                  et développe leur douceur unique. Le vieillissement concentre
                  les propriétés des huiles pour un savon d'exception.
                </p>
              </div>

              <div className={styles.whyCard}>
                <div className={styles.whyIcon}>
                  <svg
                    viewBox="0 0 24 24"
                    width="48"
                    height="48"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 2L2 7v10c0 5.55 3.84 10 9 10s9-4.45 9-10V7l-10-5z" />
                    <path d="M12 7v5l3 3" />
                  </svg>
                </div>
                <h3 className={styles.whyTitle}>Tradition millénaire</h3>
                <p className={styles.whyDescription}>
                  Élaborés selon la recette traditionnelle
                  inchangée depuis plus de 1000 ans, directement dans la région
                  d'Alep en Syrie. Cette méthode artisanale respecte chaque
                  étape du processus historique : cuisson lente au chaudron,
                  coulage manuel et séchage à l'air libre. Un savoir-faire
                  millénaire transmis de génération en
                  génération.
                </p>
              </div>
            </div>
          </section>

          {/* Contact CTA section */}
          <section className={styles.contactCta}>
            <div className={styles.ctaContent}>
              <h2 className={styles.ctaTitle}>Découvrez l'authenticité</h2>
              <p className={styles.ctaText}>
                Chaque savon d'Alep que vous choisissez vous fait découvrir un
                patrimoine millénaire et contribue au maintien de cette
                tradition artisanale unique. Rejoignez-nous dans cette démarche
                authentique.
              </p>
              <div className={styles.ctaButtons}>
                <Link
                  href="/boutique"
                  className={`${styles.button} ${styles.primaryButton}`}
                >
                  Découvrir nos savons
                </Link>
                <Link
                  href="/contact"
                  className={`${styles.button} ${styles.secondaryButton}`}
                >
                  En savoir plus
                </Link>
              </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
}
