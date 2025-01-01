import { getRoomById } from "$lib/room";
import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ params }) => {
  const { room_id: roomId } = params;
  try {
    const room = await getRoomById(roomId);
    const { p1, p2, p3 } = room;
    if (p1 !== undefined && p2 !== undefined && p3 !== undefined) {
      throw redirect(303, '/rooms?error=room_is_full');
    }
    return room;
  } catch (e) {
    // [TODO] handle error
    console.error(e);
  }
};
