import React from 'react';

/**
 * Composant principal pour la page Gestion des Cookies - Version Luxe JavaScript
 * Design ultra-professionnel avec palette vert foncé, blanc et beige
 */
const CookiesPage = () => {
  console.log('🍪 Chargement de la page Gestion des Cookies - Version Luxe');

  // Informations de l'entreprise - MODIFIEZ CES INFORMATIONS AVEC VOS VRAIES DONNÉES
  const companyInfo = {
    name: "MON SAVON VERT", // ⚠️ CHANGEZ PAR VOTRE NOM D'ENTREPRISE
    address: "35 rue de l'égalité, 59320 Haubourdin, Nord, France", // ⚠️ CHANGEZ PAR VOTRE ADRESSE
    email: "contact@monsavonvert.com", // ⚠️ CHANGEZ PAR VOTRE EMAIL
    phone: "06 58 00 27 07" // ⚠️ CHANGEZ PAR VOTRE TÉLÉPHONE
  };

  // Sections de la gestion des cookies
  const cookiesSections = [
    {
      id: "section-1",
      title: "Article 1 — Qu'est-ce qu'un cookie ?",
      content: "Un cookie est un petit fichier de données qu'un site web enregistre sur votre ordinateur ou appareil mobile lorsque vous le visitez. Les cookies permettent au site web de mémoriser vos actions et préférences sur une période donnée, afin de ne pas avoir à les ressaisir à chaque visite."
    },
    {
      id: "section-2",
      title: "Article 2 — Types de cookies utilisés",
      content: `${companyInfo.name} utilise différents types de cookies sur son site : les cookies techniques strictement nécessaires au fonctionnement du site, les cookies de préférences pour mémoriser vos choix, les cookies statistiques pour comprendre l'utilisation du site, et les cookies de marketing pour personnaliser les contenus.`
    },
    {
      id: "section-3",
      title: "Article 3 — Cookies techniques nécessaires",
      content: "Ces cookies sont indispensables au bon fonctionnement de notre site web. Ils vous permettent de naviguer sur le site et d'utiliser ses fonctionnalités essentielles comme le panier d'achat, l'authentification et les préférences de sécurité. Ces cookies ne nécessitent pas votre consentement."
    },
    {
      id: "section-4",
      title: "Article 4 — Cookies de préférences",
      content: "Ces cookies permettent à notre site web de mémoriser les informations qui modifient son comportement ou son apparence, comme votre langue préférée ou la région dans laquelle vous vous trouvez. Ils améliorent votre expérience de navigation en personnalisant le contenu."
    },
    {
      id: "section-5",
      title: "Article 5 — Cookies statistiques et d'analyse",
      content: "Ces cookies nous aident à comprendre comment les visiteurs interagissent avec notre site web en collectant et rapportant des informations de manière anonyme. Ces données nous permettent d'améliorer constamment notre site et votre expérience utilisateur."
    },
    {
      id: "section-6",
      title: "Article 6 — Cookies publicitaires et marketing",
      content: "Ces cookies sont utilisés pour vous proposer des publicités plus pertinentes pour vous et vos intérêts. Ils peuvent également être utilisés pour limiter le nombre de fois que vous voyez une publicité et aider à mesurer l'efficacité des campagnes publicitaires."
    },
    {
      id: "section-7",
      title: "Article 7 — Durée de conservation",
      content: "La durée de conservation des cookies varie selon leur type et leur finalité. Les cookies de session sont supprimés lorsque vous fermez votre navigateur, tandis que les cookies persistants peuvent être conservés jusqu'à 13 mois maximum, conformément à la réglementation en vigueur."
    },
    {
      id: "section-8",
      title: "Article 8 — Gestion de vos préférences",
      content: "Vous pouvez à tout moment modifier vos préférences concernant l'utilisation des cookies via les paramètres de votre navigateur ou grâce à notre outil de gestion des cookies disponible sur notre site. Vous pouvez accepter, refuser ou supprimer les cookies selon vos préférences."
    },
    {
      id: "section-9",
      title: "Article 9 — Paramétrage de votre navigateur",
      content: "Vous pouvez configurer votre navigateur pour qu'il vous informe de la présence de cookies et vous demande de les accepter ou non. Vous pouvez également paramétrer votre navigateur pour qu'il refuse automatiquement tous les cookies ou seulement certains d'entre eux."
    },
    {
      id: "section-10",
      title: "Article 10 — Contact et informations",
      content: `Pour toute question concernant notre utilisation des cookies, vous pouvez nous contacter à l'adresse ${companyInfo.email}. Cette politique de cookies peut être modifiée à tout moment pour refléter les changements dans nos pratiques ou pour des raisons opérationnelles, légales ou réglementaires.`
    }
  ];

  // Fonction pour naviguer vers une section spécifique avec animation fluide
  const scrollToSection = (sectionId) => {
    console.log(`📍 Navigation vers la section: ${sectionId}`);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Fonction - Bouton retour vers la page précédente
  const handleGoBack = () => {
    console.log('↩️ Retour à la page précédente');
    window.history.back();
  };

  return (
    <div className="page-wrapper">
      {/* En-tête élégant avec bouton retour intégré - PLEINE LARGEUR */}
      <header className="luxury-header">
        {/* Bouton retour intégré dans l'en-tête */}
        <button onClick={handleGoBack} className="luxury-back-button">
          <span className="back-arrow">←</span>
          <span className="back-text">Retour</span>
        </button>
        
        <div className="header-content">
          <h1 className="luxury-title">
            Gestion des Cookies
          </h1>
          <div className="title-divider"></div>
          <p className="luxury-subtitle">
            Utilisation et gestion des cookies sur notre site web
          </p>
        </div>
      </header>

      {/* Informations société dans un encadré distingué - PLEINE LARGEUR */}
      <section className="company-section">
        <div className="company-content">
          <h2 className="company-name">{companyInfo.name}</h2>
          <div className="company-details">
            <p className="company-address">{companyInfo.address}</p>
            <div className="contact-info">
              <span className="contact-item">
                <strong>Email :</strong> {companyInfo.email}
              </span>
              <span className="contact-divider">|</span>
              <span className="contact-item">
                <strong>Téléphone :</strong> {companyInfo.phone}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Contenu principal dans un conteneur limité */}
      <div className="luxury-cookies-container">
        {/* Sommaire élégant */}
        <nav className="luxury-nav">
          <h3 className="nav-title">Sommaire</h3>
          <div className="nav-grid">
            {cookiesSections.map((section, index) => (
              <button 
                key={section.id}
                onClick={() => scrollToSection(section.id)}
                className="nav-item"
              >
                <span className="nav-number">{String(index + 1).padStart(2, '0')}</span>
                <span className="nav-text">{section.title}</span>
              </button>
            ))}
          </div>
        </nav>

        {/* Contenu principal avec design épuré */}
        <main className="luxury-content">
          {cookiesSections.map((section, index) => (
            <article key={section.id} id={section.id} className="luxury-section">
              <div className="section-header">
                <span className="section-number">{String(index + 1).padStart(2, '0')}</span>
                <h3 className="section-title">{section.title}</h3>
              </div>
              <div className="section-body">
                <p className="section-text">{section.content}</p>
              </div>
            </article>
          ))}
        </main>

        {/* Pied de page sobre et professionnel */}
        <footer className="luxury-footer">
          <div className="footer-content">
            <div className="footer-divider"></div>
            <p className="footer-date">
              <strong>Dernière mise à jour :</strong> {new Date().toLocaleDateString('fr-FR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
            <p className="footer-contact">
              Pour toute question concernant notre politique de cookies, 
              nous vous invitons à nous contacter à l'adresse : 
              <a href={`mailto:${companyInfo.email}`} className="footer-link">
                {companyInfo.email}
              </a>
            </p>
          </div>
        </footer>
      </div>

      {/* Styles CSS ultra-professionnels AVEC BANNIÈRE PLEINE LARGEUR */}
      <style jsx>{`
        /* Reset et configuration de base */
        * {
          box-sizing: border-box;
        }

        /* NOUVEAU : Wrapper principal pour toute la page */
        .page-wrapper {
          width: 100%;
          margin: 0;
          padding: 0;
          font-family: 'Georgia', 'Times New Roman', serif;
          line-height: 1.8;
          color: #1B3B2A;
          background: #FFFFFF;
          font-size: 16px;
        }

        /* MODIFIÉ : Conteneur pour le contenu centré (sauf bannière) */
        .luxury-cookies-container {
          max-width: 900px;
          margin: 0 auto;
          padding: 0;
        }

        /* MODIFIÉ : En-tête en pleine largeur */
        .luxury-header {
          width: 100%; /* PLEINE LARGEUR */
          background: linear-gradient(135deg, #2D4A3A 0%, #1B3B2A 100%);
          padding: 80px 60px;
          text-align: center;
          position: relative;
          min-height: 300px;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        /* Bouton retour */
        .luxury-back-button {
          position: absolute;
          top: 30px;
          left: 30px;
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(10px);
          border: 2px solid rgba(245, 242, 232, 0.3);
          color: #FFFFFF;
          padding: 12px 20px;
          font-family: 'Helvetica Neue', Arial, sans-serif;
          font-size: 0.9em;
          font-weight: 500;
          cursor: pointer;
          border-radius: 25px;
          transition: all 0.3s ease;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          z-index: 10;
        }

        .luxury-back-button:hover {
          background: rgba(245, 242, 232, 0.2);
          border-color: #F5F2E8;
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
        }

        .back-arrow {
          font-size: 1.2em;
          font-weight: bold;
          transition: transform 0.3s ease;
        }

        .luxury-back-button:hover .back-arrow {
          transform: translateX(-3px);
        }

        .back-text {
          font-size: 0.85em;
        }

        .header-content {
          max-width: 600px;
          margin: 0 auto;
        }

        .luxury-title {
          font-size: 3.2em;
          font-weight: 300;
          color: #FFFFFF;
          margin: 0 0 30px 0;
          letter-spacing: 2px;
          text-transform: uppercase;
          font-family: 'Helvetica Neue', Arial, sans-serif;
        }

        .title-divider {
          width: 120px;
          height: 2px;
          background: #F5F2E8;
          margin: 0 auto 30px auto;
        }

        .luxury-subtitle {
          font-size: 1.1em;
          color: #F5F2E8;
          font-style: italic;
          font-weight: 300;
          margin: 0;
          opacity: 0.9;
        }

        /* MODIFIÉ : Section entreprise en pleine largeur */
        .company-section {
          width: 100%; /* PLEINE LARGEUR */
          background: #F5F2E8;
          padding: 50px 60px;
        }

        .company-content {
          text-align: center;
          max-width: 600px;
          margin: 0 auto;
        }

        .company-name {
          font-size: 2.2em;
          color: #1B3B2A;
          margin: 0 0 25px 0;
          font-weight: 400;
          letter-spacing: 1px;
        }

        .company-details {
          color: #2D4A3A;
        }

        .company-address {
          font-size: 1.1em;
          margin: 0 0 20px 0;
          font-style: italic;
        }

        .contact-info {
          display: flex;
          justify-content: center;
          align-items: center;
          flex-wrap: wrap;
          gap: 20px;
        }

        .contact-item {
          font-size: 0.95em;
        }

        .contact-divider {
          color: #2D4A3A;
          font-weight: 300;
        }

        /* Navigation sommaire */
        .luxury-nav {
          padding: 60px;
          background: #FFFFFF;
        }

        .nav-title {
          text-align: center;
          font-size: 1.8em;
          color: #1B3B2A;
          margin: 0 0 40px 0;
          font-weight: 300;
          letter-spacing: 1px;
          text-transform: uppercase;
        }

        .nav-grid {
          display: grid;
          gap: 2px;
          max-width: 700px;
          margin: 0 auto;
        }

        .nav-item {
          display: flex;
          align-items: center;
          padding: 18px 25px;
          background: #F5F2E8;
          border: none;
          cursor: pointer;
          transition: all 0.4s ease;
          text-align: left;
          border-left: 4px solid transparent;
        }

        .nav-item:hover {
          background: #2D4A3A;
          color: #FFFFFF;
          border-left-color: #F5F2E8;
          transform: translateX(8px);
        }

        .nav-number {
          font-size: 0.85em;
          font-weight: bold;
          color: #2D4A3A;
          margin-right: 20px;
          font-family: 'Helvetica Neue', Arial, sans-serif;
          min-width: 25px;
        }

        .nav-item:hover .nav-number {
          color: #F5F2E8;
        }

        .nav-text {
          font-size: 0.95em;
          font-weight: 400;
        }

        /* Contenu principal */
        .luxury-content {
          padding: 60px;
          background: #FFFFFF;
        }

        .luxury-section {
          margin-bottom: 60px;
          padding-bottom: 40px;
          border-bottom: 1px solid #F5F2E8;
        }

        .luxury-section:last-child {
          border-bottom: none;
          margin-bottom: 0;
        }

        .section-header {
          display: flex;
          align-items: center;
          margin-bottom: 25px;
        }

        .section-number {
          font-size: 1.1em;
          font-weight: bold;
          color: #2D4A3A;
          margin-right: 20px;
          font-family: 'Helvetica Neue', Arial, sans-serif;
          min-width: 35px;
        }

        .section-title {
          font-size: 1.4em;
          color: #1B3B2A;
          margin: 0;
          font-weight: 400;
          letter-spacing: 0.5px;
        }

        .section-body {
          margin-left: 55px;
        }

        .section-text {
          color: #2D4A3A;
          font-size: 1em;
          line-height: 1.8;
          text-align: justify;
          margin: 0;
        }

        /* Pied de page */
        .luxury-footer {
          background: #F5F2E8;
          padding: 50px 60px;
        }

        .footer-content {
          max-width: 600px;
          margin: 0 auto;
          text-align: center;
        }

        .footer-divider {
          width: 80px;
          height: 1px;
          background: #2D4A3A;
          margin: 0 auto 30px auto;
        }

        .footer-date {
          color: #2D4A3A;
          font-size: 0.95em;
          margin: 0 0 20px 0;
        }

        .footer-contact {
          color: #2D4A3A;
          font-size: 0.9em;
          line-height: 1.6;
          margin: 0;
        }

        .footer-link {
          color: #1B3B2A;
          text-decoration: none;
          font-weight: 500;
          border-bottom: 1px solid transparent;
          transition: border-color 0.3s ease;
        }

        .footer-link:hover {
          border-bottom-color: #1B3B2A;
        }

        /* Design responsive amélioré */
        @media (max-width: 768px) {
          .page-wrapper {
            font-size: 15px;
          }
          
          .luxury-header {
            padding: 60px 30px 50px 30px;
            min-height: 250px;
          }

          .luxury-back-button {
            top: 20px;
            left: 20px;
            padding: 10px 16px;
            font-size: 0.85em;
          }
          
          .luxury-title {
            font-size: 2.2em;
            letter-spacing: 1px;
          }
          
          .company-section,
          .luxury-nav,
          .luxury-content,
          .luxury-footer {
            padding: 40px 30px;
          }
          
          .contact-info {
            flex-direction: column;
            gap: 10px;
          }
          
          .contact-divider {
            display: none;
          }
          
          .section-header {
            flex-direction: column;
            align-items: flex-start;
          }
          
          .section-number {
            margin-bottom: 10px;
          }
          
          .section-body {
            margin-left: 0;
          }
        }

        @media (max-width: 480px) {
          .luxury-header {
            padding: 50px 20px 40px 20px;
            min-height: 220px;
          }

          .luxury-back-button {
            top: 15px;
            left: 15px;
            padding: 8px 12px;
            font-size: 0.8em;
          }

          .company-section,
          .luxury-nav,
          .luxury-content,
          .luxury-footer {
            padding: 30px 20px;
          }
          
          .luxury-title {
            font-size: 1.8em;
          }
          
          .company-name {
            font-size: 1.8em;
          }
        }
      `}</style>
    </div>
  );
};

export default CookiesPage;