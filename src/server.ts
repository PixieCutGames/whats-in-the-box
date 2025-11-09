import Fastify from "fastify";
import { PrismaClient } from "./generated/prisma/index.js";
import { withAccelerate } from "@prisma/extension-accelerate";
import dotenv from "dotenv";
import { z } from "zod";
import authPlugin from "./auth/plugin/auth-plugin.js";

dotenv.config();

const fastify = Fastify({ logger: true });

const prisma = new PrismaClient().$extends(withAccelerate());

fastify.register(authPlugin as any, {
  prisma,
  jwtSecret: process.env.JWT_SECRET || "dev-secret",
  userSchema: z.object({
    email: z.email(),
    password: z.string().min(8),
    name: z.string().optional(),
  }),
});
//TODO: handle cors

export default async function handler(req: any, res: any) {
  await fastify.ready();
  fastify.server.emit("request", req, res);
}

if (process.env.NODE_ENV === "local") {
  const port = Number(process.env.PORT ?? 3002);

  fastify
    .listen({ port })
    .then(() =>
      console.log(`Server listening on ${port} & ${process.env.NODE_ENV}`)
    )
    .catch((err) => {
      fastify.log.error(err);
      process.exit(1);
    });
}
