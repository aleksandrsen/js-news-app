const express = require('express');
const path = require('path');
const exphbs = require('express-handlebars');
const app = express();

const hbs = exphbs.create({ // config hbs
   defaultLayout: 'main', // default layout in dir layouts
   extname: 'hbs'
});

app.engine('hbs', hbs.engine);//register hbs as engine
app.set('view engine', 'hbs');//set hbs engine
app.set('views', 'views');
app.use(express.static(path.join(__dirname, 'public'))); // set place where will be a static files
app.use(express.urlencoded({extended: true}));


app.get('/', (req, res) => {
   res.render('index', {
      isHome: true,
      isSearchNews: true
   });
});

app.get('/favorite-news', (req, res) => {
   res.render('favorite-news', {
      isFavorite: true,
      isSearchNews: false
   });
});

app.get('/login', (req, res) => {
   res.render('login', {
      isLogin: true,
      isSearchNews: false
   });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
   console.log(`Server is running on ${PORT}`);
});