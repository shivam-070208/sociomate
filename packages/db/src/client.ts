import { PrismaClient } from "./generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { readReplicas } from "@prisma/extension-read-replicas";

const mainAdapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});
const mainClient = new PrismaClient({ adapter: mainAdapter });

const readReplicaAdapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL_READ_REPLICA,
});

const readReplicaClient = new PrismaClient({ adapter: readReplicaAdapter });

const db = mainClient.$extends(readReplicas({ replicas: [readReplicaClient] }));

db.$connect()
  .then(() => {
    console.log("Connected to the database successfully.");
  })
  .catch((error) => {
    console.error("Error connecting to the database:", error);
  });

export default db;
