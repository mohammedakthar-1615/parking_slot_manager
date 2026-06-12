const express = require('express');
const cors = require('cors');
const db = require('./config/db');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', require('./routes/auth'));
app.use('/api/slots', require('./routes/slots'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/complaints', require('./routes/complaints'));

// Test DB connection on startup
db.query('SELECT NOW()')
  .then(() => console.log('PostgreSQL connected ✅'))
  .catch(err => console.error('DB connection failed ❌', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));