import { FastifyPluginAsync } from "fastify";

const deleteRoute: FastifyPluginAsync = async (fastify) => {
  fastify.delete(
    "/:id",
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
        return fastify.httpErrors.notFound("Container not found");
      }

      await fastify.prisma.container.delete({
        where: { id },
      });

      try {
        await fastify.prisma.activity.create({
          data: {
            userId,
            type: "container_deleted",
            message: `Deleted "${existing.name}"`,
            metadata: {
              containerId: id,
            },
          },
        });
      } catch (error) {
        console.log('ERROR: COULDN"T SAVE ACTIVITY', error);
      }

      return reply.send({ message: "Container deleted successfully." });
    }
  );
};

export default deleteRoute;
