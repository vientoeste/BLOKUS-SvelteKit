import { preset } from '$lib/game/core';
import { type ParticipantInf, type BlockType, type PlayerIdx, type Rotation, type SlotIdx, type UserInfo, type BoardMatrix, type Chat } from '$types';
import { getBlockSize, type Undefinedable } from '$lib/utils';
import { derived, get, writable } from 'svelte/store';
import type { Phase } from './client/game/state/game';
import type { RawColor } from '$types/client/ui';
import { getColorFilter, quantityFilter } from './filter';

export const userStore = writable<Undefinedable<UserInfo>>({
  id: undefined,
  userId: undefined,
  username: undefined,
});

interface ModalState {
  isOpen: boolean;
  component: any | null;
  props?: Record<string, any>;
}

const createModalStore = () => {
  const { subscribe, set, update } = writable<ModalState>({
    isOpen: false,
    component: null,
    props: {},
  });

  // [TODO] execute all functions of props
  return {
    subscribe,
    open: (component: any, props?: Record<string, any>) => {
      props?.onOpen?.();
      set({
        isOpen: true,
        component,
        props,
      });
    },
    close: () => {
      update(state => {
        state.props?.onClose?.();
        return {
          isOpen: false,
          component: null,
          props: {},
          events: {}
        };
      });
    }
  };
};

export const modalStore = createModalStore();

/**
 * handles block[0][0]'s center - where center of the block determines the whole block's position on the board
 */
export const dragPositionOffsetStore = writable<[number, number]>([0, 0]);

export const moveStore = writable<({
  type: BlockType;
  rotation: Rotation;
  flip: boolean;
  slotIdx: SlotIdx;
  matrix?: RawColor[][];
}) | null>(null);

export const isDraggingBlock = derived(moveStore, (store) => store !== null);

export const movePreviewStore = writable<string>('');

export const movePreviewShadowStore = writable<{
  blockMatrix: RawColor[][];
  position: [number, number];
} | null>(null);

// [TODO] remove this store with applying refactoring of BlockStateManager & BlocksContainer
export const blockStore = (() => {
  const { set, subscribe, update } = writable<{
    blockType: BlockType,
    slotIdx: SlotIdx,
    isPlaced: boolean,
    placeable: boolean,
    rotation: Rotation,
    flip: boolean,
  }[]>([]);

  const initialize = (slots: SlotIdx[]) => {
    if (slots === undefined) return;
    set(slots.map(slotIdx => Object.keys(preset).map(blockType => ({
      blockType: blockType as BlockType,
      slotIdx,
      isPlaced: false,
      placeable: true,
      rotation: 0 as Rotation,
      flip: false,
    }))).flat());
  };
  const getBlocksBySlot = (slotIdx: SlotIdx) => get({ subscribe }).filter(blocks => blocks.slotIdx === slotIdx);
  const getUnusedBlocks = () => get({ subscribe }).filter(blocks => !blocks.isPlaced);
  const getUnusedBlocksBySlot = (slotIdx: SlotIdx) => get({ subscribe }).filter(blocks => blocks.slotIdx === slotIdx && !blocks.isPlaced);
  const getAvailableBlocks = () => get({ subscribe }).filter(blocks => !blocks.isPlaced && blocks.placeable);
  const getAvailableBlocksBySlot = (slotIdx: SlotIdx) => get({ subscribe }).filter(blocks => blocks.slotIdx === slotIdx && !blocks.isPlaced && blocks.placeable);
  const updateUnavailableBlocks = (unavailableBlocks: { slotIdx: SlotIdx, blockType: BlockType }[]) => {
    update((blockStore) => {
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
  };
  const updateBlockPlacementStatus = ({ slotIdx, blockType }: { slotIdx: SlotIdx, blockType: BlockType }) => {
    const store = get({ subscribe });
    const index = store.findIndex(e => e.slotIdx === slotIdx && e.blockType === blockType);
    if (index !== -1) {
      update(e => {
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
  };
  return {
    set, subscribe, update,
    initialize, getBlocksBySlot, getUnusedBlocks, getUnusedBlocksBySlot, getAvailableBlocks, getAvailableBlocksBySlot, updateUnavailableBlocks, updateBlockPlacementStatus,
  };
})();

export const { clientSlotStore, clientSlotStoreWriter, getClientSlots } = (() => {
  const { set, subscribe, update } = writable<SlotIdx[]>([]);
  return {
    clientSlotStore: { subscribe },
    clientSlotStoreWriter: { update, set },
    getClientSlots: () => get({ subscribe }),
  };
})();

/**
 * @description A store for window's inner height.
 * It should be managed by scripts like 
 * `<svelte:window bind:innerHeight={$innerHeightStore} />`
 */
export const innerHeightStore = writable(0);

/**
 * @description A store for block's size calculated by browser's height.
 * The size of block satisfies following formulas: 
 * innerHeight - blockSize * 20 - padding * 2 - 21 == 0, 8 <= padding < 18
 */
export const blockSizeStore = derived(innerHeightStore, (size) => Math.floor((size - 8) / 20 - 1) - 2);

export const filteredBlockStore = derived(
  [blockStore, quantityFilter.selected, getColorFilter().selected],
  ([$blockStore, $quantityFilter, $colorFilter]) => $blockStore.filter((block) => !block.isPlaced && $colorFilter.includes(block.slotIdx) && $quantityFilter.includes(getBlockSize(block.blockType)))
);

export const chatStore = writable<Chat[]>([]);

/**
 * @description Progression of the turn timer, represented by 0.00 ~ 1.00.
 */
export const turnTimerProgress = writable<number>(0);
