import { WebSocket, WebSocketServer as WebSocketServer_ } from "ws";
import { Server as HttpServer } from 'http';
import { Server as HttpsServer } from 'https';
import type { RedisClientType } from "redis";
import type { WebSocketMessage } from "./type";

interface WebSocketServer extends Omit<WebSocketServer_, 'clients'> {
  clients: Set<WebSocket & { roomId?: string }>;
}

const broadcastMessage = (roomId: string, message: string) => {
  wss.clients.forEach((client: WebSocket & { roomId?: string }) => {
    if (!client.roomId) return;
    if (client.roomId === roomId) {
      client.send(message);
    }
  });
}

export let wss: WebSocketServer;

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

  const redisInstanceForPubSub = redis.duplicate();

  wss.on('listening', () => {
    // since clients' messages should be handled at each process in multi-processing environment
    // decided to use redis pub/sub to handle the message received at other process 
    // [CHECK] match redis pub/sub's event name, message, ... 
    redisInstanceForPubSub.subscribe('message', (message: string) => {
      const { roomId, rawMessage } = JSON.parse(message) as { roomId: string, rawMessage: string };
      broadcastMessage(roomId, rawMessage);
    });
  });

  wss.on('connection', async (socket: WebSocket & { roomId: string }, request) => {
    if (!request.url) throw new Error('request url is empty')
    const url = new URL(request.url);

    const roomId = url.pathname.replace('/rooms/', '');
    if (!roomId) {
      socket.close(1, `unexpected roomId: ${roomId}`);
      throw new Error('unexpected client\'s url');
    }
    socket.roomId = roomId;

    const playerIdx = url.searchParams.get('idx');
    const id = url.searchParams.get('id');
    const name = url.searchParams.get('name');
    if (!playerIdx || !id || !name) throw new Error('query string is missing')
    await redis.hSet(`room:${roomId}`, `p${playerIdx}`, JSON.stringify({
      id, name, ready: false,
    }));

    socket.on('error', (e) => {
      console.error(e);
    });

    socket.on('message', (rawMessage) => {
      try {
        const message = rawMessage.toString();
        const { type } = JSON.parse(message) as WebSocketMessage;
        // [TODO] clarify/specify some type to push request datas to DB
        // [TODO] handle action
        redis.publish('client-message', message);
        broadcastMessage(roomId, message);
      } catch (e) {
        console.error(e);
      }
    });
  });
};
