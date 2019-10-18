const express = require('express');
const path = require('path');
const exphbs = require('express-handlebars');
const app = express();
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongodb-session')(session);
const bcyrpt = require('bcryptjs');
const keys = require('./keys');
const regEmail = require('./emails/registration');
// Models
const News = require('./models/news');
const User = require('./models/user');
// Middleware
const varMiddleware = require('./middleware/variables');
const userMiddleware = require('./middleware/user');
const auth = require('./middleware/auth');
const nodemailer = require('nodemailer');
const sendgrid = require('nodemailer-sendgrid-transport');

const transporter = nodemailer.createTransport(sendgrid({
    auth: {api_key: keys.SEND_GRID_APi_KEY}
}));


const hbs = exphbs.create({
   defaultLayout: 'main',
   extname: 'hbs'
});

app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');
app.set('views', 'views');

const store = new MongoStore({
    collection: 'sessions',
    uri: keys.MONGODB_URI
});

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(session({
   secret: keys.SESSION_SECRET,
   resave: false,
   saveUninitialized: false,
   store
}));
app.use(varMiddleware);
app.use(userMiddleware);

app.get('/', auth, (req, res) => {
   res.render('index', {
      isHome: true,
      isSearchNews: true,
      isModal: true
   });
});

// login
app.get('/login', (req, res) => {
   res.render('login', {
      isLogin: true
   });
});

app.post('/login/auth', async (req, res) => {
    try {
        const {email, password} = req.body;
        const candidate = await User.findOne({ email });

        if (candidate) {
            const areSame = await bcyrpt.compare(password, candidate.password);

            if (areSame) {
                req.session.user = candidate;
                req.session.isAuthenicated = true;
                req.session.save(err => {
                    if (err) {
                        throw err
                    } else {
                        res.send({
                            status: 'ok',
                            message: 'hello user'
                        });
                    }
                });
            } else {
                res.send({
                    status: 'Error',
                    message: 'Password is incorrect.'
                });
            }
        } else {
            res.send({
                status: 'Error',
                message: 'We could not find this user, user doesn\'t exist.'
            });
        }

    } catch (e) {
        res.send({
            status: 'Error',
            message: e
        });
    }
});

app.get('/logOut', auth, (req, res) => {
    req.session.destroy(() => {
        res.send({
            status: 'ok',
            message: 'logout user'
        });
    });
});

// Register
app.post('/register', async (req, res) => {
    try {
        let {name, email, password, } = req.body;
        const candidate = await User.findOne({ email });

        if (candidate) {
            res.send({
                status: 'error',
                message: 'User exist!'
            });
            return;
        } else {
            const hashPassword = await bcyrpt.hash(password, 10);
            const user = new User({
                name,
                email,
                password: hashPassword
            });

            await user.save();
            res.send({
                status: 'ok'
            });
            await transporter.sendMail(regEmail(email));
        }

    } catch (e) {
        res.send({
            status: 'error',
            message: e
        });
    }
});

// Favorite news
app.get('/favorite-news', auth, async (req, res) => {
   res.render('favorite-news', {
      isFavorite: true
   });
});

app.get('/get-favorite-news', auth, async (req, res) => {
   const user = await req.user
       .populate('favoriteNews')
       .execPopulate();

   res.send(user.favoriteNews);
});

app.post('/addToFavorite', auth, async (req, res) => {
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

app.post('/removeFromFavorite', auth, async (req, res) => {
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

// Start
async function start() {
   await mongoose.connect(keys.MONGODB_URI, {useNewUrlParser: true, useUnifiedTopology: true });
   const PORT = process.env.PORT || 3000;

   app.listen(PORT, () => {
      console.log(`Server is running on ${PORT}`);
   });
}
start();





