import type { EventType, GameEvent } from '$types';
import { EventEmitter } from 'events';

export class EventBus {
  private emitter: EventEmitter;

  constructor() {
    this.emitter = new EventEmitter();
    if (process.env.NODE_ENV === 'development') {
      this.emitter.on('*', (event) => {
        // Debug here
      });
    }
  }

  subscribe(eventType: keyof EventType, callback: (event: GameEvent) => void): { unsubscribe: () => void } {
    this.emitter.on(eventType, callback);
    return {
      unsubscribe: () => {
        this.emitter.off(eventType, callback);
      }
    };
  }

  once(eventType: keyof EventType, callback: (event: GameEvent) => void): void {
    this.emitter.once(eventType, callback);
  }

  publish(eventType: keyof EventType, payload: unknown): void {
    const event: GameEvent = {
      payload,
      timestamp: Date.now()
    };

    this.emitter.emit(eventType, event);

    // for debugging / logging
    if (eventType !== '*') {
      this.emitter.emit('*', { type: eventType, ...event });
    }
  }

  removeAllListeners(eventType?: keyof EventType): void {
    this.emitter.removeAllListeners(eventType);
  }
}
