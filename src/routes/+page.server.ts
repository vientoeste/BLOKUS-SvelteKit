import type { Actions } from './$types';
import { redirect } from '@sveltejs/kit';
import bcrypt from 'bcrypt';
import { createUser, loginAndGetToken } from '$lib/auth';

export const actions: Actions = {
  signIn: async (event) => {
    const { id, password } = Object.fromEntries(await event.request.formData()) as { id: string, password: string };
    if (!id || !password) {
      return new Response('invalid parameter', { status: 400 });
    }

    event.cookies.set('AuthorizationToken', `Bearer ${loginAndGetToken(id, password)}`, {
      httpOnly: true,
      path: '/',
      secure: true,
      sameSite: 'strict',
      maxAge: 60 * 60 * 1,
    });
  },
  signUp: async (event) => {
    const { id, password } = Object.fromEntries(await event.request.formData()) as { id: string, password: string };
    if (!id || !password) {
      return new Response('invalid parameter', { status: 400 });
    }

    const salt = await bcrypt.genSalt(12);
    const hashed = await bcrypt.hash(password, salt);

    const res = await createUser(id, hashed);
    if (res !== 'ok') {
      return new Response(res.error, { status: 500 });
    }

    throw redirect(302, '/game');
  }
};
