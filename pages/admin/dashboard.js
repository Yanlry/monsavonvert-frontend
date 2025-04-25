"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import styles from "../../styles/admin-dashboard.module.css"; // Réutilisation du même fichier CSS

export default function AdminDashboard() {
  // États
  const [isClient, setIsClient] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [periodFilter, setPeriodFilter] = useState("month");
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"; // Assurez-vous que cette variable est définie

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

  // Vérification de l'authentification
  useEffect(() => {
    if (!isClient) return;

    try {
      // Récupérer l'email et le rôle de l'utilisateur depuis le stockage local/session
      const email =
        localStorage.getItem("userEmail") ||
        sessionStorage.getItem("userEmail");
      const userRole =
        localStorage.getItem("role") || sessionStorage.getItem("role");
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");

      console.log("Vérification des autorisations pour:", email);
      console.log("Rôle utilisateur:", userRole);

      // Vérifier si les informations nécessaires sont disponibles
      if (!email || !userRole || !token) {
        console.log("Informations manquantes - Email ou Rôle non trouvé");
        router.push("/login");
        return;
      }

      // Vérifier si l'utilisateur a le rôle admin
      if (userRole !== "admin") {
        console.log("Accès refusé: L'utilisateur n'a pas le rôle admin");
        router.push("/profile");
        return;
      }

      // Si l'utilisateur est bien un admin, autoriser l'accès
      console.log("Accès autorisé pour l'administrateur");
      setUserEmail(email);
      setIsAuthorized(true);

      // Charger les données du tableau de bord
      loadDashboardData();
    } catch (error) {
      console.error("Erreur lors de la vérification des autorisations:", error);
      router.push("/login");
    }
  }, [isClient, router]);

  // Fonction pour générer des données de tendance des ventes sur les 10 derniers jours
  const generateSalesTrendData = (orders) => {
    // Date actuelle
    const currentDate = new Date();

    // Créer un tableau pour les 10 derniers jours
    const last10Days = [];
    for (let i = 9; i >= 0; i--) {
      const date = new Date(currentDate);
      date.setDate(date.getDate() - i);

      // Formater la date comme "DD/MM"
      const formattedDate = `${date.getDate().toString().padStart(2, "0")}/${(
        date.getMonth() + 1
      )
        .toString()
        .padStart(2, "0")}`;

      last10Days.push({
        date: formattedDate,
        fullDate: new Date(date.setHours(0, 0, 0, 0)),
        value: 0, // Valeur initiale
      });
    }

    // Parcourir les commandes et ajouter les montants aux jours correspondants
    orders.forEach((order) => {
      const orderDate = new Date(order.createdAt || order.date || "");
      if (isNaN(orderDate.getTime())) return; // Ignorer les dates invalides

      orderDate.setHours(0, 0, 0, 0); // Ignorer l'heure

      // Chercher si ce jour est dans notre tableau des 10 derniers jours
      const dayIndex = last10Days.findIndex(
        (day) => day.fullDate.getTime() === orderDate.getTime()
      );

      if (dayIndex !== -1) {
        // Utiliser totalAmount si disponible, sinon total
        const amount = order.totalAmount || order.total || 0;
        last10Days[dayIndex].value += amount;
      }
    });

    // Supprimer la propriété fullDate qui n'est plus nécessaire pour l'affichage
    return last10Days.map(({ date, value }) => ({
      date,
      value: Math.round(value * 100) / 100, // Arrondir à 2 décimales
    }));
  };

  // Fonction pour calculer les produits les plus vendus à partir des commandes
  const calculateTopProducts = (orders) => {
    console.log("⚙️ Calcul des produits les plus vendus...");

    // Créer un objet pour stocker les stats de chaque produit
    const productStats = {};

    // Parcourir toutes les commandes
    orders.forEach((order) => {
      // Vérifier si la commande a des items
      if (order.items && Array.isArray(order.items)) {
        // Parcourir les items de la commande
        order.items.forEach((item) => {
          // Récupérer ou créer les stats pour ce produit
          const productId = item.productId || item.id || item._id;
          const productName =
            item.name || item.productName || "Produit inconnu";

          if (!productStats[productId]) {
            productStats[productId] = {
              id: productId,
              name: productName,
              sales: 0,
              revenue: 0,
            };
          }

          // Ajouter les ventes et revenus de cet item
          const quantity = item.quantity || 1;
          const price = item.price || 0;

          productStats[productId].sales += quantity;
          productStats[productId].revenue += price * quantity;
        });
      }
    });

    // Convertir l'objet en tableau et trier par nombre de ventes (décroissant)
    const sortedProducts = Object.values(productStats)
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 5); // Prendre les 5 premiers

    console.log(
      `✅ Top 5 produits calculés: ${sortedProducts.length} produits trouvés`
    );
    console.log("📊 Produits les plus vendus:", sortedProducts);

    return sortedProducts;
  };

  // Fonction pour charger les données du tableau de bord selon la période
  const loadDashboardData = async () => {
    console.log(`Chargement des données pour la période: ${periodFilter}`);

    // Activer le loader
    setIsLoading(true);

    try {
      // Récupérer le token d'authentification
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");

      if (!token) {
        console.error("Token d'authentification non trouvé");
        router.push("/login");
        return;
      }

      // Options pour les requêtes API
      const requestOptions = {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      };

      // Récupérer les données des commandes
      console.log("Récupération des données des commandes...");
      const ordersResponse = await fetch(`${API_URL}/orders`, requestOptions);

      if (!ordersResponse.ok) {
        throw new Error(
          `Erreur lors de la récupération des commandes: ${ordersResponse.status}`
        );
      }

      const ordersData = await ordersResponse.json();
      console.log("Données des commandes reçues:", ordersData);

      // NOUVEAU: Récupérer les données des produits
      console.log("Récupération des données des produits...");
      const productsResponse = await fetch(
        `${API_URL}/products`,
        requestOptions
      );

      if (!productsResponse.ok) {
        throw new Error(
          `Erreur lors de la récupération des produits: ${productsResponse.status}`
        );
      }

      const productsData = await productsResponse.json();
      console.log("Données des produits reçues:", productsData);

      // Récupérer les données des clients
      console.log("Récupération des données des clients...");
      const customersResponse = await fetch(
        `${API_URL}/customers`,
        requestOptions
      );

      if (!customersResponse.ok) {
        throw new Error(
          `Erreur lors de la récupération des clients: ${customersResponse.status}`
        );
      }

      const customersData = await customersResponse.json();
      console.log("Données des clients reçues:", customersData);

      // Filtrer les données en fonction de la période
      const now = new Date();
      let daysToFilter;

      if (periodFilter === "week") {
        daysToFilter = 7;
      } else if (periodFilter === "month") {
        daysToFilter = 30;
      } else {
        // 'year'
        daysToFilter = 365;
      }

      // Filtrer les clients en fonction de la période
      const cutoffDate = new Date(now);
      cutoffDate.setDate(cutoffDate.getDate() - daysToFilter);

      const filteredCustomers = (customersData.customers || []).filter(
        (customer) => {
          // Si pas de date de création, on exclut le client
          if (!customer.createdAt) return false;

          const createDate = new Date(customer.createdAt);
          return createDate >= cutoffDate;
        }
      );

      // Extraire toutes les commandes
      let allOrders = [];

      // Structure des commandes dans l'API:
      // ordersData.orders.enAttente.orders
      // ordersData.orders.enCoursLivraison.orders
      // ordersData.orders.livre.orders
      // ordersData.orders.annule.orders

      if (ordersData.orders) {
        if (ordersData.orders.enAttente && ordersData.orders.enAttente.orders) {
          allOrders = [...allOrders, ...ordersData.orders.enAttente.orders];
        }
        if (
          ordersData.orders.enCoursLivraison &&
          ordersData.orders.enCoursLivraison.orders
        ) {
          allOrders = [
            ...allOrders,
            ...ordersData.orders.enCoursLivraison.orders,
          ];
        }
        if (ordersData.orders.livre && ordersData.orders.livre.orders) {
          allOrders = [...allOrders, ...ordersData.orders.livre.orders];
        }
        if (ordersData.orders.annule && ordersData.orders.annule.orders) {
          allOrders = [...allOrders, ...ordersData.orders.annule.orders];
        }
      }

      // Filtrer les commandes selon la période
      const filteredOrders = allOrders.filter((order) => {
        const orderDate = new Date(order.createdAt || order.date || "");
        if (isNaN(orderDate.getTime())) return false;
        return orderDate >= cutoffDate;
      });

      // Générer les données de tendance des ventes
      const salesTrend = generateSalesTrendData(filteredOrders);

      // Calculer les produits les plus vendus
      const topProducts = calculateTopProducts(filteredOrders);
      console.log("Top produits calculés:", topProducts);

      // NOUVEAU: Analyser l'état des stocks des produits
      const products = productsData.products || [];
      console.log(
        "Analyse de l'état des stocks pour",
        products.length,
        "produits"
      );

      // Compter les produits selon l'état de leur stock
      const totalProducts = products.length;
      // Stock faible: entre 1 et 19 inclus
      const lowStock = products.filter(
        (product) => product.stock > 0 && product.stock < 20
      ).length;
      // Rupture: stock à 0
      const outOfStock = products.filter(
        (product) => product.stock === 0
      ).length;

      // NOUVEAU: Calculer le nombre total d'articles en stock (toutes catégories confondues)
      const totalItemsInStock = products.reduce(
        (sum, product) => sum + (product.stock || 0),
        0
      );
      console.log(`Nombre total d'articles en stock: ${totalItemsInStock}`);

      // NOUVEAU: Préparer les données des produits pour l'affichage dans le dashboard
      // Trier les produits par statut (rupture, faible, ok) puis par nombre de stock
      const sortedProducts = [...products].sort((a, b) => {
        // D'abord, trier par statut (rupture, puis faible, puis ok)
        const statusA = a.stock === 0 ? 0 : a.stock < 20 ? 1 : 2;
        const statusB = b.stock === 0 ? 0 : b.stock < 20 ? 1 : 2;

        if (statusA !== statusB) return statusA - statusB;

        // Ensuite par quantité en stock (croissant)
        return a.stock - b.stock;
      });

      console.log(
        `État des stocks: Total=${totalProducts}, Faible=${lowStock}, Rupture=${outOfStock}, Articles=${totalItemsInStock}`
      );

      // Obtenir les données de base à partir de l'API
      const totalOrders = ordersData.orders.total || 0;
      const averageBasket = ordersData.orders.averageBasket || 0;
      const totalSales = averageBasket * totalOrders; // Estimation basée sur le panier moyen

      // Sélectionner les 5 commandes les plus récentes
      const recentOrders = [...allOrders]
        .sort((a, b) => {
          const dateA = new Date(a.createdAt || a.date || "");
          const dateB = new Date(b.createdAt || b.date || "");
          return dateB.getTime() - dateA.getTime();
        })
        .slice(0, 5);

      // Construire l'objet pour le dashboard
      const newDashboardData = {
        salesSummary: {
          totalSales: totalSales,
          ordersCount: totalOrders,
          averageOrderValue: averageBasket,
          conversionRate: 3.2, // On garde cette valeur fixe pour le moment
        },
        salesTrend: salesTrend, // Utilisation des données réelles
        topProducts: topProducts, // Utilisation des données réelles
        recentOrders: recentOrders, // Utilisation des données réelles
        inventorySummary: {
          // MODIFIÉ: Utilisation des données réelles pour l'inventaire
          totalProducts: totalProducts,
          lowStock: lowStock,
          outOfStock: outOfStock,
          totalItemsInStock: totalItemsInStock, // NOUVEAU: Total d'articles en stock
          productsList: sortedProducts.slice(0, 10), // NOUVEAU: Liste des 10 premiers produits triés
        },
        customerSummary: {
          totalCustomers: customersData.customers?.length || 0,
          newCustomers: filteredCustomers.length,
          returningRate: 40, // Valeur fixe pour le moment
        },
      };

      console.log("Données du tableau de bord calculées:", newDashboardData);
      setDashboardData(newDashboardData);
      setIsLoading(false);
    } catch (error) {
      console.error("Erreur lors du chargement des données:", error);
      // Si on a une erreur, on initialise quand même avec des données factices
      // pour éviter que l'interface ne soit vide
      setDashboardData({
        salesSummary: {
          totalSales: 0,
          ordersCount: 0,
          averageOrderValue: 0,
          conversionRate: 0,
        },
        salesTrend: [],
        topProducts: [],
        recentOrders: [],
        inventorySummary: {
          totalProducts: 0,
          lowStock: 0,
          outOfStock: 0,
          totalItemsInStock: 0, // NOUVEAU
          productsList: [], // NOUVEAU
        },
        customerSummary: {
          totalCustomers: 0,
          newCustomers: 0,
          returningRate: 0,
        },
      });
      setIsLoading(false);
    }
  };
  // Effet pour recharger les données lorsque le filtre de période change
  useEffect(() => {
    if (isAuthorized) {
      loadDashboardData();
    }
  }, [periodFilter, isAuthorized]);

  // Fonction pour formater une date
  const formatDate = (dateString) => {
    const options = {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString("fr-FR", options);
  };

  // Fonction pour formater un nombre avec séparateur de milliers
  const formatNumber = (number) => {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  };

  // Fonction pour calculer la variation par rapport à la période précédente
  const calculateChange = (current, previous) => {
    const change = ((current - previous) / previous) * 100;
    return change.toFixed(1);
  };

  // Rendu de base sans contenu dynamique (pour éviter les erreurs d'hydratation)
  if (!isClient) {
    return (
      <>
        <Head>
          <title>Tableau de Bord | MonSavonVert</title>
          <meta
            name="description"
            content="Tableau de bord d'administration - MonSavonVert"
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
        <title>Tableau de Bord | MonSavonVert</title>
        <meta
          name="description"
          content="Tableau de bord d'administration - MonSavonVert"
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
              <Link href="/" className={styles.logoLink}>
                <span className={styles.logo}>MonSavonVert</span>
              </Link>
            </div>

            {/* Navigation principale */}
            <nav className={styles.mainNav}>
              <ul className={styles.navList}>
                <li className={styles.navItem}>
                  <Link
                    href="/admin/dashboard"
                    className={`${styles.navLink} ${styles.active}`}
                  >
                    Tableau de bord
                  </Link>
                </li>
                <li className={styles.navItem}>
                  <Link href="/admin/orders" className={styles.navLink}>
                    Commandes
                  </Link>
                </li>
                <li className={styles.navItem}>
                  <Link href="/admin/products" className={styles.navLink}>
                    Produits
                  </Link>
                </li>
                <li className={styles.navItem}>
                  <Link href="/admin/customers" className={styles.navLink}>
                    Clients
                  </Link>
                </li>
                <li className={styles.navItem}>
                  <Link href="/admin/settings" className={styles.navLink}>
                    Paramètres
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
                <h1>Tableau de Bord</h1>
                <p className={styles.pageDescription}>
                  Vue d'ensemble des performances de votre boutique
                </p>
              </div>
              <div className={styles.pageActions}>
                <div className={styles.periodFilter}>
                  <label>Période :</label>
                  <select
                    value={periodFilter}
                    onChange={(e) => setPeriodFilter(e.target.value)}
                    className={styles.periodSelect}
                  >
                    <option value="week">7 derniers jours</option>
                    <option value="month">30 derniers jours</option>
                    <option value="year">12 derniers mois</option>
                  </select>
                </div>
                <button
                  className={styles.refreshButton}
                  onClick={() => loadDashboardData()}
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
                    <path d="M23 4v6h-6"></path>
                    <path d="M1 20v-6h6"></path>
                    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10"></path>
                    <path d="M20.49 15a9 9 0 0 1-14.85 3.36L1 14"></path>
                  </svg>
                  Actualiser
                </button>
                <button className={styles.exportButton}>
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
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                  </svg>
                  Exporter
                </button>
              </div>
            </div>
          </section>

          {/* Contenu principal */}
          <section className={styles.dashboardSection}>
            <div className={styles.dashboardContainer}>
              {isLoading ? (
                <div className={styles.loadingOrders}>
                  <div className={styles.spinner}></div>
                  <p>Chargement des données...</p>
                </div>
              ) : (
                <>
                  {/* Indicateurs clés de performance */}
                  <div className={styles.kpiCards}>
                    <div className={styles.kpiCard}>
                      <div className={styles.kpiCardContent}>
                        <div
                          className={styles.kpiIcon}
                          style={{ backgroundColor: "rgba(76, 175, 80, 0.1)" }}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="#4caf50"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <line x1="12" y1="1" x2="12" y2="23"></line>
                            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                          </svg>
                        </div>
                        <div className={styles.kpiInfo}>
                          <span className={styles.kpiLabel}>
                            Ventes Totales
                          </span>
                          <span className={styles.kpiValue}>
                            {dashboardData?.salesSummary.totalSales.toFixed(2)}{" "}
                            €
                          </span>
                          <span
                            className={styles.kpiChange}
                            style={{ color: "#4caf50" }}
                          >
                            +12.5% depuis la dernière période
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className={styles.kpiCard}>
                      <div className={styles.kpiCardContent}>
                        <div
                          className={styles.kpiIcon}
                          style={{ backgroundColor: "rgba(33, 150, 243, 0.1)" }}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="#2196f3"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <rect
                              x="2"
                              y="3"
                              width="20"
                              height="14"
                              rx="2"
                              ry="2"
                            ></rect>
                            <line x1="8" y1="21" x2="16" y2="21"></line>
                            <line x1="12" y1="17" x2="12" y2="21"></line>
                          </svg>
                        </div>
                        <div className={styles.kpiInfo}>
                          <span className={styles.kpiLabel}>Commandes</span>
                          <span className={styles.kpiValue}>
                            {dashboardData?.salesSummary.ordersCount}
                          </span>
                          <span
                            className={styles.kpiChange}
                            style={{ color: "#4caf50" }}
                          >
                            +8.3% depuis la dernière période
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className={styles.kpiCard}>
                      <div className={styles.kpiCardContent}>
                        <div
                          className={styles.kpiIcon}
                          style={{ backgroundColor: "rgba(156, 39, 176, 0.1)" }}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="#9c27b0"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                          </svg>
                        </div>
                        <div className={styles.kpiInfo}>
                          <span className={styles.kpiLabel}>Clients</span>
                          <span className={styles.kpiValue}>
                            {dashboardData?.customerSummary.totalCustomers}
                          </span>
                          <span
                            className={styles.kpiChange}
                            style={{ color: "#4caf50" }}
                          >
                            +{dashboardData?.customerSummary.newCustomers}{" "}
                            nouveaux
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className={styles.kpiCard}>
                      <div className={styles.kpiCardContent}>
                        <div
                          className={styles.kpiIcon}
                          style={{ backgroundColor: "rgba(255, 152, 0, 0.1)" }}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="#ff9800"
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
                        </div>
                        <div className={styles.kpiInfo}>
                          <span className={styles.kpiLabel}>Panier Moyen</span>
                          <span className={styles.kpiValue}>
                            {dashboardData?.salesSummary.averageOrderValue.toFixed(
                              2
                            )}{" "}
                            €
                          </span>
                          <span
                            className={styles.kpiChange}
                            style={{ color: "#4caf50" }}
                          >
                            +3.2% depuis la dernière période
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Graphique de ventes et Liste des produits */}
                  <div className={styles.dashboardRow}>
                    <div className={styles.dashboardCol}>
                      <div className={styles.dashboardCard}>
                        <div className={styles.cardHeader}>
                          <h2>Évolution des Ventes</h2>
                        </div>
                        <div className={styles.cardBody}>
                          <div className={styles.salesChart}>
                            {/* Affichage du graphique avec les données réelles */}
                            <div className={styles.mockChart}>
                              <div className={styles.chartBars}>
                                {dashboardData?.salesTrend.map(
                                  (point, index) => {
                                    // Trouver la valeur maximale pour calculer les proportions
                                    const maxValue = Math.max(
                                      ...dashboardData.salesTrend.map(
                                        (p) => p.value
                                      ),
                                      1 // Pour éviter la division par zéro
                                    );

                                    // Déterminer si c'est une valeur à 0
                                    const isZero = point.value === 0;

                                    return (
                                      <div
                                        key={index}
                                        className={styles.chartBarContainer}
                                      >
                                        <div
                                          className={styles.chartBar}
                                          style={{
                                            height: isZero
                                              ? "20px"
                                              : `${
                                                  (point.value / maxValue) * 100
                                                }%`,
                                            backgroundColor: isZero
                                              ? "#f44336"
                                              : "#4caf50",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            color: "white",
                                            fontWeight: "bold",
                                            fontSize: "12px",
                                          }}
                                        >
                                          {isZero
                                            ? "0"
                                            : point.value.toFixed(2)}
                                        </div>
                                        <span className={styles.chartLabel}>
                                          {point.date}
                                        </span>
                                      </div>
                                    );
                                  }
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className={styles.dashboardCol}>
                      <div className={styles.dashboardCard}>
                        <div className={styles.cardHeader}>
                          <h2>Produits les Plus Vendus</h2>
                        </div>
                        <div className={styles.cardBody}>
                          <table className={styles.dashboardTable}>
                            <thead>
                              <tr>
                                <th>Produit</th>
                                <th>Ventes</th>
                                <th>Revenu</th>
                              </tr>
                            </thead>
                            <tbody>
                              {dashboardData?.topProducts.length > 0 ? (
                                dashboardData.topProducts.map((product) => (
                                  <tr key={product.id}>
                                    <td>{product.name}</td>
                                    <td>{product.sales}</td>
                                    <td>{product.revenue.toFixed(2)} €</td>
                                  </tr>
                                ))
                              ) : (
                                <tr>
                                  <td
                                    colSpan="3"
                                    style={{ textAlign: "center" }}
                                  >
                                    Aucune donnée disponible
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Commandes récentes et État du stock */}
                  <div className={styles.dashboardRow}>
                    <div className={styles.dashboardCol}>
                      <div className={styles.dashboardCard}>
                        <div className={styles.cardHeader}>
                          <h2>Commandes Récentes</h2>
                          <Link
                            href="/admin/orders"
                            className={styles.viewAllLink}
                          >
                            Voir toutes
                          </Link>
                        </div>
                        <div className={styles.cardBody}>
                          <table className={styles.dashboardTable}>
                            <thead>
                              <tr>
                                <th>Commande</th>
                                <th>Date</th>
                                <th>Client</th>
                                <th>Statut</th>
                                <th>Total</th>
                              </tr>
                            </thead>
                            <tbody>
                              {dashboardData?.recentOrders.map((order) => (
                                <tr key={order.id || order._id}>
                                  <td>
                                    <Link
                                      href={`/admin/orders?id=${
                                        order.id || order._id
                                      }`}
                                      className={styles.orderLink}
                                    >
                                      {order.id || order._id}
                                    </Link>
                                  </td>
                                  <td>
                                    {formatDate(
                                      order.createdAt || order.date || ""
                                    )}
                                  </td>
                                  <td>
                                    {order.customer?.name || "Client inconnu"}
                                  </td>
                                  <td>
                                    <span
                                      className={`${styles.orderStatus} ${
                                        styles[order.status]
                                      }`}
                                    >
                                      {order.statusLabel}
                                    </span>
                                  </td>
                                  <td>
                                    {(
                                      order.totalAmount ||
                                      order.total ||
                                      0
                                    ).toFixed(2)}{" "}
                                    €
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>

                    <div className={styles.dashboardCol}>
                      <div className={styles.dashboardCard}>
                        <div className={styles.cardHeader}>
                          <h2>État du Stock</h2>
                          <Link
                            href="/admin/products"
                            className={styles.viewAllLink}
                          >
                            Gérer les produits
                          </Link>
                        </div>
                        <div className={styles.cardBody}>
                          <div className={styles.stockSummary}>
                          <div className={styles.stockItem}>
                              <div className={styles.stockStatus}>
                                <span
                                  className={`${styles.stockIndicator} ${styles.stockTotal}`}
                                ></span>
                                <span className={styles.stockLabel}>
                                  Articles en stock
                                </span>
                              </div>
                              <span className={styles.stockValue}>
                                {dashboardData?.inventorySummary
                                  .totalItemsInStock || 0}
                              </span>
                            </div>

                            <div className={styles.stockItem}>
                              <div className={styles.stockStatus}>
                                <span
                                  className={`${styles.stockIndicator} ${styles.stockLow}`}
                                ></span>
                                <span className={styles.stockLabel}>
                                  Stock faible
                                </span>
                              </div>
                              <span className={styles.stockValue}>
                                {dashboardData?.inventorySummary.lowStock}
                              </span>
                            </div>

                            <div className={styles.stockItem}>
                              <div className={styles.stockStatus}>
                                <span
                                  className={`${styles.stockIndicator} ${styles.stockOut}`}
                                ></span>
                                <span className={styles.stockLabel}>
                                  En rupture
                                </span>
                              </div>
                              <span className={styles.stockValue}>
                                {dashboardData?.inventorySummary.outOfStock}
                              </span>
                            </div>
                          </div>

                          <div className={styles.stockAlert}>
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
                              <circle cx="12" cy="12" r="10"></circle>
                              <line x1="12" y1="8" x2="12" y2="12"></line>
                              <line x1="12" y1="16" x2="12.01" y2="16"></line>
                            </svg>
                            <p>
                              Vous avez{" "}
                              {(dashboardData?.inventorySummary.lowStock || 0) +
                                (dashboardData?.inventorySummary.outOfStock ||
                                  0)}{" "}
                              produits à réapprovisionner
                            </p>
                          </div>

                          {/* NOUVEAU: Liste des produits avec leur état de stock */}
                          <div className={styles.productStockList}>
                            <h3>Aperçu des stocks</h3>
                            <table className={styles.stockTable}>
                              <thead>
                                <tr>
                                  <th>Produit</th>
                                  <th>Stock</th>
                                  <th>État</th>
                                </tr>
                              </thead>
                              <tbody>
                                {dashboardData?.inventorySummary.productsList?.map(
                                  (product) => {
                                    // Déterminer la classe CSS en fonction de l'état du stock
                                    let stockStatusClass = styles.stockStatusOk;
                                    let stockStatusText = "OK";

                                    if (product.stock === 0) {
                                      stockStatusClass = styles.stockStatusOut;
                                      stockStatusText = "Rupture";
                                    } else if (product.stock < 20) {
                                      stockStatusClass = styles.stockStatusLow;
                                      stockStatusText = "Faible";
                                    }

                                    return (
                                      <tr
                                        key={product._id}
                                        className={stockStatusClass}
                                      >
                                        <td>{product.title}</td>
                                        <td className={styles.stockCount}>
                                          {product.stock}
                                        </td>
                                        <td className={styles.stockStatusText}>
                                          {stockStatusText}
                                        </td>
                                      </tr>
                                    );
                                  }
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
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
              <Link href="/admin/help">Aide</Link>
              <Link href="/admin/documentation">Documentation</Link>
              <button
                onClick={() => {
                  localStorage.removeItem("userEmail");
                  localStorage.removeItem("token");
                  localStorage.removeItem("role"); // Correction ici
                  sessionStorage.removeItem("userEmail");
                  sessionStorage.removeItem("token");
                  sessionStorage.removeItem("role"); // Correction ici
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

      <style jsx>{`
        .dashboardSection {
          flex: 1;
          padding: var(--spacing-xl) 0;
        }

        .dashboardContainer {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 var(--spacing-xl);
        }

        .kpiCards {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
          margin-bottom: 30px;
        }

        .kpiCard {
          background-color: white;
          border-radius: 12px;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
          padding: 20px;
          position: relative;
          overflow: hidden;
        }

        .kpiCardContent {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .kpiIcon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .kpiInfo {
          display: flex;
          flex-direction: column;
        }

        .kpiLabel {
          font-size: 14px;
          color: #546e7a;
          margin-bottom: 5px;
        }

        .kpiValue {
          font-size: 24px;
          font-weight: 700;
          color: #2c3e50;
          margin-bottom: 5px;
        }

        .kpiChange {
          font-size: 12px;
          font-weight: 500;
        }

        .dashboardRow {
          display: grid;
          grid-template-columns: 3fr 2fr;
          gap: 20px;
          margin-bottom: 30px;
        }

        .dashboardCard {
          background-color: white;
          border-radius: 12px;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
          margin-bottom: 20px;
          overflow: hidden;
        }

        .cardHeader {
          padding: 15px 20px;
          border-bottom: 1px solid #e0e0e0;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .cardHeader h2 {
          font-size: 16px;
          font-weight: 600;
          color: #2c3e50;
          margin: 0;
        }

        .viewAllLink {
          font-size: 14px;
          color: #2e7d32;
          text-decoration: none;
          font-weight: 500;
        }

        .cardBody {
          padding: 20px;
        }

        .salesChart {
          height: 300px;
          position: relative;
        }

        .mockChart {
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
        }

        .dashboardTable {
          width: 100%;
          border-collapse: collapse;
        }

        .dashboardTable th {
          text-align: left;
          padding: 10px;
          font-size: 12px;
          font-weight: 600;
          color: #546e7a;
          border-bottom: 1px solid #e0e0e0;
        }

        .dashboardTable td {
          padding: 12px 10px;
          font-size: 14px;
          border-bottom: 1px solid #f0f0f0;
        }

        .orderLink {
          color: #2e7d32;
          font-weight: 500;
          text-decoration: none;
        }

        .stockSummary {
          display: flex;
          justify-content: space-between;
          margin-bottom: 20px;
        }

        .stockItem {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }

        .stockStatus {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .stockIndicator {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background-color: #4caf50;
        }

        .stockLow {
          background-color: #ff9800;
        }

        .stockOut {
          background-color: #f44336;
        }

        .stockLabel {
          font-size: 14px;
          color: #546e7a;
        }

        .stockValue {
          font-size: 22px;
          font-weight: 600;
          color: #2c3e50;
        }

        .stockAlert {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 15px;
          background-color: rgba(255, 152, 0, 0.1);
          border-radius: 8px;
          color: #e65100;
        }

        .stockAlert p {
          margin: 0;
          font-size: 14px;
          font-weight: 500;
        }

        .customerStats {
          display: flex;
          justify-content: space-around;
          text-align: center;
        }

        .customerStat {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .statLabel {
          font-size: 14px;
          color: #546e7a;
        }

        .statValue {
          font-size: 28px;
          font-weight: 700;
          color: #2c3e50;
        }

        .periodFilter {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .periodSelect {
          padding: 8px 12px;
          border: 1px solid #e0e0e0;
          border-radius: 4px;
          font-size: 14px;
        }

        @media (max-width: 1024px) {
          .kpiCards {
            grid-template-columns: repeat(2, 1fr);
          }

          .dashboardRow {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 768px) {
          .kpiCards {
            grid-template-columns: 1fr;
          }

          .stockSummary {
            flex-direction: column;
            gap: 20px;
          }

          .customerStats {
            flex-direction: column;
            gap: 20px;
          }
        }
      `}</style>
    </>
  );
}
