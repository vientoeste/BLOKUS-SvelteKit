import { preset } from '$lib/game/core';
import type { BlockMatrix, BlockType, UserInfo } from '$lib/types';
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
  events?: Record<string, () => void>
}

const createModalStore = () => {
  const { subscribe, set, update } = writable<ModalState>({
    isOpen: false,
    component: null,
    props: {},
    events: {},
  });

  return {
    subscribe,
    open: (component: any, props?: Record<string, any>, events?: { onclose?: () => void }) => {
      set({
        isOpen: true,
        component,
        props,
        events,
      });
    },
    close: () => {
      update(state => {
        if (state.events?.onClose) {
          state.events.onClose();
        }
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
  unusedBlocks: Map<BlockType, BlockMatrix>,
  playerIdx: 0 | 1 | 2 | 3,
  players: { id: string, userId: string, username: string }[],
  isStarted: boolean,
}>({
  turn: -1,
  unusedBlocks: new Map(Object.entries(preset) as [BlockType, BlockMatrix][]),
  playerIdx: 0,
  players: [],
  isStarted: false,
});

/**
 * handles block[0][0]'s center - where center of the block determines the whole block's position on the board
 */
export const dragPositionOffsetStore = writable<[number, number]>([0, 0]);

export const draggedBlockMatrixStore = writable<BlockMatrix>();
