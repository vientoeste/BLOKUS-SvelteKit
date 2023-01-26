import type { PageServerLoad } from "./$types";
import { validate } from "uuid";
import db from '$lib/database';

const makeTableHead = (): string => {
  let tableHead = '';
  for (let i = 0; i < 20; i++) {
    tableHead = tableHead.concat(`<th>${i % 10}</th>`);
  }
  return tableHead;
};

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

  board = board.reduce((prev: string, curr: (string | number)[], idx: number) => {
    const currentRow = curr.reduce((
      prevShadow: string, currShadow: (string | number)
    ) => prevShadow.concat(`<td><div class=${currShadow === 0
      ? 'none'
      : currShadow}>\u00a0</div></td>`), '');

    return prev.concat(`<tr><th>${idx}</th>`, currentRow, '</tr>');
  }, '');

  return {
    board: `<tr><th />${makeTableHead()}</tr>`.concat(board),
  };
}) satisfies PageServerLoad;
