const STORAGE_KEY = 'paragon-os-v1';
const app = document.querySelector('#app');
const commandHint = /Mac|iPhone|iPad/.test(navigator.platform) ? '⌘ K' : 'CTRL K';
const now = () => Date.now();
const uid = () => (globalThis.crypto?.randomUUID?.() || `id-${now()}-${Math.random().toString(36).slice(2)}`);
const esc = (value = '') => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
const shortDate = value => new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' }).format(value);
const longDate = value => new Intl.DateTimeFormat('en', { weekday: 'long', month: 'long', day: 'numeric' }).format(value);
const timeLabel = value => new Intl.DateTimeFormat('en', { hour: '2-digit', minute: '2-digit', hour12: false }).format(value);
const relativeDate = value => {
  const days = Math.floor((now() - value) / 86400000);
  return days < 1 ? 'Today' : days === 1 ? 'Yesterday' : shortDate(value);
};

const paths = {
  grid: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
  board: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M9 4v16M15 4v16"/>',
  note: '<path d="M5 3h10l4 4v14H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z"/><path d="M14 3v5h5M7 12h8M7 16h6"/>',
  flow: '<rect x="2" y="3" width="7" height="6" rx="1"/><rect x="15" y="15" width="7" height="6" rx="1"/><path d="M9 6h5a3 3 0 0 1 3 3v6M17 12v3M2 18h9M7 14v8"/>',
  agents: '<path d="M12 3 4 7v10l8 4 8-4V7l-8-4Z"/><path d="m4 7 8 4 8-4M12 11v10M8 15h1M15 15h1"/>',
  focus: '<circle cx="12" cy="13" r="8"/><path d="M12 9v4l3 2M9 2h6M12 2v3"/>',
  activity: '<path d="M3 12h4l3-7 4 14 3-7h4"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06-1.87 1.87-.06-.06A1.7 1.7 0 0 0 16 18.4a1.7 1.7 0 0 0-1 1.56V20H9v-.04a1.7 1.7 0 0 0-1-1.56 1.7 1.7 0 0 0-1.87.34l-.06.06L4.2 16.93l.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-1.56-1H3v-4h.04A1.7 1.7 0 0 0 4.6 9a1.7 1.7 0 0 0-.34-1.87L4.2 7.07 6.07 5.2l.06.06A1.7 1.7 0 0 0 8 5.6 1.7 1.7 0 0 0 9 4.04V4h6v.04a1.7 1.7 0 0 0 1 1.56 1.7 1.7 0 0 0 1.87-.34l.06-.06 1.87 1.87-.06.06A1.7 1.7 0 0 0 19.4 9a1.7 1.7 0 0 0 1.56 1H21v4h-.04A1.7 1.7 0 0 0 19.4 15Z"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  arrow: '<path d="M4 12h16m-6-6 6 6-6 6"/>',
  chevron: '<path d="m6 9 6 6 6-6"/>',
  check: '<path d="m4 12 5 5L20 6"/>',
  close: '<path d="M5 5 19 19M19 5 5 19"/>',
  bolt: '<path d="m13 2-9 11h7l-1 9 10-12h-7V2Z"/>',
  play: '<path d="m8 5 12 7-12 7V5Z"/>',
  pause: '<path d="M8 5v14M16 5v14"/>',
  reset: '<path d="M3 11a9 9 0 1 1 2.4 6.1M3 17v-6h6"/>',
  more: '<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>',
  pin: '<path d="m16 3 5 5-3 1-3 5-2-2-5 5-2-2 5-5-2-2 5-3 2-2ZM3 21l5-5"/>',
  trash: '<path d="M4 7h16M9 7V4h6v3M6 7l1 14h10l1-14M10 11v6M14 11v6"/>',
  copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"/>',
  download: '<path d="M12 3v13m-5-5 5 5 5-5M4 18v3h16v-3"/>',
  upload: '<path d="M12 17V4m-5 5 5-5 5 5M4 18v3h16v-3"/>',
  moon: '<path d="M20 15.5A8.5 8.5 0 0 1 8.5 4a8.5 8.5 0 1 0 11.5 11.5Z"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  link: '<path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7"/>',
  spark: '<path d="m12 2 2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5L12 2Z"/>',
  list: '<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
  corner: '<path d="M4 4h7M4 4v7M20 20h-7M20 20v-7"/>'
};
const icon = (name, size = 18) => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.grid}</svg>`;

function seed() {
  const t = now();
  const operations = uid();
  const lab = uid();
  return {
    version: 1,
    spaces: [
      { id: operations, name: 'Launch operations', code: 'OPS', createdAt: t },
      { id: lab, name: 'Personal lab', code: 'LAB', createdAt: t }
    ],
    activeSpaceId: operations,
    tasks: [
      { id: uid(), spaceId: operations, title: 'Map the launch sequence', detail: 'Outline the milestones and owners for the next release.', status: 'progress', priority: 'high', createdAt: t - 3600000 },
      { id: uid(), spaceId: operations, title: 'Review infrastructure checklist', detail: 'Confirm monitoring, backups, and deployment path.', status: 'planned', priority: 'high', createdAt: t - 7200000 },
      { id: uid(), spaceId: operations, title: 'Draft an operator brief', detail: 'Prepare a short brief for the team handoff.', status: 'planned', priority: 'normal', createdAt: t - 10000000 },
      { id: uid(), spaceId: operations, title: 'Set up project space', detail: 'A place for decisions, tasks, and repeatable work.', status: 'done', priority: 'normal', createdAt: t - 86400000 },
      { id: uid(), spaceId: lab, title: 'Capture three useful experiments', detail: 'Record hypotheses worth testing this week.', status: 'planned', priority: 'normal', createdAt: t - 3600000 }
    ],
    notes: [
      { id: uid(), spaceId: operations, title: 'Launch principles', body: 'Ship the smallest reliable path.\n\nKeep the operator in control. Every automated step should leave a clear trace.\n\nMake the next action obvious.', pinned: true, updatedAt: t - 5400000 },
      { id: uid(), spaceId: operations, title: 'Release notes draft', body: 'What changed\n- A clearer way to see active work\n- Repeatable routines for common handoffs\n\nWhat to validate\n- The recovery path\n- Notification routing', pinned: false, updatedAt: t - 86400000 },
      { id: uid(), spaceId: lab, title: 'Lab log', body: 'A place for the ideas worth revisiting.\n\nStart with one concrete experiment.', pinned: true, updatedAt: t - 7200000 }
    ],
    flows: [
      { id: uid(), spaceId: operations, name: 'Morning alignment', description: 'Start the day with a clear set of next moves.', enabled: true, lastRun: null, steps: [
        { id: uid(), type: 'task', content: 'Review the three most important priorities' },
        { id: uid(), type: 'note', content: 'Today’s focus\n\n1. What must move?\n2. What is blocked?\n3. Who needs an update?' },
        { id: uid(), type: 'log', content: 'Morning alignment prepared the workspace.' }
      ] },
      { id: uid(), spaceId: operations, name: 'Release handoff', description: 'Create a repeatable release checkpoint.', enabled: true, lastRun: null, steps: [
        { id: uid(), type: 'task', content: 'Confirm release readiness with owners' },
        { id: uid(), type: 'task', content: 'Publish the operator handoff' },
        { id: uid(), type: 'note', content: 'Release handoff\n\nStatus:\nOwner:\nOpen risks:\nNext checkpoint:' }
      ] },
      { id: uid(), spaceId: lab, name: 'Experiment kickoff', description: 'Give a new idea a concrete starting point.', enabled: true, lastRun: null, steps: [
        { id: uid(), type: 'note', content: 'Experiment\n\nHypothesis:\nSuccess signal:\nFirst test:' },
        { id: uid(), type: 'task', content: 'Run the first experiment' }
      ] }
    ],
    activity: [
      { id: uid(), spaceId: operations, kind: 'system', title: 'Workspace ready', detail: 'Your work stays in this browser.', time: t - 1800000 },
      { id: uid(), spaceId: lab, kind: 'system', title: 'Lab ready', detail: 'A second space for exploration.', time: t - 1800000 }
    ],
    draft: { role: 'operator', objective: '', context: '', generated: false },
    focus: { duration: 25, remaining: 25 * 60, status: 'idle', endAt: null, taskId: '' },
    settings: { theme: 'light' }
  };
}

function validSnapshot(value) {
  const object = item => item !== null && typeof item === 'object' && !Array.isArray(item);
  const text = item => typeof item === 'string';
  const stamp = item => typeof item === 'number' && Number.isFinite(item);
  if (!object(value) || value.version !== 1) return false;
  if (!Array.isArray(value.spaces) || !value.spaces.length || !value.spaces.every(s => object(s) && text(s.id) && text(s.name) && text(s.code) && stamp(s.createdAt))) return false;
  if (!text(value.activeSpaceId) || !value.spaces.some(s => s.id === value.activeSpaceId)) return false;
  if (!Array.isArray(value.tasks) || !value.tasks.every(t => object(t) && text(t.id) && text(t.spaceId) && text(t.title) && text(t.detail) && ['planned', 'progress', 'done'].includes(t.status) && ['normal', 'high'].includes(t.priority) && stamp(t.createdAt))) return false;
  if (!Array.isArray(value.notes) || !value.notes.every(n => object(n) && text(n.id) && text(n.spaceId) && text(n.title) && text(n.body) && typeof n.pinned === 'boolean' && stamp(n.updatedAt))) return false;
  if (!Array.isArray(value.flows) || !value.flows.every(f => object(f) && text(f.id) && text(f.spaceId) && text(f.name) && text(f.description) && typeof f.enabled === 'boolean' && (f.lastRun === null || stamp(f.lastRun)) && Array.isArray(f.steps) && f.steps.every(s => object(s) && text(s.id) && ['task', 'note', 'log'].includes(s.type) && text(s.content)))) return false;
  if (!Array.isArray(value.activity) || !value.activity.every(a => object(a) && text(a.id) && text(a.spaceId) && text(a.kind) && text(a.title) && text(a.detail) && stamp(a.time))) return false;
  if (!object(value.draft) || !['operator', 'researcher', 'reviewer'].includes(value.draft.role) || !text(value.draft.objective) || !text(value.draft.context) || typeof value.draft.generated !== 'boolean') return false;
  if (!object(value.focus) || ![15, 25, 45].includes(value.focus.duration) || !stamp(value.focus.remaining) || !['idle', 'running', 'paused'].includes(value.focus.status) || !(value.focus.endAt === null || stamp(value.focus.endAt)) || !text(value.focus.taskId)) return false;
  return object(value.settings) && ['light', 'dark'].includes(value.settings.theme);
}

function load() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (validSnapshot(parsed)) return parsed;
  } catch {}
  return seed();
}

let data = load();
let ui = { view: 'home', modal: null, palette: false, paletteQuery: '', paletteIndex: 0, paletteResults: [], spaceMenu: false, activityPanel: false, selectedNoteId: null, selectedFlowId: null, noteQuery: '', toast: null };
let toastTimer;
const save = () => {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); }
  catch { toast('Local storage is unavailable. Changes may not survive a reload.', 'error'); }
};
const space = () => data.spaces.find(item => item.id === data.activeSpaceId) || data.spaces[0];
const inSpace = list => list.filter(item => item.spaceId === data.activeSpaceId);
const taskCounts = () => ({
  planned: inSpace(data.tasks).filter(item => item.status === 'planned').length,
  progress: inSpace(data.tasks).filter(item => item.status === 'progress').length,
  done: inSpace(data.tasks).filter(item => item.status === 'done').length
});
const addActivity = (kind, title, detail = '', spaceId = data.activeSpaceId) => {
  data.activity.unshift({ id: uid(), spaceId, kind, title, detail, time: now() });
  data.activity = data.activity.slice(0, 100);
};
const activateView = view => {
  ui.view = view;
  ui.modal = null;
  ui.palette = false;
  ui.spaceMenu = false;
  ui.activityPanel = false;
  if (view === 'notes' && !inSpace(data.notes).some(n => n.id === ui.selectedNoteId)) ui.selectedNoteId = inSpace(data.notes)[0]?.id || null;
  if (view === 'flows' && !inSpace(data.flows).some(f => f.id === ui.selectedFlowId)) ui.selectedFlowId = inSpace(data.flows)[0]?.id || null;
  render();
};
const toast = (message, type = 'success') => {
  clearTimeout(toastTimer);
  ui.toast = { message, type };
  const host = document.querySelector('#toast-host');
  if (host) host.innerHTML = renderToast();
  toastTimer = setTimeout(() => { ui.toast = null; const el = document.querySelector('#toast-host'); if (el) el.innerHTML = ''; }, 3600);
};
const renderToast = () => ui.toast ? `<div class="toast ${ui.toast.type}" role="status">${icon(ui.toast.type === 'error' ? 'close' : 'check', 17)}<span>${esc(ui.toast.message)}</span></div>` : '';

function render() {
  document.documentElement.dataset.theme = data.settings.theme;
  const s = space();
  const counts = taskCounts();
  const mobileSpaceMenu = ui.spaceMenu ? `<div class="mobile-space-popover">${data.spaces.map(item => `<button data-action="switch-space" data-id="${esc(item.id)}" class="space-option ${item.id === s.id ? 'selected' : ''}"><span class="space-option-code">${esc(item.code || 'WRK')}</span><span>${esc(item.name)}</span>${item.id === s.id ? icon('check', 15) : ''}</button>`).join('')}<button data-action="new-space" class="space-create">${icon('plus', 15)} New space</button></div>` : '';
  const tabs = [
    ['home', 'Overview', 'grid'], ['board', 'Workboard', 'board'], ['notes', 'Notes', 'note'],
    ['flows', 'Routines', 'flow'], ['agents', 'Agent desk', 'agents'], ['focus', 'Focus', 'focus'], ['activity', 'Activity', 'activity']
  ];
  app.innerHTML = `
    <div class="os-shell">
      <aside class="icon-rail" aria-label="Quick navigation">
        <button class="brand-mark" data-action="view" data-view="home" aria-label="Paragon OS home"><span class="brand-diamond"></span></button>
        <div class="rail-divider"></div>
        <div class="rail-links">${tabs.slice(0, 6).map(([view, label, symbol]) => `<button class="rail-button ${ui.view === view ? 'active' : ''}" data-action="view" data-view="${view}" title="${label}" aria-label="${label}">${icon(symbol, 20)}</button>`).join('')}</div>
        <div class="rail-spacer"></div>
        <button class="rail-button ${ui.view === 'activity' ? 'active' : ''}" data-action="view" data-view="activity" title="Activity" aria-label="Activity">${icon('activity', 20)}</button>
        <button class="rail-button ${ui.view === 'settings' ? 'active' : ''}" data-action="view" data-view="settings" title="Settings" aria-label="Settings">${icon('settings', 20)}</button>
      </aside>

      <aside class="context-rail" aria-label="Workspace navigation">
        <div class="wordmark">PARAGON<span> / OS</span></div>
        <div class="space-block">
          <div class="eyebrow">CURRENT SPACE <span>·</span> ${esc(s.code || 'WRK')}</div>
          <button class="space-switch" data-action="space-menu" aria-expanded="${ui.spaceMenu}"><span class="space-avatar">${esc((s.code || 'W').slice(0, 2))}</span><span class="space-title">${esc(s.name)}</span>${icon('chevron', 16)}</button>
          ${ui.spaceMenu ? `<div class="space-popover">${data.spaces.map(item => `<button data-action="switch-space" data-id="${esc(item.id)}" class="space-option ${item.id === s.id ? 'selected' : ''}"><span class="space-option-code">${esc(item.code || 'WRK')}</span><span>${esc(item.name)}</span>${item.id === s.id ? icon('check', 15) : ''}</button>`).join('')}<button data-action="new-space" class="space-create">${icon('plus', 15)} New space</button></div>` : ''}
        </div>
        <div class="nav-label">WORKSPACE</div>
        <nav class="main-nav">${tabs.map(([view, label, symbol]) => `<button class="nav-link ${ui.view === view ? 'active' : ''}" data-action="view" data-view="${view}">${icon(symbol, 18)}<span>${label}</span>${view === 'board' ? `<small>${counts.planned + counts.progress}</small>` : ''}</button>`).join('')}</nav>
        <div class="context-spacer"></div>
        <button class="sidebar-focus" data-action="view" data-view="focus"><span class="sidebar-focus-top">${icon('focus', 17)} <span>FOCUS SESSION</span></span><span class="sidebar-focus-time" data-focus-time>${formatSeconds(focusRemaining())}</span><span class="sidebar-focus-bottom">${data.focus.status === 'running' ? 'In progress' : 'Protect a block of time'} ${icon('arrow', 15)}</span></button>
        <div class="context-footer"><span class="status-dot"></span> SAVED ON THIS DEVICE <span>v1.0</span></div>
      </aside>

      <div class="work-area">
        <header class="topbar"><div class="topbar-left"><div class="mobile-space-box"><button class="mobile-space-switch" data-action="space-menu" aria-label="Switch workspace">${esc(s.code || 'WRK')} ${icon('chevron', 14)}</button>${mobileSpaceMenu}</div><span class="topbar-path">${esc(s.code || 'WRK')} <span>/</span> ${esc(viewTitle(ui.view).toUpperCase())}</span><span class="topbar-separator"></span><span class="topbar-date">${esc(longDate(now()))}</span></div><div class="topbar-right"><button class="search-trigger" data-action="palette" aria-label="Search and commands">${icon('search', 17)} <span>Search or jump to...</span><kbd>${commandHint}</kbd></button><button class="topbar-icon ${ui.activityPanel ? 'selected' : ''}" data-action="activity-panel" aria-label="Recent activity">${icon('activity', 19)}</button><div class="clock" data-clock>${timeLabel(now())}</div></div></header>
        <main class="content" id="main-content">${renderView()}</main>
      </div>
    </div>
    ${ui.activityPanel ? renderActivityPanel() : ''}
    ${ui.modal ? renderModal() : ''}
    ${ui.palette ? renderPalette() : ''}
    <div id="toast-host">${renderToast()}</div>
    <input type="file" id="import-file" accept="application/json,.json" hidden>
  `;
  if (ui.palette) document.querySelector('#palette-input')?.focus();
}

const viewTitle = view => ({ home: 'Overview', board: 'Workboard', notes: 'Notes', flows: 'Routines', agents: 'Agent desk', focus: 'Focus', activity: 'Activity', settings: 'System settings' })[view] || 'Overview';
const renderView = () => ({ home: renderHome, board: renderBoard, notes: renderNotes, flows: renderFlows, agents: renderAgents, focus: renderFocus, activity: renderActivity, settings: renderSettings })[ui.view]?.() || renderHome();
const pageHead = (label, title, description, action = '') => `<div class="page-heading"><div><div class="eyebrow accent">${label}</div><h1>${title}</h1><p>${description}</p></div>${action}</div>`;
const empty = (symbol, title, description, action = '') => `<div class="empty-state">${icon(symbol, 28)}<h3>${title}</h3><p>${description}</p>${action}</div>`;

function renderHome() {
  const s = space();
  const tasks = inSpace(data.tasks);
  const next = tasks.filter(item => item.status !== 'done').sort((a, b) => (a.priority === 'high' ? -1 : 0) - (b.priority === 'high' ? -1 : 0)).slice(0, 4);
  const notes = inSpace(data.notes).sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.updatedAt - a.updatedAt).slice(0, 2);
  const flows = inSpace(data.flows).filter(item => item.enabled).slice(0, 2);
  const counts = taskCounts();
  return `<div class="home-view">
    <div class="home-intro"><div class="eyebrow accent"><span class="tiny-line"></span> THE OPERATING SPACE</div><h1>Good ${greeting()},<br><em>let’s make progress.</em></h1><p>${esc(s.name)} is ready. Choose the next move, then let the system keep the thread.</p></div>
    <section class="hero-panel"><div class="hero-copy"><div class="hero-kicker"><span class="signal-pulse"></span> LIVE WORKSPACE <span class="hero-index">/ 01</span></div><h2>Work with intent.<br><span>Move with clarity.</span></h2><p>Tasks, knowledge, routines, and agent handoffs — one connected place to operate.</p><div class="hero-actions"><button class="button primary" data-action="new-task">${icon('plus', 17)} Create task</button><button class="button ghost-light" data-action="palette">Open command center ${icon('arrow', 16)}</button></div></div><div class="hero-art" aria-hidden="true"><div class="orbit orbit-outer"></div><div class="orbit orbit-middle"></div><div class="orbit orbit-inner"></div><div class="orbit-cross cross-x"></div><div class="orbit-cross cross-y"></div><div class="orbit-core"><span>${String(counts.progress).padStart(2, '0')}</span><small>IN MOTION</small></div><div class="art-coordinate art-top">P/OS — ${esc(s.code || 'WRK')}</div><div class="art-coordinate art-bottom">SYSTEM / ACTIVE</div></div></section>
    <div class="metric-row"><button class="metric" data-action="view" data-view="board"><span>OPEN TASKS</span><strong>${counts.planned + counts.progress}</strong><small>${counts.progress} in motion ${icon('arrow', 14)}</small></button><button class="metric" data-action="view" data-view="notes"><span>KNOWLEDGE</span><strong>${inSpace(data.notes).length}</strong><small>field notes ${icon('arrow', 14)}</small></button><button class="metric" data-action="view" data-view="flows"><span>ROUTINES</span><strong>${inSpace(data.flows).length}</strong><small>ready to run ${icon('arrow', 14)}</small></button><button class="metric" data-action="view" data-view="activity"><span>SYSTEM PULSE</span><strong>${inSpace(data.activity).length}</strong><small>recorded events ${icon('arrow', 14)}</small></button></div>
    <div class="home-grid"><section class="surface next-surface"><div class="section-head"><div><div class="eyebrow">01 / PRIORITY</div><h2>Next in line</h2></div><button class="text-action" data-action="view" data-view="board">Open workboard ${icon('arrow', 16)}</button></div>${next.length ? `<div class="next-list">${next.map(task => `<button class="next-row" data-action="edit-task" data-id="${esc(task.id)}"><span class="next-check ${task.status}" data-action="complete-task" data-id="${esc(task.id)}" title="Mark complete">${task.status === 'done' ? icon('check', 13) : ''}</span><span class="next-text"><strong>${esc(task.title)}</strong><small>${task.status === 'progress' ? 'In motion' : 'Planned'} · ${task.priority === 'high' ? 'High priority' : 'Normal priority'}</small></span>${icon('arrow', 17)}</button>`).join('')}</div>` : empty('check', 'Clear runway', 'Nothing is waiting here.', `<button class="button subtle" data-action="new-task">Add a task</button>`)}</section>
    <section class="surface routine-surface"><div class="section-head"><div><div class="eyebrow">02 / AUTOMATION</div><h2>Ready routines</h2></div><button class="text-action" data-action="view" data-view="flows">All routines ${icon('arrow', 16)}</button></div>${flows.length ? `<div class="routine-list">${flows.map(flow => `<div class="routine-row"><span class="routine-icon">${icon('bolt', 18)}</span><span><strong>${esc(flow.name)}</strong><small>${flow.steps.length} steps · ${flow.lastRun ? `Last run ${relativeDate(flow.lastRun)}` : 'Never run'}</small></span><button class="round-action" data-action="run-flow" data-id="${esc(flow.id)}" title="Run ${esc(flow.name)}" aria-label="Run ${esc(flow.name)}">${icon('play', 17)}</button></div>`).join('')}</div>` : empty('flow', 'No routines yet', 'Build a sequence you can run again.', `<button class="button subtle" data-action="new-flow">Create routine</button>`)}</section>
    <section class="surface notes-surface"><div class="section-head"><div><div class="eyebrow">03 / MEMORY</div><h2>Field notes</h2></div><button class="text-action" data-action="view" data-view="notes">All notes ${icon('arrow', 16)}</button></div>${notes.length ? `<div class="note-preview-grid">${notes.map(note => `<button class="note-preview" data-action="open-note" data-id="${esc(note.id)}"><span>${note.pinned ? icon('pin', 15) : icon('note', 15)} ${relativeDate(note.updatedAt)}</span><strong>${esc(note.title || 'Untitled note')}</strong><small>${esc(note.body.slice(0, 110) || 'No content yet.')}</small></button>`).join('')}</div>` : empty('note', 'Capture a thought', 'Notes keep the context close to the work.', `<button class="button subtle" data-action="new-note">New note</button>`)}</section>
    <section class="surface pulse-surface"><div class="section-head"><div><div class="eyebrow">04 / TRACE</div><h2>Recent signals</h2></div><button class="text-action" data-action="view" data-view="activity">View timeline ${icon('arrow', 16)}</button></div>${renderActivityRows(inSpace(data.activity).slice(0, 3))}</section></div>
    <div class="home-footer"><span>PARAGON OS / BUILT FOR WHAT’S NEXT</span><span>LOCAL-FIRST · NO ACCOUNT REQUIRED</span></div>
  </div>`;
}

function greeting() {
  const hour = new Date().getHours();
  return hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening';
}

function renderBoard() {
  const tasks = inSpace(data.tasks);
  const columns = [['planned', 'Planned', 'A place for what comes next.'], ['progress', 'In motion', 'The work underway.'], ['done', 'Complete', 'A record of progress.']];
  return `<div class="standard-view">${pageHead('01 / EXECUTION', 'Workboard', 'Keep the next move visible. Drag cards between stages or open one to edit it.', `<button class="button dark" data-action="new-task">${icon('plus', 17)} New task</button>`)}<div class="board-summary"><span>${tasks.filter(t => t.status !== 'done').length} open</span><span class="summary-line"></span><span>${tasks.filter(t => t.status === 'done').length} completed</span><span class="summary-tip">TIP: DRAG TO MOVE</span></div><div class="board-columns">${columns.map(([status, title, description], index) => `<section class="board-column" data-drop-status="${status}"><div class="board-column-head"><span class="column-number">0${index + 1}</span><div><h2>${title}</h2><p>${description}</p></div><span class="column-count">${tasks.filter(t => t.status === status).length}</span></div><div class="board-cards">${tasks.filter(t => t.status === status).map(task => `<button class="task-card" draggable="true" data-drag-id="${esc(task.id)}" data-action="edit-task" data-id="${esc(task.id)}"><span class="task-card-top"><span class="priority ${task.priority}"><i></i>${task.priority === 'high' ? 'HIGH' : 'STANDARD'}</span>${icon('more', 17)}</span><strong>${esc(task.title)}</strong><p>${esc(task.detail || 'No details added yet.')}</p><span class="task-card-bottom"><span>${relativeDate(task.createdAt)}</span><span class="task-status-indicator ${status}"></span></span></button>`).join('')}<button class="add-card" data-action="new-task" data-status="${status}">${icon('plus', 16)} Add task</button></div></section>`).join('')}</div></div>`;
}

function renderNotes() {
  const filtered = inSpace(data.notes).filter(n => `${n.title} ${n.body}`.toLowerCase().includes(ui.noteQuery.toLowerCase())).sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.updatedAt - a.updatedAt);
  const selected = inSpace(data.notes).find(n => n.id === ui.selectedNoteId) || filtered[0];
  if (selected && !ui.selectedNoteId) ui.selectedNoteId = selected.id;
  return `<div class="standard-view notes-view">${pageHead('02 / KNOWLEDGE', 'Field notes', 'A quiet place to capture decisions, ideas, and context as work moves.', `<button class="button dark" data-action="new-note">${icon('plus', 17)} New note</button>`)}<div class="notes-layout"><aside class="notes-list-panel"><div class="notes-search">${icon('search', 16)}<input id="notes-search" type="search" placeholder="Search notes" value="${esc(ui.noteQuery)}" autocomplete="off"></div><div class="notes-list" id="notes-list">${filtered.length ? filtered.map(note => `<button class="note-list-item ${selected?.id === note.id ? 'active' : ''}" data-action="select-note" data-id="${esc(note.id)}"><span class="note-list-meta">${note.pinned ? icon('pin', 13) : icon('note', 13)} ${relativeDate(note.updatedAt)}</span><strong>${esc(note.title || 'Untitled note')}</strong><small>${esc((note.body || 'Empty note').replace(/\n/g, ' ').slice(0, 90))}</small></button>`).join('') : `<div class="list-empty">No notes match your search.</div>`}</div></aside><section class="note-editor-panel">${selected ? `<div class="editor-top"><span class="eyebrow">FIELD NOTE / ${relativeDate(selected.updatedAt).toUpperCase()}</span><div><button class="icon-action ${selected.pinned ? 'tinted' : ''}" data-action="toggle-pin" data-id="${esc(selected.id)}" title="${selected.pinned ? 'Unpin' : 'Pin'} note" aria-label="${selected.pinned ? 'Unpin' : 'Pin'} note">${icon('pin', 18)}</button><button class="icon-action" data-action="delete-note" data-id="${esc(selected.id)}" title="Delete note" aria-label="Delete note">${icon('trash', 18)}</button></div></div><input id="note-title" class="note-title-input" data-note-id="${esc(selected.id)}" placeholder="Untitled note" value="${esc(selected.title)}" maxlength="120"><textarea id="note-body" class="note-body-input" data-note-id="${esc(selected.id)}" placeholder="Start writing. This space saves as you type.">${esc(selected.body)}</textarea><div class="editor-bottom"><span><span class="status-dot"></span> AUTO SAVED</span><span>${wordCount(selected.body)} words</span></div>` : empty('note', 'A clear page', 'Create a note to start collecting context.', `<button class="button subtle" data-action="new-note">New note</button>`)}</section></div></div>`;
}

const wordCount = body => body.trim() ? body.trim().split(/\s+/).length : 0;
const stepIcon = type => ({ task: 'board', note: 'note', log: 'activity' })[type] || 'bolt';
const stepName = type => ({ task: 'Create task', note: 'Create note', log: 'Log update' })[type] || 'Action';

function renderFlows() {
  const flows = inSpace(data.flows);
  const selected = flows.find(f => f.id === ui.selectedFlowId) || flows[0];
  if (selected && !ui.selectedFlowId) ui.selectedFlowId = selected.id;
  return `<div class="standard-view flows-view">${pageHead('03 / SYSTEMS', 'Routines', 'Turn repeatable work into a clear sequence. Running a routine creates real workspace items.', `<button class="button dark" data-action="new-flow">${icon('plus', 17)} New routine</button>`)}<div class="flows-layout"><aside class="flows-list-panel"><div class="panel-top-label">YOUR ROUTINES <span>${flows.length}</span></div>${flows.map(flow => `<button class="flow-list-item ${selected?.id === flow.id ? 'active' : ''}" data-action="select-flow" data-id="${esc(flow.id)}"><span class="flow-list-symbol">${icon('flow', 18)}</span><span><strong>${esc(flow.name)}</strong><small>${flow.steps.length} steps · ${flow.enabled ? 'Ready' : 'Paused'}</small></span>${icon('arrow', 16)}</button>`).join('')}${!flows.length ? `<div class="list-empty">No routines yet.</div>` : ''}<div class="flows-hint">${icon('spark', 17)} <span>Routines run locally and leave an activity trace.</span></div></aside><section class="flow-detail-panel">${selected ? `<div class="flow-detail-top"><div class="eyebrow">ROUTINE / ${esc(space().code)}</div><div class="flow-detail-actions"><label class="switch-label"><input type="checkbox" data-flow-enabled="${esc(selected.id)}" ${selected.enabled ? 'checked' : ''}><span class="switch-ui"></span>${selected.enabled ? 'Enabled' : 'Paused'}</label><button class="icon-action" data-action="edit-flow" data-id="${esc(selected.id)}" title="Edit routine">${icon('more', 19)}</button></div></div><h2>${esc(selected.name)}</h2><p class="flow-description">${esc(selected.description || 'A sequence for repeatable work.')}</p><div class="flow-meta"><span>${icon('list', 16)} ${selected.steps.length} steps</span><span>${icon('activity', 16)} ${selected.lastRun ? `Last run ${relativeDate(selected.lastRun)}` : 'Not run yet'}</span></div><div class="flow-sequence-label">SEQUENCE <span>TOP TO BOTTOM</span></div><div class="flow-steps">${selected.steps.map((step, index) => `<div class="flow-step"><span class="step-index">${String(index + 1).padStart(2, '0')}</span><span class="step-symbol">${icon(stepIcon(step.type), 18)}</span><div><strong>${stepName(step.type)}</strong><p>${esc(step.content)}</p></div><button class="icon-action" data-action="edit-step" data-flow-id="${esc(selected.id)}" data-id="${esc(step.id)}" title="Edit step">${icon('more', 17)}</button></div>`).join('')}<button class="add-step" data-action="new-step" data-flow-id="${esc(selected.id)}">${icon('plus', 17)} Add step</button></div><div class="flow-runbar"><div><span class="eyebrow">READY TO EXECUTE</span><p>Each action updates this space immediately.</p></div><button class="button primary" data-action="run-flow" data-id="${esc(selected.id)}" ${!selected.enabled || !selected.steps.length ? 'disabled' : ''}>${icon('play', 17)} Run routine</button></div>` : empty('flow', 'Build your first routine', 'Combine tasks, notes, and logged updates into a reusable sequence.', `<button class="button subtle" data-action="new-flow">Create routine</button>`)}</section></div></div>`;
}

const roles = {
  operator: { name: 'Operator', subtitle: 'Turn an objective into a reliable execution plan.', instruction: 'Act as an operations agent. Break the objective into a practical sequence, identify dependencies and failure points, and propose clear checkpoints.' },
  researcher: { name: 'Researcher', subtitle: 'Find evidence and map what is unknown.', instruction: 'Act as a research agent. Separate verified facts from assumptions, identify primary sources to consult, and propose a concise evidence-based answer.' },
  reviewer: { name: 'Reviewer', subtitle: 'Stress-test a plan before it ships.', instruction: 'Act as a critical review agent. Look for omissions, hidden risks, accessibility or reliability issues, and suggest specific improvements.' }
};

function buildHandoff() {
  const draft = data.draft;
  const role = roles[draft.role] || roles.operator;
  const tasks = inSpace(data.tasks).filter(t => t.status !== 'done').slice(0, 5);
  const notes = inSpace(data.notes).filter(n => n.pinned).slice(0, 2);
  return `PARAGON OS / AGENT HANDOFF\nSPACE: ${space().name}\nROLE: ${role.name}\n\nOBJECTIVE\n${draft.objective.trim() || '[Describe the objective]'}\n\nWORKSPACE CONTEXT\nOpen tasks:\n${tasks.length ? tasks.map(t => `- ${t.title} (${t.status === 'progress' ? 'in motion' : 'planned'})`).join('\n') : '- None'}\nPinned notes:\n${notes.length ? notes.map(n => `- ${n.title}: ${n.body.replace(/\s+/g, ' ').slice(0, 180)}`).join('\n') : '- None'}\nAdditional context:\n${draft.context.trim() || '- None'}\n\nINSTRUCTIONS\n${role.instruction}\n\nReturn:\n1. A brief summary of the approach.\n2. A numbered action plan with concrete outputs.\n3. Assumptions, blockers, and questions requiring human judgment.\n4. A clear definition of done.\n\nKeep the human operator in control. Do not claim a step is complete without evidence.`;
}

function renderAgents() {
  const draft = data.draft;
  return `<div class="standard-view agents-view">${pageHead('04 / COLLABORATION', 'Agent desk', 'Prepare a precise handoff for an AI agent. Your workspace context travels with the brief.', '')}<div class="agent-banner"><span>${icon('agents', 23)}</span><div><strong>Human-directed by design</strong><p>Compose here, then copy the brief into your agent of choice. Paragon does not send your data to a service.</p></div><span class="agent-banner-code">P/AGENT / 01</span></div><div class="agent-layout"><section class="agent-form-panel"><div class="section-head"><div><div class="eyebrow">01 / COMPOSE</div><h2>Set the mission</h2></div></div><label class="field-label">CHOOSE A ROLE</label><div class="role-grid">${Object.entries(roles).map(([key, role]) => `<button class="role-card ${draft.role === key ? 'active' : ''}" data-action="agent-role" data-role="${key}"><span>${icon(key === 'operator' ? 'bolt' : key === 'researcher' ? 'search' : 'check', 19)}</span><strong>${role.name}</strong><small>${role.subtitle}</small></button>`).join('')}</div><label class="field-label" for="agent-objective">OBJECTIVE</label><textarea id="agent-objective" class="field-textarea" rows="4" placeholder="What should the agent accomplish? Be specific about the outcome.">${esc(draft.objective)}</textarea><label class="field-label" for="agent-context">ADDITIONAL CONTEXT <span>OPTIONAL</span></label><textarea id="agent-context" class="field-textarea" rows="4" placeholder="Constraints, source links, requirements, or anything the agent should know.">${esc(draft.context)}</textarea><div class="context-included">${icon('link', 16)} Includes ${inSpace(data.tasks).filter(t => t.status !== 'done').slice(0, 5).length} open tasks and ${inSpace(data.notes).filter(n => n.pinned).slice(0, 2).length} pinned notes from this space.</div><button class="button dark wide" data-action="generate-handoff">${icon('spark', 17)} Prepare handoff</button></section><section class="agent-output-panel"><div class="section-head"><div><div class="eyebrow">02 / HANDOFF</div><h2>Agent brief</h2></div><span class="output-status">${draft.generated ? '<i></i> READY TO COPY' : 'AWAITING MISSION'}</span></div>${draft.generated ? `<div class="handoff-preview"><pre id="handoff-text">${esc(buildHandoff())}</pre></div><div class="handoff-actions"><button class="button primary" data-action="copy-handoff">${icon('copy', 17)} Copy brief</button><button class="button subtle" data-action="handoff-to-task">${icon('plus', 17)} Add to workboard</button></div>` : `<div class="handoff-empty"><div class="handoff-emblem">${icon('agents', 38)}</div><h3>Clarity before action.</h3><p>Choose a role, describe the mission, and prepare a brief with the context already in this space.</p><span>NO API KEY · NO AUTOMATIC UPLOAD</span></div>`}</section></div></div>`;
}

function focusRemaining() {
  if (data.focus.status === 'running' && data.focus.endAt) return Math.max(0, Math.ceil((data.focus.endAt - now()) / 1000));
  return data.focus.remaining ?? data.focus.duration * 60;
}
const formatSeconds = seconds => `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;

