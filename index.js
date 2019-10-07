const express = require('express');
const path = require('path');
const exphbs = require('express-handlebars');
const app = express();
const mongoose = require('mongoose');
const session = require('express-session');
const varMiddlware = require('./middleware/variables');
const News = require('./models/news');
const User = require('./models/user');


const hbs = exphbs.create({ // config hbs
   defaultLayout: 'main', // default layout in dir layouts
   extname: 'hbs'
});
app.engine('hbs', hbs.engine);//register hbs as engine
app.set('view engine', 'hbs');//set hbs engine
app.set('views', 'views');

app.use(async (req, res, next) => {
   try {
      const user = await User.findById('5d976acc33d4a8060c60d281');
      req.user = user;
      next();
   } catch (e) {
      console.log(e);
   }
});

app.use(express.static(path.join(__dirname, 'public'))); // set place where will be static files
app.use(express.json());
app.use(session({
   secret: 'some secret value',
   resave: false,
   saveUninitialized: false
}));
// app.use(varMiddlware);

app.get('/', (req, res) => {
   res.render('index', {
      isHome: true,
      isSearchNews: true,
      isModal: true
   });
});

app.get('/login', (req, res) => {
   res.render('login', {
      isLogin: true,
   });
});

app.post('/login/auth', (req, res) => {
   // req.session.isAuthenicated = true;
   res.send({
      message: 'hello user'
   })

});

app.get('/favorite-news', async (req, res) => {
   res.render('favorite-news', {
      isFavorite: true
   });
});

app.get('/get-favorite-news', async (req, res) => {
   const user = await req.user
       .populate('favoriteNews')
       .execPopulate();

   res.send(user.favoriteNews);
});

app.post('/addToFavorite', async (req, res) => {
   const {title, author, source, content, description, publishedAt, url, urlToImage} = req.body;
   const news = new News({
      title: title,
      author: author,
      source: source,
      content: content,
      description: description,
      publishedAt: publishedAt,
      url: url,
      urlToImage: urlToImage,
      userId: req.user._id
   });
   try {
      await news.save();
      const id = news.id;
      await req.user.addToFavoriteNews(id);
      res.send({
         status: 'ok',
         message: 'News added to favorite',
         newsId: id
      })
   } catch (e) {
      res.send({
         status: 'error',
         message: e
      })
   }
});

app.post('/removeFromFavorite', async (req, res) => {
   try {
      await News.deleteOne({_id: req.body.id});
      await req.user.removeFromFavorite(req.body.id);
      res.send({
         status: 'ok',
         message: 'News removed to favorite'
      })
   } catch (e) {
      res.send({
         status: 'error',
         message: e
      })
   }
});

const url = `mongodb+srv://Aleksandr:7DHGdREQmKkYU7P@cluster0-nhjez.mongodb.net/newsApp`;
async function start() {
   await mongoose.connect(url, {useNewUrlParser: true, useUnifiedTopology: true });
   const PORT = process.env.PORT || 3000;

   const candidate = await User.findOne();
   if(!candidate) {
      const user = new User({
         name:'San',
         email: 'san@gmail.com',
         favoriteNews: []
      });
      await user.save();
   }

   app.listen(PORT, () => {
      console.log(`Server is running on ${PORT}`);
   });
}
start();






