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

  private toSafeEventType(type: OutboundWebSocketMessage['type']) {
    switch (type) {
      case 'MOVE': return 'MessageReceived_Move';
      case 'START': return 'MessageReceived_Start';
      case 'LEAVE': return 'MessageReceived_Leave';
      case 'READY': return 'MessageReceived_Ready';
      case 'CANCEL_READY': return 'MessageReceived_CancelReady';
      case 'CONNECTED': return 'MessageReceived_Connected';
      case 'MEDIATE': return 'MessageReceived_Mediate';
      case 'ERROR': return 'MessageReceived_Error';
      case 'BAD_REQ': return 'MessageReceived_BadReq';
      case 'EXHAUSTED': return 'MessageReceived_Exhausted';
      case 'SKIP_TURN': return 'MessageReceived_SkipTurn';
      case 'SCORE_CONFIRM': return 'MessageReceived_ScoreConfirmation';
      case 'GAME_END': return 'MessageReceived_GameEnd';
      default:
        console.warn(`Unknown message type received: ${type}`);
        return null;
    }
  }

  public listen = () => {
    this.webSocket.onmessage = (event) => {
      if (typeof event.data !== 'string') {
        return;
      }
      const incomingMessage = parseJson<OutboundWebSocketMessage>(event.data);
      if (typeof incomingMessage === 'string') {
        throw new Error('received unknown message');
      }
      const { type, ...payload } = incomingMessage;
      const messageType = this.toSafeEventType(type);
      if (messageType === 'MessageReceived_BadReq') {
        // [TODO] handle global scope error here
      }
      if (messageType !== null) {
        /**
         * @description
         * Parameters under here are typed as `any` because its concrete structure is dynamically
         * determined by the `eventType` and `payload` at the event bus level(by `EventPayloadMap`).
         * Therefore an additional mapper or parser would be redundant and only add performance overhead.
         */
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        this.eventBus.publish(messageType as any, payload as any);
      }
    }
  }
}
