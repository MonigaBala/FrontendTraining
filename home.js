// Home page specific functionality
let carouselIndex = 0;
let carouselInterval;
let localMoviesCache = [];
let carouselTotalSlides = 0;
let currentCardsPerSlide = getCardsPerSlide();
let resizeListenerInitialized = false;

// Function to get movies data from global scope or fallback cache
function getMoviesData() {
    if (typeof window.moviesData !== 'undefined' && window.moviesData && window.moviesData.length > 0) {
        return window.moviesData;
    }
    return localMoviesCache;
}

document.addEventListener('DOMContentLoaded', function() {
    currentCardsPerSlide = getCardsPerSlide();
    initCarouselResizeListener();

    // Function to initialize carousel when movies are ready
    function tryInitCarousel() {
        const data = getMoviesData();
        if (data && data.length > 0) {
            localMoviesCache = data;
            initCarousel(data);
            return true;
        }
        return false;
    }
    
    // Wait for moviesLoaded event
    window.addEventListener('moviesLoaded', function(e) {
        const data = e.detail || (typeof window.moviesData !== 'undefined' ? window.moviesData : []);
        if (data && data.length > 0) {
            localMoviesCache = data;
            window.moviesData = data; // Store in global scope
            if (!tryInitCarousel()) {
                // Retry after a short delay
                setTimeout(() => tryInitCarousel(), 100);
            }
        }
    });
    
    // Try immediately if movies are already loaded
    if (typeof window.moviesData !== 'undefined' && window.moviesData.length > 0) {
        localMoviesCache = window.moviesData;
        tryInitCarousel();
    } else {
        // Also check periodically as fallback
        let attempts = 0;
        const maxAttempts = 25; // 5 seconds at 200ms intervals
        const checkInterval = setInterval(() => {
            attempts++;
            const data = getMoviesData();
            if (data && data.length > 0) {
                localMoviesCache = data;
                window.moviesData = data;
                if (tryInitCarousel()) {
                    clearInterval(checkInterval);
                }
            } else if (attempts >= maxAttempts) {
                clearInterval(checkInterval);
                console.warn('Movies failed to load after', maxAttempts * 200, 'ms');
            }
        }, 200);
    }
    
    // Load latest news
    const latestNewsContainer = document.getElementById('latestNews');
    if (latestNewsContainer && typeof newsData !== 'undefined') {
        newsData.slice(0, 3).forEach(news => {
            const newsCard = createNewsCard(news);
            latestNewsContainer.appendChild(newsCard);
        });
    }

    initNewsTicker();
    initStatCounters();
});

function initCarousel(dataOverride) {
    const carouselContainer = document.getElementById('carouselContainer');
    const carouselIndicators = document.getElementById('carouselIndicators');
    const carouselPrev = document.getElementById('carouselPrev');
    const carouselNext = document.getElementById('carouselNext');
    
    const data = dataOverride || getMoviesData();
    
    if (!carouselContainer || !data || data.length === 0) {
        console.log('Carousel container not found or no movies data', {
            container: !!carouselContainer,
            dataLength: data ? data.length : 0
        });
        return;
    }
    
    const featuredMovies = data.slice(0, 8);
    if (featuredMovies.length === 0) {
        carouselContainer.innerHTML = '<p class="text-center text-gray-400 py-8">No movies available</p>';
        return;
    }
    
    carouselContainer.innerHTML = '';
    if (carouselIndicators) carouselIndicators.innerHTML = '';
    
    const cardsPerSlide = currentCardsPerSlide || getCardsPerSlide();

    // Group movies into slides based on current viewport
    const slides = [];
    for (let i = 0; i < featuredMovies.length; i += cardsPerSlide) {
        slides.push(featuredMovies.slice(i, i + cardsPerSlide));
    }
    
    if (slides.length === 0) return;
    
    carouselTotalSlides = slides.length;
    
    slides.forEach((slide, slideIndex) => {
        const slideContainer = document.createElement('div');
        slideContainer.className = 'flex w-full flex-shrink-0';
        slideContainer.style.gap = '1rem';
        slideContainer.style.padding = '0 0.5rem';
        slideContainer.style.flexWrap = cardsPerSlide > 2 ? 'wrap' : 'nowrap';
        
        slide.forEach(movie => {
            const movieCard = createCarouselCard(movie);
            const cardWidth = getCardWidth(cardsPerSlide);
            movieCard.style.flex = `0 0 ${cardWidth}`;
            movieCard.style.maxWidth = cardWidth;
            movieCard.style.minWidth = '0';
            slideContainer.appendChild(movieCard);
        });
        
        carouselContainer.appendChild(slideContainer);
        
        // Add indicator
        if (carouselIndicators) {
            const indicator = document.createElement('button');
            indicator.className = `w-3 h-3 rounded-full transition ${slideIndex === 0 ? 'bg-red-600' : 'bg-gray-600'}`;
            indicator.onclick = () => goToSlide(slideIndex);
            carouselIndicators.appendChild(indicator);
        }
    });
    
    // Set initial position
    carouselIndex = 0;
    carouselContainer.style.transform = 'translateX(0%)';
    
    if (carouselPrev) carouselPrev.onclick = () => prevSlide();
    if (carouselNext) carouselNext.onclick = () => nextSlide();
    
    // Auto-play carousel
    stopCarousel();
    startCarousel();
    
    console.log('Carousel initialized with', featuredMovies.length, 'movies in', slides.length, 'slides');
}

