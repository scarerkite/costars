import 'dotenv/config';

import express from 'express';
import ejs from 'ejs';
import { getActorData, getActorCredits } from './apiClient.js';
import { findCommonCredits } from './movieMatcher.js';

const app = express();

app.set('view engine', 'ejs');

app.get('/', (req, res) => {
  res.render('index');
});

app.get('/search-actors', async (req, res) => {
  const [actor1Data, actor2Data] = await Promise.all([
    getActorData(req.query.actor1),
    getActorData(req.query.actor2)
  ]);

  console.log('Actor 1:', actor1Data);
  console.log('Actor 2:', actor2Data);

  const actor1ID = actor1Data[0].id;
  const actor2ID = actor2Data[0].id;

  console.log('Actor1 ID:', actor1ID);
  console.log('Actor2 ID:', actor2ID);

  // const [actor1CreditsData, actor2CreditsData] = await Promise.all([
  //   getActorCredits(actor1ID),
  //   getActorCredits(actor2ID)
  // ]);

  // console.log('Actor 1 credits:', actor1CreditsData);
  // console.log('Actor 2 credits:', actor2CreditsData);

  const commonCredits = await findCommonCredits(actor1ID, actor2ID)
  console.log(commonCredits)

  res.send('Search functionality coming soon!');
});

app.listen(3000, () => {
  console.log('Server started on port 3000');
});