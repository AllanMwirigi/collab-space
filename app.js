"use strict";

const http = require('http');
const cors = require('cors');
const express = require('express');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
app.use(cors());
// parse request bodies
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
// gzip compress response body
// app.use(compression);

const server = http.createServer(app);
const logger = require('./utils/winston');
const { initSync } = require('./workspace-sync');
initSync(server);

const PORT = process.env.PORT || 4000; 
server.listen(PORT).on('listening', () => logger.info(`Server listening on port ${PORT}`))
  .on('error', (err) => { logger.error(`Server | ${err.message}`); });
