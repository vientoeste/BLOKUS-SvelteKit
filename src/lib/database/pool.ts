import { createClient as createRedisClient } from "redis";
import assert from 'node:assert';

export type RedisClient = ReturnType<typeof createRedisClient>;

type RedisConfig = Parameters<typeof createRedisClient>[0];

interface RedisConnectionPoolConfig {
  redisConfig: RedisConfig;
  poolSize?: number;
  connectionTimeout?: number;
  maxRetries?: number;
  retryInterval?: number;
}

export interface RedisConnectionPoolInf {
  initialize(): Promise<void>;
  getClientCount(): number;
  acquire(): Promise<RedisClient>;
  release(connection: RedisClient): Promise<void>;
  close(): Promise<void>;
}

export class RedisConnectionPool implements RedisConnectionPoolInf {
  constructor(config: RedisConnectionPoolConfig) {
    this.config = config.redisConfig;
    this.pool = [];
    this.size = config.poolSize || 4;
    this.acquiredConnections = new Set();
    this.connectionTimeout = config.connectionTimeout || 5000;
    this.maxRetries = config.maxRetries || 3;
    this.retryInterval = config.retryInterval || 1000;
    this.waitingQueue = [];
  }

  private config: RedisConfig;

  private pool: RedisClient[];

  private size: number;

  private acquiredConnections: Set<RedisClient>;

  private connectionTimeout: number;

  private maxRetries: number;

  private retryInterval: number;

  private waitingQueue: Array<{
    resolve: (connection: RedisClient) => void;
    reject: (reason: Error) => void;
    timer: NodeJS.Timeout;
  }>;

  async initialize() {
    for (let i = 0; i < this.size; i++) {
      const client = await this.createClient();
      this.pool.push(client);
    }
  }

  async createClient() {
    const client = createRedisClient(this.config);

    client.on('error', (err) => {
      console.error('Redis client error:', err);
      this.handleConnectionError(client);
    });

    try {
      await this.connectWithTimeout(client);
      return client;
    } catch (error) {
      console.error('Failed to create Redis client:', error);
      throw error;
    }
  }

  async connectWithTimeout(client: RedisClient) {
    let timeoutId: NodeJS.Timeout | undefined = undefined;
    const timeout = new Promise((_, reject) =>
      timeoutId = setTimeout(() => reject(new Error('Connection timeout')), this.connectionTimeout)
    );
    return Promise.race([
      client.connect(),
      timeout,
    ]).then(() => {
      if (timeoutId !== undefined) {
        clearTimeout(timeoutId);
      }
    })
  }

  async handleConnectionError(client: RedisClient) {
    if (this.acquiredConnections.has(client)) {
      this.acquiredConnections.delete(client);
      try {
        await this.reconnect(client);
        this.pool.push(client);
      } catch (error) {
        console.error('Failed to reconnect:', error);
        const newClient = await this.createClient();
        this.pool.push(newClient);
      }
    }
  }

  async reconnect(client: RedisClient) {
    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      try {
        await this.connectWithTimeout(client);
        console.log('Reconnected successfully');
        return;
      } catch (error) {
        console.error(`Reconnection attempt ${attempt + 1} failed:`, error);
        await new Promise(resolve => setTimeout(resolve, this.retryInterval));
      }
    }
    throw new Error('Max reconnection attempts reached');
  }

  getClientCount() {
    return this.pool.length;
  }

  async acquire() {
    if (this.pool.length > 0) {
      const client = this.pool.pop();
      assert(client);
      this.acquiredConnections.add(client);
      return client;
    }

    if (this.acquiredConnections.size < this.size) {
      const client = await this.createClient();
      this.acquiredConnections.add(client);
      return client;
    }

    return new Promise<RedisClient>((resolve, reject) => {
      const timer = setTimeout(() => {
        const index = this.waitingQueue.findIndex(item => item.timer === timer);
        if (index !== -1) {
          this.waitingQueue.splice(index, 1);
          reject(new Error('Connection acquisition timeout'));
        }
      }, this.connectionTimeout);

      this.waitingQueue.push({ resolve, reject, timer });
    });
  }

  async release(connection: RedisClient): Promise<void> {
    this.acquiredConnections.delete(connection);

    if (this.waitingQueue.length > 0) {
      const waitingInfo = this.waitingQueue.shift();
      assert(waitingInfo);
      const { resolve, timer } = waitingInfo;
      clearTimeout(timer);
      this.acquiredConnections.add(connection);
      resolve(connection);
    } else {
      this.pool.push(connection);
    }
  }

  async close(): Promise<void> {
    await Promise.all([...this.pool, ...this.acquiredConnections].map(connection => connection.quit()));
    this.pool = [];
    this.acquiredConnections.clear();
    for (const { reject, timer } of this.waitingQueue) {
      clearTimeout(timer);
      reject(new Error('Pool is closing'));
    }
    this.waitingQueue = [];
  }
}
