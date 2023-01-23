import type { RequestHandler } from '@sveltejs/kit';
import { putBlockOnBoard } from '../../game';
import db from '$lib/database';

interface ReqBody {
  currentBlock: number[][],
  position: number[],
  rotation: number,
  player: string,
  flip?: boolean,
}

export const PATCH = (async ({ request, params }) => {
  const {
    currentBlock, position, rotation, player, flip = false
  } = await request.json() as ReqBody;
  if (!currentBlock || !position
    || (!rotation && rotation !== 0) || !player
    || !/[a-d]/.test(player)) {
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

  // [TODO] db update
  return new Response(JSON.stringify(board));
}) satisfies RequestHandler;
