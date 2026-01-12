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
   * Initialize world clocks
   * Shows Indonesia (WIB, UTC+7) and New York (EST, UTC-5) time
   */
  function initWorldClocks() {
    // Get all clock elements
    var hourIndonesia = document.getElementById('hour-indonesia');
    var minuteIndonesia = document.getElementById('minute-indonesia');
    var secondIndonesia = document.getElementById('second-indonesia');
    var hourNewyork = document.getElementById('hour-newyork');
    var minuteNewyork = document.getElementById('minute-newyork');
    var secondNewyork = document.getElementById('second-newyork');
    
    // Check if elements exist
    if (!hourIndonesia || !hourNewyork) {
      console.log('Clock elements not found');
      return;
    }
    
    function updateClocks() {
      var now = new Date();
      
      // Indonesia time (UTC+7, WIB Jakarta)
      var utc = now.getTime() + (now.getTimezoneOffset() * 60000);
      var indonesiaTime = new Date(utc + (7 * 3600000));
      
      // New York time (UTC-5, EST)
      var nyTime = new Date(utc + (-5 * 3600000));
      
      // Update Indonesia clock
      setHands(indonesiaTime, hourIndonesia, minuteIndonesia, secondIndonesia);
      
      // Update New York clock
      setHands(nyTime, hourNewyork, minuteNewyork, secondNewyork);
    }
    
    function setHands(time, hourEl, minuteEl, secondEl) {
      var hours = time.getHours();
      var minutes = time.getMinutes();
      var seconds = time.getSeconds();
      var milliseconds = time.getMilliseconds();
      
      // Smooth second hand movement
      var secondDeg = (seconds * 6) + (milliseconds * 0.006);
      var minuteDeg = (minutes * 6) + (seconds * 0.1);
      var hourDeg = ((hours % 12) * 30) + (minutes * 0.5);
      
      hourEl.style.transform = 'rotate(' + hourDeg + 'deg)';
      minuteEl.style.transform = 'rotate(' + minuteDeg + 'deg)';
      secondEl.style.transform = 'rotate(' + secondDeg + 'deg)';
    }
    
    // Initial update
    updateClocks();
    
    // Update every 50ms for smooth second hand
    setInterval(updateClocks, 50);
  }

  /**
   * Initialize all modules when DOM is ready
   */
  function init() {
    initNavigation();
    initLoginForm();
    initWorldClocks();
  }

  // Run init when DOM is fully loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
