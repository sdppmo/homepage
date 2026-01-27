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
    
    // Function to show/hide nav items based on admin status
    function updateNavVisibility(isAdmin) {
      if (isAdmin) {
        exSlimBoxNav.style.display = 'flex';
        exSlimBoxNav.style.cursor = 'pointer';
        exSlimBoxNav.classList.remove('gray-text');
        exSlimBoxNav.classList.add('gold');
        
        if (ex2Nav) {
          ex2Nav.style.display = 'flex';
          ex2Nav.style.cursor = 'pointer';
          ex2Nav.classList.remove('gray-text');
          ex2Nav.classList.add('gold');
        }
      } else {
        exSlimBoxNav.style.display = 'none';
        if (ex2Nav) {
          ex2Nav.style.display = 'none';
        }
      }
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
          
          // Use updateNavVisibility function (defined below)
          updateNavVisibility(isAdmin);
          
          // #region agent log
          if (isAdmin && ex2Nav) {
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
    
    // Wait for auth to be ready, then check
    if (window.SDP && window.SDP.auth) {
      // Auth is available, check immediately
      checkAdminAndShowNav();
      
      // Also listen for auth state changes to update nav visibility automatically when admin logs in
      if (window.SDP.auth.getClient) {
        window.SDP.auth.getClient().then(function(client) {
          if (client && client.auth && client.auth.onAuthStateChange) {
            client.auth.onAuthStateChange(function(event, session) {
              // #region agent log
              fetch('http://127.0.0.1:7242/ingest/f6b33b86-5eb3-41dd-83f7-9e0a0382507b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'main.js:175',message:'Auth state changed',data:{event:event,hasSession:!!session},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'AN'})}).catch(()=>{});
              // #endregion
              
              if (session) {
                // User logged in, check if admin
                window.SDP.auth.getProfile().then(function(profile) {
                  var isAdmin = profile && window.SDP.auth.isAdmin();
                  // #region agent log
                  fetch('http://127.0.0.1:7242/ingest/f6b33b86-5eb3-41dd-83f7-9e0a0382507b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'main.js:182',message:'Auth state change - admin check',data:{isAdmin:isAdmin,email:profile?.email},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'AO'})}).catch(()=>{});
                  // #endregion
                  updateNavVisibility(isAdmin);
                }).catch(function(err) {
                  console.debug('Error checking admin on auth state change:', err);
                  updateNavVisibility(false);
                });
              } else {
                // User logged out, hide nav items
                updateNavVisibility(false);
              }
            });
          }
        }).catch(function(err) {
          console.debug('Error getting client for auth state listener:', err);
        });
      }
    } else {
      // Wait for auth to load
      var checkInterval = setInterval(function() {
        if (window.SDP && window.SDP.auth) {
          clearInterval(checkInterval);
          checkAdminAndShowNav();
          
          // Set up auth state change listener
          if (window.SDP.auth.getClient) {
            window.SDP.auth.getClient().then(function(client) {
              if (client && client.auth && client.auth.onAuthStateChange) {
                client.auth.onAuthStateChange(function(event, session) {
                  if (session) {
                    window.SDP.auth.getProfile().then(function(profile) {
                      var isAdmin = profile && window.SDP.auth.isAdmin();
                      updateNavVisibility(isAdmin);
                    }).catch(function(err) {
                      updateNavVisibility(false);
                    });
                  } else {
                    updateNavVisibility(false);
                  }
                });
              }
            }).catch(function(err) {
              console.debug('Error getting client for auth state listener:', err);
            });
          }
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
          <div class="castellated-beam-modal-content">
            <div class="castellated-beam-option" onclick="selectCastellatedBeamType('without-slab')">
              <div class="castellated-beam-option-icon">🏗️</div>
              <div class="castellated-beam-option-title">Non Composite Castillated Beam<br>(Beam Only)</div>
              <div class="castellated-beam-option-desc">상부 슬래브가 없는 Castellated Beam 설계</div>
            </div>
            <div class="castellated-beam-option" onclick="selectCastellatedBeamType('with-slab')">
              <div class="castellated-beam-option-icon">🏢</div>
              <div class="castellated-beam-option-title">Composite Castillated Beam<br>with Top-Slab</div>
              <div class="castellated-beam-option-desc">상부 슬래브가 있는 Castellated Beam 설계</div>
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
      window.location.href = '/pages/k-col web software/castellated-beam-calculator.html?type=without-slab';
    } else if (type === 'with-slab') {
      // Redirect to Castellated Beam with top-slab calculator
      window.location.href = '/pages/k-col web software/castellated-beam-calculator.html?type=with-slab';
    }
  }

  // Make functions globally available
  window.showCastellatedBeamSelectionModal = showCastellatedBeamSelectionModal;
  window.closeCastellatedBeamModal = closeCastellatedBeamModal;
  window.selectCastellatedBeamType = selectCastellatedBeamType;

})();
