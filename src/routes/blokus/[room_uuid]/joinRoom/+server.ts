import type { RequestHandler } from '@sveltejs/kit';
import { validate } from 'uuid';

export const GET = (({ url }) => {
    return new Response();
}) satisfies RequestHandler;