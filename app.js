const http = require('serverless-http');
const bodyParser = require('body-parser');
const express = require('express');
const app = express();

const routs = require('./api/routes');

app.use(bodyParser.json({ strict: false }));

app.use(routs);

module.exports.handler = http(app);