function createCarouselCard(movie) {
    const card = document.createElement('div');
    card.className = 'movie-card';
    card.style.display = 'block';
    card.style.visibility = 'visible';
    card.style.opacity = '1';
    card.style.width = 'auto';
    card.style.height = 'auto';
    card.innerHTML = `
        <a href="movie-detail.html?id=${movie.id}" class="block">
            <img src="${movie.poster}" alt="${movie.title}" loading="lazy" class="w-full h-80 object-cover rounded-t-lg" onerror="this.src='https://via.placeholder.com/400x600/1f2937/9ca3af?text=No+Image'">
        </a>
        <div class="movie-card-content p-4">
            <a href="movie-detail.html?id=${movie.id}">
                <h3 class="text-lg font-bold mb-2 hover:text-red-600 transition line-clamp-2">${movie.title}</h3>
            </a>
            <div class="flex items-center justify-between mb-2">
                <span class="text-yellow-500 text-sm"><i class="fas fa-star"></i> ${movie.rating}</span>
                <span class="text-gray-400 text-sm">${movie.year}</span>
            </div>
            <p class="text-gray-400 text-xs mb-3">${movie.genre}</p>
            <a href="movie-detail.html?id=${movie.id}" class="btn-view w-full text-center block text-sm py-2">View Details</a>
        </div>
    `;
    return card;
}

function getCardWidth(cardsPerSlide) {
    switch (cardsPerSlide) {
        case 1:
            return '100%';
        case 2:
            return 'calc(50% - 0.75rem)';
        case 3:
            return 'calc(33.333% - 0.75rem)';
        default:
            return 'calc(25% - 0.75rem)';
    }
}

function getCardsPerSlide() {
    if (typeof window === 'undefined') {
        return 4;
    }
    const width = window.innerWidth || document.documentElement.clientWidth || 1920;
    if (width < 640) return 1;
    if (width < 768) return 2;
    if (width < 1280) return 3;
    return 4;
}

function debounce(fn, delay = 200) {
    let timeoutId;
    return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => fn(...args), delay);
    };
}

function initCarouselResizeListener() {
    if (resizeListenerInitialized || typeof window === 'undefined') return;
    resizeListenerInitialized = true;
    const handleResize = debounce(() => {
        const nextValue = getCardsPerSlide();
        if (nextValue !== currentCardsPerSlide) {
            currentCardsPerSlide = nextValue;
            initCarousel();
        }
    }, 250);
    window.addEventListener('resize', handleResize);
}

function goToSlide(index) {
    const carouselContainer = document.getElementById('carouselContainer');
    if (!carouselContainer) return;
    
    const data = getMoviesData();
    const effectiveCardsPerSlide = currentCardsPerSlide || getCardsPerSlide() || 1;
    const totalSlides = carouselTotalSlides || Math.ceil((data.slice(0, 8).length) / effectiveCardsPerSlide);
    
    if (totalSlides === 0) return;
    
    if (index < 0) index = totalSlides - 1;
    if (index >= totalSlides) index = 0;
    
    carouselIndex = index;
    const translateX = -(index * 100);
    carouselContainer.style.transform = `translateX(${translateX}%)`;
    
    const indicators = document.querySelectorAll('#carouselIndicators button');
    indicators.forEach((ind, i) => {
        ind.className = i === index ? 'w-3 h-3 rounded-full bg-red-600' : 'w-3 h-3 rounded-full bg-gray-600';
    });
}

