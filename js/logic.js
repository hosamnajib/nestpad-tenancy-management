/* NestPad Layer 2 — Business Logic & Relational Event Chains */

class BusinessLogicLayer {
  constructor(store) {
    this.store = store;
  }

  // 1. Dynamic Calculations (Database Truth -> Logic)
  getMetrics() {
    const units = this.store.get('units');
    const buildings = this.store.get('buildings');
    const tenancies = this.store.get('tenancies');
    const charges = this.store.get('charges');
    const payments = this.store.get('payments');
    const maint = this.store.get('maintenanceRequests');

    // Occupancy Calculation: Occupied units / rentable units
    const totalUnits = units.length;
    const occupiedUnits = units.filter(u => u.status === 'Occupied').length;
    const vacantUnits = totalUnits - occupiedUnits;
    const occupancyRate = totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0;

    // Overdue Rent Calculation
    const today = new Date('2026-10-14'); // System reference date
    const overdueCharges = charges.filter(c => {
      const due = new Date(c.dueDate);
      return (c.status === 'Overdue' || (c.status === 'Due' && due < today));
    });
    const overdueCount = overdueCharges.length;
    const overdueAmount = overdueCharges.reduce((sum, c) => sum + Number(c.amount || 0), 0);

    // Total Monthly Billed & Collected
    const currentMonthCharges = charges.filter(c => c.period === 'October 2024' || c.dueDate.startsWith('2026-10'));
    const totalBilled = currentMonthCharges.reduce((sum, c) => sum + Number(c.amount || 0), 0);
    const paidCharges = currentMonthCharges.filter(c => c.status === 'Paid');
    const totalCollected = paidCharges.reduce((sum, c) => sum + Number(c.amount || 0), 0);
    const collectionRate = totalBilled > 0 ? Math.round((totalCollected / totalBilled) * 100) : 100;

    // Open Maintenance Requests
    const openMaint = maint.filter(m => m.status !== 'Resolved').length;
    const urgentMaint = maint.filter(m => m.status !== 'Resolved' && m.urgency === 'URGENT').length;
    const resolvedMaint = maint.filter(m => m.status === 'Resolved').length;

    // Upcoming Lease Expirations (within next 60 days)
    const upcomingExpirations = tenancies.filter(t => {
      if (t.status === 'Closed' || t.status === 'Terminated') return false;
      const end = new Date(t.endDate);
      const diffTime = end - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays > 0 && diffDays <= 60;
    }).map(t => {
      const end = new Date(t.endDate);
      const diffDays = Math.ceil((end - today) / (1000 * 60 * 60 * 24));
      const unit = units.find(u => u.id === t.unitId) || {};
      const primaryParty = (this.store.get('tenancyParties') || []).find(tp => tp.tenancyId === t.id && tp.role === 'Primary Tenant');
      const person = (this.store.get('persons') || []).find(p => p.id === primaryParty?.personId) || {};
      return {
        ...t,
        daysLeft: diffDays,
        unitNumber: unit.unitNumber || 'Unit',
        tenantName: person.name || 'Tenant'
      };
    });

    return {
      totalBuildings: buildings.length,
      totalUnits,
      occupiedUnits,
      vacantUnits,
      occupancyRate,
      overdueCount,
      overdueAmount,
      totalBilled,
      totalCollected,
      collectionRate,
      openMaint,
      urgentMaint,
      resolvedMaint,
      upcomingExpirations
    };
  }

  // 2. Event Chain: Rent Marked Paid / Payment Allocation
  recordPayment(tenancyId, payerPersonId, amount, method, reference, chargeId) {
    const db = this.store.getDB();
    const paymentId = 'pay-' + Date.now();
    const newPayment = {
      id: paymentId,
      payerPersonId: payerPersonId || 'p-101',
      amount: Number(amount),
      paymentDate: '2026-10-14',
      method: method || 'Personal Check',
      reference: reference || ('Receipt #' + Math.floor(1000 + Math.random() * 9000))
    };
    db.payments.unshift(newPayment);

    // Allocate payment to charge
    let charge = db.charges.find(c => c.id === chargeId);
    if (!charge && tenancyId) {
      charge = db.charges.find(c => c.tenancyId === tenancyId && c.status !== 'Paid');
    }

    if (charge) {
      const oldStatus = charge.status;
      const allocId = 'al-' + Date.now();
      db.allocations.push({
        id: allocId,
        paymentId,
        chargeId: charge.id,
        amountAllocated: Number(amount)
      });

      if (Number(amount) >= Number(charge.amount)) {
        charge.status = 'Paid';
      } else {
        charge.status = 'Partially Paid';
      }

      this.store.logAudit('Sarah Jenkins', 'Charge', charge.id, 'PAYMENT_ALLOCATED', oldStatus, charge.status);
      this.store.directMutate('charges', 'SAVE', charge);
    }

    localStorage.setItem(this.store.storageKey, JSON.stringify(db));
    window.dispatchEvent(new CustomEvent('nestpad_db_updated', { detail: { entityKey: 'payments', action: 'PAYMENT_RECORDED', timestamp: Date.now() } }));
    this.store.directMutate('payments', 'SAVE', newPayment);
    return paymentId;
  }

