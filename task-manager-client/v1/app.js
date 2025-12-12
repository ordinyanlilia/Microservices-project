// API URLs
const AUTH_API_URL = 'http://localhost:3000/api/auth';
const TASKS_API_URL = 'http://localhost:3001/api/tasks';

// DOM Elements - Auth
const registerForm = document.getElementById('register-form');
const loginForm = document.getElementById('login-form');
const registerContainer = document.getElementById('register-container');
const loginContainer = document.getElementById('login-container');
const authForms = document.getElementById('auth-forms');
const appContainer = document.getElementById('app-container');
const logoutBtn = document.getElementById('logout-btn');
const showLoginBtn = document.getElementById('show-login');
const showRegisterBtn = document.getElementById('show-register');
const statusMessage = document.getElementById('status-message');
const userName = document.getElementById('user-name');

// DOM Elements - Tasks
const addTaskForm = document.getElementById('add-task-form');
const tasksList = document.getElementById('tasks-list');
const filterStatus = document.getElementById('filter-status');
const filterPriority = document.getElementById('filter-priority');
const sortBy = document.getElementById('sort-by');
const sortOrder = document.getElementById('sort-order');
const applyFiltersBtn = document.getElementById('apply-filters-btn');
const editTaskModal = document.getElementById('edit-task-modal');
const editTaskForm = document.getElementById('edit-task-form');
const closeModal = document.querySelector('.close-modal');

// State
let currentUser = null;
let currentTasks = [];

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
        // User is logged in, show app
        authForms.classList.add('hidden');
        appContainer.classList.remove('hidden');
        fetchUserProfile();
        fetchTasks();
    } else {
        // User is not logged in, show auth forms
        authForms.classList.remove('hidden');
        appContainer.classList.add('hidden');
        // Default to login view
        registerContainer.classList.add('hidden');
        loginContainer.classList.remove('hidden');
    }
}

