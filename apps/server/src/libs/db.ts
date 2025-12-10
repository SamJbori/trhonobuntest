import type { MongoClientOptions } from "mongodb";
import { MongoClient, ObjectId } from "mongodb";

import { env } from "./env";

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}
if (!env.MONGODB_URI) {
  throw new Error("Please add your MONGODB_URI to .env");
} else {
  console.log("I am All OK DB");
}

const uri = env.MONGODB_URI;
const options: MongoClientOptions = {};

let mongoClient: MongoClient;
let clientPromise: Promise<MongoClient>;

if (env.NODE_ENV === "development") {
  // Reuse existing connection if present
  if (!global._mongoClientPromise) {
    mongoClient = new MongoClient(uri, options);
    global._mongoClientPromise = mongoClient.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // No caching in production
  mongoClient = new MongoClient(uri, options);
  clientPromise = mongoClient.connect();
}

export const dbClient = await clientPromise; // ⬅️ Await the shared client
