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
          <div class="user-admin-card" style="background: var(--bg-main); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 10px; margin-top: 10px;">
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
              <div class="avatar-initials" style="width: 32px; height: 32px; font-size: 11px; background: var(--primary); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; flex-shrink: 0;">${currentUser ? currentUser.initials : 'SJ'}</div>
              <div style="line-height: 1.2; overflow: hidden;">
                <div style="font-size: 12px; font-weight: 700; color: var(--text-main); white-space: nowrap; text-overflow: ellipsis; overflow: hidden;">${currentUser ? currentUser.name : 'Sarah Jenkins'}</div>
                <div style="font-size: 10px; color: var(--text-muted); text-transform: uppercase; font-weight: 700;">${currentUser ? currentUser.role : 'Manager / Admin'}</div>
              </div>
            </div>
            <button onclick="handleLogout()" class="btn btn-secondary btn-sm" style="width: 100%; justify-content: center; font-size: 11.5px; font-weight: 700; color: #dc2626; border-color: #fecaca; background: #ffffff; padding: 6px 10px; gap: 6px;">
              <span>🚪</span> Sign Out
            </button>
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

        <div class="header-actions" style="display: flex; align-items: center; gap: 10px;">
          <button class="btn btn-primary btn-sm" onclick="openQuickActionModal()" style="padding: 7px 14px; font-size: 12.5px;">
            ⚡ + Quick Action
          </button>
          
          <button class="btn btn-secondary btn-icon-only" onclick="showNotificationDrawer()" aria-label="Notifications" title="${alertCount} Notifications">
            🔔
            ${alertCount > 0 ? `<span class="notification-badge">${alertCount}</span>` : ''}
          </button>

          <div class="user-profile" style="display: flex; align-items: center; gap: 8px; padding: 4px 10px; background: var(--bg-main); border: 1px solid var(--border-color); border-radius: var(--radius-md);">
            <div class="avatar-initials" style="width: 28px; height: 28px; border-radius: 50%; background: var(--primary); color: white; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700;">${currentUser ? currentUser.initials : 'SJ'}</div>
            <div class="user-info" style="line-height: 1.2;">
              <span class="user-name" style="font-size: 12px; font-weight: 700; display: block;">${currentUser ? currentUser.name : 'Sarah Jenkins'}</span>
              <span class="user-role" style="font-size: 10px; color: var(--text-muted); font-weight: 600;">${currentUser ? currentUser.role : 'Manager / Admin'}</span>
            </div>
          </div>

          <button class="btn btn-secondary btn-sm" onclick="handleLogout()" style="font-weight: 700; color: #dc2626; border-color: #fecaca; background: #fff5f5; padding: 7px 12px; display: inline-flex; align-items: center; gap: 6px;" title="Sign out of NestPad">
            <span>🚪</span> Sign Out
          </button>
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
// Global Interactive Drill-Down Details Modals
// ----------------------------------------------------

