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
      
      // Envoyer la demande au backend
      const response = await fetch(`${apiUrl}/api/forgot-password`, {
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
        <title>Mot de passe oublié | MonSavonVert</title>
        <meta name="description" content="Récupérez votre mot de passe MonSavonVert" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className={styles.container}>
        <div className={styles.formContainer}>
          {/* Logo et titre */}
          <div className={styles.header}>
            <Link href="/" className={styles.logo}>
              MonSavonVert
            </Link>
            <h1 className={styles.title}>Mot de passe oublié</h1>
            <p className={styles.subtitle}>
              Saisissez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
            </p>
          </div>

          {/* Messages de succès ou d'erreur */}
          {message && (
            <div className={styles.successMessage}>
              <div className={styles.successIcon}>✅</div>
              <p>{message}</p>
              <p className={styles.successNote}>
                Vérifiez votre boîte email (et vos spams) pour le lien de récupération.
              </p>
            </div>
          )}

          {error && (
            <div className={styles.errorMessage}>
              <div className={styles.errorIcon}>❌</div>
              <p>{error}</p>
            </div>
          )}

          {/* Formulaire de récupération */}
          {!message && (
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.inputGroup}>
                <label htmlFor="email" className={styles.label}>
                  Adresse email
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre-email@exemple.com"
                  className={styles.input}
                  disabled={isLoading}
                />
              </div>

              <button 
                type="submit" 
                disabled={isLoading}
                className={styles.submitButton}
              >
                {isLoading ? (
                  <span className={styles.loading}>
                    <span className={styles.spinner}></span>
                    Envoi en cours...
                  </span>
                ) : (
                  'Envoyer le lien de récupération'
                )}
              </button>
            </form>
          )}

          {/* Liens de navigation */}
          <div className={styles.links}>
            <Link href="/login" className={styles.link}>
              ← Retour à la connexion
            </Link>
            
            {message && (
              <button 
                onClick={() => {
                  setMessage('');
                  setError('');
                  setEmail('');
                }}
                className={styles.link}
              >
                Envoyer un autre email
              </button>
            )}
          </div>

          {/* Information de sécurité */}
          <div className={styles.securityInfo}>
            <h3>Information de sécurité</h3>
            <ul>
              <li>Le lien de récupération expire dans 10 minutes</li>
              <li>Si vous n'avez pas de compte, le système ne vous enverra pas d'email</li>
              <li>En cas de problème, contactez notre support</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}