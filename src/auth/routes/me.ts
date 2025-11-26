import { FastifyPluginAsync } from "fastify";

const meRoute: FastifyPluginAsync = async (fastify, opts) => {
  fastify.get(
    "/me",
    { preHandler: fastify.authenticate },
    async (request, reply) => {
      const userId = request.user.sub;
      const user = await fastify.prisma.user.findUnique({
        where: { id: userId },
        omit: {
          password: true,
          verificationToken: true,
          verificationExpiresAt: true,
        },
      });

      if (!user) {
        throw fastify.httpErrors.notFound("User not found");
      }

      return reply.send({ user });
    }
  );
};

export default meRoute;
