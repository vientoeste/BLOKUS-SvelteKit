import { roomCacheRepository } from '$lib/database/redis'
import { json } from '@sveltejs/kit';

export const POST = async () => {
  const result = await roomCacheRepository.save('immitated', {
    name: `immitated_${new Date().toISOString()}`,
    gameId: "immitated",
    turn: 285,
    started: true,
    p0_id: "0193d991-e5ac-7061-a59a-7cd4afdd7661",
    p0_username: "temp1218",
    p0_ready: true,
    p1_id: "0194c14c-483a-7941-952c-50bfae5ad8f7",
    p1_ready: true,
    p1_username: "imtesting",
    slot0_exhausted: true,
    slot1_exhausted: true,
    slot2_exhausted: false,
    slot3_exhausted: true,
  });
  console.log('room cache insert result: ', result)
  return json({
    status: 200,

  });
}
export const DELETE = async () => {
  await roomCacheRepository.remove('immitated');
  return json({
    status: 200,

  });
};
