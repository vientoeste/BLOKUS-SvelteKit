import type { InboundWebSocketMessage } from "$types";

export interface MessageDispatcher {
  dispatch: (message: InboundWebSocketMessage) => void;
}

export class WebSocketMessageDispatcher implements MessageDispatcher {
  constructor(webSocket: WebSocket) {
    this.webSocket = webSocket;
  }

  private webSocket: WebSocket;

  dispatch = (message: InboundWebSocketMessage) => {
    this.webSocket.send(JSON.stringify(message));
  }
}
