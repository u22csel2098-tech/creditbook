const Party = require('../models/Party');
const Transaction = require('../models/Transaction');
const Staff = require('../models/Staff');
const Attendance = require('../models/Attendance');
const fetch = require('node-fetch');

const chat = async (req, res) => {
  try {
    const { message, history = [] } = req.body;
    if (!message?.trim()) return res.status(400).json({ success: false, message: 'Message required.' });

    const uid = req.user._id;
    const [parties, staff, recentTx] = await Promise.all([
      Party.find({ userId: uid, isActive: true }).lean(),
      Staff.find({ userId: uid, isActive: true }).lean(),
      Transaction.find({ userId: uid }).populate('partyId','name type').sort({ date: -1 }).limit(15).lean()
    ]);

    const customers = parties.filter(p => p.type === 'customer');
    const suppliers = parties.filter(p => p.type === 'supplier');
    const customerToGet  = customers.filter(p => p.balance > 0).reduce((s,p) => s+p.balance, 0);
    const customerToGive = customers.filter(p => p.balance < 0).reduce((s,p) => s+Math.abs(p.balance), 0);
    const supplierToGive = suppliers.filter(p => p.balance < 0).reduce((s,p) => s+Math.abs(p.balance), 0);
    const supplierToGet  = suppliers.filter(p => p.balance > 0).reduce((s,p) => s+p.balance, 0);

    const today = new Date(); today.setHours(0,0,0,0);
    const todayAtt = await Attendance.find({ userId: uid, date: { $gte: today, $lt: new Date(today.getTime()+86400000) } }).lean();
    const attSummary = { present:0, absent:0, half_day:0, paid_leave:0 };
    todayAtt.forEach(a => { if (attSummary[a.status]!==undefined) attSummary[a.status]++; });

    const systemPrompt = `You are CreditBot, an AI assistant for CreditBook — a business accounting app used by small businesses in India.
Today: ${new Date().toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}
Owner: ${req.user.name} | Business: ${req.user.businessName}

LIVE DATA:
Customers(${customers.length}): GET ₹${customerToGet.toFixed(2)} | GIVE ₹${customerToGive.toFixed(2)}
Top debtors: ${customers.filter(p=>p.balance>0).sort((a,b)=>b.balance-a.balance).slice(0,5).map(c=>`${c.name}:₹${c.balance.toFixed(0)}`).join(', ')||'none'}
Suppliers(${suppliers.length}): GIVE ₹${supplierToGive.toFixed(2)} | GET ₹${supplierToGet.toFixed(2)}
Staff(${staff.length}): ${staff.map(s=>`${s.name}(₹${s.salary}/mo)`).join(', ')||'none'}
Attendance today: P=${attSummary.present} A=${attSummary.absent} H=${attSummary.half_day} PL=${attSummary.paid_leave}
Net position: ₹${(customerToGet-customerToGive-supplierToGive+supplierToGet).toFixed(2)}
Recent txns: ${recentTx.slice(0,5).map(t=>`${t.partyId?.name}: ${t.type==='got'?'+':'-'}₹${t.amount}`).join(', ')||'none'}

RULES: Be concise, use ₹ for amounts, use bullet points on mobile, max 150 words, never make up data.`;

    const GROQ_API_KEY = process.env.GROQ_API_KEY;

    if (!GROQ_API_KEY || GROQ_API_KEY.includes('your_groq')) {
      return res.json({ success: true, data: { reply: smartFallback(message, { customers, suppliers, staff, customerToGet, customerToGive, supplierToGive, supplierToGet, attSummary, recentTx, user: req.user }) } });
    }

    // Groq API call
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        max_tokens: 300,
        temperature: 0.7,
        messages: [
          { role: 'system', content: systemPrompt },
          ...history.slice(-6).map(m => ({ role: m.role, content: m.content })),
          { role: 'user', content: message }
        ]
      })
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('Groq error:', err);
      return res.json({ success: true, data: { reply: smartFallback(message, { customers, suppliers, staff, customerToGet, customerToGive, supplierToGive, supplierToGet, attSummary, recentTx, user: req.user }) } });
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || 'Sorry, could not get a response.';
    res.json({ success: true, data: { reply } });

  } catch (e) {
    console.error('Chat error:', e);
    res.json({ success: true, data: { reply: '🤖 AI is temporarily unavailable. Please check your GROQ_API_KEY in server/.env. Get a free key at groq.com — no credit card needed!' } });
  }
};

