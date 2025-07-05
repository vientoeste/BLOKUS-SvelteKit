import { parseJson } from "$lib/utils";
import type { OutboundWebSocketMessage } from "$types";
import type { EventBus } from "../event/eventBus";

export interface MessageReceiver {
  listen: () => void;
}

export class WebSocketMessageReceiver implements MessageReceiver {
  constructor({ eventBus, webSocket }: { eventBus: EventBus, webSocket: WebSocket }) {
    this.eventBus = eventBus;
    this.webSocket = webSocket;
  }

  private eventBus: EventBus;
  private webSocket: WebSocket;

  public listen = () => {
    this.webSocket.onmessage = (event) => {
      console.log(typeof event);
      if (typeof event.data !== 'string') {
        return;
      }
      const incomingMessage = parseJson<OutboundWebSocketMessage>(event.data);
      if (typeof incomingMessage === 'string') {
        throw new Error('received unknown message');
      }
      const { type, ...payload } = incomingMessage;
      this.eventBus.publish(`MESSAGE_RECEIVED_${type}`, payload);
    }
  }
}
