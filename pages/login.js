"use client";

import { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import styles from "../styles/login.module.css";
import { useContext } from "react";
import { UserContext } from "../context/UserContext";
import { useRouter } from "next/router";
import Header from "../components/Header";

export default function Login() {
  const router = useRouter();
  const { setUser } = useContext(UserContext);
  // États
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  
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
              <div className={styles.pageBreadcrumb}>
                <Link href="/" >
                  Accueil
                </Link>
                <span className={styles.breadcrumbSeparator}>/</span>
                <span className={styles.breadcrumbCurrent}>Connexion</span>
              </div>
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
                          placeholder="Votre mot de passe"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                        />
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
                    <Link href="/register" className={styles.createAccountLink} >
                        Créer un compte
                    </Link>
                  </div>
                </div>

                <div className={styles.loginInfo}>
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

        {/* Footer */}
        <footer className={styles.footer}>
          <div className={styles.footerTop}>
            <div className={styles.footerContent}>
              <div className={styles.footerColumn}>
                <div className={styles.footerLogo}>MonSavonVert</div>
                <p className={styles.footerAbout}>
                  Savons artisanaux, naturels et écologiques fabriqués avec
                  passion en Syrie dans l'antique ville d'Alep.
                </p>
                <div className={styles.footerSocial}>
                  <a
                    href="https://facebook.com/monsavonvert"
                    className={styles.socialLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Facebook"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      width="20"
                      height="20"
                      stroke="currentColor"
                      strokeWidth="2"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                    </svg>
                  </a>
                  <a
                    href="https://instagram.com/monsavonvert"
                    className={styles.socialLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Instagram"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      width="20"
                      height="20"
                      stroke="currentColor"
                      strokeWidth="2"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect
                        x="2"
                        y="2"
                        width="20"
                        height="20"
                        rx="5"
                        ry="5"
                      ></rect>
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                    </svg>
                  </a>
                  <a
                    href="https://pinterest.com/monsavonvert"
                    className={styles.socialLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Pinterest"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      width="20"
                      height="20"
                      stroke="currentColor"
                      strokeWidth="2"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M8 12a4 4 0 1 1 8 0 4 4 0 0 1-8 0zm2-6h4"></path>
                      <path d="M9 18l3-3 3 3"></path>
                      <path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"></path>
                    </svg>
                  </a>
                </div>
              </div>

              <div className={styles.footerColumn}>
                <h3 className={styles.footerTitle}>Boutique</h3>
                <Link href="/boutique/nouveautes" className={styles.footerLink}>
                  Nouveautés
                </Link>
                <Link href="/boutique/visage" className={styles.footerLink}>
                  Soins visage
                </Link>
                <Link href="/boutique/corps" className={styles.footerLink}>
                  Soins corps
                </Link>
                <Link href="/boutique/cheveux" className={styles.footerLink}>
                  Cheveux
                </Link>
                <Link href="/boutique/coffrets" className={styles.footerLink}>
                  Coffrets cadeaux
                </Link>
                <Link href="/boutique/accessoires" className={styles.footerLink}>
                  Accessoires
                </Link>
              </div>

              <div className={styles.footerColumn}>
                <h3 className={styles.footerTitle}>Informations</h3>
                <Link href="/a-propos" className={styles.footerLink}>
                  Notre histoire
                </Link>
                <Link href="/virtues" className={styles.footerLink}>
                  Vertu & bienfaits
                </Link>
                <Link href="/blog" className={styles.footerLink}>
                  Journal
                </Link>
                <Link href="/faq" className={styles.footerLink}>
                  FAQ
                </Link>
                <Link href="/contact" className={styles.footerLink}>
                  Contact
                </Link>
                <Link href="/programme-fidelite" className={styles.footerLink}>
                  Programme fidélité
                </Link>
              </div>

              <div className={styles.footerColumn}>
                <h3 className={styles.footerTitle}>Contact</h3>
                <p className={styles.contactInfo}>
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
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                  </svg>
                  <a href="tel:+33612345678">+33 6 12 34 56 78</a>
                </p>
                <p className={styles.contactInfo}>
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
                  <a href="mailto:info@monsavonvert.fr">info@monsavonvert.fr</a>
                </p>
                <p className={styles.contactInfo}>
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
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                  <span>
                    15 rue des Artisans
                    <br />
                    69001 Lyon, France
                  </span>
                </p>
              </div>
            </div>
          </div>

          <div className={styles.footerBottom}>
            <div className={styles.footerBottomContent}>
              <p className={styles.copyright}>
                © 2023 MonSavonVert. Tous droits réservés.
              </p>
              <div className={styles.footerLinks}>
                <Link href="/cgv" className={styles.footerSmallLink}>
                  CGV
                </Link>
                <Link href="/politique-de-confidentialite" className={styles.footerSmallLink}>
                    Politique de confidentialité
                </Link>
                <Link href="/mentions-legales" className={styles.footerSmallLink}>
                  Mentions légales
                </Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}