import { MongoClient } from "mongodb"
import dotenv from "dotenv";
dotenv.config();

const { MONGO_PASSWORD, MONGO_USER, MONGO_CLUSTER, DB_NAME, MONGO_CLUSTER_LOW} = process.env;

class MongoConnection {
    #client
    #db

    constructor(connectionStr, dbName) {
        this.#client = new MongoClient(connectionStr);
        this.#db = this.#client.db(dbName);
    }

    getCollection(collectionName) {
        return this.#db.collection(collectionName);
    }

    async close() {
        await this.#client.close();
    }
}
const dbName = DB_NAME;

const connectionStr = `mongodb+srv://${MONGO_USER}:${MONGO_PASSWORD}@${MONGO_CLUSTER_LOW}.fpckx.mongodb.net/test?retryWrites=true&w=majority&appName=${MONGO_CLUSTER}`;
const mongoConnection = new MongoConnection(connectionStr, dbName);
export default mongoConnection;