import { FastifyPluginAsync } from "fastify";

const getActivitiesRoute: FastifyPluginAsync = async (fastify, opts) => {
  fastify.get(
    "/activities",
    { preHandler: fastify.authenticate },
    async (request, reply) => {
      const userId = request.user.sub;
      if (!userId) throw fastify.httpErrors.unauthorized("Unauthorized");

      const logs = await fastify.prisma.activity.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 6, // or any limit
      });

      return reply.send({
        logs,
      });
    }
  );
};

export default getActivitiesRoute;
