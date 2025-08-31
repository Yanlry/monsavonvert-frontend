'use client';

import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import styles from '../styles/contact.module.css';
import Header from "../components/Header";
import Footer from "../components/footer"; // NOUVEAU: Import du composant footer

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
            </div>
          </section>

          {/* Section de contact réorganisée */}
          <section className={styles.contactSection}>
            <div className={styles.contactContainer}>
              {/* Section d'informations en haut */}
              <div className={styles.contactInfoSection}>
                <div className={styles.contactInfoCard}>
                  
                  <div className={styles.contactInfoGrid}>
                    <div className={styles.infoItem}>
                      <div className={styles.infoIcon}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                        </svg>
                      </div>
                      <div className={styles.infoContent}>
                        <h3 className={styles.infoTitle}>Téléphone</h3>
                        <p className={styles.infoText}>
                          <a href="tel:+33612345678">+33 6 58 00 27 07</a>
                        </p>
                      </div>
                    </div>
                    
                    <div className={styles.infoItem}>
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
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Section formulaire en bas */}
              <div className={styles.contactFormSection}>
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

        <Footer />
      </div>
    </>
  );
}