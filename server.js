const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Sample users (in-memory, no database)
const users = [
  { id: 1, username: 'admin', password: 'admin123', role: 'admin', name: 'Administrator' },
  { id: 2, username: 'user1', password: 'pass123', role: 'user', name: 'John Doe' },
  { id: 3, username: 'user2', password: 'pass123', role: 'user', name: 'Jane Smith' }
];

// Active sessions (simulating token storage)
const sessions = new Map();

// Generate simple token
function generateToken() {
  return 'token_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// API: Login endpoint
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;

  // Validation
  if (!username || !password) {
    return res.status(400).json({
      success: false,
      message: 'Username and password are required',
      code: 'MISSING_CREDENTIALS'
    });
  }

  // Find user
  const user = users.find(u => u.username === username);
  
  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Invalid username or password',
      code: 'INVALID_CREDENTIALS'
    });
  }

  // Check password
  if (user.password !== password) {
    return res.status(401).json({
      success: false,
      message: 'Invalid username or password',
      code: 'INVALID_CREDENTIALS'
    });
  }

  // Generate token and session
  const token = generateToken();
  const sessionData = {
    userId: user.id,
    username: user.username,
    name: user.name,
    role: user.role,
    loginTime: new Date().toISOString()
  };
  
  sessions.set(token, sessionData);

  // Return success with token
  res.json({
    success: true,
    message: 'Login successful',
    data: {
      token: token,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role
      }
    }
  });
});

// API: Verify token
app.post('/api/auth/verify', (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({
      success: false,
      message: 'Token is required',
      code: 'MISSING_TOKEN'
    });
  }

  const session = sessions.get(token);

  if (!session) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
      code: 'INVALID_TOKEN'
    });
  }

  res.json({
    success: true,
    data: {
      user: session
    }
  });
});

// API: Logout
app.post('/api/auth/logout', (req, res) => {
  const { token } = req.body;

  if (token && sessions.has(token)) {
    sessions.delete(token);
  }

  res.json({
    success: true,
    message: 'Logout successful'
  });
});

// API: Get user info
app.get('/api/user/info', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized',
      code: 'NO_TOKEN'
    });
  }

  const session = sessions.get(token);

  if (!session) {
    return res.status(401).json({
      success: false,
      message: 'Invalid token',
      code: 'INVALID_TOKEN'
    });
  }

  res.json({
    success: true,
    data: {
      user: session
    }
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    activeSessions: sessions.size
  });
});

app.listen(PORT, () => {
  console.log(`\n🚀 API Server running on http://localhost:${PORT}`);
  console.log(`\n📋 Available Endpoints:`);
  console.log(`   POST   /api/auth/login`);
  console.log(`   POST   /api/auth/verify`);
  console.log(`   POST   /api/auth/logout`);
  console.log(`   GET    /api/user/info`);
  console.log(`   GET    /api/health`);
  console.log(`\n👤 Test Users:`);
  console.log(`   username: admin,  password: admin123`);
  console.log(`   username: user1,  password: pass123`);
  console.log(`   username: user2,  password: pass123`);
  console.log(`\n🌐 Open: http://localhost:${PORT}\n`);
});