function showTenantModal(identifier) {
  const db = (typeof dbStore !== 'undefined') ? dbStore.getDB() : {};
  const persons = db.persons || [];
  const tenancies = db.tenancies || [];
  const parties = db.tenancyParties || [];
  const units = db.units || [];
  const buildings = db.buildings || [];
  const depositLedgers = db.depositLedgers || [];
  const charges = db.charges || [];

  if (!identifier) return;

  // Lookup person
  let person = persons.find(p => p.id === identifier);
  let tenancy = null;

  if (!person) {
    // Check if identifier is a tenancy ID
    tenancy = tenancies.find(t => t.id === identifier);
    if (tenancy) {
      const party = parties.find(tp => tp.tenancyId === tenancy.id && tp.role === 'Primary Tenant');
      if (party) person = persons.find(p => p.id === party.personId);
    }
  }

  if (!person) {
    // Match by name
    const q = String(identifier).toLowerCase().trim();
    person = persons.find(p => p.name.toLowerCase().includes(q) || q.includes(p.name.toLowerCase()));
  }

  if (!person) {
    showToast(`Tenant "${identifier}" details could not be found.`, 'error');
    return;
  }

  // Find associated tenancy if not already found
  if (!tenancy) {
    const party = parties.find(tp => tp.personId === person.id);
    if (party) tenancy = tenancies.find(t => t.id === party.tenancyId);
  }

  const unit = tenancy ? units.find(u => u.id === tenancy.unitId) : null;
  const building = unit ? buildings.find(b => b.id === unit.buildingId) : null;
  const dl = tenancy ? depositLedgers.find(d => d.tenancyId === tenancy.id) : null;
  const tenantCharges = tenancy ? charges.filter(c => c.tenancyId === tenancy.id) : [];
  const overdueCharges = tenantCharges.filter(c => c.status === 'Overdue');
  const coParties = tenancy ? parties.filter(tp => tp.tenancyId === tenancy.id && tp.personId !== person.id) : [];
  const coTenants = coParties.map(cp => persons.find(p => p.id === cp.personId)).filter(Boolean);

  const initials = person.name.split(' ').map(n => n[0]).join('').slice(0, 2);

  const title = document.getElementById('global-modal-title');
  const body = document.getElementById('global-modal-body');
  const footer = document.getElementById('global-modal-footer');
  if (!title || !body) return;

  title.innerHTML = `👤 Tenant Dossier — ${person.name}`;
  body.innerHTML = `
    <div style="display: flex; gap: 16px; align-items: center; margin-bottom: 20px; padding-bottom: 16px; border-bottom: 1px solid var(--border-color);">
      <div class="avatar-initials" style="width: 56px; height: 56px; font-size: 20px; font-weight: 800; background: var(--primary); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
        ${initials}
      </div>
      <div style="flex: 1;">
        <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
          <h3 style="font-size: 20px; font-weight: 800; margin: 0; color: var(--text-main);">${person.name}</h3>
          <span class="badge ${tenancy && tenancy.status === 'Active' ? 'badge-paid' : 'badge-warning'}">${tenancy ? tenancy.status : 'Registered Resident'}</span>
          <span class="badge badge-secondary" style="font-size: 11px;">${person.type || 'Individual'}</span>
        </div>
        <div style="font-size: 12px; color: var(--text-muted); margin-top: 4px;">
          National ID / Passport: <code style="background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-weight: 700;">${person.icPassport || 'N/A'}</code>
        </div>
      </div>
    </div>

    <!-- Contact & Emergency Details -->
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 20px;">
      <div style="background: #f8fafc; border: 1px solid var(--border-color); border-radius: 8px; padding: 12px;">
        <div style="font-size: 11px; font-weight: 800; color: var(--text-muted); text-transform: uppercase;">Direct Contact</div>
        <div style="margin-top: 6px; font-size: 13px;">
          <div>📞 <strong>Phone:</strong> <a href="tel:${person.phone}" style="color: var(--primary); font-weight: 700; text-decoration: none;">${person.phone || 'N/A'}</a></div>
          <div style="margin-top: 4px;">✉️ <strong>Email:</strong> <a href="mailto:${person.email}" style="color: var(--primary); font-weight: 700; text-decoration: none;">${person.email || 'N/A'}</a></div>
        </div>
      </div>

      <div style="background: #f8fafc; border: 1px solid var(--border-color); border-radius: 8px; padding: 12px;">
        <div style="font-size: 11px; font-weight: 800; color: var(--text-muted); text-transform: uppercase;">Emergency Contact</div>
        <div style="margin-top: 6px; font-size: 13px; color: var(--text-main);">
          🚨 ${person.emergencyContact || 'None listed'}
        </div>
        ${coTenants.length > 0 ? `
          <div style="margin-top: 6px; font-size: 12px; color: var(--text-muted);">
            👥 <strong>Co-Occupants:</strong> ${coTenants.map(c => `<span class="clickable-entity" onclick="showTenantModal('${c.id}')">${c.name}</span>`).join(', ')}
          </div>
        ` : ''}
      </div>
    </div>

    <!-- Active Lease / Tenancy Contract -->
    <div style="background: white; border: 1px solid var(--border-color); border-radius: 8px; padding: 16px; margin-bottom: 20px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
        <strong style="font-size: 14px; color: var(--text-main);">📑 Active Tenancy Agreement</strong>
        ${tenancy ? `<span style="font-size: 11px; color: #047857; font-weight: 700;">✔️ Stamped: ${tenancy.stampingRef || 'LHDN Verified'}</span>` : ''}
      </div>

      ${tenancy ? `
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; font-size: 12.5px;">
          <div>
            <span style="color: var(--text-muted); font-size: 11px; display: block;">RESIDENCE UNIT</span>
            <span class="clickable-entity" onclick="showUnitModal('${unit ? unit.id : tenancy.unitId}')" style="font-weight: 800; font-size: 14px; margin-top: 2px;">
              🚪 ${unit ? unit.unitNumber : 'Unit'}
            </span>
            ${building ? `<div style="font-size: 11px; color: var(--text-muted);"><span class="clickable-entity" onclick="showBuildingModal('${building.id}')">🏢 ${building.name}</span></div>` : ''}
          </div>

          <div>
            <span style="color: var(--text-muted); font-size: 11px; display: block;">AGREED RENT</span>
            <strong style="color: var(--primary); font-size: 15px;">$${Number(tenancy.rentAmount).toLocaleString()}/mo</strong>
            <div style="font-size: 11px; color: var(--text-muted);">Due on day ${tenancy.dueDay || 1}</div>
          </div>

          <div>
            <span style="color: var(--text-muted); font-size: 11px; display: block;">LEASE TERM</span>
            <strong style="font-size: 13px;">${tenancy.startDate} → ${tenancy.endDate}</strong>
            <div style="font-size: 11px; color: var(--text-muted);">${tenancy.version || 'Standard AST'}</div>
          </div>
        </div>
      ` : `
        <div style="font-size: 12.5px; color: var(--text-muted);">No current active lease contract linked to this profile.</div>
      `}
    </div>

    <!-- Escrow & Security Deposits -->
    ${dl ? `
      <div style="background: #f8fafc; border: 1px solid var(--border-color); border-radius: 8px; padding: 14px; margin-bottom: 20px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <strong style="font-size: 13px;">🛡️ Escrow Deposits Held</strong>
          <strong style="color: var(--primary); font-size: 14px;">$${(Number(dl.secDepositRec || 0) + Number(dl.utilDepositRec || 0) + Number(dl.keyDepositRec || 0)).toLocaleString()} Total Held</strong>
        </div>
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; font-size: 12px; color: var(--text-muted);">
          <div>Security: <strong style="color: var(--text-main);">$${dl.secDepositRec}</strong></div>
          <div>Utility: <strong style="color: var(--text-main);">$${dl.utilDepositRec}</strong></div>
          <div>Key / Remote: <strong style="color: var(--text-main);">$${dl.keyDepositRec}</strong></div>
        </div>
        <div style="font-size: 10.5px; color: var(--text-muted); margin-top: 6px;">Custodian: ${dl.heldBy || 'Property Manager Trust Escrow'}</div>
      </div>
    ` : ''}

    <!-- Recent Charges / Account Status -->
    <div>
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
        <strong style="font-size: 13px;">💳 Recent Rent & Charges</strong>
        ${overdueCharges.length > 0 
          ? `<span class="badge badge-overdue">${overdueCharges.length} Overdue Charge(s)</span>` 
          : `<span class="badge badge-paid">✔️ Account in Good Standing</span>`}
      </div>
      <div style="display: flex; flex-direction: column; gap: 6px;">
        ${tenantCharges.slice(0, 3).map(c => `
          <div style="display: flex; justify-content: space-between; align-items: center; background: white; border: 1px solid var(--border-color); padding: 8px 12px; border-radius: 6px; font-size: 12px;">
            <div>
              <span class="clickable-entity" onclick="showChargeModal('${c.id}')"><code>${c.id}</code></span>
              <span style="font-weight: 600; margin-left: 6px;">${c.period}</span>
              <span style="color: var(--text-muted); margin-left: 6px;">(Due ${c.dueDate})</span>
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <strong style="color: ${c.status === 'Overdue' ? '#dc2626' : 'var(--text-main)'};">$${Number(c.amount).toLocaleString()}</strong>
              <span class="badge ${c.status === 'Paid' ? 'badge-paid' : 'badge-overdue'}" style="font-size: 10px; padding: 2px 6px;">${c.status}</span>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;

  footer.innerHTML = `
    <button class="btn btn-secondary btn-sm" onclick="alert('Calling ${person.name} at ${person.phone}...')">📞 Call Tenant</button>
    ${tenancy ? `<button class="btn btn-primary btn-sm" onclick="closeGlobalModal(); openRecordPaymentModal('${tenancy.id}', '${person.id}')">💵 Record Rent Payment</button>` : ''}
    <button class="btn btn-secondary btn-sm" onclick="closeGlobalModal()">Close</button>
  `;

  document.getElementById('global-modal').classList.add('active');
}

