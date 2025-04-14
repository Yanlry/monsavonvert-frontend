"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import styles from "../../styles/admin-products.module.css";

export default function AdminProducts() {
  const router = useRouter();

  // États de base
  const [isClient, setIsClient] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productImages, setProductImages] = useState([]);

  // État pour gérer le modal d'ajout de produit
  const [showAddModal, setShowAddModal] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

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
    image: null,
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
    const fetchProducts = async () => {
      try {
        const response = await fetch("http://localhost:8888/products");
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
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // Soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
  
    // Validation de base
    if (!formData.title || !formData.description || !formData.price || !formData.stock) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }
  
    try {
      setIsLoading(true);
  
      // Préparer les données à envoyer
      const productData = new FormData();
      productData.append('title', formData.title);
      productData.append('description', formData.description);
      productData.append('price', formData.price);
      productData.append('characteristics', formData.characteristics);
      productData.append('stock', formData.stock);
      productData.append('ingredients', formData.ingredients);
      productData.append('usageTips', formData.usageTips);
  
      if (formData.image) {
        productData.append('image', formData.image); // Ajouter l'image
      }
  
      // Appel API vers le backend
      const response = await fetch('http://localhost:8888/products/add', {
        method: 'POST',
        body: productData, // Envoyer les données sous forme de FormData
      });
  
      if (!response.ok) {
        throw new Error('Erreur lors de l\'ajout du produit');
      }
  
      const result = await response.json();
      console.log('Produit ajouté:', result);
  
      // Réinitialisation du formulaire
      setFormData({
        title: '',
        description: '',
        price: '',
        characteristics: '',
        stock: '0',
        ingredients: '',
        usageTips: '',
        image: null,
      });
      setImagePreview(null);
      setShowAddModal(false);
      alert('Produit ajouté avec succès !');
    } catch (error) {
      console.error('Erreur lors de l\'ajout du produit:', error);
      alert('Une erreur est survenue lors de l\'ajout du produit');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteProduct = async () => {
    // Fonction exécutée après confirmation
    const performDelete = async () => {
      try {
        setIsLoading(true);

        const response = await fetch(
          `http://localhost:8888/products/delete/${selectedProduct._id}`,
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
        showNotification("error", "Une erreur est survenue lors de la suppression du produit");
      } finally {
        setIsLoading(false);
        setShowConfirmationModal(false);
      }
    };

    // Demander confirmation avant suppression
    askConfirmation("Êtes-vous sûr de vouloir supprimer ce produit ?", performDelete);
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
  
    try {
      setIsLoading(true);
  
      const productData = new FormData();
      productData.append('title', selectedProduct.title);
      productData.append('description', selectedProduct.description);
      productData.append('price', parseFloat(selectedProduct.price));
      productData.append('characteristics', selectedProduct.characteristics);
      productData.append('stock', parseInt(selectedProduct.stock, 10));
      productData.append('ingredients', selectedProduct.ingredients);
      productData.append('usageTips', selectedProduct.usageTips);
  
      // Ajouter la nouvelle image si elle existe
      if (selectedProduct.newImage) {
        productData.append('image', selectedProduct.newImage);
      }
  
      const response = await fetch(
        `http://localhost:8888/products/update/${selectedProduct._id}`,
        {
          method: 'PUT',
          body: productData, // Envoyer les données sous forme de FormData
        }
      );
  
      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour du produit');
      }
  
      const result = await response.json();
      console.log('Produit mis à jour:', result);
  
      // Mettre à jour la liste des produits
      setProducts((prevProducts) =>
        prevProducts.map((product) =>
          product._id === result.product._id ? result.product : product
        )
      );
  
      setShowEditModal(false);
      showNotification('success', 'Produit mis à jour avec succès !');
    } catch (error) {
      console.error('Erreur lors de la mise à jour du produit:', error);
      showNotification('error', 'Une erreur est survenue lors de la mise à jour du produit');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditProduct = (product) => {
    setSelectedProduct(product);
    setShowEditModal(true);
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

      <div className={styles.globalWrapper}>
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
                 <img
  src={product.image || '/images/default-product.png'}
  alt={product.title}
  className={styles.productImage}
/>
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
                onClick={() => setShowAddModal(false)}
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

                      <div className="formGroup">
                        <label htmlFor="image">Image du produit</label>
                        <div className="imageUploadContainer">
                          <input
                            type="file"
                            id="image"
                            name="image"
                            accept="image/*"
                            onChange={handleFormChange}
                            className="fileInput"
                          />
                          <label htmlFor="image" className="customFileUpload">
                            <div className="uploadIconContainer">
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
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                <polyline points="17 8 12 3 7 8"></polyline>
                                <line x1="12" y1="3" x2="12" y2="15"></line>
                              </svg>
                            </div>
                            <span>Choisir une image</span>
                          </label>
                          {imagePreview && (
                            <div className="imagePreviewContainer">
                              <img
                                src={imagePreview}
                                alt="Aperçu"
                                className="imagePreview"
                              />
                              <button
                                type="button"
                                className="removeImageBtn"
                                onClick={() => {
                                  setImagePreview(null);
                                  setFormData({ ...formData, image: null });
                                  document.getElementById("image").value = "";
                                }}
                              >
                                ×
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="formColumn">
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

                  <div className="formActions">
                    <button
                      type="button"
                      className="cancelButton"
                      onClick={() => setShowAddModal(false)}
                    >
                      Annuler
                    </button>
                    <button type="submit" className="submitButton">
                      Ajouter le produit
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

                      <div className="formGroup">
                        <label htmlFor="edit-image">Image du produit</label>
                        <div className="imageUploadContainer">
                          <input
                            type="file"
                            id="edit-image"
                            name="image"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files[0];
                              if (file) {
                                setSelectedProduct({
                                  ...selectedProduct,
                                  newImage: file,
                                });

                                // Prévisualisation de l'image
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                  setSelectedProduct({
                                    ...selectedProduct,
                                    newImage: file,
                                    imagePreview: reader.result,
                                  });
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                            className="fileInput"
                          />
                          <label
                            htmlFor="edit-image"
                            className="customFileUpload"
                          >
                            <div className="uploadIconContainer">
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
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                <polyline points="17 8 12 3 7 8"></polyline>
                                <line x1="12" y1="3" x2="12" y2="15"></line>
                              </svg>
                            </div>
                            <span>Choisir une nouvelle image</span>
                          </label>

                          {/* Afficher l'image actuelle ou la nouvelle prévisualisation */}
                          {(selectedProduct.imagePreview ||
                            selectedProduct.imageUrl) && (
                            <div className="imagePreviewContainer">
                              <img
                                src={
                                  selectedProduct.imagePreview ||
                                  selectedProduct.imageUrl
                                }
                                alt="Aperçu"
                                className="imagePreview"
                              />
                              <button
                                type="button"
                                className="removeImageBtn"
                                onClick={() => {
                                  setSelectedProduct({
                                    ...selectedProduct,
                                    newImage: null,
                                    imagePreview: null,
                                    imageUrl: null,
                                  });
                                  document.getElementById("edit-image").value =
                                    "";
                                }}
                              >
                                ×
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="formColumn">
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
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
              )}
            </div>
            <div className="notificationMessage">
              {notificationMessage}
            </div>
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
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
              <button 
                className="confirmAction"
                onClick={confirmationAction}
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Styles pour le modal et l'état vide */}
      <style jsx>{`
        .emptyState {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 100px 20px;
          text-align: center;
          background-color: #f9f9f9;
          border-radius: 8px;
          margin: 20px 0;
        }

        .emptyState svg {
          color: #cecece;
          margin-bottom: 20px;
        }

        .emptyState h2 {
          font-size: 20px;
          margin-bottom: 10px;
          color: #333;
        }

        .emptyState p {
          color: #666;
          max-width: 400px;
          line-height: 1.6;
        }

        .productsSection {
          flex: 1;
          padding: 30px 0;
        }

        .productsContainer {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 30px;
        }

        .addProductButton {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          background-color: #2e7d32;
          color: white;
          border: none;
          border-radius: 4px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .deleteButton {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px 24px;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          background-color: #fff;
          color: #f44336;
          border: 1px solid #f44336;
          position: relative;
          overflow: hidden;
        }

        .deleteButton svg {
          transition: transform 0.3s ease;
        }

        .deleteButton:hover {
          background-color: #f44336;
          color: white;
          box-shadow: 0 4px 8px rgba(244, 67, 54, 0.3);
          transform: translateY(-1px);
        }

        .deleteButton:hover svg {
          transform: rotate(12deg);
        }

        .deleteButton:active {
          transform: translateY(1px);
          box-shadow: 0 2px 4px rgba(244, 67, 54, 0.3);
        }

        .addProductButton:hover {
          background-color: #1b5e20;
        }

        /* Styles du modal */
        .modalOverlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          animation: fadeIn 0.2s ease-in-out;
        }

        .modalContainer {
          background-color: white;
          border-radius: 8px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
          width: 90%;
          max-width: 800px;
          max-height: 90vh;
          overflow-y: auto;
          animation: slideIn 0.3s ease-out;
        }

        .modalHeader {
          padding: 20px;
          border-bottom: 1px solid #eaeaea;
          display: flex;
          justify-content: space-between;
          align-items: center;
          position: sticky;
          top: 0;
          background-color: white;
          z-index: 1;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }

        .modalHeader h2 {
          font-size: 20px;
          font-weight: 600;
          color: #333;
          margin: 0;
        }

        .closeModal {
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: #666;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          transition: all 0.2s;
        }

        .closeModal:hover {
          background-color: #f5f5f5;
          color: #333;
        }

        .modalBody {
          padding: 20px;
        }

        /* Styles du formulaire */
        .productForm {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .formColumns {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
        }

        .formColumn {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .formGroup {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .formGroup label {
          font-size: 14px;
          font-weight: 500;
          color: #333;
        }

        .formGroup input[type="text"],
        .formGroup input[type="number"],
        .formGroup textarea {
          padding: 12px;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 14px;
          transition: all 0.2s;
        }

        .formGroup input[type="text"]:focus,
        .formGroup input[type="number"]:focus,
        .formGroup textarea:focus {
          outline: none;
          border-color: #2e7d32;
          box-shadow: 0 0 0 2px rgba(46, 125, 50, 0.1);
        }

        /* Styles pour l'upload d'image */
        .imageUploadContainer {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .fileInput {
          display: none;
        }

        .customFileUpload {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 20px;
          border: 2px dashed #ddd;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .customFileUpload:hover {
          border-color: #2e7d32;
          background-color: rgba(46, 125, 50, 0.05);
        }

        .uploadIconContainer {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background-color: rgba(46, 125, 50, 0.1);
          color: #2e7d32;
          margin-bottom: 12px;
        }

        .imagePreviewContainer {
          position: relative;
          width: 100%;
          border-radius: 6px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .imagePreview {
          width: 100%;
          height: auto;
          display: block;
        }

        .removeImageBtn {
          position: absolute;
          top: 8px;
          right: 8px;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background-color: rgba(0, 0, 0, 0.6);
          color: white;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 16px;
          transition: all 0.2s;
        }

        .removeImageBtn:hover {
          background-color: rgba(0, 0, 0, 0.8);
        }

        /* Actions du formulaire */
        .formActions {
          display: flex;
          justify-content: flex-end;
          gap: 16px;
          padding-top: 16px;
          border-top: 1px solid #eaeaea;
        }

        .cancelButton,
        .submitButton {
          padding: 12px 24px;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .cancelButton {
          background-color: white;
          border: 1px solid #ddd;
          color: #333;
        }

        .cancelButton:hover {
          background-color: #f5f5f5;
        }

        .submitButton {
          background-color: #2e7d32;
          border: none;
          color: white;
        }

        .submitButton:hover {
          background-color: #1b5e20;
        }

        /* Chargement */
        .loadingContainer {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 40px;
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid rgba(46, 125, 50, 0.1);
          border-radius: 50%;
          border-top-color: #2e7d32;
          animation: spin 1s ease-in-out infinite;
          margin-bottom: 16px;
        }

        /* Notification Modal */
        .notificationModal {
          position: fixed;
          bottom: 30px;
          right: 30px;
          z-index: 1010;
          animation: slideUp 0.3s ease-out;
        }

        .notificationContent {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px 20px;
          border-radius: 8px;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
          max-width: 400px;
          min-width: 300px;
          position: relative;
          background-color: white;
        }

        .notificationContent.success {
          border-left: 4px solid #4caf50;
        }

        .notificationContent.error {
          border-left: 4px solid #f44336;
        }

        .notificationIcon {
          flex-shrink: 0;
        }

        .notificationContent.success .notificationIcon {
          color: #4caf50;
        }

        .notificationContent.error .notificationIcon {
          color: #f44336;
        }

        .notificationMessage {
          font-size: 14px;
          color: #333;
          line-height: 1.4;
          flex-grow: 1;
        }

        .notificationClose {
          position: absolute;
          top: 8px;
          right: 8px;
          background: none;
          border: none;
          font-size: 18px;
          color: #999;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          transition: all 0.2s;
        }

        .notificationClose:hover {
          background-color: rgba(0, 0, 0, 0.05);
          color: #666;
        }

        /* Confirmation Modal */
        .confirmationModal {
          background-color: white;
          border-radius: 8px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
          width: 90%;
          max-width: 420px;
          overflow: hidden;
          animation: pop 0.3s ease-out;
        }

        .confirmationHeader {
          padding: 16px 20px;
          border-bottom: 1px solid #eaeaea;
        }

        .confirmationHeader h3 {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
          color: #333;
        }

        .confirmationBody {
          padding: 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
          text-align: center;
        }

        .confirmationIcon {
          color: #ff9800;
        }

        .confirmationBody p {
          margin: 0;
          color: #555;
          font-size: 16px;
          line-height: 1.5;
        }

        .confirmationActions {
          display: flex;
          border-top: 1px solid #eaeaea;
        }

        .confirmationActions button {
          flex: 1;
          padding: 14px;
          border: none;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .confirmCancel {
          background-color: #f5f5f5;
          color: #666;
        }

        .confirmCancel:hover {
          background-color: #e0e0e0;
        }

        .confirmAction {
          background-color: #f44336;
          color: white;
        }

        .confirmAction:hover {
          background-color: #d32f2f;
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

        @keyframes slideIn {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        @keyframes pop {
          0% {
            transform: scale(0.9);
            opacity: 0;
          }
          40% {
            transform: scale(1.05);
            opacity: 1;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        /* Responsive design */
        @media (max-width: 768px) {
          .formColumns {
            grid-template-columns: 1fr;
          }

          .modalContainer {
            width: 95%;
            max-height: 95vh;
          }
          
          .notificationModal {
            bottom: 20px;
            right: 20px;
            left: 20px;
          }
          
          .notificationContent {
            min-width: auto;
            width: 100%;
          }
        }
      `}</style>
    </>
  );
}