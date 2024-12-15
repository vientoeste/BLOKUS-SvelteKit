import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { signUp, validateSessionToken } from '$lib/auth';
import { deleteUserInfo, updateUserInfo } from '$lib/database/user';

export const POST: RequestHandler = async ({ request }) => {
  const data = await request.formData();
  const userId = data.get('userId')?.toString();
  const username = data.get('username')?.toString();
  const password = data.get('password')?.toString();

  if (!username || !password || !userId) {
    error(400, {
      message: 'check req body',
    });
  }

  const createdUserId = await signUp({ userId, username, password });

  return json({ id: createdUserId, message: 'ok' }, { status: 201 });
};

export const PATCH: RequestHandler = async ({ request, cookies }) => {
  const data = await request.formData();
  const username = data.get('username')?.toString();
  const password = data.get('password')?.toString();

  if (!username && !password) {
    error(400, {
      message: 'check req body',
    });
  }
  const sessionToken = cookies.get('session');
  if (!sessionToken) {
    error(401, {
      message: 'token missing',
    });
  }
  const userInfo = await validateSessionToken(sessionToken);
  const { userId } = userInfo;
  try {
    await updateUserInfo(userId, { username, password });
    return new Response(null, { status: 204 });
  } catch (e) {
    if (e instanceof CustomError) {
      error(e.status ?? 500, { message: e.message });
    }
    console.error(e);
    error(500, e instanceof Error ? e.message : 'unknown error occured');
  }
};

export const DELETE: RequestHandler = async ({ cookies }) => {
  const sessionToken = cookies.get('session');
  if (!sessionToken) {
    error(401, {
      message: 'token missing',
    });
  }
  const userInfo = await validateSessionToken(sessionToken);
  const { userId } = userInfo;
  try {
    await deleteUserInfo(userId);
    return new Response(null, { status: 204 });
  } catch (e) {
    if (e instanceof CustomError) {
      error(e.status ?? 500, { message: e.message });
    }
    console.error(e);
    error(500, e instanceof Error ? e.message : 'unknown error occured');
  }
};
