import type { Handle } from '@sveltejs/kit'
import { sequence } from '@sveltejs/kit/hooks';
import jwt from 'jsonwebtoken';
import db from './lib/database';

const authCheck = (async ({ event, resolve }) => {
  if (event.url.pathname === '/') {
    return await resolve(event);
  }

  const authCookie = event.cookies.get('AuthorizationToken');
  if (authCookie?.slice(0, 6) !== 'Bearer') {
    throw new Error('invalid token');
  }
  if (authCookie) {
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

      event.locals.user = {
        _id: user[0]._id,
        id: user[0].id,
      };
    } catch (e) {
      console.error(e);
    }
  }
  return await resolve(event);
}) satisfies Handle;

export const handle = sequence(authCheck);
