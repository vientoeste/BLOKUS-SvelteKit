import type { EventType } from '$types/event';
import { EventEmitter } from 'events';

// [TODO] define event types
export const EVENT: Record<string, EventType> = {

}

// [TODO] define payload
interface GameEvent {
  type: EventType;
  payload: unknown;
  timestamp: number;
}

export class EventBus {
  private emitter: EventEmitter;

  constructor() {
    this.emitter = new EventEmitter();
  }

  subscribe(eventType: string, callback: (event: GameEvent) => void): { unsubscribe: () => void } {
    this.emitter.on(eventType, callback);
    return {
      unsubscribe: () => {
        this.emitter.off(eventType, callback);
      }
    };
  }

  once(eventType: string, callback: (event: GameEvent) => void): void {
    this.emitter.once(eventType, callback);
  }

  publish(eventType: string, payload: unknown): void {
    const event: GameEvent = {
      type: EVENT[eventType],
      payload,
      timestamp: Date.now()
    };

    this.emitter.emit(eventType, event);

    // for debugging / logging
    if (eventType !== '*') {
      this.emitter.emit('*', event);
    }
  }

  removeAllListeners(eventType?: string): void {
    this.emitter.removeAllListeners(eventType);
  }
}
