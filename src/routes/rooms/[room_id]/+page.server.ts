import { getRoomById } from "$lib/room";
import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { redis } from "$lib/database/redis";
import { validateSessionCookie } from "$lib/auth";

export const load: PageServerLoad = async ({ params, cookies }) => {
  try {
    const { id, userId, username } = await validateSessionCookie(cookies);
    const { room_id: roomId } = params;
    const room = await getRoomById(roomId);
    const { p1, p2, p3 } = room;
    if (p1 !== undefined && p2 !== undefined && p3 !== undefined) {
      throw redirect(303, '/rooms?error=room_is_full');
    }
    const player = !p1 ? { idx: 1, key: 'p1' } : !p2 ? { idx: 2, key: 'p2' } : { idx: 3, key: 'p3' };
    await redis.hSet(`room:${roomId}`, player.key, player.idx);
    redis.publish('message', JSON.stringify({
      id,
      userId,
      username,
      playerIdx: player.idx,
    }));
    return room;
  } catch (e) {
    // [TODO] handle error
    console.error(e);
  }
};
