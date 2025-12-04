// Shared JavaScript functionality

// Load movies from JSON
let moviesData = [];
let moviesLoaded = false;
let fallbackMoviesPromise = null;

// User/account helpers
const USER_DEFAULTS = {
    watchlist: [],
    notifications: [],
    applications: [],
    messages: []
};

function hydrateUser(user) {
    if (!user) return null;
    return {
        ...user,
        watchlist: Array.isArray(user.watchlist) ? user.watchlist : [...USER_DEFAULTS.watchlist],
        notifications: Array.isArray(user.notifications) ? user.notifications : [...USER_DEFAULTS.notifications],
        applications: Array.isArray(user.applications) ? user.applications : [...USER_DEFAULTS.applications],
        messages: Array.isArray(user.messages) ? user.messages : [...USER_DEFAULTS.messages]
    };
}

function getStoredUsers() {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    return users.map(hydrateUser);
}

function saveStoredUsers(users) {
    localStorage.setItem('users', JSON.stringify(users));
}

function getCurrentUser() {
    const raw = localStorage.getItem('currentUser');
    if (!raw) return null;
    const hydrated = hydrateUser(JSON.parse(raw));
    if (hydrated) {
        localStorage.setItem('currentUser', JSON.stringify(hydrated));
    }
    return hydrated;
}

function setCurrentUser(user) {
    if (user) {
        localStorage.setItem('currentUser', JSON.stringify(hydrateUser(user)));
    } else {
        localStorage.removeItem('currentUser');
    }
    window.dispatchEvent(new CustomEvent('authChanged'));
}

function updateUserRecord(email, updater = () => {}) {
    if (!email) return null;
    const users = getStoredUsers();
    const idx = users.findIndex(u => u.email === email);
    if (idx === -1) return null;
    const updatedUser = hydrateUser(updater(hydrateUser(users[idx])) || users[idx]);
    users[idx] = updatedUser;
    saveStoredUsers(users);
    const current = getCurrentUser();
    if (current && current.email === email) {
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
        window.dispatchEvent(new CustomEvent('userDataUpdated', { detail: updatedUser }));
    }
    return updatedUser;
}

function addNotificationToUser(email, message, meta = {}) {
    if (!email) return;
    updateUserRecord(email, (user) => {
        const entry = {
            id: `notif-${Date.now()}`,
            message,
            meta,
            createdAt: new Date().toISOString(),
            read: false
        };
        user.notifications = [entry, ...user.notifications].slice(0, 25);
        return user;
    });
}

function syncUserHistoryFromGlobal(user) {
    if (!user) return user;
    const applications = JSON.parse(localStorage.getItem('careerApplications') || '[]')
        .filter(app => app.applicantEmail === user.email);
    const messages = JSON.parse(localStorage.getItem('contactMessages') || '[]')
        .filter(msg => msg.email === user.email);
    
    const seenAppIds = new Set(user.applications.map(app => app.id));
    applications.forEach(app => {
        if (!seenAppIds.has(app.id)) {
            user.applications.push(app);
        }
    });
    
    const seenMsgIds = new Set(user.messages.map(msg => msg.id));
    messages.forEach(msg => {
        if (!seenMsgIds.has(msg.id)) {
            user.messages.push(msg);
        }
    });
    return user;
}

function saveCareerApplication(application) {
    const apps = JSON.parse(localStorage.getItem('careerApplications') || '[]');
    apps.push(application);
    localStorage.setItem('careerApplications', JSON.stringify(apps));
    if (application.applicantEmail) {
        updateUserRecord(application.applicantEmail, (user) => {
            const exists = user.applications.some(app => app.id === application.id);
            if (!exists) {
                user.applications.push(application);
                addNotificationToUser(application.applicantEmail, `Application for ${application.jobTitle} submitted.`, {
                    type: 'application',
                    refId: application.id,
                    status: application.status
                });
            }
            return user;
        });
    }
}

function saveContactMessage(message) {
    const messages = JSON.parse(localStorage.getItem('contactMessages') || '[]');
    messages.push(message);
    localStorage.setItem('contactMessages', JSON.stringify(messages));
    if (message.email) {
        updateUserRecord(message.email, (user) => {
            const exists = user.messages.some(msg => msg.id === message.id);
            if (!exists) {
                user.messages.push(message);
                addNotificationToUser(message.email, `We received your "${message.subject}" message.`, {
                    type: 'contact',
                    refId: message.id,
                    status: message.status
                });
            }
            return user;
        });
    }
}

