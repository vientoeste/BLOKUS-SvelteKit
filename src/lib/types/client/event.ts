export enum EventType {

}

// [TODO] define payload
export interface GameEvent {
  type: EventType;
  payload: unknown;
  timestamp: number;
}
