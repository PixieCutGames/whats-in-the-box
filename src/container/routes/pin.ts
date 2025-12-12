import { FastifyPluginAsync } from "fastify";

const pinRoute: FastifyPluginAsync = async (fastify) => {
  fastify.post(
    "/:id/pin",
    {
      preHandler: fastify.authenticate,
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const userId = request.user.sub;

      if (!userId) throw fastify.httpErrors.unauthorized("Unauthorized");

      const existing = await fastify.prisma.container.findFirst({
        where: { id, userId },
      });

      if (!existing) {
        throw fastify.httpErrors.notFound("Container not found");
      }

      const container = await fastify.prisma.container.update({
        where: { id },
        data: { pinned: true },
      });

      try {
        await fastify.prisma.activity.create({
          data: {
            userId,
            type: "container_pinned",
            message: `Pinned "${container.name}"`,
            metadata: {
              containerId: container.id,
            },
          },
        });
      } catch (error) {
        console.log('ERROR: COULDN"T SAVE ACTIVITY', error);
      }

      return reply.code(201).send({
        container,
      });
    }
  );
};

export default pinRoute;
