'use client';

import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import styles from '../styles/contact.module.css';
import Header from "../components/Header";
import Footer from "../components/Footer";

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
    message: '',
    isLoading: false // NOUVEAU: pour afficher le loading
  });

  // Effets au chargement
  useEffect(() => {
    setIsClient(true);
    
    if (typeof document !== 'undefined') {
      document.body.classList.add(styles.resetMargins);
      document.documentElement.classList.add(styles.resetMargins);
    }
    
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };
    
    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', handleScroll);
    }
    
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
    const storedCart = JSON.parse(localStorage.getItem('cart')) || [];
    const totalItems = storedCart.reduce((sum, item) => sum + item.quantity, 0);
    setCartCount(totalItems);
    console.log("📧 Nombre d'articles dans le panier:", totalItems);
  }, []);

  
  // Gérer les changements dans le formulaire
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    console.log("📧 Champ modifié:", name, "->", value);
  };
  
  // NOUVELLE FONCTION : Gérer la soumission du formulaire avec envoi vers le backend
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("📧 === SOUMISSION FORMULAIRE CONTACT ===");
    console.log("📧 Données à envoyer:", formData);
    
    // Validation côté client
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      console.log("❌ Validation échouée - champs manquants");
      setFormStatus({
        submitted: true,
        success: false,
        message: 'Veuillez remplir tous les champs obligatoires.',
        isLoading: false
      });
      return;
    }
    
    // Validation email basique
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      console.log("❌ Validation échouée - email invalide");
      setFormStatus({
        submitted: true,
        success: false,
        message: 'Veuillez saisir une adresse email valide.',
        isLoading: false
      });
      return;
    }
    
    // Démarrer le loading
    setFormStatus({
      submitted: false,
      success: false,
      message: '',
      isLoading: true
    });
    
    console.log("🚀 Envoi des données vers le backend...");
    
    try {
      // IMPORTANT: Remplace cette URL par l'URL de ton backend
      // Si ton backend est en local: 'http://localhost:3001/contact/send'
      // Si ton backend est déployé: 'https://ton-backend.vercel.app/contact/send'
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
      const response = await fetch(`${backendUrl}/contact/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });
      
      console.log("📧 Réponse du backend - Status:", response.status);
      
      const result = await response.json();
      console.log("📧 Réponse du backend - Data:", result);
      
      if (result.result) {
        // Succès
        console.log("✅ Formulaire envoyé avec succès");
        setFormStatus({
          submitted: true,
          success: true,
          message: result.message || 'Votre message a bien été envoyé. Nous vous répondrons dans les plus brefs délais.',
          isLoading: false
        });
        
        // Réinitialiser le formulaire après 2 secondes
        setTimeout(() => {
          console.log("🔄 Réinitialisation du formulaire...");
          setFormData({
            name: '',
            email: '',
            subject: 'information',
            message: ''
          });
          // Optionnel: cacher le message de succès après 5 secondes
          setTimeout(() => {
            setFormStatus({
              submitted: false,
              success: false,
              message: '',
              isLoading: false
            });
          }, 3000);
        }, 2000);
        
      } else {
        // Erreur du backend
        console.log("❌ Erreur du backend:", result.error);
        setFormStatus({
          submitted: true,
          success: false,
          message: result.error || 'Une erreur est survenue lors de l\'envoi de votre message. Veuillez réessayer.',
          isLoading: false
        });
      }
      
    } catch (error) {
      // Erreur réseau ou autre
      console.error("❌ Erreur lors de l'envoi:", error);
      setFormStatus({
        submitted: true,
        success: false,
        message: 'Impossible de joindre le serveur. Vérifiez votre connexion internet et réessayez.',
        isLoading: false
      });
    }
    
    console.log("📧 === FIN SOUMISSION FORMULAIRE ===");
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
                          <a href="tel:+33658002707">+33 6 58 00 27 07</a>
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
                          <a href="mailto:contact@monsavonvert.com">contact@monsavonvert.com</a>
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
                          disabled={formStatus.isLoading}
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
                          disabled={formStatus.isLoading}
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
                        disabled={formStatus.isLoading}
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
                        disabled={formStatus.isLoading}
                      ></textarea>
                    </div>
                    
                    <div className={styles.formSubmit}>
                      <button 
                        className={styles.submitButton} 
                        type="submit"
                        disabled={formStatus.isLoading}
                        style={{
                          opacity: formStatus.isLoading ? 0.6 : 1,
                          cursor: formStatus.isLoading ? 'not-allowed' : 'pointer'
                        }}
                      >
                        {formStatus.isLoading ? (
                          <>
                            Envoi en cours...
                            <svg 
                              style={{marginLeft: '8px', animation: 'spin 1s linear infinite'}} 
                              xmlns="http://www.w3.org/2000/svg" 
                              width="20" 
                              height="20" 
                              viewBox="0 0 24 24" 
                              fill="none" 
                              stroke="currentColor" 
                              strokeWidth="2" 
                              strokeLinecap="round" 
                              strokeLinejoin="round"
                            >
                              <path d="M21 12a9 9 0 11-6.219-8.56"/>
                            </svg>
                          </>
                        ) : (
                          <>
                            Envoyer le message
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.submitIcon}>
                              <line x1="22" y1="2" x2="11" y2="13"></line>
                              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                            </svg>
                          </>
                        )}
                      </button>
                    </div>
                    
                    {/* NOUVEAU: Messages de statut améliorés */}
                    {formStatus.submitted && (
                      <div 
                        className={`
                          ${styles.formMessage} 
                          ${formStatus.success ? styles.formMessageSuccess : styles.formMessageError}
                        `}
                        style={{
                          padding: '15px',
                          borderRadius: '8px',
                          marginTop: '15px',
                          border: `2px solid ${formStatus.success ? '#4caf50' : '#f44336'}`,
                          backgroundColor: formStatus.success ? '#e8f5e8' : '#ffebee',
                          color: formStatus.success ? '#2e7d32' : '#c62828',
                          fontSize: '14px',
                          fontWeight: '500'
                        }}
                      >
                        {formStatus.success && <span style={{marginRight: '8px'}}>✅</span>}
                        {!formStatus.success && <span style={{marginRight: '8px'}}>❌</span>}
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
              <a href="mailto:contact@monsavonvert.com" className={`${styles.button} ${styles.outlineButton}`}>
                Contactez-nous directement
              </a>
            </div>
          </section>
        </main>

        <Footer />
      </div>

      {/* NOUVEAU: CSS pour l'animation de loading */}
      <style jsx>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </>
  );
}