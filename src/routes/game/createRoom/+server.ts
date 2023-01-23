import { v5 } from 'uuid';
import { type RequestHandler, redirect } from '@sveltejs/kit';
import db from '$lib/database';

interface ReqBody {
    creator: string,
    createdAt: string,
}

export const POST = (async ({ request }) => {
    const { creator } = await request.json() as ReqBody;
    if (!creator) {
        throw new Error('INVALID PARAM');
    }

    const newUuid = v5(creator.concat('_', new Date().toISOString()), import.meta.env.VITE_NAMESPACE_UUID);

    const res = await db.collection('room').insertOne({
        uuid: newUuid,
        participants: [creator]
    });
    if (!res.insertedId) {
        throw new Error('INTERNAL ERROR - query failed');
    }

    throw redirect(302, `/blokus/${newUuid}`);
}) satisfies RequestHandler;
