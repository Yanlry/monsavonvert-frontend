'use client';

import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import styles from '../../styles/forgot-password.module.css';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [tokenValid, setTokenValid] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(null);
  
  // États pour les critères de validation du mot de passe
  const [passwordCriteria, setPasswordCriteria] = useState({
    minLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
    hasSpecialChar: false,
  });
  
  const router = useRouter();
  const { token } = router.query;

  // Validation en temps réel du mot de passe
  useEffect(() => {
    setPasswordCriteria({
      minLength: password.length >= 8,
      hasUpperCase: /[A-Z]/.test(password),
      hasLowerCase: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecialChar: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>?]/.test(password),
    });
  }, [password]);

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
    
    // Vérifier que tous les critères sont respectés
    const allCriteriaMet = Object.values(passwordCriteria).every(criterion => criterion);
    if (!allCriteriaMet) {
      setError('Votre mot de passe ne respecte pas tous les critères de sécurité');
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
        <div className={styles.pageWrapper}>
          <div className={styles.loadingState}>
            <div className={styles.loadingSpinner}></div>
            <h2 className={styles.loadingTitle}>Vérification du lien</h2>
            <p className={styles.loadingSubtitle}>Validation de votre demande en cours...</p>
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
        <div className={styles.pageWrapper}>
          <div className={styles.backgroundPattern}></div>
          <div className={styles.container}>
            <div className={styles.formCard}>
              
              <header className={styles.cardHeader}>
                <Link href="/" className={styles.logoLink}>
                  <h1 className={styles.logo}>MonSavonVert</h1>
                </Link>
              </header>

              <div className={styles.errorState}>
                <div className={styles.errorIcon}>
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M15 9l-6 6"/>
                    <path d="M9 9l6 6"/>
                  </svg>
                </div>
                <h2 className={styles.errorTitle}>Lien de récupération invalide</h2>
                <p className={styles.errorMessage}>{error}</p>
                <div className={styles.errorDetails}>
                  <p>Les liens de récupération expirent automatiquement après 10 minutes pour garantir la sécurité de votre compte.</p>
                </div>
                
                <div className={styles.errorActions}>
                  <Link href="/forgot-password" className={styles.primaryButton}>
                    Faire une nouvelle demande
                  </Link>
                  <Link href="/login" className={styles.secondaryButton}>
                    Retour à la connexion
                  </Link>
                </div>
              </div>
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
        <meta name="description" content="Créez votre nouveau mot de passe sécurisé" />
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      <div className={styles.pageWrapper}>
        <div className={styles.backgroundPattern}></div>
        
        <div className={styles.container}>
          <div className={styles.formCard}>
            
            {/* En-tête */}
            <header className={styles.cardHeader}>
              <Link href="/" className={styles.logoLink}>
                <h1 className={styles.logo}>MonSavonVert</h1>
              </Link>
              <nav className={styles.breadcrumb}>
                <Link href="/" className={styles.breadcrumbLink}>Accueil</Link>
                <span className={styles.breadcrumbSeparator}>/</span>
                <Link href="/login" className={styles.breadcrumbLink}>Connexion</Link>
                <span className={styles.breadcrumbSeparator}>/</span>
                <span className={styles.breadcrumbCurrent}>Nouveau mot de passe</span>
              </nav>
            </header>

            {/* Section titre avec info utilisateur */}
            <div className={styles.titleSection}>
              <div className={styles.titleIcon}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </div>
              <h2 className={styles.mainTitle}>Créer un nouveau mot de passe</h2>
              {userInfo && (
                <div className={styles.userWelcome}>
                  <p>Bonjour <strong>{userInfo.firstName}</strong>, définissez votre nouveau mot de passe ci-dessous.</p>
                </div>
              )}
              {timeRemaining && (
                <div className={styles.timeWarning}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12,6 12,12 16,14"/>
                  </svg>
                  Ce lien expire dans {timeRemaining} minute{timeRemaining > 1 ? 's' : ''}
                </div>
              )}
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
                  <h4>Mot de passe modifié avec succès</h4>
                  <p>{message}</p>
                  <div className={styles.alertNote}>
                    Redirection vers la page de connexion dans 3 secondes...
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

            {/* Formulaire de nouveau mot de passe */}
            {!message && (
              <form onSubmit={handleSubmit} className={styles.form}>
                
                {/* Champ nouveau mot de passe */}
                <div className={styles.inputGroup}>
                  <label htmlFor="password" className={styles.inputLabel}>
                    Nouveau mot de passe
                  </label>
                  <div className={styles.inputWrapper}>
                    <div className={styles.inputIcon}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                      </svg>
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Créez un mot de passe sécurisé"
                      className={styles.input}
                      disabled={isLoading}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      className={styles.passwordToggle}
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                    >
                      {showPassword ? (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                          <line x1="1" y1="1" x2="23" y2="23"/>
                        </svg>
                      ) : (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                          <circle cx="12" cy="12" r="3"/>
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* Champ confirmation mot de passe */}
                <div className={styles.inputGroup}>
                  <label htmlFor="confirmPassword" className={styles.inputLabel}>
                    Confirmer le mot de passe
                  </label>
                  <div className={styles.inputWrapper}>
                    <div className={styles.inputIcon}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 12l2 2 4-4"/>
                        <path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9c2.39 0 4.58.94 6.21 2.49"/>
                      </svg>
                    </div>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      id="confirmPassword"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirmez votre mot de passe"
                      className={styles.input}
                      disabled={isLoading}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      className={styles.passwordToggle}
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      aria-label={showConfirmPassword ? "Masquer la confirmation" : "Afficher la confirmation"}
                    >
                      {showConfirmPassword ? (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                          <line x1="1" y1="1" x2="23" y2="23"/>
                        </svg>
                      ) : (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                          <circle cx="12" cy="12" r="3"/>
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* Critères de validation du mot de passe */}
                {password && (
                  <div className={styles.passwordCriteria}>
                    <h4 className={styles.criteriaTitle}>Critères de sécurité</h4>
                    <div className={styles.criteriaList}>
                      <div className={`${styles.criteriaItem} ${passwordCriteria.minLength ? styles.criteriaValid : styles.criteriaInvalid}`}>
                        <div className={styles.criteriaIcon}>
                          {passwordCriteria.minLength ? (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="20 6 9 17 4 12"/>
                            </svg>
                          ) : (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <circle cx="12" cy="12" r="10"/>
                            </svg>
                          )}
                        </div>
                        <span>Au moins 8 caractères</span>
                      </div>
                      <div className={`${styles.criteriaItem} ${passwordCriteria.hasUpperCase ? styles.criteriaValid : styles.criteriaInvalid}`}>
                        <div className={styles.criteriaIcon}>
                          {passwordCriteria.hasUpperCase ? (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="20 6 9 17 4 12"/>
                            </svg>
                          ) : (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <circle cx="12" cy="12" r="10"/>
                            </svg>
                          )}
                        </div>
                        <span>Une lettre majuscule</span>
                      </div>
                      <div className={`${styles.criteriaItem} ${passwordCriteria.hasLowerCase ? styles.criteriaValid : styles.criteriaInvalid}`}>
                        <div className={styles.criteriaIcon}>
                          {passwordCriteria.hasLowerCase ? (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="20 6 9 17 4 12"/>
                            </svg>
                          ) : (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <circle cx="12" cy="12" r="10"/>
                            </svg>
                          )}
                        </div>
                        <span>Une lettre minuscule</span>
                      </div>
                      <div className={`${styles.criteriaItem} ${passwordCriteria.hasNumber ? styles.criteriaValid : styles.criteriaInvalid}`}>
                        <div className={styles.criteriaIcon}>
                          {passwordCriteria.hasNumber ? (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="20 6 9 17 4 12"/>
                            </svg>
                          ) : (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <circle cx="12" cy="12" r="10"/>
                            </svg>
                          )}
                        </div>
                        <span>Un chiffre</span>
                      </div>
                      <div className={`${styles.criteriaItem} ${passwordCriteria.hasSpecialChar ? styles.criteriaValid : styles.criteriaInvalid}`}>
                        <div className={styles.criteriaIcon}>
                          {passwordCriteria.hasSpecialChar ? (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="20 6 9 17 4 12"/>
                            </svg>
                          ) : (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <circle cx="12" cy="12" r="10"/>
                            </svg>
                          )}
                        </div>
                        <span>Un caractère spécial</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Vérification des mots de passe identiques */}
                {password && confirmPassword && (
                  <div className={styles.passwordMatch}>
                    <div className={`${styles.matchIndicator} ${password === confirmPassword ? styles.matchValid : styles.matchInvalid}`}>
                      <div className={styles.matchIcon}>
                        {password === confirmPassword ? (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="20 6 9 17 4 12"/>
                          </svg>
                        ) : (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18"/>
                            <line x1="6" y1="6" x2="18" y2="18"/>
                          </svg>
                        )}
                      </div>
                      <span>
                        {password === confirmPassword 
                          ? "Les mots de passe correspondent" 
                          : "Les mots de passe ne correspondent pas"
                        }
                      </span>
                    </div>
                  </div>
                )}

                <button 
                  type="submit" 
                  disabled={isLoading || !password || !confirmPassword || password !== confirmPassword || !Object.values(passwordCriteria).every(c => c)}
                  className={styles.submitButton}
                >
                  {isLoading ? (
                    <span className={styles.buttonLoading}>
                      <span className={styles.loadingSpinner}></span>
                      Modification en cours...
                    </span>
                  ) : (
                    <span className={styles.buttonContent}>
                      <span>Modifier mon mot de passe</span>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    </span>
                  )}
                </button>
              </form>
            )}

            {/* Actions */}
            <div className={styles.cardActions}>
              <Link href="/login" className={styles.backLink}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="19" y1="12" x2="5" y2="12"/>
                  <polyline points="12 19 5 12 12 5"/>
                </svg>
                Retour à la connexion
              </Link>
            </div>

            {/* Conseils de sécurité */}
            <div className={styles.securityTips}>
              <div className={styles.securityIcon}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
              </div>
              <div className={styles.securityContent}>
                <h4>Conseils pour un mot de passe sécurisé</h4>
                <ul>
                  <li>Utilisez une combinaison unique que vous seul connaissez</li>
                  <li>Évitez les informations personnelles (nom, date de naissance)</li>
                  <li>Ne réutilisez pas ce mot de passe sur d'autres sites</li>
                  <li>Considérez l'utilisation d'un gestionnaire de mots de passe</li>
                </ul>
              </div>
            </div>

          </div>
        </div>

        {/* Footer */}
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