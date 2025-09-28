"use client";

import React, { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import styles from "../styles/login.module.css";
import { useContext } from "react";
import { UserContext } from "../context/UserContext";
import { useRouter } from "next/router";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function Login() {
  const router = useRouter();
  const { setUser } = useContext(UserContext);
  
  // États existants
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  
  // NOUVEAU: État pour gérer l'affichage du mot de passe
  const [showPassword, setShowPassword] = useState(false);
  
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  
  // NOUVEAU: Fonction pour basculer l'affichage du mot de passe
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
    console.log("Visibilité du mot de passe:", !showPassword);
  };
  
  // Effet pour l'initialisation côté client
  useEffect(() => {
    // Marquer que nous sommes côté client
    setIsClient(true);

    // Réinitialisation des marges
    if (typeof document !== "undefined") {
      document.body.classList.add(styles.resetMargins);
      document.documentElement.classList.add(styles.resetMargins);
    }

    // Détection du scroll pour le header
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };

    // Gestionnaires d'événements
    if (typeof window !== "undefined") {
      window.addEventListener("scroll", handleScroll);
    }

    // Nettoyage
    return () => {
      if (typeof document !== "undefined") {
        document.body.classList.remove(styles.resetMargins);
        document.documentElement.classList.remove(styles.resetMargins);
      }
      if (typeof window !== "undefined") {
        window.removeEventListener("scroll", handleScroll);
      }
    };
  }, []);

  // Récupérer le nombre d'articles dans le panier au chargement
  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        const storedCart = JSON.parse(localStorage.getItem("cart")) || [];
        const totalItems = storedCart.reduce(
          (sum, item) => sum + item.quantity,
          0
        );
        setCartCount(totalItems);
        console.log("Nombre d'articles dans le panier:", totalItems);
      }
    } catch (error) {
      console.error("Erreur lors du chargement du panier:", error);
    }
  }, []);

  // Fonction pour récupérer les détails complets de l'utilisateur
  const fetchUserData = async (userId, token) => {
    try {
      console.log(`🔍 Récupération des données utilisateur depuis l'API pour l'ID: ${userId}`);
      const response = await fetch(`${API_URL}/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des données utilisateur");
      }

      const data = await response.json();
      console.log("✅ Réponse API utilisateur complète:", data);

      if (data.result && data.user) {
        // Formater l'utilisateur avec toutes les données nécessaires
        const userData = {
          _id: data.user._id,
          userId: data.user._id, // Doublon pour compatibilité
          token: token,
          firstName: data.user.firstName || "",
          lastName: data.user.lastName || "",
          email: data.user.email || "",
          role: data.user.role || "user",
          phone: data.user.phone || "",
          // Ajouter des champs formatés pour l'adresse
          address: 
            data.user.addresses && data.user.addresses.length > 0 
              ? data.user.addresses[0].street 
              : "",
          city: 
            data.user.addresses && data.user.addresses.length > 0 
              ? data.user.addresses[0].city 
              : "",
          postalCode: 
            data.user.addresses && data.user.addresses.length > 0 
              ? data.user.addresses[0].postalCode 
              : "",
          country: 
            data.user.addresses && data.user.addresses.length > 0 
              ? data.user.addresses[0].country 
              : "France",
          // Conserver également le format original des adresses
          addresses: data.user.addresses || []
        };

        console.log("✅ Données utilisateur formatées depuis API:", userData);
        return userData;
      }
      return null;
    } catch (error) {
      console.error("❌ Erreur lors de la récupération des données utilisateur:", error);
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      console.log("🔄 Tentative de connexion avec:", { email });
      const response = await fetch(`${API_URL}/users/signin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Identifiants incorrects.");
      }

      console.log("✅ Connexion réussie, données initiales:", data);

      // Déterminer où stocker les données (localStorage ou sessionStorage)
      const rememberMe = document.getElementById("remember").checked;
      const storage = rememberMe ? localStorage : sessionStorage;
      
      // Stocker les informations de base d'abord
      storage.setItem("token", data.token);
      storage.setItem("userId", data.userId);
      storage.setItem("firstName", data.firstName);
      storage.setItem("role", data.role || "user");
      storage.setItem("userEmail", email);
      
      console.log("✅ Informations de base stockées dans", rememberMe ? "localStorage" : "sessionStorage");
      
      // Récupérer les informations complètes de l'utilisateur
      const userData = await fetchUserData(data.userId, data.token);
      
      if (userData) {
        // Stocker l'utilisateur complet (crucial pour le checkout)
        storage.setItem("user", JSON.stringify(userData));
        
        // Mettre à jour le contexte utilisateur
        setUser(userData);
        
        console.log("✅ Profil utilisateur complet stocké");
        
        // Redirection conditionnelle selon le rôle
        if (data.role === "admin") {
          console.log("🔄 Redirection vers la page admin");
          router.push("/admin/dashboard");
        } else {
          console.log("🔄 Redirection vers la page de profil");
          router.push("/profile");
        }
      } else {
        // Même si on n'a pas pu récupérer les données complètes, on peut quand même
        // créer un objet utilisateur basique avec ce qu'on a
        const basicUserData = {
          _id: data.userId,
          userId: data.userId,
          token: data.token,
          firstName: data.firstName,
          lastName: data.lastName || "",
          email: email,
          role: data.role || "user"
        };
        
        // Stocker l'utilisateur de base
        storage.setItem("user", JSON.stringify(basicUserData));
        setUser(basicUserData);
        
        console.log("⚠️ Profil utilisateur basique stocké (données complètes non disponibles)");
        
        // Redirection
        if (data.role === "admin") {
          router.push("/admin/dashboard");
        } else {
          router.push("/profile");
        }
      }
    } catch (err) {
      console.error("❌ Erreur de connexion:", err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Rendu de base sans contenu dynamique (pour éviter les erreurs d'hydratation)
  if (!isClient) {
    return (
      <>
        <Head>
          <title>Connexion | MonSavonVert</title>
          <meta
            name="description"
            content="Connectez-vous à votre compte MonSavonVert."
          />
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
        <title>Connexion | MonSavonVert</title>
        <meta
          name="description"
          content="Connectez-vous à votre compte MonSavonVert."
        />
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      <div className={styles.container}>
        {/* Header avec navigation */}
        <header
          className={`${styles.header} ${
            scrolled ? styles.headerScrolled : ""
          }`}
        >
          <Header cartCount={cartCount} />
        </header>

        <main className={styles.mainContent}>
          {/* Hero section */}
          <section className={styles.pageHero}>
            <div className={styles.pageHeroContent}>
              <h1 className={styles.pageTitle}>Connexion</h1>
            </div>
          </section>

          {/* Section de connexion */}
          <section className={styles.loginSection}>
            <div className={styles.loginContainer}>
              <div className={styles.loginContent}>
                <div className={styles.loginBox}>
                  <div className={styles.loginBoxHeader}>
                    <h2>Accéder à votre compte</h2>
                    <p>Entrez vos identifiants pour vous connecter</p>
                  </div>

                  <form onSubmit={handleSubmit} className={styles.loginForm}>
                    {error && (
                      <div className={styles.errorMessage}>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <circle cx="12" cy="12" r="10"></circle>
                          <line x1="12" y1="8" x2="12" y2="12"></line>
                          <line x1="12" y1="16" x2="12.01" y2="16"></line>
                        </svg>
                        <span>{error}</span>
                      </div>
                    )}

                    <div className={styles.formGroup}>
                      <label htmlFor="email">Adresse e-mail</label>
                      <div className={styles.inputWrapper}>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                          <polyline points="22,6 12,13 2,6"></polyline>
                        </svg>
                        <input
                          type="email"
                          id="email"
                          placeholder="Votre adresse e-mail"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className={styles.formGroup}>
                      <div className={styles.labelWithLink}>
                        <label htmlFor="password">Mot de passe</label>
                        
                        <a
                          href="/forgot-password"
                          className={styles.forgotPassword}
                        >
                          Mot de passe oublié ?
                        </a>
                      </div>
                      
                      {/* SOLUTION ALTERNATIVE: Container avec styles inline pour éviter les conflits CSS */}
                      <div 
                        style={{
                          position: 'relative',
                          display: 'flex',
                          alignItems: 'center',
                          width: '100%'
                        }}
                      >
                        {/* Icône cadenas à gauche */}
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          style={{
                            position: 'absolute',
                            left: '16px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            color: '#546e7a',
                            zIndex: 2,
                            pointerEvents: 'none'
                          }}
                        >
                          <rect
                            x="3"
                            y="11"
                            width="18"
                            height="11"
                            rx="2"
                            ry="2"
                          ></rect>
                          <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                        </svg>

                        {/* Input mot de passe */}
                        <input
                          type={showPassword ? "text" : "password"}
                          id="password"
                          placeholder="Votre mot de passe"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          style={{
                            width: '100%',
                            padding: '16px 50px 16px 48px', // space pour icône gauche et bouton droite
                            border: '1px solid #e0e0e0',
                            borderRadius: '8px',
                            fontSize: '14px',
                            transition: 'all 0.15s ease',
                            boxSizing: 'border-box',
                            outline: 'none'
                          }}
                          onFocus={(e) => {
                            e.target.style.borderColor = '#2e7d32';
                            e.target.style.boxShadow = '0 0 0 2px rgba(46, 125, 50, 0.1)';
                          }}
                          onBlur={(e) => {
                            e.target.style.borderColor = '#e0e0e0';
                            e.target.style.boxShadow = 'none';
                          }}
                        />

                        {/* BOUTON AFFICHER/MASQUER avec styles inline */}
                        <button
                          type="button"
                          onClick={togglePasswordVisibility}
                          aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                          style={{
                            position: 'absolute',
                            right: '12px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'none',
                            border: 'none',
                            padding: '8px',
                            cursor: 'pointer',
                            color: '#666',
                            transition: 'color 0.2s ease',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 10,
                            width: '32px',
                            height: '32px',
                            borderRadius: '4px'
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.color = '#2e7d32';
                            e.target.style.backgroundColor = 'rgba(46, 125, 50, 0.1)';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.color = '#666';
                            e.target.style.backgroundColor = 'transparent';
                          }}
                          onMouseDown={(e) => {
                            e.target.style.transform = 'translateY(-50%) scale(0.95)';
                          }}
                          onMouseUp={(e) => {
                            e.target.style.transform = 'translateY(-50%) scale(1)';
                          }}
                        >
                          {showPassword ? (
                            // Icône œil fermé (masquer)
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="18"
                              height="18"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                              <line x1="1" y1="1" x2="23" y2="23"></line>
                            </svg>
                          ) : (
                            // Icône œil ouvert (afficher)
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="18"
                              height="18"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                              <circle cx="12" cy="12" r="3"></circle>
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>

                    <div className={styles.formGroup}>
                      <div className={styles.rememberMe}>
                        <input type="checkbox" id="remember" />
                        <label htmlFor="remember">Se souvenir de moi</label>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className={styles.submitButton}
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span className={styles.spinner}></span>
                          Connexion en cours...
                        </>
                      ) : (
                        "Se connecter"
                      )}
                    </button>
                  </form>

                  <div className={styles.loginBoxFooter}>
                    <p>Vous n'avez pas encore de compte ?</p>
                    <Link href="/register" className={styles.createAccountLink}>
                        Créer un compte
                    </Link>
                  </div>
                </div>

                <div className={styles.loginInfo} id="login-advantages">
                  <div className={styles.loginInfoContent}>
                    <h2>Avantages de la connexion</h2>
                    <ul className={styles.advantagesList}>
                      <li>
                        <svg
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
                          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                          <polyline points="22 4 12 14.01 9 11.01"></polyline>
                        </svg>
                        <span>Suivez vos commandes facilement</span>
                      </li>
                      <li>
                        <svg
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
                          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                          <polyline points="22 4 12 14.01 9 11.01"></polyline>
                        </svg>
                        <span>Enregistrez vos produits favoris</span>
                      </li>
                      <li>
                        <svg
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
                          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                          <polyline points="22 4 12 14.01 9 11.01"></polyline>
                        </svg>
                        <span>Accédez à votre historique d'achats</span>
                      </li>
                      <li>
                        <svg
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
                          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                          <polyline points="22 4 12 14.01 9 11.01"></polyline>
                        </svg>
                        <span>Bénéficiez de promotions exclusives</span>
                      </li>
                      <li>
                        <svg
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
                          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                          <polyline points="22 4 12 14.01 9 11.01"></polyline>
                        </svg>
                        <span>Passez vos commandes plus rapidement</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>

      {/* Styles pour masquer la section des avantages sur mobile */}
      <style jsx global>{`
        /* Styles pour masquer la section des avantages sur mobile */
        @media (max-width: 768px) {
          /* Sélecteur simplifié pour cibler la classe spécifique */
          #login-advantages {
            display: none !important;
          }
          
          /* Ces classes sont générées par CSS modules */
          [class*="loginInfo"] {
            display: none !important;
          }
          
          /* Ajustements pour le formulaire de connexion */
          [class*="loginContent"] {
            grid-template-columns: 1fr !important;
            max-width: 100%;
          }
          
          [class*="loginBox"] {
            width: 100%;
          }
        }
      `}</style>
    </>
  );
}