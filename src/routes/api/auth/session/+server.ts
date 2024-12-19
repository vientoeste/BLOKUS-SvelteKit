import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import type { ApiResponse, SignInResponse } from '$lib/types';
import { signIn, signOut } from '$lib/auth';
import { CustomError } from '$lib/error';

export const POST: RequestHandler = async ({ request, cookies }) => {
  try {
    const reqBody = await request.formData();
    const userId = reqBody.get('userId')?.toString();
    const password = reqBody.get('password')?.toString();
    if (!password || !userId) {
      throw new CustomError('check req body', 400);
    }
    const { token, id, username } = await signIn({ userId, password });
    cookies.set('token', token, {
      path: '/',
      maxAge: 2592000,
      httpOnly: true,
    });

    const response: ApiResponse<SignInResponse> = {
      type: 'success',
      status: 201,
      data: {
        id, userId, username,
      },
    };
    return json(response);
  } catch (e) {
    if (e instanceof CustomError) {
      const response: ApiResponse = {
        type: 'failure',
        status: e.status ?? 500,
        error: { message: e.message },
      };
      return new Response(JSON.stringify(response), {
        headers: { 'Content-Type': 'application/json' },
      });
    }
    console.error(e);
    const response: ApiResponse = {
      type: 'failure',
      status: 500,
      error: { message: 'internal server error' },
    };
    return json(response);
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
