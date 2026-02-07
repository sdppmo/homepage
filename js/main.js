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

  // Debug mode flag - set to true only for debugging
  const DEBUG_MODE = false;

  // Navigation: toggle active state on click
  function initNavigation() {
    var items = document.querySelectorAll('.nav-item');
    items.forEach(function(item) {
      item.addEventListener('click', function(e) {
        // #region agent log
        if (DEBUG_MODE) {
          fetch('http://127.0.0.1:7242/ingest/f6b33b86-5eb3-41dd-83f7-9e0a0382507b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'main.js:22',message:'Nav item clicked',data:{tagName:this.tagName,text:this.textContent,hasHref:!!this.href,className:this.className},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        }
        // #endregion
        
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
        
        // EX-Slim-Beam (운영자 전용) 처리
        // #region agent log
        if (DEBUG_MODE) {
          fetch('http://127.0.0.1:7242/ingest/f6b33b86-5eb3-41dd-83f7-9e0a0382507b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'main.js:39',message:'Checking EX-Slim-Beam condition',data:{text:text,id:this.id,includesBeam:text.includes('EX-Slim-Beam'),includesBox:text.includes('EX-Slim-Box'),idMatch:this.id === 'ex-slim-box-nav'},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
        }
        // #endregion
        
        if (text.includes('EX-Slim-Beam') || text.includes('EX-Slim-Box') || this.id === 'ex-slim-box-nav') {
          // #region agent log
          if (DEBUG_MODE) {
            const targetUrl = '/pages/k-col web software/compositebeam-calculator.html';
            const encodedUrl = encodeURI(targetUrl);
            fetch('http://127.0.0.1:7242/ingest/f6b33b86-5eb3-41dd-83f7-9e0a0382507b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'main.js:45',message:'EX-Slim-Beam clicked - redirecting',data:{text:text,id:this.id,url:targetUrl,encodedUrl:encodedUrl},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
          }
          // #endregion
          e.preventDefault();
          e.stopPropagation();
          // 운영자만 접근 가능 - 이미 표시된 것은 운영자이므로 바로 이동
          // URL 인코딩하여 공백 처리
          window.location.href = encodeURI('/pages/k-col web software/compositebeam-calculator.html');
          return false;
        }
        
        // ex-2 (Web Software III / Castellated Beam) 클릭 처리 - 일반 사용자 포함 모두 모달 표시
        if (this.id === 'ex-2') {
          e.preventDefault();
          e.stopPropagation();
          showCastellatedBeamSelectionModal();
          return false;
        }
        
        // 일반 네비게이션 항목 처리
        // <a> 태그인 경우에만 링크 동작 허용
        if (this.tagName === 'A' && this.href && this.href !== '#') {
          // 링크가 있으면 기본 동작 허용 (페이지 이동)
          items.forEach(function(i) { i.classList.remove('active'); });
          this.classList.add('active');
        } else {
          // 링크가 없는 경우 active 상태만 토글
        items.forEach(function(i) { i.classList.remove('active'); });
        this.classList.add('active');
        }
      });
    });
  }

  // Product Schedule: K-COL / Slim-Box Product Schedule → 2H_steel_product.html 로 이동 (관리자만, 부모 data-requires-auth 가로채기 방지)
  document.addEventListener('click', function(e) {
    var a = e.target && e.target.closest('a.nav-dropdown-item[href*="2H_steel_product.html"]');
    if (!a || !a.href) return;
    e.preventDefault();
    e.stopPropagation();
    var targetHref = (a.getAttribute('href') || '').trim();
    if (!targetHref || targetHref === '#') return;
    if (!window.SDP || !window.SDP.auth) {
      alert('이 메뉴는 로그인 후 이용할 수 있습니다.');
      return;
    }
    window.SDP.auth.getSession().then(function(session) {
      if (!session) {
        alert('이 메뉴는 로그인 후 이용할 수 있습니다.');
        return;
      }
      return window.SDP.auth.getProfile();
    }).then(function(profile) {
      if (!profile || !window.SDP.auth.isAdmin()) {
        alert('Product Schedule 메뉴는 관리자만 이용할 수 있습니다.');
        return;
      }
      window.location.href = targetHref;
    }).catch(function() {
      alert('로그인 상태를 확인할 수 없습니다.');
    });
  }, true);

  // Web Software IV: CFT-BOX / CFT-Circular / H형강-Column → 운영자만 이동, 일반 사용자 클릭 시 안내 메시지
  document.addEventListener('click', function(e) {
    var a = e.target && e.target.closest('a.nav-dropdown-item[href*="crossHcolumnCalculator"]');
    if (!a || !a.href) return;
    var h = (a.getAttribute('href') || '');
    if (h.indexOf('#cft-box') === -1 && h.indexOf('#cft-circular') === -1 && h.indexOf('#h-beam') === -1) return;
    e.preventDefault();
    e.stopPropagation();
    var path = 'pages/k-col%20web%20software/crossHcolumnCalculator.html';
    var hash = (h.indexOf('#') !== -1) ? h.substring(h.indexOf('#')) : '';
    var targetHref = path + hash;
    if (!window.SDP || !window.SDP.auth) {
      alert('이 기능은 운영자만 사용할 수 있습니다. 운영자권한이 필요합니다.');
      return;
    }
    window.SDP.auth.getSession().then(function(session) {
      if (!session) {
        alert('이 기능은 운영자만 사용할 수 있습니다. 운영자권한이 필요합니다.');
        return;
      }
      return window.SDP.auth.getProfile();
    }).then(function(profile) {
      if (profile && window.SDP.auth.isAdmin()) {
        window.location.href = targetHref;
      } else {
        alert('이 기능은 운영자만 사용할 수 있습니다. 운영자권한이 필요합니다.');
      }
    }).catch(function() {
      alert('이 기능은 운영자만 사용할 수 있습니다. 운영자권한이 필요합니다.');
    });
  }, true);

  // Web Software III: EXTRA SLIM Light / EXTRA Slim Heavy → 운영자만 이동, 일반 사용자 클릭 시 안내 메시지
  document.addEventListener('click', function(e) {
    var a = e.target && e.target.closest('a.nav-dropdown-item[href*="compositebeam-calculator.html"]');
    if (!a || !a.href) return;
    var h = (a.getAttribute('href') || '');
    if (h.indexOf('extra-slim-light') === -1 && h.indexOf('extra-slim-heavy') === -1) return;
    e.preventDefault();
    e.stopPropagation();
    var targetHref = 'pages/k-col%20web%20software/compositebeam-calculator.html' + (h.indexOf('#') !== -1 ? h.substring(h.indexOf('#')) : '');
    if (!window.SDP || !window.SDP.auth) {
      alert('이 기능은 운영자만 사용할 수 있습니다. 운영자권한이 필요합니다.');
      return;
    }
    window.SDP.auth.getSession().then(function(session) {
      if (!session) {
        alert('이 기능은 운영자만 사용할 수 있습니다. 운영자권한이 필요합니다.');
        return;
      }
      return window.SDP.auth.getProfile();
    }).then(function(profile) {
      if (profile && window.SDP.auth.isAdmin()) {
        window.location.href = targetHref;
      } else {
        alert('이 기능은 운영자만 사용할 수 있습니다. 운영자권한이 필요합니다.');
      }
    }).catch(function() {
      alert('이 기능은 운영자만 사용할 수 있습니다. 운영자권한이 필요합니다.');
    });
  }, true);

  // Castellated Beam 드롭다운 하위 링크: with-slab만 운영자 확인 후 이동, 나머지는 바로 이동
  // 항상 실제 파일명(Composite_CastellatedBeam_Design_Calculator.html)으로 이동 (캐시된 예전 href 무시)
  var castellatedBasePath = 'pages/k-col%20web%20software/Composite_CastellatedBeam_Design_Calculator.html';
  document.addEventListener('click', function(e) {
    var a = e.target && e.target.closest('a.nav-dropdown-item[data-castellated-type]');
    if (!a) return;
    e.preventDefault();
    e.stopPropagation();
    var type = a.getAttribute('data-castellated-type') || 'without-slab';
    var targetHref = castellatedBasePath + '?type=' + type;
    if (type === 'with-slab') {
      if (!window.SDP || !window.SDP.auth) {
        alert('이 기능은 운영자만 사용할 수 있습니다. 운영자권한이 필요합니다.');
        return;
      }
      window.SDP.auth.getSession().then(function(session) {
        if (!session) {
          alert('이 기능은 운영자만 사용할 수 있습니다. 운영자권한이 필요합니다.');
          return;
        }
        return window.SDP.auth.getProfile();
      }).then(function(profile) {
        if (profile && window.SDP.auth.isAdmin()) {
          window.location.href = targetHref;
        } else {
          alert('이 기능은 운영자만 사용할 수 있습니다. 운영자권한이 필요합니다.');
        }
      }).catch(function() {
        alert('이 기능은 운영자만 사용할 수 있습니다. 운영자권한이 필요합니다.');
      });
    } else {
      window.location.href = targetHref;
    }
  });

  // Initialize EX-Slim-Box nav item: show for everyone (public)
  function initExSlimBoxNav() {
    // #region agent log
    if (DEBUG_MODE) {
      fetch('http://127.0.0.1:7242/ingest/f6b33b86-5eb3-41dd-83f7-9e0a0382507b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'main.js:initExSlimBoxNav',message:'initExSlimBoxNav function called',data:{readyState:document.readyState},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'INIT'})}).catch(()=>{});
    }
    // #endregion
    
    var exSlimBoxNav = document.getElementById('ex-slim-box-nav');
    var ex2Nav = document.getElementById('ex-2');
    
    // #region agent log
    if (DEBUG_MODE) {
      fetch('http://127.0.0.1:7242/ingest/f6b33b86-5eb3-41dd-83f7-9e0a0382507b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'main.js:initExSlimBoxNav',message:'DOM elements found',data:{exSlimBoxNavExists:!!exSlimBoxNav,ex2NavExists:!!ex2Nav,exSlimBoxNavDisplay:exSlimBoxNav?exSlimBoxNav.style.display:'N/A',ex2NavDisplay:ex2Nav?ex2Nav.style.display:'N/A',exSlimBoxNavClasses:exSlimBoxNav?exSlimBoxNav.className:'N/A',ex2NavClasses:ex2Nav?ex2Nav.className:'N/A'},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'DOM'})}).catch(()=>{});
    }
    // #endregion
    
    if (!exSlimBoxNav) {
      // #region agent log
      if (DEBUG_MODE) {
        fetch('http://127.0.0.1:7242/ingest/f6b33b86-5eb3-41dd-83f7-9e0a0382507b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'main.js:initExSlimBoxNav',message:'exSlimBoxNav not found - returning early',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'ERROR'})}).catch(()=>{});
      }
      // #endregion
      return;
    }
    
    // Show nav items for everyone (public access)
    exSlimBoxNav.style.display = 'flex';
    exSlimBoxNav.style.cursor = 'pointer';
    exSlimBoxNav.classList.remove('gray-text');
    exSlimBoxNav.classList.remove('small-text'); // Remove small-text to match kcol-product-schedule-link
    exSlimBoxNav.classList.add('gold');
    
    // #region agent log
    if (DEBUG_MODE) {
      fetch('http://127.0.0.1:7242/ingest/f6b33b86-5eb3-41dd-83f7-9e0a0382507b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'main.js:initExSlimBoxNav',message:'exSlimBoxNav styled',data:{display:exSlimBoxNav.style.display,classes:exSlimBoxNav.className,hasGold:exSlimBoxNav.classList.contains('gold'),hasGrayText:exSlimBoxNav.classList.contains('gray-text'),hasSmallText:exSlimBoxNav.classList.contains('small-text')},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'STYLE'})}).catch(()=>{});
    }
    // #endregion
    
    if (ex2Nav) {
      ex2Nav.style.display = 'flex';
      ex2Nav.style.cursor = 'pointer';
      ex2Nav.classList.remove('gray-text');
      ex2Nav.classList.remove('small-text'); // Remove small-text to match other nav items
      ex2Nav.classList.add('gold');
      
      // #region agent log
      if (DEBUG_MODE) {
        fetch('http://127.0.0.1:7242/ingest/f6b33b86-5eb3-41dd-83f7-9e0a0382507b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'main.js:initExSlimBoxNav',message:'ex2Nav styled',data:{display:ex2Nav.style.display,classes:ex2Nav.className,hasGold:ex2Nav.classList.contains('gold'),hasGrayText:ex2Nav.classList.contains('gray-text'),hasSmallText:ex2Nav.classList.contains('small-text')},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'STYLE'})}).catch(()=>{});
      }
      // #endregion
    } else {
      // #region agent log
      if (DEBUG_MODE) {
        fetch('http://127.0.0.1:7242/ingest/f6b33b86-5eb3-41dd-83f7-9e0a0382507b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'main.js:initExSlimBoxNav',message:'ex2Nav not found',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'DOM'})}).catch(()=>{});
      }
      // #endregion
    }
    
    // Function to show/hide nav items (kept for compatibility, but always shows now)
    function updateNavVisibility(hasPermission) {
      // Always show - public access
      exSlimBoxNav.style.display = 'flex';
      exSlimBoxNav.style.cursor = 'pointer';
      exSlimBoxNav.classList.remove('gray-text');
      exSlimBoxNav.classList.remove('small-text'); // Remove small-text to match kcol-product-schedule-link
      exSlimBoxNav.classList.add('gold');
      
      if (ex2Nav) {
        ex2Nav.style.display = 'flex';
        ex2Nav.style.cursor = 'pointer';
        ex2Nav.classList.remove('gray-text');
        ex2Nav.classList.remove('small-text'); // Remove small-text to match other nav items
        ex2Nav.classList.add('gold');
      }
    }
    
    // Check if user is admin and show nav item if admin
    function checkAdminAndShowNav() {
      // #region agent log
      if (DEBUG_MODE) {
        fetch('http://127.0.0.1:7242/ingest/f6b33b86-5eb3-41dd-83f7-9e0a0382507b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'main.js:85',message:'checkAdminAndShowNav called',data:{hasSDP:!!window.SDP,hasAuth:!!(window.SDP && window.SDP.auth)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      }
      // #endregion
      
      if (!window.SDP || !window.SDP.auth) {
        // Auth not available, keep hidden
        return;
      }
      
      window.SDP.auth.getSession().then(function(session) {
        // #region agent log
        if (DEBUG_MODE) {
          fetch('http://127.0.0.1:7242/ingest/f6b33b86-5eb3-41dd-83f7-9e0a0382507b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'main.js:95',message:'Session check result',data:{hasSession:!!session},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
        }
        // #endregion
        
        if (!session) {
          // Not logged in, keep hidden
          return;
        }
        
        // Check if user has permission (admin or access_beam)
        return window.SDP.auth.getProfile().then(function(profile) {
          var isAdmin = profile && window.SDP.auth.isAdmin();
          var hasAccessBeam = profile && profile.access_beam === true;
          var hasPermission = isAdmin || hasAccessBeam;
          
          // #region agent log
          if (DEBUG_MODE) {
            fetch('http://127.0.0.1:7242/ingest/f6b33b86-5eb3-41dd-83f7-9e0a0382507b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'main.js:105',message:'Permission check result',data:{isAdmin:isAdmin,hasAccessBeam:hasAccessBeam,hasPermission:hasPermission,email:profile?.email,exSlimBoxNavExists:!!exSlimBoxNav,ex2NavExists:!!ex2Nav},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
          }
          // #endregion
          
          // Use updateNavVisibility function (defined below)
          updateNavVisibility(hasPermission);
          
          // 관리자 모드일 때 EXTRA SLIM Light / EXTRA Slim Heavy 항목 어둡게
          var adminDimItems = document.querySelectorAll('a.nav-dropdown-item[data-admin-dim]');
          adminDimItems.forEach(function(el) {
            if (isAdmin) {
              el.classList.add('admin-dim');
            } else {
              el.classList.remove('admin-dim');
            }
          });
          
          // #region agent log
          if (DEBUG_MODE && isAdmin && ex2Nav) {
            fetch('http://127.0.0.1:7242/ingest/f6b33b86-5eb3-41dd-83f7-9e0a0382507b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'main.js:128',message:'ex-2 nav shown',data:{display:ex2Nav.style.display},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
          }
          // #endregion
        }).catch(function(err) {
          // Error getting profile, keep hidden
          console.debug('Error checking admin status for EX-Slim-Box nav:', err);
        });
      }).catch(function(err) {
        // Error getting session, keep hidden
        console.debug('Error getting session for EX-Slim-Box nav:', err);
      });
    }
    
    // No auth check needed - menu is public and always visible
    // Removed all auth state listeners since menu is now public
  }

  // Initialize db-button: K-COL Product Schedule로 연결
  function initDbButton() {
    var dbButton = document.querySelector('.db-button');
    if (!dbButton) return;
    
    // ✅ 버튼은 표시
    dbButton.style.display = '';
    dbButton.style.cursor = 'pointer';
    
    // ✅ K-COL Product Schedule 링크로 연결
    dbButton.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      
      var scheduleLink = document.getElementById('kcol-product-schedule-link');
      if (scheduleLink) {
        // 링크 요소의 클릭 이벤트를 트리거하여 모달이 열리도록 함
        scheduleLink.click();
      } else {
        // 링크가 없으면 직접 경로로 이동
        window.location.href = 'pages/K-product/2H_steel_product.html';
      }
    });
  }

  // Init on DOM ready
  function init() {
    // #region agent log
    if (DEBUG_MODE) {
      fetch('http://127.0.0.1:7242/ingest/f6b33b86-5eb3-41dd-83f7-9e0a0382507b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'main.js:init',message:'init function called',data:{readyState:document.readyState},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'INIT'})}).catch(()=>{});
    }
    // #endregion
    initNavigation();
    initExSlimBoxNav();
    initDbButton();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  
  // Also try to initialize after a short delay to ensure DOM is fully ready
  setTimeout(function() {
    // #region agent log
    if (DEBUG_MODE) {
      fetch('http://127.0.0.1:7242/ingest/f6b33b86-5eb3-41dd-83f7-9e0a0382507b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'main.js:setTimeout',message:'Delayed init check',data:{readyState:document.readyState,exSlimBoxNavExists:!!document.getElementById('ex-slim-box-nav'),ex2NavExists:!!document.getElementById('ex-2')},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'DELAY'})}).catch(()=>{});
    }
    // #endregion
    // Re-initialize if elements exist but are not visible
    var exSlimBoxNav = document.getElementById('ex-slim-box-nav');
    var ex2Nav = document.getElementById('ex-2');
    if (exSlimBoxNav && (exSlimBoxNav.style.display === 'none' || !exSlimBoxNav.classList.contains('gold'))) {
      // #region agent log
      if (DEBUG_MODE) {
        fetch('http://127.0.0.1:7242/ingest/f6b33b86-5eb3-41dd-83f7-9e0a0382507b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'main.js:setTimeout',message:'Re-initializing exSlimBoxNav',data:{display:exSlimBoxNav.style.display,classes:exSlimBoxNav.className},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'RETRY'})}).catch(()=>{});
      }
      // #endregion
      exSlimBoxNav.style.display = 'flex';
      exSlimBoxNav.style.cursor = 'pointer';
      exSlimBoxNav.classList.remove('gray-text');
      exSlimBoxNav.classList.remove('small-text');
      exSlimBoxNav.classList.add('gold');
    }
    if (ex2Nav && (ex2Nav.style.display === 'none' || !ex2Nav.classList.contains('gold'))) {
      // #region agent log
      if (DEBUG_MODE) {
        fetch('http://127.0.0.1:7242/ingest/f6b33b86-5eb3-41dd-83f7-9e0a0382507b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'main.js:setTimeout',message:'Re-initializing ex2Nav',data:{display:ex2Nav.style.display,classes:ex2Nav.className},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'RETRY'})}).catch(()=>{});
      }
      // #endregion
      ex2Nav.style.display = 'flex';
      ex2Nav.style.cursor = 'pointer';
      ex2Nav.classList.remove('gray-text');
      ex2Nav.classList.remove('small-text');
      ex2Nav.classList.add('gold');
    }
  }, 500);

  // Show Castellated Beam selection modal
  function showCastellatedBeamSelectionModal() {
    // Create modal overlay if it doesn't exist
    var modalOverlay = document.getElementById('castellated-beam-modal');
    if (!modalOverlay) {
      modalOverlay = document.createElement('div');
      modalOverlay.id = 'castellated-beam-modal';
      modalOverlay.className = 'castellated-beam-modal-overlay';
      modalOverlay.innerHTML = `
        <div class="castellated-beam-modal">
          <div class="castellated-beam-modal-header">
            <div class="castellated-beam-modal-title">
              <strong>Castellated Beam Design</strong>
              <span>계산 방식을 선택하세요</span>
            </div>
            <button class="castellated-beam-modal-close" onclick="closeCastellatedBeamModal()">×</button>
          </div>
          <div class="castellated-beam-modal-image castellated-beam-modal-image-composite">
            <img src="/assets/images/composite_noncomposite.png" alt="비합성 / 합성 Castellated Beam" style="max-width: 100%; height: auto; display: block;">
          </div>
          <div class="castellated-beam-modal-content">
            <div class="castellated-beam-option" onclick="selectCastellatedBeamType('without-slab')">
              <div class="castellated-beam-option-icon">
                <img src="/assets/images/No_Slab-1.png" alt="No Slab" style="width: 100%; height: 100%; object-fit: contain;">
              </div>
              <div class="castellated-beam-option-title">Non Composite Castellated Beam<br>(Beam Only)</div>
              <div class="castellated-beam-option-desc">상부 슬래브가 없는 Castellated Beam 설계</div>
            </div>
            <div class="castellated-beam-option" onclick="selectCastellatedBeamType('with-slab')">
              <div class="castellated-beam-option-icon">
                <img src="/assets/images/SLAB-2.png" alt="Slab" style="width: 100%; height: 100%; object-fit: contain;">
              </div>
              <div class="castellated-beam-option-title">Composite Castellated Beam<br>with Top-Slab</div>
              <div class="castellated-beam-option-desc">구조계산은 Non Composite와 동일하며, 전단연결재를 이용하여 슬래브와 합성할 수 있는 구조계산입니다.</div>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(modalOverlay);
      
      // Close on overlay click
      modalOverlay.addEventListener('click', function(e) {
        if (e.target === modalOverlay) {
          closeCastellatedBeamModal();
        }
      });
      
      // Close on Escape key
      document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modalOverlay.classList.contains('active')) {
          closeCastellatedBeamModal();
        }
      });
    }
    
    modalOverlay.classList.add('active');
  }

  // Close Castellated Beam modal
  function closeCastellatedBeamModal() {
    var modalOverlay = document.getElementById('castellated-beam-modal');
    if (modalOverlay) {
      modalOverlay.classList.remove('active');
    }
  }

  // Select Castellated Beam type and redirect
  function selectCastellatedBeamType(type) {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/f6b33b86-5eb3-41dd-83f7-9e0a0382507b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'main.js:350',message:'Castellated Beam type selected',data:{type:type},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'AP'})}).catch(()=>{});
    // #endregion
    
    closeCastellatedBeamModal();
    
    if (type === 'without-slab') {
      // Redirect to Castellated Beam without top-slab calculator
      window.location.href = '/pages/k-col web software/Composite_CastellatedBeam_Design_Calculator.html?type=without-slab';
    } else if (type === 'with-slab') {
      // Redirect to Castellated Beam with top-slab calculator
      window.location.href = '/pages/k-col web software/Composite_CastellatedBeam_Design_Calculator.html?type=with-slab';
    }
  }

  // Make functions globally available
  window.showCastellatedBeamSelectionModal = showCastellatedBeamSelectionModal;
  window.closeCastellatedBeamModal = closeCastellatedBeamModal;
  window.selectCastellatedBeamType = selectCastellatedBeamType;

})();
