import { type RequestHandler, redirect } from '@sveltejs/kit';
import { validate } from 'uuid';
import db from '$lib/database';

export const PATCH = (async ({ params, request }) => {
  const { room_uuid } = params;
  if (!room_uuid || !validate(room_uuid)) {
    return new Response('invalid uuid', {
      status: 404,
    });
  }

  // [TODO] reqbody가 아닌 실제 세션 username으로 변경해야 함
  const { username } = await request.json();
  if (!username) {
    throw new Error('invalid username');
  }

  const res = await db.collection('room').updateOne({
    uuid: room_uuid
  }, {
    $addToSet: {
      participants: username
    }
  });
  if (res.modifiedCount !== 1) {
    throw new Error('INTERNAL ERROR - query failed');
  }

  throw redirect(302, `/blokus/${room_uuid}`);
}) satisfies RequestHandler;
