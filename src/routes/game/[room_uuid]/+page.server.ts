import type { PageServerLoad } from "./$types";
import { validate } from "uuid";
import db from '$lib/database';
import { BLOCK, putBlockOnBoard } from "../game";
import { redirect, type Actions } from "@sveltejs/kit";
import { extractUserIdFromToken } from "$lib/auth";

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
    ) => prevShadow.concat(currShadow === 0 ?
      '<th></th>'
      : `<td onClick="document.getElementById('block').value='${pieceCount}.${index}'">
      <div class='a'>\u00a0</div></td>`), '');

    return prev.concat(currentRow, '</tr>');
  }, ''), `</table></div>`)
};

export const load = (async ({ params, cookies }) => {
  const { room_uuid } = params;
  if (!validate(room_uuid)) {
    throw new Error('Invalid uuid');
  }

  const authCookie = cookies.get('AuthorizationToken');
  if (!authCookie) {
    throw redirect(307, '/');
  }
  const userId = extractUserIdFromToken(authCookie.split(' ')[1]);

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

  // [TODO] store -> socket.io로 대체. 참가자 추가

  return {
    board: `<tr><th />${makeTableHead()}</tr>`.concat(board),
    block: blocksInHtml,
    id: userId,
    route: room_uuid,
  };
}) satisfies PageServerLoad;

export const actions = {
  putBlock: async (event) => {
    try {
      const board = await db.collection('room').findOne({ uuid: event.params.room_uuid }).then((e) => {
        if (!e || !e.board) {
          throw new Error('Invalid board');
        }
        return e.board;
      });

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

      // [TODO] websocket logics come here. turn ++

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
      });
    } catch (e) {
      console.error(e);
    }
  },
  removeRoom: async (event) => {
    // [TODO] 권한 체크
    await db.collection('room').deleteOne({ uuid: event.params.room_uuid });

    throw redirect(301, '/game');
  },
  // [TODO] socket.io-client works strangely
  /*startGame: async (event) => {
    console.log(12)
    const { room_uuid } = event.params;
    if (!room_uuid) {
      throw new Error('internal server error');
    }
    const socket = io("/game");
    // console.log(socket)

    socket.on('connect', () => {

      console.log(123321134123)
    })
    console.log(socket.disconnected)
    socket.emit('startGame')
  },*/
} satisfies Actions;
