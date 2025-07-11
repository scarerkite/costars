import 'dotenv/config';

import express from 'express';
import ejs from 'ejs';
import { getActorData, getActorCredits } from './apiClient.js';
import { findCommonCredits } from './movieMatcher.js';
import rateLimit from "express-rate-limit";

const app = express();
app.set("trust proxy", true);

const searchLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10,                 // 10 searches per minute
  message: {
    error: "Search rate limit exceeded. Please wait a moment before searching again."
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.set('view engine', 'ejs');

app.use(express.static('public'));
app.use("/search-actors", searchLimiter);
app.use((req, _res, next) => {
  const timestamp = new Date().toISOString();
  const referrer = req.get('Referer') || 'Direct';
  const userAgent = req.get('User-Agent') || 'Unknown';
  
  console.log(`${timestamp} - ${req.method} ${req.url}`);
  if (referrer !== 'Direct') {
    console.log(`Referrer: ${referrer}`);
  }
  console.log(`User-Agent: ${userAgent.substring(0, 100)}`); // Truncate long user agents
  console.log('---');
  
  next();
});

app.get('/', (req, res) => {
  res.render('index');
});

app.get('/search-actors', async (req, res) => {
  try {   
    if (req.query.actor1 === undefined || req.query.actor2 === undefined) {
      return res.status(400).json({ error: '2 actors are required' });
    }
    
    // Check if either parameter is just whitespace
    const actor1 = req.query.actor1.trim();
    const actor2 = req.query.actor2.trim();
    
    if (actor1.length === 0 || actor2.length === 0) {
      return res.status(400).json({ error: 'Actor names cannot be empty' });
    }
    
    // Check length limits (prevent potential DoS attacks)
    if (actor1.length > 100 || actor2.length > 100) {
      return res.status(400).json({ error: 'Actor names must be less than 100 characters' });
    }
    
    const sanitize = (str) => str.replace(/[<>]/g, '');
    const cleanActor1 = sanitize(actor1);
    const cleanActor2 = sanitize(actor2);

    const [actor1Data, actor2Data] = await Promise.all([
      getActorData(cleanActor1),
      getActorData(cleanActor2)
    ]);

    if (actor1Data.length === 0) {
      return res.status(200).json({ error: `Actor '${cleanActor1}' not found` });
    }
    
    if (actor2Data.length === 0) {
      return res.status(200).json({ error: `Actor '${cleanActor2}' not found` });
    }

    const actor1ID = actor1Data[0].id;
    const actor2ID = actor2Data[0].id;

    const [actor1Credits, actor2Credits] = await Promise.all([
      getActorCredits(actor1ID),
      getActorCredits(actor2ID)
    ]);

    const commonCredits = findCommonCredits(actor1Credits, actor2Credits);
    
    res.json(commonCredits);
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

if (process.env.NODE_ENV !== 'test') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server started on port ${PORT}`);
  });
}

export default app;