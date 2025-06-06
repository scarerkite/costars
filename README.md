# COSTARS

Find movies and TV shows that two actors have appeared in together.

## What it does

Enter two actor names and discover their shared filmography using The Movie Database (TMDB) API.

## Running locally

### Prerequisites
- Node.js v22.16.0+
- TMDB API key

### Setup
1. Clone this repository
2. Create a `.env` file with your TMDB API key:
   ```
   TMDB_API_KEY=your_api_key_here
   ```
3. Install dependencies:
   ```
   npm install
   ```
4. Start the server:
   ```
   node --watch server.js
   ```
5. Open http://localhost:3000

## Running with Docker

### Build the image
```bash
docker build -t costars .
```

### Run the container
```bash
docker run -p 3000:3000 costars
```

The app will be available at http://localhost:3000

### Stop the container
Press `Ctrl+C` (may need multiple attempts)

## Learning Goals
This project explores:
- Node.js and Express
- External API integration
- Docker containerization  
- Vanilla JavaScript frontend
- Error handling and async patterns