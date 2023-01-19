import type { RequestHandler } from '@sveltejs/kit';
import { validate } from 'uuid';

// [TODO] RESTful API 구축을 위한 구조 재정립 필요할 듯

export const GET = (({ url }) => {
    return new Response('ok');
}) satisfies RequestHandler;