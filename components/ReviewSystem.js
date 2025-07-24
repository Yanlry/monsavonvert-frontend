// components/ReviewSystem.js
// Composant pour gérer les avis avec authentification et suppression
import React, { useState, useEffect, useContext, useCallback } from 'react';
import { UserContext } from '../context/UserContext';
import styles from '../styles/reviewSystem.module.css';

// ========================
// HELPER FUNCTIONS
// ========================

/**
 * Crée un objet Review à partir de la réponse API
 * Gère différents formats de réponse possible
 * @param {Object} data - Réponse de l'API
 * @param {Object} user - Utilisateur authentifié
 * @param {Object} formData - Données du formulaire (rating, comment)
 * @returns {Object} Nouvel avis formaté
 */
const createReviewFromResponse = (data, user, formData) => {
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
  // (à utiliser seulement si aucune des structures précédentes ne fonctionne)
  console.warn('⚠️ Structure de réponse non reconnue, création d\'un avis avec ID temporaire');
  return {
    _id: `temp_${Date.now()}`, // ID temporaire
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
 * Vérifie si un utilisateur peut supprimer un avis
 * @param {Object|null} user - Utilisateur authentifié
 * @param {string} reviewUserId - ID de l'utilisateur qui a créé l'avis
 * @returns {boolean} True si l'utilisateur peut supprimer l'avis
 */
const canUserDeleteReview = (user, reviewUserId) => {
  if (!user) return false;
  return (
    user.role === 'admin' || 
    reviewUserId === user._id || 
    reviewUserId === user.userId
  );
};

// ========================
// MAIN COMPONENT
// ========================

/**
 * ReviewSystem: Composant pour gérer les avis produits
 * - Authentification requise pour commenter
 * - Suppression pour l'auteur et les admins
 * - Interface utilisateur intuitive
 * - Gestion robuste des erreurs
 * 
 * @param {Object} props - Props du composant
 * @param {string} props.productId - ID du produit
 * @param {Array} props.initialReviews - Avis initiaux (optionnel)
 */
const ReviewSystem = ({ productId, initialReviews = [] }) => {
  const { user } = useContext(UserContext);
  
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
  // DEBUG LOGGING
  // ========================
  
  console.log('🔍 ReviewSystem - État utilisateur:', user);
  console.log('📝 ReviewSystem - Avis actuels:', reviews);

  // ========================
  // EVENT HANDLERS
  // ========================

  /**
   * Soumission d'un nouvel avis
   * Nécessite une authentification et gère différents formats de réponse
   * 
   * DEBUGGING: Si vous obtenez "Champs obligatoires manquants":
   * 1. Regardez les logs de la console pour voir la structure exacte envoyée
   * 2. Comparez avec ce que votre API backend attend
   * 3. Modifiez les noms des champs dans 'requestBody' selon votre API
   * 4. Exemple: si votre API attend 'review_rating' au lieu de 'rating',
   *    changez 'rating: parseInt(rating, 10)' en 'review_rating: parseInt(rating, 10)'
   * 
   * @param {Event} e - Événement de soumission du formulaire
   */
  const handleSubmitReview = useCallback(async (e) => {
    e.preventDefault();
    console.log('📝 Tentative de soumission d\'avis');

    // Vérification de l'authentification
    if (!user || !user.token) {
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

    // Validation des données utilisateur (ajout)
    if (!user.firstName || !user.lastName) {
      console.error('❌ Données utilisateur incomplètes:', {
        firstName: user.firstName,
        lastName: user.lastName,
        userId: user._id || user.userId
      });
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
      
      // Debugging complet des données utilisateur
      console.log('🔍 DEBUG - User object complet:', JSON.stringify(user, null, 2));
      console.log('🔍 DEBUG - Form data:', { rating, comment });
      console.log('🔍 DEBUG - Product ID:', productId);

      const requestBody = {
        // Format principal
        rating: parseInt(rating, 10),
        comment: comment.trim(),
        firstName: user.firstName,
        lastName: user.lastName,
        userId: user._id || user.userId,
        
        // Formats alternatifs que l'API pourrait attendre
        user: `${user.firstName} ${user.lastName}`, // Nom complet
        authorId: user._id || user.userId, // Alternative userId
        author: user._id || user.userId, // Autre alternative
        user_id: user._id || user.userId, // Format snake_case
        productId: productId, // Au cas où le serveur l'attend dans le body
        product_id: productId, // Format snake_case
        
        // Données utilisateur complètes (au cas où l'API en a besoin)
        userInfo: {
          id: user._id || user.userId,
          firstName: user.firstName,
          lastName: user.lastName,
          fullName: `${user.firstName} ${user.lastName}`
        }
      };
      
      console.log('📤 Corps de la requête COMPLET:', JSON.stringify(requestBody, null, 2));
      console.log('📤 URL de la requête:', `${API_URL}/products/${productId}/review`);
      console.log('📤 Headers:', {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${user.token.substring(0, 20)}...` // Log partiel du token pour sécurité
      });

      const response = await fetch(`${API_URL}/products/${productId}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify(requestBody),
      });

      console.log('📨 Status de la réponse:', response.status);
      console.log('📨 Status text:', response.statusText);
      
      const data = await response.json();
      console.log('📦 Réponse du serveur (structure complète):', JSON.stringify(data, null, 2));

      if (!response.ok) {
        // Debugging détaillé de l'erreur
        console.error('❌ Erreur serveur détaillée:');
        console.error('   - Status:', response.status);
        console.error('   - Status Text:', response.statusText);
        console.error('   - Response data:', JSON.stringify(data, null, 2));
        
        // Messages d'erreur plus spécifiques selon le problème
        let errorMessage = data.error || 'Erreur lors de l\'ajout de l\'avis';
        
        if (data.error && data.error.includes('obligatoires')) {
          errorMessage += `

🔧 DEBUGGING: Il semble que le serveur attend des champs différents.
Vérifiez les logs de la console pour voir ce qui est envoyé vs ce qui est attendu.

Champs envoyés: rating, comment, firstName, lastName, userId, user, authorId, productId
Si votre API attend d'autres noms de champs, modifiez le requestBody dans le code.`;
        }
        
        throw new Error(errorMessage);
      }

      // Créer le nouvel avis en gérant différents formats de réponse
      const newReview = createReviewFromResponse(data, user, reviewForm);
      console.log('✅ Nouvel avis créé:', newReview);

      // Ajouter le nouvel avis à la liste
      setReviews(prevReviews => [newReview, ...prevReviews]);
      
      // Réinitialiser le formulaire
      setReviewForm({ rating: '', comment: '' });
      setSuccess('Votre avis a été ajouté avec succès !');

    } catch (err) {
      console.error('❌ Erreur lors de l\'ajout de l\'avis:', err);
      const errorMessage = err instanceof Error ? err.message : 'Une erreur inattendue s\'est produite';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [user, reviewForm, productId, API_URL]);

  /**
   * Suppression d'un avis
   * Autorisée pour l'auteur et les admins
   * @param {string} reviewId - ID de l'avis à supprimer
   * @param {string} reviewUserId - ID de l'utilisateur qui a créé l'avis
   */
  const handleDeleteReview = useCallback(async (reviewId, reviewUserId) => {
    console.log('🗑️ Tentative de suppression d\'avis');
    console.log('🔍 Review ID:', reviewId);
    console.log('🔍 Review User ID:', reviewUserId);
    console.log('🔍 Current User:', user);

    // Vérification de l'authentification
    if (!user || !user.token) {
      console.error('❌ Utilisateur non connecté');
      setError('Vous devez être connecté pour effectuer cette action.');
      return;
    }

    // Vérification des droits de suppression
    const canDelete = canUserDeleteReview(user, reviewUserId);
    
    console.log('🔐 Droits de suppression:', {
      isAdmin: user.role === 'admin',
      isAuthor: reviewUserId === user._id || reviewUserId === user.userId,
      canDelete
    });

    if (!canDelete) {
      console.error('❌ Droits insuffisants');
      setError('Vous n\'avez pas les droits pour supprimer cet avis.');
      return;
    }

    // Confirmation de suppression
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet avis ?')) {
      console.log('❌ Suppression annulée par l\'utilisateur');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      console.log('🚀 Envoi de la demande de suppression...');
      const response = await fetch(`${API_URL}/products/${productId}/review/${reviewId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });

      const data = await response.json();
      console.log('📦 Réponse de suppression:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la suppression de l\'avis');
      }

      // Retirer l'avis de la liste
      setReviews(prevReviews => prevReviews.filter(review => review._id !== reviewId));
      setSuccess('Avis supprimé avec succès !');
      console.log('✅ Avis supprimé localement');

    } catch (err) {
      console.error('❌ Erreur lors de la suppression:', err);
      const errorMessage = err instanceof Error ? err.message : 'Une erreur inattendue s\'est produite';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [user, productId, API_URL]);

  /**
   * Gestionnaire de changement pour le formulaire
   * @param {string} field - Nom du champ
   * @param {string} value - Nouvelle valeur
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
      {user && user.token ? (
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
              <small className={styles.charCount}>
                {reviewForm.comment.length}/1000 caractères
              </small>
            </div>

            {/* Bouton de soumission */}
            <div className={styles.formActions}>
              <button
                type="submit"
                className={styles.submitReviewButton}
                disabled={loading}
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
                    Publier mon avis
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
            {reviews.map((review) => (
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
                  {canUserDeleteReview(user, review.userId) && (
                    <button
                      onClick={() => handleDeleteReview(review._id, review.userId)}
                      className={styles.deleteButton}
                      disabled={loading}
                      title={user?.role === 'admin' ? 'Supprimer (Admin)' : 'Supprimer mon avis'}
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
            ))}
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