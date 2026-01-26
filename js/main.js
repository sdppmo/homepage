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
      item.addEventListener('click', function(e) {
        // KOSIS 메뉴는 특별 처리 (enableKosisMode 함수 호출)
        var text = this.textContent || this.innerText || '';
        if (text.includes('KOSIS') || text.includes('월평균가격')) {
          // enableKosisMode 함수가 정의되어 있으면 호출
          if (typeof window.enableKosisMode === 'function') {
            e.preventDefault();
            e.stopPropagation();
            window.enableKosisMode();
            return false;
          }
        }
        
        // 일반 네비게이션 항목 처리
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
