import { FastifyPluginAsync } from "fastify";

const getByIdRoute: FastifyPluginAsync = async (fastify, opts) => {
  fastify.get(
    "/:id",
    { preHandler: fastify.authenticate },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const userId = request.user.sub;
      if (!userId) return reply.code(404).send({ error: "Unauthorized" });

      const item = await fastify.prisma.item.findFirst({
        where: { id, userId },
        include: {
          container: {
            select: {
              name: true,
              id: true,
              imageId: true,
            },
          },
        },
      });

      if (!item) {
        return reply.code(404).send({ message: "Item not found." });
      }

      return {
        item: {
          ...item,
          imageUrl: item.imageId
            ? `${process.env.CLOUDINARY_IMAGE_URL}${item.imageId}`
            : null,
          container: {
            ...item.container,
            imageUrl: item.container.imageId
              ? `${process.env.CLOUDINARY_IMAGE_URL}${item.container.imageId}`
              : null,
          },
        },
      };
    }
  );
};

export default getByIdRoute;