function renderFocus() {
  const f = data.focus;
  const remaining = focusRemaining();
  const linked = inSpace(data.tasks).find(t => t.id === f.taskId);
  return `<div class="standard-view focus-view">${pageHead('05 / ATTENTION', 'Focus', 'Protect time for one meaningful piece of work. Your session continues across page reloads.', '')}<div class="focus-layout"><section class="focus-stage"><div class="focus-stage-head"><span><span class="signal-pulse"></span> ${f.status === 'running' ? 'SESSION IN PROGRESS' : f.status === 'paused' ? 'SESSION PAUSED' : 'READY WHEN YOU ARE'}</span><span>PARAGON / FOCUS</span></div><div class="timer-ring" style="--progress:${Math.max(0, Math.min(100, 100 - remaining / (f.duration * 60) * 100))}%"><div class="timer-inner"><span>DEEP WORK</span><strong data-focus-time>${formatSeconds(remaining)}</strong><small>MINUTES REMAINING</small></div></div><div class="focus-controls">${f.status === 'running' ? `<button class="button light" data-action="pause-focus">${icon('pause', 18)} Pause session</button>` : `<button class="button light" data-action="start-focus">${icon('play', 18)} ${f.status === 'paused' ? 'Resume session' : 'Start session'}</button>`}<button class="button ghost-light" data-action="reset-focus">${icon('reset', 17)} Reset</button></div><div class="focus-stage-bottom"><span>ONE TASK. ONE BLOCK. FULL ATTENTION.</span><span>∞ / CONTINUITY</span></div></section><aside class="focus-side"><div class="focus-side-section"><div class="eyebrow">SESSION LENGTH</div><h2>Choose your block</h2><div class="duration-options">${[15, 25, 45].map(minutes => `<button class="duration ${f.duration === minutes ? 'active' : ''}" data-action="focus-duration" data-minutes="${minutes}" ${f.status === 'running' ? 'disabled' : ''}><strong>${minutes}</strong><span>MIN</span></button>`).join('')}</div></div><div class="focus-side-section"><div class="eyebrow">LINKED WORK</div><h2>Keep a task in view</h2><select id="focus-task" class="field-select"><option value="">No linked task</option>${inSpace(data.tasks).filter(t => t.status !== 'done').map(t => `<option value="${esc(t.id)}" ${f.taskId === t.id ? 'selected' : ''}>${esc(t.title)}</option>`).join('')}</select><p class="helper-text">${linked ? `Working on: ${esc(linked.title)}` : 'Select a task to include it in your session record.'}</p></div><div class="focus-side-section focus-note"><div class="eyebrow">SYSTEM NOTE</div><p>When a session ends, Paragon records it in Activity. The timer stays accurate if you leave this page and come back.</p></div></aside></div></div>`;
}

