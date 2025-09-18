'use client';

import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Header from '../../components/Header'; // Import du Header
import Footer from '../../components/Footer'; // Import du Footer
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

  // États pour la validation du mot de passe en temps réel
  const [passwordValidation, setPasswordValidation] = useState({
    hasMinLength: false,      // Au moins 8 caractères
    hasUppercase: false,      // Au moins une majuscule
    hasNumber: false,         // Au moins un chiffre
    hasSpecialChar: false,    // Au moins un caractère spécial
    passwordsMatch: false     // Les mots de passe correspondent
  });
  
  const router = useRouter();
  const { token } = router.query;

  // Fonction pour valider le mot de passe en temps réel
  const validatePassword = (newPassword, newConfirmPassword) => {
    console.log('🔍 Validation du mot de passe:', newPassword);
    
    const validation = {
      hasMinLength: newPassword.length >= 8,
      hasUppercase: /[A-Z]/.test(newPassword),
      hasNumber: /[0-9]/.test(newPassword),
      hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword),
      passwordsMatch: newPassword === newConfirmPassword && newPassword !== '' && newConfirmPassword !== ''
    };

    console.log('📊 Résultats de validation:', validation);
    setPasswordValidation(validation);
    return validation;
  };

  // Gérer les changements du mot de passe
  const handlePasswordChange = (newPassword) => {
    console.log('🔒 Changement mot de passe:', newPassword);
    setPassword(newPassword);
    validatePassword(newPassword, confirmPassword);
  };

  // Gérer les changements de la confirmation
  const handleConfirmPasswordChange = (newConfirmPassword) => {
    console.log('🔒 Changement confirmation:', newConfirmPassword);
    setConfirmPassword(newConfirmPassword);
    validatePassword(password, newConfirmPassword);
  };

  // Vérifier si tous les critères sont respectés
  const isPasswordValid = () => {
    const allValid = passwordValidation.hasMinLength && 
                    passwordValidation.hasUppercase && 
                    passwordValidation.hasNumber && 
                    passwordValidation.hasSpecialChar && 
                    passwordValidation.passwordsMatch;
    
    console.log('✅ Mot de passe valide:', allValid);
    return allValid;
  };

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

        console.log('🌐 URL API utilisée:', apiUrl);
        console.log('🔗 URL complète de vérification:', `${apiUrl}/password-reset/verify-reset-token/${token}`);

        const response = await fetch(`${apiUrl}/password-reset/verify-reset-token/${token}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        console.log('📡 Réponse reçue - Status:', response.status);

        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`);
        }

        const data = await response.json();
        console.log('📊 Données reçues:', data);

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
    
    console.log('🚀 Tentative de soumission du formulaire');
    
    // Vérifications côté client avec la nouvelle validation
    if (!password) {
      setError('Veuillez saisir votre nouveau mot de passe');
      return;
    }
    
    if (!confirmPassword) {
      setError('Veuillez confirmer votre mot de passe');
      return;
    }

    // Vérifier que tous les critères sont respectés
    if (!isPasswordValid()) {
      setError('Veuillez respecter tous les critères de sécurité du mot de passe');
      return;
    }
    
    setIsLoading(true);
    
    try {
      console.log('🔒 Envoi de la réinitialisation du mot de passe...');
      
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const resetUrl = `${apiUrl}/password-reset/reset-password/${token}`;
      
      console.log('🔗 URL de réinitialisation:', resetUrl);
      
      const response = await fetch(resetUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          password, 
          confirmPassword 
        }),
      });
      
      console.log('📡 Réponse de réinitialisation - Status:', response.status);
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('📊 Données de réponse:', data);
      
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
        
        <Header cartCount={0} />
        
        <div className={styles.container}>
          <div className={styles.loadingContainer}>
            <div className={styles.spinner}></div>
            <h2>Vérification du lien de récupération...</h2>
            <p>Veuillez patienter</p>
          </div>
        </div>
        
        <Footer />
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
        
        <Header cartCount={0} />
        
        <div className={styles.container}>
          <div className={styles.formContainer}>
            <div className={styles.header}>
              <h1 className={styles.title}>Lien invalide</h1>
              <p className={styles.subtitle}>Ce lien n'est plus valide ou a expiré</p>
            </div>

            <div className={styles.errorMessage}>
              <div className={styles.errorIcon}>⚠️</div>
              <div className={styles.messageContent}>
                <h3>Ce lien n'est plus valide</h3>
                <p>{error}</p>
                <p>Les liens de récupération expirent après 10 minutes pour des raisons de sécurité.</p>
              </div>
            </div>

            <div className={styles.links}>
              <Link href="/forgot-password" className={styles.link}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 4H8L1 12L8 20H21C22.1 20 23 19.1 23 18V6C23 4.9 22.1 4 21 4Z"></path>
                  <path d="M18 9L12 15M12 9L18 15"></path>
                </svg>
                Faire une nouvelle demande
              </Link>
              <Link href="/login" className={styles.link}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 12H5M12 19L5 12L12 5"></path>
                </svg>
                Retour à la connexion
              </Link>
            </div>

            {/* Debug information */}
            <details className={styles.debugInfo}>
              <summary>Informations de débogage</summary>
              <p>Token: {token?.substring(0, 20)}...</p>
              <p>API URL: {process.env.NEXT_PUBLIC_API_URL}</p>
              <p>URL de vérification: {process.env.NEXT_PUBLIC_API_URL}/password-reset/verify-reset-token/{token?.substring(0, 10)}...</p>
            </details>
          </div>
        </div>
        
        <Footer />
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

      <Header cartCount={0} />

      <div className={styles.container}>
        <div className={styles.formContainer}>
          {/* En-tête du formulaire */}
          <div className={styles.header}>
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
              <div className={styles.messageContent}>
                <h3>Mot de passe modifié avec succès !</h3>
                <p>{message}</p>
                <p className={styles.successNote}>
                  Redirection vers la page de connexion dans 3 secondes...
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className={styles.errorMessage}>
              <div className={styles.errorIcon}>❌</div>
              <div className={styles.messageContent}>
                <h3>Erreur</h3>
                <p>{error}</p>
              </div>
            </div>
          )}

          {/* Formulaire de réinitialisation */}
          {!message && (
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.inputGroup}>
                <label htmlFor="password" className={styles.label}>
                  Nouveau mot de passe
                </label>
                <div className={styles.inputWrapper}>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => handlePasswordChange(e.target.value)}
                    placeholder="Entrez votre nouveau mot de passe"
                    className={styles.input}
                    disabled={isLoading}
                  />
                  <div className={styles.inputIcon}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                      <circle cx="12" cy="16" r="1"></circle>
                      <path d="M7 11V7A5 5 0 0 1 17 7V11"></path>
                    </svg>
                  </div>
                </div>
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="confirmPassword" className={styles.label}>
                  Confirmer le mot de passe
                </label>
                <div className={styles.inputWrapper}>
                  <input
                    type="password"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => handleConfirmPasswordChange(e.target.value)}
                    placeholder="Confirmez votre nouveau mot de passe"
                    className={styles.input}
                    disabled={isLoading}
                  />
                  <div className={styles.inputIcon}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                      <circle cx="12" cy="16" r="1"></circle>
                      <path d="M7 11V7A5 5 0 0 1 17 7V11"></path>
                    </svg>
                  </div>
                </div>
              </div>

              {/* Section de validation des critères */}
              <div className={styles.passwordCriteria}>
                <h4 className={styles.criteriaTitle}>Critères de sécurité :</h4>
                <ul className={styles.criteriaList}>
                  <li className={`${styles.criteriaItem} ${passwordValidation.hasMinLength ? styles.valid : styles.invalid}`}>
                    <span className={styles.criteriaIcon}>
                      {passwordValidation.hasMinLength ? '✓' : '✗'}
                    </span>
                    Au moins 8 caractères
                  </li>
                  <li className={`${styles.criteriaItem} ${passwordValidation.hasUppercase ? styles.valid : styles.invalid}`}>
                    <span className={styles.criteriaIcon}>
                      {passwordValidation.hasUppercase ? '✓' : '✗'}
                    </span>
                    Une lettre majuscule
                  </li>
                  <li className={`${styles.criteriaItem} ${passwordValidation.hasNumber ? styles.valid : styles.invalid}`}>
                    <span className={styles.criteriaIcon}>
                      {passwordValidation.hasNumber ? '✓' : '✗'}
                    </span>
                    Un chiffre
                  </li>
                  <li className={`${styles.criteriaItem} ${passwordValidation.hasSpecialChar ? styles.valid : styles.invalid}`}>
                    <span className={styles.criteriaIcon}>
                      {passwordValidation.hasSpecialChar ? '✓' : '✗'}
                    </span>
                    Un caractère spécial (!@#$%^&*)
                  </li>
                  <li className={`${styles.criteriaItem} ${passwordValidation.passwordsMatch ? styles.valid : styles.invalid}`}>
                    <span className={styles.criteriaIcon}>
                      {passwordValidation.passwordsMatch ? '✓' : '✗'}
                    </span>
                    Les mots de passe correspondent
                  </li>
                </ul>
              </div>

              <button 
                type="submit" 
                disabled={isLoading || !isPasswordValid()}
                className={`${styles.submitButton} ${!isPasswordValid() ? styles.disabled : ''}`}
              >
                <span className={styles.buttonContent}>
                  {isLoading ? (
                    <>
                      <span className={styles.spinner}></span>
                      Modification en cours...
                    </>
                  ) : (
                    <>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 12L11 14L15 10"></path>
                        <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"></path>
                      </svg>
                      Modifier mon mot de passe
                    </>
                  )}
                </span>
              </button>
            </form>
          )}

          {/* Liens de navigation */}
          <div className={styles.links}>
            <Link href="/login" className={styles.link}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19L5 12L12 5"></path>
              </svg>
              Retour à la connexion
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}