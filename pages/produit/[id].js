import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import styles from "../../styles/product.module.css";
import Header from "../../components/Header";
import ReviewSystem from "../../components/ReviewSystem";
import Footer from "../footer"; // NOUVEAU: Import du composant footer

export default function ProductDetail({ product }) {
  const router = useRouter();
  const { id } = router.query;
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  if (!id) {
    console.error("ID du produit introuvable !");
    return null; // Ou affichez un message d'erreur
  }

  // États pour la page
  const [isClient, setIsClient] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");
  const [activeImage, setActiveImage] = useState(0);
  const [showZoomModal, setShowZoomModal] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const productImageRef = useRef(null);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const [selectedSize, setSelectedSize] = useState(0);

  // NOUVEAUX ÉTATS pour la gestion des avis et de la moyenne
  const [currentReviews, setCurrentReviews] = useState(product.reviews || []);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);

  // NOUVELLE FONCTION : Calculer la moyenne des avis
  const calculateAverageRating = (reviews) => {
    console.log("📊 Calcul de la moyenne des avis...");
    console.log("📝 Nombre d'avis reçus:", reviews.length);

    if (!reviews || reviews.length === 0) {
      console.log("❌ Aucun avis trouvé, moyenne = 0");
      return { average: 0, total: 0 };
    }

    // Calculer la somme des notes
    const totalRating = reviews.reduce((sum, review) => {
      const rating = Number(review.rating);
      console.log(`⭐ Avis: ${rating} étoiles`);
      return sum + (isNaN(rating) ? 0 : rating);
    }, 0);

    const average = totalRating / reviews.length;
    console.log(
      `✅ Moyenne calculée: ${average.toFixed(2)} (${totalRating}/${
        reviews.length
      })`
    );

    return {
      average: Math.round(average * 10) / 10, // Arrondir à 1 décimale
      total: reviews.length,
    };
  };

  // NOUVELLE FONCTION : Rendu des étoiles avec moyenne
  const renderStars = (rating, showNumber = false) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
      <div className={styles.ratingDisplay}>
        <div className={styles.ratingStars}>
          {/* Étoiles pleines */}
          {"★".repeat(fullStars)}
          {/* Demi-étoile si nécessaire */}
          {hasHalfStar && "⭐"}
          {/* Étoiles vides */}
          {"☆".repeat(emptyStars)}
        </div>
      </div>
    );
  };

  // EFFET pour mettre à jour la moyenne quand les avis changent
  useEffect(() => {
    console.log("🔄 Mise à jour de la moyenne des avis");
    const { average, total } = calculateAverageRating(currentReviews);
    setAverageRating(average);
    setTotalReviews(total);

    console.log(`📊 Nouvelle moyenne: ${average} sur ${total} avis`);
  }, [currentReviews]);

  // EFFET initial pour charger les avis du produit
  useEffect(() => {
    console.log("🔄 Initialisation des avis du produit");
    console.log("📦 Avis du produit:", product.reviews?.length || 0);

    if (product.reviews) {
      setCurrentReviews(product.reviews);
    }
  }, [product]);

  // NOUVELLE FONCTION : Callback pour mettre à jour les avis depuis ReviewSystem
  const handleReviewsUpdate = (newReviews) => {
    console.log("🔄 Mise à jour des avis depuis ReviewSystem");
    console.log("📝 Nouveaux avis:", newReviews.length);
    setCurrentReviews(newReviews);
  };

  // Simulation d'ajout au panier avec notification
  const addToCart = () => {
    const storedCart = JSON.parse(localStorage.getItem("cart") || "[]");
    const existingItem = storedCart.find((item) => item.id === product._id);

    // Calculer la quantité totale possible
    const maxQuantity = Math.min(20, product.stock);

    if (existingItem) {
      // Vérifier si la quantité totale dépasse la limite
      if (existingItem.quantity + quantity > maxQuantity) {
        alert(
          `Vous ne pouvez ajouter que ${
            maxQuantity - existingItem.quantity
          } article(s) supplémentaire(s) pour ce produit.`
        );
        return;
      }
      existingItem.quantity += quantity;
    } else {
      // Vérifier si la quantité initiale dépasse la limite
      if (quantity > maxQuantity) {
        alert(
          `Vous ne pouvez ajouter que ${maxQuantity} article(s) pour ce produit.`
        );
        return;
      }
      storedCart.push({
        id: product._id,
        name: product.title,
        price: product.price,
        image: product.images[0],
        quantity,
      });
    }

    localStorage.setItem("cart", JSON.stringify(storedCart));
    setCartCount((prevCount) => {
      const newItems = storedCart.reduce((sum, item) => sum + item.quantity, 0);
      return newItems;
    });

    if (typeof window !== "undefined") {
      const cartIcon = document.getElementById("cartIcon");
      if (cartIcon) {
        cartIcon.classList.add(styles.cartBump);
        setTimeout(() => cartIcon.classList.remove(styles.cartBump), 300);
      }
    }
  };

  // Fonction pour acheter directement
  const buyNow = () => {
    console.log("🛒 Début de l'achat direct");
    console.log("📦 Produit actuel :", product);
    console.log("🔢 Quantité sélectionnée :", quantity);

    // Vérifier la quantité maximum
    const maxQuantity = Math.min(20, product.stock);
    if (quantity > maxQuantity) {
      console.error("❌ Quantité trop élevée :", quantity, "max:", maxQuantity);
      alert(
        `Vous ne pouvez acheter que ${maxQuantity} article(s) pour ce produit.`
      );
      return;
    }

    // Créer un panier temporaire avec juste ce produit
    const directPurchaseItem = {
      id: product._id,
      name: product.title,
      price: product.price,
      image: product.images[0],
      quantity: quantity,
      size: selectedSize, // Si tu utilises les tailles
    };

    console.log("📦 Produit pour achat direct :", directPurchaseItem);

    // Sauvegarder dans le localStorage pour la page checkout
    try {
      // IMPORTANT : Sauvegarder d'abord le type d'achat
      localStorage.setItem("purchaseType", "direct");
      console.log("✅ Type d'achat sauvegardé : direct");

      // Ensuite sauvegarder les données produit
      localStorage.setItem(
        "directPurchase",
        JSON.stringify([directPurchaseItem])
      );
      console.log("✅ Produit sauvegardé pour achat direct");

      // Vérifier que ça a bien été sauvegardé
      const verification1 = localStorage.getItem("purchaseType");
      const verification2 = localStorage.getItem("directPurchase");
      console.log("🔍 Vérification purchaseType :", verification1);
      console.log("🔍 Vérification directPurchase :", verification2);

      // Attendre un petit délai pour être sûr que localStorage est écrit
      setTimeout(() => {
        console.log("🚀 Redirection vers checkout...");
        router.push("/checkout");
      }, 100); // 100ms de délai
    } catch (error) {
      console.error("❌ Erreur lors de la sauvegarde :", error);
      alert("Une erreur est survenue. Veuillez réessayer.");
    }
  };

  // Toggle wishlist
  const toggleWishlist = () => {
    setIsWishlisted(!isWishlisted);
    console.log(
      `Produit ${isWishlisted ? "retiré des" : "ajouté aux"} favoris`
    );
  };

  // Zoom sur l'image
  const handleImageMouseMove = (e) => {
    if (!productImageRef.current) return;

    const { left, top, width, height } =
      productImageRef.current.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;

    setZoomPosition({ x, y });
  };

  // Gestion de la quantité
  const handleQuantityChange = (amount) => {
    const newQuantity = quantity + amount;

    // Limiter la quantité à 1 minimum et au stock ou 20 maximum
    if (newQuantity > 0 && newQuantity <= Math.min(20, product.stock)) {
      setQuantity(newQuantity);
    }
  };

  // Effets au chargement
  useEffect(() => {
    // Marquer que nous sommes côté client
    setIsClient(true);

    // Détection du scroll pour le header
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };

    if (typeof window !== "undefined") {
      window.addEventListener("scroll", handleScroll);
    }

    // Nettoyage
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("scroll", handleScroll);
      }
    };
  }, []);

  useEffect(() => {
    // Synchroniser le nombre d'articles dans le panier avec le localStorage
    if (typeof window !== "undefined") {
      const storedCart = JSON.parse(localStorage.getItem("cart") || "[]");
      const totalItems = storedCart.reduce(
        (sum, item) => sum + item.quantity,
        0
      );
      setCartCount(totalItems);
    }
  }, []);

  // Si le produit est en cours de chargement ou non trouvé
  if (!isClient || router.isFallback || !product) {
    return (
      <div className={styles.loadingWrapper}>
        <div className={styles.loadingLogo}>MonSavonVert</div>
      </div>
    );
  }

  // Pour simplifier, on crée des données placeholders si certaines parties du produit ne sont pas définies
  const productDescription =
    product.description || "Description non disponible";

  // MODIFICATION ICI: utiliser les sauts de ligne (\n) comme séparateurs
  const productFeatures = product.characteristics
    ? product.characteristics
        .split("\n")
        .map((feat) => feat.trim())
        .filter((feat) => feat !== "")
    : ["Produit naturel", "Fabriqué en France"];

  const productOptions = {
    sizes: ["Standard (200g)"],
    packaging: ["Emballage plastique recyclable", "Sans emballage"],
  };

  // Gestion des images - utilisation du tableau d'images de l'API
  const galleryImages = product.images || [];

  // Fonction helper pour obtenir une description pour chaque ingrédient
  const getIngredientDescription = (ingredient) => {
    const descriptions = {
      "Huile d'olive":
        "Hydratante et nourrissante, apporte douceur et onctuosité au savon",
      "Huile de baies de laurier":
        "Propriétés antibactériennes et apaisantes, parfum subtil et naturel",
      Eau: "Purifiée et de qualité supérieure pour la fabrication de nos savons",
      "Hydroxyde de sodium":
        "Agent de saponification, transforme les huiles en savon, entièrement neutralisé dans le produit final",
    };

    return (
      descriptions[ingredient] ||
      "Ingrédient naturel sélectionné pour ses propriétés bénéfiques"
    );
  };
  return (
    <>
      <Head>
        <title>{product.title} | MonSavonVert</title>
        <meta
          name="description"
          content={productDescription.substring(0, 160)}
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
          {/* Fil d'Ariane */}
          <div className={styles.breadcrumbContainer}>
            <div className={styles.breadcrumbContent}>
              <Link href="/" className={styles.breadcrumbLink}>
                Accueil
              </Link>
              <span className={styles.breadcrumbSeparator}>/</span>
              <Link href="/store" className={styles.breadcrumbLink}>
                Boutique
              </Link>
              <span className={styles.breadcrumbSeparator}>/</span>
              <span className={styles.breadcrumbCurrent}>{product.title}</span>
            </div>
          </div>

          {/* Section produit */}
          <section className={styles.productLayout}>
            <div className={styles.productLayoutContainer}>
              {/* Colonne de gauche - Images du produit */}
              <div className={styles.productImagesColumn}>
                <div className={styles.productImageGallery}>
                  <div
                    className={styles.productMainImage}
                    ref={productImageRef}
                    onClick={() => setShowZoomModal(true)}
                    onMouseMove={handleImageMouseMove}
                    style={{
                      backgroundImage:
                        galleryImages.length > 0
                          ? `url(${galleryImages[activeImage]})`
                          : undefined,
                    }}
                  >
                    {galleryImages.length === 0 && (
                      <div className={styles.noImagePlaceholder}>
                        Image non disponible
                      </div>
                    )}
                    <div className={styles.imageZoomHint}>
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
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        <line x1="11" y1="8" x2="11" y2="14"></line>
                        <line x1="8" y1="11" x2="14" y2="11"></line>
                      </svg>
                    </div>
                  </div>
                  {galleryImages.length > 1 && (
                    <div className={styles.productThumbnails}>
                      {galleryImages.slice(0, 4).map((image, index) => (
                        <div
                          key={index}
                          className={`${styles.thumbnail} ${
                            activeImage === index ? styles.activeThumbnail : ""
                          }`}
                          onClick={() => setActiveImage(index)}
                          style={{ backgroundImage: `url(${image})` }}
                        >
                          {!image && `Photo ${index + 1}`}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Badges et certifications */}
                <div className={styles.productBadges}>
                  <div className={styles.badge}>
                    <img src="/images/bio.png" alt="Certification Bio" />
                    <span>Naturel</span>
                  </div>
                  <div className={styles.badge}>
                    <img src="/images/cruelty-free.png" alt="Cruelty Free" />
                    <span>Sans cruauté</span>
                  </div>
                  <div className={styles.badge}>
                    <img src="/images/vegan.png" alt="Vegan" />
                    <span>Vegan</span>
                  </div>
                </div>
              </div>

              {/* Colonne de droite - Informations produit */}
              <div className={styles.productInfoColumn}>
                <div className={styles.productInfo}>
                  <h1 className={styles.productTitle}>{product.title}</h1>

                  {/* MODIFICATION : Note et avis avec moyenne calculée */}
                  <div className={styles.productRating}>
                    {/* Affichage des étoiles basé sur la moyenne */}
                    {renderStars(averageRating, true)}
                    <span className={styles.ratingCount}>
                      ({totalReviews} avis)
                    </span>
                  </div>

                  {/* Prix */}
                  <div className={styles.productPriceContainer}>
                    <div className={styles.productPrice}>
                      {product.price
                        ? `${product.price.toFixed(2)} €`
                        : "Prix non disponible"}
                    </div>
                    {product.oldPrice && (
                      <div className={styles.productOldPrice}>
                        {product.oldPrice} €
                      </div>
                    )}
                    {product.discount && (
                      <div className={styles.discountBadge}>
                        -{product.discount}%
                      </div>
                    )}
                  </div>

                  {/* Caractéristiques du produit */}
                  <ul className={styles.productFeatures}>
                    {productFeatures.map((feature, index) => (
                      <li key={index} className={styles.feature}>
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
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Options du produit - Style moderne avec cartes */}
                  <div className={styles.productForm}>
                    {/* Sélection du format */}
                    <div className={styles.productOption}>
                      <label className={styles.optionLabel}>Format</label>
                      <div className={styles.optionChoices}>
                        {productOptions.sizes.map((size, index) => (
                          <button
                            key={index}
                            type="button"
                            className={`${styles.optionChoice} ${
                              selectedSize === index
                                ? styles.optionChoiceActive
                                : ""
                            }`}
                            onClick={() => setSelectedSize(index)}
                          >
                            {size}
                            {index !== 0 && (
                              <span className={styles.priceAdjustment}>
                                {index === 1 ? "+1,50 €" : "-0,30 €"}
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Quantité */}
                  <div className={styles.quantityControl}>
                    <button
                      className={`${styles.quantityButton} ${styles.quantityButtonLeft}`}
                      onClick={() => handleQuantityChange(-1)}
                    >
                      -
                    </button>
                    <input
                      className={styles.quantityInput}
                      type="text"
                      value={quantity}
                      readOnly
                    />
                    <button
                      className={`${styles.quantityButton} ${styles.quantityButtonRight}`}
                      onClick={() => handleQuantityChange(1)}
                    >
                      +
                    </button>
                  </div>

                  {/* Affichage du stock */}
                  <div className={styles.stockStatus}>
                    {product.stock > 0 ? (
                      <span className={styles.inStock}></span>
                    ) : (
                      <span className={styles.outOfStock}>
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
                        Rupture de stock
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  {/* Actions */}
                  <div className={styles.productActions}>
                    {/* Bouton Ajouter au panier (existant) */}
                    <button
                      className={styles.addToCartBtn}
                      onClick={addToCart}
                      disabled={product.stock <= 0}
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
                        <circle cx="9" cy="21" r="1"></circle>
                        <circle cx="20" cy="21" r="1"></circle>
                        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                      </svg>
                      {product.stock > 0
                        ? "Ajouter au panier"
                        : "Rupture de stock"}
                    </button>

                    {/* NOUVEAU : Bouton Acheter maintenant */}
                    <button
                      className={styles.buyNowBtn}
                      onClick={buyNow}
                      disabled={product.stock <= 0}
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
                        <rect x="1" y="3" width="15" height="13"></rect>
                        <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
                        <circle cx="5.5" cy="18.5" r="2.5"></circle>
                        <circle cx="18.5" cy="18.5" r="2.5"></circle>
                      </svg>
                      {product.stock > 0
                        ? "Acheter maintenant"
                        : "Rupture de stock"}
                    </button>

                    {/* Bouton wishlist (existant) */}
                    <button
                      className={`${styles.wishlistBtn} ${
                        isWishlisted ? styles.wishlistBtnActive : ""
                      }`}
                      onClick={toggleWishlist}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill={isWishlisted ? "currentColor" : "none"}
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                      </svg>
                    </button>
                  </div>

                  {/* Livraison et garanties */}
                  <div className={styles.productExtraInfo}>
                    <div className={styles.infoItem}>
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
                        <rect x="1" y="3" width="15" height="13"></rect>
                        <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
                        <circle cx="5.5" cy="18.5" r="2.5"></circle>
                        <circle cx="18.5" cy="18.5" r="2.5"></circle>
                      </svg>
                      <div>
                        <h4>Livraison offerte</h4>
                        <p>À partir de 29€ d'achats</p>
                      </div>
                    </div>
                    <div className={styles.infoItem}>
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
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                      </svg>
                      <div>
                        <h4>Fabriqué en Syrie</h4>
                        <p>Selon la tradition ancestrale</p>
                      </div>
                    </div>
                    <div className={styles.infoItem}>
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
                        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                        <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                        <line x1="12" y1="22.08" x2="12" y2="12"></line>
                      </svg>
                      <div>
                        <h4>Saponification à froid</h4>
                        <p>Préserve les propriétés</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Onglets d'information */}
          <section className={styles.tabsSection}>
            <div className={styles.tabsHeader}>
              <div
                className={`${styles.tab} ${
                  activeTab === "description" ? styles.tabActive : ""
                }`}
                onClick={() => setActiveTab("description")}
              >
                Description
              </div>
              <div
                className={`${styles.tab} ${
                  activeTab === "ingredients" ? styles.tabActive : ""
                }`}
                onClick={() => setActiveTab("ingredients")}
              >
                Ingrédients
              </div>
              <div
                className={`${styles.tab} ${
                  activeTab === "usage" ? styles.tabActive : ""
                }`}
                onClick={() => setActiveTab("usage")}
              >
                Conseils
              </div>
              <div
                className={`${styles.tab} ${
                  activeTab === "reviews" ? styles.tabActive : ""
                }`}
                onClick={() => setActiveTab("reviews")}
              >
                Avis clients
              </div>
            </div>

            {/* Onglet Description */}
            <div
              className={`${styles.tabContent} ${
                activeTab === "description" ? styles.tabContentActive : ""
              }`}
            >
              <div className={styles.structuredDescription}>
                <div className={styles.descriptionContent}>
                  <div className={styles.descriptionSection}>
                    <div className={styles.descriptionIcon}>
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
                        <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                        <path d="M2 17l10 5 10-5M2 12l10 5 10-5"></path>
                      </svg>
                    </div>
                    <div className={styles.descriptionText}>
                      <h4>Notre savon authentique</h4>
                      <p style={{ whiteSpace: "pre-line" }}>
                        {product.description}
                      </p>
                    </div>
                  </div>

                  <div className={styles.descriptionSection}>
                    <div className={styles.descriptionIcon}>
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
                        <path d="M9 11l3 3L22 4"></path>
                        <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"></path>
                      </svg>
                    </div>
                    <div className={styles.descriptionText}>
                      <h4>Bienfaits clés</h4>
                      <ul className={styles.benefitsList}>
                        {productFeatures.map((feature, index) => (
                          <li key={index} className={styles.benefitItem}>
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
                              <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Section "Destiné pour" avec l'icône de check */}
                  {/* Section "Destiné pour" avec l'icône de check */}
                  <div className={styles.descriptionSection}>
                    <div className={styles.descriptionIconGreen}>
                      {/* Icône de check verte */}
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
                        className={styles.destineIcon}
                      >
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                        <polyline points="22 4 12 14.01 9 11.01"></polyline>
                      </svg>
                    </div>
                    <div
                      className={`${styles.descriptionText} ${styles.descriptionTextGreen}`}
                    >
                      <h4>Destiné pour</h4>
                      <div className={styles.usageBenefits}>
                        {product.usageTips ? (
                          // Split le texte à chaque retour à la ligne et crée un carré pour chaque ligne
                          product.usageTips.split("\n").map(
                            (item, index) =>
                              item.trim() && (
                                <div
                                  key={index}
                                  className={`${styles.usageBenefit} ${styles.benefitItem}`}
                                >
                                  <span>{item.trim()}</span>
                                </div>
                              )
                          )
                        ) : (
                          <div
                            className={`${styles.usageBenefit} ${styles.benefitItem}`}
                          >
                            <span>Aucune information disponible</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Section "Déconseillé pour" avec l'icône X */}
                  <div className={styles.descriptionSection}>
                    <div className={styles.descriptionIconRed}>
                      {/* Icône de croix rouge */}
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
                        className={styles.deconseilIcon}
                      >
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="15" y1="9" x2="9" y2="15"></line>
                        <line x1="9" y1="9" x2="15" y2="15"></line>
                      </svg>
                    </div>
                    <div
                      className={`${styles.descriptionText} ${styles.descriptionTextRed}`}
                    >
                      <h4>Déconseillé pour</h4>
                      <div className={styles.usageBenefits}>
                        {product.ingredients ? (
                          // Split le texte à chaque retour à la ligne et crée un carré pour chaque ligne
                          product.ingredients.split("\n").map(
                            (item, index) =>
                              item.trim() && (
                                <div
                                  key={index}
                                  className={`${styles.usageBenefit} ${styles.warningItem}`}
                                >
                                  <span>{item.trim()}</span>
                                </div>
                              )
                          )
                        ) : (
                          <div
                            className={`${styles.usageBenefit} ${styles.warningItem}`}
                          >
                            <span>Aucune information disponible</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Onglet Ingredients */}
            <div
              className={`${styles.tabContent} ${
                activeTab === "ingredients" ? styles.tabContentActive : ""
              }`}
            >
              <div className={styles.structuredIngredients}>
                <div className={styles.ingredientsContent}>
                  <div className={styles.ingredientsHeader}>
                    <div className={styles.descriptionIcon}>
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
                        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
                      </svg>
                    </div>
                    <div>
                      <h4>Composition 100% naturelle</h4>
                      <p>
                        Notre savon est fabriqué exclusivement avec des
                        ingrédients naturels de haute qualité
                      </p>
                    </div>
                  </div>

                  <div className={styles.ingredientsList}>
                    <div className={styles.ingredientCard}>
                      <div className={styles.ingredientIcon}>
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
                          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                        </svg>
                      </div>
                      <div className={styles.ingredientInfo}>
                        <h5>Huile d'olive</h5>
                        <p>
                          Hydratante et nourrissante, apporte douceur et
                          onctuosité au savon
                        </p>
                      </div>
                    </div>

                    <div className={styles.ingredientCard}>
                      <div className={styles.ingredientIcon}>
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
                          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                        </svg>
                      </div>
                      <div className={styles.ingredientInfo}>
                        <h5>Huile de baies de laurier</h5>
                        <p>
                          Propriétés antibactériennes et apaisantes, parfum
                          subtil et naturel
                        </p>
                      </div>
                    </div>

                    <div className={styles.ingredientCard}>
                      <div className={styles.ingredientIcon}>
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
                          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                        </svg>
                      </div>
                      <div className={styles.ingredientInfo}>
                        <h5>Eau</h5>
                        <p>
                          Purifiée et de qualité supérieure pour la fabrication
                          de nos savons
                        </p>
                      </div>
                    </div>

                    <div className={styles.ingredientCard}>
                      <div className={styles.ingredientIcon}>
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
                          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                        </svg>
                      </div>
                      <div className={styles.ingredientInfo}>
                        <h5>Sodium hydroxyde</h5>
                        <p>
                          Agent de saponification, transforme les huiles en
                          savon, entièrement neutralisé dans le produit final
                        </p>
                      </div>
                    </div>

                    <div className={styles.ingredientCard}>
                      <div className={styles.ingredientIcon}>
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
                          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                        </svg>
                      </div>
                      <div className={styles.ingredientInfo}>
                        <h5>Sodium chloride</h5>
                        <p>
                          Améliore la dureté du savon et agit comme exfoliant
                          naturel pour une peau douce et lisse
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className={styles.ingredientsFooter}>
                    <div className={styles.descriptionIcon}>
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
                    </div>
                    <div>
                      <h4>Engagement qualité</h4>
                      <p>
                        Tous nos ingrédients sont soigneusement sélectionnés
                        pour leur qualité et leur respect de l'environnement
                      </p>
                      <div className={styles.certificationBadges}>
                        <div className={styles.certificationBadge}>
                          Sans paraben
                        </div>
                        <div className={styles.certificationBadge}>
                          Sans sulfate
                        </div>
                        <div className={styles.certificationBadge}>
                          Non testé sur les animaux
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Onglet Conseils d'utilisation */}
            <div
              className={`${styles.tabContent} ${
                activeTab === "usage" ? styles.tabContentActive : ""
              }`}
            >
              <div className={styles.usageGuide}>
                <div className={styles.usageSection}>
                  <h3>Comment utiliser votre savon</h3>
                  <ol className={styles.usageSteps}>
                    <li className={styles.usageStep}>
                      <div className={styles.usageStepNumber}>1</div>
                      <div className={styles.usageStepContent}>
                        <h4>Mouiller le savon</h4>
                        <p>
                          Humidifiez le savon et vos mains avec de l'eau tiède.
                        </p>
                      </div>
                    </li>
                    <li className={styles.usageStep}>
                      <div className={styles.usageStepNumber}>2</div>
                      <div className={styles.usageStepContent}>
                        <h4>Faire mousser</h4>
                        <p>
                          Frottez délicatement le savon entre vos mains pour
                          créer une mousse onctueuse.
                        </p>
                      </div>
                    </li>
                    <li className={styles.usageStep}>
                      <div className={styles.usageStepNumber}>3</div>
                      <div className={styles.usageStepContent}>
                        <h4>Appliquer</h4>
                        <p>
                          Massez la mousse sur votre peau en effectuant des
                          mouvements circulaires.
                        </p>
                      </div>
                    </li>
                    <li className={styles.usageStep}>
                      <div className={styles.usageStepNumber}>4</div>
                      <div className={styles.usageStepContent}>
                        <h4>Rincer</h4>
                        <p>Rincez abondamment à l'eau claire.</p>
                      </div>
                    </li>
                    <li className={styles.usageStep}>
                      <div className={styles.usageStepNumber}>5</div>
                      <div className={styles.usageStepContent}>
                        <h4>Sécher et ranger</h4>
                        <p>
                          Après utilisation, placez le savon sur un porte-savon
                          qui permet à l'eau de s'écouler pour prolonger sa
                          durée de vie.
                        </p>
                      </div>
                    </li>
                  </ol>
                </div>

                <div className={styles.usageSection}>
                  <h3>Conseils de conservation</h3>
                  <p>Pour prolonger la durée de vie de votre savon :</p>
                  <ul className={styles.usageTips}>
                    <li className={styles.usageTip}>
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
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                        <polyline points="22 4 12 14.01 9 11.01"></polyline>
                      </svg>
                      <span>
                        Utilisez un porte-savon avec drainage pour éviter que
                        votre savon ne repose dans l'eau
                      </span>
                    </li>
                    <li className={styles.usageTip}>
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
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                        <polyline points="22 4 12 14.01 9 11.01"></polyline>
                      </svg>
                      <span>
                        Conservez-le dans un endroit sec entre les utilisations
                      </span>
                    </li>
                    <li className={styles.usageTip}>
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
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                        <polyline points="22 4 12 14.01 9 11.01"></polyline>
                      </svg>
                      <span>
                        Coupez votre savon en deux pour prolonger son
                        utilisation
                      </span>
                    </li>
                    <li className={styles.usageTip}>
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
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                        <polyline points="22 4 12 14.01 9 11.01"></polyline>
                      </svg>
                      <span>
                        Laissez sécher votre savon avant de le replacer dans son
                        emballage pour le voyage
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* MODIFICATION MAJEURE : Onglet Avis clients avec callback */}
            <div
              className={`${styles.tabContent} ${
                activeTab === "reviews" ? styles.tabContentActive : ""
              }`}
            >
              {/* REMPLACEMENT : Ancien système d'avis par le nouveau composant avec callback */}
              <ReviewSystem
                productId={id}
                initialReviews={currentReviews}
                onReviewsUpdate={handleReviewsUpdate}
              />
            </div>
          </section>

          {/* CTA d'inscription à la newsletter */}
          <section className={styles.newsletterSection}>
            <div className={styles.newsletterContainer}>
              <div className={styles.newsletterContent}>
                <h2 className={styles.newsletterTitle}>Restez informé</h2>
                <p className={styles.newsletterText}>
                  Inscrivez-vous à notre newsletter pour recevoir nos conseils
                  sur la cosmétique naturelle, nos nouveautés et des offres
                  exclusives.
                </p>
                <form className={styles.newsletterForm}>
                  <input
                    type="email"
                    className={styles.newsletterInput}
                    placeholder="Votre adresse email"
                    required
                  />
                  <button type="submit" className={styles.newsletterButton}>
                    S'inscrire
                  </button>
                </form>
              </div>
            </div>
          </section>
        </main>

        {/* Modal de zoom d'image */}
        {showZoomModal && galleryImages.length > 0 && (
          <div
            className={styles.zoomModal}
            onClick={() => setShowZoomModal(false)}
          >
            <div className={styles.zoomModalContent}>
              <button
                className={styles.zoomModalClose}
                onClick={() => setShowZoomModal(false)}
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
              <div
                className={styles.zoomModalImage}
                style={{
                  backgroundImage: `url(${galleryImages[activeImage]})`,
                  backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`,
                }}
              ></div>
              <div className={styles.zoomModalThumbnails}>
                {galleryImages.map((image, index) => (
                  <div
                    key={index}
                    className={`${styles.zoomModalThumbnail} ${
                      activeTab === index ? styles.active : ""
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveImage(index);
                    }}
                    style={{ backgroundImage: `url(${image})` }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        <Footer />
      </div>
    </>
  );
}

// Cette fonction s'exécute côté serveur à chaque requête
export async function getServerSideProps({ params }) {
  try {
    // Utilisez process.env pour accéder à la variable d'environnement
    const API_URL = process.env.NEXT_PUBLIC_API_URL;

    if (!API_URL) {
      throw new Error(
        "La variable d'environnement NEXT_PUBLIC_API_URL n'est pas définie."
      );
    }

    const response = await fetch(`${API_URL}/products/${params.id}`);

    if (!response.ok) {
      console.log(
        `Erreur lors de la récupération du produit: ${response.status}`
      );
      return { notFound: true };
    }

    const data = await response.json();

    if (!data.result || !data.product) {
      console.log("Produit non trouvé dans la réponse de l'API");
      return { notFound: true };
    }

    return {
      props: {
        product: data.product, // Inclut les avis dans `product.reviews`
      },
    };
  } catch (error) {
    console.error("Erreur lors de la récupération du produit:", error);
    return { notFound: true };
  }
}
