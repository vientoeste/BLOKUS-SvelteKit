import type { PageServerLoad } from "./$types";
import { validate } from "uuid";
import db from '$lib/database';

export const load = (async ({ params }) => {
  const { room_uuid } = params;
  if (!validate(room_uuid)) {
    throw new Error('Invalid uuid');
  }

  let board = await db.collection('room').findOne({
    uuid: room_uuid,
  }).then((res) => {
    if (!res || !res.board) {
      throw new Error('INTERNAL ERROR - board not found');
    }
    return res.board;
  });

  // [TODO] page.svelte 말고 여기서 바꿔서 쏴주기
  board = board.map((e1: (string | number)[]) => {
    const tmp = e1.map((e2: (string | number)) => `<div class=${e2 === 0 ? 'none' : e2}>\u00a0</div>`);
    return tmp;
  });

  return {
    board: board,
  };
}) satisfies PageServerLoad;
