(function() {
    'use strict';

    var passwordInput = document.getElementById('password');
    var passwordConfirmInput = document.getElementById('passwordConfirm');
    var passwordToggle = document.getElementById('passwordToggle');
    var passwordConfirmToggle = document.getElementById('passwordConfirmToggle');
    var resetBtn = document.getElementById('resetBtn');
    var errorMessage = document.getElementById('errorMessage');
    var resetForm = document.getElementById('resetForm');
    var successMessage = document.getElementById('successMessage');
    var loadingState = document.getElementById('loadingState');
    var passwordMatch = document.getElementById('passwordMatch');
    var passwordForm = document.getElementById('passwordForm');

    // Password requirement elements
    var reqLength = document.getElementById('reqLength');
    var reqLower = document.getElementById('reqLower');
    var reqUpper = document.getElementById('reqUpper');
    var reqNumber = document.getElementById('reqNumber');
    var reqSpecial = document.getElementById('reqSpecial');

    // Password toggle functionality
    function setupPasswordToggle(input, toggle) {
        toggle.addEventListener('click', function() {
            var eyeIcon = toggle.querySelector('.eye-icon');
            var eyeOffIcon = toggle.querySelector('.eye-off-icon');
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

    // Password validation
    function validatePassword(password) {
        var checks = {
            length: password.length >= 8,
            lower: /[a-z]/.test(password),
            upper: /[A-Z]/.test(password),
            number: /[0-9]/.test(password),
            special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
        };

        updateReqItem(reqLength, checks.length);
        updateReqItem(reqLower, checks.lower);
        updateReqItem(reqUpper, checks.upper);
        updateReqItem(reqNumber, checks.number);
        updateReqItem(reqSpecial, checks.special);

        return checks.length && checks.lower && checks.upper && checks.number && checks.special;
    }

    function updateReqItem(element, isValid) {
        var icon = element.querySelector('.req-icon');
        if (isValid) {
            element.classList.add('valid');
            icon.textContent = '✓';
        } else {
            element.classList.remove('valid');
            icon.textContent = '○';
        }
    }

    // Check password match
    function checkPasswordMatch() {
        var password = passwordInput.value;
        var confirm = passwordConfirmInput.value;
        
        if (confirm.length === 0) {
            passwordMatch.className = 'password-match';
            passwordMatch.textContent = '';
            return;
        }
        
        if (password === confirm) {
            passwordMatch.className = 'password-match show valid';
            passwordMatch.textContent = '✓ 비밀번호 일치';
        } else {
            passwordMatch.className = 'password-match show invalid';
            passwordMatch.textContent = '✗ 비밀번호 불일치';
        }
    }

    function passwordsMatch() {
        return passwordInput.value === passwordConfirmInput.value;
    }

    passwordInput.addEventListener('input', function() {
        validatePassword(passwordInput.value);
        checkPasswordMatch();
    });

    passwordConfirmInput.addEventListener('input', checkPasswordMatch);

    // Show/hide elements
    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.classList.add('show');
    }

    function hideError() {
        errorMessage.classList.remove('show');
    }

    function showSuccess() {
        resetForm.style.display = 'none';
        successMessage.classList.add('show');
    }

    function setLoading(isLoading) {
        if (isLoading) {
            loadingState.classList.add('show');
            resetForm.style.display = 'none';
        } else {
            loadingState.classList.remove('show');
            resetForm.style.display = 'block';
        }
    }

    // Handle form submission
    passwordForm.addEventListener('submit', function(e) {
        e.preventDefault();
        hideError();

        var password = passwordInput.value;
        var confirm = passwordConfirmInput.value;

        if (!validatePassword(password)) {
            showError('비밀번호 요구사항을 모두 충족해주세요');
            return;
        }

        if (!passwordsMatch()) {
            showError('비밀번호가 일치하지 않습니다');
            return;
        }

        resetBtn.disabled = true;
        resetBtn.textContent = '처리 중...';

        window.SDP.auth.getClient().then(function(client) {
            return client.auth.updateUser({ password: password });
        }).then(function(result) {
            if (result.error) throw result.error;
            showSuccess();
        }).catch(function(err) {
            resetBtn.disabled = false;
            resetBtn.textContent = '비밀번호 변경';
            showError(err.message || '비밀번호 변경에 실패했습니다');
        });
    });

    // Check for session on page load (user should have a session from the reset link)
    window.SDP.auth.getSession().then(function(session) {
        if (!session) {
            showError('유효하지 않거나 만료된 링크입니다. 비밀번호 재설정을 다시 요청해주세요.');
            resetBtn.disabled = true;
        }
    });
})();
