import type { PageServerLoad } from "./$types";
import db from '$lib/database';


export const load = (async ({ url }) => {
  const queryRes = (await db.collection('room').find().toArray()).map(e => {
    const uuid = `<a href="/game/${e.uuid}">${e.name}</a>`;
    return uuid
  });
  return {
    queryRes: queryRes.join('<br>'),
  };
}) satisfies PageServerLoad;
