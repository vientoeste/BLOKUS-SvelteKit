import type { Handle } from '@sveltejs/kit'
import { sequence } from '@sveltejs/kit/hooks';

const example = (async ({ event, resolve }) => {
    // [TODO] middlewares come here
    return await resolve(event);
}) satisfies Handle;

export const handle = sequence(example);