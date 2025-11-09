import Fastify from "fastify";
import { PrismaClient } from "./src/generated/prisma";
import { withAccelerate } from "@prisma/extension-accelerate";
import dotenv from "dotenv";
import { z } from "zod";
import authPlugin from "./src/auth/plugin/auth-plugin";

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

// Declare a route

const port = Number(process.env.PORT ?? 3002);

fastify
  .listen({ port })
  .then(() => console.log(`Server listening on ${port}`))
  .catch((err) => {
    fastify.log.error(err);
    process.exit(1);
  });
