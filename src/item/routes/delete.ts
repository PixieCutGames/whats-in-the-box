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
        const existing = await fastify.prisma.item.findFirst({
          where: { id, userId },
        });

        if (!existing) {
          return reply.code(404).send({ message: "Item not found." });
        }

        await fastify.prisma.item.delete({
          where: { id },
        });

        return reply.send({ message: "Item deleted successfully." });
      } catch (error) {
        console.log(error);
        return reply.code(500).send({ error: "Internal server error" });
      }
    }
  );
};

export default deleteRoute;