function renderActivityRows(items) {
  return items.length ? `<div class="activity-rows">${items.map(item => `<div class="activity-row"><span class="activity-symbol">${icon(item.kind === 'flow' ? 'bolt' : item.kind === 'focus' ? 'focus' : item.kind === 'task' ? 'board' : item.kind === 'note' ? 'note' : 'activity', 17)}</span><span><strong>${esc(item.title)}</strong><small>${esc(item.detail)}</small></span><time>${relativeDate(item.time)}</time></div>`).join('')}</div>` : empty('activity', 'Quiet so far', 'Your workspace actions will appear here.');
}

function renderActivity() {
  const events = inSpace(data.activity).sort((a, b) => b.time - a.time);
  return `<div class="standard-view activity-view">${pageHead('06 / RECORD', 'Activity', 'A readable trace of what changed in this space and when it happened.', '')}<div class="activity-layout"><section class="surface activity-main"><div class="section-head"><div><div class="eyebrow">LOCAL TIMELINE</div><h2>System pulse</h2></div><span class="count-pill">${events.length} EVENTS</span></div>${renderActivityRows(events)}</section><aside class="activity-aside"><span class="aside-symbol">${icon('activity', 27)}</span><div class="eyebrow">BUILT-IN CONTEXT</div><h2>A system that remembers the work.</h2><p>Every routine run, completed task, and focus session leaves a local signal here. All data stays in this browser until you export or clear it.</p><button class="text-action" data-action="view" data-view="settings">Manage data ${icon('arrow', 17)}</button></aside></div></div>`;
}

