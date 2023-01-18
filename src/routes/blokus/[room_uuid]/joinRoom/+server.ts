import { type RequestHandler, redirect } from '@sveltejs/kit';
import { validate } from 'uuid';

export const PATCH = (({ url }) => {
    const roomUuid = url.toString().replace(new RegExp(url.origin.concat('/blokus/')), '');
    if (!validate(roomUuid) || roomUuid[14] !== '5') {
        return new Response('invalid uuid', {
            status: 404,
        });
    }

    // [TODO] when schema fixed, add user to room by query
    throw redirect(302, `/blokus/${roomUuid}`);
}) satisfies RequestHandler;