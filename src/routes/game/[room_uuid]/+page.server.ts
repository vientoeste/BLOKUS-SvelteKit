import type { PageServerLoad } from "./$types";
import { validate } from "uuid";
import db from '$lib/database';
import { BLOCK, putBlockOnBoard } from "../game";
import type { Actions } from "@sveltejs/kit";

const makeTableHead = (): string => {
  let tableHead = '';
  for (let i = 0; i < 20; i++) {
    tableHead = tableHead.concat(`<th style="border: 1px solid rgba(0, 0, 0, 0.267);">${i % 10}</th>`);
  }
  return tableHead;
};

const makeTableContents = (e: (string | number)[][], pieceCount: string, index: string) => {
  return `<div class="block">
    <table style="border: 10px;">`.concat(e.reduce((prev: string, curr: (string | number)[]) => {
    const currentRow = curr.reduce((
      prevShadow: string, currShadow: (string | number)
    ) => prevShadow.concat(currShadow === 0 ? '<th></th>' : `<td onClick="document.getElementById('block').value='${pieceCount}.${index}'"><div class='a'>\u00a0</div></td>`), '');

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
    ) => prevShadow.concat(`<td onClick="document.getElementById('row').value='${idx}'; document.getElementById('col').value='${idxShadow}';">
    <div class=${currShadow === 0
        ? 'none'
        : currShadow}>\u00a0</div></td>`), '');

    return prev.concat(`<tr><th style="border: 1px solid rgba(0, 0, 0, 0.267);">${idx % 10}</th>`, currentRow, '</tr>');
  }, '');
  let blocksInHtml = '';
  for (const [k1, v1] of Object.entries(BLOCK)) {
    for (const [k2, v2] of Object.entries(v1)) {
      blocksInHtml = blocksInHtml.concat(makeTableContents(v2, k1, k2));
    }
  }
  return {
    board: `<tr><th />${makeTableHead()}</tr>`.concat(board),
    block: blocksInHtml,
  };
}) satisfies PageServerLoad;

export const actions = {
  putBlock: async (event) => {
    try {
      const { board, id } = await db.collection('room').findOne({ uuid: event.params.room_uuid }).then((e) => {
        console.log(e)
        if (!e || !e.board) {
          throw new Error('Invalid board');
        }
        return { board: e.board, id: e._id.toString() };
      });
      console.log(id)
      const params = await event.request.formData().then((e) => {
        const blockInfo = (e.get('block') as string).split('.');
        return {
          position: [parseInt(e.get('row') as string), parseInt(e.get('col') as string)],
          block: BLOCK[blockInfo[0]][blockInfo[1]],
          rotation: parseInt(e.get('rotation') as string),
          flip: (e.get('flip') as string) === '',
          player: e.get('player') as string,
        }
      });
      const updated = putBlockOnBoard(board, params.block, params.position, params.rotation, params.player, params.flip);
      console.log(board)
      await db.collection('room').updateOne({
        uuid: event.params.room_uuid
      }, {
        $set: {
          board: updated
        }
      }).then(e => {
        if (e.modifiedCount !== 1) {
          throw new Error('internal error - not updated');
        }
      })
    } catch (e) {
      console.error(e);
    }
    return 'ok';
  }
} satisfies Actions;
