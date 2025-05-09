"use client";

import React , { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import styles from "../../styles/admin-orders.module.css";
import HeaderAdmin from '../../components/HeaderAdmin'; // Import du nouveau composant

export default function AdminOrders() {
  // États
  const [isClient, setIsClient] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [orders, setOrders] = useState([]);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [expandedCustomerDetails, setExpandedCustomerDetails] = useState(null); // Pour stocker les détails complets du client
  const [sortConfig, setSortConfig] = useState({
    key: "date",
    direction: "desc",
  });
  
  // Nouvel état pour le panier moyen
  const [averageBasket, setAverageBasket] = useState(0);
  
  // Nouveaux états pour la modale de statut
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusModalMessage, setStatusModalMessage] = useState("");
  const [statusModalType, setStatusModalType] = useState("success"); // success, error
  
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

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

  // Vérification de l'authentification et récupération des commandes
  useEffect(() => {
    if (!isClient) return;

    try {
      // Récupère les informations d'authentification du stockage local ou de session
      const email = localStorage.getItem('userEmail') || sessionStorage.getItem('userEmail');
      const userRole = localStorage.getItem('role') || sessionStorage.getItem('role');
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');

      console.log('Vérification des autorisations pour:', email);
      console.log('Rôle utilisateur:', userRole);
      console.log('URL API:', API_URL);

      // Vérifie si toutes les informations nécessaires sont présentes
      if (!email || !userRole || !token) {
        console.log('Informations manquantes - Email, Rôle ou Token non trouvé');
        router.push('/login');
        return;
      }

      // Vérifie si l'utilisateur a le rôle admin
      if (userRole !== 'admin') {
        console.log('Accès refusé: L\'utilisateur n\'a pas le rôle admin');
        router.push('/profile');
        return;
      }

      console.log('Accès autorisé pour l\'administrateur');
      setUserEmail(email);
      setIsAuthorized(true);

      // Fonction pour récupérer les commandes
      const fetchOrders = async () => {
        setIsLoading(true);
        try {
          console.log('Tentative de récupération des commandes...');
          console.log('URL complète:', `${API_URL}/orders`);
          
          // Appel API pour récupérer les commandes
          const response = await fetch(`${API_URL}/orders`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          console.log('Statut de la réponse:', response.status);
          
          if (!response.ok) {
            console.error('Réponse non OK:', response.status, response.statusText);
            throw new Error(`Échec de la récupération des commandes: ${response.status} ${response.statusText}`);
          }

          const data = await response.json();
          console.log('Données récupérées depuis l\'API:', data);
          
          if (data.result && data.orders) {
            // Récupération du panier moyen depuis la réponse API
            if (data.orders.averageBasket !== undefined) {
              console.log('Panier moyen récupéré:', data.orders.averageBasket);
              setAverageBasket(data.orders.averageBasket);
            }
            
            // Préparation des statistiques pour les onglets
            const orderStats = {
              all: data.orders.total,
              pending: data.orders.enAttente.count,
              processing: data.orders.enCoursLivraison.count,
              shipped: data.orders.enCoursLivraison.count, 
              delivered: data.orders.livre.count,
              cancelled: data.orders.annule.count
            };
            
            console.log('Statistiques des commandes:', orderStats);
            
            // Combiner toutes les commandes en une seule liste pour l'affichage
            const allOrders = [
              ...data.orders.enAttente.orders,
              ...data.orders.enCoursLivraison.orders,
              ...data.orders.livre.orders,
              ...data.orders.annule.orders
            ];
            
            console.log('Total des commandes chargées:', allOrders.length);
            
            // Mise à jour de l'état des commandes
            setOrders(allOrders);
          } else {
            console.error('Format de données inattendu:', data);
            
            // Si aucune commande n'est trouvée, initialiser avec un tableau vide
            setOrders([]);
          }
        } catch (error) {
          console.error('Erreur lors de la récupération des commandes:', error);
          // En cas d'erreur, initialiser avec un tableau vide
          setOrders([]);
        } finally {
          setIsLoading(false);
        }
      };

      // Appel de la fonction de récupération des commandes
      fetchOrders();
      
    } catch (error) {
      console.error('Erreur lors de la vérification des autorisations:', error);
      router.push('/login');
    }
  }, [isClient, router, API_URL]);

  // Fonction pour récupérer les détails complets d'un client par email
  const fetchCustomerDetails = async (customerEmail) => {
    if (!customerEmail) return null;
    
    try {
      console.log('Récupération des détails complets pour client:', customerEmail);
      
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      
      // CORRECTION: Utiliser l'endpoint correct pour récupérer les détails du client
      // Au lieu de /users/email/:email, utiliser /customers/find-by-email/:email
      const response = await fetch(`${API_URL}/customers/find-by-email/${encodeURIComponent(customerEmail)}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        console.error('Échec de la récupération des détails du client:', response.status);
        return null;
      }
      
      const data = await response.json();
      console.log('Détails du client récupérés:', data);
      
      if (data.result && data.customer) {
        return data.customer;
      } else {
        console.error('Format de données inattendu pour les détails du client:', data);
        return null;
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des détails du client:', error);
      return null;
    }
  };

  // Effet pour récupérer les détails du client lorsqu'une commande est développée
  useEffect(() => {
    if (expandedOrder && orders.length > 0) {
      const order = orders.find(o => (o.id || o._id) === expandedOrder);
      
      if (order && order.customer && order.customer.email) {
        // Récupérer les détails complets du client
        fetchCustomerDetails(order.customer.email)
          .then(customerDetails => {
            if (customerDetails) {
              console.log('Détails client trouvés:', customerDetails);
              setExpandedCustomerDetails(customerDetails);
            }
          });
      }
    } else {
      // Réinitialiser les détails du client lorsque aucune commande n'est développée
      setExpandedCustomerDetails(null);
    }
  }, [expandedOrder, orders]);

  // Fonction pour trier les commandes
  const sortOrders = (ordersToSort) => {
    if (!ordersToSort || ordersToSort.length === 0) {
      console.log('Aucune commande à trier');
      return [];
    }

    console.log(`Tri des commandes par ${sortConfig.key} en ordre ${sortConfig.direction}`);
    const sortableOrders = [...ordersToSort];

    if (sortConfig.key === "date") {
      sortableOrders.sort((a, b) => {
        const dateA = new Date(a.date || a.createdAt || 0);
        const dateB = new Date(b.date || b.createdAt || 0);
        if (sortConfig.direction === "asc") {
          return dateA - dateB;
        } else {
          return dateB - dateA;
        }
      });
    } else if (sortConfig.key === "total") {
      sortableOrders.sort((a, b) => {
        const totalA = parseFloat(a.total || 0);
        const totalB = parseFloat(b.total || 0);
        if (sortConfig.direction === "asc") {
          return totalA - totalB;
        } else {
          return totalB - totalA;
        }
      });
    } else if (sortConfig.key === "customer") {
      sortableOrders.sort((a, b) => {
        const nameA = (a.customer?.name || '').toLowerCase();
        const nameB = (b.customer?.name || '').toLowerCase();
        if (sortConfig.direction === "asc") {
          return nameA.localeCompare(nameB);
        } else {
          return nameB.localeCompare(nameA);
        }
      });
    }

    return sortableOrders;
  };

  // Fonction pour filtrer les commandes
  const getFilteredOrders = () => {
    if (!orders || orders.length === 0) {
      console.log('Aucune commande à filtrer');
      return [];
    }

    // Filtrer par statut
    let filtered = orders;
    if (activeTab !== "all") {
      console.log(`Filtrage par statut: ${activeTab}`);
      filtered = filtered.filter((order) => order.status === activeTab);
    }

    // Filtrer par recherche
    if (searchTerm.trim() !== "") {
      console.log(`Recherche du terme: ${searchTerm}`);
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (order) =>
          (order.id && order.id.toString().toLowerCase().includes(term)) ||
          (order._id && order._id.toString().toLowerCase().includes(term)) ||
          (order.customer?.name && order.customer.name.toLowerCase().includes(term)) ||
          (order.customer?.email && order.customer.email.toLowerCase().includes(term))
      );
    }

    console.log(`Commandes filtrées: ${filtered.length}`);
    
    // Trier les commandes
    return sortOrders(filtered);
  };

  // Fonction pour formater une date
  const formatDate = (dateString) => {
    if (!dateString) return 'Non disponible';
    
    try {
      const options = {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      };
      return new Date(dateString).toLocaleDateString("fr-FR", options);
    } catch (error) {
      console.error('Erreur lors du formatage de la date:', error);
      return 'Date invalide';
    }
  };

  // Fonction pour obtenir l'adresse complète du client
  const getCustomerAddress = (order) => {
    // Si on a les détails complets du client (depuis la collection customers)
    if (expandedCustomerDetails && expandedOrder === (order.id || order._id)) {
      // Construction de l'adresse complète à partir des détails récupérés
      const addressParts = [];
      
      if (expandedCustomerDetails.address) {
        addressParts.push(expandedCustomerDetails.address);
      }
      
      if (expandedCustomerDetails.postalCode) {
        addressParts.push(expandedCustomerDetails.postalCode);
      }
      
      if (expandedCustomerDetails.city) {
        addressParts.push(expandedCustomerDetails.city);
      }
      
      if (expandedCustomerDetails.country) {
        addressParts.push(expandedCustomerDetails.country);
      }
      
      if (addressParts.length > 0) {
        return addressParts.join(', ');
      }
    }
    
    // Fallback sur l'adresse de base dans la commande
    return order.customer?.address || 'Adresse non disponible';
  };

  // Fonction pour changer le statut d'une commande
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      console.log(`Mise à jour du statut de la commande ${orderId} vers ${newStatus}`);
  
      // Récupérer le token
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  
      // Appel API pour mettre à jour le statut
      const response = await fetch(`${API_URL}/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });
  
      if (!response.ok) {
        throw new Error(`Échec de la mise à jour du statut: ${response.status}`);
      }

      const data = await response.json();
      console.log('Réponse de mise à jour du statut:', data);

      // Trouver l'étiquette correspondant au nouveau statut
      const statusLabels = {
        'pending': 'En attente',
        'processing': 'En préparation',
        'shipped': 'Expédiée',
        'delivered': 'Livrée',
        'cancelled': 'Annulée'
      };
      
      // Mettre à jour l'état local sans avoir à recharger toutes les commandes
      setOrders(orders.map(order => {
        if (order.id === orderId || order._id === orderId) {
          return { 
            ...order, 
            status: newStatus,
            statusLabel: statusLabels[newStatus]
          };
        }
        return order;
      }));
      
      // Utilisez la modale au lieu de alert
      setStatusModalType('success');
      setStatusModalMessage(`Le statut de la commande ${orderId} a été mis à jour: ${statusLabels[newStatus]}`);
      setShowStatusModal(true);
      
      // Fermer automatiquement la modale après 3 secondes
      setTimeout(() => {
        setShowStatusModal(false);
      }, 3000);
      
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      
      // Afficher une modale d'erreur
      setStatusModalType('error');
      setStatusModalMessage('Une erreur est survenue lors de la mise à jour du statut.');
      setShowStatusModal(true);
    }
  };

  // Fonction pour changer la méthode de tri
  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  // Fonction pour obtenir la classe CSS de tri
  const getSortClass = (key) => {
    if (sortConfig.key !== key) return styles.sortNone;
    return sortConfig.direction === "asc" ? styles.sortAsc : styles.sortDesc;
  };

  // Rendu de base sans contenu dynamique (pour éviter les erreurs d'hydratation)
  if (!isClient) {
    return (
      <>
        <Head>
          <title>Gestion des Commandes | MonSavonVert</title>
          <meta
            name="description"
            content="Panneau d'administration des commandes - MonSavonVert"
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
        <title>Gestion des Commandes | MonSavonVert</title>
        <meta
          name="description"
          content="Panneau d'administration des commandes - MonSavonVert"
        />
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      <div className={styles.container}>
        {/* Header avec navigation */}
        <HeaderAdmin 
          userEmail={userEmail} 
          activePage="orders" // Indique la page active pour le style
        />


        <main className={styles.mainContent}>
          {/* Page title section */}
          <section className={styles.pageHeaderSection}>
            <div className={styles.pageHeaderContent}>
              <div className={styles.pageTitle}>
                <h1>Gestion des Commandes</h1>
                <div className={styles.pageStats}>
                  <p className={styles.pageDescription}>
                    Suivez et gérez toutes les commandes passées sur votre
                    boutique
                  </p>
                  {/* Nouveau bloc pour afficher le panier moyen */}
                  <div className={styles.avgBasketInfo}>
                    <span className={styles.avgBasketLabel}>Panier moyen :</span>
                    <span className={styles.avgBasketValue}>{averageBasket.toFixed(2)} €</span>
                  </div>
                </div>
              </div>
              <div className={styles.pageActions}>
                <button
                  className={styles.refreshButton}
                  onClick={() => {
                    setIsLoading(true);
                    // Forcer un rechargement des commandes
                    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
                    
                    fetch(`${API_URL}/orders`, {
                      method: 'GET',
                      headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                      }
                    }).then(res => res.json())
                    .then(data => {
                      if (data.result && data.orders) {
                        // Mise à jour du panier moyen lors de l'actualisation
                        if (data.orders.averageBasket !== undefined) {
                          setAverageBasket(data.orders.averageBasket);
                        }
                        
                        const allOrders = [
                          ...data.orders.enAttente.orders,
                          ...data.orders.enCoursLivraison.orders,
                          ...data.orders.livre.orders,
                          ...data.orders.annule.orders
                        ];
                        setOrders(allOrders);
                        
                        // Log pour vérifier les données actualisées
                        console.log('Commandes actualisées:', allOrders.length);
                        console.log('Panier moyen actualisé:', data.orders.averageBasket);
                      }
                      setIsLoading(false);
                    })
                    .catch(err => {
                      console.error('Erreur lors du rafraîchissement:', err);
                      setIsLoading(false);
                    });
                  }}
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
              </div>
            </div>
          </section>

          {/* Contenu principal */}
          <section className={styles.ordersSection}>
            <div className={styles.ordersContainer}>
              {isLoading ? (
                <div className={styles.loadingOrders}>
                  <div className={styles.spinner}></div>
                  <p>Chargement des commandes...</p>
                </div>
              ) : (
                <>
                  {/* Filtres et recherche */}
                  <div className={styles.ordersControls}>
                    <div className={styles.ordersTabs}>
                      <button
                        className={`${styles.orderTab} ${
                          activeTab === "all" ? styles.activeTab : ""
                        }`}
                        onClick={() => setActiveTab("all")}
                      >
                        Toutes
                        <span className={styles.tabCount}>{orders.length}</span>
                      </button>
                      <button
                        className={`${styles.orderTab} ${
                          activeTab === "pending" ? styles.activeTab : ""
                        }`}
                        onClick={() => setActiveTab("pending")}
                      >
                        En attente
                        <span className={styles.tabCount}>
                          {
                            orders.filter((order) => order.status === "pending")
                              .length
                          }
                        </span>
                      </button>
                      <button
                        className={`${styles.orderTab} ${
                          activeTab === "processing" ? styles.activeTab : ""
                        }`}
                        onClick={() => setActiveTab("processing")}
                      >
                        En préparation
                        <span className={styles.tabCount}>
                          {
                            orders.filter(
                              (order) => order.status === "processing"
                            ).length
                          }
                        </span>
                      </button>
                      <button
                        className={`${styles.orderTab} ${
                          activeTab === "shipped" ? styles.activeTab : ""
                        }`}
                        onClick={() => setActiveTab("shipped")}
                      >
                        Expédiées
                        <span className={styles.tabCount}>
                          {
                            orders.filter((order) => order.status === "shipped")
                              .length
                          }
                        </span>
                      </button>
                      <button
                        className={`${styles.orderTab} ${
                          activeTab === "delivered" ? styles.activeTab : ""
                        }`}
                        onClick={() => setActiveTab("delivered")}
                      >
                        Livrées
                        <span className={styles.tabCount}>
                          {
                            orders.filter(
                              (order) => order.status === "delivered"
                            ).length
                          }
                        </span>
                      </button>
                      <button
                        className={`${styles.orderTab} ${
                          activeTab === "cancelled" ? styles.activeTab : ""
                        }`}
                        onClick={() => setActiveTab("cancelled")}
                      >
                        Annulées
                        <span className={styles.tabCount}>
                          {
                            orders.filter(
                              (order) => order.status === "cancelled"
                            ).length
                          }
                        </span>
                      </button>
                    </div>
                    <div className={styles.ordersSearch}>
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
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                      </svg>
                      <input
                        type="text"
                        placeholder="Rechercher une commande, un client..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Tableau des commandes */}
                  <div className={styles.ordersTableWrapper}>
                    <table className={styles.ordersTable}>
                      <thead>
                        <tr>
                          <th className={styles.orderIdColumn}>Commande</th>
                          <th
                            className={`${styles.sortableColumn} ${getSortClass(
                              "date"
                            )}`}
                            onClick={() => requestSort("date")}
                          >
                            Date
                          </th>
                          <th
                            className={`${styles.sortableColumn} ${getSortClass(
                              "customer"
                            )}`}
                            onClick={() => requestSort("customer")}
                          >
                            Client
                          </th>
                          <th>Statut</th>
                          <th
                            className={`${styles.sortableColumn} ${getSortClass(
                              "total"
                            )}`}
                            onClick={() => requestSort("total")}
                          >
                            Total
                          </th>
                          <th className={styles.actionsColumn}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {getFilteredOrders().map((order) => (
                          <React.Fragment key={order.id || order._id}>
                            <tr
                              className={styles.orderRow}
                              onClick={() =>
                                setExpandedOrder(
                                  expandedOrder === (order.id || order._id) ? null : (order.id || order._id)
                                )
                              }
                            >
                              <td data-label="Commande">
                                <span className={styles.orderId}>
                                  {order.id || order._id || 'ID non disponible'}
                                </span>
                              </td>
                              <td data-label="Date">{formatDate(order.date || order.createdAt)}</td>
                              <td data-label="Client">
                                <div className={styles.customerInfo}>
                                  <span className={styles.customerName}>
                                    {order.customer?.name || 'Client non renseigné'}
                                  </span>
                                  <span className={styles.customerEmail}>
                                    {order.customer?.email || 'Email non renseigné'}
                                  </span>
                                </div>
                              </td>
                              <td data-label="Statut">
                                <span
                                  className={`${styles.orderStatus} ${
                                    styles[order.status] || ""
                                  }`}
                                >
                                  {order.statusLabel || 'Statut inconnu'}
                                </span>
                              </td>
                              <td data-label="Total">{(order.total || 0).toFixed(2)} €</td>
                              <td data-label="Actions">
                                <div className={styles.orderActions}>
                                  <button
                                    className={styles.viewOrderButton}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setExpandedOrder(
                                        expandedOrder === (order.id || order._id)
                                          ? null
                                          : (order.id || order._id)
                                      );
                                    }}
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
                                      <circle cx="12" cy="12" r="10"></circle>
                                      <line
                                        x1="12"
                                        y1="8"
                                        x2="12"
                                        y2="16"
                                      ></line>
                                      <line
                                        x1="8"
                                        y1="12"
                                        x2="16"
                                        y2="12"
                                      ></line>
                                    </svg>
                                  </button>
                              
                                </div>
                              </td>
                            </tr>
                            {expandedOrder === (order.id || order._id) && (
                              <tr className={styles.orderDetailsRow}>
                                <td colSpan="6">
                                  <div className={styles.orderDetails}>
                                    <div
                                      className={styles.orderDetailsSections}
                                    >
                                      <div
                                        className={styles.orderDetailsSection}
                                      >
                                        <h3>Informations client</h3>
                                        <div className={styles.detailsGrid}>
                                          <div className={styles.detailItem}>
                                            <span
                                              className={styles.detailLabel}
                                            >
                                              Nom
                                            </span>
                                            <span
                                              className={styles.detailValue}
                                            >
                                              {expandedCustomerDetails?.firstName && expandedCustomerDetails?.lastName ? 
                                                `${expandedCustomerDetails.firstName} ${expandedCustomerDetails.lastName}` : 
                                                order.customer?.name || 'Non renseigné'}
                                            </span>
                                          </div>
                                          <div className={styles.detailItem}>
                                            <span
                                              className={styles.detailLabel}
                                            >
                                              Email
                                            </span>
                                            <span
                                              className={styles.detailValue}
                                            >
                                              {expandedCustomerDetails?.email || order.customer?.email || 'Non renseigné'}
                                            </span>
                                          </div>
                                          <div className={styles.detailItem}>
                                            <span
                                              className={styles.detailLabel}
                                            >
                                              Téléphone
                                            </span>
                                            <span
                                              className={styles.detailValue}
                                            >
                                              {expandedCustomerDetails?.phone || order.customer?.phone || 'Non renseigné'}
                                            </span>
                                          </div>
                                          <div className={styles.detailItem}>
                                            <span
                                              className={styles.detailLabel}
                                            >
                                              Adresse
                                            </span>
                                            <span
                                              className={styles.detailValue}
                                            >
                                              {getCustomerAddress(order)}
                                            </span>
                                          </div>
                                        </div>
                                      </div>

                                      <div
                                        className={styles.orderDetailsSection}
                                      >
                                        <h3>Informations commande</h3>
                                        <div className={styles.detailsGrid}>
                                          <div className={styles.detailItem}>
                                            <span
                                              className={styles.detailLabel}
                                            >
                                              Numéro
                                            </span>
                                            <span
                                              className={styles.detailValue}
                                            >
                                              {order.id || order._id || 'Non renseigné'}
                                            </span>
                                          </div>
                                          <div className={styles.detailItem}>
                                            <span
                                              className={styles.detailLabel}
                                            >
                                              Date
                                            </span>
                                            <span
                                              className={styles.detailValue}
                                            >
                                              {formatDate(order.date || order.createdAt)}
                                            </span>
                                          </div>
                                          <div className={styles.detailItem}>
                                            <span
                                              className={styles.detailLabel}
                                            >
                                              Paiement
                                            </span>
                                            <span
                                              className={styles.detailValue}
                                            >
                                              {order.paymentMethod || 'Non renseigné'}
                                            </span>
                                          </div>
                                          <div className={styles.detailItem}>
                                            <span
                                              className={styles.detailLabel}
                                            >
                                              Statut
                                            </span>
                                            <span
                                              className={`${
                                                styles.detailValue
                                              } ${styles.statusBadge} ${
                                                styles[order.status] || ""
                                              }`}
                                            >
                                              {order.statusLabel || 'Statut inconnu'}
                                            </span>
                                          </div>
                                          {order.trackingNumber && (
                                            <div className={styles.detailItem}>
                                              <span
                                                className={styles.detailLabel}
                                              >
                                                Numéro de suivi
                                              </span>
                                              <span
                                                className={styles.detailValue}
                                              >
                                                {order.trackingNumber}
                                              </span>
                                            </div>
                                          )}
                                          {order.cancellationReason && (
                                            <div className={styles.detailItem}>
                                              <span
                                                className={styles.detailLabel}
                                              >
                                                Raison d'annulation
                                              </span>
                                              <span
                                                className={styles.detailValue}
                                              >
                                                {order.cancellationReason}
                                              </span>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </div>

                                    <div className={styles.orderItems}>
                                      <h3>Articles commandés</h3>
                                      <table className={styles.orderItemsTable}>
                                        <thead>
                                          <tr>
                                            <th>Produit</th>
                                            <th>Prix unitaire</th>
                                            <th>Quantité</th>
                                            <th>Total</th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {order.items && order.items.length > 0 ? (
                                            order.items.map((item, index) => (
                                              <tr key={item.id || index}>
                                                <td data-label="Produit">{item.name || 'Produit inconnu'}</td>
                                                <td data-label="Prix unitaire">{(item.price || 0).toFixed(2)} €</td>
                                                <td data-label="Quantité">{item.quantity || 0}</td>
                                                <td data-label="Total">
                                                  {(
                                                    (item.price || 0) * (item.quantity || 0)
                                                  ).toFixed(2)}{" "}
                                                  €
                                                </td>
                                              </tr>
                                            ))
                                          ) : (
                                            <tr>
                                              <td colSpan="4">Aucun article dans cette commande</td>
                                            </tr>
                                          )}
                                        </tbody>
                                        <tfoot>
                                          <tr>
                                            <td colSpan="3">Sous-total</td>
                                            <td>
                                              {(
                                                (order.total || 0) - (order.shipping || 0)
                                              ).toFixed(2)}{" "}
                                              €
                                            </td>
                                          </tr>
                                          <tr>
                                            <td colSpan="3">
                                              Frais de livraison
                                            </td>
                                            <td>
                                              {(order.shipping || 0).toFixed(2)} €
                                            </td>
                                          </tr>
                                          <tr className={styles.orderTotal}>
                                            <td colSpan="3">Total</td>
                                            <td>{(order.total || 0).toFixed(2)} €</td>
                                          </tr>
                                        </tfoot>
                                      </table>
                                    </div>

                                    <div className={styles.orderDetailActions}>
                                      <div
                                        className={styles.statusUpdateSection}
                                      >
                                        <label>Mettre à jour le statut</label>
                                        <div className={styles.statusOptions}>
                                          <button
                                            className={`${
                                              styles.statusOption
                                            } ${styles.pendingButton} ${
                                              order.status === "pending"
                                                ? styles.activeStatus
                                                : ""
                                            }`}
                                            onClick={() =>
                                              updateOrderStatus(
                                                (order.id || order._id),
                                                "pending"
                                              )
                                            }
                                            disabled={
                                              order.status === "pending"
                                            }
                                          >
                                            En attente
                                          </button>
                                          <button
                                            className={`${
                                              styles.statusOption
                                            } ${styles.processingButton} ${
                                              order.status === "processing"
                                                ? styles.activeStatus
                                                : ""
                                            }`}
                                            onClick={() =>
                                              updateOrderStatus(
                                                (order.id || order._id),
                                                "processing"
                                              )
                                            }
                                            disabled={
                                              order.status === "processing"
                                            }
                                          >
                                            En préparation
                                          </button>
                                          <button
                                            className={`${
                                              styles.statusOption
                                            } ${styles.shippedButton} ${
                                              order.status === "shipped"
                                                ? styles.activeStatus
                                                : ""
                                            }`}
                                            onClick={() =>
                                              updateOrderStatus(
                                                (order.id || order._id),
                                                "shipped"
                                              )
                                            }
                                            disabled={
                                              order.status === "shipped"
                                            }
                                          >
                                            Expédiée
                                          </button>
                                          <button
                                            className={`${
                                              styles.statusOption
                                            } ${styles.deliveredButton} ${
                                              order.status === "delivered"
                                                ? styles.activeStatus
                                                : ""
                                            }`}
                                            onClick={() =>
                                              updateOrderStatus(
                                                (order.id || order._id),
                                                "delivered"
                                              )
                                            }
                                            disabled={
                                              order.status === "delivered"
                                            }
                                          >
                                            Livrée
                                          </button>
                                          <button
                                            className={`${
                                              styles.statusOption
                                            } ${styles.cancelledButton} ${
                                              order.status === "cancelled"
                                                ? styles.activeStatus
                                                : ""
                                            }`}
                                            onClick={() => {
                                              if (
                                                confirm(
                                                  "Êtes-vous sûr de vouloir annuler cette commande ?"
                                                )
                                              ) {
                                                updateOrderStatus(
                                                  (order.id || order._id),
                                                  "cancelled"
                                                );
                                              }
                                            }}
                                            disabled={
                                              order.status === "cancelled"
                                            }
                                          >
                                            Annulée
                                          </button>
                                        </div>
                                      </div>

                                      <div className={styles.actionButtons}>
                                        <button
                                          className={styles.printInvoiceButton}
                                          onClick={() =>
                                            alert("Impression de la facture...")
                                          }
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
                                            <polyline points="6 9 6 2 18 2 18 9"></polyline>
                                            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                                            <rect
                                              x="6"
                                              y="14"
                                              width="12"
                                              height="8"
                                            ></rect>
                                          </svg>
                                          Imprimer la facture
                                        </button>
                                        <button
                                          className={styles.emailCustomerButton}
                                          onClick={() =>
                                            window.open(
                                              `mailto:${order.customer?.email || ''}?subject=Votre commande ${order.id || order._id} - MonSavonVert`
                                            )
                                          }
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
                                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                                            <polyline points="22,6 12,13 2,6"></polyline>
                                          </svg>
                                          Contacter le client
                                        </button>
                                      </div>

                                      <button
                                        className={styles.closeDetailsButton}
                                        onClick={() => setExpandedOrder(null)}
                                      >
                                        Fermer les détails
                                      </button>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        ))}
                      </tbody>
                    </table>

                    {getFilteredOrders().length === 0 && (
                      <div className={styles.noOrdersFound}>
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
                          <path d="M16 16s-1.5-2-4-2-4 2-4 2"></path>
                          <line x1="9" y1="9" x2="9.01" y2="9"></line>
                          <line x1="15" y1="9" x2="15.01" y2="9"></line>
                        </svg>
                        <p>Aucune commande trouvée</p>
                      </div>
                    )}
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
                  localStorage.removeItem("role");
                  sessionStorage.removeItem("userEmail");
                  sessionStorage.removeItem("token");
                  sessionStorage.removeItem("role");
                  console.log("Déconnexion réussie");
                  router.push("/login");
                }}
              >
                Se déconnecter
              </button>
            </div>
          </div>
        </footer>
        
        {/* Modale de statut */}
        {showStatusModal && (
          <div className={styles.statusModalOverlay}>
            <div className={`${styles.statusModal} ${styles[statusModalType]}`}>
              <div className={styles.statusModalContent}>
                {statusModalType === 'success' && (
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="16 12 12 16 8 12"></polyline>
                    <line x1="12" y1="8" x2="12" y2="16"></line>
                  </svg>
                )}
                {statusModalType === 'error' && (
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                  </svg>
                )}
                <p>{statusModalMessage}</p>
                <button 
                  className={styles.statusModalCloseButton}
                  onClick={() => setShowStatusModal(false)}
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