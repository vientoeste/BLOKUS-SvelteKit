import type { RequestHandler } from '@sveltejs/kit';
import { putBlockOnBoard } from '../../game';
import db from '$lib/database';
import { validate } from 'uuid';

interface ReqBody {
  currentBlock: number[][],
  position: number[],
  rotation: number,
  player: string,
  flip?: boolean,
}

export const PATCH = (async ({ request, params }) => {
  const { room_uuid } = params;
  const {
    currentBlock, position, rotation, player, flip = false
  } = await request.json() as ReqBody;
  if (!currentBlock || !position
    || (!rotation && rotation !== 0) || !player
    || !/[a-d]/.test(player) || !room_uuid || !validate(room_uuid)) {
    throw new Error('invalid parameter');
  }

  const board = await db.collection('room').findOne({
    uuid: params.room_uuid,
  }).then((res) => {
    if (!res || !res.board) {
      throw new Error('INTERNAL ERROR - board not found');
    }
    return res.board;
  });

  putBlockOnBoard(board, currentBlock, position, rotation, player, flip);

  const res = await db.collection('room').updateOne({
    uuid: room_uuid,
  }, {
    $set: {
      board: board,
    }
  });
  if (res.matchedCount !== 1 || res.modifiedCount !== 1) {
    throw new Error('INTERNAL ERROR - query failed');
  }

  return new Response(JSON.stringify(board));
}) satisfies RequestHandler;
