/**
 * Supabase Auth - Simplified
 * Only handles: session management, login/logout, profile fetching
 * Does NOT block navigation on public pages
 */
(function() {
  'use strict';

  var config = window.SDP_AUTH_CONFIG;
  if (!config || config.provider !== 'supabase') {
    return;
  }

  var SUPABASE_CDN = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js';
  var clientInstance = null;
  var clientPromise = null;
  var sessionCache = null;
  var profileCache = null;

  // Load Supabase SDK
  function loadSupabase() {
    if (window.supabase && window.supabase.createClient) {
      return Promise.resolve(window.supabase);
    }
    return new Promise(function(resolve, reject) {
      var script = document.createElement('script');
      script.src = SUPABASE_CDN;
      script.async = true;
      script.onload = function() { resolve(window.supabase); };
      script.onerror = function() { reject(new Error('Failed to load Supabase SDK')); };
      document.head.appendChild(script);
    });
  }

  // Abort 에러 감지 (태블릿 등에서 "Signal is aborted without reason" 발생 시 재시도용)
  function isAbortError(e) {
    if (!e) return false;
    var msg = (e.message || '').toString();
    return msg.indexOf('abort') !== -1 || msg.indexOf('Abort') !== -1 || e.name === 'AbortError';
  }

  // Get or create Supabase client
  function getClient() {
    if (clientPromise) return clientPromise;
    clientPromise = loadSupabase().then(function(lib) {
      clientInstance = lib.createClient(config.url, config.anonKey, {
        auth: { persistSession: true, autoRefreshToken: true }
      });
      // Sync session cache on auth state change
      clientInstance.auth.onAuthStateChange(function(event, session) {
        sessionCache = session;
        if (!session) profileCache = null;
      });
      // Load initial session
      return clientInstance.auth.getSession().then(function(result) {
        sessionCache = result.data ? result.data.session : null;
        return clientInstance;
      });
    }).catch(function(err) {
      if (isAbortError(err)) {
        clientPromise = null;
        clientInstance = null;
      }
      throw err;
    });
    return clientPromise;
  }

  // Get current session
  function getSession() {
    return getClient().then(function() {
      return sessionCache;
    });
  }

  // Get user profile from database
  function getProfile() {
    return getClient().then(function(client) {
      if (!sessionCache) return null;
      if (profileCache) return profileCache;
      return client
        .from('user_profiles')
        .select('id,email,business_name,business_number,phone,is_approved,role,access_beam,access_column,created_at')
        .eq('id', sessionCache.user.id)
        .maybeSingle()
        .then(function(result) {
          profileCache = result.data || null;
          return profileCache;
        });
    });
  }

  // Sign in with email/password
  function signInWithPassword(email, password) {
    return getClient().then(function(client) {
      return client.auth.signInWithPassword({ email: email, password: password });
    }).then(function(result) {
      if (result.error) throw result.error;
      sessionCache = result.data ? result.data.session : null;
      return getProfile().then(function(profile) {
        return { session: sessionCache, profile: profile };
      });
    });
  }

  // Sign out
  function logout() {
    // Helper to clear all auth storage (ensures logout even if server fails)
    function clearAuthStorage() {
      sessionCache = null;
      profileCache = null;
      // Clear Supabase localStorage entries
      Object.keys(localStorage).forEach(function(key) {
        if (key.includes('sb-') || key.includes('supabase')) {
          localStorage.removeItem(key);
        }
      });
    }
    
    return getClient().then(function(client) {
      return client.auth.signOut();
    }).then(function() {
      clearAuthStorage();
      window.location.assign('/');
    }).catch(function(err) {
      console.warn('SignOut server error, clearing local storage:', err.message);
      // Even if server signOut fails, clear local storage and redirect
      clearAuthStorage();
      window.location.assign('/');
    });
  }

  // Check if user is admin (based on database role only)
  function isAdmin() {
    return profileCache && profileCache.role === 'admin';
  }

  // Get user display label
  function getUserLabel() {
    if (profileCache && profileCache.business_name) return profileCache.business_name;
    if (sessionCache && sessionCache.user) return sessionCache.user.email;
    return null;
  }

  // Get access token (for API calls)
  function getAccessToken() {
    return sessionCache ? sessionCache.access_token : null;
  }

  // Clear cached profile (forces re-fetch on next getProfile call)
  function clearProfileCache() {
    profileCache = null;
    console.log('[Auth] Profile cache cleared');
  }

  // Force refresh session from Supabase
  function refreshSession() {
    return getClient().then(function(client) {
      profileCache = null; // Clear profile cache too
      return client.auth.getSession().then(function(result) {
        sessionCache = result.data ? result.data.session : null;
        console.log('[Auth] Session refreshed:', sessionCache ? 'valid' : 'none');
        return sessionCache;
      });
    });
  }

  // Debug: show current auth state in console
  function debug() {
    console.group('[Auth Debug]');
    console.log('Session:', sessionCache);
    console.log('Profile:', profileCache);
    console.log('Token expires:', sessionCache ? new Date(sessionCache.expires_at * 1000).toLocaleString() : 'N/A');
    console.log('User ID:', sessionCache?.user?.id || 'N/A');
    console.log('Email:', sessionCache?.user?.email || 'N/A');
    console.log('Is Admin:', isAdmin());
    console.log('localStorage keys:', Object.keys(localStorage).filter(function(k) { return k.includes('supabase'); }));
    console.groupEnd();
    return { session: sessionCache, profile: profileCache };
  }

  // Clear all auth data (nuclear option for debugging)
  function clearAll() {
    sessionCache = null;
    profileCache = null;
    // Clear Supabase localStorage entries
    Object.keys(localStorage).forEach(function(key) {
      if (key.includes('supabase') || key.includes('sb-')) {
        localStorage.removeItem(key);
        console.log('[Auth] Removed:', key);
      }
    });
    console.log('[Auth] All auth data cleared. Reload the page.');
  }

  // Expose API
  window.SDP = window.SDP || {};
  window.SDP.auth = {
    getClient: getClient,
    getSession: getSession,
    getProfile: getProfile,
    signInWithPassword: signInWithPassword,
    logout: logout,
    isAdmin: isAdmin,
    getUserLabel: getUserLabel,
    getAccessToken: getAccessToken,
    // Debug & cache management
    clearProfileCache: clearProfileCache,
    refreshSession: refreshSession,
    debug: debug,
    clearAll: clearAll
  };

  // Initialize on load
  getClient().catch(function() {
    // Silent init failure
  });
})();
