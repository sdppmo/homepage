/**
 * Authentication configuration (Supabase)
 * NOTE: These values are safe to expose in the frontend.
 */
(function() {
  'use strict';

  window.SDP_AUTH_CONFIG = {
    provider: 'supabase',
    url: 'https://iwudkwhafyrhgzuntdgm.supabase.co',
    anonKey: 'sb_publishable_6GvHywiSQrcVXGapyPwvBA_lh2A76OW',
    // Admin is determined by user_profiles.role = 'admin' in database
    protectedPaths: [
      '/pages/k-col web software/',
      '/pages/K-product/2H_steel_product.html',
      '/pages/admin.html'
    ]
  };
})();
