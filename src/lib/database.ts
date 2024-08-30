import { MongoClient } from "mongodb";

const { VITE_MONGO_ID, VITE_MONGO_PW, VITE_MONGO_HOST, VITE_MONGO_PORT } = import.meta.env;
const url = `mongodb://${VITE_MONGO_ID}:${VITE_MONGO_PW}@${VITE_MONGO_HOST}:${VITE_MONGO_PORT}/`;

const client = new MongoClient(url, {
    connectTimeoutMS: 2000,
});

export default client.db('blokus');
