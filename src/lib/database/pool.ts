import { createClient } from "redis";

type RedisClient = ReturnType<typeof createClient>

type RedisConfig = Parameters<typeof createClient>

interface RedisConnectionPoolConfig {
  redisConfig: RedisConfig;
  poolSize?: number;
  connectionTimeout?: number;
  maxRetries?: number;
  retryInterval?: number;
}

export class RedisConnectionPool {
  constructor(config: RedisConnectionPoolConfig) {
    this.config = config.redisConfig;
    this.pool = [];
    this.size = config.poolSize || 10;
    this.acquiredConnections = new Set();
    this.connectionTimeout = config.connectionTimeout || 5000;
    this.maxRetries = config.maxRetries || 3;
    this.retryInterval = config.retryInterval || 1000;
  }

  private config: RedisConfig;

  private pool: RedisClient[];

  private size: number;

  private acquiredConnections: Set<RedisClient>;

  private connectionTimeout: number;

  private maxRetries: number;

  private retryInterval: number;

  async initialize() {
    for (let i = 0; i < this.size; i++) {
      const client = await this.createClient();
      this.pool.push(client);
    }
  }

  async createClient() {
    const client = createClient(this.config);

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
    return Promise.race([
      client.connect(),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Connection timeout')), this.connectionTimeout)
      )
    ]);
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

  async acquire() {
    if (this.pool.length > 0) {
      const connection = this.pool.pop() as RedisClient;
      this.acquiredConnections.add(connection);
      return connection;
    }

    if (this.acquiredConnections.size < this.size) {
      const client = await this.createClient();
      this.acquiredConnections.add(client);
      return client;
    }

    throw new Error('Connection pool exhausted');
  }

  release(connection: RedisClient) {
    if (this.acquiredConnections.has(connection)) {
      this.acquiredConnections.delete(connection);
      this.pool.push(connection);
    }
  }

  async close() {
    const allConnections = [...this.pool, ...this.acquiredConnections];
    for (const connection of allConnections) {
      try {
        await connection.quit();
      } catch (error) {
        console.error('Error while closing connection:', error);
      }
    }
    this.pool = [];
    this.acquiredConnections.clear();
  }
}
