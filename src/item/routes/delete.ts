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

      const existing = await fastify.prisma.item.findFirst({
        where: { id, userId },
      });

      if (!existing) {
        throw fastify.httpErrors.notFound("Item not found.");
      }

      await fastify.prisma.item.delete({
        where: { id },
      });

      try {
        await fastify.prisma.activity.create({
          data: {
            userId,
            type: "item_deleted",
            message: `Deleted "${existing.name}"`,
            metadata: {
              itemId: id,
            },
          },
        });
      } catch (error) {
        console.log('ERROR: COULDN"T SAVE ACTIVITY', error);
      }

      return reply.send({ message: "Item deleted successfully." });
    }
  );
};

export default deleteRoute;