function showUnitModal(identifier) {
  const db = (typeof dbStore !== 'undefined') ? dbStore.getDB() : {};
  const units = db.units || [];
  const buildings = db.buildings || [];
  const tenancies = db.tenancies || [];
  const parties = db.tenancyParties || [];
  const persons = db.persons || [];
  const assets = db.unitAssets || [];
  const keys = db.accessControl || [];
  const maintenance = db.maintenanceRequests || [];
  const ownerships = db.ownerships || [];
  const owners = db.owners || [];

  if (!identifier) return;

  // Lookup unit
  let unit = units.find(u => u.id === identifier);
  if (!unit) {
    const q = String(identifier).toLowerCase().trim();
    unit = units.find(u => u.unitNumber.toLowerCase() === q || u.unitNumber.toLowerCase().includes(q));
  }

  if (!unit) {
    showToast(`Unit "${identifier}" details could not be found.`, 'error');
    return;
  }

  const building = buildings.find(b => b.id === unit.buildingId);
  const tenancy = tenancies.find(t => t.unitId === unit.id && t.status !== 'Closed');
  const primaryParty = tenancy ? parties.find(tp => tp.tenancyId === tenancy.id && tp.role === 'Primary Tenant') : null;
  const tenantPerson = primaryParty ? persons.find(p => p.id === primaryParty.personId) : null;
  const unitAssets = assets.filter(a => a.unitId === unit.id);
  const unitKeys = keys.filter(k => k.unitId === unit.id);
  const openMaint = maintenance.filter(m => m.unitId === unit.id && m.status !== 'Resolved');
  const ownership = ownerships.find(os => os.unitId === unit.id);
  const owner = ownership ? owners.find(o => o.id === ownership.ownerId) : (owners ? owners[0] : null);

  const isOccupied = unit.status === 'Occupied';

  const title = document.getElementById('global-modal-title');
  const body = document.getElementById('global-modal-body');
  const footer = document.getElementById('global-modal-footer');
  if (!title || !body) return;

  title.innerHTML = `🚪 Unit Details — ${unit.unitNumber}`;
  body.innerHTML = `
    <!-- Unit Header -->
    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; padding-bottom: 16px; border-bottom: 1px solid var(--border-color);">
      <div>
        <div style="display: flex; align-items: center; gap: 10px;">
          <h3 style="font-size: 24px; font-weight: 800; margin: 0;">${unit.unitNumber}</h3>
          <span class="badge ${isOccupied ? 'badge-paid' : 'badge-warning'}">${unit.status}</span>
        </div>
        <div style="font-size: 13px; color: var(--text-muted); margin-top: 4px;">
          ${building ? `<span class="clickable-entity" onclick="showBuildingModal('${building.id}')">🏢 ${building.name}</span>` : 'Building'} • ${unit.floor}
        </div>
      </div>
      <div style="text-align: right;">
        <span style="font-size: 11px; font-weight: 800; color: var(--text-muted); text-transform: uppercase;">Target Rent</span>
        <div style="font-size: 22px; font-weight: 800; color: var(--primary);">$${Number(unit.targetRent).toLocaleString()}/mo</div>
      </div>
    </div>

    <!-- Core Specifications -->
    <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 20px; text-align: center;">
      <div style="background: #f8fafc; border: 1px solid var(--border-color); border-radius: 8px; padding: 10px;">
        <div style="font-size: 18px;">🛏️</div>
        <div style="font-size: 13px; font-weight: 800; margin-top: 2px;">${unit.bedrooms} Bedrooms</div>
      </div>
      <div style="background: #f8fafc; border: 1px solid var(--border-color); border-radius: 8px; padding: 10px;">
        <div style="font-size: 18px;">🚿</div>
        <div style="font-size: 13px; font-weight: 800; margin-top: 2px;">${unit.bathrooms} Bathrooms</div>
      </div>
      <div style="background: #f8fafc; border: 1px solid var(--border-color); border-radius: 8px; padding: 10px;">
        <div style="font-size: 18px;">🅿️</div>
        <div style="font-size: 13px; font-weight: 800; margin-top: 2px;">${unit.parkingBays || 'Unassigned'}</div>
      </div>
      <div style="background: #f8fafc; border: 1px solid var(--border-color); border-radius: 8px; padding: 10px;">
        <div style="font-size: 18px;">🔐</div>
        <div style="font-size: 13px; font-weight: 800; margin-top: 2px;">Box #${unit.lockboxCode || 'N/A'}</div>
      </div>
    </div>

    <!-- Current Tenant Status -->
    <div style="background: ${isOccupied ? '#f0fdf4' : '#fffbeb'}; border: 1px solid ${isOccupied ? '#bbf7d0' : '#fef3c7'}; border-radius: 8px; padding: 14px; margin-bottom: 20px;">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <strong style="font-size: 13px; color: ${isOccupied ? '#166534' : '#92400e'};">
          ${isOccupied ? '👤 Current Active Resident' : '⚠️ Vacancy Status'}
        </strong>
        ${tenancy ? `<span style="font-size: 11.5px; color: #166534;">Contract: ${tenancy.startDate} → ${tenancy.endDate}</span>` : ''}
      </div>

      ${tenantPerson ? `
        <div style="margin-top: 8px; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <span class="clickable-entity" onclick="showTenantModal('${tenantPerson.id}')" style="font-size: 16px; font-weight: 800;">
              👤 ${tenantPerson.name}
            </span>
            <div style="font-size: 12px; color: var(--text-muted); margin-top: 2px;">
              📞 ${tenantPerson.phone} • ✉️ ${tenantPerson.email}
            </div>
          </div>
          <button class="btn btn-secondary btn-sm" onclick="showTenantModal('${tenantPerson.id}')">View Dossier ↗</button>
        </div>
      ` : `
        <div style="margin-top: 6px; font-size: 12.5px; color: #92400e;">
          This unit is currently unoccupied and ready for tenant showings and listing syndication.
        </div>
      `}
    </div>

    <!-- Utility Meters & Property Ownership -->
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 20px; font-size: 12.5px;">
      <div style="background: #f8fafc; border: 1px solid var(--border-color); border-radius: 8px; padding: 12px;">
        <strong style="color: var(--text-muted); font-size: 11px; text-transform: uppercase;">Utility Meters</strong>
        <div style="margin-top: 6px;">⚡ Electricity: <code style="font-weight: 700;">${unit.electricityAcc || 'TNB-Standard'}</code></div>
        <div style="margin-top: 4px;">💧 Water Account: <code style="font-weight: 700;">${unit.waterAcc || 'SYABAS-Standard'}</code></div>
      </div>

      <div style="background: #f8fafc; border: 1px solid var(--border-color); border-radius: 8px; padding: 12px;">
        <strong style="color: var(--text-muted); font-size: 11px; text-transform: uppercase;">Ownership Truth</strong>
        <div style="margin-top: 6px; font-weight: 700;">${owner ? owner.legalName : 'Vance Property Holdings'}</div>
        <div style="color: var(--text-muted); font-size: 11.5px; margin-top: 2px;">Share: 100% Primary Legal Owner</div>
      </div>
    </div>

    <!-- Inventory & Assets Registered -->
    <div style="margin-bottom: 20px;">
      <strong style="font-size: 13px; display: block; margin-bottom: 8px;">📦 Inventory Assets (${unitAssets.length})</strong>
      ${unitAssets.length > 0 ? `
        <div style="display: flex; flex-direction: column; gap: 6px;">
          ${unitAssets.map(a => `
            <div style="display: flex; justify-content: space-between; align-items: center; background: white; border: 1px solid var(--border-color); padding: 8px 12px; border-radius: 6px; font-size: 12px;">
              <div>
                <strong>${a.category}</strong> — ${a.brand}
                <span style="font-size: 11px; color: var(--text-muted); margin-left: 6px;">(SN: ${a.serialNo})</span>
              </div>
              <span class="badge badge-paid" style="font-size: 10px;">${a.condition}</span>
            </div>
          `).join('')}
        </div>
      ` : `
        <div style="font-size: 12px; color: var(--text-muted);">No inventoried fixtures registered.</div>
      `}
    </div>

    <!-- Keys & RFID Cards -->
    <div style="margin-bottom: 12px;">
      <strong style="font-size: 13px; display: block; margin-bottom: 8px;">🔑 Keys & Access Tokens (${unitKeys.length})</strong>
      ${unitKeys.length > 0 ? `
        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
          ${unitKeys.map(k => `
            <span style="background: #f1f5f9; border: 1px solid var(--border-color); border-radius: 6px; padding: 4px 8px; font-size: 11.5px;">
              🏷️ ${k.type}: <code>${k.serialNo}</code>
            </span>
          `).join('')}
        </div>
      ` : `
        <div style="font-size: 12px; color: var(--text-muted);">Standard mechanical lock set on file.</div>
      `}
    </div>

    <!-- Active Maintenance Tickets -->
    ${openMaint.length > 0 ? `
      <div style="background: #fff5f5; border: 1px solid #fed7d7; border-radius: 8px; padding: 12px; margin-top: 14px;">
        <strong style="font-size: 12.5px; color: #c53030;">⚠️ Open Maintenance Case (${openMaint.length})</strong>
        ${openMaint.map(m => `
          <div style="margin-top: 6px; font-size: 12px;">
            <span class="clickable-entity" onclick="showMaintenanceModal('${m.id}')" style="color: #c53030; font-weight: 700;">🔧 ${m.issue}</span>
            <span style="color: var(--text-muted); margin-left: 4px;">(${m.urgency})</span>
          </div>
        `).join('')}
      </div>
    ` : ''}
  `;

  footer.innerHTML = `
    <button class="btn btn-secondary btn-sm" onclick="closeGlobalModal(); openLogMaintenanceModal('${unit.id}')">🔧 Log Maintenance</button>
    <button class="btn btn-primary btn-sm" onclick="closeGlobalModal(); if (window.location.pathname.includes('properties.html')) { openUnitEditModal('${unit.id}'); } else { window.location.href='properties.html'; }">Manage Unit ↗</button>
    <button class="btn btn-secondary btn-sm" onclick="closeGlobalModal()">Close</button>
  `;

  document.getElementById('global-modal').classList.add('active');
}

