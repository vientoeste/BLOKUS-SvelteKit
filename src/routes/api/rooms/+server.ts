import { error, json } from "@sveltejs/kit";
import { uuidv7 } from "uuidv7";
import type { RequestHandler } from "./$types";
import { getRooms, insertRoom } from "$lib/database/room";
import { validateSessionToken } from "$lib/auth";
import { CustomError } from "$lib/error";

export const GET: RequestHandler = async ({ url }) => {
  const lastDocId = url.searchParams.get('lastDocId');
  if (lastDocId === null) {
    return error(400, { message: 'invalid page' });
  }
  const rooms = await getRooms({ limit: 15, lastDocId });
  return json(rooms);
};

export const POST: RequestHandler = async ({ request, cookies }) => {
  const token = cookies.get('token');
  if (!token) {
    throw new CustomError('sign in first', 401);
  }
  const userInfo = await validateSessionToken(token);
  if (userInfo === null) {
    throw new CustomError('not allowed: sign in again', 403);
  }
  const { id, userId, username } = userInfo;
  const { name } = await request.json() as { name: string };
  const roomUuid = uuidv7();

  await insertRoom(roomUuid, {
    isStarted: false,
    name,
    players: [{
      id, userId, username, playerIdx: 0,
    }],
  });
  return json({ roomId: roomUuid }, { status: 201 });
};
