// Careers page functionality
const jobListings = [
    { id: 1, title: "Film Director", department: "Production", location: "Los Angeles, CA", type: "Full-time", description: "We're seeking an experienced film director to lead our upcoming projects. Must have 5+ years of experience and a strong portfolio." },
    { id: 2, title: "Cinematographer", department: "Production", location: "Los Angeles, CA", type: "Full-time", description: "Join our visual team as a cinematographer. Experience with digital and film cameras required. Portfolio submission necessary." },
    { id: 3, title: "Video Editor", department: "Post-Production", location: "Remote / Los Angeles, CA", type: "Full-time", description: "Seeking a creative video editor proficient in Adobe Premiere Pro, Final Cut Pro, and After Effects. 3+ years experience required." },
    { id: 4, title: "Production Assistant", department: "Production", location: "Los Angeles, CA", type: "Full-time", description: "Entry-level position for those looking to start their career in film production. Great learning opportunity with hands-on experience." },
    { id: 5, title: "Marketing Manager", department: "Marketing", location: "Los Angeles, CA", type: "Full-time", description: "Lead our marketing efforts for film releases. Experience in entertainment marketing and social media management required." },
    { id: 6, title: "Sound Designer", department: "Post-Production", location: "Los Angeles, CA", type: "Full-time", description: "Create immersive audio experiences for our films. Proficiency in Pro Tools and sound design software required." }
];

function showError(input, errorElement, message) {
    input.classList.add("border-red-500");
    errorElement.textContent = message;
    errorElement.classList.remove("hidden");
}

function hideError(input, errorElement) {
    input.classList.remove("border-red-500");
    errorElement.classList.add("hidden");
}

const DOC_MAX_SIZE = 5 * 1024 * 1024; // 5MB
const DOC_ALLOWED_EXTENSIONS = ['pdf', 'doc', 'docx', 'txt'];

document.addEventListener('DOMContentLoaded', function() {
    loadJobListings();
});

