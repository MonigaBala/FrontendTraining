// Admin page functionality
document.addEventListener('DOMContentLoaded', function() {
    const adminLoginForm = document.getElementById('adminLoginForm');
    const adminDashboard = document.getElementById('adminDashboard');
    
    // Check if already logged in
    if (localStorage.getItem('adminLoggedIn') === 'true') {
        showDashboard();
    }
    
    if (adminLoginForm) {
        adminLoginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            
            // Simple authentication (in production, this would be server-side)
            if (username === 'admin' && password === 'admin123') {
                localStorage.setItem('adminLoggedIn', 'true');
                showDashboard();
                showToast('Login successful!');
            } else {
                showToast('Invalid credentials. Please try again or contact support.', 'error');
            }
        });
    }
    
    // Update watchlist count
    updateWatchlistCount();

    // Quick action buttons
    setupQuickActions();

    // Refresh metrics whenever movies data is ready
    window.addEventListener('moviesLoaded', updateWatchlistCount);
});

function showDashboard() {
    const loginSection = document.querySelector('.login-container');
    const adminDashboard = document.getElementById('adminDashboard');
    
    if (loginSection) loginSection.style.display = 'none';
    if (adminDashboard) {
        adminDashboard.classList.remove('hidden');
        updateWatchlistCount();
    }
}

function logout() {
    localStorage.removeItem('adminLoggedIn');
    const loginSection = document.querySelector('.login-container');
    const adminDashboard = document.getElementById('adminDashboard');
    
    if (loginSection) loginSection.style.display = 'flex';
    if (adminDashboard) adminDashboard.classList.add('hidden');
    
    // Reset form
    const form = document.getElementById('adminLoginForm');
    if (form) form.reset();
    
    showToast('Logged out successfully');
}

function updateWatchlistCount() {
    const watchlistCount = document.getElementById('watchlistCount');
    if (watchlistCount) {
        let total = 0;
        if (typeof getStoredUsers === 'function') {
            const users = getStoredUsers();
            total += users.reduce((sum, user) => sum + (user.watchlist ? user.watchlist.length : 0), 0);
        }
        const guestWatchlist = JSON.parse(localStorage.getItem('guestWatchlist') || '[]').length;
        watchlistCount.textContent = total + guestWatchlist;
    }
    
    // Update movies count
    const moviesCount = document.getElementById('moviesCount');
    if (moviesCount) {
        const baseCount = Array.isArray(window.moviesData) ? window.moviesData.length : 0;
        moviesCount.textContent = baseCount + getAdminMovies().length;
    }
    
    // Update news count (approximate)
    const newsCount = document.getElementById('newsCount');
    if (newsCount) {
        // We know there are at least 9 news articles from the data
        newsCount.textContent = '9+';
    }
}

function setupQuickActions() {
    const addMovieBtn = document.getElementById('addMovieAction');
    const editContentBtn = document.getElementById('editContentAction');
    const analyticsBtn = document.getElementById('viewAnalyticsAction');
    const quickSettingsBtn = document.getElementById('quickSettingsAction');
    const reviewRequestsBtn = document.getElementById('reviewRequestsAction');
    const closeModalBtn = document.getElementById('closeQuickAction');
    const modal = document.getElementById('quickActionModal');

    if (!modal) return;

    if (addMovieBtn) {
        addMovieBtn.addEventListener('click', () => {
            openQuickActionModal('Add Movie', createAddMovieForm());
        });
    }

    if (editContentBtn) {
        editContentBtn.addEventListener('click', () => {
            openQuickActionModal('Edit Spotlight Content', createEditContentForm());
        });
    }

    if (analyticsBtn) {
        analyticsBtn.addEventListener('click', () => {
            openQuickActionModal('Performance Analytics', createAnalyticsPanel());
        });
    }

    if (reviewRequestsBtn) {
        reviewRequestsBtn.addEventListener('click', () => {
            openQuickActionModal('Review Requests', createRequestsPanel());
        });
    }

    if (quickSettingsBtn) {
        quickSettingsBtn.addEventListener('click', () => {
            closeQuickActionModal();
            document.getElementById('settingsBtn')?.click();
        });
    }

    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeQuickActionModal);
    }

    modal.addEventListener('click', (event) => {
        if (event.target === modal) {
            closeQuickActionModal();
        }
    });
}

