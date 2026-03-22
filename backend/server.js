const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: '*', credentials: true, methods: ['GET','POST','PUT','DELETE','PATCH','OPTIONS'] }));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 1000 }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV !== 'production') app.use(morgan('dev'));

app.use('/api/auth',         require('./routes/authRoutes'));
app.use('/api/parties',      require('./routes/partyRoutes'));
app.use('/api/transactions', require('./routes/transactionRoutes'));
app.use('/api/staff',        require('./routes/staffRoutes'));
app.use('/api/attendance',   require('./routes/attendanceRoutes'));
app.use('/api/dashboard',    require('./routes/dashboardRoutes'));
app.use('/api/chat',         require('./routes/chatRoutes'));

app.get('/api/health', (req, res) => res.json({ status: 'ok', message: 'CreditBook API running', time: new Date() }));

app.use((req, res) => res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` }));
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({ success: false, message: err.message || 'Server Error' });
});

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/creditbook';
mongoose.connect(MONGO_URI)
  .then(() => console.log(`✅ MongoDB connected`))
  .catch(err => { console.error('❌ MongoDB error:', err.message); process.exit(1); });

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
module.exports = app;
