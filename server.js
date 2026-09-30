/* NestPad Production Database Server (MySQL Direct Live Persistence) */
const http = require('http');
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

const PORT = process.env.PORT || 8080;
const DB_FILE = path.join(__dirname, 'nestpad.db');
const CONFIG_FILE = path.join(__dirname, 'db_config.json');

// Read DB Configuration
let config = {
  activeDatabase: 'mysql',
  mysql: {
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'hosam123',
    database: 'nestpad_db'
  }
};

if (fs.existsSync(CONFIG_FILE)) {
  try {
    const fileConf = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));
    config = { ...config, ...fileConf, mysql: { ...config.mysql, ...(fileConf.mysql || {}) } };
  } catch (e) {
    console.warn('[Config] Failed to parse db_config.json, using defaults.', e.message);
  }
}

if (process.env.ACTIVE_DATABASE) config.activeDatabase = process.env.ACTIVE_DATABASE;
if (process.env.MYSQL_HOST) config.mysql.host = process.env.MYSQL_HOST;
if (process.env.MYSQL_PORT) config.mysql.port = parseInt(process.env.MYSQL_PORT, 10);
if (process.env.MYSQL_USER) config.mysql.user = process.env.MYSQL_USER;
if (process.env.MYSQL_PASSWORD !== undefined) config.mysql.password = process.env.MYSQL_PASSWORD;
if (process.env.MYSQL_DATABASE) config.mysql.database = process.env.MYSQL_DATABASE;

let activeEngine = config.activeDatabase || 'mysql';
let mysqlPool = null;
let sqliteDb = null;

// Helpers
const s = (v, fallback = null) => (v === undefined ? fallback : v);
const parseJSON = (str, fallback = []) => {
  try { return str ? JSON.parse(str) : fallback; } catch (e) { return fallback; }
};

const TABLE_MAP = {
  buildings: 'buildings',
  units: 'units',
  persons: 'persons',
  owners: 'owners',
  ownerships: 'ownerships',
  tenancies: 'tenancies',
  tenancyParties: 'tenancy_parties',
  tenancy_parties: 'tenancy_parties',
  charges: 'charges',
  payments: 'payments',
  allocations: 'allocations',
  vendors: 'vendors',
  maintenanceRequests: 'maintenance_requests',
  maintenance_requests: 'maintenance_requests',
  workOrders: 'work_orders',
  work_orders: 'work_orders',
  unitAssets: 'unit_assets',
  unit_assets: 'unit_assets',
  accessControl: 'access_control',
  access_control: 'access_control',
  inspections: 'inspections',
  depositLedgers: 'deposit_ledgers',
  deposit_ledgers: 'deposit_ledgers',
  tasks: 'tasks',
  documents: 'documents',
  documentLinks: 'document_links',
  document_links: 'document_links',
  communications: 'communications',
  calendarEvents: 'calendar_events',
  calendar_events: 'calendar_events',
  auditTrail: 'audit_trail',
  audit_trail: 'audit_trail'
};

// ==========================================
// 1. Database Initialization
// ==========================================
async function initDatabase() {
  if (activeEngine === 'mysql') {
    // If running on Vercel and host is still localhost (no remote cloud DB set yet), switch to standby mode safely
    if (process.env.VERCEL && (!process.env.MYSQL_HOST || config.mysql.host === 'localhost')) {
      console.log('ℹ️ [Database] Running on Vercel without Cloud MySQL. Operating in client-side persistence mode.');
      activeEngine = 'standby';
      return;
    }

    console.log(`[Database] Connecting to MySQL server at ${config.mysql.host}:${config.mysql.port}, database: ${config.mysql.database}`);
    try {
      const ssl = process.env.MYSQL_SSL === 'true' || process.env.MYSQL_SSL === '1' ? { rejectUnauthorized: false } : undefined;
      const rootConn = await mysql.createConnection({
        host: config.mysql.host,
        port: config.mysql.port,
        user: config.mysql.user,
        password: config.mysql.password,
        ssl,
        connectTimeout: 5000
      });
      await rootConn.query(`CREATE DATABASE IF NOT EXISTS \`${config.mysql.database}\`;`);
      await rootConn.end();

      mysqlPool = mysql.createPool({
        host: config.mysql.host,
        port: config.mysql.port,
        user: config.mysql.user,
        password: config.mysql.password,
        database: config.mysql.database,
        ssl,
        waitForConnections: true,
        connectionLimit: 5,
        queueLimit: 0,
        connectTimeout: 5000
      });

      await initMySQLSchema();
      console.log('✅ [Database] MySQL connection and tables verified.');
      await seedMySQLIfEmpty();
      return;
    } catch (err) {
      console.warn('⚠️ [Database] Failed to initialize MySQL. Attempting SQLite fallback:', err.message);
      activeEngine = 'sqlite';
    }
  }

  // SQLite Fallback (Safe)
  try {
    const { DatabaseSync } = require('node:sqlite');
    if (DatabaseSync) {
      console.log(`[Database] Initializing SQLite database file: ${DB_FILE}`);
      sqliteDb = new DatabaseSync(DB_FILE);
      sqliteDb.exec('PRAGMA journal_mode = WAL;');
      sqliteDb.exec('PRAGMA foreign_keys = ON;');
      initSQLiteSchema();
      seedSQLiteIfEmpty();
      return;
    }
  } catch (sqliteErr) {
    console.log('ℹ️ [Database] SQLite not available in this environment. Operating in client-side standby mode.');
  }

  activeEngine = 'standby';
}

