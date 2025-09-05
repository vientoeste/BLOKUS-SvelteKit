import { validateSessionCookie } from "$lib/auth";
import { addUserToRoomCache } from "$lib/database/room";
import { CustomError } from "$lib/error";
import { handleApiError } from "$lib/utils";
import type { ApiResponse, PlayerIdx } from "$types";
import { json, type RequestHandler } from "@sveltejs/kit";

export const POST: RequestHandler = async ({ cookies, params }) => {
  try {
    const { room_id: roomId } = params;
    if (!roomId) {
      throw new CustomError('roomId', 400);
    }
    const userInfo = await validateSessionCookie(cookies);
    const result = await addUserToRoomCache({ roomId, userInfo });

    const response: ApiResponse<{ idx: PlayerIdx }> = {
      type: 'success',
      status: 201,
      data: {
        idx: result
      }
    };
    return json(response);
  } catch (e) {
    return handleApiError(e);
  }
};