function renderSettings() {
  return `<div class="standard-view settings-view">${pageHead('07 / SYSTEM', 'System settings', 'Tune the workspace and manage its local data.', '')}<div class="settings-grid"><section class="surface setting-card"><div class="setting-icon">${icon('sun', 21)}</div><div class="eyebrow">APPEARANCE</div><h2>Visual mode</h2><p>Choose the surface that works best for your environment.</p><div class="theme-options"><button class="theme-option ${data.settings.theme === 'light' ? 'active' : ''}" data-action="theme" data-theme="light">${icon('sun', 20)} Light <span>${data.settings.theme === 'light' ? icon('check', 16) : ''}</span></button><button class="theme-option ${data.settings.theme === 'dark' ? 'active' : ''}" data-action="theme" data-theme="dark">${icon('moon', 20)} Dark <span>${data.settings.theme === 'dark' ? icon('check', 16) : ''}</span></button></div></section><section class="surface setting-card"><div class="setting-icon">${icon('download', 21)}</div><div class="eyebrow">PORTABILITY</div><h2>Your data, your file</h2><p>Export a complete snapshot or restore one on this device.</p><div class="setting-actions"><button class="button subtle" data-action="export">${icon('download', 17)} Export snapshot</button><button class="button subtle" data-action="import">${icon('upload', 17)} Import snapshot</button></div></section><section class="surface setting-card"><div class="setting-icon">${icon('corner', 21)}</div><div class="eyebrow">WORKSPACES</div><h2>Spaces</h2><p>Separate projects while keeping the same tools and behaviors.</p><div class="space-settings-list">${data.spaces.map(s => `<div><span class="space-option-code">${esc(s.code)}</span><strong>${esc(s.name)}</strong>${s.id === data.activeSpaceId ? '<small>ACTIVE</small>' : ''}<button class="space-edit" data-action="edit-space" data-id="${esc(s.id)}" aria-label="Edit ${esc(s.name)}">${icon('more', 16)}</button></div>`).join('')}</div><button class="text-action" data-action="new-space">${icon('plus', 16)} Create a space</button></section><section class="surface setting-card"><div class="setting-icon">${icon('settings', 21)}</div><div class="eyebrow">LOCAL SYSTEM</div><h2>Fresh start</h2><p>Reset Paragon to the original sample workspace. Export first if you want to keep your work.</p><button class="button danger" data-action="reset-data">Reset local data</button></section></div><div class="settings-footer">PARAGON OS 1.0 <span>LOCAL STORAGE · NO ACCOUNT · NO EXTERNAL SERVICES</span></div></div>`;
}

