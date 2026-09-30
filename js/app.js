/* NestPad Layer 3 — UI Controller & Comprehensive View Renderer */

let currentTab = 'dashboard';
let currentRole = 'Property Manager';

document.addEventListener('DOMContentLoaded', () => {
  renderNavigation();
  renderCurrentView();
});

function switchTab(tab) {
  currentTab = tab;
  renderNavigation();
  renderCurrentView();
}

function switchRole(role) {
  currentRole = role;
  showToast(`Switched view mode to: ${role}`);
  renderCurrentView();
}

function renderNavigation() {
  const navContainer = document.getElementById('nav-list-container');
  if (!navContainer) return;

  const tabs = [
    { id: 'dashboard', icon: '📊', label: 'Dashboard' },
    { id: 'properties', icon: '🏢', label: 'Properties & Units' },
    { id: 'ledger', icon: '📖', label: 'Rent & Charges Ledger' },
    { id: 'maintenance', icon: '🔧', label: 'Maintenance & Vendors' },
    { id: 'tenants', icon: '📑', label: 'Tenancies & Tenants' },
    { id: 'calendar', icon: '📅', label: 'Calendar & Schedule' },
    { id: 'vault', icon: '📂', label: 'Documents & Vault' },
    { id: 'audit', icon: '🛡️', label: 'Audit Trail & System' }
  ];

  navContainer.innerHTML = tabs.map(t => `
    <li class="nav-item ${currentTab === t.id ? 'active' : ''}" onclick="switchTab('${t.id}')">
      <span>${t.icon}</span> ${t.label}
    </li>
  `).join('');
}

function renderCurrentView() {
  const container = document.getElementById('view-container');
  if (!container) return;

  if (currentTab === 'dashboard') renderDashboardView(container);
  else if (currentTab === 'properties') renderPropertiesView(container);
  else if (currentTab === 'ledger') renderLedgerView(container);
  else if (currentTab === 'maintenance') renderMaintenanceView(container);
  else if (currentTab === 'tenants') renderTenantsView(container);
  else if (currentTab === 'calendar') renderCalendarView(container);
  else if (currentTab === 'vault') renderVaultView(container);
  else if (currentTab === 'audit') renderAuditView(container);
}

