// Contact page functionality - OpenStreetMap with Leaflet
let map;

function initMap() {
    const mapElement = document.getElementById('map');
    if (!mapElement || typeof L === 'undefined') {
        console.log('Map element or Leaflet not available');
        return;
    }
    
    // Initialize map centered on Hollywood, CA
    map = L.map('map').setView([34.0928, -118.3287], 15);
    
    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
    }).addTo(map);
    
    // Add custom marker
    const customIcon = L.divIcon({
        className: 'custom-marker',
        html: '<div style="background-color: #dc2626; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"><span style="font-size: 20px;">🎬</span></div>',
        iconSize: [40, 40],
        iconAnchor: [20, 20]
    });
    
    const marker = L.marker([34.0928, -118.3287], { icon: customIcon }).addTo(map);
    
    marker.bindPopup(`
        <div style="color: #1f2937;">
            <h3 style="color: #dc2626; font-weight: bold; margin-bottom: 8px;">Cinema Studios</h3>
            <p style="margin: 0;">123 Cinema Street<br>Hollywood, CA 90028<br>United States</p>
        </div>
    `).openPopup();
}

// Contact form handling with validation
document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contactForm');
    if (!contactForm) return;
    
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const subjectInput = document.getElementById('subject');
    const messageInput = document.getElementById('message');
    
    // Validation functions
    function validateName(name) {
        return name.trim().length >= 2 && /^[a-zA-Z\s]+$/.test(name);
    }
    
    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
    
    function validateSubject(subject) {
        return subject.trim().length >= 3;
    }
    
    function validateMessage(message) {
        return message.trim().length >= 10;
    }
    
    // Real-time validation
    nameInput.addEventListener('blur', function() {
        const error = document.getElementById('nameError');
        if (!validateName(nameInput.value)) {
            if (!error) {
                const err = document.createElement('span');
                err.id = 'nameError';
                err.className = 'text-red-500 text-sm mt-1 block';
                err.textContent = 'Name must be at least 2 characters and contain only letters';
                nameInput.parentElement.appendChild(err);
            }
            nameInput.classList.add('border-red-500');
        } else {
            if (error) error.remove();
            nameInput.classList.remove('border-red-500');
        }
    });
    
    emailInput.addEventListener('blur', function() {
        const error = document.getElementById('emailError');
        if (!validateEmail(emailInput.value)) {
            if (!error) {
                const err = document.createElement('span');
                err.id = 'emailError';
                err.className = 'text-red-500 text-sm mt-1 block';
                err.textContent = 'Please enter a valid email address';
                emailInput.parentElement.appendChild(err);
            }
            emailInput.classList.add('border-red-500');
        } else {
            if (error) error.remove();
            emailInput.classList.remove('border-red-500');
        }
    });
    
    subjectInput.addEventListener('blur', function() {
        const error = document.getElementById('subjectError');
        if (!validateSubject(subjectInput.value)) {
            if (!error) {
                const err = document.createElement('span');
                err.id = 'subjectError';
                err.className = 'text-red-500 text-sm mt-1 block';
                err.textContent = 'Subject must be at least 3 characters';
                subjectInput.parentElement.appendChild(err);
            }
            subjectInput.classList.add('border-red-500');
        } else {
            if (error) error.remove();
            subjectInput.classList.remove('border-red-500');
        }
    });
    
    messageInput.addEventListener('blur', function() {
        const error = document.getElementById('messageError');
        if (!validateMessage(messageInput.value)) {
            if (!error) {
                const err = document.createElement('span');
                err.id = 'messageError';
                err.className = 'text-red-500 text-sm mt-1 block';
                err.textContent = 'Message must be at least 10 characters';
                messageInput.parentElement.appendChild(err);
            }
            messageInput.classList.add('border-red-500');
        } else {
            if (error) error.remove();
            messageInput.classList.remove('border-red-500');
        }
    });
    
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Remove existing errors
        document.querySelectorAll('.text-red-500').forEach(el => {
            if (el.id && el.id.includes('Error')) el.remove();
        });
        
        // Validate all fields
        let isValid = true;
        
        if (!validateName(nameInput.value)) {
            const err = document.createElement('span');
            err.id = 'nameError';
            err.className = 'text-red-500 text-sm mt-1 block';
            err.textContent = 'Name must be at least 2 characters and contain only letters';
            nameInput.parentElement.appendChild(err);
            nameInput.classList.add('border-red-500');
            isValid = false;
        }
        
        if (!validateEmail(emailInput.value)) {
            const err = document.createElement('span');
            err.id = 'emailError';
            err.className = 'text-red-500 text-sm mt-1 block';
            err.textContent = 'Please enter a valid email address';
            emailInput.parentElement.appendChild(err);
            emailInput.classList.add('border-red-500');
            isValid = false;
        }
        
        if (!validateSubject(subjectInput.value)) {
            const err = document.createElement('span');
            err.id = 'subjectError';
            err.className = 'text-red-500 text-sm mt-1 block';
            err.textContent = 'Subject must be at least 3 characters';
            subjectInput.parentElement.appendChild(err);
            subjectInput.classList.add('border-red-500');
            isValid = false;
        }
        
        if (!validateMessage(messageInput.value)) {
            const err = document.createElement('span');
            err.id = 'messageError';
            err.className = 'text-red-500 text-sm mt-1 block';
            err.textContent = 'Message must be at least 10 characters';
            messageInput.parentElement.appendChild(err);
            messageInput.classList.add('border-red-500');
            isValid = false;
        }
        
        if (!isValid) {
            showToast('Please fix the errors and try again', 'error');
            return;
        }
        
        // Form is valid, submit
        const activeUser = typeof getCurrentUser === 'function' ? getCurrentUser() : JSON.parse(localStorage.getItem('currentUser') || 'null');
        const messageRecord = {
            id: `contact-${Date.now()}`,
            name: nameInput.value.trim(),
            email: emailInput.value.trim(),
            subject: subjectInput.value.trim(),
            message: messageInput.value.trim(),
            status: 'received',
            receivedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            userId: activeUser?.id || null
        };
        if (typeof saveContactMessage === 'function') {
            saveContactMessage(messageRecord);
        }
        showToast('Thank you for your message! We will get back to you soon.');
        contactForm.reset();
        // Remove all error classes
        [nameInput, emailInput, subjectInput, messageInput].forEach(input => {
            input.classList.remove('border-red-500');
        });
    });
});

