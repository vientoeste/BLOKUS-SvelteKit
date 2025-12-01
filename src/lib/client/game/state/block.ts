import { preset } from "$lib/game/core";
import { blockStore } from "$lib/store";
import type { BlockType, Rotation, SlotIdx } from "$types";
import { get, writable, type Readable, type Writable } from "svelte/store";

export interface BlockState {
  blockType: BlockType;
  slotIdx: SlotIdx;
  isPlaced: boolean;
  placeable: boolean;
  rotation: Rotation;
  flip: boolean;
}

export class BlockStateManager {
  private blockStore: Writable<BlockState[]>;

  constructor() {
    this.blockStore = writable([]);
    this.blockStore.subscribe((store) => {
      blockStore.set(store);
    });
  }

  get blocks(): Readable<BlockState[]> {
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
