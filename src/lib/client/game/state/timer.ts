import { writable, type Readable, type Writable } from "svelte/store";

export class TimerStateManager {
  private _progress: Writable<number>;

  constructor() {
    this._progress = writable<number>(0);
  }

  get progress(): Readable<number> {
    return { subscribe: this._progress.subscribe };
  }

  /**
   * @param progress Value between 0.0 ~ 1.0
   */
  set(progress: number) {
    this._progress.set(Math.max(0, Math.min(1, progress)));
  }

  reset() {
    this._progress.set(0);
  }
}