function showBuildingModal(identifier) {
  const db = (typeof dbStore !== 'undefined') ? dbStore.getDB() : {};
  const buildings = db.buildings || [];
  const units = db.units || [];

  if (!identifier) return;

  let building = buildings.find(b => b.id === identifier);
  if (!building) {
    const q = String(identifier).toLowerCase().trim();
    building = buildings.find(b => b.name.toLowerCase().includes(q));
  }

  if (!building) {
    showToast(`Property "${identifier}" could not be found.`, 'error');
    return;
  }

  const bUnits = units.filter(u => u.buildingId === building.id);
  const occupiedCount = bUnits.filter(u => u.status === 'Occupied').length;
  const occupancyRate = bUnits.length > 0 ? Math.round((occupiedCount / bUnits.length) * 100) : 0;
  const totalRent = bUnits.reduce((sum, u) => sum + (Number(u.targetRent) || 0), 0);

  const title = document.getElementById('global-modal-title');
  const body = document.getElementById('global-modal-body');
  const footer = document.getElementById('global-modal-footer');
  if (!title || !body) return;

  title.innerHTML = `🏢 Property Complex — ${building.name}`;
  body.innerHTML = `
    <div style="margin-bottom: 20px; padding-bottom: 16px; border-bottom: 1px solid var(--border-color);">
      <h3 style="font-size: 22px; font-weight: 800; margin: 0;">${building.name}</h3>
      <div style="font-size: 13px; color: var(--text-muted); margin-top: 4px;">
        📍 ${building.address}, ${building.city} ${building.postcode}
      </div>
      <div style="font-size: 12px; color: var(--primary); font-weight: 700; margin-top: 4px;">
        🏛️ Management Office: ${building.managementOffice || 'Onsite Level 1'}
      </div>
    </div>

    <!-- Portfolio Metrics for this Building -->
    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 20px;">
      <div style="background: #f8fafc; border: 1px solid var(--border-color); border-radius: 8px; padding: 14px; text-align: center;">
        <span style="font-size: 11px; font-weight: 800; color: var(--text-muted); text-transform: uppercase;">Total Units</span>
        <div style="font-size: 26px; font-weight: 800; margin-top: 4px;">${bUnits.length}</div>
      </div>
      <div style="background: #f8fafc; border: 1px solid var(--border-color); border-radius: 8px; padding: 14px; text-align: center;">
        <span style="font-size: 11px; font-weight: 800; color: var(--text-muted); text-transform: uppercase;">Occupancy</span>
        <div style="font-size: 26px; font-weight: 800; color: var(--primary); margin-top: 4px;">${occupancyRate}%</div>
        <span style="font-size: 11px; color: var(--text-muted);">${occupiedCount} / ${bUnits.length} occupied</span>
      </div>
      <div style="background: #f8fafc; border: 1px solid var(--border-color); border-radius: 8px; padding: 14px; text-align: center;">
        <span style="font-size: 11px; font-weight: 800; color: var(--text-muted); text-transform: uppercase;">Monthly Rent Roll</span>
        <div style="font-size: 22px; font-weight: 800; color: #047857; margin-top: 4px;">$${totalRent.toLocaleString()}</div>
      </div>
    </div>

    <!-- Facilities & Amenities -->
    <div style="margin-bottom: 20px;">
      <strong style="font-size: 13px; display: block; margin-bottom: 8px;">🏊 Facilities & Amenities</strong>
      <div style="display: flex; gap: 8px; flex-wrap: wrap;">
        ${(building.facilities || ['Security', 'Parking']).map(f => `
          <span style="background: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe; border-radius: 20px; padding: 4px 12px; font-size: 12px; font-weight: 600;">
            ✨ ${f}
          </span>
        `).join('')}
      </div>
    </div>

    <!-- Units in Building Directory -->
    <div>
      <strong style="font-size: 13px; display: block; margin-bottom: 8px;">🚪 Units in this Complex (Click to inspect)</strong>
      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; max-height: 200px; overflow-y: auto;">
        ${bUnits.map(u => `
          <div class="clickable-entity" onclick="showUnitModal('${u.id}')" style="display: flex; justify-content: space-between; align-items: center; background: white; border: 1px solid var(--border-color); padding: 8px 12px; border-radius: 6px; text-decoration: none;">
            <div>
              <strong style="color: var(--text-main);">🚪 ${u.unitNumber}</strong>
              <div style="font-size: 11px; color: var(--text-muted);">${u.bedrooms} Bed • $${u.targetRent}/mo</div>
            </div>
            <span class="badge ${u.status === 'Occupied' ? 'badge-paid' : 'badge-warning'}" style="font-size: 10px; padding: 2px 6px;">${u.status}</span>
          </div>
        `).join('')}
      </div>
    </div>
  `;

  footer.innerHTML = `
    <button class="btn btn-primary btn-sm" onclick="closeGlobalModal(); if (typeof handlePropertyFilter === 'function') handlePropertyFilter('${building.id}');">Filter to this Property</button>
    <button class="btn btn-secondary btn-sm" onclick="closeGlobalModal()">Close</button>
  `;

  document.getElementById('global-modal').classList.add('active');
}

