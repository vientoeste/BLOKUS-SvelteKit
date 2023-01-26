import type { RequestHandler } from '@sveltejs/kit';
import db from '$lib/database';
import { createNewBoard } from '../../game';

export const PATCH = (async ({ params }) => {
  const { room_uuid } = params;

  const board = createNewBoard();

  const participants = await db.collection('room').findOne({ uuid: room_uuid }).then((res) => {
    if (!res || !res.participants) {
      throw new Error('INTERNAL ERROR - cannot start game - NO RESOURCE');
    }
    return res.participants;
  });
  if (participants.length < 2 || participants.length > 4) {
    throw new Error('invalid participants');
  }

  // [TODO] 기존에는 board가 없으면 게임 시작 전, 있으면 시작 후로 분류했으나 insert 시 board 초기화로 변경했음
  const res = await db.collection('room').updateOne({
    uuid: room_uuid,
  }, {
    $addToSet: {
      board: board,
    }
  });
  if (res.matchedCount !== 1 || res.modifiedCount !== 1) {
    throw new Error('INTERNAL ERROR - query failed');
  }
  if (participants.length === 1) {
    return new Response(JSON.stringify({
      a: participants[0],
      b: participants[0],
      c: participants[0],
      d: participants[0],
    }));
  }
  return new Response(JSON.stringify({
    a: participants[0],
    b: participants[1],
    c: participants.length > 2 ? participants[2] : participants[0],
    d: participants.length > 3 ? participants[3] : (participants.length === 3 ? 'communal' : participants[1]),
  }));
}) satisfies RequestHandler;
