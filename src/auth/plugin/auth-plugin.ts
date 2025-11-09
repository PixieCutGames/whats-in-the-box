import fp from "fastify-plugin";
import { FastifyInstance } from "fastify";
import registerRoute from "../routes/register";
import loginRoute from "../routes/login";

interface AuthOptions {
  prisma: any; // PrismaClient type in consuming app
  jwtSecret: string;
}

const authPlugin = fp(async (fastify: FastifyInstance, opts: AuthOptions) => {
  if (!opts.prisma) throw new Error("prisma client is required");
  if (!opts.jwtSecret) throw new Error("jwtSecret is required");

  // attach prisma to fastify instance for routes to use: fastify.prisma
  fastify.decorate("prisma", opts.prisma);

  // register jwt plugin
  fastify.register(require("@fastify/jwt"), {
    secret: opts.jwtSecret,
  });

  // CORS or other plugin can be enabled by the app

  // register routes
  fastify.register(registerRoute, { prefix: "/auth" });
  fastify.register(loginRoute, { prefix: "/auth" });

  // add decorator to verify and get current user (example)
  fastify.decorate("authenticate", async (request: any, reply: any) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.send(err);
    }
  });
});

export default authPlugin;