function updateApplicationStatus(id, status, adminNote = '') {
    const apps = JSON.parse(localStorage.getItem('careerApplications') || '[]');
    const idx = apps.findIndex(app => app.id === id);
    if (idx === -1) return null;
    apps[idx].status = status;
    apps[idx].adminNote = adminNote;
    apps[idx].updatedAt = new Date().toISOString();
    localStorage.setItem('careerApplications', JSON.stringify(apps));
    if (apps[idx].applicantEmail) {
        updateUserRecord(apps[idx].applicantEmail, (user) => {
            user.applications = user.applications.map(app => app.id === id ? { ...app, status, adminNote: adminNote || app.adminNote, updatedAt: apps[idx].updatedAt } : app);
            addNotificationToUser(apps[idx].applicantEmail, `Update on your ${apps[idx].jobTitle} application: ${status}`, {
                type: 'application',
                refId: id,
                status
            });
            return user;
        });
    }
    return apps[idx];
}

function updateContactStatus(id, status, adminNote = '') {
    const messages = JSON.parse(localStorage.getItem('contactMessages') || '[]');
    const idx = messages.findIndex(msg => msg.id === id);
    if (idx === -1) return null;
    messages[idx].status = status;
    messages[idx].adminNote = adminNote;
    messages[idx].updatedAt = new Date().toISOString();
    localStorage.setItem('contactMessages', JSON.stringify(messages));
    if (messages[idx].email) {
        updateUserRecord(messages[idx].email, (user) => {
            user.messages = user.messages.map(msg => msg.id === id ? { ...msg, status, adminNote: adminNote || msg.adminNote, updatedAt: messages[idx].updatedAt } : msg);
            addNotificationToUser(messages[idx].email, `Update on your message "${messages[idx].subject}": ${status}`, {
                type: 'contact',
                refId: id,
                status
            });
            return user;
        });
    }
    return messages[idx];
}

function signOutUser(redirectHome = false) {
    localStorage.removeItem('currentUser');
    localStorage.setItem('isSignedIn', 'false');
    window.dispatchEvent(new CustomEvent('authChanged'));
    showToast('Signed out successfully');
    if (redirectHome) {
        window.location.href = 'index.html';
    }
}

function initializeUserData() {
    const users = getStoredUsers();
    let changed = false;
    const normalized = users.map(user => {
        const hydrated = hydrateUser(user);
        if (hydrated.watchlist !== user.watchlist ||
            hydrated.notifications !== user.notifications ||
            hydrated.applications !== user.applications ||
            hydrated.messages !== user.messages) {
            changed = true;
        }
        return hydrated;
    });
    if (changed) {
        saveStoredUsers(normalized);
    }
    const current = getCurrentUser();
    if (current) {
        const synced = syncUserHistoryFromGlobal(current);
        updateUserRecord(current.email, () => synced);
    }
}

async function loadFallbackMovies() {
    if (window.moviesJsonData && window.moviesJsonData.length > 0) {
        return window.moviesJsonData;
    }
    if (fallbackMoviesPromise) {
        return fallbackMoviesPromise;
    }
    fallbackMoviesPromise = new Promise((resolve, reject) => {
        const existingScript = document.querySelector('script[data-movies-fallback]');
        if (existingScript && window.moviesJsonData) {
            resolve(window.moviesJsonData);
            return;
        }
        const script = existingScript || document.createElement('script');
        script.src = '../js/movies-data.js';
        script.async = true;
        script.dataset.moviesFallback = 'true';
        script.onload = () => resolve(window.moviesJsonData || []);
        script.onerror = (err) => reject(err);
        if (!existingScript) {
            document.head.appendChild(script);
        }
    });
    return fallbackMoviesPromise;
}

