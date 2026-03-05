/**
 * Bayan Cake - JavaScript
 * Contains Caesar cipher encryption and user authentication logic
 */

// Caesar Cipher Encryption/Decryption
const CaesarCipher = {
    // Encrypt using Caesar cipher with shift of 3
    encrypt: function(text) {
        let result = '';
        for (let i = 0; i < text.length; i++) {
            let char = text[i];
            if (char.match(/[a-z]/i)) {
                const code = text.charCodeAt(i);
                if (code >= 65 && code <= 90) {
                    // Uppercase letters
                    char = String.fromCharCode(((code - 65 + 3) % 26) + 65);
                } else if (code >= 97 && code <= 122) {
                    // Lowercase letters
                    char = String.fromCharCode(((code - 97 + 3) % 26) + 97);
                }
            }
            result += char;
        }
        return result;
    },
    
    // Decrypt using Caesar cipher with shift of 3
    decrypt: function(text) {
        let result = '';
        for (let i = 0; i < text.length; i++) {
            let char = text[i];
            if (char.match(/[a-z]/i)) {
                const code = text.charCodeAt(i);
                if (code >= 65 && code <= 90) {
                    // Uppercase letters
                    char = String.fromCharCode(((code - 65 - 3 + 26) % 26) + 65);
                } else if (code >= 97 && code <= 122) {
                    // Lowercase letters
                    char = String.fromCharCode(((code - 97 - 3 + 26) % 26) + 97);
                }
            }
            result += char;
        }
        return result;
    }
};

// User Management
const UserManager = {
    // Get users from localStorage
    getUsers: function() {
        const users = localStorage.getItem('bayanUsers');
        return users ? JSON.parse(users) : [];
    },
    
    // Save users to localStorage
    saveUsers: function(users) {
        localStorage.setItem('bayanUsers', JSON.stringify(users));
    },
    
    // Register new user
    register: function(username, email, password) {
        const users = this.getUsers();
        
        // Check if username or email already exists
        const existingUser = users.find(u => u.username === username || u.email === email);
        if (existingUser) {
            return { success: false, message: 'Username or email already exists!' };
        }
        
        // Encrypt password before storing
        const encryptedPassword = CaesarCipher.encrypt(password);
        
        // Create new user
        const newUser = {
            id: Date.now(),
            username: username,
            email: email,
            password: encryptedPassword,
            createdAt: new Date().toISOString()
        };
        
        users.push(newUser);
        this.saveUsers(users);
        
        return { success: true, message: 'Account created successfully!' };
    },
    
    // Login user
    login: function(usernameOrEmail, password) {
        const users = this.getUsers();
        
        // Find user by username or email
        const user = users.find(u => 
            u.username === usernameOrEmail || u.email === usernameOrEmail
        );
        
        if (!user) {
            return { success: false, message: 'User not found!' };
        }
        
        // Encrypt input password and compare
        const encryptedPassword = CaesarCipher.encrypt(password);
        
        if (user.password === encryptedPassword) {
            // Store current user session
            sessionStorage.setItem('currentUser', JSON.stringify({
                id: user.id,
                username: user.username,
                email: user.email
            }));
            return { success: true, message: 'Login successful!' };
        } else {
            return { success: false, message: 'Invalid password!' };
        }
    },
    
    // Logout user
    logout: function() {
        sessionStorage.removeItem('currentUser');
    },
    
    // Get current logged in user
    getCurrentUser: function() {
        const user = sessionStorage.getItem('currentUser');
        return user ? JSON.parse(user) : null;
    },
    
    // Check if user is logged in
    isLoggedIn: function() {
        return this.getCurrentUser() !== null;
    }
};

// UI Helper Functions
const UI = {
    // Show alert message
    showAlert: function(message, type) {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type}`;
        alertDiv.textContent = message;
        
        const container = document.querySelector('.form-container') || document.querySelector('main');
        if (container) {
            container.insertBefore(alertDiv, container.firstChild);
            setTimeout(() => alertDiv.remove(), 3000);
        }
    },
    
    // Update welcome message
    updateWelcomeMessage: function() {
        const welcomeMsg = document.getElementById('welcomeMessage');
        const user = UserManager.getCurrentUser();
        
        if (welcomeMsg && user) {
            welcomeMsg.innerHTML = `Welcome, <span>${user.username}</span>! <button onclick="UserManager.logout(); window.location.href='index.html';" class="btn btn-small">Logout</button>`;
            welcomeMsg.style.display = 'block';
        }
    },
    
    // Redirect if not logged in
    requireAuth: function() {
        if (!UserManager.isLoggedIn()) {
            window.location.href = 'login.html';
            return false;
        }
        return true;
    }
};

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    // Update welcome message on all pages
    UI.updateWelcomeMessage();
});

// Form handling for Login
if (window.location.pathname.includes('login.html')) {
    document.getElementById('loginForm')?.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const usernameOrEmail = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        
        if (!usernameOrEmail || !password) {
            UI.showAlert('Please fill in all fields!', 'error');
            return;
        }
        
        const result = UserManager.login(usernameOrEmail, password);
        
        if (result.success) {
            UI.showAlert(result.message, 'success');
            setTimeout(() => {
                window.location.href = 'cakes.html';
            }, 1000);
        } else {
            UI.showAlert(result.message, 'error');
        }
    });
}

// Form handling for Registration
if (window.location.pathname.includes('register.html')) {
    document.getElementById('registerForm')?.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value.trim();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        if (!username || !email || !password || !confirmPassword) {
            UI.showAlert('Please fill in all fields!', 'error');
            return;
        }
        
        if (password !== confirmPassword) {
            UI.showAlert('Passwords do not match!', 'error');
            return;
        }
        
        if (password.length < 6) {
            UI.showAlert('Password must be at least 6 characters!', 'error');
            return;
        }
        
        const result = UserManager.register(username, email, password);
        
        if (result.success) {
            UI.showAlert(result.message, 'success');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1500);
        } else {
            UI.showAlert(result.message, 'error');
        }
    });
}

// Protect cake pages
if (window.location.pathname.includes('cakes.html') || 
    window.location.pathname.includes('chocolate.html') ||
    window.location.pathname.includes('strawberry.html') ||
    window.location.pathname.includes('vanilla.html')) {
    
    // Note: For demo purposes, we'll allow access to cakes page
    // In production, uncomment the line below:
    // if (!UI.requireAuth()) return;
}

// Logout function (called from HTML)
function logout() {
    UserManager.logout();
    window.location.href = 'index.html';
}

