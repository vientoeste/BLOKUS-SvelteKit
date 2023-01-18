import type { RequestHandler } from '@sveltejs/kit';
import { validate } from 'uuid';

export const GET = (({ url }) => {
    // [TODO] Need to fix how to show clients a board
    return new Response('ok');
}) satisfies RequestHandler;