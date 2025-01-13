import { createClient } from 'redis';

export const redis = await createClient({ password: import.meta.env.VITE_REDIS_PW }).connect();
