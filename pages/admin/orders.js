'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import styles from '../../styles/admin-orders.module.css';

export default function AdminOrders() {
  // États
  const [isClient, setIsClient] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [orders, setOrders] = useState([]);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });
  const router = useRouter();

  // Effet pour l'initialisation côté client
  useEffect(() => {
    setIsClient(true);
    
    // Réinitialisation des marges
    if (typeof document !== 'undefined') {
      document.body.classList.add(styles.resetMargins);
      document.documentElement.classList.add(styles.resetMargins);
    }
    
    // Détection du scroll pour le header
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };
    
    // Gestionnaires d'événements
    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', handleScroll);
    }
    
    // Nettoyage
    return () => {
      if (typeof document !== 'undefined') {
        document.body.classList.remove(styles.resetMargins);
        document.documentElement.classList.remove(styles.resetMargins);
      }
      if (typeof window !== 'undefined') {
        window.removeEventListener('scroll', handleScroll);
      }
    };
  }, []);

// Vérification de l'authentification
useEffect(() => {
  if (!isClient) return;
  
  try {
    // Vérifier si l'utilisateur est connecté en tant qu'admin
    const email = localStorage.getItem('userEmail');
    const userRole = localStorage.getItem('userRole');

    console.log('Vérification des autorisations pour:', email);
    console.log('Rôle utilisateur:', userRole);

    // Vérifier si les informations sont présentes
    if (!email || !userRole) {
      console.log('Informations manquantes - Email ou Rôle non trouvé');
      router.push('/login');
      return;
    }

    // Vérifier si l'utilisateur a le rôle admin
    if (userRole !== 'admin') {
      console.log('Accès refusé: L\'utilisateur n\'a pas le rôle admin');
      router.push('/profile');
      return;
    }

    // Si l'utilisateur est bien un admin, autoriser l'accès
    console.log('Accès autorisé pour l\'administrateur');
    setUserEmail(email);
    setIsAuthorized(true);
    
    // Charger les commandes (simulées ici)
    const mockOrders = [
      { 
        id: 'CMD-001', 
        status: 'pending', 
        statusLabel: 'En attente',
        customer: { 
          name: 'Marie Lemaire', 
          email: 'marie.l@example.com',
          address: '15 rue des Lilas, 75020 Paris',
          phone: '06 12 34 56 78'
        }, 
        date: '2025-04-10T14:30:00',
        items: [
          { id: 1, name: 'Savon Lavande', quantity: 2, price: 8.95 },
          { id: 2, name: 'Savon Citron', quantity: 1, price: 7.95 },
          { id: 5, name: 'Porte-savon en bois', quantity: 1, price: 12.50 }
        ],
        shipping: 5.95,
        total: 44.30,
        paymentMethod: 'Carte bancaire'
      },
      { 
        id: 'CMD-002', 
        status: 'processing', 
        statusLabel: 'En préparation',
        customer: { 
          name: 'Thomas Dubois', 
          email: 'thomas.d@example.com',
          address: '8 avenue Victor Hugo, 69003 Lyon',
          phone: '07 98 76 54 32'
        }, 
        date: '2025-04-09T10:15:00',
        items: [
          { id: 3, name: 'Savon Menthe', quantity: 3, price: 8.95 },
          { id: 7, name: 'Shampoing solide Coco', quantity: 1, price: 12.95 }
        ],
        shipping: 5.95,
        total: 45.80,
        paymentMethod: 'PayPal'
      },
      { 
        id: 'CMD-003', 
        status: 'shipped', 
        statusLabel: 'Expédiée',
        trackingNumber: 'LP123456789FR',
        customer: { 
          name: 'Sophie Martin', 
          email: 'sophie.m@example.com',
          address: '23 rue de la Paix, 33000 Bordeaux',
          phone: '06 54 32 10 98'
        }, 
        date: '2025-04-08T16:45:00',
        items: [
          { id: 4, name: 'Savon Argile', quantity: 1, price: 9.95 },
          { id: 8, name: 'Coffret Découverte', quantity: 1, price: 29.95 }
        ],
        shipping: 0,
        total: 39.90,
        paymentMethod: 'Carte bancaire'
      },
      { 
        id: 'CMD-004', 
        status: 'delivered', 
        statusLabel: 'Livrée',
        trackingNumber: 'LP987654321FR',
        customer: { 
          name: 'Pierre Durant', 
          email: 'pierre.d@example.com',
          address: '42 boulevard Haussmann, 75009 Paris',
          phone: '07 65 43 21 09'
        }, 
        date: '2025-04-05T11:20:00',
        items: [
          { id: 6, name: 'Savon Charbon', quantity: 2, price: 9.95 },
          { id: 9, name: 'Filet à savon', quantity: 2, price: 4.95 }
        ],
        shipping: 5.95,
        total: 35.75,
        paymentMethod: 'Apple Pay'
      },
      { 
        id: 'CMD-005', 
        status: 'cancelled', 
        statusLabel: 'Annulée',
        customer: { 
          name: 'Lucie Moreau', 
          email: 'lucie.m@example.com',
          address: '7 rue Saint-Antoine, 59000 Lille',
          phone: '06 87 65 43 21'
        }, 
        date: '2025-04-03T09:10:00',
        items: [
          { id: 10, name: 'Savon Calendula', quantity: 1, price: 8.95 },
          { id: 11, name: 'Baume à lèvres', quantity: 1, price: 5.95 }
        ],
        shipping: 5.95,
        total: 20.85,
        paymentMethod: 'Carte bancaire',
        cancellationReason: 'Commande passée par erreur'
      },
      { 
        id: 'CMD-006', 
        status: 'delivered', 
        statusLabel: 'Livrée',
        trackingNumber: 'LP543216789FR',
        customer: { 
          name: 'Jean Dupont', 
          email: 'jean.d@example.com',
          address: '13 rue de la République, 13001 Marseille',
          phone: '07 12 34 56 78'
        }, 
        date: '2025-04-01T14:05:00',
        items: [
          { id: 12, name: 'Savon Romarin', quantity: 2, price: 8.95 },
          { id: 13, name: 'Dentifrice solide', quantity: 1, price: 7.95 },
          { id: 14, name: 'Boîte de rangement', quantity: 1, price: 14.95 }
        ],
        shipping: 5.95,
        total: 46.75,
        paymentMethod: 'PayPal'
      }
    ];
    
    console.log('Chargement des commandes:', mockOrders.length, 'commandes trouvées');
    setOrders(mockOrders);
    setIsLoading(false);
  } catch (error) {
    console.error('Erreur lors de la vérification des autorisations:', error);
    router.push('/login');
  }
}, [isClient, router]);

  // Fonction pour trier les commandes
  const sortOrders = (ordersToSort) => {
    const sortableOrders = [...ordersToSort];
    
    if (sortConfig.key === 'date') {
      sortableOrders.sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        if (sortConfig.direction === 'asc') {
          return dateA - dateB;
        } else {
          return dateB - dateA;
        }
      });
    } else if (sortConfig.key === 'total') {
      sortableOrders.sort((a, b) => {
        if (sortConfig.direction === 'asc') {
          return a.total - b.total;
        } else {
          return b.total - a.total;
        }
      });
    } else if (sortConfig.key === 'customer') {
      sortableOrders.sort((a, b) => {
        if (sortConfig.direction === 'asc') {
          return a.customer.name.localeCompare(b.customer.name);
        } else {
          return b.customer.name.localeCompare(a.customer.name);
        }
      });
    }
    
    return sortableOrders;
  };

  // Fonction pour filtrer les commandes
  const getFilteredOrders = () => {
    // Filtrer par statut
    let filtered = orders;
    if (activeTab !== 'all') {
      filtered = filtered.filter(order => order.status === activeTab);
    }
    
    // Filtrer par recherche
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(order => 
        order.id.toLowerCase().includes(term) ||
        order.customer.name.toLowerCase().includes(term) ||
        order.customer.email.toLowerCase().includes(term)
      );
    }
    
    // Trier les commandes
    return sortOrders(filtered);
  };

  // Fonction pour formater une date
  const formatDate = (dateString) => {
    const options = { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };

  // Fonction pour changer le statut d'une commande
  const updateOrderStatus = (orderId, newStatus) => {
    try {
      console.log(`Mise à jour du statut de la commande ${orderId} vers ${newStatus}`);
      
      // Trouver l'étiquette correspondant au nouveau statut
      const statusLabels = {
        'pending': 'En attente',
        'processing': 'En préparation',
        'shipped': 'Expédiée',
        'delivered': 'Livrée',
        'cancelled': 'Annulée'
      };
      
      // Mettre à jour l'état
      setOrders(orders.map(order => {
        if (order.id === orderId) {
          return { 
            ...order, 
            status: newStatus,
            statusLabel: statusLabels[newStatus]
          };
        }
        return order;
      }));
      
      // Simuler une notification de succès
      alert(`Le statut de la commande ${orderId} a été mis à jour: ${statusLabels[newStatus]}`);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      alert('Une erreur est survenue lors de la mise à jour du statut.');
    }
  };

  // Fonction pour changer la méthode de tri
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Fonction pour obtenir la classe CSS de tri
  const getSortClass = (key) => {
    if (sortConfig.key !== key) return styles.sortNone;
    return sortConfig.direction === 'asc' ? styles.sortAsc : styles.sortDesc;
  };

  // Rendu de base sans contenu dynamique (pour éviter les erreurs d'hydratation)
  if (!isClient) {
    return (
      <>
        <Head>
          <title>Gestion des Commandes | MonSavonVert</title>
          <meta name="description" content="Panneau d'administration des commandes - MonSavonVert" />
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
        <meta name="description" content="Panneau d'administration des commandes - MonSavonVert" />
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      <div className={styles.globalWrapper}>
        {/* Header avec navigation */}
        <header className={`${styles.header} ${scrolled ? styles.headerScrolled : ''}`}>
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
                    <a className={`${styles.navLink} ${styles.active}`}>Commandes</a>
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
                <h1>Gestion des Commandes</h1>
                <p className={styles.pageDescription}>
                  Suivez et gérez toutes les commandes passées sur votre boutique
                </p>
              </div>
              <div className={styles.pageActions}>
                <button className={styles.refreshButton} onClick={() => setIsLoading(true)}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M23 4v6h-6"></path>
                    <path d="M1 20v-6h6"></path>
                    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10"></path>
                    <path d="M20.49 15a9 9 0 0 1-14.85 3.36L1 14"></path>
                  </svg>
                  Actualiser
                </button>
                <button className={styles.exportButton}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
                        className={`${styles.orderTab} ${activeTab === 'all' ? styles.activeTab : ''}`}
                        onClick={() => setActiveTab('all')}
                      >
                        Toutes
                        <span className={styles.tabCount}>{orders.length}</span>
                      </button>
                      <button 
                        className={`${styles.orderTab} ${activeTab === 'pending' ? styles.activeTab : ''}`}
                        onClick={() => setActiveTab('pending')}
                      >
                        En attente
                        <span className={styles.tabCount}>
                          {orders.filter(order => order.status === 'pending').length}
                        </span>
                      </button>
                      <button 
                        className={`${styles.orderTab} ${activeTab === 'processing' ? styles.activeTab : ''}`}
                        onClick={() => setActiveTab('processing')}
                      >
                        En préparation
                        <span className={styles.tabCount}>
                          {orders.filter(order => order.status === 'processing').length}
                        </span>
                      </button>
                      <button 
                        className={`${styles.orderTab} ${activeTab === 'shipped' ? styles.activeTab : ''}`}
                        onClick={() => setActiveTab('shipped')}
                      >
                        Expédiées
                        <span className={styles.tabCount}>
                          {orders.filter(order => order.status === 'shipped').length}
                        </span>
                      </button>
                      <button 
                        className={`${styles.orderTab} ${activeTab === 'delivered' ? styles.activeTab : ''}`}
                        onClick={() => setActiveTab('delivered')}
                      >
                        Livrées
                        <span className={styles.tabCount}>
                          {orders.filter(order => order.status === 'delivered').length}
                        </span>
                      </button>
                      <button 
                        className={`${styles.orderTab} ${activeTab === 'cancelled' ? styles.activeTab : ''}`}
                        onClick={() => setActiveTab('cancelled')}
                      >
                        Annulées
                        <span className={styles.tabCount}>
                          {orders.filter(order => order.status === 'cancelled').length}
                        </span>
                      </button>
                    </div>
                    <div className={styles.ordersSearch}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
                            className={`${styles.sortableColumn} ${getSortClass('date')}`}
                            onClick={() => requestSort('date')}
                          >
                            Date
                          </th>
                          <th 
                            className={`${styles.sortableColumn} ${getSortClass('customer')}`}
                            onClick={() => requestSort('customer')}
                          >
                            Client
                          </th>
                          <th>Statut</th>
                          <th 
                            className={`${styles.sortableColumn} ${getSortClass('total')}`}
                            onClick={() => requestSort('total')}
                          >
                            Total
                          </th>
                          <th className={styles.actionsColumn}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {getFilteredOrders().map(order => (
                          <>
                            <tr 
                              key={order.id} 
                              className={styles.orderRow}
                              onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                            >
                              <td>
                                <span className={styles.orderId}>{order.id}</span>
                              </td>
                              <td>{formatDate(order.date)}</td>
                              <td>
                                <div className={styles.customerInfo}>
                                  <span className={styles.customerName}>{order.customer.name}</span>
                                  <span className={styles.customerEmail}>{order.customer.email}</span>
                                </div>
                              </td>
                              <td>
                                <span className={`${styles.orderStatus} ${styles[order.status]}`}>
                                  {order.statusLabel}
                                </span>
                              </td>
                              <td>{order.total.toFixed(2)} €</td>
                              <td>
                                <div className={styles.orderActions}>
                                  <button 
                                    className={styles.viewOrderButton}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setExpandedOrder(expandedOrder === order.id ? null : order.id);
                                    }}
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                      <circle cx="12" cy="12" r="10"></circle>
                                      <line x1="12" y1="8" x2="12" y2="16"></line>
                                      <line x1="8" y1="12" x2="16" y2="12"></line>
                                    </svg>
                                  </button>
                                  <div className={styles.orderActionsDropdown}>
                                    <button className={styles.dropdownToggle}>
                                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="12" cy="12" r="1"></circle>
                                        <circle cx="12" cy="5" r="1"></circle>
                                        <circle cx="12" cy="19" r="1"></circle>
                                      </svg>
                                    </button>
                                    <div className={styles.dropdownMenu}>
                                      {order.status === 'pending' && (
                                        <button onClick={(e) => {
                                          e.stopPropagation();
                                          updateOrderStatus(order.id, 'processing');
                                        }}>
                                          Marquer en préparation
                                        </button>
                                      )}
                                      {order.status === 'processing' && (
                                        <button onClick={(e) => {
                                          e.stopPropagation();
                                          updateOrderStatus(order.id, 'shipped');
                                        }}>
                                          Marquer comme expédiée
                                        </button>
                                      )}
                                      {order.status === 'shipped' && (
                                        <button onClick={(e) => {
                                          e.stopPropagation();
                                          updateOrderStatus(order.id, 'delivered');
                                        }}>
                                          Marquer comme livrée
                                        </button>
                                      )}
                                      {(order.status === 'pending' || order.status === 'processing') && (
                                        <button 
                                          className={styles.cancelAction}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            if (confirm('Êtes-vous sûr de vouloir annuler cette commande ?')) {
                                              updateOrderStatus(order.id, 'cancelled');
                                            }
                                          }}
                                        >
                                          Annuler la commande
                                        </button>
                                      )}
                                      <button onClick={(e) => {
                                        e.stopPropagation();
                                        alert('Impression de la facture...');
                                      }}>
                                        Imprimer la facture
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </td>
                            </tr>
                            {expandedOrder === order.id && (
                              <tr className={styles.orderDetailsRow}>
                                <td colSpan="6">
                                  <div className={styles.orderDetails}>
                                    <div className={styles.orderDetailsSections}>
                                      <div className={styles.orderDetailsSection}>
                                        <h3>Informations client</h3>
                                        <div className={styles.detailsGrid}>
                                          <div className={styles.detailItem}>
                                            <span className={styles.detailLabel}>Nom</span>
                                            <span className={styles.detailValue}>{order.customer.name}</span>
                                          </div>
                                          <div className={styles.detailItem}>
                                            <span className={styles.detailLabel}>Email</span>
                                            <span className={styles.detailValue}>{order.customer.email}</span>
                                          </div>
                                          <div className={styles.detailItem}>
                                            <span className={styles.detailLabel}>Téléphone</span>
                                            <span className={styles.detailValue}>{order.customer.phone}</span>
                                          </div>
                                          <div className={styles.detailItem}>
                                            <span className={styles.detailLabel}>Adresse</span>
                                            <span className={styles.detailValue}>{order.customer.address}</span>
                                          </div>
                                        </div>
                                      </div>
                                      
                                      <div className={styles.orderDetailsSection}>
                                        <h3>Informations commande</h3>
                                        <div className={styles.detailsGrid}>
                                          <div className={styles.detailItem}>
                                            <span className={styles.detailLabel}>Numéro</span>
                                            <span className={styles.detailValue}>{order.id}</span>
                                          </div>
                                          <div className={styles.detailItem}>
                                            <span className={styles.detailLabel}>Date</span>
                                            <span className={styles.detailValue}>{formatDate(order.date)}</span>
                                          </div>
                                          <div className={styles.detailItem}>
                                            <span className={styles.detailLabel}>Paiement</span>
                                            <span className={styles.detailValue}>{order.paymentMethod}</span>
                                          </div>
                                          <div className={styles.detailItem}>
                                            <span className={styles.detailLabel}>Statut</span>
                                            <span className={`${styles.detailValue} ${styles.statusBadge} ${styles[order.status]}`}>
                                              {order.statusLabel}
                                            </span>
                                          </div>
                                          {order.trackingNumber && (
                                            <div className={styles.detailItem}>
                                              <span className={styles.detailLabel}>Numéro de suivi</span>
                                              <span className={styles.detailValue}>{order.trackingNumber}</span>
                                            </div>
                                          )}
                                          {order.cancellationReason && (
                                            <div className={styles.detailItem}>
                                              <span className={styles.detailLabel}>Raison d'annulation</span>
                                              <span className={styles.detailValue}>{order.cancellationReason}</span>
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
                                          {order.items.map(item => (
                                            <tr key={item.id}>
                                              <td>{item.name}</td>
                                              <td>{item.price.toFixed(2)} €</td>
                                              <td>{item.quantity}</td>
                                              <td>{(item.price * item.quantity).toFixed(2)} €</td>
                                            </tr>
                                          ))}
                                        </tbody>
                                        <tfoot>
                                          <tr>
                                            <td colSpan="3">Sous-total</td>
                                            <td>{(order.total - order.shipping).toFixed(2)} €</td>
                                          </tr>
                                          <tr>
                                            <td colSpan="3">Frais de livraison</td>
                                            <td>{order.shipping.toFixed(2)} €</td>
                                          </tr>
                                          <tr className={styles.orderTotal}>
                                            <td colSpan="3">Total</td>
                                            <td>{order.total.toFixed(2)} €</td>
                                          </tr>
                                        </tfoot>
                                      </table>
                                    </div>
                                    
                                    <div className={styles.orderDetailActions}>
                                      <div className={styles.statusUpdateSection}>
                                        <label>Mettre à jour le statut</label>
                                        <div className={styles.statusOptions}>
                                          <button 
                                            className={`${styles.statusOption} ${styles.pendingButton} ${order.status === 'pending' ? styles.activeStatus : ''}`}
                                            onClick={() => updateOrderStatus(order.id, 'pending')}
                                            disabled={order.status === 'pending'}
                                          >
                                            En attente
                                          </button>
                                          <button 
                                            className={`${styles.statusOption} ${styles.processingButton} ${order.status === 'processing' ? styles.activeStatus : ''}`}
                                            onClick={() => updateOrderStatus(order.id, 'processing')}
                                            disabled={order.status === 'processing'}
                                          >
                                            En préparation
                                          </button>
                                          <button 
                                            className={`${styles.statusOption} ${styles.shippedButton} ${order.status === 'shipped' ? styles.activeStatus : ''}`}
                                            onClick={() => updateOrderStatus(order.id, 'shipped')}
                                            disabled={order.status === 'shipped'}
                                          >
                                            Expédiée
                                          </button>
                                          <button 
                                            className={`${styles.statusOption} ${styles.deliveredButton} ${order.status === 'delivered' ? styles.activeStatus : ''}`}
                                            onClick={() => updateOrderStatus(order.id, 'delivered')}
                                            disabled={order.status === 'delivered'}
                                          >
                                            Livrée
                                          </button>
                                          <button 
                                            className={`${styles.statusOption} ${styles.cancelledButton} ${order.status === 'cancelled' ? styles.activeStatus : ''}`}
                                            onClick={() => {
                                              if (confirm('Êtes-vous sûr de vouloir annuler cette commande ?')) {
                                                updateOrderStatus(order.id, 'cancelled');
                                              }
                                            }}
                                            disabled={order.status === 'cancelled'}
                                          >
                                            Annulée
                                          </button>
                                        </div>
                                      </div>
                                      
                                      <div className={styles.actionButtons}>
                                        <button 
                                          className={styles.printInvoiceButton}
                                          onClick={() => alert('Impression de la facture...')}
                                        >
                                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="6 9 6 2 18 2 18 9"></polyline>
                                            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                                            <rect x="6" y="14" width="12" height="8"></rect>
                                          </svg>
                                          Imprimer la facture
                                        </button>
                                        <button 
                                          className={styles.emailCustomerButton}
                                          onClick={() => window.open(`mailto:${order.customer.email}?subject=Votre commande ${order.id} - MonSavonVert`)}
                                        >
                                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
                          </>
                        ))}
                      </tbody>
                    </table>
                    
                    {getFilteredOrders().length === 0 && (
                      <div className={styles.noOrdersFound}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
            <p className={styles.copyright}>© 2025 MonSavonVert. Panneau d'administration.</p>
            <div className={styles.footerLinks}>
              <Link href="/admin/help" legacyBehavior><a>Aide</a></Link>
              <Link href="/admin/documentation" legacyBehavior><a>Documentation</a></Link>
              <button onClick={() => {
                localStorage.removeItem('userEmail');
                localStorage.removeItem('token');
                localStorage.removeItem('userRole');
                console.log('Déconnexion réussie');
                router.push('/login');
              }}>
                Se déconnecter
              </button>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}