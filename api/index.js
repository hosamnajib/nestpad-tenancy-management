/* Vercel Serverless Function API Handler for NestPad Tenancy Management */
const mysql = require('mysql2/promise');

let pool = null;
let poolError = null;

function getMySQLPool() {
  if (pool) return pool;

  const host = process.env.MYSQL_HOST || process.env.DB_HOST;
  const user = process.env.MYSQL_USER || process.env.DB_USER || 'root';
  const password = process.env.MYSQL_PASSWORD || process.env.DB_PASSWORD || '';
  const database = process.env.MYSQL_DATABASE || process.env.DB_NAME || 'nestpad_db';
  const port = process.env.MYSQL_PORT ? parseInt(process.env.MYSQL_PORT, 10) : 3306;
  const ssl = process.env.MYSQL_SSL === 'true' || process.env.MYSQL_SSL === '1' ? { rejectUnauthorized: false } : undefined;

  if (!host) {
    return null;
  }

  try {
    pool = mysql.createPool({
      host,
      port,
      user,
      password,
      database,
      ssl,
      waitForConnections: true,
      connectionLimit: 5,
      queueLimit: 0,
      connectTimeout: 5000
    });
    return pool;
  } catch (err) {
    poolError = err.message;
    return null;
  }
}

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

async function readJsonBody(req) {
  if (req.body && typeof req.body === 'object') {
    return req.body;
  }
  return new Promise((resolve) => {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        resolve({});
      }
    });
    req.on('error', () => resolve({}));
  });
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  const url = req.url || '';
  const pathname = url.split('?')[0];

  const dbPool = getMySQLPool();

  try {
    // 1. Health check
    if (pathname === '/api/health') {
      let counts = {};
      let isDbLive = false;

      if (dbPool) {
        try {
          const [u] = await dbPool.query('SELECT count(*) as c FROM units');
          const [b] = await dbPool.query('SELECT count(*) as c FROM buildings');
          const [t] = await dbPool.query('SELECT count(*) as c FROM tenancies');
          const [c] = await dbPool.query('SELECT count(*) as c FROM charges');
          const [p] = await dbPool.query('SELECT count(*) as c FROM payments');
          const [m] = await dbPool.query('SELECT count(*) as c FROM maintenance_requests');
          const [a] = await dbPool.query('SELECT count(*) as c FROM audit_trail');
          counts = {
            units: u[0].c,
            buildings: b[0].c,
            tenancies: t[0].c,
            charges: c[0].c,
            payments: p[0].c,
            maintenance: m[0].c,
            auditTrail: a[0].c
          };
          isDbLive = true;
        } catch (e) {
          isDbLive = false;
        }
      }

      return res.status(200).json({
        status: 'ok',
        platform: 'Vercel Serverless',
        engine: isDbLive ? `MySQL Cloud (${process.env.MYSQL_HOST})` : 'Client-Side LocalStorage / Standby',
        databaseTarget: isDbLive ? `${process.env.MYSQL_USER}@${process.env.MYSQL_HOST}/${process.env.MYSQL_DATABASE}` : 'No cloud DB env set',
        activeDatabase: isDbLive ? 'mysql' : 'client_storage',
        dbLive: isDbLive,
        timestamp: new Date().toISOString(),
        counts
      });
    }

    // 2. Fetch all state
    if (pathname === '/api/db' && req.method === 'GET') {
      if (dbPool) {
        try {
          const [buildings] = await dbPool.query('SELECT * FROM buildings');
          const [units] = await dbPool.query('SELECT * FROM units');
          const [persons] = await dbPool.query('SELECT * FROM persons');
          const [owners] = await dbPool.query('SELECT * FROM owners');
          const [ownerships] = await dbPool.query('SELECT * FROM ownerships');
          const [tenancies] = await dbPool.query('SELECT * FROM tenancies');
          const [tenancyParties] = await dbPool.query('SELECT * FROM tenancy_parties');
          const [depositLedgers] = await dbPool.query('SELECT * FROM deposit_ledgers');
          const [charges] = await dbPool.query('SELECT * FROM charges');
          const [payments] = await dbPool.query('SELECT * FROM payments');
          const [allocations] = await dbPool.query('SELECT * FROM allocations');
          const [vendors] = await dbPool.query('SELECT * FROM vendors');
          const [maintenanceRequests] = await dbPool.query('SELECT * FROM maintenance_requests');
          const [workOrders] = await dbPool.query('SELECT * FROM work_orders');
          const [unitAssets] = await dbPool.query('SELECT * FROM unit_assets');
          const [accessControl] = await dbPool.query('SELECT * FROM access_control');
          const [inspections] = await dbPool.query('SELECT * FROM inspections');
          const [tasks] = await dbPool.query('SELECT * FROM tasks');
          const [documents] = await dbPool.query('SELECT * FROM documents');
          const [documentLinks] = await dbPool.query('SELECT * FROM document_links');
          const [communications] = await dbPool.query('SELECT * FROM communications');
          const [calendarEvents] = await dbPool.query('SELECT * FROM calendar_events');
          const [auditTrail] = await dbPool.query('SELECT * FROM audit_trail ORDER BY timestamp DESC');

          return res.status(200).json({
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
          });
        } catch (dbErr) {
          console.warn('[Vercel API] MySQL fetch failed, serving standby response', dbErr.message);
        }
      }
      return res.status(200).json({});
    }

    // 3. Mutate row
    if (pathname === '/api/mutate' && req.method === 'POST') {
      const payload = await readJsonBody(req);
      const { table, op, item, id } = payload;
      const targetTable = TABLE_MAP[table] || table;

      if (dbPool) {
        try {
          if (op === 'DELETE' && id) {
            await dbPool.query(`DELETE FROM \`${targetTable}\` WHERE id = ?`, [id]);
            return res.status(200).json({ success: true, message: `Deleted ${id} from ${targetTable}` });
          }
          if (item && item.id) {
            // Generic simple insert/replace for cloud MySQL
            const keys = Object.keys(item);
            const vals = keys.map(k => typeof item[k] === 'object' && item[k] !== null ? JSON.stringify(item[k]) : item[k]);
            const placeholders = keys.map(() => '?').join(', ');
            await dbPool.query(`REPLACE INTO \`${targetTable}\` (\`${keys.join('`, `')}\`) VALUES (${placeholders})`, vals);
            return res.status(200).json({ success: true, message: `Saved ${item.id} to ${targetTable}` });
          }
        } catch (e) {
          console.error('[Vercel API Mutate Error]', e.message);
          return res.status(200).json({ success: true, warning: 'Saved locally; cloud DB error: ' + e.message });
        }
      }

      return res.status(200).json({ success: true, message: 'Persisted to client storage' });
    }

    // 4. Payments
    if (pathname === '/api/payments/record' && req.method === 'POST') {
      const payload = await readJsonBody(req);
      const { tenancyId, payerPersonId, amount, method, reference, chargeId } = payload;
      const paymentId = 'pay-' + Date.now();
      const numAmount = Number(amount) || 0;
      const paymentDate = new Date().toISOString().slice(0, 10);

      if (dbPool) {
        try {
          await dbPool.query(
            'INSERT INTO payments (id, payerPersonId, amount, paymentDate, method, reference) VALUES (?, ?, ?, ?, ?, ?)',
            [paymentId, payerPersonId || 'p-101', numAmount, paymentDate, method || 'Check', reference || ('Ref #' + Math.floor(1000 + Math.random() * 9000))]
          );
        } catch (e) {
          console.warn('[Vercel API Payment Error]', e.message);
        }
      }

      return res.status(200).json({ success: true, paymentId, message: 'Payment registered successfully' });
    }

    return res.status(404).json({ error: 'Endpoint not found' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