  // 3. Deposit Ledger Transaction
  recordDepositTransaction(tenancyId, type, amount, details) {
    const db = this.store.getDB();
    let ledger = db.depositLedgers.find(d => d.tenancyId === tenancyId);
    if (!ledger) {
      ledger = {
        id: 'dep-' + Date.now(),
        tenancyId,
        secDepositReq: 1650, secDepositRec: 1650,
        utilDepositReq: 500, utilDepositRec: 500,
        keyDepositReq: 100, keyDepositRec: 100,
        heldBy: 'Property Manager Escrow',
        transactions: []
      };
      db.depositLedgers.push(ledger);
    }

    ledger.transactions = ledger.transactions || [];
    ledger.transactions.unshift({
      id: 'dt-' + Date.now(),
      date: '2026-10-14',
      type: type || 'Deposit Received', // 'Damage Deduction', 'Utility Deduction', 'Refund', 'Deposit Received'
      amount: Number(amount),
      details: details || 'Recorded transaction'
    });

    this.store.logAudit('Sarah Jenkins', 'DepositLedger', ledger.id, 'DEPOSIT_TRANSACTION', type, `Amount: $${amount} - ${details}`);
    localStorage.setItem(this.store.storageKey, JSON.stringify(db));
    window.dispatchEvent(new CustomEvent('nestpad_db_updated', { detail: { entityKey: 'depositLedgers', action: 'DEPOSIT_TRANSACTION', timestamp: Date.now() } }));
    this.store.directMutate('depositLedgers', 'SAVE', ledger);
  }

  // 4. Maintenance Workflow & Work Orders
  createMaintenanceRequest(unitId, tenantPersonId, issue, category, urgency, description) {
    const db = this.store.getDB();
    const reqId = 'm-' + Date.now();
    const newReq = {
      id: reqId,
      unitId,
      tenantPersonId: tenantPersonId || null,
      issue,
      category: category || 'Plumbing',
      urgency: urgency || 'MEDIUM',
      status: 'Submitted',
      dateReported: new Date().toISOString().slice(0, 10),
      description: description || ''
    };
    db.maintenanceRequests.unshift(newReq);

    // Add manager task
    const newTask = {
      id: 'task-' + Date.now(),
      type: 'Maintenance Triage',
      relatedEntityType: 'Maintenance',
      relatedEntityId: reqId,
      title: `Triage issue: "${issue}" for ${unitId}`,
      assignedUser: 'Sarah Jenkins',
      dueDate: new Date().toISOString().slice(0, 10),
      status: 'Pending'
    };
    db.tasks.unshift(newTask);

    this.store.logAudit('Sarah Jenkins', 'MaintenanceRequest', reqId, 'CREATED', 'None', 'Submitted');
    localStorage.setItem(this.store.storageKey, JSON.stringify(db));
    window.dispatchEvent(new CustomEvent('nestpad_db_updated', { detail: { entityKey: 'maintenanceRequests', action: 'MAINT_CREATED', timestamp: Date.now() } }));
    this.store.directMutate('maintenanceRequests', 'SAVE', newReq);
    this.store.directMutate('tasks', 'SAVE', newTask);
    return reqId;
  }

