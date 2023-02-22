import { checkAuthFromToken } from '$lib/auth';
import type { Handle } from '@sveltejs/kit'
import { sequence } from '@sveltejs/kit/hooks';
import type { ObjectId } from 'mongodb';

interface User {
  _id: ObjectId,
  id: string,
}

const authCheck = (async ({ event, resolve }) => {
  const authToken = event.cookies.get('AuthorizationToken');
  if (!authToken) {
    event.locals.user = {
      id: '',
    }
    return await resolve(event);
  }
  if (event.url.pathname === '/') {
    return await resolve(event);
  }
  if (authToken.slice(0, 6) !== 'Bearer') {
    throw new Error('invalid token');
  }

  const user: User | undefined = await checkAuthFromToken(authToken);
  if (!user) {
    throw new Error('internal error');
  }
  event.locals.user = {
    _id: user._id,
    id: user.id,
  };

  return await resolve(event);
}) satisfies Handle;

export const handle = sequence(authCheck);
