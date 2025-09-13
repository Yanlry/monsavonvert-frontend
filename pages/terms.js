import React from 'react';

/**
 * Composant principal pour la page Termes et Conditions - Version Luxe JavaScript
 */
const TermsPage = () => {

  // Informations de l'entreprise - MODIFIEZ CES INFORMATIONS AVEC VOS VRAIES DONNÉES
  const companyInfo = {
    name: "MON SAVON VERT", // ⚠️ CHANGEZ PAR VOTRE NOM D'ENTREPRISE
    address: "35 rue de l'égalité, 59320 Haubourdin, Nord, France", // ⚠️ CHANGEZ PAR VOTRE ADRESSE
    email: "contact@monsavonvert.com", // ⚠️ CHANGEZ PAR VOTRE EMAIL
    phone: "06 58 00 27 07" // ⚠️ CHANGEZ PAR VOTRE TÉLÉPHONE
  };

  // Sections des termes et conditions
  const termsections = [
    {
      id: "article-1",
      title: "Article 1 — Objet et champ d'application",
      content: `Les présentes conditions générales de vente s'appliquent à toutes les ventes de savons artisanaux réalisées par ${companyInfo.name}. Toute commande implique l'acceptation pleine et entière de ces conditions générales de vente, à l'exclusion de toute autre condition.`
    },
    {
      id: "article-2", 
      title: "Article 2 — Produits et qualité",
      content: "Nos savons sont élaborés selon des méthodes artisanales traditionnelles avec une sélection rigoureuse d'ingrédients naturels de première qualité. Les compositions détaillées et propriétés spécifiques sont consultables sur chaque fiche produit. Les variations naturelles de couleur et d'aspect témoignent de notre processus de fabrication artisanal."
    },
    {
      id: "article-3",
      title: "Article 3 — Processus de commande",
      content: "Les commandes sont considérées comme fermes et définitives dès validation du paiement par nos services. Un accusé de réception électronique vous sera transmis, comprenant le détail de votre commande ainsi que les modalités de livraison applicables."
    },
    {
      id: "article-4",
      title: "Article 4 — Tarification et modalités de règlement",
      content: "L'ensemble de nos tarifs sont exprimés en euros, toutes taxes comprises, incluant la TVA applicable. Le règlement s'effectue exclusivement par carte bancaire via notre système de paiement sécurisé. Tout refus de paiement entraînera l'annulation automatique de la commande."
    },
    {
      id: "article-5",
      title: "Article 5 — Expédition et livraison",
      content: "Les expéditions sont effectuées à l'adresse de livraison communiquée lors de la validation de commande. Nos délais de livraison s'établissent entre 3 et 7 jours ouvrés pour la France métropolitaine. Les frais d'expédition sont calculés en fonction du poids du colis et de la destination finale."
    },
    {
      id: "article-6",
      title: "Article 6 — Droit de rétractation légal",
      content: "Conformément aux dispositions du Code de la consommation, vous bénéficiez d'un délai légal de rétractation de 14 jours calendaires à compter de la réception de votre commande. Les produits doivent être retournés dans leur conditionnement d'origine, intacts et non utilisés."
    },
    {
      id: "article-7",
      title: "Article 7 — Garanties de qualité",
      content: "Nous garantissons nos savons exempts de tout défaut de fabrication ou de conformité. En cas de non-conformité avérée, nous vous invitons à contacter notre service clientèle dans un délai de 48 heures suivant la réception. Nous nous engageons à apporter une solution appropriée dans les meilleurs délais."
    },
    {
      id: "article-8",
      title: "Article 8 — Limitation de responsabilité",
      content: "Notre responsabilité ne saurait être engagée en cas de réaction allergique ou d'intolérance cutanée. Nous recommandons fortement d'effectuer un test préalable sur une surface cutanée restreinte, particulièrement pour les peaux sensibles ou réactives."
    },
    {
      id: "article-9",
      title: "Article 9 — Protection des données personnelles",
      content: "Les données personnelles collectées sont exclusivement utilisées dans le cadre du traitement et du suivi de votre commande. Ces informations ne font l'objet d'aucune transmission à des tiers. Vous disposez d'un droit d'accès, de rectification et de suppression de vos données personnelles."
    },
    {
      id: "article-10",
      title: "Article 10 — Dispositions juridiques",
      content: "Les présentes conditions générales de vente sont régies par le droit français en vigueur. Tout différend relatif à leur interprétation ou à leur exécution relèvera de la compétence exclusive des tribunaux français."
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
            Conditions Générales de Vente
          </h1>
          <div className="title-divider"></div>
          <p className="luxury-subtitle">
            Termes et conditions régissant l'acquisition de nos créations artisanales
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
      <div className="luxury-terms-container">
        {/* Sommaire élégant */}
        <nav className="luxury-nav">
          <h3 className="nav-title">Sommaire</h3>
          <div className="nav-grid">
            {termsections.map((section, index) => (
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
          {termsections.map((section, index) => (
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
              Pour toute question concernant ces conditions générales de vente, 
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
        .luxury-terms-container {
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

export default TermsPage;