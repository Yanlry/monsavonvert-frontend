"use client";

import { useState, useEffect, useContext } from "react"; // Ajout de useContext
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import styles from "../styles/checkout.module.css";
import { loadStripe } from "@stripe/stripe-js";
import Header from "../components/Header";
import { UserContext } from "../context/UserContext"; // Ajout du UserContext

// Initialisez Stripe avec votre clé publique
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
);

// Expressions régulières pour la validation
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const PHONE_REGEX = /^(\+\d{1,3}[- ]?)?\d{9,15}$/; // Format international flexible
const POSTAL_CODE_REGEX = /^\d{5}$/; // Pour la France (5 chiffres)
const ADDRESS_REGEX = /^\d+\s+\S+/; // Commence par un numéro suivi d'un espace et du nom de rue
const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function Checkout() {
  // État pour le contexte utilisateur global
  const { setUser: setContextUser } = useContext(UserContext);

  // État pour détecter si nous sommes côté client
  const [isClient, setIsClient] = useState(false);
  const [user, setUser] = useState(null);
  // État pour l'animation du header au scroll
  const [scrolled, setScrolled] = useState(false);

  // États pour le formulaire
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    country: "France",
    termsAccepted: false,
    password: "",
  });

  // États pour les erreurs de validation
  const [formErrors, setFormErrors] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    country: "",
    password: "",
  });

  // Nouvel état pour gérer le mode de formulaire (inscription ou connexion)
  const [formMode, setFormMode] = useState("register"); // 'register' ou 'login'

  // Nouvel état pour les informations de connexion
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  // État pour "Se souvenir de moi"
  const [rememberMe, setRememberMe] = useState(false);

  // Nouvel état pour les erreurs de connexion
  const [loginError, setLoginError] = useState("");

  // État pour les étapes du processus de commande
  const [currentStep, setCurrentStep] = useState(1);

  // État pour les articles du panier
  const [cartItems, setCartItems] = useState([]);
  const [cartCount, setCartCount] = useState(0);

  // État pour la méthode de livraison
  const [shippingMethod, setShippingMethod] = useState("standard");

  // État pour vérifier si le formulaire est valide
  const [isFormValid, setIsFormValid] = useState(false);

  // État pour afficher un message de chargement pendant la redirection vers Stripe
  const [isLoading, setIsLoading] = useState(false);

  // États pour le modal
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalTitle, setModalTitle] = useState("");

  // NOUVEAU: État pour gérer le formulaire de complément d'information
  const [showAddressPhoneForm, setShowAddressPhoneForm] = useState(false);
  const [addressPhoneFormValid, setAddressPhoneFormValid] = useState(false);
  const [addressPhoneData, setAddressPhoneData] = useState({
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    country: "France",
  });
  const [addressPhoneErrors, setAddressPhoneErrors] = useState({
    phone: "",
    address: "",
    city: "",
    postalCode: "",
  });

  // Router pour la navigation
  const router = useRouter();

  // Effets au chargement
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

    // Récupérer les articles du panier depuis le localStorage
    try {
      const storedCart = JSON.parse(localStorage.getItem("cart")) || [];
      setCartItems(storedCart);
      const totalItems = storedCart.reduce(
        (sum, item) => sum + item.quantity,
        0
      );
      setCartCount(totalItems);
      console.log("Panier chargé avec succès:", storedCart);

      // Rediriger vers la page panier si le panier est vide
      if (storedCart.length === 0) {
        console.log("Panier vide, redirection vers la page panier");
        router.push("/cart");
      }
    } catch (error) {
      console.error("Erreur lors du chargement du panier:", error);
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
  }, [router]);
 
