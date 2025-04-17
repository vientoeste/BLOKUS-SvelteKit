import { CustomError } from "$lib/error";
import { convertBlockToObj, convertBlockToStr } from "$lib/utils";
import type { InsertExhaustedMoveDto, InsertRegularMoveDto, InsertTimeoutMoveDto, Move } from "$types";
import { handleMongoError, Moves } from "./mongo";

// [TODO] when onlyRegularMoves is true, narrow its return type to RegularMove[]
export const getMovesByGameId = async (gameId: string, options: {
  onlyRegularMoves?: boolean,
} = {}): Promise<Move[]> => {
  const { onlyRegularMoves = false } = options;
  const moves = await Moves
    .find(onlyRegularMoves ? { gameId, timeout: false, exhausted: false } : { gameId })
    .sort({ _id: -1 })
    .toArray()
    .catch(handleMongoError);
  return moves.map(move => {
    if (move.timeout) {
      return {
        id: move._id,
        gameId,
        playerIdx: move.playerIdx,
        slotIdx: move.slotIdx,
        turn: move.turn,
        timeout: true,
        exhausted: false,
        createdAt: new Date(move.createdAt),
      };
    }
    if (move.exhausted) {
      return {
        id: move._id,
        gameId,
        playerIdx: move.playerIdx,
        slotIdx: move.slotIdx,
        turn: move.turn,
        timeout: false,
        exhausted: true,
        createdAt: new Date(move.createdAt),
      };
    }
    return {
      id: move._id,
      gameId,
      blockInfo: convertBlockToObj(move.blockInfo),
      playerIdx: move.playerIdx,
      slotIdx: move.slotIdx,
      position: move.position,
      turn: move.turn,
      timeout: false,
      exhausted: false,
      createdAt: new Date(move.createdAt),
    }
  });
};

export const insertTimeoutMove = async (moveId: string, moveDto: InsertTimeoutMoveDto) => {
  const { acknowledged, insertedId } = await Moves.insertOne({
    ...moveDto,
    _id: moveId,
  }).catch(handleMongoError);
  if (!acknowledged || !insertedId) {
    throw new CustomError('insert failed', 500);
  }

  return insertedId.toString();
};

export const insertExhaustedMove = async (moveId: string, moveDto: InsertExhaustedMoveDto) => {
  const { acknowledged, insertedId } = await Moves.insertOne({
    ...moveDto,
    _id: moveId,
  }).catch(handleMongoError);
  if (!acknowledged || !insertedId) {
    throw new CustomError('insert failed', 500);
  }

  return insertedId.toString();
};

export const insertRegularMove = async (moveId: string, moveDto: InsertRegularMoveDto) => {
  const { acknowledged, insertedId } = await Moves.insertOne({
    ...moveDto,
    _id: moveId,
    blockInfo: convertBlockToStr(moveDto.blockInfo),
    exhausted: false,
    timeout: false,
  }).catch(handleMongoError);
  console.log(acknowledged, insertedId);
  if (!acknowledged || !insertedId) {
    throw new CustomError('insert failed', 500);
  }

  return insertedId.toString();
};