function smartFallback(message, ctx) {
  const msg = message.toLowerCase();
  const { customers, suppliers, staff, customerToGet, customerToGive, supplierToGive, supplierToGet, attSummary, recentTx, user } = ctx;

  if (msg.match(/hi|hello|hey|namaste/)) return `👋 Hello ${user.name}! I'm CreditBot.\n\nI can help with:\n• 📊 Balance & dues\n• 👥 Customer info\n• 🏪 Supplier info\n• 👷 Staff & attendance\n\n💡 Add GROQ_API_KEY to server/.env for full AI! (free at groq.com)`;
  if (msg.match(/balance|summary|total|overview/)) return `📊 *Business Summary*\n\n👥 Customers (${customers.length}):\n• You'll GET: ₹${customerToGet.toFixed(2)}\n• You'll GIVE: ₹${customerToGive.toFixed(2)}\n\n🏪 Suppliers (${suppliers.length}):\n• You'll GIVE: ₹${supplierToGive.toFixed(2)}\n• You'll GET: ₹${supplierToGet.toFixed(2)}\n\n💼 Net: ₹${(customerToGet-customerToGive-supplierToGive+supplierToGet).toFixed(2)}`;
  if (msg.match(/customer|udhaar|baaki/)) { const top = customers.filter(c=>c.balance>0).sort((a,b)=>b.balance-a.balance).slice(0,5); return `👥 *Customers* (${customers.length})\n\n💰 Total receivable: ₹${customerToGet.toFixed(2)}\n${top.length?'\n🔴 Top dues:\n'+top.map(c=>`• ${c.name}: ₹${c.balance.toFixed(2)}`).join('\n'):'✅ No outstanding dues!'}`; }
  if (msg.match(/supplier|vendor/)) { const top = suppliers.filter(s=>s.balance<0).sort((a,b)=>a.balance-b.balance).slice(0,5); return `🏪 *Suppliers* (${suppliers.length})\n\n💸 Total payable: ₹${supplierToGive.toFixed(2)}\n${top.length?'\n🔴 Top payables:\n'+top.map(s=>`• ${s.name}: ₹${Math.abs(s.balance).toFixed(2)}`).join('\n'):'✅ No outstanding payables!'}`; }
  if (msg.match(/staff|employee|worker|attendance/)) return `👷 *Staff* (${staff.length})\n\n${staff.map(s=>`• ${s.name}: ₹${s.salary.toLocaleString('en-IN')}/mo`).join('\n')||'No staff added.'}\n\n📅 Today:\n✅ Present: ${attSummary.present} | ❌ Absent: ${attSummary.absent} | 🔶 Half: ${attSummary.half_day} | 🔵 PL: ${attSummary.paid_leave}`;
  if (msg.match(/recent|transaction|history/)) return `📋 *Recent Transactions*\n\n${recentTx.slice(0,5).map(t=>`• ${t.partyId?.name||'?'}: ${t.type==='got'?'✅+':' 🔴-'}₹${t.amount}`).join('\n')||'No transactions yet.'}`;
  if (msg.match(/remind|follow|collect|who owe/)) { const d = customers.filter(c=>c.balance>0).sort((a,b)=>b.balance-a.balance); return d.length===0?'✅ No customers with outstanding dues!':`📞 *Follow-up List* (${d.length})\n\n${d.slice(0,6).map((c,i)=>`${i+1}. ${c.name}: ₹${c.balance.toFixed(2)}${c.phone?` 📱 ${c.phone}`:''}`).join('\n')}`; }
  if (msg.match(/net|profit|loss/)) { const n = customerToGet-customerToGive-supplierToGive+supplierToGet; return `💼 *Net Position*\n\n${n>=0?'✅ Positive':'⚠️ Negative'}: ${n>=0?'+':''}₹${n.toFixed(2)}\n\n• Receivable: ₹${customerToGet.toFixed(2)}\n• Payable: ₹${supplierToGive.toFixed(2)}`; }
  return `🤖 Hi! I can answer questions about your business.\n\nTry asking:\n• "Show my balance"\n• "Who owes me money?"\n• "Staff attendance"\n• "Recent transactions"\n\n💡 For full AI: add GROQ_API_KEY to server/.env (free at groq.com)`;
}

module.exports = { chat };
