import type { Vsync } from "$lib/vsync";
import type { SlotIdx } from "$types";
import type { ITimerStateWriter } from "../application/ports/timer-state.ports";
import type { EventBus } from "../event";

export class PlayerTurnTimer {
  constructor({
    eventBus,
    timerStateWriter,
    vsync,
  }: {
    eventBus: EventBus;
    timerStateWriter: ITimerStateWriter;
    vsync: Vsync;
  }) {
    this.eventBus = eventBus;
    this.timerStateWriter = timerStateWriter;
    this.vsync = vsync;
  }

  private eventBus: EventBus;
  private timerStateWriter: ITimerStateWriter;
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

  private updateVisualProgress = (time: number) => {
    if (this.visualStartTime === null) {
      this.visualStartTime = time;
    }

    const elapsed = time - this.visualStartTime;
    const nextProgress = Math.min(elapsed / this.visualDuration, 1);

    this.timerStateWriter.setTimer(nextProgress);

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
    this.timerStateWriter.resetTimer();
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

    this.timerStateWriter.resetTimer();
  }
}
