/**
 * Auth UI Controller
 * Handles login/signup modals and auth state display
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

  // Instant session check from localStorage (before SDK loads)
  function getInstantSession() {
    try {
      var config = window.SDP_AUTH_CONFIG || {};
      if (!config.url) return null;
      // Extract project ref from URL: https://xxx.supabase.co -> xxx
      var match = config.url.match(/https:\/\/([^.]+)\.supabase\.co/);
      if (!match) return null;
      var projectRef = match[1];
      var key = 'sb-' + projectRef + '-auth-token';
      var stored = localStorage.getItem(key);
      if (!stored) return null;
      var data = JSON.parse(stored);
      // Check if session exists and not expired
      if (data && data.user && data.access_token) {
        var expiresAt = data.expires_at || 0;
        if (expiresAt * 1000 > Date.now()) {
          // Also get cached profile
          var cachedProfile = null;
          try {
            var profileKey = 'sdp-profile-' + data.user.id;
            var profileData = localStorage.getItem(profileKey);
            if (profileData) cachedProfile = JSON.parse(profileData);
          } catch (e) {}
          return { email: data.user.email, user: data.user, profile: cachedProfile };
        }
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

  // Check if email is in bootstrap admin list (works before SDK loads)
  // Admin check is now done via database role only

  // Show instant state to prevent flash
  var instantSession = getInstantSession();
  if (instantSession) {
    // Immediately show logged-in state with cached profile if available
    showLoggedInState(instantSession.email, instantSession.profile);
  } else {
    showGuestState();
  }

  // Create auth modal
  var modal = createAuthModal();
  document.body.appendChild(modal.overlay);

  // Full session check with profile (updates UI after SDK loads)
  if (SUPABASE_MODE) {
    window.SDP.auth.getSession().then(function(session) {
      if (!session) {
        showGuestState();
        return;
      }
      return window.SDP.auth.getProfile().then(function(profile) {
        // Cache profile for instant display next time
        cacheProfile(session.user.id, profile);
        showLoggedInState(session.user.email, profile);
      });
    }).catch(function() {
      showGuestState();
    });
  }

  // Event listeners
  if (loginBtn) {
    loginBtn.addEventListener('click', function() {
      modal.show('login');
    });
  }

  if (signupBtn) {
    signupBtn.addEventListener('click', function() {
      modal.show('signup');
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

    // Show admin link if user is admin or bootstrap admin
    if (adminLink) {
      var isAdminRole = profile && profile.role === 'admin';
      // Admin check based on database role only
      adminLink.style.display = isAdminRole ? 'inline-flex' : 'none';
    }
  }

  // Auth Modal
  function createAuthModal() {
    var overlay = document.createElement('div');
    overlay.className = 'auth-modal-overlay';
    overlay.innerHTML = '\
      <div class="auth-modal">\
        <button class="auth-modal-close" type="button">&times;</button>\
        <h2 class="auth-modal-title">로그인</h2>\
        <form class="auth-modal-form" id="authModalForm">\
          <div class="auth-modal-field">\
            <label>이메일</label>\
            <input type="email" id="authEmail" required placeholder="example@email.com">\
          </div>\
          <div class="auth-modal-field">\
            <label>비밀번호</label>\
            <input type="password" id="authPassword" required placeholder="비밀번호 입력">\
          </div>\
          <div class="auth-modal-field signup-only" style="display:none;">\
            <label>회사명</label>\
            <input type="text" id="authBusiness" placeholder="회사명을 입력하세요">\
          </div>\
          <div class="auth-modal-field signup-only" style="display:none;">\
            <label>사업자등록번호</label>\
            <input type="text" id="authBizNum" placeholder="000-00-00000" maxlength="12">\
          </div>\
          <div class="auth-modal-field signup-only" style="display:none;">\
            <label>전화번호</label>\
            <input type="tel" id="authPhone" placeholder="010-0000-0000">\
          </div>\
          <div class="auth-modal-error" id="authError"></div>\
          <button type="submit" class="auth-modal-submit">로그인</button>\
        </form>\
        <div class="auth-modal-footer">\
          <span class="auth-modal-switch" id="authSwitch">계정이 없으신가요? <strong>회원가입</strong></span>\
        </div>\
      </div>\
    ';

    // Add modal styles
    var style = document.createElement('style');
    style.textContent = '\
      .auth-modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.75); display: none; align-items: center; justify-content: center; z-index: 9999; backdrop-filter: blur(6px); }\
      .auth-modal-overlay.show { display: flex; }\
      .auth-modal { background: linear-gradient(180deg, #1e2642 0%, #151b2e 100%); border-radius: 16px; padding: 36px 32px; width: 100%; max-width: 420px; position: relative; box-shadow: 0 25px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05); }\
      .auth-modal-close { position: absolute; top: 14px; right: 14px; background: rgba(255,255,255,0.05); border: none; color: #666; font-size: 20px; cursor: pointer; line-height: 1; padding: 6px 10px; border-radius: 6px; transition: all 0.2s; }\
      .auth-modal-close:hover { color: #fff; background: rgba(255,255,255,0.1); }\
      .auth-modal-title { color: #fff; font-size: 22px; margin: 0 0 28px; text-align: center; font-weight: 600; letter-spacing: -0.3px; }\
      .auth-modal-form { display: flex; flex-direction: column; gap: 18px; }\
      .auth-modal-field { display: flex; flex-direction: column; gap: 8px; }\
      .auth-modal-field label { color: #8b95a8; font-size: 13px; font-weight: 600; letter-spacing: 0.3px; }\
      .auth-modal-field input { padding: 14px 16px; border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; background: rgba(255,255,255,0.03); color: #fff; font-size: 14px; transition: all 0.2s; }\
      .auth-modal-field input:focus { outline: none; border-color: #667eea; background: rgba(102,126,234,0.05); box-shadow: 0 0 0 3px rgba(102,126,234,0.15); }\
      .auth-modal-field input::placeholder { color: #4a5568; }\
      .auth-modal-error { color: #f87171; font-size: 13px; text-align: center; min-height: 18px; padding: 4px 0; }\
      .auth-modal-submit { padding: 16px; border: none; border-radius: 10px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #fff; font-size: 15px; font-weight: 600; cursor: pointer; transition: all 0.2s; letter-spacing: 0.3px; margin-top: 4px; }\
      .auth-modal-submit:hover { transform: translateY(-2px); box-shadow: 0 10px 25px rgba(102,126,234,0.4); }\
      .auth-modal-submit:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }\
      .auth-modal-footer { margin-top: 24px; text-align: center; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.06); }\
      .auth-modal-switch { color: #6b7280; font-size: 13px; cursor: pointer; }\
      .auth-modal-switch strong { color: #818cf8; font-weight: 600; }\
      .auth-modal-switch:hover strong { text-decoration: underline; }\
      @keyframes shake { 0%,100%{transform:translateX(0)} 20%,60%{transform:translateX(-5px)} 40%,80%{transform:translateX(5px)} }\
      .shake { animation: shake 0.4s ease; }\
    ';
    document.head.appendChild(style);

    var modalEl = overlay.querySelector('.auth-modal');
    var closeBtn = overlay.querySelector('.auth-modal-close');
    var form = overlay.querySelector('#authModalForm');
    var titleEl = overlay.querySelector('.auth-modal-title');
    var submitBtn = overlay.querySelector('.auth-modal-submit');
    var switchEl = overlay.querySelector('#authSwitch');
    var errorEl = overlay.querySelector('#authError');
    var signupFields = overlay.querySelectorAll('.signup-only');
    var emailInput = overlay.querySelector('#authEmail');
    var passwordInput = overlay.querySelector('#authPassword');
    var businessInput = overlay.querySelector('#authBusiness');
    var bizNumInput = overlay.querySelector('#authBizNum');
    var phoneInput = overlay.querySelector('#authPhone');

    var currentMode = 'login';

    function show(mode) {
      currentMode = mode || 'login';
      overlay.classList.add('show');
      errorEl.textContent = '';
      emailInput.value = '';
      passwordInput.value = '';
      if (businessInput) businessInput.value = '';
      if (bizNumInput) bizNumInput.value = '';

      if (currentMode === 'signup') {
        titleEl.textContent = '회원가입';
        submitBtn.textContent = '가입하기';
        switchEl.innerHTML = '이미 계정이 있으신가요? <strong>로그인</strong>';
        signupFields.forEach(function(el) { el.style.display = 'flex'; });
      } else {
        titleEl.textContent = '로그인';
        submitBtn.textContent = '로그인';
        switchEl.innerHTML = '계정이 없으신가요? <strong>회원가입</strong>';
        signupFields.forEach(function(el) { el.style.display = 'none'; });
      }

      setTimeout(function() { emailInput.focus(); }, 100);
    }

    function hide() {
      overlay.classList.remove('show');
    }

    closeBtn.addEventListener('click', hide);
    overlay.addEventListener('click', function(e) {
      if (e.target === overlay) hide();
    });

    switchEl.addEventListener('click', function() {
      show(currentMode === 'login' ? 'signup' : 'login');
    });

    form.addEventListener('submit', function(e) {
      e.preventDefault();
      errorEl.textContent = '';

      var email = emailInput.value.trim();
      var password = passwordInput.value;
      var business = businessInput ? businessInput.value.trim() : '';
      var bizNum = bizNumInput ? bizNumInput.value.trim() : '';
      var phone = phoneInput ? phoneInput.value.trim() : '';

      if (!email || !password) {
        errorEl.textContent = '이메일과 비밀번호를 입력하세요.';
        return;
      }

      // Password complexity for signup
      if (currentMode === 'signup') {
        var pwdRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{8,}$/;
        if (!pwdRegex.test(password)) {
          errorEl.textContent = '비밀번호는 8자 이상, 대/소문자, 숫자, 특수문자를 포함해야 합니다';
          passwordInput.classList.add('shake');
          setTimeout(function() { passwordInput.classList.remove('shake'); }, 400);
          return;
        }
      }

      submitBtn.disabled = true;
      submitBtn.textContent = currentMode === 'signup' ? '가입 중...' : '로그인 중...';

      if (!SUPABASE_MODE) {
        errorEl.textContent = '인증 시스템이 설정되지 않았습니다.';
        submitBtn.disabled = false;
        submitBtn.textContent = currentMode === 'signup' ? '가입하기' : '로그인';
        return;
      }

      if (currentMode === 'signup') {
        window.SDP.auth.getClient().then(function(client) {
          return client.auth.signUp({
            email: email,
            password: password,
            options: {
              data: { 
                business_name: business,
                business_number: bizNum,
                phone: phone
              }
            }
          });
        }).then(function(result) {
          if (result.error) throw result.error;
          hide();
          alert('회원가입 완료! 이메일 인증 후 로그인하세요.');
        }).catch(function(err) {
          errorEl.textContent = err.message || '회원가입 실패';
        }).finally(function() {
          submitBtn.disabled = false;
          submitBtn.textContent = '가입하기';
        });
      } else {
        window.SDP.auth.signInWithPassword(email, password)
          .then(function(result) {
            hide();
            // Cache profile for instant display
            if (result.session && result.profile) {
              cacheProfile(result.session.user.id, result.profile);
            }
            showLoggedInState(email, result.profile);
          })
          .catch(function(err) {
            errorEl.textContent = err.message || '로그인 실패';
          })
          .finally(function() {
            submitBtn.disabled = false;
            submitBtn.textContent = '로그인';
          });
      }
    });

    return { overlay: overlay, show: show, hide: hide };
  }

  // Handle auth messages from redirects
  var params = new URLSearchParams(window.location.search);
  if (params.get('auth') === 'required') {
    setTimeout(function() {
      if (modal) modal.show('login');
    }, 500);
  }

  // Settings Modal
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

      var userEmail = emailInput.value;

      // First verify current password by re-authenticating
      window.SDP.auth.getClient().then(function(client) {
        return client.auth.signInWithPassword({ 
          email: userEmail, 
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
