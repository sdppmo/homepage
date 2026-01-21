/**
 * Auth UI Controller
 * Handles auth state display and redirects to dedicated auth pages
 */
(function() {
  'use strict';

  var config = window.SDP_AUTH_CONFIG || {};
  var SUPABASE_MODE = window.SDP && window.SDP.auth && config.provider === 'supabase';

  // DOM refs
  var authSection = document.getElementById('authSection');
  var authGuest = document.getElementById('authGuest');
  var authUser = document.getElementById('authUser');
  var loginBtn = document.getElementById('loginBtn');
  var signupBtn = document.getElementById('signupBtn');
  var logoutBtn = document.getElementById('logoutBtn');
  var adminLink = document.getElementById('adminLink');
  var userAvatar = document.getElementById('userAvatar');
  var userName = document.getElementById('userName');
  var userEmail = document.getElementById('userEmail');

  // GitHub-style avatar colors (based on email hash)
  var avatarColors = [
    ['#f97316', '#ea580c'], // orange
    ['#eab308', '#ca8a04'], // yellow  
    ['#22c55e', '#16a34a'], // green
    ['#14b8a6', '#0d9488'], // teal
    ['#0ea5e9', '#0284c7'], // sky
    ['#6366f1', '#4f46e5'], // indigo
    ['#8b5cf6', '#7c3aed'], // violet
    ['#ec4899', '#db2777'], // pink
    ['#f43f5e', '#e11d48'], // rose
  ];

  function hashCode(str) {
    var hash = 0;
    for (var i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash);
  }

  function getAvatarStyle(email) {
    var idx = hashCode(email || '') % avatarColors.length;
    var colors = avatarColors[idx];
    return 'background: linear-gradient(135deg, ' + colors[0] + ' 0%, ' + colors[1] + ' 100%);';
  }

  if (!authSection) return;

  // Get Supabase localStorage key
  function getSupabaseStorageKey() {
    var config = window.SDP_AUTH_CONFIG || {};
    if (!config.url) return null;
    var match = config.url.match(/https:\/\/([^.]+)\.supabase\.co/);
    if (!match) return null;
    return 'sb-' + match[1] + '-auth-token';
  }

  // Instant session check from localStorage (before SDK loads)
  // Returns: { email, user, profile, isValid, needsRefresh } or null
  function getInstantSession() {
    try {
      var key = getSupabaseStorageKey();
      if (!key) return null;
      var stored = localStorage.getItem(key);
      if (!stored) return null;
      var data = JSON.parse(stored);
      
      if (data && data.user && data.access_token) {
        var expiresAt = data.expires_at || 0;
        var now = Date.now() / 1000; // Convert to seconds
        var isValid = expiresAt > now;
        var hasRefreshToken = !!data.refresh_token;
        
        var cachedProfile = null;
        try {
          var profileKey = 'sdp-profile-' + data.user.id;
          var profileData = localStorage.getItem(profileKey);
          if (profileData) cachedProfile = JSON.parse(profileData);
        } catch (e) {}
        
        return { 
          email: data.user.email, 
          user: data.user, 
          profile: cachedProfile,
          isValid: isValid,
          needsRefresh: !isValid && hasRefreshToken
        };
      }
    } catch (e) {}
    return null;
  }
  
  // Save profile to localStorage for instant display
  function cacheProfile(userId, profile) {
    try {
      if (userId && profile) {
        localStorage.setItem('sdp-profile-' + userId, JSON.stringify(profile));
      }
    } catch (e) {}
  }

  // Redirect to login page
  function redirectToLogin() {
    var currentPath = window.location.pathname;
    window.location.href = '/pages/auth/login.html?redirect=' + encodeURIComponent(currentPath);
  }

  // Show instant state to prevent flash
  var instantSession = getInstantSession();
  var shownInstantLogin = false;
  var waitingForRefresh = false;
  
  if (instantSession) {
    if (instantSession.isValid) {
      // Token is valid - show logged-in immediately (no flicker)
      showLoggedInState(instantSession.email, instantSession.profile);
      shownInstantLogin = true;
    } else if (instantSession.needsRefresh) {
      // Token expired but has refresh token - wait for SDK to refresh
      // Keep auth section hidden until SDK confirms
      waitingForRefresh = true;
    } else {
      // Token expired and no refresh token - show guest state
      showGuestState();
    }
  } else {
    // No session at all - show guest state immediately
    showGuestState();
  }

  // Full session check with profile (updates UI after SDK loads)
  var sdkCheckComplete = false;
  
  if (SUPABASE_MODE) {
    window.SDP.auth.getSession().then(function(session) {
      sdkCheckComplete = true;
      if (!session) {
        // No valid session - refresh failed or no session
        if (waitingForRefresh) {
          // Was waiting for refresh but it failed - redirect to login page
          redirectToLogin();
        } else if (!shownInstantLogin) {
          showGuestState();
        }
        return;
      }
      return window.SDP.auth.getProfile().then(function(profile) {
        // Cache profile for instant display next time
        cacheProfile(session.user.id, profile);
        showLoggedInState(session.user.email, profile);
      });
    }).catch(function() {
      sdkCheckComplete = true;
      if (waitingForRefresh) {
        // Refresh failed - redirect to login page
        redirectToLogin();
      } else if (!shownInstantLogin) {
        showGuestState();
      }
    });
    
    // Fallback timeout: if waiting for refresh and SDK takes too long
    if (waitingForRefresh || !shownInstantLogin) {
      setTimeout(function() {
        if (!sdkCheckComplete) {
          if (waitingForRefresh) {
            // Refresh taking too long - redirect to login
            redirectToLogin();
          } else {
            showGuestState();
          }
        }
      }, 3000); // 3 second timeout for refresh
    }
  } else if (!shownInstantLogin) {
    // If SDK not available and no instant session, show guest state
    showGuestState();
  }

  // Event listeners - redirect to dedicated auth pages
  if (loginBtn) {
    loginBtn.addEventListener('click', function() {
      redirectToLogin();
    });
  }

  if (signupBtn) {
    signupBtn.addEventListener('click', function() {
      window.location.href = '/pages/auth/signup.html';
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', function() {
      if (SUPABASE_MODE && window.SDP.auth) {
        window.SDP.auth.logout();
      } else {
        window.location.reload();
      }
    });
  }

  // Show/hide states
  function showGuestState() {
    if (authGuest) authGuest.style.display = 'block';
    if (authUser) authUser.style.display = 'none';
    if (authSection) authSection.style.visibility = 'visible';
  }

  function showLoggedInState(email, profile) {
    if (authGuest) authGuest.style.display = 'none';
    if (authUser) authUser.style.display = 'block';
    if (authSection) authSection.style.visibility = 'visible';

    // Set avatar with unique color based on email
    var displayName = (profile && profile.business_name) || email || 'User';
    var initial = (displayName.charAt(0) || 'U').toUpperCase();
    
    if (userAvatar) {
      userAvatar.textContent = initial;
      userAvatar.style.cssText = getAvatarStyle(email);
    }
    
    // Show name and email
    if (userName) userName.textContent = displayName;
    if (userEmail) userEmail.textContent = email || '';

    // Show admin link if user is admin
    if (adminLink) {
      var isAdminRole = profile && profile.role === 'admin';
      adminLink.style.display = isAdminRole ? 'inline-flex' : 'none';
    }
  }

  // Handle auth=required redirects (legacy support)
  var params = new URLSearchParams(window.location.search);
  if (params.get('auth') === 'required') {
    redirectToLogin();
  }

  // Settings Modal (still needed for logged-in users)
  var settingsBtn = document.getElementById('settingsBtn');
  if (settingsBtn && SUPABASE_MODE) {
    var settingsModal = createSettingsModal();
    document.body.appendChild(settingsModal.overlay);
    
    settingsBtn.addEventListener('click', function() {
      settingsModal.show();
    });
  }

  function createSettingsModal() {
    var overlay = document.createElement('div');
    overlay.className = 'settings-modal-overlay';
    overlay.innerHTML = '\
      <div class="settings-modal">\
        <button class="settings-modal-close" type="button">&times;</button>\
        <h2 class="settings-modal-title">설정</h2>\
        <div class="settings-modal-tabs">\
          <button class="settings-tab active" data-tab="profile">프로필</button>\
          <button class="settings-tab" data-tab="password">비밀번호</button>\
        </div>\
        <div class="settings-tab-content" id="profileTab">\
          <form class="settings-form" id="profileForm">\
            <div class="settings-field">\
              <label>이메일</label>\
              <input type="email" id="settingsEmail" disabled>\
            </div>\
            <div class="settings-field">\
              <label>회사명</label>\
              <input type="text" id="settingsBusiness" placeholder="회사명을 입력하세요">\
            </div>\
            <div class="settings-field">\
              <label>사업자등록번호</label>\
              <input type="text" id="settingsBizNum" placeholder="000-00-00000" maxlength="12">\
            </div>\
            <div class="settings-field">\
              <label>전화번호</label>\
              <input type="tel" id="settingsPhone" placeholder="010-0000-0000">\
            </div>\
            <div class="settings-message" id="profileMessage"></div>\
            <button type="submit" class="settings-submit">저장</button>\
          </form>\
        </div>\
        <div class="settings-tab-content" id="passwordTab" style="display:none;">\
          <form class="settings-form" id="passwordForm" novalidate>\
            <div class="settings-field">\
              <label>현재 비밀번호</label>\
              <input type="password" id="settingsCurrentPassword" placeholder="현재 비밀번호 입력">\
            </div>\
            <div class="settings-field">\
              <label>새 비밀번호</label>\
              <input type="password" id="settingsNewPassword" placeholder="새 비밀번호 입력">\
            </div>\
            <div class="settings-field">\
              <label>새 비밀번호 확인</label>\
              <input type="password" id="settingsConfirmPassword" placeholder="새 비밀번호 다시 입력">\
            </div>\
            <div class="settings-field-hint" id="newPasswordHint"></div>\
            <div class="settings-message" id="passwordMessage"></div>\
            <button type="submit" class="settings-submit">비밀번호 변경</button>\
          </form>\
        </div>\
      </div>\
    ';

    var style = document.createElement('style');
    style.textContent = '\
      .settings-modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.7); display: none; align-items: center; justify-content: center; z-index: 9999; backdrop-filter: blur(4px); }\
      .settings-modal-overlay.show { display: flex; }\
      .settings-modal { background: #1a1a2e; border-radius: 16px; padding: 32px; width: 100%; max-width: 420px; position: relative; box-shadow: 0 25px 50px rgba(0,0,0,0.5); }\
      .settings-modal-close { position: absolute; top: 16px; right: 16px; background: none; border: none; color: #888; font-size: 24px; cursor: pointer; line-height: 1; padding: 4px; }\
      .settings-modal-close:hover { color: #fff; }\
      .settings-modal-title { color: #fff; font-size: 24px; margin: 0 0 20px; text-align: center; font-weight: 600; }\
      .settings-modal-tabs { display: flex; gap: 8px; margin-bottom: 20px; }\
      .settings-tab { flex: 1; padding: 10px; border: none; border-radius: 8px; background: #16213e; color: #888; font-size: 14px; font-weight: 500; cursor: pointer; transition: all 0.2s; }\
      .settings-tab.active { background: #667eea; color: #fff; }\
      .settings-tab:hover:not(.active) { background: #1e2a4a; color: #a0a0a0; }\
      .settings-form { display: flex; flex-direction: column; gap: 16px; }\
      .settings-field { display: flex; flex-direction: column; gap: 6px; }\
      .settings-field label { color: #a0a0a0; font-size: 13px; font-weight: 500; }\
      .settings-field input { padding: 12px 14px; border: 1px solid #333; border-radius: 8px; background: #16213e; color: #fff; font-size: 14px; transition: border-color 0.2s; }\
      .settings-field input:focus { outline: none; border-color: #667eea; }\
      .settings-field input:disabled { background: #0d1525; color: #666; cursor: not-allowed; }\
      .settings-field input::placeholder { color: #555; }\
      .settings-message { font-size: 13px; text-align: center; min-height: 0; margin-top: -8px; }\
      .settings-message.error { color: #f87171; }\
      .settings-message.success { color: #4ade80; }\
      .settings-submit { padding: 14px; border: none; border-radius: 8px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #fff; font-size: 15px; font-weight: 600; cursor: pointer; transition: transform 0.2s, box-shadow 0.2s; }\
      .settings-submit:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(102,126,234,0.4); }\
      .settings-submit:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }\
      .settings-field-hint { font-size: 12px; color: #f87171; margin-top: 4px; min-height: 16px; text-align: center; }\
      @keyframes shake { 0%,100%{transform:translateX(0)} 20%,60%{transform:translateX(-5px)} 40%,80%{transform:translateX(5px)} }\
      .shake { animation: shake 0.4s ease; }\
    ';
    document.head.appendChild(style);

    var closeBtn = overlay.querySelector('.settings-modal-close');
    var tabs = overlay.querySelectorAll('.settings-tab');
    var profileTab = overlay.querySelector('#profileTab');
    var passwordTab = overlay.querySelector('#passwordTab');
    var profileForm = overlay.querySelector('#profileForm');
    var passwordForm = overlay.querySelector('#passwordForm');
    var emailInput = overlay.querySelector('#settingsEmail');
    var businessInput = overlay.querySelector('#settingsBusiness');
    var bizNumInput = overlay.querySelector('#settingsBizNum');
    var phoneInput = overlay.querySelector('#settingsPhone');
    var currentPasswordInput = overlay.querySelector('#settingsCurrentPassword');
    var newPasswordInput = overlay.querySelector('#settingsNewPassword');
    var confirmPasswordInput = overlay.querySelector('#settingsConfirmPassword');
    var newPasswordHint = overlay.querySelector('#newPasswordHint');
    var profileMessage = overlay.querySelector('#profileMessage');
    var passwordMessage = overlay.querySelector('#passwordMessage');

    function show() {
      overlay.classList.add('show');
      profileMessage.textContent = '';
      profileMessage.className = 'settings-message';
      passwordMessage.textContent = '';
      passwordMessage.className = 'settings-message';
      if (newPasswordHint) newPasswordHint.textContent = '';
      currentPasswordInput.value = '';
      newPasswordInput.value = '';
      confirmPasswordInput.value = '';
      
      // Load current profile data
      window.SDP.auth.getSession().then(function(session) {
        if (session && session.user) {
          emailInput.value = session.user.email || '';
        }
        return window.SDP.auth.getProfile();
      }).then(function(profile) {
        if (profile) {
          businessInput.value = profile.business_name || '';
          bizNumInput.value = profile.business_number || '';
          phoneInput.value = profile.phone || '';
        }
      }).catch(function() {
        // Profile load failed - fields will remain empty
      });
    }

    function hide() {
      overlay.classList.remove('show');
    }

    closeBtn.addEventListener('click', hide);
    overlay.addEventListener('click', function(e) {
      if (e.target === overlay) hide();
    });

    tabs.forEach(function(tab) {
      tab.addEventListener('click', function() {
        tabs.forEach(function(t) { t.classList.remove('active'); });
        tab.classList.add('active');
        var tabName = tab.getAttribute('data-tab');
        profileTab.style.display = tabName === 'profile' ? 'block' : 'none';
        passwordTab.style.display = tabName === 'password' ? 'block' : 'none';
      });
    });

    profileForm.addEventListener('submit', function(e) {
      e.preventDefault();
      var submitBtn = profileForm.querySelector('.settings-submit');
      submitBtn.disabled = true;
      profileMessage.textContent = '';
      profileMessage.className = 'settings-message';

      var business = businessInput.value.trim();
      var bizNum = bizNumInput.value.trim();
      var phone = phoneInput.value.trim();

      window.SDP.auth.getClient().then(function(client) {
        return window.SDP.auth.getSession().then(function(session) {
          if (!session) throw new Error('Not logged in');
          return client
            .from('user_profiles')
            .update({ business_name: business || null, business_number: bizNum || null, phone: phone || null })
            .eq('id', session.user.id);
        });
      }).then(function(result) {
        if (result.error) throw result.error;
        profileMessage.textContent = '프로필이 저장되었습니다!';
        profileMessage.className = 'settings-message success';
        // Update cached profile
        window.SDP.auth.getSession().then(function(session) {
          if (session) {
            var updatedProfile = { business_name: business, business_number: bizNum, phone: phone };
            cacheProfile(session.user.id, updatedProfile);
          }
        });
        // Update display
        if (userName) userName.textContent = business || emailInput.value;
        if (userAvatar && business) {
          userAvatar.textContent = business.charAt(0).toUpperCase();
        }
      }).catch(function(err) {
        profileMessage.textContent = err.message || '저장 실패';
        profileMessage.className = 'settings-message error';
      }).finally(function() {
        submitBtn.disabled = false;
      });
    });

    passwordForm.addEventListener('submit', function(e) {
      e.preventDefault();
      var submitBtn = passwordForm.querySelector('.settings-submit');
      submitBtn.disabled = true;
      passwordMessage.textContent = '';
      passwordMessage.className = 'settings-message';

      var currentPassword = currentPasswordInput.value;
      var newPassword = newPasswordInput.value;
      var confirmPassword = confirmPasswordInput.value;

      if (!currentPassword) {
        newPasswordHint.textContent = '현재 비밀번호를 입력하세요';
        newPasswordHint.classList.add('shake');
        setTimeout(function() { newPasswordHint.classList.remove('shake'); }, 400);
        submitBtn.disabled = false;
        return;
      }

      // Password complexity: 8+ chars, uppercase, lowercase, number, special char
      var passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{8,}$/;
      if (!passwordRegex.test(newPassword)) {
        newPasswordHint.textContent = '8자 이상, 대/소문자, 숫자, 특수문자 포함';
        newPasswordHint.classList.add('shake');
        setTimeout(function() { newPasswordHint.classList.remove('shake'); }, 400);
        submitBtn.disabled = false;
        return;
      } else {
        newPasswordHint.textContent = '';
      }

      if (newPassword !== confirmPassword) {
        newPasswordHint.textContent = '새 비밀번호가 일치하지 않습니다';
        newPasswordHint.classList.add('shake');
        setTimeout(function() { newPasswordHint.classList.remove('shake'); }, 400);
        submitBtn.disabled = false;
        return;
      }

      var userEmailValue = emailInput.value;

      // First verify current password by re-authenticating
      window.SDP.auth.getClient().then(function(client) {
        return client.auth.signInWithPassword({ 
          email: userEmailValue, 
          password: currentPassword 
        });
      }).then(function(result) {
        if (result.error) throw new Error('현재 비밀번호가 올바르지 않습니다');
        // Now update to new password
        return window.SDP.auth.getClient().then(function(client) {
          return client.auth.updateUser({ password: newPassword });
        });
      }).then(function(result) {
        if (result.error) throw result.error;
        passwordMessage.textContent = '비밀번호가 변경되었습니다!';
        passwordMessage.className = 'settings-message success';
        currentPasswordInput.value = '';
        newPasswordInput.value = '';
        confirmPasswordInput.value = '';
      }).catch(function(err) {
        passwordMessage.textContent = err.message || '비밀번호 변경 실패';
        passwordMessage.className = 'settings-message error';
      }).finally(function() {
        submitBtn.disabled = false;
      });
    });

    return { overlay: overlay, show: show, hide: hide };
  }

})();
