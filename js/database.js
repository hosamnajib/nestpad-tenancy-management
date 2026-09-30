/* NestPad Layer 1 — Unified Relational Database Truth & Model Store */

const INITIAL_SPEC_DATABASE = {
  // 1. Person Master
  persons: [
    { id: 'p-101', name: 'Sarah Miller', type: 'Individual', icPassport: '880412-14-5542', email: 'sarah.m@example.com', phone: '(555) 901-4422', emergencyContact: 'James Miller (Brother) (555) 123-9988' },
    { id: 'p-102', name: 'John Miller', type: 'Individual', icPassport: '860920-14-6101', email: 'john.m@example.com', phone: '(555) 901-4423', emergencyContact: 'James Miller (Brother) (555) 123-9988' },
    { id: 'p-103', name: 'Alex Rivera', type: 'Individual', icPassport: '920315-10-5199', email: 'alex.rivera@example.com', phone: '(555) 392-1084', emergencyContact: 'Maria Rivera (Mother) (555) 443-1122' },
    { id: 'p-104', name: 'Elena Rostova', type: 'Individual', icPassport: 'A98234101', email: 'elena.r@example.com', phone: '(555) 234-8901', emergencyContact: 'Andrei Rostov (Brother) (555) 891-2345' },
    { id: 'p-105', name: 'Marcus Chen', type: 'Individual', icPassport: '901104-08-3321', email: 'marcus.c@example.com', phone: '(555) 881-2099', emergencyContact: 'Grace Chen (Sister) (555) 771-0022' },
    { id: 'p-106', name: 'Priya Sharma', type: 'Individual', icPassport: '940502-14-7788', email: 'priya.s@example.com', phone: '(555) 662-3344', emergencyContact: 'Raj Sharma (Father) (555) 112-9900' },
    { id: 'p-107', name: 'Daniel Vance', type: 'Individual', icPassport: '890711-10-4455', email: 'daniel.v@example.com', phone: '(555) 782-9011', emergencyContact: 'Lisa Vance (Wife) (555) 990-2211' },
    { id: 'p-201', name: 'Robert Vance (Owner)', type: 'Individual', icPassport: '650101-14-1122', email: 'robert.owner@example.com', phone: '(555) 100-2000', bankDetails: 'Maybank 514012399001' }
  ],

  // 2. Owners & Property Ownership
  owners: [
    { id: 'own-1', personId: 'p-201', legalName: 'Robert Vance Property Holdings Sdn Bhd', companyReg: '201901034921', bankAccount: 'Maybank 514012399001', taxNo: 'C289123000' }
  ],
  ownerships: [
    { id: 'os-1', ownerId: 'own-1', unitId: 'u-1a', percent: 100, isPrimary: true },
    { id: 'os-2', ownerId: 'own-1', unitId: 'u-2b', percent: 100, isPrimary: true },
    { id: 'os-3', ownerId: 'own-1', unitId: 'u-3b', percent: 100, isPrimary: true },
    { id: 'os-4', ownerId: 'own-1', unitId: 'u-4a', percent: 100, isPrimary: true },
    { id: 'os-5', ownerId: 'own-1', unitId: 'u-1b', percent: 100, isPrimary: true },
    { id: 'os-6', ownerId: 'own-1', unitId: 'u-4c', percent: 100, isPrimary: true }
  ],

  // 3. Buildings / Properties & Units
  buildings: [
    { id: 'b-1', name: 'Maple Crest Apartments', address: 'Jalan Kerinchi, Bangsar South', city: 'Kuala Lumpur', postcode: '59200', managementOffice: 'Building Office Level 1', facilities: ['Swimming Pool', 'Gym', '24h Security', 'Subsidized Parking'] },
    { id: 'b-2', name: 'Cedar Park Duplexes', address: 'Persiaran Residen, Desa ParkCity', city: 'Kuala Lumpur', postcode: '52200', managementOffice: 'Clubhouse Mgmt', facilities: ['Private Garden', 'Gated Guarded', 'Tennis Court'] },
    { id: 'b-3', name: 'Elmwood Townhomes', address: 'Jalan SS15/4', city: 'Subang Jaya', postcode: '47500', managementOffice: 'SS15 JMB Office', facilities: ['Playground', 'Visitor Parking'] }
  ],
  units: [
    { id: 'u-1a', buildingId: 'b-1', unitNumber: 'Unit 1A', floor: '1st Floor', bedrooms: 2, bathrooms: 1, parkingBays: 'Spot #12', status: 'Occupied', targetRent: 1650, lockboxCode: '201', electricityAcc: 'TNB-22091283', waterAcc: 'SYABAS-881290' },
    { id: 'u-2b', buildingId: 'b-1', unitNumber: 'Unit 2B', floor: '2nd Floor', bedrooms: 2, bathrooms: 2, parkingBays: 'Unassigned', status: 'Vacant', targetRent: 1800, lockboxCode: '8492', electricityAcc: 'TNB-22091284', waterAcc: 'SYABAS-881291' },
    { id: 'u-3b', buildingId: 'b-1', unitNumber: 'Unit 3B', floor: 'Top Floor', bedrooms: 1, bathrooms: 1, parkingBays: 'Locker #3', status: 'Occupied', targetRent: 1750, lockboxCode: '302', electricityAcc: 'TNB-22091285', waterAcc: 'SYABAS-881292' },
    { id: 'u-4a', buildingId: 'b-2', unitNumber: 'Unit 4A', floor: 'Left Residence', bedrooms: 3, bathrooms: 2, parkingBays: '1-Car Garage', status: 'Occupied', targetRent: 2100, lockboxCode: '104', electricityAcc: 'TNB-22091286', waterAcc: 'SYABAS-881293' },
    { id: 'u-1b', buildingId: 'b-3', unitNumber: 'Unit 1B', floor: 'End Unit', bedrooms: 2, bathrooms: 2.5, parkingBays: '2-Car Driveway', status: 'Occupied', targetRent: 1950, lockboxCode: '501', electricityAcc: 'TNB-22091287', waterAcc: 'SYABAS-881294' },
    { id: 'u-4c', buildingId: 'b-2', unitNumber: 'Unit 4C', floor: '4th Floor East Wing', bedrooms: 1, bathrooms: 1, parkingBays: 'Spot #08', status: 'Occupied', targetRent: 1650, lockboxCode: '403', electricityAcc: 'TNB-22091288', waterAcc: 'SYABAS-881295' }
  ],

  // 4. Tenancies
  tenancies: [
    { id: 't-1001', unitId: 'u-1a', version: 'v1_2024', startDate: '2023-11-01', endDate: '2025-10-31', rentAmount: 1650, dueDay: 1, status: 'Active', stampingStatus: 'Stamped', stampingRef: 'LHDN/STAMP/2023/8812' },
    { id: 't-1002', unitId: 'u-3b', version: 'v1_2023', startDate: '2023-03-01', endDate: '2025-03-31', rentAmount: 1750, dueDay: 1, status: 'Active', stampingStatus: 'Stamped', stampingRef: 'LHDN/STAMP/2023/4491' },
    { id: 't-1003', unitId: 'u-4a', version: 'v1_2024', startDate: '2024-08-01', endDate: '2026-07-31', rentAmount: 2100, dueDay: 1, status: 'Active', stampingStatus: 'Stamped', stampingRef: 'LHDN/STAMP/2024/1102' },
    { id: 't-1004', unitId: 'u-1b', version: 'v1_2023', startDate: '2023-12-01', endDate: '2024-11-30', rentAmount: 1950, dueDay: 1, status: 'Renewal Pending', stampingStatus: 'Stamped', stampingRef: 'LHDN/STAMP/2023/9920' },
    { id: 't-1005', unitId: 'u-4c', version: 'v1_2023', startDate: '2023-11-16', endDate: '2024-11-15', rentAmount: 1650, dueDay: 5, status: 'Expiring', stampingStatus: 'Stamped', stampingRef: 'LHDN/STAMP/2023/3371' }
  ],

  // 5. Tenancy Parties
  tenancyParties: [
    { id: 'tp-1', tenancyId: 't-1001', personId: 'p-101', role: 'Primary Tenant' },
    { id: 'tp-2', tenancyId: 't-1001', personId: 'p-102', role: 'Co-Tenant' },
    { id: 'tp-3', tenancyId: 't-1002', personId: 'p-103', role: 'Primary Tenant' },
    { id: 'tp-4', tenancyId: 't-1003', personId: 'p-106', role: 'Primary Tenant' },
    { id: 'tp-5', tenancyId: 't-1004', personId: 'p-105', role: 'Primary Tenant' },
    { id: 'tp-6', tenancyId: 't-1005', personId: 'p-104', role: 'Primary Tenant' }
  ],

  // 6. Deposit Transaction Ledgers
  depositLedgers: [
    {
      id: 'dep-1001',
      tenancyId: 't-1001',
      secDepositReq: 1650, secDepositRec: 1650,
      utilDepositReq: 500, utilDepositRec: 500,
      keyDepositReq: 100, keyDepositRec: 100,
      heldBy: 'Property Manager Escrow',
      transactions: [{ id: 'dt-0', date: '2023-11-01', type: 'Deposit Received', amount: 2250, details: 'Full move-in deposit paid via Zelle' }]
    },
    {
      id: 'dep-1002',
      tenancyId: 't-1002',
      secDepositReq: 1750, secDepositRec: 1750,
      utilDepositReq: 500, utilDepositRec: 500,
      keyDepositReq: 100, keyDepositRec: 100,
      heldBy: 'Property Manager Escrow',
      transactions: [{ id: 'dt-2', date: '2023-03-01', type: 'Deposit Received', amount: 2350, details: 'Move-in deposit' }]
    },
    {
      id: 'dep-1005',
      tenancyId: 't-1005',
      secDepositReq: 1650, secDepositRec: 1650,
      utilDepositReq: 500, utilDepositRec: 500,
      keyDepositReq: 100, keyDepositRec: 100,
      heldBy: 'Property Manager Escrow Account #8812',
      transactions: [
        { id: 'dt-1', date: '2023-11-16', type: 'Deposit Received', amount: 2250, details: 'Full move-in deposit paid via bank transfer' }
      ]
    }
  ],

  // 7. Charges, Payments & Allocations
  charges: [
    { id: 'chg-101', tenancyId: 't-1001', chargeType: 'Rent', period: 'October 2024', amount: 1650, dueDate: '2026-10-01', status: 'Paid' },
    { id: 'chg-102', tenancyId: 't-1002', chargeType: 'Rent', period: 'October 2024', amount: 1750, dueDate: '2026-10-01', status: 'Overdue' },
    { id: 'chg-103', tenancyId: 't-1003', chargeType: 'Rent', period: 'October 2024', amount: 2100, dueDate: '2026-10-01', status: 'Paid' },
    { id: 'chg-104', tenancyId: 't-1004', chargeType: 'Rent', period: 'October 2024', amount: 1950, dueDate: '2026-10-01', status: 'Paid' },
    { id: 'chg-105', tenancyId: 't-1005', chargeType: 'Rent', period: 'October 2024', amount: 1650, dueDate: '2026-10-05', status: 'Overdue' }
  ],
  payments: [
    { id: 'pay-1', payerPersonId: 'p-101', amount: 1650, paymentDate: '2026-10-02', method: 'Personal Check #1042', reference: 'Chase Deposited Oct 2' },
    { id: 'pay-2', payerPersonId: 'p-106', amount: 2100, paymentDate: '2026-10-01', method: 'Zelle Transfer', reference: 'Ref #ZEL-99012' },
    { id: 'pay-3', payerPersonId: 'p-105', amount: 1950, paymentDate: '2026-09-30', method: 'USPS Money Order', reference: 'MO #24991024' }
  ],
  allocations: [
    { id: 'al-1', paymentId: 'pay-1', chargeId: 'chg-101', amountAllocated: 1650 },
    { id: 'al-2', paymentId: 'pay-2', chargeId: 'chg-103', amountAllocated: 2100 },
    { id: 'al-3', paymentId: 'pay-3', chargeId: 'chg-104', amountAllocated: 1950 }
  ],

  // 8. Vendors & Work Orders
  vendors: [
    { id: 'v-1', companyName: 'Apex Plumbing & Drainage Co.', trade: 'Plumbing', contactPerson: 'Dave Peterson', phone: '(555) 882-1100', rating: 4.9, bankAccount: 'CIMB 8001928301' },
    { id: 'v-2', companyName: 'HVAC Direct Solutions', trade: 'HVAC / Aircon', contactPerson: 'Sam Wilson', phone: '(555) 773-4411', rating: 4.8, bankAccount: 'Public Bank 319201920' },
    { id: 'v-3', companyName: 'Elite Interior Painters', trade: 'Painting / Turnover', contactPerson: 'Joe Handyman', phone: '(555) 991-8822', rating: 4.7, bankAccount: 'RHB 2120019283' }
  ],
  maintenanceRequests: [
    { id: 'm-1', unitId: 'u-1a', tenantPersonId: 'p-107', issue: 'Sink Pipe Leak Under Basin', category: 'Plumbing', urgency: 'URGENT', status: 'In Progress', dateReported: '2026-10-13', description: 'Moisture detected in lower cabinet.' },
    { id: 'm-2', unitId: 'u-2b', tenantPersonId: null, issue: 'Balcony sliding door off track', category: 'Carpentry', urgency: 'MEDIUM', status: 'Submitted', dateReported: '2026-10-12', description: 'Turnover preparation.' },
    { id: 'm-3', unitId: 'u-3b', tenantPersonId: 'p-103', issue: 'AC thermostat replaced', category: 'HVAC', urgency: 'LOW', status: 'Resolved', dateReported: '2026-10-08', satisfactionRating: 5, repairCost: 140 }
  ],
  workOrders: [
    { id: 'wo-1', requestId: 'm-1', vendorId: 'v-1', quoteAmount: 110, approvedByOwner: true, scheduledDate: '2026-10-15 09:00', invoiceAmount: 110, status: 'Scheduled' }
  ],

  // 9. Unit Assets
  unitAssets: [
    { id: 'ast-1', unitId: 'u-1a', category: 'Air Conditioner', brand: 'Daikin 1.5HP', serialNo: 'DK-99012', condition: 'Good', warrantyExpiry: '2027-05-10' },
    { id: 'ast-2', unitId: 'u-1a', category: 'Refrigerator', brand: 'Panasonic Inverter', serialNo: 'PN-33910', condition: 'Good', warrantyExpiry: '2026-12-01' },
    { id: 'ast-3', unitId: 'u-4c', category: 'Washing Machine', brand: 'LG Front Load 8kg', serialNo: 'LG-88102', condition: 'Minor Defect (Spin noise)', warrantyExpiry: '2025-08-15' }
  ],

  // 10. Keys & Access Control
  accessControl: [
    { id: 'ac-1', unitId: 'u-4c', type: 'Physical Key', serialNo: 'KEY-4C-01', issuedToPersonId: 'p-104', issuedDate: '2023-11-16', deposit: 50, returned: false },
    { id: 'ac-2', unitId: 'u-4c', type: 'Access Card', serialNo: 'CARD-89012', issuedToPersonId: 'p-104', issuedDate: '2023-11-16', deposit: 50, returned: false },
    { id: 'ac-3', unitId: 'u-4c', type: 'Parking Remote', serialNo: 'REMOTE-P12', issuedToPersonId: 'p-104', issuedDate: '2023-11-16', deposit: 100, returned: false }
  ],

  // 11. Inspections
  inspections: [
    {
      id: 'insp-101',
      tenancyId: 't-1005',
      unitId: 'u-4c',
      type: 'Move-in Condition Report',
      date: '2023-11-16',
      inspector: 'Sarah Jenkins (Property Mgr)',
      items: [
        { area: 'Kitchen', item: 'Refrigerator', condition: 'Good', notes: 'Clean, ice tray intact' },
        { area: 'Kitchen', item: 'Sink & Faucet', condition: 'Good', notes: 'No water pressure issues' },
        { area: 'Living Room', item: 'Air Conditioner', condition: 'Good', notes: 'Remote batteries tested' },
        { area: 'Bathroom', item: 'Shower Grout', condition: 'Minor Defect', notes: 'Slight discoloration near base' }
      ]
    }
  ],

  // 12. Generic Tasks
  tasks: [
    { id: 'task-1', type: 'Maintenance Follow-up', relatedEntityType: 'Maintenance', relatedEntityId: 'm-1', title: 'Confirm plumber Dave arrival for Unit 1A (Sink leak)', assignedUser: 'Sarah Jenkins', dueDate: '2026-10-15', status: 'Pending' },
    { id: 'task-2', type: 'Lease Renewal', relatedEntityType: 'Tenancy', relatedEntityId: 't-1005', title: 'Send 60-day renewal proposal to Elena Rostova (Unit 4C)', assignedUser: 'Sarah Jenkins', dueDate: '2026-10-20', status: 'Pending' },
    { id: 'task-3', type: 'Inspection', relatedEntityType: 'Building', relatedEntityId: 'b-2', title: 'Quarterly Fire Sprinkler Inspection at Cedar Park', assignedUser: 'Sarah Jenkins', dueDate: '2026-10-20', status: 'Pending' }
  ],

  // 13. Documents & Links
  documents: [
    { id: 'doc-1', title: 'Lease_Agreement_Unit4C_Signed.pdf', docType: 'Tenancy Contract', fileSize: '2.4 MB', confidential: false, uploadedAt: '2023-11-16', url: '#' },
    { id: 'doc-2', title: 'MoveIn_Checklist_Unit4C.pdf', docType: 'Inspection Report', fileSize: '5.8 MB', confidential: false, uploadedAt: '2023-11-16', url: '#' },
    { id: 'doc-3', title: 'Master_Deed_Maple_Crest.pdf', docType: 'Property Deed', fileSize: '8.1 MB', confidential: true, uploadedAt: '2022-01-10', url: '#' },
    { id: 'doc-4', title: 'Plumbing_Repair_Invoice_Oct11.pdf', docType: 'Invoice / Receipt', fileSize: '420 KB', confidential: false, uploadedAt: '2026-10-11', url: '#' }
  ],
  documentLinks: [
    { id: 'dl-1', docId: 'doc-1', entityType: 'Tenancy', entityId: 't-1005' },
    { id: 'dl-2', docId: 'doc-2', entityType: 'Inspection', entityId: 'insp-101' },
    { id: 'dl-3', docId: 'doc-3', entityType: 'Building', entityId: 'b-1' },
    { id: 'dl-4', docId: 'doc-4', entityType: 'Maintenance', entityId: 'm-3' }
  ],

  // 14. Communications
  communications: [
    { id: 'comm-1', tenancyId: 't-1005', senderPersonId: 'p-104', recipient: 'Property Manager', channel: 'SMS', timestamp: '2026-10-10 14:15', subject: 'Rent Transfer Notice', message: 'Hi Sarah, I will be dropping off the cashier check tomorrow.' },
    { id: 'comm-2', tenancyId: 't-1002', senderPersonId: 'p-103', recipient: 'Alex Rivera', channel: 'In-app Ping', timestamp: '2026-10-10 09:00', subject: 'Overdue Rent Reminder', message: 'Automated 7-day overdue notice sent for October rent ($1,750).' }
  ],

  // 15. Calendar Custom Events
  calendarEvents: [
    { id: 'ce-1', date: '2026-10-15', title: 'Dave Peterson (Plumbing) - Unit 1A', time: '9:00 AM', type: 'Maintenance', notes: 'Sink pipe repair' },
    { id: 'ce-2', date: '2026-10-20', title: 'Quarterly Fire Sprinkler Inspection', time: '10:00 AM', type: 'Inspection', notes: 'Cedar Park Complexes' },
    { id: 'ce-3', date: '2026-11-15', title: 'Move-Out Inspection: Unit 4C (Elena)', time: '12:00 PM', type: 'Lease Expiry', notes: 'Key return and condition report' }
  ],

  // 16. Audit Log
  auditTrail: [
    { id: 'aud-1', user: 'Sarah Jenkins', entity: 'Charge', entityId: 'chg-101', action: 'STATUS_CHANGE', oldValue: 'Overdue', newValue: 'Paid', timestamp: '2026-10-02 10:15:22' },
    { id: 'aud-2', user: 'Sarah Jenkins', entity: 'MaintenanceRequest', entityId: 'm-1', action: 'STATUS_CHANGE', oldValue: 'Submitted', newValue: 'In Progress', timestamp: '2026-10-13 17:00:00' }
  ]
};

