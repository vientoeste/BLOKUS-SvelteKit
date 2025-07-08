import { parseJson } from "$lib/utils";
import { Event, type EventType, type OutboundWebSocketMessage } from "$types";
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

  private toSafeEventType(messageType: OutboundWebSocketMessage['type']): keyof EventType | null {
    switch (messageType) {
      case 'MOVE': return Event.MessageReceived_Move;
      case 'START': return Event.MessageReceived_Start;
      case 'LEAVE': return Event.MessageReceived_Leave;
      case 'READY': return Event.MessageReceived_Ready;
      case 'CANCEL_READY': return Event.MessageReceived_CancelReady;
      case 'CONNECTED': return Event.MessageReceived_Connected;
      case 'MEDIATE': return Event.MessageReceived_Mediate;
      case 'ERROR': return Event.MessageReceived_Error;
      case 'BAD_REQ': return Event.MessageReceived_BadReq;
      case 'EXHAUSTED': return Event.MessageReceived_Exhausted;
      case 'SKIP_TURN': return Event.MessageReceived_SkipTurn;
      case 'SCORE_CONFIRM': return Event.MessageReceived_ScoreConfirmation;
      case 'GAME_END': return Event.MessageReceived_GameEnd;
      default:
        console.warn(`Unknown message type received: ${messageType}`);
        return null;
    }
  }

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
      const messageType = this.toSafeEventType(type);
      if (messageType !== null) {
        this.eventBus.publish(messageType, payload);
      }
    }
  }
}
