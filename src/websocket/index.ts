import { WebSocketServer } from "ws";
import { Server as HttpServer } from 'http';
import { Server as HttpsServer } from 'https';
import type { WebSocketMessage } from "./type";

export let wss: WebSocketServer;

export const initWebSocketServer = (server: HttpServer | HttpsServer) => {
  if (!wss) {
    // [TODO] this server options are the defaults by official docs
    wss = new WebSocketServer({
      server,
      perMessageDeflate: {
        zlibDeflateOptions: {
          chunkSize: 1024,
          memLevel: 7,
          level: 3
        },
        zlibInflateOptions: {
          chunkSize: 10 * 1024
        },
        clientNoContextTakeover: true,
        serverNoContextTakeover: true,
        serverMaxWindowBits: 10,
        concurrencyLimit: 10,
        threshold: 1024
      },
    });
  }

  wss.on('listening', () => {
    console.log('ws listening');
  });

  wss.on('connection', (socket, request) => {
    const roomId = request.url?.replace('/rooms/', '');

    socket.on('error', (e) => {
      console.error(e);
    });

    socket.on('message', (rawMessage) => {
      try {
        const message = JSON.parse(rawMessage.toString()) as WebSocketMessage;
        if (typeof message === 'string') {
          throw new Error('unexpected message type');
        }
        // [TODO] handle messages here
      } catch (e) {
        console.error(e);
      }
    });
  });
};
