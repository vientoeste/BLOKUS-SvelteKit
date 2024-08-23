import { RedisConnectionPool, type RedisConnectionPoolInf, type RedisClient } from "../lib/database/pool";

describe('Redis Connection Pool', () => {
  let redisPool: RedisConnectionPoolInf;
  const MAX_CONNECTIONS = 4;
  const TIMEOUT = 2000;

  beforeEach(async () => {
    redisPool = new RedisConnectionPool({ redisConfig: undefined, poolSize: MAX_CONNECTIONS, connectionTimeout: TIMEOUT });
    await redisPool.initialize();
  });

  afterEach(async () => {
    await redisPool.close();
  });

  describe('Connection Management', () => {
    it('should number of client must be 10', () => {
      expect(redisPool.getClientCount())
        .toBe(MAX_CONNECTIONS);
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
      await redisPool.release(connection1);
      const connection2 = await redisPool.acquire();
      expect(connection2).toBe(connection1);
    });

    it('should create multiple connections up to the maximum pool size', async () => {
      const connections = await Promise.all(
        Array(MAX_CONNECTIONS).fill(undefined).map(() => redisPool.acquire())
      );
      expect(connections.length).toBe(MAX_CONNECTIONS);
      expect(new Set(connections).size).toBe(MAX_CONNECTIONS);
    });

    it('should handle requests beyond max connections', async () => {
      const connections: RedisClient[] = [];
      for (let i = 0; i < MAX_CONNECTIONS; i++) {
        connections.push(await redisPool.acquire());
      }

      let resolved = false;
      const additionalConnectionPromise = redisPool.acquire();
      additionalConnectionPromise.then(() => { resolved = true });
      expect(resolved).toBeFalsy();

      setTimeout(async () => {
        await redisPool.release(connections[0]);
      }, 1000);
      const additionalConnection = await additionalConnectionPromise;
      expect(resolved).toBeTruthy();
      expect(additionalConnection).toBeDefined();
    });

    it('should timeout if no connection becomes available', async () => {
      const connections: RedisClient[] = [];
      for (let i = 0; i < MAX_CONNECTIONS; i++) {
        connections.push(await redisPool.acquire());
      }

      const timeoutPromise = new Promise(resolve => setTimeout(resolve, TIMEOUT + 1000));

      const acquirePromise = redisPool.acquire();
      await expect(Promise.race([acquirePromise, timeoutPromise])).rejects.toThrow('Connection acquisition timeout');
    });

    it('should handle multiple waiting requests correctly', async () => {
      const connections: RedisClient[] = [];
      for (let i = 0; i < MAX_CONNECTIONS; i++) {
        connections.push(await redisPool.acquire());
      }

      const additionalPromises = [
        redisPool.acquire(),
        redisPool.acquire(),
        redisPool.acquire()
      ];

      setTimeout(async () => await redisPool.release(connections[0]), 500);
      setTimeout(async () => await redisPool.release(connections[1]), 1000);
      setTimeout(async () => await redisPool.release(connections[2]), 1500);

      const additionalConnections = await Promise.all(additionalPromises);
      expect(additionalConnections.length).toBe(3);
      additionalConnections.forEach(conn => expect(conn).toBeDefined());

      for (let i = 3; i < connections.length; i++) {
        await redisPool.release(connections[i]);
      }
      for (const conn of additionalConnections) {
        await redisPool.release(conn);
      }
    });
  });
});
