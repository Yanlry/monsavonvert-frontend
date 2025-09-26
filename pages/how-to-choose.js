"use client";

import { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import styles from "../styles/how-to-choose.module.css";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function HowToChoose() {
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

  // Données pour les différents types de peau et recommandations
  const skinGuideData = [
    {
      skinType: "Peau normale à sèche",
      concentration: "5%",
      reason: "Hydratation légère, nettoyage doux quotidien",
    },
    {
      skinType: "Peau sensible/Enfants",
      concentration: "5%",
      reason: "Formule douce, apaisante, non irritante"
    },
    {
      skinType: "Peau mixte",
      concentration: "5-20%",
      reason: "Équilibre entre hydratation et régulation du sébum",
    },
    {
      skinType: "Peau grasse/Acné légère",
      concentration: "20%",
      reason: "Propriétés séborégulatrices et antibactériennes",
    },
    {
        skinType: "Cheveux gras",
        concentration: "20%",
        reason: "Régule l'excès de sébum, purifie le cuir chevelu",
      },
    {
      skinType: "Acné modérée à sévère",
      concentration: "20-35%",
      reason: "Action antiseptique puissante, diminue l'inflammation",
    },
    {
      skinType: "Eczéma/Psoriasis",
      concentration: "35%",
      reason: "Effet apaisant intense, propriétés anti-inflammatoires et cicatrisantes",
    },
    {
      skinType: "Pellicules/Démangeaisons",
      concentration: "35%",
      reason: "Propriétés antifongiques, apaise le cuir chevelu",
    }
  ];

  // Données sur les concentrations disponibles
  const concentrationsInfo = [
    {
      percentage: "5%",
      title: "Savon Doux",
      description: "Parfait pour les peaux sèches ou sensibles",
      benefits: ["Hydratation douce", "Nettoyage respectueux", "Convient aux enfants"],
      image: "/images/5.JPEG",
      color: "#81c784"
    },
    {
      percentage: "20%",
      title: "Savon Équilibrant", 
      description: "Convient pour les peaux mixtes à grasses",
      benefits: ["Régulation du sébum", "Action purifiante", "Anti-imperfections"],
      image: "/images/4.JPEG",
      color: "#4caf50"
    },
    {
      percentage: "35%",
      title: "Savon Intense",
      description: "Pour les problèmes cutanés spécifiques",
      benefits: ["Action thérapeutique", "Anti-inflammatoire", "Cicatrisant"],
      image: "/images/3.JPEG",
      color: "#2e7d32"
    }
  ];

  // NOUVELLE SECTION : Données pour l'authenticité des savons d'Alep (style sobre)
  const authenticityChecks = [
    {
      criterion: "Couleur et aspect",
      authentic: "Vert olive à brun, surface mate et rugueuse, variations naturelles",
      fake: "Couleur trop uniforme, surface lisse et brillante, aspect artificiel"
    },
    {
      criterion: "Texture et poids",
      authentic: "Dense, lourd, consistance ferme, ne se casse pas facilement",
      fake: "Léger, friable, se désagrège rapidement, texture spongieuse"
    },
    {
      criterion: "Odeur naturelle",
      authentic: "Parfum subtil d'olive et de laurier, odeur authentique",
      fake: "Odeur chimique forte ou parfum artificiel trop prononcé"
    },
    {
      criterion: "Processus de fabrication",
      authentic: "Séché naturellement pendant 9 mois minimum, saponification traditionnelle",
      fake: "Séchage artificiel accéléré, procédés industriels rapides"
    },
    {
      criterion: "Composition",
      authentic: "Uniquement huile d'olive, huile de laurier, soude végétale, eau",
      fake: "Additifs chimiques, colorants, parfums synthétiques, conservateurs"
    },
    {
      criterion: "Origine et traçabilité",
      authentic: "Origine clairement indiquée, producteur identifiable, certifications",
      fake: "Origine floue, absence d'informations sur le producteur"
    }
  ];

  const qualityIndicators = [
    {
      title: "Prix cohérent",
      description: "Un savon d'Alep authentique a un coût de production élevé en raison de ses ingrédients de qualité et de son long processus de fabrication."
    },
    {
      title: "Informations complètes",
      description: "L'étiquetage doit mentionner clairement la composition, l'origine, le pourcentage d'huile de laurier et les conditions de fabrication."
    },
    {
      title: "Vendeur de confiance",
      description: "Privilégiez les vendeurs spécialisés qui peuvent vous fournir des informations détaillées sur la provenance et la fabrication."
    },
    {
      title: "Certifications",
      description: "Recherchez les certifications biologiques ou les labels de qualité qui garantissent l'authenticité du produit."
    }
  ];

  // Rendu de base sans contenu dynamique (pour éviter les erreurs d'hydratation)
  if (!isClient) {
    return (
      <>
        <Head>
          <title>Comment Choisir ? | MonSavonVert</title>
          <meta
            name="description"
            content="Guide complet pour choisir le savon d'Alep adapté à votre type de peau et vos besoins spécifiques."
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
        <title>Comment Choisir ? | MonSavonVert</title>
        <meta
          name="description"
          content="Guide complet pour choisir le savon d'Alep adapté à votre type de peau et vos besoins spécifiques."
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
              <h1 className={styles.pageTitle}>Comment Choisir ?</h1>
            </div>
          </section>

          {/* Section aperçu des concentrations */}
          <section className={styles.concentrationsSection}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>
                Nos 3 concentrations disponibles
              </h2>
              <p className={styles.sectionSubtitle}>
                Chaque concentration offre des bienfaits spécifiques adaptés à différents besoins
              </p>
            </div>

            <div className={styles.featuresGrid}>
              {concentrationsInfo.map((concentration, index) => (
                <div key={index} className={styles.featureCard} style={{ borderTop: `4px solid ${concentration.color}` }}>
                  <div className={styles.concentrationPercentage} style={{ backgroundColor: concentration.color }}>
                    <span>{concentration.percentage}</span>
                    <p>Huile de baie de laurier</p>
                  </div>
                  <h3 className={styles.featureTitle}>{concentration.title}</h3>
                  <p className={styles.featureDescription}>{concentration.description}</p>
                  <ul className={styles.benefitsList}>
                    {concentration.benefits.map((benefit, idx) => (
                      <li key={idx}>
                        <svg
                          viewBox="0 0 24 24"
                          width="16"
                          height="16"
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
                </div>
              ))}
            </div>
          </section>

          {/* NOUVELLE SECTION : Authenticité (style sobre et cohérent) */}
          <section className={styles.authenticitySection}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>
                Comment reconnaître un vrai savon d'Alep ?
              </h2>
              <p className={styles.sectionSubtitle}>
                Apprenez à identifier les caractéristiques d'un savon d'Alep authentique
              </p>
            </div>

            {/* Note d'information sobre */}
            <div className={styles.authenticityNote}>
              <div className={styles.authenticityNoteIcon}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  <path d="m9 12 2 2 4-4"/>
                </svg>
              </div>
              <div className={styles.authenticityNoteContent}>
                <h4>Pourquoi vérifier l'authenticité ?</h4>
                <p>
                  Le succès du savon d'Alep a malheureusement donné lieu à de nombreuses imitations. 
                  Ces contrefaçons ne possèdent pas les propriétés bénéfiques du véritable savon d'Alep 
                  et peuvent même être nocives pour votre peau.
                </p>
              </div>
            </div>

            {/* Tableau de comparaison sobre */}
            <div className={styles.authenticityTable}>
              <div className={styles.authenticityTableHeader}>
                <div className={styles.authenticityTableCell}>Critère de vérification</div>
                <div className={styles.authenticityTableCell}>Savon authentique</div>
                <div className={styles.authenticityTableCell}>Contrefaçon</div>
              </div>

              {authenticityChecks.map((check, index) => (
                <div key={index} className={styles.authenticityTableRow}>
                  <div className={styles.authenticityTableCell}>
                    <strong>{check.criterion}</strong>
                  </div>
                  <div className={styles.authenticityTableCell}>
                    <span className={styles.authenticTag}>
                      <svg
                        viewBox="0 0 24 24"
                        width="16"
                        height="16"
                        stroke="currentColor"
                        strokeWidth="2"
                        fill="none"
                      >
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                        <polyline points="22 4 12 14.01 9 11.01"></polyline>
                      </svg>
                      {check.authentic}
                    </span>
                  </div>
                  <div className={styles.authenticityTableCell}>
                    <span className={styles.fakeTag}>
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
                        <circle cx="12" cy="12" r="10"/>
                        <path d="m15 9-6 6"/>
                        <path d="m9 9 6 6"/>
                      </svg>
                      {check.fake}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Indicateurs de qualité */}
            <div className={styles.qualitySection}>
              <h3 className={styles.qualityTitle}>Indicateurs de qualité supplémentaires</h3>
              <div className={styles.qualityGrid}>
                {qualityIndicators.map((indicator, index) => (
                  <div key={index} className={styles.qualityCard}>
                    <h4>{indicator.title}</h4>
                    <p>{indicator.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Garantie MonSavonVert sobre */}
            <div className={styles.authenticityGuarantee}>
              <div className={styles.guaranteeContent}>
                <div className={styles.guaranteeIcon}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    <path d="m9 12 2 2 4-4"/>
                  </svg>
                </div>
                <div className={styles.guaranteeText}>
                  <h3>Notre engagement qualité</h3>
                  <p>
                    Chez MonSavonVert, nous garantissons l'authenticité de tous nos savons d'Alep. 
                    Nos produits sont sourcés directement auprès de producteurs certifiés et 
                    respectent l'ensemble des critères traditionnels de fabrication.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Guide de choix principal */}
          <section className={styles.guideSection}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>
                Guide de sélection par type de peau
              </h2>
              <p className={styles.sectionSubtitle}>
                Trouvez la concentration parfaite selon votre type de peau et vos besoins spécifiques
              </p>
            </div>

            <div className={styles.guideContent}>
              <div className={styles.guideTable}>
                <div className={styles.guideTableHeader}>
                  <div className={styles.guideTableCell}>
                    Type de peau/Besoin
                  </div>
                  <div className={styles.guideTableCell}>
                    Concentration recommandée
                  </div>
                  <div className={styles.guideTableCell}>Pourquoi</div>
                </div>

                {skinGuideData.map((item, index) => (
                  <div key={index} className={styles.guideTableRow}>
                    <div className={styles.guideTableCell}>
                      <strong>{item.skinType}</strong>
                    </div>
                    <div className={styles.guideTableCell}>
                      <span className={styles.concentrationTag}>{item.concentration}</span>
                    </div>
                    <div className={styles.guideTableCell}>
                      {item.reason}
                    </div>
                  </div>
                ))}
              </div>

              <div className={styles.guideNote}>
                <div className={styles.guideNoteIcon}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
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
                </div>
                <div className={styles.guideNoteContent}>
                  <h4>Conseil d'utilisation</h4>
                  <p>
                    Si vous utilisez le savon d'Alep pour la première fois, nous
                    recommandons de commencer par la concentration à 5%,
                    particulièrement si vous avez la peau sensible. Vous pourrez
                    ensuite augmenter progressivement la concentration selon les
                    besoins de votre peau.
                  </p>
                  <p>
                    Pour les problèmes cutanés spécifiques, consultez un
                    dermatologue avant d'utiliser la concentration à 35%.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Section conseils d'usage */}
          <section className={styles.usageSection}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>
                Conseils pour bien débuter
              </h2>
              <p className={styles.sectionSubtitle}>
                Quelques recommandations pour optimiser votre expérience avec le savon d'Alep
              </p>
            </div>

            <div className={styles.usageContent}>
              <div className={styles.usageStep}>
                <div className={styles.usageStepNumber}>1</div>
                <div className={styles.usageStepContent}>
                  <h3>Test de tolérance</h3>
                  <p>
                    Effectuez toujours un test sur une petite zone de peau avant la première 
                    utilisation, surtout avec les concentrations élevées (20% et 35%).
                  </p>
                </div>
              </div>

              <div className={styles.usageStep}>
                <div className={styles.usageStepNumber}>2</div>
                <div className={styles.usageStepContent}>
                  <h3>Progression graduelle</h3>
                  <p>
                    Commencez par des utilisations espacées (2-3 fois par semaine) puis 
                    augmentez progressivement selon la tolérance de votre peau.
                  </p>
                </div>
              </div>

              <div className={styles.usageStep}>
                <div className={styles.usageStepNumber}>3</div>
                <div className={styles.usageStepContent}>
                  <h3>Observation et adaptation</h3>
                  <p>
                    Observez la réaction de votre peau pendant les premières semaines. 
                    Une légère adaptation est normale, mais toute irritation persistante 
                    doit vous faire consulter.
                  </p>
                </div>
              </div>

              <div className={styles.usageStep}>
                <div className={styles.usageStepNumber}>4</div>
                <div className={styles.usageStepContent}>
                  <h3>Hydratation complémentaire</h3>
                  <p>
                    Même si le savon d'Alep est naturellement hydratant, n'hésitez pas 
                    à appliquer votre soin hydratant habituel après le nettoyage.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* CTA final */}
          <section className={styles.ctaSection}>
            <div className={styles.ctaContent}>
              <h2>Vous savez maintenant quel savon choisir ?</h2>
              <p>
                Découvrez notre sélection de savons d'Alep authentiques et choisissez 
                la concentration qui correspond parfaitement à vos besoins.
              </p>
              <Link href="/store" className={styles.ctaButton}>
                Découvrir notre boutique
              </Link>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
}