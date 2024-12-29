import { json } from "@sveltejs/kit";
import { uuidv7 } from "uuidv7";
import type { RequestHandler } from "./$types";
import { validateSessionCookie } from "$lib/auth";
import type { ApiResponse, CreateRoomRequestDTO, CreateRoomResponse, FetchRoomPreviewsResponse } from "$lib/types";
import { createRoom, getRoomsFromLastObj } from "$lib/room";

export const GET: RequestHandler = async ({ url, cookies }) => {
  await validateSessionCookie(cookies);
  const lastDocId = url.searchParams.get('lastDocId');
  const rooms = await getRoomsFromLastObj(lastDocId);

  const response: ApiResponse<FetchRoomPreviewsResponse> = {
    type: 'success',
    status: 200,
    data: { rooms, },
  };
  return json(response);
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

  const response: ApiResponse<CreateRoomResponse> = {
    type: 'success',
    status: 201,
    data: { roomId: roomUuid },
  };
  return json(response, { status: 201 });
};
