// API Base URL
const API_BASE = 'http://localhost:3000/api';

// DOM Elements
const loginScreen = document.getElementById('loginScreen');
const dashboardScreen = document.getElementById('dashboardScreen');
const loginForm = document.getElementById('loginForm');
const loginBtn = document.getElementById('loginBtn');
const btnText = loginBtn.querySelector('.btn-text');
const btnLoader = loginBtn.querySelector('.btn-loader');
const errorAlert = document.getElementById('errorAlert');
const logoutBtn = document.getElementById('logoutBtn');

// Input fields
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const rememberMeCheckbox = document.getElementById('rememberMe');

// Dashboard elements
const userName = document.getElementById('userName');
const userRole = document.getElementById('userRole');
const displayUsername = document.getElementById('displayUsername');
const displayToken = document.getElementById('displayToken');
const displayLoginTime = document.getElementById('displayLoginTime');
const displayUserId = document.getElementById('displayUserId');
const apiResponse = document.getElementById('apiResponse');

// Demo buttons
const demoBtns = document.querySelectorAll('.demo-btn');

// Check for existing token on load
window.addEventListener('load', () => {
  const token = localStorage.getItem('authToken');
  if (token) {
    verifyToken(token);
  }

  // Load remembered username
  const savedUsername = localStorage.getItem('rememberedUsername');
  if (savedUsername) {
    usernameInput.value = savedUsername;
    rememberMeCheckbox.checked = true;
  }
});

// Login form submit
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const username = usernameInput.value.trim();
  const password = passwordInput.value.trim();

  if (!username || !password) {
    showError('Please enter username and password');
    return;
  }

  await login(username, password);
});

// Demo account buttons
demoBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const username = btn.dataset.user;
    const password = btn.dataset.pass;
    
    usernameInput.value = username;
    passwordInput.value = password;
    
    login(username, password);
  });
});

// Logout button
logoutBtn.addEventListener('click', async () => {
  await logout();
});

// API Functions

async function login(username, password) {
  setLoading(true);
  hideError();

  try {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password })
    });

    const data = await response.json();

    if (data.success) {
      // Save token
      localStorage.setItem('authToken', data.data.token);
      
      // Remember username if checked
      if (rememberMeCheckbox.checked) {
        localStorage.setItem('rememberedUsername', username);
      } else {
        localStorage.removeItem('rememberedUsername');
      }

      // Show dashboard
      showDashboard(data.data);
      
      // Display full API response
      apiResponse.textContent = JSON.stringify(data, null, 2);
      
    } else {
      showError(data.message);
    }

  } catch (error) {
    console.error('Login error:', error);
    showError('Network error. Please check if the server is running.');
  } finally {
    setLoading(false);
  }
}

async function verifyToken(token) {
  try {
    const response = await fetch(`${API_BASE}/auth/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ token })
    });

    const data = await response.json();

    if (data.success) {
      showDashboard({
        token: token,
        user: data.data.user
      });
    } else {
      localStorage.removeItem('authToken');
    }

  } catch (error) {
    console.error('Verify error:', error);
    localStorage.removeItem('authToken');
  }
}

async function logout() {
  const token = localStorage.getItem('authToken');

  try {
    await fetch(`${API_BASE}/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ token })
    });

  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    localStorage.removeItem('authToken');
    showLoginScreen();
  }
}

// UI Functions

function showDashboard(data) {
  loginScreen.classList.remove('active');
  dashboardScreen.classList.add('active');

  // Populate dashboard
  userName.textContent = data.user.name;
  userRole.textContent = data.user.role;
  displayUsername.textContent = data.user.username;
  displayToken.textContent = data.token;
  displayLoginTime.textContent = data.user.loginTime ? 
    new Date(data.user.loginTime).toLocaleString() : 
    new Date().toLocaleString();
  displayUserId.textContent = data.user.userId || data.user.id;

  // Clear form
  passwordInput.value = '';
}

function showLoginScreen() {
  dashboardScreen.classList.remove('active');
  loginScreen.classList.add('active');
  
  // Clear form
  passwordInput.value = '';
  hideError();
}

function setLoading(isLoading) {
  loginBtn.disabled = isLoading;
  
  if (isLoading) {
    btnText.classList.add('hidden');
    btnLoader.classList.remove('hidden');
  } else {
    btnText.classList.remove('hidden');
    btnLoader.classList.add('hidden');
  }
}

function showError(message) {
  errorAlert.textContent = message;
  errorAlert.classList.remove('hidden');
}

function hideError() {
  errorAlert.classList.add('hidden');
  errorAlert.textContent = '';
}
