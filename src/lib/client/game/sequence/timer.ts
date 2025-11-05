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

  // [TODO] set timeout by game strategy
  setTurnTimeout({ time = 60000, slotIdx, turn }: { time?: number, slotIdx: SlotIdx, turn: number }) {
    setTimeout(() => {
      this.eventBus.publish('TimeoutOccured', { slotIdx, turn });
    }, time);
  }
}
