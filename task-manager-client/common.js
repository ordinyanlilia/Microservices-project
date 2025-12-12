// API URLs
// Update API URLs to use service names inside Docker network
const AUTH_API_URL = '/api/auth';
const TASKS_API_URL = '/api/tasks';

// Show status message
function showMessage(message, isError = false) {
    const statusElement = document.getElementById('status-message');
    if (!statusElement) return;
    
    statusElement.textContent = message;
    statusElement.className = isError ? 'error' : 'success';
    
    // Clear message after 5 seconds
    setTimeout(() => {
        statusElement.textContent = '';
        statusElement.className = '';
    }, 5000);
}

// ===== Authentication Functions =====

// Register a new user
async function register(name, email, password) {
    try {
        console.log('Registering with:', { name, email, password: '***' });
        
        const response = await fetch(`${AUTH_API_URL}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, email, password })
        });
        
        const data = await response.json();
        console.log('Register response:', data);
        
        if (!response.ok) {
            throw new Error(data.message || 'Registration failed');
        }
        
        // Save token
        localStorage.setItem('authToken', data.token);
        return true;
    } catch (error) {
        console.error('Registration error:', error);
        throw error;
    }
}

// Login user
async function login(email, password) {
    try {
        console.log('Logging in with:', { email, password: '***' });
        
        const response = await fetch(`${AUTH_API_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        console.log('Login response:', data);
        
        if (!response.ok) {
            throw new Error(data.message || 'Login failed');
        }
        
        // Save token
        localStorage.setItem('authToken', data.token);
        return true;
    } catch (error) {
        console.error('Login error:', error);
        throw error;
    }
}

// Check if user is authenticated
async function checkAuth() {
    const token = localStorage.getItem('authToken');
    if (!token) {
        return false;
    }
    
    try {
        // Verify the token is valid by making a request to profile
        const response = await fetch(`${AUTH_API_URL}/profile`, {
            headers: {
                'x-auth-token': token
            }
        });
        
        return response.ok;
    } catch (error) {
        console.error('Auth check error:', error);
        return false;
    }
}

// Get user profile
async function getUserProfile() {
    try {
        const token = localStorage.getItem('authToken');
        
        if (!token) {
            throw new Error('No authentication token');
        }
        
        const response = await fetch(`${AUTH_API_URL}/profile`, {
            headers: {
                'x-auth-token': token
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to get profile');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Get profile error:', error);
        throw error;
    }
}

// Logout user
function logout() {
    localStorage.removeItem('authToken');
    return true;
}

// ===== Task Functions =====

// Get all tasks
async function getTasks(status = '', priority = '', sortBy = '', sortOrder = '') {
    try {
        const token = localStorage.getItem('authToken');
        
        if (!token) {
            throw new Error('No authentication token');
        }
        
        // Build query string
        let url = TASKS_API_URL;
        const params = new URLSearchParams();
        
        if (status) params.append('status', status);
        if (priority) params.append('priority', priority);
        if (sortBy) params.append('sortBy', sortBy);
        if (sortOrder) params.append('sortOrder', sortOrder);
        
        const queryString = params.toString();
        if (queryString) {
            url += '?' + queryString;
        }
        
        console.log('Fetching tasks from:', url);
        
        const response = await fetch(url, {
            headers: {
                'x-auth-token': token
            }
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to fetch tasks');
        }
        
        const tasks = await response.json();
        console.log('Fetched tasks:', tasks);
        
        return tasks;
    } catch (error) {
        console.error('Get tasks error:', error);
        throw error;
    }
}

// Get a single task
async function getTask(taskId) {
    try {
        const token = localStorage.getItem('authToken');
        
        if (!token) {
            throw new Error('No authentication token');
        }
        
        console.log('Fetching task:', taskId);
        
        const response = await fetch(`${TASKS_API_URL}/${taskId}`, {
            headers: {
                'x-auth-token': token
            }
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to fetch task');
        }
        
        const task = await response.json();
        console.log('Fetched task:', task);
        
        return task;
    } catch (error) {
        console.error('Get task error:', error);
        throw error;
    }
}

// Create a new task
async function createTask(taskData) {
    try {
        const token = localStorage.getItem('authToken');
        
        if (!token) {
            throw new Error('No authentication token');
        }
        
        console.log('Creating task with data:', taskData);
        
        const response = await fetch(TASKS_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': token
            },
            body: JSON.stringify(taskData)
        });
        
        const data = await response.json();
        console.log('Create task response:', data);
        
        if (!response.ok) {
            throw new Error(data.message || 'Failed to create task');
        }
        
        return data;
    } catch (error) {
        console.error('Create task error:', error);
        throw error;
    }
}

// Update a task
async function updateTask(taskId, taskData) {
    try {
        const token = localStorage.getItem('authToken');
        
        if (!token) {
            throw new Error('No authentication token');
        }
        
        console.log('Updating task:', taskId, 'with data:', taskData);
        
        const response = await fetch(`${TASKS_API_URL}/${taskId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': token
            },
            body: JSON.stringify(taskData)
        });
        
        const data = await response.json();
        console.log('Update task response:', data);
        
        if (!response.ok) {
            throw new Error(data.message || 'Failed to update task');
        }
        
        return data;
    } catch (error) {
        console.error('Update task error:', error);
        throw error;
    }
}

// Delete a task
async function deleteTask(taskId) {
    try {
        const token = localStorage.getItem('authToken');
        
        if (!token) {
            throw new Error('No authentication token');
        }
        
        console.log('Deleting task:', taskId);
        
        const response = await fetch(`${TASKS_API_URL}/${taskId}`, {
            method: 'DELETE',
            headers: {
                'x-auth-token': token
            }
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to delete task');
        }
        
        return true;
    } catch (error) {
        console.error('Delete task error:', error);
        throw error;
    }
}
