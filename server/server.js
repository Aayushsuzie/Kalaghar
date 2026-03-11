
// STEP 1: Import Required Libraries

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();


// STEP 2: Create Express App

const app = express();


// STEP 3: Middleware Setup

app.use(express.json());
app.use(cors());

// Log incoming requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});


// STEP 4: Database Connection

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/kalaghar';

mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));


// STEP 5: Import Routes

const authRoutes = require('./routes/auth');
const classRoutes = require('./routes/classes');



// STEP 6: Basic Routes

app.get('/', (req, res) => {
  res.json({ 
    message: 'Welcome to KalaGhar API',
    status: 'Server is running'
  });
});

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK',
    timestamp: new Date().toISOString()
  });
});


// STEP 7: Use Auth Routes

app.use('/api/auth', authRoutes);
app.use('/api/classes', classRoutes);


// STEP 8: Start Server

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`📍 Test it: http://localhost:${PORT}/api/health`);
});