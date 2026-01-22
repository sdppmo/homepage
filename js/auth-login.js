(function() {
    'use strict';

    var form = document.getElementById('loginForm');
    var emailInput = document.getElementById('email');
    var passwordInput = document.getElementById('password');
    var passwordToggle = document.getElementById('passwordToggle');
    var loginBtn = document.getElementById('loginBtn');
    var errorMessage = document.getElementById('errorMessage');
    var forgotPassword = document.getElementById('forgotPassword');

    // Password visibility toggle
    passwordToggle.addEventListener('click', function() {
        var eyeIcon = passwordToggle.querySelector('.eye-icon');
        var eyeOffIcon = passwordToggle.querySelector('.eye-off-icon');
        
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            eyeIcon.style.display = 'none';
            eyeOffIcon.style.display = 'block';
        } else {
            passwordInput.type = 'password';
            eyeIcon.style.display = 'block';
            eyeOffIcon.style.display = 'none';
        }
    });

    // Get redirect URL from query params
    var params = new URLSearchParams(window.location.search);
    var redirectUrl = params.get('redirect') || '/';

    // Check if already logged in
    function checkSession() {
        if (window.SDP && window.SDP.auth) {
            window.SDP.auth.getSession().then(function(session) {
                if (session) {
                    // Already logged in - redirect
                    window.location.href = redirectUrl;
                }
            });
        }
    }

    // Wait for auth to load then check session
    function waitForAuth() {
        if (window.SDP && window.SDP.auth) {
            checkSession();
        } else {
            setTimeout(waitForAuth, 50);
        }
    }
    waitForAuth();

    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.classList.add('show');
    }

    function hideError() {
        errorMessage.classList.remove('show');
    }

    function setLoading(loading) {
        if (loading) {
            loginBtn.classList.add('loading');
            loginBtn.disabled = true;
        } else {
            loginBtn.classList.remove('loading');
            loginBtn.disabled = false;
        }
    }

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        hideError();

        var email = emailInput.value.trim();
        var password = passwordInput.value;

        if (!email || !password) {
            showError('이메일과 비밀번호를 모두 입력해주세요.');
            return;
        }

        setLoading(true);

        if (!window.SDP || !window.SDP.auth) {
            showError('잠시만 기다려주세요. 인증 시스템을 불러오는 중입니다.');
            setLoading(false);
            return;
        }

        window.SDP.auth.signInWithPassword(email, password)
            .then(function(result) {
                // Success - redirect
                window.location.href = redirectUrl;
            })
            .catch(function(err) {
                var message = err.message || '로그인에 실패했습니다.';
                // Translate common Supabase errors
                if (message.includes('Invalid login credentials')) {
                    message = '이메일 또는 비밀번호가 올바르지 않습니다. 다시 확인해주세요.';
                } else if (message.includes('Email not confirmed')) {
                    message = '이메일 인증이 완료되지 않았습니다. 받은 편지함을 확인해주세요.';
                }
                showError(message);
                setLoading(false);
            });
    });

    // Forgot password handler
    forgotPassword.addEventListener('click', function() {
        var email = emailInput.value.trim();
        if (!email) {
            emailInput.focus();
            showError('비밀번호를 재설정하려면 먼저 이메일 주소를 입력해주세요.');
            return;
        }

        if (!window.SDP || !window.SDP.auth) {
            showError('인증 시스템을 불러오는 중입니다. 잠시 후 다시 시도해주세요.');
            return;
        }

        setLoading(true);
        hideError();

        window.SDP.auth.getClient().then(function(client) {
            return client.auth.resetPasswordForEmail(email, {
                redirectTo: window.location.origin + '/pages/auth/reset-password.html'
            });
        }).then(function(result) {
            if (result.error) throw result.error;
            alert('비밀번호 재설정 링크를 이메일로 보내드렸습니다. 받은 편지함을 확인해주세요.');
            setLoading(false);
        }).catch(function(err) {
            showError(err.message || '비밀번호 재설정 이메일 발송에 실패했습니다.');
            setLoading(false);
        });
    });
})();
