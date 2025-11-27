// News page functionality
const allNewsData = [
    ...newsData,
    {
        id: 4,
        title: "Behind the Scenes: Making of Our Latest Film",
        excerpt: "Take an exclusive look at the production process of our upcoming blockbuster.",
        image: "https://images.unsplash.com/photo-1519682337058-a94d519337bc?w=600&h=400&fit=crop",
        date: "2024-01-20",
        content: "Full article content about the making of the film..."
    },
    {
        id: 5,
        title: "New Studio Facilities Opening",
        excerpt: "State-of-the-art production facilities now open for filmmakers.",
        image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&h=400&fit=crop",
        date: "2024-01-18",
        content: "Full article content about the new facilities..."
    },
    {
        id: 6,
        title: "Industry Recognition and Awards",
        excerpt: "Our team receives multiple nominations at prestigious film festivals.",
        image: "https://images.unsplash.com/photo-1464822759844-d150ad6bfcfe?w=600&h=400&fit=crop",
        date: "2024-01-12",
        content: "Full article content about awards..."
    },
    {
        id: 7,
        title: "Upcoming Film Festival Participation",
        excerpt: "We're excited to showcase our latest works at international festivals.",
        image: "https://images.unsplash.com/photo-1502134249126-9f3755a50d78?w=600&h=400&fit=crop",
        date: "2024-01-08",
        content: "Full article content about festivals..."
    },
    {
        id: 8,
        title: "Partnership Announcement",
        excerpt: "New strategic partnerships to expand our global reach.",
        image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&h=400&fit=crop",
        date: "2024-01-03",
        content: "Full article content about partnerships..."
    },
    {
        id: 9,
        title: "Technology Innovation in Filmmaking",
        excerpt: "How we're using cutting-edge technology to enhance storytelling.",
        image: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=600&h=400&fit=crop",
        date: "2023-12-28",
        content: "Full article content about technology..."
    }
];

document.addEventListener('DOMContentLoaded', function() {
    loadNews();
});

function loadNews() {
    const container = document.getElementById('newsContainer');
    if (!container) return;
    
    // Sort by date (newest first)
    const sortedNews = [...allNewsData].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    sortedNews.forEach((article, index) => {
        const newsCard = createNewsCard(article);
        newsCard.style.animationDelay = `${index * 0.1}s`;
        newsCard.classList.add('animate-fade-in');
        container.appendChild(newsCard);
    });
}

function createNewsCard(news) {
    const card = document.createElement('div');
    card.className = 'news-card';
    card.innerHTML = `
        <img src="${news.image}" alt="${news.title}">
        <div class="p-6">
            <span class="text-gray-400 text-sm">${new Date(news.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            <h3 class="text-xl font-bold mt-2 mb-2">${news.title}</h3>
            <p class="text-gray-400 mb-4">${news.excerpt}</p>
            <button onclick="readMore(${news.id})" class="text-red-600 hover:text-red-500 transition">
                Read More <i class="fas fa-arrow-right"></i>
            </button>
        </div>
    `;
    return card;
}

function readMore(newsId) {
    const article = allNewsData.find(n => n.id === newsId);
    if (article) {
        // Show full article in a modal
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4';
        modal.innerHTML = `
            <div class="bg-gray-800 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                <div class="p-6">
                    <div class="flex justify-between items-start mb-4">
                        <h2 class="text-3xl font-bold">${article.title}</h2>
                        <button onclick="this.closest('.fixed').remove()" class="text-gray-400 hover:text-white">
                            <i class="fas fa-times text-2xl"></i>
                        </button>
                    </div>
                    <img src="${article.image}" alt="${article.title}" class="w-full h-64 object-cover rounded-lg mb-4">
                    <p class="text-gray-400 mb-2">${new Date(article.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    <div class="prose prose-invert max-w-none">
                        <p class="text-gray-300 leading-relaxed mb-4">${article.excerpt}</p>
                        <p class="text-gray-300 leading-relaxed">${article.content || 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'}</p>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }
}