  updateMaintenanceStatus(requestId, newStatus, vendorId = null, cost = null, rating = null) {
    const db = this.store.getDB();
    const req = db.maintenanceRequests.find(m => m.id === requestId);
    if (!req) return;

    const oldStatus = req.status;
    req.status = newStatus;
    let createdWo = null;

    if (newStatus === 'In Progress' && vendorId) {
      let wo = db.workOrders.find(w => w.requestId === requestId);
      if (wo) {
        wo.vendorId = vendorId;
        wo.status = 'In Progress';
        createdWo = wo;
      } else {
        wo = {
          id: 'wo-' + Date.now(),
          requestId,
          vendorId,
          quoteAmount: cost || 110,
          approvedByOwner: true,
          scheduledDate: '2026-10-16 09:00',
          status: 'In Progress'
        };
        db.workOrders.push(wo);
        createdWo = wo;
      }
      
      // Auto-schedule appointment on calendar
      const v = db.vendors.find(x => x.id === vendorId);
      db.calendarEvents = db.calendarEvents || [];
      const calEv = {
        id: 'ce-' + Date.now(),
        date: '2026-10-16',
        title: `Work Order: ${v ? v.companyName : 'Contractor'} (${req.issue})`,
        time: '9:00 AM',
        type: 'Maintenance',
        notes: `Vendor appointment for ${req.issue}`
      };
      db.calendarEvents.push(calEv);
      this.store.directMutate('calendarEvents', 'SAVE', calEv);

      // Operational task
      const opTask = {
        id: 'task-' + Date.now(),
        type: 'Maintenance',
        relatedEntityType: 'Maintenance',
        relatedEntityId: requestId,
        title: `Oversee vendor completion for ${req.issue}`,
        assignedUser: 'Sarah Jenkins',
        dueDate: '2026-10-16',
        status: 'Pending'
      };
      db.tasks.unshift(opTask);
      this.store.directMutate('tasks', 'SAVE', opTask);
    }

    if (newStatus === 'Resolved') {
      if (rating) req.satisfactionRating = Number(rating);
      if (cost) req.repairCost = Number(cost);
      req.dateResolved = '2026-10-14';
      // Mark linked tasks completed
      db.tasks.filter(t => t.relatedEntityId === requestId).forEach(t => {
        t.status = 'Completed';
        this.store.directMutate('tasks', 'SAVE', t);
      });
    }

    this.store.logAudit('Sarah Jenkins', 'MaintenanceRequest', requestId, 'STATUS_CHANGE', oldStatus, newStatus);
    localStorage.setItem(this.store.storageKey, JSON.stringify(db));
    window.dispatchEvent(new CustomEvent('nestpad_db_updated', { detail: { entityKey: 'maintenanceRequests', action: 'MAINT_UPDATED', timestamp: Date.now() } }));
    this.store.directMutate('maintenanceRequests', 'SAVE', req);
    if (createdWo) this.store.directMutate('workOrders', 'SAVE', createdWo);
  }

  // 5. Tenancy Move-Out & Offboarding Workflow
  terminateTenancy(tenancyId, reason = 'Normal Move-Out') {
    const db = this.store.getDB();
    const tenancy = db.tenancies.find(t => t.id === tenancyId);
    if (!tenancy) return;

    tenancy.status = 'Closed';
    const unit = db.units.find(u => u.id === tenancy.unitId);
    if (unit) {
      unit.status = 'Vacant';
      this.store.directMutate('units', 'SAVE', unit);
    }

    // Create move-out inspection task automatically
    const inspTask = {
      id: 'task-' + Date.now(),
      type: 'Move-Out Inspection',
      relatedEntityType: 'Tenancy',
      relatedEntityId: tenancyId,
      title: `Perform Move-Out Condition Checklist & Key Return (${unit ? unit.unitNumber : ''})`,
      assignedUser: 'Sarah Jenkins',
      dueDate: '2026-10-20',
      status: 'Pending'
    };
    db.tasks.unshift(inspTask);

    this.store.logAudit('Sarah Jenkins', 'Tenancy', tenancyId, 'MOVE_OUT_INITIATED', 'Active', 'Closed');
    localStorage.setItem(this.store.storageKey, JSON.stringify(db));
    window.dispatchEvent(new CustomEvent('nestpad_db_updated', { detail: { entityKey: 'tenancies', action: 'MOVE_OUT', timestamp: Date.now() } }));
    this.store.directMutate('tenancies', 'SAVE', tenancy);
    this.store.directMutate('tasks', 'SAVE', inspTask);
  }

