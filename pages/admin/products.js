"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import styles from "../../styles/admin-products.module.css";

export default function AdminProducts() {
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  // États de base
  const [isClient, setIsClient] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState({
    images: [], // Initialisez `images` comme un tableau vide
  });
  const [imagePreviews, setImagePreviews] = useState([]);

  // État pour gérer le modal d'ajout de produit
  const [showAddModal, setShowAddModal] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // États pour les modaux de notification et confirmation
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [notificationType, setNotificationType] = useState("success"); // 'success' ou 'error'
  const [notificationMessage, setNotificationMessage] = useState("");
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [confirmationAction, setConfirmationAction] = useState(null);
  const [confirmationMessage, setConfirmationMessage] = useState("");

  // État pour le formulaire d'ajout de produit
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    characteristics: "",
    stock: "0",
    ingredients: "",
    usageTips: "",
    images: [],
  });

  // Afficher une notification
  const showNotification = (type, message) => {
    setNotificationType(type);
    setNotificationMessage(message);
    setShowNotificationModal(true);

    // Fermer automatiquement après 3 secondes
    setTimeout(() => {
      setShowNotificationModal(false);
    }, 3000);
  };

  // Demander une confirmation
  const askConfirmation = (message, action) => {
    setConfirmationMessage(message);
    setConfirmationAction(() => action);
    setShowConfirmationModal(true);
  };

  useEffect(() => {
    // Nettoyer les URLs d'aperçu lorsque le composant est démonté
    return () => {
      imagePreviews.forEach((preview) => URL.revokeObjectURL(preview));
    };
  }, [imagePreviews]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(`${API_URL}/products`);
        if (!response.ok) {
          throw new Error("Erreur lors de la récupération des produits");
        }
        const data = await response.json();
        console.log(data.products); // Vérifiez si le champ "image" est présent
        setProducts(data.products);
      } catch (error) {
        console.error("Erreur:", error);
        showNotification("error", "Erreur lors du chargement des produits");
      }
    };

    fetchProducts();
  }, []);

  // Initialisation côté client
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

  // Vérification de l'authentification
  useEffect(() => {
    if (!isClient) return;

    try {
      // Vérifier si l'utilisateur est connecté en tant qu'admin
      const email = localStorage.getItem("userEmail");
      const userRole = localStorage.getItem("userRole");

      console.log("Vérification des autorisations pour:", email);
      console.log("Rôle utilisateur:", userRole);

      // Si pas connecté, rediriger vers login
      if (!email || !userRole) {
        console.log("Informations manquantes - Email ou Rôle non trouvé");
        router.push("/login");
        return;
      }

      // Vérifier si admin
      if (userRole !== "admin") {
        console.log("Accès refusé: L'utilisateur n'a pas le rôle admin");
        router.push("/profile");
        return;
      }

      // Autoriser l'accès
      console.log("Accès autorisé pour l'administrateur");
      setUserEmail(email);
      setIsAuthorized(true);
    } catch (error) {
      console.error("Erreur lors de la vérification des autorisations:", error);
      router.push("/login");
    }
  }, [isClient, router]);

  // Gestion des changements dans le formulaire
  const handleFormChange = (e) => {
    const { name, value, type } = e.target;

    if (type === "file") {
      // Pour les fichiers multiples
      if (name === "images") {
        const files = Array.from(e.target.files);
        const remainingSlots = 5 - imagePreviews.length;

        // Vérifier si le nombre d'images ne dépasse pas 5
        if (files.length > remainingSlots) {
          alert(
            `Vous ne pouvez ajouter que ${remainingSlots} image(s) supplémentaire(s).`
          );
          return;
        }

        // Créer des URLs pour les prévisualisations
        const newPreviews = files.map((file) => URL.createObjectURL(file));

        // Mettre à jour les prévisualisations
        setImagePreviews((prev) => [...prev, ...newPreviews]);

        // Mettre à jour formData
        setFormData((prev) => ({
          ...prev,
          images: [...prev.images, ...files],
        }));

        // Log pour le diagnostic
        console.log("Images ajoutées:", files);
        console.log("Prévisualisations créées:", newPreviews);
      } else {
        // Pour un seul fichier (cas original)
        const file = e.target.files[0];
        setFormData({ ...formData, [name]: file });

        // Prévisualisation de l'image
        if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
            setImagePreview(reader.result);
          };
          reader.readAsDataURL(file);
        } else {
          setImagePreview(null);
        }
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // Soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Empêcher plusieurs soumissions
    if (isSubmitting) return;

    setIsSubmitting(true); // Activer le loader

    const productData = new FormData();
    productData.append("title", formData.title);
    productData.append("description", formData.description);
    productData.append("price", formData.price);
    productData.append("characteristics", formData.characteristics);
    productData.append("stock", formData.stock);
    productData.append("ingredients", formData.ingredients);
    productData.append("usageTips", formData.usageTips);

    // Ajouter toutes les images
    formData.images.forEach((image) => {
      productData.append("images", image);
    });

    try {
      const response = await fetch(`${API_URL}/products/add`, {
        method: "POST",
        body: productData,
      });

      if (!response.ok) {
        throw new Error("Erreur lors de l'ajout du produit");
      }

      const result = await response.json();
      console.log("Produit ajouté:", result);

      // Réinitialiser le formulaire
      setFormData({
        title: "",
        description: "",
        price: "",
        characteristics: "",
        stock: "0",
        ingredients: "",
        usageTips: "",
        images: [],
      });

      setImagePreviews([]); // Réinitialiser les aperçus d'images
      setShowAddModal(false); // Fermer le modal
      showNotification("success", "Produit ajouté avec succès !");
    } catch (error) {
      console.error("Erreur lors de l'ajout du produit:", error);
      showNotification("error", "Erreur lors de l'ajout du produit.");
    } finally {
      setIsSubmitting(false); // Désactiver le loader
    }
  };

  const handleDeleteProduct = async () => {
    // Fonction exécutée après confirmation
    const performDelete = async () => {
      try {
        setIsLoading(true);

        const response = await fetch(
          `${API_URL}/products/delete/${selectedProduct._id}`,
          {
            method: "DELETE",
          }
        );

        if (!response.ok) {
          throw new Error("Erreur lors de la suppression du produit");
        }

        // Mettre à jour la liste des produits
        setProducts((prevProducts) =>
          prevProducts.filter((product) => product._id !== selectedProduct._id)
        );

        setShowEditModal(false);
        showNotification("success", "Produit supprimé avec succès !");
      } catch (error) {
        console.error("Erreur lors de la suppression du produit:", error);
        showNotification(
          "error",
          "Une erreur est survenue lors de la suppression du produit"
        );
      } finally {
        setIsLoading(false);
        setShowConfirmationModal(false);
      }
    };

    // Demander confirmation avant suppression
    askConfirmation(
      "Êtes-vous sûr de vouloir supprimer ce produit ?",
      performDelete
    );
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
  
    const productData = new FormData();
    productData.append("title", selectedProduct.title);
    productData.append("description", selectedProduct.description);
    productData.append("price", selectedProduct.price);
    productData.append("stock", selectedProduct.stock);
    productData.append("characteristics", selectedProduct.characteristics || "");
    productData.append("ingredients", selectedProduct.ingredients || "");
    productData.append("usageTips", selectedProduct.usageTips || "");
  
    // Ajouter les images existantes
    const existingImages = selectedProduct.images
      .filter((image) => typeof image === "string" && image.trim() !== "")
      .map((image) => image.url || image);
    productData.append("existingImages", JSON.stringify(existingImages));
  
    // Ajouter les nouvelles images
    selectedProduct.images.forEach((image) => {
      if (image.file) {
        productData.append("images", image.file);
      }
    });
  
    try {
      const response = await fetch(
        `${API_URL}/products/update/${selectedProduct._id}`,
        {
          method: "PUT",
          body: productData,
        }
      );
  
      if (!response.ok) {
        throw new Error("Erreur lors de la mise à jour du produit");
      }
  
      const result = await response.json();
      console.log("Produit mis à jour :", result);
  
      // Mettre à jour la liste des produits
      setProducts((prevProducts) =>
        prevProducts.map((product) =>
          product._id === result.product._id ? result.product : product
        )
      );
  
      setShowEditModal(false);
      showNotification("success", "Produit mis à jour avec succès !");
    } catch (error) {
      console.error("Erreur lors de la mise à jour du produit :", error);
      showNotification("error", "Erreur lors de la mise à jour du produit.");
    }
  };
  const handleEditProduct = (product) => {
    if (!product) {
      console.error("Produit non défini");
      return;
    }
    setSelectedProduct(product);
    setShowEditModal(true);
  };

  const handleEditImagesChange = (e) => {
    if (!selectedProduct) return; // Vérifiez que `selectedProduct` est défini

    const files = Array.from(e.target.files);
    const currentImages = selectedProduct.images || [];
    const remainingSlots = 5 - currentImages.length;

    if (files.length > remainingSlots) {
      alert(
        `Vous ne pouvez ajouter que ${remainingSlots} image(s) supplémentaire(s).`
      );
      return;
    }

    const newImages = files.slice(0, remainingSlots).map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));

    setSelectedProduct({
      ...selectedProduct,
      images: [...currentImages, ...newImages],
    });

    console.log("Images ajoutées :", newImages);
  };

  const handleRemoveEditImage = (index) => {
    const updatedImages = [...selectedProduct.images];
    const removedImage = updatedImages.splice(index, 1); // Supprimer l'image à l'index donné

    // Révoquer l'URL de l'image supprimée si elle est locale
    if (removedImage[0]?.preview) {
      URL.revokeObjectURL(removedImage[0].preview);
    }

    setSelectedProduct({
      ...selectedProduct,
      images: updatedImages,
    });
  };
  // Rendu de base sans contenu dynamique
  if (!isClient) {
    return (
      <>
        <Head>
          <title>Gestion des Produits | MonSavonVert</title>
          <meta
            name="description"
            content="Panneau d'administration des produits - MonSavonVert"
          />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <div className={styles.loadingWrapper}>
          <div className={styles.loadingLogo}>MonSavonVert</div>
        </div>
      </>
    );
  }

  // Rendu principal de l'application
  return (
    <>
      <Head>
        <title>Gestion des Produits | MonSavonVert</title>
        <meta
          name="description"
          content="Panneau d'administration des produits - MonSavonVert"
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
          <div className={styles.headerContent}>
            <div className={styles.logoContainer}>
              <Link href="/" legacyBehavior>
                <a className={styles.logoLink}>
                  <span className={styles.logo}>MonSavonVert</span>
                </a>
              </Link>
            </div>

            {/* Navigation principale */}
            <nav className={styles.mainNav}>
              <ul className={styles.navList}>
                <li className={styles.navItem}>
                  <Link href="/admin/dashboard" legacyBehavior>
                    <a className={styles.navLink}>Tableau de bord</a>
                  </Link>
                </li>
                <li className={styles.navItem}>
                  <Link href="/admin/orders" legacyBehavior>
                    <a className={styles.navLink}>Commandes</a>
                  </Link>
                </li>
                <li className={styles.navItem}>
                  <Link href="/admin/products" legacyBehavior>
                    <a className={`${styles.navLink} ${styles.active}`}>
                      Produits
                    </a>
                  </Link>
                </li>
                <li className={styles.navItem}>
                  <Link href="/admin/customers" legacyBehavior>
                    <a className={styles.navLink}>Clients</a>
                  </Link>
                </li>
                <li className={styles.navItem}>
                  <Link href="/admin/settings" legacyBehavior>
                    <a className={styles.navLink}>Paramètres</a>
                  </Link>
                </li>
              </ul>
            </nav>

            {/* Profil administrateur */}
            <div className={styles.adminProfile}>
              <div className={styles.adminAvatar}>
                <span>A</span>
              </div>
              <div className={styles.adminInfo}>
                <span className={styles.adminName}>Admin</span>
                <span className={styles.adminEmail}>{userEmail}</span>
              </div>
            </div>
          </div>
        </header>

        <main className={styles.mainContent}>
          {/* Page title section */}
          <section className={styles.pageHeaderSection}>
            <div className={styles.pageHeaderContent}>
              <div className={styles.pageTitle}>
                <h1>Gestion des Produits</h1>
                <p className={styles.pageDescription}>
                  Gérez votre catalogue de produits, modifiez les informations
                  et suivez les stocks
                </p>
              </div>
              <div className={styles.pageActions}>
                <button
                  className={styles.addProductButton}
                  onClick={() => setShowAddModal(true)}
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
                  Ajouter un produit
                </button>
              </div>
            </div>
          </section>

          {/* Contenu principal */}
          <section className={styles.productsSection}>
            <div className={styles.productsContainer}>
              {products.length === 0 ? (
                <div className={styles.emptyState}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="64"
                    height="64"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                    <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                    <line x1="12" y1="22.08" x2="12" y2="12"></line>
                  </svg>
                  <h2>Aucun produit disponible</h2>
                  <p>
                    Votre catalogue de produits est vide pour le moment. Cliquez
                    sur "Ajouter un produit" pour commencer.
                  </p>
                </div>
              ) : (
                <div className={styles.productList}>
                  {products.map((product) => (
                    <div
                      key={product._id}
                      className={styles.productCard}
                      onClick={() => handleEditProduct(product)}
                    >
                      {/* Image principale */}
                      <div className={styles.productImageContainer}>
                        <img
                          src={
                            product.images && product.images.length > 0
                              ? product.images[0]
                              : "/images/default-product.png"
                          }
                          alt={product.title}
                          className={styles.productImage}
                        />

                        {/* Les 4 petites images en dessous */}
                        <div className={styles.thumbnailsContainer}>
                          {/* On crée un tableau de 4 éléments pour représenter les positions potentielles */}
                          {[1, 2, 3, 4].map((index) => (
                            <div key={index} className={styles.thumbnailBox}>
                              {/* Si l'image existe dans le tableau product.images, on l'affiche */}
                              {product.images && product.images[index] ? (
                                <img
                                  src={product.images[index]}
                                  alt={`${product.title} - vue ${index + 1}`}
                                  className={styles.thumbnailImage}
                                />
                              ) : (
                                /* Sinon on affiche un placeholder "Ajouter une image" */
                                <div className={styles.addImagePlaceholder}>
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
                                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                                    <polyline points="17 21 17 13 7 13 7 21"></polyline>
                                    <polyline points="7 3 7 8 15 8"></polyline>
                                  </svg>
                                  <span>Ajouter</span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className={styles.productDetails}>
                        <h3>{product.title}</h3>
                        <p>{product.description}</p>
                        <p>
                          <strong>Prix :</strong> {product.price} €
                        </p>
                        <p>
                          <strong>Stock :</strong> {product.stock}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </main>

        {/* Footer simplifié pour l'admin */}
        <footer className={styles.adminFooter}>
          <div className={styles.footerContent}>
            <p className={styles.copyright}>
              © 2025 MonSavonVert. Panneau d'administration.
            </p>
            <div className={styles.footerLinks}>
              <Link href="/admin/help" legacyBehavior>
                <a>Aide</a>
              </Link>
              <Link href="/admin/documentation" legacyBehavior>
                <a>Documentation</a>
              </Link>
              <button
                onClick={() => {
                  localStorage.removeItem("userEmail");
                  localStorage.removeItem("token");
                  localStorage.removeItem("userRole");
                  console.log("Déconnexion réussie");
                  router.push("/login");
                }}
              >
                Se déconnecter
              </button>
            </div>
          </div>
        </footer>
      </div>

      {/* Modal d'ajout de produit */}
      {showAddModal && (
        <div className="modalOverlay">
          <div className="modalContainer">
            <div className="modalHeader">
              <h2>Ajouter un nouveau produit</h2>
              <button
                className="closeModal"
                onClick={() => {
                  setShowAddModal(false);
                  // Réinitialiser les états pour éviter des problèmes lors de la réouverture
                  setFormData({
                    title: "",
                    description: "",
                    price: "",
                    characteristics: "",
                    stock: "0",
                    ingredients: "",
                    usageTips: "",
                    images: [],
                  });
                  setImagePreviews([]);
                }}
              >
                ×
              </button>
            </div>

            <div className="modalBody">
              {isLoading ? (
                <div className="loadingContainer">
                  <div className="spinner"></div>
                  <p>Ajout du produit en cours...</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="productForm">
                  <div className="formColumns">
                    <div className="formColumn">
                      <div className="formGroup">
                        <label htmlFor="title">Titre du produit *</label>
                        <input
                          type="text"
                          id="title"
                          name="title"
                          value={formData.title}
                          onChange={handleFormChange}
                          placeholder="Ex: Savon exfoliant à l'avoine"
                          required
                        />
                      </div>
                      <div className="formGroup">
                        <label htmlFor="price">Prix (€) *</label>
                        <input
                          type="number"
                          id="price"
                          name="price"
                          value={formData.price}
                          onChange={handleFormChange}
                          step="0.01"
                          min="0"
                          placeholder="Ex: 8.90"
                          required
                        />
                      </div>
                      <div className="formGroup">
                        <label htmlFor="stock">Stock *</label>
                        <input
                          type="number"
                          id="stock"
                          name="stock"
                          value={formData.stock}
                          onChange={handleFormChange}
                          min="0"
                          placeholder="Ex: 50"
                          required
                        />
                      </div>

                      {/* Input file caché pour les images - gardé mais invisible */}
                      <input
                        type="file"
                        id="images"
                        name="images"
                        accept="image/*"
                        multiple
                        onChange={(e) => {
                          const files = Array.from(e.target.files);

                          // Calculer combien d'images on peut encore ajouter
                          const remainingSlots = 5 - formData.images.length;

                          if (files.length > remainingSlots) {
                            alert(
                              `Vous ne pouvez sélectionner que ${remainingSlots} image(s) supplémentaire(s)`
                            );
                            return;
                          }

                          // Limiter le nombre de fichiers à ajouter
                          const filesToAdd = files.slice(0, remainingSlots);

                          if (filesToAdd.length === 0) return;

                          // Créer des aperçus pour les nouvelles images
                          const newPreviews = filesToAdd.map((file) =>
                            URL.createObjectURL(file)
                          );

                          // Mettre à jour les aperçus d'images
                          setImagePreviews((prev) => [...prev, ...newPreviews]);

                          // Mettre à jour le formData avec les nouvelles images
                          setFormData((prev) => ({
                            ...prev,
                            images: [...prev.images, ...filesToAdd],
                          }));

                          // Ajouter un log pour le débogage
                          console.log("Images ajoutées:", filesToAdd);
                          console.log("Prévisualisations créées:", newPreviews);
                          console.log(
                            "Total images:",
                            [...formData.images, ...filesToAdd].length
                          );
                        }}
                        className="fileInput"
                      />
                      <div className="formGroup">
                        <label htmlFor="description">Description *</label>
                        <textarea
                          id="description"
                          name="description"
                          value={formData.description}
                          onChange={handleFormChange}
                          rows="3"
                          placeholder="Description courte et attrayante du produit"
                          required
                        ></textarea>
                      </div>
                    </div>

                    <div className="formColumn">
                      <div className="formGroup">
                        <label htmlFor="characteristics">
                          Caractéristiques
                        </label>
                        <textarea
                          id="characteristics"
                          name="characteristics"
                          value={formData.characteristics}
                          onChange={handleFormChange}
                          rows="3"
                          placeholder="Caractéristiques principales du produit"
                        ></textarea>
                      </div>

                      <div className="formGroup">
                        <label htmlFor="ingredients">Ingrédients</label>
                        <textarea
                          id="ingredients"
                          name="ingredients"
                          value={formData.ingredients}
                          onChange={handleFormChange}
                          rows="3"
                          placeholder="Liste des ingrédients"
                        ></textarea>
                      </div>

                      <div className="formGroup">
                        <label htmlFor="usageTips">
                          Conseils d'utilisation
                        </label>
                        <textarea
                          id="usageTips"
                          name="usageTips"
                          value={formData.usageTips}
                          onChange={handleFormChange}
                          rows="3"
                          placeholder="Comment utiliser ce produit"
                        ></textarea>
                      </div>
                    </div>
                  </div>

                  {/* Section des images - titre informatif */}
                  <div className="imagesSection">
                    <h3>
                      Images du produit{" "}
                      <span className="imageCounter">
                        ({formData.images.length}/5)
                      </span>
                    </h3>

                    <div className="imagePreviewSection">
                      {/* Grande image principale */}
                      <div className="mainImageContainer">
                        {imagePreviews.length > 0 ? (
                          <>
                            <img
                              src={imagePreviews[0]}
                              alt="Image principale"
                              className="mainImage"
                            />
                            <button
                              type="button"
                              className="removeImageBtn"
                              onClick={() => {
                                // Supprimer la première image et sa prévisualisation
                                const newPreviews = [...imagePreviews];
                                URL.revokeObjectURL(newPreviews[0]); // Libérer l'URL
                                newPreviews.splice(0, 1);
                                setImagePreviews(newPreviews);

                                // Supprimer également du formData
                                const newImages = [...formData.images];
                                newImages.splice(0, 1);
                                setFormData({ ...formData, images: newImages });

                                console.log("Image principale supprimée");
                              }}
                            >
                              ×
                            </button>
                          </>
                        ) : (
                          // Placeholder pour l'image principale
                          <div
                            className="addImageMainPlaceholder"
                            onClick={() =>
                              document.getElementById("images").click()
                            }
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="48"
                              height="48"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <rect
                                x="3"
                                y="3"
                                width="18"
                                height="18"
                                rx="2"
                                ry="2"
                              ></rect>
                              <circle cx="8.5" cy="8.5" r="1.5"></circle>
                              <polyline points="21 15 16 10 5 21"></polyline>
                              <line x1="12" y1="9" x2="12" y2="15"></line>
                              <line x1="9" y1="12" x2="15" y2="12"></line>
                            </svg>
                            <span>Ajouter l'image principale</span>
                          </div>
                        )}
                      </div>

                      {/* Miniatures (4 emplacements) */}
                      <div className="thumbnailsContainer">
                        {/* On génère 4 emplacements pour les miniatures */}
                        {[1, 2, 3, 4].map((position) => (
                          <div key={position} className="thumbnailBox">
                            {/* On vérifie si une image existe à cette position */}
                            {imagePreviews.length > position ? (
                              <>
                                <img
                                  src={imagePreviews[position]}
                                  alt={`Aperçu ${position}`}
                                  className="thumbnailImage"
                                />
                                <button
                                  type="button"
                                  className="removeThumbnailBtn"
                                  onClick={() => {
                                    // Supprimer l'image et sa prévisualisation
                                    const newPreviews = [...imagePreviews];
                                    URL.revokeObjectURL(newPreviews[position]); // Libérer l'URL
                                    newPreviews.splice(position, 1);
                                    setImagePreviews(newPreviews);

                                    // Supprimer également du formData
                                    const newImages = [...formData.images];
                                    newImages.splice(position, 1);
                                    setFormData({
                                      ...formData,
                                      images: newImages,
                                    });

                                    console.log(
                                      `Miniature ${position} supprimée`
                                    );
                                  }}
                                >
                                  ×
                                </button>
                              </>
                            ) : (
                              // Placeholder pour ajouter une image
                              <div
                                className="addImagePlaceholder"
                                onClick={() =>
                                  document.getElementById("images").click()
                                }
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
                                  <rect
                                    x="3"
                                    y="3"
                                    width="18"
                                    height="18"
                                    rx="2"
                                    ry="2"
                                  ></rect>
                                  <line x1="12" y1="8" x2="12" y2="16"></line>
                                  <line x1="8" y1="12" x2="16" y2="12"></line>
                                </svg>
                                <span>Ajouter</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="formActions">
                    <button
                      type="button"
                      className="cancelButton"
                      onClick={() => setShowAddModal(false)}
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="submitButton"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Ajout en cours..." : "Ajouter"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal d'édition de produit */}
      {showEditModal && selectedProduct && (
        <div className="modalOverlay">
          <div className="modalContainer">
            <div className="modalHeader">
              <h2>Modifier le produit</h2>
              <button
                className="closeModal"
                onClick={() => setShowEditModal(false)}
              >
                ×
              </button>
            </div>

            <div className="modalBody">
              {isLoading ? (
                <div className="loadingContainer">
                  <div className="spinner"></div>
                  <p>Modification en cours...</p>
                </div>
              ) : (
                <form onSubmit={handleUpdateProduct} className="productForm">
                  <div className="formColumns">
                    <div className="formColumn">
                      <div className="formGroup">
                        <label htmlFor="edit-title">Titre du produit *</label>
                        <input
                          type="text"
                          id="edit-title"
                          name="title"
                          value={selectedProduct.title || ""}
                          onChange={(e) =>
                            setSelectedProduct({
                              ...selectedProduct,
                              title: e.target.value,
                            })
                          }
                          placeholder="Ex: Savon exfoliant à l'avoine"
                          required
                        />
                      </div>

                      <div className="formGroup">
                        <label htmlFor="edit-price">Prix (€) *</label>
                        <input
                          type="number"
                          id="edit-price"
                          name="price"
                          value={selectedProduct.price || ""}
                          onChange={(e) =>
                            setSelectedProduct({
                              ...selectedProduct,
                              price: e.target.value,
                            })
                          }
                          step="0.01"
                          min="0"
                          placeholder="Ex: 8.90"
                          required
                        />
                      </div>

                      <div className="formGroup">
                        <label htmlFor="edit-stock">Stock *</label>
                        <input
                          type="number"
                          id="edit-stock"
                          name="stock"
                          value={selectedProduct.stock || 0}
                          onChange={(e) =>
                            setSelectedProduct({
                              ...selectedProduct,
                              stock: e.target.value,
                            })
                          }
                          min="0"
                          placeholder="Ex: 50"
                          required
                        />
                      </div>

                      {/* Input file caché pour les images d'édition */}
                      <input
                        type="file"
                        id="edit-images"
                        name="images"
                        accept="image/*"
                        multiple
                        onChange={handleEditImagesChange}
                        className="fileInput"
                      />
                      <div className="formGroup">
                        <label htmlFor="edit-description">Description *</label>
                        <textarea
                          id="edit-description"
                          name="description"
                          value={selectedProduct.description || ""}
                          onChange={(e) =>
                            setSelectedProduct({
                              ...selectedProduct,
                              description: e.target.value,
                            })
                          }
                          rows="3"
                          placeholder="Description courte et attrayante du produit"
                          required
                        ></textarea>
                      </div>
                    </div>

                    <div className="formColumn">
                      <div className="formGroup">
                        <label htmlFor="edit-characteristics">
                          Caractéristiques
                        </label>
                        <textarea
                          id="edit-characteristics"
                          name="characteristics"
                          value={selectedProduct.characteristics || ""}
                          onChange={(e) =>
                            setSelectedProduct({
                              ...selectedProduct,
                              characteristics: e.target.value,
                            })
                          }
                          rows="3"
                          placeholder="Caractéristiques principales du produit"
                        ></textarea>
                      </div>

                      <div className="formGroup">
                        <label htmlFor="edit-ingredients">Ingrédients</label>
                        <textarea
                          id="edit-ingredients"
                          name="ingredients"
                          value={selectedProduct.ingredients || ""}
                          onChange={(e) =>
                            setSelectedProduct({
                              ...selectedProduct,
                              ingredients: e.target.value,
                            })
                          }
                          rows="3"
                          placeholder="Liste des ingrédients"
                        ></textarea>
                      </div>

                      <div className="formGroup">
                        <label htmlFor="edit-usageTips">
                          Conseils d'utilisation
                        </label>
                        <textarea
                          id="edit-usageTips"
                          name="usageTips"
                          value={selectedProduct.usageTips || ""}
                          onChange={(e) =>
                            setSelectedProduct({
                              ...selectedProduct,
                              usageTips: e.target.value,
                            })
                          }
                          rows="3"
                          placeholder="Comment utiliser ce produit"
                        ></textarea>
                      </div>
                    </div>
                  </div>

                  {/* Section des images en édition */}
                  <div className="imagesSection">
                    <h3>
                      Images du produit{" "}
                      <span className="imageCounter">
                        (
                        {(selectedProduct.images &&
                          selectedProduct.images.length) ||
                          0}
                        /5)
                      </span>
                    </h3>

                    <div className="imagePreviewSection">
                      {/* Grande image principale */}
                      <div className="mainImageContainer">
                        {selectedProduct.images &&
                        selectedProduct.images.length > 0 ? (
                          <>
                            <img
                              src={
                                // Gestion des différents formats d'images possibles
                                typeof selectedProduct.images[0] === "string"
                                  ? selectedProduct.images[0]
                                  : selectedProduct.images[0]?.preview
                                  ? selectedProduct.images[0].preview
                                  : selectedProduct.images[0]?.url
                                  ? selectedProduct.images[0].url
                                  : selectedProduct.images[0]?.file
                                  ? URL.createObjectURL(
                                      selectedProduct.images[0].file
                                    )
                                  : "/images/default-product.png"
                              }
                              alt="Image principale"
                              className="mainImage"
                            />
                            <button
                              type="button"
                              className="removeImageBtn"
                              onClick={() => {
                                // Créer une copie du tableau d'images
                                const newImages = [...selectedProduct.images];

                                // Si c'est un objet blob, révoquer l'URL
                                if (newImages[0]?.preview) {
                                  URL.revokeObjectURL(newImages[0].preview);
                                }

                                // Supprimer l'image à l'index 0
                                newImages.splice(0, 1);

                                // Mettre à jour selectedProduct
                                setSelectedProduct({
                                  ...selectedProduct,
                                  images: newImages,
                                });

                                console.log(
                                  "Image principale supprimée (édition)"
                                );
                              }}
                            >
                              ×
                            </button>
                          </>
                        ) : (
                          // Placeholder pour l'image principale
                          <div
                            className="addImageMainPlaceholder"
                            onClick={() =>
                              document.getElementById("edit-images").click()
                            }
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="48"
                              height="48"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <rect
                                x="3"
                                y="3"
                                width="18"
                                height="18"
                                rx="2"
                                ry="2"
                              ></rect>
                              <circle cx="8.5" cy="8.5" r="1.5"></circle>
                              <polyline points="21 15 16 10 5 21"></polyline>
                              <line x1="12" y1="9" x2="12" y2="15"></line>
                              <line x1="9" y1="12" x2="15" y2="12"></line>
                            </svg>
                            <span>Ajouter l'image principale</span>
                          </div>
                        )}
                      </div>

                      {/* Miniatures (4 emplacements) */}
                      <div className="thumbnailsContainer">
                        {/* On génère 4 emplacements pour les miniatures */}
                        {[1, 2, 3, 4].map((position) => (
                          <div key={position} className="thumbnailBox">
                            {/* On vérifie si une image existe à cette position */}
                            {selectedProduct.images &&
                            selectedProduct.images.length > position ? (
                              <>
                                <img
                                  src={
                                    // Gestion des différents formats d'images possibles
                                    typeof selectedProduct.images[position] ===
                                    "string"
                                      ? selectedProduct.images[position]
                                      : selectedProduct.images[position]
                                          ?.preview
                                      ? selectedProduct.images[position].preview
                                      : selectedProduct.images[position]?.url
                                      ? selectedProduct.images[position].url
                                      : selectedProduct.images[position]?.file
                                      ? URL.createObjectURL(
                                          selectedProduct.images[position].file
                                        )
                                      : "/images/default-product.png"
                                  }
                                  alt={`Aperçu ${position}`}
                                  className="thumbnailImage"
                                />
                                <button
                                  type="button"
                                  className="removeThumbnailBtn"
                                  onClick={() => {
                                    // Créer une copie du tableau d'images
                                    const newImages = [
                                      ...selectedProduct.images,
                                    ];

                                    // Si c'est un objet blob, révoquer l'URL
                                    if (newImages[position]?.preview) {
                                      URL.revokeObjectURL(
                                        newImages[position].preview
                                      );
                                    }

                                    // Supprimer l'image à cet index
                                    newImages.splice(position, 1);

                                    // Mettre à jour selectedProduct
                                    setSelectedProduct({
                                      ...selectedProduct,
                                      images: newImages,
                                    });

                                    console.log(
                                      `Miniature ${position} supprimée (édition)`
                                    );
                                  }}
                                >
                                  ×
                                </button>
                              </>
                            ) : (
                              // Placeholder pour ajouter une image
                              <div
                                className="addImagePlaceholder"
                                onClick={() =>
                                  document.getElementById("edit-images").click()
                                }
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
                                  <rect
                                    x="3"
                                    y="3"
                                    width="18"
                                    height="18"
                                    rx="2"
                                    ry="2"
                                  ></rect>
                                  <line x1="12" y1="8" x2="12" y2="16"></line>
                                  <line x1="8" y1="12" x2="16" y2="12"></line>
                                </svg>
                                <span>Ajouter</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="formActions">
                    <button
                      type="button"
                      className="cancelButton"
                      onClick={() => setShowEditModal(false)}
                    >
                      Annuler
                    </button>

                    <button
                      type="button"
                      className="deleteButton"
                      onClick={handleDeleteProduct}
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
                        <path d="M3 6h18"></path>
                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                        <line x1="10" y1="11" x2="10" y2="17"></line>
                        <line x1="14" y1="11" x2="14" y2="17"></line>
                      </svg>
                      Supprimer
                    </button>
                    <button type="submit" className="submitButton">
                      Enregistrer
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de notification */}

      {showNotificationModal && (
        <div className="notificationModal">
          <div className={`notificationContent ${notificationType}`}>
            <div className="notificationIcon">
              {notificationType === "success" ? (
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
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
              ) : (
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
              )}
            </div>
            <div className="notificationMessage">{notificationMessage}</div>
            <button
              className="notificationClose"
              onClick={() => setShowNotificationModal(false)}
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Modal de confirmation */}
      {showConfirmationModal && (
        <div className="modalOverlay">
          <div className="confirmationModal">
            <div className="confirmationHeader">
              <h3>Confirmation</h3>
            </div>
            <div className="confirmationBody">
              <div className="confirmationIcon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="48"
                  height="48"
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
              <p>{confirmationMessage}</p>
            </div>
            <div className="confirmationActions">
              <button
                className="confirmCancel"
                onClick={() => setShowConfirmationModal(false)}
              >
                Annuler
              </button>
              <button className="confirmAction" onClick={confirmationAction}>
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Styles pour le modal et l'état vide */}
<style jsx>{`
  /* Style général pour le modal */
  .modalOverlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    animation: fadeIn 0.25s ease-out;
    backdrop-filter: blur(5px);
  }

  .modalContainer {
    background-color: white;
    border-radius: 16px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
    width: 90%;
    max-width: 900px;
    max-height: 90vh;
    overflow-y: auto;
    animation: slideUp 0.35s ease-out forwards;
    position: relative;
  }

  .modalHeader {
    padding: 24px 32px;
    border-bottom: 1px solid #f0f0f0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: sticky;
    top: 0;
    background-color: white;
    z-index: 10;
    border-radius: 16px 16px 0 0;
  }

  .modalHeader h2 {
    font-size: 24px;
    font-weight: 600;
    color: #222;
    margin: 0;
  }

  .closeModal {
    background: none;
    border: none;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #555;
    font-size: 28px;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .closeModal:hover {
    background-color: #f5f5f5;
    color: #333;
    transform: rotate(90deg);
  }

  .modalBody {
    padding: 32px;
  }

  /* Style du formulaire */
  .productForm {
    display: flex;
    flex-direction: column;
    gap: 32px;
  }

  .formColumns {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 32px;
  }

  .formColumn {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  .formGroup {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .formGroup label {
    font-size: 15px;
    font-weight: 500;
    color: #444;
    display: flex;
    align-items: center;
    gap: 5px;
  }

  .formGroup input[type="text"],
  .formGroup input[type="number"],
  .formGroup textarea {
    padding: 14px 16px;
    border: 1px solid #e0e0e0;
    border-radius: 12px;
    font-size: 15px;
    color: #333;
    transition: all 0.2s ease;
    background-color: #f9f9f9;
  }

  .formGroup input[type="text"]:focus,
  .formGroup input[type="number"]:focus,
  .formGroup textarea:focus {
    outline: none;
    border-color: #2e7d32;
    background-color: white;
    box-shadow: 0 0 0 3px rgba(46, 125, 50, 0.1);
  }

  /* Style pour la section d'images */
  .imagesSection {
    background-color: #f9f9f9;
    border-radius: 16px;
    padding: 24px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  }

  .imagesSection h3 {
    margin-top: 0;
    margin-bottom: 16px;
    color: #333;
    font-size: 18px;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .imageCounter {
    font-size: 14px;
    background-color: #e8f5e9;
    color: #2e7d32;
    padding: 4px 10px;
    border-radius: 20px;
    font-weight: 500;
  }

  /* Section d'aperçu des images */
  .imagePreviewSection {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  /* Conteneur de l'image principale */
  .mainImageContainer {
    position: relative;
    width: 100%;
    height: 250px;
    border-radius: 12px;
    overflow: hidden;
    background-color: white;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.06);
    transition: transform 0.3s ease;
  }
  
  .mainImageContainer:hover {
    transform: scale(1.02);
  }

  /* Image principale */
  .mainImage {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  /* Bouton pour supprimer l'image principale */
  .removeImageBtn {
    position: absolute;
    top: 10px;
    right: 10px;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background-color: rgba(255, 255, 255, 0.9);
    border: none;
    font-size: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: #e53935;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
    transition: all 0.2s ease;
    opacity: 0;
    transform: scale(0.8);
  }

  .mainImageContainer:hover .removeImageBtn {
    opacity: 1;
    transform: scale(1);
  }

  .removeImageBtn:hover {
    background-color: #e53935;
    color: white;
    transform: scale(1.1);
  }

  /* Container pour les miniatures */
  .thumbnailsContainer {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
  }

  /* Boîte de miniature */
  .thumbnailBox {
    position: relative;
    aspect-ratio: 1/1;
    border-radius: 12px;
    overflow: hidden;
    background-color: white;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
  }

  .thumbnailBox:hover {
    transform: scale(1.05);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  }

  /* Image de miniature */
  .thumbnailImage {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  /* Bouton pour supprimer une miniature */
  .removeThumbnailBtn {
    position: absolute;
    top: 6px;
    right: 6px;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background-color: rgba(255, 255, 255, 0.9);
    border: none;
    font-size: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: #e53935;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    transition: all 0.2s ease;
    opacity: 0;
    transform: scale(0.8);
    z-index: 5;
  }

  .thumbnailBox:hover .removeThumbnailBtn {
    opacity: 1;
    transform: scale(1);
  }

  .removeThumbnailBtn:hover {
    background-color: #e53935;
    color: white;
  }

  /* Styles pour les placeholders d'images */
  .addImageMainPlaceholder {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background-color: #f0f5f0;
    cursor: pointer;
    border-radius: 12px;
    border: 2px dashed #c0d6c0;
    transition: all 0.3s ease;
  }

  .addImageMainPlaceholder:hover {
    background-color: #e8f5e9;
    border-color: #2e7d32;
    transform: scale(1.01);
  }

  .addImageMainPlaceholder svg {
    color: #2e7d32;
    margin-bottom: 16px;
    opacity: 0.8;
    transition: all 0.3s ease;
  }

  .addImageMainPlaceholder:hover svg {
    transform: scale(1.1);
    opacity: 1;
  }

  .addImageMainPlaceholder span {
    font-size: 15px;
    color: #43a047;
    font-weight: 500;
    transition: all 0.3s ease;
  }

  .addImageMainPlaceholder:hover span {
    color: #2e7d32;
  }

  .addImagePlaceholder {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background-color: #f0f5f0;
    cursor: pointer;
    border-radius: 12px;
    border: 2px dashed #c0d6c0;
    transition: all 0.3s ease;
  }

  .addImagePlaceholder:hover {
    background-color: #e8f5e9;
    border-color: #2e7d32;
    transform: scale(1.05);
  }

  .addImagePlaceholder svg {
    color: #2e7d32;
    margin-bottom: 8px;
    opacity: 0.8;
    transition: all 0.3s ease;
  }

  .addImagePlaceholder:hover svg {
    transform: scale(1.1);
    opacity: 1;
  }

  .addImagePlaceholder span {
    font-size: 13px;
    color: #43a047;
    font-weight: 500;
  }

  /* Cacher l'input file */
  .fileInput {
    display: none;
  }

  /* Actions du formulaire */
  .formActions {
    display: flex;
    justify-content: flex-end;
    gap: 16px;
    padding-top: 20px;
  }

  .cancelButton,
  .submitButton,
  .deleteButton {
    padding: 12px 24px;
    border-radius: 12px;
    font-size: 15px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }

  .cancelButton {
    background-color: white;
    border: 1px solid #e0e0e0;
    color: #666;
  }

  .cancelButton:hover {
    background-color: #f5f5f5;
    color: #333;
  }

  .submitButton {
    background-color: #2e7d32;
    border: none;
    color: white;
    box-shadow: 0 4px 10px rgba(46, 125, 50, 0.2);
  }

  .submitButton:hover {
    background-color: #1b5e20;
    transform: translateY(-2px);
    box-shadow: 0 6px 15px rgba(46, 125, 50, 0.25);
  }

  .submitButton:active {
    transform: translateY(0);
    box-shadow: 0 2px 5px rgba(46, 125, 50, 0.2);
  }

  .deleteButton {
    background-color: white;
    border: 1px solid #e57373;
    color: #e53935;
    position: relative;
    overflow: hidden;
  }

  .deleteButton svg {
    transition: transform 0.3s ease;
  }

  .deleteButton:hover {
    background-color: #ffebee;
    border-color: #e53935;
    color: #c62828;
  }

  .deleteButton:hover svg {
    transform: rotate(15deg);
  }

  /* Chargement */
  .loadingContainer {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px 20px;
    height: 300px;
  }

  .spinner {
    width: 50px;
    height: 50px;
    border: 3px solid rgba(46, 125, 50, 0.1);
    border-radius: 50%;
    border-top-color: #2e7d32;
    animation: spin 1s linear infinite;
    margin-bottom: 20px;
  }

  .loadingContainer p {
    color: #555;
    font-size: 16px;
    font-weight: 500;
  }

  /* État vide */
  .emptyState {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 100px 20px;
    text-align: center;
    background-color: #f9f9f9;
    border-radius: 16px;
    margin: 20px 0;
  }

  .emptyState svg {
    color: #a5d6a7;
    margin-bottom: 24px;
  }

  .emptyState h2 {
    font-size: 22px;
    margin-bottom: 12px;
    color: #2e7d32;
  }

  .emptyState p {
    color: #666;
    max-width: 450px;
    line-height: 1.6;
  }

  /* Animations */
  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(40px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  /* Responsive design */
  @media (max-width: 768px) {
    .modalContainer {
      width: 95%;
      border-radius: 12px;
    }
    
    .modalHeader {
      padding: 16px 20px;
    }
    
    .modalBody {
      padding: 20px;
    }
    
    .formColumns {
      grid-template-columns: 1fr;
      gap: 20px;
    }
    
    .thumbnailsContainer {
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
    }
    
    .formActions {
      flex-direction: column-reverse;
    }
    
    .submitButton, .cancelButton, .deleteButton {
      width: 100%;
    }
  }
`}</style>
    </>
  );
}
