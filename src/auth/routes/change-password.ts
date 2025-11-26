import { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { hashPassword, verifyPassword } from "../utils/password.js";

const schema = z.object({
  newPassword: z
    .string()
    .min(8, { error: "New password must be at least 8 characters" }),
  currentPassword: z
    .string()
    .min(8, { error: "Current password must be at least 8 characters" }),
});

const changePasswordRoute: FastifyPluginAsync = async (fastify, opts) => {
  fastify.post(
    "/change-password",
    {
      preHandler: fastify.authenticate,
    },
    async (request, reply) => {
      const body = request.body as any;
      const parsed = schema.parse(body);

      const userId = request.user.sub;

      const user = await fastify.prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, password: true }, // you can extend this with other safe fields
      });

      if (!user) {
        // Explicit error (global handler will format it)
        throw fastify.httpErrors.unauthorized("User not found.");
      }

      const ok = await verifyPassword(user.password, parsed.currentPassword);

      if (!ok) throw fastify.httpErrors.forbidden("Incorrect password");

      const hashed = await hashPassword(parsed.newPassword);

      await fastify.prisma.user.update({
        where: { id: userId },
        data: { password: hashed },
      });

      return reply.send({
        ok: true,
        message: "Password updated successfully",
      });
    }
  );
};

export default changePasswordRoute;
