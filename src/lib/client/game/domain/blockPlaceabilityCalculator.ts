import type { BlockType, BoardMatrix, SlotIdx } from "$types";

export class BlockPlaceabilityCalculator {
  private webWorker: Worker;

  constructor({ webWorker }: { webWorker: Worker }) {
    this.webWorker = webWorker;
  }

  async calculate(
    {
      board,
      unusedBlocks,
    }: {
      unusedBlocks: { blockType: BlockType, slotIdx: SlotIdx }[];
      board: BoardMatrix
    },
    options?: { earlyReturn?: boolean, },
  ) {
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
