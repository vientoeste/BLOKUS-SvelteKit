import { WebSocketServer as WebSocketServer_, type RawData } from "ws";
import { Server as HttpServer } from 'http';
import { Server as HttpsServer } from 'https';
import type { RedisClientType } from "redis";
import type { WebSocket } from "$types";
import { WebSocketConnectionManager, WebSocketMessageBroker, WebSocketMessageHandler, WebSocketResponseDispatcher } from "./handlers";

interface WebSocketServer extends Omit<WebSocketServer_, 'clients'> {
  clients: Set<WebSocket>;
}

export let wss: WebSocketServer;
export let webSocketMessageBroker: WebSocketMessageBroker;
export let responseDispatcher: WebSocketResponseDispatcher;
export const webSocketManager: WebSocketConnectionManager = new WebSocketConnectionManager();
export const handler = new WebSocketMessageHandler();

export const initWebSocketServer = (server: HttpServer | HttpsServer, redis: RedisClientType) => {
  if (!wss) {
    // [TODO] this server options are the defaults by official docs
    wss = new WebSocketServer_({
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

  responseDispatcher = new WebSocketResponseDispatcher(webSocketManager);
  webSocketMessageBroker = new WebSocketMessageBroker(redis, responseDispatcher);

  wss.on('listening', () => {
    // since clients' messages should be handled at each process in multi-processing environment
    // decided to use redis pub/sub to handle the message received at other process 
    // [CHECK] match redis pub/sub's event name, message, ...
    webSocketMessageBroker.subscribeMessage();
  });

  wss.on('connection', async (socket: WebSocket & { roomId: string }, request) => {
    if (!request.url) throw new Error('request url is empty')
    const url = new URL(`${process.env.ORIGIN}${request.url}`);

    const roomId = url.pathname.replace('/rooms/', '');
    if (!roomId) {
      socket.close(1, `unexpected roomId: ${roomId}`);
      throw new Error('unexpected client\'s url');
    }
    socket.roomId = roomId;

    const playerIdx = url.searchParams.get('idx');
    if (!playerIdx) throw new Error('query string is missing')

    socket.on('error', (e: Error) => {
      console.error(e);
    });

    socket.on('message', (rawMessage: RawData) => {
      try {
        const message = rawMessage.toString();
        handler.handleMessage(socket, message);
        webSocketMessageBroker.publishMessage({ message, roomId });
      } catch (e) {
        console.error(e);
      }
    });
  });
};
