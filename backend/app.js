const express = require('express');
const publicRouter = require('./routes/apiRoutesPublic');
const privateRouter = require('./routes/apiRoutesPrivate');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/', publicRouter);
app.use('/', privateRouter);


module.exports = app;