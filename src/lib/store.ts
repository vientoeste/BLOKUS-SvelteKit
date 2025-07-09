import { preset } from '$lib/game/core';
import { type ParticipantInf, type BlockType, type PlayerIdx, type Rotation, type SlotIdx, type UserInfo } from '$types';
import type { Undefinedable } from '$lib/utils';
import { get, writable } from 'svelte/store';

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
  playerIdx: PlayerIdx,
  players: ({ id: string, username: string, ready: boolean } | undefined)[],
  isStarted: boolean,
  mySlots: SlotIdx[],
  isEnded: boolean,
}>({
  isEnded: false,
  turn: -1,
  playerIdx: 0,
  players: [],
  isStarted: false,
  mySlots: [],
});

/**
 * handles block[0][0]'s center - where center of the block determines the whole block's position on the board
 */
export const dragPositionOffsetStore = writable<[number, number]>([0, 0]);

export const moveStore = writable<({ type: BlockType, rotation: Rotation, flip: boolean, slotIdx: SlotIdx }) | null>(null);

export const movePreviewStore = writable<string>('');

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
  }
  const updateBlockPlacementStatus = ({ slotIdx, blockType }: { slotIdx: SlotIdx, blockType: BlockType }) => {
    const store = get({ subscribe });
    const index = store.findIndex(e => e.slotIdx === slotIdx && e.blockType === blockType);
    if (index !== -1) {
      update(e => {
        e[index].isPlaced = true;
        return e;
      });
    }
  };
  return {
    set, subscribe, update,
    initialize, getBlocksBySlot, getUnusedBlocks, getUnusedBlocksBySlot, getAvailableBlocks, getAvailableBlocksBySlot, updateUnavailableBlocks, updateBlockPlacementStatus,
  };
})();

export const participantStore = (() => {
  const { set, subscribe, update } = writable<(ParticipantInf | undefined)[]>([]);
  const initialize = (players: (ParticipantInf | undefined)[]) => {
    set(players);
  };
  const addPlayer = ({
    id,
    ready,
    username,
    playerIdx,
  }: ParticipantInf & { playerIdx: PlayerIdx }) => {
    update((players) => {
      players[playerIdx] = {
        id, ready, username,
      };
      return players;
    });
  };
  const removePlayerByIdx = (playerIdx: PlayerIdx) => {
    update((players) => {
      players[playerIdx] = undefined;
      return players;
    })
  };
  const setPlayerReadyState = ({
    playerIdx,
    ready,
  }: {
    playerIdx: PlayerIdx,
    ready: boolean,
  }) => {
    update((players) => {
      /**
       * @description when I update parameter and return the original arr it the component updated without re-rendering but idk why it does work.
       * If it doesn't work just recover with comments under here
       */
      if (players[playerIdx] !== undefined) players[playerIdx].ready = ready;
      return players;
      // const newPlayersArr = [...players];
      // if (newPlayersArr[playerIdx] === undefined) {
      //   return players;
      // }
      // newPlayersArr[playerIdx].ready = ready;
      // return newPlayersArr;
    });
  };
  return {
    subscribe,
    initialize, addPlayer, removePlayerByIdx, setPlayerReadyState,
  };
})();
