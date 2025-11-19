import { FastifyPluginAsync } from "fastify";

const getStatsRoute: FastifyPluginAsync = async (fastify, opts) => {
  fastify.get(
    "/stats",
    { preHandler: fastify.authenticate },
    async (request, reply) => {
      const userId = request.user.sub;
      if (!userId) return reply.code(404).send({ error: "Unauthorized" });

      const containers = await fastify.prisma.container.count();
      const items = await fastify.prisma.item.count();

      const lastUpdatedContainer = await fastify.prisma.container.findFirst({
        orderBy: {
          updatedAt: "desc",
        },
      });

      const lastUpdatedItem = await fastify.prisma.item.findFirst({
        orderBy: {
          updatedAt: "desc",
        },
      });

      return {
        containers,
        items,
        lastUpdatedContainer,
        lastUpdatedItem,
      };
    }
  );
};

export default getStatsRoute;