  renewTenancy(tenancyId, newEndDate, newRentAmount) {
    const db = this.store.getDB();
    const tenancy = db.tenancies.find(t => t.id === tenancyId);
    if (!tenancy) return;

    const oldEnd = tenancy.endDate;
    tenancy.endDate = newEndDate || '2026-11-30';
    if (newRentAmount) tenancy.rentAmount = Number(newRentAmount);
    tenancy.status = 'Active';

    this.store.logAudit('Sarah Jenkins', 'Tenancy', tenancyId, 'RENEWED', oldEnd, tenancy.endDate);
    localStorage.setItem(this.store.storageKey, JSON.stringify(db));
    window.dispatchEvent(new CustomEvent('nestpad_db_updated', { detail: { entityKey: 'tenancies', action: 'RENEWAL', timestamp: Date.now() } }));
    this.store.directMutate('tenancies', 'SAVE', tenancy);
  }

  createTenancy(unitId, personData, rentAmount, startDate, endDate, dueDay = 1, depositAmount = null) {
    const db = this.store.getDB();
    
    // Create person if new
    let personId = 'p-' + Date.now();
    const person = {
      id: personId,
      name: personData.name || 'New Tenant',
      type: 'Individual',
      icPassport: personData.icPassport || 'A' + Math.floor(1000000 + Math.random() * 9000000),
      email: personData.email || 'tenant@example.com',
      phone: personData.phone || '(555) 000-0000',
      emergencyContact: personData.emergencyContact || 'Contact on file'
    };
    db.persons.unshift(person);
    this.store.directMutate('persons', 'SAVE', person);

    // Create tenancy
    const tenancyId = 't-' + Date.now();
    const rent = Number(rentAmount) || 1800;
    const tenancy = {
      id: tenancyId,
      unitId,
      version: 'v1_2026',
      startDate: startDate || '2026-11-01',
      endDate: endDate || '2027-10-31',
      rentAmount: rent,
      dueDay: Number(dueDay) || 1,
      status: 'Active',
      stampingStatus: 'Pending Stamping',
      stampingRef: 'LHDN/NEW/' + Math.floor(1000 + Math.random() * 9000)
    };
    db.tenancies.unshift(tenancy);
    this.store.directMutate('tenancies', 'SAVE', tenancy);

    // Link tenancy party
    const tp = {
      id: 'tp-' + Date.now(),
      tenancyId,
      personId,
      role: 'Primary Tenant'
    };
    db.tenancyParties.push(tp);
    this.store.directMutate('tenancyParties', 'SAVE', tp);

    // Mark unit occupied
    const unit = db.units.find(u => u.id === unitId);
    if (unit) {
      unit.status = 'Occupied';
      unit.targetRent = rent;
      this.store.directMutate('units', 'SAVE', unit);
    }

    // Create initial deposit ledger
    const dep = Number(depositAmount) || (rent);
    const depLedger = {
      id: 'dep-' + Date.now(),
      tenancyId,
      secDepositReq: dep, secDepositRec: dep,
      utilDepositReq: 500, utilDepositRec: 500,
      keyDepositReq: 100, keyDepositRec: 100,
      heldBy: 'Property Manager Escrow',
      transactions: [{
        id: 'dt-' + Date.now(),
        date: startDate || '2026-11-01',
        type: 'Deposit Received',
        amount: dep + 600,
        details: 'Initial security, utility and key deposit logged'
      }]
    };
    db.depositLedgers.push(depLedger);
    this.store.directMutate('depositLedgers', 'SAVE', depLedger);

    // Create initial charge
    const chg = {
      id: 'chg-' + Date.now(),
      tenancyId,
      chargeType: 'Rent',
      period: 'November 2026',
      amount: rent,
      dueDate: startDate || '2026-11-01',
      status: 'Due'
    };
    db.charges.unshift(chg);
    this.store.directMutate('charges', 'SAVE', chg);

    this.store.logAudit('Sarah Jenkins', 'Tenancy', tenancyId, 'TENANCY_CREATED', 'Vacant', 'Active');
    localStorage.setItem(this.store.storageKey, JSON.stringify(db));
    window.dispatchEvent(new CustomEvent('nestpad_db_updated', { detail: { entityKey: 'tenancies', action: 'TENANCY_CREATED', timestamp: Date.now() } }));
    return tenancyId;
  }

  // 6. Buildings & Units
  addBuilding(name, address, city, postcode, managementOffice, facilities) {
    const db = this.store.getDB();
    const id = 'b-' + Date.now();
    const building = {
      id,
      name,
      address,
      city: city || 'Kuala Lumpur',
      postcode: postcode || '50000',
      managementOffice: managementOffice || 'On-site Office',
      facilities: Array.isArray(facilities) ? facilities : (facilities ? facilities.split(',').map(s=>s.trim()) : ['Security', 'Parking'])
    };
    db.buildings.push(building);
    this.store.logAudit('Sarah Jenkins', 'Building', id, 'CREATED', 'None', name);
    localStorage.setItem(this.store.storageKey, JSON.stringify(db));
    window.dispatchEvent(new CustomEvent('nestpad_db_updated', { detail: { entityKey: 'buildings', action: 'BUILDING_ADDED', timestamp: Date.now() } }));
    this.store.directMutate('buildings', 'SAVE', building);
    return id;
  }

