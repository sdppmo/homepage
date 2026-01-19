/**
 * Project Selection Modal
 * K-COL Product Schedule project chooser
 */

(function() {
  'use strict';

  // DOM refs
  var link = document.getElementById('kcol-product-schedule-link');
  var modal = document.getElementById('project-modal');
  var list = document.getElementById('project-list');
  var closeBtn = document.getElementById('project-modal-close');
  var lastEl = document.getElementById('project-last');
  var clearBtn = document.getElementById('project-clear-last');

  if (!link || !modal || !list) return;

  // Project data
  var PROJECTS = [
    { id: 'P1', name: '진흥기업', start: '2025.12.26', end: '2026.03.15' },
    { id: 'P2', name: '00프로젝트', start: '2025.12.26', end: '2026.03.15' },
    { id: 'P3', name: '00프로젝트', start: '2025.12.26', end: '2026.03.15' },
    { id: 'P4', name: '00프로젝트', start: '2025.12.26', end: '2026.03.15' },
    { id: 'P5', name: '00프로젝트', start: '2025.12.26', end: '2026.03.15' },
    { id: 'P6', name: '00프로젝트', start: '2025.12.26', end: '2026.03.15' }
  ];

  var STORAGE_KEY = 'kcol:lastProject';

  // Storage helpers
  function getLast() { return localStorage.getItem(STORAGE_KEY) || ''; }
  function setLast(id) { localStorage.setItem(STORAGE_KEY, id); }
  function clearLast() { localStorage.removeItem(STORAGE_KEY); }

  // UI
  function updateLastUI() {
    lastEl.textContent = getLast() || '(없음)';
  }

  function open() {
    updateLastUI();
    modal.style.display = 'block';
    modal.setAttribute('aria-hidden', 'false');
  }

  function close() {
    modal.style.display = 'none';
    modal.setAttribute('aria-hidden', 'true');
  }

  function go(id) {
    setLast(id);
    var url = new URL(link.getAttribute('href'), window.location.href);
    url.searchParams.set('project', id);
    window.location.href = url.toString();
  }

  // Render project cards
  function render() {
    var last = getLast();
    list.innerHTML = PROJECTS.map(function(p) {
      var isLast = last === p.id;
      return '<button type="button" class="proj-card" data-project="' + p.id + '">' +
        '<div class="proj-card-main">' +
          '<div class="proj-card-name">' + p.name + '</div>' +
          '<div class="proj-card-meta">' +
            '<span class="proj-badge">ID: ' + p.id + '</span>' +
            (isLast ? '<span class="proj-last">최근 선택</span>' : '') +
          '</div>' +
          '<div class="proj-card-schedule">' +
            '<span class="proj-schedule-icon">📅</span>' +
            '<span class="proj-schedule-text">' + p.start + ' ~ ' + p.end + '</span>' +
          '</div>' +
        '</div>' +
        '<div class="proj-card-right">›</div>' +
      '</button>';
    }).join('');
  }

  // Init
  render();

  // Events
  link.addEventListener('click', function(e) {
    e.preventDefault();
    open();
  });

  closeBtn.addEventListener('click', close);

  modal.addEventListener('click', function(e) {
    if (e.target === modal) close();
  });

  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') close();
  });

  list.addEventListener('click', function(e) {
    var btn = e.target.closest('button[data-project]');
    if (btn) go(btn.getAttribute('data-project'));
  });

  clearBtn.addEventListener('click', function() {
    clearLast();
    updateLastUI();
    render();
  });

})();
