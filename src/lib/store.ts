import { preset } from '$lib/game/core';
import { type ParticipantInf, type BlockType, type PlayerIdx, type Rotation, type SlotIdx, type UserInfo } from '$types';
import type { Undefinedable } from '$lib/utils';
import { get, writable } from 'svelte/store';
import type { Phase } from './client/game/state/game';

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

export const moveStore = writable<({ type: BlockType, rotation: Rotation, flip: boolean, slotIdx: SlotIdx }) | null>(null);

export const movePreviewStore = writable<string>('');

// [TODO] remove this store with applying refactoring of BlockStateManager & BlocksContainer
export const blockStore = (() => {
  const { set, subscribe, update } = writable<{
    blockType: BlockType,
    slotIdx: SlotIdx,
    isPlaced: boolean,
    placeable: boolean,
    rotation: Rotation,
    flip: boolean,
  }[]>();

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
