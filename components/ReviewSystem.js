// components/ReviewSystem.js
// Composant complet pour gérer les avis avec authentification robuste
import React, { useState, useEffect, useCallback, useContext } from 'react';
import { UserContext } from '../context/UserContext';
import styles from '../styles/reviewSystem.module.css';

// ========================
// HELPER FUNCTIONS
// ========================

/**
 * Crée un objet Review à partir de la réponse API
 * @param {Object} data - Réponse de l'API
 * @param {Object} user - Utilisateur authentifié
 * @param {Object} formData - Données du formulaire
 * @returns {Object} Nouvel avis formaté
 */
const createReviewFromResponse = (data, user, formData) => {
  console.log('🔧 Création d\'un avis à partir de la réponse:', data);
  
  // Cas 1: La réponse contient data.review (format attendu)
  if (data.review && data.review._id) {
    return {
      _id: data.review._id,
      user: `${user.firstName} ${user.lastName}`,
      userId: user._id || user.userId || '',
      firstName: user.firstName,
      lastName: user.lastName,
      rating: data.review.rating,
      comment: data.review.comment,
      createdAt: data.review.createdAt || new Date().toISOString()
    };
  }
  
  // Cas 2: La réponse contient directement les propriétés de l'avis
  if (data._id) {
    return {
      _id: data._id,
      user: `${user.firstName} ${user.lastName}`,
      userId: user._id || user.userId || '',
      firstName: user.firstName,
      lastName: user.lastName,
      rating: data.rating || parseInt(formData.rating, 10),
      comment: data.comment || formData.comment.trim(),
      createdAt: data.createdAt || new Date().toISOString()
    };
  }
  
  // Cas 3: Fallback - créer l'avis avec un ID temporaire
  console.warn('⚠️ Structure de réponse non reconnue, création d\'un avis avec ID temporaire');
  return {
    _id: `temp_${Date.now()}`,
    user: `${user.firstName} ${user.lastName}`,
    userId: user._id || user.userId || '',
    firstName: user.firstName,
    lastName: user.lastName,
    rating: parseInt(formData.rating, 10),
    comment: formData.comment.trim(),
    createdAt: new Date().toISOString()
  };
};

/**
 * Vérifie si un utilisateur peut supprimer un avis - VERSION NETTOYÉE
 * @param {Object|null} user - Utilisateur authentifié
 * @param {string|undefined} reviewUserId - ID de l'utilisateur qui a créé l'avis
 * @param {Object} review - Objet review complet
 * @returns {boolean} True si l'utilisateur peut supprimer l'avis
 */
const canUserDeleteReview = (user, reviewUserId, review = {}) => {
  if (!user) {
    return false;
  }
  
  // Admin peut tout supprimer
  if (user.role === 'admin') {
    return true;
  }
  
  const currentUserId = user._id || user.userId;
  
  // PRIORITÉ 1 : Si l'avis a un userId (nouveaux avis), vérifier l'ID
  if (reviewUserId && currentUserId) {
    return reviewUserId === currentUserId;
  }
  
  // PRIORITÉ 2 : Vérifier par firstName + lastName (si disponibles)
  if (review.firstName && review.lastName && user.firstName && user.lastName) {
    const reviewFullName = `${review.firstName} ${review.lastName}`.toLowerCase().trim();
    const userFullName = `${user.firstName} ${user.lastName}`.toLowerCase().trim();
    return reviewFullName === userFullName;
  }
  
  // PRIORITÉ 3 : Vérifier avec le champ 'user' (nom complet)
  if (review.user && user.firstName && user.lastName) {
    const reviewName = review.user.toLowerCase().trim();
    const userName = `${user.firstName} ${user.lastName}`.toLowerCase().trim();
    return reviewName === userName;
  }
  
  // PRIORITÉ 4 : Vérification par firstName seulement (très anciens avis)
  if (review.firstName && user.firstName && !review.lastName && !review.user) {
    return review.firstName.toLowerCase().trim() === user.firstName.toLowerCase().trim();
  }
  
  return false;
};

// ========================
// MAIN COMPONENT
// ========================

/**
 * ReviewSystem: Composant pour gérer les avis produits
 * - Authentification robuste avec gestion de tokens
 * - Suppression sécurisée pour l'auteur et les admins
 * - Interface utilisateur intuitive avec états de chargement
 * - Gestion robuste des erreurs avec retry automatique
 */
