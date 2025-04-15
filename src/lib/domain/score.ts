import type { BoardMatrix, SlotIdx } from '$types';

export class Score {
  constructor(init: Record<SlotIdx, number> | string) {
    if (typeof init === 'string') {
      this._values = Score.parseString(init);
      return;
    }
    this._values = { ...init };
  }

  private readonly _values: Record<SlotIdx, number>;

  getScoreBySlot(slotIdx: SlotIdx): number {
    return this._values[slotIdx];
  }

  getScores(): Record<SlotIdx, number> {
    return { ...this._values };
  }

  toString(): string {
    return [
      this._values[0],
      this._values[1],
      this._values[2],
      this._values[3],
    ].join(',');
  }

  toRecord(): Record<SlotIdx, number> {
    return { ...this._values };
  }

  private static parseString(scoreStr: string): Record<SlotIdx, number> {
    const scores = scoreStr.split(',').map(s => parseInt(s.trim()));
    if (scores[0] === undefined || scores[1] === undefined || scores[2] === undefined || scores[3] === undefined) {
      throw new Error('not a valid score');
    }
    return {
      0: scores[0],
      1: scores[1],
      2: scores[2],
      3: scores[3],
    };
  }

  static fromBoard(board: BoardMatrix): Score {
    const score: Record<SlotIdx, number> = { 0: 0, 1: 0, 2: 0, 3: 0 };
    board.forEach(row => {
      row.forEach(cell => {
        if (cell !== false) {
          score[cell as SlotIdx] += 1;
        }
      });
    });
    return new Score(score);
  }
}
