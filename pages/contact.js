'use client';

import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import styles from '../styles/contact.module.css';
import Header from "../components/Header";

export default function Contact() {
  // État pour détecter si nous sommes côté client
  const [isClient, setIsClient] = useState(false);
  
  // État pour l'animation du header au scroll
  const [scrolled, setScrolled] = useState(false);
  
  // État pour le panier (simulé)
  const [cartCount, setCartCount] = useState(0);
  
  // État pour le formulaire de contact
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'information',
    message: ''
  });
  
  // État pour le statut du formulaire
  const [formStatus, setFormStatus] = useState({
    submitted: false,
    success: false,
    message: ''
  });

  // Effets au chargement
  useEffect(() => {
    // Marquer que nous sommes côté client
    setIsClient(true);
    
    // Réinitialisation des marges
    if (typeof document !== 'undefined') {
      document.body.classList.add(styles.resetMargins);
      document.documentElement.classList.add(styles.resetMargins);
    }
    
    // Détection du scroll pour le header
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };
    
    // Gestionnaires d'événements
    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', handleScroll);
    }
    
    // Nettoyage
    return () => {
      if (typeof document !== 'undefined') {
        document.body.classList.remove(styles.resetMargins);
        document.documentElement.classList.remove(styles.resetMargins);
      }
      if (typeof window !== 'undefined') {
        window.removeEventListener('scroll', handleScroll);
      }
    };
  }, []);

  useEffect(() => {
    // Synchroniser le nombre d'articles dans le panier avec le localStorage
    const storedCart = JSON.parse(localStorage.getItem('cart')) || [];
    const totalItems = storedCart.reduce((sum, item) => sum + item.quantity, 0);
    setCartCount(totalItems);
  }, []);

  
  // Gérer les changements dans le formulaire
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  // Gérer la soumission du formulaire
  const handleSubmit = (e) => {
    e.preventDefault();
    // Simuler un envoi de formulaire
    setFormStatus({
      submitted: true,
      success: true,
      message: 'Votre message a bien été envoyé. Nous vous répondrons dans les plus brefs délais.'
    });
    
    // Réinitialiser le formulaire après soumission
    setTimeout(() => {
      setFormData({
        name: '',
        email: '',
        subject: 'information',
        message: ''
      });
    }, 1000);
  };
  
  // FAQ items
  const faqItems = [
    {
      question: "Comment conserver au mieux mes savons ?",
      answer: "Pour prolonger la durée de vie de vos savons, nous recommandons de les conserver dans un endroit sec, à l'abri de l'eau entre les utilisations. Utilisez un porte-savon qui permet à l'eau de s'écouler pour éviter que le savon ne ramollisse."
    },
    {
      question: "Vos savons conviennent-ils aux peaux sensibles ?",
      answer: "Oui, nous proposons une gamme spécifique pour les peaux sensibles. Ces savons sont formulés sans huiles essentielles et avec des ingrédients particulièrement doux. Regardez notre catégorie \"Peaux sensibles\" dans la boutique."
    },
    {
      question: "Quels sont les délais de livraison ?",
      answer: "Nous préparons votre commande dans les 2 jours ouvrés suivant sa réception. Les délais de livraison sont ensuite de 2 à 5 jours ouvrés en France métropolitaine, et de 5 à 10 jours pour l'international, selon la destination."
    },
    {
      question: "Proposez-vous des ateliers de fabrication de savon ?",
      answer: "Oui, nous organisons des ateliers mensuels dans notre ferme à Lourmarin. Les dates sont annoncées sur notre site et nos réseaux sociaux. Ces ateliers sont l'occasion d'apprendre les bases de la saponification à froid et de repartir avec vos propres créations."
    }
  ];

  // Rendu de base sans contenu dynamique (pour éviter les erreurs d'hydratation)
  if (!isClient) {
    return (
      <>
        <Head>
          <title>Contact | MonSavonVert</title>
          <meta name="description" content="Contactez-nous pour toute question ou commande spéciale de savons artisanaux." />
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
        <title>Contact | MonSavonVert</title>
        <meta name="description" content="Contactez-nous pour toute question ou commande spéciale de savons artisanaux." />
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      <div className={styles.container}>
        {/* Header avec navigation */}
        <header className={`${styles.header} ${scrolled ? styles.headerScrolled : ''}`}>
          <Header cartCount={cartCount}/>
        </header>

        <main className={styles.mainContent}>
          {/* Hero section */}
          <section className={styles.pageHero}>
            <div className={styles.pageHeroContent}>
              <h1 className={styles.pageTitle}>Contactez-nous</h1>
              <div className={styles.pageBreadcrumb}>
                <Link href="/">Accueil</Link>
                <span className={styles.breadcrumbSeparator}>/</span>
                <span className={styles.breadcrumbCurrent}>Contact</span>
              </div>
            </div>
          </section>

          {/* Section de contact */}
          <section className={styles.contactSection}>
            <div className={styles.contactColumns}>
              <div className={styles.contactInfoColumn}>
                <div className={styles.contactInfoCard}>
                  <h2 className={styles.infoCardTitle}>Nos informations</h2>
                  
                  <ul className={styles.infoList}>
                    <li className={styles.infoItem}>
                      <div className={styles.infoIcon}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                          <circle cx="12" cy="10" r="3"></circle>
                        </svg>
                      </div>
                      <div className={styles.infoContent}>
                        <h3 className={styles.infoTitle}>Adresse</h3>
                        <p className={styles.infoText}>123 Chemin des Lavandes<br />84160 Lourmarin<br />France</p>
                      </div>
                    </li>
                    
                    <li className={styles.infoItem}>
                      <div className={styles.infoIcon}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                        </svg>
                      </div>
                      <div className={styles.infoContent}>
                        <h3 className={styles.infoTitle}>Téléphone</h3>
                        <p className={styles.infoText}>
                          <a href="tel:+33612345678">+33 6 12 34 56 78</a>
                        </p>
                      </div>
                    </li>
                    
                    <li className={styles.infoItem}>
                      <div className={styles.infoIcon}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                          <polyline points="22,6 12,13 2,6"></polyline>
                        </svg>
                      </div>
                      <div className={styles.infoContent}>
                        <h3 className={styles.infoTitle}>Email</h3>
                        <p className={styles.infoText}>
                          <a href="mailto:info@monsavonvert.fr">info@monsavonvert.fr</a>
                        </p>
                      </div>
                    </li>
                    
                    <li className={styles.infoItem}>
                      <div className={styles.infoIcon}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10"></circle>
                          <polyline points="12 6 12 12 16 14"></polyline>
                        </svg>
                      </div>
                      <div className={styles.infoContent}>
                        <h3 className={styles.infoTitle}>Horaires d'ouverture</h3>
                        <p className={styles.infoText}>
                          Lundi - Vendredi: 9h - 17h<br />
                          Samedi: 10h - 14h<br />
                          Dimanche: Fermé
                        </p>
                      </div>
                    </li>
                  </ul>
                  
                  <div className={styles.socialSection}>
                    <h3 className={styles.socialTitle}>Suivez-nous</h3>
                    <div className={styles.socialLinks}>
                      <a href="https://facebook.com/monsavonvert" className={styles.socialLink} target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                        <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                        </svg>
                      </a>
                      <a href="https://instagram.com/monsavonvert" className={styles.socialLink} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                        <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                        </svg>
                      </a>
                      <a href="https://linkedin.com/company/monsavonvert" className={styles.socialLink} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                        <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                          <rect x="2" y="9" width="4" height="12"></rect>
                          <circle cx="4" cy="4" r="2"></circle>
                        </svg>
                      </a>
                      <a href="https://twitter.com/monsavonvert" className={styles.socialLink} target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                        <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path>
                        </svg>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className={styles.contactFormColumn}>
                <div className={styles.contactFormCard}>
                  <h2 className={styles.formCardTitle}>Envoyez-nous un message</h2>
                  <form className={styles.contactForm} onSubmit={handleSubmit}>
                    <div className={styles.formRow}>
                      <div className={styles.formGroup}>
                        <label className={styles.formLabel} htmlFor="name">Votre nom*</label>
                        <input 
                          className={styles.formInput} 
                          type="text" 
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          required 
                        />
                      </div>
                      
                      <div className={styles.formGroup}>
                        <label className={styles.formLabel} htmlFor="email">Votre email*</label>
                        <input 
                          className={styles.formInput} 
                          type="email" 
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required 
                        />
                      </div>
                    </div>
                    
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel} htmlFor="subject">Sujet</label>
                      <select 
                        className={styles.formSelect}
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleInputChange}
                      >
                        <option value="information">Demande d'information</option>
                        <option value="order">Question sur une commande</option>
                        <option value="wholesale">Partenariat commercial</option>
                        <option value="custom">Commande personnalisée</option>
                        <option value="other">Autre</option>
                      </select>
                    </div>
                    
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel} htmlFor="message">Votre message*</label>
                      <textarea 
                        className={styles.formTextarea}
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        required
                      ></textarea>
                    </div>
                    
                    <div className={styles.formSubmit}>
                      <button className={styles.submitButton} type="submit">
                        Envoyer le message
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.submitIcon}>
                          <line x1="22" y1="2" x2="11" y2="13"></line>
                          <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                        </svg>
                      </button>
                    </div>
                    
                    {formStatus.submitted && (
                      <div 
                        className={`
                          ${styles.formMessage} 
                          ${formStatus.success ? styles.formMessageSuccess : styles.formMessageError}
                        `}
                      >
                        {formStatus.message}
                      </div>
                    )}
                  </form>
                </div>
              </div>
            </div>
          </section>
          
          {/* Section FAQ */}
          <section className={styles.faqSection}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Questions fréquentes</h2>
              <p className={styles.sectionSubtitle}>Voici les réponses aux questions que l'on nous pose le plus souvent</p>
            </div>
            
            <div className={styles.faqGrid}>
              {faqItems.map((item, index) => (
                <div key={index} className={styles.faqCard}>
                  <h3 className={styles.faqQuestion}>{item.question}</h3>
                  <p className={styles.faqAnswer}>{item.answer}</p>
                </div>
              ))}
            </div>
            
            <div className={styles.faqCta}>
              <p className={styles.faqHelpText}>Vous ne trouvez pas la réponse à votre question ?</p>
              <a href="mailto:info@monsavonvert.fr" className={`${styles.button} ${styles.outlineButton}`}>
                Contactez-nous directement
              </a>
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
                  Savons artisanaux, naturels et écologiques fabriqués avec passion en France depuis 2018.
                </p>
                <div className={styles.footerSocial}>
                  <a href="https://facebook.com/monsavonvert" className={styles.socialLink} target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                    <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                    </svg>
                  </a>
                  <a href="https://instagram.com/monsavonvert" className={styles.socialLink} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                    <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                    </svg>
                  </a>
                  <a href="https://pinterest.com/monsavonvert" className={styles.socialLink} target="_blank" rel="noopener noreferrer" aria-label="Pinterest">
                    <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M8 12a4 4 0 1 1 8 0 4 4 0 0 1-8 0zm2-6h4"></path>
                      <path d="M9 18l3-3 3 3"></path>
                      <path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"></path>
                    </svg>
                  </a>
                </div>
              </div>
              
              <div className={styles.footerColumn}>
                <h3 className={styles.footerTitle}>Boutique</h3>
                <Link href="/boutique/nouveautes" className={styles.footerLink}>Nouveautés</Link>
                <Link href="/boutique/visage" className={styles.footerLink}>Soins visage</Link>
                <Link href="/boutique/corps" className={styles.footerLink}>Soins corps</Link>
                <Link href="/boutique/cheveux" className={styles.footerLink}>Cheveux</Link>
                <Link href="/boutique/coffrets" className={styles.footerLink}>Coffrets cadeaux</Link>
                <Link href="/boutique/accessoires" className={styles.footerLink}>Accessoires</Link>
              </div>
              
              <div className={styles.footerColumn}>
                <h3 className={styles.footerTitle}>Informations</h3>
                <Link href="/a-propos" className={styles.footerLink}>Notre histoire</Link>
                <Link href="/virtues" className={styles.footerLink}>Vertu & bienfaits</Link>
                <Link href="/blog" className={styles.footerLink}>Journal</Link>
                <Link href="/faq" className={styles.footerLink}>FAQ</Link>
                <Link href="/contact" className={styles.footerLink}>Contact</Link>
                <Link href="/programme-fidelite" className={styles.footerLink}>Programme fidélité</Link>
              </div>
              
              <div className={styles.footerColumn}>
                <h3 className={styles.footerTitle}>Contact</h3>
                <p className={styles.contactInfo}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                  </svg>
                  <a href="tel:+33612345678">+33 6 12 34 56 78</a>
                </p>
                <p className={styles.contactInfo}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                  </svg>
                  <a href="mailto:info@monsavonvert.fr">info@monsavonvert.fr</a>
                </p>
                <p className={styles.contactInfo}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                  <span>123 Chemin des Lavandes<br />84160 Lourmarin, France</span>
                </p>
                <p className={styles.contactInfo}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                  </svg>
                  <span>Lun-Ven: 9h-17h<br />Sam: 10h-14h</span>
                </p>
              </div>
            </div>
          </div>
          
          <div className={styles.footerBottom}>
            <div className={styles.footerBottomContent}>
              <p className={styles.copyright}>© 2023 MonSavonVert. Tous droits réservés.</p>
              <div className={styles.footerLinks}>
                <Link href="/cgv" className={styles.footerSmallLink}>CGV</Link>
                <Link href="/politique-de-confidentialite" className={styles.footerSmallLink}>Politique de confidentialité</Link>
                <Link href="/mentions-legales" className={styles.footerSmallLink}>Mentions légales</Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}