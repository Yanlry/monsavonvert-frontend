'use client';

import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import styles from '../styles/forgot-password.module.css';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  // Fonction pour soumettre la demande de récupération
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Réinitialiser les messages
    setError('');
    setMessage('');
    
    // Vérifications côté client
    if (!email) {
      setError('Veuillez saisir votre adresse email');
      return;
    }
    
    if (!email.includes('@')) {
      setError('Veuillez saisir une adresse email valide');
      return;
    }
    
    setIsLoading(true);
    
    try {
      console.log('📧 Envoi de la demande de récupération pour:', email);
      
      // Récupérer l'URL de l'API
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!apiUrl) {
        throw new Error('Configuration API manquante');
      }
      
      // CORRECTION: Utiliser la bonne route backend
      const response = await fetch(`${apiUrl}/password-reset/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        console.log('✅ Demande de récupération envoyée avec succès');
        setMessage(data.message);
        setEmail(''); // Vider le champ email
      } else {
        console.error('❌ Erreur:', data.message);
        setError(data.message || 'Une erreur est survenue');
      }
    } catch (error) {
      console.error('❌ Erreur lors de la demande:', error);
      setError('Erreur de connexion. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Récupération de compte | MonSavonVert</title>
        <meta name="description" content="Récupérez l'accès à votre compte MonSavonVert en toute sécurité" />
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      <div className={styles.pageWrapper}>
        {/* Motif de fond animé */}
        <div className={styles.backgroundPattern}></div>
        
        <div className={styles.container}>
          <div className={styles.formCard}>
            
            {/* En-tête avec logo et navigation */}
            <header className={styles.cardHeader}>
              <Link href="/" className={styles.logoLink}>
                <h1 className={styles.logo}>MonSavonVert</h1>
              </Link>
              <nav className={styles.breadcrumb}>
                <Link href="/" className={styles.breadcrumbLink}>Accueil</Link>
                <span className={styles.breadcrumbSeparator}>/</span>
                <Link href="/login" className={styles.breadcrumbLink}>Connexion</Link>
                <span className={styles.breadcrumbSeparator}>/</span>
                <span className={styles.breadcrumbCurrent}>Récupération</span>
              </nav>
            </header>

            {/* Titre principal avec effet */}
            <div className={styles.titleSection}>
              <div className={styles.titleIcon}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 12l2 2 4-4"/>
                  <path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9c2.39 0 4.58.94 6.21 2.49"/>
                </svg>
              </div>
              <h2 className={styles.mainTitle}>Récupération de compte</h2>
              <p className={styles.subtitle}>
                Renseignez votre adresse email et nous vous enverrons un lien sécurisé 
                pour réinitialiser votre mot de passe.
              </p>
            </div>

            {/* Messages de retour */}
            {message && (
              <div className={styles.alertSuccess}>
                <div className={styles.alertIcon}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </div>
                <div className={styles.alertContent}>
                  <h4>Email envoyé avec succès</h4>
                  <p>{message}</p>
                  <div className={styles.alertNote}>
                    Vérifiez votre boîte de réception et vos courriers indésirables
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className={styles.alertError}>
                <div className={styles.alertIcon}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                </div>
                <div className={styles.alertContent}>
                  <h4>Une erreur s'est produite</h4>
                  <p>{error}</p>
                </div>
              </div>
            )}

            {/* Formulaire principal */}
            {!message && (
              <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.inputGroup}>
                  <label htmlFor="email" className={styles.inputLabel}>
                    Adresse email
                  </label>
                  <div className={styles.inputWrapper}>
                    <div className={styles.inputIcon}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                        <polyline points="22,6 12,13 2,6"/>
                      </svg>
                    </div>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="votre.email@exemple.fr"
                      className={styles.input}
                      disabled={isLoading}
                      autoComplete="email"
                      autoFocus
                    />
                  </div>
                  <div className={styles.inputHint}>
                    Utilisez l'adresse email associée à votre compte
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={isLoading || !email}
                  className={styles.submitButton}
                >
                  {isLoading ? (
                    <span className={styles.buttonLoading}>
                      <span className={styles.loadingSpinner}></span>
                      Envoi en cours...
                    </span>
                  ) : (
                    <span className={styles.buttonContent}>
                      <span>Envoyer le lien de récupération</span>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="5" y1="12" x2="19" y2="12"/>
                        <polyline points="12 5 19 12 12 19"/>
                      </svg>
                    </span>
                  )}
                </button>
              </form>
            )}

            {/* Actions alternatives */}
            <div className={styles.cardActions}>
              <Link href="/login" className={styles.backLink}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="19" y1="12" x2="5" y2="12"/>
                  <polyline points="12 19 5 12 12 5"/>
                </svg>
                Retour à la connexion
              </Link>
              
              {message && (
                <button 
                  onClick={() => {
                    setMessage('');
                    setError('');
                    setEmail('');
                  }}
                  className={styles.secondaryButton}
                >
                  Envoyer un autre email
                </button>
              )}
              
              <Link href="/signup" className={styles.tertiaryLink}>
                Créer un nouveau compte
              </Link>
            </div>

            {/* Information de sécurité */}
            <div className={styles.securityNotice}>
              <div className={styles.securityIcon}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
              </div>
              <div className={styles.securityContent}>
                <h4>Sécurité et confidentialité</h4>
                <ul>
                  <li>Le lien de récupération expire automatiquement après 10 minutes</li>
                  <li>Aucun email ne sera envoyé si l'adresse n'existe pas dans notre base</li>
                  <li>En cas de difficulté, contactez notre support client</li>
                </ul>
              </div>
            </div>

          </div>
        </div>

        {/* Footer minimaliste */}
        <footer className={styles.pageFooter}>
          <div className={styles.footerContent}>
            <p>
              © 2024 MonSavonVert • 
              <Link href="/contact" className={styles.footerLink}>Support</Link> • 
              <Link href="/privacy" className={styles.footerLink}>Confidentialité</Link>
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}