// ----------------------------------------------------
// 1. DASHBOARD VIEW
// ----------------------------------------------------
function renderDashboardView(container) {
  const m = logic.getMetrics();
  const db = dbStore.getDB();
  const tasks = db.tasks.slice(0, 4);

  container.innerHTML = `
    <div style="margin-bottom: 24px;">
      <div style="font-size: 11px; font-weight: 800; color: var(--primary); text-transform: uppercase; letter-spacing: 1px;">
        ● Portfolio Pulse (${currentRole} Mode)
      </div>
      <h2 style="font-size: 28px; font-weight: 800; margin-top: 4px;">Good morning, Sarah 👋</h2>
      <p style="color: var(--text-muted);">Here is your dynamic portfolio status calculated directly from database truth.</p>
    </div>

    <!-- 4 Calculated Metric Cards -->
    <div class="stats-grid">
      <div class="stat-card">
        <span style="font-size: 11px; font-weight: 800; color: var(--text-muted); text-transform: uppercase;">Occupancy Rate</span>
        <div style="font-size: 32px; font-weight: 800; margin: 8px 0;">${m.occupancyRate}%</div>
        <span class="badge badge-paid">● ${m.occupiedUnits} Occupied • ${m.totalUnits - m.occupiedUnits} Vacant</span>
      </div>

      <div class="stat-card">
        <span style="font-size: 11px; font-weight: 800; color: var(--text-muted); text-transform: uppercase;">Overdue Rent</span>
        <div style="font-size: 32px; font-weight: 800; color: #dc2626; margin: 8px 0;">$${m.overdueAmount.toLocaleString()}</div>
        <span class="badge badge-overdue">${m.overdueCount} Overdue Charges</span>
      </div>

      <div class="stat-card">
        <span style="font-size: 11px; font-weight: 800; color: var(--text-muted); text-transform: uppercase;">Active Maintenance</span>
        <div style="font-size: 32px; font-weight: 800; margin: 8px 0;">${m.openMaint} <span style="font-size: 16px; color: var(--text-muted);">Open</span></div>
        <span class="badge badge-warning">${m.urgentMaint} Urgent Attention</span>
      </div>

      <div class="stat-card">
        <span style="font-size: 11px; font-weight: 800; color: var(--text-muted); text-transform: uppercase;">Leases Expiring in 60d</span>
        <div style="font-size: 32px; font-weight: 800; margin: 8px 0;">${m.upcomingExpirations.length}</div>
        <span class="badge badge-warning">Next: ${m.upcomingExpirations[0]?.daysLeft || 0} days</span>
      </div>
    </div>

    <!-- Two-Column Layout -->
    <div style="display: grid; grid-template-columns: 1fr 340px; gap: 28px;">
      <div>
        <h3 style="font-size: 16px; font-weight: 800; margin-bottom: 16px;">⚠️ Needs Action Today</h3>

        <!-- Action Card 1: Overdue Rent -->
        <div style="background: white; border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 20px; margin-bottom: 16px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
              <strong style="font-size: 16px;">
                <span class="clickable-entity" onclick="showUnitModal('u-3b')">🚪 Unit 3B</span> • 
                <span class="clickable-entity" onclick="showTenantModal('p-103')">👤 Alex Rivera</span>
              </strong>
              <span class="badge badge-overdue" style="margin-left: 8px;">13 Days Overdue</span>
            </div>
            <strong style="color: #dc2626; font-size: 16px; cursor: pointer;" onclick="showChargeModal('chg-102')">$1,750</strong>
          </div>
          <p style="font-size: 13px; color: var(--text-muted); margin: 8px 0 14px 0;">October Rent charge past due date (Oct 1). Auto-reminder logged.</p>
          <div style="display: flex; gap: 8px;">
            <button class="btn btn-secondary btn-sm" onclick="showTenantModal('p-103')">👤 Dossier</button>
            <button class="btn btn-secondary btn-sm" onclick="alert('Calling Alex Rivera at (555) 392-1084...')">📞 Call Alex</button>
            <button class="btn btn-secondary btn-sm" onclick="sendCommunication('t-1002', 'SMS Ping', 'Overdue Rent Notice')">💬 Send Text Ping</button>
            <button class="btn btn-primary btn-sm" onclick="openRecordPaymentModal('t-1002', 'p-103', 'chg-102', 1750)">Mark as Paid</button>
          </div>
        </div>

        <!-- Action Card 2: Urgent Leak -->
        <div style="background: white; border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 20px; margin-bottom: 24px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
              <strong style="font-size: 16px;">
                <span class="clickable-entity" onclick="showUnitModal('u-1a')">🚪 Unit 1A</span> • 
                <span class="clickable-entity" onclick="showBuildingModal('b-1')">🏢 Maple Crest</span>
              </strong>
              <span class="badge badge-overdue" style="margin-left: 8px;">URGENT</span>
            </div>
          </div>
          <p style="font-size: 13px; color: var(--text-muted); margin: 8px 0 14px 0;"><span class="clickable-entity" onclick="showMaintenanceModal('m-1')">🔧 Kitchen sink P-trap leak</span> under basin. Plumber Dave scheduled for tomorrow 9:00 AM.</p>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 12px; color: var(--text-muted); font-weight: 600;">🛠️ Vendor: Apex Plumbing Co.</span>
            <button class="btn btn-secondary btn-sm" onclick="showMaintenanceModal('m-1')">Inspect Work Order ↗</button>
          </div>
        </div>

        <!-- Upcoming Expirations -->
        <h3 style="font-size: 16px; font-weight: 800; margin-bottom: 16px;">⌛ Upcoming Lease Expirations (Next 60 Days)</h3>
        ${m.upcomingExpirations.map(exp => `
          <div style="background: white; border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 16px 20px; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center;">
            <div style="display: flex; gap: 16px; align-items: center;">
              <div style="width: 48px; height: 48px; border-radius: 8px; background: #ecfdf5; color: #047857; display: flex; flex-direction: column; align-items: center; justify-content: center; font-weight: 800;">
                <span style="font-size: 18px; line-height: 1;">${exp.daysLeft}</span>
                <span style="font-size: 9px;">DAYS</span>
              </div>
              <div>
                <strong>
                  <span class="clickable-entity" onclick="showUnitModal('${exp.unitNumber}')">🚪 ${exp.unitNumber}</span> — 
                  <span class="clickable-entity" onclick="showTenantModal('${exp.tenantName}')">👤 ${exp.tenantName}</span>
                </strong>
                <div style="font-size: 12px; color: var(--text-muted);">Ends: ${exp.endDate} • Rent: $${exp.rentAmount}/mo • Status: ${exp.status}</div>
              </div>
            </div>
            <div style="display: flex; gap: 6px;">
              <button class="btn btn-secondary btn-sm" onclick="showTenantModal('${exp.tenantName}')">Dossier</button>
              <button class="btn btn-secondary btn-sm" onclick="openRenewalModal('${exp.id}')">Renewal / Move-Out</button>
            </div>
          </div>
        `).join('')}
      </div>

      <!-- Right Notebook Panel -->
      <div style="background: white; border: 1px solid var(--border-color); border-radius: var(--radius-xl); padding: 24px; display: flex; flex-direction: column; gap: 20px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <h4 style="font-size: 15px; font-weight: 800;">📋 Manager's Notebook</h4>
          <span class="badge badge-warning">Active Tasks</span>
        </div>

        <div>
          ${tasks.map(t => `
            <div style="display: flex; align-items: flex-start; gap: 10px; padding: 10px 0; border-bottom: 1px solid var(--border-subtle);">
              <input type="checkbox" ${t.status === 'Completed' ? 'checked' : ''} onchange="toggleTask('${t.id}')">
              <div>
                <div style="font-size: 13px; font-weight: 600; ${t.status === 'Completed' ? 'text-decoration: line-through; color: var(--text-muted);' : ''}">${t.title}</div>
                <div style="font-size: 11px; color: var(--text-muted);">Due: ${t.dueDate}</div>
              </div>
            </div>
          `).join('')}
        </div>

        <div style="background: #f1f5f9; padding: 12px; border-radius: 8px; font-size: 12px;">
          <strong style="color: var(--primary);">🛡️ Recent System Audit Log:</strong>
          <div style="font-size: 11px; color: var(--text-muted); margin-top: 4px;">
            ${(db.auditTrail[0] ? `${db.auditTrail[0].action} on ${db.auditTrail[0].entity} at ${db.auditTrail[0].timestamp}` : 'System initialized.')}
          </div>
        </div>
      </div>
    </div>
  `;
}

