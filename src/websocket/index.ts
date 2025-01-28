import { WebSocketServer as WebSocketServer_, type RawData } from "ws";
import { Server as HttpServer } from 'http';
import { Server as HttpsServer } from 'https';
import type { RedisClientType } from "redis";
import type { ActiveWebSocket, PendingWebSocket, PlayerIdx } from "$types";
import { WebSocketConnectionManager, WebSocketConnectionOrchestrator, WebSocketMessageBroker, WebSocketMessageHandler, WebSocketResponseDispatcher } from "./handlers.js";

interface WebSocketServer extends Omit<WebSocketServer_, 'clients'> {
  clients: Set<PendingWebSocket>;
}

export let wss: WebSocketServer;
export let webSocketMessageBroker: WebSocketMessageBroker;
export let responseDispatcher: WebSocketResponseDispatcher;
export let connectionOrchestrator: WebSocketConnectionOrchestrator;
export let messageHandler: WebSocketMessageHandler;
export const webSocketManager: WebSocketConnectionManager = new WebSocketConnectionManager();

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

  messageHandler = new WebSocketMessageHandler(redis);
  responseDispatcher = new WebSocketResponseDispatcher(webSocketManager);
  webSocketMessageBroker = new WebSocketMessageBroker(redis, responseDispatcher);
  connectionOrchestrator = new WebSocketConnectionOrchestrator(messageHandler, webSocketMessageBroker, responseDispatcher, webSocketManager);

  wss.on('listening', () => {
    // since clients' messages should be handled at each process in multi-processing environment
    // decided to use redis pub/sub to handle the message received at other process 
    // [CHECK] match redis pub/sub's event name, message, ...
    webSocketMessageBroker.subscribeMessage();
  });

  wss.on('connection', async (socket: PendingWebSocket, request) => {
    if (!request.url) throw new Error('request url is empty')
    const url = new URL(`${process.env.ORIGIN}${request.url}`);

    const roomId = url.pathname.replace('/rooms/', '');
    if (!roomId) {
      socket.close(1, `unexpected roomId: ${roomId}`);
      throw new Error('unexpected client\'s url');
    }
    socket.roomId = roomId;

    // [TODO] sequence totally went wrong. Extract user id from cookies first, and then get playerIdx from redis
    const rawPlayerIdx = url.searchParams.get('idx');
    if (!rawPlayerIdx) throw new Error('query string is missing');
    const playerIdx = parseInt(rawPlayerIdx);
    if (Number.isNaN(playerIdx) || playerIdx < 0 || playerIdx > 3) throw new Error('received inproper query string');
    socket.playerIdx = playerIdx as PlayerIdx;

    // [TODO] $lib/database couldn't be resolved at websocket's transpiling time
    const rawRoomCache = await redis.hGetAll(`room:${roomId}`);
    if (!rawRoomCache || Object.keys(rawRoomCache).length === 0) {
      socket.send(JSON.stringify({ type: 'ERROR', message: 'room doesn\'t exist' }));
      socket.close();
      return;
    }
    const { p0, p1, p2, p3 } = rawRoomCache;
    const userId = playerIdx === 0 ? JSON.parse(p0).id :
      playerIdx === 1 ? JSON.parse(p1).id :
        playerIdx === 2 ? JSON.parse(p2).id : JSON.parse(p3).id;
    if (!userId) throw new Error('user not found');
    socket.userId = userId;

    const activeSocket = socket as ActiveWebSocket;

    webSocketManager.addClient({ roomId, client: activeSocket });

    socket.on('error', (e: Error) => {
      console.error(e);
    });

    socket.on('message', (rawMessage: RawData) => {
      try {
        const message = rawMessage.toString();
        connectionOrchestrator.handleClientMessage(activeSocket, message);
      } catch (e) {
        console.error(e);
      }
    });

    socket.on('close', () => {
      webSocketManager.removeClient({ roomId: activeSocket.roomId, userId: activeSocket.userId });
    });
  });
};