  addUnit(buildingId, unitNumber, floor, bedrooms, bathrooms, parkingBays, targetRent, lockboxCode, electricityAcc, waterAcc) {
    const db = this.store.getDB();
    const id = 'u-' + Date.now();
    const unit = {
      id,
      buildingId: buildingId || (db.buildings[0] ? db.buildings[0].id : 'b-1'),
      unitNumber,
      floor: floor || '1st Floor',
      bedrooms: Number(bedrooms) || 2,
      bathrooms: Number(bathrooms) || 1,
      parkingBays: parkingBays || 'Spot #Unassigned',
      status: 'Vacant',
      targetRent: Number(targetRent) || 1800,
      lockboxCode: lockboxCode || '0000',
      electricityAcc: electricityAcc || ('TNB-' + Math.floor(10000000 + Math.random() * 90000000)),
      waterAcc: waterAcc || ('SYABAS-' + Math.floor(100000 + Math.random() * 900000))
    };
    db.units.push(unit);

    // Ownership link
    if (db.owners && db.owners[0]) {
      const os = {
        id: 'os-' + Date.now(),
        ownerId: db.owners[0].id,
        unitId: id,
        percent: 100,
        isPrimary: true
      };
      db.ownerships.push(os);
      this.store.directMutate('ownerships', 'SAVE', os);
    }

    this.store.logAudit('Sarah Jenkins', 'Unit', id, 'CREATED', 'None', unitNumber);
    localStorage.setItem(this.store.storageKey, JSON.stringify(db));
    window.dispatchEvent(new CustomEvent('nestpad_db_updated', { detail: { entityKey: 'units', action: 'UNIT_ADDED', timestamp: Date.now() } }));
    this.store.directMutate('units', 'SAVE', unit);
    return id;
  }

  // 7. Tasks
  toggleTask(taskId) {
    const db = this.store.getDB();
    const t = db.tasks.find(x => x.id === taskId);
    if (t) {
      const old = t.status;
      t.status = t.status === 'Completed' ? 'Pending' : 'Completed';
      this.store.logAudit('Sarah Jenkins', 'Task', taskId, 'STATUS_CHANGE', old, t.status);
      localStorage.setItem(this.store.storageKey, JSON.stringify(db));
      window.dispatchEvent(new CustomEvent('nestpad_db_updated', { detail: { entityKey: 'tasks', action: 'TASK_TOGGLE', timestamp: Date.now() } }));
      this.store.directMutate('tasks', 'SAVE', t);
    }
  }

  addTask(title, dueDate, type = 'General', relatedEntityId = null) {
    const db = this.store.getDB();
    const task = {
      id: 'task-' + Date.now(),
      type,
      relatedEntityType: type,
      relatedEntityId,
      title,
      assignedUser: 'Sarah Jenkins',
      dueDate: dueDate || new Date().toISOString().slice(0, 10),
      status: 'Pending'
    };
    db.tasks.unshift(task);
    this.store.logAudit('Sarah Jenkins', 'Task', task.id, 'CREATED', 'None', title);
    localStorage.setItem(this.store.storageKey, JSON.stringify(db));
    window.dispatchEvent(new CustomEvent('nestpad_db_updated', { detail: { entityKey: 'tasks', action: 'TASK_ADDED', timestamp: Date.now() } }));
    this.store.directMutate('tasks', 'SAVE', task);
    return task;
  }

  deleteTask(taskId) {
    this.store.deleteItem('tasks', taskId);
  }

