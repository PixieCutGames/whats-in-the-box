import Fastify from "fastify";
import { PrismaClient } from "./src/generated/prisma/index.js";
import { withAccelerate } from "@prisma/extension-accelerate";
import dotenv from "dotenv";
import { z } from "zod";
import authPlugin from "./src/auth/plugin/auth-plugin.js";
import cors from "@fastify/cors";

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

const allowedOrigins = [process.env.FRONTEND_URL, process.env.PRODUCTION_URL];

await fastify.register(cors, {
  origin: (origin, cb) => {
    // Allow no-origin requests (like Postman or server-to-server)
    if (!origin) return cb(null, true);

    if (allowedOrigins.includes(origin)) {
      cb(null, true);
    } else {
      cb(new Error("Not allowed by CORS"), false);
    }
  },
  credentials: true, // true if you use cookies
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
});

fastify.get("/", async (request, reply) => {
  return { hello: "world" };
});

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
