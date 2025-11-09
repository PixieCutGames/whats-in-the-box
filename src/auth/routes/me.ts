import { FastifyPluginAsync } from "fastify";

const meRoute: FastifyPluginAsync = async (fastify, opts) => {
  fastify.get(
    "/me",
    { preHandler: fastify.authenticate },
    async (request, reply) => {
      const userId = request.user.sub;
      try {
        const user = await fastify.prisma.user.findUnique({
          where: { id: userId },
          omit: {
            password: true,
          },
        });

        if (!user) {
          return reply.code(404).send({ error: "User not found" });
        }

        return { user };
      } catch (err) {
        console.log(err);
        return reply.code(500).send({ error: "Internal server error" });
      }
    }
  );
};

export default meRoute;
