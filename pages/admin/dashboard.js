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
  // Vérification de l'authentification
  useEffect(() => {
    if (!isClient) return;

    try {
      // Récupérer l'email et le rôle de l'utilisateur depuis le stockage local
      const email = localStorage.getItem("userEmail");
      const userRole = localStorage.getItem("userRole");

      console.log("Vérification des autorisations pour:", email);
      console.log("Rôle utilisateur:", userRole);

      // Vérifier si les informations nécessaires sont disponibles
      if (!email || !userRole) {
        console.log("Informations manquantes - Email ou Rôle non trouvé");
        router.push("/login");
        return;
      }

      // Vérifier si l'utilisateur a le rôle admin
      if (userRole !== "admin") {
        console.log("Accès refusé: L'utilisateur n'a pas le rôle admin");
        router.push("/profile"); // Redirection vers la page de profil standard
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

  // Fonction pour charger les données du tableau de bord selon la période
  const loadDashboardData = () => {
    console.log(`Chargement des données pour la période: ${periodFilter}`);

    // Simuler un temps de chargement
    setIsLoading(true);

    setTimeout(() => {
      // Données simulées pour le tableau de bord
      const mockData = {
        salesSummary: {
          totalSales:
            periodFilter === "week"
              ? 1245.8
              : periodFilter === "month"
              ? 4932.5
              : 58740.2,
          ordersCount:
            periodFilter === "week" ? 18 : periodFilter === "month" ? 72 : 864,
          averageOrderValue:
            periodFilter === "week"
              ? 69.21
              : periodFilter === "month"
              ? 68.51
              : 67.99,
          conversionRate:
            periodFilter === "week"
              ? 3.2
              : periodFilter === "month"
              ? 3.5
              : 3.4,
        },
        salesTrend: [
          // Pour la simplicité, nous simulons juste quelques points de données
          { date: "01/04", value: periodFilter === "week" ? 180 : 180 },
          { date: "02/04", value: periodFilter === "week" ? 220 : 190 },
          { date: "03/04", value: periodFilter === "week" ? 170 : 210 },
          { date: "04/04", value: periodFilter === "week" ? 250 : 180 },
          { date: "05/04", value: periodFilter === "week" ? 300 : 220 },
          { date: "06/04", value: periodFilter === "week" ? 280 : 290 },
          { date: "07/04", value: periodFilter === "week" ? 220 : 230 },
          { date: "08/04", value: periodFilter === "month" ? 190 : 190 },
          { date: "09/04", value: periodFilter === "month" ? 210 : 210 },
          { date: "10/04", value: periodFilter === "month" ? 250 : 250 },
        ],
        topProducts: [
          {
            id: 1,
            name: "Savon Lavande",
            sales:
              periodFilter === "week"
                ? 24
                : periodFilter === "month"
                ? 96
                : 1152,
            revenue:
              periodFilter === "week"
                ? 214.8
                : periodFilter === "month"
                ? 859.2
                : 10310.4,
          },
          {
            id: 3,
            name: "Savon Menthe",
            sales:
              periodFilter === "week"
                ? 18
                : periodFilter === "month"
                ? 72
                : 864,
            revenue:
              periodFilter === "week"
                ? 161.1
                : periodFilter === "month"
                ? 644.4
                : 7732.8,
          },
          {
            id: 8,
            name: "Coffret Découverte",
            sales:
              periodFilter === "week"
                ? 12
                : periodFilter === "month"
                ? 48
                : 576,
            revenue:
              periodFilter === "week"
                ? 359.4
                : periodFilter === "month"
                ? 1437.6
                : 17251.2,
          },
          {
            id: 2,
            name: "Savon Citron",
            sales:
              periodFilter === "week"
                ? 10
                : periodFilter === "month"
                ? 40
                : 480,
            revenue:
              periodFilter === "week"
                ? 79.5
                : periodFilter === "month"
                ? 318.0
                : 3816.0,
          },
          {
            id: 7,
            name: "Shampoing solide Coco",
            sales:
              periodFilter === "week" ? 8 : periodFilter === "month" ? 32 : 384,
            revenue:
              periodFilter === "week"
                ? 103.6
                : periodFilter === "month"
                ? 414.4
                : 4972.8,
          },
        ],
        recentOrders: [
          {
            id: "CMD-001",
            status: "pending",
            statusLabel: "En attente",
            customer: "Marie Lemaire",
            date: "2025-04-10T14:30:00",
            total: 44.3,
          },
          {
            id: "CMD-002",
            status: "processing",
            statusLabel: "En préparation",
            customer: "Thomas Dubois",
            date: "2025-04-09T10:15:00",
            total: 45.8,
          },
          {
            id: "CMD-003",
            status: "shipped",
            statusLabel: "Expédiée",
            customer: "Sophie Martin",
            date: "2025-04-08T16:45:00",
            total: 39.9,
          },
          {
            id: "CMD-004",
            status: "delivered",
            statusLabel: "Livrée",
            customer: "Pierre Durant",
            date: "2025-04-05T11:20:00",
            total: 35.75,
          },
          {
            id: "CMD-005",
            status: "cancelled",
            statusLabel: "Annulée",
            customer: "Lucie Moreau",
            date: "2025-04-03T09:10:00",
            total: 20.85,
          },
        ],
        inventorySummary: {
          totalProducts: 14,
          lowStock: 3,
          outOfStock: 1,
        },
        customerSummary: {
          totalCustomers:
            periodFilter === "week" ? 15 : periodFilter === "month" ? 58 : 680,
          newCustomers:
            periodFilter === "week" ? 5 : periodFilter === "month" ? 22 : 240,
          returningRate:
            periodFilter === "week" ? 40 : periodFilter === "month" ? 42 : 45,
        },
      };

      setDashboardData(mockData);
      setIsLoading(false);
      console.log("Données du tableau de bord chargées avec succès");
    }, 800); // Simuler un délai de chargement
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
                    <a className={`${styles.navLink} ${styles.active}`}>
                      Tableau de bord
                    </a>
                  </Link>
                </li>
                <li className={styles.navItem}>
                  <Link href="/admin/orders" legacyBehavior>
                    <a className={styles.navLink}>Commandes</a>
                  </Link>
                </li>
                <li className={styles.navItem}>
                  <Link href="/admin/products" legacyBehavior>
                    <a className={styles.navLink}>Produits</a>
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
                  onClick={() => setIsLoading(true)}
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
                            {dashboardData.salesSummary.totalSales.toFixed(2)} €
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
                            {dashboardData.salesSummary.ordersCount}
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
                            {dashboardData.customerSummary.totalCustomers}
                          </span>
                          <span
                            className={styles.kpiChange}
                            style={{ color: "#4caf50" }}
                          >
                            +{dashboardData.customerSummary.newCustomers}{" "}
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
                            {dashboardData.salesSummary.averageOrderValue.toFixed(
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
                            {/* Ici, vous pourriez intégrer un vrai graphique avec Chart.js ou Recharts */}
                            <div className={styles.mockChart}>
                              <div className={styles.chartBars}>
                                {dashboardData.salesTrend.map(
                                  (point, index) => (
                                    <div
                                      key={index}
                                      className={styles.chartBarContainer}
                                    >
                                      <div
                                        className={styles.chartBar}
                                        style={{
                                          height: `${
                                            (point.value / 300) * 100
                                          }%`,
                                        }}
                                      ></div>
                                      <span className={styles.chartLabel}>
                                        {point.date}
                                      </span>
                                    </div>
                                  )
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
                              {dashboardData.topProducts.map((product) => (
                                <tr key={product.id}>
                                  <td>{product.name}</td>
                                  <td>{product.sales}</td>
                                  <td>{product.revenue.toFixed(2)} €</td>
                                </tr>
                              ))}
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
                          <Link href="/admin/orders" legacyBehavior>
                            <a className={styles.viewAllLink}>Voir toutes</a>
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
                              {dashboardData.recentOrders.map((order) => (
                                <tr key={order.id}>
                                  <td>
                                    <Link
                                      href={`/admin/orders?id=${order.id}`}
                                      legacyBehavior
                                    >
                                      <a className={styles.orderLink}>
                                        {order.id}
                                      </a>
                                    </Link>
                                  </td>
                                  <td>{formatDate(order.date)}</td>
                                  <td>{order.customer}</td>
                                  <td>
                                    <span
                                      className={`${styles.orderStatus} ${
                                        styles[order.status]
                                      }`}
                                    >
                                      {order.statusLabel}
                                    </span>
                                  </td>
                                  <td>{order.total.toFixed(2)} €</td>
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
                          <Link href="/admin/products" legacyBehavior>
                            <a className={styles.viewAllLink}>
                              Gérer les produits
                            </a>
                          </Link>
                        </div>
                        <div className={styles.cardBody}>
                          <div className={styles.stockSummary}>
                            <div className={styles.stockItem}>
                              <div className={styles.stockStatus}>
                                <span className={styles.stockIndicator}></span>
                                <span className={styles.stockLabel}>
                                  Produits en stock
                                </span>
                              </div>
                              <span className={styles.stockValue}>
                                {dashboardData.inventorySummary.totalProducts -
                                  dashboardData.inventorySummary.lowStock -
                                  dashboardData.inventorySummary.outOfStock}
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
                                {dashboardData.inventorySummary.lowStock}
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
                                {dashboardData.inventorySummary.outOfStock}
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
                              {dashboardData.inventorySummary.lowStock +
                                dashboardData.inventorySummary.outOfStock}{" "}
                              produits à réapprovisionner
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className={styles.dashboardCard}>
                        <div className={styles.cardHeader}>
                          <h2>Activité Clients</h2>
                        </div>
                        <div className={styles.cardBody}>
                          <div className={styles.customerStats}>
                            <div className={styles.customerStat}>
                              <span className={styles.statLabel}>
                                Taux de fidélisation
                              </span>
                              <span className={styles.statValue}>
                                {dashboardData.customerSummary.returningRate}%
                              </span>
                            </div>

                            <div className={styles.customerStat}>
                              <span className={styles.statLabel}>
                                Taux de conversion
                              </span>
                              <span className={styles.statValue}>
                                {dashboardData.salesSummary.conversionRate}%
                              </span>
                            </div>
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
              <Link href="/admin/help" legacyBehavior>
                <a>Aide</a>
              </Link>
              <Link href="/admin/documentation" legacyBehavior>
                <a>Documentation</a>
              </Link>
              <button
                onClick={() => {
                  // Supprimer toutes les informations d'authentification
                  localStorage.removeItem("userEmail");
                  localStorage.removeItem("token");
                  localStorage.removeItem("userRole");
                  console.log("Déconnexion réussie");

                  // Rediriger vers la page de connexion
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

        .chartBars {
          display: flex;
          height: 90%;
          align-items: flex-end;
          gap: 10px;
        }

        .chartBarContainer {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          height: 100%;
        }

        .chartBar {
          width: 100%;
          background-color: #4caf50;
          border-radius: 4px 4px 0 0;
          transition: height 0.3s ease;
        }

        .chartLabel {
          font-size: 12px;
          color: #546e7a;
          margin-top: 8px;
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
