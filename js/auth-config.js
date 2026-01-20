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
    adminEmails: ['samhskim1@gmail.com'],
    protectedPaths: [
      '/pages/k-col web software/',
      '/pages/K-product/2H_steel_product.html',
      '/pages/admin.html'
    ]
  };
})();
