import React from 'react';

/**
 * Composant principal pour la page Mentions Légales - Version Luxe JavaScript
 * Design ultra-professionnel avec palette vert foncé, blanc et beige
 */
const LegalPage = () => {
  console.log('⚖️ Chargement de la page Mentions Légales - Version Luxe');

  // Informations de l'entreprise - MODIFIEZ CES INFORMATIONS AVEC VOS VRAIES DONNÉES
  const companyInfo = {
    name: "MON SAVON VERT", // ⚠️ CHANGEZ PAR VOTRE NOM D'ENTREPRISE
    address: "59000 Lille, Nord, France", // ⚠️ CHANGEZ PAR VOTRE ADRESSE
    email: "contact@monsavonvert.fr", // ⚠️ CHANGEZ PAR VOTRE EMAIL
    phone: "06 58 00 27 07", // ⚠️ CHANGEZ PAR VOTRE TÉLÉPHONE
    siret: "123 456 789 00012", // ⚠️ CHANGEZ PAR VOTRE SIRET
    tva: "FR12345678901", // ⚠️ CHANGEZ PAR VOTRE NUMÉRO TVA
    capital: "10 000" // ⚠️ CHANGEZ PAR VOTRE CAPITAL SOCIAL
  };

  // Sections des mentions légales
  const legalSections = [
    {
      id: "section-1",
      title: "Article 1 — Identification de l'entreprise",
      content: `${companyInfo.name} est une société spécialisée dans la fabrication et la vente de savons artisanaux. Siège social : ${companyInfo.address}. SIRET : ${companyInfo.siret}. Numéro de TVA intracommunautaire : ${companyInfo.tva}. Capital social : ${companyInfo.capital} euros.`
    },
    {
      id: "section-2",
      title: "Article 2 — Directeur de la publication",
      content: `Le directeur de la publication du présent site internet est le représentant légal de ${companyInfo.name}. Pour toute question relative au contenu du site, vous pouvez contacter : ${companyInfo.email}.`
    },
    {
      id: "section-3",
      title: "Article 3 — Hébergement du site",
      content: "Le présent site internet est hébergé par un prestataire professionnel garantissant la continuité du service et la sécurité des données. Les coordonnées complètes de l'hébergeur sont disponibles sur demande."
    },
    {
      id: "section-4",
      title: "Article 4 — Propriété intellectuelle",
      content: `L'ensemble des contenus présents sur ce site (textes, images, logos, marques) sont la propriété exclusive de ${companyInfo.name} ou font l'objet d'une autorisation d'utilisation. Toute reproduction, représentation ou diffusion sans autorisation préalable est interdite.`
    },
    {
      id: "section-5",
      title: "Article 5 — Conditions d'utilisation",
      content: "L'accès et l'utilisation de ce site impliquent l'acceptation pleine et entière des présentes mentions légales. L'utilisateur s'engage à respecter les conditions d'utilisation et à ne pas porter atteinte aux droits de propriété intellectuelle."
    },
    {
      id: "section-6",
      title: "Article 6 — Responsabilité",
      content: `${companyInfo.name} s'efforce d'assurer l'exactitude et la mise à jour des informations diffusées sur ce site. Toutefois, nous ne pouvons garantir l'exactitude, la complétude ou l'actualité des informations mises à disposition.`
    },
    {
      id: "section-7",
      title: "Article 7 — Liens hypertextes",
      content: "Ce site peut contenir des liens vers des sites externes. Nous ne sommes pas responsables du contenu de ces sites tiers ni des dommages qui pourraient résulter de leur utilisation."
    },
    {
      id: "section-8",
      title: "Article 8 — Cookies et traceurs",
      content: "Ce site utilise des cookies techniques nécessaires à son bon fonctionnement. Les modalités d'utilisation des cookies sont détaillées dans notre politique de gestion des cookies."
    },
    {
      id: "section-9",
      title: "Article 9 — Droit applicable",
      content: "Les présentes mentions légales sont soumises au droit français. En cas de litige, les tribunaux français seront seuls compétents."
    },
    {
      id: "section-10",
      title: "Article 10 — Contact",
      content: `Pour toute question relative aux présentes mentions légales ou au fonctionnement du site, vous pouvez nous contacter : Email : ${companyInfo.email} - Téléphone : ${companyInfo.phone} - Adresse postale : ${companyInfo.address}.`
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
    <div className="luxury-legal-container">
      {/* Bouton retour élégant */}
      <div className="back-button-container">
        <button onClick={handleGoBack} className="luxury-back-button">
          <span className="back-arrow">←</span>
          <span className="back-text">Retour</span>
        </button>
      </div>

      {/* En-tête élégant et minimaliste */}
      <header className="luxury-header">
        <div className="header-content">
          <h1 className="luxury-title">
            Mentions Légales
          </h1>
          <div className="title-divider"></div>
          <p className="luxury-subtitle">
            Informations légales et réglementaires
          </p>
        </div>
      </header>

      {/* Informations société dans un encadré distingué */}
      <section className="company-section">
        <div className="company-content">
          <h2 className="company-name">{companyInfo.name}</h2>
          <div className="company-details">
            <p className="company-address">{companyInfo.address}</p>
            <div className="company-legal-info">
              <p><strong>SIRET :</strong> {companyInfo.siret}</p>
              <p><strong>TVA :</strong> {companyInfo.tva}</p>
              <p><strong>Capital :</strong> {companyInfo.capital} €</p>
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
              <span className="nav-number">{String(index + 1).padStart(2, '0')}</span>
              <span className="nav-text">{section.title}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Contenu principal avec design épuré */}
      <main className="luxury-content">
        {legalSections.map((section, index) => (
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
            Pour toute question concernant ces mentions légales, 
            nous vous invitons à nous contacter à l'adresse : 
            <a href={`mailto:${companyInfo.email}`} className="footer-link">
              {companyInfo.email}
            </a>
          </p>
        </div>
      </footer>

      {/* Styles CSS ultra-professionnels */}
      <style jsx>{`
        /* Reset et configuration de base */
        * {
          box-sizing: border-box;
        }

        .luxury-legal-container {
          max-width: 900px;
          margin: 0 auto;
          padding: 0;
          font-family: 'Georgia', 'Times New Roman', serif;
          line-height: 1.8;
          color: #1B3B2A;
          background: #FFFFFF;
          font-size: 16px;
        }

        /* Styles pour le bouton retour */
        .back-button-container {
          padding: 30px 60px 0 60px;
          background: #FFFFFF;
        }

        .luxury-back-button {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #F5F2E8;
          border: 2px solid #2D4A3A;
          color: #1B3B2A;
          padding: 12px 20px;
          font-family: 'Helvetica Neue', Arial, sans-serif;
          font-size: 0.95em;
          font-weight: 500;
          cursor: pointer;
          border-radius: 6px;
          transition: all 0.3s ease;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .luxury-back-button:hover {
          background: #2D4A3A;
          color: #FFFFFF;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(29, 59, 42, 0.2);
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
          font-size: 0.9em;
        }

        /* En-tête élégant */
        .luxury-header {
          background: linear-gradient(135deg, #2D4A3A 0%, #1B3B2A 100%);
          padding: 80px 60px;
          text-align: center;
          position: relative;
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

        /* Section entreprise */
        .company-section {
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

        /* Design responsive */
        @media (max-width: 768px) {
          .luxury-legal-container {
            font-size: 15px;
          }

          .back-button-container {
            padding: 20px 30px 0 30px;
          }
          
          .luxury-header {
            padding: 50px 30px;
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
          .back-button-container {
            padding: 15px 20px 0 20px;
          }

          .luxury-header,
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