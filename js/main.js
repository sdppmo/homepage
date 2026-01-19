/**
 * SongDoPartners Homepage
 * K-COL Steel Column Design Platform
 * 
 * Main entry point - initializes all modules
 * Modules are self-contained IIFEs that run on load
 * 
 * Load order:
 * 1. main.js   - Navigation, global setup
 * 2. login.js  - Login form handling
 * 3. clocks.js - World clocks (50ms tick)
 * 4. modal.js  - Project selection modal
 */

(function() {
  'use strict';

  // Navigation: toggle active state on click
  function initNavigation() {
    var items = document.querySelectorAll('.nav-item');
    items.forEach(function(item) {
      item.addEventListener('click', function() {
        items.forEach(function(i) { i.classList.remove('active'); });
        this.classList.add('active');
      });
    });
  }

  // Init on DOM ready
  function init() {
    initNavigation();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
