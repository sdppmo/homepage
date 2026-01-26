/**
 * Admin Dashboard Controller
 * User management and analytics for administrators
 */

import { getSession, getProfile, signOut, UserProfile } from '@lib/auth';
import { config } from '@lib/config';

// Types
interface User {
  id: string;
  email: string;
  business_name: string | null;
  business_number: string | null;
  phone: string | null;
  is_approved: boolean;
  role: 'user' | 'admin' | 'viewer';
  access_beam: boolean;
  access_column: boolean;
  created_at: string;
}

interface UsageStats {
  summary: {
    total_users: number;
    active_today: number;
    total_accesses: number;
  };
  feature_usage: Array<{ feature_name: string; total_count: number }>;
  daily_usage: Array<{ date: string; count: number }>;
  user_activity: Array<{ email: string; business_name: string; access_count: number }>;
}

declare const Chart: any;

// State
let allUsers: User[] = [];
let currentPeriod = '7d';
let featureChart: any = null;
let dailyChart: any = null;
const FUNCTION_PATH = '/functions/v1/admin-users';

// DOM Elements
let statusEl: HTMLElement | null;
let userListContainer: HTMLElement | null;
let activityTableContainer: HTMLElement | null;
let logoutBtn: HTMLElement | null;
let adminName: HTMLElement | null;
let userSearch: HTMLInputElement | null;
let newEmail: HTMLInputElement | null;
let newPassword: HTMLInputElement | null;
let newBusiness: HTMLInputElement | null;
let newBizNum: HTMLInputElement | null;
let newPhone: HTMLInputElement | null;
let newApproved: HTMLInputElement | null;
let newAdmin: HTMLInputElement | null;
let newColumn: HTMLInputElement | null;
let newBeam: HTMLInputElement | null;
let createUserBtn: HTMLButtonElement | null;
let totalUsersEl: HTMLElement | null;
let activeTodayEl: HTMLElement | null;
let totalAccessesEl: HTMLElement | null;

// Status messages
function setStatus(type: 'success' | 'error' | 'info', message: string): void {
  if (!statusEl) return;
  statusEl.textContent = message;
  statusEl.className = `status show ${type}`;
  if (type === 'success') {
    setTimeout(clearStatus, 3000);
  }
}

function clearStatus(): void {
  if (!statusEl) return;
  statusEl.className = 'status';
}

