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
    authenticate: (req: any, reply: any) => Promise<void>;
  }
}

declare module "@fastify/jwt" {
  interface FastifyJWT {
    payload: { sub: string; email?: string } | string | object | Buffer; // token payload
    user: { sub: string; email: string }; // after verify
  }
}
