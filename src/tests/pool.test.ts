import { RedisConnectionPool, type RedisConnectionPoolInf } from "../lib/database/pool";

describe('Redis Connection Pool', () => {
  let redisPool: RedisConnectionPoolInf;
  const poolSize = 10;

  beforeEach(async () => {
    redisPool = new RedisConnectionPool({ redisConfig: undefined, poolSize });
    await redisPool.initialize();
  });

  afterEach(async () => {
    redisPool.close();
  });
});
