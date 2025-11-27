// Careers page functionality
const jobListings = [
    {
        id: 1,
        title: "Film Director",
        department: "Production",
        location: "Los Angeles, CA",
        type: "Full-time",
        description: "We're seeking an experienced film director to lead our upcoming projects. Must have 5+ years of experience and a strong portfolio."
    },
    {
        id: 2,
        title: "Cinematographer",
        department: "Production",
        location: "Los Angeles, CA",
        type: "Full-time",
        description: "Join our visual team as a cinematographer. Experience with digital and film cameras required. Portfolio submission necessary."
    },
    {
        id: 3,
        title: "Video Editor",
        department: "Post-Production",
        location: "Remote / Los Angeles, CA",
        type: "Full-time",
        description: "Seeking a creative video editor proficient in Adobe Premiere Pro, Final Cut Pro, and After Effects. 3+ years experience required."
    },
    {
        id: 4,
        title: "Production Assistant",
        department: "Production",
        location: "Los Angeles, CA",
        type: "Full-time",
        description: "Entry-level position for those looking to start their career in film production. Great learning opportunity with hands-on experience."
    },
    {
        id: 5,
        title: "Marketing Manager",
        department: "Marketing",
        location: "Los Angeles, CA",
        type: "Full-time",
        description: "Lead our marketing efforts for film releases. Experience in entertainment marketing and social media management required."
    },
    {
        id: 6,
        title: "Sound Designer",
        department: "Post-Production",
        location: "Los Angeles, CA",
        type: "Full-time",
        description: "Create immersive audio experiences for our films. Proficiency in Pro Tools and sound design software required."
    }
];

const DOC_MAX_SIZE = 5 * 1024 * 1024; // 5MB
const DOC_ALLOWED_EXTENSIONS = ['pdf', 'doc', 'docx', 'txt'];

document.addEventListener('DOMContentLoaded', function() {
    loadJobListings();
});

function loadJobListings() {
    const container = document.getElementById('jobListings');
    if (!container) return;
    
    // Change container to grid layout
    container.className = 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6';
    
    jobListings.forEach((job, index) => {
        const jobCard = createJobCard(job);
        jobCard.style.animationDelay = `${index * 0.1}s`;
        jobCard.classList.add('animate-fade-in');
        container.appendChild(jobCard);
    });
}

function createJobCard(job) {
    const card = document.createElement('div');
    card.className = 'service-card';
    card.innerHTML = `
        <div class="mb-4">
            <h3 class="text-2xl font-bold mb-2">${job.title}</h3>
            <div class="flex flex-wrap gap-2 text-sm text-gray-400 mb-3">
                <span><i class="fas fa-building"></i> ${job.department}</span>
                <span><i class="fas fa-map-marker-alt"></i> ${job.location}</span>
                <span><i class="fas fa-briefcase"></i> ${job.type}</span>
            </div>
        </div>
        <p class="text-gray-400 mb-4">${job.description}</p>
        <button onclick="applyForJob(${job.id})" class="btn-primary">Apply</button>
    `;
    return card;
}