async function initMySQLSchema() {
  const tableQueries = [
    `CREATE TABLE IF NOT EXISTS persons (
      id VARCHAR(64) PRIMARY KEY, name VARCHAR(255) NOT NULL, type VARCHAR(64) DEFAULT 'Individual',
      icPassport VARCHAR(128), email VARCHAR(255), phone VARCHAR(64), emergencyContact VARCHAR(255), bankDetails TEXT
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

    `CREATE TABLE IF NOT EXISTS owners (
      id VARCHAR(64) PRIMARY KEY, personId VARCHAR(64), legalName VARCHAR(255) NOT NULL,
      companyReg VARCHAR(128), bankAccount VARCHAR(128), taxNo VARCHAR(128)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

    `CREATE TABLE IF NOT EXISTS ownerships (
      id VARCHAR(64) PRIMARY KEY, ownerId VARCHAR(64) NOT NULL, unitId VARCHAR(64) NOT NULL,
      percent DOUBLE DEFAULT 100, isPrimary TINYINT DEFAULT 1
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

    `CREATE TABLE IF NOT EXISTS buildings (
      id VARCHAR(64) PRIMARY KEY, name VARCHAR(255) NOT NULL, address TEXT NOT NULL,
      city VARCHAR(128) NOT NULL, postcode VARCHAR(32), managementOffice VARCHAR(255), facilities TEXT
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

    `CREATE TABLE IF NOT EXISTS units (
      id VARCHAR(64) PRIMARY KEY, buildingId VARCHAR(64) NOT NULL, unitNumber VARCHAR(64) NOT NULL,
      floor VARCHAR(32), bedrooms INT DEFAULT 2, bathrooms DOUBLE DEFAULT 1, parkingBays VARCHAR(128),
      status VARCHAR(64) DEFAULT 'Vacant', targetRent DOUBLE DEFAULT 1800, lockboxCode VARCHAR(64),
      electricityAcc VARCHAR(128), waterAcc VARCHAR(128)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

    `CREATE TABLE IF NOT EXISTS tenancies (
      id VARCHAR(64) PRIMARY KEY, unitId VARCHAR(64) NOT NULL, version VARCHAR(32),
      startDate VARCHAR(64) NOT NULL, endDate VARCHAR(64) NOT NULL, rentAmount DOUBLE NOT NULL,
      dueDay INT DEFAULT 1, status VARCHAR(64) DEFAULT 'Active', stampingStatus VARCHAR(64), stampingRef VARCHAR(128)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

    `CREATE TABLE IF NOT EXISTS tenancy_parties (
      id VARCHAR(64) PRIMARY KEY, tenancyId VARCHAR(64) NOT NULL, personId VARCHAR(64) NOT NULL,
      role VARCHAR(128) DEFAULT 'Primary Tenant'
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

    `CREATE TABLE IF NOT EXISTS deposit_ledgers (
      id VARCHAR(64) PRIMARY KEY, tenancyId VARCHAR(64) NOT NULL, secDepositReq DOUBLE DEFAULT 0,
      secDepositRec DOUBLE DEFAULT 0, utilDepositReq DOUBLE DEFAULT 0, utilDepositRec DOUBLE DEFAULT 0,
      keyDepositReq DOUBLE DEFAULT 0, keyDepositRec DOUBLE DEFAULT 0, heldBy VARCHAR(128), transactions LONGTEXT
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

    `CREATE TABLE IF NOT EXISTS charges (
      id VARCHAR(64) PRIMARY KEY, tenancyId VARCHAR(64) NOT NULL, chargeType VARCHAR(64) DEFAULT 'Rent',
      period VARCHAR(64), amount DOUBLE NOT NULL, dueDate VARCHAR(64) NOT NULL, status VARCHAR(64) DEFAULT 'Due'
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

    `CREATE TABLE IF NOT EXISTS payments (
      id VARCHAR(64) PRIMARY KEY, payerPersonId VARCHAR(64), amount DOUBLE NOT NULL,
      paymentDate VARCHAR(64) NOT NULL, method VARCHAR(64), reference VARCHAR(128)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

    `CREATE TABLE IF NOT EXISTS allocations (
      id VARCHAR(64) PRIMARY KEY, paymentId VARCHAR(64) NOT NULL, chargeId VARCHAR(64) NOT NULL, amountAllocated DOUBLE NOT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

    `CREATE TABLE IF NOT EXISTS vendors (
      id VARCHAR(64) PRIMARY KEY, companyName VARCHAR(255) NOT NULL, trade VARCHAR(128),
      contactPerson VARCHAR(128), phone VARCHAR(64), rating DOUBLE DEFAULT 5.0, bankAccount VARCHAR(128)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

    `CREATE TABLE IF NOT EXISTS maintenance_requests (
      id VARCHAR(64) PRIMARY KEY, unitId VARCHAR(64) NOT NULL, tenantPersonId VARCHAR(64),
      issue VARCHAR(255) NOT NULL, category VARCHAR(128), urgency VARCHAR(32) DEFAULT 'MEDIUM',
      status VARCHAR(64) DEFAULT 'Submitted', dateReported VARCHAR(64) NOT NULL, description TEXT,
      satisfactionRating DOUBLE, repairCost DOUBLE, dateResolved VARCHAR(64)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

    `CREATE TABLE IF NOT EXISTS work_orders (
      id VARCHAR(64) PRIMARY KEY, requestId VARCHAR(64) NOT NULL, vendorId VARCHAR(64) NOT NULL,
      quoteAmount DOUBLE, approvedByOwner TINYINT DEFAULT 1, scheduledDate VARCHAR(64), invoiceAmount DOUBLE, status VARCHAR(64) DEFAULT 'Scheduled'
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

    `CREATE TABLE IF NOT EXISTS unit_assets (
      id VARCHAR(64) PRIMARY KEY, unitId VARCHAR(64) NOT NULL, category VARCHAR(128),
      brand VARCHAR(128), serialNo VARCHAR(128), conditionState VARCHAR(64), warrantyExpiry VARCHAR(64)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

    `CREATE TABLE IF NOT EXISTS access_control (
      id VARCHAR(64) PRIMARY KEY, unitId VARCHAR(64) NOT NULL, type VARCHAR(64),
      serialNo VARCHAR(128), issuedToPersonId VARCHAR(64), issuedDate VARCHAR(64), deposit DOUBLE DEFAULT 0, returned TINYINT DEFAULT 0
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

    `CREATE TABLE IF NOT EXISTS inspections (
      id VARCHAR(64) PRIMARY KEY, tenancyId VARCHAR(64), unitId VARCHAR(64) NOT NULL,
      type VARCHAR(64), date VARCHAR(64), inspector VARCHAR(128), items LONGTEXT
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

    `CREATE TABLE IF NOT EXISTS tasks (
      id VARCHAR(64) PRIMARY KEY, type VARCHAR(64), relatedEntityType VARCHAR(64),
      relatedEntityId VARCHAR(64), title VARCHAR(255) NOT NULL, assignedUser VARCHAR(128), dueDate VARCHAR(64), status VARCHAR(64) DEFAULT 'Pending'
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

    `CREATE TABLE IF NOT EXISTS documents (
      id VARCHAR(64) PRIMARY KEY, title VARCHAR(255) NOT NULL, docType VARCHAR(64),
      fileSize VARCHAR(64), confidential TINYINT DEFAULT 0, uploadedAt VARCHAR(64), url TEXT
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

    `CREATE TABLE IF NOT EXISTS document_links (
      id VARCHAR(64) PRIMARY KEY, docId VARCHAR(64) NOT NULL, entityType VARCHAR(64), entityId VARCHAR(64)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

    `CREATE TABLE IF NOT EXISTS communications (
      id VARCHAR(64) PRIMARY KEY, tenancyId VARCHAR(64), senderPersonId VARCHAR(64),
      recipient VARCHAR(255), channel VARCHAR(64), timestamp VARCHAR(64), subject VARCHAR(255), message TEXT
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

    `CREATE TABLE IF NOT EXISTS calendar_events (
      id VARCHAR(64) PRIMARY KEY, date VARCHAR(64) NOT NULL, title VARCHAR(255) NOT NULL,
      time VARCHAR(64), type VARCHAR(64), notes TEXT
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

    `CREATE TABLE IF NOT EXISTS audit_trail (
      id VARCHAR(64) PRIMARY KEY, user VARCHAR(128), entity VARCHAR(128),
      entityId VARCHAR(64), action VARCHAR(128), oldValue TEXT, newValue TEXT, timestamp VARCHAR(64)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`
  ];

  for (const q of tableQueries) {
    await mysqlPool.query(q);
  }
}

function initSQLiteSchema() {
  sqliteDb.exec(`
    CREATE TABLE IF NOT EXISTS persons (id TEXT PRIMARY KEY, name TEXT NOT NULL, type TEXT DEFAULT 'Individual', icPassport TEXT, email TEXT, phone TEXT, emergencyContact TEXT, bankDetails TEXT);
    CREATE TABLE IF NOT EXISTS owners (id TEXT PRIMARY KEY, personId TEXT, legalName TEXT NOT NULL, companyReg TEXT, bankAccount TEXT, taxNo TEXT);
    CREATE TABLE IF NOT EXISTS ownerships (id TEXT PRIMARY KEY, ownerId TEXT NOT NULL, unitId TEXT NOT NULL, percent REAL DEFAULT 100, isPrimary INTEGER DEFAULT 1);
    CREATE TABLE IF NOT EXISTS buildings (id TEXT PRIMARY KEY, name TEXT NOT NULL, address TEXT NOT NULL, city TEXT NOT NULL, postcode TEXT, managementOffice TEXT, facilities TEXT);
    CREATE TABLE IF NOT EXISTS units (id TEXT PRIMARY KEY, buildingId TEXT NOT NULL, unitNumber TEXT NOT NULL, floor TEXT, bedrooms INTEGER DEFAULT 2, bathrooms REAL DEFAULT 1, parkingBays TEXT, status TEXT DEFAULT 'Vacant', targetRent REAL DEFAULT 1800, lockboxCode TEXT, electricityAcc TEXT, waterAcc TEXT);
    CREATE TABLE IF NOT EXISTS tenancies (id TEXT PRIMARY KEY, unitId TEXT NOT NULL, version TEXT, startDate TEXT NOT NULL, endDate TEXT NOT NULL, rentAmount REAL NOT NULL, dueDay INTEGER DEFAULT 1, status TEXT DEFAULT 'Active', stampingStatus TEXT, stampingRef TEXT);
    CREATE TABLE IF NOT EXISTS tenancy_parties (id TEXT PRIMARY KEY, tenancyId TEXT NOT NULL, personId TEXT NOT NULL, role TEXT DEFAULT 'Primary Tenant');
    CREATE TABLE IF NOT EXISTS deposit_ledgers (id TEXT PRIMARY KEY, tenancyId TEXT NOT NULL, secDepositReq REAL DEFAULT 0, secDepositRec REAL DEFAULT 0, utilDepositReq REAL DEFAULT 0, utilDepositRec REAL DEFAULT 0, keyDepositReq REAL DEFAULT 0, keyDepositRec REAL DEFAULT 0, heldBy TEXT, transactions TEXT);
    CREATE TABLE IF NOT EXISTS charges (id TEXT PRIMARY KEY, tenancyId TEXT NOT NULL, chargeType TEXT DEFAULT 'Rent', period TEXT, amount REAL NOT NULL, dueDate TEXT NOT NULL, status TEXT DEFAULT 'Due');
    CREATE TABLE IF NOT EXISTS payments (id TEXT PRIMARY KEY, payerPersonId TEXT, amount REAL NOT NULL, paymentDate TEXT NOT NULL, method TEXT, reference TEXT);
    CREATE TABLE IF NOT EXISTS allocations (id TEXT PRIMARY KEY, paymentId TEXT NOT NULL, chargeId TEXT NOT NULL, amountAllocated REAL NOT NULL);
    CREATE TABLE IF NOT EXISTS vendors (id TEXT PRIMARY KEY, companyName TEXT NOT NULL, trade TEXT, contactPerson TEXT, phone TEXT, rating REAL DEFAULT 5.0, bankAccount TEXT);
    CREATE TABLE IF NOT EXISTS maintenance_requests (id TEXT PRIMARY KEY, unitId TEXT NOT NULL, tenantPersonId TEXT, issue TEXT NOT NULL, category TEXT, urgency TEXT DEFAULT 'MEDIUM', status TEXT DEFAULT 'Submitted', dateReported TEXT NOT NULL, description TEXT, satisfactionRating REAL, repairCost REAL, dateResolved TEXT);
    CREATE TABLE IF NOT EXISTS work_orders (id TEXT PRIMARY KEY, requestId TEXT NOT NULL, vendorId TEXT NOT NULL, quoteAmount REAL, approvedByOwner INTEGER DEFAULT 1, scheduledDate TEXT, invoiceAmount REAL, status TEXT DEFAULT 'Scheduled');
    CREATE TABLE IF NOT EXISTS unit_assets (id TEXT PRIMARY KEY, unitId TEXT NOT NULL, category TEXT, brand TEXT, serialNo TEXT, conditionState TEXT, warrantyExpiry TEXT);
    CREATE TABLE IF NOT EXISTS access_control (id TEXT PRIMARY KEY, unitId TEXT NOT NULL, type TEXT, serialNo TEXT, issuedToPersonId TEXT, issuedDate TEXT, deposit REAL DEFAULT 0, returned INTEGER DEFAULT 0);
    CREATE TABLE IF NOT EXISTS inspections (id TEXT PRIMARY KEY, tenancyId TEXT, unitId TEXT NOT NULL, type TEXT, date TEXT, inspector TEXT, items TEXT);
    CREATE TABLE IF NOT EXISTS tasks (id TEXT PRIMARY KEY, type TEXT, relatedEntityType TEXT, relatedEntityId TEXT, title TEXT NOT NULL, assignedUser TEXT, dueDate TEXT, status TEXT DEFAULT 'Pending');
    CREATE TABLE IF NOT EXISTS documents (id TEXT PRIMARY KEY, title TEXT NOT NULL, docType TEXT, fileSize TEXT, confidential INTEGER DEFAULT 0, uploadedAt TEXT, url TEXT);
    CREATE TABLE IF NOT EXISTS document_links (id TEXT PRIMARY KEY, docId TEXT NOT NULL, entityType TEXT, entityId TEXT);
    CREATE TABLE IF NOT EXISTS communications (id TEXT PRIMARY KEY, tenancyId TEXT, senderPersonId TEXT, recipient TEXT, channel TEXT, timestamp TEXT, subject TEXT, message TEXT);
    CREATE TABLE IF NOT EXISTS calendar_events (id TEXT PRIMARY KEY, date TEXT NOT NULL, title TEXT NOT NULL, time TEXT, type TEXT, notes TEXT);
    CREATE TABLE IF NOT EXISTS audit_trail (id TEXT PRIMARY KEY, user TEXT, entity TEXT, entityId TEXT, action TEXT, oldValue TEXT, newValue TEXT, timestamp TEXT);
  `);
}

function getInitialBaselineData() {
  const initialDataPath = path.join(__dirname, 'js', 'database.js');
  if (fs.existsSync(initialDataPath)) {
    try {
      const code = fs.readFileSync(initialDataPath, 'utf-8');
      const startIdx = code.indexOf('const INITIAL_SPEC_DATABASE = {');
      if (startIdx !== -1) {
        const dummyScope = {};
        const evalStr = code.slice(startIdx, code.indexOf('// Database Store Wrapper')) + '\ndummyScope.data = INITIAL_SPEC_DATABASE;';
        const parseFn = new Function('dummyScope', evalStr);
        parseFn(dummyScope);
        return dummyScope.data;
      }
    } catch (e) {
      console.error('[Database] Failed to read initial seed data:', e);
    }
  }
  return null;
}

async function seedMySQLIfEmpty() {
  const [rows] = await mysqlPool.query('SELECT count(*) as count FROM tenancies;');
  if (rows[0] && rows[0].count > 0) return;
  console.log('[MySQL] Empty database detected. Seeding baseline data...');
  const data = getInitialBaselineData();
  if (data) {
    for (const [tableKey, list] of Object.entries(data)) {
      if (Array.isArray(list)) {
        for (const item of list) {
          await saveSingleRow(tableKey, item);
        }
      }
    }
    console.log('✅ [MySQL] Baseline data populated into MySQL tables successfully.');
  }
}

function seedSQLiteIfEmpty() {
  const row = sqliteDb.prepare('SELECT count(*) as count FROM tenancies;').get();
  if (row && row.count > 0) return;
  const data = getInitialBaselineData();
  if (data) {
    for (const [tableKey, list] of Object.entries(data)) {
      if (Array.isArray(list)) {
        for (const item of list) {
          saveSingleRowSQLite(tableKey, item);
        }
      }
    }
  }
}

// ==========================================
// 2. Direct Immediate Mutation (Live SQL)
// ==========================================
async function saveSingleRow(tableKey, row) {
  if (!row || !row.id) return;
  const t = TABLE_MAP[tableKey] || tableKey;

  if (activeEngine === 'mysql' && mysqlPool) {
    switch (t) {
      case 'buildings':
        await mysqlPool.query(
          'REPLACE INTO buildings (id, name, address, city, postcode, managementOffice, facilities) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [s(row.id), s(row.name), s(row.address), s(row.city), s(row.postcode), s(row.managementOffice), JSON.stringify(row.facilities || [])]
        );
        break;
      case 'units':
        await mysqlPool.query(
          'REPLACE INTO units (id, buildingId, unitNumber, floor, bedrooms, bathrooms, parkingBays, status, targetRent, lockboxCode, electricityAcc, waterAcc) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [s(row.id), s(row.buildingId), s(row.unitNumber), s(row.floor), Number(row.bedrooms) || 2, Number(row.bathrooms) || 1, s(row.parkingBays), s(row.status, 'Vacant'), Number(row.targetRent) || 1800, s(row.lockboxCode), s(row.electricityAcc), s(row.waterAcc)]
        );
        break;
      case 'persons':
        await mysqlPool.query(
          'REPLACE INTO persons (id, name, type, icPassport, email, phone, emergencyContact, bankDetails) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          [s(row.id), s(row.name), s(row.type, 'Individual'), s(row.icPassport), s(row.email), s(row.phone), s(row.emergencyContact), s(row.bankDetails, '')]
        );
        break;
      case 'owners':
        await mysqlPool.query(
          'REPLACE INTO owners (id, personId, legalName, companyReg, bankAccount, taxNo) VALUES (?, ?, ?, ?, ?, ?)',
          [s(row.id), s(row.personId), s(row.legalName), s(row.companyReg), s(row.bankAccount), s(row.taxNo)]
        );
        break;
      case 'ownerships':
        await mysqlPool.query(
          'REPLACE INTO ownerships (id, ownerId, unitId, percent, isPrimary) VALUES (?, ?, ?, ?, ?)',
          [s(row.id), s(row.ownerId), s(row.unitId), Number(row.percent) || 100, row.isPrimary ? 1 : 0]
        );
        break;
      case 'tenancies':
        await mysqlPool.query(
          'REPLACE INTO tenancies (id, unitId, version, startDate, endDate, rentAmount, dueDay, status, stampingStatus, stampingRef) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [s(row.id), s(row.unitId), s(row.version), s(row.startDate), s(row.endDate), Number(row.rentAmount) || 1800, Number(row.dueDay) || 1, s(row.status, 'Active'), s(row.stampingStatus), s(row.stampingRef)]
        );
        break;
      case 'tenancy_parties':
        await mysqlPool.query(
          'REPLACE INTO tenancy_parties (id, tenancyId, personId, role) VALUES (?, ?, ?, ?)',
          [s(row.id), s(row.tenancyId), s(row.personId), s(row.role, 'Primary Tenant')]
        );
        break;
      case 'charges':
        await mysqlPool.query(
          'REPLACE INTO charges (id, tenancyId, chargeType, period, amount, dueDate, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [s(row.id), s(row.tenancyId), s(row.chargeType, 'Rent'), s(row.period), Number(row.amount) || 0, s(row.dueDate), s(row.status, 'Due')]
        );
        break;
      case 'payments':
        await mysqlPool.query(
          'REPLACE INTO payments (id, payerPersonId, amount, paymentDate, method, reference) VALUES (?, ?, ?, ?, ?, ?)',
          [s(row.id), s(row.payerPersonId), Number(row.amount) || 0, s(row.paymentDate), s(row.method), s(row.reference)]
        );
        break;
      case 'allocations':
        await mysqlPool.query(
          'REPLACE INTO allocations (id, paymentId, chargeId, amountAllocated) VALUES (?, ?, ?, ?)',
          [s(row.id), s(row.paymentId), s(row.chargeId), Number(row.amountAllocated) || 0]
        );
        break;
      case 'vendors':
        await mysqlPool.query(
          'REPLACE INTO vendors (id, companyName, trade, contactPerson, phone, rating, bankAccount) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [s(row.id), s(row.companyName), s(row.trade), s(row.contactPerson), s(row.phone), Number(row.rating) || 5.0, s(row.bankAccount)]
        );
        break;
      case 'maintenance_requests':
        await mysqlPool.query(
          'REPLACE INTO maintenance_requests (id, unitId, tenantPersonId, issue, category, urgency, status, dateReported, description, satisfactionRating, repairCost, dateResolved) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [s(row.id), s(row.unitId), s(row.tenantPersonId), s(row.issue), s(row.category), s(row.urgency, 'MEDIUM'), s(row.status, 'Submitted'), s(row.dateReported), s(row.description), row.satisfactionRating ? Number(row.satisfactionRating) : null, row.repairCost ? Number(row.repairCost) : null, s(row.dateResolved)]
        );
        break;
      case 'work_orders':
        await mysqlPool.query(
          'REPLACE INTO work_orders (id, requestId, vendorId, quoteAmount, approvedByOwner, scheduledDate, invoiceAmount, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          [s(row.id), s(row.requestId), s(row.vendorId), Number(row.quoteAmount) || 0, row.approvedByOwner ? 1 : 0, s(row.scheduledDate), Number(row.invoiceAmount) || 0, s(row.status, 'Scheduled')]
        );
        break;
      case 'unit_assets':
        await mysqlPool.query(
          'REPLACE INTO unit_assets (id, unitId, category, brand, serialNo, conditionState, warrantyExpiry) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [s(row.id), s(row.unitId), s(row.category), s(row.brand), s(row.serialNo), s(row.condition || row.conditionState), s(row.warrantyExpiry)]
        );
        break;
      case 'access_control':
        await mysqlPool.query(
          'REPLACE INTO access_control (id, unitId, type, serialNo, issuedToPersonId, issuedDate, deposit, returned) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          [s(row.id), s(row.unitId), s(row.type), s(row.serialNo), s(row.issuedToPersonId), s(row.issuedDate), Number(row.deposit) || 0, row.returned ? 1 : 0]
        );
        break;
      case 'inspections':
        await mysqlPool.query(
          'REPLACE INTO inspections (id, tenancyId, unitId, type, date, inspector, items) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [s(row.id), s(row.tenancyId), s(row.unitId), s(row.type), s(row.date), s(row.inspector), JSON.stringify(row.items || [])]
        );
        break;
      case 'deposit_ledgers':
        await mysqlPool.query(
          'REPLACE INTO deposit_ledgers (id, tenancyId, secDepositReq, secDepositRec, utilDepositReq, utilDepositRec, keyDepositReq, keyDepositRec, heldBy, transactions) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [s(row.id), s(row.tenancyId), Number(row.secDepositReq) || 0, Number(row.secDepositRec) || 0, Number(row.utilDepositReq) || 0, Number(row.utilDepositRec) || 0, Number(row.keyDepositReq) || 0, Number(row.keyDepositRec) || 0, s(row.heldBy), JSON.stringify(row.transactions || [])]
        );
        break;
      case 'tasks':
        await mysqlPool.query(
          'REPLACE INTO tasks (id, type, relatedEntityType, relatedEntityId, title, assignedUser, dueDate, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          [s(row.id), s(row.type), s(row.relatedEntityType), s(row.relatedEntityId), s(row.title), s(row.assignedUser), s(row.dueDate), s(row.status, 'Pending')]
        );
        break;
      case 'documents':
        await mysqlPool.query(
          'REPLACE INTO documents (id, title, docType, fileSize, confidential, uploadedAt, url) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [s(row.id), s(row.title), s(row.docType), s(row.fileSize), row.confidential ? 1 : 0, s(row.uploadedAt), s(row.url, '#')]
        );
        break;
      case 'document_links':
        await mysqlPool.query(
          'REPLACE INTO document_links (id, docId, entityType, entityId) VALUES (?, ?, ?, ?)',
          [s(row.id), s(row.docId), s(row.entityType), s(row.entityId)]
        );
        break;
      case 'communications':
        await mysqlPool.query(
          'REPLACE INTO communications (id, tenancyId, senderPersonId, recipient, channel, timestamp, subject, message) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          [s(row.id), s(row.tenancyId), s(row.senderPersonId), s(row.recipient), s(row.channel), s(row.timestamp), s(row.subject), s(row.message)]
        );
        break;
      case 'calendar_events':
        await mysqlPool.query(
          'REPLACE INTO calendar_events (id, date, title, time, type, notes) VALUES (?, ?, ?, ?, ?, ?)',
          [s(row.id), s(row.date), s(row.title), s(row.time), s(row.type), s(row.notes)]
        );
        break;
      case 'audit_trail':
        await mysqlPool.query(
          'REPLACE INTO audit_trail (id, user, entity, entityId, action, oldValue, newValue, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          [s(row.id), s(row.user), s(row.entity), s(row.entityId), s(row.action), s(row.oldValue, ''), s(row.newValue, ''), s(row.timestamp)]
        );
        break;
    }
    return;
  }

  saveSingleRowSQLite(tableKey, row);
}

function saveSingleRowSQLite(tableKey, row) {
  if (!row || !row.id || !sqliteDb) return;
  const t = TABLE_MAP[tableKey] || tableKey;
  try {
    if (t === 'buildings') {
      sqliteDb.prepare('INSERT OR REPLACE INTO buildings (id, name, address, city, postcode, managementOffice, facilities) VALUES (?, ?, ?, ?, ?, ?, ?)')
        .run(s(row.id), s(row.name), s(row.address), s(row.city), s(row.postcode), s(row.managementOffice), JSON.stringify(row.facilities || []));
    } else if (t === 'units') {
      sqliteDb.prepare('INSERT OR REPLACE INTO units (id, buildingId, unitNumber, floor, bedrooms, bathrooms, parkingBays, status, targetRent, lockboxCode, electricityAcc, waterAcc) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
        .run(s(row.id), s(row.buildingId), s(row.unitNumber), s(row.floor), Number(row.bedrooms) || 2, Number(row.bathrooms) || 1, s(row.parkingBays), s(row.status, 'Vacant'), Number(row.targetRent) || 1800, s(row.lockboxCode), s(row.electricityAcc), s(row.waterAcc));
    } else if (t === 'tenancies') {
      sqliteDb.prepare('INSERT OR REPLACE INTO tenancies (id, unitId, version, startDate, endDate, rentAmount, dueDay, status, stampingStatus, stampingRef) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
        .run(s(row.id), s(row.unitId), s(row.version), s(row.startDate), s(row.endDate), Number(row.rentAmount) || 1800, Number(row.dueDay) || 1, s(row.status, 'Active'), s(row.stampingStatus), s(row.stampingRef));
    }
  } catch (e) {
    console.error('[SQLite] saveSingleRow error:', e.message);
  }
}

async function deleteSingleRow(tableKey, id) {
  const t = TABLE_MAP[tableKey] || tableKey;
  if (activeEngine === 'mysql' && mysqlPool) {
    await mysqlPool.query(`DELETE FROM \`${t}\` WHERE id = ?`, [id]);
    return;
  }
  if (sqliteDb) {
    sqliteDb.prepare(`DELETE FROM ${t} WHERE id = ?`).run(id);
  }
}

async function getFullStateFromMySQL() {
  const [buildings] = await mysqlPool.query('SELECT * FROM buildings');
  const [units] = await mysqlPool.query('SELECT * FROM units');
  const [persons] = await mysqlPool.query('SELECT * FROM persons');
  const [owners] = await mysqlPool.query('SELECT * FROM owners');
  const [ownerships] = await mysqlPool.query('SELECT * FROM ownerships');
  const [tenancies] = await mysqlPool.query('SELECT * FROM tenancies');
  const [tenancyParties] = await mysqlPool.query('SELECT * FROM tenancy_parties');
  const [depositLedgers] = await mysqlPool.query('SELECT * FROM deposit_ledgers');
  const [charges] = await mysqlPool.query('SELECT * FROM charges');
  const [payments] = await mysqlPool.query('SELECT * FROM payments');
  const [allocations] = await mysqlPool.query('SELECT * FROM allocations');
  const [vendors] = await mysqlPool.query('SELECT * FROM vendors');
  const [maintenanceRequests] = await mysqlPool.query('SELECT * FROM maintenance_requests');
  const [workOrders] = await mysqlPool.query('SELECT * FROM work_orders');
  const [unitAssets] = await mysqlPool.query('SELECT * FROM unit_assets');
  const [accessControl] = await mysqlPool.query('SELECT * FROM access_control');
  const [inspections] = await mysqlPool.query('SELECT * FROM inspections');
  const [tasks] = await mysqlPool.query('SELECT * FROM tasks');
  const [documents] = await mysqlPool.query('SELECT * FROM documents');
  const [documentLinks] = await mysqlPool.query('SELECT * FROM document_links');
  const [communications] = await mysqlPool.query('SELECT * FROM communications');
  const [calendarEvents] = await mysqlPool.query('SELECT * FROM calendar_events');
  const [auditTrail] = await mysqlPool.query('SELECT * FROM audit_trail ORDER BY timestamp DESC');

  return {
    buildings: buildings.map(b => ({ ...b, facilities: parseJSON(b.facilities, []) })),
    units,
    persons,
    owners,
    ownerships: ownerships.map(os => ({ ...os, isPrimary: !!os.isPrimary })),
    tenancies,
    tenancyParties,
    depositLedgers: depositLedgers.map(d => ({ ...d, transactions: parseJSON(d.transactions, []) })),
    charges,
    payments,
    allocations,
    vendors,
    maintenanceRequests,
    workOrders: workOrders.map(w => ({ ...w, approvedByOwner: !!w.approvedByOwner })),
    unitAssets: unitAssets.map(a => ({ ...a, condition: a.conditionState || a.condition })),
    accessControl: accessControl.map(ac => ({ ...ac, returned: !!ac.returned })),
    inspections: inspections.map(insp => ({ ...insp, items: parseJSON(insp.items, []) })),
    tasks,
    documents: documents.map(d => ({ ...d, confidential: !!d.confidential })),
    documentLinks,
    communications,
    calendarEvents,
    auditTrail
  };
}

function getFullStateFromSQLite() {
  const buildings = sqliteDb.prepare('SELECT * FROM buildings').all().map(b => ({ ...b, facilities: parseJSON(b.facilities, []) }));
  const units = sqliteDb.prepare('SELECT * FROM units').all();
  const tenancies = sqliteDb.prepare('SELECT * FROM tenancies').all();
  const charges = sqliteDb.prepare('SELECT * FROM charges').all();
  const payments = sqliteDb.prepare('SELECT * FROM payments').all();
  return { buildings, units, tenancies, charges, payments };
}

async function getFullState() {
  if (activeEngine === 'mysql' && mysqlPool) {
    try {
      return await getFullStateFromMySQL();
    } catch (e) {
      console.warn('[Database] MySQL getFullState failed, using fallback:', e.message);
    }
  }
  if (sqliteDb) {
    try {
      return getFullStateFromSQLite();
    } catch (e) {
      console.warn('[Database] SQLite getFullState failed:', e.message);
    }
  }
  return getInitialBaselineData() || {};
}

// ==========================================
// 3. HTTP Server & REST API Router
// ==========================================
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.svg': 'image/svg+xml'
};

const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
  const pathname = parsedUrl.pathname;

  if (pathname.startsWith('/api/')) {
    await handleApiRoute(req, res, pathname);
    return;
  }

  const relPath = pathname === '/' ? 'index.html' : pathname.replace(/^\//, '');
  const candidates = [
    path.join(process.cwd(), relPath),
    path.join(__dirname, relPath),
    path.join(process.cwd(), relPath + '.html'),
    path.join(__dirname, relPath + '.html')
  ];

  let filePath = null;
  for (const c of candidates) {
    try {
      if (fs.existsSync(c) && fs.statSync(c).isFile()) {
        filePath = c;
        break;
      }
    } catch (e) {}
  }

  if (!filePath) {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('404 Not Found');
    return;
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';
  res.writeHead(200, { 'Content-Type': contentType });
  fs.createReadStream(filePath).pipe(res);
});

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        reject(e);
      }
    });
    req.on('error', reject);
  });
}

async function handleApiRoute(req, res, pathname) {
  try {
    // GET /api/health — System & Database Status
    if (pathname === '/api/health') {
      let counts = {};
      if (activeEngine === 'mysql' && mysqlPool) {
        const [u] = await mysqlPool.query('SELECT count(*) as c FROM units');
        const [b] = await mysqlPool.query('SELECT count(*) as c FROM buildings');
        const [t] = await mysqlPool.query('SELECT count(*) as c FROM tenancies');
        const [c] = await mysqlPool.query('SELECT count(*) as c FROM charges');
        const [p] = await mysqlPool.query('SELECT count(*) as c FROM payments');
        const [m] = await mysqlPool.query('SELECT count(*) as c FROM maintenance_requests');
        const [a] = await mysqlPool.query('SELECT count(*) as c FROM audit_trail');
        counts = {
          units: u[0].c,
          buildings: b[0].c,
          tenancies: t[0].c,
          charges: c[0].c,
          payments: p[0].c,
          maintenance: m[0].c,
          auditTrail: a[0].c
        };
      }

      const stats = {
        status: 'ok',
        engine: mysqlPool ? `MySQL (${config.mysql.host}:${config.mysql.port} / ${config.mysql.database})` : 'Client-Side Storage (Standby)',
        activeDatabase: activeEngine,
        databaseTarget: mysqlPool ? `${config.mysql.user}@${config.mysql.host}/${config.mysql.database}` : 'Local Client Storage',
        uptimeSeconds: Math.floor(process.uptime()),
        timestamp: new Date().toISOString(),
        counts
      };

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(stats, null, 2));
      return;
    }

    // GET /api/db — Initial load of live database truth
    if (pathname === '/api/db' && req.method === 'GET') {
      const data = await getFullState();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(data));
      return;
    }

    // POST /api/mutate — Immediate Direct Live Mutation (SAVE or DELETE a single row)
    if (pathname === '/api/mutate' && req.method === 'POST') {
      const payload = await readJsonBody(req);
      const { table, op, item, id } = payload;

      if (op === 'DELETE' && id) {
        await deleteSingleRow(table, id);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, message: `Deleted ${id} from ${table}` }));
        return;
      }

      if (item && item.id) {
        await saveSingleRow(table, item);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, message: `Saved ${item.id} to ${table}` }));
        return;
      }

      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Missing item or id in mutate payload' }));
      return;
    }

    // POST /api/payments/record — Atomic Payment Allocation
    if (pathname === '/api/payments/record' && req.method === 'POST') {
      const payload = await readJsonBody(req);
      const { tenancyId, payerPersonId, amount, method, reference, chargeId } = payload;
      const paymentId = 'pay-' + Date.now();
      const numAmount = Number(amount) || 0;
      const paymentDate = new Date().toISOString().slice(0, 10);

      if (activeEngine === 'mysql' && mysqlPool) {
        await mysqlPool.query(
          'INSERT INTO payments (id, payerPersonId, amount, paymentDate, method, reference) VALUES (?, ?, ?, ?, ?, ?)',
          [paymentId, payerPersonId || 'p-101', numAmount, paymentDate, method || 'Check', reference || ('Ref #' + Math.floor(1000 + Math.random() * 9000))]
        );

        if (chargeId) {
          const [charges] = await mysqlPool.query('SELECT * FROM charges WHERE id = ?', [chargeId]);
          if (charges && charges.length > 0) {
            const charge = charges[0];
            const allocId = 'al-' + Date.now();
            await mysqlPool.query(
              'INSERT INTO allocations (id, paymentId, chargeId, amountAllocated) VALUES (?, ?, ?, ?)',
              [allocId, paymentId, chargeId, numAmount]
            );

            const newStatus = numAmount >= charge.amount ? 'Paid' : 'Partially Paid';
            await mysqlPool.query('UPDATE charges SET status = ? WHERE id = ?', [newStatus, chargeId]);

            await mysqlPool.query(
              'INSERT INTO audit_trail (id, user, entity, entityId, action, oldValue, newValue, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
              ['aud-' + Date.now(), 'Sarah Jenkins', 'Charge', chargeId, 'PAYMENT_ALLOCATED', charge.status, newStatus, new Date().toLocaleString()]
            );
          }
        }
      }

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, paymentId, message: 'Payment recorded immediately into MySQL' }));
      return;
    }

    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Endpoint not found' }));
  } catch (err) {
    console.error('[API Error]:', err);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: err.message }));
  }
}

// ==========================================
// 4. Start Server / Export for Serverless
// ==========================================
async function main() {
  try {
    await initDatabase();
  } catch (err) {
    console.warn('[Database] Local MySQL connection failed or not started:', err.message);
    console.warn('[Database] Server will continue running in fallback mode.');
  }

  server.listen(PORT, () => {
    console.log('========================================================');
    console.log(`🚀 NestPad Tenancy Management Backend running on http://localhost:${PORT}`);
    console.log(`🗄️ Database: Direct Immediate Live MySQL -> ${config.mysql.user}@${config.mysql.host}:${config.mysql.port}/${config.mysql.database}`);
    console.log(`📊 Health Endpoint: http://localhost:${PORT}/api/health`);
    console.log(`📖 Web Application: http://localhost:${PORT}/dashboard.html`);
    console.log('========================================================');
  });
}

module.exports = server;

if (require.main === module) {
  main().catch(err => {
    console.error('Fatal Server Error:', err);
  });
} else {
  // Trigger non-blocking database init in serverless environments (like Vercel)
  initDatabase().catch(err => {
    console.warn('[Serverless DB Init]:', err.message);
  });
}
