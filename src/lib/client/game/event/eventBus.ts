import type { AppEvent, EventPayloadMap, GameEvent, TypedEventEmitter } from '$types';
import { EventEmitter } from 'events';

export class EventBus {
  private emitter: TypedEventEmitter;

  constructor() {
    this.emitter = new EventEmitter();
    if (process.env.NODE_ENV === 'development') {
      this.emitter.on('*', (event) => {
        // Debug here
      });
    }
  }

  subscribe<T extends AppEvent>(
    eventType: T,
    callback: (event: GameEvent<T>) => void,
  ): { unsubscribe: () => void } {
    this.emitter.on(eventType, callback);
    return {
      unsubscribe: () => {
        this.emitter.off(eventType, callback);
      }
    };
  }

  once<T extends AppEvent>(
    eventType: T,
    callback: (event: GameEvent<T>) => void,
  ): void {
    this.emitter.once(eventType, callback);
  }

  publish<T extends AppEvent>(
    eventType: T,
    payload: EventPayloadMap[T],
  ): void {
    const event: GameEvent<T> = {
      payload,
      timestamp: Date.now()
    };

    this.emitter.emit(eventType, event);

    // for debugging / logging
    if (eventType !== '*') {
      this.emitter.emit('*', { payload: { type: eventType, payload: event.payload }, timestamp: event.timestamp });
    }
  }

  removeAllListeners(eventType?: AppEvent): void {
    this.emitter.removeAllListeners(eventType);
  }
}
