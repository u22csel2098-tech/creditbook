/**
 * CreditBook Offline Layer
 * ─────────────────────────────────────────────────────────────────
 * Strategy:
 *  - All GET requests → served from localStorage cache instantly
 *  - All POST/PUT/DELETE requests → executed immediately if online,
 *    queued in localStorage if offline, synced automatically when back online
 *  - UI always works — no spinners waiting for network
 */

const DB_VERSION = 'cb_v1';
const key = (k) => `${DB_VERSION}_${k}`;

// ── Low-level helpers ────────────────────────────────────────────────────────
export const lsGet = (k, fallback = null) => {
  try { const v = localStorage.getItem(key(k)); return v ? JSON.parse(v) : fallback; }
  catch { return fallback; }
};

export const lsSet = (k, v) => {
  try { localStorage.setItem(key(k), JSON.stringify(v)); } catch {}
};

export const lsDel = (k) => {
  try { localStorage.removeItem(key(k)); } catch {}
};

// ── Offline status ────────────────────────────────────────────────────────────
export const isOnline = () => navigator.onLine;

// ── Sync queue ────────────────────────────────────────────────────────────────
const Q_KEY = 'sync_queue';

export const getQueue = () => lsGet(Q_KEY, []);

export const enqueue = (item) => {
  const q = getQueue();
  q.push({ ...item, id: Date.now() + Math.random(), createdAt: new Date().toISOString() });
  lsSet(Q_KEY, q);
};

export const dequeue = (id) => {
  lsSet(Q_KEY, getQueue().filter(i => i.id !== id));
};

export const clearQueue = () => lsSet(Q_KEY, []);

// ── Cache helpers ─────────────────────────────────────────────────────────────
// Cache any API response under a key
export const cacheSet = (cacheKey, data) => lsSet(`cache_${cacheKey}`, { data, ts: Date.now() });
export const cacheGet = (cacheKey) => {
  const v = lsGet(`cache_${cacheKey}`, null);
  return v ? v.data : null;
};