function showChargeModal(chargeId) {
  const db = (typeof dbStore !== 'undefined') ? dbStore.getDB() : {};
  const charges = db.charges || [];
  const tenancies = db.tenancies || [];
  const units = db.units || [];
  const parties = db.tenancyParties || [];
  const persons = db.persons || [];
  const allocations = db.allocations || [];
  const payments = db.payments || [];

  const c = charges.find(x => x.id === chargeId);
  if (!c) {
    showToast(`Charge "${chargeId}" not found.`, 'error');
    return;
  }

  const tenancy = tenancies.find(t => t.id === c.tenancyId);
  const unit = tenancy ? units.find(u => u.id === tenancy.unitId) : null;
  const party = tenancy ? parties.find(tp => tp.tenancyId === tenancy.id && tp.role === 'Primary Tenant') : null;
  const person = party ? persons.find(p => p.id === party.personId) : null;

  const alloc = allocations.find(a => a.chargeId === c.id);
  const payment = alloc ? payments.find(p => p.id === alloc.paymentId) : null;

  const isPaid = c.status === 'Paid';
  const isOverdue = c.status === 'Overdue';

  const title = document.getElementById('global-modal-title');
  const body = document.getElementById('global-modal-body');
  const footer = document.getElementById('global-modal-footer');
  if (!title || !body) return;

  title.innerHTML = `🧾 Charge & Invoicing Record — ${c.id}`;
  body.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding-bottom: 16px; border-bottom: 1px solid var(--border-color);">
      <div>
        <div style="display: flex; align-items: center; gap: 8px;">
          <h3 style="font-size: 22px; font-weight: 800; margin: 0;">${c.period} Rent</h3>
          <span class="badge ${isPaid ? 'badge-paid' : (isOverdue ? 'badge-overdue' : 'badge-warning')}">${c.status}</span>
        </div>
        <div style="font-size: 12px; color: var(--text-muted); margin-top: 4px;">Charge Reference: <code>${c.id}</code></div>
      </div>
      <div style="text-align: right;">
        <span style="font-size: 11px; font-weight: 800; color: var(--text-muted); text-transform: uppercase;">Total Billed</span>
        <div style="font-size: 24px; font-weight: 800; color: ${isOverdue ? '#dc2626' : 'var(--primary)'};">$${Number(c.amount).toLocaleString()}</div>
      </div>
    </div>

    <!-- Related Unit and Tenant -->
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 20px;">
      <div style="background: #f8fafc; border: 1px solid var(--border-color); border-radius: 8px; padding: 12px;">
        <span style="font-size: 11px; font-weight: 800; color: var(--text-muted); text-transform: uppercase;">Billed Unit</span>
        <div style="margin-top: 4px;">
          ${unit ? `<span class="clickable-entity" onclick="showUnitModal('${unit.id}')" style="font-size: 15px; font-weight: 800;">🚪 ${unit.unitNumber}</span>` : 'Unit'}
        </div>
      </div>

      <div style="background: #f8fafc; border: 1px solid var(--border-color); border-radius: 8px; padding: 12px;">
        <span style="font-size: 11px; font-weight: 800; color: var(--text-muted); text-transform: uppercase;">Resident Payer</span>
        <div style="margin-top: 4px;">
          ${person ? `<span class="clickable-entity" onclick="showTenantModal('${person.id}')" style="font-size: 15px; font-weight: 800;">👤 ${person.name}</span>` : 'Unknown'}
        </div>
      </div>
    </div>

    <!-- Payment Settlement Truth -->
    <div style="background: ${isPaid ? '#f0fdf4' : '#fef2f2'}; border: 1px solid ${isPaid ? '#bbf7d0' : '#fecaca'}; border-radius: 8px; padding: 16px; margin-bottom: 16px;">
      <div style="font-size: 12px; font-weight: 800; color: ${isPaid ? '#166534' : '#dc2626'}; text-transform: uppercase; margin-bottom: 6px;">
        ${isPaid ? '✔️ Payment Succeeded & Allocated' : '⚠️ Pending Settlement'}
      </div>

      ${payment ? `
        <div style="font-size: 13px; line-height: 1.6; color: #166534;">
          <div><strong>Payment Date:</strong> ${payment.paymentDate}</div>
          <div><strong>Method:</strong> ${payment.method}</div>
          <div><strong>Transaction Reference:</strong> <code>${payment.reference}</code></div>
          <div><strong>Amount Allocated:</strong> $${alloc ? alloc.amountAllocated : c.amount}</div>
        </div>
      ` : `
        <div style="font-size: 13px; color: #dc2626;">
          This charge became due on <strong>${c.dueDate}</strong> and has not yet been paid.
        </div>
      `}
    </div>
  `;

  footer.innerHTML = `
    ${!isPaid ? `<button class="btn btn-primary btn-sm" onclick="closeGlobalModal(); openRecordPaymentModal('${c.tenancyId}', '${person ? person.id : ''}', '${c.id}', ${c.amount})">💵 Settle Payment Now</button>` : ''}
    <button class="btn btn-secondary btn-sm" onclick="closeGlobalModal()">Close</button>
  `;

  document.getElementById('global-modal').classList.add('active');
}

function showMaintenanceModal(requestId) {
  const db = (typeof dbStore !== 'undefined') ? dbStore.getDB() : {};
  const requests = db.maintenanceRequests || [];
  const units = db.units || [];
  const buildings = db.buildings || [];
  const persons = db.persons || [];
  const workOrders = db.workOrders || [];
  const vendors = db.vendors || [];

  const r = requests.find(x => x.id === requestId);
  if (!r) {
    showToast(`Maintenance request "${requestId}" not found.`, 'error');
    return;
  }

  const unit = units.find(u => u.id === r.unitId);
  const building = unit ? buildings.find(b => b.id === unit.buildingId) : null;
  const person = r.tenantPersonId ? persons.find(p => p.id === r.tenantPersonId) : null;
  const wo = workOrders.find(w => w.requestId === r.id);
  const vendor = wo ? vendors.find(v => v.id === wo.vendorId) : null;

  const isUrgent = r.urgency === 'URGENT';

  const title = document.getElementById('global-modal-title');
  const body = document.getElementById('global-modal-body');
  const footer = document.getElementById('global-modal-footer');
  if (!title || !body) return;

  title.innerHTML = `🔧 Maintenance Case — ${r.id}`;
  body.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; padding-bottom: 16px; border-bottom: 1px solid var(--border-color);">
      <div>
        <div style="display: flex; align-items: center; gap: 8px;">
          <h3 style="font-size: 20px; font-weight: 800; margin: 0;">${r.issue}</h3>
          <span class="badge ${isUrgent ? 'badge-overdue' : 'badge-warning'}">${r.urgency}</span>
        </div>
        <div style="font-size: 12.5px; color: var(--text-muted); margin-top: 4px;">
          Category: <strong>${r.category}</strong> • Reported on: ${r.dateReported}
        </div>
      </div>
      <span class="badge ${r.status === 'Resolved' ? 'badge-paid' : 'badge-warning'}" style="font-size: 13px;">${r.status}</span>
    </div>

    <!-- Unit & Location -->
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 20px;">
      <div style="background: #f8fafc; border: 1px solid var(--border-color); border-radius: 8px; padding: 12px;">
        <span style="font-size: 11px; font-weight: 800; color: var(--text-muted); text-transform: uppercase;">Affected Unit</span>
        <div style="margin-top: 4px;">
          ${unit ? `<span class="clickable-entity" onclick="showUnitModal('${unit.id}')" style="font-size: 15px; font-weight: 800;">🚪 ${unit.unitNumber}</span>` : 'Unit'}
          ${building ? `<div style="font-size: 11px; color: var(--text-muted);"><span class="clickable-entity" onclick="showBuildingModal('${building.id}')">🏢 ${building.name}</span></div>` : ''}
        </div>
      </div>

      <div style="background: #f8fafc; border: 1px solid var(--border-color); border-radius: 8px; padding: 12px;">
        <span style="font-size: 11px; font-weight: 800; color: var(--text-muted); text-transform: uppercase;">Reported By</span>
        <div style="margin-top: 4px;">
          ${person ? `<span class="clickable-entity" onclick="showTenantModal('${person.id}')" style="font-size: 15px; font-weight: 800;">👤 ${person.name}</span>` : '<span style="font-weight:700;">Property Management / Turnover</span>'}
        </div>
      </div>
    </div>

    <!-- Description -->
    <div style="background: white; border: 1px solid var(--border-color); border-radius: 8px; padding: 14px; margin-bottom: 20px;">
      <strong style="font-size: 12px; color: var(--text-muted); text-transform: uppercase;">Issue Description & Symptoms:</strong>
      <div style="font-size: 13px; color: var(--text-main); margin-top: 6px; line-height: 1.5;">
        ${r.description || 'No additional notes provided.'}
      </div>
    </div>

    <!-- Work Order & Assigned Contractor -->
    ${vendor ? `
      <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 14px; margin-bottom: 16px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
          <strong style="font-size: 13px; color: #166534;">🛠️ Assigned Contractor: ${vendor.companyName}</strong>
          <span style="font-size: 12px; color: #166534; font-weight: 700;">⭐ ${vendor.rating} Stars</span>
        </div>
        <div style="font-size: 12px; color: #166534; line-height: 1.5;">
          <div>📞 <strong>Contact:</strong> ${vendor.contactPerson} (${vendor.phone})</div>
          <div>📅 <strong>Scheduled:</strong> ${wo.scheduledDate || 'Pending dispatch'}</div>
          <div>💰 <strong>Quote Amount:</strong> $${wo.quoteAmount || 0}</div>
        </div>
      </div>
    ` : `
      <div style="background: #fffbeb; border: 1px solid #fef3c7; border-radius: 8px; padding: 12px; margin-bottom: 16px; font-size: 12px; color: #92400e;">
        ⚠️ No external vendor currently assigned to this ticket.
      </div>
    `}
  `;

  footer.innerHTML = `
    <button class="btn btn-secondary btn-sm" onclick="closeGlobalModal(); window.location.href='maintenance.html'">Open Maintenance Board ↗</button>
    <button class="btn btn-secondary btn-sm" onclick="closeGlobalModal()">Close</button>
  `;

  document.getElementById('global-modal').classList.add('active');
}


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
            <strong>
              <span class="clickable-entity" onclick="closeGlobalModal(); showUnitModal('${u ? u.id : ''}')">🚪 ${u ? u.unitNumber : 'Unit'}</span> — 
              <span class="clickable-entity" onclick="closeGlobalModal(); showChargeModal('${c.id}')">${c.period}</span>
            </strong>
            <div style="font-size: 11.5px; color: #dc2626; margin-top: 2px;">Due Date: ${c.dueDate} • $${c.amount}</div>
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
            <strong>
              <span class="clickable-entity" onclick="closeGlobalModal(); showUnitModal('${u ? u.id : ''}')">🚪 ${u ? u.unitNumber : 'Unit'}</span>: 
              <span class="clickable-entity" onclick="closeGlobalModal(); showMaintenanceModal('${r.id}')">${r.issue}</span>
            </strong>
            <div style="font-size: 11.5px; color: #b45309; margin-top: 2px;">Reported: ${r.dateReported} • Category: ${r.category}</div>
          </div>
          <button class="btn btn-secondary btn-sm" onclick="closeGlobalModal(); showMaintenanceModal('${r.id}')">Inspect ↗</button>
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
