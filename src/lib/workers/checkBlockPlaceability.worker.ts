import { hasValidPlacement } from '$lib/game/core';
import type { BlockType, BoardMatrix, SlotIdx } from '$types';

self.onmessage = (e: MessageEvent<{ board: BoardMatrix, blockType: BlockType, slotIdx: SlotIdx, }>) => {
  const { board, blockType, slotIdx } = e.data;

  const result = hasValidPlacement({ board, slotIdx, blockType });
  self.postMessage({
    blockType,
    result: result === true,
  });
};

export { };