  // 8. Documents
  addDocument(title, docType, fileSize, entityType, entityId) {
    const db = this.store.getDB();
    const docId = 'doc-' + Date.now();
    const doc = {
      id: docId,
      title,
      docType: docType || 'General File',
      fileSize: fileSize || '1.2 MB',
      confidential: false,
      uploadedAt: new Date().toISOString().slice(0, 10),
      url: '#'
    };
    db.documents.unshift(doc);

    if (entityType && entityId) {
      const dl = {
        id: 'dl-' + Date.now(),
        docId,
        entityType,
        entityId
      };
      db.documentLinks.push(dl);
      this.store.directMutate('documentLinks', 'SAVE', dl);
    }

    this.store.logAudit('Sarah Jenkins', 'Document', docId, 'UPLOADED', 'None', title);
    localStorage.setItem(this.store.storageKey, JSON.stringify(db));
    window.dispatchEvent(new CustomEvent('nestpad_db_updated', { detail: { entityKey: 'documents', action: 'DOC_ADDED', timestamp: Date.now() } }));
    this.store.directMutate('documents', 'SAVE', doc);
    return doc;
  }

  // 9. Calendar Aggregator
  addCalendarEvent(title, date, time, type, notes = '') {
    const db = this.store.getDB();
    db.calendarEvents = db.calendarEvents || [];
    const event = {
      id: 'ce-' + Date.now(),
      date,
      title,
      time: time || '10:00 AM',
      type: type || 'General',
      notes
    };
    db.calendarEvents.unshift(event);
    this.store.logAudit('Sarah Jenkins', 'CalendarEvent', event.id, 'CREATED', 'None', title);
    localStorage.setItem(this.store.storageKey, JSON.stringify(db));
    window.dispatchEvent(new CustomEvent('nestpad_db_updated', { detail: { entityKey: 'calendarEvents', action: 'EVENT_ADDED', timestamp: Date.now() } }));
    this.store.directMutate('calendarEvents', 'SAVE', event);
    return event;
  }

  getAggregatedCalendarEvents() {
    const events = [];
    const db = this.store.getDB();

    // Rent Due Dates
    (db.charges || []).forEach(c => {
      if (c.chargeType === 'Rent') {
        const t = (db.tenancies || []).find(x => x.id === c.tenancyId);
        const u = t ? (db.units || []).find(x => x.id === t.unitId) : null;
        events.push({
          id: 'chg-' + c.id,
          date: c.dueDate,
          title: `Rent Due: ${u ? u.unitNumber : 'Unit'} ($${c.amount})`,
          time: 'Due EOD',
          type: 'Rent',
          chipClass: 'chip-rent',
          status: c.status
        });
      }
    });

    // Lease Expirations
    (db.tenancies || []).forEach(t => {
      if (t.status !== 'Closed') {
        const u = (db.units || []).find(x => x.id === t.unitId);
        events.push({
          id: 'exp-' + t.id,
          date: t.endDate,
          title: `Lease Expiration: ${u ? u.unitNumber : 'Unit'}`,
          time: '12:00 PM',
          type: 'Lease Expiry',
          chipClass: 'chip-lease',
          status: t.status
        });
      }
    });

    // Maintenance Scheduled Appointments
    (db.workOrders || []).forEach(wo => {
      const m = (db.maintenanceRequests || []).find(x => x.id === wo.requestId);
      const v = (db.vendors || []).find(x => x.id === wo.vendorId);
      const parts = (wo.scheduledDate || '2026-10-15 09:00').split(' ');
      events.push({
        id: 'wo-' + wo.id,
        date: parts[0],
        title: `Vendor: ${v ? v.companyName : 'Handyman'} (${m ? m.issue : 'Repair'})`,
        time: parts[1] || '09:00 AM',
        type: 'Maintenance',
        chipClass: 'chip-maint',
        status: wo.status
      });
    });

    // Inspections
    (db.inspections || []).forEach(insp => {
      const u = (db.units || []).find(x => x.id === insp.unitId);
      events.push({
        id: 'insp-' + insp.id,
        date: insp.date,
        title: `${insp.type}: ${u ? u.unitNumber : 'Unit'}`,
        time: '10:00 AM',
        type: 'Inspection',
        chipClass: 'chip-inspect',
        status: 'Completed'
      });
    });

    // Custom Calendar Events
    (db.calendarEvents || []).forEach(ce => {
      events.push({
        id: ce.id,
        date: ce.date,
        title: ce.title,
        time: ce.time || 'All Day',
        type: ce.type || 'Custom',
        chipClass: 'chip-custom',
        status: 'Scheduled'
      });
    });

    return events;
  }
}

const logic = new BusinessLogicLayer(typeof dbStore !== 'undefined' ? dbStore : (typeof window !== 'undefined' ? window.dbStore : (typeof global !== 'undefined' ? global.dbStore : null)));
if (typeof window !== 'undefined') window.logic = logic;
if (typeof global !== 'undefined') global.logic = logic;
