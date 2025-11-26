import { FastifyPluginAsync } from "fastify";

const getByIdRoute: FastifyPluginAsync = async (fastify, opts) => {
  fastify.get(
    "/:id",
    { preHandler: fastify.authenticate },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const userId = request.user.sub;
      if (!userId) throw fastify.httpErrors.unauthorized("Unauthorized");

      const container = await fastify.prisma.container.findFirst({
        where: { id, userId },
        include: {
          items: {
            select: {
              id: true,
              name: true,
              quantity: true,
              updatedAt: true,
              imageId: true,
            },
          },
        },
      });

      if (!container) {
        throw fastify.httpErrors.notFound("Container not found");
      }

      return {
        container: {
          ...container,
          imageUrl: container.imageId
            ? `${process.env.CLOUDINARY_IMAGE_URL}${container.imageId}`
            : null,
          items: container.items.map((i: any) => {
            return {
              ...i,
              imageUrl: i.imageId
                ? `${process.env.CLOUDINARY_IMAGE_URL}${i.imageId}`
                : null,
            };
          }),
        },
      };
    }
  );
};

export default getByIdRoute;
