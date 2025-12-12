export interface ITimerStateWriter {
  setTimer(progression: number): void;
  resetTimer(): void;
}
