(function() {
    'use strict';

    // DOM Elements
    var statusEl = document.getElementById('status');
    var userListContainer = document.getElementById('userListContainer');
    var activityTableContainer = document.getElementById('activityTableContainer');
    var logoutBtn = document.getElementById('logoutBtn');
    var adminName = document.getElementById('adminName');
    var userSearch = document.getElementById('userSearch');

    // Create user elements
    var newEmail = document.getElementById('newEmail');
    var newPassword = document.getElementById('newPassword');
    var newBusiness = document.getElementById('newBusiness');
    var newBizNum = document.getElementById('newBizNum');
    var newPhone = document.getElementById('newPhone');
    var newApproved = document.getElementById('newApproved');
    var newAdmin = document.getElementById('newAdmin');
    var newColumn = document.getElementById('newColumn');
    var newBeam = document.getElementById('newBeam');
    var createUserBtn = document.getElementById('createUserBtn');

    // Summary elements
    var totalUsersEl = document.getElementById('totalUsers');
    var activeTodayEl = document.getElementById('activeToday');
    var totalAccessesEl = document.getElementById('totalAccesses');

    // Charts
    var featureChart = null;
    var dailyChart = null;

    // State
    var allUsers = [];
    var currentPeriod = '7d';
    var FUNCTION_PATH = '/functions/v1/admin-users';

    // Tab switching
    document.querySelectorAll('.tab').forEach(function(tab) {
        tab.addEventListener('click', function() {
            var tabId = this.dataset.tab;
            document.querySelectorAll('.tab').forEach(function(t) { t.classList.remove('active'); });
            document.querySelectorAll('.tab-content').forEach(function(c) { c.classList.remove('active'); });
            this.classList.add('active');
            document.getElementById('tab-' + tabId).classList.add('active');
            
            if (tabId === 'analytics') {
                loadAnalytics();
            } else if (tabId === 'page-usage') {
                loadPageUsage();
            }
        });
    });

    // Period selector
    document.querySelectorAll('.period-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.period-btn').forEach(function(b) { b.classList.remove('active'); });
            this.classList.add('active');
            currentPeriod = this.dataset.period;
            loadAnalytics();
        });
    });

    // Status messages
    function setStatus(type, message) {
        statusEl.textContent = message;
        statusEl.className = 'status show ' + type;
        if (type === 'success') {
            setTimeout(clearStatus, 3000);
        }
    }

    function clearStatus() {
        statusEl.className = 'status';
    }

    // API calls
    function callAdmin(action, payload) {
        return window.SDP.auth.getSession().then(function(session) {
            var token = session ? session.access_token : null;
            if (!token) throw new Error('No session');
            return fetch((window.SDP_AUTH_CONFIG.url || '') + FUNCTION_PATH, {
                method: 'POST',
                headers: {
                    Authorization: 'Bearer ' + token,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ action: action, payload: payload || {} })
            });
        }).then(function(resp) {
            if (!resp.ok) {
                return resp.text().then(function(text) {
                    throw new Error(text || 'Request failed');
                });
            }
            return resp.json();
        });
    }

    // Format date
    function formatDate(value) {
        if (!value) return '-';
        var date = new Date(value);
        if (isNaN(date.getTime())) return '-';
        return date.toLocaleDateString('ko-KR', { year: 'numeric', month: 'short', day: 'numeric' });
    }

    function escapeHtml(text) {
        var div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Check if user is pending (not email verified OR not approved)
    function isUserPending(user) {
        return !user.email_verified || !user.is_approved;
    }

    // Check if user is active (email verified AND approved)
    function isUserActive(user) {
        return user.email_verified && user.is_approved;
    }

    // Render a single user row
    function renderUserRow(user) {
        var html = '<tr data-user-id="' + user.id + '">';
        html += '<td><div class="user-info">';
        html += '<span class="user-name">' + (user.business_name || '사용자') + '</span>';
        html += '<span class="user-email">' + (user.email || '-') + '</span>';
        if (user.business_number) {
            html += '<span class="user-biz-number" style="display: block; margin-top: 4px; font-size: 12px; color: #94a3b8;">';
            html += '<strong style="color: #64748b;">사업자등록번호:</strong> ' + user.business_number;
            html += '</span>';
        } else {
            html += '<span class="user-biz-number" style="display: block; margin-top: 4px; font-size: 12px; color: #64748b; font-style: italic;">사업자등록번호 미입력</span>';
        }
        html += '</div></td>';
        html += '<td>' + formatDate(user.created_at) + '</td>';
        html += '<td>';
        
        // Email verification badge
        if (user.email_verified) {
            html += '<span class="badge email-verified">이메일 인증됨</span>';
        } else {
            html += '<span class="badge email-unverified">이메일 미인증</span>';
        }
        
        // Approval badge
        html += '<span class="badge ' + (user.is_approved ? 'approved' : 'pending') + '">';
        html += user.is_approved ? '승인됨' : '대기중';
        html += '</span>';
        
        if (user.role === 'admin') {
            html += '<span class="badge admin">관리자</span>';
        }
        html += '</td>';
        html += '<td>';
        
        // Permission toggles
        html += '<div style="display: flex; flex-wrap: wrap; gap: 8px;">';
        
        // Approved toggle (승인 button - also verifies email)
        html += '<label class="toggle-wrapper">';
        html += '<label class="toggle"><input type="checkbox" class="perm-toggle" data-field="is_approved" ' + (user.is_approved ? 'checked' : '') + '>';
        html += '<span class="toggle-slider"></span></label>';
        html += '<span class="toggle-label">승인</span></label>';
        
        // Column toggle
        html += '<label class="toggle-wrapper">';
        html += '<label class="toggle"><input type="checkbox" class="perm-toggle" data-field="access_column" ' + (user.access_column ? 'checked' : '') + '>';
        html += '<span class="toggle-slider"></span></label>';
        html += '<span class="toggle-label">Column</span></label>';
        
        // Beam toggle
        html += '<label class="toggle-wrapper">';
        html += '<label class="toggle"><input type="checkbox" class="perm-toggle" data-field="access_beam" ' + (user.access_beam ? 'checked' : '') + '>';
        html += '<span class="toggle-slider"></span></label>';
        html += '<span class="toggle-label">Beam</span></label>';
        
        // Admin toggle
        html += '<label class="toggle-wrapper">';
        html += '<label class="toggle"><input type="checkbox" class="perm-toggle" data-field="role" data-role-toggle="true" ' + (user.role === 'admin' ? 'checked' : '') + '>';
        html += '<span class="toggle-slider"></span></label>';
        html += '<span class="toggle-label" style="color: #a78bfa;">관리자</span></label>';
        
        html += '</div>';
        html += '</td>';
        html += '<td>';
        html += '<button class="action-btn primary edit-btn">수정</button>';
        html += '<button class="action-btn danger delete-btn">삭제</button>';
        html += '</td>';
        html += '</tr>';
        return html;
    }

    // Render user list with separate pending and active sections
    function renderUsers(users) {
        if (!users || !users.length) {
            userListContainer.innerHTML = '<div class="empty-state"><p>사용자가 없습니다</p></div>';
            return;
        }

        // Split users into pending and active
        var pendingUsers = users.filter(isUserPending);
        var activeUsers = users.filter(isUserActive);

        var html = '';

        // Pending Users Section
        html += '<div class="user-section pending-section">';
        html += '<div class="section-header">';
        html += '<h3 class="section-title">대기 중인 사용자</h3>';
        html += '<span class="section-count">' + pendingUsers.length + '명</span>';
        html += '</div>';
        
        if (pendingUsers.length === 0) {
            html += '<div class="empty-state"><p>대기 중인 사용자가 없습니다</p></div>';
        } else {
            html += '<table class="user-table"><thead><tr>' +
                '<th>사용자</th><th>가입일</th><th>상태</th><th>권한</th><th>작업</th>' +
                '</tr></thead><tbody>';
            pendingUsers.forEach(function(user) {
                html += renderUserRow(user);
            });
            html += '</tbody></table>';
        }
        html += '</div>';

        // Active Users Section
        html += '<div class="user-section active-section">';
        html += '<div class="section-header">';
        html += '<h3 class="section-title">활성 사용자</h3>';
        html += '<span class="section-count">' + activeUsers.length + '명</span>';
        html += '</div>';
        
        if (activeUsers.length === 0) {
            html += '<div class="empty-state"><p>활성 사용자가 없습니다</p></div>';
        } else {
            html += '<table class="user-table"><thead><tr>' +
                '<th>사용자</th><th>가입일</th><th>상태</th><th>권한</th><th>작업</th>' +
                '</tr></thead><tbody>';
            activeUsers.forEach(function(user) {
                html += renderUserRow(user);
            });
            html += '</tbody></table>';
        }
        html += '</div>';

        userListContainer.innerHTML = html;

        // Add event listeners for permission toggles
        userListContainer.querySelectorAll('.perm-toggle').forEach(function(toggle) {
            toggle.addEventListener('change', function() {
                var row = this.closest('tr');
                var userId = row.dataset.userId;
                var field = this.dataset.field;
                var isRoleToggle = this.dataset.roleToggle === 'true';
                var value = isRoleToggle ? (this.checked ? 'admin' : 'viewer') : this.checked;
                var updates = {};
                updates[field] = value;
                
                var toggleRef = this;
                callAdmin('update', { user_id: userId, updates: updates })
                    .then(function() {
                        // For approval changes, reload the list since user moves between sections
                        if (field === 'is_approved') {
                            loadUsers();
                            return;
                        }
                        
                        // Update local data for non-approval changes
                        var user = allUsers.find(function(u) { return u.id === userId; });
                        if (user) {
                            user[field] = value;
                        }
                        
                        // Update status badges in the row
                        var statusCell = row.querySelectorAll('td')[2]; // 3rd column is status
                        if (statusCell && field === 'role') {
                            var badgeHtml = '';
                            var role = value;
                            var isApproved = user ? user.is_approved : false;
                            var emailVerified = user ? user.email_verified : false;
                            
                            // Email verification badge
                            if (emailVerified) {
                                badgeHtml += '<span class="badge email-verified">이메일 인증됨</span>';
                            } else {
                                badgeHtml += '<span class="badge email-unverified">이메일 미인증</span>';
                            }
                            
                            badgeHtml += '<span class="badge ' + (isApproved ? 'approved' : 'pending') + '">';
                            badgeHtml += isApproved ? '승인됨' : '대기중';
                            badgeHtml += '</span>';
                            if (role === 'admin') {
                                badgeHtml += '<span class="badge admin">관리자</span>';
                            }
                            statusCell.innerHTML = badgeHtml;
                        }
                    })
                    .catch(function(err) {
                        setStatus('error', err.message || '업데이트 실패');
                        toggleRef.checked = !toggleRef.checked; // Revert
                    });
            });
        });

        userListContainer.querySelectorAll('.edit-btn').forEach(function(btn) {
            btn.addEventListener('click', function() {
                var row = this.closest('tr');
                var userId = row.dataset.userId;
                var user = allUsers.find(function(u) { return u.id === userId; });
                if (!user) return;
                
                openEditModal(user);
            });
        });

        userListContainer.querySelectorAll('.delete-btn').forEach(function(btn) {
            btn.addEventListener('click', function() {
                var row = this.closest('tr');
                var userId = row.dataset.userId;
                var user = allUsers.find(function(u) { return u.id === userId; });
                
                if (!confirm((user ? user.email : '이 사용자') + '를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) return;
                
                btn.disabled = true;
                callAdmin('delete', { user_id: userId })
                    .then(function() {
                        setStatus('success', '사용자가 삭제되었습니다');
                        loadUsers();
                    })
                    .catch(function(err) {
                        setStatus('error', err.message || '삭제 실패');
                        btn.disabled = false;
                    });
            });
        });
    }

    // Edit Modal
    function openEditModal(user) {
        // Create modal HTML
        var modalHtml = '<div class="modal-overlay" id="editModal">' +
            '<div class="modal">' +
            '<div class="modal-header">' +
            '<h2>사용자 정보 수정</h2>' +
            '<button class="modal-close" onclick="closeEditModal()">&times;</button>' +
            '</div>' +
            '<div class="modal-body">' +
            '<div class="modal-error" id="modalError"></div>' +
            '<div class="modal-field">' +
            '<label>이메일</label>' +
            '<input type="email" id="editEmail" value="' + (user.email || '') + '">' +
            '</div>' +
            '<div class="modal-field">' +
            '<label>회사명</label>' +
            '<input type="text" id="editBusiness" value="' + (user.business_name || '') + '">' +
            '</div>' +
            '<div class="modal-field">' +
            '<label>사업자등록번호</label>' +
            '<input type="text" id="editBizNum" value="' + (user.business_number || '') + '" placeholder="000-00-00000" maxlength="12">' +
            '</div>' +
            '<div class="modal-field">' +
            '<label>전화번호</label>' +
            '<input type="tel" id="editPhone" value="' + (user.phone || '') + '" placeholder="010-0000-0000" maxlength="13">' +
            '</div>' +
            '<div class="modal-section">' +
            '<h3>비밀번호 변경</h3>' +
            '<div class="modal-field">' +
            '<label>새 비밀번호 (변경 시에만 입력)</label>' +
            '<input type="password" id="editPassword" placeholder="새 비밀번호 입력">' +
            '<div id="pwdRequirements" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 4px 12px; margin-top: 8px; font-size: 11px;">' +
            '<span id="reqLen" style="color: #64748b;">○ 8자 이상</span>' +
            '<span id="reqLower" style="color: #64748b;">○ 소문자</span>' +
            '<span id="reqUpper" style="color: #64748b;">○ 대문자</span>' +
            '<span id="reqNum" style="color: #64748b;">○ 숫자</span>' +
            '<span id="reqSpec" style="color: #64748b;">○ 특수문자</span>' +
            '</div>' +
            '</div>' +
            '</div>' +
            '</div>' +
            '<div class="modal-footer">' +
            '<button class="modal-btn secondary" onclick="closeEditModal()">취소</button>' +
            '<button class="modal-btn primary" id="saveEditBtn">저장</button>' +
            '</div>' +
            '</div>' +
            '</div>';
        
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        
        // Auto-format phone number
        var editPhoneInput = document.getElementById('editPhone');
        editPhoneInput.addEventListener('input', function(e) {
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
        
        // Auto-format business number
        var editBizNumInput = document.getElementById('editBizNum');
        editBizNumInput.addEventListener('input', function(e) {
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
        
        // Password requirements validation
        var editPasswordInput = document.getElementById('editPassword');
        editPasswordInput.addEventListener('input', function() {
            var pwd = editPasswordInput.value;
            updateReq('reqLen', pwd.length >= 8);
            updateReq('reqLower', /[a-z]/.test(pwd));
            updateReq('reqUpper', /[A-Z]/.test(pwd));
            updateReq('reqNum', /[0-9]/.test(pwd));
            updateReq('reqSpec', /[!@#$%^&*(),.?":{}|<>]/.test(pwd));
        });
        
        function updateReq(id, valid) {
            var el = document.getElementById(id);
            if (valid) {
                el.style.color = '#10b981';
                el.textContent = '✓ ' + el.textContent.substring(2);
            } else {
                el.style.color = '#64748b';
                if (!el.textContent.startsWith('○')) {
                    el.textContent = '○ ' + el.textContent.substring(2);
                }
            }
        }
        
        function validatePassword(pwd) {
            if (!pwd) return true; // Empty is OK (no change)
            return pwd.length >= 8 && 
                   /[a-z]/.test(pwd) && 
                   /[A-Z]/.test(pwd) && 
                   /[0-9]/.test(pwd) && 
                   /[!@#$%^&*(),.?":{}|<>]/.test(pwd);
        }
        
        // Save button handler
        document.getElementById('saveEditBtn').addEventListener('click', function() {
            var email = document.getElementById('editEmail').value.trim();
            var business = document.getElementById('editBusiness').value.trim();
            var bizNum = document.getElementById('editBizNum').value.trim();
            var phone = document.getElementById('editPhone').value.trim();
            var password = document.getElementById('editPassword').value;
            var modalError = document.getElementById('modalError');
            var saveBtn = document.getElementById('saveEditBtn');
            
            if (!email) {
                modalError.textContent = '이메일은 필수입니다';
                modalError.classList.add('show');
                return;
            }
            
            // Validate password if provided
            if (password && !validatePassword(password)) {
                modalError.textContent = '비밀번호는 8자 이상, 대소문자, 숫자, 특수문자를 포함해야 합니다';
                modalError.classList.add('show');
                return;
            }
            
            saveBtn.disabled = true;
            saveBtn.textContent = '저장 중...';
            modalError.classList.remove('show');
            
            // Update profile
            var profileUpdates = {
                email: email,
                business_name: business || null,
                business_number: bizNum || null,
                phone: phone || null
            };
            
            callAdmin('update', { user_id: user.id, updates: profileUpdates })
                .then(function() {
                    // If password provided, update it too
                    if (password) {
                        return callAdmin('set_password', { user_id: user.id, password: password });
                    }
                    return Promise.resolve();
                })
                .then(function() {
                    closeEditModal();
                    loadUsers();
                })
                .catch(function(err) {
                    modalError.textContent = err.message || '저장 실패';
                    modalError.classList.add('show');
                    saveBtn.disabled = false;
                    saveBtn.textContent = '저장';
                });
        });
        
        // Close on overlay click
        document.getElementById('editModal').addEventListener('click', function(e) {
            if (e.target.id === 'editModal') {
                closeEditModal();
            }
        });
    }
    
    window.closeEditModal = function() {
        var modal = document.getElementById('editModal');
        if (modal) {
            modal.remove();
        }
    };

    // Load users
    function loadUsers() {
        callAdmin('list')
            .then(function(data) {
                allUsers = data.users || [];
                renderUsers(allUsers);
            })
            .catch(function(err) {
                setStatus('error', err.message || '사용자 목록을 불러오지 못했습니다');
            });
    }

    // Search users
    userSearch.addEventListener('input', function() {
        var query = this.value.toLowerCase().trim();
        if (!query) {
            renderUsers(allUsers);
            return;
        }
        var filtered = allUsers.filter(function(user) {
            return (user.email && user.email.toLowerCase().includes(query)) ||
                   (user.business_name && user.business_name.toLowerCase().includes(query)) ||
                   (user.business_number && user.business_number.includes(query));
        });
        renderUsers(filtered);
    });

    // Auto-format phone number in create form
    newPhone.addEventListener('input', function(e) {
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
    
    // Auto-format business number in create form
    newBizNum.addEventListener('input', function(e) {
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

    // Create user
    createUserBtn.addEventListener('click', function() {
        var email = newEmail.value.trim();
        var password = newPassword.value;
        var business = newBusiness.value.trim();
        var bizNum = newBizNum.value.trim();
        var phone = newPhone.value.trim();

        if (!email || !password) {
            setStatus('error', '이메일과 비밀번호는 필수입니다');
            return;
        }

        createUserBtn.disabled = true;
        setStatus('info', '사용자 생성 중...');

        callAdmin('create', {
            email: email,
            password: password,
            business_name: business,
            business_number: bizNum,
            phone: phone,
            is_approved: newApproved.checked,
            is_admin: newAdmin.checked,
            access_beam: newBeam.checked,
            access_column: newColumn.checked
        }).then(function() {
            setStatus('success', '사용자가 생성되었습니다');
            newEmail.value = '';
            newPassword.value = '';
            newBusiness.value = '';
            newBizNum.value = '';
            newPhone.value = '';
            newApproved.checked = false;
            newAdmin.checked = false;
            newBeam.checked = false;
            newColumn.checked = false;
            createUserBtn.disabled = false;
            loadUsers();
        }).catch(function(err) {
            createUserBtn.disabled = false;
            setStatus('error', err.message || '사용자 생성 실패');
        });
    });

    // Load analytics
    function loadAnalytics() {
        activityTableContainer.innerHTML = '<div class="loading"><div class="spinner"></div></div>';

        callAdmin('get_usage_stats', { period: currentPeriod })
            .then(function(data) {
                // Update summary cards
                totalUsersEl.textContent = data.summary.total_users || 0;
                activeTodayEl.textContent = data.summary.active_today || 0;
                totalAccessesEl.textContent = data.summary.total_accesses || 0;

                // Update feature chart
                updateFeatureChart(data.feature_usage || []);

                // Update daily chart
                updateDailyChart(data.daily_usage || []);

                // Update activity table
                renderActivityTable(data.user_activity || []);
            })
            .catch(function(err) {
                setStatus('error', err.message || '통계를 불러오지 못했습니다');
            });
    }

    // Feature chart
    function updateFeatureChart(data) {
        var ctx = document.getElementById('featureChart').getContext('2d');
        
        if (featureChart) {
            featureChart.destroy();
        }

        var labels = data.map(function(d) { return d.feature_name; });
        var counts = data.map(function(d) { return d.total_count; });

        featureChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: '사용 횟수',
                    data: counts,
                    backgroundColor: 'rgba(102, 126, 234, 0.6)',
                    borderColor: '#667eea',
                    borderWidth: 1,
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    x: {
                        grid: {
                            color: 'rgba(148, 163, 184, 0.1)'
                        },
                        ticks: {
                            color: '#94a3b8'
                        }
                    },
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(148, 163, 184, 0.1)'
                        },
                        ticks: {
                            color: '#94a3b8'
                        }
                    }
                }
            }
        });
    }

    // Daily chart
    function updateDailyChart(data) {
        var ctx = document.getElementById('dailyChart').getContext('2d');
        
        if (dailyChart) {
            dailyChart.destroy();
        }

        var labels = data.map(function(d) { 
            return new Date(d.date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
        });
        var counts = data.map(function(d) { return d.count; });

        dailyChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: '일별 사용량',
                    data: counts,
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#667eea',
                    pointBorderColor: '#667eea',
                    pointRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    x: {
                        grid: {
                            color: 'rgba(148, 163, 184, 0.1)'
                        },
                        ticks: {
                            color: '#94a3b8'
                        }
                    },
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(148, 163, 184, 0.1)'
                        },
                        ticks: {
                            color: '#94a3b8'
                        }
                    }
                }
            }
        });
    }

    // Activity table
    function renderActivityTable(data) {
        if (!data || !data.length) {
            activityTableContainer.innerHTML = '<div class="empty-state"><p>활동 데이터가 없습니다</p></div>';
            return;
        }

        var maxCount = Math.max.apply(null, data.map(function(d) { return d.access_count; }));

        var html = '<table class="activity-table"><thead><tr>' +
            '<th>사용자</th><th>회사명</th><th>접근 횟수</th><th>활동</th>' +
            '</tr></thead><tbody>';

        data.forEach(function(user) {
            var barWidth = (user.access_count / maxCount) * 100;
            html += '<tr>';
            html += '<td>' + (user.email || '-') + '</td>';
            html += '<td>' + (user.business_name || '-') + '</td>';
            html += '<td>' + user.access_count + '</td>';
            html += '<td><div class="activity-bar"><div class="activity-bar-fill" style="width: ' + barWidth + '%"></div></div></td>';
            html += '</tr>';
        });

        html += '</tbody></table>';
        activityTableContainer.innerHTML = html;
    }

    // ============================================
    // Page Usage Statistics
    // ============================================
    var pageUsageContainer = document.getElementById('pageUsageContainer');
    var refreshPageUsageBtn = document.getElementById('refreshPageUsageBtn');

    // Load page usage statistics
    function loadPageUsage() {
        if (!pageUsageContainer) return;
        
        pageUsageContainer.innerHTML = '<div class="loading"><div class="spinner"></div></div>';

        callAdmin('get_page_usage_stats', {})
            .then(function(data) {
                renderPageUsage(data);
            })
            .catch(function(err) {
                setStatus('error', err.message || '페이지 사용 통계를 불러오지 못했습니다');
                pageUsageContainer.innerHTML = '<div class="empty-state"><p>데이터를 불러올 수 없습니다</p></div>';
            });
    }

    // Render page usage statistics
    function renderPageUsage(data) {
        if (!data || !data.users || !data.users.length) {
            pageUsageContainer.innerHTML = '<div class="empty-state"><p>최근 2주간 사용 기록이 없습니다</p></div>';
            return;
        }

        var html = '<div class="page-usage-info" style="margin-bottom: 20px; padding: 12px; background: #f1f5f9; border-radius: 8px; font-size: 14px; color: #64748b;">';
        html += '<strong>기간:</strong> ' + formatDate(data.start_date) + ' ~ ' + formatDate(data.end_date);
        html += ' <span style="margin-left: 20px;"><strong>총 사용자:</strong> ' + data.users.length + '명</span>';
        html += '</div>';

        html += '<div class="page-usage-list">';
        
        data.users.forEach(function(user) {
            html += '<div class="page-usage-user-card" style="margin-bottom: 20px; padding: 20px; background: white; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">';
            html += '<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; padding-bottom: 12px; border-bottom: 2px solid #e2e8f0;">';
            html += '<div>';
            html += '<div style="font-weight: 600; font-size: 16px; color: #1e293b; margin-bottom: 4px;">' + (user.email || 'Unknown') + '</div>';
            html += '<div style="font-size: 14px; color: #64748b;">' + (user.business_name || '-') + '</div>';
            html += '</div>';
            html += '<div style="text-align: right;">';
            html += '<div style="font-size: 12px; color: #64748b; margin-bottom: 4px;">총 접근</div>';
            html += '<div style="font-weight: 700; font-size: 20px; color: #3b82f6;">' + user.total_accesses + '</div>';
            html += '<div style="font-size: 12px; color: #64748b; margin-top: 4px;">' + user.total_pages + '개 페이지</div>';
            html += '</div>';
            html += '</div>';

            if (user.pages && user.pages.length > 0) {
                html += '<div style="overflow-x: auto;">';
                html += '<table style="width: 100%; border-collapse: collapse; font-size: 14px;">';
                html += '<thead><tr style="background: #f8fafc; border-bottom: 2px solid #e2e8f0;">';
                html += '<th style="padding: 10px 12px; text-align: left; font-weight: 600; color: #475569;">페이지 경로</th>';
                html += '<th style="padding: 10px 12px; text-align: right; font-weight: 600; color: #475569; width: 100px;">사용 횟수</th>';
                html += '</tr></thead>';
                html += '<tbody>';

                user.pages.forEach(function(page) {
                    html += '<tr style="border-bottom: 1px solid #f1f5f9;">';
                    html += '<td style="padding: 10px 12px; color: #334155;">' + escapeHtml(page.page_path) + '</td>';
                    html += '<td style="padding: 10px 12px; text-align: right; font-weight: 600; color: #3b82f6;">' + page.count + '</td>';
                    html += '</tr>';
                });

                html += '</tbody></table>';
                html += '</div>';
            } else {
                html += '<div style="padding: 20px; text-align: center; color: #94a3b8; font-size: 14px;">사용 기록이 없습니다</div>';
            }

            html += '</div>';
        });

        html += '</div>';
        pageUsageContainer.innerHTML = html;
    }

    // Refresh button
    if (refreshPageUsageBtn) {
        refreshPageUsageBtn.addEventListener('click', function() {
            loadPageUsage();
        });
    }

    // Logout
    logoutBtn.addEventListener('click', function() {
        if (window.SDP && window.SDP.auth) {
            window.SDP.auth.logout();
        } else {
            window.location.assign('/');
        }
    });

    // Show access denied page
    function showAccessDenied(message) {
        document.body.style.visibility = 'visible';
        document.body.innerHTML = '<div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #0f172a; font-family: Inter, sans-serif;">' +
            '<div style="text-align: center; max-width: 400px; padding: 40px;">' +
            '<div style="width: 64px; height: 64px; background: rgba(239, 68, 68, 0.1); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px;">' +
            '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#f87171" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M15 9l-6 6M9 9l6 6"/></svg>' +
            '</div>' +
            '<h1 style="color: #f8fafc; font-size: 24px; margin-bottom: 12px;">접근 불가</h1>' +
            '<p style="color: #94a3b8; font-size: 14px; margin-bottom: 24px; line-height: 1.6;">' + message + '</p>' +
            '<p style="color: #64748b; font-size: 13px; margin-bottom: 20px;">3초 후 로그인 페이지로 이동합니다...</p>' +
            '<a href="/pages/auth/login.html" style="display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">로그인 페이지로 이동</a>' +
            '</div></div>';
        
        window.setTimeout(function() {
            location.replace('/pages/auth/login.html?redirect=/pages/admin.html');
        }, 3000);
    }

    // Initialize
    window.SDP.auth.getSession().then(function(session) {
        if (!session) {
            showAccessDenied('로그인이 필요합니다.');
            return;
        }
        return window.SDP.auth.getProfile().then(function(profile) {
            if (profile && profile.is_approved === false && profile.role !== 'admin') {
                showAccessDenied('계정 승인 대기 중입니다.');
                return;
            }
            if (!profile || profile.role !== 'admin') {
                showAccessDenied('관리자 권한이 필요합니다.<br>이 페이지는 관리자만 접근할 수 있습니다.');
                return;
            }
            
            document.body.classList.add('loaded');
            adminName.textContent = profile.email || '';
            loadUsers();
        });
    });
})();