function renderActivityPanel() {
  return `<div class="scrim transparent" data-action="close-panel"></div><aside class="activity-panel"><div class="panel-heading"><div><div class="eyebrow">LIVE TRACE</div><h2>Recent activity</h2></div><button class="icon-action" data-action="close-panel" aria-label="Close activity">${icon('close', 19)}</button></div>${renderActivityRows(inSpace(data.activity).slice(0, 8))}<button class="button subtle wide" data-action="view" data-view="activity">Open full timeline ${icon('arrow', 16)}</button></aside>`;
}

function modalShell(title, subtitle, body, footer, wide = false) {
  return `<div class="scrim" data-action="close-modal"></div><div class="modal-wrap" role="dialog" aria-modal="true" aria-label="${esc(title)}"><div class="modal ${wide ? 'modal-wide' : ''}"><div class="modal-head"><div><div class="eyebrow">${esc(subtitle)}</div><h2>${esc(title)}</h2></div><button class="icon-action" data-action="close-modal" aria-label="Close dialog">${icon('close', 20)}</button></div>${body}${footer}</div></div>`;
}

function renderModal() {
  const m = ui.modal;
  if (m.type === 'task') {
    const task = m.id ? data.tasks.find(t => t.id === m.id) : null;
    const body = `<form id="task-form"><label class="field-label" for="task-title">TASK NAME</label><input class="field-input" id="task-title" name="title" value="${esc(task?.title || '')}" placeholder="What needs to move?" maxlength="120" required autofocus><label class="field-label" for="task-detail">DETAILS <span>OPTIONAL</span></label><textarea class="field-textarea" id="task-detail" name="detail" rows="4" placeholder="Add context, a definition of done, or a next step.">${esc(task?.detail || '')}</textarea><div class="form-two"><div><label class="field-label" for="task-status">STAGE</label><select class="field-select" id="task-status" name="status">${[['planned','Planned'],['progress','In motion'],['done','Complete']].map(([value, label]) => `<option value="${value}" ${(task?.status || m.status || 'planned') === value ? 'selected' : ''}>${label}</option>`).join('')}</select></div><div><label class="field-label" for="task-priority">PRIORITY</label><select class="field-select" id="task-priority" name="priority"><option value="normal" ${task?.priority !== 'high' ? 'selected' : ''}>Standard</option><option value="high" ${task?.priority === 'high' ? 'selected' : ''}>High</option></select></div></div><div class="modal-footer">${task ? `<button type="button" class="text-danger" data-action="delete-task" data-id="${esc(task.id)}">Delete task</button>` : '<span></span>'}<button type="button" class="button subtle" data-action="close-modal">Cancel</button><button type="submit" class="button dark">${task ? 'Save changes' : 'Create task'}</button></div></form>`;
    return modalShell(task ? 'Edit task' : 'Create task', 'WORKBOARD / ITEM', body, '');
  }
  if (m.type === 'flow') {
    const flow = m.id ? data.flows.find(f => f.id === m.id) : null;
    const body = `<form id="flow-form"><label class="field-label" for="flow-name">ROUTINE NAME</label><input class="field-input" id="flow-name" name="name" value="${esc(flow?.name || '')}" placeholder="A repeatable sequence" maxlength="80" required autofocus><label class="field-label" for="flow-description">DESCRIPTION</label><textarea class="field-textarea" id="flow-description" name="description" rows="3" placeholder="When should this routine be used?">${esc(flow?.description || '')}</textarea><div class="modal-footer">${flow ? `<button type="button" class="text-danger" data-action="delete-flow" data-id="${esc(flow.id)}">Delete routine</button>` : '<span></span>'}<button type="button" class="button subtle" data-action="close-modal">Cancel</button><button type="submit" class="button dark">${flow ? 'Save changes' : 'Create routine'}</button></div></form>`;
    return modalShell(flow ? 'Edit routine' : 'New routine', 'SYSTEMS / ROUTINE', body, '');
  }
  if (m.type === 'step') {
    const flow = data.flows.find(f => f.id === m.flowId);
    const step = flow?.steps.find(s => s.id === m.id);
    const body = `<form id="step-form"><label class="field-label" for="step-type">ACTION TYPE</label><select class="field-select" id="step-type" name="type"><option value="task" ${step?.type === 'task' ? 'selected' : ''}>Create task</option><option value="note" ${step?.type === 'note' ? 'selected' : ''}>Create note</option><option value="log" ${step?.type === 'log' ? 'selected' : ''}>Log update</option></select><p class="helper-text">Actions update the current space when this routine runs.</p><label class="field-label" for="step-content">CONTENT</label><textarea class="field-textarea" id="step-content" name="content" rows="5" placeholder="Describe the task, note, or update." required>${esc(step?.content || '')}</textarea><div class="modal-footer">${step ? `<button type="button" class="text-danger" data-action="delete-step" data-flow-id="${esc(flow.id)}" data-id="${esc(step.id)}">Delete step</button>` : '<span></span>'}<button type="button" class="button subtle" data-action="close-modal">Cancel</button><button type="submit" class="button dark">${step ? 'Save step' : 'Add step'}</button></div></form>`;
    return modalShell(step ? 'Edit step' : 'Add step', 'ROUTINE / ACTION', body, '');
  }
  if (m.type === 'space') {
    const current = m.id ? data.spaces.find(s => s.id === m.id) : null;
    const body = `<form id="space-form"><label class="field-label" for="space-name">SPACE NAME</label><input class="field-input" id="space-name" name="name" value="${esc(current?.name || '')}" placeholder="A project or area of work" maxlength="50" required autofocus><label class="field-label" for="space-code">SHORT CODE</label><input class="field-input" id="space-code" name="code" value="${esc(current?.code || '')}" placeholder="e.g. OPS" maxlength="4" pattern="[A-Za-z0-9]{2,4}" required><p class="helper-text">Two to four letters or numbers. Shown in the workspace path.</p><div class="modal-footer">${current && data.spaces.length > 1 ? `<button type="button" class="text-danger" data-action="delete-space" data-id="${esc(current.id)}">Delete space</button>` : '<span></span>'}<button type="button" class="button subtle" data-action="close-modal">Cancel</button><button type="submit" class="button dark">${current ? 'Save changes' : 'Create space'}</button></div></form>`;
    return modalShell(current ? 'Edit space' : 'Create space', current ? 'WORKSPACE / MANAGE' : 'WORKSPACE / NEW', body, '');
  }
  return '';
}