// Database Store Wrapper
class SpecificationStore {
  constructor() {
    this.storageKey = 'nestpad_spec_db';

    if (!localStorage.getItem(this.storageKey)) {
      localStorage.setItem(this.storageKey, JSON.stringify(INITIAL_SPEC_DATABASE));
    }

    // Cross-tab reactive synchronization
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (e) => {
        if (e.key === this.storageKey) {
          window.dispatchEvent(new CustomEvent('nestpad_db_updated', {
            detail: { source: 'cross_tab' }
          }));
        }
      });
    }

    this.isBackendConnected = false;
    this.backendInfo = null;

    // Check and connect to live Node.js SQL Backend API
    if (typeof window !== 'undefined' && typeof fetch !== 'undefined') {
      this.checkBackendSync();
    }
  }

  async checkBackendSync() {
    try {
      const res = await fetch('/api/health');
      if (res.ok) {
        const health = await res.json();
        this.isBackendConnected = true;
        this.backendInfo = health;
        console.log('[NestPad Client] Connected to Live Database:', health.engine);

        // Fetch live state from MySQL on initial load
        const dbRes = await fetch('/api/db');
        if (dbRes.ok) {
          const sqlDb = await dbRes.json();
          if (sqlDb && sqlDb.units && sqlDb.units.length > 0) {
            localStorage.setItem(this.storageKey, JSON.stringify(sqlDb));
            window.dispatchEvent(new CustomEvent('nestpad_db_updated', {
              detail: { source: 'backend_sync' }
            }));
          }
        }
      }
    } catch (e) {
      this.isBackendConnected = false;
    }
  }

  // Direct Live Mutation to MySQL Backend (No Bulk Sync)
  async directMutate(table, op, item = null, id = null, list = null) {
    if (!this.isBackendConnected || typeof fetch === 'undefined') return;
    try {
      await fetch('/api/mutate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ table, op, item, id, list })
      });
    } catch (e) {
      console.warn('[NestPad Client] Direct MySQL mutation error:', e);
    }
  }

  getDB() {
    try {
      const data = localStorage.getItem(this.storageKey);
      if (!data) return INITIAL_SPEC_DATABASE;
      return JSON.parse(data);
    } catch (e) {
      console.error('Failed to parse nestpad_spec_db, falling back to initial data', e);
      return INITIAL_SPEC_DATABASE;
    }
  }

  get(entityKey) {
    const db = this.getDB();
    return db[entityKey] || INITIAL_SPEC_DATABASE[entityKey] || [];
  }

  set(entityKey, data) {
    const db = this.getDB();
    db[entityKey] = data;
    localStorage.setItem(this.storageKey, JSON.stringify(db));
    window.dispatchEvent(new CustomEvent('nestpad_db_updated', { detail: { entityKey, action: 'SET', timestamp: Date.now() } }));
  }

  addItem(entityKey, item) {
    const db = this.getDB();
    if (!db[entityKey]) db[entityKey] = [];
    db[entityKey].unshift(item);
    localStorage.setItem(this.storageKey, JSON.stringify(db));
    window.dispatchEvent(new CustomEvent('nestpad_db_updated', { detail: { entityKey, action: 'ADD', timestamp: Date.now() } }));
    this.directMutate(entityKey, 'SAVE', item); // Direct immediate MySQL INSERT
    return item;
  }

  updateItem(entityKey, id, updates) {
    const db = this.getDB();
    if (!db[entityKey]) return null;
    const index = db[entityKey].findIndex(item => item.id === id);
    if (index !== -1) {
      db[entityKey][index] = { ...db[entityKey][index], ...updates };
      const updated = db[entityKey][index];
      localStorage.setItem(this.storageKey, JSON.stringify(db));
      window.dispatchEvent(new CustomEvent('nestpad_db_updated', { detail: { entityKey, action: 'UPDATE', timestamp: Date.now() } }));
      this.directMutate(entityKey, 'SAVE', updated); // Direct immediate MySQL UPDATE
      return updated;
    }
    return null;
  }

  deleteItem(entityKey, id) {
    const db = this.getDB();
    if (!db[entityKey]) return false;
    db[entityKey] = db[entityKey].filter(item => item.id !== id);
    localStorage.setItem(this.storageKey, JSON.stringify(db));
    window.dispatchEvent(new CustomEvent('nestpad_db_updated', { detail: { entityKey, action: 'DELETE', timestamp: Date.now() } }));
    this.directMutate(entityKey, 'DELETE', null, id);
    return true;
  }

  getItem(entityKey, id) {
    const items = this.get(entityKey);
    return items.find(i => i.id === id) || null;
  }

  logAudit(user, entity, entityId, action, oldValue, newValue) {
    const auditItem = {
      id: 'aud-' + Date.now(),
      user: user || 'Sarah Jenkins',
      entity: entity,
      entityId: entityId,
      action: action,
      oldValue: String(oldValue),
      newValue: String(newValue),
      timestamp: new Date().toLocaleString()
    };
    const db = this.getDB();
    db.auditTrail = db.auditTrail || [];
    db.auditTrail.unshift(auditItem);
    localStorage.setItem(this.storageKey, JSON.stringify(db));
    window.dispatchEvent(new CustomEvent('nestpad_db_updated', { detail: { entityKey: 'auditTrail', action: 'AUDIT', timestamp: Date.now() } }));
    this.directMutate('auditTrail', 'SAVE', auditItem); // Direct immediate MySQL INSERT
  }

  // getRemoteConfig / saveRemoteConfig removed — database is always MySQL (direct live).

  exportJSON() {
    const db = this.getDB();
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(db, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", `nestpad_database_backup_${new Date().toISOString().slice(0,10)}.json`);
    dlAnchorElem.click();
  }

  importJSON(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed.units || !parsed.tenancies) {
        throw new Error('Invalid database format. Missing required core tables.');
      }
      localStorage.setItem(this.storageKey, JSON.stringify(parsed));
      window.dispatchEvent(new CustomEvent('nestpad_db_updated', { detail: { action: 'IMPORT', timestamp: Date.now() } }));
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  reset() {
    localStorage.setItem(this.storageKey, JSON.stringify(INITIAL_SPEC_DATABASE));
    window.dispatchEvent(new CustomEvent('nestpad_db_updated', { detail: { action: 'RESET' } }));
    window.location.reload();
  }

  getStats() {
    const db = this.getDB();
    return {
      buildings: (db.buildings || []).length,
      units: (db.units || []).length,
      tenancies: (db.tenancies || []).length,
      persons: (db.persons || []).length,
      charges: (db.charges || []).length,
      payments: (db.payments || []).length,
      maintenanceRequests: (db.maintenanceRequests || []).length,
      tasks: (db.tasks || []).length,
      documents: (db.documents || []).length,
      auditTrail: (db.auditTrail || []).length
    };
  }
}

const dbStore = new SpecificationStore();
if (typeof window !== 'undefined') window.dbStore = dbStore;
if (typeof global !== 'undefined') global.dbStore = dbStore;
