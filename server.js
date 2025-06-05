import 'dotenv/config';

import express from 'express';
import ejs from 'ejs';
import { getActorData, getActorCredits } from './apiClient.js';
import { findCommonCredits } from './movieMatcher.js';

const app = express();

app.set('view engine', 'ejs');

app.use(express.static('public'));

app.get('/', (req, res) => {
  res.render('index');
});

app.get('/search-actors', async (req, res) => {
  const [actor1Data, actor2Data] = await Promise.all([
    getActorData(req.query.actor1),
    getActorData(req.query.actor2)
  ]);

  console.log('Actor 1:', actor1Data[0]?.name);
  console.log('Actor 2:', actor2Data[0]?.name);

  const actor1ID = actor1Data[0].id;
  const actor2ID = actor2Data[0].id;

  const [actor1Credits, actor2Credits] = await Promise.all([
    getActorCredits(actor1ID),
    getActorCredits(actor2ID)
  ]);

  const commonCredits = findCommonCredits(actor1Credits, actor2Credits);
  
  console.log('Common projects:', commonCredits);

  res.json(commonCredits);
});

app.listen(3000, () => {
  console.log('Server started on port 3000');
});