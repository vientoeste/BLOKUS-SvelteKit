import uuid from 'uuid';
import type { RequestHandler } from '@sveltejs/kit';

interface ReqBody {
    creator: string,
    createdAt: string,
}

export const POST = (async ({ request }) => {
    const { creator } = await request.json() as ReqBody;
    if (!creator) {
        throw new Error('INVALID PARAM');
    }

    const newUuid = uuid.v5(creator.concat('_', new Date().toISOString()), import.meta.env.VITE_NAMESPACE_UUID);

    return new Response(newUuid);
}) satisfies RequestHandler;
