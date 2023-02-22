import type { Actions, PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { checkAuthFromToken, extractUserIdFromToken, loginAndGetToken, signUp } from '$lib/auth';

export const load = (async (event) => {
  const token = event.cookies.get('AuthorizationToken')?.split(' ')[1];
  if (!token) {
    return {
      signedIn: false, id: '',
    }
  }
  return {
    signedIn: true, id: extractUserIdFromToken(token)
  }
}) satisfies PageServerLoad;

export const actions: Actions = {
  signIn: async (event) => {
    const { id, password } = Object.fromEntries(await event.request.formData()) as { id: string, password: string };
    if (!id || !password) {
      return new Response('invalid parameter', { status: 400 });
    }

    const jwt = await loginAndGetToken(id, password);
    if (jwt.error !== '') {
      throw redirect(303, '/?login%20failed');
    }
    event.cookies.set('AuthorizationToken', `Bearer ${jwt.token}`, {
      httpOnly: true,
      path: '/',
      secure: true,
      sameSite: 'strict',
      maxAge: import.meta.env.VITE_JWT_EXPTIME,
    });

    throw redirect(302, '/game');
  },
  signUp: async (event) => {
    const { id, password } = Object.fromEntries(await event.request.formData()) as { id: string, password: string };
    if (!id || !password) {
      return new Response('invalid parameter', { status: 400 });
    }

    const token = signUp(id, password);

    event.cookies.set('AuthorizationToken', `Bearer ${token}`, {
      httpOnly: true,
      path: '/',
      secure: true,
      sameSite: 'strict',
      maxAge: import.meta.env.VITE_JWT_EXPTIME,
    });

    throw redirect(302, '/game');
  },
  signOut: async (event) => {
    const authToken = event.cookies.get('AuthorizationToken');
    if (!authToken) {
      throw new Error('not logged in: internal error');
    }
    checkAuthFromToken(authToken);
    event.cookies.delete('AuthorizationToken');
    event.locals.user = {
      id: '',
      _id: undefined,
    }
    throw redirect(302, '/');
  },
};
