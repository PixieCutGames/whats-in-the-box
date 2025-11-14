import fp from "fastify-plugin";
import { FastifyInstance } from "fastify";
import registerRoute from "../routes/register.js";
import loginRoute from "../routes/login.js";
import meRoute from "../routes/me.js";
import changePasswordRoute from "../routes/change-password.js";
import updateUserRoute from "../routes/update-user.js";
import fastifyJwt from "@fastify/jwt";
import { ZodObject } from "zod";
import resendVerificationRoute from "../routes/resend-verification.js";
import verifyEmailRoute from "../routes/verify-email.js";
import forgotPasswordRoute from "../routes/forgot-password.js";
import resetPasswordRoute from "../routes/reset-password.js";

interface AuthOptions {
  prisma: any; // PrismaClient type in consuming app
  jwtSecret: string;
  userSchema?: ZodObject;
  requireValidation?: boolean;
}

const authPlugin = fp(async (fastify: FastifyInstance, opts: AuthOptions) => {
  if (!opts.prisma) throw new Error("prisma client is required");
  if (!opts.jwtSecret) throw new Error("jwtSecret is required");

  // attach prisma to fastify instance for routes to use: fastify.prisma
  fastify.decorate("prisma", opts.prisma);

  // register jwt plugin
  fastify.register(fastifyJwt, {
    secret: opts.jwtSecret,
  });

  if (opts.userSchema) {
    fastify.decorate("userSchema", opts.userSchema);
  }

  if (opts.requireValidation) {
    fastify.decorate("requireValidation", opts.requireValidation);
  }

  // CORS or other plugin can be enabled by the app

  // register routes
  fastify.register(registerRoute, { prefix: "/auth" });
  fastify.register(loginRoute, { prefix: "/auth" });
  fastify.register(meRoute, { prefix: "/auth" });
  fastify.register(changePasswordRoute, { prefix: "/auth" });
  fastify.register(updateUserRoute, { prefix: "/auth" });
  fastify.register(resendVerificationRoute, { prefix: "/auth" });
  fastify.register(verifyEmailRoute, { prefix: "/auth" });
  fastify.register(forgotPasswordRoute, { prefix: "/auth" });
  fastify.register(resetPasswordRoute, { prefix: "/auth" });
  // TODO: /refresh-token

  // TODO: social media login

  // add decorator to verify and get current user (example)
  fastify.decorate("authenticate", async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.send(err);
    }
  });
});

export default authPlugin;