const ReviewSystem = ({ productId, initialReviews = [], onReviewsUpdate }) => {
  // Utilisation du UserContext amélioré
  const { user, isAuthenticated, authenticatedFetch, authLoading } = useContext(UserContext);
  
  // ========================
  // STATE MANAGEMENT
  // ========================
  
  const [reviews, setReviews] = useState(initialReviews);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [reviewForm, setReviewForm] = useState({
    rating: '',
    comment: ''
  });

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  // ========================
  // NOUVELLE FONCTION : Notifier la page parent des changements
  // ========================
  
  const notifyParentOfUpdate = useCallback((newReviews) => {
    console.log('📤 Notification de la page parent avec', newReviews.length, 'avis');
    
    if (onReviewsUpdate && typeof onReviewsUpdate === 'function') {
      onReviewsUpdate(newReviews);
      console.log('✅ Page parent notifiée avec succès');
    } else {
      console.log('⚠️ Pas de callback onReviewsUpdate fourni');
    }
  }, [onReviewsUpdate]);

  // ========================
  // DEBUG LOGGING (VERSION NETTOYÉE)
  // ========================
  
  useEffect(() => {
    console.log('🔍 ReviewSystem - Utilisateur:', isAuthenticated ? 'connecté' : 'non connecté');
    console.log('📝 ReviewSystem - Avis actuels:', reviews.length, 'avis');
  }, [user, isAuthenticated, reviews]);

  // ========================
  // NOUVEAU : Effet pour synchroniser les avis avec la page parent
  // ========================
  
  useEffect(() => {
    console.log('🔄 Synchronisation des avis avec la page parent');
    setReviews(initialReviews);
  }, [initialReviews]);

  // ========================
  // NOUVEAU : Notifier la page parent quand les avis changent
  // ========================
  
  useEffect(() => {
    console.log('📣 Les avis ont changé, notification de la page parent');
    notifyParentOfUpdate(reviews);
  }, [reviews, notifyParentOfUpdate]);

  // ========================
  // EVENT HANDLERS
  // ========================

  /**
   * Soumission d'un nouvel avis avec gestion robuste d'authentification
   */
  const handleSubmitReview = useCallback(async (e) => {
    e.preventDefault();
    console.log('📝 Soumission d\'avis');

    // Vérification de l'authentification
    if (!isAuthenticated || !user) {
      console.error('❌ Utilisateur non connecté');
      setError('Vous devez être connecté pour laisser un avis.');
      return;
    }

    // Validation des données du formulaire
    const { rating, comment } = reviewForm;
    if (!rating || !comment.trim()) {
      console.error('❌ Données du formulaire manquantes');
      setError('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    // NOUVELLE VALIDATION : Vérification de la longueur du commentaire côté client
    if (comment.trim().length < 10) {
      setError(`Votre commentaire doit contenir au moins 10 caractères. Vous en avez ${comment.trim().length}.`);
      return;
    }

    // Validation des données utilisateur
    if (!user.firstName || !user.lastName) {
      console.error('❌ Données utilisateur incomplètes');
      setError('Informations utilisateur incomplètes. Veuillez vous reconnecter.');
      return;
    }

    if (!user._id && !user.userId) {
      console.error('❌ ID utilisateur manquant');
      setError('ID utilisateur manquant. Veuillez vous reconnecter.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      console.log('🚀 Envoi de l\'avis au serveur...');

      const requestBody = {
        rating: parseInt(rating, 10),
        comment: comment.trim(),
        firstName: user.firstName,
        lastName: user.lastName,
        userId: user._id || user.userId,
        user: `${user.firstName} ${user.lastName}`,
        authorId: user._id || user.userId,
        author: user._id || user.userId,
        user_id: user._id || user.userId,
        productId: productId,
        product_id: productId,
        userInfo: {
          id: user._id || user.userId,
          firstName: user.firstName,
          lastName: user.lastName,
          fullName: `${user.firstName} ${user.lastName}`
        }
      };

      // Utilisation de authenticatedFetch avec gestion automatique des tokens
      const response = await authenticatedFetch(`${API_URL}/products/${productId}/review`, {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();
      console.log('📦 Réponse du serveur:', response.ok ? 'Succès' : 'Erreur');

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de l\'ajout de l\'avis');
      }

      // Créer le nouvel avis
      const newReview = createReviewFromResponse(data, user, reviewForm);
      console.log('✅ Nouvel avis créé:', newReview);

      // Ajouter le nouvel avis à la liste (MODIFICATION : mettre à jour directement l'état)
      const updatedReviews = [newReview, ...reviews];
      setReviews(updatedReviews);
      
      // Réinitialiser le formulaire
      setReviewForm({ rating: '', comment: '' });
      setSuccess('Votre avis a été ajouté avec succès !');

      console.log('🎉 Avis ajouté avec succès, page parent sera notifiée automatiquement');

    } catch (err) {
      console.error('❌ Erreur lors de l\'ajout de l\'avis:', err);
      
      if (err.message.includes('Session expirée')) {
        setError('Votre session a expiré. Veuillez vous reconnecter.');
      } else {
        setError(err instanceof Error ? err.message : 'Une erreur inattendue s\'est produite');
      }
    } finally {
      setLoading(false);
    }
  }, [user, isAuthenticated, reviewForm, productId, API_URL, authenticatedFetch, reviews]);

  /**
   * Suppression d'un avis avec gestion robuste d'authentification
   */
  const handleDeleteReview = useCallback(async (reviewId, reviewUserId) => {
    console.log('🗑️ Suppression d\'avis');

    // Vérification de l'authentification
    if (!isAuthenticated || !user) {
      console.error('❌ Utilisateur non connecté');
      setError('Vous devez être connecté pour effectuer cette action.');
      return;
    }

    // Trouver l'avis complet pour les vérifications
    const reviewToDelete = reviews.find(r => r._id === reviewId);
    if (!reviewToDelete) {
      console.error('❌ Avis non trouvé localement');
      setError('Avis non trouvé.');
      return;
    }

    // Vérification des droits de suppression
    const canDelete = canUserDeleteReview(user, reviewUserId, reviewToDelete);
    
    if (!canDelete) {
      console.error('❌ Droits insuffisants');
      setError('Vous n\'avez pas les droits pour supprimer cet avis.');
      return;
    }

    // Confirmation de suppression
    const confirmMessage = reviewUserId 
      ? 'Êtes-vous sûr de vouloir supprimer cet avis ?' 
      : 'Êtes-vous sûr de vouloir supprimer cet ancien avis ?';
      
    if (!confirm(confirmMessage)) {
      console.log('❌ Suppression annulée par l\'utilisateur');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      console.log('🚀 Suppression de l\'avis...');
      
      // Utilisation de authenticatedFetch avec gestion automatique des tokens
      const response = await authenticatedFetch(`${API_URL}/products/${productId}/review/${reviewId}`, {
        method: 'DELETE'
      });

      const data = await response.json();
      console.log('📦 Réponse de suppression:', response.ok ? 'Succès' : 'Erreur');

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la suppression de l\'avis');
      }

      // Retirer l'avis de la liste (MODIFICATION : mettre à jour directement l'état)
      const updatedReviews = reviews.filter(review => review._id !== reviewId);
      setReviews(updatedReviews);
      setSuccess('Avis supprimé avec succès !');
      console.log('✅ Avis supprimé localement, page parent sera notifiée automatiquement');

    } catch (err) {
      console.error('❌ Erreur lors de la suppression:', err);
      
      if (err.message.includes('Session expirée')) {
        setError('Votre session a expiré. Veuillez vous reconnecter.');
      } else {
        setError(err instanceof Error ? err.message : 'Une erreur inattendue s\'est produite');
      }
    } finally {
      setLoading(false);
    }
  }, [user, isAuthenticated, productId, API_URL, reviews, authenticatedFetch]);

  /**
   * Gestionnaire de changement pour le formulaire
   */
  const handleFormChange = useCallback((field, value) => {
    setReviewForm(prev => ({ ...prev, [field]: value }));
  }, []);

  // ========================
  // SIDE EFFECTS
  // ========================

  /**
   * Effacer les messages après 5 secondes
   */
  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess('');
        setError('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  // ========================
  // LOADING STATES
  // ========================

  // Affichage d'un loader si l'authentification est en cours
  if (authLoading) {
    return (
      <div className={styles.reviewSystem}>
        <div className={styles.loadingAuth}>
          <div className={styles.spinner}></div>
          <p>Vérification de votre connexion...</p>
        </div>
      </div>
    );
  }

  // ========================
  // RENDER
  // ========================

  return (
    <div className={styles.reviewSystem}>
      {/* Messages d'état */}
      {error && (
        <div className={styles.errorMessage}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="15" y1="9" x2="9" y2="15"></line>
            <line x1="9" y1="9" x2="15" y2="15"></line>
          </svg>
          {error}
        </div>
      )}

      {success && (
        <div className={styles.successMessage}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
          {success}
        </div>
      )}

      {/* Formulaire d'avis - Seulement si connecté */}
      {isAuthenticated && user ? (
        <div className={styles.reviewFormContainer}>
          <h3 className={styles.reviewFormTitle}>Partagez votre expérience</h3>
          <p className={styles.reviewFormSubtitle}>
            Connecté en tant que <strong>{user.firstName} {user.lastName}</strong>
          </p>

          <form onSubmit={handleSubmitReview} className={styles.reviewForm}>
            {/* Sélection de la note */}
            <div className={styles.formGroup}>
              <label htmlFor="rating">Votre note</label>
              <select
                id="rating"
                value={reviewForm.rating}
                onChange={(e) => handleFormChange('rating', e.target.value)}
                required
                className={styles.formSelect}
                disabled={loading}
              >
                <option value="">Choisir une note</option>
                <option value="5">★★★★★ Excellent</option>
                <option value="4">★★★★☆ Très bien</option>
                <option value="3">★★★☆☆ Bien</option>
                <option value="2">★★☆☆☆ Moyen</option>
                <option value="1">★☆☆☆☆ Déçu</option>
              </select>
            </div>

            {/* Commentaire */}
            <div className={styles.formGroup}>
              <label htmlFor="comment">Votre avis</label>
              <textarea
                id="comment"
                value={reviewForm.comment}
                onChange={(e) => handleFormChange('comment', e.target.value)}
                rows={5}
                placeholder="Partagez votre expérience avec ce produit..."
                required
                className={styles.formTextarea}
                disabled={loading}
                maxLength={1000}
              />
              <div className={styles.commentHelper}>
                <small className={styles.charCount}>
                  {reviewForm.comment.length}/1000 caractères
                </small>
                {reviewForm.comment.trim().length > 0 && reviewForm.comment.trim().length < 10 && (
                  <small className={styles.charWarning}>
                    • Minimum 10 caractères requis ({10 - reviewForm.comment.trim().length} de plus)
                  </small>
                )}
                {reviewForm.comment.trim().length >= 10 && (
                  <small className={styles.charSuccess}>
                    ✓ Longueur suffisante
                  </small>
                )}
              </div>
            </div>

            {/* Bouton de soumission */}
            <div className={styles.formActions}>
              <button
                type="submit"
                className={styles.submitReviewButton}
                disabled={loading || !reviewForm.rating || reviewForm.comment.trim().length < 10}
              >
                {loading ? (
                  <>
                    <span className={styles.spinner}></span>
                    Publication en cours...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                    </svg>
                    {reviewForm.comment.trim().length < 10 ? 'Commentaire trop court' : 'Publier mon avis'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* Message pour utilisateurs non connectés */
        <div className={styles.loginPrompt}>
          <div className={styles.loginPromptIcon}>
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
              <polyline points="10 17 15 12 10 7"></polyline>
              <line x1="15" y1="12" x2="3" y2="12"></line>
            </svg>
          </div>
          <h3>Connexion requise</h3>
          <p>Vous devez être connecté pour laisser un avis sur ce produit.</p>
          <div className={styles.loginPromptActions}>
            <a href="/login" className={styles.loginButton}>Se connecter</a>
            <a href="/register" className={styles.registerButton}>Créer un compte</a>
          </div>
        </div>
      )}

      {/* Liste des avis */}
      <div className={styles.reviewsList}>
        <h3 className={styles.reviewsTitle}>
          Avis clients ({reviews.length})
        </h3>

        {reviews.length > 0 ? (
          <div className={styles.reviewsGrid}>
            {reviews.map((review) => {
              const canDelete = canUserDeleteReview(user, review.userId, review);
              
              return (
                <div key={review._id} className={styles.reviewCard}>
                  {/* En-tête de l'avis */}
                  <div className={styles.reviewCardHeader}>
                    <div className={styles.reviewerInfo}>
                      <div className={styles.reviewerAvatar}>
                        {(review.firstName || review.user || 'A').charAt(0).toUpperCase()}
                      </div>
                      <div className={styles.reviewerDetails}>
                        <div className={styles.reviewerName}>
                          {review.firstName && review.lastName 
                            ? `${review.firstName} ${review.lastName}`
                            : review.user || 'Utilisateur anonyme'
                          }
                        </div>
                        <div className={styles.reviewDate}>
                          {review.createdAt ? new Date(review.createdAt).toLocaleDateString('fr-FR') : 'Date inconnue'}
                        </div>
                      </div>
                    </div>

                    {/* Bouton de suppression */}
                    {canDelete && (
                      <button
                        onClick={() => handleDeleteReview(review._id, review.userId)}
                        className={styles.deleteButton}
                        disabled={loading}
                        title={
                          user?.role === 'admin' 
                            ? 'Supprimer (Admin)' 
                            : review.userId 
                              ? 'Supprimer mon avis' 
                              : 'Supprimer mon avis (ancien système)'
                        }
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                      </button>
                    )}
                  </div>

                  {/* Note et commentaire */}
                  <div className={styles.reviewStars}>
                    {"★".repeat(review.rating)}
                    {"☆".repeat(5 - review.rating)}
                  </div>
                  <p className={styles.reviewText}>{review.comment}</p>
                </div>
              );
            })}
          </div>
        ) : (
          <div className={styles.noReviews}>
            <div className={styles.noReviewsIcon}>
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
              </svg>
            </div>
            <p>Aucun avis pour l'instant</p>
            <p>Soyez le premier à partager votre expérience !</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewSystem;