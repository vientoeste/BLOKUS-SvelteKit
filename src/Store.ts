import { preset } from '$lib/game/core';
import type { BlockMatrix, BlockType, PlayerIdx, Rotation, SlotIdx, UserInfo } from '$types';
import type { Undefinedable } from '$lib/utils';
import { writable } from 'svelte/store';

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
}

export const modalStore = createModalStore();

export const gameStore = writable<{
  turn: number,
  availableBlocksBySlots: Map<BlockType, BlockMatrix>[],
  playerIdx: PlayerIdx,
  players: ({ id: string, username: string, ready: boolean } | undefined)[],
  isStarted: boolean,
  mySlots: number[],
}>({
  turn: -1,
  availableBlocksBySlots: [],
  playerIdx: 0,
  players: [],
  isStarted: false,
  mySlots: [],
});

/**
 * handles block[0][0]'s center - where center of the block determines the whole block's position on the board
 */
export const dragPositionOffsetStore = writable<[number, number]>([0, 0]);

export const moveStore = writable<({ type: BlockType, rotation: Rotation, flip: boolean, slotIdx: number }) | null>(null);

export const movePreviewStore = writable<string>('');

export const blockStore = writable<{
  blockType: BlockType,
  slotIdx: SlotIdx,
  isPlaced: boolean,
  placeable: boolean,
  rotation: Rotation,
  flip: boolean,
}[]>();
