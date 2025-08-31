"use client";

import { useState, useEffect } from 'react';
import Head from 'next/head';
import HeaderAdmin from '../../components/HeaderAdmin';
import styles from '../../styles/admin.module.css';

export default function AdminPromos() {
  // États pour l'interface
  const [userEmail, setUserEmail] = useState('');
  const [promos, setPromos] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  
  // États pour le formulaire d'ajout
  const [newPromo, setNewPromo] = useState({
    code: '',
    discount: '',
    type: 'percentage', // 'percentage' ou 'fixed'
    description: '',
    active: true
  });

  // Charger les données au démarrage
  useEffect(() => {
    console.log('Chargement de la page des codes promo admin');
    
    // Récupérer l'email de l'utilisateur connecté
    const email = localStorage.getItem('userEmail') || sessionStorage.getItem('userEmail');
    if (email) {
      setUserEmail(email);
      console.log('Email admin récupéré:', email);
    } else {
      console.warn('Aucun email admin trouvé, redirection vers login');
      window.location.href = '/login';
      return;
    }

    // Charger les codes promo existants
    loadPromos();
  }, []);

  const loadPromos = () => {
    try {
      const savedPromos = JSON.parse(localStorage.getItem('promoCodes')) || [];
      setPromos(savedPromos);
      console.log('Codes promo chargés:', savedPromos);
    } catch (error) {
      console.error('Erreur lors du chargement des codes promo:', error);
      setPromos([]);
    }
  };

  const savePromos = (updatedPromos) => {
    try {
      localStorage.setItem('promoCodes', JSON.stringify(updatedPromos));
      setPromos(updatedPromos);
      console.log('Codes promo sauvegardés:', updatedPromos);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des codes promo:', error);
    }
  };

  const handleAddPromo = (e) => {
    e.preventDefault();
    console.log('Ajout d\'un nouveau code promo:', newPromo);

    // Vérifications
    if (!newPromo.code.trim()) {
      alert('Le code promo est obligatoire');
      return;
    }

    if (!newPromo.discount || newPromo.discount <= 0) {
      alert('La réduction doit être supérieure à 0');
      return;
    }

    // Vérifier si le code existe déjà
    const codeExists = promos.some(promo => 
      promo.code.toLowerCase() === newPromo.code.toLowerCase()
    );
    
    if (codeExists) {
      alert('Ce code promo existe déjà');
      return;
    }

    // Créer le nouveau code promo
    const promoToAdd = {
      id: Date.now().toString(), // ID simple basé sur la timestamp
      code: newPromo.code.toUpperCase().trim(),
      discount: parseFloat(newPromo.discount),
      type: newPromo.type,
      description: newPromo.description.trim(),
      active: newPromo.active,
      createdAt: new Date().toISOString()
    };

    // Ajouter à la liste
    const updatedPromos = [...promos, promoToAdd];
    savePromos(updatedPromos);

    // Réinitialiser le formulaire
    setNewPromo({
      code: '',
      discount: '',
      type: 'percentage',
      description: '',
      active: true
    });
    setShowAddForm(false);

    alert('Code promo ajouté avec succès !');
  };

  const togglePromoStatus = (promoId) => {
    console.log('Basculement du statut du code promo:', promoId);
    const updatedPromos = promos.map(promo => {
      if (promo.id === promoId) {
        return { ...promo, active: !promo.active };
      }
      return promo;
    });
    savePromos(updatedPromos);
  };

  const deletePromo = (promoId) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce code promo ?')) {
      console.log('Suppression du code promo:', promoId);
      const updatedPromos = promos.filter(promo => promo.id !== promoId);
      savePromos(updatedPromos);
    }
  };

  const handleInputChange = (field, value) => {
    setNewPromo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <>
      <Head>
        <title>Codes Promo | Admin MonSavonVert</title>
        <meta name="description" content="Gestion des codes promo - Admin MonSavonVert" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className={styles.adminContainer}>
        <HeaderAdmin userEmail={userEmail} activePage="promos" />
        
        <main className={styles.adminContent}>
          <div className={styles.adminHeader}>
            <h1 className={styles.adminTitle}>Gestion des Codes Promo</h1>
            <button 
              className={`${styles.primaryButton} ${styles.addButton}`}
              onClick={() => setShowAddForm(!showAddForm)}
            >
              {showAddForm ? 'Annuler' : '+ Nouveau Code Promo'}
            </button>
          </div>

          {/* Formulaire d'ajout */}
          {showAddForm && (
            <div className={styles.formCard}>
              <h2 className={styles.formTitle}>Créer un nouveau code promo</h2>
              <form onSubmit={handleAddPromo} className={styles.form}>
                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Code Promo *</label>
                    <input
                      type="text"
                      value={newPromo.code}
                      onChange={(e) => handleInputChange('code', e.target.value)}
                      placeholder="Ex: NOEL2024"
                      className={styles.formInput}
                      required
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Type de réduction *</label>
                    <select
                      value={newPromo.type}
                      onChange={(e) => handleInputChange('type', e.target.value)}
                      className={styles.formSelect}
                    >
                      <option value="percentage">Pourcentage (%)</option>
                      <option value="fixed">Montant fixe (€)</option>
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>
                      Réduction * {newPromo.type === 'percentage' ? '(%)' : '(€)'}
                    </label>
                    <input
                      type="number"
                      value={newPromo.discount}
                      onChange={(e) => handleInputChange('discount', e.target.value)}
                      placeholder={newPromo.type === 'percentage' ? '10' : '5.00'}
                      min="0"
                      step={newPromo.type === 'percentage' ? '1' : '0.01'}
                      className={styles.formInput}
                      required
                    />
                  </div>

                  <div className={styles.formGroup} style={{gridColumn: '1/-1'}}>
                    <label className={styles.formLabel}>Description</label>
                    <input
                      type="text"
                      value={newPromo.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Ex: Réduction de Noël"
                      className={styles.formInput}
                    />
                  </div>

                  <div className={styles.formGroup} style={{gridColumn: '1/-1'}}>
                    <label className={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        checked={newPromo.active}
                        onChange={(e) => handleInputChange('active', e.target.checked)}
                        className={styles.checkbox}
                      />
                      Code actif dès la création
                    </label>
                  </div>
                </div>

                <div className={styles.formActions}>
                  <button type="submit" className={styles.primaryButton}>
                    Créer le code promo
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setShowAddForm(false)}
                    className={styles.secondaryButton}
                  >
                    Annuler
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Liste des codes promo */}
          <div className={styles.dataCard}>
            <h2 className={styles.cardTitle}>
              Codes Promo Existants ({promos.length})
            </h2>
            
            {promos.length === 0 ? (
              <div className={styles.emptyState}>
                <p>Aucun code promo créé pour le moment.</p>
                <button 
                  className={styles.primaryButton}
                  onClick={() => setShowAddForm(true)}
                >
                  Créer le premier code promo
                </button>
              </div>
            ) : (
              <div className={styles.tableContainer}>
                <table className={styles.dataTable}>
                  <thead>
                    <tr>
                      <th>Code</th>
                      <th>Réduction</th>
                      <th>Description</th>
                      <th>Statut</th>
                      <th>Créé le</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {promos.map((promo) => (
                      <tr key={promo.id}>
                        <td>
                          <strong>{promo.code}</strong>
                        </td>
                        <td>
                          {promo.type === 'percentage' 
                            ? `${promo.discount}%` 
                            : `${promo.discount}€`
                          }
                        </td>
                        <td>{promo.description || '-'}</td>
                        <td>
                          <span className={`${styles.statusBadge} ${
                            promo.active ? styles.statusActive : styles.statusInactive
                          }`}>
                            {promo.active ? 'Actif' : 'Inactif'}
                          </span>
                        </td>
                        <td>
                          {new Date(promo.createdAt).toLocaleDateString('fr-FR')}
                        </td>
                        <td>
                          <div className={styles.actionButtons}>
                            <button
                              onClick={() => togglePromoStatus(promo.id)}
                              className={`${styles.actionButton} ${
                                promo.active ? styles.deactivateButton : styles.activateButton
                              }`}
                              title={promo.active ? 'Désactiver' : 'Activer'}
                            >
                              {promo.active ? '⏸️' : '▶️'}
                            </button>
                            <button
                              onClick={() => deletePromo(promo.id)}
                              className={`${styles.actionButton} ${styles.deleteButton}`}
                              title="Supprimer"
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
}