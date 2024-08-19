import { RedisConnectionPool, type RedisConnectionPoolInf, type RedisClient } from "../lib/database/pool";

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

  describe('Connection Management', () => {
    it('should number of client must be 10', () => {
      expect(redisPool.getClientCount())
        .toBe(10);
    });

    it('should create a new connection when the pool is empty', async () => {
      const connection = await redisPool.acquire();
      expect(connection).toBeDefined();
      expect(await connection.ping()).toBe('PONG');
      expect(connection.isOpen).toBe(true)
      expect(typeof connection.disconnect).toBe('function')
    });

    it('should reuse an existing connection when available', async () => {
      const connection1 = await redisPool.acquire();
      redisPool.release(connection1);
      const connection2 = await redisPool.acquire();
      expect(connection2).toBe(connection1);
    });

    it('should create multiple connections up to the maximum pool size', async () => {
      const connections = await Promise.all(
        Array(poolSize).fill(undefined).map(() => redisPool.acquire())
      );
      expect(connections.length).toBe(poolSize);
      expect(new Set(connections).size).toBe(poolSize);
    });
  });
});
