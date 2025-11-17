import { FastifyPluginAsync } from "fastify";

const getAllRoute: FastifyPluginAsync = async (fastify, opts) => {
  fastify.get(
    "/",
    { preHandler: fastify.authenticate },
    async (request, reply) => {
      const userId = request.user.sub;
      if (!userId) return reply.code(404).send({ error: "Unauthorized" });

      const items = await fastify.prisma.item.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
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

      return {
        items: items.map((c: any) => ({
          ...c,
          imageUrl: c.imageId
            ? `${process.env.CLOUDINARY_IMAGE_URL}${c.imageId}`
            : null,
          container: {
            ...c.container,
            imageUrl: c.container.imageId
              ? `${process.env.CLOUDINARY_IMAGE_URL}${c.container.imageId}`
              : null,
          },
        })),
      };
    }
  );
};

export default getAllRoute;