function openQuickActionModal(title, bodyContent) {
    const modal = document.getElementById('quickActionModal');
    const titleEl = document.getElementById('quickActionTitle');
    const bodyEl = document.getElementById('quickActionBody');

    if (!modal || !titleEl || !bodyEl) return;

    titleEl.textContent = title;
    bodyEl.innerHTML = '';
    if (bodyContent) {
        bodyEl.appendChild(bodyContent);
    }

    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

function closeQuickActionModal() {
    const modal = document.getElementById('quickActionModal');
    if (!modal) return;
    modal.classList.add('hidden');
    modal.classList.remove('flex');
}

function createAddMovieForm() {
    const form = document.createElement('form');
    form.className = 'space-y-4';
    form.innerHTML = `
        <div class="form-group">
            <label class="block text-sm text-gray-300 mb-1">Movie Title *</label>
            <input type="text" name="title" class="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-red-500" placeholder="Enter movie name" required>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="form-group">
                <label class="block text-sm text-gray-300 mb-1">Genre *</label>
                <input type="text" name="genre" class="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-red-500" placeholder="e.g. Action" required>
            </div>
            <div class="form-group">
                <label class="block text-sm text-gray-300 mb-1">Release Year *</label>
                <input type="number" name="year" min="1900" max="2100" class="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-red-500" placeholder="2024" required>
            </div>
        </div>
        <div class="form-group">
            <label class="block text-sm text-gray-300 mb-1">Poster URL *</label>
            <input type="url" name="poster" class="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-red-500" placeholder="https://images..." required>
        </div>
        <div class="form-group">
            <label class="block text-sm text-gray-300 mb-1">Synopsis</label>
            <textarea name="synopsis" rows="3" class="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-red-500" placeholder="Short description"></textarea>
        </div>
        <button type="submit" class="btn-primary w-full">Save Movie</button>
    `;

    form.addEventListener('submit', (event) => {
        event.preventDefault();
        const formData = new FormData(form);
        const title = formData.get('title').trim();
        const genre = formData.get('genre').trim();
        const year = parseInt(formData.get('year'), 10);
        const poster = formData.get('poster').trim();
        const synopsis = formData.get('synopsis').trim();

        if (!title || !genre || !poster || Number.isNaN(year)) {
            showToast('Please fill in all required fields', 'error');
            return;
        }

        if (year < 1900 || year > 2100) {
            showToast('Enter a valid release year', 'error');
            return;
        }

        const newMovie = {
            id: `admin-${Date.now()}`,
            title,
            genre,
            releaseYear: year,
            poster,
            synopsis
        };

        const movies = getAdminMovies();
        movies.push(newMovie);
        localStorage.setItem('adminMovies', JSON.stringify(movies));
        showToast(`"${title}" saved for publishing!`);
        closeQuickActionModal();
        updateWatchlistCount();
    });

    return form;
}

function createEditContentForm() {
    const settings = JSON.parse(localStorage.getItem('adminContentSettings') || '{}');
    const form = document.createElement('form');
    form.className = 'space-y-4';
    form.innerHTML = `
        <div class="form-group">
            <label class="block text-sm text-gray-300 mb-1">Spotlight Heading *</label>
            <input type="text" name="headline" class="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-red-500" placeholder="Featured premiere..." required>
        </div>
        <div class="form-group">
            <label class="block text-sm text-gray-300 mb-1">Callout Text *</label>
            <textarea name="message" rows="4" class="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-red-500" placeholder="Share news or production updates" required></textarea>
        </div>
        <div class="form-group">
            <label class="block text-sm text-gray-300 mb-1">Primary CTA Link</label>
            <input type="url" name="ctaLink" class="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-red-500" placeholder="https://www.cinema.com/featured">
        </div>
        <button type="submit" class="btn-primary w-full">Save Content</button>
    `;

    const headlineInput = form.querySelector('input[name="headline"]');
    const messageInput = form.querySelector('textarea[name="message"]');
    const ctaInput = form.querySelector('input[name="ctaLink"]');
    if (headlineInput) headlineInput.value = settings.headline || '';
    if (messageInput) messageInput.value = settings.message || '';
    if (ctaInput) ctaInput.value = settings.ctaLink || '';

    form.addEventListener('submit', (event) => {
        event.preventDefault();
        const formData = new FormData(form);
        const headline = formData.get('headline').trim();
        const message = formData.get('message').trim();
        const ctaLink = formData.get('ctaLink').trim();

        if (!headline || !message) {
            showToast('Headline and callout text are required', 'error');
            return;
        }

        const contentSettings = { headline, message, ctaLink };
        localStorage.setItem('adminContentSettings', JSON.stringify(contentSettings));
        showToast('Content saved! This will reflect for signed-in users.');
        closeQuickActionModal();
    });

    return form;
}

function createAnalyticsPanel() {
    const stats = computeDashboardStats();
    const container = document.createElement('div');
    container.className = 'grid grid-cols-1 sm:grid-cols-2 gap-4';
    container.innerHTML = `
        <div class="p-4 bg-gray-800 rounded-xl border border-gray-700">
            <p class="text-gray-400 text-sm">Total Movies (including drafts)</p>
            <p class="text-3xl font-bold">${stats.totalMovies}</p>
        </div>
        <div class="p-4 bg-gray-800 rounded-xl border border-gray-700">
            <p class="text-gray-400 text-sm">Watchlist Entries</p>
            <p class="text-3xl font-bold">${stats.watchlist}</p>
        </div>
        <div class="p-4 bg-gray-800 rounded-xl border border-gray-700">
            <p class="text-gray-400 text-sm">Registered Users</p>
            <p class="text-3xl font-bold">${stats.totalUsers}</p>
        </div>
        <div class="p-4 bg-gray-800 rounded-xl border border-gray-700">
            <p class="text-gray-400 text-sm">Pending Applications</p>
            <p class="text-3xl font-bold">${stats.jobApplications}</p>
        </div>
        <div class="sm:col-span-2 p-4 bg-gray-800 rounded-xl border border-gray-700">
            <p class="text-gray-400 text-sm mb-2">Latest Activity</p>
            <ul class="space-y-2 text-sm text-gray-300 list-disc list-inside">
                <li>${stats.watchlist} items currently tracked in watchlists</li>
                <li>${stats.customMovies} drafts awaiting publication</li>
                <li>${stats.totalUsers} community members signed in</li>
            </ul>
        </div>
    `;
    return container;
}

function createRequestsPanel() {
    const applications = JSON.parse(localStorage.getItem('careerApplications') || '[]');
    const messages = JSON.parse(localStorage.getItem('contactMessages') || '[]');
    const applicationStatuses = ['submitted', 'in review', 'shortlisted', 'responded'];
    const contactStatuses = ['received', 'in review', 'responded'];
    
    function buildSection(title, entries, statuses, updateHandler) {
        const section = document.createElement('div');
        section.className = 'space-y-4';
        section.innerHTML = `<h3 class="text-xl font-semibold">${title}</h3>`;
        if (!entries.length) {
            section.innerHTML += `<p class="text-gray-400">No records yet.</p>`;
            return section;
        }
        const list = document.createElement('div');
        list.className = 'space-y-4';
        entries.forEach(entry => {
            const resumeBtn = entry.resumeFile?.data ? `<a href="${entry.resumeFile.data}" download="${entry.resumeFile.name}" class="px-3 py-2 bg-gray-700 rounded-lg text-xs inline-flex items-center gap-2 hover:bg-gray-600"><i class="fas fa-file-download"></i> Resume</a>` : '';
            const coverBtn = entry.coverLetterFile?.data ? `<a href="${entry.coverLetterFile.data}" download="${entry.coverLetterFile.name}" class="px-3 py-2 bg-gray-700 rounded-lg text-xs inline-flex items-center gap-2 hover:bg-gray-600"><i class="fas fa-file-alt"></i> Cover Letter</a>` : '';
            const expertiseLine = entry.expertise ? `<p class="text-xs text-gray-400">Focus: ${entry.expertise}</p>` : '';
            const detailText = entry.coverLetterFile ? `Cover letter uploaded: ${entry.coverLetterFile.name}` : (entry.coverLetter ? `${entry.coverLetter.slice(0, 100)}...` : (entry.message || '').slice(0, 120));
            const card = document.createElement('div');
            card.className = 'p-4 bg-gray-800 rounded-xl border border-gray-700';
            card.innerHTML = `
                <div class="flex justify-between flex-wrap gap-2 mb-2">
                    <div>
                        <p class="font-semibold">${entry.jobTitle || entry.subject}</p>
                        <p class="text-sm text-gray-400">${entry.applicantName || entry.name} • ${entry.applicantEmail || entry.email}</p>
                        ${expertiseLine}
                    </div>
                    <span class="px-3 py-1 rounded-full bg-gray-700 text-xs">${entry.status || statuses[0]}</span>
                </div>
                <p class="text-gray-300 text-sm mb-3">${detailText || 'Awaiting review.'}</p>
                ${(resumeBtn || coverBtn) ? `<div class="flex flex-wrap gap-3 py-3 border-t border-gray-700">${resumeBtn}${coverBtn}</div>` : ''}
                <div class="grid gap-3">
                    <label class="text-sm text-gray-400">Update status</label>
                    <select class="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2" data-status>
                        ${statuses.map(status => `<option value="${status}" ${status === entry.status ? 'selected' : ''}>${status}</option>`).join('')}
                    </select>
                    <textarea class="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2" rows="2" placeholder="Add admin note (optional)" data-note>${entry.adminNote || ''}</textarea>
                    <button class="px-4 py-2 bg-red-600 rounded-lg hover:bg-red-500 transition" data-update>Send Update</button>
                </div>
            `;
            const statusSelect = card.querySelector('[data-status]');
            const noteInput = card.querySelector('[data-note]');
            card.querySelector('[data-update]').addEventListener('click', () => {
                const status = statusSelect.value;
                const note = noteInput.value.trim();
                if (typeof updateHandler === 'function') {
                    updateHandler(entry.id, status, note);
                    showToast('Update sent to user');
                    openQuickActionModal('Review Requests', createRequestsPanel());
                }
            });
            list.appendChild(card);
        });
        section.appendChild(list);
        return section;
    }
    
    const container = document.createElement('div');
    container.className = 'space-y-8';
    container.appendChild(buildSection('Career Applications', applications, applicationStatuses, updateApplicationStatus));
    container.appendChild(buildSection('Contact Messages', messages, contactStatuses, updateContactStatus));
    return container;
}

function computeDashboardStats() {
    const baseMovies = Array.isArray(window.moviesData) ? window.moviesData.length : 0;
    const customMovies = getAdminMovies().length;
    const watchlist = getWatchlist().length;
    const totalUsers = JSON.parse(localStorage.getItem('users') || '[]').length;
    const jobApplications = JSON.parse(localStorage.getItem('careerApplications') || '[]').length;

    return {
        totalMovies: baseMovies + customMovies,
        customMovies,
        watchlist,
        totalUsers,
        jobApplications
    };
}

function getAdminMovies() {
    return JSON.parse(localStorage.getItem('adminMovies') || '[]');
}

