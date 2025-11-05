import { turnTimerProgress } from "$lib/store";
import type { Writable } from "svelte/store";

type TimerStore = Writable<number>;

export class TimerStateManager {
  private store: TimerStore;

  constructor() {
    this.store = turnTimerProgress;
  }

  /**
   * @param progress Value between 0.0 ~ 1.0
   */
  set(progress: number) {
    this.store.set(Math.max(0, Math.min(1, progress)));
  }

  reset() {
    this.store.set(0);
  }
}
