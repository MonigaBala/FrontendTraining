// Movies page functionality
let currentPage = 1;
const moviesPerPage = 5;
let filteredMovies = [];
let currentView = localStorage.getItem('movieView') || 'card'; // 'card' or 'list'

// Access moviesData from global scope (loaded in script.js)
function getMoviesData() {
    if (typeof window.moviesData !== 'undefined' && window.moviesData && window.moviesData.length > 0) {
        return window.moviesData;
    }
    if (typeof moviesData !== 'undefined' && moviesData && moviesData.length > 0) {
        return moviesData;
    }
    return [];
}

document.addEventListener('DOMContentLoaded', function() {
    // Wait for movies to load
    window.addEventListener('moviesLoaded', function(e) {
        const data = e.detail || (typeof moviesData !== 'undefined' ? moviesData : []);
        if (data && data.length > 0) {
            filteredMovies = [...data];
            renderMovies();
            setupFilters();
            setupViewToggle();
        } else {
            console.warn('No movies data received');
        }
    });
    
    // If movies already loaded
    const data = getMoviesData();
    if (data && data.length > 0) {
        filteredMovies = [...data];
        renderMovies();
        setupFilters();
        setupViewToggle();
    } else {
        // Try loading again after a short delay
        setTimeout(() => {
            const retryData = getMoviesData();
            if (retryData && retryData.length > 0) {
                filteredMovies = [...retryData];
                renderMovies();
                setupFilters();
                setupViewToggle();
            }
        }, 500);
    }
});

function setupViewToggle() {
    const cardViewBtn = document.getElementById('cardViewBtn');
    const listViewBtn = document.getElementById('listViewBtn');
    
    // Load saved view preference
    currentView = localStorage.getItem('movieView') || 'card';
    updateViewButtons();
    
    if (cardViewBtn) {
        cardViewBtn.addEventListener('click', () => {
            currentView = 'card';
            localStorage.setItem('movieView', 'card');
            updateViewButtons();
            renderMovies();
        });
    }
    
    if (listViewBtn) {
        listViewBtn.addEventListener('click', () => {
            currentView = 'list';
            localStorage.setItem('movieView', 'list');
            updateViewButtons();
            renderMovies();
        });
    }
}

function updateViewButtons() {
    const cardViewBtn = document.getElementById('cardViewBtn');
    const listViewBtn = document.getElementById('listViewBtn');
    
    if (currentView === 'card') {
        if (cardViewBtn) {
            cardViewBtn.className = 'px-4 py-2 bg-red-600 hover:bg-red-700 rounded transition';
        }
        if (listViewBtn) {
            listViewBtn.className = 'px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded transition';
        }
    } else {
        if (cardViewBtn) {
            cardViewBtn.className = 'px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded transition';
        }
        if (listViewBtn) {
            listViewBtn.className = 'px-4 py-2 bg-red-600 hover:bg-red-700 rounded transition';
        }
    }
}

function setupFilters() {
    const genreFilter = document.getElementById('genreFilter');
    const yearFilter = document.getElementById('yearFilter');
    const ratingFilter = document.getElementById('ratingFilter');
    const searchFilter = document.getElementById('searchFilter');
    
    [genreFilter, yearFilter, ratingFilter, searchFilter].forEach(filter => {
        if (filter) {
            filter.addEventListener('change', applyFilters);
            filter.addEventListener('input', applyFilters);
        }
    });
}

function applyFilters() {
    const genre = document.getElementById('genreFilter').value;
    const year = document.getElementById('yearFilter').value;
    const rating = document.getElementById('ratingFilter').value;
    const search = document.getElementById('searchFilter').value.toLowerCase();
    
    const data = getMoviesData();
    filteredMovies = data.filter(movie => {
        const matchGenre = !genre || movie.genre === genre;
        const matchYear = !year || movie.year.toString() === year;
        const matchRating = !rating || movie.rating >= parseFloat(rating);
        const matchSearch = !search || movie.title.toLowerCase().includes(search) || 
                          movie.description.toLowerCase().includes(search);
        
        return matchGenre && matchYear && matchRating && matchSearch;
    });
    
    currentPage = 1;
    renderMovies();
}

function clearFilters() {
    document.getElementById('genreFilter').value = '';
    document.getElementById('yearFilter').value = '';
    document.getElementById('ratingFilter').value = '';
    document.getElementById('searchFilter').value = '';
    filteredMovies = [...getMoviesData()];
    currentPage = 1;
    renderMovies();
}
// ===========================
// ENABLE CLICK TO OPEN MOVIE
// Works for CARD VIEW + LIST VIEW + WATCHLIST
// ===========================
document.addEventListener("click", function(e) {
    const movieCard = e.target.closest(".movie-card, .watchlist-item"); 

    if (movieCard) {
        // Extract movie id
        let movieId = movieCard.querySelector("a")?.href?.split("=")[1] 
                   || movieCard.getAttribute("data-id");

        if (movieId) {
            window.location.href = `movie-detail.html?id=${movieId}`;
        }
    }
});

function renderMovies() {
    const container = document.getElementById('moviesContainer');
    const pagination = document.getElementById('pagination');
    
    if (!container) return;
    
    container.innerHTML = '';
    
    // Update container class based on view
    if (currentView === 'list') {
        container.className = 'space-y-4';
    } else {
        container.className = 'grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4';
    }
    
    const startIndex = (currentPage - 1) * moviesPerPage;
    const endIndex = startIndex + moviesPerPage;
    const moviesToShow = filteredMovies.slice(startIndex, endIndex);
    
    if (moviesToShow.length === 0) {
        container.innerHTML = '<div class="col-span-full text-center py-12"><p class="text-gray-400 text-xl">No movies found matching your criteria.</p></div>';
        pagination.innerHTML = '';
        return;
    }
    
    moviesToShow.forEach(movie => {
        const card = currentView === 'list' ? createMovieListCard(movie) : createMovieCard(movie);
        container.appendChild(card);
    });
    
    renderPagination();
}

