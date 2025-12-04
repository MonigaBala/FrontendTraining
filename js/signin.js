// Sign in page functionality
document.addEventListener('DOMContentLoaded', function() {
    const signInForm = document.getElementById('signInForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const emailError = document.getElementById('emailError');
    const passwordError = document.getElementById('passwordError');
    
    // Email validation
    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
    
    // Password validation
    function validatePassword(password) {
        return password.length >= 6;
    }
    
    emailInput.addEventListener('blur', function() {
        if (emailInput.value && !validateEmail(emailInput.value)) {
            emailError.classList.remove('hidden');
            emailInput.classList.add('border-red-500');
        } else {
            emailError.classList.add('hidden');
            emailInput.classList.remove('border-red-500');
        }
    });
    
    passwordInput.addEventListener('blur', function() {
        if (passwordInput.value && !validatePassword(passwordInput.value)) {
            passwordError.classList.remove('hidden');
            passwordInput.classList.add('border-red-500');
        } else {
            passwordError.classList.add('hidden');
            passwordInput.classList.remove('border-red-500');
        }
    });
    
    signInForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const email = emailInput.value;
        const password = passwordInput.value;
        
        // Validate
        let isValid = true;
        
        if (!validateEmail(email)) {
            emailError.classList.remove('hidden');
            emailInput.classList.add('border-red-500');
            isValid = false;
        } else {
            emailError.classList.add('hidden');
            emailInput.classList.remove('border-red-500');
        }
        
        if (!validatePassword(password)) {
            passwordError.classList.remove('hidden');
            passwordInput.classList.add('border-red-500');
            isValid = false;
        } else {
            passwordError.classList.add('hidden');
            passwordInput.classList.remove('border-red-500');
        }
        
        if (!isValid) {
            showToast('Please fix the errors and try again', 'error');
            return;
        }
        
        // Check if user exists
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const user = users.find(u => u.email === email && u.password === password);
        
        if (user) {
            // Store current user with all their data
            // Refresh the latest user data (admin updates, messages, application status)
const usersUpdated = JSON.parse(localStorage.getItem("users") || "[]");
const latestUser = usersUpdated.find(u => u.email === email);

// Prepare user session data
const userData = {
    ...latestUser,
    lastLogin: new Date().toISOString(),
    watchlist: Array.isArray(latestUser.watchlist) ? latestUser.watchlist : [],
    notifications: Array.isArray(latestUser.notifications) ? latestUser.notifications : [],
    applications: Array.isArray(latestUser.applications) ? latestUser.applications : [],
    messages: Array.isArray(latestUser.messages) ? latestUser.messages : []
};

// Store updated user
localStorage.setItem("currentUser", JSON.stringify(userData));
localStorage.setItem("isSignedIn", "true");

// Trigger login events
window.dispatchEvent(new CustomEvent("authChanged"));
showToast("Sign in successful!");

setTimeout(() => {
    window.location.href = "/index.html";
}, 1000);

            window.dispatchEvent(new CustomEvent('authChanged'));
            showToast('Sign in successful!');
            setTimeout(() => {
                window.location.href = '/index.html';
            }, 1000);
        } else {
            showToast('Invalid email or password', 'error');
        }
    });
});