function nextSlide() {
    if (!carouselTotalSlides || carouselTotalSlides <= 1) return;
    goToSlide(carouselIndex + 1);
}

function prevSlide() {
    if (!carouselTotalSlides || carouselTotalSlides <= 1) return;
    goToSlide(carouselIndex - 1);
}

function startCarousel() {
    stopCarousel();
    if (!carouselTotalSlides || carouselTotalSlides <= 1) return;
    carouselInterval = setInterval(() => {
        goToSlide(carouselIndex + 1);
    }, 3500);
}

function stopCarousel() {
    if (carouselInterval) {
        clearInterval(carouselInterval);
    }
}

function createMovieCard(movie, isFeatured = false) {
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
            <div class="flex gap-2">
                <a href="movie-detail.html?id=${movie.id}" class="btn-view flex-1 text-center">View Details</a>
                <button onclick="event.stopPropagation(); addToWatchlist(${movie.id}, '${movie.title}', '${movie.poster}')" class="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded transition">
                    <i class="fas fa-bookmark"></i>
                </button>
            </div>
        </div>
    `;
    return card;
}

function createNewsCard(news) {
    const card = document.createElement('div');
    card.className = 'news-card';
    card.innerHTML = `
        <img src="${news.image}" alt="${news.title}">
        <div class="p-6">
            <span class="text-gray-400 text-sm">${new Date(news.date).toLocaleDateString()}</span>
            <h3 class="text-xl font-bold mt-2 mb-2">${news.title}</h3>
            <p class="text-gray-400 mb-4">${news.excerpt}</p>
            <a href="news.html" class="text-red-600 hover:text-red-500 transition">Read More <i class="fas fa-arrow-right"></i></a>
        </div>
    `;
    return card;
}

function initNewsTicker() {
    const tickerTrack = document.getElementById('newsTickerTrack');
    const stories = typeof newsData !== 'undefined' ? newsData : [];
    if (!tickerTrack) return;

    tickerTrack.innerHTML = '';

    if (!stories.length) {
        const placeholder = document.createElement('div');
        placeholder.className = 'ticker-item';
        placeholder.textContent = 'Stay tuned for the latest updates from Cinema Studios';
        tickerTrack.appendChild(placeholder);
        return;
    }

    const tickerItems = [...stories, ...stories];

    tickerItems.forEach(story => {
        const item = document.createElement('div');
        item.className = 'ticker-item';
        const dateLabel = new Date(story.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        item.innerHTML = `<span>${dateLabel}</span>${story.title}`;
        tickerTrack.appendChild(item);
    });
}

function initStatCounters() {
    const statCards = document.querySelectorAll('.stat-card');
    if (!statCards.length) return;

    const animateCard = (card) => {
        if (card.dataset.animated === 'true') return;
        card.dataset.animated = 'true';

        const target = parseInt(card.dataset.statTarget || '0', 10);
        const suffix = card.dataset.statSuffix || '';
        const valueEl = card.querySelector('.stat-value');
        const duration = 1800;
        const startTime = performance.now();

        function update(currentTime) {
            const progress = Math.min((currentTime - startTime) / duration, 1);
            const value = Math.floor(progress * target);
            valueEl.textContent = `${value.toLocaleString()}${suffix ? suffix : ''}`;
            if (progress < 1) {
                requestAnimationFrame(update);
            } else {
                valueEl.textContent = `${target.toLocaleString()}${suffix ? suffix : ''}`;
            }
        }

        requestAnimationFrame(update);
    };

    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateCard(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.45 });

        statCards.forEach(card => observer.observe(card));
    } else {
        statCards.forEach(card => animateCard(card));
    }
}
document.addEventListener("DOMContentLoaded", () => {
    const vid = document.querySelector(".hero-video");

    // Try autoplay
    vid.play().catch(() => {
        console.log("Autoplay blocked — waiting for user gesture");
        // On any click, play video
        window.addEventListener("click", () => {
            vid.play();
        }, { once: true });
    });
});

