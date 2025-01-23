import { validateSessionCookie } from "$lib/auth";
import { addUserToRoomCache } from "$lib/database/room";
import { CustomError } from "$lib/error";
import type { ApiResponse } from "$types";
import { json, type RequestHandler } from "@sveltejs/kit";

export const POST: RequestHandler = async ({ cookies, params }) => {
  try {
    const { room_id: roomId } = params;
    if (!roomId) {
      throw new CustomError('roomId', 400);
    }
    const userInfo = await validateSessionCookie(cookies);
    const result = await addUserToRoomCache({ roomId, userInfo });

    const response: ApiResponse<{ idx: 0 | 1 | 2 | 3 }> = {
      type: 'success',
      status: 201,
      data: {
        idx: result
      }
    };
    return json(response);
  } catch (e) {
    console.error(e);
    if (e instanceof CustomError) {
      const response: ApiResponse = {
        type: 'failure',
        status: e.status ?? 500,
        error: { message: e.message },
      };
      return json(response);
    }
    return json({
      type: 'failure',
      status: 500,
      error: { message: 'unknown error occured' },
    });
  }
};
