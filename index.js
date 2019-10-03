const express = require('express');
const path = require('path');
const exphbs = require('express-handlebars');
const app = express();
const mongoose = require('mongoose');
const News = require('./models/news');

const hbs = exphbs.create({ // config hbs
   defaultLayout: 'main', // default layout in dir layouts
   extname: 'hbs'
});

app.engine('hbs', hbs.engine);//register hbs as engine
app.set('view engine', 'hbs');//set hbs engine
app.set('views', 'views');
app.use(express.static(path.join(__dirname, 'public'))); // set place where will be static files
app.use(express.json());


const url = `mongodb+srv://Aleksandr:7DHGdREQmKkYU7P@cluster0-nhjez.mongodb.net/test?retryWrites=true&w=majority`;
async function start() {
   await mongoose.connect(url, {useNewUrlParser: true, useUnifiedTopology: true });
   const PORT = process.env.PORT || 3000;
   app.listen(PORT, () => {
      console.log(`Server is running on ${PORT}`);
   });
}
start();

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

app.post('/addToFavorite', (req, res) => {
   const {title, author, source, content, description, publishedAt, url, urlToImage} = req.body;
   const news = new News({
      title: title,
      author: author,
      source: source,
      content: content,
      description: description,
      publishedAt: publishedAt,
      url: url,
      urlToImage: urlToImage
   });

   try {
      news.save();
      res.send({
         status: 'ok',
         message: 'News added to favorite'
      })
   } catch (e) {
      res.send({
         status: 'error',
         message: e
      })
   }
});












