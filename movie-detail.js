// Movie detail page functionality
document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const movieId = parseInt(urlParams.get('id'));
    
    // Wait for movies to load
    window.addEventListener('moviesLoaded', function() {
        if (movieId) {
            loadMovieDetail(movieId);
        } else {
            showError();
        }
    });
    
    // If movies already loaded
    if (moviesData.length > 0) {
        if (movieId) {
            loadMovieDetail(movieId);
        } else {
            showError();
        }
    }
});

function showError() {
    const heroTitle = document.getElementById('movieHeroTitle');
    const heroTagline = document.getElementById('movieHeroTagline');
    if (heroTitle) heroTitle.textContent = 'Movie Not Found';
    if (heroTagline) heroTagline.textContent = 'We couldn\'t locate the movie you requested';
    document.getElementById('movieDetailContent').innerHTML = `
        <div class="text-center py-12">
            <p class="text-gray-400 text-xl">Movie not found.</p>
            <a href="movies.html" class="btn-primary mt-4 inline-block">Back to Movies</a>
        </div>
    `;
}

function loadMovieDetail(movieId) {
    const movie = moviesData.find(m => m.id === movieId);
    const container = document.getElementById('movieDetailContent');
    
    if (!movie) {
        container.innerHTML = `
            <div class="text-center py-12">
                <p class="text-gray-400 text-xl">Movie not found.</p>
                <a href="movies.html" class="btn-primary mt-4 inline-block">Back to Movies</a>
            </div>
        `;
        return;
    }
    
    const heroTitle = document.getElementById('movieHeroTitle');
    const heroTagline = document.getElementById('movieHeroTagline');
    if (heroTitle) heroTitle.textContent = movie.title;
    if (heroTagline) heroTagline.textContent = `${movie.genre} • ${movie.year}`;
    
    const inWatchlist = isInWatchlist(movie.id);
    const trailerUrl = movie.trailer || 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
    
    container.innerHTML = `
        <div class="flex justify-end mb-6">
            <a href="movies.html" class="inline-flex items-center gap-2 px-5 py-2 bg-gray-800 hover:bg-gray-700 rounded-full border border-gray-700 transition text-sm font-semibold">
                <i class="fas fa-arrow-left"></i> Back to Movies
            </a>
        </div>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div class="animate-fade-in relative">
                <img src="${movie.poster}" alt="${movie.title}" class="w-full rounded-lg shadow-2xl">
            </div>
            <div class="animate-fade-in-delay-1">
                <h1 class="text-4xl md:text-5xl font-bold mb-4">${movie.title}</h1>
                <div class="flex items-center gap-4 mb-6">
                    <span class="text-yellow-500 text-2xl"><i class="fas fa-star"></i> ${movie.rating}</span>
                    <span class="text-gray-400">${movie.year}</span>
                    <span class="px-3 py-1 bg-red-600 rounded-full text-sm">${movie.genre}</span>
                </div>
                <p class="text-gray-300 text-lg mb-6 leading-relaxed">${movie.description}</p>
                <div class="mb-6">
                    <h3 class="text-xl font-bold mb-2">Director</h3>
                    <p class="text-gray-400">${movie.director}</p>
                </div>
                <div class="flex gap-4 flex-wrap">
                    <button onclick="toggleWatchlistDetail(${movie.id}, '${movie.title}', '${movie.poster}')" 
                            class="px-6 py-3 ${inWatchlist ? 'bg-red-600' : 'bg-gray-700'} hover:bg-gray-600 rounded-lg transition font-semibold">
                        <i class="fas fa-bookmark"></i> ${inWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
                    </button>
                    <a href="${trailerUrl}" target="_blank" rel="noopener" class="px-6 py-3 border border-white/20 hover:bg-white/10 rounded-lg transition font-semibold inline-flex items-center gap-2">
                        <i class="fas fa-play"></i> Watch Trailer
                    </a>
                </div>
            </div>
        </div>

        <!-- Cast & Crew Section -->
        <div class="mb-12 animate-fade-in-delay-2">
            <h2 class="text-3xl font-bold mb-6">Cast & Crew</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div class="cast-card">
                    <div class="p-6 text-center">
                        <div class="text-5xl mb-4 text-red-600"><i class="fas fa-user-tie"></i></div>
                        <h3 class="text-xl font-bold mb-2">Director</h3>
                        <p class="text-gray-400">${movie.director}</p>
                    </div>
                </div>
                ${movie.cast.map((actor, index) => `
                    <div class="cast-card">
                        <div class="p-6 text-center">
                            <div class="text-5xl mb-4 text-red-600"><i class="fas fa-user"></i></div>
                            <h3 class="text-xl font-bold mb-2">${actor}</h3>
                            <p class="text-gray-400">Cast</p>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
        
        <div class="mt-12 animate-fade-in-delay-2">
            <h2 class="text-3xl font-bold mb-6">Similar Movies</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" id="similarMovies">
                <!-- Similar movies will be loaded here -->
            </div>
        </div>
    `;
    
    // Load similar movies
    loadSimilarMovies(movie.genre, movie.id);
}

function loadSimilarMovies(genre, currentMovieId) {
    const similarMovies = moviesData
        .filter(m => m.genre === genre && m.id !== currentMovieId)
        .slice(0, 4);
    
    const container = document.getElementById('similarMovies');
    if (!container) return;
    
    if (similarMovies.length === 0) {
        container.innerHTML = '<p class="text-gray-400">No similar movies found.</p>';
        return;
    }
    
    similarMovies.forEach(movie => {
        const card = createMovieCard(movie);
        container.appendChild(card);
    });
}

function createMovieCard(movie) {
    const card = document.createElement('div');
    card.className = 'movie-card';
    card.innerHTML = `
        <a href="movie-detail.html?id=${movie.id}" class="block">
            <img src="${movie.poster}" alt="${movie.title}" loading="lazy">
        </a>
        <div class="movie-card-content">
            <a href="movie-detail.html?id=${movie.id}">
                <h3 class="text-xl font-bold mb-2 hover:text-red-600 transition">${movie.title}</h3>
            </a>
            <div class="flex items-center justify-between mb-2">
                <span class="text-yellow-500"><i class="fas fa-star"></i> ${movie.rating}</span>
                <span class="text-gray-400">${movie.year}</span>
            </div>
            <p class="text-gray-400 text-sm mb-3">${movie.genre}</p>
            <a href="movie-detail.html?id=${movie.id}" class="btn-view w-full text-center block">View Details</a>
        </div>
    `;
    return card;
}

function toggleWatchlistDetail(movieId, movieTitle, moviePoster) {
    if (isInWatchlist(movieId)) {
        removeFromWatchlist(movieId);
    } else {
        addToWatchlist(movieId, movieTitle, moviePoster);
    }
    loadMovieDetail(movieId); // Re-render to update button state
}

