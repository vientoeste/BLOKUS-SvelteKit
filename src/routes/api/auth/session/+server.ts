import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { signIn, signOut } from '$lib/auth';
import { CustomError } from '$lib/error';

export const POST: RequestHandler = async ({ request, cookies }) => {
  try {
    const reqBody = await request.formData();
    const userId = reqBody.get('userId')?.toString();
    const password = reqBody.get('password')?.toString();
    if (!password || !userId) {
      error(400, {
        message: 'check req body',
      });
    }
    const { token, id, username } = await signIn({ userId, password });
    cookies.set('token', token, {
      path: '/',
      maxAge: 2592000,
      httpOnly: true,
    });
    return json({
      message: 'ok', userInfo: {
        id, userId, username,
      },
    });
  } catch (e) {
    if (e instanceof CustomError) {
      console.error(e.message);
      error(e.status ?? 500, e.message);
    }
    console.error(e);
    error(500, 'internal error');
  }
};

export const DELETE: RequestHandler = async ({ cookies }) => {
  try {
    const sessionToken = cookies.get('token');
    if (!sessionToken) {
      return json({ message: 'token not found' }, { status: 204 });
    }
    signOut(sessionToken);
    return new Response(null, { status: 204 });
  } catch (e) {
    if (e instanceof CustomError) {
      console.error(e.message);
      error(e.status ?? 500, e.message);
    }
    console.error(e);
    error(500, 'internal error');
  }
};