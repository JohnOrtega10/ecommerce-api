const express = require('express');
const compression = require('compression');

// Controllers
const { globalErrorHandler } = require('./controllers/error.controller');

// Routers
const { usersRouter } = require('./routes/users.routes');
const { productsRouter } = require('./routes/products.routes');
const { cartRouter } = require('./routes/cart.routes');

const app = express();

// Enable incoming data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//Compress response
app.use(compression());

// Endpoints
app.use('/api/v1/users', usersRouter);
app.use('/api/v1/products', productsRouter);
app.use('/api/v1/cart', cartRouter);

app.use(globalErrorHandler);

module.exports = { app };

// require('crypto').randomBytes(64).toString('hex');