// Register new user
registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    
    try {
        const response = await fetch(`${AUTH_API_URL}/register`, {
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
        const response = await fetch(`${AUTH_API_URL}/login`, {
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

// Fetch user profile
async function fetchUserProfile() {
    try {
        const token = localStorage.getItem('authToken');
        
        if (!token) {
            return;
        }
        
        const response = await fetch(`${AUTH_API_URL}/profile`, {
            method: 'GET',
            headers: {
                'x-auth-token': token
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch profile');
        }
        
        const userData = await response.json();
        currentUser = userData;
        
        // Display user name
        userName.textContent = userData.name;
        
    } catch (error) {
        console.error('Error fetching profile:', error);
        showMessage('Error loading profile. Please login again.', true);
        logout();
    }
}

// Logout user
function logout() {
    localStorage.removeItem('authToken');
    showMessage('Logged out successfully');
    currentUser = null;
    checkAuth();
}

logoutBtn.addEventListener('click', logout);

// Fetch tasks with filters
async function fetchTasks() {
    try {
        const token = localStorage.getItem('authToken');
        
        if (!token) {
            return;
        }
        
        // Build query string from filters
        const status = filterStatus.value;
        const priority = filterPriority.value;
        const sortByValue = sortBy.value;
        const sortOrderValue = sortOrder.value;
        
        let url = `${TASKS_API_URL}?`;
        if (status) url += `status=${status}&`;
        if (priority) url += `priority=${priority}&`;
        if (sortByValue) url += `sortBy=${sortByValue}&`;
        if (sortOrderValue) url += `sortOrder=${sortOrderValue}&`;
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'x-auth-token': token
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch tasks');
        }
        
        const tasks = await response.json();
        currentTasks = tasks;
        
        renderTasks(tasks);
        
    } catch (error) {
        console.error('Error fetching tasks:', error);
        showMessage('Error loading tasks', true);
    }
}

// Apply filters
applyFiltersBtn.addEventListener('click', fetchTasks);

// Render tasks list
function renderTasks(tasks) {
    tasksList.innerHTML = '';
    
    if (tasks.length === 0) {
        tasksList.innerHTML = '<p>No tasks found. Add your first task!</p>';
        return;
    }
    
    tasks.forEach(task => {
        const taskElement = document.createElement('div');
        taskElement.className = 'task-item';
        
        // Format date for display
        const createdDate = new Date(task.createdAt).toLocaleString();
        let dueDate = 'No due date';
        if (task.dueDate) {
            dueDate = new Date(task.dueDate).toLocaleString();
        }
        
        taskElement.innerHTML = `
    <div class="task-header">
        <div class="task-title">${task.title}</div>
        <div class="task-actions">
            <button class="edit-btn" data-id="${task._id}">Edit</button>
            <button class="delete-btn" data-id="${task._id}">Delete</button>
        </div>
    </div>
    <div class="task-details">
        <div class="task-description">${task.description || 'No description'}</div>
        <div class="task-meta">
            <div>
                <span class="task-status status-${task.status}">${task.status}</span>
                <span class="task-priority priority-${task.priority}">${task.priority}</span>
            </div>
            <div>
                <div>Due: ${dueDate}</div>
                <div>Created: ${createdDate}</div>
            </div>
        </div>
    </div>
`;

        // Add event listeners to buttons
        taskElement.querySelector('.edit-btn').addEventListener('click', () => openEditModal(task));
        taskElement.querySelector('.delete-btn').addEventListener('click', () => deleteTask(task._id));
        
        tasksList.appendChild(taskElement);
    });
}

// Create a new task
addTaskForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const title = document.getElementById('task-title').value;
    const description = document.getElementById('task-description').value;
    const dueDate = document.getElementById('task-due-date').value;
    const priority = document.getElementById('task-priority').value;
    const status = document.getElementById('task-status').value;
    
    try {
        const token = localStorage.getItem('authToken');
        
        const response = await fetch(TASKS_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': token
            },
            body: JSON.stringify({
                title,
                description,
                dueDate: dueDate || null,
                priority,
                status
            })
        });
        
        if (!response.ok) {
            throw new Error('Failed to create task');
        }
        
        showMessage('Task created successfully');
        addTaskForm.reset();
        fetchTasks();
        
    } catch (error) {
        console.error('Error creating task:', error);
        showMessage('Error creating task', true);
    }
});

// Delete a task
async function deleteTask(taskId) {
    if (!confirm('Are you sure you want to delete this task?')) {
        return;
    }
    
    try {
        const token = localStorage.getItem('authToken');
        
        const response = await fetch(`${TASKS_API_URL}/${taskId}`, {
            method: 'DELETE',
            headers: {
                'x-auth-token': token
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to delete task');
        }
        
        showMessage('Task deleted successfully');
        fetchTasks();
        
    } catch (error) {
        console.error('Error deleting task:', error);
        showMessage('Error deleting task', true);
    }
}

// Open edit modal
function openEditModal(task) {
    document.getElementById('edit-task-id').value = task._id;
    document.getElementById('edit-task-title').value = task.title;
    document.getElementById('edit-task-description').value = task.description || '';
    
    // Format date for datetime-local input
    if (task.dueDate) {
        const dueDate = new Date(task.dueDate);
        // Format: YYYY-MM-DDThh:mm
        const formattedDate = dueDate.toISOString().slice(0, 16);
        document.getElementById('edit-task-due-date').value = formattedDate;
    } else {
        document.getElementById('edit-task-due-date').value = '';
    }
    
    document.getElementById('edit-task-priority').value = task.priority;
    document.getElementById('edit-task-status').value = task.status;
    
    editTaskModal.classList.remove('hidden');
}

// Close modal
closeModal.addEventListener('click', () => {
    editTaskModal.classList.add('hidden');
});

// Close modal when clicking outside
window.addEventListener('click', (e) => {
    if (e.target === editTaskModal) {
        editTaskModal.classList.add('hidden');
    }
});

// Update task
editTaskForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const taskId = document.getElementById('edit-task-id').value;
    const title = document.getElementById('edit-task-title').value;
    const description = document.getElementById('edit-task-description').value;
    const dueDate = document.getElementById('edit-task-due-date').value;
    const priority = document.getElementById('edit-task-priority').value;
    const status = document.getElementById('edit-task-status').value;
    
    try {
        const token = localStorage.getItem('authToken');
        
        const response = await fetch(`${TASKS_API_URL}/${taskId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': token
            },
            body: JSON.stringify({
                title,
                description,
                dueDate: dueDate || null,
                priority,
                status
            })
        });
        
        if (!response.ok) {
            throw new Error('Failed to update task');
        }
        
        showMessage('Task updated successfully');
        editTaskModal.classList.add('hidden');
        fetchTasks();
        
    } catch (error) {
        console.error('Error updating task:', error);
        showMessage('Error updating task', true);
    }
});

// Initialize app - check if user is logged in
document.addEventListener('DOMContentLoaded', checkAuth);
