import type { GameEvent, InboundWebSocketMessage } from "$types";
import type { EventBus } from "../event";
import type { MessageDispatcher } from "./dispatcher";
import type { MessageReceiver } from "./receiver";

export interface NetworkLayer {
  receiver: MessageReceiver;
  dispatcher: MessageDispatcher;
}

export class WebsocketNetworkLayer implements NetworkLayer {
  constructor({
    eventBus,
    webSocket,
    messageDispatcher,
    messageReceiver,
  }: {
    webSocket: WebSocket;
    eventBus: EventBus;
    messageReceiver: MessageReceiver;
    messageDispatcher: MessageDispatcher;
  }) {
    this.webSocket = webSocket;
    this.eventBus = eventBus;
    this.receiver = messageReceiver;
    this.dispatcher = messageDispatcher;

    // [TODO] add events: connection open/close/error/...
    this.receiver.listen();

    this.eventBus.subscribe('MESSAGE_DISPATCH', (event: GameEvent) => {
      const message = event.payload;
      // [TODO] check type of message(that is InboundWebSocketMessage)
      this.dispatcher.dispatch(message as InboundWebSocketMessage);
    });
  }

  receiver: MessageReceiver;
  dispatcher: MessageDispatcher;
  private webSocket: WebSocket;
  private eventBus: EventBus;
}
