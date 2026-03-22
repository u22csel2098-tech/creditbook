const express = require('express');
const mongoose = require('mongoose');
const morgan   = require('morgan');
require('dotenv').config();

const app = express();

// CORS — manual headers, works with any origin
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,PATCH,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();
  next();
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

app.use('/api/auth',         require('./routes/authRoutes'));
app.use('/api/parties',      require('./routes/partyRoutes'));
app.use('/api/transactions', require('./routes/transactionRoutes'));
app.use('/api/staff',        require('./routes/staffRoutes'));
app.use('/api/attendance',   require('./routes/attendanceRoutes'));
app.use('/api/dashboard',    require('./routes/dashboardRoutes'));
app.use('/api/chat',         require('./routes/chatRoutes'));

app.get('/api/health', (_req, res) => res.json({ status: 'ok', message: 'CreditBook API running', time: new Date() }));

app.use((req, res) => res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` }));
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: err.message || 'Server Error' });
});

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/creditbook';
mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => { console.error('❌ MongoDB error:', err.message); process.exit(1); });

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
module.exports = app;
