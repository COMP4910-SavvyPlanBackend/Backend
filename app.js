const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const userRouter = require('./routes/userRoutes');
const advisorRouter = require('./routes/advisorRoutes');
const storeRouter = require('./routes/storeRoutes');

//const planRouter = require('./routes/planRoutes');
//const purchaseRouter = require('./routes/purchaseRoutes');

const app = express();

// 1) GLOBAL MIDDLEWARES
// Set security HTTP headers
app.use(helmet());

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

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
// we can change names to remove api/v1 if ben wants it or add those routes to serve react??
app.use('/api/v1/users', userRouter);
app.use('/api/v1/advisors', advisorRouter);
app.use('/api/v1/stores', storeRouter);
//app.use('/api/v1/plans', planRouter);
//app.use('/api/v1/purchases', purchaseRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
