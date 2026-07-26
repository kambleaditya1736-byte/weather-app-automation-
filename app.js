const path = require('path');
const express = require('express');
const dotenv = require('dotenv');

dotenv.config();

const weatherRouter = require('./routes/weather');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));

app.use('/', weatherRouter);

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
