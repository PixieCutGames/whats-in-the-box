import { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { hashPassword, verifyPassword } from "../utils/password.js";

const schema = z.object({
  newPassword: z.string().min(8),
  currentPassword: z.string().min(8),
});

const changePasswordRoute: FastifyPluginAsync = async (fastify, opts) => {
  fastify.post(
    "/change-password",
    {
      preHandler: fastify.authenticate,
      schema: {
        body: {
          type: "object",
        },
      },
    },
    async (request, reply) => {
      const body = request.body as any;
      const parsed = schema.parse(body);

      const userId = request.user.sub;
      try {
        const user = await fastify.prisma.user.findUnique({
          where: { id: userId },
          select: { id: true, password: true }, // you can extend this with other safe fields
        });

        if (!user) {
          return reply.code(404).send({ error: "User not found" });
        }

        const ok = await verifyPassword(user.password, parsed.currentPassword);
        if (!ok)
          return reply.status(401).send({ message: "Invalid credentials" });

        const hashed = await hashPassword(parsed.newPassword);

        await fastify.prisma.user.update({
          where: { id: userId },
          data: { password: hashed },
        });

        return reply.send({
          ok: true,
          message: "Password updated successfully",
        });
      } catch (err) {
        console.log(err);
        return reply.code(500).send({ error: "Internal server error" });
      }
    }
  );
};

export default changePasswordRoute;
