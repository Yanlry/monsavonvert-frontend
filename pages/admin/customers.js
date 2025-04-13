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
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });
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
    name: '',
    email: '',
    phone: '',
    address: '',
    postalCode: '',
    city: '',
    country: 'France',
    notes: '',
    isActive: true
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
    
    // Charger les clients (simulés ici)
    const mockCustomers = [
      {
        id: 1,
        name: 'Marie Lemaire',
        email: 'marie.l@example.com',
        phone: '06 12 34 56 78',
        address: '15 rue des Lilas',
        postalCode: '75020',
        city: 'Paris',
        country: 'France',
        orderCount: 3,
        totalSpent: 132.90,
        lastOrderDate: '2025-04-10T14:30:00',
        registrationDate: '2024-12-05T10:15:00',
        isActive: true,
        notes: 'Cliente fidèle, préfère les savons pour peaux sensibles.',
        orderHistory: [
          { id: 'CMD-001', date: '2025-04-10T14:30:00', total: 44.30, status: 'pending' },
          { id: 'CMD-008', date: '2025-03-15T11:20:00', total: 38.60, status: 'delivered' },
          { id: 'CMD-015', date: '2025-02-22T09:45:00', total: 50.00, status: 'delivered' },
        ]
      },
      {
        id: 2,
        name: 'Thomas Dubois',
        email: 'thomas.d@example.com',
        phone: '07 98 76 54 32',
        address: '8 avenue Victor Hugo',
        postalCode: '69003',
        city: 'Lyon',
        country: 'France',
        orderCount: 2,
        totalSpent: 91.60,
        lastOrderDate: '2025-04-09T10:15:00',
        registrationDate: '2025-01-12T16:30:00',
        isActive: true,
        notes: 'Intéressé par les shampoings solides.',
        orderHistory: [
          { id: 'CMD-002', date: '2025-04-09T10:15:00', total: 45.80, status: 'processing' },
          { id: 'CMD-014', date: '2025-03-02T14:50:00', total: 45.80, status: 'delivered' },
        ]
      },
      {
        id: 3,
        name: 'Sophie Martin',
        email: 'sophie.m@example.com',
        phone: '06 54 32 10 98',
        address: '23 rue de la Paix',
        postalCode: '33000',
        city: 'Bordeaux',
        country: 'France',
        orderCount: 5,
        totalSpent: 199.50,
        lastOrderDate: '2025-04-08T16:45:00',
        registrationDate: '2024-11-20T09:10:00',
        isActive: true,
        notes: 'Membre du programme de fidélité, préfère les produits bio.',
        orderHistory: [
          { id: 'CMD-003', date: '2025-04-08T16:45:00', total: 39.90, status: 'shipped' },
          { id: 'CMD-009', date: '2025-03-20T13:15:00', total: 42.85, status: 'delivered' },
          { id: 'CMD-016', date: '2025-02-12T11:30:00', total: 38.90, status: 'delivered' },
          { id: 'CMD-021', date: '2025-01-05T16:20:00', total: 45.95, status: 'delivered' },
          { id: 'CMD-025', date: '2024-12-18T10:10:00', total: 31.90, status: 'delivered' },
        ]
      },
      {
        id: 4,
        name: 'Pierre Durant',
        email: 'pierre.d@example.com',
        phone: '07 65 43 21 09',
        address: '42 boulevard Haussmann',
        postalCode: '75009',
        city: 'Paris',
        country: 'France',
        orderCount: 1,
        totalSpent: 35.75,
        lastOrderDate: '2025-04-05T11:20:00',
        registrationDate: '2025-03-28T14:25:00',
        isActive: true,
        notes: 'Nouveau client, a découvert la boutique via Instagram.',
        orderHistory: [
          { id: 'CMD-004', date: '2025-04-05T11:20:00', total: 35.75, status: 'delivered' },
        ]
      },
      {
        id: 5,
        name: 'Lucie Moreau',
        email: 'lucie.m@example.com',
        phone: '06 87 65 43 21',
        address: '7 rue Saint-Antoine',
        postalCode: '59000',
        city: 'Lille',
        country: 'France',
        orderCount: 2,
        totalSpent: 52.70,
        lastOrderDate: '2025-04-03T09:10:00',
        registrationDate: '2025-01-30T11:40:00',
        isActive: false,
        notes: 'A annulé sa dernière commande suite à un problème de paiement.',
        orderHistory: [
          { id: 'CMD-005', date: '2025-04-03T09:10:00', total: 20.85, status: 'cancelled' },
          { id: 'CMD-018', date: '2025-02-08T15:35:00', total: 31.85, status: 'delivered' },
        ]
      },
      {
        id: 6,
        name: 'Jean Dupont',
        email: 'jean.d@example.com',
        phone: '07 12 34 56 78',
        address: '13 rue de la République',
        postalCode: '13001',
        city: 'Marseille',
        country: 'France',
        orderCount: 3,
        totalSpent: 129.35,
        lastOrderDate: '2025-04-01T14:05:00',
        registrationDate: '2024-10-15T08:50:00',
        isActive: true,
        notes: 'Client régulier, achète souvent des coffrets cadeaux.',
        orderHistory: [
          { id: 'CMD-006', date: '2025-04-01T14:05:00', total: 46.75, status: 'delivered' },
          { id: 'CMD-011', date: '2025-03-10T12:40:00', total: 38.60, status: 'delivered' },
          { id: 'CMD-020', date: '2025-01-22T16:15:00', total: 44.00, status: 'delivered' },
        ]
      },
      {
        id: 7,
        name: 'Élodie Lambert',
        email: 'elodie.l@example.com',
        phone: '06 23 45 67 89',
        address: '5 place Bellecour',
        postalCode: '69002',
        city: 'Lyon',
        country: 'France',
        orderCount: 4,
        totalSpent: 165.20,
        lastOrderDate: '2025-03-28T09:30:00',
        registrationDate: '2024-11-05T15:20:00',
        isActive: true,
        notes: 'Sensible aux produits naturels, a une peau réactive.',
        orderHistory: [
          { id: 'CMD-007', date: '2025-03-28T09:30:00', total: 42.85, status: 'delivered' },
          { id: 'CMD-013', date: '2025-03-05T10:25:00', total: 36.40, status: 'delivered' },
          { id: 'CMD-017', date: '2025-02-10T17:30:00', total: 45.00, status: 'delivered' },
          { id: 'CMD-022', date: '2025-01-03T11:15:00', total: 40.95, status: 'delivered' },
        ]
      },
      {
        id: 8,
        name: 'Antoine Bernard',
        email: 'antoine.b@example.com',
        phone: '07 34 56 78 90',
        address: '18 rue des Carmes',
        postalCode: '45000',
        city: 'Orléans',
        country: 'France',
        orderCount: 1,
        totalSpent: 38.60,
        lastOrderDate: '2025-03-25T14:15:00',
        registrationDate: '2025-03-15T13:10:00',
        isActive: true,
        notes: 'A acheté un coffret cadeau pour sa femme.',
        orderHistory: [
          { id: 'CMD-010', date: '2025-03-25T14:15:00', total: 38.60, status: 'delivered' },
        ]
      },
      {
        id: 9,
        name: 'Camille Richard',
        email: 'camille.r@example.com',
        phone: '06 45 67 89 01',
        address: '27 avenue Foch',
        postalCode: '67000',
        city: 'Strasbourg',
        country: 'France',
        orderCount: 2,
        totalSpent: 74.85,
        lastOrderDate: '2025-03-18T11:05:00',
        registrationDate: '2025-01-25T09:45:00',
        isActive: true,
        notes: 'S\'intéresse aux produits zéro déchet.',
        orderHistory: [
          { id: 'CMD-012', date: '2025-03-18T11:05:00', total: 36.95, status: 'delivered' },
          { id: 'CMD-019', date: '2025-02-01T16:40:00', total: 37.90, status: 'delivered' },
        ]
      },
      {
        id: 10,
        name: 'Julien Petit',
        email: 'julien.p@example.com',
        phone: '07 56 78 90 12',
        address: '3 cours Gambetta',
        postalCode: '34000',
        city: 'Montpellier',
        country: 'France',
        orderCount: 2,
        totalSpent: 79.85,
        lastOrderDate: '2025-03-01T15:50:00',
        registrationDate: '2024-12-20T14:15:00',
        isActive: false,
        notes: 'N\'a pas répondu aux derniers emails promotionnels.',
        orderHistory: [
          { id: 'CMD-023', date: '2025-03-01T15:50:00', total: 42.90, status: 'delivered' },
          { id: 'CMD-024', date: '2025-01-05T10:30:00', total: 36.95, status: 'delivered' },
        ]
      }
    ];
    
    console.log('Chargement des clients:', mockCustomers.length, 'clients trouvés');
    setCustomers(mockCustomers);
    
    // Calculer les statistiques
    const activeCustomers = mockCustomers.filter(customer => customer.isActive).length;
    const inactiveCustomers = mockCustomers.length - activeCustomers;
    
    // Date actuelle
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    // Clients inscrits ce mois-ci
    const newThisMonth = mockCustomers.filter(
      customer => new Date(customer.registrationDate) >= firstDayOfMonth
    ).length;
    
    // Valeur moyenne des commandes
    const totalOrders = mockCustomers.reduce((acc, customer) => acc + customer.orderCount, 0);
    const totalSpent = mockCustomers.reduce((acc, customer) => acc + customer.totalSpent, 0);
    const avgOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;
    
    setCustomerStats({
      totalCustomers: mockCustomers.length,
      activeCustomers,
      inactiveCustomers,
      newCustomersThisMonth: newThisMonth,
      averageOrderValue: avgOrderValue
    });
    
    setIsLoading(false);
  } catch (error) {
    console.error('Erreur lors de la vérification des autorisations:', error);
    router.push('/login');
  }
}, [isClient, router]);

  // Fonction pour trier les clients
  const sortCustomers = (customersToSort) => {
    const sortableCustomers = [...customersToSort];
    
    sortableCustomers.sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];
      
      // Gestion des cas particuliers
      if (sortConfig.key === 'name' || sortConfig.key === 'email') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      } else if (sortConfig.key === 'lastOrderDate' || sortConfig.key === 'registrationDate') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
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
    // Filtrer par onglet
    let filtered = customers;
    if (activeTab === 'active') {
      filtered = filtered.filter(customer => customer.isActive);
    } else if (activeTab === 'inactive') {
      filtered = filtered.filter(customer => !customer.isActive);
    } else if (activeTab === 'recent') {
      // Clients inscrits dans les 30 derniers jours
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      filtered = filtered.filter(customer => new Date(customer.registrationDate) >= thirtyDaysAgo);
    }
    
    // Filtrer par recherche
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(customer => 
        customer.name.toLowerCase().includes(term) ||
        customer.email.toLowerCase().includes(term) ||
        customer.phone.includes(term) ||
        customer.city.toLowerCase().includes(term)
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
    const options = { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };

  // Fonction pour changer le statut d'un client (actif/inactif)
  const toggleCustomerStatus = (customerId) => {
    setCustomers(customers.map(customer => {
      if (customer.id === customerId) {
        const newStatus = !customer.isActive;
        
        // Mettre à jour les statistiques
        if (newStatus) {
          setCustomerStats({
            ...customerStats,
            activeCustomers: customerStats.activeCustomers + 1,
            inactiveCustomers: customerStats.inactiveCustomers - 1
          });
        } else {
          setCustomerStats({
            ...customerStats,
            activeCustomers: customerStats.activeCustomers - 1,
            inactiveCustomers: customerStats.inactiveCustomers + 1
          });
        }
        
        return { ...customer, isActive: newStatus };
      }
      return customer;
    }));
    
    console.log(`Statut du client ${customerId} mis à jour`);
  };

  // Fonction pour ouvrir le modal de détails/édition du client
  const openCustomerModal = (customer) => {
    setCurrentCustomer(customer);
    setFormData({
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
      postalCode: customer.postalCode,
      city: customer.city,
      country: customer.country,
      notes: customer.notes || '',
      isActive: customer.isActive
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
  const handleEditSubmit = (e) => {
    e.preventDefault();
    
    try {
      // Validation des données
      if (!formData.name || !formData.email || !formData.phone) {
        alert('Veuillez remplir tous les champs obligatoires');
        return;
      }
      
      // Mise à jour du client
      const updatedCustomers = customers.map(customer => {
        if (customer.id === currentCustomer.id) {
          const wasActive = customer.isActive;
          
          // Si le statut a changé, mettre à jour les statistiques
          if (wasActive !== formData.isActive) {
            if (formData.isActive) {
              setCustomerStats({
                ...customerStats,
                activeCustomers: customerStats.activeCustomers + 1,
                inactiveCustomers: customerStats.inactiveCustomers - 1
              });
            } else {
              setCustomerStats({
                ...customerStats,
                activeCustomers: customerStats.activeCustomers - 1,
                inactiveCustomers: customerStats.inactiveCustomers + 1
              });
            }
          }
          
          return {
            ...customer,
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            address: formData.address,
            postalCode: formData.postalCode,
            city: formData.city,
            country: formData.country,
            notes: formData.notes,
            isActive: formData.isActive
          };
        }
        return customer;
      });
      
      setCustomers(updatedCustomers);
      
      // Fermeture du modal
      setShowCustomerModal(false);
      
      console.log('Client mis à jour:', currentCustomer.id);
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
                  Consultez et gérez les informations de vos clients et leur historique de commandes
                </p>
              </div>
              <div className={styles.pageActions}>
                <button className={styles.exportButton}>
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
                        <span className={styles.statValue}>{customerStats.activeCustomers}</span>
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
                        <span className={styles.statValue}>{customerStats.averageOrderValue.toFixed(2)} €</span>
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
                        className={`${styles.orderTab} ${activeTab === 'active' ? styles.activeTab : ''}`}
                        onClick={() => setActiveTab('active')}
                      >
                        Clients actifs
                        <span className={styles.tabCount}>{customerStats.activeCustomers}</span>
                      </button>
                      <button 
                        className={`${styles.orderTab} ${activeTab === 'inactive' ? styles.activeTab : ''}`}
                        onClick={() => setActiveTab('inactive')}
                      >
                        Clients inactifs
                        <span className={styles.tabCount}>{customerStats.inactiveCustomers}</span>
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
                          <th className={`${styles.sortableColumn} ${getSortClass('id')}`} onClick={() => requestSort('id')}>
                            ID
                          </th>
                          <th className={`${styles.sortableColumn} ${getSortClass('name')}`} onClick={() => requestSort('name')}>
                            Nom
                          </th>
                          <th className={`${styles.sortableColumn} ${getSortClass('email')}`} onClick={() => requestSort('email')}>
                            Email
                          </th>
                          <th>Téléphone</th>
                          <th className={`${styles.sortableColumn} ${getSortClass('city')}`} onClick={() => requestSort('city')}>
                            Ville
                          </th>
                          <th className={`${styles.sortableColumn} ${getSortClass('orderCount')}`} onClick={() => requestSort('orderCount')}>
                            Commandes
                          </th>
                          <th className={`${styles.sortableColumn} ${getSortClass('totalSpent')}`} onClick={() => requestSort('totalSpent')}>
                            Total dépensé
                          </th>
                          <th className={`${styles.sortableColumn} ${getSortClass('lastOrderDate')}`} onClick={() => requestSort('lastOrderDate')}>
                            Dernière commande
                          </th>
                          <th>Statut</th>
                          <th className={styles.actionsColumn}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {getFilteredCustomers().map(customer => (
                          <>
                            <tr 
                              key={customer.id} 
                              className={`${styles.customerRow} ${!customer.isActive ? styles.inactiveCustomer : ''}`}
                              onClick={() => setExpandedCustomer(expandedCustomer === customer.id ? null : customer.id)}
                            >
                              <td>{customer.id}</td>
                              <td>{customer.name}</td>
                              <td>
                                <a href={`mailto:${customer.email}`} onClick={(e) => e.stopPropagation()} className={styles.customerEmail}>
                                  {customer.email}
                                </a>
                              </td>
                              <td>{customer.phone}</td>
                              <td>{customer.city}</td>
                              <td>{customer.orderCount}</td>
                              <td>{customer.totalSpent.toFixed(2)} €</td>
                              <td>{formatDate(customer.lastOrderDate)}</td>
                              <td>
                                <span className={`${styles.customerStatus} ${customer.isActive ? styles.statusActive : styles.statusInactive}`}>
                                  {customer.isActive ? 'Actif' : 'Inactif'}
                                </span>
                              </td>
                              <td>
                                <div className={styles.orderActions}>
                                  <button 
                                    className={styles.viewOrderButton}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setExpandedCustomer(expandedCustomer === customer.id ? null : customer.id);
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
                                        toggleCustomerStatus(customer.id);
                                      }}>
                                        {customer.isActive ? 'Désactiver' : 'Activer'} le client
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
                            {expandedCustomer === customer.id && (
                              <tr className={styles.customerDetailsRow}>
                                <td colSpan="10">
                                  <div className={styles.customerDetails}>
                                    <div className={styles.customerDetailsSections}>
                                      <div className={styles.customerDetailsSection}>
                                        <h3>Informations client</h3>
                                        <div className={styles.detailsGrid}>
                                          <div className={styles.detailItem}>
                                            <span className={styles.detailLabel}>Nom complet</span>
                                            <span className={styles.detailValue}>{customer.name}</span>
                                          </div>
                                          <div className={styles.detailItem}>
                                            <span className={styles.detailLabel}>Email</span>
                                            <span className={styles.detailValue}>{customer.email}</span>
                                          </div>
                                          <div className={styles.detailItem}>
                                            <span className={styles.detailLabel}>Téléphone</span>
                                            <span className={styles.detailValue}>{customer.phone}</span>
                                          </div>
                                          <div className={styles.detailItem}>
                                            <span className={styles.detailLabel}>Adresse</span>
                                            <span className={styles.detailValue}>{customer.address}</span>
                                          </div>
                                          <div className={styles.detailItem}>
                                            <span className={styles.detailLabel}>Code postal</span>
                                            <span className={styles.detailValue}>{customer.postalCode}</span>
                                          </div>
                                          <div className={styles.detailItem}>
                                            <span className={styles.detailLabel}>Ville</span>
                                            <span className={styles.detailValue}>{customer.city}</span>
                                          </div>
                                          <div className={styles.detailItem}>
                                            <span className={styles.detailLabel}>Pays</span>
                                            <span className={styles.detailValue}>{customer.country}</span>
                                          </div>
                                          <div className={styles.detailItem}>
                                            <span className={styles.detailLabel}>Date d'inscription</span>
                                            <span className={styles.detailValue}>{formatDate(customer.registrationDate)}</span>
                                          </div>
                                        </div>
                                      </div>
                                      
                                      <div className={styles.customerDetailsSection}>
                                        <h3>Statistiques d'achat</h3>
                                        <div className={styles.detailsGrid}>
                                          <div className={styles.detailItem}>
                                            <span className={styles.detailLabel}>Nombre de commandes</span>
                                            <span className={styles.detailValue}>{customer.orderCount}</span>
                                          </div>
                                          <div className={styles.detailItem}>
                                            <span className={styles.detailLabel}>Total dépensé</span>
                                            <span className={styles.detailValue}>{customer.totalSpent.toFixed(2)} €</span>
                                          </div>
                                          <div className={styles.detailItem}>
                                            <span className={styles.detailLabel}>Panier moyen</span>
                                            <span className={styles.detailValue}>
                                              {customer.orderCount > 0 ? (customer.totalSpent / customer.orderCount).toFixed(2) : 0} €
                                            </span>
                                          </div>
                                          <div className={styles.detailItem}>
                                            <span className={styles.detailLabel}>Dernière commande</span>
                                            <span className={styles.detailValue}>{formatDate(customer.lastOrderDate)}</span>
                                          </div>
                                          <div className={styles.detailItem}>
                                            <span className={styles.detailLabel}>Statut</span>
                                            <span className={`${styles.detailValue} ${styles.statusBadge} ${customer.isActive ? styles.statusActive : styles.statusInactive}`}>
                                              {customer.isActive ? 'Actif' : 'Inactif'}
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                    
                                    {customer.notes && (
                                      <div className={styles.customerNotes}>
                                        <h3>Notes</h3>
                                        <p>{customer.notes}</p>
                                      </div>
                                    )}
                                    
                                    <div className={styles.customerOrderHistory}>
                                      <h3>Historique des commandes</h3>
                                      {customer.orderHistory && customer.orderHistory.length > 0 ? (
                                        <table className={styles.orderHistoryTable}>
                                          <thead>
                                            <tr>
                                              <th>Numéro</th>
                                              <th>Date</th>
                                              <th>Montant</th>
                                              <th>Statut</th>
                                              <th>Actions</th>
                                            </tr>
                                          </thead>
                                          <tbody>
                                            {customer.orderHistory.map(order => (
                                              <tr key={order.id}>
                                                <td>
                                                  <Link href={`/admin/orders?id=${order.id}`} legacyBehavior>
                                                    <a className={styles.orderHistoryLink}>{order.id}</a>
                                                  </Link>
                                                </td>
                                                <td>{formatDate(order.date)}</td>
                                                <td>{order.total.toFixed(2)} €</td>
                                                <td>
                                                  <span className={`${styles.orderStatus} ${styles[order.status]}`}>
                                                    {order.status === 'pending' ? 'En attente' :
                                                     order.status === 'processing' ? 'En préparation' :
                                                     order.status === 'shipped' ? 'Expédiée' :
                                                     order.status === 'delivered' ? 'Livrée' :
                                                     order.status === 'cancelled' ? 'Annulée' : order.status}
                                                  </span>
                                                </td>
                                                <td>
                                                  <Link href={`/admin/orders?id=${order.id}`} legacyBehavior>
                                                    <a className={styles.viewDetailButton}>
                                                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                                        <circle cx="12" cy="12" r="3"></circle>
                                                      </svg>
                                                      Voir
                                                    </a>
                                                  </Link>
                                                </td>
                                              </tr>
                                            ))}
                                          </tbody>
                                        </table>
                                      ) : (
                                        <p className={styles.noOrdersMessage}>Aucune commande trouvée pour ce client.</p>
                                      )}
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
                                        className={`${styles.statusToggleButton} ${!customer.isActive ? styles.activateButton : styles.deactivateButton}`}
                                        onClick={() => toggleCustomerStatus(customer.id)}
                                      >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                          <path d="M18.36 6.64a9 9 0 1 1-12.73 0"></path>
                                          <line x1="12" y1="2" x2="12" y2="12"></line>
                                        </svg>
                                        {customer.isActive ? 'Désactiver le client' : 'Activer le client'}
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
              <h2>Modifier le client #{currentCustomer.id}</h2>
              <button className={styles.closeModal} onClick={() => setShowCustomerModal(false)}>×</button>
            </div>
            <div className={styles.modalBody}>
              <form onSubmit={handleEditSubmit}>
                <div className={styles.formGroup}>
                  <label htmlFor="name">Nom complet *</label>
                  <input 
                    type="text" 
                    id="name" 
                    name="name" 
                    value={formData.name} 
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
                
                <div className={styles.formGroup}>
                  <label htmlFor="notes">Notes</label>
                  <textarea 
                    id="notes" 
                    name="notes" 
                    value={formData.notes} 
                    onChange={handleFormChange} 
                    rows="3"
                  ></textarea>
                </div>
                
                <div className={styles.formGroup}>
                  <div className={styles.checkboxRow}>
                    <input 
                      type="checkbox" 
                      id="isActive" 
                      name="isActive" 
                      checked={formData.isActive} 
                      onChange={handleFormChange} 
                    />
                    <label htmlFor="isActive">Client actif</label>
                  </div>
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