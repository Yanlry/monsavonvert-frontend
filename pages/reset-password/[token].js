'use client';

import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import styles from '../../styles/reset-password.module.css';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [tokenValid, setTokenValid] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(null);
  
  const router = useRouter();
  const { token } = router.query;

  // Vérifier la validité du token au chargement de la page
  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        console.log('🔍 Token non trouvé dans l\'URL, attente...');
        return;
      }

      console.log('🔍 Vérification du token:', token.substring(0, 10) + '...');
      
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        if (!apiUrl) {
          throw new Error('Configuration API manquante');
        }

        const response = await fetch(`${apiUrl}/api/verify-reset-token/${token}`);
        const data = await response.json();

        if (data.success) {
          console.log('✅ Token valide pour:', data.user.firstName);
          setTokenValid(true);
          setUserInfo(data.user);
          setTimeRemaining(data.timeRemaining);
        } else {
          console.log('❌ Token invalide:', data.message);
          setError(data.message || 'Token invalide ou expiré');
          setTokenValid(false);
        }
      } catch (error) {
        console.error('❌ Erreur lors de la vérification du token:', error);
        setError('Erreur de connexion. Veuillez réessayer.');
        setTokenValid(false);
      } finally {
        setIsVerifying(false);
      }
    };

    if (token) {
      verifyToken();
    }
  }, [token]);

  // Fonction pour soumettre le nouveau mot de passe
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Réinitialiser les messages
    setError('');
    setMessage('');
    
    // Vérifications côté client
    if (!password) {
      setError('Veuillez saisir votre nouveau mot de passe');
      return;
    }
    
    if (!confirmPassword) {
      setError('Veuillez confirmer votre mot de passe');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }
    
    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }
    
    setIsLoading(true);
    
    try {
      console.log('🔒 Envoi de la réinitialisation du mot de passe...');
      
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      
      const response = await fetch(`${apiUrl}/api/reset-password/${token}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          password, 
          confirmPassword 
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        console.log('✅ Mot de passe réinitialisé avec succès');
        setMessage(data.message);
        setPassword('');
        setConfirmPassword('');
        
        // Rediriger vers la page de connexion après 3 secondes
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      } else {
        console.error('❌ Erreur:', data.message);
        setError(data.message || 'Une erreur est survenue');
      }
    } catch (error) {
      console.error('❌ Erreur lors de la réinitialisation:', error);
      setError('Erreur de connexion. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  // État de chargement initial
  if (isVerifying) {
    return (
      <>
        <Head>
          <title>Vérification du lien | MonSavonVert</title>
          <meta name="description" content="Vérification du lien de récupération" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <div className={styles.container}>
          <div className={styles.loadingContainer}>
            <div className={styles.spinner}></div>
            <h2>Vérification du lien de récupération...</h2>
            <p>Veuillez patienter</p>
          </div>
        </div>
      </>
    );
  }

  // Token invalide
  if (!tokenValid) {
    return (
      <>
        <Head>
          <title>Lien invalide | MonSavonVert</title>
          <meta name="description" content="Lien de récupération invalide" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <div className={styles.container}>
          <div className={styles.formContainer}>
            <div className={styles.header}>
              <Link href="/" className={styles.logo}>
                MonSavonVert
              </Link>
              <h1 className={styles.title}>Lien invalide</h1>
            </div>

            <div className={styles.errorMessage}>
              <div className={styles.errorIcon}>⚠️</div>
              <h3>Ce lien n'est plus valide</h3>
              <p>{error}</p>
              <p>Les liens de récupération expirent après 10 minutes pour des raisons de sécurité.</p>
            </div>

            <div className={styles.links}>
              <Link href="/forgot-password" className={styles.primaryButton}>
                Faire une nouvelle demande
              </Link>
              <Link href="/login" className={styles.link}>
                Retour à la connexion
              </Link>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Nouveau mot de passe | MonSavonVert</title>
        <meta name="description" content="Créez votre nouveau mot de passe" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className={styles.container}>
        <div className={styles.formContainer}>
          {/* En-tête */}
          <div className={styles.header}>
            <Link href="/" className={styles.logo}>
              MonSavonVert
            </Link>
            <h1 className={styles.title}>Nouveau mot de passe</h1>
            {userInfo && (
              <p className={styles.subtitle}>
                Bonjour {userInfo.firstName}, créez votre nouveau mot de passe ci-dessous.
              </p>
            )}
            {timeRemaining && (
              <div className={styles.timeWarning}>
                ⏰ Ce lien expire dans {timeRemaining} minute{timeRemaining > 1 ? 's' : ''}
              </div>
            )}
          </div>

          {/* Messages de succès ou d'erreur */}
          {message && (
            <div className={styles.successMessage}>
              <div className={styles.successIcon}>✅</div>
              <h3>Mot de passe modifié avec succès !</h3>
              <p>{message}</p>
              <p className={styles.successNote}>
                Redirection vers la page de connexion dans 3 secondes...
              </p>
            </div>
          )}

          {error && (
            <div className={styles.errorMessage}>
              <div className={styles.errorIcon}>❌</div>
              <p>{error}</p>
            </div>
          )}

          {/* Formulaire de réinitialisation */}
          {!message && (
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.inputGroup}>
                <label htmlFor="password" className={styles.label}>
                  Nouveau mot de passe
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Entrez votre nouveau mot de passe"
                  className={styles.input}
                  disabled={isLoading}
                />
                <small className={styles.inputHint}>
                  Minimum 6 caractères
                </small>
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="confirmPassword" className={styles.label}>
                  Confirmer le mot de passe
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirmez votre nouveau mot de passe"
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
                    Modification en cours...
                  </span>
                ) : (
                  'Modifier mon mot de passe'
                )}
              </button>
            </form>
          )}

          {/* Liens de navigation */}
          <div className={styles.links}>
            <Link href="/login" className={styles.link}>
              ← Retour à la connexion
            </Link>
          </div>

          {/* Conseils de sécurité */}
          <div className={styles.securityInfo}>
            <h3>Conseils pour un mot de passe sécurisé</h3>
            <ul>
              <li>Utilisez au moins 8 caractères</li>
              <li>Mélangez lettres majuscules et minuscules</li>
              <li>Ajoutez des chiffres et des symboles</li>
              <li>Évitez les mots du dictionnaire</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}