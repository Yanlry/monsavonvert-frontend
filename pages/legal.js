import React from "react";

/**
 * Composant principal pour la page Mentions Légales
 */
const LegalPage = () => {
  // Informations de l'entreprise - MODIFIEZ CES INFORMATIONS AVEC VOS VRAIES DONNÉES
  const companyInfo = {
    name: "MON SAVON VERT", // ⚠️ CHANGEZ PAR VOTRE NOM D'ENTREPRISE
    address: "35 rue de l'égalité, 59320 Haubourdin, Nord, France", // ⚠️ CHANGEZ PAR VOTRE ADRESSE
    email: "contact@monsavonvert.com", // ⚠️ CHANGEZ PAR VOTRE EMAIL
    phone: "06 58 00 27 07", // ⚠️ CHANGEZ PAR VOTRE TÉLÉPHONE
    siret: "878 373 539 00013", // ⚠️ CHANGEZ PAR VOTRE SIRET
    siren: "878373539", // ⚠️ AJOUTEZ VOTRE siren
  };

  // Sections des mentions légales
  const legalSections = [
    {
      id: "section-1",
      title: "Article 1 — Identification de l'entreprise",
      content: `${companyInfo.name} est une société spécialisée dans la fabrication et la vente de savons artisanaux. Siège social : ${companyInfo.address}. SIRET : ${companyInfo.siret}. Numéro de SIREN : ${companyInfo.siren}.`,
    },
    {
      id: "section-2",
      title: "Article 2 — Directeur de la publication",
      content: `Le directeur de la publication du présent site internet est le représentant légal de ${companyInfo.name}. Pour toute question relative au contenu du site, vous pouvez contacter : ${companyInfo.email}.`,
    },
    {
      id: "section-3",
      title: "Article 3 — Hébergement du site",
      content:
        "Le présent site internet est hébergé par un prestataire professionnel garantissant la continuité du service et la sécurité des données. Les coordonnées complètes de l'hébergeur sont disponibles sur demande.",
    },
    {
      id: "section-4",
      title: "Article 4 — Propriété intellectuelle",
      content: `L'ensemble des contenus présents sur ce site (textes, images, logos, marques) sont la propriété exclusive de ${companyInfo.name} ou font l'objet d'une autorisation d'utilisation. Toute reproduction, représentation ou diffusion sans autorisation préalable est interdite.`,
    },
    {
      id: "section-5",
      title: "Article 5 — Conditions d'utilisation",
      content:
        "L'accès et l'utilisation de ce site impliquent l'acceptation pleine et entière des présentes mentions légales. L'utilisateur s'engage à respecter les conditions d'utilisation et à ne pas porter atteinte aux droits de propriété intellectuelle.",
    },
    {
      id: "section-6",
      title: "Article 6 — Responsabilité",
      content: `${companyInfo.name} s'efforce d'assurer l'exactitude et la mise à jour des informations diffusées sur ce site. Toutefois, nous ne pouvons garantir l'exactitude, la complétude ou l'actualité des informations mises à disposition.`,
    },
    {
      id: "section-7",
      title: "Article 7 — Liens hypertextes",
      content:
        "Ce site peut contenir des liens vers des sites externes. Nous ne sommes pas responsables du contenu de ces sites tiers ni des dommages qui pourraient résulter de leur utilisation.",
    },
    {
      id: "section-8",
      title: "Article 8 — Cookies et traceurs",
      content:
        "Ce site utilise des cookies techniques nécessaires à son bon fonctionnement. Les modalités d'utilisation des cookies sont détaillées dans notre politique de gestion des cookies.",
    },
    {
      id: "section-9",
      title: "Article 9 — Droit applicable",
      content:
        "Les présentes mentions légales sont soumises au droit français. En cas de litige, les tribunaux français seront seuls compétents.",
    },
    {
      id: "section-10",
      title: "Article 10 — Contact",
      content: `Pour toute question relative aux présentes mentions légales ou au fonctionnement du site, vous pouvez nous contacter : Email : ${companyInfo.email} - Téléphone : ${companyInfo.phone} - Adresse postale : ${companyInfo.address}.`,
    },
  ];

  // Fonction pour naviguer vers une section spécifique avec animation fluide
  const scrollToSection = (sectionId) => {
    console.log(`📍 Navigation vers la section: ${sectionId}`);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Fonction - Bouton retour vers la page précédente
  const handleGoBack = () => {
    console.log("↩️ Retour à la page précédente");
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
          <h1 className="luxury-title">Mentions Légales</h1>
          <div className="title-divider"></div>
          <p className="luxury-subtitle">
            Informations légales et réglementaires
          </p>
        </div>
      </header>

      {/* Informations société dans un encadré distingué - PLEINE LARGEUR */}
      <section className="company-section">
        <div className="company-content">
          <h2 className="company-name">{companyInfo.name}</h2>
          <div className="company-details">
            <p className="company-address">{companyInfo.address}</p>
            <div className="company-legal-info">
              <p>
                <strong>SIRET :</strong> {companyInfo.siret}
              </p>
              <p>
                <strong>SIREN :</strong> {companyInfo.siren}
              </p>
            </div>
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
      <div className="luxury-legal-container">
        {/* Sommaire élégant */}
        <nav className="luxury-nav">
          <h3 className="nav-title">Sommaire</h3>
          <div className="nav-grid">
            {legalSections.map((section, index) => (
              <button
                key={section.id}
                onClick={() => scrollToSection(section.id)}
                className="nav-item"
              >
                <span className="nav-number">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="nav-text">{section.title}</span>
              </button>
            ))}
          </div>
        </nav>

        {/* Contenu principal avec design épuré */}
        <main className="luxury-content">
          {legalSections.map((section, index) => (
            <article
              key={section.id}
              id={section.id}
              className="luxury-section"
            >
              <div className="section-header">
                <span className="section-number">
                  {String(index + 1).padStart(2, "0")}
                </span>
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
              <strong>Dernière mise à jour :</strong>{" "}
              {new Date().toLocaleDateString("fr-FR", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
            <p className="footer-contact">
              Pour toute question concernant ces mentions légales, nous vous
              invitons à nous contacter à l'adresse :
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
          font-family: "Georgia", "Times New Roman", serif;
          line-height: 1.8;
          color: #1b3b2a;
          background: #ffffff;
          font-size: 16px;
        }

        /* MODIFIÉ : Conteneur pour le contenu centré (sauf bannière) */
        .luxury-legal-container {
          max-width: 900px;
          margin: 0 auto;
          padding: 0;
        }

        /* MODIFIÉ : En-tête en pleine largeur */
        .luxury-header {
          width: 100%; /* PLEINE LARGEUR */
          background: linear-gradient(135deg, #2d4a3a 0%, #1b3b2a 100%);
          padding: 80px 60px;
          text-align: center;
          position: relative;
          min-height: 300px;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        /* Bouton retour repositionné et restyler */
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
          color: #ffffff;
          padding: 12px 20px;
          font-family: "Helvetica Neue", Arial, sans-serif;
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
          border-color: #f5f2e8;
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
          color: #ffffff;
          margin: 0 0 30px 0;
          letter-spacing: 2px;
          text-transform: uppercase;
          font-family: "Helvetica Neue", Arial, sans-serif;
        }

        .title-divider {
          width: 120px;
          height: 2px;
          background: #f5f2e8;
          margin: 0 auto 30px auto;
        }

        .luxury-subtitle {
          font-size: 1.1em;
          color: #f5f2e8;
          font-style: italic;
          font-weight: 300;
          margin: 0;
          opacity: 0.9;
        }

        /* MODIFIÉ : Section entreprise en pleine largeur */
        .company-section {
          width: 100%; /* PLEINE LARGEUR */
          background: #f5f2e8;
          padding: 50px 60px;
        }

        .company-content {
          text-align: center;
          max-width: 600px;
          margin: 0 auto;
        }

        .company-name {
          font-size: 2.2em;
          color: #1b3b2a;
          margin: 0 0 25px 0;
          font-weight: 400;
          letter-spacing: 1px;
        }

        .company-details {
          color: #2d4a3a;
        }

        .company-address {
          font-size: 1.1em;
          margin: 0 0 20px 0;
          font-style: italic;
        }

        .company-legal-info {
          margin: 20px 0;
        }

        .company-legal-info p {
          margin: 5px 0;
          font-size: 0.95em;
        }

        .contact-info {
          display: flex;
          justify-content: center;
          align-items: center;
          flex-wrap: wrap;
          gap: 20px;
          margin-top: 20px;
        }

        .contact-item {
          font-size: 0.95em;
        }

        .contact-divider {
          color: #2d4a3a;
          font-weight: 300;
        }

        /* Navigation sommaire */
        .luxury-nav {
          padding: 60px;
          background: #ffffff;
        }

        .nav-title {
          text-align: center;
          font-size: 1.8em;
          color: #1b3b2a;
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
          background: #f5f2e8;
          border: none;
          cursor: pointer;
          transition: all 0.4s ease;
          text-align: left;
          border-left: 4px solid transparent;
        }

        .nav-item:hover {
          background: #2d4a3a;
          color: #ffffff;
          border-left-color: #f5f2e8;
          transform: translateX(8px);
        }

        .nav-number {
          font-size: 0.85em;
          font-weight: bold;
          color: #2d4a3a;
          margin-right: 20px;
          font-family: "Helvetica Neue", Arial, sans-serif;
          min-width: 25px;
        }

        .nav-item:hover .nav-number {
          color: #f5f2e8;
        }

        .nav-text {
          font-size: 0.95em;
          font-weight: 400;
        }

        /* Contenu principal */
        .luxury-content {
          padding: 60px;
          background: #ffffff;
        }

        .luxury-section {
          margin-bottom: 60px;
          padding-bottom: 40px;
          border-bottom: 1px solid #f5f2e8;
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
          color: #2d4a3a;
          margin-right: 20px;
          font-family: "Helvetica Neue", Arial, sans-serif;
          min-width: 35px;
        }

        .section-title {
          font-size: 1.4em;
          color: #1b3b2a;
          margin: 0;
          font-weight: 400;
          letter-spacing: 0.5px;
        }

        .section-body {
          margin-left: 55px;
        }

        .section-text {
          color: #2d4a3a;
          font-size: 1em;
          line-height: 1.8;
          text-align: justify;
          margin: 0;
        }

        /* Pied de page */
        .luxury-footer {
          background: #f5f2e8;
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
          background: #2d4a3a;
          margin: 0 auto 30px auto;
        }

        .footer-date {
          color: #2d4a3a;
          font-size: 0.95em;
          margin: 0 0 20px 0;
        }

        .footer-contact {
          color: #2d4a3a;
          font-size: 0.9em;
          line-height: 1.6;
          margin: 0;
        }

        .footer-link {
          color: #1b3b2a;
          text-decoration: none;
          font-weight: 500;
          border-bottom: 1px solid transparent;
          transition: border-color 0.3s ease;
        }

        .footer-link:hover {
          border-bottom-color: #1b3b2a;
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

export default LegalPage;
