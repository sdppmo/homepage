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
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/f6b33b86-5eb3-41dd-83f7-9e0a0382507b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'main.js:22',message:'Nav item clicked',data:{tagName:this.tagName,text:this.textContent,hasHref:!!this.href,className:this.className},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
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
        fetch('http://127.0.0.1:7242/ingest/f6b33b86-5eb3-41dd-83f7-9e0a0382507b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'main.js:39',message:'Checking EX-Slim-Beam condition',data:{text:text,id:this.id,includesBeam:text.includes('EX-Slim-Beam'),includesBox:text.includes('EX-Slim-Box'),idMatch:this.id === 'ex-slim-box-nav'},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
        // #endregion
        
        if (text.includes('EX-Slim-Beam') || text.includes('EX-Slim-Box') || this.id === 'ex-slim-box-nav') {
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/f6b33b86-5eb3-41dd-83f7-9e0a0382507b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'main.js:45',message:'EX-Slim-Beam clicked - redirecting',data:{text:text,id:this.id,url:'/pages/k-col web software/ex-slim-beam-calculator.html'},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
          // #endregion
          e.preventDefault();
          e.stopPropagation();
          // 운영자만 접근 가능 - 이미 표시된 것은 운영자이므로 바로 이동
          window.location.href = '/pages/k-col web software/ex-slim-beam-calculator.html';
          return false;
        }
        
        // ex-2 (Castellated Beam) 클릭 처리
        if (this.id === 'ex-2') {
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/f6b33b86-5eb3-41dd-83f7-9e0a0382507b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'main.js:56',message:'ex-2 clicked',data:{id:this.id,text:text},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'F'})}).catch(()=>{});
          // #endregion
          e.preventDefault();
          e.stopPropagation();
          // Castellated Beam 계산서 (추후 구현 예정)
          alert('Castellated Beam 계산서는 추후 구현 예정입니다.');
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

  // Initialize EX-Slim-Box nav item: show only for admins
  function initExSlimBoxNav() {
    var exSlimBoxNav = document.getElementById('ex-slim-box-nav');
    var ex2Nav = document.getElementById('ex-2');
    
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/f6b33b86-5eb3-41dd-83f7-9e0a0382507b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'main.js:72',message:'initExSlimBoxNav called',data:{exSlimBoxNavExists:!!exSlimBoxNav,ex2NavExists:!!ex2Nav},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    
    if (!exSlimBoxNav) return;
    
    // Initially hide the nav items
    exSlimBoxNav.style.display = 'none';
    if (ex2Nav) {
      ex2Nav.style.display = 'none';
    }
    
    // Check if user is admin and show nav item if admin
    function checkAdminAndShowNav() {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/f6b33b86-5eb3-41dd-83f7-9e0a0382507b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'main.js:85',message:'checkAdminAndShowNav called',data:{hasSDP:!!window.SDP,hasAuth:!!(window.SDP && window.SDP.auth)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      // #endregion
      
      if (!window.SDP || !window.SDP.auth) {
        // Auth not available, keep hidden
        return;
      }
      
      window.SDP.auth.getSession().then(function(session) {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/f6b33b86-5eb3-41dd-83f7-9e0a0382507b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'main.js:95',message:'Session check result',data:{hasSession:!!session},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
        // #endregion
        
        if (!session) {
          // Not logged in, keep hidden
          return;
        }
        
        // Check if user is admin
        return window.SDP.auth.getProfile().then(function(profile) {
          var isAdmin = profile && window.SDP.auth.isAdmin();
          
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/f6b33b86-5eb3-41dd-83f7-9e0a0382507b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'main.js:105',message:'Admin check result',data:{isAdmin:isAdmin,email:profile?.email,exSlimBoxNavExists:!!exSlimBoxNav,ex2NavExists:!!ex2Nav},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
          // #endregion
          
          if (isAdmin) {
            // User is admin, show nav items
            exSlimBoxNav.style.display = 'flex';
            exSlimBoxNav.style.cursor = 'pointer';
            exSlimBoxNav.classList.remove('gray-text');
            exSlimBoxNav.classList.add('gold');
            
            if (ex2Nav) {
              ex2Nav.style.display = 'flex';
              ex2Nav.style.cursor = 'pointer';
              ex2Nav.classList.remove('gray-text');
              ex2Nav.classList.add('gold');
              
              // #region agent log
              fetch('http://127.0.0.1:7242/ingest/f6b33b86-5eb3-41dd-83f7-9e0a0382507b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'main.js:120',message:'ex-2 nav shown',data:{display:ex2Nav.style.display},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
              // #endregion
            }
          } else {
            // Not admin, keep hidden
            exSlimBoxNav.style.display = 'none';
            if (ex2Nav) {
              ex2Nav.style.display = 'none';
            }
          }
        }).catch(function(err) {
          // Error getting profile, keep hidden
          console.debug('Error checking admin status for EX-Slim-Box nav:', err);
        });
      }).catch(function(err) {
        // Error getting session, keep hidden
        console.debug('Error getting session for EX-Slim-Box nav:', err);
      });
    }
    
    // Wait for auth to be ready, then check
    if (window.SDP && window.SDP.auth) {
      // Auth is available, check immediately
      checkAdminAndShowNav();
    } else {
      // Wait for auth to load
      var checkInterval = setInterval(function() {
        if (window.SDP && window.SDP.auth) {
          clearInterval(checkInterval);
          checkAdminAndShowNav();
        }
      }, 100);
      
      // Stop checking after 5 seconds
      setTimeout(function() {
        clearInterval(checkInterval);
      }, 5000);
    }
  }

  // Initialize db-button: show only for admins
  function initDbButton() {
    var dbButton = document.querySelector('.db-button');
    if (!dbButton) return;
    
    // Initially hide the button
    dbButton.style.display = 'none';
    
    // Check if user is admin and show button if admin
    function checkAdminAndShowButton() {
      if (!window.SDP || !window.SDP.auth) {
        // Auth not available, keep hidden
        return;
      }
      
      window.SDP.auth.getSession().then(function(session) {
        if (!session) {
          // Not logged in, keep hidden
          return;
        }
        
        // Check if user is admin
        return window.SDP.auth.getProfile().then(function(profile) {
          if (profile && window.SDP.auth.isAdmin()) {
            // User is admin, show button
            dbButton.style.display = '';
            dbButton.style.cursor = 'pointer';
            
            // Add click handler
            dbButton.addEventListener('click', function() {
              window.location.href = '/pages/admin.html';
            });
          } else {
            // Not admin, keep hidden
            dbButton.style.display = 'none';
          }
        }).catch(function(err) {
          // Error getting profile, keep hidden
          console.debug('Error checking admin status for db-button:', err);
        });
      }).catch(function(err) {
        // Error getting session, keep hidden
        console.debug('Error getting session for db-button:', err);
      });
    }
    
    // Wait for auth to be ready, then check
    if (window.SDP && window.SDP.auth) {
      // Auth is available, check immediately
      checkAdminAndShowButton();
    } else {
      // Wait for auth to load
      var checkInterval = setInterval(function() {
        if (window.SDP && window.SDP.auth) {
          clearInterval(checkInterval);
          checkAdminAndShowButton();
        }
      }, 100);
      
      // Stop checking after 5 seconds
      setTimeout(function() {
        clearInterval(checkInterval);
      }, 5000);
    }
  }

  // Init on DOM ready
  function init() {
    initNavigation();
    initExSlimBoxNav();
    initDbButton();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
