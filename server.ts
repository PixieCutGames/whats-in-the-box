import Fastify from "fastify";
import { PrismaClient } from "./src/generated/prisma";
import { withAccelerate } from "@prisma/extension-accelerate";
import dotenv from "dotenv";
import authPlugin from "./src/auth/plugin/auth-plugin";

dotenv.config();

const fastify = Fastify({ logger: true });

const prisma = new PrismaClient().$extends(withAccelerate());

fastify.register(authPlugin as any, {
  prisma,
  jwtSecret: process.env.JWT_SECRET || "dev-secret",
});

// Declare a route

fastify
  .listen({ port: 3002, host: "127.0.0.1" })
  .then(() => console.log("Server listening on http://localhost:3002"))
  .catch((err) => {
    fastify.log.error(err);
    process.exit(1);
  });