async function loadMovies() {
    try {
        const response = await fetch('../data/movies.json', { cache: 'no-store' });
        if (!response.ok) {
            throw new Error('Failed to load movies.json');
        }
        moviesData = await response.json();
        moviesLoaded = true;
        // Store in global scope for easy access
        window.moviesData = moviesData;
        // Trigger custom event when movies are loaded
        window.dispatchEvent(new CustomEvent('moviesLoaded', { detail: moviesData }));
        console.log('Movies loaded successfully:', moviesData.length, 'movies');
    } catch (error) {
        console.warn('Primary movie load failed, attempting fallback...', error);
        try {
            const fallbackData = await loadFallbackMovies();
            moviesData = fallbackData || [];
            moviesLoaded = true;
            window.moviesData = moviesData;
            window.dispatchEvent(new CustomEvent('moviesLoaded', { detail: moviesData }));
            if (moviesData.length === 0) {
                console.error('Fallback movie data is empty.');
            } else {
                console.log('Movies loaded from fallback:', moviesData.length, 'movies');
            }
        } catch (fallbackError) {
            console.error('Failed to load movies even from fallback:', fallbackError);
            moviesData = [];
            moviesLoaded = true;
            window.moviesData = [];
            window.dispatchEvent(new CustomEvent('moviesLoaded', { detail: [] }));
        }
    }
}

// Load movies on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadMovies);
} else {
    loadMovies();
}

// Theme Management
let currentTheme = localStorage.getItem('theme') || 'dark';

function applyTheme(theme) {
    currentTheme = theme;
    localStorage.setItem('theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
    
    // Update body classes for theme-specific animations
    if (theme === 'light') {
        document.body.classList.remove('bg-gray-900', 'text-white');
        document.body.classList.add('bg-gray-50', 'text-gray-900');
    } else {
        document.body.classList.remove('bg-gray-50', 'text-gray-900');
        document.body.classList.add('bg-gray-900', 'text-white');
    }
    
    // Sync across tabs
    window.dispatchEvent(new StorageEvent('storage', { key: 'theme', newValue: theme }));
}

// Listen for theme changes from other tabs
window.addEventListener('storage', function(e) {
    if (e.key === 'theme') {
        applyTheme(e.newValue);
    }
    if (e.key === 'currentUser') {
        updateAuthUI();
    }
});

// Initialize theme on load
document.addEventListener('DOMContentLoaded', function() {
    initializeUserData();
    applyTheme(currentTheme);
    
    // Add scroll to top button
    addScrollToTopButton();
    
    // Theme toggle functionality
    const themeToggle = document.getElementById('themeToggle');
    const themeToggleMobile = document.getElementById('themeToggleMobile');
    const themeIcon = document.getElementById('themeIcon');
    
    function updateThemeIcon(theme) {
        if (themeIcon) {
            themeIcon.className = theme === 'light' ? 'fas fa-sun' : 'fas fa-moon';
        }
    }
    
    function toggleTheme() {
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        applyTheme(newTheme);
        updateThemeIcon(newTheme);
    }
    
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
    if (themeToggleMobile) {
        themeToggleMobile.addEventListener('click', toggleTheme);
    }
    updateThemeIcon(currentTheme);
    
    injectUserActivityModal();
    setupUserMenu();
    updateAuthUI();
});

// Mobile menu toggle
document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    
    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', function() {
            mobileMenu.classList.toggle('hidden');
        });
    }
    
    // Set active nav link based on current page
    const currentPage = window.location.pathname.split('/').pop() || '/index.html';
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage || (currentPage === '' && href === '/index.html')) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
});

// Scroll to top button
function addScrollToTopButton() {
    // Remove existing button if any
    const existingBtn = document.getElementById('scrollToTop');
    if (existingBtn) existingBtn.remove();
    
    const scrollBtn = document.createElement('button');
    scrollBtn.id = 'scrollToTop';
    scrollBtn.className = 'fixed bottom-8 right-8 bg-red-600 hover:bg-red-700 text-white p-4 rounded-full shadow-lg z-50 transition-all duration-300 opacity-0 pointer-events-none';
    scrollBtn.innerHTML = '<i class="fas fa-arrow-up text-xl"></i>';
    scrollBtn.onclick = () => window.scrollTo({ top: 0, behavior: 'smooth' });
    document.body.appendChild(scrollBtn);
    
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            scrollBtn.classList.remove('opacity-0', 'pointer-events-none');
            scrollBtn.classList.add('opacity-100');
        } else {
            scrollBtn.classList.add('opacity-0', 'pointer-events-none');
            scrollBtn.classList.remove('opacity-100');
        }
    });
}

// Toast notification function
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideInRight 0.3s ease-out reverse';
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 3000);
}

// Watchlist functionality
function getGuestWatchlist() {
    return JSON.parse(localStorage.getItem('guestWatchlist') || '[]');
}

