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
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, feedback: '' });
  
  const router = useRouter();
  const { token } = router.query;

  // Fonction pour évaluer la force du mot de passe
  const evaluatePasswordStrength = (password) => {
    let score = 0;
    let feedback = [];

    if (password.length >= 8) score += 25;
    else feedback.push('Au moins 8 caractères');

    if (/[a-z]/.test(password)) score += 25;
    else feedback.push('Une lettre minuscule');

    if (/[A-Z]/.test(password)) score += 25;
    else feedback.push('Une lettre majuscule');

    if (/\d/.test(password)) score += 25;
    else feedback.push('Un chiffre');

    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 10;
    else feedback.push('Un caractère spécial (optionnel)');

    let strengthText = '';
    if (score < 50) strengthText = 'Faible';
    else if (score < 75) strengthText = 'Moyen';
    else if (score < 100) strengthText = 'Fort';
    else strengthText = 'Très fort';

    return {
      score: Math.min(score, 100),
      feedback: feedback.length > 0 ? `Manque: ${feedback.join(', ')}` : 'Excellent mot de passe !',
      strength: strengthText
    };
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

  // Effet pour évaluer la force du mot de passe
  useEffect(() => {
    if (password) {
      setPasswordStrength(evaluatePasswordStrength(password));
    } else {
      setPasswordStrength({ score: 0, feedback: '', strength: '' });
    }
  }, [password]);

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
        <div className={styles.container}>
          <div className={styles.loadingContainer}>
            <div className={styles.loadingSpinner}>
              <div className={styles.spinnerRing}></div>
            </div>
            <h2 className={styles.loadingTitle}>Vérification du lien de récupération</h2>
            <p className={styles.loadingText}>Veuillez patienter pendant que nous vérifions votre demande...</p>
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
          {/* Hero Section */}
          <section className={styles.pageHero}>
            <div className={styles.pageHeroContent}>
              <h1 className={styles.pageTitle}>Lien non valide</h1>
              <nav className={styles.pageBreadcrumb}>
                <Link href="/">Accueil</Link>
                <span className={styles.breadcrumbSeparator}>›</span>
                <span className={styles.breadcrumbCurrent}>Lien expiré</span>
              </nav>
            </div>
          </section>

          <main className={styles.mainContent}>
            <div className={styles.contentContainer}>
              <div className={styles.errorCard}>
                <div className={styles.errorIcon}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                  </svg>
                </div>
                
                <h2 className={styles.errorTitle}>Ce lien n'est plus valide</h2>
                <p className={styles.errorMessage}>{error}</p>
                <p className={styles.errorExplanation}>
                  Les liens de récupération de mot de passe expirent après 10 minutes pour des raisons de sécurité. 
                  Si vous avez besoin de réinitialiser votre mot de passe, veuillez faire une nouvelle demande.
                </p>
                
                {/* Informations de debug */}
                <details className={styles.debugInfo}>
                  <summary>Informations de débogage</summary>
                  <div className={styles.debugContent}>
                    <p><strong>Token:</strong> {token?.substring(0, 20)}...</p>
                    <p><strong>API URL:</strong> {process.env.NEXT_PUBLIC_API_URL}</p>
                    <p><strong>URL de vérification:</strong> {process.env.NEXT_PUBLIC_API_URL}/password-reset/verify-reset-token/{token?.substring(0, 10)}...</p>
                  </div>
                </details>
                
                <div className={styles.actionButtons}>
                  <Link href="/forgot-password" className={styles.primaryButton}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2v0"></path>
                      <polyline points="3,7 12,13 21,7"></polyline>
                    </svg>
                    Nouvelle demande
                  </Link>
                  <Link href="/login" className={styles.secondaryButton}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4"></path>
                      <polyline points="10 17 15 12 10 7"></polyline>
                      <line x1="15" y1="12" x2="3" y2="12"></line>
                    </svg>
                    Retour à la connexion
                  </Link>
                </div>
              </div>
            </div>
          </main>
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
      </Head>

      <div className={styles.container}>
        {/* Hero Section */}
        <section className={styles.pageHero}>
          <div className={styles.pageHeroContent}>
            <h1 className={styles.pageTitle}>Nouveau mot de passe</h1>
            <nav className={styles.pageBreadcrumb}>
              <Link href="/">Accueil</Link>
              <span className={styles.breadcrumbSeparator}>›</span>
              <span className={styles.breadcrumbCurrent}>Réinitialisation</span>
            </nav>
          </div>
        </section>

        <main className={styles.mainContent}>
          <div className={styles.contentContainer}>
            {/* Messages de succès ou d'erreur */}
            {message && (
              <div className={styles.successCard}>
                <div className={styles.successIcon}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
                <h3 className={styles.successTitle}>Mot de passe modifié avec succès !</h3>
                <p className={styles.successMessage}>{message}</p>
                <div className={styles.successNote}>
                  <div className={styles.redirectCountdown}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                    Redirection vers la page de connexion dans 3 secondes...
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className={styles.errorAlert}>
                <div className={styles.alertIcon}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                  </svg>
                </div>
                <p className={styles.alertMessage}>{error}</p>
              </div>
            )}

            {/* Formulaire principal */}
            {!message && (
              <div className={styles.formCard}>
                {/* En-tête avec informations utilisateur */}
                <div className={styles.userWelcome}>
                  <div className={styles.userAvatar}>
                    {userInfo ? userInfo.firstName?.charAt(0) || '👤' : '👤'}
                  </div>
                  <div className={styles.welcomeContent}>
                    <h2 className={styles.welcomeTitle}>
                      Bonjour {userInfo?.firstName || 'Utilisateur'}
                    </h2>
                    <p className={styles.welcomeSubtitle}>
                      Créez un nouveau mot de passe sécurisé pour votre compte
                    </p>
                    {timeRemaining && (
                      <div className={styles.timeWarning}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10"></circle>
                          <polyline points="12 6 12 12 16 14"></polyline>
                        </svg>
                        Ce lien expire dans {timeRemaining} minute{timeRemaining > 1 ? 's' : ''}
                      </div>
                    )}
                  </div>
                </div>

                {/* Formulaire */}
                <form onSubmit={handleSubmit} className={styles.resetForm}>
                  <div className={styles.formGroup}>
                    <label htmlFor="password" className={styles.formLabel}>
                      Nouveau mot de passe
                    </label>
                    <div className={styles.inputWrapper}>
                      <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={styles.formInput}
                        placeholder="Entrez votre nouveau mot de passe"
                        disabled={isLoading}
                      />
                      <div className={styles.inputIcon}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                          <path d="M7 11V7a5 5 0 0110 0v4"></path>
                        </svg>
                      </div>
                    </div>
                    
                    {/* Indicateur de force du mot de passe */}
                    {password && (
                      <div className={styles.passwordStrength}>
                        <div className={styles.strengthBar}>
                          <div 
                            className={styles.strengthFill} 
                            style={{ 
                              width: `${passwordStrength.score}%`,
                              backgroundColor: 
                                passwordStrength.score < 50 ? '#ff6b6b' :
                                passwordStrength.score < 75 ? '#ffa726' :
                                passwordStrength.score < 100 ? '#4caf50' : '#2e7d32'
                            }}
                          ></div>
                        </div>
                        <div className={styles.strengthInfo}>
                          <span className={styles.strengthText}>
                            Force: <strong>{passwordStrength.strength}</strong>
                          </span>
                          <span className={styles.strengthFeedback}>
                            {passwordStrength.feedback}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="confirmPassword" className={styles.formLabel}>
                      Confirmer le mot de passe
                    </label>
                    <div className={styles.inputWrapper}>
                      <input
                        type="password"
                        id="confirmPassword"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className={styles.formInput}
                        placeholder="Confirmez votre nouveau mot de passe"
                        disabled={isLoading}
                      />
                      <div className={styles.inputIcon}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      </div>
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    disabled={isLoading || !password || !confirmPassword}
                    className={styles.submitButton}
                  >
                    {isLoading ? (
                      <>
                        <div className={styles.buttonSpinner}></div>
                        Modification en cours...
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"></path>
                        </svg>
                        Enregistrer le nouveau mot de passe
                      </>
                    )}
                  </button>
                </form>

                {/* Navigation */}
                <div className={styles.formNavigation}>
                  <Link href="/login" className={styles.backButton}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="19" y1="12" x2="5" y2="12"></line>
                      <polyline points="12 19 5 12 12 5"></polyline>
                    </svg>
                    Retour à la connexion
                  </Link>
                </div>
              </div>
            )}

            {/* Conseils de sécurité */}
            <div className={styles.securityTips}>
              <h3 className={styles.tipsTitle}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                </svg>
                Conseils pour un mot de passe sécurisé
              </h3>
              <ul className={styles.tipsList}>
                <li>Utilisez au moins 8 caractères</li>
                <li>Mélangez lettres majuscules et minuscules</li>
                <li>Incluez des chiffres et des caractères spéciaux</li>
                <li>Évitez les mots du dictionnaire ou les informations personnelles</li>
                <li>N'utilisez jamais le même mot de passe sur plusieurs sites</li>
              </ul>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}