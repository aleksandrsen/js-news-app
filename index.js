const express = require('express');
const path = require('path');
const exphbs = require('express-handlebars');
const app = express();
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongodb-session')(session);
const bcyrpt = require('bcryptjs');
const keys = require('./keys');
const crypto = require('crypto');
const helmet = require('helmet');
const compression = require('compression');
// Emails
const nodemailer = require('nodemailer');
const sendgrid = require('nodemailer-sendgrid-transport');
const regEmail = require('./emails/registration');
const resetEmail = require('./emails/reset');
// Models
const News = require('./models/news');
const User = require('./models/user');
// Middleware
const varMiddleware = require('./middleware/variables');
const userMiddleware = require('./middleware/user');
const auth = require('./middleware/auth');


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
app.use(helmet());
app.use(compression());
app.use(varMiddleware);
app.use(userMiddleware);

// Main
app.get('/', auth, (req, res) => {
   res.render('index', {
      isHome: true,
      isSearchNews: true,
      isModal: true
   });
});

// Register
app.post('/register', async (req, res) => {
    try {
        let {name, email, password, } = req.body;
        const candidate = await User.findOne({ email });

        if (candidate) {
            res.send(
                makeResponse('error', 'User exist!')
            );
            return;
        } else {
            const hashPassword = await bcyrpt.hash(password, 10);
            const user = new User({
                name,
                email,
                password: hashPassword
            });

            await user.save();
            res.send(
                makeResponse('ok')
             );
            await transporter.sendMail(regEmail(email));
        }

    } catch (e) {
        console.log('Error app.post(/register)', e);
    }
});

// login and logOut
app.get('/login', (req, res) => {
   res.render('login', {
      isLogin: true
   });
});

app.post('/login', async (req, res) => {
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
                        res.send(
                            makeResponse('ok')
                        );
                    }
                });
            } else {
                res.send(
                    makeResponse('ok', 'Password is incorrect!')
                );
            }
        } else {
            res.send(
                makeResponse('error', 'We could not find this user, user doesn\'t exist!')
            );
        }
    } catch (e) {
        console.log('Error app.post(/login)', e);
    }
});

app.get('/logOut', auth, (req, res) => {
    req.session.destroy(() => {
        res.send(
            makeResponse('ok')
        );
    });
});

// Reset and change password
app.get('/reset', (req, res) => {
    res.render('reset', {
        title: 'Forgot password?'
    });
});

app.post('/reset', (req, res) => {
    try {
        crypto.randomBytes(32, async (err, buffer) => {
            if (err) {
                console.log(err);
                return;
            }
            const token = buffer.toString('hex');
            const candidate = await User.findOne({email: req.body.email});

            if (candidate) {
                candidate.resetToken = token;
                candidate.resetTokenExp = Date.now() + 60 * 60 * 1000;
                await candidate.save();
                await transporter.sendMail(resetEmail(candidate.email, token));
                res.send(
                    makeResponse('ok', 'We send message to your email!')
                );
            } else {
                res.send(res.send(
                    makeResponse('error', 'User with this email doesn\'t exist!')
                ));
            }
        })
    } catch (e) {
        res.send(res.send(
            makeResponse('error', e)
        ));
    }
});

app.get('/password/:token', async (req, res) => {
    if (!req.params.token) return;

    try {
        const user = await User.findOne({
            resetToken: req.params.token,
            resetTokenExp: {$gt: Date.now()}
        });

        if (!user) {
            console.log('Error - app.get(/password/:token)');
        } else {
            res.render('password', {
                userId: user._id.toString(),
                token: req.params.token
            });
        }
    } catch (e) {
        console.log('Error - app.get(/password/:token)');
    }
});

app.post('/password', async (req, res) => {
    try {
        const user = await User.findOne({
            _id: req.body.userId,
            resetToken: req.body.token,
            resetTokenExp: {$gt: Date.now()}
        });

        if (user) {
            user.password = await  bcyrpt.hash(req.body.password, 10);
            user.resetToken = undefined;
            user.resetTokenExp = undefined;
            await user.save();
            res.send(
                makeResponse('ok', 'Password changed!')
            );
        } else {
            res.send(
                makeResponse('error', 'Token lifetime expired!')
            );
        }

    } catch (e) {
        console.log('app.post(/password)', e);
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
         message: 'News added to favorite!',
         newsId: id
      })
   } catch (e) {
      res.send(
          makeResponse('error', e)
      );
      console.log('Error app.post(/addToFavorite)', e);
   }
});

app.post('/removeFromFavorite', auth, async (req, res) => {
   try {
      await News.deleteOne({_id: req.body.id});
      await req.user.removeFromFavorite(req.body.id);
      res.send(
          makeResponse('ok', 'News removed from favorite!')
      )
   } catch (e) {
      res.send(makeResponse('error', e));
       console.log('Error app.post(/removeFromFavorite)')
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


function makeResponse(status, message) {
    return {
        status,
        message
    }
}