// ----------------------------------------------------
// 2. PROPERTIES & UNITS VIEW (Separated as per PDF)
// ----------------------------------------------------
function renderPropertiesView(container) {
  const db = dbStore.getDB();

  container.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
      <div>
        <div style="font-size: 11px; font-weight: 800; color: var(--primary); text-transform: uppercase;">BUILDING & UNIT MANAGEMENT</div>
        <h2 style="font-size: 26px; font-weight: 800;">Properties, Units & Asset Inventory</h2>
        <p style="font-size: 13px; color: var(--text-muted);">Normalized property structure: Buildings contain Units, with separate Owner entities, Asset tracking, and Access keys.</p>
      </div>
      <button class="btn btn-primary" onclick="openAddUnitModal()">+ Add New Unit</button>
    </div>

    <!-- Buildings List -->
    <h3 style="font-size: 16px; font-weight: 800; margin-bottom: 14px;">🏢 Master Buildings</h3>
    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 32px;">
      ${db.buildings.map(b => `
        <div style="background: white; border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 18px;">
          <h4 style="font-size: 16px; font-weight: 800;">${b.name}</h4>
          <p style="font-size: 12px; color: var(--text-muted); margin: 4px 0 10px 0;">📍 ${b.address}, ${b.city} (${b.postcode})</p>
          <div style="font-size: 11.5px; color: var(--primary); font-weight: 700;">🏢 ${b.managementOffice}</div>
          <div style="font-size: 11px; color: var(--text-muted); margin-top: 6px;">Facilities: ${b.facilities.join(', ')}</div>
        </div>
      `).join('')}
    </div>

    <!-- Units Grid -->
    <h3 style="font-size: 16px; font-weight: 800; margin-bottom: 14px;">🚪 Units & Inventory Truth</h3>
    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px;">
      ${db.units.map(u => {
        const building = db.buildings.find(b => b.id === u.buildingId) || {};
        const ownership = db.ownerships.find(os => os.unitId === u.id);
        const owner = ownership ? db.owners.find(o => o.id === ownership.ownerId) : null;
        const assets = db.unitAssets.filter(a => a.unitId === u.id);
        const keys = db.accessControl.filter(k => k.unitId === u.id);

        return `
          <div style="background: white; border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 20px; display: flex; flex-direction: column; gap: 12px;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
              <div>
                <strong style="font-size: 18px;">
                  <span class="clickable-entity" onclick="showUnitModal('${u.id}')">🚪 ${u.unitNumber}</span>
                </strong>
                <div style="font-size: 12px; color: var(--text-muted);">
                  <span class="clickable-entity" onclick="showBuildingModal('${building.id}')">${building.name}</span> • ${u.floor}
                </div>
              </div>
              <span class="badge ${u.status === 'Occupied' ? 'badge-paid' : 'badge-warning'}">${u.status}</span>
            </div>

            <div style="background: #f8fafc; padding: 10px; border-radius: 8px; font-size: 11.5px;">
              <div><strong>Owner:</strong> ${owner ? owner.legalName : 'Robert Vance Holdings'} (100%)</div>
              <div><strong>Rent Target:</strong> $${u.targetRent}/mo • Lockbox: ${u.lockboxCode}</div>
              <div><strong>Meters:</strong> ${u.electricityAcc} | ${u.waterAcc}</div>
            </div>

            <div style="font-size: 12px; color: var(--text-muted);">
              🛏️ ${u.bedrooms} Bed • 🚿 ${u.bathrooms} Bath • 🅿️ ${u.parkingBays}
            </div>

            <div style="border-top: 1px solid var(--border-subtle); padding-top: 10px;">
              <span style="font-size: 11px; font-weight: 800; color: var(--text-muted);">ASSETS & INVENTORY (${assets.length})</span>
              <div style="font-size: 11.5px; color: var(--text-main); margin-top: 4px;">
                ${assets.length > 0 ? assets.map(a => `• ${a.category} (${a.brand}) - ${a.condition}`).join('<br>') : 'No registered assets.'}
              </div>
            </div>

            <div style="display: flex; gap: 6px; margin-top: auto; padding-top: 12px; border-top: 1px solid var(--border-subtle);">
              <button class="btn btn-secondary btn-sm" onclick="showUnitQR('${u.unitNumber}')">📱 QR Code</button>
              <button class="btn btn-secondary btn-sm" onclick="openAssetModal('${u.id}')">+ Add Asset</button>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

// ----------------------------------------------------
// 3. RENT & CHARGES LEDGER VIEW (Charge -> Payment -> Allocation)
// ----------------------------------------------------
function renderLedgerView(container) {
  const db = dbStore.getDB();

  container.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
      <div>
        <div style="font-size: 11px; font-weight: 800; color: var(--primary); text-transform: uppercase;">FINANCIAL LEDGER & DEPOSIT TRUTH</div>
        <h2 style="font-size: 26px; font-weight: 800;">Charge, Payment & Allocation Ledger</h2>
        <p style="font-size: 13px; color: var(--text-muted);">Normalized model: Charges are billed, Payments land, and Allocations resolve outstanding balances.</p>
      </div>
      <div style="display: flex; gap: 8px;">
        <button class="btn btn-secondary btn-sm" onclick="window.print()">🖨️ Print Statement</button>
        <button class="btn btn-primary btn-sm" onclick="exportLedgerCSV()">📥 Export CSV</button>
      </div>
    </div>

    <!-- Charges Table -->
    <h3 style="font-size: 16px; font-weight: 800; margin-bottom: 12px;">📑 Rent & Utility Charges</h3>
    <table class="data-table" style="margin-bottom: 32px;">
      <thead>
        <tr>
          <th>CHARGE ID</th>
          <th>TENANCY & UNIT</th>
          <th>TYPE</th>
          <th>PERIOD</th>
          <th>AMOUNT</th>
          <th>DUE DATE</th>
          <th>STATUS</th>
          <th>ACTION</th>
        </tr>
      </thead>
      <tbody>
        ${db.charges.map(c => {
          const t = db.tenancies.find(x => x.id === c.tenancyId);
          const u = t ? db.units.find(x => x.id === t.unitId) : null;
          const isOverdue = c.status === 'Overdue';

          return `
            <tr>
              <td><span class="clickable-entity" onclick="showChargeModal('${c.id}')"><code>${c.id}</code></span></td>
              <td><strong><span class="clickable-entity" onclick="showUnitModal('${u ? u.id : ''}')">🚪 ${u ? u.unitNumber : 'Unit'}</span></strong></td>
              <td>${c.chargeType}</td>
              <td>${c.period}</td>
              <td><strong>$${c.amount.toLocaleString()}</strong></td>
              <td style="color: ${isOverdue ? '#dc2626' : 'var(--text-main)'}; font-weight: ${isOverdue ? '800' : '500'};">${c.dueDate}</td>
              <td><span class="badge ${c.status === 'Paid' ? 'badge-paid' : 'badge-overdue'}" onclick="showChargeModal('${c.id}')" style="cursor: pointer;">${c.status}</span></td>
              <td>
                ${c.status !== 'Paid' ? `
                  <button class="btn btn-primary btn-sm" onclick="openRecordPaymentModal('${c.tenancyId}', 'p-103', '${c.id}', ${c.amount})">Record Payment</button>
                ` : `<span style="color: #047857; font-weight: 700; font-size: 11px;">✔️ Settled</span>`}
              </td>
            </tr>
          `;
        }).join('')}
      </tbody>
    </table>

    <!-- Deposit Transaction Ledger -->
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
      <h3 style="font-size: 16px; font-weight: 800;">🏦 Deposit Transaction Ledgers (Move-Out Dispute Protection)</h3>
      <button class="btn btn-secondary btn-sm" onclick="openDepositModal()">+ Deposit Transaction</button>
    </div>
    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px;">
      ${db.depositLedgers.map(dl => {
        const t = db.tenancies.find(x => x.id === dl.tenancyId);
        const u = t ? db.units.find(x => x.id === t.unitId) : null;

        return `
          <div style="background: white; border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 20px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
              <strong>${u ? u.unitNumber : 'Unit'} Deposit Account</strong>
              <span class="badge badge-paid">Escrow Verified</span>
            </div>
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; font-size: 12px; margin-bottom: 14px;">
              <div>Security: <strong>$${dl.secDepositRec}</strong></div>
              <div>Utility: <strong>$${dl.utilDepositRec}</strong></div>
              <div>Keys: <strong>$${dl.keyDepositRec}</strong></div>
            </div>
            <div style="font-size: 11px; font-weight: 800; color: var(--text-muted); margin-bottom: 6px;">TRANSACTION LOG</div>
            <div style="background: #f8fafc; padding: 8px 12px; border-radius: 6px; font-size: 11.5px;">
              ${(dl.transactions || []).map(tr => `
                <div>• ${tr.date}: <strong>${tr.type}</strong> ($${tr.amount}) — ${tr.details}</div>
              `).join('')}
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

// ----------------------------------------------------
// 4. MAINTENANCE & VENDORS VIEW
// ----------------------------------------------------
function renderMaintenanceView(container) {
  const db = dbStore.getDB();

  container.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
      <div>
        <div style="font-size: 11px; font-weight: 800; color: var(--primary); text-transform: uppercase;">MAINTENANCE & VENDOR WORK ORDERS</div>
        <h2 style="font-size: 26px; font-weight: 800;">Repairs, Work Orders & Vendor Database</h2>
        <p style="font-size: 13px; color: var(--text-muted);">Normalized workflow: Issue reported → Triage → Vendor Assigned → Work performed → Tenant Poll.</p>
      </div>
      <button class="btn btn-primary" onclick="openLogIssueModal()">+ Log Repair Issue</button>
    </div>

    <!-- Kanban Pipeline -->
    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; margin-bottom: 32px;">
      <!-- Submitted -->
      <div style="background: #f1f5f9; padding: 16px; border-radius: 12px; min-height: 380px;">
        <div style="font-weight: 800; margin-bottom: 12px; display: flex; justify-content: space-between;">
          <span>📋 Submitted</span>
          <span class="badge badge-warning">${db.maintenanceRequests.filter(m => m.status === 'Submitted').length}</span>
        </div>
        ${db.maintenanceRequests.filter(m => m.status === 'Submitted').map(m => renderMaintCard(m)).join('')}
      </div>

      <!-- In Progress -->
      <div style="background: #f1f5f9; padding: 16px; border-radius: 12px; min-height: 380px;">
        <div style="font-weight: 800; margin-bottom: 12px; display: flex; justify-content: space-between;">
          <span>🛠️ In Progress</span>
          <span class="badge badge-overdue">${db.maintenanceRequests.filter(m => m.status === 'In Progress').length}</span>
        </div>
        ${db.maintenanceRequests.filter(m => m.status === 'In Progress').map(m => renderMaintCard(m)).join('')}
      </div>

      <!-- Resolved -->
      <div style="background: #f1f5f9; padding: 16px; border-radius: 12px; min-height: 380px;">
        <div style="font-weight: 800; margin-bottom: 12px; display: flex; justify-content: space-between;">
          <span>🟢 Resolved</span>
          <span class="badge badge-paid">${db.maintenanceRequests.filter(m => m.status === 'Resolved').length}</span>
        </div>
        ${db.maintenanceRequests.filter(m => m.status === 'Resolved').map(m => renderMaintCard(m)).join('')}
      </div>
    </div>

    <!-- Vendor Directory -->
    <h3 style="font-size: 16px; font-weight: 800; margin-bottom: 12px;">👷 Trusted Vendor Master Database</h3>
    <table class="data-table">
      <thead>
        <tr>
          <th>VENDOR ID</th>
          <th>COMPANY NAME</th>
          <th>TRADE</th>
          <th>CONTACT PERSON</th>
          <th>PHONE</th>
          <th>BANK ACCOUNT</th>
          <th>RATING</th>
        </tr>
      </thead>
      <tbody>
        ${db.vendors.map(v => `
          <tr>
            <td><code>${v.id}</code></td>
            <td><strong>${v.companyName}</strong></td>
            <td><span class="badge badge-info">${v.trade}</span></td>
            <td>${v.contactPerson}</td>
            <td>${v.phone}</td>
            <td>${v.bankAccount}</td>
            <td>⭐ ${v.rating} / 5.0</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

function renderMaintCard(m) {
  const db = dbStore.getDB();
  const u = db.units.find(x => x.id === m.unitId);

  return `
    <div style="background: white; border: 1px solid var(--border-color); border-radius: 8px; padding: 14px; margin-bottom: 10px;">
      <div style="display: flex; justify-content: space-between; align-items: flex-start;">
        <strong>${u ? u.unitNumber : 'Unit'}</strong>
        <span class="badge ${m.urgency === 'URGENT' ? 'badge-overdue' : 'badge-warning'}">${m.urgency}</span>
      </div>
      <div style="font-size: 13px; font-weight: 700; margin: 4px 0;">${m.issue}</div>
      <div style="font-size: 11px; color: var(--text-muted); margin-bottom: 8px;">${m.description || ''}</div>
      
      ${m.status === 'Submitted' ? `
        <button class="btn btn-secondary btn-sm" style="width: 100%;" onclick="openAssignVendorModal('${m.id}')">Assign Vendor →</button>
      ` : ''}

      ${m.status === 'In Progress' ? `
        <button class="btn btn-primary btn-sm" style="width: 100%;" onclick="openResolvePollModal('${m.id}')">Resolve & Request Poll ✔️</button>
      ` : ''}

      ${m.status === 'Resolved' && m.satisfactionRating ? `
        <div style="font-size: 11.5px; color: #b45309; font-weight: 700;">⭐ Tenant Poll: ${m.satisfactionRating} / 5 Stars</div>
      ` : ''}
    </div>
  `;
}

// ----------------------------------------------------
// 5. TENANCIES & TENANTS VIEW (Lifecycle & Person Model)
// ----------------------------------------------------
function renderTenantsView(container) {
  const db = dbStore.getDB();

  container.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
      <div>
        <div style="font-size: 11px; font-weight: 800; color: var(--primary); text-transform: uppercase;">TENANCY LIFECYCLE & PERSON MASTER</div>
        <h2 style="font-size: 26px; font-weight: 800;">Tenancy Agreements & Person Master</h2>
        <p style="font-size: 13px; color: var(--text-muted);">Person ≠ Tenancy. A person can hold multiple tenancies over time with complete lifecycle tracking.</p>
      </div>
      <button class="btn btn-primary" onclick="alert('Creating new Tenancy Agreement...')">+ New Tenancy Agreement</button>
    </div>

    <!-- Active Tenancies Table -->
    <h3 style="font-size: 16px; font-weight: 800; margin-bottom: 12px;">📑 Tenancy Agreements & Stamping Truth</h3>
    <table class="data-table" style="margin-bottom: 32px;">
      <thead>
        <tr>
          <th>TENANCY ID</th>
          <th>UNIT</th>
          <th>PRIMARY TENANT</th>
          <th>PERIOD</th>
          <th>RENT</th>
          <th>STAMPING (LHDN)</th>
          <th>LIFECYCLE STATUS</th>
          <th>ACTIONS</th>
        </tr>
      </thead>
      <tbody>
        ${db.tenancies.map(t => {
          const u = db.units.find(x => x.id === t.unitId);
          const party = db.tenancyParties.find(tp => tp.tenancyId === t.id && tp.role === 'Primary Tenant');
          const person = party ? db.persons.find(p => p.id === party.personId) : null;

          return `
            <tr>
              <td><span class="clickable-entity" onclick="showTenantModal('${t.id}')"><code>${t.id}</code></span></td>
              <td><strong><span class="clickable-entity" onclick="showUnitModal('${u ? u.id : ''}')">🚪 ${u ? u.unitNumber : 'Unit'}</span></strong></td>
              <td><strong><span class="clickable-entity" onclick="showTenantModal('${person ? person.id : ''}')">👤 ${person ? person.name : 'Tenant'}</span></strong></td>
              <td>${t.startDate} to ${t.endDate}</td>
              <td>$${t.rentAmount}/mo</td>
              <td><span class="badge badge-paid">✔️ ${t.stampingStatus}</span></td>
              <td><span class="badge ${t.status === 'Active' ? 'badge-paid' : 'badge-warning'}">${t.status}</span></td>
              <td>
                <div style="display: flex; gap: 4px;">
                  <button class="btn btn-secondary btn-sm" onclick="showTenantModal('${t.id}')">Dossier</button>
                  <button class="btn btn-secondary btn-sm" onclick="openRenewalModal('${t.id}')">Renew</button>
                  <button class="btn btn-secondary btn-sm" onclick="initiateMoveOut('${t.id}')">Move-Out</button>
                </div>
              </td>
            </tr>
          `;
        }).join('')}
      </tbody>
    </table>

    <!-- Person Master Directory -->
    <h3 style="font-size: 16px; font-weight: 800; margin-bottom: 12px;">👤 Person Master (Tenants, Owners & Guarantors)</h3>
    <table class="data-table">
      <thead>
        <tr>
          <th>PERSON ID</th>
          <th>FULL NAME</th>
          <th>IC / PASSPORT</th>
          <th>CONTACT</th>
          <th>EMERGENCY CONTACT</th>
        </tr>
      </thead>
      <tbody>
        ${db.persons.map(p => `
          <tr>
            <td><code>${p.id}</code></td>
            <td><strong>${p.name}</strong> (${p.type})</td>
            <td>${p.icPassport}</td>
            <td>${p.phone} • ${p.email}</td>
            <td style="color: var(--text-muted);">${p.emergencyContact}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

// ----------------------------------------------------
// 6. CALENDAR & SCHEDULE VIEW
// ----------------------------------------------------
function renderCalendarView(container) {
  const events = logic.getAggregatedCalendarEvents();

  container.innerHTML = `
    <div style="margin-bottom: 24px;">
      <div style="font-size: 11px; font-weight: 800; color: var(--primary); text-transform: uppercase;">AGGREGATED CALENDAR</div>
      <h2 style="font-size: 26px; font-weight: 800;">Live Event & Schedule Truth</h2>
      <p style="font-size: 13px; color: var(--text-muted);">Calendar events dynamically generated from rent due dates, lease expiries, and vendor appointments.</p>
    </div>

    <div style="background: white; border: 1px solid var(--border-color); border-radius: 16px; padding: 24px;">
      <h3 style="font-size: 18px; font-weight: 800; margin-bottom: 16px;">Scheduled Timeline Events</h3>
      <div style="display: flex; flex-direction: column; gap: 12px;">
        ${events.map(e => `
          <div style="background: #f8fafc; border-left: 4px solid var(--primary); padding: 14px 18px; border-radius: 6px; display: flex; justify-content: space-between; align-items: center;">
            <div>
              <div style="font-weight: 800; font-size: 14px;">${e.title}</div>
              <div style="font-size: 12px; color: var(--text-muted);">Type: ${e.type} • Status: ${e.status}</div>
            </div>
            <div style="font-weight: 800; color: var(--primary); font-size: 14px;">📅 ${e.date}</div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

// ----------------------------------------------------
// 7. VAULT & COMMUNICATION VIEW
// ----------------------------------------------------
function renderVaultView(container) {
  const db = dbStore.getDB();

  container.innerHTML = `
    <div style="margin-bottom: 24px;">
      <div style="font-size: 11px; font-weight: 800; color: var(--primary); text-transform: uppercase;">DOCUMENTS & COMMUNICATIONS</div>
      <h2 style="font-size: 26px; font-weight: 800;">Digital Vault & Evidence Timeline</h2>
      <p style="font-size: 13px; color: var(--text-muted);">Documents linked to Tenancies, Units and Inspections with full WhatsApp/SMS evidence history.</p>
    </div>

    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px;">
      <!-- Documents -->
      <div style="background: white; border: 1px solid var(--border-color); border-radius: 16px; padding: 20px;">
        <h3 style="font-size: 16px; font-weight: 800; margin-bottom: 12px;">📂 Document Links</h3>
        ${db.documents.map(d => `
          <div style="background: #f8fafc; padding: 12px; border-radius: 8px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center;">
            <div>
              <strong>${d.title}</strong>
              <div style="font-size: 11px; color: var(--text-muted);">${d.docType} • ${d.fileSize}</div>
            </div>
            <button class="btn btn-secondary btn-sm" onclick="alert('Viewing verified document...')">👁️ View</button>
          </div>
        `).join('')}
      </div>

      <!-- Communications -->
      <div style="background: white; border: 1px solid var(--border-color); border-radius: 16px; padding: 20px;">
        <h3 style="font-size: 16px; font-weight: 800; margin-bottom: 12px;">💬 Evidence Communications Log</h3>
        ${db.communications.map(c => `
          <div style="background: #f8fafc; padding: 12px; border-radius: 8px; margin-bottom: 10px;">
            <div style="display: flex; justify-content: space-between; font-size: 11px; font-weight: 700; color: var(--text-muted);">
              <span>${c.channel} • ${c.subject}</span>
              <span>${c.timestamp}</span>
            </div>
            <p style="font-size: 12.5px; margin-top: 4px;">"${c.message}"</p>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

// ----------------------------------------------------
// 8. AUDIT TRAIL VIEW
// ----------------------------------------------------
function renderAuditView(container) {
  const db = dbStore.getDB();

  container.innerHTML = `
    <div style="margin-bottom: 24px;">
      <div style="font-size: 11px; font-weight: 800; color: var(--primary); text-transform: uppercase;">SECURITY & COMPLIANCE</div>
      <h2 style="font-size: 26px; font-weight: 800;">System Audit Trail & State History</h2>
      <p style="font-size: 13px; color: var(--text-muted);">Immutable audit log recording every status change, financial allocation, and lifecycle event.</p>
    </div>

    <table class="data-table">
      <thead>
        <tr>
          <th>AUDIT ID</th>
          <th>USER</th>
          <th>ENTITY</th>
          <th>ENTITY ID</th>
          <th>ACTION</th>
          <th>OLD VALUE</th>
          <th>NEW VALUE</th>
          <th>TIMESTAMP</th>
        </tr>
      </thead>
      <tbody>
        ${db.auditTrail.map(a => `
          <tr>
            <td><code>${a.id}</code></td>
            <td><strong>${a.user}</strong></td>
            <td>${a.entity}</td>
            <td><code>${a.entityId}</code></td>
            <td><span class="badge badge-info">${a.action}</span></td>
            <td style="color: #dc2626;">${a.oldValue}</td>
            <td style="color: #047857; font-weight: 700;">${a.newValue}</td>
            <td style="color: var(--text-muted); font-size: 11px;">${a.timestamp}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

// ----------------------------------------------------
// Modals & Interactive Actions
// ----------------------------------------------------
function openRecordPaymentModal(tenancyId, personId, chargeId, amount) {
  const title = document.getElementById('global-modal-title');
  const body = document.getElementById('global-modal-body');
  const footer = document.getElementById('global-modal-footer');
  title.innerText = 'Record Payment & Allocate to Charge';

  body.innerHTML = `
    <div class="form-group">
      <label>Charge Amount ($)</label>
      <input type="number" id="pay-amount" class="form-control" value="${amount}">
    </div>
    <div class="form-group">
      <label>Payment Method</label>
      <select id="pay-method" class="form-control">
        <option>Personal Check</option>
        <option>Zelle Transfer</option>
        <option>Bank Cash Receipt</option>
        <option>Venmo</option>
      </select>
    </div>
    <div class="form-group">
      <label>Bank Reference / Check Number</label>
      <input type="text" id="pay-ref" class="form-control" value="Ref #CH-${Date.now().toString().slice(-4)}">
    </div>
  `;

  footer.innerHTML = `
    <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
    <button class="btn btn-primary" onclick="submitPayment('${tenancyId}', '${personId}', '${chargeId}')">Confirm & Allocate</button>
  `;
  document.getElementById('global-modal').classList.add('active');
}

function submitPayment(tenancyId, personId, chargeId) {
  const amount = document.getElementById('pay-amount').value;
  const method = document.getElementById('pay-method').value;
  const ref = document.getElementById('pay-ref').value;

  logic.recordPayment(tenancyId, personId, amount, method, ref, chargeId);
  closeModal();
  showToast('Payment recorded and allocated successfully!');
  renderCurrentView();
}

function openResolvePollModal(requestId) {
  const title = document.getElementById('global-modal-title');
  const body = document.getElementById('global-modal-body');
  const footer = document.getElementById('global-modal-footer');
  title.innerText = 'Resolve Maintenance & Record Tenant Poll';

  body.innerHTML = `
    <div class="form-group">
      <label>Final Invoice Cost ($)</label>
      <input type="number" id="maint-cost" class="form-control" value="110">
    </div>
    <div class="form-group">
      <label>Tenant Satisfaction Quick-Poll Rating (1 to 5 Stars)</label>
      <select id="maint-rating" class="form-control">
        <option value="5">⭐⭐⭐⭐⭐ (5 Stars - Excellent)</option>
        <option value="4">⭐⭐⭐⭐ (4 Stars - Good)</option>
        <option value="3">⭐⭐⭐ (3 Stars - Neutral)</option>
      </select>
    </div>
  `;

  footer.innerHTML = `
    <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
    <button class="btn btn-primary" onclick="submitMaintResolution('${requestId}')">Confirm Resolution</button>
  `;
  document.getElementById('global-modal').classList.add('active');
}

function submitMaintResolution(requestId) {
  const cost = document.getElementById('maint-cost').value;
  const rating = document.getElementById('maint-rating').value;
  logic.updateMaintenanceStatus(requestId, 'Resolved', null, cost, rating);
  closeModal();
  showToast('Maintenance marked resolved and poll recorded!');
  renderCurrentView();
}

function initiateMoveOut(tenancyId) {
  if (confirm('Initiate move-out workflow? This will mark the tenancy closed, free up the unit to Vacant, and generate move-out inspection tasks.')) {
    logic.terminateTenancy(tenancyId);
    showToast('Move-out workflow completed! Unit status updated to Vacant.');
    renderCurrentView();
  }
}

function showUnitQR(unitNumber) {
  // QR code feature removed per manager workflow preference
}

function exportLedgerCSV() {
  const db = dbStore.getDB();
  let csv = "ChargeID,TenancyID,Type,Period,Amount,DueDate,Status\n";
  db.charges.forEach(c => {
    csv += `"${c.id}","${c.tenancyId}","${c.chargeType}","${c.period}",${c.amount},"${c.dueDate}","${c.status}"\n`;
  });
  const link = document.createElement("a");
  link.href = "data:text/csv;charset=utf-8," + encodeURI(csv);
  link.download = "NestPad_Ledger_Truth.csv";
  link.click();
}

function toggleTask(taskId) {
  const db = dbStore.getDB();
  const t = db.tasks.find(x => x.id === taskId);
  if (t) {
    t.status = t.status === 'Completed' ? 'Pending' : 'Completed';
    localStorage.setItem(dbStore.storageKey, JSON.stringify(db));
    window.dispatchEvent(new CustomEvent('nestpad_db_updated', { detail: { entityKey: 'tasks', action: 'TASK_TOGGLE', timestamp: Date.now() } }));
    renderCurrentView();
  }
}

function showToast(msg) {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerText = msg;
  document.getElementById('toast-container').appendChild(toast);
  setTimeout(() => toast.remove(), 3500);
}

function closeModal() {
  document.getElementById('global-modal').classList.remove('active');
}
