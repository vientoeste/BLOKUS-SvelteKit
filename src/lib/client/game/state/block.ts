import { blockStore } from "$lib/store";
import type { BlockType, Rotation, SlotIdx } from "$types";
import { get, writable, type Readable, type Writable } from "svelte/store";

const preset: Record<
  BlockType,
  ({ u: boolean; r: boolean; b: boolean; l: boolean } | null)[][]
> = {
  "10": [[{ u: true, l: true, b: true, r: true }]],
  "20": [
    [
      { u: true, l: true, b: true, r: false },
      { u: true, l: false, b: true, r: true },
    ],
  ],
  "30": [
    [
      { u: true, l: true, b: true, r: false },
      { u: true, l: false, b: true, r: false },
      { u: true, l: false, b: true, r: true },
    ],
  ],
  "31": [
    [
      { u: true, l: true, b: false, r: false },
      { u: true, l: false, b: true, r: true },
    ],
    [{ u: false, l: true, b: true, r: true }, null],
  ],
  "40": [
    [
      { u: true, l: true, b: true, r: false },
      { u: true, l: false, b: true, r: false },
      { u: true, l: false, b: true, r: false },
      { u: true, l: false, b: true, r: true },
    ],
  ],
  "41": [
    [
      { u: true, l: true, b: false, r: false },
      { u: true, l: false, b: true, r: false },
      { u: true, l: false, b: true, r: true },
    ],
    [{ u: false, l: true, b: true, r: true }, null, null],
  ],
  "42": [
    [
      { u: true, l: true, b: true, r: false },
      { u: true, l: false, b: false, r: false },
      { u: true, l: false, b: true, r: true },
    ],
    [null, { u: false, l: true, b: true, r: true }, null],
  ],
  "43": [
    [
      { u: true, l: true, b: true, r: false },
      { u: true, l: false, b: false, r: true },
      null,
    ],
    [
      null,
      { u: false, l: true, b: true, r: false },
      { u: true, l: false, b: true, r: true },
    ],
  ],
  "44": [
    [
      { u: true, l: true, b: false, r: false },
      { u: true, l: false, b: false, r: true },
    ],
    [
      { u: false, l: true, b: true, r: false },
      { u: false, l: false, b: true, r: true },
    ],
  ],
  "50": [
    [
      { u: true, l: true, b: true, r: false },
      { u: true, l: false, b: true, r: false },
      { u: true, l: false, b: true, r: false },
      { u: true, l: false, b: true, r: false },
      { u: true, l: false, b: true, r: true },
    ],
  ],
  "51": [
    [
      { u: true, l: true, b: false, r: false },
      { u: true, l: false, b: true, r: false },
      { u: true, l: false, b: true, r: true },
    ],
    [{ u: false, l: true, b: false, r: true }, null, null],
    [{ u: false, l: true, b: true, r: true }, null, null],
  ],
  "52": [
    [null, { u: true, l: true, b: false, r: true }, null],
    [
      { u: true, l: true, b: true, r: false },
      { u: false, l: false, b: false, r: false },
      { u: true, l: false, b: true, r: true },
    ],
    [null, { u: false, l: true, b: true, r: true }, null],
  ],
  "53": [
    [null, null, { u: true, l: true, b: false, r: true }],
    [
      null,
      { u: true, l: true, b: false, r: false },
      { u: false, l: false, b: true, r: true },
    ],
    [
      { u: true, l: true, b: true, r: false },
      { u: false, l: false, b: true, r: true },
      null,
    ],
  ],
  "54": [
    [{ u: true, l: true, b: false, r: true }, null, null],
    [
      { u: false, l: true, b: true, r: false },
      { u: true, l: false, b: false, r: false },
      { u: true, l: false, b: true, r: true },
    ],
    [null, { u: false, l: true, b: true, r: true }, null],
  ],
  "55": [
    [
      { u: true, l: true, b: true, r: false },
      { u: true, l: false, b: false, r: false },
      { u: true, l: false, b: true, r: true },
    ],
    [null, { u: false, l: true, b: false, r: true }, null],
    [null, { u: false, l: true, b: true, r: true }, null],
  ],
  "56": [
    [
      { u: true, l: true, b: false, r: false },
      { u: true, l: false, b: true, r: false },
      { u: true, l: false, b: true, r: false },
      { u: true, l: false, b: true, r: true },
    ],
    [{ u: false, l: true, b: true, r: true }, null, null, null],
  ],
  "57": [
    [null, null, { u: true, l: true, b: false, r: true }],
    [
      { u: true, l: true, b: false, r: false },
      { u: true, l: false, b: true, r: false },
      { u: false, l: false, b: true, r: true },
    ],
    [{ u: false, l: true, b: true, r: true }, null, null],
  ],
  "58": [
    [{ u: true, l: true, b: false, r: true }, null],
    [
      { u: false, l: true, b: false, r: false },
      { u: true, l: false, b: false, r: true },
    ],
    [
      { u: false, l: true, b: true, r: false },
      { u: false, l: false, b: true, r: true },
    ],
  ],
  "59": [
    [
      { u: true, l: true, b: true, r: false },
      { u: true, l: false, b: false, r: true },
      null,
      null,
    ],
    [
      null,
      { u: false, l: true, b: true, r: false },
      { u: true, l: false, b: true, r: false },
      { u: true, l: false, b: true, r: true },
    ],
  ],
  "5a": [
    [
      { u: true, l: true, b: false, r: false },
      { u: true, l: false, b: true, r: true },
    ],
    [{ u: false, l: true, b: false, r: true }, null],
    [
      { u: false, l: true, b: true, r: false },
      { u: true, l: false, b: true, r: true },
    ],
  ],
  "5b": [
    [null, { u: true, l: true, b: false, r: true }, null, null],
    [
      { u: true, l: true, b: true, r: false },
      { u: false, l: false, b: true, r: false },
      { u: true, l: false, b: true, r: false },
      { u: true, l: false, b: true, r: true },
    ],
  ],
};

