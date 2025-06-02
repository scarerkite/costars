require('dotenv').config();
const express = require('express');
const ejs = require('ejs');

const app = express();

app.set('view engine', 'ejs');

app.get('/', (req, res) => {
  res.render('index');
});

app.get('/search-actors', (req, res) => {
  console.log('Actor 1:', req.query.actor1);
  console.log('Actor 2:', req.query.actor2);
  res.send('Search functionality coming soon!');
});

app.listen(3000, () => {
  console.log('Server started on port 3000');
});