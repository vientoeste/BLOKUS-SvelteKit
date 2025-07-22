import type { BlockType, SlotIdx } from "$types";
import type { BoardStateManager } from "../state/board";

export class BlockPlaceabilityCalculator {
  private webWorker: Worker;
  private boardStateManager: BoardStateManager;

  constructor({
    webWorker,
    boardStateManager,
  }: {
    webWorker: Worker;
    boardStateManager: BoardStateManager;
  }) {
    this.webWorker = webWorker;
    this.boardStateManager = boardStateManager;
  }

  async calculate(
    unusedBlocks: { blockType: BlockType, slotIdx: SlotIdx }[],
    options?: { earlyReturn?: boolean, },
  ) {
    const board = this.boardStateManager.getBoard();
    if (board === undefined) throw new Error('Board is Empty');
    if (options?.earlyReturn === true) {
      return new Promise<boolean>((res) => {
        this.webWorker.onmessage = (e: MessageEvent<boolean>) => {
          res(e.data);
        };
        this.webWorker.postMessage({ board, blocks: unusedBlocks });
      });
    }

    try {
      return new Promise<{ available: { blockType: BlockType, slotIdx: SlotIdx }[], unavailable: { blockType: BlockType, slotIdx: SlotIdx }[] }>((res, rej) => {
        this.webWorker.onmessage = (e: MessageEvent<{ available: { blockType: BlockType, slotIdx: SlotIdx }[], unavailable: { blockType: BlockType, slotIdx: SlotIdx }[] }>) => {
          if (typeof e.data === 'boolean') {
            rej('unexpected boolean value returned from a non-early-return worker procedure');
            return;
          }
          res(e.data);
        };
        this.webWorker.postMessage({ board, blocks: unusedBlocks });
      });
    } catch (e) {
      console.error(e);
    }
  }
}
