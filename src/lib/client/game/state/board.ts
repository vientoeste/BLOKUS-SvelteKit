import { getBlockMatrix, isBlockPlaceableAt } from "$lib/game/core";
import type { Block, BoardMatrix, SlotIdx } from "$types";
import type { EventBus } from "../event";

export class BoardStateManager {
  constructor({ board, eventBus }: {
    board?: BoardMatrix;
    eventBus: EventBus;
  }) {
    this.board = board;
    this.eventBus = eventBus;

    this.eventBus.subscribe('MoveContextVerified', ({ payload, timestamp }) => {
      if (this.board === undefined) {
        this.eventBus.publish('BoardNotInitialized', undefined);
        return;
      }
      const { blockInfo, playerIdx, position, slotIdx, turn, gameId } = payload;
      const { result, reason } = this.applyRegularMove({ blockInfo, position, slotIdx, turn });
      if (result === true) {
        this.eventBus.publish('MoveApplied', {
          blockInfo,
          // [TODO] use timestamp sent by server
          createdAt: new Date(timestamp),
          gameId,
          playerIdx,
          position,
          slotIdx,
          turn,
        });
        return;
      }
      // [TODO] add events for mediate / error report / ... using `reason`
    });
  }

  private board?: BoardMatrix;
  private eventBus: EventBus;

  getBoard(): BoardMatrix | undefined {
    return this.board?.map(e => [...e]);
  }

  initializeBoard(board?: BoardMatrix) {
    if (!board) {
      this.board = Array(20).fill(null).map(() => Array(20).fill(false));
      return;
    }
    this.board = board;
  }

  destroyBoard() {
    this.board = undefined;
    // re-render
  }

  applyRegularMove({
    blockInfo, position, turn, slotIdx
  }: {
    blockInfo: Block,
    position: [number, number],
    turn: number,
    slotIdx: SlotIdx,
  }) {
    if (!this.board) return { result: false, reason: 'Board Is Not Initialized' };
    const { result, reason } = isBlockPlaceableAt({
      block: getBlockMatrix(blockInfo),
      position,
      board: this.board,
      slotIdx,
      turn,
    });
    return { result, reason };
  }
}