// Fonction pour charger les informations utilisateur directement depuis l'API
const fetchUserData = async (userId, token) => {
  try {
    console.log(
      `Récupération des données utilisateur depuis l'API pour l'ID: ${userId}`
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
    console.log("Réponse API utilisateur complète:", data);

    if (data.result && data.user) {
      // Formater l'utilisateur avec les données d'adresse et de téléphone
      const userData = {
        ...data.user,
        // Ajouter des champs formatés pour l'affichage
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
      };

      console.log("Données utilisateur formatées depuis API:", userData);

      // Mettre à jour l'état utilisateur
      setUser(userData);

      // Mettre à jour le localStorage avec les données fraîches
      localStorage.setItem("user", JSON.stringify(userData));

      // Préremplir le formulaire
      setFormData((prevData) => ({
        ...prevData,
        firstName: userData.firstName || "",
        lastName: userData.lastName || "",
        email: userData.email || "",
        phone: userData.phone || "",
        address: userData.address || "",
        city: userData.city || "",
        postalCode: userData.postalCode || "",
        country: userData.country || "France",
      }));

      // NOUVEAU: Préremplir le formulaire d'adresse et téléphone
      setAddressPhoneData({
        phone: userData.phone || "",
        address: userData.address || "",
        city: userData.city || "",
        postalCode: userData.postalCode || "",
        country: userData.country || "France",
      });

      console.log("Formulaire prérempli avec les données fraîches");
      
      // IMPORTANT: RETOURNER les données utilisateur
      return userData;  // Cette ligne manquait!
    }
    // Si nous n'avons pas pu obtenir les données utilisateur, retourner null
    return null;  // Cette ligne manquait!
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des données utilisateur:",
      error
    );
    // En cas d'erreur, retourner null
    return null;  // Cette ligne manquait!
  }
};

  useEffect(() => {
    // Vérifiez si un utilisateur est connecté en récupérant les données du localStorage ou sessionStorage
    const storedToken =
      localStorage.getItem("token") || sessionStorage.getItem("token");
    const storedUserId =
      localStorage.getItem("userId") || sessionStorage.getItem("userId");
    const storedUser =
      localStorage.getItem("user") || sessionStorage.getItem("user");

    if (storedToken && storedUserId) {
      console.log(
        "Token et UserID trouvés, récupération des données depuis l'API..."
      );
      // Récupérer les données fraîches depuis l'API
      fetchUserData(storedUserId, storedToken);
    } else if (storedUser) {
      try {
        // Fallback sur le localStorage si pas de token ou userId
        const parsedUser = JSON.parse(storedUser);
        console.log(
          "Données utilisateur chargées depuis localStorage:",
          parsedUser
        );
        setUser(parsedUser);

        // Préremplir le formulaire
        setFormData((prevData) => ({
          ...prevData,
          firstName: parsedUser.firstName || "",
          lastName: parsedUser.lastName || "",
          email: parsedUser.email || "",
          phone: parsedUser.phone || "",
          address: parsedUser.address || "",
          city: parsedUser.city || "",
          postalCode: parsedUser.postalCode || "",
          country: parsedUser.country || "France",
        }));

        // NOUVEAU: Préremplir le formulaire d'adresse et téléphone
        setAddressPhoneData({
          phone: parsedUser.phone || "",
          address: parsedUser.address || "",
          city: parsedUser.city || "",
          postalCode: parsedUser.postalCode || "",
          country: parsedUser.country || "France",
        });
      } catch (error) {
        console.error(
          "Erreur lors du traitement des données utilisateur:",
          error
        );
      }
    }
  }, []); // S'exécute une seule fois au montage

  // NOUVEAU: Effet pour vérifier la validité du formulaire d'adresse et téléphone
  useEffect(() => {
    const validateAddressPhoneFields = () => {
      const errors = {};

      // Validation téléphone
      if (!addressPhoneData.phone.trim()) {
        errors.phone = "Le téléphone est requis";
      } else if (!PHONE_REGEX.test(addressPhoneData.phone)) {
        errors.phone = "Format de téléphone invalide";
      }

      // Validation adresse
      if (!addressPhoneData.address.trim()) {
        errors.address = "L'adresse est requise";
      } else if (!ADDRESS_REGEX.test(addressPhoneData.address)) {
        errors.address = "Format: Numéro + nom de la rue";
      }

      // Validation ville
      if (!addressPhoneData.city.trim()) {
        errors.city = "La ville est requise";
      }

      // Validation code postal
      if (!addressPhoneData.postalCode.trim()) {
        errors.postalCode = "Le code postal est requis";
      } else if (
        !POSTAL_CODE_REGEX.test(addressPhoneData.postalCode) &&
        addressPhoneData.country === "France"
      ) {
        errors.postalCode = "Le code postal doit contenir 5 chiffres";
      }

      setAddressPhoneErrors(errors);

      // Vérifier si le formulaire est valide (aucune erreur et tous les champs requis remplis)
      const isValid =
        Object.keys(errors).length === 0 &&
        addressPhoneData.phone.trim() &&
        addressPhoneData.address.trim() &&
        addressPhoneData.city.trim() &&
        addressPhoneData.postalCode.trim();

      setAddressPhoneFormValid(isValid);
      console.log("Validation du formulaire adresse/téléphone:", isValid);
      return isValid;
    };

    validateAddressPhoneFields();
  }, [addressPhoneData]);

  // Effet pour vérifier si le formulaire est valide
  useEffect(() => {
    // Si nous sommes en mode connexion, vérifier uniquement les champs de connexion
    if (formMode === "login") {
      const isLoginValid =
        loginData.email.trim() &&
        loginData.password.trim() &&
        EMAIL_REGEX.test(loginData.email);
      setIsFormValid(isLoginValid);
      return;
    }

    // Fonction de validation des champs pour le mode inscription
    const validateFields = () => {
      const errors = {};

      // Validation prénom
      if (!formData.firstName.trim()) {
        errors.firstName = "Le prénom est requis";
      }

      // Validation nom
      if (!formData.lastName.trim()) {
        errors.lastName = "Le nom est requis";
      }

      // Validation email
      if (!formData.email.trim()) {
        errors.email = "L'email est requis";
      } else if (!EMAIL_REGEX.test(formData.email)) {
        errors.email = "Format d'email invalide";
      }

      // Validation téléphone
      if (!formData.phone.trim()) {
        errors.phone = "Le téléphone est requis";
      } else if (!PHONE_REGEX.test(formData.phone)) {
        errors.phone = "Format de téléphone invalide";
      }

      // Validation adresse
      if (!formData.address.trim()) {
        errors.address = "L'adresse est requise";
      } else if (!ADDRESS_REGEX.test(formData.address)) {
        errors.address = "Format: Numéro + nom de la rue";
      }

      // Validation ville
      if (!formData.city.trim()) {
        errors.city = "La ville est requise";
      }

      // Validation code postal
      if (!formData.postalCode.trim()) {
        errors.postalCode = "Le code postal est requis";
      } else if (
        !POSTAL_CODE_REGEX.test(formData.postalCode) &&
        formData.country === "France"
      ) {
        errors.postalCode = "Le code postal doit contenir 5 chiffres";
      }

      // Validation mot de passe (au moins 6 caractères)
      if (!formData.password.trim()) {
        errors.password = "Le mot de passe est requis";
      } else if (formData.password.length < 6) {
        errors.password = "Le mot de passe doit contenir au moins 6 caractères";
      }

      // Mise à jour des erreurs
      setFormErrors(errors);

      // Vérification que tous les champs obligatoires sont remplis
      const allFieldsFilled =
        formData.firstName.trim() &&
        formData.lastName.trim() &&
        formData.email.trim() &&
        formData.phone.trim() &&
        formData.address.trim() &&
        formData.city.trim() &&
        formData.postalCode.trim() &&
        formData.password.trim();

      // Vérification qu'aucune erreur de format n'est présente
      const noFormatErrors = Object.keys(errors).length === 0;

      // Retourne vrai si tous les champs sont remplis, sans erreur de format, et les termes acceptés
      return allFieldsFilled && noFormatErrors && formData.termsAccepted;
    };

    // Vérification de la validité du formulaire
    const isValid = validateFields();
    setIsFormValid(isValid);
    console.log("Validation du formulaire:", isValid);
  }, [formData, formMode, loginData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Nettoyage des données utilisateur pour éviter les injections XSS
    const sanitizedValue = value.replace(
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      ""
    );

    setFormData((prevData) => ({
      ...prevData,
      [name]: sanitizedValue,
    }));
    console.log(`Champ ${name} mis à jour avec la valeur: ${sanitizedValue}`);
  };

  // NOUVEAU: Gestionnaire pour les champs du formulaire d'adresse et téléphone
  const handleAddressPhoneChange = (e) => {
    const { name, value } = e.target;

    // Nettoyage des données utilisateur pour éviter les injections XSS
    const sanitizedValue = value.replace(
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      ""
    );

    setAddressPhoneData((prevData) => ({
      ...prevData,
      [name]: sanitizedValue,
    }));
    console.log(
      `Champ complémentaire ${name} mis à jour avec la valeur: ${sanitizedValue}`
    );
  };

  // Gestionnaire pour les champs du formulaire de connexion
  const handleLoginInputChange = (e) => {
    const { name, value } = e.target;

    // Nettoyage des données utilisateur pour éviter les injections XSS
    const sanitizedValue = value.replace(
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      ""
    );

    setLoginData((prevData) => ({
      ...prevData,
      [name]: sanitizedValue,
    }));

    // Réinitialisation de l'erreur de connexion lors de la modification des champs
    if (loginError) {
      setLoginError("");
    }
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;

    if (name === "rememberMe") {
      setRememberMe(checked);
    } else {
      setFormData((prevData) => ({
        ...prevData,
        [name]: checked,
      }));
    }
    console.log(`Champ ${name} mis à jour avec la valeur: ${checked}`);
  };

  // Gestionnaire de changement de méthode de livraison
  const handleShippingChange = (method) => {
    setShippingMethod(method);
    console.log("Méthode de livraison sélectionnée:", method);
  };

  // Fonction pour changer le mode du formulaire (inscription ou connexion)
  const toggleFormMode = (mode) => {
    setFormMode(mode);
    // Réinitialiser les erreurs lors du changement de mode
    setFormErrors({});
    setLoginError("");
  };

  // NOUVEAU: Fonction pour mettre à jour les informations de l'utilisateur
  const updateUserData = async () => {
    try {
      setIsLoading(true);

      // Récupérer l'ID et le token de l'utilisateur
      const userId = user._id;
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");

      if (!userId || !token) {
        throw new Error("Identifiants utilisateur manquants");
      }

      console.log(
        `Mise à jour des informations utilisateur pour l'ID: ${userId}`
      );

      // Préparer les données à envoyer à l'API
      const updatedData = {
        phone: addressPhoneData.phone,
      };

      // Si l'utilisateur a une adresse dans le tableau addresses
      if (user.addresses && user.addresses.length > 0) {
        // Mettre à jour l'adresse existante
        const updatedAddresses = [...user.addresses];
        updatedAddresses[0] = {
          ...updatedAddresses[0],
          street: addressPhoneData.address,
          city: addressPhoneData.city,
          postalCode: addressPhoneData.postalCode,
          country: addressPhoneData.country,
          isDefault: true,
        };
        updatedData.addresses = updatedAddresses;
      } else {
        // Créer une nouvelle adresse
        updatedData.addresses = [
          {
            street: addressPhoneData.address,
            city: addressPhoneData.city,
            postalCode: addressPhoneData.postalCode,
            country: addressPhoneData.country,
            isDefault: true,
          },
        ];
      }

      console.log("Données à envoyer à l'API:", updatedData);

      // Appel à l'API pour mettre à jour l'utilisateur
      const response = await fetch(`${API_URL}/users/update/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Erreur lors de la mise à jour des informations"
        );
      }

      console.log("Réponse de l'API après mise à jour:", data);

      // Mettre à jour les données utilisateur avec les nouvelles informations
      await fetchUserData(userId, token);

      // Masquer le formulaire d'adresse et téléphone
      setShowAddressPhoneForm(false);

      // Afficher un message de succès
      setModalTitle("Informations mises à jour");
      setModalMessage("Vos informations ont été mises à jour avec succès.");
      setShowModal(true);

      // Passer à l'étape suivante
      setCurrentStep(3);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      console.error(
        "Erreur lors de la mise à jour des informations utilisateur:",
        error
      );
      setModalTitle("Erreur");
      setModalMessage(
        error.message ||
          "Une erreur est survenue lors de la mise à jour de vos informations."
      );
      setShowModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction pour tenter la connexion avec les identifiants
 // Fonction pour tenter la connexion avec les identifiants
const handleLogin = async () => {
  // Vérification préliminaire des champs
  if (!loginData.email || !loginData.password) {
    setLoginError("Veuillez remplir tous les champs");
    return;
  }

  // Vérifier le format de l'email
  if (!EMAIL_REGEX.test(loginData.email)) {
    setLoginError("Format d'email invalide");
    return;
  }

  try {
    setIsLoading(true);
    console.log("Tentative de connexion...");

    // Appel à l'API pour la connexion - utilise /users/signin comme dans login.js
    const response = await fetch(`${API_URL}/users/signin`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: loginData.email,
        password: loginData.password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Identifiants incorrects");
    }

    // Connexion réussie
    console.log("Connexion réussie:", data);

    // Stocker les infos de base utilisateur
    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem("token", data.token);
    storage.setItem("userId", data.userId);
    storage.setItem("firstName", data.firstName);

    // Récupérer immédiatement les informations complètes de l'utilisateur
    console.log("Récupération des données complètes depuis l'API...");
    const userData = await fetchUserData(data.userId, data.token);

    if (userData) {
      // Stocker l'utilisateur complet (crucial pour la navigation)
      storage.setItem("user", JSON.stringify(userData));
      
      // Mettre à jour le contexte utilisateur global avec les données COMPLÈTES
      setContextUser(userData);
      
      // Mettre à jour également l'état local user
      setUser(userData);
      
      console.log("Profil utilisateur complet stocké:", userData);
    } else {
      // Même si on n'a pas pu récupérer les données complètes, on utilise un objet de base
      const basicUserData = {
        _id: data.userId,
        userId: data.userId,
        token: data.token,
        firstName: data.firstName,
        lastName: data.lastName || "",
        email: loginData.email,
        role: data.role || "user"
      };
      
      // Stocker l'utilisateur de base
      storage.setItem("user", JSON.stringify(basicUserData));
      setContextUser(basicUserData);
      setUser(basicUserData);
      
      console.log("Profil utilisateur basique stocké (données complètes non disponibles)");
    }

    // Afficher un message de succès
    setModalTitle("Connexion réussie");
    setModalMessage(
      "Vous êtes maintenant connecté. Vous pouvez continuer votre commande."
    );
    setShowModal(true);

    // Passer à l'étape suivante
    setCurrentStep(currentStep + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  } catch (error) {
    console.error("Erreur de connexion:", error);
    setLoginError(error.message || "Identifiants incorrects");
  } finally {
    setIsLoading(false);
  }
};

  // Récupération du prix total du panier
  const getTotalPrice = () => {
    return cartItems
      .reduce((total, item) => total + item.price * item.quantity, 0)
      .toFixed(2);
  };

  // Calcul des frais de livraison
  const getShippingCost = () => {
    // Vérification si le panier atteint le seuil de 29€ pour la livraison standard gratuite
    const cartTotal = parseFloat(getTotalPrice());

    switch (shippingMethod) {
      case "express":
        return 9.95;
      case "pickup":
        return 0;
      default: // standard
        // Livraison standard gratuite si le panier est >= 29€
        return cartTotal >= 29 ? 0 : 4.95;
    }
  };

  // Calcul du total final
  const getFinalTotal = () => {
    return (parseFloat(getTotalPrice()) + getShippingCost()).toFixed(2);
  };


// CORRIGÉ: Fonction pour créer/enregistrer un compte avec récupération des données complètes
const handleSignup = async () => {
  if (!isFormValid) {
    // Utilisation du modal pour afficher les erreurs
    setModalTitle("Informations incomplètes");
    setModalMessage(
      "Veuillez remplir correctement tous les champs du formulaire et accepter les termes et conditions avant de continuer."
    );
    setShowModal(true);
    return false;
  }

  try {
    setIsLoading(true);
    console.log("Tentative d'inscription...");

    // Préparation des données d'inscription avec l'adresse formatée correctement
    const signupData = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      password: formData.password,
      phone: formData.phone,
      termsAccepted: formData.termsAccepted,
      // Ajouter l'adresse dans le format attendu par l'API
      addresses: [
        {
          street: formData.address,
          city: formData.city,
          postalCode: formData.postalCode,
          country: formData.country,
          isDefault: true,
        },
      ],
    };

    console.log("Données d'inscription à envoyer:", signupData);

    // Appel à l'API pour l'inscription
    const response = await fetch(`${API_URL}/users/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(signupData),
    });

    const data = await response.json();
    if (!response.ok) {
      // Utilisation du modal au lieu de alert
      setModalTitle("Erreur");
      setModalMessage(
        data.error || "Erreur lors de la gestion des informations client."
      );
      setShowModal(true);
      return false;
    }

    console.log("Réponse de l'API (inscription):", data);

    // Sauvegarder le token et userId dans localStorage
    localStorage.setItem("token", data.token);
    localStorage.setItem("userId", data.userId);
    localStorage.setItem("firstName", formData.firstName);

    // IMPORTANT: Récupérer les données complètes de l'utilisateur comme dans login.js
    console.log("Récupération des données complètes de l'utilisateur...");
    const userData = await fetchUserData(data.userId, data.token);
    
    if (userData) {
      // Stocker l'utilisateur complet dans localStorage (crucial pour la navigation)
      localStorage.setItem("user", JSON.stringify(userData));
      
      // Mettre à jour le contexte utilisateur global avec les données complètes
      setContextUser(userData);
      
      // Mettre à jour l'état user pour refléter la connexion immédiatement
      setUser(userData);
      
      console.log("Utilisateur inscrit avec succès, données complètes:", userData);
    } else {
      // En cas d'échec de fetchUserData, créer un objet utilisateur de base
      const basicUserData = {
        _id: data.userId,
        userId: data.userId,
        token: data.token,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        addresses: [
          {
            street: formData.address,
            city: formData.city,
            postalCode: formData.postalCode,
            country: formData.country,
            isDefault: true,
          },
        ],
        // Pour la compatibilité avec le reste de l'application
        address: formData.address,
        city: formData.city,
        postalCode: formData.postalCode,
        country: formData.country,
      };
      
      // Stocker l'utilisateur de base
      localStorage.setItem("user", JSON.stringify(basicUserData));
      setContextUser(basicUserData);
      setUser(basicUserData);
      
      console.log("Utilisateur inscrit avec des données de base:", basicUserData);
    }

    // Afficher un message de succès
    setModalTitle("Compte créé");
    setModalMessage(
      "Votre compte a été créé avec succès. Vous êtes maintenant connecté."
    );
    setShowModal(true);

    return true;
  } catch (error) {
    console.error("Erreur lors de l'inscription:", error);
    setModalTitle("Erreur");
    setModalMessage("Une erreur est survenue. Veuillez réessayer.");
    setShowModal(true);
    return false;
  } finally {
    setIsLoading(false);
  }
};

  // MODIFIÉ: Fonction pour passer à l'étape suivante
  const goToNextStep = async () => {
    if (currentStep === 1) {
      // Si l'utilisateur est déjà connecté, passer directement à l'étape suivante
      if (user) {
        setCurrentStep(currentStep + 1);
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }

      // Si nous sommes en mode connexion, essayer de se connecter
      if (formMode === "login") {
        await handleLogin();
        return;
      }

      // Mode inscription - tenter l'inscription
      const success = await handleSignup();
      if (success) {
        // Passer à l'étape suivante
        setCurrentStep(currentStep + 1);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } else if (currentStep === 2) {
      // NOUVEAU: Vérifier si l'adresse et le téléphone sont renseignés
      if (user) {
        const hasPhone = user.phone && user.phone.trim() !== "";
        const hasAddress =
          (user.address && user.address.trim() !== "") ||
          (user.addresses &&
            user.addresses.length > 0 &&
            user.addresses[0].street &&
            user.addresses[0].street.trim() !== "");

        if (!hasPhone || !hasAddress) {
          console.log("Informations manquantes: téléphone ou adresse");
          console.log("Téléphone présent:", hasPhone);
          console.log("Adresse présente:", hasAddress);

          // Préremplir le formulaire avec les données existantes
          setAddressPhoneData({
            phone: user.phone || "",
            address:
              user.address ||
              (user.addresses && user.addresses.length > 0
                ? user.addresses[0].street
                : ""),
            city:
              user.city ||
              (user.addresses && user.addresses.length > 0
                ? user.addresses[0].city
                : ""),
            postalCode:
              user.postalCode ||
              (user.addresses && user.addresses.length > 0
                ? user.addresses[0].postalCode
                : ""),
            country:
              user.country ||
              (user.addresses && user.addresses.length > 0
                ? user.addresses[0].country
                : "France"),
          });

          // Afficher le formulaire de complément d'information
          setShowAddressPhoneForm(true);
          return;
        }
      }

      // Si tout est OK, passer à l'étape suivante
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Fonction pour revenir à l'étape précédente
  const goToPreviousStep = () => {
    if (currentStep > 1) {
      // Si le formulaire d'adresse et téléphone est affiché, le masquer
      if (showAddressPhoneForm) {
        setShowAddressPhoneForm(false);
        return;
      }

      setCurrentStep(currentStep - 1);
      console.log("Retour à l'étape", currentStep - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Fonction pour rediriger vers Stripe Checkout - MODIFIÉE POUR CORRESPONDRE À L'API ACTUELLE
// Fonction pour rediriger vers Stripe Checkout
const handleCheckout = async () => {
  try {
    // Vérifiez si l'utilisateur est connecté
    if (!user) {
      setModalTitle("Connexion requise");
      setModalMessage(
        "Vous devez être connecté pour finaliser votre commande."
      );
      setShowModal(true);
      return; // Arrêtez l'exécution si l'utilisateur n'est pas connecté
    }

    setIsLoading(true); // Activer l'indicateur de chargement
    console.log("Préparation de la session Stripe...");

    // Préparer les données pour l'API
    const customerInfo = {
      firstName: user.firstName || formData.firstName,
      lastName: user.lastName || formData.lastName,
      phone: user.phone || formData.phone,
      address: user.address || formData.address,
      city: user.city || formData.city,
      postalCode: user.postalCode || formData.postalCode,
      country: user.country || formData.country,
    };

    console.log("Informations client pour Stripe:", customerInfo);

    // MODIFIÉ ICI: Port 8888 au lieu de 3000
    const response = await fetch("http://localhost:8888/api/create-checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        items: cartItems,
        shippingCost: getShippingCost(),
        shippingMethod: shippingMethod,
        email: user.email || formData.email,
        customerInfo: customerInfo,
      }),
    });

    // Journaliser la réponse pour le débogage
    console.log("Statut de la réponse Stripe:", response.status);
    
    const data = await response.json();
    console.log("Réponse de l'API Stripe:", data);

    if (!response.ok) {
      throw new Error(data.error || "Erreur lors de la création de la session de paiement");
    }

    console.log("Session Stripe créée avec succès, ID:", data.sessionId);

    // Enregistrer les données de commande dans localStorage pour référence ultérieure
    const orderData = {
      items: cartItems,
      customerInfo: customerInfo,
      shipping: {
        method: shippingMethod,
        cost: getShippingCost(),
      },
      total: getFinalTotal(),
      sessionId: data.sessionId,
    };
    
    localStorage.setItem("pendingOrder", JSON.stringify(orderData));

    // Redirection vers Stripe - utilisation de l'URL directe si disponible
    if (data.url) {
      console.log("Redirection vers l'URL Stripe:", data.url);
      window.location.href = data.url;
      return;
    }

    // Fallback à l'ancienne méthode si pas d'URL directe
    const stripe = await stripePromise;
    const { error } = await stripe.redirectToCheckout({ sessionId: data.sessionId });

    if (error) {
      console.error("Erreur lors de la redirection vers Stripe:", error);
      setModalTitle("Erreur de paiement");
      setModalMessage(error.message);
      setShowModal(true);
    }
  } catch (error) {
    console.error("Erreur lors du processus de paiement:", error);
    setModalTitle("Erreur de paiement");
    setModalMessage(
      "Une erreur est survenue lors de la préparation du paiement. Veuillez réessayer."
    );
    setShowModal(true);
  } finally {
    setIsLoading(false);
  }
};

  // Fonction pour déconnecter l'utilisateur
  const handleLogout = () => {
    // Supprimer les données utilisateur de localStorage et sessionStorage
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("firstName");

    sessionStorage.removeItem("user");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("userId");
    sessionStorage.removeItem("firstName");

    // Mettre à jour le contexte utilisateur global
    setContextUser(null);

    // Mettre à jour l'état utilisateur local
    setUser(null);

    // Revenir au mode inscription
    setFormMode("register");

    console.log("Utilisateur déconnecté");
  };

  // Rendu de base sans contenu dynamique (pour éviter les erreurs d'hydratation)
  if (!isClient) {
    return (
      <>
        <Head>
          <title>Finaliser ma commande | MonSavonVert</title>
          <meta
            name="description"
            content="Finaliser votre commande chez MonSavonVert - Savons artisanaux écologiques"
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
        <title>Finaliser ma commande | MonSavonVert</title>
        <meta
          name="description"
          content="Finaliser votre commande chez MonSavonVert - Savons artisanaux écologiques"
        />
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      <div className={styles.container}>
        {/* Header avec navigation - Copié de la page panier */}
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
              <h1 className={styles.pageTitle}>Récapitulatif de commande</h1>
              <div className={styles.pageBreadcrumb}>
                <Link href="/">Accueil</Link>
                <span className={styles.breadcrumbSeparator}>/</span>
                <Link href="/cart">Panier</Link>
                <span className={styles.breadcrumbSeparator}>/</span>
                <span className={styles.breadcrumbCurrent}>Récapitulatif</span>
              </div>
            </div>
          </section>

          {/* Indicateur d'étapes */}
          <section className={styles.checkoutSteps}>
            <div className={styles.stepIndicator}>
              <div
                className={`${styles.step} ${
                  currentStep >= 1 ? styles.stepActive : ""
                }`}
              >
                <div className={styles.stepNumber}>1</div>
                <div className={styles.stepLabel}>Informations</div>
              </div>
              <div className={styles.stepLine}></div>
              <div
                className={`${styles.step} ${
                  currentStep >= 2 ? styles.stepActive : ""
                }`}
              >
                <div className={styles.stepNumber}>2</div>
                <div className={styles.stepLabel}>Livraison</div>
              </div>
              <div className={styles.stepLine}></div>
              <div
                className={`${styles.step} ${
                  currentStep >= 3 ? styles.stepActive : ""
                }`}
              >
                <div className={styles.stepNumber}>3</div>
                <div className={styles.stepLabel}>Paiement</div>
              </div>
            </div>
          </section>

          {/* Contenu principal */}
          <section className={styles.checkoutSection}>
            <div className={styles.checkoutContainer}>
              <div className={styles.checkoutContent}>
                <div className={styles.checkoutForm}>
                  {/* Étape 1: Informations client */}
                  {currentStep === 1 && (
                    <div className={styles.checkoutStep}>
                      <h2 className={styles.stepTitle}>Vos informations</h2>

                      {/* Si l'utilisateur est déjà connecté, afficher ses informations */}
                      {user ? (
  <div className={styles.userCard}>
    {/* En-tête avec avatar et statut */}
    <div className={styles.userCardHeader}>
      <div className={styles.userAvatar}>
        {/* Utilisation des initiales de l'utilisateur comme avatar */}
        {user.firstName && user.lastName 
          ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`
          : "👤"}
      </div>
      <div className={styles.userStatus}>
        <span className={styles.statusDot}></span>
        Connecté
      </div>
    </div>
    
    {/* Nom de l'utilisateur en grand */}
    <h2 className={styles.userName}>
      {user.firstName || ""} {user.lastName || ""}
    </h2>
    
    {/* Liste des informations utilisateur */}
    <div className={styles.userInfoList}>
      <div className={styles.infoItem}>
        <div className={styles.infoIcon}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 17a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9.5C2 7 4 5 6.5 5H18c2.2 0 4 1.8 4 4v8Z"></path>
            <polyline points="15,9 18,9 18,11"></polyline>
            <path d="M2 9.5V9a3 3 0 0 1 3-3h1.5"></path>
            <path d="M18 5V3"></path>
            <path d="M2 13h20"></path>
          </svg>
        </div>
        <div className={styles.infoContent}>
          <span className={styles.infoLabel}>Email</span>
          <span className={styles.infoValue}>{user.email || "Non renseigné"}</span>
        </div>
      </div>
      
      <div className={styles.infoItem}>
        <div className={styles.infoIcon}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
        </div>
        <div className={styles.infoContent}>
          <span className={styles.infoLabel}>Adresse</span>
          <span className={styles.infoValue}>
            {user.address
              ? `${user.address}, ${user.postalCode || ""} ${user.city || ""}`
              : user.addresses && user.addresses.length > 0
              ? `${user.addresses[0].street}, ${user.addresses[0].postalCode} ${user.addresses[0].city}`
              : "Non renseignée"}
          </span>
        </div>
      </div>
      
      <div className={styles.infoItem}>
        <div className={styles.infoIcon}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
          </svg>
        </div>
        <div className={styles.infoContent}>
          <span className={styles.infoLabel}>Téléphone</span>
          <span className={styles.infoValue}>{user.phone || "Non renseigné"}</span>
        </div>
      </div>
    </div>
    
    {/* Barre d'actions */}
    <div className={styles.userActions}>
      <button className={styles.logoutButton} onClick={handleLogout}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
          <polyline points="16 17 21 12 16 7"></polyline>
          <line x1="21" y1="12" x2="9" y2="12"></line>
        </svg>
        Déconnexion
      </button>
    </div>
    
    {/* Boutons de navigation */}
    <div className={styles.navigationButtons}>
      <Link href="/cart" className={styles.backButton}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="19" y1="12" x2="5" y2="12"></line>
          <polyline points="12 19 5 12 12 5"></polyline>
        </svg>
        Retour au panier
      </Link>
      
      <button onClick={goToNextStep} className={styles.continueButton}>
        Continuer
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="5" y1="12" x2="19" y2="12"></line>
          <polyline points="12 5 19 12 12 19"></polyline>
        </svg>
      </button>
    </div>
    
    {/* Log pour débogage - à enlever en production */}
    {console.log("Données affichées dans le bloc utilisateur:", user)}
  </div>
                      ) : (
                        <>
                          {/* Onglets pour choisir entre inscription et connexion */}
                          <div className={styles.formTabs}>
                            <button
                              className={`${styles.formTab} ${
                                formMode === "register"
                                  ? styles.formTabActive
                                  : ""
                              }`}
                              onClick={() => toggleFormMode("register")}
                            >
                              Nouveau client
                            </button>
                            <button
                              className={`${styles.formTab} ${
                                formMode === "login" ? styles.formTabActive : ""
                              }`}
                              onClick={() => toggleFormMode("login")}
                            >
                              Déjà client
                            </button>
                          </div>

                          {/* Formulaire d'inscription */}
                          {formMode === "register" && (
                            <div className={styles.formGrid}>
                              <div className={styles.formGroup}>
                                <label htmlFor="firstName">Prénom *</label>
                                <input
                                  type="text"
                                  id="firstName"
                                  name="firstName"
                                  className={`${styles.formInput} ${
                                    formErrors.firstName
                                      ? styles.inputError
                                      : ""
                                  }`}
                                  value={formData.firstName}
                                  onChange={handleInputChange}
                                  required
                                  placeholder="Jean"
                                />
                                {formErrors.firstName && (
                                  <p className={styles.errorText}>
                                    {formErrors.firstName}
                                  </p>
                                )}
                              </div>
                              <div className={styles.formGroup}>
                                <label htmlFor="lastName">Nom *</label>
                                <input
                                  type="text"
                                  id="lastName"
                                  name="lastName"
                                  className={`${styles.formInput} ${
                                    formErrors.lastName ? styles.inputError : ""
                                  }`}
                                  value={formData.lastName}
                                  onChange={handleInputChange}
                                  required
                                  placeholder="Dupont"
                                />
                                {formErrors.lastName && (
                                  <p className={styles.errorText}>
                                    {formErrors.lastName}
                                  </p>
                                )}
                              </div>
                              <div className={styles.formGroup}>
                                <label htmlFor="email">Email *</label>
                                <input
                                  type="email"
                                  id="email"
                                  name="email"
                                  className={`${styles.formInput} ${
                                    formErrors.email ? styles.inputError : ""
                                  }`}
                                  value={formData.email}
                                  onChange={handleInputChange}
                                  required
                                  placeholder="jean.dupont@example.com"
                                />
                                {formErrors.email && (
                                  <p className={styles.errorText}>
                                    {formErrors.email}
                                  </p>
                                )}
                              </div>
                              <div className={styles.formGroup}>
                                <label htmlFor="password">Mot de passe *</label>
                                <input
                                  type="password"
                                  id="password"
                                  name="password"
                                  className={`${styles.formInput} ${
                                    formErrors.password ? styles.inputError : ""
                                  }`}
                                  value={formData.password || ""}
                                  onChange={handleInputChange}
                                  required
                                  placeholder="Votre mot de passe"
                                />
                                {formErrors.password && (
                                  <p className={styles.errorText}>
                                    {formErrors.password}
                                  </p>
                                )}
                              </div>

                              <div className={styles.formGroupFull}>
                                <label htmlFor="address">Adresse *</label>
                                <input
                                  type="text"
                                  id="address"
                                  name="address"
                                  className={`${styles.formInput} ${
                                    formErrors.address ? styles.inputError : ""
                                  }`}
                                  value={formData.address}
                                  onChange={handleInputChange}
                                  required
                                  placeholder="42 rue des Oliviers"
                                  autoComplete="street-address"
                                />
                                {formErrors.address && (
                                  <p className={styles.errorText}>
                                    {formErrors.address}
                                  </p>
                                )}
                              </div>
                              <div className={styles.formGroup}>
                                <label htmlFor="city">Ville *</label>
                                <input
                                  type="text"
                                  id="city"
                                  name="city"
                                  className={`${styles.formInput} ${
                                    formErrors.city ? styles.inputError : ""
                                  }`}
                                  value={formData.city}
                                  onChange={handleInputChange}
                                  required
                                  placeholder="Lyon"
                                />
                                {formErrors.city && (
                                  <p className={styles.errorText}>
                                    {formErrors.city}
                                  </p>
                                )}
                              </div>
                              <div className={styles.formGroup}>
                                <label htmlFor="postalCode">
                                  Code postal *
                                </label>
                                <input
                                  type="text"
                                  id="postalCode"
                                  name="postalCode"
                                  className={`${styles.formInput} ${
                                    formErrors.postalCode
                                      ? styles.inputError
                                      : ""
                                  }`}
                                  value={formData.postalCode}
                                  onChange={handleInputChange}
                                  required
                                  placeholder="69001"
                                />
                                {formErrors.postalCode && (
                                  <p className={styles.errorText}>
                                    {formErrors.postalCode}
                                  </p>
                                )}
                              </div>
                              <div className={styles.formGroup}>
                                <label htmlFor="country">Pays *</label>
                                <select
                                  id="country"
                                  name="country"
                                  className={styles.formSelect}
                                  value={formData.country}
                                  onChange={handleInputChange}
                                  required
                                >
                                  <option value="France">France</option>
                                  <option value="Belgique">Belgique</option>
                                  <option value="Suisse">Suisse</option>
                                  <option value="Luxembourg">Luxembourg</option>
                                  <option value="Canada">Canada</option>
                                </select>
                              </div>
                              <div className={styles.formGroup}>
                                <label htmlFor="phone">Téléphone *</label>
                                <input
                                  type="tel"
                                  id="phone"
                                  name="phone"
                                  className={`${styles.formInput} ${
                                    formErrors.phone ? styles.inputError : ""
                                  }`}
                                  value={formData.phone}
                                  onChange={handleInputChange}
                                  required
                                  placeholder="+33 6 12 34 56 78"
                                />
                                {formErrors.phone && (
                                  <p className={styles.errorText}>
                                    {formErrors.phone}
                                  </p>
                                )}
                              </div>
                              <div className={styles.formGroupFull}>
                                <label
                                  htmlFor="termsAccepted"
                                  className={styles.checkboxLabel}
                                >
                                  <input
                                    type="checkbox"
                                    id="termsAccepted"
                                    name="termsAccepted"
                                    className={styles.checkboxInput}
                                    checked={formData.termsAccepted}
                                    onChange={handleCheckboxChange}
                                  />
                                  J'accepte les{" "}
                                  <Link href="/terms">
                                    {" "}
                                    termes et conditions
                                  </Link>
                                  .
                                </label>
                              </div>
                            </div>
                          )}

                          {/* Formulaire de connexion */}
                          {formMode === "login" && (
                            <div className={styles.loginForm}>
                              <div className={styles.formGroup}>
                                <label htmlFor="loginEmail">Email *</label>
                                <input
                                  type="email"
                                  id="loginEmail"
                                  name="email"
                                  className={styles.formInput}
                                  value={loginData.email}
                                  onChange={handleLoginInputChange}
                                  required
                                  placeholder="jean.dupont@example.com"
                                />
                              </div>
                              <div className={styles.formGroup}>
                                <label htmlFor="loginPassword">
                                  Mot de passe *
                                </label>
                                <input
                                  type="password"
                                  id="loginPassword"
                                  name="password"
                                  className={styles.formInput}
                                  value={loginData.password}
                                  onChange={handleLoginInputChange}
                                  required
                                  placeholder="Votre mot de passe"
                                />
                              </div>

                              {loginError && (
                                <div className={styles.loginError}>
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
                                    <line
                                      x1="12"
                                      y1="16"
                                      x2="12.01"
                                      y2="16"
                                    ></line>
                                  </svg>
                                  <p>{loginError}</p>
                                </div>
                              )}

                              <div className={styles.formGroup}>
                                <div className={styles.rememberMe}>
                                  <input
                                    type="checkbox"
                                    id="rememberMe"
                                    name="rememberMe"
                                    checked={rememberMe}
                                    onChange={handleCheckboxChange}
                                  />
                                  <label htmlFor="rememberMe">
                                    Se souvenir de moi
                                  </label>
                                </div>
                              </div>

                              <div className={styles.forgotPassword}>
                                <Link href="/forgot-password">
                                  Mot de passe oublié ?
                                </Link>
                              </div>
                            </div>
                          )}

                          <div className={styles.formActions}>
                            <Link href="/cart" className={styles.backButton}>
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
                                <line x1="19" y1="12" x2="5" y2="12"></line>
                                <polyline points="12 19 5 12 12 5"></polyline>
                              </svg>
                              Retour au panier
                            </Link>
                            <button
                              onClick={goToNextStep}
                              className={`${styles.button} ${styles.primaryButton}`}
                              disabled={isLoading} // Désactiver pendant le chargement
                            >
                              {isLoading ? (
                                <>
                                  <span
                                    className={styles.loadingSpinner}
                                  ></span>
                                  Traitement...
                                </>
                              ) : (
                                <>
                                  {formMode === "login"
                                    ? "Se connecter"
                                    : "Continuer"}
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
                                    <line x1="5" y1="12" x2="19" y2="12"></line>
                                    <polyline points="12 5 19 12 12 19"></polyline>
                                  </svg>
                                </>
                              )}
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  {/* Étape 2: Livraison */}
                  {currentStep === 2 && !showAddressPhoneForm && (
                    <div className={styles.checkoutStep}>
                      <h2 className={styles.stepTitle}>Méthode de livraison</h2>
                      <div className={styles.shippingOptions}>
                        <div
                          className={`${styles.shippingOption} ${
                            shippingMethod === "standard"
                              ? styles.shippingOptionSelected
                              : ""
                          }`}
                          onClick={() => handleShippingChange("standard")}
                        >
                          <div className={styles.shippingOptionRadio}>
                            <div className={styles.radioOuter}>
                              {shippingMethod === "standard" && (
                                <div className={styles.radioInner}></div>
                              )}
                            </div>
                          </div>
                          <div className={styles.shippingOptionInfo}>
                            <h3>Livraison standard</h3>
                            <p>Livraison en 3-5 jours ouvrés</p>
                            {/* Indication de la promotion */}
                            <p className={styles.shippingPromo}>
                              Gratuite à partir de 29€ d'achat
                            </p>
                          </div>
                          <div className={styles.shippingOptionPrice}>
                            {parseFloat(getTotalPrice()) >= 29
                              ? "Gratuit"
                              : "4,95 €"}
                          </div>
                        </div>

                        <div
                          className={`${styles.shippingOption} ${
                            shippingMethod === "express"
                              ? styles.shippingOptionSelected
                              : ""
                          }`}
                          onClick={() => handleShippingChange("express")}
                        >
                          <div className={styles.shippingOptionRadio}>
                            <div className={styles.radioOuter}>
                              {shippingMethod === "express" && (
                                <div className={styles.radioInner}></div>
                              )}
                            </div>
                          </div>
                          <div className={styles.shippingOptionInfo}>
                            <h3>Livraison express</h3>
                            <p>Livraison en 24-48h</p>
                          </div>
                          <div className={styles.shippingOptionPrice}>
                            9,95 €
                          </div>
                        </div>

                        <div
                          className={`${styles.shippingOption} ${
                            shippingMethod === "pickup"
                              ? styles.shippingOptionSelected
                              : ""
                          }`}
                          onClick={() => handleShippingChange("pickup")}
                        >
                          <div className={styles.shippingOptionRadio}>
                            <div className={styles.radioOuter}>
                              {shippingMethod === "pickup" && (
                                <div className={styles.radioInner}></div>
                              )}
                            </div>
                          </div>
                          <div className={styles.shippingOptionInfo}>
                            <h3>Retrait en boutique</h3>
                            <p>15 rue des Artisans, 69001 Lyon</p>
                          </div>
                          <div className={styles.shippingOptionPrice}>
                            Gratuit
                          </div>
                        </div>
                      </div>

                      <div className={styles.formActions}>
                        <button
                          onClick={goToPreviousStep}
                          className={styles.backButton}
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
                            <line x1="19" y1="12" x2="5" y2="12"></line>
                            <polyline points="12 19 5 12 12 5"></polyline>
                          </svg>
                          Retour
                        </button>
                        <button
                          onClick={goToNextStep}
                          className={`${styles.button} ${styles.primaryButton}`}
                        >
                          Continuer
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
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                            <polyline points="12 5 19 12 12 19"></polyline>
                          </svg>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* NOUVEAU: Formulaire pour compléter les informations manquantes (téléphone/adresse) */}
                  {currentStep === 2 && showAddressPhoneForm && (
                    <div className={styles.checkoutStep}>
                      <h2 className={styles.stepTitle}>
                        Compléter vos informations
                      </h2>
                      <div className={styles.infoAlert}>
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
                        <p>
                          Veuillez compléter votre adresse et numéro de
                          téléphone pour continuer la commande.
                        </p>
                      </div>

                      <div className={styles.formGrid}>
                        <div className={styles.formGroup}>
                          <label htmlFor="phone">Téléphone *</label>
                          <input
                            type="tel"
                            id="addressPhonePhone"
                            name="phone"
                            className={`${styles.formInput} ${
                              addressPhoneErrors.phone ? styles.inputError : ""
                            }`}
                            value={addressPhoneData.phone}
                            onChange={handleAddressPhoneChange}
                            required
                            placeholder="+33 6 12 34 56 78"
                          />
                          {addressPhoneErrors.phone && (
                            <p className={styles.errorText}>
                              {addressPhoneErrors.phone}
                            </p>
                          )}
                        </div>

                        <div className={styles.formGroupFull}>
                          <label htmlFor="address">Adresse *</label>
                          <input
                            type="text"
                            id="addressPhoneAddress"
                            name="address"
                            className={`${styles.formInput} ${
                              addressPhoneErrors.address
                                ? styles.inputError
                                : ""
                            }`}
                            value={addressPhoneData.address}
                            onChange={handleAddressPhoneChange}
                            required
                            placeholder="42 rue des Oliviers"
                            autoComplete="street-address"
                          />
                          {addressPhoneErrors.address && (
                            <p className={styles.errorText}>
                              {addressPhoneErrors.address}
                            </p>
                          )}
                        </div>

                        <div className={styles.formGroup}>
                          <label htmlFor="city">Ville *</label>
                          <input
                            type="text"
                            id="addressPhoneCity"
                            name="city"
                            className={`${styles.formInput} ${
                              addressPhoneErrors.city ? styles.inputError : ""
                            }`}
                            value={addressPhoneData.city}
                            onChange={handleAddressPhoneChange}
                            required
                            placeholder="Lyon"
                          />
                          {addressPhoneErrors.city && (
                            <p className={styles.errorText}>
                              {addressPhoneErrors.city}
                            </p>
                          )}
                        </div>

                        <div className={styles.formGroup}>
                          <label htmlFor="postalCode">Code postal *</label>
                          <input
                            type="text"
                            id="addressPhonePostalCode"
                            name="postalCode"
                            className={`${styles.formInput} ${
                              addressPhoneErrors.postalCode
                                ? styles.inputError
                                : ""
                            }`}
                            value={addressPhoneData.postalCode}
                            onChange={handleAddressPhoneChange}
                            required
                            placeholder="69001"
                          />
                          {addressPhoneErrors.postalCode && (
                            <p className={styles.errorText}>
                              {addressPhoneErrors.postalCode}
                            </p>
                          )}
                        </div>

                        <div className={styles.formGroup}>
                          <label htmlFor="country">Pays *</label>
                          <select
                            id="addressPhoneCountry"
                            name="country"
                            className={styles.formSelect}
                            value={addressPhoneData.country}
                            onChange={handleAddressPhoneChange}
                            required
                          >
                            <option value="France">France</option>
                            <option value="Belgique">Belgique</option>
                            <option value="Suisse">Suisse</option>
                            <option value="Luxembourg">Luxembourg</option>
                            <option value="Canada">Canada</option>
                          </select>
                        </div>
                      </div>

                      <div className={styles.formActions}>
                        <button
                          onClick={goToPreviousStep}
                          className={styles.backButton}
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
                            <line x1="19" y1="12" x2="5" y2="12"></line>
                            <polyline points="12 19 5 12 12 5"></polyline>
                          </svg>
                          Retour
                        </button>
                        <button
                          onClick={updateUserData}
                          className={`${styles.button} ${styles.primaryButton}`}
                          disabled={!addressPhoneFormValid || isLoading} // Désactiver si le formulaire n'est pas valide
                        >
                          {isLoading ? (
                            <>
                              <span className={styles.loadingSpinner}></span>
                              Traitement...
                            </>
                          ) : (
                            <>
                              Enregistrer et continuer
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
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                                <polyline points="12 5 19 12 12 19"></polyline>
                              </svg>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Étape 3: Paiement */}
                  {currentStep === 3 && (
                    <div className={styles.checkoutStep}>
                      <h2 className={styles.stepTitle}>Méthode de paiement</h2>
                      <div className={styles.paymentInfo}>
                        <div className={styles.paymentMethods}>
                          <p className={styles.paymentNote}>
                            En cliquant sur "Payer", vous serez redirigé vers
                            notre partenaire de paiement sécurisé Stripe.
                          </p>
                          <div className={styles.paymentLogos}>
                            <img
                              src="/images/payments/visa.png"
                              alt="Visa"
                              className={styles.paymentLogo}
                            />
                            <img
                              src="/images/payments/mastercard.png"
                              alt="Mastercard"
                              className={styles.paymentLogo}
                            />
                            <img
                              src="/images/payments/americanexpress.png"
                              alt="americanexpress"
                              className={styles.paymentLogo}
                            />
                            <img
                              src="/images/payments/applepay.png"
                              alt="Apple pay"
                              className={styles.paymentLogo}
                            />
                          </div>
                        </div>

                        <div className={styles.addressReview}>
                          <h3>Adresse de livraison</h3>
                          <p>
                            {formData.firstName} {formData.lastName}
                            <br />
                            {formData.address}
                            <br />
                            {formData.postalCode} {formData.city}
                            <br />
                            {formData.country}
                            <br />
                            {formData.phone}
                          </p>
                          <button
                            onClick={() => setCurrentStep(1)}
                            className={styles.editButton}
                          >
                            Modifier
                          </button>
                        </div>

                        <div className={styles.shippingReview}>
                          <h3>Mode de livraison</h3>
                          <p>
                            {shippingMethod === "standard" &&
                              "Livraison standard (3-5 jours ouvrés)"}
                            {shippingMethod === "express" &&
                              "Livraison express (24-48h)"}
                            {shippingMethod === "pickup" &&
                              "Retrait en boutique (15 rue des Artisans, 69001 Lyon)"}
                          </p>
                          <button
                            onClick={() => setCurrentStep(2)}
                            className={styles.editButton}
                          >
                            Modifier
                          </button>
                        </div>
                      </div>

                      <div className={styles.formActions}>
                        <button
                          onClick={goToPreviousStep}
                          className={styles.backButton}
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
                            <line x1="19" y1="12" x2="5" y2="12"></line>
                            <polyline points="12 19 5 12 12 5"></polyline>
                          </svg>
                          Retour
                        </button>
                        <button
                          onClick={handleCheckout}
                          className={`${styles.button} ${styles.primaryButton} ${styles.paymentButton}`}
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <>
                              <span className={styles.loadingSpinner}></span>
                              Traitement en cours...
                            </>
                          ) : (
                            <>
                              Payer {getFinalTotal()} €
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
                                  x="1"
                                  y="4"
                                  width="22"
                                  height="16"
                                  rx="2"
                                  ry="2"
                                ></rect>
                                <line x1="1" y1="10" x2="23" y2="10"></line>
                              </svg>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Récapitulatif de la commande */}
                <div className={styles.orderSummary}>
                  <h2 className={styles.summaryTitle}>Récapitulatif</h2>

                  <div className={styles.orderItems}>
                    {cartItems.map((item) => (
                      <div key={item.id} className={styles.orderItem}>
                        <div className={styles.orderItemImage}>
                          <img src={item.image} alt={item.name} />
                          <span className={styles.orderItemQuantity}>
                            {item.quantity}
                          </span>
                        </div>
                        <div className={styles.orderItemDetails}>
                          <h3 className={styles.orderItemName}>{item.name}</h3>
                          <p className={styles.orderItemPrice}>
                            {(item.price * item.quantity).toFixed(2)} €
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className={styles.summaryRow}>
                    <span>Sous-total</span>
                    <span>{getTotalPrice()} €</span>
                  </div>
                  <div className={styles.summaryRow}>
                    <span>Livraison</span>
                    <span>
                      {getShippingCost() === 0
                        ? "Gratuit"
                        : `${getShippingCost().toFixed(2)} €`}
                    </span>
                  </div>
                  <div className={styles.summaryRowTotal}>
                    <span>Total</span>
                    <span>{getFinalTotal()} €</span>
                  </div>

                  <div className={styles.promoCode}>
                    <input
                      type="text"
                      placeholder="Code promo"
                      className={styles.promoInput}
                    />
                    <button className={styles.promoButton}>Appliquer</button>
                  </div>

                  <div className={styles.secureNotice}>
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
                    <p>Paiement sécurisé par cryptage SSL</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>

        {/* Footer - Copié de la page panier */}
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

        {/* Modal */}
        {showModal && (
          <div className={styles.modalOverlay}>
            <div className={styles.modal}>
              <div className={styles.modalHeader}>
                <h3 className={styles.modalTitle}>{modalTitle}</h3>
                <button
                  className={styles.modalClose}
                  onClick={() => setShowModal(false)}
                >
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
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
              <div className={styles.modalBody}>
                <p>{modalMessage}</p>
              </div>
              <div className={styles.modalFooter}>
                <button
                  className={`${styles.button} ${styles.primaryButton}`}
                  onClick={() => setShowModal(false)}
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
