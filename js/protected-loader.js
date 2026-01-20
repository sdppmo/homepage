/**
 * Protected Page Loader
 * Fetches protected content from Edge Function using Supabase client
 * 
 * Usage: Add to protected page shell:
 * <script src="../../js/auth-config.js"></script>
 * <script src="../../js/auth.js"></script>
 * <script src="../../js/protected-loader.js"></script>
 * <script>loadProtectedPage('auto-find-section');</script>
 */

(function() {
  'use strict';

  // Show loading state
  function showLoading() {
    document.body.innerHTML = '\
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); font-family: Arial, sans-serif;">\
        <div style="background: white; padding: 40px 60px; border-radius: 16px; box-shadow: 0 20px 60px rgba(0,0,0,0.3); text-align: center;">\
          <div style="width: 50px; height: 50px; border: 4px solid #e5e7eb; border-top-color: #667eea; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 20px;"></div>\
          <p style="color: #4b5563; font-size: 16px; margin: 0;">페이지 로딩 중...</p>\
        </div>\
      </div>\
      <style>@keyframes spin { to { transform: rotate(360deg); } }</style>\
    ';
  }

  // Show error state
  function showError(title, message, showLoginBtn) {
    var loginBtn = showLoginBtn ? '<button onclick="window.location.assign(\'/?auth=required&redirect=\' + encodeURIComponent(window.location.pathname))" style="background: linear-gradient(135deg, #667eea, #764ba2); color: white; border: none; padding: 12px 32px; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; margin-top: 20px;">로그인하기</button>' : '';
    var homeBtn = '<button onclick="window.location.assign(\'/\')" style="background: #6b7280; color: white; border: none; padding: 12px 32px; border-radius: 8px; font-size: 14px; cursor: pointer; margin-top: 10px; margin-left: 10px;">홈으로</button>';
    
    document.body.innerHTML = '\
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); font-family: Arial, sans-serif;">\
        <div style="background: white; padding: 40px 60px; border-radius: 16px; box-shadow: 0 20px 60px rgba(0,0,0,0.3); text-align: center; max-width: 400px;">\
          <div style="width: 60px; height: 60px; background: #fef2f2; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px;">\
            <span style="font-size: 28px;">🔒</span>\
          </div>\
          <h2 style="color: #1f2937; font-size: 22px; margin: 0 0 12px;">' + title + '</h2>\
          <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 0;">' + message + '</p>\
          <div style="margin-top: 24px;">' + loginBtn + homeBtn + '</div>\
        </div>\
      </div>\
    ';
  }

  // Wait for auth to be ready
  function waitForAuth(callback) {
    if (window.SDP && window.SDP.auth) {
      callback();
    } else {
      setTimeout(function() { waitForAuth(callback); }, 50);
    }
  }

  // Main loader function
  window.loadProtectedPage = function(pageId) {
    showLoading();

    waitForAuth(function() {
      var auth = window.SDP.auth;

      auth.getSession().then(function(session) {
        if (!session || !session.access_token) {
          showError('로그인 필요', '이 페이지에 접근하려면 로그인이 필요합니다.', true);
          return;
        }

        // Use Supabase client to invoke Edge Function
        auth.getClient().then(function(client) {
          client.functions.invoke('serve-protected-page', {
            body: { page: pageId }
          }).then(function(result) {
            console.log('Function result:', result);
            
            // Check for errors
            if (result.error) {
              console.error('Function error:', result.error);
              var title = '접근 불가';
              var showLogin = false;
              var message = '페이지에 접근할 수 없습니다.';
              
              // Try to parse error context if available
              var errorContext = result.error.context;
              if (errorContext && typeof errorContext === 'object') {
                try {
                  // Parse JSON from error context body if it exists
                  var bodyText = errorContext.body || '';
                  if (bodyText) {
                    var parsed = JSON.parse(bodyText);
                    message = parsed.message || message;
                    if (parsed.error === 'unauthorized') {
                      title = '로그인 필요';
                      showLogin = true;
                    } else if (parsed.error === 'pending') {
                      title = '승인 대기 중';
                    } else if (parsed.error === 'forbidden') {
                      title = '권한 없음';
                    }
                  }
                } catch (e) {
                  console.log('Error parsing context:', e);
                }
              }
              
              // Fallback: check error message directly
              var errMsg = result.error.message || '';
              if (errMsg.includes('로그인') || errMsg.includes('unauthorized')) {
                title = '로그인 필요';
                showLogin = true;
              } else if (errMsg.includes('승인') || errMsg.includes('pending')) {
                title = '승인 대기 중';
              } else if (errMsg.includes('권한') || errMsg.includes('forbidden')) {
                title = '권한 없음';
              }
              
              showError(title, message, showLogin);
              return;
            }

            // Success - render the HTML content
            var html = result.data;
            if (typeof html === 'string') {
              document.open();
              document.write(html);
              document.close();
            } else if (html && typeof html === 'object') {
              // Response might be parsed as JSON if it's an error
              if (html.error) {
                var errTitle = '접근 불가';
                if (html.error === 'unauthorized') errTitle = '로그인 필요';
                if (html.error === 'pending') errTitle = '승인 대기 중';
                if (html.error === 'forbidden') errTitle = '권한 없음';
                showError(errTitle, html.message || '페이지에 접근할 수 없습니다.', html.error === 'unauthorized');
              } else {
                showError('오류', '예상치 못한 응답 형식입니다.', false);
              }
            } else {
              showError('오류', '예상치 못한 응답 형식입니다.', false);
            }
          }).catch(function(error) {
            console.error('Invoke error:', error);
            showError('연결 오류', error.message || '서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.', false);
          });
        });
      });
    });
  };
})();
