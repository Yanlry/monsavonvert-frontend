"use client";

import { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import styles from "../styles/profile.module.css";
import Header from "../components/Header";

export default function Profile() {
  // États
  const [isClient, setIsClient] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [activeTab, setActiveTab] = useState("dashboard");
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  // Données utilisateur
  const [userData, setUserData] = useState(null);
  const [userOrders, setUserOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [isSubscribedToNewsletter, setIsSubscribedToNewsletter] =
    useState(false);

  // États pour les mots de passe
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // États pour contrôler la visibilité des mots de passe
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // État pour les critères de validation du mot de passe
  const [criteria, setCriteria] = useState({
    minLength: false, // 6 caractères minimum
    hasUpperCase: false, // 1 majuscule
    hasNumber: false, // 1 chiffre
    hasSpecialChar: false, // 1 caractère spécial
  });

  // États pour le modal de messages
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalType, setModalType] = useState("error"); // 'error' ou 'success'

  // États pour le modal d'adresse
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [addressMode, setAddressMode] = useState("add"); // 'add' ou 'edit'
  const [currentAddressIndex, setCurrentAddressIndex] = useState(-1);
  const [currentAddress, setCurrentAddress] = useState({
    street: "",
    postalCode: "",
    city: "",
    country: "France",
    isDefault: false,
  });

  // NOUVEAU: États pour le modal de détails de commande
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Effet pour récupérer les données du panier
  useEffect(() => {
    const fetchCartData = () => {
      try {
        const storedCart = JSON.parse(localStorage.getItem("cart")) || [];
        const totalItems = storedCart.reduce(
          (sum, item) => sum + item.quantity,
          0
        );
        setCartCount(totalItems); // Met à jour le nombre d'articles dans le panier
      } catch (error) {
        console.error("Erreur lors de la récupération du panier :", error);
      }
    };

    fetchCartData();
  }, []); // Exécuté une seule fois au chargement de la page

  // Effet pour l'initialisation côté client
  useEffect(() => {
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

  // Fonction pour afficher le modal avec un message
  const showMessageModal = (message, type = "error") => {
    setModalMessage(message);
    setModalType(type);
    setShowModal(true);
  };

  // Fonction pour ouvrir le modal d'adresse en mode ajout
  const handleAddAddress = () => {
    setCurrentAddress({
      street: "",
      postalCode: "",
      city: "",
      country: "France",
      isDefault: addresses.length === 0, // Première adresse par défaut
    });
    setAddressMode("add");
    setCurrentAddressIndex(-1);
    setShowAddressModal(true);
  };

  // Fonction pour ouvrir le modal d'adresse en mode édition
  const handleEditAddress = (index) => {
    setCurrentAddress({ ...addresses[index] });
    setAddressMode("edit");
    setCurrentAddressIndex(index);
    setShowAddressModal(true);
  };

  // NOUVEAU: Fonction pour ouvrir le modal de détails de commande
  const handleViewOrderDetails = (order) => {
    setSelectedOrder(order);
    setShowOrderModal(true);
  };

  // Fonction pour sauvegarder une adresse (ajout ou modification)
  const handleSaveAddress = () => {
    // Validation des champs
    if (
      !currentAddress.street ||
      !currentAddress.postalCode ||
      !currentAddress.city
    ) {
      showMessageModal("Veuillez remplir tous les champs obligatoires.");
      return;
    }

    let updatedAddresses = [...addresses];

    if (addressMode === "add") {
      // Ajout d'une nouvelle adresse
      updatedAddresses.push(currentAddress);
    } else {
      // Modification d'une adresse existante
      updatedAddresses[currentAddressIndex] = currentAddress;
    }

    // Si l'adresse actuelle est définie comme par défaut, mettre les autres à false
    if (currentAddress.isDefault) {
      updatedAddresses = updatedAddresses.map((addr, i) => {
        if (addressMode === "add" && i !== updatedAddresses.length - 1) {
          return { ...addr, isDefault: false };
        } else if (addressMode === "edit" && i !== currentAddressIndex) {
          return { ...addr, isDefault: false };
        }
        return addr;
      });
    }

    // Mise à jour des adresses
    setAddresses(updatedAddresses);

    // Mise à jour des données utilisateur via l'API
    handleUpdateUser({ addresses: updatedAddresses });

    // Fermeture du modal
    setShowAddressModal(false);
  };

// NOUVELLE FONCTION: Récupérer les commandes de l'utilisateur
const fetchUserOrders = async (userId) => {
  try {
    console.log("🔍 Récupération des commandes pour l'utilisateur:", userId);
    
    // Obtenir le token d'authentification
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    
    if (!token) {
      console.error("Token d'authentification non trouvé");
      return;
    }
    
    // Appel à l'API pour récupérer les commandes
    const response = await fetch(`${API_URL}/orders/user/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    console.log("Statut de la réponse:", response.status);
    
    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }
    
    const data = await response.json();
    console.log("Données reçues:", data);
    
    if (data.result) {
      console.log("✅ Commandes récupérées:", data.orders);
      
      // Formater les commandes pour l'affichage
      const formattedOrders = data.orders.map(order => ({
        id: order._id,
        date: new Date(order.createdAt).toLocaleDateString('fr-FR'),
        status: order.status,
        statusLabel: getStatusLabel(order.status),
        total: order.totalAmount,
        items: order.items
      }));
      
      setUserOrders(formattedOrders);
    } else {
      console.error("❌ Erreur API:", data.error);
    }
  } catch (error) {
    console.error("❌ Erreur lors de la récupération des commandes:", error);
  }
};

  // Fonction pour convertir le statut en libellé
  const getStatusLabel = (status) => {
    const statusMap = {
      pending: "En attente",
      processing: "En traitement",
      shipped: "Expédié",
      delivered: "Livré",
      completed: "Terminé",
      cancelled: "Annulé"
    };
    
    return statusMap[status] || "Inconnu";
  };

  // Vérification de la connexion et chargement des données
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        console.log("Tentative de récupération des données utilisateur...");

        // Essayer d'abord localStorage
        let storedUser = localStorage.getItem("user")
          ? JSON.parse(localStorage.getItem("user"))
          : null;

        // Si pas trouvé dans localStorage, essayer sessionStorage
        if (!storedUser) {
          storedUser = sessionStorage.getItem("user")
            ? JSON.parse(sessionStorage.getItem("user"))
            : null;
        }

        // Si toujours pas trouvé, essayer de construire l'objet à partir des clés individuelles
        if (!storedUser) {
          const userId =
            localStorage.getItem("userId") || sessionStorage.getItem("userId");
          const firstName =
            localStorage.getItem("firstName") ||
            sessionStorage.getItem("firstName");

          if (userId && firstName) {
            storedUser = {
              _id: userId,
              firstName: firstName,
            };
            console.log(
              "Utilisateur construit à partir des clés individuelles:",
              storedUser
            );
          }
        }

        console.log("Données utilisateur récupérées du stockage:", storedUser);

        if (!storedUser || !storedUser._id) {
          console.log("❌ Aucun utilisateur trouvé dans le stockage.");
          router.push("/login");
          return;
        }

        console.log("🔍 ID utilisateur récupéré :", storedUser._id);

        // Si API_URL est défini, faire la requête au backend
        if (API_URL) {
          const response = await fetch(`${API_URL}/users/${storedUser._id}`);
          const data = await response.json();

          if (data.result) {
            console.log(
              "✅ Données utilisateur récupérées du backend:",
              data.user
            );
            setUserData(data.user);
            setAddresses(data.user.addresses || []);
            setIsSubscribedToNewsletter(
              data.user.isSubscribedToNewsletter || false
            );
            
            // Récupérer les commandes de l'utilisateur
            await fetchUserOrders(storedUser._id);
          } else {
            console.error(
              "❌ Erreur lors de la récupération des données utilisateur :",
              data.error
            );
            showMessageModal(`Erreur: ${data.error}`);
            // Si l'API ne répond pas correctement, utiliser les données du stockage
            setUserData(storedUser);
          }
        } else {
          // Si API_URL n'est pas défini, utiliser les données du stockage
          console.log(
            "⚠️ API_URL non défini, utilisation des données du stockage"
          );
          setUserData(storedUser);
        }
      } catch (error) {
        console.error("❌ Erreur de connexion au serveur :", error);
        showMessageModal(
          "Erreur de connexion au serveur. Veuillez réessayer plus tard."
        );

        // Tentative de récupération des données minimales du stockage
        const storedUser = JSON.parse(
          localStorage.getItem("user") || sessionStorage.getItem("user") || "{}"
        );
        if (storedUser && storedUser._id) {
          setUserData(storedUser);
        }
      }
    };

    if (isClient) {
      fetchUserData();
    }
  }, [isClient, router, API_URL]);

  // Fonction pour vérifier si le profil utilisateur est complet
  const isProfileComplete = () => {
    // Vérifier si l'utilisateur a au moins une adresse et un numéro de téléphone
    return addresses.length > 0 && userData.phone;
  };

  // Effet pour valider le mot de passe à chaque changement
  useEffect(() => {
    console.log("Validation du mot de passe en cours...");

    setCriteria({
      minLength: newPassword.length >= 6,
      hasUpperCase: /[A-Z]/.test(newPassword),
      hasNumber: /[0-9]/.test(newPassword),
      hasSpecialChar: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>\/?]+/.test(newPassword),
    });

    console.log("Critères validés:", {
      minLength: newPassword.length >= 6,
      hasUpperCase: /[A-Z]/.test(newPassword),
      hasNumber: /[0-9]/.test(newPassword),
      hasSpecialChar: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>\/?]+/.test(newPassword),
    });
  }, [newPassword]);

  const handleUpdateUser = async (updatedFields) => {
    try {
      if (!userData || !userData._id) {
        console.error("❌ [Frontend] Erreur : ID utilisateur introuvable.");
        showMessageModal("Erreur : ID utilisateur introuvable.");
        return;
      }

      console.log(
        "📤 [Frontend] Envoi de la requête PUT à /users/update/:id avec userId:",
        userData._id
      );

      const response = await fetch(`${API_URL}/users/update/${userData._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedFields),
      });

      const data = await response.json();
      console.log("📥 [Frontend] Réponse reçue du backend:", data);

      if (data.result) {
        console.log(
          "✅ [Frontend] Mise à jour réussie des données utilisateur."
        );
        setUserData(data.user); // Met à jour les données localement
        showMessageModal(
          "Vos informations ont été mises à jour avec succès.",
          "success"
        );
      } else {
        console.error(
          "❌ [Frontend] Erreur lors de la mise à jour des données utilisateur:",
          data.error
        );
        showMessageModal(`Erreur : ${data.error}`);
      }
    } catch (error) {
      console.error(
        "❌ [Frontend] Erreur lors de la mise à jour des informations utilisateur:",
        error
      );
      showMessageModal("Une erreur est survenue lors de la mise à jour.");
    }
  };

  const handleNewsletterPreferenceChange = (e) => {
    setIsSubscribedToNewsletter(e.target.checked);
  };

  const handleSavePreferences = async () => {
    try {
      const updatedFields = { isSubscribedToNewsletter };
      await handleUpdateUser(updatedFields); // Utilise la fonction existante pour mettre à jour l'utilisateur
      showMessageModal(
        "Vos préférences ont été mises à jour avec succès.",
        "success"
      );
    } catch (error) {
      showMessageModal(
        "Une erreur est survenue lors de la mise à jour des préférences."
      );
    }
  };

  // Fonction pour formater une date
  const formatDate = (dateString) => {
    return dateString; // Déjà formaté dans notre exemple
  };

  // Fonction pour se déconnecter
  const handleLogout = () => {
    // Supprime toutes les données du localStorage et du sessionStorage
    localStorage.clear();
    sessionStorage.clear();

    // Redirige vers la page de connexion et recharge la page
    router.push("/login").then(() => {
      window.location.reload(); // Recharge la page pour mettre à jour le Header
    });
  };

  // Fonction pour obtenir la classe du statut
  const getStatusClass = (status) => {
    const statusClasses = {
      pending: styles.statusPending,
      processing: styles.statusProcessing,
      shipped: styles.statusShipped,
      delivered: styles.statusDelivered,
      completed: styles.statusCompleted,
      cancelled: styles.statusCancelled,
    };

    return statusClasses[status] || "";
  };

  const handleChangePassword = async () => {
    const userId = localStorage.getItem("userId");

    // Vérifier que tous les champs sont remplis
    if (!currentPassword || !newPassword || !confirmPassword) {
      showMessageModal("Veuillez remplir tous les champs.");
      return;
    }

    // Vérifier que les mots de passe correspondent
    if (newPassword !== confirmPassword) {
      showMessageModal(
        "Le nouveau mot de passe et la confirmation ne correspondent pas."
      );
      return;
    }

    // Vérifier que tous les critères sont remplis
    const allCriteriaMet = Object.values(criteria).every((c) => c === true);
    if (!allCriteriaMet) {
      showMessageModal(
        "Votre mot de passe ne respecte pas tous les critères de sécurité."
      );
      return;
    }

    try {
      console.log(
        "📤 [Frontend] Envoi de la requête PUT à /users/change-password/:id"
      );
      const response = await fetch(
        `${API_URL}/users/change-password/${userId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ currentPassword, newPassword }),
        }
      );

      const data = await response.json();
      console.log("📥 [Frontend] Réponse reçue du backend:", data);

      if (data.result) {
        showMessageModal("Mot de passe mis à jour avec succès.", "success");
        // Réinitialiser les champs après succès
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        showMessageModal(`Erreur : ${data.error}`);
      }
    } catch (error) {
      console.error(
        "❌ [Frontend] Erreur lors de la mise à jour du mot de passe:",
        error
      );
      showMessageModal("Une erreur est survenue lors de la mise à jour.");
    }
  };

  // Rendu de base sans contenu dynamique (pour éviter les erreurs d'hydratation)
  if (!isClient || !userData) {
    return (
      <>
        <Head>
          <title>Mon Profil | MonSavonVert</title>
          <meta
            name="description"
            content="Gérez votre compte et suivez vos commandes - MonSavonVert"
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
        <title>Mon Profil | MonSavonVert</title>
        <meta
          name="description"
          content="Gérez votre compte et suivez vos commandes - MonSavonVert"
        />
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      {/* Modal pour les messages */}
      {showModal && (
        <div className={styles.modalOverlay}>
          <div
            className={`${styles.modal} ${
              modalType === "success" ? styles.successModal : styles.errorModal
            }`}
          >
            <div className={styles.modalContent}>
              <div className={styles.modalIcon}>
                {modalType === "success" ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="32"
                    height="32"
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
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="32"
                    height="32"
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
                )}
              </div>
              <h3 className={styles.modalTitle}>
                {modalType === "success" ? "Succès" : "Attention"}
              </h3>
              <p className={styles.modalMessage}>{modalMessage}</p>
              <button
                className={styles.modalButton}
                onClick={() => setShowModal(false)}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal pour l'ajout/modification d'adresse */}
      {showAddressModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalContent}>
              <h3 className={styles.modalTitle}>
                {addressMode === "add"
                  ? "Ajouter une adresse"
                  : "Modifier l'adresse"}
              </h3>

              <div className={styles.addressForm}>
                <div className={styles.formGroup}>
                  <label htmlFor="street">Adresse*</label>
                  <input
                    type="text"
                    id="street"
                    value={currentAddress.street}
                    onChange={(e) =>
                      setCurrentAddress({
                        ...currentAddress,
                        street: e.target.value,
                      })
                    }
                    placeholder="Ex: 15 rue des Artisans"
                    required
                  />
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label htmlFor="postalCode">Code postal*</label>
                    <input
                      type="text"
                      id="postalCode"
                      value={currentAddress.postalCode}
                      onChange={(e) =>
                        setCurrentAddress({
                          ...currentAddress,
                          postalCode: e.target.value,
                        })
                      }
                      placeholder="Ex: 69001"
                      required
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="city">Ville*</label>
                    <input
                      type="text"
                      id="city"
                      value={currentAddress.city}
                      onChange={(e) =>
                        setCurrentAddress({
                          ...currentAddress,
                          city: e.target.value,
                        })
                      }
                      placeholder="Ex: Lyon"
                      required
                    />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="country">Pays</label>
                  <input
                    type="text"
                    id="country"
                    value={currentAddress.country}
                    onChange={(e) =>
                      setCurrentAddress({
                        ...currentAddress,
                        country: e.target.value,
                      })
                    }
                    placeholder="Ex: France"
                  />
                </div>

                <div className={styles.formCheckbox}>
                  <input
                    type="checkbox"
                    id="isDefault"
                    checked={currentAddress.isDefault}
                    onChange={(e) =>
                      setCurrentAddress({
                        ...currentAddress,
                        isDefault: e.target.checked,
                      })
                    }
                  />
                  <label htmlFor="isDefault">
                    Définir comme adresse par défaut
                  </label>
                </div>

                <div className={styles.modalActions}>
                  <button
                    className={styles.modalCancelButton}
                    onClick={() => setShowAddressModal(false)}
                  >
                    Annuler
                  </button>

                  <button
                    className={styles.modalButton}
                    onClick={handleSaveAddress}
                  >
                    {addressMode === "add" ? "Ajouter" : "Enregistrer"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* NOUVEAU: Modal pour les détails de la commande */}
      {showOrderModal && selectedOrder && (
        <div className={styles.modalOverlay}>
          <div className={styles.orderModal}>
            <div className={styles.orderModalHeader}>
              <h3>Détails de la commande #{selectedOrder.id}</h3>
              <button
                className={styles.closeModalButton}
                onClick={() => setShowOrderModal(false)}
              >
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
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            <div className={styles.orderModalContent}>
              <div className={styles.orderModalInfo}>
                <div className={styles.orderModalInfoItem}>
                  <span className={styles.orderModalLabel}>Date :</span>
                  <span className={styles.orderModalValue}>{selectedOrder.date}</span>
                </div>
                <div className={styles.orderModalInfoItem}>
                  <span className={styles.orderModalLabel}>Statut :</span>
                  <span className={`${styles.orderModalStatus} ${getStatusClass(selectedOrder.status)}`}>
                    {selectedOrder.statusLabel}
                  </span>
                </div>
                <div className={styles.orderModalInfoItem}>
                  <span className={styles.orderModalLabel}>Total :</span>
                  <span className={styles.orderModalValue}>{selectedOrder.total.toFixed(2)} €</span>
                </div>
              </div>

              <div className={styles.orderModalDivider}></div>

              <div className={styles.orderModalItems}>
                <h4>Articles commandés</h4>
                {selectedOrder.items && selectedOrder.items.length > 0 ? (
                  <div className={styles.orderModalItemsList}>
                    {selectedOrder.items.map((item, index) => (
                      <div key={index} className={styles.orderModalItem}>
                        <div className={styles.orderModalItemImage}>
                          {item.image ? (
                            <img src={item.image} alt={item.name} />
                          ) : (
                            <div className={styles.orderModalItemPlaceholder}>
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
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                                <polyline points="21 15 16 10 5 21"></polyline>
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className={styles.orderModalItemDetails}>
                          <h5 className={styles.orderModalItemName}>{item.name}</h5>
                          <div className={styles.orderModalItemSpecs}>
                            <span className={styles.orderModalItemQuantity}>Quantité: {item.quantity}</span>
                            <span className={styles.orderModalItemPrice}>
                              {item.price ? `${item.price.toFixed(2)} €` : "Prix non disponible"}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className={styles.orderModalEmptyMessage}>Aucun article trouvé pour cette commande.</p>
                )}
              </div>

              <div className={styles.orderModalDivider}></div>

              <div className={styles.orderModalSummary}>
                <div className={styles.orderModalSummaryItem}>
                  <span>Sous-total</span>
                  <span>{(selectedOrder.total - (selectedOrder.shippingCost || 0)).toFixed(2)} €</span>
                </div>
                <div className={styles.orderModalSummaryItem}>
                  <span>Frais de livraison</span>
                  <span>{selectedOrder.shippingCost ? `${selectedOrder.shippingCost.toFixed(2)} €` : "Gratuit"}</span>
                </div>
                <div className={styles.orderModalSummaryTotal}>
                  <span>Total</span>
                  <span>{selectedOrder.total.toFixed(2)} €</span>
                </div>
              </div>
            </div>

            <div className={styles.orderModalFooter}>
              <button
                className={styles.modalCancelButton}
                onClick={() => setShowOrderModal(false)}
              >
                Fermer
              </button>
              {selectedOrder.status === "pending" && (
                <button className={styles.modalActionButton}>
                  Suivre ma commande
                </button>
              )}
            </div>
          </div>
        </div>
      )}

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
              <h1 className={styles.pageTitle}>Mon Compte</h1>
              <div className={styles.pageBreadcrumb}>
                <Link href="/">Accueil</Link>
                <span className={styles.breadcrumbSeparator}>/</span>
                <span className={styles.breadcrumbCurrent}>Mon Compte</span>
              </div>
            </div>
          </section>

          {/* Section du profil */}
          <section className={styles.profileSection}>
            <div className={styles.profileContainer}>
              {/* Navigation du profil */}
              <div className={styles.profileSidebar}>
                <div className={styles.userInfo}>
                  <div className={styles.userAvatar}>
                    <span>
                      {userData.firstName.charAt(0)}
                      {userData.lastName.charAt(0)}
                    </span>
                  </div>
                  <div className={styles.userName}>
                    <h2>
                      {userData.firstName} {userData.lastName}
                    </h2>
                    <p>{userData.email}</p>
                  </div>
                </div>

                <nav className={styles.profileNav}>
                  <ul>
                    <li>
                      <button
                        className={`${styles.profileNavLink} ${
                          activeTab === "dashboard" ? styles.active : ""
                        }`}
                        onClick={() => setActiveTab("dashboard")}
                      >
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
                          <rect x="3" y="3" width="7" height="7"></rect>
                          <rect x="14" y="3" width="7" height="7"></rect>
                          <rect x="14" y="14" width="7" height="7"></rect>
                          <rect x="3" y="14" width="7" height="7"></rect>
                        </svg>
                        <span>Tableau de bord</span>
                      </button>
                    </li>
                    <li>
                      <button
                        className={`${styles.profileNavLink} ${
                          activeTab === "orders" ? styles.active : ""
                        }`}
                        onClick={() => setActiveTab("orders")}
                      >
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
                          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                          <line x1="3" y1="6" x2="21" y2="6"></line>
                          <path d="M16 10a4 4 0 0 1-8 0"></path>
                        </svg>
                        <span>Mes commandes</span>
                      </button>
                    </li>
                    <li>
                      <button
                        className={`${styles.profileNavLink} ${
                          activeTab === "wishlist" ? styles.active : ""
                        }`}
                        onClick={() => setActiveTab("wishlist")}
                      >
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
                          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                        </svg>
                        <span>Ma liste d'envies</span>
                      </button>
                    </li>
                    <li>
                      <button
                        className={`${styles.profileNavLink} ${
                          activeTab === "addresses" ? styles.active : ""
                        }`}
                        onClick={() => setActiveTab("addresses")}
                      >
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
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                          <circle cx="12" cy="10" r="3"></circle>
                        </svg>
                        <span>Mes adresses</span>
                      </button>
                    </li>
                    <li>
                      <button
                        className={`${styles.profileNavLink} ${
                          activeTab === "settings" ? styles.active : ""
                        }`}
                        onClick={() => setActiveTab("settings")}
                      >
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
                          <circle cx="12" cy="12" r="3"></circle>
                          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                        </svg>
                        <span>Paramètres</span>
                      </button>
                    </li>
                  </ul>

                  <button
                    className={styles.logoutButton}
                    onClick={handleLogout}
                  >
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
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                      <polyline points="16 17 21 12 16 7"></polyline>
                      <line x1="21" y1="12" x2="9" y2="12"></line>
                    </svg>
                    <span>Se déconnecter</span>
                  </button>
                </nav>
              </div>

              {/* Contenu principal du profil */}
              <div className={styles.profileContent}>
                {activeTab === "dashboard" && (
                  <div className={styles.dashboardTab}>
                    {/* Alerte de profil incomplet */}
                    {!isProfileComplete() && (
                      <div className={styles.profileAlert}>
                        <div className={styles.alertIcon}>
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
                            <line x1="12" y1="8" x2="12" y2="12"></line>
                            <line x1="12" y1="16" x2="12.01" y2="16"></line>
                          </svg>
                        </div>
                        <div className={styles.alertContent}>
                          <h3>Informations manquantes</h3>
                          <p>
                            Pour faciliter vos futures commandes, veuillez
                            compléter votre profil avec :
                          </p>
                          <ul>
                            {addresses.length === 0 && (
                              <li>
                                <span>Une adresse de livraison</span>
                                <button
                                  className={styles.alertActionButton}
                                  onClick={() => {
                                    setActiveTab("addresses");
                                    handleAddAddress();
                                  }}
                                >
                                  Ajouter
                                </button>
                              </li>
                            )}
                            {!userData.phone && (
                              <li>
                                <span>Un numéro de téléphone</span>
                                <button
                                  className={styles.alertActionButton}
                                  onClick={() => setActiveTab("settings")}
                                >
                                  Ajouter
                                </button>
                              </li>
                            )}
                          </ul>
                        </div>
                      </div>
                    )}

                    <div className={styles.welcomeMessage}>
                      <h2>Bonjour, {userData.firstName} !</h2>
                      <p>
                        Bienvenue sur votre espace personnel. Ici, vous pouvez
                        gérer vos commandes, consulter votre liste d'envies et
                        modifier vos informations personnelles.
                      </p>
                    </div>

                    <div className={styles.dashboardGrid}>
                      <div className={styles.dashboardCard}>
                        <div className={styles.cardIcon}>
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
                            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                            <line x1="3" y1="6" x2="21" y2="6"></line>
                            <path d="M16 10a4 4 0 0 1-8 0"></path>
                          </svg>
                        </div>
                        <h3>Commandes</h3>
                        <p>{userOrders.length} commandes passées</p>
                        <button
                          className={styles.cardButton}
                          onClick={() => setActiveTab("orders")}
                        >
                          Voir mes commandes
                        </button>
                      </div>

                      <div className={styles.dashboardCard}>
                        <div className={styles.cardIcon}>
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
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                          </svg>
                        </div>
                        <h3>Liste d'envies</h3>
                        <p>{wishlist.length} produits favoris</p>
                        <button
                          className={styles.cardButton}
                          onClick={() => setActiveTab("wishlist")}
                        >
                          Voir ma liste d'envies
                        </button>
                      </div>

                      <div className={styles.dashboardCard}>
                        <div className={styles.cardIcon}>
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
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                            <circle cx="12" cy="10" r="3"></circle>
                          </svg>
                        </div>
                        <h3>Adresses</h3>
                        <p>{addresses.length} adresses enregistrées</p>
                        <button
                          className={styles.cardButton}
                          onClick={() => setActiveTab("addresses")}
                        >
                          Gérer mes adresses
                        </button>
                      </div>

                      <div className={styles.dashboardCard}>
                        <div className={styles.cardIcon}>
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
                            <circle cx="12" cy="12" r="3"></circle>
                            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                          </svg>
                        </div>
                        <h3>Paramètres</h3>
                        <p>Gérer vos informations personnelles</p>
                        <button
                          className={styles.cardButton}
                          onClick={() => setActiveTab("settings")}
                        >
                          Modifier mes paramètres
                        </button>
                      </div>
                    </div>

                    <div className={styles.recentOrdersSection}>
                      <h3>Commandes récentes</h3>
                      {userOrders.length > 0 ? (
                        <div className={styles.recentOrdersTable}>
                          <div className={styles.orderTableHeader}>
                            <div className={styles.orderIdColumn}>Commande</div>
                            <div className={styles.orderDateColumn}>Date</div>
                            <div className={styles.orderStatusColumn}>
                              Statut
                            </div>
                            <div className={styles.orderTotalColumn}>Total</div>
                            <div className={styles.orderActionColumn}>
                              Action
                            </div>
                          </div>
                          {userOrders.slice(0, 2).map((order) => (
                            <div
                              key={order.id}
                              className={styles.orderTableRow}
                            >
                              <div className={styles.orderIdColumn}>
                                {order.id}
                              </div>
                              <div className={styles.orderDateColumn}>
                                {order.date}
                              </div>
                              <div className={styles.orderStatusColumn}>
                                <span
                                  className={`${
                                    styles.orderStatus
                                  } ${getStatusClass(order.status)}`}
                                >
                                  {order.statusLabel}
                                </span>
                              </div>
                              <div className={styles.orderTotalColumn}>
                                {order.total.toFixed(2)} €
                              </div>
                              <div className={styles.orderActionColumn}>
                                {/* MODIFIÉ: Bouton qui ouvre le modal au lieu de rediriger */}
                                <button
                                  onClick={() => handleViewOrderDetails(order)}
                                  className={styles.viewOrderButton}
                                >
                                  Voir
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className={styles.emptyState}>
                          Vous n'avez pas encore passé de commande.
                        </p>
                      )}
                      {userOrders.length > 2 && (
                        <button
                          className={styles.viewAllButton}
                          onClick={() => setActiveTab("orders")}
                        >
                          Voir toutes mes commandes
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === "orders" && (
                  <div className={styles.ordersTab}>
                    <div className={styles.tabHeader}>
                      <h2>Mes commandes</h2>
                      <p>
                        Consultez l'historique et le statut de vos commandes
                      </p>
                    </div>

                    {userOrders.length > 0 ? (
                      <div className={styles.ordersTable}>
                        <div className={styles.orderTableHeader}>
                          <div className={styles.orderIdColumn}>Commande</div>
                          <div className={styles.orderDateColumn}>Date</div>
                          <div className={styles.orderStatusColumn}>Statut</div>
                          <div className={styles.orderTotalColumn}>Total</div>
                          <div className={styles.orderActionColumn}>Action</div>
                        </div>
                        {userOrders.map((order) => (
                          <div key={order.id} className={styles.orderTableRow}>
                            <div className={styles.orderIdColumn}>
                              {order.id}
                            </div>
                            <div className={styles.orderDateColumn}>
                              {order.date}
                            </div>
                            <div className={styles.orderStatusColumn}>
                              <span
                                className={`${
                                  styles.orderStatus
                                } ${getStatusClass(order.status)}`}
                              >
                                {order.statusLabel}
                              </span>
                            </div>
                            <div className={styles.orderTotalColumn}>
                              {order.total.toFixed(2)} €
                            </div>
                            <div className={styles.orderActionColumn}>
                              {/* MODIFIÉ: Bouton qui ouvre le modal au lieu de rediriger */}
                              <button
                                onClick={() => handleViewOrderDetails(order)}
                                className={styles.viewOrderButton}
                              >
                                Voir
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className={styles.emptyState}>
                        <div className={styles.emptyStateIcon}>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="48"
                            height="48"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                            <line x1="3" y1="6" x2="21" y2="6"></line>
                            <path d="M16 10a4 4 0 0 1-8 0"></path>
                          </svg>
                        </div>
                        <h3>Aucune commande</h3>
                        <p>Vous n'avez pas encore passé de commande.</p>
                        <Link href="/store" className={styles.emptyStateButton}>
                            Découvrir nos produits
                        </Link>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "wishlist" && (
                  <div className={styles.wishlistTab}>
                    <div className={styles.tabHeader}>
                      <h2>Ma liste d'envies</h2>
                      <p>Retrouvez tous vos produits favoris</p>
                    </div>

                    {wishlist.length > 0 ? (
                      <div className={styles.wishlistGrid}>
                        {wishlist.map((product) => (
                          <div key={product.id} className={styles.wishlistItem}>
                            <button className={styles.removeFromWishlist}>
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
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                              </svg>
                            </button>
                            <div className={styles.wishlistImageContainer}>
                              <img
                                src={product.image}
                                alt={product.name}
                                className={styles.wishlistImage}
                              />
                            </div>
                            <div className={styles.wishlistContent}>
                              <h3 className={styles.wishlistProductName}>
                                {product.name}
                              </h3>
                              <p className={styles.wishlistProductPrice}>
                                {product.price.toFixed(2)} €
                              </p>
                              <div className={styles.wishlistActions}>
                                <button
                                  className={styles.addToCartButton}
                                  disabled={!product.stock}
                                >
                                  {product.stock
                                    ? "Ajouter au panier"
                                    : "Indisponible"}
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className={styles.emptyState}>
                        <div className={styles.emptyStateIcon}>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="48"
                            height="48"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                          </svg>
                        </div>
                        <h3>Liste d'envies vide</h3>
                        <p>
                          Vous n'avez pas encore ajouté de produits à votre
                          liste d'envies.
                        </p>
                        <Link href="/store" className={styles.emptyStateButton}>
                            Découvrir nos produits
                        </Link>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "addresses" && (
                  <div className={styles.addressesTab}>
                    <div className={styles.tabHeader}>
                      <h2>Mes adresses</h2>
                      <p>Gérez vos adresses de livraison et de facturation</p>
                      {/* Bouton Ajouter en haut si on a déjà des adresses */}
                      {addresses.length > 0 && (
                        <button
                          className={styles.addAddressButton}
                          onClick={handleAddAddress}
                        >
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
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                          </svg>
                          Ajouter une adresse
                        </button>
                      )}
                    </div>

                    {addresses.length > 0 ? (
                      <div className={styles.addressesGrid}>
                        {addresses.map((address, index) => (
                          <div
                            key={index}
                            className={`${styles.addressCard} ${
                              address.isDefault ? styles.defaultAddress : ""
                            }`}
                          >
                            {address.isDefault && (
                              <div className={styles.defaultAddressBadge}>
                                Adresse par défaut
                              </div>
                            )}
                            <div className={styles.addressCardContent}>
                              <p>{address.street}</p>
                              <p>
                                {address.postalCode}, {address.city}
                              </p>
                              <p>{address.country}</p>
                            </div>
                            <div className={styles.addressCardActions}>
                              <button
                                className={styles.editAddressButton}
                                onClick={() => handleEditAddress(index)}
                              >
                                Modifier
                              </button>
                              {!address.isDefault && addresses.length > 1 && (
                                <button
                                  className={styles.deleteAddressButton}
                                  onClick={() => {
                                    const updatedAddresses = addresses.filter(
                                      (_, i) => i !== index
                                    );
                                    setAddresses(updatedAddresses);
                                    handleUpdateUser({
                                      addresses: updatedAddresses,
                                    });
                                  }}
                                >
                                  Supprimer
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className={styles.emptyState}>
                        <div className={styles.emptyStateIcon}>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="48"
                            height="48"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                            <circle cx="12" cy="10" r="3"></circle>
                          </svg>
                        </div>
                        <h3>Aucune adresse</h3>
                        <p>Vous n'avez pas encore ajouté d'adresse.</p>
                        <button
                          className={styles.emptyStateButton}
                          onClick={handleAddAddress}
                        >
                          Ajouter une adresse
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "settings" && (
                  <div className={styles.settingsTab}>
                    <div className={styles.tabHeader}>
                      <h2>Paramètres du compte</h2>
                      <p>
                        Gérez vos informations personnelles et vos préférences
                      </p>
                    </div>

                    <div className={styles.settingsForm}>
                      <div className={styles.settingsSection}>
                        <h3>Informations personnelles</h3>
                        <div className={styles.formRow}>
                          <div className={styles.formGroup}>
                            <label htmlFor="firstName">Prénom</label>
                            <input
                              type="text"
                              id="firstName"
                              value={userData.firstName || ""}
                              onChange={(e) =>
                                setUserData({
                                  ...userData,
                                  firstName: e.target.value,
                                })
                              }
                            />
                          </div>
                          <div className={styles.formGroup}>
                            <label htmlFor="lastName">Nom</label>
                            <input
                              type="text"
                              id="lastName"
                              value={userData.lastName || ""}
                              onChange={(e) =>
                                setUserData({
                                  ...userData,
                                  lastName: e.target.value,
                                })
                              }
                            />
                          </div>
                        </div>
                        <div className={styles.formRow}>
                          <div className={styles.formGroup}>
                            <label htmlFor="email">Email</label>
                            <input
                              type="email"
                              id="email"
                              value={userData.email || ""}
                              onChange={(e) =>
                                setUserData({
                                  ...userData,
                                  email: e.target.value,
                                })
                              }
                            />
                          </div>
                          <div className={styles.formGroup}>
                            <label htmlFor="phone">Téléphone</label>
                            <input
                              type="tel"
                              id="phone"
                              value={userData.phone || ""}
                              onChange={(e) =>
                                setUserData({
                                  ...userData,
                                  phone: e.target.value,
                                })
                              }
                            />
                          </div>
                        </div>
                        <button
                          className={styles.saveSettingsButton}
                          onClick={() => handleUpdateUser(userData)}
                        >
                          Enregistrer les modifications
                        </button>
                      </div>

                      {/* DÉBUT DE LA SECTION MODIFIÉE - CHANGEMENT DE MOT DE PASSE */}
                      <div className={styles.settingsSection}>
                        <h3>Changer de mot de passe</h3>

                        <div className={styles.formGroup}>
                          <label htmlFor="currentPassword">
                            Mot de passe actuel
                          </label>
                          <div className={styles.passwordInputWrapper}>
                            <input
                              type={showCurrentPassword ? "text" : "password"}
                              id="currentPassword"
                              placeholder="Votre mot de passe actuel"
                              value={currentPassword}
                              onChange={(e) =>
                                setCurrentPassword(e.target.value)
                              }
                            />
                            <button
                              type="button"
                              className={styles.togglePasswordButton}
                              onClick={() =>
                                setShowCurrentPassword(!showCurrentPassword)
                              }
                            >
                              {showCurrentPassword ? "🙈" : "👁️"}
                            </button>
                          </div>
                        </div>

                        <div className={styles.formRow}>
                          <div className={styles.formGroup}>
                            <label htmlFor="newPassword">
                              Nouveau mot de passe
                            </label>
                            <div className={styles.passwordInputWrapper}>
                              <input
                                type={showNewPassword ? "text" : "password"}
                                id="newPassword"
                                placeholder="Votre nouveau mot de passe"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                              />
                              <button
                                type="button"
                                className={styles.togglePasswordButton}
                                onClick={() =>
                                  setShowNewPassword(!showNewPassword)
                                }
                              >
                                {showNewPassword ? "🙈" : "👁️"}
                              </button>
                            </div>
                          </div>
                          <div className={styles.formGroup}>
                            <label htmlFor="confirmPassword">
                              Confirmer le mot de passe
                            </label>
                            <div className={styles.passwordInputWrapper}>
                              <input
                                type={showConfirmPassword ? "text" : "password"}
                                id="confirmPassword"
                                placeholder="Confirmez votre nouveau mot de passe"
                                value={confirmPassword}
                                onChange={(e) =>
                                  setConfirmPassword(e.target.value)
                                }
                              />
                              <button
                                type="button"
                                className={styles.togglePasswordButton}
                                onClick={() =>
                                  setShowConfirmPassword(!showConfirmPassword)
                                }
                              >
                                {showConfirmPassword ? "🙈" : "👁️"}
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Section des critères de validation */}
                        <div className={styles.passwordCriteria}>
                          <h4>Votre mot de passe doit contenir :</h4>
                          <ul>
                            <li
                              className={
                                criteria.minLength
                                  ? styles.criteriaValid
                                  : styles.criteriaInvalid
                              }
                            >
                              6 caractères minimum
                            </li>
                            <li
                              className={
                                criteria.hasUpperCase
                                  ? styles.criteriaValid
                                  : styles.criteriaInvalid
                              }
                            >
                              1 lettre majuscule
                            </li>
                            <li
                              className={
                                criteria.hasNumber
                                  ? styles.criteriaValid
                                  : styles.criteriaInvalid
                              }
                            >
                              1 chiffre
                            </li>
                            <li
                              className={
                                criteria.hasSpecialChar
                                  ? styles.criteriaValid
                                  : styles.criteriaInvalid
                              }
                            >
                              1 caractère spécial
                            </li>
                          </ul>
                        </div>

                        <button
                          className={styles.savePasswordButton}
                          onClick={handleChangePassword}
                        >
                          Mettre à jour le mot de passe
                        </button>
                      </div>
                      {/* FIN DE LA SECTION MODIFIÉE */}

                      <div className={styles.settingsSection}>
                        <h3>Préférences de communication</h3>

                        <div className={styles.preferenceOption}>
                          <input
                            type="checkbox"
                            id="newsletterPreference"
                            checked={isSubscribedToNewsletter}
                            onChange={handleNewsletterPreferenceChange}
                          />
                          <label htmlFor="newsletterPreference">
                            <span>Recevoir la newsletter</span>
                            <p>
                              Recevez nos actualités, offres exclusives et
                              conseils sur nos produits
                            </p>
                          </label>
                        </div>

                        <button
                          className={styles.savePreferencesButton}
                          onClick={handleSavePreferences}
                        >
                          Enregistrer les préférences
                        </button>
                      </div>
                    </div>
                  </div>
                )}
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
                  passion en France depuis 2018.
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
                <Link
                  href="/boutique/accessoires"
                  className={styles.footerLink}
                >
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
                <Link
                  href="/politique-de-confidentialite"
                  className={styles.footerSmallLink}
                >
                  Politique de confidentialité
                </Link>
                <Link
                  href="/mentions-legales"
                  className={styles.footerSmallLink}
                >
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