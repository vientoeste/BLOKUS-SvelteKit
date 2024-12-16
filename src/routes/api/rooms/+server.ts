import { json } from "@sveltejs/kit";
import { uuidv7 } from "uuidv7";
import type { RequestHandler } from "./$types";
import { validateSessionCookie } from "$lib/auth";
import { CustomError } from "$lib/error";
import type { CreateRoomRequestDTO } from "$lib/types";
import { createRoom, getRoomsFromLastObj } from "$lib/room";

export const GET: RequestHandler = async ({ url, cookies }) => {
  await validateSessionCookie(cookies);
  const lastDocId = url.searchParams.get('lastDocId');
  const rooms = await getRoomsFromLastObj(lastDocId);
  return json({ rooms });
};

export const POST: RequestHandler = async ({ request, cookies }) => {
  const { id, userId, username } = await validateSessionCookie(cookies);
  const { name } = await request.json() as CreateRoomRequestDTO;
  const roomUuid = uuidv7();
  await createRoom(roomUuid, {
    name,
    players: [{
      id, userId, username, playerIdx: 0,
    }],
  });
  return json({ roomId: roomUuid }, { status: 201 });
};
