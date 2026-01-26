/**
 * Auth Guard - Include this ONLY on protected pages
 * Redirects unauthenticated or unapproved users
 */
(function() {
  'use strict';

  if (!window.SDP || !window.SDP.auth) {
    console.warn('Auth not loaded');
    return;
  }

  var auth = window.SDP.auth;

  auth.getSession().then(function(session) {
    if (!session) {
      // Not logged in - redirect to login
      var params = new URLSearchParams({ auth: 'required', redirect: window.location.pathname });
      window.location.assign('/?' + params.toString());
      return;
    }
    return auth.getProfile();
  }).then(function(profile) {
    if (!profile) return;
    // Check if user is approved (admins and bootstrap admins bypass this)
    if (profile.is_approved === false && !auth.isAdmin()) {
      window.location.assign('/pages/auth/pending.html');
    }
  }).catch(function(err) {
    console.warn('Auth guard error:', err);
  });
})();
