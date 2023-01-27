import type { PageServerLoad } from "./$types";
import { validate } from "uuid";
import db from '$lib/database';
import { BLOCK } from "../game";
import type { Actions } from "@sveltejs/kit";

const makeTableHead = (): string => {
  let tableHead = '';
  for (let i = 0; i < 20; i++) {
    tableHead = tableHead.concat(`<th style="border: 1px solid rgba(0, 0, 0, 0.267);">${i % 10}</th>`);
  }
  return tableHead;
};

const makeTableContents = (e: (string | number)[][]) => {
  return `<div class="blocks">
    <table style="border: 10px;">`.concat(e.reduce((prev: string, curr: (string | number)[]) => {
    const currentRow = curr.reduce((
      prevShadow: string, currShadow: (string | number)
    ) => prevShadow.concat(currShadow === 0 ? '<th></th>' : `<td><div class='a'>\u00a0</div></td>`), '');

    return prev.concat(currentRow, '</tr>');
  }, ''), `</table></div>`)
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
      prevShadow: string, currShadow: (string | number), idxShadow: number
    ) => prevShadow.concat(`<td onClick="document.getElementById('row').value='${idx}'; document.getElementById('col').value='${idxShadow}'; document.getElementById('tmp').submit();">
    <div class=${currShadow === 0
        ? 'none'
        : currShadow}>\u00a0</div></td>`), '');

    return prev.concat(`<tr><th style="border: 1px solid rgba(0, 0, 0, 0.267);">${idx % 10}</th>`, currentRow, '</tr>');
  }, '');
  return {
    board: `<tr><th />${makeTableHead()}</tr>`.concat(board),
    block: makeTableContents(BLOCK.five.d)
  };
}) satisfies PageServerLoad;

export const actions = {
  putBlock: async (event) => {
    const position = await event.request.formData().then((e) => {
      return [
        e.get('row') as string,
        e.get('col') as string,
      ]
    });
    console.log(position)
    return 'ok';
  }
} satisfies Actions;