function loadJobListings() {
    const container = document.getElementById('jobListings');
    if (!container) return;
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

    // Create application modal
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4';
    modal.innerHTML = `
        <div class="bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto relative p-6">
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
                <div id="successPopup" class="hidden w-full bg-green-600 text-white text-center py-3 rounded-lg mb-4 transition-opacity duration-500">
    Application Submitted Successfully!
</div>

                <div class="flex gap-4 relative">
                    <button type="submit" class="btn-primary flex-1">Submit Application</button>
                    <button type="button" onclick="this.closest('.fixed').remove()" class="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition">Cancel</button>
                </div>
        
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);

    const form = modal.querySelector('#jobApplicationForm');
    const nameInput = modal.querySelector('#applicantName');
    const emailInput = modal.querySelector('#applicantEmail');
    const phoneInput = modal.querySelector('#applicantPhone');
    const addressInput = modal.querySelector('#applicantAddress');
    const experienceInput = modal.querySelector('#applicantExperience');
    const expertiseInput = modal.querySelector('#applicantFocus');
    const resumeInput = modal.querySelector('#applicantResume');

    const nameError = modal.querySelector('#applicantNameError');
    const emailError = modal.querySelector('#applicantEmailError');
    const phoneError = modal.querySelector('#applicantPhoneError');
    const addressError = modal.querySelector('#applicantAddressError');
    const experienceError = modal.querySelector('#applicantExperienceError');
    const expertiseError = modal.querySelector('#applicantFocusError');
    const resumeError = modal.querySelector('#resumeUploadError');
    const resumeLabel = modal.querySelector('#resumeFileName');
    const resumeDropZone = modal.querySelector('#resumeDropZone');
    const successPopup = modal.querySelector('#successPopup');

    // Validation functions
    function validateApplicantName(name) { return /^[A-Za-z ]+$/.test(name.trim()); }
    function validateEmail(email) { return /^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(email.trim()); }
    function validatePhone(phone) { return /^[0-9]{10}$/.test(phone); }
    function validateResume(file) {
        if (!file) return false;
        const ext = file.name.split('.').pop().toLowerCase();
        return ["pdf","doc","docx","txt"].includes(ext) && file.size <= DOC_MAX_SIZE;
    }

    // Live validation
    nameInput.addEventListener('input', () => validateField(nameInput, nameError, validateApplicantName, "Enter a valid name (letters only)."));
    emailInput.addEventListener('input', () => validateField(emailInput, emailError, validateEmail, "Enter a valid Gmail address."));
    phoneInput.addEventListener('input', () => validateField(phoneInput, phoneError, validatePhone, "Enter a valid 10-digit number."));
    addressInput.addEventListener('input', () => validateField(addressInput, addressError, val => val.trim().length >= 5, "Address must be at least 5 characters."));
    experienceInput.addEventListener('input', () => validateField(experienceInput, experienceError, val => val >= 0, "Experience cannot be empty or negative."));
    expertiseInput.addEventListener('input', () => validateField(expertiseInput, expertiseError, val => val.trim().length >= 3, "Please enter your area of expertise."));

    function validateField(input, errorEl, validator, message) {
        if (!validator(input.value)) showError(input, errorEl, message);
        else hideError(input, errorEl);
    }

    // Resume drag-drop
    function setupUpload(dropZone, inputEl, labelEl, errorEl) {
        dropZone.addEventListener('click', () => inputEl.click());
        dropZone.addEventListener('dragover', e => { e.preventDefault(); dropZone.classList.add('drag-over'); });
        dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
        dropZone.addEventListener('drop', e => {
            e.preventDefault(); dropZone.classList.remove('drag-over');
            const file = e.dataTransfer.files?.[0];
            handleResume(file);
        });
        inputEl.addEventListener('change', () => handleResume(inputEl.files[0]));
    }

    function handleResume(file) {
        if (!validateResume(file)) {
            showError(resumeInput, resumeError, "Upload PDF, DOC, or DOCX only under 5MB.");
            resumeLabel.classList.add("hidden");
        } else {
            hideError(resumeInput, resumeError);
            resumeLabel.textContent = `${file.name} (${Math.round(file.size/1024)} KB)`;
            resumeLabel.classList.remove("hidden");
        }
    }

    setupUpload(resumeDropZone, resumeInput, resumeLabel, resumeError);

    // Form submit
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        // Validate all fields
        const resumeFile = resumeInput.files[0];
        let valid = true;
        if (!validateApplicantName(nameInput.value)) { showError(nameInput, nameError, "Enter a valid name (letters only)."); valid=false;}
        if (!validateEmail(emailInput.value)) { showError(emailInput, emailError, "Enter a valid Gmail address."); valid=false;}
        if (!validatePhone(phoneInput.value)) { showError(phoneInput, phoneError, "Enter a valid 10-digit number."); valid=false;}
        if (addressInput.value.trim().length < 5) { showError(addressInput, addressError, "Address must be at least 5 characters."); valid=false;}
        if (experienceInput.value === "" || experienceInput.value < 0) { showError(experienceInput, experienceError, "Experience cannot be empty or negative."); valid=false;}
        if (expertiseInput.value.trim().length < 3) { showError(expertiseInput, expertiseError, "Please enter your area of expertise."); valid=false;}
        if (!validateResume(resumeFile)) { showError(resumeInput, resumeError, "Upload PDF, DOC, or DOCX only under 5MB."); valid=false;}

        if (!valid) return;

        // Show success popup near button
       successPopup.classList.remove("hidden");
successPopup.style.opacity = "1";

setTimeout(() => {
    successPopup.style.opacity = "0"; 
    setTimeout(() => {
        successPopup.classList.add("hidden");
        form.reset();
        resumeLabel.classList.add("hidden");
    }, 500);
}, 2000);
    });

    // Close modal on click outside
    modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
}
