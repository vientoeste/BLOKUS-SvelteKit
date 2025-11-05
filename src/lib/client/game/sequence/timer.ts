import type { Vsync } from "$lib/vsync";
import type { SlotIdx } from "$types";
import type { EventBus } from "../event";
import type { TimerStateManager } from "../state/timer";

export class PlayerTurnTimer {
  constructor({
    eventBus,
    timerStateManager,
    vsync,
  }: {
    eventBus: EventBus;
    timerStateManager: TimerStateManager;
    vsync: Vsync;
  }) {
    this.eventBus = eventBus;
    this.timerStateManager = timerStateManager;
    this.vsync = vsync;
  }

  private eventBus: EventBus;
  private timerStateManager: TimerStateManager;
  private vsync: Vsync;

  /**
   * Id of setTimeout
   */
  private logicalTimeoutId: number | null = null;
  /**
   * Whether the timer UI is running 
   */
  private isVisualRunning = false;
  private visualStartTime: number | null = null;
  private visualDuration = 0;

  // [TODO] set timeout by game strategy
  setTurnTimeout({ time = 60000, slotIdx, turn }: { time?: number, slotIdx: SlotIdx, turn: number }) {
    setTimeout(() => {
      this.eventBus.publish('TimeoutOccured', { slotIdx, turn });
    }, time);
  }

  private updateVisualProgress = (time: number) => {
    if (this.visualStartTime === null) {
      this.visualStartTime = time;
    }

    const elapsed = time - this.visualStartTime;
    const nextProgress = Math.min(elapsed / this.visualDuration, 1);

    this.timerStateManager.set(nextProgress);

    if (nextProgress < 1) {
      this.vsync.requestCallback(this.updateVisualProgress);
    } else {
      this.isVisualRunning = false;
      this.visualStartTime = null;
    }
  };

  public start({
    time = 60000,
    slotIdx,
    turn
  }: {
    time?: number;
    slotIdx: SlotIdx;
    turn: number;
  }) {
    this.stop();

    this.logicalTimeoutId = window.setTimeout(() => {
      this.eventBus.publish('TimeoutOccured', { slotIdx, turn });
      this.logicalTimeoutId = null;
    }, time);

    this.visualDuration = time;
    this.visualStartTime = null;
    this.isVisualRunning = true;
    this.timerStateManager.reset();
    this.vsync.requestCallback(this.updateVisualProgress);
  }

  public stop() {
    if (this.logicalTimeoutId) {
      clearTimeout(this.logicalTimeoutId);
      this.logicalTimeoutId = null;
    }

    if (this.isVisualRunning) {
      this.vsync.cancelCallback(this.updateVisualProgress);
      this.isVisualRunning = false;
      this.visualStartTime = null;
    }

    this.timerStateManager.reset();
  }
}
