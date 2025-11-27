// Sign up page functionality
document.addEventListener('DOMContentLoaded', function() {
    const signUpForm = document.getElementById('signUpForm');
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    
    // Validation functions
    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
    
    function validatePassword(password) {
        return password.length >= 6;
    }
    
    // Real-time validation
    nameInput.addEventListener('blur', function() {
        const nameError = document.getElementById('nameError');
        if (!nameInput.value.trim()) {
            nameError.classList.remove('hidden');
            nameInput.classList.add('border-red-500');
        } else {
            nameError.classList.add('hidden');
            nameInput.classList.remove('border-red-500');
        }
    });
    
    emailInput.addEventListener('blur', function() {
        const emailError = document.getElementById('emailError');
        if (emailInput.value && !validateEmail(emailInput.value)) {
            emailError.classList.remove('hidden');
            emailInput.classList.add('border-red-500');
        } else {
            emailError.classList.add('hidden');
            emailInput.classList.remove('border-red-500');
        }
    });
    
    passwordInput.addEventListener('blur', function() {
        const passwordError = document.getElementById('passwordError');
        if (passwordInput.value && !validatePassword(passwordInput.value)) {
            passwordError.classList.remove('hidden');
            passwordInput.classList.add('border-red-500');
        } else {
            passwordError.classList.add('hidden');
            passwordInput.classList.remove('border-red-500');
        }
    });
    
    confirmPasswordInput.addEventListener('blur', function() {
        const confirmPasswordError = document.getElementById('confirmPasswordError');
        if (confirmPasswordInput.value && confirmPasswordInput.value !== passwordInput.value) {
            confirmPasswordError.classList.remove('hidden');
            confirmPasswordInput.classList.add('border-red-500');
        } else {
            confirmPasswordError.classList.add('hidden');
            confirmPasswordInput.classList.remove('border-red-500');
        }
    });
    
    signUpForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const name = nameInput.value.trim();
        const email = emailInput.value;
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;
        
        // Validate all fields
        let isValid = true;
        
        if (!name) {
            document.getElementById('nameError').classList.remove('hidden');
            nameInput.classList.add('border-red-500');
            isValid = false;
        }
        
        if (!validateEmail(email)) {
            document.getElementById('emailError').classList.remove('hidden');
            emailInput.classList.add('border-red-500');
            isValid = false;
        }
        
        if (!validatePassword(password)) {
            document.getElementById('passwordError').classList.remove('hidden');
            passwordInput.classList.add('border-red-500');
            isValid = false;
        }
        
        if (password !== confirmPassword) {
            document.getElementById('confirmPasswordError').classList.remove('hidden');
            confirmPasswordInput.classList.add('border-red-500');
            isValid = false;
        }
        
        if (!isValid) {
            showToast('Please fix the errors and try again', 'error');
            return;
        }
        
        // Check if email already exists
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        if (users.find(u => u.email === email)) {
            showToast('Email already registered. Please sign in instead.', 'error');
            return;
        }
        
        // Create new user
        const newUser = {
            id: Date.now(),
            name,
            email,
            password,
            createdAt: new Date().toISOString(),
            watchlist: [],
            notifications: [],
            applications: [],
            messages: []
        };
        
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
        localStorage.setItem('currentUser', JSON.stringify(newUser));
        localStorage.setItem('isSignedIn', 'true');
        window.dispatchEvent(new CustomEvent('authChanged'));
        
        showToast('Account created successfully!');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
    });
});