function commandResults(query) {
  const q = query.trim().toLowerCase();
  const commands = [
    { icon: 'grid', title: 'Open overview', sub: 'Navigate', run: () => activateView('home') },
    { icon: 'board', title: 'Open workboard', sub: 'Navigate', run: () => activateView('board') },
    { icon: 'note', title: 'Open notes', sub: 'Navigate', run: () => activateView('notes') },
    { icon: 'flow', title: 'Open routines', sub: 'Navigate', run: () => activateView('flows') },
    { icon: 'agents', title: 'Open agent desk', sub: 'Navigate', run: () => activateView('agents') },
    { icon: 'focus', title: 'Open focus', sub: 'Navigate', run: () => activateView('focus') },
    { icon: 'plus', title: 'Create task', sub: 'Action', run: () => { ui.palette = false; ui.modal = { type: 'task' }; render(); focusAutofocus(); } },
    { icon: 'plus', title: 'Create note', sub: 'Action', run: createNote },
    { icon: 'plus', title: 'Create routine', sub: 'Action', run: () => { ui.palette = false; ui.modal = { type: 'flow' }; render(); focusAutofocus(); } },
    ...data.spaces.map(s => ({ icon: 'corner', title: `Switch to ${s.name}`, sub: 'Space', run: () => switchSpace(s.id) })),
    ...inSpace(data.tasks).map(t => ({ icon: 'board', title: t.title, sub: 'Task', run: () => { ui.palette = false; ui.modal = { type: 'task', id: t.id }; render(); focusAutofocus(); } })),
    ...inSpace(data.notes).map(n => ({ icon: 'note', title: n.title || 'Untitled note', sub: 'Note', run: () => { ui.selectedNoteId = n.id; activateView('notes'); } })),
    ...inSpace(data.flows).map(f => ({ icon: 'flow', title: f.name, sub: 'Routine', run: () => { ui.selectedFlowId = f.id; activateView('flows'); } }))
  ];
  return (q ? commands.filter(c => `${c.title} ${c.sub}`.toLowerCase().includes(q)) : commands.slice(0, 9)).slice(0, 12);
}

function renderPalette() {
  ui.paletteResults = commandResults(ui.paletteQuery);
  return `<div class="scrim palette-scrim" data-action="close-palette"></div><div class="palette" role="dialog" aria-modal="true" aria-label="Command center"><div class="palette-search">${icon('search', 22)}<input id="palette-input" type="search" placeholder="Search work or type a command..." value="${esc(ui.paletteQuery)}" autocomplete="off"><kbd>ESC</kbd></div><div class="palette-caption">${ui.paletteQuery ? 'MATCHING RESULTS' : 'QUICK MOVES'} <span>↑ ↓ TO NAVIGATE · ↵ TO OPEN</span></div><div class="palette-results" id="palette-results">${paletteRows()}</div><div class="palette-footer"><span class="brand-diamond small"></span> PARAGON COMMAND CENTER <span>LOCAL SEARCH</span></div></div>`;
}

function paletteRows() {
  return ui.paletteResults.length ? ui.paletteResults.map((item, index) => `<button class="palette-row ${index === ui.paletteIndex ? 'active' : ''}" data-action="palette-run" data-index="${index}"><span>${icon(item.icon, 18)}</span><strong>${esc(item.title)}</strong><small>${esc(item.sub)}</small>${icon('arrow', 15)}</button>`).join('') : `<div class="palette-empty">No matches. Try a task, note, routine, or command.</div>`;
}

function refreshPalette() {
  ui.paletteResults = commandResults(ui.paletteQuery);
  ui.paletteIndex = Math.min(ui.paletteIndex, Math.max(0, ui.paletteResults.length - 1));
  const results = document.querySelector('#palette-results');
  if (results) results.innerHTML = paletteRows();
  const caption = document.querySelector('.palette-caption');
  if (caption) caption.innerHTML = `${ui.paletteQuery ? 'MATCHING RESULTS' : 'QUICK MOVES'} <span>↑ ↓ TO NAVIGATE · ↵ TO OPEN</span>`;
}

function focusAutofocus() { requestAnimationFrame(() => document.querySelector('[autofocus]')?.focus()); }
function switchSpace(id) {
  if (!data.spaces.some(s => s.id === id)) return;
  data.activeSpaceId = id;
  ui.selectedNoteId = null;
  ui.selectedFlowId = null;
  ui.noteQuery = '';
  ui.spaceMenu = false;
  ui.palette = false;
  if (data.focus.taskId && !inSpace(data.tasks).some(t => t.id === data.focus.taskId)) data.focus.taskId = '';
  save(); render(); toast(`Switched to ${space().name}`);
}

function createNote() {
  const note = { id: uid(), spaceId: data.activeSpaceId, title: '', body: '', pinned: false, updatedAt: now() };
  data.notes.unshift(note);
  addActivity('note', 'Note created', 'A new field note was opened.');
  save(); ui.selectedNoteId = note.id; ui.noteQuery = ''; activateView('notes');
  document.querySelector('#note-title')?.focus();
}

