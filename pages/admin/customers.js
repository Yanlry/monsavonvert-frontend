'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import styles from '../../styles/admin-customers.module.css'; // Réutilisation du même fichier CSS

export default function AdminCustomers() {
  // États
  const [isClient, setIsClient] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [customers, setCustomers] = useState([]);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCustomer, setExpandedCustomer] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'firstName', direction: 'asc' });
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [currentCustomer, setCurrentCustomer] = useState(null);
  const router = useRouter();

  // États pour les statistiques clients
  const [customerStats, setCustomerStats] = useState({
    totalCustomers: 0,
    activeCustomers: 0,
    inactiveCustomers: 0,
    newCustomersThisMonth: 0,
    averageOrderValue: 0
  });
  
  // États pour le formulaire
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    postalCode: '',
    city: '',
    country: 'France',
    notes: ''
  });

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
      const token = localStorage.getItem('token');

      console.log('Vérification des autorisations pour:', email);
      console.log('Rôle utilisateur:', userRole);

      // Vérifier si les informations sont présentes
      if (!email || !userRole || !token) {
        console.log('Informations manquantes - Email, Rôle ou Token non trouvé');
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
      
      // Charger les clients depuis l'API
      fetchCustomers(token);
      
    } catch (error) {
      console.error('Erreur lors de la vérification des autorisations:', error);
      router.push('/login');
    }
  }, [isClient, router]);

  // Fonction pour récupérer les clients depuis l'API
  const fetchCustomers = async (token) => {
    try {
      // URL de l'API backend pour récupérer tous les clients
      const response = await fetch('http://monsavonvert-frontend.vercel.app/customers/', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Échec de la récupération des clients');
      }

      const data = await response.json();
      console.log('Clients récupérés depuis l\'API:', data);
      
      if (data.result && Array.isArray(data.customers)) {
        setCustomers(data.customers);
        
        // Calculer les statistiques des clients
        calculateCustomerStats(data.customers);
      } else {
        console.error('Format de données inattendu:', data);
        setCustomers([]);
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error('Erreur lors de la récupération des clients:', error);
      setIsLoading(false);
    }
  };

  // Calculer les statistiques à partir des données clients
  const calculateCustomerStats = (customersData) => {
    // Nous n'avons pas l'info isActive, donc on considère tous les clients comme actifs
    const activeCustomers = customersData.length;
    
    // Date actuelle
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    // Clients inscrits ce mois-ci
    const newThisMonth = customersData.filter(
      customer => new Date(customer.createdAt) >= firstDayOfMonth
    ).length;
    
    // Pour le moment, pas de données sur les commandes
    const avgOrderValue = 0;
    
    setCustomerStats({
      totalCustomers: customersData.length,
      activeCustomers,
      inactiveCustomers: 0, // Pas d'info sur les clients inactifs pour le moment
      newCustomersThisMonth: newThisMonth,
      averageOrderValue: avgOrderValue
    });
  };

  // Fonction pour trier les clients
  const sortCustomers = (customersToSort) => {
    const sortableCustomers = [...customersToSort];
    
    sortableCustomers.sort((a, b) => {
      let aValue, bValue;
      
      // Gestion des cas particuliers
      if (sortConfig.key === 'name') {
        // Pour le tri par nom, on combine firstName et lastName
        aValue = `${a.firstName || ''} ${a.lastName || ''}`.toLowerCase();
        bValue = `${b.firstName || ''} ${b.lastName || ''}`.toLowerCase();
      } else if (sortConfig.key === 'createdAt') {
        aValue = a.createdAt ? new Date(a.createdAt) : new Date(0);
        bValue = b.createdAt ? new Date(b.createdAt) : new Date(0);
      } else {
        aValue = a[sortConfig.key];
        bValue = b[sortConfig.key];
        
        if (typeof aValue === 'string') {
          aValue = aValue.toLowerCase();
        }
        if (typeof bValue === 'string') {
          bValue = bValue.toLowerCase();
        }
      }
      
      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
    
    return sortableCustomers;
  };

  // Fonction pour filtrer les clients
  const getFilteredCustomers = () => {
    // Pour l'instant, on filtre uniquement par recherche car il n'y a pas d'info isActive
    let filtered = customers;
    
    // Filtrer par recherche
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(customer => 
        (customer.firstName && customer.firstName.toLowerCase().includes(term)) ||
        (customer.lastName && customer.lastName.toLowerCase().includes(term)) ||
        (customer.email && customer.email.toLowerCase().includes(term)) ||
        (customer.phone && customer.phone.includes(term)) ||
        (customer.city && customer.city.toLowerCase().includes(term))
      );
    }
    
    // Trier les clients
    return sortCustomers(filtered);
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

  // Fonction pour formater une date
  const formatDate = (dateString) => {
    if (!dateString) return 'Non disponible';
    
    const options = { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    };
    
    try {
      return new Date(dateString).toLocaleDateString('fr-FR', options);
    } catch (error) {
      console.error('Erreur de formatage de la date:', error);
      return 'Date invalide';
    }
  };

  // Fonction pour ouvrir le modal de détails/édition du client
  const openCustomerModal = (customer) => {
    setCurrentCustomer(customer);
    setFormData({
      firstName: customer.firstName || '',
      lastName: customer.lastName || '',
      email: customer.email || '',
      phone: customer.phone || '',
      address: customer.address || '',
      postalCode: customer.postalCode || '',
      city: customer.city || '',
      country: customer.country || 'France',
      notes: customer.notes || ''
    });
    setShowCustomerModal(true);
  };

  // Fonction pour gérer les changements dans le formulaire
  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setFormData({ ...formData, [name]: checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // Fonction pour soumettre le formulaire d'édition
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Validation des données
      if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone) {
        alert('Veuillez remplir tous les champs obligatoires');
        return;
      }
      
      const token = localStorage.getItem('token');
      
      // Appel API pour mettre à jour le client
      const response = await fetch(`http://monsavonvert-frontend.vercel.app/customers/${currentCustomer._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        throw new Error('Échec de la mise à jour du client');
      }
      
      const updatedData = await response.json();
      
      if (updatedData.result && updatedData.customer) {
        // Mise à jour locale du client
        const updatedCustomers = customers.map(customer => {
          if (customer._id === currentCustomer._id) {
            return updatedData.customer;
          }
          return customer;
        });
        
        setCustomers(updatedCustomers);
        
        // Fermeture du modal
        setShowCustomerModal(false);
        
        console.log('Client mis à jour:', currentCustomer._id);
      } else {
        throw new Error('Format de réponse inattendu');
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du client:', error);
      alert('Une erreur est survenue lors de la mise à jour du client');
    }
  };

  // Rendu de base sans contenu dynamique (pour éviter les erreurs d'hydratation)
  if (!isClient) {
    return (
      <>
        <Head>
          <title>Gestion des Clients | MonSavonVert</title>
          <meta name="description" content="Panneau d'administration des clients - MonSavonVert" />
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
        <title>Gestion des Clients | MonSavonVert</title>
        <meta name="description" content="Panneau d'administration des clients - MonSavonVert" />
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      <div className={styles.container}>
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
                    <a className={`${styles.navLink} ${styles.active}`}>Clients</a>
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
                <h1>Gestion des Clients</h1>
                <p className={styles.pageDescription}>
                  Consultez et gérez les informations de vos clients
                </p>
              </div>
              <div className={styles.pageActions}>
                <button className={styles.exportButton} onClick={() => {
                  alert('Fonctionnalité d\'export en développement');
                }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                  </svg>
                  Exporter les clients
                </button>
              </div>
            </div>
          </section>
          
          {/* Contenu principal */}
          <section className={styles.customersSection}>
            <div className={styles.customersContainer}>
              {isLoading ? (
                <div className={styles.loadingOrders}>
                  <div className={styles.spinner}></div>
                  <p>Chargement des clients...</p>
                </div>
              ) : (
                <>
                  {/* Cartes statistiques */}
                  <div className={styles.customerStatsCards}>
                    <div className={styles.statCard}>
                      <div className={styles.statIcon}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4caf50" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                          <circle cx="9" cy="7" r="4"></circle>
                          <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                        </svg>
                      </div>
                      <div className={styles.statContent}>
                        <span className={styles.statValue}>{customerStats.totalCustomers}</span>
                        <span className={styles.statLabel}>Total clients</span>
                      </div>
                    </div>
                    
                    <div className={styles.statCard}>
                      <div className={styles.statIcon}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2196f3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                          <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                      </div>
                      <div className={styles.statContent}>
                        <span className={styles.statValue}>{customerStats.totalCustomers}</span>
                        <span className={styles.statLabel}>Clients actifs</span>
                      </div>
                    </div>
                    
                    <div className={styles.statCard}>
                      <div className={styles.statIcon}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ff9800" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                          <circle cx="8.5" cy="7" r="4"></circle>
                          <line x1="20" y1="8" x2="20" y2="14"></line>
                          <line x1="23" y1="11" x2="17" y2="11"></line>
                        </svg>
                      </div>
                      <div className={styles.statContent}>
                        <span className={styles.statValue}>{customerStats.newCustomersThisMonth}</span>
                        <span className={styles.statLabel}>Nouveaux ce mois</span>
                      </div>
                    </div>
                    
                    <div className={styles.statCard}>
                      <div className={styles.statIcon}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9c27b0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="12" y1="1" x2="12" y2="23"></line>
                          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                        </svg>
                      </div>
                      <div className={styles.statContent}>
                        <span className={styles.statValue}>0.00 €</span>
                        <span className={styles.statLabel}>Panier moyen</span>
                      </div>
                    </div>
                  </div>
                
                  {/* Filtres et recherche */}
                  <div className={styles.customersControls}>
                    <div className={styles.customersTabs}>
                      <button 
                        className={`${styles.orderTab} ${activeTab === 'all' ? styles.activeTab : ''}`}
                        onClick={() => setActiveTab('all')}
                      >
                        Tous les clients
                        <span className={styles.tabCount}>{customerStats.totalCustomers}</span>
                      </button>
                      <button 
                        className={`${styles.orderTab} ${activeTab === 'recent' ? styles.activeTab : ''}`}
                        onClick={() => setActiveTab('recent')}
                      >
                        Inscriptions récentes
                        <span className={styles.tabCount}>{customerStats.newCustomersThisMonth}</span>
                      </button>
                    </div>
                    <div className={styles.ordersSearch}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                      </svg>
                      <input 
                        type="text" 
                        placeholder="Rechercher un client..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  {/* Tableau des clients */}
                  <div className={styles.ordersTableWrapper}>
                    <table className={styles.ordersTable}>
                      <thead>
                        <tr>
                          {/* La colonne ID a été supprimée */}
                          <th className={`${styles.sortableColumn} ${getSortClass('firstName')}`} onClick={() => requestSort('firstName')}>
                            Prénom
                          </th>
                          <th className={`${styles.sortableColumn} ${getSortClass('lastName')}`} onClick={() => requestSort('lastName')}>
                            Nom
                          </th>
                          <th className={`${styles.sortableColumn} ${getSortClass('email')}`} onClick={() => requestSort('email')}>
                            Email
                          </th>
                          <th>Téléphone</th>
                          <th className={`${styles.sortableColumn} ${getSortClass('city')}`} onClick={() => requestSort('city')}>
                            Ville
                          </th>
                          <th className={`${styles.sortableColumn} ${getSortClass('createdAt')}`} onClick={() => requestSort('createdAt')}>
                            Inscription
                          </th>
                          <th className={styles.actionsColumn}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {getFilteredCustomers().map(customer => (
                          <>
                            <tr 
                              key={customer._id} 
                              className={styles.customerRow}
                              onClick={() => setExpandedCustomer(expandedCustomer === customer._id ? null : customer._id)}
                            >
                              {/* La cellule ID a été supprimée */}
                              <td>{customer.firstName || 'Non renseigné'}</td>
                              <td>{customer.lastName || 'Non renseigné'}</td>
                              <td>
                                <a href={`mailto:${customer.email}`} onClick={(e) => e.stopPropagation()} className={styles.customerEmail}>
                                  {customer.email || 'Non renseigné'}
                                </a>
                              </td>
                              <td>{customer.phone || 'Non renseigné'}</td>
                              <td>{customer.city || 'Non renseigné'}</td>
                              <td>{customer.createdAt ? formatDate(customer.createdAt) : 'Non disponible'}</td>
                              <td>
                                <div className={styles.orderActions}>
                                  <button 
                                    className={styles.viewOrderButton}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setExpandedCustomer(expandedCustomer === customer._id ? null : customer._id);
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
                                      <button onClick={(e) => {
                                        e.stopPropagation();
                                        openCustomerModal(customer);
                                      }}>
                                        Modifier le client
                                      </button>
                                      <button onClick={(e) => {
                                        e.stopPropagation();
                                        window.open(`mailto:${customer.email}?subject=MonSavonVert - Votre compte client`);
                                      }}>
                                        Contacter par email
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </td>
                            </tr>
                            {expandedCustomer === customer._id && (
                              <tr className={styles.customerDetailsRow}>
                                <td colSpan="7"> {/* Modifié pour correspondre au nombre de colonnes après suppression de l'ID */}
                                  <div className={styles.customerDetails}>
                                    <div className={styles.customerDetailsSections}>
                                      <div className={styles.customerDetailsSection}>
                                        <h3>Informations client</h3>
                                        <div className={styles.detailsGrid}>
                                          <div className={styles.detailItem}>
                                            <span className={styles.detailLabel}>Prénom</span>
                                            <span className={styles.detailValue}>{customer.firstName || 'Non renseigné'}</span>
                                          </div>
                                          <div className={styles.detailItem}>
                                            <span className={styles.detailLabel}>Nom</span>
                                            <span className={styles.detailValue}>{customer.lastName || 'Non renseigné'}</span>
                                          </div>
                                          <div className={styles.detailItem}>
                                            <span className={styles.detailLabel}>Email</span>
                                            <span className={styles.detailValue}>{customer.email || 'Non renseigné'}</span>
                                          </div>
                                          <div className={styles.detailItem}>
                                            <span className={styles.detailLabel}>Téléphone</span>
                                            <span className={styles.detailValue}>{customer.phone || 'Non renseigné'}</span>
                                          </div>
                                          <div className={styles.detailItem}>
                                            <span className={styles.detailLabel}>Adresse</span>
                                            <span className={styles.detailValue}>{customer.address || 'Non renseigné'}</span>
                                          </div>
                                          <div className={styles.detailItem}>
                                            <span className={styles.detailLabel}>Code postal</span>
                                            <span className={styles.detailValue}>{customer.postalCode || 'Non renseigné'}</span>
                                          </div>
                                          <div className={styles.detailItem}>
                                            <span className={styles.detailLabel}>Ville</span>
                                            <span className={styles.detailValue}>{customer.city || 'Non renseigné'}</span>
                                          </div>
                                          <div className={styles.detailItem}>
                                            <span className={styles.detailLabel}>Pays</span>
                                            <span className={styles.detailValue}>{customer.country || 'Non renseigné'}</span>
                                          </div>
                                          <div className={styles.detailItem}>
                                            <span className={styles.detailLabel}>Date d'inscription</span>
                                            <span className={styles.detailValue}>
                                              {customer.createdAt ? formatDate(customer.createdAt) : 'Non disponible'}
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                    
                                    <div className={styles.customerDetailActions}>
                                      <button 
                                        className={styles.editCustomerButton}
                                        onClick={() => openCustomerModal(customer)}
                                      >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                        </svg>
                                        Modifier le client
                                      </button>
                                      <button 
                                        className={styles.emailCustomerButton}
                                        onClick={() => window.open(`mailto:${customer.email}?subject=MonSavonVert - Votre compte client`)}
                                      >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                                          <polyline points="22,6 12,13 2,6"></polyline>
                                        </svg>
                                        Contacter par email
                                      </button>
                                      
                                      <button 
                                        className={styles.closeDetailsButton}
                                        onClick={() => setExpandedCustomer(null)}
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
                    
                    {getFilteredCustomers().length === 0 && (
                      <div className={styles.noOrdersFound}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10"></circle>
                          <path d="M16 16s-1.5-2-4-2-4 2-4 2"></path>
                          <line x1="9" y1="9" x2="9.01" y2="9"></line>
                          <line x1="15" y1="9" x2="15.01" y2="9"></line>
                        </svg>
                        <p>Aucun client trouvé</p>
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

      {/* Modal d'édition de client */}
      {showCustomerModal && currentCustomer && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContainer}>
            <div className={styles.modalHeader}>
              <h2>Modifier le client</h2> {/* Retiré l'affichage de l'ID ici aussi */}
              <button className={styles.closeModal} onClick={() => setShowCustomerModal(false)}>×</button>
            </div>
            <div className={styles.modalBody}>
              <form onSubmit={handleEditSubmit}>
                <div className={styles.formGroup}>
                  <label htmlFor="firstName">Prénom *</label>
                  <input 
                    type="text" 
                    id="firstName" 
                    name="firstName" 
                    value={formData.firstName} 
                    onChange={handleFormChange} 
                    required 
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label htmlFor="lastName">Nom *</label>
                  <input 
                    type="text" 
                    id="lastName" 
                    name="lastName" 
                    value={formData.lastName} 
                    onChange={handleFormChange} 
                    required 
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label htmlFor="email">Email *</label>
                  <input 
                    type="email" 
                    id="email" 
                    name="email" 
                    value={formData.email} 
                    onChange={handleFormChange} 
                    required 
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label htmlFor="phone">Téléphone *</label>
                  <input 
                    type="tel" 
                    id="phone" 
                    name="phone" 
                    value={formData.phone} 
                    onChange={handleFormChange} 
                    required 
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label htmlFor="address">Adresse</label>
                  <input 
                    type="text" 
                    id="address" 
                    name="address" 
                    value={formData.address} 
                    onChange={handleFormChange} 
                  />
                </div>
                
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label htmlFor="postalCode">Code postal</label>
                    <input 
                      type="text" 
                      id="postalCode" 
                      name="postalCode" 
                      value={formData.postalCode} 
                      onChange={handleFormChange} 
                    />
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label htmlFor="city">Ville</label>
                    <input 
                      type="text" 
                      id="city" 
                      name="city" 
                      value={formData.city} 
                      onChange={handleFormChange} 
                    />
                  </div>
                </div>
                
                <div className={styles.formGroup}>
                  <label htmlFor="country">Pays</label>
                  <input 
                    type="text" 
                    id="country" 
                    name="country" 
                    value={formData.country} 
                    onChange={handleFormChange} 
                  />
                </div>
                
                <div className={styles.formActions}>
                  <button type="button" className={styles.cancelButton} onClick={() => setShowCustomerModal(false)}>
                    Annuler
                  </button>
                  <button type="submit" className={styles.submitButton}>
                    Enregistrer les modifications
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .customersSection {
          flex: 1;
          padding: var(--spacing-xl) 0;
        }
        
        .customersContainer {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 var(--spacing-xl);
        }
        
        .customerStatsCards {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
          margin-bottom: 30px;
        }
        
        .statCard {
          background-color: white;
          border-radius: 12px;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
          padding: 20px;
          display: flex;
          align-items: center;
          gap: 15px;
        }
        
        .statIcon {
          width: 50px;
          height: 50px;
          border-radius: 10px;
          background-color: rgba(76, 175, 80, 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .statContent {
          display: flex;
          flex-direction: column;
        }
        
        .statValue {
          font-size: 24px;
          font-weight: 700;
          color: var(--color-text);
          margin-bottom: 5px;
        }
        
        .statLabel {
          font-size: 14px;
          color: var(--color-text-light);
        }
        
        .customerRow {
          cursor: pointer;
        }
        
        .inactiveCustomer {
          background-color: rgba(0, 0, 0, 0.03);
          color: var(--color-text-light);
        }
        
        .customerEmail {
          color: var(--color-primary);
          text-decoration: none;
        }
        
        .customerEmail:hover {
          text-decoration: underline;
        }
        
        .customerStatus {
          display: inline-block;
          padding: 4px 8px;
          border-radius: var(--radius-full);
          font-size: 12px;
          font-weight: 600;
        }
        
        .statusActive {
          background-color: rgba(76, 175, 80, 0.1);
          color: var(--color-success);
        }
        
        .statusInactive {
          background-color: rgba(244, 67, 54, 0.1);
          color: var(--color-error);
        }
        
        .customerNotes {
          background-color: var(--color-background-light);
          border-radius: var(--radius-md);
          padding: var(--spacing-lg);
          box-shadow: var(--shadow-sm);
          margin-bottom: var(--spacing-xl);
        }
        
        .customerNotes h3 {
          font-size: 16px;
          font-weight: 600;
          margin: 0 0 var(--spacing-md);
          color: var(--color-text);
          padding-bottom: var(--spacing-sm);
          border-bottom: 1px solid var(--color-border);
        }
        
        .customerNotes p {
          font-size: 14px;
          color: var(--color-text);
          margin: 0;
          line-height: 1.5;
        }
        
        .customerOrderHistory {
          background-color: var(--color-background-light);
          border-radius: var(--radius-md);
          padding: var(--spacing-lg);
          box-shadow: var(--shadow-sm);
          margin-bottom: var(--spacing-xl);
        }
        
        .customerOrderHistory h3 {
          font-size: 16px;
          font-weight: 600;
          margin: 0 0 var(--spacing-md);
          color: var(--color-text);
          padding-bottom: var(--spacing-sm);
          border-bottom: 1px solid var(--color-border);
        }
        
        .orderHistoryTable {
          width: 100%;
          border-collapse: collapse;
        }
        
        .orderHistoryTable th {
          text-align: left;
          padding: 10px;
          font-size: 12px;
          font-weight: 600;
          color: var(--color-text-light);
          border-bottom: 1px solid var(--color-border);
        }
        
        .orderHistoryTable td {
          padding: 12px 10px;
          font-size: 14px;
          border-bottom: 1px solid var(--color-border);
        }
        
        .orderHistoryLink {
          color: var(--color-primary);
          text-decoration: none;
          font-weight: 500;
        }
        
        .orderHistoryLink:hover {
          text-decoration: underline;
        }
        
        .viewDetailButton {
          display: flex;
          align-items: center;
          gap: 5px;
          color: var(--color-primary);
          text-decoration: none;
          font-size: 13px;
        }
        
        .noOrdersMessage {
          text-align: center;
          color: var(--color-text-light);
          padding: var(--spacing-lg) 0;
        }
        
        .customerDetailActions {
          display: flex;
          flex-wrap: wrap;
          gap: var(--spacing-md);
          margin-bottom: var(--spacing-xl);
        }
        
        .editCustomerButton,
        .emailCustomerButton,
        .statusToggleButton {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          padding: var(--spacing-md) var(--spacing-lg);
          border-radius: var(--radius-md);
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all var(--transition-fast);
          border: none;
        }
        
        .editCustomerButton {
          background-color: var(--color-primary);
          color: white;
        }
        
        .emailCustomerButton {
          background-color: var(--color-info);
          color: white;
        }
        
        .deactivateButton {
          background-color: var(--color-error);
          color: white;
        }
        
        .activateButton {
          background-color: var(--color-success);
          color: white;
        }
        
        .closeDetailsButton {
          background-color: #f0f0f0;
          color: #333;
          border: none;
          border-radius: var(--radius-md);
          padding: var(--spacing-md) var(--spacing-lg);
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
        }
        
        @media (max-width: 1024px) {
          .customerStatsCards {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        
        @media (max-width: 768px) {
          .customerStatsCards {
            grid-template-columns: 1fr;
          }
          
          .customerDetailActions {
            flex-direction: column;
          }
          
          .editCustomerButton,
          .emailCustomerButton,
          .statusToggleButton {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </>
  );
}