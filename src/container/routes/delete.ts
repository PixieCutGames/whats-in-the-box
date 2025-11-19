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

      if (!userId) return reply.code(404).send({ error: "Unauthorized" });

      try {
        const existing = await fastify.prisma.container.findFirst({
          where: { id, userId },
        });

        if (!existing) {
          return reply.code(404).send({ message: "Container not found." });
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

        // TODO: delete items in the container
        return reply.send({ message: "Container deleted successfully." });
      } catch (error) {
        console.log(error);
        return reply.code(500).send({ error: "Internal server error" });
      }
    }
  );
};

export default deleteRoute;
