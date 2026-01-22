(function() {
    'use strict';

    var form = document.getElementById('signupForm');
    var emailInput = document.getElementById('email');
    var passwordInput = document.getElementById('password');
    var passwordConfirmInput = document.getElementById('passwordConfirm');
    var passwordMatch = document.getElementById('passwordMatch');
    var passwordToggle = document.getElementById('passwordToggle');
    var passwordConfirmToggle = document.getElementById('passwordConfirmToggle');
    var businessInput = document.getElementById('business');
    var bizNumInput = document.getElementById('bizNum');
    var phoneInput = document.getElementById('phone');
    var signupBtn = document.getElementById('signupBtn');
    var errorMessage = document.getElementById('errorMessage');
    var successMessage = document.getElementById('successMessage');
    var loginLink = document.getElementById('loginLink');

    // Password requirements checker
    var reqLength = document.getElementById('reqLength');
    var reqLower = document.getElementById('reqLower');
    var reqUpper = document.getElementById('reqUpper');
    var reqNumber = document.getElementById('reqNumber');
    var reqSpecial = document.getElementById('reqSpecial');

    function updateRequirement(element, met) {
        if (met) {
            element.classList.add('met');
            element.querySelector('.req-icon').textContent = '✓';
        } else {
            element.classList.remove('met');
            element.querySelector('.req-icon').textContent = '○';
        }
    }

    function checkPasswordRequirements() {
        var password = passwordInput.value;
        
        updateRequirement(reqLength, password.length >= 8);
        updateRequirement(reqLower, /[a-z]/.test(password));
        updateRequirement(reqUpper, /[A-Z]/.test(password));
        updateRequirement(reqNumber, /\d/.test(password));
        updateRequirement(reqSpecial, /[!@#$%^&*(),.?":{}|<>]/.test(password));
    }

    function allRequirementsMet() {
        var password = passwordInput.value;
        return password.length >= 8 &&
               /[a-z]/.test(password) &&
               /[A-Z]/.test(password) &&
               /\d/.test(password) &&
               /[!@#$%^&*(),.?":{}|<>]/.test(password);
    }

    passwordInput.addEventListener('input', checkPasswordRequirements);
    passwordInput.addEventListener('input', checkPasswordMatch);
    passwordConfirmInput.addEventListener('input', checkPasswordMatch);

    // Password visibility toggle
    function setupPasswordToggle(input, toggleBtn) {
        toggleBtn.addEventListener('click', function() {
            var eyeIcon = toggleBtn.querySelector('.eye-icon');
            var eyeOffIcon = toggleBtn.querySelector('.eye-off-icon');
            
            if (input.type === 'password') {
                input.type = 'text';
                eyeIcon.style.display = 'none';
                eyeOffIcon.style.display = 'block';
            } else {
                input.type = 'password';
                eyeIcon.style.display = 'block';
                eyeOffIcon.style.display = 'none';
            }
        });
    }

    setupPasswordToggle(passwordInput, passwordToggle);
    setupPasswordToggle(passwordConfirmInput, passwordConfirmToggle);

    // Auto-format phone number (010-0000-0000)
    phoneInput.addEventListener('input', function(e) {
        var value = e.target.value.replace(/[^0-9]/g, '');
        var formatted = '';
        
        if (value.length <= 3) {
            formatted = value;
        } else if (value.length <= 7) {
            formatted = value.slice(0, 3) + '-' + value.slice(3);
        } else {
            formatted = value.slice(0, 3) + '-' + value.slice(3, 7) + '-' + value.slice(7, 11);
        }
        
        e.target.value = formatted;
    });

    // Auto-format business number (000-00-00000)
    bizNumInput.addEventListener('input', function(e) {
        var value = e.target.value.replace(/[^0-9]/g, '');
        var formatted = '';
        
        if (value.length <= 3) {
            formatted = value;
        } else if (value.length <= 5) {
            formatted = value.slice(0, 3) + '-' + value.slice(3);
        } else {
            formatted = value.slice(0, 3) + '-' + value.slice(3, 5) + '-' + value.slice(5, 10);
        }
        
        e.target.value = formatted;
    });

    function checkPasswordMatch() {
        var password = passwordInput.value;
        var confirm = passwordConfirmInput.value;
        
        if (confirm.length === 0) {
            passwordMatch.textContent = '';
            passwordMatch.className = 'password-match';
            return;
        }
        
        if (password === confirm) {
            passwordMatch.textContent = '✓ 비밀번호 일치';
            passwordMatch.className = 'password-match match';
        } else {
            passwordMatch.textContent = '✗ 비밀번호 불일치';
            passwordMatch.className = 'password-match no-match';
        }
    }

    function passwordsMatch() {
        return passwordInput.value === passwordConfirmInput.value;
    }

    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.classList.add('show');
        successMessage.classList.remove('show');
    }

    function showSuccess() {
        successMessage.classList.add('show');
        errorMessage.classList.remove('show');
        form.style.display = 'none';
        loginLink.style.display = 'none';
    }

    function showAlreadyRegistered() {
        document.getElementById('alreadyRegistered').classList.add('show');
        errorMessage.classList.remove('show');
        form.style.display = 'none';
        loginLink.style.display = 'none';
    }

    function hideMessages() {
        errorMessage.classList.remove('show');
        successMessage.classList.remove('show');
    }

    function setLoading(loading) {
        if (loading) {
            signupBtn.classList.add('loading');
            signupBtn.disabled = true;
        } else {
            signupBtn.classList.remove('loading');
            signupBtn.disabled = false;
        }
    }

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        hideMessages();

        var email = emailInput.value.trim();
        var password = passwordInput.value;
        var business = businessInput.value.trim();
        var bizNum = bizNumInput.value.trim();
        var phone = phoneInput.value.trim();

        if (!email || !password) {
            showError('이메일과 비밀번호를 모두 입력해주세요.');
            return;
        }

        if (!business) {
            showError('회사명을 입력해주세요.');
            return;
        }

        if (!bizNum || bizNum.length < 12) {
            showError('사업자등록번호를 정확히 입력해주세요. (000-00-00000)');
            return;
        }

        if (!phone || phone.length < 12) {
            showError('전화번호를 정확히 입력해주세요. (010-0000-0000)');
            return;
        }

        // Password complexity check
        if (!allRequirementsMet()) {
            showError('비밀번호 요구사항을 모두 충족해주세요.');
            return;
        }

        // Password match check
        if (!passwordsMatch()) {
            showError('비밀번호가 일치하지 않습니다.');
            return;
        }

        setLoading(true);

        if (!window.SDP || !window.SDP.auth) {
            showError('잠시만 기다려주세요. 인증 시스템을 불러오는 중입니다.');
            setLoading(false);
            return;
        }

        window.SDP.auth.getClient().then(function(client) {
            // Call Supabase Auth signUp directly
            // - Triggers confirmation email via configured SMTP template
            // - Stores business info in user_metadata
            // - Profile is created on pending.html AFTER email verification
            return client.auth.signUp({
                email: email,
                password: password,
                options: {
                    emailRedirectTo: 'https://kcol.kr/pages/auth/pending.html',
                    data: {
                        business_name: business,
                        business_number: bizNum,
                        phone: phone
                    }
                }
            });
        }).then(function(result) {
            if (result.error) {
                throw result.error;
            }
            
            if (!result.data.user) {
                throw new Error('회원가입에 실패했습니다.');
            }
            
            console.log('[Signup] User created:', result.data.user.id);
            console.log('[Signup] Verification email sent to:', email);
            
            // Show transitional message and redirect to pending page
            setLoading(false);
            successMessage.classList.add('show');
            form.style.display = 'none';
            loginLink.style.display = 'none';
            
            // Redirect to pending page after brief delay
            setTimeout(function() {
                window.location.assign('/pages/auth/pending.html');
            }, 800);
        }).catch(function(err) {
            var message = err.message || '회원가입에 실패했습니다.';
            console.error('[Signup] Error:', message);
            
            // Translate common Supabase errors
            if (message.includes('already registered') || message.includes('User already registered')) {
                showAlreadyRegistered();
                setLoading(false);
                return;
            } else if (message.includes('Password should be at least')) {
                message = '비밀번호가 너무 짧습니다. 8자 이상으로 설정해주세요.';
            } else if (message.includes('Invalid email')) {
                message = '유효하지 않은 이메일 주소입니다.';
            }
            showError(message);
            setLoading(false);
        });
    });
})();
