import type { Actions, PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import bcrypt from 'bcrypt';
import { checkAuthFromToken, createUser, loginAndGetToken } from '$lib/auth';
import jwt from 'jsonwebtoken';
import db from '$lib/database';

export const load = (async (event) => {
  let signedIn = false;
  const authCookie = event.cookies.get('AuthorizationToken')
  if (authCookie) {
    const userId = await checkAuthFromToken(authCookie);
    signedIn = true;
    return { signedIn, id: userId };
  }
  return { signedIn, id: undefined };
}) satisfies PageServerLoad;

export const actions: Actions = {
  signIn: async (event) => {
    const { id, password } = Object.fromEntries(await event.request.formData()) as { id: string, password: string };
    if (!id || !password) {
      return new Response('invalid parameter', { status: 400 });
    }

    const jwt = await loginAndGetToken(id, password);
    event.cookies.set('AuthorizationToken', `Bearer ${jwt}`, {
      httpOnly: true,
      path: '/',
      secure: true,
      sameSite: 'strict',
      maxAge: 60 * 60 * 1,
    });

    throw redirect(302, '/game');
  },
  signUp: async (event) => {
    const { id, password } = Object.fromEntries(await event.request.formData()) as { id: string, password: string };
    if (!id || !password) {
      return new Response('invalid parameter', { status: 400 });
    }

    const salt = await bcrypt.genSalt(12);
    const hashed = await bcrypt.hash(password, salt);

    const res = await createUser(id, hashed);
    if (typeof res !== 'string') {
      return new Response(res.error, { status: 500 });
    }
    const jwtValue = jwt.sign({
      _id: res,
      id: id,
    }, import.meta.env.VITE_JWT_SECRET, {
      expiresIn: '1h',
    });

    event.cookies.set('AuthorizationToken', `Bearer ${jwtValue}`, {
      httpOnly: true,
      path: '/',
      secure: true,
      sameSite: 'strict',
      maxAge: 60 * 60 * 1,
    });

    throw redirect(302, '/game');
  },
  signOut: async (event) => {
    const authCookie = event.cookies.get('AuthorizationToken');
    if (!authCookie) {
      throw new Error('token doesn\'t exists');
    }
    if (authCookie?.slice(0, 6) !== 'Bearer') {
      throw new Error('invalid Token');
    }

    const token = authCookie.split(' ')[1];
    try {
      const jwtUser = jwt.verify(token, import.meta.env.VITE_JWT_SECRET);
      if (typeof jwtUser === 'string') {
        throw new Error('internal server error');
      }

      const user = await db.collection('user').find({
        id: jwtUser.id
      }).toArray();
      if (!user) {
        throw new Error('User not found');
      }
      if (user.length !== 1) {
        throw new Error('')
      }
      event.cookies.delete('AuthorizationToken');
    } catch (e) {
      console.error(e);
    }
    throw redirect(302, '/');
  },
};
