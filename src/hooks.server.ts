import type { Handle } from '@sveltejs/kit'

export const handle = (async ({ event, resolve }) => {
  const response = await resolve(event);
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  response.headers.set('Access-Control-Allow-Origin', process.env.ORIGIN as string);
  return response
}) satisfies Handle;
