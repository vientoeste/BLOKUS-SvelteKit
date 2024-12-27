import { handler } from './build/handler.js';
import express from 'express';
import { initWebSocketServer } from './websocket/index.js';
import fs from 'fs';
import https from 'https';

const app = express();

app.use(handler);

if (process.env.NODE_ENV === 'production') {
  const key = process.env.KEY_FILE;
  const cert = process.env.CERT_FILE;
  const ca = process.env.CA_FILE;
  if (!key || !cert || !ca) {
    console.error('files for https server not found');
    process.exit(1);
  }
  const option = {
    key: fs.readFileSync(key),
    cert: fs.readFileSync(cert),
    ca: fs.readFileSync(ca),
  };
  const server = https.createServer(option, app).listen(443);
  // [CHECK]
  initWebSocketServer(server);
}
if (process.env.NODE_ENV === 'development') {
  const server = app.listen(3000);
  // [CHECK]
  initWebSocketServer(server);
}
