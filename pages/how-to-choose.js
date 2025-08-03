"use client";

import { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import styles from "../styles/virtues.module.css";
import Header from "../components/Header";

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
      concentration: "20-30%",
      reason: "Action antiseptique puissante, diminue l'inflammation",
    },
    {
      skinType: "Eczéma/Psoriasis",
      concentration: "30%",
      reason: "Effet apaisant intense, propriétés anti-inflammatoires et cicatrisantes",
    },
    {
      skinType: "Pellicules/Démangeaisons",
      concentration: "30%",
      reason: "Propriétés antifongiques, apaise le cuir chevelu",
    }
  ];

  // Données sur les concentrations disponibles
  const concentrationsInfo = [
    {
      percentage: "5%",
      title: "Savon Doux",
      description: "Idéal pour les peaux sensibles et l'usage quotidien",
      benefits: ["Hydratation douce", "Nettoyage respectueux", "Convient aux enfants"],
      image: "/images/5.JPEG",
      color: "#81c784"
    },
    {
      percentage: "20%",
      title: "Savon Équilibrant", 
      description: "Parfait pour les peaux mixtes à grasses",
      benefits: ["Régulation du sébum", "Action purifiante", "Anti-imperfections"],
      image: "/images/4.JPEG",
      color: "#4caf50"
    },
    {
      percentage: "30%",
      title: "Savon Intense",
      description: "Pour les problèmes cutanés spécifiques",
      benefits: ["Action thérapeutique", "Anti-inflammatoire", "Cicatrisant"],
      image: "/images/3.JPEG",
      color: "#2e7d32"
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
              <div className={styles.pageBreadcrumb}>
                <Link href="/">Accueil</Link>
                <span className={styles.breadcrumbSeparator}>/</span>
                <span className={styles.breadcrumbCurrent}>
                  Comment choisir
                </span>
              </div>
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
                    dermatologue avant d'utiliser la concentration à 30%.
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
                    utilisation, surtout avec les concentrations élevées (20% et 30%).
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

        {/* Footer */}
        <footer className={styles.footer}>
          <div className={styles.footerTop}>
            <div className={styles.footerContent}>
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
              </div>

              <div className={styles.footerColumn}>
                <h3 className={styles.footerTitle}>Boutique</h3>
                <Link href="/boutique/nouveautes" className={styles.footerLink}>
                 Nouveautés
                </Link>
                <Link href="/boutique/visage" className={styles.footerLink}>
                 Soins visage
                </Link>
                <Link href="/boutique/corps" className={styles.footerLink}>
                 Soins corps
                </Link>
                <Link href="/boutique/cheveux" className={styles.footerLink}>
                 Cheveux
                </Link>
                <Link href="/boutique/coffrets" className={styles.footerLink}>
                 Coffrets cadeaux
                </Link>
                <Link href="/boutique/accessoires" className={styles.footerLink}>
                 Accessoires
                </Link>
              </div>

              <div className={styles.footerColumn}>
                <h3 className={styles.footerTitle}>Informations</h3>
                <Link href="/a-propos" className={styles.footerLink}>
                 Notre histoire
                </Link>
                <Link href="/virtues" className={styles.footerLink}>
                 Vertu & bienfaits
                </Link>
                <Link href="/how-to-choose" className={styles.footerLink}>
                 Comment choisir ?
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
                <Link href="/programme-fidelite" className={styles.footerLink}>
                 Programme fidélité
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
              </div>
            </div>
          </div>

          <div className={styles.footerBottom}>
            <div className={styles.footerBottomContent}>
              <p className={styles.copyright}>
                © 2023 MonSavonVert. Tous droits réservés.
              </p>
              <div className={styles.footerLinks}>
                <Link href="/cgv" className={styles.footerSmallLink}>
                  CGV
                </Link>
                <Link
                  href="/politique-de-confidentialite"
                  className={styles.footerSmallLink}
                >
                  Politique de confidentialité
                </Link>
                <Link
                  href="/mentions-legales"
                  className={styles.footerSmallLink}
                >
                  Mentions légales
                </Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}