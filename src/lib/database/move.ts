import { CustomError } from "$lib/error";
import { convertBlockToObj, convertBlockToStr } from "$lib/utils";
import type { InsertNonTimeoutMoveDto, InsertTimeoutMoveDto, Move } from "$types";
import { handleMongoError, Moves } from "./mongo";

export const getMovesByGameId = async (gameId: string): Promise<Move[]> => {
  const moves = await Moves
    .find({ gameId })
    .sort({ _id: -1 })
    .toArray()
    .catch(handleMongoError);
  return moves.map(move => move.timeout ? ({
    id: move._id,
    gameId,
    playerIdx: move.playerIdx,
    slotIdx: move.slotIdx,
    turn: move.turn,
    timeout: true,
    createdAt: new Date(move.createdAt),
  }) : ({
    id: move._id,
    gameId,
    blockInfo: convertBlockToObj(move.blockInfo),
    playerIdx: move.playerIdx,
    slotIdx: move.slotIdx,
    position: move.position,
    turn: move.turn,
    timeout: false,
    createdAt: new Date(move.createdAt),
  }));
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

export const insertNonTimeoutMove = async (moveId: string, moveDto: InsertNonTimeoutMoveDto) => {
  const { acknowledged, insertedId } = await Moves.insertOne({
    ...moveDto,
    _id: moveId,
    blockInfo: convertBlockToStr(moveDto.blockInfo),
  }).catch(handleMongoError);
  console.log(acknowledged, insertedId);
  if (!acknowledged || !insertedId) {
    throw new CustomError('insert failed', 500);
  }

  return insertedId.toString();
};
