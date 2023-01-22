import type { PageServerLoad } from "./$types";
import { validate } from "uuid";

export const load = (async ({ url, params }) => {
    if (!validate(params.room_uuid)) {
        throw new Error('Invalid uuid');
    }
    // [TODO] Need to fix how to show clients a board

    return {
        block: params,
    };
}) satisfies PageServerLoad;