// API calls
async function callAdmin<T>(action: string, payload?: Record<string, unknown>): Promise<T> {
  const session = await getSession();
  const token = session?.access_token;
  if (!token) throw new Error('No session');

  const response = await fetch(`${config.supabase.url}${FUNCTION_PATH}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ action, payload: payload || {} }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || 'Request failed');
  }

  return response.json();
}

// Format date
function formatDate(value: string | null): string {
  if (!value) return '-';
  const date = new Date(value);
  if (isNaN(date.getTime())) return '-';
  return date.toLocaleDateString('ko-KR', { year: 'numeric', month: 'short', day: 'numeric' });
}

// Render user list
function renderUsers(users: User[]): void {
  if (!userListContainer) return;

  if (!users.length) {
    userListContainer.innerHTML = '<div class="empty-state"><p>사용자가 없습니다</p></div>';
    return;
  }

  let html = `<table class="user-table"><thead><tr>
    <th>사용자</th><th>가입일</th><th>상태</th><th>권한</th><th>작업</th>
  </tr></thead><tbody>`;

  users.forEach((user) => {
    html += `<tr data-user-id="${user.id}">`;
    html += `<td><div class="user-info">
      <span class="user-name">${user.business_name || '사용자'}</span>
      <span class="user-email">${user.email || '-'}</span>
      ${user.business_number ? `<span class="user-email">${user.business_number}</span>` : ''}
    </div></td>`;
    html += `<td>${formatDate(user.created_at)}</td>`;
    html += `<td>
      <span class="badge ${user.is_approved ? 'approved' : 'pending'}">
        ${user.is_approved ? '승인됨' : '대기중'}
      </span>
      ${user.role === 'admin' ? '<span class="badge admin">관리자</span>' : ''}
    </td>`;
    html += `<td><div style="display: flex; flex-wrap: wrap; gap: 8px;">`;

    // Permission toggles
    const toggles = [
      { field: 'is_approved', checked: user.is_approved, label: '승인' },
      { field: 'access_column', checked: user.access_column, label: 'Column' },
      { field: 'access_beam', checked: user.access_beam, label: 'Beam' },
      { field: 'role', checked: user.role === 'admin', label: '관리자', isRole: true },
    ];

    toggles.forEach((t) => {
      const style = t.isRole ? 'style="color: #a78bfa;"' : '';
      const roleData = t.isRole ? 'data-role-toggle="true"' : '';
      html += `<label class="toggle-wrapper">
        <label class="toggle">
          <input type="checkbox" class="perm-toggle" data-field="${t.field}" ${roleData} ${t.checked ? 'checked' : ''}>
          <span class="toggle-slider"></span>
        </label>
        <span class="toggle-label" ${style}>${t.label}</span>
      </label>`;
    });

    html += `</div></td>`;
    html += `<td>
      <button class="action-btn primary edit-btn">수정</button>
      <button class="action-btn danger delete-btn">삭제</button>
    </td></tr>`;
  });

  html += '</tbody></table>';
  userListContainer.innerHTML = html;

  // Add event listeners
  attachUserEventListeners();
}

function attachUserEventListeners(): void {
  if (!userListContainer) return;

  // Permission toggles
  userListContainer.querySelectorAll('.perm-toggle').forEach((toggle) => {
    toggle.addEventListener('change', async function (this: HTMLInputElement) {
      const row = this.closest('tr') as HTMLTableRowElement;
      const userId = row.dataset.userId!;
      const field = this.dataset.field!;
      const isRoleToggle = this.dataset.roleToggle === 'true';
      const value = isRoleToggle ? (this.checked ? 'admin' : 'viewer') : this.checked;

      try {
        await callAdmin('update', { user_id: userId, updates: { [field]: value } });

        // Update local data
        const user = allUsers.find((u) => u.id === userId);
        if (user) {
          (user as any)[field] = value;
        }

        // Update status badges
        const statusCell = row.querySelectorAll('td')[2];
        if (statusCell && (field === 'is_approved' || field === 'role')) {
          const isApproved = field === 'is_approved' ? value : user?.is_approved;
          const role = field === 'role' ? value : user?.role;

          statusCell.innerHTML = `
            <span class="badge ${isApproved ? 'approved' : 'pending'}">
              ${isApproved ? '승인됨' : '대기중'}
            </span>
            ${role === 'admin' ? '<span class="badge admin">관리자</span>' : ''}
          `;
        }
      } catch (err) {
        setStatus('error', (err as Error).message || '업데이트 실패');
        this.checked = !this.checked; // Revert
      }
    });
  });

  // Edit buttons
  userListContainer.querySelectorAll('.edit-btn').forEach((btn) => {
    btn.addEventListener('click', (event) => {
      const row = (event.currentTarget as HTMLElement).closest('tr') as HTMLTableRowElement;
      const userId = row.dataset.userId;
      const user = allUsers.find((u) => u.id === userId);
      if (user) openEditModal(user);
    });
  });

  // Delete buttons
  userListContainer.querySelectorAll('.delete-btn').forEach((btn) => {
    btn.addEventListener('click', async function (this: HTMLButtonElement) {
      const row = this.closest('tr') as HTMLTableRowElement;
      const userId = row.dataset.userId!;
      const user = allUsers.find((u) => u.id === userId);

      if (!confirm(`${user?.email || '이 사용자'}를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`)) return;

      this.disabled = true;
      try {
        await callAdmin('delete', { user_id: userId });
        setStatus('success', '사용자가 삭제되었습니다');
        loadUsers();
      } catch (err) {
        setStatus('error', (err as Error).message || '삭제 실패');
        this.disabled = false;
      }
    });
  });
}

// Edit Modal
function openEditModal(user: User): void {
  const modalHtml = `
    <div class="modal-overlay" id="editModal">
      <div class="modal">
        <div class="modal-header">
          <h2>사용자 정보 수정</h2>
          <button class="modal-close" id="closeEditModalBtn">&times;</button>
        </div>
        <div class="modal-body">
          <div class="modal-error" id="modalError"></div>
          <div class="modal-field">
            <label>이메일</label>
            <input type="email" id="editEmail" value="${user.email || ''}">
          </div>
          <div class="modal-field">
            <label>회사명</label>
            <input type="text" id="editBusiness" value="${user.business_name || ''}">
          </div>
          <div class="modal-field">
            <label>사업자등록번호</label>
            <input type="text" id="editBizNum" value="${user.business_number || ''}" placeholder="000-00-00000" maxlength="12">
          </div>
          <div class="modal-field">
            <label>전화번호</label>
            <input type="tel" id="editPhone" value="${user.phone || ''}" placeholder="010-0000-0000" maxlength="13">
          </div>
          <div class="modal-section">
            <h3>비밀번호 변경</h3>
            <div class="modal-field">
              <label>새 비밀번호 (변경 시에만 입력)</label>
              <input type="password" id="editPassword" placeholder="새 비밀번호 입력">
              <div id="pwdRequirements" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 4px 12px; margin-top: 8px; font-size: 11px;">
                <span id="reqLen" style="color: #64748b;">○ 8자 이상</span>
                <span id="reqLower" style="color: #64748b;">○ 소문자</span>
                <span id="reqUpper" style="color: #64748b;">○ 대문자</span>
                <span id="reqNum" style="color: #64748b;">○ 숫자</span>
                <span id="reqSpec" style="color: #64748b;">○ 특수문자</span>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="modal-btn secondary" id="cancelEditBtn">취소</button>
          <button class="modal-btn primary" id="saveEditBtn">저장</button>
        </div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', modalHtml);

  const modal = document.getElementById('editModal')!;
  const editPhoneInput = document.getElementById('editPhone') as HTMLInputElement;
  const editBizNumInput = document.getElementById('editBizNum') as HTMLInputElement;
  const editPasswordInput = document.getElementById('editPassword') as HTMLInputElement;

  // Auto-format phone
  editPhoneInput.addEventListener('input', (e) => {
    const target = e.target as HTMLInputElement;
    const value = target.value.replace(/[^0-9]/g, '');
    if (value.length <= 3) {
      target.value = value;
    } else if (value.length <= 7) {
      target.value = `${value.slice(0, 3)}-${value.slice(3)}`;
    } else {
      target.value = `${value.slice(0, 3)}-${value.slice(3, 7)}-${value.slice(7, 11)}`;
    }
  });

  // Auto-format business number
  editBizNumInput.addEventListener('input', (e) => {
    const target = e.target as HTMLInputElement;
    const value = target.value.replace(/[^0-9]/g, '');
    if (value.length <= 3) {
      target.value = value;
    } else if (value.length <= 5) {
      target.value = `${value.slice(0, 3)}-${value.slice(3)}`;
    } else {
      target.value = `${value.slice(0, 3)}-${value.slice(3, 5)}-${value.slice(5, 10)}`;
    }
  });

  // Password validation
  editPasswordInput.addEventListener('input', () => {
    const pwd = editPasswordInput.value;
    updateReq('reqLen', pwd.length >= 8);
    updateReq('reqLower', /[a-z]/.test(pwd));
    updateReq('reqUpper', /[A-Z]/.test(pwd));
    updateReq('reqNum', /[0-9]/.test(pwd));
    updateReq('reqSpec', /[!@#$%^&*(),.?":{}|<>]/.test(pwd));
  });

  function updateReq(id: string, valid: boolean): void {
    const el = document.getElementById(id);
    if (!el) return;
    if (valid) {
      el.style.color = '#10b981';
      el.textContent = '✓ ' + el.textContent!.substring(2);
    } else {
      el.style.color = '#64748b';
      if (!el.textContent!.startsWith('○')) {
        el.textContent = '○ ' + el.textContent!.substring(2);
      }
    }
  }

  function validatePassword(pwd: string): boolean {
    if (!pwd) return true;
    return pwd.length >= 8 && /[a-z]/.test(pwd) && /[A-Z]/.test(pwd) && /[0-9]/.test(pwd) && /[!@#$%^&*(),.?":{}|<>]/.test(pwd);
  }

  // Save handler
  document.getElementById('saveEditBtn')!.addEventListener('click', async () => {
    const email = (document.getElementById('editEmail') as HTMLInputElement).value.trim();
    const business = (document.getElementById('editBusiness') as HTMLInputElement).value.trim();
    const bizNum = (document.getElementById('editBizNum') as HTMLInputElement).value.trim();
    const phone = (document.getElementById('editPhone') as HTMLInputElement).value.trim();
    const password = (document.getElementById('editPassword') as HTMLInputElement).value;
    const modalError = document.getElementById('modalError')!;
    const saveBtn = document.getElementById('saveEditBtn') as HTMLButtonElement;

    if (!email) {
      modalError.textContent = '이메일은 필수입니다';
      modalError.classList.add('show');
      return;
    }

    if (password && !validatePassword(password)) {
      modalError.textContent = '비밀번호는 8자 이상, 대소문자, 숫자, 특수문자를 포함해야 합니다';
      modalError.classList.add('show');
      return;
    }

    saveBtn.disabled = true;
    saveBtn.textContent = '저장 중...';
    modalError.classList.remove('show');

    try {
      await callAdmin('update', {
        user_id: user.id,
        updates: {
          email,
          business_name: business || null,
          business_number: bizNum || null,
          phone: phone || null,
        },
      });

      if (password) {
        await callAdmin('set_password', { user_id: user.id, password });
      }

      closeEditModal();
      loadUsers();
    } catch (err) {
      modalError.textContent = (err as Error).message || '저장 실패';
      modalError.classList.add('show');
      saveBtn.disabled = false;
      saveBtn.textContent = '저장';
    }
  });

  // Close handlers
  document.getElementById('closeEditModalBtn')!.addEventListener('click', closeEditModal);
  document.getElementById('cancelEditBtn')!.addEventListener('click', closeEditModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeEditModal();
  });
}

function closeEditModal(): void {
  document.getElementById('editModal')?.remove();
}

// Load users
async function loadUsers(): Promise<void> {
  try {
    const data = await callAdmin<{ users: User[] }>('list');
    allUsers = data.users || [];
    renderUsers(allUsers);
  } catch (err) {
    setStatus('error', (err as Error).message || '사용자 목록을 불러오지 못했습니다');
  }
}

// Load analytics
async function loadAnalytics(): Promise<void> {
  if (!activityTableContainer) return;
  activityTableContainer.innerHTML = '<div class="loading"><div class="spinner"></div></div>';

  try {
    const data = await callAdmin<UsageStats>('get_usage_stats', { period: currentPeriod });

    if (totalUsersEl) totalUsersEl.textContent = String(data.summary.total_users || 0);
    if (activeTodayEl) activeTodayEl.textContent = String(data.summary.active_today || 0);
    if (totalAccessesEl) totalAccessesEl.textContent = String(data.summary.total_accesses || 0);

    updateFeatureChart(data.feature_usage || []);
    updateDailyChart(data.daily_usage || []);
    renderActivityTable(data.user_activity || []);
  } catch (err) {
    setStatus('error', (err as Error).message || '통계를 불러오지 못했습니다');
  }
}

// Charts
function updateFeatureChart(data: Array<{ feature_name: string; total_count: number }>): void {
  const canvas = document.getElementById('featureChart') as HTMLCanvasElement;
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  if (featureChart) featureChart.destroy();

  featureChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: data.map((d) => d.feature_name),
      datasets: [{
        label: '사용 횟수',
        data: data.map((d) => d.total_count),
        backgroundColor: 'rgba(102, 126, 234, 0.6)',
        borderColor: '#667eea',
        borderWidth: 1,
        borderRadius: 4,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { color: 'rgba(148, 163, 184, 0.1)' }, ticks: { color: '#94a3b8' } },
        y: { beginAtZero: true, grid: { color: 'rgba(148, 163, 184, 0.1)' }, ticks: { color: '#94a3b8' } },
      },
    },
  });
}

