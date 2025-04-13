'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import styles from '../../styles/admin-products.module.css';
// On supprime l'import direct de Contentful
// import { getAllProducts } from '../../lib/contentful';

export default function AdminProducts() {
  // États
  const [isClient, setIsClient] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [products, setProducts] = useState([]);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedProduct, setExpandedProduct] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'asc' });
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const router = useRouter();
  
  // Formulaire d'ajout ou d'édition de produit
  const [formData, setFormData] = useState({
    productName: '',
    shortDescription: '',
    longDescription: '',
    price: '',
    categories: [],
    stock: '',
    isActive: true,
    mainImage: { fields: { file: { url: '' } } },
  });

  // Liste des catégories disponibles
  const availableCategories = [
    { id: 'exfoliating', name: 'Exfoliants' },
    { id: 'sensitive-skin', name: 'Peaux sensibles' },
    { id: 'moisturizing', name: 'Hydratants' },
    { id: 'soap', name: 'Savons' },
    { id: 'shampoo', name: 'Shampoings' },
    { id: 'accessory', name: 'Accessoires' },
  ];

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

// Vérification de l'authentification et chargement des produits via l'API route
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
    
    // Charger les produits depuis notre API route
    const loadProducts = async () => {
      try {
        console.log('Chargement des produits via l\'API route...');
        const response = await fetch('/api/products');
        
        if (!response.ok) {
          throw new Error('Erreur lors de la récupération des produits');
        }
        
        const contentfulProducts = await response.json();
        
        // Transformation des produits pour correspondre à la structure attendue par l'interface
        const formattedProducts = contentfulProducts.map(product => ({
          id: product.id, // Utilisation de l'ID Contentful
          productName: product.productName || '',
          price: product.price || 0,
          stock: product.stock || 0,
          mainImage: product.mainImage || { fields: { file: { url: '/images/default.JPEG' } } },
          shortDescription: product.shortDescription || '',
          longDescription: product.longDescription || '',
          categories: product.categories || [],
          popularity: product.popularity || 0,
          isActive: product.isActive !== undefined ? product.isActive : true,
          createdAt: product.sys?.createdAt || new Date().toISOString(),
          rating: product.rating || 0,
          reviewCount: product.reviewCount || 0,
          isNew: product.isNew || false,
          isBestSeller: product.isBestSeller || false
        }));
        
        console.log(`${formattedProducts.length} produits récupérés via l'API`);
        setProducts(formattedProducts);
        setIsLoading(false);
      } catch (error) {
        console.error('Erreur lors du chargement des produits:', error);
        // En cas d'erreur, on affiche des produits de démonstration pour éviter que l'app ne plante
        const demoProducts = [
          {
            id: 1,
            productName: "Savon Exfoliant à l'Avoine",
            price: 8.90,
            stock: 35,
            mainImage: { fields: { file: { url: '/images/1.JPEG' } } },
            shortDescription: "Exfoliation douce pour peaux sensibles.",
            longDescription: "Ce savon exfoliant à l'avoine est spécialement conçu pour les peaux sensibles.",
            categories: ['exfoliating', 'sensitive-skin'],
            popularity: 10,
            isActive: true,
            createdAt: '2025-01-15T09:30:00',
            rating: 4.5,
            reviewCount: 42,
            isNew: true
          },
          {
            id: 2,
            productName: "Shampooing Solide Nourrissant",
            price: 11.50,
            stock: 28,
            mainImage: { fields: { file: { url: '/images/2.JPEG' } } },
            shortDescription: "Nourrit en profondeur tous types de cheveux.",
            categories: ['moisturizing', 'shampoo'],
            isActive: true
          },
          {
            id: 3,
            productName: "Savon Surgras à l'Huile d'Olive",
            price: 7.90,
            stock: 42,
            mainImage: { fields: { file: { url: '/images/3.JPEG' } } },
            shortDescription: "Hydratation intense pour peaux sèches.",
            categories: ['moisturizing', 'sensitive-skin', 'soap'],
            isActive: true
          }
        ];
        
        console.log('Utilisation des produits de démonstration');
        setProducts(demoProducts);
        setIsLoading(false);
      }
    };
    
    loadProducts();
    
  } catch (error) {
    console.error('Erreur lors de la vérification des autorisations:', error);
    router.push('/login');
  }
}, [isClient, router]);

  // Fonction pour trier les produits
  const sortProducts = (productsToSort) => {
    const sortableProducts = [...productsToSort];
    
    sortableProducts.sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];
      
      // Gestion des cas particuliers
      if (sortConfig.key === 'productName') {
        aValue = aValue?.toLowerCase() || '';
        bValue = bValue?.toLowerCase() || '';
      } else if (sortConfig.key === 'createdAt') {
        aValue = new Date(aValue || 0);
        bValue = new Date(bValue || 0);
      }
      
      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
    
    return sortableProducts;
  };

  // Fonction pour filtrer les produits
  const getFilteredProducts = () => {
    // Filtrer par catégorie
    let filtered = products;
    if (activeCategory !== 'all') {
      filtered = filtered.filter(product => 
        product.categories && product.categories.includes(activeCategory)
      );
    }
    
    // Filtrer par recherche
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(product => 
        (product.productName || '').toLowerCase().includes(term) ||
        (product.shortDescription || '').toLowerCase().includes(term)
      );
    }
    
    // Trier les produits
    return sortProducts(filtered);
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

  // Fonction pour changer le statut d'un produit (actif/inactif)
  const toggleProductStatus = (productId) => {
    setProducts(products.map(product => {
      if (product.id === productId) {
        // Ici, dans une application réelle, vous feriez une requête à Contentful pour mettre à jour le produit
        return { ...product, isActive: !product.isActive };
      }
      return product;
    }));
    
    console.log(`Statut du produit ${productId} mis à jour`);
    // Note: Dans une implémentation complète, vous utiliseriez l'API Contentful pour mettre à jour le statut
  };

  // Fonction pour supprimer un produit
  const deleteProduct = (productId) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce produit ? Cette action est irréversible.')) {
      setProducts(products.filter(product => product.id !== productId));
      console.log(`Produit ${productId} supprimé`);
      // Note: Dans une implémentation complète, vous utiliseriez l'API Contentful pour supprimer le produit
    }
  };

  // Fonction pour ouvrir le modal d'ajout
  const openAddModal = () => {
    setFormData({
      productName: '',
      shortDescription: '',
      longDescription: '',
      price: '',
      categories: [],
      stock: '',
      isActive: true,
      mainImage: { fields: { file: { url: '' } } },
    });
    setShowAddModal(true);
  };

  // Fonction pour ouvrir le modal d'édition
  const openEditModal = (product) => {
    setCurrentProduct(product);
    setFormData({
      productName: product.productName || '',
      shortDescription: product.shortDescription || '',
      longDescription: product.longDescription || '',
      price: (product.price || 0).toString(),
      categories: product.categories || [],
      stock: (product.stock || 0).toString(),
      isActive: product.isActive !== undefined ? product.isActive : true,
      mainImage: product.mainImage || { fields: { file: { url: '' } } },
    });
    setShowEditModal(true);
  };

  // Fonction pour gérer les changements dans le formulaire
  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      if (name === 'isActive') {
        setFormData({ ...formData, [name]: checked });
      } else {
        // Gestion des catégories multiples
        const categoryId = value;
        const updatedCategories = [...formData.categories];
        
        if (checked) {
          if (!updatedCategories.includes(categoryId)) {
            updatedCategories.push(categoryId);
          }
        } else {
          const index = updatedCategories.indexOf(categoryId);
          if (index > -1) {
            updatedCategories.splice(index, 1);
          }
        }
        
        setFormData({ ...formData, categories: updatedCategories });
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // Fonction pour soumettre le formulaire d'ajout
  const handleAddSubmit = (e) => {
    e.preventDefault();
    
    try {
      // Validation des données
      if (!formData.productName || !formData.price || !formData.stock) {
        alert('Veuillez remplir tous les champs obligatoires');
        return;
      }
      
      // Dans une implémentation réelle, vous appelleriez l'API Contentful pour créer le produit
      // et obtenir un ID réel. Pour l'instant, on génère un ID temporaire
      const newId = `temp-${Date.now()}`;
      
      // Création du nouveau produit
      const newProduct = {
        id: newId,
        productName: formData.productName,
        shortDescription: formData.shortDescription,
        longDescription: formData.longDescription,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        categories: formData.categories,
        isActive: formData.isActive,
        mainImage: { fields: { file: { url: '/images/default.JPEG' } } }, // Image par défaut
        createdAt: new Date().toISOString(),
        popularity: 0,
        rating: 0,
        reviewCount: 0,
        isNew: true,
      };
      
      // Ajout du produit à la liste (temporaire, en attendant l'intégration complète avec Contentful)
      setProducts([...products, newProduct]);
      
      // Fermeture du modal
      setShowAddModal(false);
      
      console.log('Nouveau produit ajouté (local):', newProduct);
      alert('Produit ajouté localement. Dans une version complète, ce produit serait enregistré sur Contentful.');
    } catch (error) {
      console.error('Erreur lors de l\'ajout du produit:', error);
      alert('Une erreur est survenue lors de l\'ajout du produit');
    }
  };

  // Fonction pour soumettre le formulaire d'édition
  const handleEditSubmit = (e) => {
    e.preventDefault();
    
    try {
      // Validation des données
      if (!formData.productName || !formData.price || !formData.stock) {
        alert('Veuillez remplir tous les champs obligatoires');
        return;
      }
      
      // Mise à jour du produit (local seulement pour l'instant)
      setProducts(products.map(product => {
        if (product.id === currentProduct.id) {
          return {
            ...product,
            productName: formData.productName,
            shortDescription: formData.shortDescription,
            longDescription: formData.longDescription,
            price: parseFloat(formData.price),
            stock: parseInt(formData.stock),
            categories: formData.categories,
            isActive: formData.isActive,
          };
        }
        return product;
      }));
      
      // Fermeture du modal
      setShowEditModal(false);
      
      console.log('Produit mis à jour (local):', currentProduct.id);
      alert('Produit mis à jour localement. Dans une version complète, ces modifications seraient enregistrées sur Contentful.');
    } catch (error) {
      console.error('Erreur lors de la mise à jour du produit:', error);
      alert('Une erreur est survenue lors de la mise à jour du produit');
    }
  };

  // Comptage des produits par catégorie
  const getCategoryCount = (categoryId) => {
    if (categoryId === 'all') {
      return products.length;
    }
    return products.filter(product => 
      product.categories && product.categories.includes(categoryId)
    ).length;
  };

  // Fonction pour obtenir le nom d'une catégorie à partir de son ID
  const getCategoryName = (categoryId) => {
    const category = availableCategories.find(cat => cat.id === categoryId);
    return category ? category.name : categoryId;
  };

  // Fonction pour vérifier si un produit est en rupture de stock
  const isOutOfStock = (product) => {
    return (product.stock || 0) <= 0;
  };

  // Fonction pour vérifier si un produit est en stock faible
  const isLowStock = (product) => {
    return (product.stock || 0) > 0 && (product.stock || 0) <= 5;
  };

  // Rendu de base sans contenu dynamique (pour éviter les erreurs d'hydratation)
  if (!isClient) {
    return (
      <>
        <Head>
          <title>Gestion des Produits | MonSavonVert</title>
          <meta name="description" content="Panneau d'administration des produits - MonSavonVert" />
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
        <meta name="description" content="Panneau d'administration des produits - MonSavonVert" />
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
                    <a className={`${styles.navLink} ${styles.active}`}>Produits</a>
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
                  Gérez votre catalogue de produits, modifiez les informations et suivez les stocks
                </p>
              </div>
              <div className={styles.pageActions}>
                <button className={styles.addProductButton} onClick={openAddModal}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
              {isLoading ? (
                <div className={styles.loadingOrders}>
                  <div className={styles.spinner}></div>
                  <p>Chargement des produits depuis Contentful...</p>
                </div>
              ) : (
                <>
                  {/* Filtres et recherche */}
                  <div className={styles.productsControls}>
                    <div className={styles.productsTabs}>
                      <button 
                        className={`${styles.orderTab} ${activeCategory === 'all' ? styles.activeTab : ''}`}
                        onClick={() => setActiveCategory('all')}
                      >
                        Tous les produits
                        <span className={styles.tabCount}>{getCategoryCount('all')}</span>
                      </button>
                      
                      {availableCategories.map(category => (
                        <button 
                          key={category.id}
                          className={`${styles.orderTab} ${activeCategory === category.id ? styles.activeTab : ''}`}
                          onClick={() => setActiveCategory(category.id)}
                        >
                          {category.name}
                          <span className={styles.tabCount}>{getCategoryCount(category.id)}</span>
                        </button>
                      ))}
                    </div>
                    <div className={styles.ordersSearch}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                      </svg>
                      <input 
                        type="text" 
                        placeholder="Rechercher un produit..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  {/* Tableau des produits */}
                  <div className={styles.ordersTableWrapper}>
                    <table className={styles.ordersTable}>
                      <thead>
                        <tr>
                          <th className={`${styles.sortableColumn} ${getSortClass('id')}`} onClick={() => requestSort('id')}>
                            ID
                          </th>
                          <th className={styles.productImageCol}>Image</th>
                          <th className={`${styles.sortableColumn} ${getSortClass('productName')}`} onClick={() => requestSort('productName')}>
                            Nom du produit
                          </th>
                          <th className={`${styles.sortableColumn} ${getSortClass('price')}`} onClick={() => requestSort('price')}>
                            Prix
                          </th>
                          <th className={`${styles.sortableColumn} ${getSortClass('stock')}`} onClick={() => requestSort('stock')}>
                            Stock
                          </th>
                          <th>Catégories</th>
                          <th>Statut</th>
                          <th className={styles.actionsColumn}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {getFilteredProducts().map(product => (
                          <>
                            <tr 
                              key={product.id} 
                              className={`${styles.productRow} ${!product.isActive ? styles.inactiveProduct : ''}`}
                              onClick={() => setExpandedProduct(expandedProduct === product.id ? null : product.id)}
                            >
                              <td>{product.id}</td>
                              <td className={styles.productImageCell}>
                                <div className={styles.productThumb}>
                                  <img 
                                    src={product.mainImage && product.mainImage.fields ? 
                                      `https:${product.mainImage.fields.file.url}` : 
                                      '/images/default.JPEG'} 
                                    alt={product.productName} 
                                    onError={(e) => { e.target.src = '/images/default.JPEG'; }}
                                  />
                                  {product.isNew && <span className={styles.newBadge}>Nouveau</span>}
                                </div>
                              </td>
                              <td>
                                <div className={styles.productNameCell}>
                                  <span className={styles.productName}>{product.productName || 'Sans nom'}</span>
                                  <span className={styles.productShortDesc}>{product.shortDescription || 'Aucune description'}</span>
                                </div>
                              </td>
                              <td>{(product.price || 0).toFixed(2)} €</td>
                              <td>
                                <span className={`${styles.stockBadge} ${
                                  isOutOfStock(product) ? styles.outOfStock : 
                                  isLowStock(product) ? styles.lowStock : 
                                  styles.inStock
                                }`}>
                                  {isOutOfStock(product) ? 'Rupture' : 
                                   isLowStock(product) ? 'Faible' : 
                                   'En stock'}
                                </span>
                                <span className={styles.stockCount}>{product.stock || 0}</span>
                              </td>
                              <td>
                                <div className={styles.categoriesList}>
                                  {product.categories && product.categories.length > 0 ? 
                                    product.categories.map((cat, index) => (
                                      <span key={index} className={styles.categoryBadge}>
                                        {getCategoryName(cat)}
                                      </span>
                                    )) : 
                                    <span className={styles.noCategoryBadge}>Aucune catégorie</span>
                                  }
                                </div>
                              </td>
                              <td>
                                <span className={`${styles.productStatus} ${product.isActive ? styles.statusActive : styles.statusInactive}`}>
                                  {product.isActive ? 'Actif' : 'Inactif'}
                                </span>
                              </td>
                              <td>
                                <div className={styles.orderActions}>
                                  <button 
                                    className={styles.viewOrderButton}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setExpandedProduct(expandedProduct === product.id ? null : product.id);
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
                                        openEditModal(product);
                                      }}>
                                        Modifier le produit
                                      </button>
                                      <button onClick={(e) => {
                                        e.stopPropagation();
                                        toggleProductStatus(product.id);
                                      }}>
                                        {product.isActive ? 'Désactiver' : 'Activer'} le produit
                                      </button>
                                      <button 
                                        className={styles.cancelAction}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          deleteProduct(product.id);
                                        }}
                                      >
                                        Supprimer le produit
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </td>
                            </tr>
                            {expandedProduct === product.id && (
                              <tr className={styles.productDetailsRow}>
                                <td colSpan="8">
                                  <div className={styles.productDetails}>
                                    <div className={styles.productDetailsSections}>
                                      <div className={styles.productDetailsSection}>
                                        <h3>Informations produit</h3>
                                        <div className={styles.detailsGrid}>
                                          <div className={styles.detailItem}>
                                            <span className={styles.detailLabel}>ID</span>
                                            <span className={styles.detailValue}>{product.id}</span>
                                          </div>
                                          <div className={styles.detailItem}>
                                            <span className={styles.detailLabel}>Nom</span>
                                            <span className={styles.detailValue}>{product.productName || 'Sans nom'}</span>
                                          </div>
                                          <div className={styles.detailItem}>
                                            <span className={styles.detailLabel}>Prix</span>
                                            <span className={styles.detailValue}>{(product.price || 0).toFixed(2)} €</span>
                                          </div>
                                          <div className={styles.detailItem}>
                                            <span className={styles.detailLabel}>Stock</span>
                                            <span className={styles.detailValue}>{product.stock || 0}</span>
                                          </div>
                                          <div className={styles.detailItem}>
                                            <span className={styles.detailLabel}>Statut</span>
                                            <span className={`${styles.detailValue} ${styles.statusBadge} ${product.isActive ? styles.statusActive : styles.statusInactive}`}>
                                              {product.isActive ? 'Actif' : 'Inactif'}
                                            </span>
                                          </div>
                                          <div className={styles.detailItem}>
                                            <span className={styles.detailLabel}>Date de création</span>
                                            <span className={styles.detailValue}>
                                              {new Date(product.createdAt || Date.now()).toLocaleDateString('fr-FR')}
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                      
                                      <div className={styles.productDetailsSection}>
                                        <h3>Statistiques</h3>
                                        <div className={styles.detailsGrid}>
                                          <div className={styles.detailItem}>
                                            <span className={styles.detailLabel}>Ventes totales</span>
                                            <span className={styles.detailValue}>{(product.popularity || 0) * 10}</span>
                                          </div>
                                          <div className={styles.detailItem}>
                                            <span className={styles.detailLabel}>Note moyenne</span>
                                            <span className={styles.detailValue}>
                                              <span className={styles.ratingStars}>
                                                {"★".repeat(Math.floor(product.rating || 0))}
                                                {(product.rating || 0) % 1 !== 0 && "½"}
                                                {"☆".repeat(5 - Math.ceil(product.rating || 0))}
                                              </span>
                                              {product.rating ? ` (${product.rating})` : 'N/A'}
                                            </span>
                                          </div>
                                          <div className={styles.detailItem}>
                                            <span className={styles.detailLabel}>Nombre d'avis</span>
                                            <span className={styles.detailValue}>{product.reviewCount || 0}</span>
                                          </div>
                                          <div className={styles.detailItem}>
                                            <span className={styles.detailLabel}>Catégories</span>
                                            <span className={styles.detailValue}>
                                              {product.categories && product.categories.length > 0 ? 
                                                product.categories.map(cat => getCategoryName(cat)).join(', ') : 
                                                'Aucune catégorie'
                                              }
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                    
                                    <div className={styles.productDescription}>
                                      <h3>Description</h3>
                                      <div className={styles.descriptionContent}>
                                        <div className={styles.shortDescription}>
                                          <h4>Description courte</h4>
                                          <p>{product.shortDescription || 'Aucune description courte disponible'}</p>
                                        </div>
                                        <div className={styles.longDescription}>
                                          <h4>Description longue</h4>
                                          <p>{product.longDescription || 'Aucune description longue disponible'}</p>
                                        </div>
                                      </div>
                                    </div>
                                    
                                    <div className={styles.productDetailActions}>
                                      <button 
                                        className={styles.editProductButton}
                                        onClick={() => openEditModal(product)}
                                      >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                        </svg>
                                        Modifier le produit
                                      </button>
                                      <button 
                                        className={styles.stockButton}
                                        onClick={() => {
                                          const newStock = prompt('Entrez la nouvelle valeur du stock:', product.stock || 0);
                                          if (newStock !== null) {
                                            const stockValue = parseInt(newStock);
                                            if (!isNaN(stockValue) && stockValue >= 0) {
                                              setProducts(products.map(p => {
                                                if (p.id === product.id) {
                                                  return { ...p, stock: stockValue };
                                                }
                                                return p;
                                              }));
                                            } else {
                                              alert('Veuillez entrer un nombre valide');
                                            }
                                          }
                                        }}
                                      >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                          <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                                          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                                        </svg>
                                        Mettre à jour le stock
                                      </button>
                                      <button 
                                        className={`${styles.statusToggleButton} ${!product.isActive ? styles.activateButton : styles.deactivateButton}`}
                                        onClick={() => toggleProductStatus(product.id)}
                                      >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                          <path d="M18.36 6.64a9 9 0 1 1-12.73 0"></path>
                                          <line x1="12" y1="2" x2="12" y2="12"></line>
                                        </svg>
                                        {product.isActive ? 'Désactiver le produit' : 'Activer le produit'}
                                      </button>
                                      
                                      <button 
                                        className={styles.closeDetailsButton}
                                        onClick={() => setExpandedProduct(null)}
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
                    
                    {getFilteredProducts().length === 0 && (
                      <div className={styles.noOrdersFound}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10"></circle>
                          <path d="M16 16s-1.5-2-4-2-4 2-4 2"></path>
                          <line x1="9" y1="9" x2="9.01" y2="9"></line>
                          <line x1="15" y1="9" x2="15.01" y2="9"></line>
                        </svg>
                        <p>Aucun produit trouvé</p>
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

      {/* Modal d'ajout de produit */}
      {showAddModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContainer}>
            <div className={styles.modalHeader}>
              <h2>Ajouter un nouveau produit</h2>
              <button className={styles.closeModal} onClick={() => setShowAddModal(false)}>×</button>
            </div>
            <div className={styles.modalBody}>
              <form onSubmit={handleAddSubmit}>
                <div className={styles.formGroup}>
                  <label htmlFor="productName">Nom du produit *</label>
                  <input 
                    type="text" 
                    id="productName" 
                    name="productName" 
                    value={formData.productName} 
                    onChange={handleFormChange} 
                    required 
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label htmlFor="shortDescription">Description courte *</label>
                  <input 
                    type="text" 
                    id="shortDescription" 
                    name="shortDescription" 
                    value={formData.shortDescription} 
                    onChange={handleFormChange} 
                    required 
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label htmlFor="longDescription">Description longue</label>
                  <textarea 
                    id="longDescription" 
                    name="longDescription" 
                    value={formData.longDescription} 
                    onChange={handleFormChange} 
                    rows="5"
                  ></textarea>
                </div>
                
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label htmlFor="price">Prix (€) *</label>
                    <input 
                      type="number" 
                      id="price" 
                      name="price" 
                      value={formData.price} 
                      onChange={handleFormChange} 
                      step="0.01" 
                      min="0" 
                      required 
                    />
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label htmlFor="stock">Stock *</label>
                    <input 
                      type="number" 
                      id="stock" 
                      name="stock" 
                      value={formData.stock} 
                      onChange={handleFormChange} 
                      min="0" 
                      required 
                    />
                  </div>
                </div>
                
                <div className={styles.formGroup}>
                  <label>Catégories</label>
                  <div className={styles.checkboxGrid}>
                    {availableCategories.map(category => (
                      <div key={category.id} className={styles.checkboxItem}>
                        <input 
                          type="checkbox" 
                          id={`category-${category.id}`} 
                          name="categories" 
                          value={category.id} 
                          checked={formData.categories.includes(category.id)} 
                          onChange={handleFormChange} 
                        />
                        <label htmlFor={`category-${category.id}`}>{category.name}</label>
                      </div>
                    ))}
                  </div>
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
                    <label htmlFor="isActive">Produit actif</label>
                  </div>
                </div>
                
                <div className={styles.formActions}>
                  <button type="button" className={styles.cancelButton} onClick={() => setShowAddModal(false)}>
                    Annuler
                  </button>
                  <button type="submit" className={styles.submitButton}>
                    Ajouter le produit
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal d'édition de produit */}
      {showEditModal && currentProduct && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContainer}>
            <div className={styles.modalHeader}>
              <h2>Modifier le produit #{currentProduct.id}</h2>
              <button className={styles.closeModal} onClick={() => setShowEditModal(false)}>×</button>
            </div>
            <div className={styles.modalBody}>
              <form onSubmit={handleEditSubmit}>
                <div className={styles.formGroup}>
                  <label htmlFor="productName">Nom du produit *</label>
                  <input 
                    type="text" 
                    id="productName" 
                    name="productName" 
                    value={formData.productName} 
                    onChange={handleFormChange} 
                    required 
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label htmlFor="shortDescription">Description courte *</label>
                  <input 
                    type="text" 
                    id="shortDescription" 
                    name="shortDescription" 
                    value={formData.shortDescription} 
                    onChange={handleFormChange} 
                    required 
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label htmlFor="longDescription">Description longue</label>
                  <textarea 
                    id="longDescription" 
                    name="longDescription" 
                    value={formData.longDescription} 
                    onChange={handleFormChange} 
                    rows="5"
                  ></textarea>
                </div>
                
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label htmlFor="price">Prix (€) *</label>
                    <input 
                      type="number" 
                      id="price" 
                      name="price" 
                      value={formData.price} 
                      onChange={handleFormChange} 
                      step="0.01" 
                      min="0" 
                      required 
                    />
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label htmlFor="stock">Stock *</label>
                    <input 
                      type="number" 
                      id="stock" 
                      name="stock" 
                      value={formData.stock} 
                      onChange={handleFormChange} 
                      min="0" 
                      required 
                    />
                  </div>
                </div>
                
                <div className={styles.formGroup}>
                  <label>Catégories</label>
                  <div className={styles.checkboxGrid}>
                    {availableCategories.map(category => (
                      <div key={category.id} className={styles.checkboxItem}>
                        <input 
                          type="checkbox" 
                          id={`edit-category-${category.id}`} 
                          name="categories" 
                          value={category.id} 
                          checked={formData.categories.includes(category.id)} 
                          onChange={handleFormChange} 
                        />
                        <label htmlFor={`edit-category-${category.id}`}>{category.name}</label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className={styles.formGroup}>
                  <div className={styles.checkboxRow}>
                    <input 
                      type="checkbox" 
                      id="editIsActive" 
                      name="isActive" 
                      checked={formData.isActive} 
                      onChange={handleFormChange} 
                    />
                    <label htmlFor="editIsActive">Produit actif</label>
                  </div>
                </div>
                
                <div className={styles.formActions}>
                  <button type="button" className={styles.cancelButton} onClick={() => setShowEditModal(false)}>
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
        .productsSection {
          flex: 1;
          padding: var(--spacing-xl) 0;
        }
        
        .productsContainer {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 var(--spacing-xl);
        }
        
        .productRow {
          cursor: pointer;
        }
        
        .inactiveProduct {
          background-color: rgba(0, 0, 0, 0.03);
          color: var(--color-text-light);
        }
        
        .productImageCell {
          width: 80px;
        }
        
        .productThumb {
          width: 60px;
          height: 60px;
          border-radius: var(--radius-sm);
          overflow: hidden;
          position: relative;
          border: 1px solid var(--color-border);
        }
        
        .productThumb img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .newBadge {
          position: absolute;
          top: 0;
          right: 0;
          background-color: var(--color-primary);
          color: white;
          font-size: 10px;
          padding: 2px 4px;
          border-radius: 0 0 0 4px;
        }
        
        .productNameCell {
          display: flex;
          flex-direction: column;
        }
        
        .productName {
          font-weight: 500;
          margin-bottom: 4px;
        }
        
        .productShortDesc {
          font-size: 12px;
          color: var(--color-text-light);
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          max-width: 300px;
        }
        
        .stockBadge {
          display: inline-block;
          padding: 2px 6px;
          border-radius: var(--radius-full);
          font-size: 12px;
          font-weight: 600;
          margin-right: 6px;
        }
        
        .inStock {
          background-color: rgba(76, 175, 80, 0.1);
          color: var(--color-success);
        }
        
        .lowStock {
          background-color: rgba(255, 152, 0, 0.1);
          color: var(--color-warning);
        }
        
        .outOfStock {
          background-color: rgba(244, 67, 54, 0.1);
          color: var(--color-error);
        }
        
        .stockCount {
          font-weight: 500;
        }
        
        .categoriesList {
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
        }
        
        .categoryBadge {
          display: inline-block;
          padding: 2px 6px;
          background-color: rgba(33, 150, 243, 0.1);
          color: var(--color-info);
          border-radius: var(--radius-full);
          font-size: 11px;
        }
        
        .noCategoryBadge {
          display: inline-block;
          padding: 2px 6px;
          background-color: rgba(0, 0, 0, 0.05);
          color: var(--color-text-light);
          border-radius: var(--radius-full);
          font-size: 11px;
        }
        
        .productStatus {
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
        
        /* Modals */
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
        }
        
        .modalContainer {
          background-color: white;
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-xl);
          width: 90%;
          max-width: 600px;
          max-height: 90vh;
          overflow-y: auto;
        }
        
        .modalHeader {
          padding: 20px;
          border-bottom: 1px solid var(--color-border);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .modalHeader h2 {
          font-size: 18px;
          font-weight: 600;
          color: var(--color-text);
          margin: 0;
        }
        
        .closeModal {
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: var(--color-text-light);
        }
        
        .modalBody {
          padding: 20px;
        }
        
        .formGroup {
          margin-bottom: 20px;
        }
        
        .formGroup label {
          display: block;
          font-size: 14px;
          font-weight: 500;
          margin-bottom: 8px;
        }
        
        .formGroup input[type="text"],
        .formGroup input[type="number"],
        .formGroup textarea {
          width: 100%;
          padding: 10px;
          border: 1px solid var(--color-border);
          border-radius: var(--radius-sm);
          font-size: 14px;
        }
        
        .formGroup input[type="text"]:focus,
        .formGroup input[type="number"]:focus,
        .formGroup textarea:focus {
          outline: none;
          border-color: var(--color-primary);
          box-shadow: 0 0 0 2px rgba(46, 125, 50, 0.1);
        }
        
        .formRow {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }
        
        .checkboxGrid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
        }
        
        .checkboxItem {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .checkboxRow {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .formActions {
          display: flex;
          justify-content: flex-end;
          gap: 16px;
          margin-top: 30px;
        }
        
        .cancelButton,
        .submitButton {
          padding: 10px 20px;
          border-radius: var(--radius-md);
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
        }
        
        .cancelButton {
          background-color: white;
          border: 1px solid var(--color-border);
          color: var(--color-text);
        }
        
        .submitButton {
          background-color: var(--color-primary);
          border: none;
          color: white;
        }
        
        .productDescription {
          background-color: var(--color-background-light);
          border-radius: var(--radius-md);
          padding: var(--spacing-lg);
          box-shadow: var(--shadow-sm);
          margin-bottom: var(--spacing-xl);
        }
        
        .productDescription h3 {
          font-size: 16px;
          font-weight: 600;
          margin: 0 0 var(--spacing-md);
          color: var(--color-text);
          padding-bottom: var(--spacing-sm);
          border-bottom: 1px solid var(--color-border);
        }
        
        .descriptionContent {
          display: grid;
          grid-template-columns: 1fr 2fr;
          gap: var(--spacing-lg);
        }
        
        .shortDescription h4,
        .longDescription h4 {
          font-size: 14px;
          font-weight: 600;
          margin: 0 0 var(--spacing-sm);
          color: var(--color-text);
        }
        
        .shortDescription p,
        .longDescription p {
          font-size: 14px;
          color: var(--color-text);
          margin: 0;
          line-height: 1.5;
        }
        
        .ratingStars {
          color: var(--color-secondary);
        }
        
        .productDetailActions {
          display: flex;
          flex-wrap: wrap;
          gap: var(--spacing-md);
          margin-bottom: var(--spacing-xl);
        }
        
        .editProductButton,
        .stockButton,
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
        
        .editProductButton {
          background-color: var(--color-primary);
          color: white;
        }
        
        .stockButton {
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
        
        .addProductButton {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          padding: var(--spacing-md) var(--spacing-lg);
          background-color: var(--color-primary);
          color: white;
          border: none;
          border-radius: var(--radius-md);
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all var(--transition-fast);
        }
        
        .addProductButton:hover {
          background-color: var(--color-primary-dark);
        }
        
        @media (max-width: 768px) {
          .formRow,
          .checkboxGrid,
          .descriptionContent {
            grid-template-columns: 1fr;
          }
          
          .productDetailActions {
            flex-direction: column;
          }
          
          .editProductButton,
          .stockButton,
          .statusToggleButton {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </>
  );
}