import { type RequestHandler, redirect } from '@sveltejs/kit';
import { validate } from 'uuid';

export const PATCH = (({ url, params }) => {
    const { room_uuid } = params;
    if (!room_uuid || !validate(room_uuid)) {
        console.log('123')
        return new Response('invalid uuid', {
            status: 404,
        });
    }

    // [TODO] when schema fixed, add user to room by query
    throw redirect(302, `/blokus/${params.room_uuid}`);
}) satisfies RequestHandler;