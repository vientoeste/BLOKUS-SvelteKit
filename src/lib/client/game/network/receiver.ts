import { parseJson } from "$lib/utils";
import type { OutboundWebSocketMessage } from "$types";
import type { EventBus } from "../event";

export interface MessageReceiver {
  handle: (message: string) => void;
}

export class WebSocketMessageReceiver implements MessageReceiver {
  constructor(eventBus: EventBus) {
    this.eventBus = eventBus;
  }

  private eventBus: EventBus;

  handle = (rawMessage: string) => {
    const message = parseJson<OutboundWebSocketMessage>(rawMessage);
    if (typeof message === 'string') {
      throw new Error('unknown message received: '.concat(message));
    }
    const { type, ...rest } = message;
    this.eventBus.publish(`MESSAGE_RECEIVED:${type}`, rest);
  }
}
