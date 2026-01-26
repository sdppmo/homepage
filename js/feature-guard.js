/**
 * Feature Guard - Permission-based access control
 * Pages are publicly viewable, but protected features require login + permission
 * 
 * Usage:
 * 1. Add data-requires="column" or data-requires="beam" to protected buttons/links
 * 2. Include this script after auth.js
 * 3. Protected elements will show login/permission prompt when clicked
 */
(function() {
  'use strict';

  // Wait for auth to be ready (with timeout)
  var authWaitAttempts = 0;
  var maxAuthWaitAttempts = 50; // 5 seconds max
  
  function waitForAuth(callback) {
    if (window.SDP && window.SDP.auth) {
      callback();
    } else {
      authWaitAttempts++;
      if (authWaitAttempts >= maxAuthWaitAttempts) {
        console.warn('Feature guard: Auth not available after 5s, proceeding without auth');
        // Create a fallback auth stub
        window.SDP = window.SDP || {};
        window.SDP.auth = {
          getSession: function() { return Promise.resolve(null); },
          getProfile: function() { return Promise.resolve(null); },
          isAdmin: function() { return false; }
        };
        callback();
      } else {
        setTimeout(function() { waitForAuth(callback); }, 100);
      }
    }
  }

  waitForAuth(function() {
    var auth = window.SDP.auth;

    // Permission check
    function hasPermission(type) {
      return auth.getSession().then(function(session) {
        if (!session) {
          console.log('[FeatureGuard] No session');
          return { logged: false, permitted: false };
        }
        return auth.getProfile().then(function(profile) {
          if (!profile) {
            console.log('[FeatureGuard] No profile');
            return { logged: true, permitted: false };
          }
          if (!profile.is_approved && !auth.isAdmin()) {
            console.log('[FeatureGuard] Not approved');
            return { logged: true, approved: false, permitted: false };
          }
          var permitted = false;
          if (type === 'column') permitted = profile.access_column === true;
          if (type === 'beam') permitted = profile.access_beam === true;
          if (auth.isAdmin()) permitted = true; // Admins have all access
          console.log('[FeatureGuard] Check "' + type + '":', permitted ? 'GRANTED' : 'DENIED', profile);
          return { logged: true, approved: true, permitted: permitted };
        });
      });
    }

    // Show info/alert modal (for "coming soon" etc.)
    function showInfoModal(message) {
      var existingModal = document.getElementById('feature-guard-modal');
      if (existingModal) existingModal.remove();

      var modal = document.createElement('div');
      modal.id = 'feature-guard-modal';
      modal.innerHTML = '\
        <div class="fg-overlay">\
          <div class="fg-modal">\
            <div class="fg-icon">🚧</div>\
            <h3>안내</h3>\
            <p>' + message.replace(/\n/g, '<br>') + '</p>\
            <button class="fg-btn">확인</button>\
          </div>\
        </div>\
      ';

      var style = document.createElement('style');
      style.textContent = '\
        .fg-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 99999; -webkit-backdrop-filter: blur(4px); backdrop-filter: blur(4px); }\
        .fg-modal { background: #1e2642; border-radius: 12px; padding: 28px 32px; max-width: 380px; text-align: center; box-shadow: 0 20px 50px rgba(0,0,0,0.5); }\
        .fg-icon { font-size: 48px; margin-bottom: 12px; }\
        .fg-modal h3 { color: #fff; font-size: 20px; margin: 0 0 12px; }\
        .fg-modal p { color: #9ca3af; font-size: 14px; line-height: 1.6; margin: 0 0 24px; }\
        .fg-btn { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #fff; border: none; padding: 12px 28px; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; transition: transform 0.2s; }\
        .fg-btn:hover { transform: translateY(-2px); }\
      ';
      document.head.appendChild(style);
      document.body.appendChild(modal);

      modal.querySelector('.fg-btn').addEventListener('click', function() {
        modal.remove();
      });
      modal.querySelector('.fg-overlay').addEventListener('click', function(e) {
        if (e.target === this) modal.remove();
      });
    }

    // Show access denied modal
    function showAccessModal(type, status) {
      var existingModal = document.getElementById('feature-guard-modal');
      if (existingModal) existingModal.remove();

      var title, message, buttonText, buttonAction;

      if (!status.logged) {
        title = '로그인 필요';
        message = '이 기능을 사용하려면 로그인이 필요합니다.';
        buttonText = '로그인하기';
        buttonAction = function() {
          window.location.assign('/?auth=required&redirect=' + encodeURIComponent(window.location.pathname));
        };
      } else if (!status.approved) {
        title = '승인 대기 중';
        message = '계정 승인 후 이 기능을 사용할 수 있습니다.';
        buttonText = '확인';
        buttonAction = function() { modal.remove(); };
      } else {
        title = '권한 없음';
        var featureName = type === 'column' ? 'Cross-H Column' : 'Beam';
        message = featureName + ' 기능 사용 권한이 없습니다.\n관리자에게 권한을 요청하세요.';
        buttonText = '확인';
        buttonAction = function() { modal.remove(); };
      }

      var modal = document.createElement('div');
      modal.id = 'feature-guard-modal';
      modal.innerHTML = '\
        <div class="fg-overlay">\
          <div class="fg-modal">\
            <h3>' + title + '</h3>\
            <p>' + message.replace(/\n/g, '<br>') + '</p>\
            <button class="fg-btn">' + buttonText + '</button>\
          </div>\
        </div>\
      ';

      var style = document.createElement('style');
      style.textContent = '\
        .fg-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 99999; -webkit-backdrop-filter: blur(4px); backdrop-filter: blur(4px); }\
        .fg-modal { background: #1e2642; border-radius: 12px; padding: 28px 32px; max-width: 380px; text-align: center; box-shadow: 0 20px 50px rgba(0,0,0,0.5); }\
        .fg-modal h3 { color: #fff; font-size: 20px; margin: 0 0 12px; }\
        .fg-modal p { color: #9ca3af; font-size: 14px; line-height: 1.6; margin: 0 0 24px; }\
        .fg-btn { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #fff; border: none; padding: 12px 28px; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; transition: transform 0.2s; }\
        .fg-btn:hover { transform: translateY(-2px); }\
      ';
      document.head.appendChild(style);
      document.body.appendChild(modal);

      modal.querySelector('.fg-btn').addEventListener('click', buttonAction);
      modal.querySelector('.fg-overlay').addEventListener('click', function(e) {
        if (e.target === this) modal.remove();
      });
    }

    // Execute data-onclick without using eval (CSP-safe)
    function executeOnclick(onclickStr) {
      if (!onclickStr) return false;
      
      // Handle window.location.href = '...'
      var hrefMatch = onclickStr.match(/window\.location\.href\s*=\s*['"]([^'"]+)['"]/);
      if (hrefMatch) {
        window.location.href = hrefMatch[1];
        return true;
      }
      
      // Handle window.location.assign('...')
      var assignMatch = onclickStr.match(/window\.location\.assign\s*\(\s*['"]([^'"]+)['"]\s*\)/);
      if (assignMatch) {
        window.location.assign(assignMatch[1]);
        return true;
      }
      
      // Handle alert('...') - show as nice modal
      var alertMatch = onclickStr.match(/alert\s*\(\s*['"]([^'"]+)['"]\s*\)/);
      if (alertMatch) {
        showInfoModal(alertMatch[1]);
        return true;
      }
      
      // Handle global function calls like functionName() or functionName(args)
      var funcMatch = onclickStr.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\s*\((.*)\)\s*;?\s*$/);
      if (funcMatch) {
        var funcName = funcMatch[1];
        var funcArgs = funcMatch[2].trim();
        if (typeof window[funcName] === 'function') {
          console.log('[FeatureGuard] Calling function:', funcName);
          if (funcArgs === '') {
            window[funcName]();
          } else {
            // For simple string/number args, try to parse
            try {
              var args = funcArgs.split(',').map(function(arg) {
                arg = arg.trim();
                // Remove quotes for string args
                if ((arg.startsWith("'") && arg.endsWith("'")) || (arg.startsWith('"') && arg.endsWith('"'))) {
                  return arg.slice(1, -1);
                }
                // Try to parse as number
                var num = parseFloat(arg);
                if (!isNaN(num)) return num;
                // Return as-is (might be a variable reference, won't work)
                return arg;
              });
              window[funcName].apply(window, args);
            } catch (e) {
              console.warn('[FeatureGuard] Failed to parse args, calling without:', e);
              window[funcName]();
            }
          }
          return true;
        }
        console.warn('[FeatureGuard] Function not found:', funcName);
      }
      
      console.warn('Feature guard: Unhandled onclick action:', onclickStr);
      return false;
    }

    // Check if user is logged in (no specific permission needed)
    function isLoggedIn() {
      return auth.getSession().then(function(session) {
        return !!session;
      });
    }

    // Show login required modal
    function showLoginModal() {
      var existingModal = document.getElementById('feature-guard-modal');
      if (existingModal) existingModal.remove();

      var modal = document.createElement('div');
      modal.id = 'feature-guard-modal';
      modal.innerHTML = '\
        <div class="fg-overlay">\
          <div class="fg-modal">\
            <div class="fg-icon">🔒</div>\
            <h3>로그인 필요</h3>\
            <p>이 기능을 사용하려면 로그인이 필요합니다.</p>\
            <div class="fg-btn-group">\
              <button class="fg-btn primary" id="fg-login-btn">로그인</button>\
              <button class="fg-btn secondary" id="fg-signup-btn">회원가입</button>\
            </div>\
          </div>\
        </div>\
      ';

      var style = document.createElement('style');
      style.textContent = '\
        .fg-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 99999; -webkit-backdrop-filter: blur(4px); backdrop-filter: blur(4px); }\
        .fg-modal { background: #1e2642; border-radius: 12px; padding: 28px 32px; max-width: 380px; text-align: center; box-shadow: 0 20px 50px rgba(0,0,0,0.5); }\
        .fg-icon { font-size: 48px; margin-bottom: 12px; }\
        .fg-modal h3 { color: #fff; font-size: 20px; margin: 0 0 12px; }\
        .fg-modal p { color: #9ca3af; font-size: 14px; line-height: 1.6; margin: 0 0 24px; }\
        .fg-btn-group { display: flex; gap: 12px; justify-content: center; }\
        .fg-btn { border: none; padding: 12px 24px; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; transition: transform 0.2s; }\
        .fg-btn.primary { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #fff; }\
        .fg-btn.secondary { background: rgba(100, 116, 139, 0.3); color: #cbd5e1; }\
        .fg-btn:hover { transform: translateY(-2px); }\
      ';
      document.head.appendChild(style);
      document.body.appendChild(modal);

      modal.querySelector('#fg-login-btn').addEventListener('click', function() {
        window.location.assign('/pages/auth/login.html?redirect=' + encodeURIComponent(window.location.pathname));
      });
      modal.querySelector('#fg-signup-btn').addEventListener('click', function() {
        window.location.assign('/pages/auth/signup.html');
      });
      modal.querySelector('.fg-overlay').addEventListener('click', function(e) {
        if (e.target === this) modal.remove();
      });
    }

    // Attach guards to protected elements
    function attachGuards() {
      // Handle login-only guards (data-requires-auth="true")
      var authElements = document.querySelectorAll('[data-requires-auth="true"]');
      
      authElements.forEach(function(el) {
        el.addEventListener('click', function(e) {
          e.preventDefault();
          e.stopPropagation();
          
          isLoggedIn().then(function(logged) {
            if (logged) {
              // Logged in - proceed with original action
              var href = el.getAttribute('href');
              if (href && href !== '#') {
                window.location.href = href;
              }
            } else {
              showLoginModal();
            }
          }).catch(function(err) {
            console.error('Auth guard error:', err);
            showLoginModal();
          });
        }, true);
      });

      // Handle permission-based guards (data-requires="column" etc.)
      var protectedElements = document.querySelectorAll('[data-requires]');
      
      protectedElements.forEach(function(el) {
        var requiredPermission = el.getAttribute('data-requires');
        
        el.addEventListener('click', function(e) {
          e.preventDefault();
          e.stopPropagation();
          
          hasPermission(requiredPermission).then(function(status) {
            if (status.permitted) {
              // Has permission - proceed with original action
              var href = el.getAttribute('href');
              var onclick = el.getAttribute('data-onclick');
              
              if (href && href !== '#') {
                window.location.href = href;
              } else if (onclick) {
                executeOnclick(onclick);
              } else {
                // Remove guard temporarily and re-click
                el.removeAttribute('data-requires');
                el.click();
                el.setAttribute('data-requires', requiredPermission);
              }
            } else {
              showAccessModal(requiredPermission, status);
            }
          }).catch(function(err) {
            console.error('Feature guard error:', err);
            // On error, treat as not logged in
            showAccessModal(requiredPermission, { logged: false, permitted: false });
          });
        }, true);
      });
    }

    // Init when DOM ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', attachGuards);
    } else {
      attachGuards();
    }

    // Expose for manual checks
    window.SDP = window.SDP || {};
    window.SDP.featureGuard = {
      hasPermission: hasPermission,
      showAccessModal: showAccessModal
    };
  });
})();
