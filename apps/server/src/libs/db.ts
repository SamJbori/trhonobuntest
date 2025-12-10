import type { DBCollections, DBCollectionsTypes } from "@repo/validators/db";
import type { MongoClientOptions } from "mongodb";
import { MongoClient, ObjectId } from "mongodb";

import { DBCollectionStore } from "@repo/validators/db";

import { env } from "./env.js";

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

export const collection = <T extends DBCollections>(collection: T) => {
  /**
   * Based on the collection, direct the collection to use the correct db
   */
  const db = dbClient.db(DBCollectionStore[collection]);

  return db.collection<Omit<DBCollectionsTypes[T], "id">>(collection);
};

export const fromDBToRecord = <T extends { _id: ObjectId }>(
  doc: T,
): Omit<T, "_id"> & { id: string } => {
  const { _id, ...rest } = doc;
  return {
    ...rest,
    id: _id.toString(),
  };
};

export const fromDBToRecords = <T extends { _id: ObjectId }>(
  docs: T[],
): (Omit<T, "_id"> & { id: string })[] => {
  return docs.map(fromDBToRecord);
};