function applyForJob(jobId) {
    const job = jobListings.find(j => j.id === jobId);
    if (!job) return;
    
    // Create application form modal
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4';
    modal.innerHTML = `
        <div class="bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div class="p-6">
                <div class="flex justify-between items-center mb-6">
                    <h2 class="text-3xl font-bold">Apply for ${job.title}</h2>
                    <button onclick="this.closest('.fixed').remove()" class="text-gray-400 hover:text-white">
                        <i class="fas fa-times text-2xl"></i>
                    </button>
                </div>
                <form id="jobApplicationForm" class="space-y-4">
                    <input type="hidden" id="jobId" value="${job.id}">
                    <input type="hidden" id="jobTitle" value="${job.title}">
                    
                    <div class="form-group">
                        <label for="applicantName">Full Name *</label>
                        <input type="text" id="applicantName" name="applicantName" required>
                        <span class="text-red-500 text-sm hidden" id="applicantNameError"></span>
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div class="form-group">
                            <label for="applicantEmail">Email *</label>
                            <input type="email" id="applicantEmail" name="applicantEmail" required>
                            <span class="text-red-500 text-sm hidden" id="applicantEmailError"></span>
                        </div>
                        <div class="form-group">
                            <label for="applicantPhone">Phone *</label>
                            <input type="tel" id="applicantPhone" name="applicantPhone" required>
                            <span class="text-red-500 text-sm hidden" id="applicantPhoneError"></span>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label for="applicantAddress">Address *</label>
                        <input type="text" id="applicantAddress" name="applicantAddress" required>
                        <span class="text-red-500 text-sm hidden" id="applicantAddressError"></span>
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div class="form-group">
                            <label for="applicantExperience">Years of Experience *</label>
                            <input type="number" id="applicantExperience" name="applicantExperience" min="0" required>
                            <span class="text-red-500 text-sm hidden" id="applicantExperienceError"></span>
                        </div>
                        <div class="form-group">
                            <label for="applicantFocus">Primary Expertise *</label>
                            <input type="text" id="applicantFocus" name="applicantFocus" placeholder="e.g., Cinematography, Editing" required>
                            <span class="text-red-500 text-sm hidden" id="applicantFocusError"></span>
                        </div>
                    </div>
                    
                    <div class="form-group upload-area" id="resumeUploadArea">
                        <label for="applicantResume">Upload CV / Resume *</label>
                        <div id="resumeDropZone" class="drop-zone">
                            <p>Drag & drop your resume here <br> or</p>
                            <button type="button" onclick="document.getElementById('applicantResume').click()" class="upload-btn">
                                Browse File
                            </button>
                            <input type="file" id="applicantResume" name="applicantResume" accept=".pdf,.doc,.docx,.txt" required hidden>
                        </div>
                        <p class="text-xs text-gray-400 mt-2">Accepted formats: PDF/DOC/DOCX/TXT • Max 5MB</p>
                        <p id="resumeFileName" class="text-sm text-green-400 mt-2 hidden"></p>
                        <span id="resumeUploadError" class="text-red-500 text-sm hidden"></span>
                    </div>
                    
                    
                    
                    
                    <div class="flex gap-4">
                        <button type="submit" class="btn-primary flex-1">Submit Application</button>
                        <button type="button" onclick="this.closest('.fixed').remove()" class="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition">Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    const resumeDropZone = modal.querySelector('#resumeDropZone');
    const resumeInput = modal.querySelector('#applicantResume');
    const resumeLabel = modal.querySelector('#resumeFileName');
    const resumeError = modal.querySelector('#resumeUploadError');
    
    const MAX_UPLOAD_SIZE = 5 * 1024 * 1024;
    const allowedExtensions = /\.(pdf|doc|docx|txt)$/i;
    let resumePayload = null;
    
    function processFile(file, labelEl, errorEl, setter) {
        if (!file) return;
        if (file.size > MAX_UPLOAD_SIZE) {
            errorEl.textContent = 'File size must be under 5MB';
            errorEl.classList.remove('hidden');
            labelEl.classList.add('hidden');
            setter(null);
            return;
        }
        if (!allowedExtensions.test(file.name)) {
            errorEl.textContent = 'Unsupported format. Use PDF/DOC/DOCX/TXT';
            errorEl.classList.remove('hidden');
            labelEl.classList.add('hidden');
            setter(null);
            return;
        }
        errorEl.classList.add('hidden');
        labelEl.textContent = `${file.name} (${(file.size / 1024).toFixed(0)} KB)`;
        labelEl.classList.remove('hidden');
        const reader = new FileReader();
        reader.onload = () => {
            setter({
                name: file.name,
                type: file.type || 'application/octet-stream',
                size: file.size,
                data: reader.result
            });
        };
        reader.readAsDataURL(file);
    }
    
    function setupUpload(dropZone, inputEl, labelEl, errorEl, setter) {
        if (!dropZone || !inputEl) return;
        dropZone.addEventListener('click', () => inputEl.click());
        dropZone.addEventListener('dragover', (event) => {
            event.preventDefault();
            dropZone.classList.add('drag-over');
        });
        dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
        dropZone.addEventListener('drop', (event) => {
            event.preventDefault();
            dropZone.classList.remove('drag-over');
            const file = event.dataTransfer.files?.[0];
            processFile(file, labelEl, errorEl, setter);
        });
        inputEl.addEventListener('change', () => {
            const file = inputEl.files?.[0];
            processFile(file, labelEl, errorEl, setter);
        });
    }
    
    setupUpload(resumeDropZone, resumeInput, resumeLabel, resumeError, (payload) => {
        resumePayload = payload;
    });
    
    // Handle form submission
    const form = modal.querySelector('#jobApplicationForm');
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Validate all fields
        let isValid = true;
        const name = document.getElementById('applicantName').value.trim();
        const email = document.getElementById('applicantEmail').value;
        const phone = document.getElementById('applicantPhone').value.trim();
        const address = document.getElementById('applicantAddress').value.trim();
        const experience = document.getElementById('applicantExperience').value.trim();
        const expertise = document.getElementById('applicantFocus').value.trim();
        
        // Name validation
        if (name.length < 2) {
            document.getElementById('applicantNameError').textContent = 'Name must be at least 2 characters';
            document.getElementById('applicantNameError').classList.remove('hidden');
            isValid = false;
        } else {
            document.getElementById('applicantNameError').classList.add('hidden');
        }
        
        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            document.getElementById('applicantEmailError').textContent = 'Please enter a valid email';
            document.getElementById('applicantEmailError').classList.remove('hidden');
            isValid = false;
        } else {
            document.getElementById('applicantEmailError').classList.add('hidden');
        }
        
        // Phone validation
        const phoneRegex = /^[\d\s\-\+\(\)]+$/;
        if (!phoneRegex.test(phone) || phone.length < 10) {
            document.getElementById('applicantPhoneError').textContent = 'Please enter a valid phone number';
            document.getElementById('applicantPhoneError').classList.remove('hidden');
            isValid = false;
        } else {
            document.getElementById('applicantPhoneError').classList.add('hidden');
        }
        
        // Address validation
        if (address.length < 5) {
            document.getElementById('applicantAddressError').textContent = 'Please enter a complete address';
            document.getElementById('applicantAddressError').classList.remove('hidden');
            isValid = false;
        } else {
            document.getElementById('applicantAddressError').classList.add('hidden');
        }
        
        // Experience validation
        if (experience < 0 || experience === '') {
            document.getElementById('applicantExperienceError').textContent = 'Please enter valid years of experience';
            document.getElementById('applicantExperienceError').classList.remove('hidden');
            isValid = false;
        } else {
            document.getElementById('applicantExperienceError').classList.add('hidden');
        }
        
        // Expertise validation
        if (expertise.length < 2) {
            document.getElementById('applicantFocusError').textContent = 'Please describe your primary expertise';
            document.getElementById('applicantFocusError').classList.remove('hidden');
            isValid = false;
        } else {
            document.getElementById('applicantFocusError').classList.add('hidden');
        }
        
        // File validation
        if (!resumePayload) {
            resumeError.textContent = 'Please upload your resume';
            resumeError.classList.remove('hidden');
            isValid = false;
        } else {
            resumeError.classList.add('hidden');
        }
        
        if (!isValid) {
            showToast('Please fix the errors and try again', 'error');
            return;
        }
        
        // Form is valid - submit
        const activeUser = typeof getCurrentUser === 'function' ? getCurrentUser() : JSON.parse(localStorage.getItem('currentUser') || 'null');
        const applicationRecord = {
            id: `career-${Date.now()}`,
            jobId: job.id,
            jobTitle: job.title,
            applicantName: name,
            applicantEmail: email,
            phone,
            address,
            experience,
            expertise,
            resumeFile: resumePayload,
            status: 'submitted',
            submittedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            userId: activeUser?.id || null
        };
        if (typeof saveCareerApplication === 'function') {
            saveCareerApplication(applicationRecord);
        }
        showToast(`Application for ${job.title} submitted successfully! We'll be in touch soon.`);
        form.reset();
        resumePayload = null;
        resumeInput.value = '';
        resumeLabel.classList.add('hidden');
        setTimeout(() => {
            modal.remove();
        }, 1500);
    });
    
    // Close on outside click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

