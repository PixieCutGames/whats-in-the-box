import { FastifyJwtNamespace } from "@fastify/jwt";
import { PrismaClient } from "@prisma/client";
import "fastify";

declare module "fastify" {
  interface FastifyInstance
    extends FastifyJwtNamespace<{ namespace: "security" }> {}
}

declare module "fastify" {
  interface FastifyInstance {
    prisma: PrismaClient;
  }
}
