import { FastifyPluginAsync } from "fastify";

const getActivitiesRoute: FastifyPluginAsync = async (fastify, opts) => {
  fastify.get(
    "/activities",
    { preHandler: fastify.authenticate },
    async (request, reply) => {
      const userId = request.user.sub;
      if (!userId) return reply.code(404).send({ error: "Unauthorized" });

      const logs = await fastify.prisma.activity.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 10, // or any limit
      });

      return {
        logs,
      };
    }
  );
};

export default getActivitiesRoute;
