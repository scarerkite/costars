# CO-STARS

**Find movies and TV shows that two actors have appeared in together.**

A full-stack web application that discovers shared filmographies between actors using The Movie Database (TMDB) API. Built as a learning project to explore Node.js, containerization, and modern web development practices.

## 🎬 What it does

Enter two actor names and instantly discover their collaborative work:
- Movies they've starred in together
- TV shows they've both appeared in
- Release years and media types
- Clean, responsive interface

**Example:** Search for "Meera Syal" and "Sanjeev Bhaskar" to see their long history of comedy collaborations.

## 🚀 Quick Start

### Prerequisites
- Node.js v22.16.0+
- [TMDB API key](https://www.themoviedb.org/settings/api) (free registration required)

### Local Development
```bash
# Clone and setup
git clone [your-repo-url]
cd costars

# Configure environment
cp .env.example .env
# Add your TMDB_API_KEY to .env

# Install and run
npm install
npm start

# Visit http://localhost:3000
```

### Docker (Recommended for Production)
```bash
# Build and run
docker build -t costars .
docker run -p 3000:3000 --env-file .env costars

# Development with live reloading (volume mounting)
docker run -p 3000:3000 -v $(pwd):/app -v /app/node_modules costars
```

## 🏗️ Architecture

### Backend (Node.js + Express)
- **Server**: Express.js with EJS templating
- **API Client**: Custom TMDB integration with error handling
- **Movie Matcher**: Core logic for finding shared projects

### Frontend (Vanilla JavaScript)
- **DOM manipulation**: Custom helpers for dynamic content
- **Styling**: CSS-only responsive design with retro theme
- **Forms**: Standard HTML forms with JavaScript enhancement

### Key Files
```
├── server.js           # Express server and routes
├── apiClient.js        # TMDB API integration
├── movieMatcher.js     # Core matching logic
├── public/
│   ├── script.js       # Client-side JavaScript
│   ├── domHelpers.js   # DOM manipulation utilities
│   └── styles.css      # Base styling
└── views/
    ├── index.ejs       # Main template
    └── partials/form.ejs
```

## 🧪 Testing

```bash
# Run all tests
npm test
```

Tests cover:
- API client error handling
- Movie matching logic
- DOM helper functions
- Server route responses

## 🔧 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `TMDB_API_KEY` | Your TMDB API key | Yes |
| `PORT` | Server port (default: 3000) | No |
| `NODE_ENV` | Environment (development/production) | No |

## 🎯 Learning Goals Achieved

This project was built to explore technologies outside my Rails comfort zone:

✅ **Node.js & Express**: Server-side JavaScript with routing and middleware  
✅ **External API Integration**: TMDB API with error handling
✅ **Vanilla JavaScript**: DOM manipulation without frameworks
✅ **Vanilla CSS**: Seeing what's possible with standard CSS
✅ **Docker Containerization**: Single-container deployment with development workflow support

## 📄 License

MIT License - feel free to use this for your own learning!

## 🙏 Acknowledgments

- [The Movie Database (TMDB)](https://www.themoviedb.org/) for the excellent API
- Fluid typography and spacing scales generated using [Utopia](https://utopia.fyi/)