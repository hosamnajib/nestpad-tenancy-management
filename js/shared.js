function getCurrentUser() {
  try {
    const raw = localStorage.getItem('nestpad_current_user');
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return null;
}

function handleLogout() {
  if (confirm('Are you sure you want to sign out?')) {
    localStorage.removeItem('nestpad_current_user');
    window.location.replace('login.html');
  }
}

// Render standard sidebar and top header across all pages
function renderSharedLayout(activePage = 'dashboard') {
  // Auth guard: redirect to login if session missing
  const currentUser = getCurrentUser();
  const isLoginPage = window.location.pathname.endsWith('login.html');
  if (!currentUser && !isLoginPage) {
    window.location.replace('login.html');
    return;
  }

  // 1. Ensure Toast Container exists
  if (!document.getElementById('toast-container')) {
    const tc = document.createElement('div');
    tc.id = 'toast-container';
    tc.className = 'toast-container';
    document.body.appendChild(tc);
  }

  // 2. Ensure Global Modal Container exists
  if (!document.getElementById('global-modal')) {
    const modalHTML = `
      <div id="global-modal" class="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="global-modal-title">
        <div class="modal-card">
          <div class="modal-header">
            <h3 id="global-modal-title">Modal Title</h3>
            <button class="modal-close" onclick="closeGlobalModal()" aria-label="Close modal">&times;</button>
          </div>
          <div id="global-modal-body" class="modal-body">
            <!-- Modal Body Content -->
          </div>
          <div id="global-modal-footer" class="modal-footer">
            <button class="btn btn-secondary" onclick="closeGlobalModal()">Close</button>
          </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeGlobalModal();
    });
  }

  // 3. Render or enhance Sidebar
  let sidebarContainer = document.getElementById('sidebar-container');
  if (!sidebarContainer) {
    const existingSidebar = document.querySelector('aside.sidebar');
    if (existingSidebar) {
      existingSidebar.outerHTML = '<div id="sidebar-container"></div>';
      sidebarContainer = document.getElementById('sidebar-container');
    }
  }

  if (sidebarContainer) {
    const m = (typeof logic !== 'undefined') ? logic.getMetrics() : { occupancyRate: 94, totalUnits: 18, occupiedUnits: 17 };
    const dbTypeLabel = 'MySQL Live';

    sidebarContainer.innerHTML = `
      <aside class="sidebar" aria-label="Main Navigation">
        <div>
          <a href="dashboard.html" class="brand" title="NestPad Home">
            <div class="brand-icon">N</div>
            <div class="brand-text">
              <h1>NestPad</h1>
              <span>PROPERTY OPS</span>
            </div>
          </a>

          <nav>
            <ul class="nav-list">
              <li>
                <a href="dashboard.html" class="nav-item ${activePage === 'dashboard' ? 'active' : ''}">
                  <span class="nav-icon">📊</span> Dashboard
                </a>
              </li>
              <li>
                <a href="properties.html" class="nav-item ${activePage === 'properties' ? 'active' : ''}">
                  <span class="nav-icon">🏢</span> Properties & Units
                </a>
              </li>
              <li>
                <a href="rent-ledger.html" class="nav-item ${activePage === 'ledger' ? 'active' : ''}">
                  <span class="nav-icon">📖</span> Rent Ledger
                </a>
              </li>
              <li>
                <a href="maintenance.html" class="nav-item ${activePage === 'maintenance' ? 'active' : ''}">
                  <span class="nav-icon">🔧</span> Maintenance
                </a>
              </li>
              <li>
                <a href="tenants.html" class="nav-item ${activePage === 'tenants' ? 'active' : ''}">
                  <span class="nav-icon">📑</span> Tenants & Leases
                </a>
              </li>
              <li>
                <a href="calendar.html" class="nav-item ${activePage === 'calendar' ? 'active' : ''}">
                  <span class="nav-icon">📅</span> Calendar & Schedule
                </a>
              </li>
              <li>
                <a href="documents.html" class="nav-item ${activePage === 'documents' ? 'active' : ''}">
                  <span class="nav-icon">📂</span> Documents & Vault
                </a>
              </li>
              <li>
                <a href="audit.html" class="nav-item ${activePage === 'audit' ? 'active' : ''}">
                  <span class="nav-icon">🛡️</span> Audit Trail & DB
                </a>
              </li>
            </ul>
          </nav>
        </div>

        <div class="sidebar-footer">
          <!-- Monthly Health -->
          <div>
            <div class="health-header">
              <span>PORTFOLIO OCCUPANCY</span>
              <span style="color: var(--primary);">${m.occupancyRate}%</span>
            </div>
            <div class="health-bar" style="margin-top: 6px;">
              <div class="health-progress" style="width: ${m.occupancyRate}%;"></div>
            </div>
            <p class="health-text" style="margin-top: 4px;">${m.occupiedUnits} of ${m.totalUnits} units active & occupied.</p>
          </div>

          <!-- Active User -->
          <div class="user-admin-card" style="background: var(--bg-main); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 8px 10px; display: flex; align-items: center; justify-content: space-between; gap: 8px;">
            <div style="display: flex; align-items: center; gap: 10px; overflow: hidden;">
              <div class="avatar-initials" style="width: 32px; height: 32px; font-size: 11px; background: var(--primary); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; flex-shrink: 0;">${currentUser ? currentUser.initials : 'SJ'}</div>
              <div style="line-height: 1.2; overflow: hidden;">
                <div style="font-size: 12px; font-weight: 700; color: var(--text-main); white-space: nowrap; text-overflow: ellipsis; overflow: hidden;">${currentUser ? currentUser.name : 'Sarah Jenkins'}</div>
                <div style="font-size: 10px; color: var(--text-muted); text-transform: uppercase; font-weight: 700;">${currentUser ? currentUser.role : 'Manager / Admin'}</div>
              </div>
            </div>
            <button onclick="handleLogout()" title="Sign Out" style="background: none; border: none; cursor: pointer; color: var(--text-muted); font-size: 14px; padding: 4px; border-radius: 4px;" aria-label="Sign Out">🚪</button>
          </div>
        </div>
      </aside>
    `;
  }

  // 4. Render or enhance Top Header
  let headerContainer = document.getElementById('header-container');
  if (headerContainer) {
    const m = (typeof logic !== 'undefined') ? logic.getMetrics() : { overdueCount: 2, urgentMaint: 1 };
    const alertCount = (m.overdueCount || 0) + (m.urgentMaint || 0);

    headerContainer.innerHTML = `
      <header class="top-header">
        <div class="header-left">
          <div class="property-selector">
            <select id="shared-prop-filter" onchange="handlePropertyFilter(this.value)">
              <option value="all">🏢 All Properties (${m.totalUnits || 18} Units)</option>
              <option value="b-1">Maple Crest Apartments (Bangsar)</option>
              <option value="b-2">Cedar Park Duplexes (Desa ParkCity)</option>
              <option value="b-3">Elmwood Townhomes (Subang Jaya)</option>
            </select>
          </div>
          <div class="header-date">
            📅 Today, Oct 14, 2026
          </div>
        </div>

        <div class="header-actions">
          <button class="btn btn-primary" onclick="openQuickActionModal()">
            ⚡ + Quick Action
          </button>
          
          <button class="btn btn-secondary btn-icon-only" onclick="showNotificationDrawer()" aria-label="Notifications" title="${alertCount} Notifications">
            🔔
            ${alertCount > 0 ? `<span class="notification-badge">${alertCount}</span>` : ''}
          </button>

          <div class="user-profile">
            <div class="avatar-initials">SJ</div>
            <div class="user-info">
              <span class="user-name">Sarah Jenkins</span>
              <span class="user-role">Admin / Manager</span>
            </div>
          </div>
        </div>
      </header>
    `;
  }
}

// ----------------------------------------------------
// Global Modals & Actions
// ----------------------------------------------------

function openQuickActionModal() {
  const title = document.getElementById('global-modal-title');
  const body = document.getElementById('global-modal-body');
  const footer = document.getElementById('global-modal-footer');
  if (!title || !body) return;

  title.innerText = '⚡ Quick Action Launcher';
  body.innerHTML = `
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
      <button class="btn btn-secondary" style="height: 60px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px;" onclick="closeGlobalModal(); openRecordPaymentModal();">
        <span style="font-size: 18px;">💵</span>
        <span>Record Rent Payment</span>
      </button>

      <button class="btn btn-secondary" style="height: 60px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px;" onclick="closeGlobalModal(); openLogMaintenanceModal();">
        <span style="font-size: 18px;">🔧</span>
        <span>Log Maintenance Issue</span>
      </button>

      <button class="btn btn-secondary" style="height: 60px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px;" onclick="closeGlobalModal(); openAddUnitModal();">
        <span style="font-size: 18px;">🚪</span>
        <span>Add Unit to Portfolio</span>
      </button>

      <button class="btn btn-secondary" style="height: 60px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px;" onclick="closeGlobalModal(); openAddCalendarEventModal();">
        <span style="font-size: 18px;">📅</span>
        <span>Schedule Calendar Event</span>
      </button>

      <button class="btn btn-secondary" style="height: 60px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px;" onclick="closeGlobalModal(); openAddNoteModal();">
        <span style="font-size: 18px;">📝</span>
        <span>Add Manager Note / Task</span>
      </button>

      <button class="btn btn-secondary" style="height: 60px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px;" onclick="closeGlobalModal(); window.location.href='audit.html';">
        <span style="font-size: 18px;">🛡️</span>
        <span>View Audit Trail</span>
      </button>
    </div>
  `;

  footer.innerHTML = `
    <button class="btn btn-secondary" onclick="closeGlobalModal()">Cancel</button>
  `;
  document.getElementById('global-modal').classList.add('active');
}

function openRecordPaymentModal(tenancyId = '', personId = '', chargeId = '', defaultAmount = '') {
  const title = document.getElementById('global-modal-title');
  const body = document.getElementById('global-modal-body');
  const footer = document.getElementById('global-modal-footer');
  if (!title || !body) return;

  const db = (typeof dbStore !== 'undefined') ? dbStore.getDB() : {};
  const charges = db.charges || [];
  const unpaidCharges = charges.filter(c => c.status !== 'Paid');

  title.innerText = '💵 Record Rent Payment & Allocate';
  body.innerHTML = `
    <div class="form-group">
      <label>Select Unpaid Charge</label>
      <select id="modal-pay-charge" class="form-control" onchange="autoFillChargeAmount(this)">
        <option value="">-- Choose Charge to Settle --</option>
        ${unpaidCharges.map(c => {
          const t = (db.tenancies || []).find(x => x.id === c.tenancyId);
          const u = t ? (db.units || []).find(x => x.id === t.unitId) : null;
          const isSelected = c.id === chargeId ? 'selected' : '';
          return `<option value="${c.id}" data-amount="${c.amount}" data-tenancy="${c.tenancyId}" ${isSelected}>${u ? u.unitNumber : 'Unit'} — ${c.period} ($${c.amount}) [${c.status}]</option>`;
        }).join('')}
      </select>
    </div>

    <div class="form-group">
      <label>Payment Amount ($)</label>
      <input type="number" id="modal-pay-amount" class="form-control" value="${defaultAmount || 1750}">
    </div>

    <div class="form-group">
      <label>Payment Method</label>
      <select id="modal-pay-method" class="form-control">
        <option value="Personal Check">Personal Check</option>
        <option value="Zelle Transfer">Zelle Transfer</option>
        <option value="Cash Receipt">Cash Receipt ($100 bills)</option>
        <option value="Bank Wire">Bank Wire Transfer</option>
        <option value="Venmo">Venmo</option>
        <option value="USPS Money Order">USPS Money Order</option>
      </select>
    </div>

    <div class="form-group">
      <label>Bank Reference / Check / Receipt Number</label>
      <input type="text" id="modal-pay-ref" class="form-control" value="Ref #CH-${Date.now().toString().slice(-4)}">
    </div>
  `;

  footer.innerHTML = `
    <button class="btn btn-secondary" onclick="closeGlobalModal()">Cancel</button>
    <button class="btn btn-primary" onclick="submitGlobalPayment('${tenancyId}', '${personId}')">Confirm & Allocate Payment</button>
  `;
  document.getElementById('global-modal').classList.add('active');
}

function autoFillChargeAmount(selectElem) {
  const opt = selectElem.options[selectElem.selectedIndex];
  if (opt && opt.getAttribute('data-amount')) {
    document.getElementById('modal-pay-amount').value = opt.getAttribute('data-amount');
  }
}

function submitGlobalPayment(defaultTenancyId, defaultPersonId) {
  const chargeId = document.getElementById('modal-pay-charge').value;
  const amount = document.getElementById('modal-pay-amount').value;
  const method = document.getElementById('modal-pay-method').value;
  const ref = document.getElementById('modal-pay-ref').value;

  if (!amount || Number(amount) <= 0) {
    alert('Please enter a valid payment amount.');
    return;
  }

  const db = dbStore.getDB();
  let tenancyId = defaultTenancyId;
  let personId = defaultPersonId;

  if (chargeId) {
    const chg = db.charges.find(c => c.id === chargeId);
    if (chg) {
      tenancyId = chg.tenancyId;
      const tp = (db.tenancyParties || []).find(x => x.tenancyId === tenancyId);
      if (tp) personId = tp.personId;
    }
  }

  logic.recordPayment(tenancyId, personId, amount, method, ref, chargeId);
  closeGlobalModal();
  showToast(`Payment of $${Number(amount).toLocaleString()} successfully recorded and allocated!`, 'success');
  if (typeof refreshCurrentPage === 'function') refreshCurrentPage();
}

function openLogMaintenanceModal(defaultUnitId = '') {
  const title = document.getElementById('global-modal-title');
  const body = document.getElementById('global-modal-body');
  const footer = document.getElementById('global-modal-footer');
  if (!title || !body) return;

  const db = (typeof dbStore !== 'undefined') ? dbStore.getDB() : {};
  const units = db.units || [];

  title.innerText = '🔧 Log New Maintenance Request';
  body.innerHTML = `
    <div class="form-group">
      <label>Affected Unit</label>
      <select id="modal-maint-unit" class="form-control">
        ${units.map(u => `
          <option value="${u.id}" ${u.id === defaultUnitId ? 'selected' : ''}>${u.unitNumber} (${u.status})</option>
        `).join('')}
      </select>
    </div>

    <div class="form-group">
      <label>Issue Title</label>
      <input type="text" id="modal-maint-issue" class="form-control" placeholder="e.g. Water heater pilot light went out">
    </div>

    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
      <div class="form-group">
        <label>Category</label>
        <select id="modal-maint-cat" class="form-control">
          <option>Plumbing</option>
          <option>Electrical</option>
          <option>HVAC / Aircon</option>
          <option>Carpentry / Door</option>
          <option>Appliance</option>
          <option>Turnover Prep</option>
        </select>
      </div>

      <div class="form-group">
        <label>Urgency Level</label>
        <select id="modal-maint-urgency" class="form-control">
          <option value="URGENT">URGENT (Immediate response)</option>
          <option value="MEDIUM" selected>MEDIUM (Within 48h)</option>
          <option value="LOW">LOW (Routine upkeep)</option>
        </select>
      </div>
    </div>

    <div class="form-group">
      <label>Description & Notes</label>
      <textarea id="modal-maint-desc" class="form-control" placeholder="Describe symptoms, tenant report, location in unit..."></textarea>
    </div>
  `;

  footer.innerHTML = `
    <button class="btn btn-secondary" onclick="closeGlobalModal()">Cancel</button>
    <button class="btn btn-primary" onclick="submitGlobalMaintenance()">Submit Request</button>
  `;
  document.getElementById('global-modal').classList.add('active');
}

function submitGlobalMaintenance() {
  const unitId = document.getElementById('modal-maint-unit').value;
  const issue = document.getElementById('modal-maint-issue').value;
  const cat = document.getElementById('modal-maint-cat').value;
  const urgency = document.getElementById('modal-maint-urgency').value;
  const desc = document.getElementById('modal-maint-desc').value;

  if (!issue || !issue.trim()) {
    alert('Please enter an issue title.');
    return;
  }

  logic.createMaintenanceRequest(unitId, null, issue.trim(), cat, urgency, desc.trim());
  closeGlobalModal();
  showToast(`Maintenance issue "${issue.trim()}" logged and added to triage!`, 'success');
  if (typeof refreshCurrentPage === 'function') refreshCurrentPage();
}

function openAddUnitModal(defaultBuildingId = '') {
  const title = document.getElementById('global-modal-title');
  const body = document.getElementById('global-modal-body');
  const footer = document.getElementById('global-modal-footer');
  if (!title || !body) return;

  const db = (typeof dbStore !== 'undefined') ? dbStore.getDB() : {};
  const buildings = db.buildings || [];

  title.innerText = '🏢 Add Unit to Portfolio';
  body.innerHTML = `
    <div class="form-group">
      <label>Building / Property Complex</label>
      <select id="modal-unit-building" class="form-control">
        ${buildings.map(b => `
          <option value="${b.id}" ${b.id === defaultBuildingId ? 'selected' : ''}>${b.name} (${b.city})</option>
        `).join('')}
      </select>
    </div>

    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
      <div class="form-group">
        <label>Unit Identifier</label>
        <input type="text" id="modal-unit-num" class="form-control" placeholder="e.g. Unit 5B">
      </div>
      <div class="form-group">
        <label>Floor / Wing</label>
        <input type="text" id="modal-unit-floor" class="form-control" placeholder="e.g. 5th Floor West Wing">
      </div>
    </div>

    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px;">
      <div class="form-group">
        <label>Bedrooms</label>
        <input type="number" id="modal-unit-beds" class="form-control" value="2">
      </div>
      <div class="form-group">
        <label>Bathrooms</label>
        <input type="number" id="modal-unit-baths" class="form-control" value="2">
      </div>
      <div class="form-group">
        <label>Target Rent ($)</label>
        <input type="number" id="modal-unit-rent" class="form-control" value="1850">
      </div>
    </div>

    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
      <div class="form-group">
        <label>Lockbox Code</label>
        <input type="text" id="modal-unit-lockbox" class="form-control" placeholder="e.g. 4821">
      </div>
      <div class="form-group">
        <label>Parking Bays</label>
        <input type="text" id="modal-unit-parking" class="form-control" placeholder="e.g. Spot #18">
      </div>
    </div>
  `;

  footer.innerHTML = `
    <button class="btn btn-secondary" onclick="closeGlobalModal()">Cancel</button>
    <button class="btn btn-primary" onclick="submitGlobalUnit()">Add Unit</button>
  `;
  document.getElementById('global-modal').classList.add('active');
}

function submitGlobalUnit() {
  const buildingId = document.getElementById('modal-unit-building').value;
  const unitNum = document.getElementById('modal-unit-num').value;
  const floor = document.getElementById('modal-unit-floor').value;
  const beds = document.getElementById('modal-unit-beds').value;
  const baths = document.getElementById('modal-unit-baths').value;
  const rent = document.getElementById('modal-unit-rent').value;
  const lockbox = document.getElementById('modal-unit-lockbox').value;
  const parking = document.getElementById('modal-unit-parking').value;

  if (!unitNum || !unitNum.trim()) {
    alert('Please enter a unit number (e.g. Unit 5B).');
    return;
  }

  logic.addUnit(buildingId, unitNum.trim(), floor, beds, baths, parking, rent, lockbox);
  closeGlobalModal();
  showToast(`Unit ${unitNum.trim()} added to portfolio!`, 'success');
  if (typeof refreshCurrentPage === 'function') refreshCurrentPage();
}

function openAddCalendarEventModal() {
  const title = document.getElementById('global-modal-title');
  const body = document.getElementById('global-modal-body');
  const footer = document.getElementById('global-modal-footer');
  if (!title || !body) return;

  title.innerText = '📅 Schedule Calendar Event';
  body.innerHTML = `
    <div class="form-group">
      <label>Event Title</label>
      <input type="text" id="modal-event-title" class="form-control" placeholder="e.g. Roof gutter inspection">
    </div>

    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
      <div class="form-group">
        <label>Date (YYYY-MM-DD)</label>
        <input type="date" id="modal-event-date" class="form-control" value="2026-10-18">
      </div>
      <div class="form-group">
        <label>Time</label>
        <input type="text" id="modal-event-time" class="form-control" value="10:00 AM">
      </div>
    </div>

    <div class="form-group">
      <label>Event Type</label>
      <select id="modal-event-type" class="form-control">
        <option>Inspection</option>
        <option>Maintenance</option>
        <option>Showing / Viewing</option>
        <option>Move-In / Move-Out</option>
        <option>Owner Meeting</option>
      </select>
    </div>

    <div class="form-group">
      <label>Notes & Details</label>
      <textarea id="modal-event-notes" class="form-control" placeholder="Contact person, phone, access instructions..."></textarea>
    </div>
  `;

  footer.innerHTML = `
    <button class="btn btn-secondary" onclick="closeGlobalModal()">Cancel</button>
    <button class="btn btn-primary" onclick="submitGlobalCalendarEvent()">Save Event</button>
  `;
  document.getElementById('global-modal').classList.add('active');
}

function submitGlobalCalendarEvent() {
  const t = document.getElementById('modal-event-title').value;
  const d = document.getElementById('modal-event-date').value;
  const time = document.getElementById('modal-event-time').value;
  const type = document.getElementById('modal-event-type').value;
  const notes = document.getElementById('modal-event-notes').value;

  if (!t || !t.trim()) { alert('Please enter an event title.'); return; }

  logic.addCalendarEvent(t.trim(), d, time, type, notes);
  closeGlobalModal();
  showToast(`Event "${t.trim()}" added to calendar!`, 'success');
  if (typeof refreshCurrentPage === 'function') refreshCurrentPage();
}

function openAddNoteModal() {
  const title = document.getElementById('global-modal-title');
  const body = document.getElementById('global-modal-body');
  const footer = document.getElementById('global-modal-footer');
  if (!title || !body) return;

  title.innerText = '📝 Add Manager Task / Note';
  body.innerHTML = `
    <div class="form-group">
      <label>Task / Note Title</label>
      <input type="text" id="modal-note-title" class="form-control" placeholder="e.g. Call insurance broker for annual policy renewal">
    </div>
    <div class="form-group">
      <label>Due Date</label>
      <input type="date" id="modal-note-date" class="form-control" value="2026-10-18">
    </div>
    <div class="form-group">
      <label>Category</label>
      <select id="modal-note-type" class="form-control">
        <option>General Follow-up</option>
        <option>Lease Renewal</option>
        <option>Maintenance</option>
        <option>Financial / Bank</option>
      </select>
    </div>
  `;

  footer.innerHTML = `
    <button class="btn btn-secondary" onclick="closeGlobalModal()">Cancel</button>
    <button class="btn btn-primary" onclick="submitGlobalNote()">Add Task</button>
  `;
  document.getElementById('global-modal').classList.add('active');
}

function submitGlobalNote() {
  const t = document.getElementById('modal-note-title').value;
  const d = document.getElementById('modal-note-date').value;
  const type = document.getElementById('modal-note-type').value;
  if (!t || !t.trim()) { alert('Please enter a note title.'); return; }

  logic.addTask(t.trim(), d, type);
  closeGlobalModal();
  showToast('Task added to Manager Notebook!', 'success');
  if (typeof refreshCurrentPage === 'function') refreshCurrentPage();
}

// ----------------------------------------------------
// Database & Cloud Sync Settings Modal
// ----------------------------------------------------


// ----------------------------------------------------
// Notification Alert Drawer
// ----------------------------------------------------

function showNotificationDrawer() {
  const m = logic.getMetrics();
  const db = dbStore.getDB();
  const title = document.getElementById('global-modal-title');
  const body = document.getElementById('global-modal-body');
  const footer = document.getElementById('global-modal-footer');
  if (!title || !body) return;

  const overdueCharges = (db.charges || []).filter(c => c.status === 'Overdue');
  const urgentMaint = (db.maintenanceRequests || []).filter(r => r.urgency === 'URGENT' && r.status !== 'Resolved');

  title.innerText = '🔔 Operational Alerts & Notifications';
  body.innerHTML = `
    <h4 style="font-size: 14px; font-weight: 800; margin-bottom: 10px;">⚠️ Overdue Rent (${overdueCharges.length})</h4>
    ${overdueCharges.map(c => {
      const t = (db.tenancies || []).find(x => x.id === c.tenancyId);
      const u = t ? (db.units || []).find(x => x.id === t.unitId) : null;
      return `
        <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 12px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <strong>${u ? u.unitNumber : 'Unit'} — ${c.period}</strong>
            <div style="font-size: 11.5px; color: #dc2626;">Due Date: ${c.dueDate} • $${c.amount}</div>
          </div>
          <button class="btn btn-primary btn-sm" onclick="closeGlobalModal(); openRecordPaymentModal('${c.tenancyId}', '', '${c.id}', ${c.amount});">Settle Now</button>
        </div>
      `;
    }).join('')}

    <h4 style="font-size: 14px; font-weight: 800; margin: 18px 0 10px 0;">🚨 Urgent Maintenance Attention (${urgentMaint.length})</h4>
    ${urgentMaint.map(r => {
      const u = (db.units || []).find(x => x.id === r.unitId);
      return `
        <div style="background: #fffbe6; border: 1px solid #fde68a; border-radius: 8px; padding: 12px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <strong>${u ? u.unitNumber : 'Unit'}: ${r.issue}</strong>
            <div style="font-size: 11.5px; color: #b45309;">Reported: ${r.dateReported} • Category: ${r.category}</div>
          </div>
          <a href="maintenance.html" class="btn btn-secondary btn-sm">View in Kanban ↗</a>
        </div>
      `;
    }).join('')}
  `;

  footer.innerHTML = `
    <button class="btn btn-secondary" onclick="closeGlobalModal()">Close</button>
  `;
  document.getElementById('global-modal').classList.add('active');
}

// ----------------------------------------------------
// Toast Notification
// ----------------------------------------------------

function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <span>${type === 'success' ? '✔️' : (type === 'error' ? '❌' : 'ℹ️')}</span>
    <div>${message}</div>
  `;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(100%)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

function closeGlobalModal() {
  const modal = document.getElementById('global-modal');
  if (modal) modal.classList.remove('active');
}

function handleRoleSwitch(role) {
  const labels = {
    pm: 'Sarah Jenkins (Property Mgr)',
    owner: 'Robert Vance (Client Owner)',
    accountant: 'Audit / Accounting Mode'
  };
  showToast(`View switched to ${labels[role] || role}`, 'info');
}

function handlePropertyFilter(buildingId) {
  if (typeof applyPropertyFilter === 'function') {
    applyPropertyFilter(buildingId);
  } else {
    showToast(buildingId === 'all' ? 'Filtering all 18 units across properties' : `Filtering by property: ${buildingId}`, 'info');
  }
}

// Auto-listen to database updates across windows/tabs
window.addEventListener('nestpad_db_updated', () => {
  if (typeof refreshCurrentPage === 'function') {
    refreshCurrentPage();
  }
});