function runFlow(id) {
  const flow = data.flows.find(f => f.id === id && f.spaceId === data.activeSpaceId);
  if (!flow || !flow.enabled || !flow.steps.length) return;
  let taskCount = 0, noteCount = 0, logCount = 0;
  for (const step of flow.steps) {
    const content = step.content.trim();
    if (!content) continue;
    if (step.type === 'task') { data.tasks.unshift({ id: uid(), spaceId: data.activeSpaceId, title: content.split('\n')[0].slice(0, 120), detail: content.includes('\n') ? content.split('\n').slice(1).join('\n') : `Created by ${flow.name}`, status: 'planned', priority: 'normal', createdAt: now() }); taskCount++; }
    if (step.type === 'note') { data.notes.unshift({ id: uid(), spaceId: data.activeSpaceId, title: `${flow.name} · ${shortDate(now())}`, body: content, pinned: false, updatedAt: now() }); noteCount++; }
    if (step.type === 'log') { addActivity('flow', flow.name, content); logCount++; }
  }
  flow.lastRun = now();
  addActivity('flow', `${flow.name} ran`, `${taskCount} tasks · ${noteCount} notes · ${logCount} updates`);
  save(); render(); toast(`Routine complete: ${taskCount} tasks, ${noteCount} notes, ${logCount} updates`);
}

function completeTask(id) {
  const task = data.tasks.find(t => t.id === id);
  if (!task) return;
  task.status = task.status === 'done' ? 'planned' : 'done';
  addActivity('task', task.status === 'done' ? 'Task completed' : 'Task reopened', task.title, task.spaceId);
  save(); render(); toast(task.status === 'done' ? 'Task completed' : 'Task moved to planned');
}

function tickFocus() {
  if (data.focus.status === 'running' && focusRemaining() <= 0) {
    const task = data.tasks.find(t => t.id === data.focus.taskId);
    data.focus.status = 'idle'; data.focus.endAt = null; data.focus.remaining = data.focus.duration * 60;
    addActivity('focus', 'Focus session complete', `${data.focus.duration} minutes${task ? ` on ${task.title}` : ''}`, task?.spaceId || data.activeSpaceId);
    save(); render(); toast('Focus session complete. Well done.');
    return;
  }
  const remaining = focusRemaining();
  document.querySelectorAll('[data-focus-time]').forEach(el => { el.textContent = formatSeconds(remaining); });
  const ring = document.querySelector('.timer-ring');
  if (ring) ring.style.setProperty('--progress', `${Math.max(0, Math.min(100, 100 - remaining / (data.focus.duration * 60) * 100))}%`);
  const clock = document.querySelector('[data-clock]');
  if (clock) clock.textContent = timeLabel(now());
}

function exportSnapshot() {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url; link.download = `paragon-os-${new Date().toISOString().slice(0, 10)}.json`; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  toast('Snapshot exported');
}

document.addEventListener('click', async event => {
  const target = event.target.closest('[data-action]');
  if (!target) return;
  const { action, id, view, status, flowId, theme, role, minutes, index } = target.dataset;
  if (action === 'view') return activateView(view);
  if (action === 'palette') { ui.palette = true; ui.paletteQuery = ''; ui.paletteIndex = 0; ui.activityPanel = false; return render(); }
  if (action === 'close-palette') { ui.palette = false; return render(); }
  if (action === 'palette-run') return ui.paletteResults[Number(index)]?.run();
  if (action === 'space-menu') { ui.spaceMenu = !ui.spaceMenu; return render(); }
  if (action === 'switch-space') return switchSpace(id);
  if (action === 'new-space') { ui.spaceMenu = false; ui.modal = { type: 'space' }; render(); return focusAutofocus(); }
  if (action === 'edit-space') { ui.modal = { type: 'space', id }; render(); return focusAutofocus(); }
  if (action === 'delete-space') {
    const removed = data.spaces.find(s => s.id === id);
    if (!removed || data.spaces.length < 2 || !confirm(`Delete ${removed.name} and all of its tasks, notes, routines, and activity?`)) return;
    data.spaces = data.spaces.filter(s => s.id !== id);
    data.tasks = data.tasks.filter(t => t.spaceId !== id);
    data.notes = data.notes.filter(n => n.spaceId !== id);
    data.flows = data.flows.filter(f => f.spaceId !== id);
    data.activity = data.activity.filter(a => a.spaceId !== id);
    if (data.activeSpaceId === id) data.activeSpaceId = data.spaces[0].id;
    if (data.focus.taskId && !data.tasks.some(t => t.id === data.focus.taskId)) data.focus.taskId = '';
    ui.selectedNoteId = null; ui.selectedFlowId = null; ui.modal = null;
    addActivity('system', 'Space deleted', removed.name);
    save(); render(); return toast(`${removed.name} deleted`);
  }
  if (action === 'activity-panel') { ui.activityPanel = !ui.activityPanel; return render(); }
  if (action === 'close-panel') { ui.activityPanel = false; return render(); }
  if (action === 'close-modal') { ui.modal = null; return render(); }
  if (action === 'new-task') { ui.modal = { type: 'task', status }; render(); return focusAutofocus(); }
  if (action === 'edit-task') { ui.modal = { type: 'task', id }; render(); return focusAutofocus(); }
  if (action === 'complete-task') { event.stopPropagation(); return completeTask(id); }
  if (action === 'delete-task') { if (confirm('Delete this task?')) { const task = data.tasks.find(t => t.id === id); data.tasks = data.tasks.filter(t => t.id !== id); addActivity('task', 'Task deleted', task?.title || '', task?.spaceId); ui.modal = null; save(); render(); toast('Task deleted'); } return; }
  if (action === 'new-note') return createNote();
  if (action === 'open-note' || action === 'select-note') { ui.selectedNoteId = id; return activateView('notes'); }
  if (action === 'toggle-pin') { const note = data.notes.find(n => n.id === id); if (note) { note.pinned = !note.pinned; note.updatedAt = now(); save(); render(); toast(note.pinned ? 'Note pinned' : 'Note unpinned'); } return; }
  if (action === 'delete-note') { if (confirm('Delete this note?')) { const note = data.notes.find(n => n.id === id); data.notes = data.notes.filter(n => n.id !== id); addActivity('note', 'Note deleted', note?.title || 'Untitled note', note?.spaceId); ui.selectedNoteId = null; save(); render(); toast('Note deleted'); } return; }
  if (action === 'new-flow') { ui.modal = { type: 'flow' }; render(); return focusAutofocus(); }
  if (action === 'edit-flow') { ui.modal = { type: 'flow', id }; render(); return focusAutofocus(); }
  if (action === 'select-flow') { ui.selectedFlowId = id; return render(); }
  if (action === 'delete-flow') { if (confirm('Delete this routine and its steps?')) { const flow = data.flows.find(f => f.id === id); data.flows = data.flows.filter(f => f.id !== id); addActivity('flow', 'Routine deleted', flow?.name || '', flow?.spaceId); ui.selectedFlowId = null; ui.modal = null; save(); render(); toast('Routine deleted'); } return; }
  if (action === 'new-step') { ui.modal = { type: 'step', flowId }; render(); return focusAutofocus(); }
  if (action === 'edit-step') { ui.modal = { type: 'step', flowId, id }; render(); return focusAutofocus(); }
  if (action === 'delete-step') { const flow = data.flows.find(f => f.id === flowId); if (flow) { flow.steps = flow.steps.filter(s => s.id !== id); ui.modal = null; save(); render(); toast('Step removed'); } return; }
  if (action === 'run-flow') return runFlow(id);
  if (action === 'agent-role') { data.draft.role = role; data.draft.generated = false; save(); return render(); }
  if (action === 'generate-handoff') { if (!data.draft.objective.trim()) { document.querySelector('#agent-objective')?.focus(); return toast('Add an objective first', 'error'); } data.draft.generated = true; save(); return render(); }
  if (action === 'copy-handoff') { try { await navigator.clipboard.writeText(buildHandoff()); toast('Agent brief copied'); } catch { toast('Clipboard unavailable. Select the brief and copy it manually.', 'error'); } return; }
  if (action === 'handoff-to-task') { if (!data.draft.objective.trim()) return; data.tasks.unshift({ id: uid(), spaceId: data.activeSpaceId, title: data.draft.objective.trim().slice(0, 120), detail: `Agent handoff prepared for ${roles[data.draft.role].name}.\n\n${data.draft.context.trim()}`.trim(), status: 'planned', priority: 'normal', createdAt: now() }); addActivity('task', 'Agent handoff added to workboard', data.draft.objective.trim().slice(0, 120)); save(); activateView('board'); return toast('Handoff added to workboard'); }
  if (action === 'focus-duration') { const value = Number(minutes); if (data.focus.status !== 'running' && [15,25,45].includes(value)) { data.focus.duration = value; data.focus.remaining = value * 60; data.focus.status = 'idle'; save(); render(); } return; }
  if (action === 'start-focus') { data.focus.endAt = now() + focusRemaining() * 1000; data.focus.status = 'running'; save(); render(); return toast('Focus session started'); }
  if (action === 'pause-focus') { data.focus.remaining = focusRemaining(); data.focus.status = 'paused'; data.focus.endAt = null; save(); render(); return toast('Session paused'); }
  if (action === 'reset-focus') { data.focus.remaining = data.focus.duration * 60; data.focus.status = 'idle'; data.focus.endAt = null; save(); render(); return toast('Session reset'); }
  if (action === 'theme') { data.settings.theme = theme === 'dark' ? 'dark' : 'light'; save(); render(); return toast(`${data.settings.theme === 'dark' ? 'Dark' : 'Light'} mode active`); }
  if (action === 'export') return exportSnapshot();
  if (action === 'import') return document.querySelector('#import-file')?.click();
  if (action === 'reset-data') { if (confirm('Reset all local Paragon data? Export a snapshot first if you want to keep it.')) { data = seed(); ui.selectedNoteId = null; ui.selectedFlowId = null; save(); activateView('home'); toast('Workspace reset'); } }
});

