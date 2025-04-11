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
   * @param name name of redis key
   * @param schemaDef object of type SchemaDefinition. add 'as const' to value of key 'type'
   * @example repositoryFactory.create('someKey', { someKeyField1: { type: 'string' as const }, });
   * @returns typed `Repository` and `Schema` - can use auto complete on its methods
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
