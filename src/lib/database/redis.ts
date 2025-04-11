import { createClient } from 'redis';
import { Repository, Schema, type SchemaDefinition } from 'redis-om';

export const redis = await createClient({ password: import.meta.env.VITE_REDIS_PW }).connect();

type SchemaTypeMapping = {
  'string': string;
  'number': number;
  'boolean': boolean;
  'string[]': string[];
  'number[]': number[];
  'boolean[]': boolean[];
  'text': string;
  'date': Date;
};

type SchemaFieldDefinition = {
  type: keyof SchemaTypeMapping;
  [key: string]: unknown;
};

type CustomSchemaDefinition = Record<string, SchemaFieldDefinition>;

/**
 * @description used Partial to make whole field optional. If you want to make fields non-optional, then just remove Partial
 */
type InferSchemaType<T extends CustomSchemaDefinition> = Partial<{
  [K in keyof T]: SchemaTypeMapping[T[K]['type']];
}>;

// [CHECK] tested repository.save and it worked, but others are not
// [TODO] force Id
export const redisModelFactory = {
  /**
   * Creates a Redis repository and schema for the given key & schema definition.
   * @param name name of the Redis key
   * @param schemaDef object defining the schema. Use 'as const' for the 'type' property values
   * @example redisModelFactory.create('someKey', { someKeyField1: { type: 'string' as const } });
   * @returns object containing a typed `Repository` and `Schema` with auto-completion support.
   */
  create: <T extends CustomSchemaDefinition>(name: string, schemaDef: T): { schema: Schema<InferSchemaType<T>>, repository: Repository<InferSchemaType<T>> } => {
    const schema = new Schema<InferSchemaType<T>>(name, schemaDef as SchemaDefinition<InferSchemaType<T>>, {
      dataStructure: 'HASH',
    });
    return {
      schema,
      repository: new Repository<InferSchemaType<T>>(schema, redis)
    };
  },
};

export const { repository: roomCacheRepository, schema: roomCacheSchema } = redisModelFactory.create('room', {
  name: { type: 'string' as const },
  gameId: { type: 'string' as const },
  turn: { type: 'number' as const },
  lastMove: { type: 'string' as const },
  started: { type: 'boolean' as const },
  p0_id: { type: 'string' as const },
  p0_username: { type: 'string' as const },
  p0_ready: { type: 'boolean' as const },
  p0_exhausted: { type: 'boolean' as const },
  p1_id: { type: 'string' as const },
  p1_username: { type: 'string' as const },
  p1_ready: { type: 'boolean' as const },
  p1_exhausted: { type: 'boolean' as const },
  p2_id: { type: 'string' as const },
  p2_username: { type: 'string' as const },
  p2_ready: { type: 'boolean' as const },
  p2_exhausted: { type: 'boolean' as const },
  p3_id: { type: 'string' as const },
  p3_username: { type: 'string' as const },
  p3_ready: { type: 'boolean' as const },
  p3_exhausted: { type: 'boolean' as const },
});

export const { repository: gameEndSequenceRepository, schema: gameEndSequenceSchema } = redisModelFactory.create('game_end_sequence', {
  finalBoardState: { type: 'string' as const },
  initiatedBy: { type: 'number' as const },
  endDate: { type: 'date' as const },
  finalScore: { type: 'number' as const },
  confirmationStatus: { type: 'number[]' as const },
});
