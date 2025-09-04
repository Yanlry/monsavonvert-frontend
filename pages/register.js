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
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  // Fonction pour mettre la première lettre en majuscule
  const capitalizeFirstLetter = (string) => {
    if (!string) return "";
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
  };

  // Fonction pour formater le prénom lors de la saisie
  const handleFirstNameChange = (e) => {
    setFirstName(e.target.value);
  };

  // Fonction pour formater le nom lors de la saisie
  const handleLastNameChange = (e) => {
    setLastName(e.target.value);
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

      if (password.length < 8) {
        throw new Error("Le mot de passe doit contenir au moins 8 caractères.");
      }

      if (password !== confirmPassword) {
        throw new Error("Les mots de passe ne correspondent pas.");
      }

      if (!termsAccepted) {
        throw new Error("Vous devez accepter les conditions générales.");
      }

      // Mettre en forme le prénom et le nom avec majuscule
      const formattedFirstName = capitalizeFirstLetter(firstName);
      const formattedLastName = capitalizeFirstLetter(lastName);

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

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors de l'inscription");
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

                    {/* Mot de passe */}
                    <div className={styles.formGroup}>
                      <label htmlFor="password">Mot de passe</label>
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
                        <input
                          type="password"
                          id="password"
                          placeholder="Votre mot de passe (8 caractères minimum)"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          minLength="8"
                        />
                      </div>
                    </div>

                    {/* Confirmation mot de passe */}
                    <div className={styles.formGroup}>
                      <label htmlFor="confirmPassword">
                        Confirmez le mot de passe
                      </label>
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
                        <input
                          type="password"
                          id="confirmPassword"
                          placeholder="Confirmez votre mot de passe"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required
                        />
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

                    {/* Bouton d'inscription */}
                    <button
                      type="submit"
                      className={styles.submitButton}
                      disabled={loading}
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

                <div className={styles.loginInfo} id="register-advantages">
                  <div className={styles.loginInfoContent}>
                    <h2>Pourquoi créer un compte</h2>
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
                        <span>Accédez à votre historique de commandes</span>
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
                        <span>Sauvegardez votre liste de produits favoris</span>
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
                        <span>Recevez des offres exclusives par email</span>
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
                        <span>Rejoignez notre programme de fidélité</span>
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
                          <circle cx="12" cy="12" r="10"></circle>
                          <line x1="12" y1="16" x2="12" y2="12"></line>
                          <line x1="12" y1="8" x2="12.01" y2="8"></line>
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

      {/* Styles pour masquer la section "Pourquoi créer un compte" sur mobile */}
      <style jsx global>{`
        /* Styles pour masquer la section des avantages sur mobile */
        @media (max-width: 768px) {
          /* Sélecteur pour cibler la classe spécifique via l'ID */
          #register-advantages {
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
