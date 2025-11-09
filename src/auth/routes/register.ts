import { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { hashPassword } from "../utils/password.js";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().optional(),
});

const registerRoute: FastifyPluginAsync = async (fastify, opts) => {
  fastify.post(
    "/register",
    {
      schema: {
        body: {
          type: "object",
        },
      },
    },
    async (request, reply) => {
      const body = request.body as any;
      const parsed = schema.parse(body);

      const existing = await fastify.prisma.user.findUnique({
        where: { email: parsed.email },
      });
      if (existing) {
        return reply.status(409).send({ message: "Email already in use" });
      }

      const hashed = await hashPassword(parsed.password);

      const user = await fastify.prisma.user.create({
        data: {
          email: parsed.email,
          password: hashed,
          name: parsed.name,
        },
      });

      // sign tokens (short example)
      const accessToken = fastify.jwt.sign(
        { sub: user.id },
        { expiresIn: "15m" }
      );
      const refreshToken = fastify.jwt.sign(
        { sub: user.id },
        { expiresIn: "30d" }
      );

      reply.send({
        accessToken,
        refreshToken,
        user: { id: user.id, email: user.email, name: user.name },
      });
    }
  );
};

export default registerRoute;
