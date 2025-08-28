import type { Handle } from '@sveltejs/kit';

// [TODO] apply ELK to save logs

export const handle = (async ({ event, resolve }) => {
  const response = await resolve(event);
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  try {

    response.headers.set('Access-Control-Allow-Origin', process.env.ORIGIN as string);
  } catch (e) {
    console.log(10);
    console.error(e);
  }
  return response
}) satisfies Handle;
