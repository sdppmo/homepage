/**
 * Login System
 * Demo mode - accepts any non-empty credentials
 * For production: integrate with backend auth (Firebase, etc.)
 */

(function() {
  'use strict';

  // Config
  var DEMO_MODE = true;

  // DOM refs
  var form = document.getElementById('loginForm');
  var status = document.getElementById('login-status');
  var userInput = document.getElementById('userId');
  var passInput = document.getElementById('password');
  var loginBtn = document.querySelector('.login-btn');

  if (!form) return;

  // Check existing session
  var saved = sessionStorage.getItem('loggedInUser');
  if (saved) showLoggedIn(saved);

  // Form submit
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    var user = userInput.value.trim();
    var pass = passInput.value;

    if (DEMO_MODE && user && pass) {
      sessionStorage.setItem('loggedInUser', user);
      showLoggedIn(user);
    } else {
      showError();
    }
  });

  // Show logged in state
  function showLoggedIn(user) {
    status.style.display = 'block';
    status.style.background = '#e8f5e9';
    status.style.color = '#2e7d32';
    status.innerHTML = '✅ <strong>' + user + '</strong>님 환영합니다! ' +
      '<button onclick="window.SDP.logout()" style="margin-left:10px;padding:2px 8px;cursor:pointer;">로그아웃</button>';
    userInput.disabled = true;
    passInput.disabled = true;
    loginBtn.disabled = true;
  }

  // Show error
  function showError() {
    status.style.display = 'block';
    status.style.background = '#ffebee';
    status.style.color = '#c62828';
    status.textContent = '❌ ID 또는 PW가 올바르지 않습니다.';
    setTimeout(function() { status.style.display = 'none'; }, 3000);
  }

  // Logout - exposed globally
  window.SDP = window.SDP || {};
  window.SDP.logout = function() {
    sessionStorage.removeItem('loggedInUser');
    status.style.display = 'none';
    userInput.disabled = false;
    passInput.disabled = false;
    userInput.value = '';
    passInput.value = '';
    loginBtn.disabled = false;
  };

})();
