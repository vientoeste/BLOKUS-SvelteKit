import { derived, type Readable } from "svelte/store";
import type { BlockStateManager } from "../../state/block";
import type { BlockFilterStateManager } from "../../state/filter";
import type { BlockState } from "../../state/block";
import { getBlockSize } from "$lib/utils";

export class BlockPresentationManager {
  public visibleBlocks: Readable<BlockState[]>;

  constructor({ blockState, filterState }: {
    blockState: BlockStateManager;
    filterState: BlockFilterStateManager;
  }) {
    this.visibleBlocks = derived(
      [
        blockState.blocks,
        filterState.quantity.selected,
        filterState.color.selected
      ],
      ([$blocks, $quantities, $colors]) => {
        return $blocks.filter(block =>
          !block.isPlaced &&
          $colors.includes(block.slotIdx) &&
          $quantities.includes(getBlockSize(block.blockType))
        );
      }
    );
  }
}