function updateDailyChart(data: Array<{ date: string; count: number }>): void {
  const canvas = document.getElementById('dailyChart') as HTMLCanvasElement;
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  if (dailyChart) dailyChart.destroy();

  dailyChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: data.map((d) => new Date(d.date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })),
      datasets: [{
        label: '일별 사용량',
        data: data.map((d) => d.count),
        borderColor: '#667eea',
        backgroundColor: 'rgba(102, 126, 234, 0.1)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#667eea',
        pointBorderColor: '#667eea',
        pointRadius: 4,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { color: 'rgba(148, 163, 184, 0.1)' }, ticks: { color: '#94a3b8' } },
        y: { beginAtZero: true, grid: { color: 'rgba(148, 163, 184, 0.1)' }, ticks: { color: '#94a3b8' } },
      },
    },
  });
}

function renderActivityTable(data: Array<{ email: string; business_name: string; access_count: number }>): void {
  if (!activityTableContainer) return;

  if (!data.length) {
    activityTableContainer.innerHTML = '<div class="empty-state"><p>활동 데이터가 없습니다</p></div>';
    return;
  }

  const maxCount = Math.max(...data.map((d) => d.access_count));

  let html = `<table class="activity-table"><thead><tr>
    <th>사용자</th><th>회사명</th><th>접근 횟수</th><th>활동</th>
  </tr></thead><tbody>`;

  data.forEach((user) => {
    const barWidth = (user.access_count / maxCount) * 100;
    html += `<tr>
      <td>${user.email || '-'}</td>
      <td>${user.business_name || '-'}</td>
      <td>${user.access_count}</td>
      <td><div class="activity-bar"><div class="activity-bar-fill" style="width: ${barWidth}%"></div></div></td>
    </tr>`;
  });

  html += '</tbody></table>';
  activityTableContainer.innerHTML = html;
}