function saveGuestWatchlist(list) {
    localStorage.setItem('guestWatchlist', JSON.stringify(list));
}

function getActiveWatchlist() {
    const user = getCurrentUser();
    if (user) {
        return hydrateUser(user).watchlist;
    }
    return getGuestWatchlist();
}

function persistActiveWatchlist(list) {
    const user = getCurrentUser();
    if (user) {
        updateUserRecord(user.email, (u) => {
            u.watchlist = list;
            return u;
        });
    } else {
        saveGuestWatchlist(list);
    }
}

function addToWatchlist(movieId, movieTitle, moviePoster) {
    let watchlist = getActiveWatchlist();
    
    // Check if movie already exists
    if (watchlist.find(m => m.id === movieId)) {
        showToast('Movie already in watchlist!', 'info');
        return;
    }
    
    watchlist.push({
        id: movieId,
        title: movieTitle,
        poster: moviePoster,
        addedAt: new Date().toISOString()
    });
    
    persistActiveWatchlist(watchlist);
    const currentUser = getCurrentUser();
    if (currentUser) {
        addNotificationToUser(currentUser.email, `"${movieTitle}" saved to your watchlist`, {
            type: 'watchlist',
            refId: movieId
        });
    }
    showToast('Added to watchlist!');
}

function removeFromWatchlist(movieId) {
    let watchlist = getActiveWatchlist().filter(m => m.id !== movieId);
    persistActiveWatchlist(watchlist);
    showToast('Removed from watchlist!');
    return watchlist;
}

function getWatchlist() {
    return getActiveWatchlist();
}

function isInWatchlist(movieId) {
    const watchlist = getWatchlist();
    return watchlist.some(m => m.id === movieId);
}

