"use client";

import { useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import Header from "../components/Header"; // AJOUT DE L'IMPORT DU HEADER
import Footer from "../components/Footer"; // AJOUT DE L'IMPORT DU HEADER
import styles from "../styles/forgot-password.module.css";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  // Fonction pour soumettre la demande de récupération
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Réinitialiser les messages
    setError("");
    setMessage("");

    // Vérifications côté client
    if (!email) {
      setError("Veuillez saisir votre adresse email");
      return;
    }

    if (!email.includes("@")) {
      setError("Veuillez saisir une adresse email valide");
      return;
    }

    setIsLoading(true);

    try {
      console.log("📧 Envoi de la demande de récupération pour:", email);

      // Récupérer l'URL de l'API
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!apiUrl) {
        throw new Error("Configuration API manquante");
      }

      // CORRECTION: Utiliser la bonne route backend
      const response = await fetch(`${apiUrl}/password-reset/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.success) {
        console.log("✅ Demande de récupération envoyée avec succès");
        setMessage(data.message);
        setEmail(""); // Vider le champ email
      } else {
        console.error("❌ Erreur:", data.message);
        setError(data.message || "Une erreur est survenue");
      }
    } catch (error) {
      console.error("❌ Erreur lors de la demande:", error);
      setError("Erreur de connexion. Veuillez réessayer.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Mot de passe oublié | MonSavonVert</title>
        <meta
          name="description"
          content="Récupérez votre mot de passe MonSavonVert"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* AJOUT DU HEADER */}
      <Header cartCount={0} />

      <div className={styles.container}>
        {/* Section principale avec design asymétrique */}
        <div className={styles.mainSection}>
          {/* Colonne de gauche - Visuel */}
          <div className={styles.visualColumn}>
          </div>

          {/* Colonne de droite - Formulaire */}
          <div className={styles.formColumn}>
            <div className={styles.formContainer}>
              {/* En-tête du formulaire */}
              <div className={styles.header}>
                <h1 className={styles.title}>Récupération de compte</h1>
                <p className={styles.subtitle}>
                  Saisissez votre adresse email pour recevoir un lien de
                  récupération
                </p>
              </div>

              {/* Messages de succès ou d'erreur */}
              {message && (
                <div className={styles.successMessage}>
                  <div className={styles.successIcon}>✅</div>
                  <div className={styles.messageContent}>
                    <h3>Email envoyé avec succès</h3>
                    <p>{message}</p>
                    <p className={styles.successNote}>
                      Vérifiez votre boîte email (et vos spams) pour le lien de
                      récupération.
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

              {/* Formulaire de récupération */}
              {!message && (
                <form onSubmit={handleSubmit} className={styles.form}>
                  <div className={styles.inputGroup}>
                    <label htmlFor="email" className={styles.label}>
                      Adresse email
                    </label>
                    <div className={styles.inputWrapper}>
                      <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="votre-email@exemple.com"
                        className={styles.input}
                        disabled={isLoading}
                      />
                      <div className={styles.inputIcon}>
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                          <polyline points="22,6 12,13 2,6"></polyline>
                        </svg>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className={styles.submitButton}
                  >
                    <span className={styles.buttonContent}>
                      {isLoading ? (
                        <>
                          <span className={styles.spinner}></span>
                          Envoi en cours...
                        </>
                      ) : (
                        <>
                          <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="M22 2L11 13"></path>
                            <polygon points="22,2 15,22 11,13 2,9"></polygon>
                          </svg>
                          Envoyer le lien
                        </>
                      )}
                    </span>
                  </button>
                </form>
              )}

              {/* Liens de navigation */}
              <div className={styles.links}>
                <Link href="/login" className={styles.link}>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M19 12H5M12 19L5 12L12 5"></path>
                  </svg>
                  Retour à la connexion
                </Link>

                {message && (
                  <button
                    onClick={() => {
                      setMessage("");
                      setError("");
                      setEmail("");
                    }}
                    className={styles.link}
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M21 4H8L1 12L8 20H21C22.1 20 23 19.1 23 18V6C23 4.9 22.1 4 21 4Z"></path>
                      <path d="M18 9L12 15M12 9L18 15"></path>
                    </svg>
                    Nouveau email
                  </button>
                )}
              </div>

              {/* Information de sécurité */}
              <div className={styles.securityInfo}>
                <div className={styles.securityHeader}>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M12 22S8 18 8 12V7L12 5L16 7V12C16 18 12 22 12 22Z"></path>
                  </svg>
                  <h3>Sécurité</h3>
                </div>
                <ul>
                  <li>🕒 Le lien expire dans 10 minutes</li>
                  <li>🔒 Processus entièrement sécurisé</li>
                  <li>💬 Support disponible en cas de problème</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
}
