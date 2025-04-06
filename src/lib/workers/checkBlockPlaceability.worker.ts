import { hasValidPlacement } from '$lib/game/core';
import type { BlockType, BoardMatrix, SlotIdx } from '$types';

self.onmessage = (e: MessageEvent<{ board: BoardMatrix, blocks: { blockType: BlockType, slotIdx: SlotIdx }[], earlyReturn?: boolean }>) => {
  const { board, blocks, earlyReturn } = e.data;
  const availableBlocks: { blockType: BlockType, slotIdx: SlotIdx }[] = [];
  const unavailableBlocks: { blockType: BlockType, slotIdx: SlotIdx }[] = [];

  for (const { blockType, slotIdx } of blocks) {
    const result = hasValidPlacement({ board, slotIdx, blockType });
    if (result && earlyReturn) {
      self.postMessage(true);
      return;
    }
    if (result) {
      availableBlocks.push({ blockType, slotIdx });
    }
    if (!result) {
      unavailableBlocks.push({ blockType, slotIdx });
    }
  }

  if (earlyReturn) {
    self.postMessage(false);
  }
  self.postMessage({ available: availableBlocks, unavailable: unavailableBlocks });
};

export { };
