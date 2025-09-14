import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { signUp, validateSessionCookie } from '$lib/auth';
import { deleteUserInfo, updateUserInfo } from '$lib/database/user';
import { CustomError } from '$lib/error';
import type { ApiResponse, CreateUserResponse } from '$types';
import { handleApiError } from '$lib/utils';

export const POST: RequestHandler = async ({ request }) => {
  const data = await request.formData();
  const userId = data.get('userId')?.toString();
  const username = data.get('username')?.toString();
  const password = data.get('password')?.toString();
  if (!username || !password || !userId) {
    throw new CustomError('check req body', 400);
  }
  const createdUserId = await signUp({ userId, username, password });

  const response: ApiResponse<CreateUserResponse> = {
    type: 'success',
    status: 201,
    data: { id: createdUserId },
  };
  return json(response, { status: 201 });
};

export const PATCH: RequestHandler = async ({ request, cookies }) => {
  try {
    const data = await request.formData();
    const username = data.get('username')?.toString();
    const password = data.get('password')?.toString();
    if (!username && !password) {
      throw new CustomError('check req body', 400);
    }

    const { userId } = await validateSessionCookie(cookies);
    await updateUserInfo(userId, { username, password });
    return new Response(null, { status: 204 });
  } catch (e) {
    return handleApiError(e);
  }
};

export const DELETE: RequestHandler = async ({ cookies }) => {
  const { userId } = await validateSessionCookie(cookies);
  try {
    await deleteUserInfo(userId);
    return new Response(null, { status: 204 });
  } catch (e) {
    return handleApiError(e);
  }
};
