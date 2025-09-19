import { getRoomById } from "$lib/room";
import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { validateSessionCookie } from "$lib/auth";
import { getMovesByGameId } from "$lib/database/move";

export const load: PageServerLoad = async ({ params, cookies }) => {
  try {
    const { id } = await validateSessionCookie(cookies);
    const { room_id: roomId } = params;
    const { room, roomCache } = await getRoomById(roomId);
    const { p0, p1, p2, p3 } = roomCache;
    const playerIdx = p0?.id === id ?
      0 : p1?.id === id ?
        1 : p2?.id === id ?
          2 : p3?.id === id ?
            3 : -1;
    if (playerIdx === -1) {
      throw new Error('not allowed to join the room');
    }
    return {
      playerIdx,
      room,
      roomCache,
      moves: roomCache.gameId ? await getMovesByGameId(roomCache.gameId) : [],
    };
  } catch (e) {
    // [TODO] handle error
    console.error(e);
    if (e instanceof Error) {
      throw redirect(303, `/v1/rooms?error=${e.message}`);
    }
    throw redirect(303, `/v1/rooms?error=unknowrn_error_occured`);
  }
};
