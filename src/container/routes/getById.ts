import { FastifyPluginAsync } from "fastify";

const getByIdRoute: FastifyPluginAsync = async (fastify, opts) => {
  fastify.get(
    "/:id",
    { preHandler: fastify.authenticate },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const userId = request.user.sub;
      if (!userId) return reply.code(404).send({ error: "Unauthorized" });

      const container = await fastify.prisma.container.findFirst({
        where: { id, userId },
        include: {
          items: true,
        },
      });

      if (!container) {
        return reply.code(404).send({ message: "Container not found." });
      }

      return {
        container: {
          ...container,
          imageUrl: container.imageId
            ? `https://res.cloudinary.com/dtbuugq1u/image/upload/v1763329365/${container.imageId}`
            : null,
        },
      };
    }
  );
};

export default getByIdRoute;