// Show access denied
function showAccessDenied(message: string): void {
  document.body.style.visibility = 'visible';
  document.body.innerHTML = `
    <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #0f172a; font-family: Inter, sans-serif;">
      <div style="text-align: center; max-width: 400px; padding: 40px;">
        <div style="width: 64px; height: 64px; background: rgba(239, 68, 68, 0.1); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px;">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#f87171" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M15 9l-6 6M9 9l6 6"/></svg>
        </div>
        <h1 style="color: #f8fafc; font-size: 24px; margin-bottom: 12px;">접근 불가</h1>
        <p style="color: #94a3b8; font-size: 14px; margin-bottom: 24px; line-height: 1.6;">${message}</p>
        <p style="color: #64748b; font-size: 13px; margin-bottom: 20px;">3초 후 로그인 페이지로 이동합니다...</p>
        <a href="/pages/auth/login.html" style="display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">로그인 페이지로 이동</a>
      </div>
    </div>
  `;

  setTimeout(() => {
    location.replace('/pages/auth/login.html?redirect=/pages/admin.html');
  }, 3000);
}

// Initialize
export async function initAdmin(): Promise<void> {
  // Cache DOM refs
  statusEl = document.getElementById('status');
  userListContainer = document.getElementById('userListContainer');
  activityTableContainer = document.getElementById('activityTableContainer');
  logoutBtn = document.getElementById('logoutBtn');
  adminName = document.getElementById('adminName');
  userSearch = document.getElementById('userSearch') as HTMLInputElement;
  newEmail = document.getElementById('newEmail') as HTMLInputElement;
  newPassword = document.getElementById('newPassword') as HTMLInputElement;
  newBusiness = document.getElementById('newBusiness') as HTMLInputElement;
  newBizNum = document.getElementById('newBizNum') as HTMLInputElement;
  newPhone = document.getElementById('newPhone') as HTMLInputElement;
  newApproved = document.getElementById('newApproved') as HTMLInputElement;
  newAdmin = document.getElementById('newAdmin') as HTMLInputElement;
  newColumn = document.getElementById('newColumn') as HTMLInputElement;
  newBeam = document.getElementById('newBeam') as HTMLInputElement;
  createUserBtn = document.getElementById('createUserBtn') as HTMLButtonElement;
  totalUsersEl = document.getElementById('totalUsers');
  activeTodayEl = document.getElementById('activeToday');
  totalAccessesEl = document.getElementById('totalAccesses');

  // Tab switching
  document.querySelectorAll('.tab').forEach((tab) => {
    tab.addEventListener('click', function (this: HTMLElement) {
      const tabId = this.dataset.tab;
      document.querySelectorAll('.tab').forEach((t) => t.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach((c) => c.classList.remove('active'));
      this.classList.add('active');
      document.getElementById(`tab-${tabId}`)?.classList.add('active');

      if (tabId === 'analytics') {
        loadAnalytics();
      }
    });
  });

  // Period selector
  document.querySelectorAll('.period-btn').forEach((btn) => {
    btn.addEventListener('click', function (this: HTMLElement) {
      document.querySelectorAll('.period-btn').forEach((b) => b.classList.remove('active'));
      this.classList.add('active');
      currentPeriod = this.dataset.period || '7d';
      loadAnalytics();
    });
  });

  // Search
  userSearch?.addEventListener('input', function () {
    const query = this.value.toLowerCase().trim();
    if (!query) {
      renderUsers(allUsers);
      return;
    }
    const filtered = allUsers.filter((user) =>
      user.email?.toLowerCase().includes(query) ||
      user.business_name?.toLowerCase().includes(query) ||
      user.business_number?.includes(query)
    );
    renderUsers(filtered);
  });

  // Auto-format phone
  newPhone?.addEventListener('input', (e) => {
    const target = e.target as HTMLInputElement;
    const value = target.value.replace(/[^0-9]/g, '');
    if (value.length <= 3) {
      target.value = value;
    } else if (value.length <= 7) {
      target.value = `${value.slice(0, 3)}-${value.slice(3)}`;
    } else {
      target.value = `${value.slice(0, 3)}-${value.slice(3, 7)}-${value.slice(7, 11)}`;
    }
  });

  // Auto-format business number
  newBizNum?.addEventListener('input', (e) => {
    const target = e.target as HTMLInputElement;
    const value = target.value.replace(/[^0-9]/g, '');
    if (value.length <= 3) {
      target.value = value;
    } else if (value.length <= 5) {
      target.value = `${value.slice(0, 3)}-${value.slice(3)}`;
    } else {
      target.value = `${value.slice(0, 3)}-${value.slice(3, 5)}-${value.slice(5, 10)}`;
    }
  });

  // Create user
  createUserBtn?.addEventListener('click', async () => {
    const email = newEmail?.value.trim();
    const password = newPassword?.value;

    if (!email || !password) {
      setStatus('error', '이메일과 비밀번호는 필수입니다');
      return;
    }

    createUserBtn!.disabled = true;
    setStatus('info', '사용자 생성 중...');

    try {
      await callAdmin('create', {
        email,
        password,
        business_name: newBusiness?.value.trim(),
        business_number: newBizNum?.value.trim(),
        phone: newPhone?.value.trim(),
        is_approved: newApproved?.checked,
        is_admin: newAdmin?.checked,
        access_beam: newBeam?.checked,
        access_column: newColumn?.checked,
      });

      setStatus('success', '사용자가 생성되었습니다');
      if (newEmail) newEmail.value = '';
      if (newPassword) newPassword.value = '';
      if (newBusiness) newBusiness.value = '';
      if (newBizNum) newBizNum.value = '';
      if (newPhone) newPhone.value = '';
      if (newApproved) newApproved.checked = false;
      if (newAdmin) newAdmin.checked = false;
      if (newBeam) newBeam.checked = false;
      if (newColumn) newColumn.checked = false;
      loadUsers();
    } catch (err) {
      setStatus('error', (err as Error).message || '사용자 생성 실패');
    } finally {
      createUserBtn!.disabled = false;
    }
  });

  // Logout
  logoutBtn?.addEventListener('click', () => signOut());

  // Auth check
  const session = await getSession();
  if (!session) {
    showAccessDenied('로그인이 필요합니다.');
    return;
  }

  const profile = await getProfile();
  if (profile?.is_approved === false && profile.role !== 'admin') {
    showAccessDenied('계정 승인 대기 중입니다.');
    return;
  }

  if (!profile || profile.role !== 'admin') {
    showAccessDenied('관리자 권한이 필요합니다.<br>이 페이지는 관리자만 접근할 수 있습니다.');
    return;
  }

  document.body.classList.add('loaded');
  if (adminName) adminName.textContent = profile.email || '';
  loadUsers();
}

// Auto-init
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAdmin);
} else {
  initAdmin();
}
