const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
  origin: '*', // for now, allow all — tighten later if needed
}));
app.use(express.json());

// Routes
app.use('/api/teams', require('./routes/teams'));
app.use('/api/equipment', require('./routes/equipment'));
app.use('/api/requests', require('./routes/requests'));

// Health check — Railway uses this
app.get('/', (req, res) => {
  res.json({ message: 'GearGuard API is running' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
