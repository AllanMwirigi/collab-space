"use strict";

const http = require('http');
const cors = require('cors');
const express = require('express');
const bodyParser = require('body-parser');
const { ExpressPeerServer } = require('peer');
// const { v4 } = require('uuid');
require('dotenv').config();

const app = express();
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

// app.get('/api/v1/peer-join', (req, res, next) => {
//   res.status(200).json({ peerId: v4() });
// });

initSync(server);

const peerServer = ExpressPeerServer(server, {
  // debug: true,
  path: '/peertc'
});
// app.use('/peertc', peerServer);
app.use(peerServer);

peerServer.on('connection', (client) => { logger.debug(`peer connected ${client.getId()}`) });
peerServer.on('disconnect', (client) => { logger.debug(`peer connected ${client.getId()}`) });


const PORT = process.env.PORT || 4000; 
server.listen(PORT).on('listening', () => logger.info(`Server listening on port ${PORT}`))
  .on('error', (err) => { logger.error(`Server | ${err.message}`); });
