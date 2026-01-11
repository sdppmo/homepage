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

  /**
   * Initialize login form
   * Handles form submission
   */
  function initLoginForm() {
    const loginForm = document.getElementById('loginForm');
    
    if (loginForm) {
      loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const userId = this.querySelector('input[name="userId"]').value;
        const password = this.querySelector('input[name="password"]').value;
        
        if (!userId || !password) {
          alert('ID와 비밀번호를 입력해주세요.');
          return;
        }
        
        // TODO: Connect to backend API
        alert('로그인 기능은 백엔드 연동 후 사용 가능합니다.');
      });
    }
  }

  /**
   * Initialize all modules when DOM is ready
   */
  function init() {
    initNavigation();
    initLoginForm();
  }

  // Run init when DOM is fully loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
