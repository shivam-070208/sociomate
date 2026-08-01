import { PrismaClient } from "./generated/prisma/client.ts";
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

export const prisma = mainClient.$extends(
  readReplicas({ replicas: [readReplicaClient] }),
);
