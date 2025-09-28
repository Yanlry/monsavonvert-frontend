"use client";

import { useState, useEffect, useContext } from "react";
import Head from "next/head";
import Link from "next/link";
import styles from "../styles/login.module.css"; // Réutilisation du même fichier CSS
import { useRouter } from "next/router"; // Changé de next/navigation à next/router
import { UserContext } from "../context/UserContext"; // Import du contexte utilisateur
import Header from "../components/Header"; // Importation du composant Header
import Footer from "../components/Footer"; // NOUVEAU: Import du composant footer

/**
 * Composant de page d'inscription pour MonSavonVert
 * Permet aux utilisateurs de créer un nouveau compte
 */
export default function Register() {
  const router = useRouter();
  const { setUser } = useContext(UserContext); // Utiliser le contexte utilisateur

  // États
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  // NOUVEAU: États pour gérer l'affichage des mots de passe
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // AJOUTÉ : États pour la validation du mot de passe en temps réel
  const [passwordValidation, setPasswordValidation] = useState({
    hasMinLength: false,      // Au moins 8 caractères
    hasUppercase: false,      // Au moins une majuscule
    hasNumber: false,         // Au moins un chiffre
    hasSpecialChar: false,    // Au moins un caractère spécial
    passwordsMatch: false     // Les mots de passe correspondent
  });

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  // NOUVEAU: Fonctions pour basculer l'affichage des mots de passe
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
    console.log("Visibilité du mot de passe:", !showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
    console.log("Visibilité confirmation mot de passe:", !showConfirmPassword);
  };

  // Fonction pour mettre la première lettre en majuscule
  const capitalizeFirstLetter = (string) => {
    if (!string) return "";
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
  };

  // AJOUTÉ : Fonction pour valider le mot de passe en temps réel
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

  // AJOUTÉ : Vérifier si tous les critères sont respectés
  const isPasswordValid = () => {
    const allValid = passwordValidation.hasMinLength && 
                    passwordValidation.hasUppercase && 
                    passwordValidation.hasNumber && 
                    passwordValidation.hasSpecialChar && 
                    passwordValidation.passwordsMatch;
    
    console.log('✅ Mot de passe valide:', allValid);
    return allValid;
  };

  // AJOUTÉ : Fonction pour traduire les erreurs en français
  const translateError = (errorMessage) => {
    console.log('🔍 Message d\'erreur reçu:', errorMessage);
    
    // Vérifier si l'erreur indique que l'utilisateur existe déjà
    if (errorMessage.includes('User already exists') || 
        errorMessage.includes('already exists') ||
        errorMessage.includes('Email already in use') ||
        errorMessage.includes('user exists')) {
      return 'Cette adresse email est déjà utilisée. Veuillez en choisir une autre ou vous connecter.';
    }
    
    // Autres erreurs courantes que vous pourriez vouloir traduire
    if (errorMessage.includes('Invalid email')) {
      return 'Adresse email invalide.';
    }
    
    if (errorMessage.includes('Password too weak')) {
      return 'Le mot de passe est trop faible.';
    }
    
    if (errorMessage.includes('Invalid password')) {
      return 'Mot de passe invalide.';
    }
    
    // Si aucune traduction spécifique, retourner le message original
    return errorMessage;
  };

  // Fonction pour formater le prénom lors de la saisie
  const handleFirstNameChange = (e) => {
    setFirstName(e.target.value);
  };

  // Fonction pour formater le nom lors de la saisie
  const handleLastNameChange = (e) => {
    setLastName(e.target.value);
  };

  // MODIFIÉ : Gérer les changements du mot de passe avec validation
  const handlePasswordChange = (newPassword) => {
    console.log('🔒 Changement mot de passe:', newPassword);
    setPassword(newPassword);
    validatePassword(newPassword, confirmPassword);
  };

  // MODIFIÉ : Gérer les changements de la confirmation avec validation
  const handleConfirmPasswordChange = (newConfirmPassword) => {
    console.log('🔒 Changement confirmation:', newConfirmPassword);
    setConfirmPassword(newConfirmPassword);
    validatePassword(password, newConfirmPassword);
  };

  // Effet pour l'initialisation côté client
  useEffect(() => {
    // Marquer que nous sommes côté client
    setIsClient(true);
    console.log("Component Register monté");

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
      console.log("Component Register démonté");
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

  // Fonction pour récupérer les détails complets de l'utilisateur (ajouté comme dans login.js)
  const fetchUserData = async (userId, token) => {
    try {
      console.log(
        `🔍 Récupération des données utilisateur depuis l'API pour l'ID: ${userId}`
      );
      const response = await fetch(`${API_URL}/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(
          "Erreur lors de la récupération des données utilisateur"
        );
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
          addresses: data.user.addresses || [],
        };

        console.log("✅ Données utilisateur formatées depuis API:", userData);
        return userData;
      }
      return null;
    } catch (error) {
      console.error(
        "❌ Erreur lors de la récupération des données utilisateur:",
        error
      );
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Vérifications côté client
      if (!firstName || !lastName || !email || !password || !confirmPassword) {
        throw new Error("Veuillez remplir tous les champs obligatoires.");
      }

      // MODIFIÉ : Utiliser la nouvelle validation
      if (!isPasswordValid()) {
        throw new Error("Veuillez respecter tous les critères de sécurité du mot de passe.");
      }

      if (!termsAccepted) {
        throw new Error("Vous devez accepter les conditions générales.");
      }

      // Mettre en forme le prénom et le nom avec majuscule
      const formattedFirstName = capitalizeFirstLetter(firstName);
      const formattedLastName = capitalizeFirstLetter(lastName);

      console.log('📤 Envoi des données d\'inscription...');

      // Envoi des données au backend
      const response = await fetch(`${API_URL}/users/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: formattedFirstName, // Utilisez les valeurs formatées
          lastName: formattedLastName, // Utilisez les valeurs formatées
          email,
          password,
          termsAccepted,
          role: "user", // Ajout du rôle par défaut
        }),
      });

      const data = await response.json();
      console.log('📨 Réponse du serveur:', data);

      if (!response.ok) {
        // MODIFIÉ : Utiliser la fonction de traduction pour les erreurs
        const translatedError = translateError(data.error || "Erreur lors de l'inscription");
        throw new Error(translatedError);
      }

      // Stockage dans localStorage (comme dans login.js)
      localStorage.setItem("token", data.token);
      localStorage.setItem("userId", data.userId);
      localStorage.setItem("firstName", formattedFirstName);
      localStorage.setItem("lastName", formattedLastName);
      localStorage.setItem("userEmail", email);
      localStorage.setItem("role", data.role || "user");

      // Récupérer les informations complètes de l'utilisateur
      const userData = await fetchUserData(data.userId, data.token);

      if (userData) {
        // Stocker l'utilisateur complet (crucial pour le checkout)
        localStorage.setItem("user", JSON.stringify(userData));

        // Mettre à jour le contexte utilisateur
        setUser(userData);

        console.log("✅ Profil utilisateur complet stocké");
      } else {
        // Même si on n'a pas pu récupérer les données complètes, on peut quand même
        // créer un objet utilisateur basique avec ce qu'on a
        const basicUserData = {
          _id: data.userId,
          userId: data.userId,
          token: data.token,
          firstName: formattedFirstName,
          lastName: formattedLastName,
          email: email,
          role: data.role || "user",
        };

        // Stocker l'utilisateur de base
        localStorage.setItem("user", JSON.stringify(basicUserData));
        setUser(basicUserData);

        console.log(
          "⚠️ Profil utilisateur basique stocké (données complètes non disponibles)"
        );
      }

      router.push("/profile");
    } catch (err) {
      console.error('❌ Erreur lors de l\'inscription:', err.message);
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
          <title>Créer un compte | MonSavonVert</title>
          <meta
            name="description"
            content="Créez votre compte MonSavonVert et rejoignez notre communauté."
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
        <title>Créer un compte | MonSavonVert</title>
        <meta
          name="description"
          content="Créez votre compte MonSavonVert et rejoignez notre communauté."
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
          <Header cartCount={cartCount} />{" "}
          {/* Utilisation du composant Header comme dans login.js */}
        </header>

        <main className={styles.mainContent}>
          {/* Hero section */}
          <section className={styles.pageHero}>
            <div className={styles.pageHeroContent}>
              <h1 className={styles.pageTitle}>Créer un compte</h1>
            </div>
          </section>

          {/* Section d'inscription */}
          <section className={styles.loginSection}>
            <div className={styles.loginContainer}>
              <div className={styles.loginContent}>
                <div className={styles.loginBox}>
                  <div className={styles.loginBoxHeader}>
                    <h2>Créez votre compte</h2>
                    <p>Rejoignez la communauté MonSavonVert</p>
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

                    {/* Prénom */}
                    <div className={styles.formGroup}>
                      <label htmlFor="firstName">Prénom</label>
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
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                          <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                        <input
                          type="text"
                          id="firstName"
                          placeholder="Votre prénom"
                          value={firstName}
                          onChange={handleFirstNameChange}
                          required
                        />
                      </div>
                    </div>

                    {/* Nom */}
                    <div className={styles.formGroup}>
                      <label htmlFor="lastName">Nom</label>
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
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                          <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                        <input
                          type="text"
                          id="lastName"
                          placeholder="Votre nom"
                          value={lastName}
                          onChange={handleLastNameChange}
                          required
                        />
                      </div>
                    </div>

                    {/* Email */}
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

                    {/* MODIFIÉ: Mot de passe avec bouton afficher/masquer */}
                    <div className={styles.formGroup}>
                      <label htmlFor="password">Mot de passe</label>
                      
                      {/* Container avec styles inline pour éviter les conflits CSS */}
                      <div 
                        style={{
                          position: 'relative',
                          display: 'block',
                          width: '100%',
                          height: '48px'
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
                            top: '16px',
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
                          placeholder="Votre mot de passe (8 caractères minimum)"
                          value={password}
                          onChange={(e) => handlePasswordChange(e.target.value)}
                          required
                          minLength="8"
                          style={{
                            position: 'absolute',
                            top: '0',
                            left: '0',
                            width: '100%',
                            height: '48px',
                            padding: '16px 50px 16px 48px',
                            border: '1px solid #e0e0e0',
                            borderRadius: '8px',
                            fontSize: '14px',
                            transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
                            boxSizing: 'border-box',
                            outline: 'none',
                            lineHeight: '16px',
                            fontFamily: 'inherit'
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

                        {/* NOUVEAU: Bouton pour afficher/masquer le mot de passe */}
                        <button
                          type="button"
                          onClick={togglePasswordVisibility}
                          aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                          style={{
                            position: 'absolute',
                            right: '12px',
                            top: '12px',
                            background: 'none',
                            border: 'none',
                            padding: '0',
                            cursor: 'pointer',
                            color: '#666',
                            transition: 'color 0.2s ease, background-color 0.2s ease',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 10,
                            width: '24px',
                            height: '24px',
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
                            e.target.style.transform = 'scale(0.95)';
                          }}
                          onMouseUp={(e) => {
                            e.target.style.transform = 'scale(1)';
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

                    {/* MODIFIÉ: Confirmation mot de passe avec bouton afficher/masquer */}
                    <div className={styles.formGroup}>
                      <label htmlFor="confirmPassword">
                        Confirmez le mot de passe
                      </label>
                      
                      {/* Container avec styles inline pour la confirmation */}
                      <div 
                        style={{
                          position: 'relative',
                          display: 'block',
                          width: '100%',
                          height: '48px'
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
                            top: '16px',
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

                        {/* Input confirmation mot de passe */}
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          id="confirmPassword"
                          placeholder="Confirmez votre nouveau mot de passe"
                          value={confirmPassword}
                          onChange={(e) => handleConfirmPasswordChange(e.target.value)}
                          required
                          style={{
                            position: 'absolute',
                            top: '0',
                            left: '0',
                            width: '100%',
                            height: '48px',
                            padding: '16px 50px 16px 48px',
                            border: '1px solid #e0e0e0',
                            borderRadius: '8px',
                            fontSize: '14px',
                            transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
                            boxSizing: 'border-box',
                            outline: 'none',
                            lineHeight: '16px',
                            fontFamily: 'inherit'
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

                        {/* NOUVEAU: Bouton pour afficher/masquer la confirmation */}
                        <button
                          type="button"
                          onClick={toggleConfirmPasswordVisibility}
                          aria-label={showConfirmPassword ? "Masquer la confirmation" : "Afficher la confirmation"}
                          style={{
                            position: 'absolute',
                            right: '12px',
                            top: '12px',
                            background: 'none',
                            border: 'none',
                            padding: '0',
                            cursor: 'pointer',
                            color: '#666',
                            transition: 'color 0.2s ease, background-color 0.2s ease',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 10,
                            width: '24px',
                            height: '24px',
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
                            e.target.style.transform = 'scale(0.95)';
                          }}
                          onMouseUp={(e) => {
                            e.target.style.transform = 'scale(1)';
                          }}
                        >
                          {showConfirmPassword ? (
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

                    {/* Conditions générales */}
                    <div className={styles.formGroup}>
                      <div className={styles.rememberMe}>
                        <input
                          type="checkbox"
                          id="terms"
                          checked={termsAccepted}
                          onChange={(e) => setTermsAccepted(e.target.checked)}
                          required
                        />
                        <label htmlFor="terms">
                          J'accepte les {" "}
                          <Link href="/terms"> termes et conditions</Link>
                        </label>
                      </div>
                    </div>

                    {/* MODIFIÉ : Bouton d'inscription avec validation */}
                    <button
                      type="submit"
                      className={`${styles.submitButton} ${!isPasswordValid() || !termsAccepted ? styles.submitButtonDisabled : ''}`}
                      disabled={loading || !isPasswordValid() || !termsAccepted}
                    >
                      {loading ? (
                        <>
                          <span className={styles.spinner}></span>
                          Création en cours...
                        </>
                      ) : (
                        "Créer mon compte"
                      )}
                    </button>
                  </form>

                  <div className={styles.loginBoxFooter}>
                    <p>Vous avez déjà un compte ?</p>
                    <Link href="/login" className={styles.createAccountLink}>
                      Se connecter
                    </Link>
                  </div>
                </div>

                {/* REMPLACÉ : Section des critères de validation au lieu des avantages */}
                <div className={styles.loginInfo} id="register-validation">
                  <div className={styles.loginInfoContent}>
                    <h2>Critères de sécurité</h2>
                    
                    {/* Liste des critères de validation */}
                    <ul className={styles.passwordCriteriaList}>
                      <li className={`${styles.criteriaItem} ${passwordValidation.hasMinLength ? styles.valid : styles.invalid}`}>
                        <span className={styles.criteriaIcon}>
                          {passwordValidation.hasMinLength ? '✓' : '✗'}
                        </span>
                        <span>Au moins 8 caractères</span>
                      </li>
                      <li className={`${styles.criteriaItem} ${passwordValidation.hasUppercase ? styles.valid : styles.invalid}`}>
                        <span className={styles.criteriaIcon}>
                          {passwordValidation.hasUppercase ? '✓' : '✗'}
                        </span>
                        <span>Une lettre majuscule</span>
                      </li>
                      <li className={`${styles.criteriaItem} ${passwordValidation.hasNumber ? styles.valid : styles.invalid}`}>
                        <span className={styles.criteriaIcon}>
                          {passwordValidation.hasNumber ? '✓' : '✗'}
                        </span>
                        <span>Un chiffre</span>
                      </li>
                      <li className={`${styles.criteriaItem} ${passwordValidation.hasSpecialChar ? styles.valid : styles.invalid}`}>
                        <span className={styles.criteriaIcon}>
                          {passwordValidation.hasSpecialChar ? '✓' : '✗'}
                        </span>
                        <span>Un caractère spécial (!@#$%^&*)</span>
                      </li>
                      <li className={`${styles.criteriaItem} ${passwordValidation.passwordsMatch ? styles.valid : styles.invalid}`}>
                        <span className={styles.criteriaIcon}>
                          {passwordValidation.passwordsMatch ? '✓' : '✗'}
                        </span>
                        <span>Les mots de passe correspondent</span>
                      </li>
                    </ul>

                    <div className={styles.infoBox}>
                      <div className={styles.infoBoxIcon}>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M12 22S8 18 8 12V7L12 5L16 7V12C16 18 12 22 12 22Z"></path>
                        </svg>
                      </div>
                      <div className={styles.infoBoxContent}>
                        <h3>Protection des données</h3>
                        <p>
                          Vos informations personnelles sont sécurisées et ne
                          seront jamais partagées avec des tiers.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>

      {/* MODIFIÉ : Styles pour masquer la section des critères sur mobile */}
      <style jsx global>{`
        /* Styles pour masquer la section de validation sur mobile */
        @media (max-width: 768px) {
          /* Sélecteur pour cibler la classe spécifique via l'ID */
          #register-validation {
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