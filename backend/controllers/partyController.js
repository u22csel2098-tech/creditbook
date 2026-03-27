const Party = require('../models/Party');
const Transaction = require('../models/Transaction');

const getParties = async (req, res) => {
  try {
    const { type, search } = req.query;
    const q = { userId: req.user._id, isActive: true };
    if (type) q.type = type;
    if (search) q.name = { $regex: search, $options: 'i' };
    const data = await Party.find(q).sort({ updatedAt: -1 }).lean();
    res.json({ success: true, count: data.length, data });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

const getParty = async (req, res) => {
  try {
    const party = await Party.findOne({ _id: req.params.id, userId: req.user._id });
    if (!party) return res.status(404).json({ success: false, message: 'Party not found.' });
    const transactions = await Transaction.find({ partyId: req.params.id, userId: req.user._id }).sort({ date: -1 }).lean();
    res.json({ success: true, data: { party, transactions } });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

const createParty = async (req, res) => {
  try {
    const { name, phone, email, address, type, notes } = req.body;
    if (!name?.trim() || !type?.trim()) return res.status(400).json({ success: false, message: 'Name and type required.' });
    const data = await Party.create({ userId: req.user._id, name: name.trim(), phone: phone?.trim() || '', email: email?.trim() || '', address: address?.trim() || '', type: type.trim().toLowerCase(), notes: notes?.trim() || '' });
    res.status(201).json({ success: true, data });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

const updateParty = async (req, res) => {
  try {
    const update = { ...req.body };
    if (update.type) update.type = update.type.trim().toLowerCase();
    const data = await Party.findOneAndUpdate({ _id: req.params.id, userId: req.user._id }, update, { new: true });
    if (!data) return res.status(404).json({ success: false, message: 'Party not found.' });
    res.json({ success: true, data });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

const deleteParty = async (req, res) => {
  try {
    const party = await Party.findOne({ _id: req.params.id, userId: req.user._id });
    if (!party) return res.status(404).json({ success: false, message: 'Party not found.' });
    await Party.findByIdAndUpdate(req.params.id, { isActive: false });
    await Transaction.deleteMany({ partyId: req.params.id });
    res.json({ success: true, message: 'Deleted.' });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

const getSummaryTotals = async (req, res) => {
  try {
    const parties = await Party.find({ userId: req.user._id, isActive: true }).lean();
    const totalToGet  = parties.filter(p => p.balance > 0).reduce((s, p) => s + p.balance, 0);
    const totalToGive = parties.filter(p => p.balance < 0).reduce((s, p) => s + Math.abs(p.balance), 0);
    const byType = {};
    parties.forEach(p => {
      const t = p.type || 'other';
      if (!byType[t]) byType[t] = { count: 0, toGet: 0, toGive: 0 };
      byType[t].count++;
      if (p.balance > 0) byType[t].toGet += p.balance;
      else if (p.balance < 0) byType[t].toGive += Math.abs(p.balance);
    });
    res.json({
      success: true,
      data: {
        totalCount:  parties.length,
        totalToGet:  +totalToGet.toFixed(2),
        totalToGive: +totalToGive.toFixed(2),
        byType,
      }
    });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

module.exports = { getParties, getParty, createParty, updateParty, deleteParty, getSummaryTotals };
