"use strict";

const http = require('http');
const cors = require('cors');
const express = require('express');
const bodyParser = require('body-parser');
const { ExpressPeerServer } = require('peer');
const path = require('path');
require('dotenv').config();


const app = express();
const appRoot = path.dirname(require.main.filename); // will fail if using a launcher like pm2

// parse request bodies
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
// gzip compress response body
// app.use(compression);
const corsOptions = {
  // NOTE!!!: in case domain is changed, ensure to update these; local and prod domains
  origin: ["http://localhost:3000"],
  // optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}
app.use(cors(corsOptions));

const server = http.createServer(app);
const logger = require('./utils/winston');
const { initSync } = require('./workspace-sync');

app.get('/api/v1/cllb-spc/logs', (req, res, next) => {
  try {
    res.status(200);
    res.sendFile(`${appRoot}/logs/app.log`);
  } catch (error) {
    // res.sendStatus(500);
    res.status(500).json({ msg: error.message });
    logger.error(`get logs - ${error.message}`);
  }
});

initSync(server, app);

// const peerServer = ExpressPeerServer(server, {
//   // debug: true,
//   path: '/peertc'
// });
// app.use(peerServer);
// peerServer.on('connection', (client) => { logger.debug(`peer connected ${client.getId()}`) });
// peerServer.on('disconnect', (client) => { logger.debug(`peer disconnected ${client.getId()}`) });


const PORT = process.env.PORT || 4000; 
server.listen(PORT).on('listening', () => logger.info(`Server listening on port ${PORT}`))
  .on('error', (err) => { logger.error(`Server | ${err.message}`); });
