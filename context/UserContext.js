// context/UserContext.js (Version améliorée compatible avec vos routes backend)
import { createContext, useState, useEffect, useCallback } from "react";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true); // AJOUT : État de chargement
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  // AMÉLIORATION : Fonction pour récupérer TOUTES les données utilisateur depuis le stockage
  const restoreUserFromStorage = useCallback(() => {
    console.log('🔄 Restauration utilisateur depuis le stockage...');
    
    try {
      let userData = localStorage.getItem("user");
      let token = localStorage.getItem("token");
      let userId = localStorage.getItem("userId");
      let firstName = localStorage.getItem("firstName");
      let role = localStorage.getItem("role");
      let userEmail = localStorage.getItem("userEmail");
      
      // Si pas dans localStorage, essayer sessionStorage
      if (!userData || !token) {
        console.log('🔍 Tentative sessionStorage...');
        userData = sessionStorage.getItem("user");
        token = sessionStorage.getItem("token");
        userId = sessionStorage.getItem("userId");
        firstName = sessionStorage.getItem("firstName");
        role = sessionStorage.getItem("role");
        userEmail = sessionStorage.getItem("userEmail");
      }

      // Si on trouve des données utilisateur complètes (nouveau format)
      if (userData) {
        try {
          const parsedUser = JSON.parse(userData);
          console.log('✅ Données utilisateur complètes trouvées:', {
            id: parsedUser._id || parsedUser.userId,
            firstName: parsedUser.firstName,
            lastName: parsedUser.lastName,
            email: parsedUser.email,
            hasToken: !!parsedUser.token
          });
          setUser(parsedUser);
          return parsedUser;
        } catch (parseError) {
          console.error('❌ Erreur parsing userData:', parseError);
        }
      }
      
      // Sinon, utiliser l'ancien format (comme votre code actuel)
      if (token && userId && firstName) {
        console.log('✅ Données utilisateur basiques trouvées (ancien format)');
        const basicUser = { 
          token, 
          userId, 
          firstName,
          // AJOUT : Récupérer les autres champs si disponibles
          role: role || 'user',
          email: userEmail || '',
          _id: userId // Pour compatibilité
        };
        
        setUser(basicUser);
        
        // AMÉLIORATION : Essayer de récupérer les données complètes depuis l'API
        fetchCompleteUserData(userId, token);
        
        return basicUser;
      }
    } catch (error) {
      console.error('❌ Erreur lors de la restauration:', error);
    }
    
    return null;
  }, []);

  // NOUVEAU : Fonction pour récupérer les données complètes depuis l'API
  const fetchCompleteUserData = useCallback(async (userId, token) => {
    try {
      console.log('🔍 Récupération données complètes utilisateur...');
      
      const response = await fetch(`${API_URL}/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.result && data.user) {
          console.log('✅ Données complètes récupérées depuis l\'API');
          
          // Créer l'objet utilisateur complet
          const completeUser = {
            _id: data.user._id,
            userId: data.user._id,
            token: token,
            firstName: data.user.firstName || "",
            lastName: data.user.lastName || "",
            email: data.user.email || "",
            role: data.user.role || "user",
            phone: data.user.phone || "",
            address: data.user.addresses?.[0]?.street || "",
            city: data.user.addresses?.[0]?.city || "",
            postalCode: data.user.addresses?.[0]?.postalCode || "",
            country: data.user.addresses?.[0]?.country || "France",
            addresses: data.user.addresses || []
          };

          // Mettre à jour l'état
          setUser(completeUser);
          
          // Sauvegarder les données complètes
          const usingLocalStorage = localStorage.getItem("token") !== null;
          const storage = usingLocalStorage ? localStorage : sessionStorage;
          
          storage.setItem("user", JSON.stringify(completeUser));
          storage.setItem("userEmail", completeUser.email);
          // Garder aussi l'ancien format pour compatibilité
          storage.setItem("userId", completeUser._id);
          storage.setItem("firstName", completeUser.firstName);
          storage.setItem("role", completeUser.role);
          
          return completeUser;
        }
      } else if (response.status === 403 || response.status === 401) {
        console.log('❌ Token invalide détecté, nettoyage...');
        clearUserData();
      }
    } catch (error) {
      console.error('❌ Erreur récupération données complètes:', error);
    }
    
    return null;
  }, [API_URL]);

  // NOUVEAU : Fonction pour valider un token en utilisant votre route /me
  const validateToken = useCallback(async (token) => {
    if (!token) return false;

    try {
      console.log('🔍 Validation du token avec /users/me...');
      
      // Utiliser votre route /me existante
      const response = await fetch(`${API_URL}/users/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const isValid = response.ok;
      console.log(`Token ${isValid ? 'valide ✅' : 'invalide ❌'}`);
      
      if (isValid) {
        // Si le token est valide, on peut aussi récupérer les données utilisateur mises à jour
        try {
          const data = await response.json();
          if (data.result && data.user) {
            console.log('✅ Données utilisateur mises à jour depuis /me');
            // On pourrait mettre à jour l'utilisateur ici si nécessaire
          }
        } catch (parseError) {
          console.log('⚠️ Token valide mais erreur parsing réponse /me');
        }
      }
      
      return isValid;
    } catch (error) {
      console.error('❌ Erreur validation token:', error);
      return false;
    }
  }, [API_URL]);

  // NOUVEAU : Fonction pour nettoyer toutes les données utilisateur
  const clearUserData = useCallback(() => {
    console.log('🧹 Nettoyage des données utilisateur');
    
    // Nettoyer localStorage
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("firstName");
    localStorage.removeItem("role");
    localStorage.removeItem("userEmail");
    
    // Nettoyer sessionStorage
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("userId");
    sessionStorage.removeItem("firstName");
    sessionStorage.removeItem("role");
    sessionStorage.removeItem("userEmail");
    
    setUser(null);
  }, []);

  // NOUVEAU : Fonction pour effectuer des requêtes authentifiées avec retry automatique
  const authenticatedFetch = useCallback(async (url, options = {}) => {
    console.log('🌐 Requête authentifiée vers:', url);
    
    if (!user || !user.token) {
      throw new Error('Aucun token d\'authentification disponible');
    }

    // Préparer les headers
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${user.token}`,
      ...options.headers
    };

    // Première tentative
    let response = await fetch(url, {
      ...options,
      headers
    });

    // Si le token est invalide, essayer de récupérer un token frais
    if (response.status === 403 || response.status === 401) {
      console.log('⚠️ Token expiré, tentative de récupération...');
      
      // Vérifier si le token est encore valide selon notre validation
      const isTokenValid = await validateToken(user.token);
      
      if (!isTokenValid) {
        // Essayer de récupérer des données fraîches depuis le stockage
        const restoredUser = restoreUserFromStorage();
        
        if (restoredUser && restoredUser.token && restoredUser.token !== user.token) {
          console.log('🔄 Nouveau token trouvé, nouvelle tentative...');
          
          // Retry avec le nouveau token
          response = await fetch(url, {
            ...options,
            headers: {
              ...headers,
              'Authorization': `Bearer ${restoredUser.token}`
            }
          });
        }
        
        // Si ça ne marche toujours pas, token vraiment invalide
        if (response.status === 403 || response.status === 401) {
          console.log('❌ Token définitivement invalide');
          clearUserData();
          throw new Error('Session expirée. Veuillez vous reconnecter.');
        }
      }
    }

    return response;
  }, [user, validateToken, restoreUserFromStorage, clearUserData]);

  // AMÉLIORATION : Fonction setUser qui persiste automatiquement
  const updateUser = useCallback((userData, rememberMe = true) => {
    console.log('💾 Mise à jour utilisateur avec persistance');
    
    setUser(userData);
    
    if (userData && typeof window !== 'undefined') {
      const storage = rememberMe ? localStorage : sessionStorage;
      
      // Sauvegarder le format complet
      storage.setItem("user", JSON.stringify(userData));
      storage.setItem("token", userData.token);
      storage.setItem("userId", userData._id || userData.userId);
      storage.setItem("firstName", userData.firstName || '');
      storage.setItem("role", userData.role || 'user');
      storage.setItem("userEmail", userData.email || '');
      
      console.log('✅ Données persistées dans', rememberMe ? 'localStorage' : 'sessionStorage');
    }
  }, []);

  // Initialisation au chargement (votre logique existante améliorée)
  useEffect(() => {
    const initAuth = async () => {
      setAuthLoading(true);
      
      console.log('🚀 Initialisation authentification...');
      const restoredUser = restoreUserFromStorage();
      
      // Si on a un utilisateur avec token, vérifier sa validité
      if (restoredUser && restoredUser.token) {
        const isValid = await validateToken(restoredUser.token);
        if (!isValid) {
          console.log('❌ Token invalide au démarrage, nettoyage');
          clearUserData();
        }
      }
      
      setAuthLoading(false);
    };

    initAuth();
  }, [restoreUserFromStorage, validateToken, clearUserData]); // Dépendances ajoutées

  // NOUVEAU : Vérification périodique du token (optionnel)
  useEffect(() => {
    if (user && user.token) {
      // Vérifier le token toutes les 15 minutes
      const tokenCheckInterval = setInterval(async () => {
        const isValid = await validateToken(user.token);
        if (!isValid) {
          console.log('❌ Token expiré détecté lors de la vérification périodique');
          clearUserData();
        }
      }, 15 * 60 * 1000); // 15 minutes

      return () => clearInterval(tokenCheckInterval);
    }
  }, [user, validateToken, clearUserData]);

  return (
    <UserContext.Provider value={{ 
      user, 
      setUser: updateUser, // Version améliorée avec persistance
      authLoading, // NOUVEAU
      authenticatedFetch, // NOUVEAU
      validateToken, // NOUVEAU
      clearUserData, // NOUVEAU
      isAuthenticated: !!(user && user.token) // NOUVEAU
    }}>
      {children}
    </UserContext.Provider>
  );
};