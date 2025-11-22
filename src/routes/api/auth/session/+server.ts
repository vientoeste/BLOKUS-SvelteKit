import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import type { ApiResponse, SignInResponse } from '$types';
import { signIn, signOut } from '$lib/auth';
import { CustomError } from '$lib/error';
import { handleApiError } from '$lib/server/utils';

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
      sameSite: 'lax',
      secure: import.meta.env.VITE_NODE_ENV === 'production',
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
    return handleApiError(e);
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
    return handleApiError(e);
  }
};
