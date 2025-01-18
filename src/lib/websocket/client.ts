import type { WebSocketMessage } from "$lib/types";
import { parseJson } from "$lib/utils";

export class WebSocketMessageReceiver {
  constructor(websocket: WebSocket) {
    this.websocket = websocket;
  }

  private websocket: WebSocket | null = null;

  onMessage(callback: (message: WebSocketMessage) => void): void {
    if (this.websocket !== null) {
      this.websocket.onmessage = (e) => {
        const data = parseJson<WebSocketMessage>(e.data);
        if (typeof data === 'string') {
          throw new Error('received unknown message');
        }
        callback(data);
      };
    }
  }
}

export class WebSocketMessageDispatcher {
  private websocket: WebSocket | null = null;
  constructor(websocket: WebSocket) {
    if (!this.websocket) {
      this.websocket = websocket;
    }
  }

  // [TODO] improve/separate
  dispatch(message: WebSocketMessage) {
    this.websocket?.send(JSON.stringify(message));
  }
}
