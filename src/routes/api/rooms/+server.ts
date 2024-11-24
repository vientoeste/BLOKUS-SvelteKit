import { json } from "@sveltejs/kit";
import { uuidv7 } from "uuidv7";
import type { RequestHandler } from "./$types";
import { getRooms, insertRoom } from "$lib/database/room";
import { validateSessionToken } from "$lib/auth";
import { CustomError } from "$lib/error";

export const GET: RequestHandler = async ({ url }) => {
  const page = url.searchParams.get('page') ?? '0';
  if (page !== '0' && Number.isNaN(parseInt(page))) {
    return json({ message: 'invalid page' }, { status: 404 });
  }
  const rooms = await getRooms({ page: parseInt(page) ?? 0, offset: 15 });
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
