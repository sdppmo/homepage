/**
 * SongDoPartners Homepage JavaScript
 * K-COL Steel Column Design Platform
 * 
 * Modules:
 * - Navigation Handler
 * - Login Form Handler
 */

(function() {
  'use strict';

  /**
   * Initialize navigation menu
   * Handles active state toggling for nav items
   */
  function initNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(function(item) {
      item.addEventListener('click', function() {
        // Remove active class from all items
        navItems.forEach(function(navItem) {
          navItem.classList.remove('active');
        });
        // Add active class to clicked item
        this.classList.add('active');
      });
    });
  }

  // Login form is handled by inline script in index.html
  // This ensures proper sessionStorage-based demo login functionality

  // World clocks are handled by inline script in index.html
  // This ensures immediate execution without waiting for main.js to load

  /**
   * Initialize all modules when DOM is ready
   */
  function init() {
    initNavigation();
  }

  // Run init when DOM is fully loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