function injectUserActivityModal() {
    if (document.getElementById('userActivityModal')) return;
    const modal = document.createElement('div');
    modal.id = 'userActivityModal';
    modal.className = 'fixed inset-0 bg-black/70 z-50 hidden items-center justify-center p-4';
    modal.innerHTML = `
        <div class="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div class="flex items-center justify-between px-6 py-4 border-b border-gray-800">
                <div>
                    <p class="text-sm uppercase tracking-[0.3em] text-gray-400">Account</p>
                    <h3 class="text-2xl font-bold">My Activity</h3>
                </div>
                <button id="closeUserActivity" class="text-gray-400 hover:text-white text-3xl leading-none">&times;</button>
            </div>
            <div class="p-6 space-y-8">
                <div>
                    <h4 class="text-xl font-semibold mb-3 flex items-center gap-2"><i class="fas fa-bell text-red-500"></i> Notifications</h4>
                    <div id="userNotificationsList" class="space-y-3"></div>
                </div>
                <div class="grid md:grid-cols-2 gap-6">
                    <div>
                        <h4 class="text-xl font-semibold mb-3 flex items-center gap-2"><i class="fas fa-briefcase text-red-500"></i> Applications</h4>
                        <div id="userApplicationsList" class="space-y-3"></div>
                    </div>
                    <div>
                        <h4 class="text-xl font-semibold mb-3 flex items-center gap-2"><i class="fas fa-inbox text-red-500"></i> Messages</h4>
                        <div id="userMessagesList" class="space-y-3"></div>
                    </div>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    modal.addEventListener('click', (event) => {
        if (event.target === modal) {
            closeUserActivityModal();
        }
    });
    modal.querySelector('#closeUserActivity').addEventListener('click', closeUserActivityModal);
}

function setupUserMenu() {
    if (document.getElementById('userMenuWrapper')) return;
    const navUtility = document.getElementById('navUtility');
    if (!navUtility) return;
    
    const wrapper = document.createElement('div');
    wrapper.id = 'userMenuWrapper';
    wrapper.className = 'relative hidden md:flex items-center';
    wrapper.innerHTML = `
        <button id="userMenuButton" type="button" class="hidden items-center gap-2 bg-gray-900/70 border border-gray-700 px-3 py-1.5 rounded-full text-sm font-semibold hover:border-red-500 transition">
            <span id="userMenuAvatar" class="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-sm font-bold"></span>
            <span id="userMenuName" class="text-sm font-semibold"></span>
            <span id="userNotificationDot" class="ml-1 hidden rounded-full bg-red-600 text-xs px-2 py-0.5 text-white font-semibold"></span>
            <i class="fas fa-chevron-down text-xs opacity-70"></i>
        </button>
        <div id="userMenuDropdown" class="absolute right-0 mt-2 w-60 bg-gray-900 border border-gray-800 rounded-xl shadow-2xl hidden">
            <a href="../pages/watchlist.html" class="block px-4 py-3 hover:bg-gray-800 transition"><i class="fas fa-bookmark mr-2 text-red-500"></i> My Watchlist</a>
            <button data-user-action="activity" class="block w-full text-left px-4 py-3 hover:bg-gray-800 transition"><i class="fas fa-clipboard-list mr-2 text-red-500"></i> Applications & Messages</button>
            <button data-user-action="signout" class="block w-full text-left px-4 py-3 hover:bg-gray-800 transition text-red-400"><i class="fas fa-sign-out-alt mr-2"></i> Sign Out</button>
        </div>
    `;
    navUtility.appendChild(wrapper);
    
    const dropdown = wrapper.querySelector('#userMenuDropdown');
    const toggleButton = wrapper.querySelector('#userMenuButton');
    toggleButton.addEventListener('click', () => {
        dropdown.classList.toggle('hidden');
    });
    dropdown.querySelector('[data-user-action="activity"]').addEventListener('click', () => {
        dropdown.classList.add('hidden');
        openUserActivityModal();
    });
    dropdown.querySelector('[data-user-action="signout"]').addEventListener('click', () => {
        dropdown.classList.add('hidden');
        signOutUser(true);
    });
    
    document.addEventListener('click', (event) => {
        if (!wrapper.contains(event.target)) {
            dropdown.classList.add('hidden');
        }
    });
}

function updateMobileUserBlock(user) {
    const mobileMenu = document.getElementById('mobileMenu');
    if (!mobileMenu) return;
    let infoBlock = document.getElementById('mobileUserBlock');
    if (!infoBlock) {
        infoBlock = document.createElement('div');
        infoBlock.id = 'mobileUserBlock';
        infoBlock.className = 'border border-gray-700 rounded-xl p-4 mb-4 bg-gray-800';
        mobileMenu.insertBefore(infoBlock, mobileMenu.firstChild);
    }
    if (user) {
        infoBlock.innerHTML = `
            <p class="text-sm uppercase text-gray-400 tracking-[0.3em] mb-1">Signed In</p>
            <p class="text-xl font-bold">${user.name || user.email}</p>
            <p class="text-gray-400 text-sm">${user.email}</p>
            <div class="mt-3 flex gap-2">
                <button onclick="openUserActivityModal()" class="px-3 py-2 bg-red-600 rounded-lg text-sm">Activity</button>
                <button onclick="signOutUser(true)" class="px-3 py-2 bg-gray-700 rounded-lg text-sm">Sign Out</button>
            </div>
        `;
        infoBlock.classList.remove('hidden');
    } else {
        infoBlock.classList.add('hidden');
    }
}

function updateAuthUI() {
    const user = getCurrentUser();
    const userButton = document.getElementById('userMenuButton');
    const avatar = document.getElementById('userMenuAvatar');
    const nameLabel = document.getElementById('userMenuName');
    const notifDot = document.getElementById('userNotificationDot');
    
    const nav = document.querySelector('nav');
    if (nav) {
        const signInLinks = nav.querySelectorAll('a[href="../pages/signin.html"]');
        const signUpLinks = nav.querySelectorAll('a[href="../pages/signup.html"]');
        signInLinks.forEach(link => user ? link.classList.add('hidden') : link.classList.remove('hidden'));
        signUpLinks.forEach(link => user ? link.classList.add('hidden') : link.classList.remove('hidden'));
    }
    
    if (user && userButton && avatar && nameLabel) {
        userButton.classList.remove('hidden');
        const initials = (user.name || user.email || 'U').split(' ').map(part => part[0]).join('').slice(0, 2).toUpperCase();
        avatar.textContent = initials;
        nameLabel.textContent = user.name || user.email;
        const unread = (user.notifications || []).filter(n => !n.read).length;
        if (unread > 0) {
            notifDot.textContent = unread > 9 ? '9+' : unread;
            notifDot.classList.remove('hidden');
        } else {
            notifDot.classList.add('hidden');
        }
    } else if (userButton) {
        userButton.classList.add('hidden');
    }
    
    updateMobileUserBlock(user);
}

function openUserActivityModal() {
    const user = getCurrentUser();
    if (!user) {
        showToast('Please sign in to view your activity', 'error');
        return;
    }
    const modal = document.getElementById('userActivityModal');
    if (!modal) return;
    renderUserActivityModal(user);
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    
    updateUserRecord(user.email, (u) => {
        u.notifications = u.notifications.map(n => ({ ...n, read: true }));
        return u;
    });
    updateAuthUI();
}

function closeUserActivityModal() {
    const modal = document.getElementById('userActivityModal');
    if (!modal) return;
    modal.classList.add('hidden');
    modal.classList.remove('flex');
}

function renderUserActivityModal(user) {
    const appsContainer = document.getElementById('userApplicationsList');
    const messagesContainer = document.getElementById('userMessagesList');
    const notificationsContainer = document.getElementById('userNotificationsList');
    if (!appsContainer || !messagesContainer || !notificationsContainer) return;
    
    const renderCards = (items, emptyText, formatter = null) => {
        if (!items || items.length === 0) {
            return `<div class="p-4 bg-gray-800 rounded-xl text-gray-400">${emptyText}</div>`;
        }
        return items.map(item => {
            if (formatter) return formatter(item);
            const title = item.jobTitle || item.subject || 'Update';
            const description = item.jobTitle ? item.applicantName : (item.message || item.body || '').substring(0, 140);
            const status = item.status || 'submitted';
            const timestamp = new Date(item.updatedAt || item.submittedAt || item.createdAt || item.receivedAt || Date.now()).toLocaleString();
            return `
                <div class="p-4 bg-gray-800 rounded-xl border border-gray-700">
                    <div class="flex items-center justify-between mb-2">
                        <p class="font-semibold">${title}</p>
                        <span class="px-3 py-1 rounded-full text-xs bg-gray-700">${status}</span>
                    </div>
                    <p class="text-gray-400 text-sm">${description}</p>
                    <p class="text-gray-500 text-xs mt-3">${timestamp}</p>
                    ${item.adminNote ? `<p class="mt-3 text-sm text-green-400">Admin: ${item.adminNote}</p>` : ''}
                </div>
            `;
        }).join('');
    };
    
    notificationsContainer.innerHTML = renderCards(user.notifications, 'No notifications yet.', (item) => {
        const timestamp = new Date(item.createdAt || Date.now()).toLocaleString();
        return `
            <div class="p-4 bg-gray-800 rounded-xl border border-gray-700">
                <div class="flex items-center justify-between mb-2">
                    <p class="font-semibold">${item.meta?.type ? item.meta.type.toUpperCase() : 'Notice'}</p>
                    <span class="text-xs text-gray-400">${timestamp}</span>
                </div>
                <p class="text-gray-200 text-sm">${item.message}</p>
            </div>
        `;
    });
    appsContainer.innerHTML = renderCards(user.applications, 'No job applications submitted.');
    messagesContainer.innerHTML = renderCards(user.messages, 'No contact messages yet.');
}

window.addEventListener('authChanged', updateAuthUI);
window.addEventListener('userDataUpdated', updateAuthUI);
// Movies data is loaded from movies.json

// Sample news data
const newsData = [
    {
        id: 1,
        title: "New Blockbuster Release Announced",
        excerpt: "We're excited to announce our latest production set to release next month.",
        image: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&h=400&fit=crop",
        date: "2024-01-15"
    },
    {
        id: 2,
        title: "Award Win at International Film Festival",
        excerpt: "Our film 'City Lights' wins Best Picture at the prestigious festival.",
        image: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=600&h=400&fit=crop",
        date: "2024-01-10"
    },
    {
        id: 3,
        title: "Partnership with Major Studio",
        excerpt: "We're thrilled to announce our new partnership for upcoming projects.",
        image: "https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=600&h=400&fit=crop",
        date: "2024-01-05"
    }
];

document.addEventListener("DOMContentLoaded", () => {
    const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
    const msgBox = document.getElementById("messages");

    if (!currentUser.messages || currentUser.messages.length === 0) {
        msgBox.innerHTML = "<p>No messages yet.</p>";
        return;
    }

    msgBox.innerHTML = currentUser.messages.map(m => `
        <div class="p-3 border rounded mb-3">
            <h3 class="font-bold">${m.title}</h3>
            <p>${m.content}</p>
            <small>${new Date(m.date).toLocaleString()}</small>
        </div>
    `).join("");
});