interface Block {
  blockType: BlockType;
  slotIdx: SlotIdx;
  isPlaced: boolean;
  placeable: boolean;
  rotation: Rotation;
  flip: boolean;
}

export class BlockStateManager {
  private blockStore: Writable<Block[]>;

  constructor() {
    this.blockStore = writable([]);
    this.blockStore.subscribe((store) => {
      blockStore.set(store);
    });
  }

  get blocks(): Readable<Block[]> {
    return { subscribe: this.blockStore.subscribe };
  }

  initialize(slots: SlotIdx[]) {
    if (slots === undefined) return;
    this.blockStore.set(slots.map(slotIdx => Object.keys(preset).map(blockType => ({
      blockType: blockType as BlockType,
      slotIdx,
      isPlaced: false,
      placeable: true,
      rotation: 0 as Rotation,
      flip: false,
    }))).flat());
  }

  markAsPlaced({ blockType, slotIdx }: { blockType: BlockType, slotIdx: SlotIdx }) {
    const store = get(this.blockStore);
    const index = store.findIndex(e => e.slotIdx === slotIdx && e.blockType === blockType);
    if (index !== -1) {
      this.blockStore.update(e => {
        return e.map((e, i) => {
          if (i === index) {
            return {
              ...e,
              isPlaced: true,
            };
          }
          return e;
        });
      });
    }
  }

  /**
   * @description update block placeability by list of **unavailable** blocks
   */
  updateAvailability(unavailableBlocks: { slotIdx: SlotIdx, blockType: BlockType }[]) {
    this.blockStore.update((blockStore) => {
      const currentStore = [...blockStore];
      currentStore.map((block) => {
        block.placeable = true;
        if (unavailableBlocks.filter((unavailableBlock) => block.blockType === unavailableBlock.blockType && block.slotIdx === unavailableBlock.slotIdx).length !== 0) {
          block.placeable = false;
        }
        return block;
      });
      return currentStore;
    });
  }

  getUnusedBlocks() {
    return get(this.blockStore).filter(blocks => !blocks.isPlaced);
  }

  reset() {
    this.blockStore.set([]);
  }
}
