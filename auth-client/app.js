// API URL - Update this to match your auth service
const AUTH_API_URL = '/api/auth';

// DOM Elements ya
const registerForm = document.getElementById('register-form');
const loginForm = document.getElementById('login-form');
const registerContainer = document.getElementById('register-container');
const loginContainer = document.getElementById('login-container');
const authForms = document.getElementById('auth-forms');
const profileContainer = document.getElementById('profile-container');
const profileInfo = document.getElementById('profile-info');
const logoutBtn = document.getElementById('logout-btn');
const showLoginBtn = document.getElementById('show-login');
const showRegisterBtn = document.getElementById('show-register');
const statusMessage = document.getElementById('status-message');

// Show login or register form
showLoginBtn.addEventListener('click', (e) => {
    e.preventDefault();
    registerContainer.classList.add('hidden');
    loginContainer.classList.remove('hidden');
});

showRegisterBtn.addEventListener('click', (e) => {
    e.preventDefault();
    loginContainer.classList.add('hidden');
    registerContainer.classList.remove('hidden');
});

// Display status message
function showMessage(message, isError = false) {
    statusMessage.textContent = message;
    statusMessage.className = isError ? 'error' : 'success';
    
    // Clear message after 3 seconds
    setTimeout(() => {
        statusMessage.textContent = '';
        statusMessage.className = '';
    }, 3000);
}

// Check if user is logged in
function checkAuth() {
    const token = localStorage.getItem('authToken');
    
    if (token) {
        // User is logged in, show profile
        authForms.classList.add('hidden');
        profileContainer.classList.remove('hidden');
        fetchProfile();
    } else {
        // User is not logged in, show auth forms
        authForms.classList.remove('hidden');
        profileContainer.classList.add('hidden');
        // Default to login view
        registerContainer.classList.add('hidden');
        loginContainer.classList.remove('hidden');
    }
}

// Fetch user profile
async function fetchProfile() {
    try {
        const token = localStorage.getItem('authToken');
        
        if (!token) {
            return;
        }
        
        const response = await fetch(`${API_URL}/profile`, {
            method: 'GET',
            headers: {
                'x-auth-token': token
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch profile');
        }
        
        const userData = await response.json();
        
        // Display user info
        profileInfo.innerHTML = `
            <p><strong>Name:</strong> ${userData.name}</p>
            <p><strong>Email:</strong> ${userData.email}</p>
            <p><strong>Account Created:</strong> ${new Date(userData.createdAt).toLocaleString()}</p>
        `;
        
    } catch (error) {
        console.error('Error fetching profile:', error);
        showMessage('Error loading profile. Please login again.', true);
        logout();
    }
}

// Register new user
registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    
    try {
        const response = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, email, password })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Registration failed');
        }
        
        // Save token and update UI
        localStorage.setItem('authToken', data.token);
        showMessage('Registration successful!');
        checkAuth();
        
        // Clear form
        registerForm.reset();
        
    } catch (error) {
        console.error('Registration error:', error);
        showMessage(error.message || 'Registration failed. Please try again.', true);
    }
});

// Login user
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    try {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Login failed');
        }
        
        // Save token and update UI
        localStorage.setItem('authToken', data.token);
        showMessage('Login successful!');
        checkAuth();
        
        // Clear form
        loginForm.reset();
        
    } catch (error) {
        console.error('Login error:', error);
        showMessage(error.message || 'Login failed. Please check your credentials.', true);
    }
});

// Logout user
function logout() {
    localStorage.removeItem('authToken');
    showMessage('Logged out successfully');
    checkAuth();
}

logoutBtn.addEventListener('click', logout);

// Initialize app - check if user is logged in
document.addEventListener('DOMContentLoaded', checkAuth);
