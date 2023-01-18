import type { RequestHandler } from '@sveltejs/kit';
import { validate } from 'uuid';

export const PUT = (({ url }) => {
    return new Response();
}) satisfies RequestHandler;