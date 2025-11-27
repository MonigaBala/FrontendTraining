# Cinema Studios - Movie Production Website

A modern, responsive multi-page website for a movie production house built with HTML, CSS, JavaScript, and Tailwind CSS.

## Features

### Pages
- **Home Page** - Hero section, featured movies, statistics, services, and latest news
- **Movies Page** - Complete movie catalog with filters (genre, year, rating, search) and pagination
- **Movie Detail Page** - Detailed view of individual movies with similar movies section
- **About Page** - Company story, mission, vision, and values
- **Cast & Crew Page** - Showcase of actors and production team members
- **Watchlist Page** - Personal watchlist with local storage functionality
- **Contact Page** - Contact form and interactive Google Maps integration
- **Careers Page** - Job listings and company benefits
- **News Page** - Latest news and updates from the studio
- **Admin Login Page** - Admin dashboard with statistics and quick actions

### Key Features
- ✅ Modern, animated UI with smooth transitions
- ✅ Fully responsive design (mobile, tablet, desktop)
- ✅ Interactive movie filters and search
- ✅ Pagination for movies page
- ✅ Watchlist functionality with local storage
- ✅ Interactive Google Maps on contact page
- ✅ Smooth animations and hover effects
- ✅ Mobile-friendly navigation menu
- ✅ Toast notifications for user feedback

## Setup Instructions

1. **Clone or download** this repository

2. **Open the website** - Simply open `index.html` in your web browser, or use a local server:
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js (http-server)
   npx http-server
   ```

3. **Google Maps API** (Optional):
   - The contact page includes an interactive map
   - To enable the map, you'll need to:
     1. Get a Google Maps API key from [Google Cloud Console](https://console.cloud.google.com/)
     2. Replace the placeholder key in `contact.html` (line 10):
        ```html
        <script src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&callback=initMap" async defer></script>
        ```
   - If you don't have an API key, the map will not load, but the rest of the site works perfectly

## Admin Login

- **Username:** `admin`
- **Password:** `admin123`

## File Structure

```
MovieProductionWebsite/
├── index.html          # Home page
├── movies.html         # Movies listing page
├── movie-detail.html   # Individual movie details
├── about.html          # About us page
├── cast-crew.html      # Cast and crew page
├── watchlist.html      # User watchlist page
├── contact.html        # Contact page with map
├── careers.html        # Careers page
├── news.html           # News page
├── admin.html          # Admin login page
├── styles.css          # Custom CSS styles
├── script.js           # Shared JavaScript functions
├── home.js             # Home page specific JS
├── movies.js           # Movies page specific JS
├── movie-detail.js     # Movie detail page JS
├── cast-crew.js        # Cast & crew page JS
├── watchlist.js        # Watchlist page JS
├── contact.js          # Contact page JS
├── careers.js          # Careers page JS
├── news.js             # News page JS
└── admin.js            # Admin page JS
```

## Technologies Used

- **HTML5** - Structure
- **CSS3** - Custom styling and animations
- **JavaScript (ES6+)** - Interactivity and functionality
- **Tailwind CSS** - Utility-first CSS framework (via CDN)
- **Font Awesome** - Icons
- **Google Maps API** - Interactive map (optional)

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Features in Detail

### Movies Page
- Filter by genre, year, and minimum rating
- Search movies by title or description
- Pagination (8 movies per page)
- Add/remove movies from watchlist
- Click on movie card or "View Details" button to see full details

### Watchlist
- Add movies from any page
- View all saved movies
- Remove movies from watchlist
- Data persists using browser's local storage

### Responsive Design
- Mobile-first approach
- Hamburger menu for mobile devices
- Responsive grid layouts
- Touch-friendly buttons and interactions

### Animations
- Fade-in animations
- Slide-up effects
- Hover transitions
- Smooth scrolling

## Customization

### Adding Movies
Edit the `moviesData` array in `script.js` to add more movies.

### Adding News
Edit the `newsData` or `allNewsData` arrays in `script.js` and `news.js` respectively.

### Styling
- Main styles: `styles.css`
- Tailwind classes can be modified directly in HTML files
- Color scheme uses red (#dc2626) as primary color

## Notes

- The website uses local storage for the watchlist functionality
- All movie data is stored in JavaScript arrays (can be replaced with API calls)
- Admin login is client-side only (for demo purposes)
- Google Maps requires a valid API key to function

## License

This project is open source and available for educational purposes.