document.addEventListener('submit', event => {
  const form = event.target;
  if (!['task-form', 'flow-form', 'step-form', 'space-form'].includes(form.id)) return;
  event.preventDefault();
  const fields = new FormData(form);
  if (form.id === 'task-form') {
    const title = String(fields.get('title') || '').trim(); if (!title) return;
    const current = ui.modal.id ? data.tasks.find(t => t.id === ui.modal.id) : null;
    const oldStatus = current?.status;
    if (current) Object.assign(current, { title, detail: String(fields.get('detail') || '').trim(), status: fields.get('status'), priority: fields.get('priority') });
    else data.tasks.unshift({ id: uid(), spaceId: data.activeSpaceId, title, detail: String(fields.get('detail') || '').trim(), status: fields.get('status'), priority: fields.get('priority'), createdAt: now() });
    addActivity('task', current ? (oldStatus !== 'done' && fields.get('status') === 'done' ? 'Task completed' : 'Task updated') : 'Task created', title);
    ui.modal = null; save(); render(); return toast(current ? 'Task updated' : 'Task created');
  }
  if (form.id === 'flow-form') {
    const name = String(fields.get('name') || '').trim(); if (!name) return;
    const current = ui.modal.id ? data.flows.find(f => f.id === ui.modal.id) : null;
    if (current) Object.assign(current, { name, description: String(fields.get('description') || '').trim() });
    else { const flow = { id: uid(), spaceId: data.activeSpaceId, name, description: String(fields.get('description') || '').trim(), enabled: true, lastRun: null, steps: [] }; data.flows.unshift(flow); ui.selectedFlowId = flow.id; }
    addActivity('flow', current ? 'Routine updated' : 'Routine created', name);
    ui.modal = null; save(); render(); return toast(current ? 'Routine updated' : 'Routine created');
  }
  if (form.id === 'step-form') {
    const flow = data.flows.find(f => f.id === ui.modal.flowId);
    const content = String(fields.get('content') || '').trim(); if (!flow || !content) return;
    const current = ui.modal.id ? flow.steps.find(s => s.id === ui.modal.id) : null;
    if (current) Object.assign(current, { type: fields.get('type'), content });
    else flow.steps.push({ id: uid(), type: fields.get('type'), content });
    ui.modal = null; save(); render(); return toast(current ? 'Step updated' : 'Step added');
  }
  if (form.id === 'space-form') {
    const name = String(fields.get('name') || '').trim();
    const code = String(fields.get('code') || '').trim().toUpperCase();
    if (!name || !/^[A-Z0-9]{2,4}$/.test(code)) return;
    const current = ui.modal.id ? data.spaces.find(s => s.id === ui.modal.id) : null;
    if (data.spaces.some(s => s.code === code && s.id !== current?.id)) { document.querySelector('#space-code')?.focus(); return toast('That short code is already in use', 'error'); }
    if (current) { current.name = name; current.code = code; addActivity('system', 'Space updated', name, current.id); }
    else { const created = { id: uid(), name, code, createdAt: now() }; data.spaces.push(created); data.activeSpaceId = created.id; addActivity('system', 'Space created', name); ui.view = 'home'; ui.selectedFlowId = null; ui.selectedNoteId = null; }
    ui.modal = null; save(); render(); toast(current ? 'Space updated' : `${name} is ready`);
  }
});

document.addEventListener('input', event => {
  const target = event.target;
  if (target.id === 'palette-input') { ui.paletteQuery = target.value; ui.paletteIndex = 0; return refreshPalette(); }
  if (target.id === 'notes-search') { ui.noteQuery = target.value; const selection = ui.selectedNoteId; const list = document.querySelector('#notes-list'); const filtered = inSpace(data.notes).filter(n => `${n.title} ${n.body}`.toLowerCase().includes(ui.noteQuery.toLowerCase())).sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.updatedAt - a.updatedAt); if (list) list.innerHTML = filtered.length ? filtered.map(note => `<button class="note-list-item ${selection === note.id ? 'active' : ''}" data-action="select-note" data-id="${esc(note.id)}"><span class="note-list-meta">${note.pinned ? icon('pin', 13) : icon('note', 13)} ${relativeDate(note.updatedAt)}</span><strong>${esc(note.title || 'Untitled note')}</strong><small>${esc((note.body || 'Empty note').replace(/\n/g, ' ').slice(0, 90))}</small></button>`).join('') : '<div class="list-empty">No notes match your search.</div>'; return; }
  if (target.id === 'note-title' || target.id === 'note-body') { const note = data.notes.find(n => n.id === target.dataset.noteId); if (!note) return; if (target.id === 'note-title') note.title = target.value; else note.body = target.value; note.updatedAt = now(); save(); const item = document.querySelector(`.note-list-item[data-id="${CSS.escape(note.id)}"]`); if (item) { item.querySelector('strong').textContent = note.title || 'Untitled note'; item.querySelector('small').textContent = (note.body || 'Empty note').replace(/\n/g, ' ').slice(0, 90); } const count = document.querySelector('.editor-bottom span:last-child'); if (count) count.textContent = `${wordCount(note.body)} words`; return; }
  if (target.id === 'agent-objective') { data.draft.objective = target.value; data.draft.generated = false; save(); return; }
  if (target.id === 'agent-context') { data.draft.context = target.value; data.draft.generated = false; save(); return; }
});

document.addEventListener('change', event => {
  const target = event.target;
  if (target.dataset.flowEnabled) { const flow = data.flows.find(f => f.id === target.dataset.flowEnabled); if (flow) { flow.enabled = target.checked; save(); render(); toast(flow.enabled ? 'Routine enabled' : 'Routine paused'); } }
  if (target.id === 'focus-task') { data.focus.taskId = target.value; save(); render(); }
  if (target.id === 'import-file' && target.files?.[0]) {
    const file = target.files[0];
    file.text().then(text => { try { const candidate = JSON.parse(text); if (!validSnapshot(candidate)) throw new Error('Invalid snapshot'); if (!confirm('Replace the current workspace with this snapshot?')) return; data = candidate; ui.selectedNoteId = null; ui.selectedFlowId = null; save(); activateView('home'); toast('Snapshot restored'); } catch { toast('This is not a valid Paragon snapshot', 'error'); } });
  }
});

document.addEventListener('keydown', event => {
  const cmd = event.ctrlKey || event.metaKey;
  if (cmd && event.key.toLowerCase() === 'k') { event.preventDefault(); ui.palette = !ui.palette; ui.paletteQuery = ''; ui.paletteIndex = 0; return render(); }
  if (event.key === 'Escape') { if (ui.palette) ui.palette = false; else if (ui.modal) ui.modal = null; else if (ui.activityPanel) ui.activityPanel = false; else if (ui.spaceMenu) ui.spaceMenu = false; else return; return render(); }
  if (ui.palette) { if (event.key === 'ArrowDown') { event.preventDefault(); ui.paletteIndex = Math.min(ui.paletteIndex + 1, ui.paletteResults.length - 1); return refreshPalette(); } if (event.key === 'ArrowUp') { event.preventDefault(); ui.paletteIndex = Math.max(0, ui.paletteIndex - 1); return refreshPalette(); } if (event.key === 'Enter') { event.preventDefault(); return ui.paletteResults[ui.paletteIndex]?.run(); } }
  if (event.altKey && !event.ctrlKey && !event.metaKey && /^[1-7]$/.test(event.key)) { event.preventDefault(); return activateView(['home','board','notes','flows','agents','focus','activity'][Number(event.key) - 1]); }
});

let draggedTaskId = null;
document.addEventListener('dragstart', event => { const card = event.target.closest('[data-drag-id]'); if (card) { draggedTaskId = card.dataset.dragId; event.dataTransfer.effectAllowed = 'move'; card.classList.add('dragging'); } });
document.addEventListener('dragend', () => { draggedTaskId = null; document.querySelectorAll('.board-column').forEach(col => col.classList.remove('drop-target')); document.querySelectorAll('.dragging').forEach(el => el.classList.remove('dragging')); });
document.addEventListener('dragover', event => { const column = event.target.closest('[data-drop-status]'); if (!column || !draggedTaskId) return; event.preventDefault(); document.querySelectorAll('.board-column').forEach(col => col.classList.toggle('drop-target', col === column)); });
document.addEventListener('drop', event => { const column = event.target.closest('[data-drop-status]'); if (!column || !draggedTaskId) return; event.preventDefault(); const task = data.tasks.find(t => t.id === draggedTaskId); if (task && task.status !== column.dataset.dropStatus) { task.status = column.dataset.dropStatus; addActivity('task', task.status === 'done' ? 'Task completed' : 'Task moved', `${task.title} → ${task.status === 'progress' ? 'In motion' : task.status}`, task.spaceId); save(); render(); toast('Task moved'); } draggedTaskId = null; });

tickFocus();
render();
setInterval(tickFocus, 1000);