function createMovieCard(movie) {
    const card = document.createElement('div');
    card.className = 'movie-card';
    const inWatchlist = isInWatchlist(movie.id);
    card.innerHTML = `
        <a href="movie-detail.html?id=${movie.id}" class="block">
            <img src="${movie.poster}" alt="${movie.title}" loading="lazy" class="h-64 object-cover">
        </a>
        <div class="movie-card-content">
            <a href="movie-detail.html?id=${movie.id}">
                <h3 class="text-lg font-bold mb-2 hover:text-red-600 transition line-clamp-2">${movie.title}</h3>
            </a>
            <div class="flex items-center justify-between mb-2">
                <span class="text-yellow-500 text-sm"><i class="fas fa-star"></i> ${movie.rating}</span>
                <span class="text-gray-400 text-sm">${movie.year}</span>
            </div>
            <p class="text-gray-400 text-xs mb-3">${movie.genre}</p>
            <div class="flex gap-2">
                <a href="movie-detail.html?id=${movie.id}" class="btn-view flex-1 text-center text-sm py-1">View</a>
                <button onclick="event.stopPropagation(); toggleWatchlist(${movie.id}, '${movie.title}', '${movie.poster}')" 
                        class="px-3 py-1 ${inWatchlist ? 'bg-red-600' : 'bg-gray-700'} hover:bg-gray-600 rounded transition text-sm">
                    <i class="fas fa-bookmark"></i>
                </button>
            </div>
        </div>
    `;
    return card;
}

function createMovieListCard(movie) {
    const card = document.createElement('div');
    card.className = 'watchlist-item';
    const inWatchlist = isInWatchlist(movie.id);
    card.innerHTML = `
        <img src="${movie.poster}" alt="${movie.title}" class="w-24 h-32 object-cover rounded-lg">
        <div class="flex-1">
            <h3 class="text-xl font-bold mb-2">${movie.title}</h3>
            <div class="flex items-center gap-4 mb-2">
                <span class="text-yellow-500"><i class="fas fa-star"></i> ${movie.rating}</span>
                <span class="text-gray-400">${movie.year}</span>
                <span class="px-3 py-1 bg-red-600 rounded-full text-sm">${movie.genre}</span>
            </div>
            <p class="text-gray-400 mb-4">${movie.description}</p>
            <div class="flex gap-4">
                <a href="movie-detail.html?id=${movie.id}" class="btn-view">View Details</a>
                <button onclick="toggleWatchlist(${movie.id}, '${movie.title}', '${movie.poster}')" 
                        class="px-6 py-2 ${inWatchlist ? 'bg-red-600' : 'bg-gray-700'} hover:bg-gray-600 rounded-lg transition">
                    <i class="fas fa-bookmark"></i> ${inWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
                </button>
            </div>
        </div>
    `;
    return card;
}

function toggleWatchlist(movieId, movieTitle, moviePoster) {
    if (isInWatchlist(movieId)) {
        removeFromWatchlist(movieId);
    } else {
        addToWatchlist(movieId, movieTitle, moviePoster);
    }
    renderMovies(); // Re-render to update button state
}

function renderPagination() {
    const pagination = document.getElementById('pagination');
    if (!pagination) return;
    
    const totalPages = Math.ceil(filteredMovies.length / moviesPerPage);
    
    if (totalPages <= 1) {
        pagination.innerHTML = '';
        return;
    }
    
    let paginationHTML = '';
    
    // Previous button
    paginationHTML += `
        <button onclick="goToPage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''} class="pagination-btn">
            <i class="fas fa-chevron-left"></i> Prev
        </button>
    `;
    
    // Page numbers
    const maxVisible = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);
    
    if (endPage - startPage < maxVisible - 1) {
        startPage = Math.max(1, endPage - maxVisible + 1);
    }
    
    if (startPage > 1) {
        paginationHTML += `<button onclick="goToPage(1)" class="pagination-btn">1</button>`;
        if (startPage > 2) {
            paginationHTML += `<span class="px-2 text-gray-400">...</span>`;
        }
    }
    
    for (let i = startPage; i <= endPage; i++) {
        paginationHTML += `
            <button onclick="goToPage(${i})" class="pagination-btn ${i === currentPage ? 'active' : ''}">
                ${i}
            </button>
        `;
    }
    
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            paginationHTML += `<span class="px-2 text-gray-400">...</span>`;
        }
        paginationHTML += `<button onclick="goToPage(${totalPages})" class="pagination-btn">${totalPages}</button>`;
    }
    
    // Next button
    paginationHTML += `
        <button onclick="goToPage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''} class="pagination-btn">
            Next <i class="fas fa-chevron-right"></i>
        </button>
    `;
    
    pagination.innerHTML = paginationHTML;
}

function goToPage(page) {
    const totalPages = Math.ceil(filteredMovies.length / moviesPerPage);
    if (page < 1 || page > totalPages) return;
    
    currentPage = page;
    renderMovies();
    
    // Scroll to top of movies section
    window.scrollTo({ top: 400, behavior: 'smooth' });
}

