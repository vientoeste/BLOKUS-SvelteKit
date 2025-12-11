import { getBlockMatrix } from "$lib/game/core";
import type { Block, BoardMatrix, CellValue, SlotIdx } from "$types";
import { readable, writable, type Readable, type Writable } from "svelte/store";
import { uuidv7 } from "uuidv7";

type RequestId = string;

export type PreviewRequest = {
  id: RequestId;
  matrix: Readable<BoardMatrix>;
  resolve: (result: HTMLCanvasElement) => void;
};

export class BoardPresentationManager {
  private _previewRequest: Writable<PreviewRequest | null>;
  get previewRequest() { return { subscribe: this._previewRequest.subscribe }; }

  constructor() {
    this._previewRequest = writable(null);
  }

  async getPreview(p: {
    board: BoardMatrix;
    block: Block;
    position: [number, number];
    slotIdx: SlotIdx;
  }): Promise<HTMLCanvasElement> {
    const matrix = this._calculatePreviewMatrix(p);
    const requestId = uuidv7();

    // [TODO] add timeout
    const promise = new Promise<HTMLCanvasElement>((res) => {
      this._previewRequest.set({ id: requestId, matrix: readable(matrix), resolve: res });
    });

    const element = await promise;
    return element;
  }

  private _calculatePreviewMatrix({
    board,
    block,
    position,
    slotIdx,
  }: {
    board: BoardMatrix;
    block: Block;
    position: [number, number];
    slotIdx: SlotIdx;
  }): BoardMatrix {
    const blockMatrix = getBlockMatrix(block);

    const blockHeight = blockMatrix.length;
    const blockWidth = blockMatrix[0].length;

    const startRow = Math.max(0, position[0] - 2);
    const startCol = Math.max(0, position[1] - 2);
    const endRow = Math.min(19, position[0] + blockHeight + 1);
    const endCol = Math.min(19, position[1] + blockWidth + 1);

    const previewMatrix: BoardMatrix = [];
    for (let i = startRow; i <= endRow; i += 1) {
      const row: CellValue[] = [];
      for (let j = startCol; j <= endCol; j += 1) {
        let cell = board[i][j];
        if (
          i >= position[0] &&
          i < position[0] + blockHeight &&
          j >= position[1] &&
          j < position[1] + blockWidth &&
          blockMatrix[i - position[0]][j - position[1]]
        ) {
          cell = slotIdx;
        }
        row.push(cell);
      }
      previewMatrix.push(row);
    }

    return previewMatrix;
  }
}