const express = require('express');
const morgan = require('morgan');

const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const cors = require('cors'); // allows/disallows cross-site communication

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

const userRouter = require('./routes/userRoutes');
const storeRouter = require('./routes/storeRoutes');
const purchaseRouter = require('./routes/purchaseRoutes');

const app = express();

// 1) GLOBAL MIDDLEWARES
// Set security HTTP headers
app.use(helmet());

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
app.use(morgan('tiny'));
const whitelist = [
  'http://localhost:3000',
  'http://localhost:5000',
  'https://git.heroku.com/guarded-plains-32530.git',
  'smtp.mailtrap.io',
];
const corsOptions = {
  origin: function (origin, callback) {
    console.log(`** Origin of request ${origin}`);
    if (whitelist.indexOf(origin) !== -1 || !origin) {
      console.log('Origin acceptable');
      callback(null, true);
    } else {
      console.log('Origin rejected');
      callback(new Error('Not allowed by CORS'));
    }
  },
};
app.use(cors(corsOptions));
// Limit requests from same API
const limiter = rateLimit({
  max: 100, // tweak these values
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!',
});
app.use('/api', limiter);

// Body parser (now back in Express as below), reading data from body into req.body
app.use(express.json({ limit: '10kb' })); //tweak limit based on size of store

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// 3) ROUTERS
//TODO: add routers
app.use('/api/users', userRouter);
app.use('/api/stores', storeRouter);
app.use('/api/purchases', purchaseRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
