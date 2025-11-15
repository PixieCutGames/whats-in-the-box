import { FastifyPluginAsync } from "fastify";

const getAllRoute: FastifyPluginAsync = async (fastify, opts) => {
  fastify.get(
    "/",
    { preHandler: fastify.authenticate },
    async (request, reply) => {
      const userId = request.user.sub;
      if (!userId) return reply.code(404).send({ error: "Unauthorized" });

      const containers = await fastify.prisma.container.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
      });

      return { containers };
    }
  );
};

export default getAllRoute;
