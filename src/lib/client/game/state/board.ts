import { putBlockOnBoard, rollbackMove } from "$lib/game/core";
import type { Block, BoardMatrix, PlayerIdx, SlotIdx } from "$types";
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
      this.applyRegularMove({ blockInfo, playerIdx, position, slotIdx, turn });
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
    });
  }

  private board?: BoardMatrix;
  private eventBus: EventBus;

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
    blockInfo, playerIdx, position, turn, slotIdx
  }: {
    blockInfo: Block,
    playerIdx: PlayerIdx,
    position: [number, number],
    turn: number,
    slotIdx: SlotIdx,
  }) {
    if (!this.board) return;
    const reason = putBlockOnBoard({
      blockInfo,
      board: this.board,
      playerIdx,
      position,
      slotIdx,
      turn,
    });
    if (reason) {
      // emit event
      rollbackMove({
        blockInfo,
        board: this.board,
        position,
        slotIdx,
      });
      return;
    }
    // emit event
    // re-render here
  }
}
