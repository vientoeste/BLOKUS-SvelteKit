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
    const { p0, p1, p2, p3 } = room;
    if (p1 !== undefined && p2 !== undefined && p3 !== undefined) {
      throw redirect(303, '/rooms?error=room_is_full');
    }

    const playerIdx = p0?.id === id ?
      0 : p1?.id === id ?
        1 : p2?.id === id ?
          2 : p3?.id === id ?
            3 : -1;
    if (playerIdx === -1) {
      throw redirect(303, '/rooms?error=not_allowed');
    }
    redis.publish('message', JSON.stringify({
      id,
      userId,
      username,
      playerIdx,
    }));
    return {
      ...room, playerIdx,
    };
  } catch (e) {
    // [TODO] handle error
    console.error(e);
  }
};
