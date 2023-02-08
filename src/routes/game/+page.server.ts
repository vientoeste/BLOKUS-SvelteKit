import type { PageServerLoad, Actions } from "./$types";
import db from '$lib/database';
import { v5 } from 'uuid';
import { redirect } from "@sveltejs/kit";
import { createNewBoard } from "./game";
import { writable } from "svelte/store";
import { rooms } from "../../Store";
import { extractUserIdFromToken } from "$lib/auth";


export const load = (async (event) => {
  const queryRes = (await db.collection('room').find().toArray()).map(e => {
    const uuid = `<a href="/game/${e.uuid}">${e.name}</a>`;
    return uuid;
  });
  const userId = extractUserIdFromToken(event.cookies.get('AuthorizationToken')?.split(' ')[1] ?? '');
  return {
    rooms: queryRes.join('<br>'),
    creator: userId,
  };
}) satisfies PageServerLoad;

export const actions = {
  createRoom: async (event) => {
    const { roomName, creator } = await event.request.formData().then((e) => {
      return {
        roomName: e.get('name') as string,
        creator: e.get('creator') as string,
      }
    });

    const newUuid = v5(roomName.concat('_', new Date().toISOString()), import.meta.env.VITE_NAMESPACE_UUID);

    const res = await db.collection('room').insertOne({
      name: roomName,
      uuid: newUuid,
      participants: [creator],
      board: createNewBoard(),
    });
    if (!res.insertedId) {
      throw new Error('INTERNAL ERROR - query failed');
    }
    // [TODO] store -> socket.io로 대체. 새 namespace에 대한 하위 프로퍼티 정의
    throw redirect(302, `/game/${newUuid}`)
  }
} satisfies Actions;
