// Watchlist page functionality
document.addEventListener('DOMContentLoaded', function() {
    function renderWatchlist() {
        loadWatchlist();
    }
    
    if (typeof window.moviesData !== 'undefined' && window.moviesData.length > 0) {
        renderWatchlist();
    }
    
    window.addEventListener('moviesLoaded', renderWatchlist);
});

function loadWatchlist() {
    const container = document.getElementById('watchlistContainer');
    if (!container) return;
    
    const watchlist = getWatchlist();
    
    if (watchlist.length === 0) {
        container.innerHTML = `
            <div class="text-center py-20 animate-fade-in">
                <div class="text-6xl mb-4 text-gray-600"><i class="fas fa-bookmark"></i></div>
                <h2 class="text-3xl font-bold mb-4">Your watchlist is empty</h2>
                <p class="text-gray-400 mb-8">Start adding movies to your watchlist to watch them later!</p>
                <a href="movies.html" class="btn-primary">Browse Movies</a>
            </div>
        `;
        return;
    }
    
    container.innerHTML = '';
    
    const data = typeof window.moviesData !== 'undefined' ? window.moviesData : [];
    
    watchlist.forEach((item, index) => {
        const movie = data.find(m => m.id === item.id);
        const watchlistItem = createWatchlistItem(movie, item);
        watchlistItem.style.animationDelay = `${index * 0.1}s`;
        watchlistItem.classList.add('animate-fade-in');
        container.appendChild(watchlistItem);
    });
}

function createWatchlistItem(movie, watchlistItem) {
    const item = document.createElement('div');
    const movieId = movie?.id || watchlistItem.id;
    item.className = 'watchlist-item';
    item.setAttribute("data-id", movieId);
    const poster = movie?.poster || watchlistItem.poster || 'https://via.placeholder.com/300x450/1f2937/9ca3af?text=No+Image';
    const title = movie?.title || watchlistItem.title || 'Saved Movie';
    const rating = movie?.rating ? `<span class="text-yellow-500"><i class="fas fa-star"></i> ${movie.rating}</span>` : '';
    const year = movie?.year ? `<span class="text-gray-400">${movie.year}</span>` : '';
    const genre = movie?.genre ? `<span class="px-3 py-1 bg-red-600 rounded-full text-sm">${movie.genre}</span>` : '';
    const description = movie?.description || 'This movie details will be available when you reconnect.';

    
    const detailLink = movie ? `<a href="movie-detail.html?id=${movie.id}" class="btn-view">View Details</a>` : '';
    
    item.innerHTML = `
        <img src="${poster}" alt="${title}" class="w-32 h-48 object-cover rounded-lg">
        <div class="flex-1">
            <h3 class="text-2xl font-bold mb-2">${title}</h3>
            <div class="flex items-center gap-4 mb-2">
                ${rating}
                ${year}
                ${genre}
            </div>
            <p class="text-gray-400 mb-4">${description}</p>
            <p class="text-gray-500 text-sm mb-4">Added: ${new Date(watchlistItem.addedAt).toLocaleDateString()}</p>
            <div class="flex gap-4">
                ${detailLink}
                <button onclick="removeFromWatchlistAndReload(${movieId})" class="px-6 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition">
                    <i class="fas fa-trash"></i> Remove
                </button>
            </div>
        </div>
    `;
    return item;
}

function removeFromWatchlistAndReload(movieId) {
    removeFromWatchlist(movieId);
    loadWatchlist();
}

// ===============================
// ENABLE WATCHLIST CARD CLICK NAVIGATION
// ===============================
document.addEventListener("click", function(e) {
    const item = e.target.closest(".watchlist-item");

    if (item && !e.target.closest("button")) {  
        // prevent interrupting remove button clicks
        const movieId = item.getAttribute("data-id");
        if (movieId) {
            window.location.href = `movie-detail.html?id=${movieId}`;
        }
    }
});
