import { MongoClient } from "mongodb";

const { VITE_MONGO_ID, VITE_MONGO_PW, VITE_MONGO_HOST } = import.meta.env;
const url = `mongodb://${VITE_MONGO_ID}:${VITE_MONGO_PW}@${VITE_MONGO_HOST}:27017/`;

const client = new MongoClient(url);
await client.connect();

export default client.db('blokus');