// ── ID generator (for optimistic offline records) ─────────────────────────────
export const offlineId = () => `offline_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

// ── Per-collection localStorage stores ────────────────────────────────────────
const COLLECTIONS = ['parties', 'transactions', 'staff', 'attendance', 'dashboard'];

export const store = {
  get: (col) => lsGet(col, []),
  set: (col, data) => lsSet(col, data),
  add: (col, item) => {
    const items = lsGet(col, []);
    items.push(item);
    lsSet(col, items);
  },
  update: (col, id, updates) => {
    const items = lsGet(col, []).map(x =>
      (x._id === id || x.id === id) ? { ...x, ...updates } : x
    );
    lsSet(col, items);
  },
  remove: (col, id) => {
    lsSet(col, lsGet(col, []).filter(x => x._id !== id && x.id !== id));
  },
  findById: (col, id) => lsGet(col, []).find(x => x._id === id || x.id === id) || null,
};

// ── Sync engine ───────────────────────────────────────────────────────────────
// Called when app comes back online — flush all queued mutations to backend
export const flushQueue = async (axiosInstance) => {
  if (!isOnline()) return;
  const queue = getQueue();
  if (!queue.length) return;

  console.log(`[CreditBook] Syncing ${queue.length} offline operations…`);

  for (const item of queue) {
    try {
      if (item.method === 'POST')   await axiosInstance.post(item.url, item.data);
      if (item.method === 'PUT')    await axiosInstance.put(item.url, item.data);
      if (item.method === 'DELETE') await axiosInstance.delete(item.url);
      dequeue(item.id);
      console.log(`[CreditBook] Synced: ${item.method} ${item.url}`);
    } catch(e) {
      console.warn(`[CreditBook] Sync failed for ${item.method} ${item.url}:`, e.message);
      // Keep in queue for next attempt
    }
  }

  // After sync, refresh all cached data from server
  try {
    const [pRes, sRes] = await Promise.all([
      axiosInstance.get('/api/parties'),
      axiosInstance.get('/api/staff'),
    ]);
    if (pRes.data?.data) store.set('parties', pRes.data.data);
    if (sRes.data?.data) store.set('staff', sRes.data.data);
  } catch {}
};

// ── Smart axios wrapper ───────────────────────────────────────────────────────
// Use this instead of raw axios in every page — handles online/offline automatically
export const api = {
  // GET: try network first, fall back to cache
  get: async (axiosInstance, url, config = {}) => {
    const cacheKey = url + JSON.stringify(config.params || {});
    if (isOnline()) {
      try {
        const r = await axiosInstance.get(url, config);
        cacheSet(cacheKey, r.data);
        return r;
      } catch(e) {
        const cached = cacheGet(cacheKey);
        if (cached) return { data: cached, fromCache: true };
        throw e;
      }
    } else {
      const cached = cacheGet(cacheKey);
      if (cached) return { data: cached, fromCache: true };
      // Build from localStorage store as last resort
      return buildFromStore(url, config);
    }
  },

  // POST: execute if online, queue if offline + optimistically update store
  post: async (axiosInstance, url, data) => {
    if (isOnline()) {
      const r = await axiosInstance.post(url, data);
      // Update local store with server response
      updateStoreFromResponse(url, 'POST', data, r.data);
      return r;
    } else {
      enqueue({ method: 'POST', url, data });
      // Optimistic local update
      const optimistic = optimisticPost(url, data);
      return { data: optimistic, offline: true };
    }
  },

  // PUT: execute if online, queue if offline
  put: async (axiosInstance, url, data) => {
    if (isOnline()) {
      const r = await axiosInstance.put(url, data);
      updateStoreFromResponse(url, 'PUT', data, r.data);
      return r;
    } else {
      enqueue({ method: 'PUT', url, data });
      optimisticPut(url, data);
      return { data: { success: true, offline: true }, offline: true };
    }
  },

  // DELETE: execute if online, queue if offline
  delete: async (axiosInstance, url) => {
    if (isOnline()) {
      const r = await axiosInstance.delete(url);
      optimisticDelete(url);
      return r;
    } else {
      enqueue({ method: 'DELETE', url });
      optimisticDelete(url);
      return { data: { success: true, offline: true }, offline: true };
    }
  },
};

// ── Optimistic local updates ──────────────────────────────────────────────────
function optimisticPost(url, data) {
  const id = offlineId();

  if (url === '/api/parties') {
    const party = { ...data, _id: id, balance: 0, isActive: true, createdAt: new Date().toISOString() };
    store.add('parties', party);
    return { success: true, data: party };
  }

  if (url === '/api/transactions') {
    const tx = { ...data, _id: id, createdAt: new Date().toISOString() };
    store.add('transactions', tx);
    // Update party balance optimistically
    const parties = store.get('parties');
    const party = parties.find(p => p._id === data.partyId || p.id === data.partyId);
    if (party) {
      let delta = 0;
      if (party.type === 'customer') delta = data.type === 'gave' ? +data.amount : -data.amount;
      else delta = data.type === 'gave' ? -data.amount : +data.amount;
      store.update('parties', party._id || party.id, { balance: (party.balance || 0) + delta });
    }
    return { success: true, data: tx };
  }

  if (url === '/api/staff') {
    const s = { ...data, _id: id, advanceBalance: 0, paymentHistory: [], isActive: true, createdAt: new Date().toISOString() };
    store.add('staff', s);
    return { success: true, data: s };
  }

  if (url === '/api/attendance') {
    const att = { ...data, _id: id, createdAt: new Date().toISOString() };
    // Remove existing attendance for same staff+date
    const all = store.get('attendance').filter(a => !(a.staffId === data.staffId && a.date?.startsWith(data.date?.slice(0, 10))));
    all.push(att);
    store.set('attendance', all);
    return { success: true, data: att };
  }

  return { success: true, data: { _id: id, ...data } };
}

function optimisticPut(url, data) {
  // Match /api/staff/:id/payment
  const paymentMatch = url.match(/\/api\/staff\/([^/]+)\/payment/);
  if (paymentMatch) {
    const staffId = paymentMatch[1];
    const s = store.findById('staff', staffId);
    if (s) {
      const history = [...(s.paymentHistory || []), { ...data, _id: offlineId(), date: new Date().toISOString() }];
      let adv = s.advanceBalance || 0;
      if (data.type === 'advance') adv += Number(data.amount);
      if (data.type === 'deduction') adv = Math.max(0, adv - Number(data.amount));
      store.update('staff', staffId, { paymentHistory: history, advanceBalance: adv });
    }
    return;
  }

  // Match /api/staff/:id
  const staffMatch = url.match(/\/api\/staff\/([^/]+)$/);
  if (staffMatch) { store.update('staff', staffMatch[1], data); return; }

  // Match /api/parties/:id
  const partyMatch = url.match(/\/api\/parties\/([^/]+)$/);
  if (partyMatch) { store.update('parties', partyMatch[1], data); return; }

  // Match /api/auth/update
  if (url === '/api/auth/update') {
    const usr = lsGet('cb_usr_raw', {});
    lsSet('cb_usr_raw', { ...usr, ...data });
  }
}

function optimisticDelete(url) {
  const txMatch    = url.match(/\/api\/transactions\/([^/]+)/);
  const partyMatch = url.match(/\/api\/parties\/([^/]+)/);
  const staffMatch = url.match(/\/api\/staff\/([^/]+)/);

  if (txMatch) {
    const tx = store.findById('transactions', txMatch[1]);
    if (tx) {
      // Reverse balance
      const party = store.findById('parties', tx.partyId);
      if (party) {
        let delta = 0;
        if (party.type === 'customer') delta = tx.type === 'gave' ? -tx.amount : +tx.amount;
        else delta = tx.type === 'gave' ? +tx.amount : -tx.amount;
        store.update('parties', tx.partyId, { balance: (party.balance || 0) + delta });
      }
      store.remove('transactions', txMatch[1]);
    }
    return;
  }
  if (partyMatch) { store.update('parties', partyMatch[1], { isActive: false }); return; }
  if (staffMatch) { store.update('staff', staffMatch[1], { isActive: false }); return; }
}

function updateStoreFromResponse(url, method, data, response) {
  if (method === 'POST') {
    if (url === '/api/parties' && response?.data) {
      const existing = store.get('parties').filter(p => !p._id?.startsWith('offline_'));
      store.set('parties', [...existing, response.data]);
    }
    if (url === '/api/transactions' && response?.data?.party) {
      store.update('parties', response.data.party._id, response.data.party);
    }
    if (url === '/api/staff' && response?.data) {
      const existing = store.get('staff').filter(s => !s._id?.startsWith('offline_'));
      store.set('staff', [...existing, response.data]);
    }
  }
}

// Build a response from localStorage store when completely offline
function buildFromStore(url, config) {
  // /api/dashboard
  if (url === '/api/dashboard') {
    const parties = store.get('parties').filter(p => p.isActive !== false);
    const txs     = store.get('transactions');
    const staffList = store.get('staff').filter(s => s.isActive !== false);
    const customers = parties.filter(p => p.type === 'customer');
    const suppliers = parties.filter(p => p.type === 'supplier');
    const today = new Date(); today.setHours(0,0,0,0);
    const todayTx = txs.filter(t => new Date(t.date) >= today);
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthTx = txs.filter(t => new Date(t.date) >= monthStart);
    const sum = (arr, type) => arr.filter(t => t.type === type).reduce((s, t) => s + (t.amount || 0), 0);
    return {
      data: {
        success: true,
        data: {
          customers: { count: customers.length, toGet: customers.filter(p=>(p.balance||0)>0).reduce((s,p)=>s+p.balance,0), toGive: customers.filter(p=>(p.balance||0)<0).reduce((s,p)=>s+Math.abs(p.balance),0) },
          suppliers: { count: suppliers.length, toGive: suppliers.filter(p=>(p.balance||0)<0).reduce((s,p)=>s+Math.abs(p.balance),0), toGet: suppliers.filter(p=>(p.balance||0)>0).reduce((s,p)=>s+p.balance,0) },
          today: { in: sum(todayTx,'got'), out: sum(todayTx,'gave'), net: sum(todayTx,'got')-sum(todayTx,'gave'), txCount: todayTx.length },
          thisMonth: { in: sum(monthTx,'got'), out: sum(monthTx,'gave'), net: sum(monthTx,'got')-sum(monthTx,'gave') },
          staff: { count: staffList.length, attendance: { present:0, absent:0, half_day:0, paid_leave:0 } },
          recentTransactions: [...txs].sort((a,b)=>new Date(b.date)-new Date(a.date)).slice(0,10).map(t=>({ ...t, partyId: { name: parties.find(p=>p._id===t.partyId||p.id===t.partyId)?.name||'—' } })),
          topCustomers: customers.filter(p=>(p.balance||0)>0).sort((a,b)=>b.balance-a.balance).slice(0,5),
          netPosition: customers.reduce((s,p)=>s+(p.balance||0),0) - suppliers.reduce((s,p)=>s+(p.balance<0?Math.abs(p.balance):0),0),
        }
      }
    };
  }

  // /api/parties
  if (url === '/api/parties') {
    let list = store.get('parties').filter(p => p.isActive !== false);
    if (config?.params?.type) list = list.filter(p => p.type === config.params.type);
    if (config?.params?.search) list = list.filter(p => p.name?.toLowerCase().includes(config.params.search.toLowerCase()));
    return { data: { success: true, data: list } };
  }

  // /api/parties/summary/totals
  if (url === '/api/parties/summary/totals') {
    const parties = store.get('parties').filter(p => p.isActive !== false);
    const c = parties.filter(p=>p.type==='customer'), s = parties.filter(p=>p.type==='supplier');
    return { data: { success: true, data: {
      customerToGet: c.filter(p=>(p.balance||0)>0).reduce((s,p)=>s+p.balance,0),
      customerToGive: c.filter(p=>(p.balance||0)<0).reduce((s,p)=>s+Math.abs(p.balance),0),
      supplierToGive: s.filter(p=>(p.balance||0)<0).reduce((s,p)=>s+Math.abs(p.balance),0),
      supplierToGet: s.filter(p=>(p.balance||0)>0).reduce((s,p)=>s+p.balance,0),
      customerCount: c.length, supplierCount: s.length,
    }}};
  }

  // /api/parties/:id
  const partyMatch = url.match(/\/api\/parties\/([^/]+)$/);
  if (partyMatch) {
    const party = store.findById('parties', partyMatch[1]);
    const transactions = store.get('transactions').filter(t => t.partyId === partyMatch[1]).sort((a,b)=>new Date(b.date)-new Date(a.date));
    return { data: { success: true, data: { party, transactions } } };
  }

  // /api/staff
  if (url === '/api/staff') {
    const today = new Date(); today.setHours(0,0,0,0);
    const todayAtt = store.get('attendance').filter(a => new Date(a.date) >= today);
    const attMap = {};
    todayAtt.forEach(a => { attMap[a.staffId] = a.status; });
    const list = store.get('staff').filter(s=>s.isActive!==false).map(s => ({ ...s, todayAttendance: attMap[s._id||s.id]||null }));
    return { data: { success: true, data: list } };
  }

  // /api/staff/summary/due
  if (url === '/api/staff/summary/due') {
    const today = new Date();
    const staffList = store.get('staff').filter(s=>s.isActive!==false);
    let totalDue = 0;
    const details = staffList.map(s => {
      const daysInMonth = new Date(today.getFullYear(), today.getMonth()+1, 0).getDate();
      const earned = parseFloat(((s.salary/daysInMonth)*today.getDate()).toFixed(2));
      const due = parseFloat(Math.max(0, earned - (s.advanceBalance||0)).toFixed(2));
      totalDue += due;
      return { ...s, earned, due };
    });
    return { data: { success: true, data: { totalDue, staffCount: staffList.length, details } } };
  }

  // /api/staff/:id
  const staffMatch = url.match(/\/api\/staff\/([^/]+)$/);
  if (staffMatch) {
    const s = store.findById('staff', staffMatch[1]);
    return { data: { success: true, data: s } };
  }

  // /api/attendance/summary/today
  if (url === '/api/attendance/summary/today') {
    const today = new Date(); today.setHours(0,0,0,0);
    const records = store.get('attendance').filter(a => new Date(a.date) >= today);
    const summary = { present:0, absent:0, half_day:0, paid_leave:0 };
    records.forEach(r => { if (summary[r.status]!==undefined) summary[r.status]++; });
    return { data: { success: true, data: { summary } } };
  }

  // /api/attendance/:staffId
  const attMatch = url.match(/\/api\/attendance\/([^/]+)$/);
  if (attMatch && attMatch[1] !== 'summary') {
    const staffId = attMatch[1];
    const month = config?.params?.month, year = config?.params?.year;
    const m = month ? parseInt(month)-1 : new Date().getMonth();
    const y = year  ? parseInt(year)    : new Date().getFullYear();
    const start = new Date(y, m, 1), end = new Date(y, m+1, 0, 23, 59, 59);
    const records = store.get('attendance').filter(a => a.staffId===staffId && new Date(a.date)>=start && new Date(a.date)<=end);
    return { data: { success: true, data: records } };
  }

  // /api/attendance/:staffId/summary
  const attSumMatch = url.match(/\/api\/attendance\/([^/]+)\/summary/);
  if (attSumMatch) {
    const staffId = attSumMatch[1];
    const month = config?.params?.month, year = config?.params?.year;
    const m = month ? parseInt(month)-1 : new Date().getMonth();
    const y = year  ? parseInt(year)    : new Date().getFullYear();
    const start = new Date(y, m, 1), end = new Date(y, m+1, 0, 23, 59, 59);
    const records = store.get('attendance').filter(a => a.staffId===staffId && new Date(a.date)>=start && new Date(a.date)<=end);
    const summary = { present:0, absent:0, half_day:0, paid_leave:0 };
    records.forEach(r => { if (summary[r.status]!==undefined) summary[r.status]++; });
    const s = store.findById('staff', staffId);
    const daysInMonth = new Date(y, m+1, 0).getDate();
    const dailyRate = s ? s.salary/daysInMonth : 0;
    const effectiveDays = summary.present + summary.half_day*0.5 + summary.paid_leave;
    return { data: { success: true, data: { summary, daysInMonth, effectiveDays, salaryEarned: parseFloat((dailyRate*effectiveDays).toFixed(2)), dailyRate } } };
  }

  // /api/dashboard/cashflow
  if (url.includes('/api/dashboard/cashflow')) {
    const days = 7;
    const txs = store.get('transactions');
    const map = {};
    for (let i=days; i>=0; i--) {
      const d = new Date(); d.setDate(d.getDate()-i); d.setHours(0,0,0,0);
      const k = d.toISOString().split('T')[0];
      map[k] = { date:k, in:0, out:0 };
    }
    txs.forEach(t => {
      const k = new Date(t.date).toISOString().split('T')[0];
      if (map[k]) { if (t.type==='got') map[k].in+=t.amount; else map[k].out+=t.amount; }
    });
    return { data: { success: true, data: Object.values(map) } };
  }

  // Fallback
  return { data: { success: false, data: null }, offline: true };
}

// ── Pre-cache data from server (call after login) ─────────────────────────────
export const precacheAll = async (axiosInstance) => {
  if (!isOnline()) return;
  try {
    const [pRes, sRes, attRes] = await Promise.all([
      axiosInstance.get('/api/parties'),
      axiosInstance.get('/api/staff'),
      axiosInstance.get('/api/attendance/summary/today').catch(() => null),
    ]);
    if (pRes.data?.data) store.set('parties', pRes.data.data);
    if (sRes.data?.data) store.set('staff', sRes.data.data);

    // Also cache transactions (last 100)
    const txRes = await axiosInstance.get('/api/transactions?limit=200').catch(() => null);
    if (txRes?.data?.data) store.set('transactions', txRes.data.data);

    console.log('[CreditBook] Pre-cached all data for offline use');
  } catch(e) {
    console.warn('[CreditBook] Pre-cache failed:', e.message);
  }
};
